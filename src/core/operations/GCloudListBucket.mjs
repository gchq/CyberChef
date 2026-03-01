/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { listGCSBucket } from "../lib/GoogleCloud.mjs";

/**
 * GCloud List Bucket operation
 */
class GCloudListBucket extends Operation {

    /**
     * GCloudListBucket constructor
     */
    constructor() {
        super();

        this.name = "GCloud List Bucket";
        this.module = "Cloud";
        this.description = [
            "Lists objects in a Google Cloud Storage bucket and returns their <code>gs://</code> URIs.",
            "<br><br>",
            "The output is one URI per line, making it suitable for piping directly into a <b>Fork</b> operation ",
            "to batch-process multiple files (e.g. transcribing all audio files in a folder).",
            "<br><br>",
            "Input can be just a bucket name (e.g. <code>cyber-chef-cloud-examples</code>) or a full ",
            "<code>gs://</code> URI prefix.",
        ].join("\n");
        this.infoURL = "https://cloud.google.com/storage/docs/json_api/v1/objects/list";
        this.inputType = "string";
        this.outputType = "string";
        this.manualBake = true;
        this.args = [
            {
                "name": "Folder Prefix",
                "type": "string",
                "value": "audio/"
            },
            {
                "name": "Output Format",
                "type": "option",
                "value": ["GCS URIs (one per line)", "Filenames only", "JSON"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [prefix, outputFormat] = args;

        if (!input || !input.trim()) throw new OperationError("Please provide a GCS bucket name.");

        // Normalise: strip gs:// if present, strip trailing slash
        let bucket = input.trim().replace(/^gs:\/\//, "").split("/")[0];

        try {
            const items = await listGCSBucket(bucket, prefix);

            if (items.length === 0) {
                return `No objects found in gs://${bucket}/${prefix || ""}`;
            }

            switch (outputFormat) {
                case "Filenames only":
                    return items.map(i => i.name.split("/").pop()).join("\n");
                case "JSON":
                    return JSON.stringify(items, null, 2);
                case "GCS URIs (one per line)":
                default:
                    return items.map(i => i.gs_uri).join("\n");
            }
        } catch (e) {
            if (e.name === "OperationError") throw e;
            throw new OperationError(e.message || e.toString());
        }
    }

}

export default GCloudListBucket;
