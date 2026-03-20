/**
 * Polyfill for Node.js 22+ where globalThis.fetch is built-in but rejects
 * bare filesystem paths. WASM libraries like argon2-browser call fetch() with
 * an absolute path (e.g. "/path/to/argon2.wasm") expecting a browser-style
 * fallback, but Node.js 22's fetch throws synchronously for non-URL strings.
 *
 * This wrapper intercepts such calls and serves the file via Node's fs module,
 * returning a synthetic Response so the WASM module loads correctly.
 */

import { readFile } from "fs/promises";

if (globalThis.fetch) {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async function patchedFetch(url, options) {
        const urlStr = typeof url === "string" ? url
            : url instanceof URL ? url.href
            : String(url);
        // Intercept bare filesystem paths (absolute POSIX or Windows)
        if (urlStr.startsWith("/") || /^[A-Za-z]:[/\\]/.test(urlStr)) {
            const buffer = await readFile(urlStr);
            return new Response(buffer, {
                status: 200,
                headers: { "Content-Type": "application/wasm" },
            });
        }
        return originalFetch(url, options);
    };
}
