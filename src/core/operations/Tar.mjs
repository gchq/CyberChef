/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Tar operation
 */
class Tar extends Operation {

    /**
     * Tar constructor
     */
    constructor() {
        super();

        this.name = "Tar";
        this.module = "Compression";
        this.description = "Packs the input into a tarball.<br><br>No support for multiple files at this time.";
        this.infoURL = "https://wikipedia.org/wiki/Tar_(computing)";
        this.inputType = "ArrayBuffer";
        this.outputType = "File";
        this.args = [
            {
                "name": "Filename",
                "type": "string",
                "value": "file.txt"
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        input = new Uint8Array(input);

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

        return new File([new Uint8Array(tarball.bytes)], args[0]);
    }

}

export default Tar;
