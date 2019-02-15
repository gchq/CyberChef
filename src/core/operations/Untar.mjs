/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";

/**
 * Untar operation
 */
class Untar extends Operation {

    /**
     * Untar constructor
     */
    constructor() {
        super();

        this.name = "Untar";
        this.module = "Compression";
        this.description = "Unpacks a tarball and displays it per file.";
        this.infoURL = "https://wikipedia.org/wiki/Tar_(computing)";
        this.inputType = "byteArray";
        this.outputType = "List<File>";
        this.presentType = "html";
        this.args = [];
        this.patterns = [
            {
                "match": "^.{257}\\x75\\x73\\x74\\x61\\x72",
                "flags": "",
                "args": []
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {List<File>}
     */
    run(input, args) {
        const Stream = function(input) {
            this.bytes = input;
            this.position = 0;
        };

        Stream.prototype.getBytes = function(bytesToGet) {
            const newPosition = this.position + bytesToGet;
            const bytes = this.bytes.slice(this.position, newPosition);
            this.position = newPosition;
            return bytes;
        };

        Stream.prototype.readString = function(numBytes) {
            let result = "";
            for (let i = this.position; i < this.position + numBytes; i++) {
                const currentByte = this.bytes[i];
                if (currentByte === 0) break;
                result += String.fromCharCode(currentByte);
            }
            this.position += numBytes;
            return result;
        };

        Stream.prototype.readInt = function(numBytes, base) {
            const string = this.readString(numBytes);
            return parseInt(string, base);
        };

        Stream.prototype.hasMore = function() {
            return this.position < this.bytes.length;
        };

        const stream = new Stream(input),
            files = [];

        while (stream.hasMore()) {
            const dataPosition = stream.position + 512;

            const file = {
                fileName: stream.readString(100),
                fileMode: stream.readString(8),
                ownerUID: stream.readString(8),
                ownerGID: stream.readString(8),
                size: parseInt(stream.readString(12), 8), // Octal
                lastModTime: new Date(1000 * stream.readInt(12, 8)), // Octal
                checksum: stream.readString(8),
                type: stream.readString(1),
                linkedFileName: stream.readString(100),
                USTARFormat: stream.readString(6).indexOf("ustar") >= 0,
            };

            if (file.USTARFormat) {
                file.version = stream.readString(2);
                file.ownerUserName = stream.readString(32);
                file.ownerGroupName = stream.readString(32);
                file.deviceMajor = stream.readString(8);
                file.deviceMinor = stream.readString(8);
                file.filenamePrefix = stream.readString(155);
            }

            stream.position = dataPosition;

            if (file.type === "0") {
                // File
                let endPosition = stream.position + file.size;
                if (file.size % 512 !== 0) {
                    endPosition += 512 - (file.size % 512);
                }

                file.bytes = stream.getBytes(file.size);
                files.push(new File([new Uint8Array(file.bytes)], file.fileName));
                stream.position = endPosition;
            } else if (file.type === "5") {
                // Directory
                files.push(new File([new Uint8Array(file.bytes)], file.fileName));
            } else {
                // Symlink or empty bytes
            }
        }

        return files;
    }

    /**
     * Displays the files in HTML for web apps.
     *
     * @param {File[]} files
     * @returns {html}
     */
    async present(files) {
        return await Utils.displayFilesAsHTML(files);
    }

}

export default Untar;
