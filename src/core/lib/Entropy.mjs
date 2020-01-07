/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

/**
 * Calculates the frequency of bytes in the input.
 *
 * @param {Uint8Array} input
 * @returns {number}
 */
export function freqDist(input) {
    const prob = [],
        occurrences = new Array(256).fill(0);

    // Count occurrences of each byte in the input
    let i;
    for (i = 0; i < input.length; i++) {
        occurrences[input[i]]++;
    }

    // Store probability list
    for (i = 0; i < occurrences.length; i++) {
        if (occurrences[i] > 0) {
            prob.push(occurrences[i] / input.length);
        }
    }
    return prob;
}

/**
 * Calculates the entropy of the input.
 *
 * @param {Uint8Array} input
 * @returns {number}
 */
export function calculateShannonEntropy(input) {

    const prob = freqDist(input);

    // Calculate Shannon entropy
    let entropy = 0,
        p;

    for (let i = 0; i < prob.length; i++) {
        p = prob[i];
        entropy += p * Math.log(p) / Math.log(2);
    }

    return -entropy;
}

/**
 * Calculates the entropy of the input from the passed probability.
 *
 * @param {Uint8Array} prob
 * @returns {number}
 */
export function calculateShannonEntropyFromProb(prob) {

    // Calculate Shannon entropy
    let entropy = 0,
        p;

    for (let i = 0; i < prob.length; i++) {
        p = prob[i];
        entropy += p * Math.log(p) / Math.log(2);
    }

    return -entropy;
}

/**
 * Calculates the scanning entropy of the input.
 *
 * @param {Uint8Array} inputBytes
 * @param {number} binWidth
 * @returns {Object}
 */
export function calculateScanningEntropy(inputBytes, binWidth) {
    const entropyData = [];

    for (let bytePos = 0; bytePos < inputBytes.length; bytePos += binWidth) {
        const block = inputBytes.slice(bytePos, bytePos+binWidth);
        entropyData.push(calculateShannonEntropy(block));
    }

    return { entropyData, binWidth };
}
