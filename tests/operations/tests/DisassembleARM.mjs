/**
 * Disassemble ARM tests.
 * @author MedjedThomasXM
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Disassemble ARM: ARM32 basic - MOV instruction",
        input: "0000a0e3",
        expectedOutput: "0x00000000  0000a0e3          mov r0, #0",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true]
            }
        ],
    },
    {
        name: "Disassemble ARM: ARM32 - Multiple instructions",
        input: "04e02de5 00d04be2",
        expectedOutput: "0x00000000  04e02de5          str lr, [sp, #-4]!\n0x00000004  00d04be2          sub sp, fp, #0",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true]
            }
        ],
    },
    {
        name: "Disassemble ARM: ARM32 Thumb mode",
        input: "80b500af",
        expectedOutput: "0x00000000  80b5              push {r7, lr}\n0x00000002  00af              add r7, sp, #0",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "Thumb", "Little Endian", 0, true, true]
            }
        ],
    },
    {
        name: "Disassemble ARM: ARM64 basic - MOV instruction",
        input: "e0031faa",
        expectedOutput: "0x00000000  e0031faa          mov x0, xzr",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true]
            }
        ],
    },
    {
        name: "Disassemble ARM: ARM64 - Multiple instructions",
        input: "fd7bbfa9 fd030091",
        expectedOutput: "0x00000000  fd7bbfa9          stp x29, x30, [sp, #-0x10]!\n0x00000004  fd030091          mov x29, sp",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true]
            }
        ],
    },
    {
        name: "Disassemble ARM: Custom starting address",
        input: "0000a0e3",
        expectedOutput: "0x00001000  0000a0e3          mov r0, #0",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "ARM", "Little Endian", 4096, true, true]
            }
        ],
    },
    {
        name: "Disassemble ARM: Hide instruction hex",
        input: "0000a0e3",
        expectedOutput: "0x00000000  mov r0, #0",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "ARM", "Little Endian", 0, false, true]
            }
        ],
    },
    {
        name: "Disassemble ARM: Hide instruction position",
        input: "0000a0e3",
        expectedOutput: "0000a0e3          mov r0, #0",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "ARM", "Little Endian", 0, true, false]
            }
        ],
    },
    {
        name: "Disassemble ARM: Hide both hex and position",
        input: "0000a0e3",
        expectedOutput: "mov r0, #0",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "ARM", "Little Endian", 0, false, false]
            }
        ],
    },
    {
        name: "Disassemble ARM: Empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true]
            }
        ],
    },
    {
        name: "Disassemble ARM: Input with whitespace",
        input: "00 00 a0 e3",
        expectedOutput: "0x00000000  0000a0e3          mov r0, #0",
        recipeConfig: [
            {
                "op": "Disassemble ARM",
                "args": ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true]
            }
        ],
    },
]);
