/**
 * Bech32 tests.
 *
 * Test vectors from official BIP specifications:
 * BIP-0173: https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
 * BIP-0350: https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki
 *
 * AGE key test vectors from:
 * https://asecuritysite.com/age/go_age5
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // ============= To Bech32 Tests =============
    {
        name: "To Bech32: empty input",
        input: "",
        expectedOutput: "bc1gmk9yu",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32", "Raw bytes", "Generic", 0]
            }
        ],
    },
    {
        name: "To Bech32: single byte",
        input: "A",
        expectedOutput: "bc1gyufle22",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32", "Raw bytes", "Generic", 0]
            }
        ],
    },
    {
        name: "To Bech32: Hello",
        input: "Hello",
        expectedOutput: "bc1fpjkcmr0gzsgcg",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32", "Raw bytes", "Generic", 0]
            }
        ],
    },
    {
        name: "To Bech32: custom HRP",
        input: "test",
        expectedOutput: "custom1w3jhxaq593qur",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["custom", "Bech32", "Raw bytes", "Generic", 0]
            }
        ],
    },
    {
        name: "To Bech32: testnet HRP",
        input: "data",
        expectedOutput: "tb1v3shgcg3x07jr",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["tb", "Bech32", "Raw bytes", "Generic", 0]
            }
        ],
    },
    {
        name: "To Bech32m: empty input",
        input: "",
        expectedOutput: "bc1a8xfp7",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32m", "Raw bytes", "Generic", 0]
            }
        ],
    },
    {
        name: "To Bech32m: single byte",
        input: "A",
        expectedOutput: "bc1gyf4040g",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32m", "Raw bytes", "Generic", 0]
            }
        ],
    },
    {
        name: "To Bech32m: Hello",
        input: "Hello",
        expectedOutput: "bc1fpjkcmr0a7qya2",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32m", "Raw bytes", "Generic", 0]
            }
        ],
    },
    {
        name: "To Bech32: empty HRP error",
        input: "test",
        expectedOutput: "Human-Readable Part (HRP) cannot be empty.",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["", "Bech32", "Raw bytes", "Generic", 0]
            }
        ],
    },

    // ============= From Bech32 Tests (Raw output) =============
    {
        name: "From Bech32: decode single byte (Raw)",
        input: "bc1gyufle22",
        expectedOutput: "A",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Raw"]
            }
        ],
    },
    {
        name: "From Bech32: decode Hello (Raw)",
        input: "bc1fpjkcmr0gzsgcg",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Raw"]
            }
        ],
    },
    {
        name: "From Bech32: auto-detect Bech32 (Raw)",
        input: "bc1fpjkcmr0gzsgcg",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Raw"]
            }
        ],
    },
    {
        name: "From Bech32m: decode Hello (Raw)",
        input: "bc1fpjkcmr0a7qya2",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32m", "Raw"]
            }
        ],
    },
    {
        name: "From Bech32: auto-detect Bech32m (Raw)",
        input: "bc1fpjkcmr0a7qya2",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Raw"]
            }
        ],
    },
    {
        name: "From Bech32: uppercase input (Raw)",
        input: "BC1FPJKCMR0GZSGCG",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Raw"]
            }
        ],
    },
    {
        name: "From Bech32: custom HRP (Raw)",
        input: "custom1w3jhxaq593qur",
        expectedOutput: "test",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Raw"]
            }
        ],
    },
    {
        name: "From Bech32: empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: empty data part (Hex)",
        input: "bc1gmk9yu",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Hex"]
            }
        ],
    },

    // ============= From Bech32 HRP Output Tests =============
    {
        name: "From Bech32: HRP: Hex output format",
        input: "bc1fpjkcmr0gzsgcg",
        expectedOutput: "bc: 48656c6c6f",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32: JSON output format",
        input: "bc1fpjkcmr0gzsgcg",
        expectedOutput: "{\n  \"hrp\": \"bc\",\n  \"encoding\": \"Bech32\",\n  \"data\": \"48656c6c6f\"\n}",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "JSON"]
            }
        ],
    },
    {
        name: "From Bech32: Hex output format",
        input: "bc1fpjkcmr0gzsgcg",
        expectedOutput: "48656c6c6f",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Hex"]
            }
        ],
    },

    // ============= AGE Key Test Vectors =============
    // From: https://asecuritysite.com/age/go_age5
    {
        name: "From Bech32: AGE public key 1 (HRP: Hex)",
        input: "age1kk86t4lr4s9uwvnqjzp2e35rflvcpnjt33q99547ct23xzk0ssss3ma49j",
        expectedOutput: "age: b58fa5d7e3ac0bc732609082acc6834fd980ce4b8c4052d2bec2d5130acf8421",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32: AGE private key 1 (HRP: Hex)",
        input: "AGE-SECRET-KEY-1Z5N23X54Y4E9NLMPNH6EZDQQX9V883TMKJ3ZJF5QXXMKNZ2RPFXQUQF74G",
        expectedOutput: "age-secret-key-: 1526a89a95257259ff619df5913400315873c57bb4a229268031b76989430a4c",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32: AGE public key 2 (HRP: Hex)",
        input: "age1nwt7gkq7udvalagqn7l8a4jgju7wtenkg925pvuqvn7cfcry6u2qkae4ad",
        expectedOutput: "age: 9b97e4581ee359dff5009fbe7ed648973ce5e676415540b38064fd84e064d714",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32: AGE private key 2 (HRP: Hex)",
        input: "AGE-SECRET-KEY-137M0YVE3CL6M8C4ET9L2KU67FPQHJZTW547QD5CK0R5A5T09ZGJSQGR9LX",
        expectedOutput: "age-secret-key-: 8fb6f23331c7f5b3e2b9597eab735e484179096ea57c06d31678e9da2de51225",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32: AGE public key 1 (JSON)",
        input: "age1kk86t4lr4s9uwvnqjzp2e35rflvcpnjt33q99547ct23xzk0ssss3ma49j",
        expectedOutput: "{\n  \"hrp\": \"age\",\n  \"encoding\": \"Bech32\",\n  \"data\": \"b58fa5d7e3ac0bc732609082acc6834fd980ce4b8c4052d2bec2d5130acf8421\"\n}",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "JSON"]
            }
        ],
    },

    // ============= Error Cases =============
    {
        name: "From Bech32: mixed case error",
        input: "bc1FpjKcmr0gzsgcg",
        expectedOutput: "Invalid Bech32 string: mixed case is not allowed. Use all uppercase or all lowercase.",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: no separator error",
        input: "noseparator",
        expectedOutput: "Invalid Bech32 string: no separator '1' found.",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: empty HRP error",
        input: "1qqqqqqqqqqqqqqqq",
        expectedOutput: "Invalid Bech32 string: Human-Readable Part (HRP) cannot be empty.",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: invalid checksum",
        input: "bc1fpjkcmr0gzsgcx",
        expectedOutput: "Invalid Bech32/Bech32m string: checksum verification failed.",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: data too short",
        input: "bc1abc",
        expectedOutput: "Invalid Bech32 string: data part is too short (minimum 6 characters for checksum).",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: wrong encoding specified",
        input: "bc1fpjkcmr0gzsgcg",
        expectedOutput: "Invalid Bech32m checksum.",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32m", "Hex"]
            }
        ],
    },

    // ============= BIP-0173 Test Vectors (Bech32) =============
    {
        name: "From Bech32: BIP-0173 A12UEL5L (empty data)",
        input: "A12UEL5L",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: BIP-0173 a12uel5l lowercase",
        input: "a12uel5l",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: BIP-0173 long HRP with bio",
        input: "an83characterlonghumanreadablepartthatcontainsthenumber1andtheexcludedcharactersbio1tt5tgs",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32: BIP-0173 abcdef with data",
        input: "abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw",
        expectedOutput: "abcdef: 00443214c74254b635cf84653a56d7c675be77df",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32: BIP-0173 split HRP",
        input: "split1checkupstagehandshakeupstreamerranterredcaperred2y9e3w",
        expectedOutput: "split: c5f38b70305f519bf66d85fb6cf03058f3dde463ecd7918f2dc743918f2d",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32: BIP-0173 question mark HRP",
        input: "?1ezyfcl",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32", "Hex"]
            }
        ],
    },

    // ============= BIP-0350 Test Vectors (Bech32m) =============
    {
        name: "From Bech32m: BIP-0350 A1LQFN3A (empty data)",
        input: "A1LQFN3A",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32m", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32m: BIP-0350 a1lqfn3a lowercase",
        input: "a1lqfn3a",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32m", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32m: BIP-0350 long HRP",
        input: "an83characterlonghumanreadablepartthatcontainsthetheexcludedcharactersbioandnumber11sg7hg6",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32m", "Hex"]
            }
        ],
    },
    {
        name: "From Bech32m: BIP-0350 abcdef with data",
        input: "abcdef1l7aum6echk45nj3s0wdvt2fg8x9yrzpqzd3ryx",
        expectedOutput: "abcdef: ffbbcdeb38bdab49ca307b9ac5a928398a418820",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32m", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32m: BIP-0350 split HRP",
        input: "split1checkupstagehandshakeupstreamerranterredcaperredlc445v",
        expectedOutput: "split: c5f38b70305f519bf66d85fb6cf03058f3dde463ecd7918f2dc743918f2d",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32m", "HRP: Hex"]
            }
        ],
    },
    {
        name: "From Bech32m: BIP-0350 question mark HRP",
        input: "?1v759aa",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Bech32m", "Hex"]
            }
        ],
    },

    // ============= Bitcoin scriptPubKey Output Format Tests =============
    // Test vectors from BIP-0173 and BIP-0350
    {
        name: "From Bech32: Bitcoin scriptPubKey v0 P2WPKH",
        input: "BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4",
        expectedOutput: "0014751e76e8199196d454941c45d1b3a323f1433bd6",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Bitcoin scriptPubKey"]
            }
        ],
    },
    {
        name: "From Bech32: Bitcoin scriptPubKey v0 P2WSH",
        input: "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7",
        expectedOutput: "00201863143c14c5166804bd19203356da136c985678cd4d27a1b8c6329604903262",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Bitcoin scriptPubKey"]
            }
        ],
    },
    {
        name: "From Bech32: Bitcoin scriptPubKey v1 Taproot (Bech32m)",
        input: "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0",
        expectedOutput: "512079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Bitcoin scriptPubKey"]
            }
        ],
    },
    {
        name: "From Bech32: Bitcoin scriptPubKey v16",
        input: "BC1SW50QGDZ25J",
        expectedOutput: "6002751e",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Bitcoin scriptPubKey"]
            }
        ],
    },
    {
        name: "From Bech32: Bitcoin scriptPubKey v2",
        input: "bc1zw508d6qejxtdg4y5r3zarvaryvaxxpcs",
        expectedOutput: "5210751e76e8199196d454941c45d1b3a323",
        recipeConfig: [
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Bitcoin scriptPubKey"]
            }
        ],
    },

    // ============= Bitcoin SegWit Encoding Tests =============
    {
        name: "To Bech32: Bitcoin SegWit v0 P2WPKH",
        input: "751e76e8199196d454941c45d1b3a323f1433bd6",
        expectedOutput: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32", "Hex", "Bitcoin SegWit", 0]
            }
        ],
    },
    {
        name: "To Bech32: Bitcoin SegWit v0 P2WSH testnet",
        input: "1863143c14c5166804bd19203356da136c985678cd4d27a1b8c6329604903262",
        expectedOutput: "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["tb", "Bech32", "Hex", "Bitcoin SegWit", 0]
            }
        ],
    },
    {
        name: "To Bech32m: Bitcoin Taproot v1",
        input: "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
        expectedOutput: "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32m", "Hex", "Bitcoin SegWit", 1]
            }
        ],
    },
    {
        name: "To Bech32m: Bitcoin SegWit v16",
        input: "751e",
        expectedOutput: "bc1sw50qgdz25j",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32m", "Hex", "Bitcoin SegWit", 16]
            }
        ],
    },

    // ============= Round-trip Tests =============
    {
        name: "Bech32: encode then decode round-trip",
        input: "The quick brown fox jumps over the lazy dog",
        expectedOutput: "The quick brown fox jumps over the lazy dog",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["test", "Bech32", "Raw bytes", "Generic", 0]
            },
            {
                "op": "From Bech32",
                "args": ["Bech32", "Raw"]
            }
        ],
    },
    {
        name: "Bech32m: encode then decode round-trip",
        input: "The quick brown fox jumps over the lazy dog",
        expectedOutput: "The quick brown fox jumps over the lazy dog",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["test", "Bech32m", "Raw bytes", "Generic", 0]
            },
            {
                "op": "From Bech32",
                "args": ["Bech32m", "Raw"]
            }
        ],
    },
    {
        name: "Bech32: binary data round-trip",
        input: "0001020304050607",
        expectedOutput: "0001020304050607",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "To Bech32",
                "args": ["bc", "Bech32", "Raw bytes", "Generic", 0]
            },
            {
                "op": "From Bech32",
                "args": ["Bech32", "Hex"]
            }
        ],
    },
    {
        name: "Bech32: auto-detect round-trip",
        input: "CyberChef Bech32 Test",
        expectedOutput: "CyberChef Bech32 Test",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["cyberchef", "Bech32", "Raw bytes", "Generic", 0]
            },
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Raw"]
            }
        ],
    },
    {
        name: "Bech32m: auto-detect round-trip",
        input: "CyberChef Bech32m Test",
        expectedOutput: "CyberChef Bech32m Test",
        recipeConfig: [
            {
                "op": "To Bech32",
                "args": ["cyberchef", "Bech32m", "Raw bytes", "Generic", 0]
            },
            {
                "op": "From Bech32",
                "args": ["Auto-detect", "Raw"]
            }
        ],
    },
]);
