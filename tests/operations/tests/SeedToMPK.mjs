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
    },
    {
        name: "Seed To Master Private Key (XPrv, short seed)",
        input: "1ed5b6f0dcf88085add90fbb138d5e16f661d5b738f842232fce5980fc4592",
        expectedOutput: "xprv9s21ZrQH143K3mvkwf3aiiCQ6mpTnAh5ZPvhHFLXSaSRxAg5uAuHVvaFVSGoyE7U3UJ3knZM12AvNcF9a9xoARWCkCF9MYXjyN1ZJUC6ssa",
        recipeConfig: [
            {
                "op": "Seed To Master Key",
                "args": ["xprv"]
            }
        ],
    },
    {
        name: "Seed to Master Private Key (XPrv, decoded Chinese)",
        input: "霍 里 攻 繁 混 注 杀 侦 具 涤 涤 手",
        expectedOutput: "xprv9s21ZrQH143K3NGAQKJovUKk9ty8HFDxoK2A8kseKUEQnQA2xuS1UiXj67d7jPS153aBSeqbJpGC4etDSmAJrD2MuN3pncdjFNh85PEPwS2",
        recipeConfig: [
            {
                "op": "Normalise Unicode",
                "args": ["NFKD"]
            },
            {
                "op": "To Hex",
                "args": ["None", 0]
            },
            {
                "op": "Seed To Master Key",
                "args": ["xprv"]
            }

        ]
    },
    {
        name: "Seed to Master Private Key (XPrv, Non-Hex Dealing With Raw Bytes)",
        input: "abc=_*~$%^$^*&^$%@#$^^%&*^&(YIU%^$#@",
        expectedOutput: "xprv9s21ZrQH143K2zVX3HhaQJZPeunqrxitrCQh5ZaUzyv9uHtZu86AVigehGy2ZCfGcAmp7wJUSb4GMGsbH8qqJawZEz2mdUVV8q7VH2AqgH6",
        recipeConfig: [
            {
                "op": "Seed To Master Key",
                "args": ["xprv"]
            }

        ]
    }

]);
