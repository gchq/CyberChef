/**
 * @author dgoldenberg [dgoldenberg@mitre.org]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { base58Decode, b58DoubleSHAChecksum} from "../lib/Bitcoin.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";


/**
 * FromBase58Check operation
 */
class FromBase58Check extends Operation {

    /**
     * FromBase58Check constructor
     */
    constructor() {
        super();

        this.name = "From Base58Check";
        this.module = "Default";
        this.description = "Decodes Base58 check encoded data. This is a version byte, data and a 4 byte checksum at the end. Many addresses, private keys and other cryptocurrency artifacts are encoded in this format.";
        this.infoURL = "https://en.bitcoin.it/Base58Check_encoding"; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Version Byte Length",
                type: "number",
                value: 1
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        // We check if input is blank.
        // If its blank or just whitespace, we don't need to bother dealing with it.

        if (input.trim().length === 0) {
            return "";
        }
        input = input.trim();
        if (b58DoubleSHAChecksum(input)) {
            const decoded = base58Decode(input);
            const versionHex = toHex(fromArrayBuffer(decoded.slice(0, args[0])));
            const checksum = toHex(fromArrayBuffer(decoded.slice(-4,)));
            const data = toHex(fromArrayBuffer(decoded.slice(args[0], -4)));
            return {
                "version": versionHex,
                "checksum": checksum,
                "data": data
            };

        } else {
            throw new OperationError("Invalid Checksum.");
        }
    }

}

export default FromBase58Check;
