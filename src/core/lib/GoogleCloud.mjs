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
 * @returns {Object|null} { authType, authString, quotaProject, defaultRegion }
 */
export function getGcpCredentials() {
    if (globalThis.__gcpAuthStore) {
        return globalThis.__gcpAuthStore;
    }
    return null;
}

/**
 * Sets the active GCP credentials for the web worker session.
 * @param {Object} credObj { authType, authString, quotaProject, defaultRegion }
 */
export function setGcpCredentials(credObj) {
    globalThis.__gcpAuthStore = credObj;
}

/**
 * Returns the active GCP credentials, or throws if none have been set.
 * @returns {Object} { authType, authString, quotaProject, defaultRegion }
 */
function requireGcpCredentials() {
    const creds = getGcpCredentials();
    if (!creds || !creds.authString) {
        throw new OperationError("No Google Cloud credentials found. Please add the 'Authenticate Google Cloud' operation before this one.");
    }
    return creds;
}


/**
 * Validates and applies GCP authentication to a URL and Headers object
 * using the globally cached credentials from AuthenticateGoogleCloud.
 * @param {string} url - The base URL of the API endpoint.
 * @param {Headers} headers - The Headers object for the request.
 * @returns {Object} An object containing the modified { url, headers }
 */
export function applyGCPAuth(url, headers) {
    const creds = requireGcpCredentials();

    if (creds.authType === "API Key") {
        url += `${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(creds.authString)}`;
    } else if (creds.authType === "OAuth 2.0 (Web Application: PKCE)" || creds.authType === "Personal Access Token (PAT)") {
        const isMapsApi = url.includes("maps.googleapis.com") || url.includes("places.googleapis.com");

        // If it's a Maps API and we have a fallback API key, use it INSTEAD of OAuth
        if (isMapsApi && creds.apiKey) {
            url += `${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(creds.apiKey)}`;
        } else {
            // Otherwise, apply standard OAuth Bearer auth
            headers.set("Authorization", `Bearer ${creds.authString}`);

            // Google Maps and Places APIs do not support the x-goog-user-project CORS header
            if (creds.quotaProject && !isMapsApi) {
                headers.set("x-goog-user-project", creds.quotaProject);
            }
        }
    }

    return { url, headers };
}

/**
 * Parses an input GCS URI and a destination directory string to generate
 * a fully resolved destination URI. If the destination directory is blank,
 * it writes to the original directory but suffixes the filename (before the extension).
 *
 * @param {string} inputUri - The source `gs://` URI.
 * @param {string} destDir - The requested destination directory `gs://...` (or blank).
 * @param {string} suffix - The mandatory suffix to append if destDir is blank (e.g., `_ccc_stt`).
 * @param {string} [extensionOverride] - If provided, forcibly sets the final extension (e.g., `.txt`).
 * @returns {Object} An object containing the derived { bucket, objectPath, gcsUri }
 */
export function generateGCSDestinationUri(inputUri, destDir, suffix, extensionOverride) {
    const match = inputUri.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (!match) throw new OperationError(`Invalid input GCS URI: ${inputUri}`);
    const [, inputBucket, inputObject] = match;

    let destBucket = inputBucket;
    let destObject = inputObject;

    // Handle extraction of basename and extension
    const lastSlashIndex = destObject.lastIndexOf("/");
    const pathPrefix = lastSlashIndex !== -1 ? destObject.substring(0, lastSlashIndex + 1) : "";
    const filename = lastSlashIndex !== -1 ? destObject.substring(lastSlashIndex + 1) : destObject;

    let extension = "";
    let baseFilename = filename;
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex !== -1 && lastDotIndex > 0) {
        baseFilename = filename.substring(0, lastDotIndex);
        extension = filename.substring(lastDotIndex);
    }

    if (extensionOverride) {
        extension = extensionOverride.startsWith(".") ? extensionOverride : `.${extensionOverride}`;
    }

    if (destDir && destDir.trim().length > 0) {
        // User provided an explicit Destination Directory (e.g. gs://new-bucket/reports/)
        const destMatch = destDir.match(/^gs:\/\/([^/]+)\/?(.*)$/);
        if (!destMatch) throw new OperationError(`Invalid output directory GCS URI: ${destDir}`);

        destBucket = destMatch[1];
        let newPrefix = destMatch[2];
        if (newPrefix && !newPrefix.endsWith("/")) newPrefix += "/";

        // When providing explicit directory, we preserve the exact filename (or just swap extension)
        destObject = `${newPrefix}${baseFilename}${extension}`;
    } else {
        // Default Behavior: Same directory, but MUST append suffix
        destObject = `${pathPrefix}${baseFilename}${suffix}${extension}`;
    }

    return {
        bucket: destBucket,
        objectPath: destObject,
        gcsUri: `gs://${destBucket}/${destObject}`
    };
}

