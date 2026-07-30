/**
 * @author neoreo
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import cptable from "codepage";
import {toBase64, fromBase64} from "../lib/Base64.mjs";

// PowerShell -EncodedCommand uses UTF-16LE (code page 1200)
const UTF_16LE = 1200;

/**
 * PowerShell -e Encode/Decode operation
 */
class PowerShellEncodeDecode extends Operation {

    /**
     * PowerShellEncodeDecode constructor
     */
    constructor() {
        super();

        this.name = "PowerShell -e Encode/Decode";
        this.module = "Encodings";
        this.description = [
            "Encodes or decodes a PowerShell <code>-EncodedCommand</code> (<code>-e</code>) payload in a single operation.",
            "<br><br>",
            "PowerShell's <code>-EncodedCommand</code> parameter expects the command encoded as UTF-16LE and then Base64'd. ",
            "This operation combines both steps so you don't have to chain 'Encode text' and 'To Base64' (or their decode equivalents) yourself.",
            "<br><br>",
            "<b>Encode:</b> <code>whoami</code> becomes <code>dwBoAG8AYQBtAGkA</code>, runnable as <code>powershell -e dwBoAG8AYQBtAGkA</code>.",
            "<br>",
            "<b>Decode:</b> <code>dwBoAG8AYQBtAGkA</code> becomes <code>whoami</code>."
        ].join("\n");
        this.infoURL = "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe#-encodedcommand-base64encodedcommand";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Mode",
                type: "option",
                value: ["Encode", "Decode"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [mode] = args;

        if (mode === "Encode") {
            const encoded = cptable.utils.encode(UTF_16LE, input);
            return toBase64(new Uint8Array(encoded).buffer);
        }
        const bytes = fromBase64(input, "A-Za-z0-9+/=", "byteArray");
        return cptable.utils.decode(UTF_16LE, new Uint8Array(bytes));
    }

}

export default PowerShellEncodeDecode;
