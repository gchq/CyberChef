/**
 * File extraction functions
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */
import Stream from "./Stream";

/**
 * Attempts to extract a file from a data stream given its mime type and offset.
 *
 * @param {Uint8Array} bytes
 * @param {Object} fileDetail
 * @param {string} fileDetail.mime
 * @param {string} fileDetail.ext
 * @param {number} fileDetail.offset
 * @returns {File}
 */
export function extractFile(bytes, fileDetail) {
    let fileData;
    switch (fileDetail.mime) {
        case "image/jpeg":
            fileData = extractJPEG(bytes, fileDetail.offset);
            break;
        case "application/x-msdownload":
            fileData = extractMZPE(bytes, fileDetail.offset);
            break;
        case "application/pdf":
            fileData = extractPDF(bytes, fileDetail.offset);
            break;
        case "application/zip":
            fileData = extractZIP(bytes, fileDetail.offset);
            break;
        default:
            throw new Error(`No extraction algorithm available for "${fileDetail.mime}" files`);
    }

    return new File([fileData], `extracted_at_0x${fileDetail.offset.toString(16)}.${fileDetail.ext}`);
}


/**
 * JPEG extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractJPEG(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    while (stream.hasMore()) {
        const marker = stream.getBytes(2);
        if (marker[0] !== 0xff) throw new Error("Invalid JPEG marker: " + marker);

        let segmentSize = 0;
        switch (marker[1]) {
            // No length
            case 0xd8: // Start of Image
            case 0x01: // For temporary use in arithmetic coding
                break;
            case 0xd9: // End found
                return stream.carve();

            // Variable size segment
            case 0xc0: // Start of frame (Baseline DCT)
            case 0xc1: // Start of frame (Extended sequential DCT)
            case 0xc2: // Start of frame (Progressive DCT)
            case 0xc3: // Start of frame (Lossless sequential)
            case 0xc4: // Define Huffman Table
            case 0xc5: // Start of frame (Differential sequential DCT)
            case 0xc6: // Start of frame (Differential progressive DCT)
            case 0xc7: // Start of frame (Differential lossless)
            case 0xc8: // Reserved for JPEG extensions
            case 0xc9: // Start of frame (Extended sequential DCT)
            case 0xca: // Start of frame (Progressive DCT)
            case 0xcb: // Start of frame (Lossless sequential)
            case 0xcc: // Define arithmetic conditioning table
            case 0xcd: // Start of frame (Differential sequential DCT)
            case 0xce: // Start of frame (Differential progressive DCT)
            case 0xcf: // Start of frame (Differential lossless)
            case 0xdb: // Define Quantization Table
            case 0xde: // Define hierarchical progression
            case 0xe0: // Application-specific
            case 0xe1: // Application-specific
            case 0xe2: // Application-specific
            case 0xe3: // Application-specific
            case 0xe4: // Application-specific
            case 0xe5: // Application-specific
            case 0xe6: // Application-specific
            case 0xe7: // Application-specific
            case 0xe8: // Application-specific
            case 0xe9: // Application-specific
            case 0xea: // Application-specific
            case 0xeb: // Application-specific
            case 0xec: // Application-specific
            case 0xed: // Application-specific
            case 0xee: // Application-specific
            case 0xef: // Application-specific
            case 0xfe: // Comment
                segmentSize = stream.readInt(2, "be");
                stream.position += segmentSize - 2;
                break;

            // 1 byte
            case 0xdf: // Expand reference image
                stream.position++;
                break;

            // 2 bytes
            case 0xdc: // Define number of lines
            case 0xdd: // Define restart interval
                stream.position += 2;
                break;

            // Start scan
            case 0xda: // Start of scan
                segmentSize = stream.readInt(2, "be");
                stream.position += segmentSize - 2;
                stream.continueUntil(0xff);
                break;

            // Continue through encoded data
            case 0x00: // Byte stuffing
            case 0xd0: // Restart
            case 0xd1: // Restart
            case 0xd2: // Restart
            case 0xd3: // Restart
            case 0xd4: // Restart
            case 0xd5: // Restart
            case 0xd6: // Restart
            case 0xd7: // Restart
                stream.continueUntil(0xff);
                break;

            default:
                stream.continueUntil(0xff);
                break;
        }
    }

    throw new Error("Unable to parse JPEG successfully");
}


/**
 * Portable executable extractor.
 * Assumes that the offset refers to an MZ header.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractMZPE(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Move to PE header pointer
    stream.moveTo(0x3c);
    const peAddress = stream.readInt(4, "le");

    // Move to PE header
    stream.moveTo(peAddress);

    // Get number of sections
    stream.moveForwardsBy(6);
    const numSections = stream.readInt(2, "le");

    // Get optional header size
    stream.moveForwardsBy(12);
    const optionalHeaderSize = stream.readInt(2, "le");

    // Move past optional header to section header
    stream.moveForwardsBy(2 + optionalHeaderSize);

    // Move to final section header
    stream.moveForwardsBy((numSections - 1) * 0x28);

    // Get raw data info
    stream.moveForwardsBy(16);
    const rawDataSize = stream.readInt(4, "le");
    const rawDataAddress = stream.readInt(4, "le");

    // Move to end of final section
    stream.moveTo(rawDataAddress + rawDataSize);

    return stream.carve();
}


/**
 * PDF extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractPDF(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Find end-of-file marker (%%EOF)
    stream.continueUntil([0x25, 0x25, 0x45, 0x4f, 0x46]);
    stream.moveForwardsBy(5);
    stream.consumeIf(0x0d);
    stream.consumeIf(0x0a);

    return stream.carve();
}


/**
 * ZIP extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractZIP(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Find End of central directory record
    stream.continueUntil([0x50, 0x4b, 0x05, 0x06]);

    // Get comment length and consume
    stream.moveForwardsBy(20);
    const commentLength = stream.readInt(2, "le");
    stream.moveForwardsBy(commentLength);

    return stream.carve();
}
