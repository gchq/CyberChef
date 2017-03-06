/* globals bzip2 */
var rawdeflate = require("zlibjs/bin/rawdeflate.min"),
    rawinflate = require("zlibjs/bin/rawinflate.min"),
    zlibAndGzip = require("zlibjs/bin/zlib_and_gzip.min"),
    zip = require("zlibjs/bin/zip.min"),
    unzip = require("zlibjs/bin/unzip.min");

var Zlib = {
    RawDeflate: rawdeflate.Zlib.RawDeflate,
    RawInflate: rawinflate.Zlib.RawInflate,
    Deflate: zlibAndGzip.Zlib.Deflate,
    Inflate: zlibAndGzip.Zlib.Inflate,
    Gzip: zlibAndGzip.Zlib.Gzip,
    Gunzip: zlibAndGzip.Zlib.Gunzip,
    Zip: zip.Zlib.Zip,
    Unzip: unzip.Zlib.Unzip,
};


/**
 * Compression operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Compress = module.exports = {

    /**
     * @constant
     * @default
     */
    COMPRESSION_TYPE: ["Dynamic Huffman Coding", "Fixed Huffman Coding", "None (Store)"],
    /**
     * @constant
     * @default
     */
    INFLATE_BUFFER_TYPE: ["Adaptive", "Block"],
    /**
     * @constant
     * @default
     */
    COMPRESSION_METHOD: ["Deflate", "None (Store)"],
    /**
     * @constant
     * @default
     */
    OS: ["MSDOS", "Unix", "Macintosh"],
    /**
     * @constant
     * @default
     */
    RAW_COMPRESSION_TYPE_LOOKUP: {
        "Fixed Huffman Coding"   : Zlib.RawDeflate.CompressionType.FIXED,
        "Dynamic Huffman Coding" : Zlib.RawDeflate.CompressionType.DYNAMIC,
        "None (Store)"           : Zlib.RawDeflate.CompressionType.NONE,
    },

    /**
     * Raw Deflate operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runRawDeflate: function(input, args) {
        var deflate = new Zlib.RawDeflate(input, {
            compressionType: Compress.RAW_COMPRESSION_TYPE_LOOKUP[args[0]]
        });
        return Array.prototype.slice.call(deflate.compress());
    },


    /**
     * @constant
     * @default
     */
    INFLATE_INDEX: 0,
    /**
     * @constant
     * @default
     */
    INFLATE_BUFFER_SIZE: 0,
    /**
     * @constant
     * @default
     */
    INFLATE_RESIZE: false,
    /**
     * @constant
     * @default
     */
    INFLATE_VERIFY: false,
    /**
     * @constant
     * @default
     */
    RAW_BUFFER_TYPE_LOOKUP: {
        "Adaptive" : Zlib.RawInflate.BufferType.ADAPTIVE,
        "Block"    : Zlib.RawInflate.BufferType.BLOCK,
    },

    /**
     * Raw Inflate operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runRawInflate: function(input, args) {
        // Deal with character encoding issues
        input = Utils.strToByteArray(Utils.byteArrayToUtf8(input));
        var inflate = new Zlib.RawInflate(input, {
                index: args[0],
                bufferSize: args[1],
                bufferType: Compress.RAW_BUFFER_TYPE_LOOKUP[args[2]],
                resize: args[3],
                verify: args[4]
            }),
            result = Array.prototype.slice.call(inflate.decompress());

        // Raw Inflate somethimes messes up and returns nonsense like this:
        // ]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]....]...
        // e.g. Input data of [8b, 1d, dc, 44]
        // Look for the first two square brackets:
        if (result.length > 158 && result[0] === 93 && result[5] === 93) {
            // If the first two square brackets are there, check that the others
            // are also there. If they are, throw an error. If not, continue.
            var valid = false;
            for (var i = 0; i < 155; i += 5) {
                if (result[i] !== 93) {
                    valid = true;
                }
            }

            if (!valid) {
                throw "Error: Unable to inflate data";
            }
        }
        // Trust me, this is the easiest way...
        return result;
    },


    /**
     * @constant
     * @default
     */
    ZLIB_COMPRESSION_TYPE_LOOKUP: {
        "Fixed Huffman Coding"   : Zlib.Deflate.CompressionType.FIXED,
        "Dynamic Huffman Coding" : Zlib.Deflate.CompressionType.DYNAMIC,
        "None (Store)"           : Zlib.Deflate.CompressionType.NONE,
    },

    /**
     * Zlib Deflate operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runZlibDeflate: function(input, args) {
        var deflate = new Zlib.Deflate(input, {
            compressionType: Compress.ZLIB_COMPRESSION_TYPE_LOOKUP[args[0]]
        });
        return Array.prototype.slice.call(deflate.compress());
    },


    /**
     * @constant
     * @default
     */
    ZLIB_BUFFER_TYPE_LOOKUP: {
        "Adaptive" : Zlib.Inflate.BufferType.ADAPTIVE,
        "Block"    : Zlib.Inflate.BufferType.BLOCK,
    },

    /**
     * Zlib Inflate operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runZlibInflate: function(input, args) {
        // Deal with character encoding issues
        input = Utils.strToByteArray(Utils.byteArrayToUtf8(input));
        var inflate = new Zlib.Inflate(input, {
            index: args[0],
            bufferSize: args[1],
            bufferType: Compress.ZLIB_BUFFER_TYPE_LOOKUP[args[2]],
            resize: args[3],
            verify: args[4]
        });
        return Array.prototype.slice.call(inflate.decompress());
    },


    /**
     * @constant
     * @default
     */
    GZIP_CHECKSUM: false,

    /**
     * Gzip operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runGzip: function(input, args) {
        var filename = args[1],
            comment = args[2],
            options = {
                deflateOptions: {
                    compressionType: Compress.ZLIB_COMPRESSION_TYPE_LOOKUP[args[0]]
                },
                flags: {
                    fhcrc: args[3]
                }
            };

        if (filename.length) {
            options.flags.fname = true;
            options.filename = filename;
        }
        if (comment.length) {
            options.flags.fcommenct = true;
            options.comment = comment;
        }

        var gzip = new Zlib.Gzip(input, options);
        return Array.prototype.slice.call(gzip.compress());
    },


    /**
     * Gunzip operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runGunzip: function(input, args) {
        // Deal with character encoding issues
        input = Utils.strToByteArray(Utils.byteArrayToUtf8(input));
        var gunzip = new Zlib.Gunzip(input);
        return Array.prototype.slice.call(gunzip.decompress());
    },


    /**
     * @constant
     * @default
     */
    PKZIP_FILENAME: "file.txt",
    /**
     * @constant
     * @default
     */
    ZIP_COMPRESSION_METHOD_LOOKUP: {
        "Deflate"      : Zlib.Zip.CompressionMethod.DEFLATE,
        "None (Store)" : Zlib.Zip.CompressionMethod.STORE
    },
    /**
     * @constant
     * @default
     */
    ZIP_OS_LOOKUP: {
        "MSDOS"     : Zlib.Zip.OperatingSystem.MSDOS,
        "Unix"      : Zlib.Zip.OperatingSystem.UNIX,
        "Macintosh" : Zlib.Zip.OperatingSystem.MACINTOSH
    },

    /**
     * Zip operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runPkzip: function(input, args) {
        var password = Utils.strToByteArray(args[2]),
            options = {
                filename: Utils.strToByteArray(args[0]),
                comment: Utils.strToByteArray(args[1]),
                compressionMethod: Compress.ZIP_COMPRESSION_METHOD_LOOKUP[args[3]],
                os: Compress.ZIP_OS_LOOKUP[args[4]],
                deflateOption: {
                    compressionType: Compress.ZLIB_COMPRESSION_TYPE_LOOKUP[args[5]]
                },
            },
            zip = new Zlib.Zip();

        if (password.length)
            zip.setPassword(password);
        zip.addFile(input, options);
        return Array.prototype.slice.call(zip.compress());
    },


    /**
     * @constant
     * @default
     */
    PKUNZIP_VERIFY: false,

    /**
     * Unzip operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runPkunzip: function(input, args) {
        var options = {
                password: Utils.strToByteArray(args[0]),
                verify: args[1]
            },
            unzip = new Zlib.Unzip(input, options),
            filenames = unzip.getFilenames(),
            files = [];

        filenames.forEach(function(fileName) {
            var contents = unzip.decompress(fileName);

            contents = Utils.byteArrayToUtf8(contents);

            var file = {
                fileName: fileName,
                size: contents.length,
            };

            var isDir = contents.length === 0 && fileName.endsWith("/");
            if (!isDir) {
                file.contents = contents;
            }

            files.push(file);
        });

        return Utils.displayFilesAsHTML(files);
    },


    /**
     * Bzip2 Decompress operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runBzip2Decompress: function(input, args) {
        var compressed = new Uint8Array(input),
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
        var Tarball = function() {
            this.bytes = new Array(512);
            this.position = 0;
        };

        Tarball.prototype.addEmptyBlock = function() {
            var filler = new Array(512);
            filler.fill(0);
            this.bytes = this.bytes.concat(filler);
        };

        Tarball.prototype.writeBytes = function(bytes) {
            var self = this;

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
            var numEmptyBlocks = 2;
            for (var i = 0; i < numEmptyBlocks; i++) {
                this.addEmptyBlock();
            }
        };

        var fileSize = Utils.padLeft(input.length.toString(8), 11, "0");
        var currentUnixTimestamp = Math.floor(Date.now() / 1000);
        var lastModTime = Utils.padLeft(currentUnixTimestamp.toString(8), 11, "0");

        var file = {
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

        var checksum = 0;
        for (var key in file) {
            var bytes = file[key];
            Array.prototype.forEach.call(bytes, function(b) {
                if (typeof b.charCodeAt !== "undefined") {
                    checksum += b.charCodeAt();
                } else {
                    checksum += b;
                }
            });
        }
        checksum = Utils.padBytesRight(Utils.padLeft(checksum.toString(8), 7, "0"), 8);
        file.checksum = checksum;

        var tarball = new Tarball();
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
        var Stream = function(input) {
            this.bytes = input;
            this.position = 0;
        };

        Stream.prototype.readString = function(numBytes) {
            var result = "";
            for (var i = this.position; i < this.position + numBytes; i++) {
                var currentByte = this.bytes[i];
                if (currentByte === 0) break;
                result += String.fromCharCode(currentByte);
            }
            this.position += numBytes;
            return result;
        };

        Stream.prototype.readInt = function(numBytes, base) {
            var string = this.readString(numBytes);
            return parseInt(string, base);
        };

        Stream.prototype.hasMore = function() {
            return this.position < this.bytes.length;
        };

        var stream = new Stream(input),
            files = [];

        while (stream.hasMore()) {
            var dataPosition = stream.position + 512;

            var file = {
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
                var endPosition = stream.position + file.size;
                if (file.size % 512 !== 0) {
                    endPosition += 512 - (file.size % 512);
                }

                file.contents = "";

                while (stream.position < endPosition) {
                    file.contents += stream.readString(512);
                }
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
