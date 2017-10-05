import Shellcode from "../../operations/Shellcode.js";


/**
 * Shellcode module.
 *
 * Libraries:
 *  - DisassembleX86-64.js
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.Shellcode = {
    "Disassemble x86": Shellcode.runDisassemble,
};

export default OpModules;
