/**
 * Public Key to cryptocurrency address tests.
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
                "op": "Public Key To Cryptocurrency Address",
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
                "op": "Public Key To Cryptocurrency Address",
                "args": ["BTC", "P2PKH (V1 BTC Addresses)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2PKH (Long)",
        input: "04219A19E157B5FEDDF7EBDD3C7A58D7AB4F6565E84226691B6A5F80BBCE8E0100B49D6AB503CA4B701626E941EB8D2460F154992D7AD4EC671CF1CFB8C1DE8164",
        expectedOutput: "1BgRqTW8RMmcTRXHymTCVJsn5NVk9U8L9q",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
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
                "op": "Public Key To Cryptocurrency Address",
                "args": ["BTC", "P2SH-P2PWPKH (Segwit Compatible)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2SH-P2WPKH (2)",
        input: "021a4310db1211939e20c88e9b90be354a145ec323a045de47ff0ea3145f99c8c9",
        expectedOutput: "3C9wCFwcd36MHVpontDF7zQfKPfRTNg4Fe",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
                "args": ["BTC", "P2SH-P2PWPKH (Segwit Compatible)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2WPKH (1)",
        input: "02530f0512d544344a04777be5477a2ffef813a110ac0705fafa012f5b61b56380",
        expectedOutput: "bc1qu37uvwyzj23a2dd3x5nd8s77nfskzu3lzkuqfm",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
                "args": ["BTC", "Segwit (P2WPKH)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2WPKH (2)",
        input: "03bc32bdc5dc96c9fb56e2481fefd321ebe9e17a807bbb337dea1df5e68b1f0756",
        expectedOutput: "bc1qrjluhfu5qr2780zlvcx3kquckpvuamwqp2sjle",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
                "args": ["BTC", "Segwit (P2WPKH)"]
            },
        ],
    },
    {
        name: "Public Key To Address: (ETH)",
        input: "04d26bcecd763bdf6bdb89ba929d2485429fbda73bae723d525ef55554ef45350582085bd24055079f6deebad5b6af612c14587c6862391d330484afe750fbf144",
        expectedOutput: "0x63e8b85679d29235791a0f558d6485c7ed51c9e6",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
                "args": ["Ethereum", "Segwit (P2WPKH)"]
            },
        ],

    },
    {
        name: "Public Key To Address: (Testnet)",
        input: "02aa6438e78b18a503f4466672fd04e31aaeec3ed1c3e0e1f19654776f0f0dc1b2",
        expectedOutput: "mmuoeJDuuzeuaii1V6tPK3L5YjaJwjPqUM",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
                "args": ["Testnet", "P2PKH (V1 BTC Addresses)"]
            },
        ],

    },
    {
        name: "Public Key To Address: P2WPKH (Wrong Length)",
        input: "03bc32bdc5dc96c9fb56e2481fefd321ebe9e17a807bbb337dea1df5e68b1f075642",
        expectedOutput: "Input is wrong length. Should be either 33 or 65 bytes, but is: 34",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
                "args": ["BTC", "Segwit (P2WPKH)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2WPKH (Wrong Start)",
        input: "05bc32bdc5dc96c9fb56e2481fefd321ebe9e17a807bbb337dea1df5e68b1f0756",
        expectedOutput: "Input is 33 bytes, but begins with invalid byte: 05",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
                "args": ["BTC", "Segwit (P2WPKH)"]
            },
        ],
    },
    {
        name: "Public Key To Address: P2PKH (Long With Error)",
        input: "06219A19E157B5FEDDF7EBDD3C7A58D7AB4F6565E84226691B6A5F80BBCE8E0100B49D6AB503CA4B701626E941EB8D2460F154992D7AD4EC671CF1CFB8C1DE8164",
        expectedOutput: "Input is 65 bytes, but begins with invalid byte: 06",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
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
                "op": "Public Key To Cryptocurrency Address",
                "args": ["BTC", "P2PKH (V1 BTC Addresses)"]
            }
        ],
    },
    {
        name: "Public Key To Address: (ETH Compressed Key)",
        input: "03ebf60a619da2fbc6239089ca0a93878ea53baa3d22188cacad4033b103237ae9",
        expectedOutput: "Ethereum addresses require uncompressed public keys.",
        recipeConfig: [
            {
                "op": "Public Key To Cryptocurrency Address",
                "args": ["Ethereum", "Segwit (P2WPKH)"]
            },
        ],

    }
]);
