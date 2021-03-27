/**
 * Parses a JPEG quantisation table.
 *
 * @param {Uint8Array} rawTable
 * @param {boolean} doublePrec - true if 16-bit precision, false if 8-bit
 * @returns {number[][]}
 *
 */
export function parseQTable(rawTable, doublePrec = false) {
    // The raw table is flattened in zig-zag order, similar to enumerating a countable set.
    // This lookup table tells the index in the natural order for each element in the zig-zag order
    const unZigZagIndex = [
        0,  1,  8, 16,  9,  2,  3, 10,
        17, 24, 32, 25, 18, 11,  4,  5,
        12, 19, 26, 33, 40, 48, 41, 34,
        27, 20, 13,  6,  7, 14, 21, 28,
        35, 42, 49, 56, 57, 50, 43, 36,
        29, 22, 15, 23, 30, 37, 44, 51,
        58, 59, 52, 45, 38, 31, 39, 46,
        53, 60, 61, 54, 47, 55, 62, 63];
    const ret = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]];
    let i = 0;
    let elemCount = 0;
    while (i < rawTable.length) {
        const row = ~~(unZigZagIndex[elemCount] / 8); // floor
        const col = unZigZagIndex[elemCount] % 8;
        if (doublePrec) {
            ret[row][col] = rawTable[i++] << 8 + rawTable[i++];
        } else {
            ret[row][col] = rawTable[i++];
        }
        elemCount++;
    }
    return ret;
}

/**
 * Finds the index of first appearance of a JPEG marker
 *
 * @param {Uint8Array} image
 * @param {number} markerByte - doesn't include 0xFF
 * @param {number} fromIndex - the index to start the search at
 * @returns {number}
 *
 */
export function indexOfMarker(image, markerByte, fromIndex = 0) {
    let ptr = fromIndex;
    let markerIndex = 0;
    do {
        // look for the byte that changes across markers first, as these are less common than 0xFF
        markerIndex = image.indexOf(markerByte, ptr);
        if (markerIndex === 0) return -1; // marker byte must follow 0xFF
        if (image[markerIndex-1] === 0xFF) {
            return markerIndex - 1;
        } else {
            ptr = markerIndex + 1;
        }
    } while (markerIndex !== -1);
    return -1;
}
