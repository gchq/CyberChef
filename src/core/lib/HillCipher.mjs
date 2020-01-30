/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
let N = 0;

/**
 * Generates a matrix from a string. Depending on the strings purpose it populates it differently.
 *
 * @param {string} theString
 * @param {boolean} keyflag
 * @returns {object}
 */
function genMatrix(theString, keyflag=false) {
    const matrix = new Array(N).fill(0).map(() => new Array(N).fill(-1));
    let count = 0;

    // Loop over string and put it into a matrix.
    for (let i = 0; i < theString.length; i++) {
        if (i % N === 0 && i)
            count++;
        if (keyflag)
            matrix[count][i%N] = theString.charCodeAt(i) - 97;
        else
            matrix[i%N][count] = theString.charCodeAt(i) - 97;
    }
    return matrix;
}

/**
 * Gets the cofactor matrix of a matrix.
 *
 * @param {object} matrix
 * @param {number} p
 * @param {number} q
 * @param {number} size
 * @returns {object}
 */
function getCofactor(matrix, p, q, size) {
    const temp = new Array(size).fill(0).map(() => new Array(size).fill(-1));
    let i = 0, j = 0;

    // Loop through all rows and columns, copying into the cofactor matrix.
    for (let row = 0; row < size; row++)
        for (let col = 0; col < size; col++)
            if (row !== p && col !== q) {
                temp[i][j++] = matrix[row][col];

                // Reset loop counters.
                if (j === size - 1) {
                    j = 0;
                    i++;
                }
            }
    return temp;
}

/**
 * Calculates the determinant from a matrix.
 *
 * @param {object} matrix
 * @param {number} size
 * @returns {number}
 */
function determinant (matrix, size) {
    let D = 0;
    if (size === 1)
        return matrix[0][0];
    let sign = 1;

    // Loop through top row of matrix calculating the determinant with an alternating sign.
    for (let f = 0; f < size; f++) {
        const temp = getCofactor(matrix, 0, f, size);
        D += sign * matrix[0][f] * determinant(temp, size-1);
        sign *= -1;
    }
    return D;
}

/**
 * Calculates the adjoint matrix from a matrix.
 *
 * @param {object} matrix
 * @returns {object}
 */
function adjoint(matrix) {
    if (N === 1)
        return [[1]];
    let sign = 1;
    const adj = new Array(N);

    // Calculates the adjugate matrix which is the transpose of the cofactor.
    for (let i = 0; i < N; i++) {
        adj[i] = new Array(N);
        for (let j = 0; j< N; j++) {
            const temp = getCofactor(matrix, i, j, N);
            sign = ((i + j) % 2 === 0) ? 1 : -1;
            adj[i][j] = sign * (determinant(temp, N - 1));
        }
    }
    return adj;
}

/**
 * Calculates the modular multiplicative inverse of the determinant.
 *
 * @param {number} det
 * @param {number} base
 * @returns {number}
 */
function inverseDeterminant(det, base=26) {

    // This brute forces all the possible numbers that may result in a zero remainder.
    for (let i = 0; i < 26; i++) {
        if ((base * i + 1) % det === 0)
            return Math.floor((base * i + 1) / det);
    }
    return null;
}

/**
 * Calculates an inverse matrix from a matrix.
 *
 * @param {object} matrix
 * @returns {object}
 */
function inverse(matrix) {
    let det = determinant(matrix, N);
    det = det - (Math.floor(det/26) * 26);

    // Calculates the modular multiplicative inverse of the determinant.
    det = inverseDeterminant(det);
    if (det === 0)
        throw new OperationError("Key matrix has a determinant of 0.");
    const adj = adjoint(matrix);
    const inverse = new Array(N);

    // Multiply all values in the matrix by the new determinant.
    for (let i = 0; i < N; i++) {
        inverse[i] = new Array(N);
        for (let j = 0; j < N; j++) {
            const temp = (det * adj[j][i]);
            inverse[i][j] = temp - (Math.floor(temp/26) * 26);
        }
    }
    return inverse;
}

/**
 * Multiplies two matrices together.
 *
 * @param {object} matrix1
 * @param {object} matrix2
 * @returns {object}
 */
function multiply(matrix1, matrix2) {
    const result = new Array(matrix2.length).fill(0).map(() => new Array(matrix2[0].length).fill(0));

    // Loop through the columns and rows of the matrices multiplying them together.
    for (let i = 0; i < matrix1.length; i++)
        for (let j = 0; j < matrix2[0].length; j++) {
            for (let k = 0; k < matrix2.length; k++)
                result[i][j] += matrix1[i][k] * matrix2[k][j];
            result[i][j] = String.fromCharCode(97 + (result[i][j] % 26));
        }
    return result;
}

/**
 * Converts a matrix into a string.
 *
 * @param {object} matrix
 * @returns {string}
 */
function join(matrix) {
    let result = "";

    // Join values of a matrix together into a string.
    for (let i = 0; i < matrix[0].length; i++)
        for (let j = 0; j < matrix.length; j++)
            result += matrix[j][i];
    return result;
}

/**
 * Encodes the plaintext using a key.
 *
 * @param {string} plaintext
 * @param {string} key
 * @returns {string}
 */
export function encode(plaintext, key) {

    // Don't trust users, calculate the size of the key matrix manually.
    N = Math.ceil(Math.sqrt(key.length));

    // Generate matrix representation of the key.
    const keyMatrix = genMatrix(key, true);

    // Generate matrix representation of the plaintext.
    const plaintextMatrix = genMatrix(plaintext);

    return join(multiply(keyMatrix, plaintextMatrix));
}

/**
 * Decodes the ciphertext using a key.
 *
 * @param {string} ciphertext
 * @param {string} key
 * @returns {string}
 */
export function decode(ciphertext, key) {

    // Don't trust users, calculate the size of the key matrix manually.
    N = Math.ceil(Math.sqrt(key.length));

    // Generate matrix representation of the key.
    const keyMatrix = inverse(genMatrix(key, true));

    // Generate matrix representation of the plaintext.
    const ciphertextMatrix = genMatrix(ciphertext);

    return join(multiply(keyMatrix, ciphertextMatrix));

}
