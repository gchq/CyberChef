/**
 * Zstd shared initialisation.
 *
 * Both ZstdCompress and ZstdDecompress import from here so that
 * WebAssembly.instantiate is called exactly once, regardless of how many
 * operations use it or in what order they run.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import { init, compress, decompress } from "@bokuweb/zstd-wasm";

let initPromise = null;

/**
 * Returns a promise that resolves once the Zstd WASM module is ready.
 * Safe to call multiple times — the module is only instantiated once.
 *
 * @returns {Promise<void>}
 */
export function zstdInit() {
    if (!initPromise) {
        const wasmUrl = typeof self !== "undefined" && self.docURL
            ? `${self.docURL}/assets/zstd.wasm`
            : undefined;
        initPromise = init(wasmUrl);
    }
    return initPromise;
}

export { compress, decompress };
