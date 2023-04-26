/**
 * Typing cryptocurrency artifact tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Type Cryptocurrency Artifacts - P2SH",
        input: "37TKx6FKj3P7fAeVoVwKsy39DzFhyHnvnr",
        expectedOutput: "Input 37TKx6FKj3P7fAeVoVwKsy39DzFhyHnvnr is possibly a P2SH, or P2SH-P2WPKH address.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Compressed WIF",
        input: "KwaCxiHcCGgD2b2MopWhoX218C1e5KZ8uu5G5ijGSCZDReuuxZcB",
        expectedOutput: "Input KwaCxiHcCGgD2b2MopWhoX218C1e5KZ8uu5G5ijGSCZDReuuxZcB is possibly a compressed WIF (Wallet-Input-Format) Key.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Compressed WIF",
        input: "L3vjDdHwHzw2QnPkMRnsnwtfd3zpWHcmxq5LVBkBnGy7mU5iVJJg",
        expectedOutput: "Input L3vjDdHwHzw2QnPkMRnsnwtfd3zpWHcmxq5LVBkBnGy7mU5iVJJg is possibly a compressed WIF (Wallet-Input-Format) Key.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - P2PKH",
        input: "15bhKCjC8C3jKgTCexe15vX62ahhsujoLx",
        expectedOutput: "Input 15bhKCjC8C3jKgTCexe15vX62ahhsujoLx is possibly a Bitcoin P2PKH address.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Compressed Public",
        input: "02fc2dcc9f0b88922e32eb3ced89eecaea7eb8d9c0adf05b8b6c8cc0e4504aa91d",
        expectedOutput: "Input 02fc2dcc9f0b88922e32eb3ced89eecaea7eb8d9c0adf05b8b6c8cc0e4504aa91d is possibly a compressed public key in raw bytes.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Compressed Public",
        input: "03ebbd632f1f1b885ffddde739e0a285dd337f3d80759a119fd6699d740a8cefc9",
        expectedOutput: "Input 03ebbd632f1f1b885ffddde739e0a285dd337f3d80759a119fd6699d740a8cefc9 is possibly a compressed public key in raw bytes.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Uncompressed Public",
        input: "04BED04F74E8CB11C0A0FFC214429F7803174100660385F739A246F5D42231D7F44357E672B06EC1891DFA8BBC2129DC54384EA20B360C63EFA4E6CC6E4260D306",
        expectedOutput: "Input 04BED04F74E8CB11C0A0FFC214429F7803174100660385F739A246F5D42231D7F44357E672B06EC1891DFA8BBC2129DC54384EA20B360C63EFA4E6CC6E4260D306 is possibly an uncompressed public key in raw bytes.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Uncompressed WIF",
        input: "5KbFn3aqNgxotDZA4S28xaDcm7GhLt9K3LydqUtKfJbkAjarLnt",
        expectedOutput: "Input 5KbFn3aqNgxotDZA4S28xaDcm7GhLt9K3LydqUtKfJbkAjarLnt is possibly an uncompressed WIF (Wallet-Input-Format) Key.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Segwit",
        input: "bc1qxqy2d8mfl6gvk3fp5k9y3umv7h3fcgxpfs7w02",
        expectedOutput: "Input bc1qxqy2d8mfl6gvk3fp5k9y3umv7h3fcgxpfs7w02 is possibly a Segwit address (P2WPKH/P2WSH).\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Taproot",
        input: "bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kt5nd6y",
        expectedOutput: "Input bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kt5nd6y is possibly a taproot.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - Private",
        input: "E9CDB0734EC8CD727F58B5FD16E4277AB87FA5E74ED288779E908F4EF433BD2E",
        expectedOutput: "Input E9CDB0734EC8CD727F58B5FD16E4277AB87FA5E74ED288779E908F4EF433BD2E is possibly a private key in raw bytes.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    },
    {
        name: "Type Cryptocurrency Artifacts - BIP38",
        input: "6PYLLdPvL6tu2te7d4EaPpjZuzmuv2KWq2EkxBukPyknrf36gQW6a6qhXx",
        expectedOutput: "Input 6PYLLdPvL6tu2te7d4EaPpjZuzmuv2KWq2EkxBukPyknrf36gQW6a6qhXx is possibly a BIP38 encrypted key.\n",
        recipeConfig: [
            {
                "op": "Type Cryptocurrency Artifact",
                "args": []
            },
        ],
    }
]);
