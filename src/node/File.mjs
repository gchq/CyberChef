/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import mime from "mime";

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
     * @param {String|Array|ArrayBuffer|Buffer} bits - file content
     * @param {String} name (optional) - file name
     * @param {Object} stats (optional) - file stats e.g. lastModified
     */
    constructor(data, name="", stats={}) {
        this.data = Buffer.from(data);
        this.name = name;
        this.lastModified = stats.lastModified || Date.now();
        this.type = stats.type || mime.getType(this.name);
    }

    /**
     * size property
     */
    get size() {
        return this.data.length;
    }
}

export default File;
