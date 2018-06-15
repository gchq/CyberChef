/* eslint no-console: 0 */

/**
 * nodeApi.js
 *
 * Test node api operations
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import assert from "assert";
import it from "../assertionHandler";
import Utils from "../../../src/core/Utils";
// import chef from "../../../src/node/index";
// import OperationError from "../../../src/core/errors/OperationError";
// import SyncDish from "../../../src/node/SyncDish";

import {
    ADD,
    addLineNumbers,
    adler32Checksum,
    AESDecrypt,
    AESEncrypt,
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

    it("AES encrypt: toggleString and options", () => {
        const result = AESEncrypt("something", {
            key: {
                string: "a key that is long enuff",
                option: "utf8",
            },
            iv: {
                string: "another iv",
                option: "utf8",
            },
            mode: "ECB",
            output: "Raw",
        });

        assert.equal(result.toString(), "Ä)\u0005DSa;F£nÐ");
    })
]);

