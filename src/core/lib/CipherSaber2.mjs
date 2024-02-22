/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
export function encode(tempIVP, key, rounds, input) {
    const ivp = new Uint8Array(key.concat(tempIVP));
    const state = new Array(256).fill(0);
    let j = 0, i = 0;
    const result = [];

    // Mixing states based off of IV.
    for (let i = 0; i < 256; i++)
        state[i] = i;
    const ivpLength = ivp.length;
    for (let r = 0; r < rounds; r ++) {
        for (let k = 0; k < 256; k++) {
            j = (j + state[k] + ivp[k % ivpLength]) % 256;
            [state[k], state[j]] = [state[j], state[k]];
        }
    }
    j = 0;
    i = 0;

    // XOR cipher with key.
    for (let x = 0; x < input.length; x++) {
        i = (++i) % 256;
        j = (j + state[i]) % 256;
        [state[i], state[j]] = [state[j], state[i]];
        const n = (state[i] + state[j]) % 256;
        result.push(state[n] ^ input[x]);
    }
    return result;
}
