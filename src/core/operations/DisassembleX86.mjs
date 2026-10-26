/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import * as disassemble from "../vendor/DisassembleX86-64.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Parses a hexadecimal address value used by the disassembler.
 *
 * The underlying disassembler interprets both the code segment and the offset as
 * hexadecimal, and renders them back as hexadecimal, so these arguments accept the
 * common ways of writing a hex literal: bare (`ABC`), prefixed (`0xABC`) or suffixed
 * (`ABCh`).
 *
 * @param {string} value
 * @param {string} name - Argument name, used in the error message.
 * @param {number} [padTo=0] - Left-pad the result with zeroes to this many digits.
 * @returns {string} The bare hex digits, ready to be passed to SetBasePosition.
 *
 * @throws {OperationError} if the value is not a valid hexadecimal number.
 */
function parseHexAddress(value, name, padTo = 0) {
    const trimmed = value.toString().trim();
    const hex = trimmed.replace(/^0x/i, "").replace(/h$/i, "");

    if (hex === "" || !/^[\da-f]+$/i.test(hex)) {
        throw new OperationError(`Invalid ${name}: '${trimmed}' is not a hexadecimal number.`);
    }

    // SetBasePosition reads the code segment from the last four characters it is given,
    // so shorter values must be padded to avoid losing their leading digits.
    return hex.padStart(padTo, "0");
}

/**
 * Disassemble x86 operation
 */
class DisassembleX86 extends Operation {

    /**
     * DisassembleX86 constructor
     */
    constructor() {
        super();

        this.name = "Disassemble x86";
        this.module = "Shellcode";
        this.description = "Disassembly is the process of translating machine language into assembly language.<br><br>This operation supports 64-bit, 32-bit and 16-bit code written for Intel or AMD x86 processors. It is particularly useful for reverse engineering shellcode.<br><br>Input should be in hexadecimal.";
        this.infoURL = "https://wikipedia.org/wiki/X86";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Bit mode",
                "type": "option",
                "value": ["64", "32", "16"]
            },
            {
                "name": "Compatibility",
                "type": "option",
                "value": [
                    "Full x86 architecture",
                    "Knights Corner",
                    "Larrabee",
                    "Cyrix",
                    "Geode",
                    "Centaur",
                    "X86/486"
                ]
            },
            {
                "name": "Code Segment (CS)",
                "type": "string",
                "value": "16",
                "hint": "Hexadecimal, e.g. 16, 0xABC or ABCh"
            },
            {
                "name": "Offset (IP)",
                "type": "string",
                "value": "0",
                "hint": "Hexadecimal, e.g. 0, 0x1000 or 1000h"
            },
            {
                "name": "Show instruction hex",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Show instruction position",
                "type": "boolean",
                "value": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if invalid mode value
     */
    run(input, args) {
        const [
            mode,
            compatibility,
            codeSegment,
            offset,
            showInstructionHex,
            showInstructionPos
        ] = args;

        switch (mode) {
            case "64":
                disassemble.setBitMode(2);
                break;
            case "32":
                disassemble.setBitMode(1);
                break;
            case "16":
                disassemble.setBitMode(0);
                break;
            default:
                throw new OperationError("Invalid mode value");
        }

        switch (compatibility) {
            case "Full x86 architecture":
                disassemble.CompatibilityMode(0);
                break;
            case "Knights Corner":
                disassemble.CompatibilityMode(1);
                break;
            case "Larrabee":
                disassemble.CompatibilityMode(2);
                break;
            case "Cyrix":
                disassemble.CompatibilityMode(3);
                break;
            case "Geode":
                disassemble.CompatibilityMode(4);
                break;
            case "Centaur":
                disassemble.CompatibilityMode(5);
                break;
            case "X86/486":
                disassemble.CompatibilityMode(6);
                break;
        }

        disassemble.SetBasePosition(
            parseHexAddress(codeSegment, "Code Segment (CS)", 4) + ":" +
            parseHexAddress(offset, "Offset (IP)")
        );
        disassemble.setShowInstructionHex(showInstructionHex);
        disassemble.setShowInstructionPos(showInstructionPos);
        disassemble.LoadBinCode(input.replace(/\s/g, ""));
        return disassemble.LDisassemble();
    }

}

export default DisassembleX86;
