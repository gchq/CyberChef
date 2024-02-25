/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import "reflect-metadata"; // Required as a shim for the amf library
import { AMF0, AMF3 } from "@astronautlabs/amf";

/**
 * AMF Encode operation
 */
class AMFEncode extends Operation {
    /**
     * AMFEncode constructor
     */
    constructor() {
        super();

        this.name = "AMF Encode";
        this.module = "Encodings";
        this.description =
            "Action Message Format (AMF) is a binary format used to serialize object graphs such as ActionScript objects and XML, or send messages between an Adobe Flash client and a remote service, usually a Flash Media Server or third party alternatives.";
        this.infoURL = "https://wikipedia.org/wiki/Action_Message_Format";
        this.inputType = "JSON";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Format",
                type: "option",
                value: ["AMF0", "AMF3"],
                defaultIndex: 1,
            },
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const [format] = args;
        const handler = format === "AMF0" ? AMF0 : AMF3;
        const output = handler.Value.any(input).serialize();
        return output.buffer;
    }
}

export default AMFEncode;
