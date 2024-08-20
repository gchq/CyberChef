/**
 * Seed to master private key tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Seed To Master Private Key (xprv)",
        input: "c766f48d3729a16249b5d0171c678d458d31454b2bb7791b61169b5541a130719714ebd41f22a2515246d013e9a4e978aee48dd5140b73a540108d58008c4aa9",
        expectedOutput: "xprv9s21ZrQH143K2nwujwREGif1wyBwt5Jh9BdFVSgSeYdrUp1qPxKsHrmnpJ8xKpKPDvXJMmBRpsZ3X64MeafyURs8Xoj53kGu7hb48Yg7unj",
        recipeConfig: [
            {
                "op": "Seed To Master Key",
                "args": ["xprv"]
            }
        ],
    },
    {
        name: "Seed To Master Private Key (xprv) From Hex",
        input: "c766f48d3729a16249b5d0171c678d458d31454b2bb7791b61169b5541a130719714ebd41f22a2515246d013e9a4e978aee48dd5140b73a540108d58008c4aa9",
        expectedOutput: "xprv9s21ZrQH143K2nwujwREGif1wyBwt5Jh9BdFVSgSeYdrUp1qPxKsHrmnpJ8xKpKPDvXJMmBRpsZ3X64MeafyURs8Xoj53kGu7hb48Yg7unj",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Seed To Master Key",
                "args": ["xprv"]
            }
        ],
    },
    {
        name: "Seed To Master Private Key (tprv)",
        input: "c766f48d3729a16249b5d0171c678d458d31454b2bb7791b61169b5541a130719714ebd41f22a2515246d013e9a4e978aee48dd5140b73a540108d58008c4aa9",
        expectedOutput: "tprv8ZgxMBicQKsPdcBSQWGjSNH1G6cA7bLhUjYNMs6u8X8LGQkvPKfcoc9EjUJcLBhhbN45MroBzE8qywc6mo1vHV8j4SwNi6zx2oLUaEMVJqo",
        recipeConfig: [
            {
                "op": "Seed To Master Key",
                "args": ["tprv"]
            }
        ],
    },
    {
        name: "Seed To Master Private Key (Ltpv)",
        input: "c766f48d3729a16249b5d0171c678d458d31454b2bb7791b61169b5541a130719714ebd41f22a2515246d013e9a4e978aee48dd5140b73a540108d58008c4aa9",
        expectedOutput: "Ltpv71G8qDifUiNesmbVBqTrR8sm9Eeoy4z2ZAeoSw4seCDwVcniGb6RehUSn4fyCXxa936aSGpwyxFhWbBS3hex7YEUVNgFMhKvv6CxBzBoSoz",
        recipeConfig: [
            {
                "op": "Seed To Master Key",
                "args": ["Ltpv"]
            }
        ],
    }

]);
