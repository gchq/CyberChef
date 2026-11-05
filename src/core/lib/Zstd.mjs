/**
 * Zstd shared initialisation and stream handling.
 *
 * Both ZstdCompress and ZstdDecompress import from here so that
 * WebAssembly.instantiate is called exactly once, regardless of how many
 * operations use it or in what order they run.
 *
 * The frame walking below exists because @bokuweb/zstd-wasm only exposes the
 * one-shot ZSTD_decompress API: it sizes its output buffer from
 * ZSTD_getFrameContentSize, which describes the first frame only and reports
 * nothing at all for frames written by a streaming compressor. Walking the
 * framing ourselves gives us both the frame boundaries and an output size
 * bound, so streamed and concatenated input decompress like any other.
 *
 * @author Leon Zandman [leon@wirwar.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import { init, compress, decompress } from "@bokuweb/zstd-wasm";
import OperationError from "../errors/OperationError.mjs";

const ZSTD_MAGIC = 0xfd2fb528;
const SKIPPABLE_MAGIC = 0x184d2a50;
const SKIPPABLE_MAGIC_MASK = 0xfffffff0;

// Largest amount of data a single block can regenerate (RFC 8878, section 3.1.1.2).
const BLOCK_SIZE_MAX = 128 * 1024;

// Sizes of the optional Dictionary_ID and Frame_Content_Size header fields,
// indexed by their flag value in the Frame_Header_Descriptor.
const DICTIONARY_ID_SIZES = [0, 1, 2, 4];
const CONTENT_SIZE_SIZES = [0, 2, 4, 8];

// Ceiling on how much data we are prepared to regenerate, so that malformed or
// hostile input cannot exhaust memory.
const MAX_OUTPUT_SIZE = 512 * 1024 * 1024;

// A frame's bound is only an upper limit, and a stream flushed after every
// record can sit far below it, so large bounds are approached by growing an
// output buffer from this size rather than allocating the bound outright.
const INITIAL_HEAP_SIZE = 16 * 1024 * 1024;

let initPromise = null;

/**
 * Returns a promise that resolves once the Zstd WASM module is ready.
 * Safe to call multiple times — the module is only instantiated once.
 *
 * @returns {Promise<void>}
 */
export function zstdInit() {
    if (!initPromise) {
        // ChefWorker runs as an inlined blob worker, where a relative asset URL
        // cannot be resolved against `self.location`, so the wasm is fetched from
        // the copy webpack places in assets/ instead. See webpack.config.js.
        const wasmUrl = typeof self !== "undefined" && self.docURL ?
            `${self.docURL}/assets/zstd.wasm` :
            undefined;
        // A rejected promise is not kept, so that one failed load of the wasm
        // does not leave the worker unable to run either operation again.
        initPromise = init(wasmUrl).catch(err => {
            initPromise = null;
            throw err;
        });
    }
    return initPromise;
}

/**
 * Walks a single frame starting at `pos`, returning where it ends and an upper
 * bound on how much data it regenerates.
 *
 * @param {Uint8Array} data
 * @param {DataView} view
 * @param {number} pos - Offset of the frame's magic number.
 * @returns {{end: number, contentSize: ?number, maxOutputSize: number}} `contentSize`
 *      is null when the header does not declare one.
 */
