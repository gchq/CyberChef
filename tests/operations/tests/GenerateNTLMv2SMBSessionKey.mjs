/**
 * Generate NTLMv2 SMB Session Key operation tests
 *
 * @author mansiverma897993
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Generate NTLMv2 SMB Session Key: Manual fields with Plaintext Password (mrealman)",
        input: "",
        expectedOutput: "20a642c086ef74eee26277bf1d0cff8c",
        recipeConfig: [
            {
                op: "Generate NTLMv2 SMB Session Key",
                args: [
                    "mrealman",
                    "WORKGROUP",
                    { string: "Blockbuster1", option: "UTF8 (Plaintext)" },
                    "16e816dead16d4ca7d5d6dee4a015c14",
                    "fde53b54cb676b9bbf0fb1fbef384698",
                    "",
                    "Raw Session Key"
                ],
            },
        ],
    },
    {
        name: "Generate NTLMv2 SMB Session Key: Manual fields with NT Hash (eshellstrop)",
        input: "",
        expectedOutput: "facfbdf010d00aa2574c7c41201099e8",
        recipeConfig: [
            {
                op: "Generate NTLMv2 SMB Session Key",
                args: [
                    "eshellstrop",
                    "WORKGROUP",
                    { string: "3f29138a04aadc19214e9c04028bf381", option: "Hex (NT Hash)" },
                    "0ca6227a4f00b9654a48908c4801a0ac",
                    "c24f5102a22d286336aac2dfa4dc2e04",
                    "",
                    "Raw Session Key"
                ],
            },
        ],
    },
    {
        name: "Generate NTLMv2 SMB Session Key: Input NTLMv2 Hashcat Line (eshellstrop)",
        input: "eshellstrop::WORKGROUP:1122334455667788:0ca6227a4f00b9654a48908c4801a0ac:0101000000000000",
        expectedOutput: "facfbdf010d00aa2574c7c41201099e8",
        recipeConfig: [
            {
                op: "Generate NTLMv2 SMB Session Key",
                args: [
                    "",
                    "",
                    { string: "3f29138a04aadc19214e9c04028bf381", option: "Hex (NT Hash)" },
                    "",
                    "c24f5102a22d286336aac2dfa4dc2e04",
                    "",
                    "Raw Session Key"
                ],
            },
        ],
    },
    {
        name: "Generate NTLMv2 SMB Session Key: Wireshark UAT line output with Session ID (mrealman)",
        input: "",
        expectedOutput: "0000100000000041,20a642c086ef74eee26277bf1d0cff8c",
        recipeConfig: [
            {
                op: "Generate NTLMv2 SMB Session Key",
                args: [
                    "mrealman",
                    "WORKGROUP",
                    { string: "Blockbuster1", option: "UTF8 (Plaintext)" },
                    "16e816dead16d4ca7d5d6dee4a015c14",
                    "fde53b54cb676b9bbf0fb1fbef384698",
                    "0x0000100000000041",
                    "Wireshark UAT line (SessionID,SessionKey)"
                ],
            },
        ],
    },
]);
