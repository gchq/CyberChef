/**
 * Disassemble ARM tests.
 *
 * @author MedjedThomasXM
 *
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // ==================== ARM32 TESTS ====================
    {
        name: "Disassemble ARM: ARM32 NOP (mov r0, r0)",
        input: "00 00 a0 e1",
        expectedMatch: /mov\s+r0,\s*r0/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM32 bx lr",
        input: "1e ff 2f e1",
        expectedMatch: /bx\s+lr/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM32 push {fp, lr}",
        input: "00 48 2d e9",
        expectedMatch: /push\s+\{fp,\s*lr\}/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM32 add fp, sp, #4",
        input: "04 b0 8d e2",
        expectedMatch: /add\s+fp,\s*sp/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM32 ldr r0, [r1]",
        input: "00 00 91 e5",
        expectedMatch: /ldr\s+r0,\s*\[r1\]/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM32 str r0, [r1]",
        input: "00 00 81 e5",
        expectedMatch: /str\s+r0,\s*\[r1\]/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM32 bl (branch link)",
        input: "00 00 00 eb",
        expectedMatch: /bl\s+/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM32 mul r0, r1, r2",
        input: "91 02 00 e0",
        expectedMatch: /mul\s+r0,\s*r1,\s*r2/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },

    // ==================== ARM32 THUMB TESTS ====================
    {
        name: "Disassemble ARM: Thumb mov r0, r0",
        input: "00 46",
        expectedMatch: /mov\s+r0,\s*r0/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "Thumb", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: Thumb bx lr",
        input: "70 47",
        expectedMatch: /bx\s+lr/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "Thumb", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: Thumb push {r4, lr}",
        input: "10 b5",
        expectedMatch: /push\s+\{r4,\s*lr\}/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "Thumb", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: Thumb pop {r4, pc}",
        input: "10 bd",
        expectedMatch: /pop\s+\{r4,\s*pc\}/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "Thumb", "Little Endian", 0, true, true],
            },
        ],
    },

    // ==================== ARM64 TESTS ====================
    {
        name: "Disassemble ARM: ARM64 ret",
        input: "c0 03 5f d6",
        expectedMatch: /ret/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 mov x0, #0",
        input: "00 00 80 d2",
        expectedMatch: /mov[z]?\s+x0,\s*#0/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 stp x29, x30, [sp, #-16]!",
        input: "fd 7b bf a9",
        expectedMatch: /stp\s+x29,\s*x30,\s*\[sp/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 ldp x29, x30, [sp], #16",
        input: "fd 7b c1 a8",
        expectedMatch: /ldp\s+x29,\s*x30,\s*\[sp\]/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 add x0, x1, x2",
        input: "20 00 02 8b",
        expectedMatch: /add\s+x0,\s*x1,\s*x2/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 sub x0, x1, x2",
        input: "20 00 02 cb",
        expectedMatch: /sub\s+x0,\s*x1,\s*x2/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 mul x0, x1, x2",
        input: "20 7c 02 9b",
        expectedMatch: /mul\s+x0,\s*x1,\s*x2/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 ldr x0, [x1]",
        input: "20 00 40 f9",
        expectedMatch: /ldr\s+x0,\s*\[x1\]/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 str x0, [x1]",
        input: "20 00 00 f9",
        expectedMatch: /str\s+x0,\s*\[x1\]/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 bl (branch link)",
        input: "00 00 00 94",
        expectedMatch: /bl\s+/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 cbz x0",
        input: "00 00 00 b4",
        expectedMatch: /cbz\s+x0/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 cbnz x0",
        input: "00 00 00 b5",
        expectedMatch: /cbnz\s+x0/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 sub sp, sp, #0x20",
        input: "ff 83 00 d1",
        expectedMatch: /sub\s+sp,\s*sp/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 add sp, sp, #0x20",
        input: "ff 83 00 91",
        expectedMatch: /add\s+sp,\s*sp/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },

    // ==================== MULTI-INSTRUCTION TESTS ====================
    {
        name: "Disassemble ARM: ARM32 multiple instructions",
        input: "00 48 2d e9 04 b0 8d e2 00 00 a0 e1 00 88 bd e8",
        expectedMatch: /push.*\n.*add.*\n.*mov.*\n.*pop/s,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM64 function prologue/epilogue",
        input: "fd 7b bf a9 fd 03 00 91 00 00 80 52 fd 7b c1 a8 c0 03 5f d6",
        expectedMatch: /stp.*\n.*mov.*\n.*mov.*\n.*ldp.*\n.*ret/s,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },

    // ==================== ADDRESS TESTS ====================
    {
        name: "Disassemble ARM: ARM64 with start address 0x1000",
        input: "c0 03 5f d6",
        expectedMatch: /0x00001000/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 4096, true, true],
            },
        ],
    },
    {
        name: "Disassemble ARM: ARM32 with start address 0x8000",
        input: "00 00 a0 e1",
        expectedMatch: /0x00008000/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Little Endian", 32768, true, true],
            },
        ],
    },

    // ==================== ENDIANNESS TESTS ====================
    {
        name: "Disassemble ARM: ARM32 Big Endian",
        input: "e1 a0 00 00",
        expectedMatch: /mov\s+r0,\s*r0/,
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM (32-bit)", "ARM", "Big Endian", 0, true, true],
            },
        ],
    },

    // ==================== EDGE CASES ====================
    {
        name: "Disassemble ARM: Empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Disassemble ARM",
                args: ["ARM64 (AArch64)", "ARM", "Little Endian", 0, true, true],
            },
        ],
    },
]);
