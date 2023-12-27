/**
 *
 * LZNT1 Decompress.
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