/**
 * A unified fetcher for Google Cloud APIs.
 * Handles Auth, Query Params, JSON Body parsing, and consistent Error Handling.
 * @param {string} urlStr - The base URL or full URL.
 * @param {Object} options
 * @param {string} [options.method="GET"] - HTTP method.
 * @param {Object} [options.params] - Key-value pairs for URL query strings.
 * @param {Object|string} [options.body] - The request payload (auto-stringified if Object).
 * @param {Headers} [options.headers] - Custom headers.
 * @returns {Promise<Object>} The parsed JSON response.
 */
export async function gcpFetch(urlStr, { method = "GET", params = {}, body = null, headers = null } = {}) {
    // Fail on missing credentials before building any request state
    requireGcpCredentials();
    headers = headers || new Headers();
    const url = new URL(urlStr);

    // 1. Attach Query Parameters (e.g., for Maps/Geocoding)
    Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
            url.searchParams.append(key, val);
        }
    });

    // 2. Set Default Content-Type for POST/PUT
    if (body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json; charset=utf-8");
    }

    // 3. Apply GCP Authentication (Injects API Key or Bearer Token)
    const authed = applyGCPAuth(url.toString(), headers);

    // 4. Execute Request
    const config = {
        method,
        headers: authed.headers,
        mode: "cors",
        cache: "no-cache",
        body: (body && typeof body === "object") ? JSON.stringify(body) : body
    };

    let response;
    try {
        response = await fetch(authed.url, config);
    } catch (e) {
        throw new OperationError(`Network Error: Could not connect to Google APIs. ${e.message}`);
    }

    // 5. Centralized Error Handling
    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        data = { error: { message: rawText } };
    }

    if (!response.ok || (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS")) {
        // Maps API uses data.status; Vertex/Translate use response.ok + data.error.message
        const msg = data.error?.message || data.error_message || data.status || response.statusText;
        throw new OperationError(`GCP API Error (${response.status}): ${msg}`);
    }

    return data;
}

/**
 * Writes text (or JSON) content to a GCS object via the GCS JSON upload API.
 * Authentication is applied automatically via `applyGCPAuth`.
 *
 * @param {string} bucket - The GCS bucket name.
 * @param {string} objectPath - The full object path within the bucket.
 * @param {string} content - The string content to upload.
 * @param {string} [contentType="text/plain; charset=utf-8"] - MIME content type.
 * @returns {Promise<string>} The `gs://` URI of the written object.
 */
export async function writeGCSText(bucket, objectPath, content, contentType = "text/plain; charset=utf-8") {
    const encodedObject = encodeURIComponent(objectPath).replace(/%2F/g, "%2F");
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodedObject}`;
    const headers = new Headers();
    headers.set("Content-Type", contentType);
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
        try {
            const d = await response.json();
            msg = d?.error?.message || msg;
        } catch (e) { /* ignore */ }
        throw new OperationError(`GCS write error (${response.status}): ${msg}`);
    }
    return `gs://${bucket}/${objectPath}`;
}

/**
 * Writes binary content (an ArrayBuffer) to a GCS object via the GCS JSON upload API.
 * Use this for non-text payloads such as images, audio, video, or other binary files.
 * Authentication is applied automatically via `applyGCPAuth`.
 *
 * @param {string} bucket - The GCS bucket name.
 * @param {string} objectPath - The full object path within the bucket.
 * @param {ArrayBuffer} buffer - The binary content to upload.
 * @param {string} [contentType="application/octet-stream"] - MIME content type.
 * @returns {Promise<string>} The `gs://` URI of the written object.
 */
export async function writeGCSBytes(bucket, objectPath, buffer, contentType = "application/octet-stream") {
    const encodedObject = encodeURIComponent(objectPath).replace(/%2F/g, "%2F");
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodedObject}`;
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    const authed = applyGCPAuth(url, headers);
    const response = await fetch(authed.url, {
        method: "POST",
        headers: authed.headers,
        body: buffer,
        mode: "cors",
        cache: "no-cache"
    });
    if (!response.ok) {
        let msg = response.statusText;
        try {
            const d = await response.json();
            msg = d?.error?.message || msg;
        } catch (e) { /* ignore */ }
        throw new OperationError(`GCS write error (${response.status}): ${msg}`);
    }
    return `gs://${bucket}/${objectPath}`;
}
