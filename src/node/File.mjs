/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import { detectFileType } from "../core/lib/FileType.mjs";

/**
 * FileShim
 *
 * Create a class that behaves like the File object in the Browser so that
 * operations that use the File object still work.
 *
 * File doesn't write to disk, but it would be easy to do so with e.gfs.writeFile.
 */
class File {
    /**
     * Constructor
     *
     * https://w3c.github.io/FileAPI/#file-constructor
     *
     * @param {String|Array|ArrayBuffer|Buffer|[File]} bits - file content
     * @param {String} name (optional) - file name
     * @param {Object} stats (optional) - file stats e.g. lastModified
     */
    constructor(data, name = "", stats = {}) {
        if (!Array.isArray(data)) {
            data = [data];
        }

        const buffers = data.map((d) => {
            if (d instanceof File) {
                return Buffer.from(d.data);
            }

            if (d instanceof ArrayBuffer) {
                return Buffer.from(d);
            }

            return Buffer.from(d);
        });
        const totalLength = buffers.reduce((p, c) => p + c.length, 0);
        this.data = Buffer.concat(buffers, totalLength);

        this.name = name;
        this.lastModified = stats.lastModified || Date.now();

        const types = detectFileType(this.data);
        if (types.length) {
            this.type = types[0].mime;
        } else {
            this.type = "application/unknown";
        }
    }

    /**
     * size property
     */
    get size() {
        return this.data.length;
    }

    /**
     * Return lastModified as Date
     */
    get lastModifiedDate() {
        return new Date(this.lastModified);
    }
}

export default File;
