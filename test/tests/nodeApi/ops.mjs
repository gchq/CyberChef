/* eslint no-console: 0 */

/**
 * nodeApi.js
 *
 * Test node api operations
 *
 * Aim of these tests is to ensure each arg type is
 * handled correctly by the wrapper.
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import assert from "assert";
import it from "../assertionHandler";

import {
    ADD,
    addLineNumbers,
    adler32Checksum,
    AESDecrypt,
    affineCipherDecode,
    affineCipherEncode,
    bifidCipherEncode,
    bitShiftRight,
    cartesianProduct,
    CSSMinify,
    toBase64,
} from "../../../src/node/index";
import TestRegister from "../../TestRegister";

TestRegister.addApiTests([

    it("ADD: toggleString argument", () => {
        const result = ADD("sample input", {
            key: {
                string: "some key",
                option: "Hex"
            }
        });
        assert.equal(result.toString(), "aO[^ZS\u000eW\\^cb");
    }),

    it("addLineNumbers: No arguments", () => {
        const result = addLineNumbers("sample input");
        assert.equal(result.toString(), "1 sample input");
    }),

    it("adler32Checksum: No args", () => {
        const result = adler32Checksum("sample input");
        assert.equal(result.toString(), "1f2304d3");
    }),

    it("AES decrypt: toggleString and option", () => {
        const result = AESDecrypt("812c34ae6af353244a63c6ce23b7c34286b60be28ea4645523d4494700e7", {
            key: {
                string: "some longer key1",
                option: "utf8",
            },
            iv: {
                string: "some iv",
                option: "utf8",
            },
            mode: "OFB",
        });
        assert.equal(result.toString(), "a slightly longer sampleinput?");
    }),

    it("AffineCipherDecode: number input", () => {
        const result = affineCipherDecode("some input", {
            a: 7,
            b: 4
        });
        assert.strictEqual(result.toString(), "cuqa ifjgr");
    }),

    it("affineCipherEncode: number input", () => {
        const result = affineCipherEncode("some input", {
            a: 11,
            b: 6
        });
        assert.strictEqual(result.toString(), "weiy qtpsh");
    }),

    it("bifid cipher encode: string option", () => {
        const result = bifidCipherEncode("some input", {
            keyword: "mykeyword",
        });
        assert.strictEqual(result.toString(), "nmhs zmsdo");
    }),

    it("bitShiftRight: number and option", () => {
        const result = bitShiftRight("some bits to shift", {
            type: "Arithmetic shift",
            amount: 1,
        });
        assert.strictEqual(result.toString(), "9762\u001014:9\u0010:7\u00109443:");
    }),

    it("cartesianProduct: binary string", () => {
        const result = cartesianProduct("1:2\\n\\n3:4", {
            itemDelimiter: ":",
        });
        assert.strictEqual(result.toString(), "(1,3):(1,4):(2,3):(2,4)");
    }),

    it("CSS minify: boolean", () => {
        const input = `header {
// comment
width: 100%;
color: white;
}`;
        const result = CSSMinify(input, {
            preserveComments: true,
        });
        assert.strictEqual(result.toString(), "header {// comment width: 100%;color: white;}");
    }),

    it("toBase64: editableOption", () => {
        const result = toBase64("some input", {
            alphabet: {
                value: "0-9A-W"
            },
        });
        assert.strictEqual(result.toString(), "SPI1R1T0");
    }),

    it("toBase64: editableOptions key is value", () => {
        const result = toBase64("some input", {
            alphabet: "0-9A-W",
        });
        assert.strictEqual(result.toString(), "SPI1R1T0");
    })


]);

