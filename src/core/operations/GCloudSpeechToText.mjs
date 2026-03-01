/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { applyGCPAuth, pollLongRunningOperation, writeGCSFile } from "../lib/GoogleCloud.mjs";

/**
 * GCloud Speech to Text operation
 */
class GCloudSpeechToText extends Operation {

    /**
     * GCloudSpeechToText constructor
     */
    constructor() {
        super();

        this.name = "GCloud Speech to Text";
        this.module = "Cloud";
        this.description = [
            "Transcribes audio using the Google Cloud Speech-to-Text API.",
            "<br><br>",
            "<b>GCS URI mode (recommended for large files):</b> Input a <code>gs://</code> URI ",
            "(e.g. <code>gs://my-bucket/audio/file.mp3</code>). The audio is processed entirely within ",
            "Google Cloud — the raw audio never passes through the browser. Suitable for files of any size. ",
            "Uses the asynchronous <code>longrunningrecognize</code> API with internal polling.",
            "<br><br>",
            "<b>Raw Audio mode:</b> Provide Base64-encoded audio bytes directly. Only suitable for short ",
            "clips (under ~1 minute). Uses the synchronous <code>recognize</code> API.",
            "<br><br>",
            "<b>Write to GCS mode:</b> Instead of returning the transcript to CyberChef, writes it to a ",
            "structured path in a GCS bucket and returns the destination <code>gs://</code> URI. This is ",
            "ideal for batch processing with Fork — each fork branch writes its transcript and returns a URI, ",
            "which can be saved and used as input to a later recipe.",
            "<br><br>",
            "Output path convention: <code>output/audio/{filename}/speech-to-text/text.txt</code>",
        ].join("\n");
        this.infoURL = "https://cloud.google.com/speech-to-text/docs/reference/rest";
        this.inputType = "string";
        this.outputType = "string";
        this.manualBake = true;
        this.args = [
            {
                "name": "Input Mode",
                "type": "option",
                "value": ["GCS URI (gs://...)", "Raw Audio Bytes (Base64)"]
            },
            {
                "name": "Language Code",
                "type": "string",
                "value": "en-US"
            },
            {
                "name": "Model",
                "type": "option",
                "value": ["latest_long", "latest_short", "telephony", "medical_dictation", "default"]
            },
            {
                "name": "Output Destination",
                "type": "option",
                "value": ["Return to CyberChef", "Write to GCS"]
            },
            {
                "name": "Output GCS Bucket",
                "type": "string",
                "value": "cyber-chef-cloud-examples"
            },
            {
                "name": "Max Poll Minutes",
                "type": "number",
                "value": 30
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [
            inputMode, languageCode, model, outputDest, outputBucket, maxPollMinutes
        ] = args;

        const uri = input.trim();
        if (!uri) throw new OperationError("Please provide a GCS URI or Base64 audio input.");

        const maxMs = maxPollMinutes * 60 * 1000;
        let transcript;

        if (inputMode === "GCS URI (gs://...)") {
            if (!uri.startsWith("gs://")) {
                throw new OperationError("Input Mode is set to GCS URI but input does not start with gs://");
            }
            transcript = await this._transcribeGcsUri(uri, languageCode, model, maxMs);
        } else {
            // Raw audio bytes (Base64)
            transcript = await this._transcribeRawAudio(uri, languageCode, model);
        }

        if (outputDest === "Write to GCS") {
            // Derive source filename from GCS URI (or use a default for raw audio)
            const sourceFilename = inputMode === "GCS URI (gs://...)"
                ? uri.split("/").pop()
                : "raw_audio";

            const objectPath = `output/audio/${sourceFilename}/speech-to-text/text.txt`;
            const destUri = await writeGCSFile(outputBucket, objectPath, transcript);
            return destUri;
        }

        return transcript;
    }

    /**
     * Transcribes audio from a GCS URI using the longrunningrecognize API.
     *
     * @param {string} gcsUri
     * @param {string} languageCode
     * @param {string} model
     * @param {number} maxMs
     * @returns {Promise<string>}
     */
    async _transcribeGcsUri(gcsUri, languageCode, model, maxMs) {
        let url = "https://speech.googleapis.com/v1/speech:longrunningrecognize";
        const headers = new Headers();
        headers.set("Content-Type", "application/json; charset=utf-8");
        const authed = applyGCPAuth(url, headers);

        const body = JSON.stringify({
            config: {
                languageCode,
                model,
                enableAutomaticPunctuation: true,
            },
            audio: { uri: gcsUri }
        });

        const response = await fetch(authed.url, {
            method: "POST",
            headers: authed.headers,
            body,
            mode: "cors",
            cache: "no-cache"
        });

        let responseData;
        try { responseData = await response.json(); } catch (e) {
            throw new OperationError("GCloud Speech to Text: Failed to parse API response.");
        }
        if (!response.ok) {
            const msg = responseData?.error?.message || response.statusText;
            throw new OperationError(`GCloud Speech to Text: API Error (${response.status}): ${msg}`);
        }

        const operationName = responseData.name;
        if (!operationName) throw new OperationError("GCloud Speech to Text: No operation name returned from API.");

        // Poll for completion
        const POLL_URL = "https://speech.googleapis.com/v1/operations/";
        const completed = await pollLongRunningOperation(
            operationName,
            POLL_URL,
            maxMs,
            10000,
            (elapsedSec) => {
                // onProgress — not easily surfaced in CyberChef output mid-bake,
                // but available for future UI integration
                void elapsedSec;
            }
        );

        return this._extractTranscript(completed);
    }

    /**
     * Transcribes audio from raw Base64 bytes using the synchronous recognize API.
     *
     * @param {string} base64Audio
     * @param {string} languageCode
     * @param {string} model
     * @returns {Promise<string>}
     */
    async _transcribeRawAudio(base64Audio, languageCode, model) {
        let url = "https://speech.googleapis.com/v1/speech:recognize";
        const headers = new Headers();
        headers.set("Content-Type", "application/json; charset=utf-8");
        const authed = applyGCPAuth(url, headers);

        const body = JSON.stringify({
            config: {
                languageCode,
                model,
                enableAutomaticPunctuation: true,
            },
            audio: { content: base64Audio }
        });

        const response = await fetch(authed.url, {
            method: "POST",
            headers: authed.headers,
            body,
            mode: "cors",
            cache: "no-cache"
        });

        let responseData;
        try { responseData = await response.json(); } catch (e) {
            throw new OperationError("GCloud Speech to Text: Failed to parse API response.");
        }
        if (!response.ok) {
            const msg = responseData?.error?.message || response.statusText;
            throw new OperationError(`GCloud Speech to Text: API Error (${response.status}): ${msg}`);
        }

        return this._extractTranscript({ response: responseData });
    }

    /**
     * Extracts a joined transcript string from a completed LRO response or synchronous response.
     *
     * @param {Object} completed - The operation response object.
     * @returns {string} Joined transcript text.
     */
    _extractTranscript(completed) {
        const results = completed?.response?.results;
        if (!results || results.length === 0) {
            return "(No speech detected)";
        }
        return results
            .map(r => r.alternatives?.[0]?.transcript || "")
            .filter(t => t.length > 0)
            .join(" ")
            .trim();
    }

}

export default GCloudSpeechToText;
