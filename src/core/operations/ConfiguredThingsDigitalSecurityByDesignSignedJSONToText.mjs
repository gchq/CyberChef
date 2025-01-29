/**
 * @author Configured Things Ltd. [getconfigured@configuredthings.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Configured Things - Digital Security by Design - Signed JSON to Text operation
 */
class ConfiguredThingsDigitalSecurityByDesignSignedJSONToText extends Operation {

    /**
     * ConfiguredThingsDigitalSecurityByDesignSignedJSONToText constructor
     */
    constructor() {
        super();

        this.name = "Configured Things - Digital Security by Design - LibHydrogen Signed JSON to Text";
        this.module = "Default";
        this.description = "Converts signed JSON to text";
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

export default ConfiguredThingsDigitalSecurityByDesignSignedJSONToText;
