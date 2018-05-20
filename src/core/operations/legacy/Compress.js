import Utils from "../Utils.js";
import bzip2 from "exports-loader?bzip2!../vendor/bzip2.js";


/**
 * Compression operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Compress = {

    /**
     * Bzip2 Decompress operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runBzip2Decompress: function(input, args) {
        let compressed = new Uint8Array(input),
            bzip2Reader,
            plain = "";

        bzip2Reader = bzip2.array(compressed);
        plain = bzip2.simple(bzip2Reader);
        return plain;
    },


    /**
     * @constant
     * @default
     */
    TAR_FILENAME: "file.txt",


    /**
     * Tar pack operation.
     *
     * @author tlwr [toby@toby.codes]
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runTar: function(input, args) {
        const Tarball = function() {
            this.bytes = new Array(512);
            this.position = 0;
        };

        Tarball.prototype.addEmptyBlock = function() {
            const filler = new Array(512);
            filler.fill(0);
            this.bytes = this.bytes.concat(filler);
        };

        Tarball.prototype.writeBytes = function(bytes) {
            const self = this;

            if (this.position + bytes.length > this.bytes.length) {
                this.addEmptyBlock();
            }

            Array.prototype.forEach.call(bytes, function(b, i) {
                if (typeof b.charCodeAt !== "undefined") {
                    b = b.charCodeAt();
                }

                self.bytes[self.position] = b;
                self.position += 1;
            });
        };

        Tarball.prototype.writeEndBlocks = function() {
            const numEmptyBlocks = 2;
            for (let i = 0; i < numEmptyBlocks; i++) {
                this.addEmptyBlock();
            }
        };

        const fileSize = input.length.toString(8).padStart(11, "0");
        const currentUnixTimestamp = Math.floor(Date.now() / 1000);
        const lastModTime = currentUnixTimestamp.toString(8).padStart(11, "0");

        const file = {
            fileName: Utils.padBytesRight(args[0], 100),
            fileMode: Utils.padBytesRight("0000664", 8),
            ownerUID: Utils.padBytesRight("0", 8),
            ownerGID: Utils.padBytesRight("0", 8),
            size: Utils.padBytesRight(fileSize, 12),
            lastModTime: Utils.padBytesRight(lastModTime, 12),
            checksum: "        ",
            type: "0",
            linkedFileName: Utils.padBytesRight("", 100),
            USTARFormat: Utils.padBytesRight("ustar", 6),
            version: "00",
            ownerUserName: Utils.padBytesRight("", 32),
            ownerGroupName: Utils.padBytesRight("", 32),
            deviceMajor: Utils.padBytesRight("", 8),
            deviceMinor: Utils.padBytesRight("", 8),
            fileNamePrefix: Utils.padBytesRight("", 155),
        };

        let checksum = 0;
        for (const key in file) {
            const bytes = file[key];
            Array.prototype.forEach.call(bytes, function(b) {
                if (typeof b.charCodeAt !== "undefined") {
                    checksum += b.charCodeAt();
                } else {
                    checksum += b;
                }
            });
        }
        checksum = Utils.padBytesRight(checksum.toString(8).padStart(7, "0"), 8);
        file.checksum = checksum;

        const tarball = new Tarball();
        tarball.writeBytes(file.fileName);
        tarball.writeBytes(file.fileMode);
        tarball.writeBytes(file.ownerUID);
        tarball.writeBytes(file.ownerGID);
        tarball.writeBytes(file.size);
        tarball.writeBytes(file.lastModTime);
        tarball.writeBytes(file.checksum);
        tarball.writeBytes(file.type);
        tarball.writeBytes(file.linkedFileName);
        tarball.writeBytes(file.USTARFormat);
        tarball.writeBytes(file.version);
        tarball.writeBytes(file.ownerUserName);
        tarball.writeBytes(file.ownerGroupName);
        tarball.writeBytes(file.deviceMajor);
        tarball.writeBytes(file.deviceMinor);
        tarball.writeBytes(file.fileNamePrefix);
        tarball.writeBytes(Utils.padBytesRight("", 12));
        tarball.writeBytes(input);
        tarball.writeEndBlocks();

        return tarball.bytes;
    },


    /**
     * Untar unpack operation.
     *
     * @author tlwr [toby@toby.codes]
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    runUntar: function(input, args) {
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

        let stream = new Stream(input),
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
                files.push(file);
                let endPosition = stream.position + file.size;
                if (file.size % 512 !== 0) {
                    endPosition += 512 - (file.size % 512);
                }

                file.bytes = stream.getBytes(file.size);
                file.contents = Utils.byteArrayToUtf8(file.bytes);
                stream.position = endPosition;
            } else if (file.type === "5") {
                // Directory
                files.push(file);
            } else {
                // Symlink or empty bytes
            }
        }

        return Utils.displayFilesAsHTML(files);
    },
};

export default Compress;
