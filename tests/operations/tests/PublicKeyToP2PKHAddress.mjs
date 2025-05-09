/**
 * Public Key To Bitcoin-Like Address tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Public Key To Address: P2PKH (1)",
        input: "03ebf60a619da2fbc6239089ca0a93878ea53baa3d22188cacad4033b103237ae9",
        expectedOutput: "1MwwHqDj1FAyABeqPeiTTvJQCoCorcuFyP",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2PKH (V1 BTC Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2PKH (2)",
        input: "021dc4eb14b93dfbbbe4578293d07b6ee443ca025d89fd43a657ee3fd8c81d03f6",
        expectedOutput: "18wUwr4Jvor6LG1mvQcfEp1Lx51dYAXZX1",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2PKH (V1 BTC Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2PKH LTC",
        input: "037b39f764a10f31bfd47038738ca27bffeefce1fe4ccbfb9343fcb69d9363b27b",
        expectedOutput: "LPTR2TBuF8vbwWaJdNeCAQemW4SC7q7zJP",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["LTC", "P2PKH (V1 BTC Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2PKH (Long)",
        input: "04219A19E157B5FEDDF7EBDD3C7A58D7AB4F6565E84226691B6A5F80BBCE8E0100B49D6AB503CA4B701626E941EB8D2460F154992D7AD4EC671CF1CFB8C1DE8164",
        expectedOutput: "1BgRqTW8RMmcTRXHymTCVJsn5NVk9U8L9q",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2PKH (V1 BTC Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2SH-P2WPKH (1)",
        input: "03a24ca9f13f6bcbc15615f71504be75566120b9bc7072e171756233162c726432",
        expectedOutput: "31vhdy8RGhSYZRRGZfqvZHGzVtpcua4cQW",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2SH-P2PWPKH (Segwit Compatible V3 Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2SH-P2WPKH (2)",
        input: "021a4310db1211939e20c88e9b90be354a145ec323a045de47ff0ea3145f99c8c9",
        expectedOutput: "3C9wCFwcd36MHVpontDF7zQfKPfRTNg4Fe",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2SH-P2PWPKH (Segwit Compatible V3 Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2SH-P2WPKH LTC",
        input: "02f442a169ca36702bbcbb268319295bece8fe1cbc6ca095b2669d13ef56c759de",
        expectedOutput: "MMwYiJmkxDKqiP2WWAHMMgkeRt2nLxGqih",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["LTC", "P2SH-P2PWPKH (Segwit Compatible V3 Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2WPKH (1)",
        input: "02530f0512d544344a04777be5477a2ffef813a110ac0705fafa012f5b61b56380",
        expectedOutput: "bc1qu37uvwyzj23a2dd3x5nd8s77nfskzu3lzkuqfm",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "Segwit (P2WPKH bc1 Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2WPKH (2)",
        input: "03bc32bdc5dc96c9fb56e2481fefd321ebe9e17a807bbb337dea1df5e68b1f0756",
        expectedOutput: "bc1qrjluhfu5qr2780zlvcx3kquckpvuamwqp2sjle",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "Segwit (P2WPKH bc1 Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2WPKH LTC",
        input: "026a532c31184b94edf540ad60c3cc208342be4f51cc764a373a420731dd198a59",
        expectedOutput: "ltc1qj587punda8h0r4m83k794xseqlnl3az4ktu2zp",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["LTC", "Segwit (P2WPKH bc1 Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: (Testnet)",
        input: "02aa6438e78b18a503f4466672fd04e31aaeec3ed1c3e0e1f19654776f0f0dc1b2",
        expectedOutput: "mmuoeJDuuzeuaii1V6tPK3L5YjaJwjPqUM",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["Testnet", "P2PKH (V1 BTC Addresses)"]
            },
        ],

    },
    {
        name: "Public Key To Address: P2WPKH (Wrong Length)",
        input: "03bc32bdc5dc96c9fb56e2481fefd321ebe9e17a807bbb337dea1df5e68b1f075642",
        expectedOutput: "Invalid length. We want either 33, 65 (if bytes) or 66, 130 (if hex) but we got: 68",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "Segwit (P2WPKH bc1 Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2WPKH (Wrong Start)",
        input: "05bc32bdc5dc96c9fb56e2481fefd321ebe9e17a807bbb337dea1df5e68b1f0756",
        expectedOutput: "We have a valid hex string, of reasonable length, (66) but doesn't start with the right value. Correct values are 02, or 03 but we have: 05",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "Segwit (P2WPKH bc1 Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2PKH (Long With Error)",
        input: "06219A19E157B5FEDDF7EBDD3C7A58D7AB4F6565E84226691B6A5F80BBCE8E0100B49D6AB503CA4B701626E941EB8D2460F154992D7AD4EC671CF1CFB8C1DE8164",
        expectedOutput: "We have a valid hex string of reasonable length, (130) but doesn't start with the right value. Correct values are 04 but we have: 06",
        recipeConfig: [
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2PKH (V1 BTC Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2PKH (From Bytes)",
        input: "03ebf60a619da2fbc6239089ca0a93878ea53baa3d22188cacad4033b103237ae9",
        expectedOutput: "1MwwHqDj1FAyABeqPeiTTvJQCoCorcuFyP",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2PKH (V1 BTC Addresses)"]
            }
        ],
    },
    {
        name: "Public Key To Address: P2TR (From WIF Key)",
        input: "L5R7GAGwrBLcpK4jK1CLDL7VjPifYZZeS1NcixKvrPxXySJWEK9h",
        expectedOutput: "bc1ph6py5lduje5urxkqewpaxj8cxlmmc9uxr386e0jgvp9vzsup54dqxpxsn7",
        recipeConfig: [
            {
                "op": "From WIF Format",
                "args": []
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true]
            },
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "Taproot (P2TR bc1p Addresses)"]
            }
        ]
    },
]);
