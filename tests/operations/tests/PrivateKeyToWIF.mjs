/**
 * Private Key to Wallet-Import-Format tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Private Key To WIF (BTC, Compressed)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "KzNkuRstcjZGuwYu5wWbLcwXzNngvH2oWPDymKxL7tdU48SSb5uX",
        recipeConfig: [
            {
                "op": "To WIF Format",
                "args": ["BTC", true]
            }
        ],
    },
    {
        name: "Private Key To WIF (BTC, Compressed, From Bytes)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "KzNkuRstcjZGuwYu5wWbLcwXzNngvH2oWPDymKxL7tdU48SSb5uX",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "To WIF Format",
                "args": ["BTC", true]
            }
        ],
    },
    {
        name: "Private Key To WIF (BTC, Uncompressed)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "5JXkw276MLA8EMWtDuE3o8gzmie5y2NFcf7ZoHywdTCSAPQWJtG",
        recipeConfig: [
            {
                "op": "To WIF Format",
                "args": ["BTC", false]
            }
        ],
    },
    {
        name: "Private Key To WIF (Testnet, Compressed)",
        input: "6ADA95C3D8BC2E06E818EC4816A0EB4455448A3FD70DA26EF218F7FC5ED1A2C0",
        expectedOutput: "cRAQpjSDxVVHdMHQbhyUjE8XytUm8nB47NHJqg9dpJqkhuetPesF",
        recipeConfig: [
            {
                "op": "To WIF Format",
                "args": ["Testnet", true]
            }
        ],
    },
    {
        name: "Private Key To WIF (BTC, Compressed, Wrong Number of Bytes)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E08",
        expectedOutput: "Error parsing private key. Error is:\n\tInvalid length. We want either 32 or 64 but we got: 66",
        recipeConfig: [
            {
                "op": "To WIF Format",
                "args": ["BTC", true]
            }
        ],
    },
    {
        name: "Private Key To WIF (BTC, Compressed, Wrong Number of Bytes)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E08",
        expectedOutput: "Error parsing private key. Error is:\n\tInvalid length. We want either 32 or 64 but we got: 33",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "To WIF Format",
                "args": ["BTC", true]
            }
        ],
    }

]);
