/* globals Zlib, bzip2 */

/**
 * Compression operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Compress = {

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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_raw_deflate: function(input, args) {
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
        "Adaptive"  : Zlib.RawInflate.BufferType.ADAPTIVE,
        "Block"     : Zlib.RawInflate.BufferType.BLOCK,
    },
    
    /**
     * Raw Inflate operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_raw_inflate: function(input, args) {
        // Deal with character encoding issues
        input = Utils.str_to_byte_array(Utils.byte_array_to_utf8(input));
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_zlib_deflate: function(input, args) {
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_zlib_inflate: function(input, args) {
        // Deal with character encoding issues
        input = Utils.str_to_byte_array(Utils.byte_array_to_utf8(input));
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_gzip: function(input, args) {
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_gunzip: function(input, args) {
        // Deal with character encoding issues
        input = Utils.str_to_byte_array(Utils.byte_array_to_utf8(input));
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_pkzip: function(input, args) {
        var password = Utils.str_to_byte_array(args[2]),
            options = {
                filename: Utils.str_to_byte_array(args[0]),
                comment: Utils.str_to_byte_array(args[1]),
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_pkunzip: function(input, args) {
        var options = {
                password: Utils.str_to_byte_array(args[0]),
                verify: args[1]
            },
            file = "",
            unzip = new Zlib.Unzip(input, options),
            filenames = unzip.getFilenames(),
            output = "<div style='padding: 5px;'>" + filenames.length + " file(s) found</div>\n";
            
        output += "<div class='panel-group' id='zip-accordion' role='tablist' aria-multiselectable='true'>";
        
        window.uzip = unzip;
        for (var i = 0; i < filenames.length; i++) {
            file = Utils.byte_array_to_utf8(unzip.decompress(filenames[i]));
            output += "<div class='panel panel-default'>" +
                "<div class='panel-heading' role='tab' id='heading" + i + "'>" +
                "<h4 class='panel-title'>" +
                "<a class='collapsed' role='button' data-toggle='collapse' data-parent='#zip-accordion' href='#collapse" + i +
                "' aria-expanded='true' aria-controls='collapse" + i + "'>" +
                filenames[i] + "<span class='pull-right'>" + file.length.toLocaleString() + " bytes</span></a></h4></div>" +
                "<div id='collapse" + i + "' class='panel-collapse collapse' role='tabpanel' aria-labelledby='heading" + i + "'>" +
                "<div class='panel-body'>" +
                Utils.escape_html(file) + "</div></div></div>";
        }
        
        return output + "</div>";
    },
    
    
    /**
     * Bzip2 Decompress operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_bzip2_decompress: function(input, args) {
        var compressed = new Uint8Array(input),
            bzip2_reader,
            plain = "";
            
        bzip2_reader = bzip2.array(compressed);
        plain = bzip2.simple(bzip2_reader);
        return plain;
    },
    
};
