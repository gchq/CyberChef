/**
 * @author marx314 [shc_gchq@maubry.ca]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
import RawInflate from "./RawInflate.mjs";
import JSONBeautify from "./JSONBeautify.mjs";
import {fromBase64} from "../lib/Base64.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * From SHC operation
 */
class FromSHC extends Operation {
    /**
     * FromSHC constructor
     */
    constructor() {
        super();
        this.name = "From SHC";
        this.module = "Default";
        this.description = "Smart Health Card reader";
        this.infoURL = "https://github.com/smart-on-fhir/health-cards/blob/main/docs/index.md";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Include header and signature",
                type: "boolean",
                value: false
            }
        ];

    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let jws = input
            .match(/^shc:\/(.+)$/)[1]
            .match(/(..?)/g)
            .map((num) => String.fromCharCode(parseInt(num, 10) + 45))
            .join("");
        let header = fromBase64(jws.split(".")[0], "A-Za-z0-9-_");
        let payload = fromBase64(jws.split(".")[1], "A-Za-z0-9-_", "byteArray");
        let decompressPayload = this.rawInflate(payload);

        let output = decompressPayload;
        if (args[0]) {
            output = '{"header": ' + finalHeader + ',\
                        "payload":'  +  decompressPayload  +  ',\
                        "signature":"' + jws.split(".")[2] + '"\
                        }';
        }

        return (new JSONBeautify).run(output,["  ", false]);
    }

    /**
     * @param {string} input
     * @returns {string}
     */
     rawInflate(input) {
        return Utils.arrayBufferToStr((new RawInflate()).run(input, [0, 0, "Adaptive", false, false]))
    }
}

export default FromSHC;
