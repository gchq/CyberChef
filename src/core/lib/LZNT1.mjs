/**
 *
 * LZNT1 compression and decompression.
 *
 * @author 0xThiebaut [thiebaut.dev]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 *
 * https://github.com/Velocidex/go-ntfs/blob/master/parser%2Flznt1.go
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

const COMPRESSED_MASK = 1 << 15,
    SIGNATURE_MASK = 3 << 12,
    BLOCK_SIZE = 4096,
    SIZE_MASK = (1 << 12) - 1;

/**
 * @param {number} offset
 * @returns {number}
 */
function getDisplacement(offset) {
    let result = 0;
    while (offset >= 0x10) {
        offset >>= 1;
        result += 1;
    }
    return result;
}

/**
 * @param {byteArray} output
 * @param {number} header
 */
function appendBlockHeader(output, header) {
    output.push(...Utils.intToByteArray(header, 2, "little"));
}

/**
 * @param {byteArray} block
 * @param {number} pos
 * @returns {{offset: number, length: number, lengthBits: number}|null}
 */
function findBestMatch(block, pos) {
    const displacement = getDisplacement(pos - 1),
        lengthBits = 12 - displacement,
        maxOffset = Math.min(pos, 1 << (4 + displacement)),
        maxLength = Math.min(block.length - pos, (0xFFF >> displacement) + 3);

    let bestOffset = 0,
        bestLength = 0;

    for (let offset = 1; offset <= maxOffset; offset++) {
        let length = 0;
        while (
            length < maxLength &&
            block[pos + length] === block[pos - offset + length]
        ) {
            length++;
        }

        if (length > bestLength) {
            bestOffset = offset;
            bestLength = length;
            if (bestLength === maxLength) break;
        }
    }

    if (bestLength < 3) return null;
    return {
        offset: bestOffset,
        length: bestLength,
        lengthBits,
    };
}

/**
 * @param {byteArray} block
 * @returns {byteArray}
 */
function compressBlock(block) {
    const compressed = [];
    let pos = 0;

    while (pos < block.length) {
        const headerIndex = compressed.length;
        let header = 0,
            bit = 1,
            tokens = 0;

        compressed.push(0);

        while (tokens < 8 && pos < block.length) {
            const match = findBestMatch(block, pos);

            if (match) {
                const pointer = ((match.offset - 1) << match.lengthBits) | (match.length - 3);
                compressed.push(...Utils.intToByteArray(pointer, 2, "little"));
                header |= bit;
                pos += match.length;
            } else {
                compressed.push(block[pos++]);
            }

            bit <<= 1;
            tokens++;
        }

        compressed[headerIndex] = header;
    }

    return compressed;
}

/**
 * @param {byteArray} uncompressed
 * @returns {byteArray}
 */
export function compress(uncompressed) {
    const compressed = [];

    for (let offset = 0; offset < uncompressed.length; offset += BLOCK_SIZE) {
        const block = uncompressed.slice(offset, offset + BLOCK_SIZE),
            compressedBlock = compressBlock(block);

        if (block.length === 1 || compressedBlock.length < block.length) {
            appendBlockHeader(
                compressed,
                SIGNATURE_MASK | COMPRESSED_MASK | (compressedBlock.length - 1)
            );
            compressed.push(...compressedBlock);
        } else {
            appendBlockHeader(compressed, SIGNATURE_MASK | (block.length - 1));
            compressed.push(...block);
        }
    }

    return compressed;
}

/**
 * @param {byteArray} compressed
 * @returns {byteArray}
 */
export function decompress(compressed) {
    const decompressed = Array();
    let coffset = 0;

    while (coffset + 2 <= compressed.length) {
        const doffset = decompressed.length;

        const blockHeader = Utils.byteArrayToInt(compressed.slice(coffset, coffset + 2), "little");
        coffset += 2;

        const size = blockHeader & SIZE_MASK;
        const blockEnd = coffset + size + 1;

        if (size === 0) {
            break;
        } else if (compressed.length < coffset + size) {
            throw new OperationError("Malformed LZNT1 stream: Block too small! Has the stream been truncated?");
        }

        if ((blockHeader & COMPRESSED_MASK) !== 0) {
            while (coffset < blockEnd) {
                let header = compressed[coffset++];

                for (let i = 0; i < 8 && coffset < blockEnd; i++) {
                    if ((header & 1) === 0) {
                        decompressed.push(compressed[coffset++]);
                    } else {
                        const pointer = Utils.byteArrayToInt(compressed.slice(coffset, coffset + 2), "little");
                        coffset += 2;

                        const displacement = getDisplacement(decompressed.length - doffset - 1);
                        const symbolOffset = (pointer >> (12 - displacement)) + 1;
                        const symbolLength = (pointer & (0xFFF >> displacement)) + 2;
                        const shiftOffset = decompressed.length - symbolOffset;

                        for (let shiftDelta = 0; shiftDelta < symbolLength + 1; shiftDelta++) {
                            const shift = shiftOffset + shiftDelta;
                            if (shift < 0 || decompressed.length <= shift) {
                                throw new OperationError("Malformed LZNT1 stream: Invalid shift!");
                            }
                            decompressed.push(decompressed[shift]);
                        }
                    }
                    header >>= 1;
                }
            }
        } else {
            decompressed.push(...compressed.slice(coffset, coffset + size + 1));
            coffset += size + 1;
        }
    }

    return decompressed;
}
