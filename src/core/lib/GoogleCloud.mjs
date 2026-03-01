/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Global store for GCP credentials in this web worker session.
 */
globalThis.__gcpAuthStore = globalThis.__gcpAuthStore || null;

/**
 * Retrieves the currently active GCP credentials.
 * @returns {Object|null} { authType, authString, quotaProject }
 */
export function get_gcp_credentials() {
    if (globalThis.__gcpAuthStore) {
        return globalThis.__gcpAuthStore;
    }
    return null;
}

/**
 * Sets the active GCP credentials for the web worker session.
 * @param {Object} credObj { authType, authString, quotaProject }
 */
export function set_gcp_credentials(credObj) {
    globalThis.__gcpAuthStore = credObj;
}

/**
 * Lists objects in a GCS bucket under a given prefix.
 *
 * @param {string} bucket - The GCS bucket name (without gs://).
 * @param {string} prefix - The folder prefix to filter by (e.g. "audio/").
 * @returns {Promise<Array>} Array of GCS object metadata { name, gs_uri, size, contentType }.
 */
export async function listGCSBucket(bucket, prefix) {
    let url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o`;
    const params = new URLSearchParams();
    if (prefix) params.set("prefix", prefix);
    params.set("fields", "items(name,size,contentType)");
    const paramStr = params.toString();
    if (paramStr) url += `?${paramStr}`;

    const headers = new Headers();
    const authed = applyGCPAuth(url, headers);

    const response = await fetch(authed.url, { method: "GET", headers: authed.headers, mode: "cors", cache: "no-cache" });
    let data;
    try {
        data = await response.json();
    } catch (e) {
        throw new OperationError("GCloud List Bucket: Failed to parse GCS API response.");
    }
    if (!response.ok) {
        const msg = data?.error?.message || response.statusText;
        throw new OperationError(`GCloud List Bucket: GCS API Error (${response.status}): ${msg}`);
    }

    const items = data.items || [];
    return items
        .filter(item => !item.name.endsWith("/")) // exclude folder placeholder objects
        .map(item => ({
            name: item.name,
            gs_uri: `gs://${bucket}/${item.name}`,
            size: item.size,
            contentType: item.contentType
        }));
}

/**
 * Downloads a file from GCS and returns its raw bytes.
 *
 * @param {string} gcsUri - Full gs:// URI of the file.
 * @returns {Promise<ArrayBuffer>} Raw file bytes.
 */
export async function readGCSFile(gcsUri) {
    const match = gcsUri.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (!match) throw new OperationError(`GCloud Read File: Invalid GCS URI: ${gcsUri}`);
    const [, bucket, object] = match;
    const encodedObject = encodeURIComponent(object).replace(/%2F/g, "%2F");
    let url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodedObject}?alt=media`;

    const headers = new Headers();
    const authed = applyGCPAuth(url, headers);

    const response = await fetch(authed.url, { method: "GET", headers: authed.headers, mode: "cors", cache: "no-cache" });
    if (!response.ok) {
        let msg = response.statusText;
        try { const d = await response.json(); msg = d?.error?.message || msg; } catch (e) { /* ignore */ }
        throw new OperationError(`GCloud Read File: GCS API Error (${response.status}): ${msg}`);
    }
    return await response.arrayBuffer();
}

/**
 * Writes text content to a GCS object.
 *
 * @param {string} bucket - Destination bucket name (without gs://).
 * @param {string} objectPath - Destination object path within the bucket.
 * @param {string} content - Text content to write.
 * @returns {Promise<string>} The gs:// URI of the written file.
 */
export async function writeGCSFile(bucket, objectPath, content) {
    const encodedObject = encodeURIComponent(objectPath).replace(/%2F/g, "%2F");
    let url = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodedObject}`;

    const headers = new Headers();
    headers.set("Content-Type", "text/plain; charset=utf-8");
    const authed = applyGCPAuth(url, headers);

    const response = await fetch(authed.url, {
        method: "POST",
        headers: authed.headers,
        body: content,
        mode: "cors",
        cache: "no-cache"
    });
    if (!response.ok) {
        let msg = response.statusText;
        try { const d = await response.json(); msg = d?.error?.message || msg; } catch (e) { /* ignore */ }
        throw new OperationError(`GCloud Write File: GCS API Error (${response.status}): ${msg}`);
    }
    return `gs://${bucket}/${objectPath}`;
}

/**
 * Polls a Google Cloud long-running operation until it completes.
 *
 * @param {string} operationName - The operation ID (numeric string from the API response).
 * @param {string} pollUrl - The base polling URL (e.g. https://speech.googleapis.com/v1/operations/).
 * @param {number} maxMs - Maximum wait time in milliseconds (default 30 minutes).
 * @param {number} intervalMs - Poll interval in milliseconds (default 10 seconds).
 * @param {Function} onProgress - Optional callback(elapsedSeconds) called on each poll tick.
 * @returns {Promise<Object>} The completed operation response object.
 */
export async function pollLongRunningOperation(operationName, pollUrl, maxMs = 30 * 60 * 1000, intervalMs = 10000, onProgress = null) {
    const startTime = Date.now();
    const url = `${pollUrl}${operationName}`;

    while (true) {
        const elapsed = Date.now() - startTime;
        if (elapsed > maxMs) {
            throw new OperationError(`GCloud: Operation timed out after ${Math.round(elapsed / 60000)} minutes. Operation ID: ${operationName}`);
        }

        const headers = new Headers();
        const authed = applyGCPAuth(url, headers);
        const response = await fetch(authed.url, { method: "GET", headers: authed.headers, mode: "cors", cache: "no-cache" });

        let data;
        try { data = await response.json(); } catch (e) {
            throw new OperationError("GCloud: Failed to parse long-running operation response.");
        }
        if (!response.ok) {
            const msg = data?.error?.message || response.statusText;
            throw new OperationError(`GCloud: Operation polling error (${response.status}): ${msg}`);
        }

        if (data.done) return data;

        const elapsedSec = Math.round(elapsed / 1000);
        if (onProgress) onProgress(elapsedSec);

        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
}

/**
 * Validates and applies GCP authentication to a URL and Headers object
 * using the globally cached credentials from AuthenticateGoogleCloud.
 * 
 * @param {string} url - The base URL of the API endpoint.
 * @param {Headers} headers - The Headers object for the request.
 * @returns {Object} An object containing the modified { url, headers }
 */
export function applyGCPAuth(url, headers) {
    const creds = get_gcp_credentials();

    if (!creds || !creds.authString) {
        throw new OperationError("No Google Cloud credentials found. Please add the 'Authenticate Google Cloud' operation before this one.");
    }

    if (creds.authType === "API Key") {
        url += `${url.includes('?') ? '&' : '?'}key=${encodeURIComponent(creds.authString)}`;
    } else if (creds.authType === "OAuth 2.0 (Web Application: PKCE)" || creds.authType === "Personal Access Token (PAT)") {
        headers.set("Authorization", `Bearer ${creds.authString}`);
        if (creds.quotaProject) {
            headers.set("x-goog-user-project", creds.quotaProject);
        }
    }

    return { url, headers };
}
