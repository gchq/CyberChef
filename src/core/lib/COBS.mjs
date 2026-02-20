/**
 * @author Imantas Lukenskas [imantas@lukenskas.dev]
 * @copyright Imantas Lukenskas 2026
 * @license Apache-2.0
 */

/**
 * COBS-encode a byte array
 * @param {Uint8Array} data
 * @return {Uint8Array}
 */
export function toCobs(data) {
    if (!data || data.length === 0) {
        return new Uint8Array();
    }

    const output = [];
    data = [0, ...data];

    while (data.length > 0) {
        const endIndex = data.findIndex((value, index) => value === 0 && index > 0);

        if ((endIndex < 0 || endIndex > 254) && data.length > 254) {
            output.push(255);
            output.push(...data.slice(1, 255));
            data = [...data.slice(255)];
            if (data.length !== 0) {
                data = [0, ...data];
            }
        } else if (endIndex < 0) {
            output.push(data.length);
            output.push(...data.slice(1));
            data = [];
        } else {
            output.push(endIndex);
            output.push(...data.slice(1, endIndex));
            data = data.slice(endIndex);
        }
    }

    return output;
}

/**
 * COBS-decode a byte array
 * @param {Uint8Array} data
 * @return {Uint8Array}
 */
export function fromCobs(data) {
    if (!data || data.length === 0) {
        return new Uint8Array();
    }

    const output = [];

    while (data.length > 0) {
        if (data[0] === 0xFF) {
            output.push(...data.slice(1, 255));
            data = data.slice(255);
        } else {
            const nextZeroIndex = data[0];
            output.push(...data.slice(1, nextZeroIndex));
            data = data.slice(nextZeroIndex);

            let blockSize = data[0];
            while (data.length > 0) {
                output.push(0, ...data.slice(1, blockSize));
                data = data.slice(blockSize);

                if (blockSize === 0xFF) {
                    break;
                }

                blockSize = data[0];
            }
        }
    }

    return output;
}