function parseFrame(data, view, pos) {
    let p = pos + 4;
    if (p >= data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame header.");

    // Frame_Header_Descriptor (RFC 8878, section 3.1.1.1.1).
    const descriptor = data[p++];
    const contentSizeFlag = descriptor >>> 6;
    const singleSegment = (descriptor >>> 5) & 1;
    const hasChecksum = (descriptor >>> 2) & 1;
    const dictionaryIdSize = DICTIONARY_ID_SIZES[descriptor & 3];
    const contentSizeSize = contentSizeFlag === 0 ?
        (singleSegment ? 1 : 0) :
        CONTENT_SIZE_SIZES[contentSizeFlag];

    // Window_Descriptor, absent when the whole frame is one segment.
    let windowSize = 0;
    if (!singleSegment) {
        if (p >= data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame header.");
        const windowDescriptor = data[p++];
        const windowBase = 2 ** (10 + (windowDescriptor >>> 3));
        windowSize = windowBase + (windowBase / 8) * (windowDescriptor & 7);
    }

    // A Dictionary_ID means the frame cannot be decompressed on its own.
    if (dictionaryIdSize > 0) {
        if (p + dictionaryIdSize > data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame header.");
        let dictionaryId = 0;
        for (let i = 0; i < dictionaryIdSize; i++) dictionaryId |= data[p + i] << (i * 8);
        if (dictionaryId !== 0) throw new OperationError("Failed to decompress: the input was compressed with a dictionary, which is not supported.");
        p += dictionaryIdSize;
    }
    if (p + contentSizeSize > data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame header.");

    // Frame_Content_Size, if the compressor knew it up front. A two byte field
    // has 256 subtracted from it on write, so it is added back here.
    let contentSize = null;
    switch (contentSizeSize) {
        case 1:
            contentSize = data[p];
            break;
        case 2:
            contentSize = view.getUint16(p, true) + 256;
            break;
        case 4:
            contentSize = view.getUint32(p, true);
            break;
        case 8:
            contentSize = view.getUint32(p, true) + view.getUint32(p + 4, true) * 2 ** 32;
            break;
    }
    p += contentSizeSize;
    if (singleSegment) windowSize = contentSize;

    // Data_Blocks. Their headers give us the frame's length, and for frames
    // with no declared content size, a bound on what they can regenerate.
    const blockSizeMax = Math.min(BLOCK_SIZE_MAX, windowSize);
    let maxOutputSize = 0;
    for (;;) {
        if (p + 3 > data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame.");
        const header = data[p] | (data[p + 1] << 8) | (data[p + 2] << 16);
        p += 3;
        const lastBlock = header & 1;
        const blockType = (header >>> 1) & 3;
        const blockSize = header >>> 3;

        switch (blockType) {
            case 0: // Raw: stored verbatim.
                p += blockSize;
                maxOutputSize += blockSize;
                break;
            case 1: // RLE: a single byte repeated blockSize times.
                p += 1;
                maxOutputSize += blockSize;
                break;
            case 2: // Compressed: regenerates at most one block's worth.
                p += blockSize;
                maxOutputSize += blockSizeMax;
                break;
            default:
                throw new OperationError("Failed to decompress: the input is not valid Zstandard data.");
        }

        if (p > data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame.");
        if (lastBlock) break;
    }

    if (hasChecksum) {
        p += 4;
        if (p > data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame.");
    }

    return {
        end: p,
        contentSize: contentSize,
        maxOutputSize: contentSize === null ? maxOutputSize : contentSize
    };
}

/**
 * Locates every frame in a Zstandard stream. Skippable frames are stepped over
 * rather than returned, since they regenerate nothing.
 *
 * @param {Uint8Array} data
 * @returns {Object[]} One entry per frame: `{start, end, contentSize, maxOutputSize}`.
 */
function parseFrames(data) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const frames = [];
    let pos = 0;

    while (pos < data.length) {
        if (pos + 4 > data.length) throw new OperationError("Failed to decompress: the input is not valid Zstandard data.");
        const magic = view.getUint32(pos, true);

        if (((magic & SKIPPABLE_MAGIC_MASK) >>> 0) === SKIPPABLE_MAGIC) {
            if (pos + 8 > data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame.");
            const end = pos + 8 + view.getUint32(pos + 4, true);
            if (end > data.length) throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame.");
            pos = end;
            continue;
        }

        if (magic !== ZSTD_MAGIC) throw new OperationError("Failed to decompress: the input is not valid Zstandard data.");

        const frame = parseFrame(data, view, pos);
        frames.push({
            start: pos,
            end: frame.end,
            contentSize: frame.contentSize,
            maxOutputSize: frame.maxOutputSize
        });
        pos = frame.end;
    }

    return frames;
}

/**
 * Decompresses a Zstandard stream, however many frames it holds and whether or
 * not those frames declare their decompressed size.
 *
 * @param {Uint8Array} data
 * @returns {ArrayBuffer}
 */
export function decompressStream(data) {
    const frames = parseFrames(data);
    const outputs = [];
    let totalSize = 0;

    for (const frame of frames) {
        const remaining = MAX_OUTPUT_SIZE - totalSize;
        if (frame.contentSize !== null && frame.contentSize > remaining)
            throw new OperationError("Failed to decompress: the input decompresses to more than 512MiB.");

        // The library sizes its own buffer from the frame header when the header
        // declares a size, and falls back to defaultHeapSize when it does not, so
        // it is the frames written by a streaming compressor that need a size
        // working out here.
        const limit = Math.max(Math.min(frame.maxOutputSize, remaining), 1);
        let heapSize = frame.contentSize === null ? Math.min(limit, INITIAL_HEAP_SIZE) : limit;
        let output = null;

        for (;;) {
            try {
                output = decompress(data.subarray(frame.start, frame.end), { defaultHeapSize: heapSize });
                break;
            } catch (err) {
                if (heapSize < limit) {
                    heapSize = Math.min(heapSize * 8, limit);
                } else if (frame.maxOutputSize > remaining) {
                    throw new OperationError("Failed to decompress: the input decompresses to more than 512MiB.");
                } else {
                    // The frame cannot regenerate more than its own framing allows,
                    // so a frame that still does not fit is not intact.
                    throw new OperationError("Failed to decompress: the input is not valid Zstandard data.");
                }
            }
        }

        outputs.push(output);
        totalSize += output.length;
    }

    if (outputs.length === 1)
        return outputs[0].buffer.slice(outputs[0].byteOffset, outputs[0].byteOffset + outputs[0].byteLength);

    const result = new Uint8Array(totalSize);
    let offset = 0;
    for (const output of outputs) {
        result.set(output, offset);
        offset += output.length;
    }
    return result.buffer;
}

export { compress };
