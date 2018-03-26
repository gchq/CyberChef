import cptable from "../vendor/js-codepage/cptable.js";


/**
 * Character encoding operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const CharEnc = {

    /**
     * @constant
     * @default
     */
    IO_FORMAT: {
        "UTF-8 (65001)": 65001,
        "UTF-7 (65000)": 65000,
        "UTF16LE (1200)": 1200,
        "UTF16BE (1201)": 1201,
        "UTF16 (1201)": 1201,
        "IBM EBCDIC International (500)": 500,
        "IBM EBCDIC US-Canada (37)": 37,
        "Windows-874 Thai (874)": 874,
        "Japanese Shift-JIS (932)": 932,
        "Simplified Chinese GBK (936)": 936,
        "Korean (949)": 949,
        "Traditional Chinese Big5 (950)": 950,
        "Windows-1250 Central European (1250)": 1250,
        "Windows-1251 Cyrillic (1251)": 1251,
        "Windows-1252 Latin (1252)": 1252,
        "Windows-1253 Greek (1253)": 1253,
        "Windows-1254 Turkish (1254)": 1254,
        "Windows-1255 Hebrew (1255)": 1255,
        "Windows-1256 Arabic (1256)": 1256,
        "Windows-1257 Baltic (1257)": 1257,
        "Windows-1258 Vietnam (1258)": 1258,
        "US-ASCII (20127)": 20127,
        "Simplified Chinese GB2312 (20936)": 20936,
        "KOI8-R Russian Cyrillic (20866)": 20866,
        "KOI8-U Ukrainian Cyrillic (21866)": 21866,
        "ISO-8859-1 Latin 1 Western European (28591)": 28591,
        "ISO-8859-2 Latin 2 Central European (28592)": 28592,
        "ISO-8859-3 Latin 3 South European (28593)": 28593,
        "ISO-8859-4 Latin 4 North European (28594)": 28594,
        "ISO-8859-5 Latin/Cyrillic (28595)": 28595,
        "ISO-8859-6 Latin/Arabic (28596)": 28596,
        "ISO-8859-7 Latin/Greek (28597)": 28597,
        "ISO-8859-8 Latin/Hebrew (28598)": 28598,
        "ISO-8859-9 Latin 5 Turkish (28599)": 28599,
        "ISO-8859-10 Latin 6 Nordic (28600)": 28600,
        "ISO-8859-11 Latin/Thai (28601)": 28601,
        "ISO-8859-13 Latin 7 Baltic Rim (28603)": 28603,
        "ISO-8859-14 Latin 8 Celtic (28604)": 28604,
        "ISO-8859-15 Latin 9 (28605)": 28605,
        "ISO-8859-16 Latin 10 (28606)": 28606,
        "ISO-2022 JIS Japanese (50222)": 50222,
        "EUC Japanese (51932)": 51932,
        "EUC Korean (51949)": 51949,
        "Simplified Chinese GB18030 (54936)": 54936,
    },

    /**
     * Encode text operation.
     * @author tlwr [toby@toby.codes]
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runEncode: function(input, args) {
        const format = CharEnc.IO_FORMAT[args[0]];
        let encoded = cptable.utils.encode(format, input);
        encoded = Array.from(encoded);
        return encoded;
    },


    /**
     * Decode text operation.
     * @author tlwr [toby@toby.codes]
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDecode: function(input, args) {
        const format = CharEnc.IO_FORMAT[args[0]];
        let decoded = cptable.utils.decode(format, input);
        return decoded;
    },
};

export default CharEnc;
