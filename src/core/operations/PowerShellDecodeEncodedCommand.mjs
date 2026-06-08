/**
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {fromBase64} from "../lib/Base64.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * PowerShell Decode EncodedCommand operation
 */
class PowerShellDecodeEncodedCommand extends Operation {

    constructor() {
        super();

        this.name = "PowerShell Decode EncodedCommand";
        this.module = "Default";
        this.description = "Decodes a PowerShell <code>-EncodedCommand</code> payload. The encoded command is a Base64-encoded, UTF-16LE string. Accepts the raw Base64 value, a flag-prefixed form (<code>-enc &lt;b64&gt;</code>), or a full invocation (<code>powershell.exe -w hidden -enc &lt;b64&gt;</code>).<br><br><b>Example</b><br>Input: <code>-enc SQBFAFgA</code><br>Output: <code>IEX</code>";
        this.infoURL = "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                pattern: "-e(?:n(?:c(?:o(?:d(?:e(?:d(?:c(?:o(?:m(?:m(?:and?)?)?)?)?)?)?)?)?)?)?)?\\s+[A-Za-z0-9+/]+=*\\s*$",
                flags: "i",
                args: []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // The Base64 payload is always the last whitespace-separated token.
        // This cleanly handles all input forms:
        //   "SQBFAFgA"
        //   "-enc SQBFAFgA"
        //   "powershell.exe -w 1 -nop -ep bypass -enc SQBFAFgA"
        const b64 = input.trim().split(/\s+/).pop().replace(/^["']|["']$/g, "");

        if (!b64) throw new OperationError("No input provided.");

        const bytes = fromBase64(b64, null, "byteArray");

        if (bytes.length < 2) throw new OperationError("Decoded data too short to be a valid UTF-16LE string.");
        if (bytes.length % 2 !== 0) throw new OperationError("Decoded byte length is odd — not valid UTF-16LE.");

        // Decode UTF-16LE: each character is two bytes, little-endian
        let result = "";
        for (let i = 0; i + 1 < bytes.length; i += 2) {
            result += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
        }

        return result;
    }

}

export default PowerShellDecodeEncodedCommand;
