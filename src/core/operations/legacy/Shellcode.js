import disassemble from "../vendor/DisassembleX86-64.js";


/**
 * Shellcode operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
const Shellcode = {

    /**
     * @constant
     * @default
     */
    MODE: ["64", "32", "16"],
    /**
     * @constant
     * @default
     */
    COMPATIBILITY: [
        "Full x86 architecture",
        "Knights Corner",
        "Larrabee",
        "Cyrix",
        "Geode",
        "Centaur",
        "X86/486"
    ],

    /**
     * Disassemble x86 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDisassemble: function(input, args) {
        const mode = args[0],
            compatibility = args[1],
            codeSegment = args[2],
            offset = args[3],
            showInstructionHex = args[4],
            showInstructionPos = args[5];

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
                throw "Invalid mode value";
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

        disassemble.SetBasePosition(codeSegment + ":" + offset);
        disassemble.setShowInstructionHex(showInstructionHex);
        disassemble.setShowInstructionPos(showInstructionPos);
        disassemble.LoadBinCode(input.replace(/\s/g, ""));
        return disassemble.LDisassemble();
    },

};

export default Shellcode;
