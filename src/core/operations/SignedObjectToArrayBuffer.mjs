/**
 * @file Developed by {@link https://configuredthings.com Configured Things} with funding from the {@link https://www.ukri.org UKRI}
 *     {@link https://www.dsbd.tech Digital Security by Design} program.
 * @author Configured Things Ltd. <getconfigured@configuredthings.com>
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Signed Object to ArrayBuffer operation
 */
class SignedObjectToArrayBuffer extends Operation {

    /**
     * SignedJSONToArrayBuffer constructor
     */
    constructor() {
        super();

        this.name = "Signed Object to ArrayBuffer";
        this.module = "Default";
        this.description = "Converts a digitally signed object created by, for example, the 'LibHydrogen Curve25519 Sign' operation to an ArrayBuffer";
        this.infoURL = ""; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "JSON";
        this.outputType = "ArrayBuffer";
        this.args = [
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const properties = ["context", "signature", "input"];
        const output = properties.reduce((previousBytes, prop) => {
            if (!Object.hasOwn(input, prop)) {
                throw new OperationError(`Input missing '${prop}' property`);
            } else {
                const combinedBytes = new Uint8Array(previousBytes.byteLength + input[prop].byteLength);
                combinedBytes.set(previousBytes);
                combinedBytes.set(input[prop], previousBytes.byteLength);
                return combinedBytes;
            }
        }, new Uint8Array());
        return output.buffer;
    }
}

export default SignedObjectToArrayBuffer;
