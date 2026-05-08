/**
 * Parse TLS record tests.
 *
 * @auther c65722
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parse TLS record: Truncated header",
        input: "16030300",
        expectedOutput: "[]",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Change Cipher Spec",
        input: "140303000101",
        expectedOutput: '[{"type":"change_cipher_spec","version":"0x0303","length":1,"value":"0x01"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Change Cipher Spec - Truncated before content",
        input: "1403030001",
        expectedOutput: '[{"type":"change_cipher_spec","version":"0x0303","length":1,"truncated":true}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Alert",
        input: "150303001411770b5b5d11078535823266ec79671ed402bced",
        expectedOutput: '[{"type":"alert","version":"0x0303","length":20,"value":"0x11770b5b5d11078535823266ec79671ed402bced"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Alert - Truncated within content",
        input: "150303001411770b5b5d1107853582",
        expectedOutput: '[{"type":"alert","version":"0x0303","length":20,"truncated":true,"value":"0x11770b5b5d1107853582"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Alert - Truncated before content",
        input: "1503030014",
        expectedOutput: '[{"type":"alert","version":"0x0303","length":20,"truncated":true}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Truncated within length",
        input: "1603030032010000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Truncated before length",
        input: "160303003201",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Truncated before msg type",
        input: "1603030032",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Hello Request",
        input: "160303000400000000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":4,"handshakeType":"hello_request"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076000004123443210200010000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated before extensions length",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107600000412344321020001",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated within compression methods",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076000004123443210200",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"truncated":true,"values":["0x00"]},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated before compression methods",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd0510760000041234432102",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"truncated":true,"values":[]},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated before compression methods length",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107600000412344321",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated within cipher suite value",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076000004123443",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{"length":4,"truncated":true,"values":["0x1234"]},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated within cipher suites",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd0510760000041234",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{"length":4,"truncated":true,"values":["0x1234"]},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated before cipher suites",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076000004",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{"length":4,"truncated":true,"values":[]},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated before cipher suites length",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd0510760000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated before session id length",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107600",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated within random",
        input: "16030300320100002e030345cd3a31beaebd2934dd4ec2a151d7a0",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"","cipherSuites":{},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated before random",
        input: "16030300320100002e0303",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"","cipherSuites":{},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated within client version",
        input: "16030300320100002e03",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello","clientVersion":"","random":"","cipherSuites":{},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, No session ID, No extensions - Truncated before client version",
        input: "16030300320100002e",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":50,"truncated":true,"handshakeType":"client_hello"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, No extensions",
        input: "16030300520100004e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae0004123443210200010000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":82,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","sessionID":"0xdc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, No extensions - Truncated within session id",
        input: "16030300520100004e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":82,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, No extensions - Truncated before session id",
        input: "16030300520100004e030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":82,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","cipherSuites":{},"compressionMethods":{},"extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, Extensions",
        input: "160303006f0100006b030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae000412344321020001001d00000010000e00000b6578616d706c652e636f6d00170000ff01000100",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":111,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","sessionID":"0xdc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{"length":29,"values":[{"type":"0x0000","length":16,"value":"0x000e00000b6578616d706c652e636f6d"},{"type":"0x0017","length":0},{"type":"0xff01","length":1,"value":"0x00"}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, Extensions - Truncated within extension value",
        input: "160303006f0100006b030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae000412344321020001001d00000010000e00000b657861",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":111,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","sessionID":"0xdc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{"length":29,"truncated":true,"values":[{"type":"0x0000","length":16,"truncated":true,"value":"0x000e00000b657861"}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, Extensions - Truncated before extension value",
        input: "160303006f0100006b030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae000412344321020001001d00000010",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":111,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","sessionID":"0xdc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{"length":29,"truncated":true,"values":[{"type":"0x0000","length":16,"truncated":true}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, Extensions - Truncated within extension length",
        input: "160303006f0100006b030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae000412344321020001001d000000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":111,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","sessionID":"0xdc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{"length":29,"truncated":true,"values":[]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, Extensions - Truncated before extension length",
        input: "160303006f0100006b030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae000412344321020001001d0000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":111,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","sessionID":"0xdc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{"length":29,"truncated":true,"values":[]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, Extensions - Truncated within extension type",
        input: "160303006f0100006b030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae000412344321020001001d00",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":111,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","sessionID":"0xdc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{"length":29,"truncated":true,"values":[]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Hello, Session ID, Extensions - Truncated before extension type",
        input: "160303006f0100006b030345cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd05107620dc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae000412344321020001001d",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":111,"truncated":true,"handshakeType":"client_hello","clientVersion":"0x0303","random":"0x45cd3a31beaebd2934dd4ec2a151d7a054eab8bc0e4e5b9d4b9abdaacd051076","sessionID":"0xdc78c85fdcee405ebb7963543771005a3d1b7dbf88fb9f8df12e4f7ea525e1ae","cipherSuites":{"length":4,"values":["0x1234","0x4321"]},"compressionMethods":{"length":2,"values":["0x00","0x01"]},"extensions":{"length":29,"truncated":true,"values":[]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions",
        input: "160303002c02000028030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132004321010000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated before extensions length",
        input: "160303002c02000028030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113200432101",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated before compression method",
        input: "160303002c02000028030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132004321",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","cipherSuite":"0x4321","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated within cipher suite",
        input: "160303002c02000028030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b011320043",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","cipherSuite":"","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated before cipher suite",
        input: "160303002c02000028030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113200",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","cipherSuite":"","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated before session id length",
        input: "160303002c02000028030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","cipherSuite":"","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated within random",
        input: "160303002c02000028030309684ab9c0f6e739e308cd42a18a73d9a",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"","cipherSuite":"","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated before random",
        input: "160303002c0200002803030",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"","cipherSuite":"","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated within server version",
        input: "160303002c0200002803",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello","serverVersion":"","random":"","cipherSuite":"","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, No session ID, No extensions - Truncated before server version",
        input: "160303002c02000028",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":44,"truncated":true,"handshakeType":"server_hello"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, No extension",
        input: "160303004c02000048030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220a4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b95984321010000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":76,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","sessionID":"0xa4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, No extension - Truncated within session id",
        input: "160303004c02000048030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220a4fe3d1e9a7dc5ce3d9341b4d48a2df7",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":76,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","cipherSuite":"","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, No extension - Truncated before session id",
        input: "160303004c02000048030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":76,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","cipherSuite":"","compressionMethod":"","extensions":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, Extensions",
        input: "160303005902000055030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220a4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598432101000d00000000ff0100010000170000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":89,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","sessionID":"0xa4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{"length":13,"values":[{"type":"0x0000","length":0},{"type":"0xff01","length":1,"value":"0x00"},{"type":"0x0017","length":0}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, Extensions - Truncated before extension value",
        input: "160303005902000055030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220a4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598432101000d00000000ff010001",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":89,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","sessionID":"0xa4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{"length":13,"truncated":true,"values":[{"type":"0x0000","length":0},{"type":"0xff01","length":1,"truncated":true}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, Extensions - Truncated within extension length",
        input: "160303005902000055030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220a4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598432101000d00000000ff0100",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":89,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","sessionID":"0xa4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{"length":13,"truncated":true,"values":[{"type":"0x0000","length":0}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, Extensions - Truncated before extension length",
        input: "160303005902000055030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220a4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598432101000d00000000ff01",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":89,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","sessionID":"0xa4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{"length":13,"truncated":true,"values":[{"type":"0x0000","length":0}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, Extensions - Truncated within extension type",
        input: "160303005902000055030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220a4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598432101000d00000000ff",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":89,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","sessionID":"0xa4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{"length":13,"truncated":true,"values":[{"type":"0x0000","length":0}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello, Session ID, Extensions - Truncated before extension type",
        input: "160303005902000055030309684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b0113220a4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598432101000d00000000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":89,"truncated":true,"handshakeType":"server_hello","serverVersion":"0x0303","random":"0x09684ab9c0f6e739e308cd42a18a73d9adc579378aa6b4228df7ecc422b01132","sessionID":"0xa4fe3d1e9a7dc5ce3d9341b4d48a2df755a0fd83876d0330018306707c9b9598","cipherSuite":"0x4321","compressionMethod":"0x01","extensions":{"length":13,"truncated":true,"values":[{"type":"0x0000","length":0}]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - New Session Ticket",
        input: "16030300ca040000c60000070800c0626f6889ce97edae08b0870505f9251e1d0713438ed014ac8f5e6969cf9e500aaba6080dfed5474ec85ff48d882d526cdae7f21d51b4beeb0be83fb822f18d22d2086b7519b29114364af034ac9a6915562ba686b81917bcb89fc4a750284470e7d67d8d33647e245e5e789f547d6a1be91ef0985bbfcf3b88760586b8f02570e0b7e8547fdad75530bc0261756ec994dfc725c8551c762f26e105e62290cd43773ea9e8a42ac8ac21467053240a29ef93c2e34c2f13ce8ff494d8c64f727248",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":202,"handshakeType":"new_session_ticket","ticketLifetimeHint":"1800s","ticket":"0x626f6889ce97edae08b0870505f9251e1d0713438ed014ac8f5e6969cf9e500aaba6080dfed5474ec85ff48d882d526cdae7f21d51b4beeb0be83fb822f18d22d2086b7519b29114364af034ac9a6915562ba686b81917bcb89fc4a750284470e7d67d8d33647e245e5e789f547d6a1be91ef0985bbfcf3b88760586b8f02570e0b7e8547fdad75530bc0261756ec994dfc725c8551c762f26e105e62290cd43773ea9e8a42ac8ac21467053240a29ef93c2e34c2f13ce8ff494d8c64f727248"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - New Session Ticket - Truncated within ticket",
        input: "16030300ca040000c60000070800c0626f6889ce97edae08b0870505f9251e1d0713438ed014ac8f5e6969cf9e500aaba6080dfed5474ec85ff48d882d526cdae7f21d51b4beeb0be83fb822f18d22d2086b7519b29114364af034ac9a6915562ba686b81917bcb89fc4a750284470",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":202,"truncated":true,"handshakeType":"new_session_ticket","ticketLifetimeHint":"1800s","ticket":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - New Session Ticket - Truncated before ticket",
        input: "16030300ca040000c60000070800c0",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":202,"truncated":true,"handshakeType":"new_session_ticket","ticketLifetimeHint":"1800s","ticket":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - New Session Ticket - Truncated within ticket length",
        input: "16030300ca040000c60000070800",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":202,"truncated":true,"handshakeType":"new_session_ticket","ticketLifetimeHint":"1800s","ticket":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - New Session Ticket - Truncated before ticket length",
        input: "16030300ca040000c600000708",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":202,"truncated":true,"handshakeType":"new_session_ticket","ticketLifetimeHint":"1800s","ticket":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - New Session Ticket - Truncated within ticket lifetime hint",
        input: "16030300ca040000c6000007",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":202,"truncated":true,"handshakeType":"new_session_ticket","ticketLifetimeHint":"","ticket":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - New Session Ticket - Truncated before ticket lifetime hint",
        input: "16030300ca040000c6",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":202,"truncated":true,"handshakeType":"new_session_ticket"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate",
        input: "1603030acf0b000acb000ac80002923082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf00029430820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d000599308205953082037da00302010202141521d02e945395325d99051e616ad01c97627ee2300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65332e636f6d3020170d3234303932323130303232325a180f32313234303832393130303232325a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65332e636f6d30820222300d06092a864886f70d01010105000382020f003082020a0282020100bd7c65b5c2c7027e4eb77722f84d7dc9b45f9fae45c59dd0035340b3d8fec5ea644ac4563c4260b2c078880bf81ffec0e4cd9193b708ded6431c0e7d9e8f45d595712b733262f8f62f1b4c3ae69f1f39bc68a39b1b5699adddfd7c51b83f59479fe5ffe0faef6376b1c5cea434aa9db85e792f989b5977c6fda87f7c00f79e67e417d826c1ab1fa304163414fc6321790f07cffede43170718536e5fe3128f6d101de82a7b1de37f89e61d822f09eef7304213d41998a49e5ab6b1a7eb1ab4ece21f005061828567047aaf640cff2f87c85eefc2d3a91ebf48aaa893e59451acbea894975df2587b203302fb39755f2e21e012d1fc89df86ec53723df497318d8b44eee9334a2699ad403a7df6719747bc37429d3c47ada354308380b09bb6d76e21dc1735a1479470c94c0282bbbdf5e2e6af60cf1f2e9b8dad20e45307729813eaaf584b31984e036d5452dfae47a4b8640bdf4c02ecf4ce4240d64d2ab895cbf512558712533cd3fc6838bfd24a2a588b9f1b1848bb0d6b1cd77345add6e9dc547a7b95b027bb18e96f30c4f9cd780c96984472b70ea39a7acdff9c649ac4a59e12a5a72d436036b31fa130f6a72c717b3df403113ee3b3d1605f76e57e96b83e501ed5fe9200e2ea9aefa797fa0c8b6c5d8f12e4bea7359be03d3ca35d3e22e20639fc7e03c990a494402268a08fb1589dc086995b0ba3c9ffe255b6b7cf0203010001a3533051301d0603551d0e041604143e8bac5b946c2eff6a8cb337081fa4fe6ce07312301f0603551d230418301680143e8bac5b946c2eff6a8cb337081fa4fe6ce07312300f0603551d130101ff040530030101ff300d06092a864886f70d01010b0500038202010081ad7acd39e5cc60682c962d367a84d32191e5b465ed531f617daf5fd33394a3ac9a42116d34211708ada0d9bd2cbf1d4a4175d67c87116c7495ed372c585ae6bdfe0bc713aa1afd0cc3f025c322dc45be0c3be982918dea938deaaa9e5bfd1fccb3eb8a111aec0498f64bdb16f6cb07bcecd85f6b9e445cf596d85596b4f0d7147d73cbc26000d374085e9c69f56262827fa3d5a037cf1d2cfe0f0eca779b101da08a8d732ecf584a193d93449697ee24ed6f41f9735ea3a3f206f8e6b5bf0b0ff3488a31d0feaccd701a144d35c265dc32d2e650f855debbfa5bd2d9dc2d80a1b8f81013f8049bd7be83a3ec5ae554c19fd4241a6686d4094ff073022d1f16afa5a0297e54a9b56fd469b44c6904d2b542f83ff0cf6af3b649f408f72f7cb49be5583ec4b1d912a677ae1fd81779506af9b688d8b753fdb0451925752fba8efcdaedf935f2a264caa1f4fe746ac6c339cca647b25f0bd2139205e67b6e90987da8b993b85037931443a6652426ab779db090cf08b28fed862a0ccdde1568bd930bf2d39ab7b850f97925e9bda13a6ee5166e48959711065c054bdf5ff04e4b8d5120caabca40c7707da3bb10f2ae7a00a6e56b012a6c00daaec5ddf0b63f61622aeeb81a71a5aa17508e5471e777bed8d09023c24280495adc38ffc3615dd20b139d32d7cc30b0690ab7f3e47a0131fa3d81929e64c6b9c6b363da410f6e5e",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":2767,"handshakeType":"certificate","certificateList":{"length":2760,"values":["0x3082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf","0x30820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d","0x308205953082037da00302010202141521d02e945395325d99051e616ad01c97627ee2300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65332e636f6d3020170d3234303932323130303232325a180f32313234303832393130303232325a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65332e636f6d30820222300d06092a864886f70d01010105000382020f003082020a0282020100bd7c65b5c2c7027e4eb77722f84d7dc9b45f9fae45c59dd0035340b3d8fec5ea644ac4563c4260b2c078880bf81ffec0e4cd9193b708ded6431c0e7d9e8f45d595712b733262f8f62f1b4c3ae69f1f39bc68a39b1b5699adddfd7c51b83f59479fe5ffe0faef6376b1c5cea434aa9db85e792f989b5977c6fda87f7c00f79e67e417d826c1ab1fa304163414fc6321790f07cffede43170718536e5fe3128f6d101de82a7b1de37f89e61d822f09eef7304213d41998a49e5ab6b1a7eb1ab4ece21f005061828567047aaf640cff2f87c85eefc2d3a91ebf48aaa893e59451acbea894975df2587b203302fb39755f2e21e012d1fc89df86ec53723df497318d8b44eee9334a2699ad403a7df6719747bc37429d3c47ada354308380b09bb6d76e21dc1735a1479470c94c0282bbbdf5e2e6af60cf1f2e9b8dad20e45307729813eaaf584b31984e036d5452dfae47a4b8640bdf4c02ecf4ce4240d64d2ab895cbf512558712533cd3fc6838bfd24a2a588b9f1b1848bb0d6b1cd77345add6e9dc547a7b95b027bb18e96f30c4f9cd780c96984472b70ea39a7acdff9c649ac4a59e12a5a72d436036b31fa130f6a72c717b3df403113ee3b3d1605f76e57e96b83e501ed5fe9200e2ea9aefa797fa0c8b6c5d8f12e4bea7359be03d3ca35d3e22e20639fc7e03c990a494402268a08fb1589dc086995b0ba3c9ffe255b6b7cf0203010001a3533051301d0603551d0e041604143e8bac5b946c2eff6a8cb337081fa4fe6ce07312301f0603551d230418301680143e8bac5b946c2eff6a8cb337081fa4fe6ce07312300f0603551d130101ff040530030101ff300d06092a864886f70d01010b0500038202010081ad7acd39e5cc60682c962d367a84d32191e5b465ed531f617daf5fd33394a3ac9a42116d34211708ada0d9bd2cbf1d4a4175d67c87116c7495ed372c585ae6bdfe0bc713aa1afd0cc3f025c322dc45be0c3be982918dea938deaaa9e5bfd1fccb3eb8a111aec0498f64bdb16f6cb07bcecd85f6b9e445cf596d85596b4f0d7147d73cbc26000d374085e9c69f56262827fa3d5a037cf1d2cfe0f0eca779b101da08a8d732ecf584a193d93449697ee24ed6f41f9735ea3a3f206f8e6b5bf0b0ff3488a31d0feaccd701a144d35c265dc32d2e650f855debbfa5bd2d9dc2d80a1b8f81013f8049bd7be83a3ec5ae554c19fd4241a6686d4094ff073022d1f16afa5a0297e54a9b56fd469b44c6904d2b542f83ff0cf6af3b649f408f72f7cb49be5583ec4b1d912a677ae1fd81779506af9b688d8b753fdb0451925752fba8efcdaedf935f2a264caa1f4fe746ac6c339cca647b25f0bd2139205e67b6e90987da8b993b85037931443a6652426ab779db090cf08b28fed862a0ccdde1568bd930bf2d39ab7b850f97925e9bda13a6ee5166e48959711065c054bdf5ff04e4b8d5120caabca40c7707da3bb10f2ae7a00a6e56b012a6c00daaec5ddf0b63f61622aeeb81a71a5aa17508e5471e777bed8d09023c24280495adc38ffc3615dd20b139d32d7cc30b0690ab7f3e47a0131fa3d81929e64c6b9c6b363da410f6e5e"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate - Truncated within certificate",
        input: "1603030acf0b000acb000ac80002923082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf00029430820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d0005990x308205953082037da00302010202141521d02e945395325d99051e616ad01c97627ee2300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65332e636f6d3020170d3234303932323130303232325a180f32313234303832393130303232325a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65332e636f6d30820222300d06092a864886f70d01010105000382020f003082020a0282020100bd7c65b5c2c7027e4eb77722f84d7dc9b45f9fae45c59dd0035340b3d8fec5ea644ac4563c4260b2c078880bf81ffec0e4cd9193b708ded6431c0e7d9e8f45d595712b733262f8f62f1b4c3ae69f1f39bc68a39b1b5699adddfd7c51b83f59479fe5ffe0faef6376b1c5cea434aa9db85e792f989b5977c6fda87f7c00f79e67e417d826c1ab1fa304163414fc6321790f07cffede43170718536e5fe3128f6d101de82a7b1de37f89e61d822f09eef7304213d41998a49e5ab6b1a7eb1ab4ece21f005061828567047aaf640cff2f87c85eefc2d3a91ebf48aaa893e59451acbea894975df2587b203302fb39755f2e21e012d1fc89df86ec53723df497318d8b44eee9334a2699ad403a7df6719747bc37429d3c47ada354308380b09bb6d76e21dc1735a1479470c94c0282bbbdf5e2e6af60cf1f2e9b8dad20e45307729813eaaf584b31984e036d5452dfae47a4b8640bdf4c02ecf4ce4240d64d2ab895cbf512558712533cd3fc6838bfd24a2a588b9f1b1848bb0d6b1cd77345add6e9dc547a7b95b027bb18e96f30c4f9cd780c96984472b70ea39a7acdff9c649ac4a5",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":2767,"truncated":true,"handshakeType":"certificate","certificateList":{"length":2760,"truncated":true,"values":["0x3082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf","0x30820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate - Truncated before certificate",
        input: "1603030acf0b000acb000ac80002923082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf00029430820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d000599",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":2767,"truncated":true,"handshakeType":"certificate","certificateList":{"length":2760,"truncated":true,"values":["0x3082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf","0x30820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate - Truncated within certificate length",
        input: "1603030acf0b000acb000ac80002923082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf00029430820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d0005",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":2767,"truncated":true,"handshakeType":"certificate","certificateList":{"length":2760,"truncated":true,"values":["0x3082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf","0x30820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate - Truncated before certificate length",
        input: "1603030acf0b000acb000ac80002923082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf00029430820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":2767,"truncated":true,"handshakeType":"certificate","certificateList":{"length":2760,"truncated":true,"values":["0x3082028e308201f7a003020102021468f6f88ecf1bf3d14e7503ef2e1b789cb77b86c3300d06092a864886f70d01010b05003058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d3020170d3234303932323039353335385a180f32313234303832393039353335385a3058310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643114301206035504030c0b6578616d706c652e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100c3df3e5745f05b3aa220ce4108838107653c3ae9584ace27d7088506ebdc3531afbe6265719278682eaa4fec7ae1f319395d356be79477bc62edbe7207d96f5717e9bd9083fdcc797c1b8e38bcf9fd08df6f101bc2a06101ddce6be2f5a0de80ebc8fdce2538867c1d6a84acef26b2068c5d27771abcee071bcf378899cb32730203010001a3533051301d0603551d0e041604144c9b134c1575c51ae9d03c4020da7541278ad928301f0603551d230418301680144c9b134c1575c51ae9d03c4020da7541278ad928300f0603551d130101ff040530030101ff300d06092a864886f70d01010b05000381810012a06cced33d721b1d7912ff0b190b74524ddfdeca103aba0f168f4f15f57212ba7d66328e48b021f32cfec84f65d79821bc1fe9f472f60c094e537160708a48a0898dbf613cece86892cf48fcd598757aa4379e18673626be2f048e35f585086ea7a3766ce50a14ca6f691b369c965e062f40619cde6262ed8019b522e76eaf","0x30820290308201f9a00302010202142a3329f5e2e92940318cecd036ff135525b1d491300d06092a864886f70d01010b05003059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d3020170d3234303932323039353531375a180f32313234303832393039353531375a3059310b30090603550406130258583115301306035504070c0c44656661756c742043697479311c301a060355040a0c1344656661756c7420436f6d70616e79204c74643115301306035504030c0c6578616d706c65322e636f6d30819f300d06092a864886f70d010101050003818d0030818902818100b27c861d957c49111b4f37f65bc142da564429c74a925e3de6d9add55ccfccf1316a5002b3ed2d35ec9822499e7256f9caaa2191010df354185c63a32c8d080ba49510953d7ec2210685030564be69a9f2262a9da22f3623b2a9b032f3a82b1c31ce11336c288fc3d5f63565aacc8c0f85ebaad6af2cd3505a7cf3945ca2ca690203010001a3533051301d0603551d0e0416041485478b7936ecd417647e9d8582d3f68fc670d839301f0603551d2304183016801485478b7936ecd417647e9d8582d3f68fc670d839300f0603551d130101ff040530030101ff300d06092a864886f70d01010b050003818100652656aef44c7a507a376de248cd1b36028fb1b0292593f88eb36b429f7de4c668aef7b0d862c9314e5d870f7c28353022657a7de07ec69505a54e48337ab6ba425bfd8865b720f1f2e86c92edaa261fd73e44856ac45c4d9378c86adb96b6f999f61e5f651cb885e06a3d909b5fa79458941bea36785ea585aeb5025032a18d"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate - Truncated within certificate list length",
        input: "1603030acf0b000acb000a",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":2767,"truncated":true,"handshakeType":"certificate","certificateList":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate - Truncated before certificate list length",
        input: "1603030acf0b000acb",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":2767,"truncated":true,"handshakeType":"certificate"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Key Exchange",
        input: "16030300840c000080a90c12174921d7044303107b6e37523957439b436e57904e82702784bfc261a8f0a7e4143a77144357d29ee322f25e4fce393ac7570ee26c378298a6ad18fd8b87175e472c7c07b97699f72958e0af489df00d34e5e03dde2e09dfe06d448651ee45c07fadc05e0d1585589e3715a04b935e72bc28c34593712acef7883ed69a",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":132,"handshakeType":"server_key_exchange","handshakeValue":"0xa90c12174921d7044303107b6e37523957439b436e57904e82702784bfc261a8f0a7e4143a77144357d29ee322f25e4fce393ac7570ee26c378298a6ad18fd8b87175e472c7c07b97699f72958e0af489df00d34e5e03dde2e09dfe06d448651ee45c07fadc05e0d1585589e3715a04b935e72bc28c34593712acef7883ed69a"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Key Exchange - Truncated within content",
        input: "16030300840c000080a90c12174921d7044303107b6e37523957439b436e57904e82702784bfc261a8f0a7e4143a77144357d29ee322f25e4fce393ac7570ee26c378298a6ad18fd8b",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":132,"truncated":true,"handshakeType":"server_key_exchange","handshakeValue":"0xa90c12174921d7044303107b6e37523957439b436e57904e82702784bfc261a8f0a7e4143a77144357d29ee322f25e4fce393ac7570ee26c378298a6ad18fd8b"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Key Exchange - Truncated before content",
        input: "16030300840c000080",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":132,"truncated":true,"handshakeType":"server_key_exchange"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, No certificate authorities",
        input: "160303001f0d00001b040102030400120601060206030301030203030201020202030000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":31,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202","0x0203"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities",
        input: "16030300470d000043040102030400120601060206030301030203030201020202030028000c546bf13f358cf3ddc1eef77d001813b3cdd60a34fc74f2e4ef2344cfd2156924d8d2810e2c86",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202","0x0203"]},"certificateAuthorities":{"length":40,"values":["0x546bf13f358cf3ddc1eef77d","0x13b3cdd60a34fc74f2e4ef2344cfd2156924d8d2810e2c86"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated within certificate authority",
        input: "16030300470d000043040102030400120601060206030301030203030201020202030028000c546bf13f358cf3ddc1eef77d001813b3cdd60a34fc74f2e4ef23",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202","0x0203"]},"certificateAuthorities":{"length":40,"truncated":true,"values":["0x546bf13f358cf3ddc1eef77d"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated before certificate authority",
        input: "16030300470d000043040102030400120601060206030301030203030201020202030028000c546bf13f358cf3ddc1eef77d0018",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202","0x0203"]},"certificateAuthorities":{"length":40,"truncated":true,"values":["0x546bf13f358cf3ddc1eef77d"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated within certificate authority length",
        input: "16030300470d000043040102030400120601060206030301030203030201020202030028000c546bf13f358cf3ddc1eef77d00",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202","0x0203"]},"certificateAuthorities":{"length":40,"truncated":true,"values":["0x546bf13f358cf3ddc1eef77d"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated before certificate authority length",
        input: "16030300470d000043040102030400120601060206030301030203030201020202030028000c546bf13f358cf3ddc1eef77d",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202","0x0203"]},"certificateAuthorities":{"length":40,"truncated":true,"values":["0x546bf13f358cf3ddc1eef77d"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated within certificate authorities length",
        input: "16030300470d0000430401020304001206010602060303010302030302010202020300",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202","0x0203"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated before certificate authorities length",
        input: "16030300470d00004304010203040012060106020603030103020303020102020203",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202","0x0203"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated within supported signature algorithm",
        input: "16030300470d000043040102030400120601060206030301030203030201020202",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"truncated":true,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated before supported signature algorithm",
        input: "16030300470d0000430401020304001206010602060303010302030302010202",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{"length":18,"truncated":true,"values":["0x0601","0x0602","0x0603","0x0301","0x0302","0x0303","0x0201","0x0202"]}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated within supported signature algorithms length",
        input: "16030300470d000043040102030400",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated before supported signature algorithms length",
        input: "16030300470d0000430401020304",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"values":["0x01","0x02","0x03","0x04"]},"supportedSignatureAlgorithms":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated within certificate types",
        input: "16030300470d00004304010203",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"truncated":true,"values":["0x01","0x02","0x03"]},"supportedSignatureAlgorithms":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated before certificate types",
        input: "16030300470d00004304",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request","certificateTypes":{"length":4,"truncated":true,"values":[]},"supportedSignatureAlgorithms":{}}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Request, Certificate authorities - Truncated before certificate types length",
        input: "16030300470d000043",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":71,"truncated":true,"handshakeType":"certificate_request"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Server Hello Done",
        input: "16030300040e000000",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":4,"handshakeType":"server_hello_done"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Verify",
        input: "16030301080f000104040101009310d3dda84b149a00258f0bb4501e710f7ed70a45cf4f0bab39dac1a456027f0f6167924f08a8221613bcf46c27e91458d05163200fd1bf3673351d74693c08c6640635d4e9f84e9568e39d3346e3ff2f3eacf9887d738935d8b07e42659dd3b212662bf028bcefe98b686a1a83fb2f24aead94cccd3f6b26c9d42ba43254d2a93d1b85ae2d0ee7c7170aac3397fa6de77183d30c99e6bb0e81f925793f64d8b490cb74d051896ebee9086c7606905b21bab6ebd9866a451958f7d839134aeb335b2ad5f9ce89a69321a099c081b5166332cf2bb231dd135b79cf94218e6ada94644eaa09ae6c0ec0164e3cca631c0f4b7b9a2d59fb40909ec88805e61b5917",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":264,"handshakeType":"certificate_verify","algorithmHash":"0x04","algorithmSignature":"0x01","signature":"0x9310d3dda84b149a00258f0bb4501e710f7ed70a45cf4f0bab39dac1a456027f0f6167924f08a8221613bcf46c27e91458d05163200fd1bf3673351d74693c08c6640635d4e9f84e9568e39d3346e3ff2f3eacf9887d738935d8b07e42659dd3b212662bf028bcefe98b686a1a83fb2f24aead94cccd3f6b26c9d42ba43254d2a93d1b85ae2d0ee7c7170aac3397fa6de77183d30c99e6bb0e81f925793f64d8b490cb74d051896ebee9086c7606905b21bab6ebd9866a451958f7d839134aeb335b2ad5f9ce89a69321a099c081b5166332cf2bb231dd135b79cf94218e6ada94644eaa09ae6c0ec0164e3cca631c0f4b7b9a2d59fb40909ec88805e61b5917"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Verify - Truncated within signature",
        input: "16030301080f000104040101009310d3dda84b149a00258f0bb4501e710f7ed70a45cf4f0bab39dac1a456027f0f6167924f08a8221613bcf46c27e91458d05163200fd1bf3673351d74693c08c6640635d4e9f84e9568e39d3346e3ff2f3eacf9887d738935d8b07e42659dd3b212662bf028bcefe98b686a1a83fb2f24aead94cccd3f6b26c9d42ba43254d2",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":264,"truncated":true,"handshakeType":"certificate_verify","algorithmHash":"0x04","algorithmSignature":"0x01","signature":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Verify - Truncated before signature",
        input: "16030301080f00010404010100",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":264,"truncated":true,"handshakeType":"certificate_verify","algorithmHash":"0x04","algorithmSignature":"0x01","signature":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Verify - Truncated within signature length",
        input: "16030301080f000104040101",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":264,"truncated":true,"handshakeType":"certificate_verify","algorithmHash":"0x04","algorithmSignature":"0x01","signature":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Verify - Truncated before signature length",
        input: "16030301080f0001040401",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":264,"truncated":true,"handshakeType":"certificate_verify","algorithmHash":"0x04","algorithmSignature":"0x01","signature":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Verify - Truncated before algorithm.signature",
        input: "16030301080f00010404",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":264,"truncated":true,"handshakeType":"certificate_verify","algorithmHash":"0x04","algorithmSignature":"","signature":""}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Certificate Verify - Truncated before algorithm.hash",
        input: "16030301080f000104",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":264,"truncated":true,"handshakeType":"certificate_verify"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Key Exchange",
        input: "1603030084100000802b45af77539975e975c9389030193bb6d7841d870e058850a5aac5f8ded75d243ae8bec2bc8ba4e683eba22d5820b555c69f97001aa7d56cba1839588e7f1602ad0b4cb7319fc52694a67f1e381b4d8a581823410920717ee85ef352dea39097e6b131bdfeb3913f0f7eaa3b3882abe4615cc13e2a133558adff159771dfdc8d",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":132,"handshakeType":"client_key_exchange","handshakeValue":"0x2b45af77539975e975c9389030193bb6d7841d870e058850a5aac5f8ded75d243ae8bec2bc8ba4e683eba22d5820b555c69f97001aa7d56cba1839588e7f1602ad0b4cb7319fc52694a67f1e381b4d8a581823410920717ee85ef352dea39097e6b131bdfeb3913f0f7eaa3b3882abe4615cc13e2a133558adff159771dfdc8d"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Key Exchange - Truncated within content",
        input: "1603030084100000802b45af77539975e975c9389030193bb6d7841d870e058850a5aac5f8ded75d243ae8bec2bc8ba4e683eba22d5820b555c69f97001aa7d56cba1839588e7f1602",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":132,"truncated":true,"handshakeType":"client_key_exchange","handshakeValue":"0x2b45af77539975e975c9389030193bb6d7841d870e058850a5aac5f8ded75d243ae8bec2bc8ba4e683eba22d5820b555c69f97001aa7d56cba1839588e7f1602"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Client Key Exchange - Truncated before content",
        input: "160303008410000080",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":132,"truncated":true,"handshakeType":"client_key_exchange"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Finished",
        input: "1603030028ed83078db91b046358065ca3f7ea4494af3deb59bf72f522e15ef9071c52becb0069a093b23994c1",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":40,"handshakeType":"finished","handshakeValue":"0xed83078db91b046358065ca3f7ea4494af3deb59bf72f522e15ef9071c52becb0069a093b23994c1"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Finished - Truncated within ciphertext",
        input: "1603030028ed83078db91b046358065ca3f7ea4494af3deb59",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":40,"truncated":true,"handshakeType":"finished","handshakeValue":"0xed83078db91b046358065ca3f7ea4494af3deb59"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Unknown",
        input: "1603030024120000203c210cd33fd2a7379ae02700b208ae7357f98b46a1dea566c4061acfb6e188bc",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":36,"handshakeType":"18","handshakeValue":"0x3c210cd33fd2a7379ae02700b208ae7357f98b46a1dea566c4061acfb6e188bc"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Unknown - Truncated within content",
        input: "1603030024120000203c210cd33fd2a7379ae02700b208",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":36,"truncated":true,"handshakeType":"18","handshakeValue":"0x3c210cd33fd2a7379ae02700b208"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Handshake - Unknown - Truncated before content",
        input: "160303002412000020",
        expectedOutput: '[{"type":"handshake","version":"0x0303","length":36,"truncated":true,"handshakeType":"18"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Application Data",
        input: "1703030064bbfd70f5d2ae0fe62262830040c264fa578bf2000ea50bb2c92d4837727f5db06b580e43896eaa1a0042b4fc3eb5aca6731705f5d957c481bade800cf1cd066dfd997851af09e820e84ee0b531b4eaccfd8b5f28b74d756a8aeadf78eefb2d26e46b5b69",
        expectedOutput: '[{"type":"application_data","version":"0x0303","length":100,"value":"0xbbfd70f5d2ae0fe62262830040c264fa578bf2000ea50bb2c92d4837727f5db06b580e43896eaa1a0042b4fc3eb5aca6731705f5d957c481bade800cf1cd066dfd997851af09e820e84ee0b531b4eaccfd8b5f28b74d756a8aeadf78eefb2d26e46b5b69"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Application Data - Truncated within content",
        input: "1703030064bbfd70f5d2ae0fe62262830040c264fa578bf2000ea50bb2c92d4837727f5db06b580e43896eaa1a0042b4fc3eb5aca67317",
        expectedOutput: '[{"type":"application_data","version":"0x0303","length":100,"truncated":true,"value":"0xbbfd70f5d2ae0fe62262830040c264fa578bf2000ea50bb2c92d4837727f5db06b580e43896eaa1a0042b4fc3eb5aca67317"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Application Data - Truncated before content",
        input: "1703030064",
        expectedOutput: '[{"type":"application_data","version":"0x0303","length":100,"truncated":true}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Unknown",
        input: "1c03030020c02beaae1dd2e9ec46c4d201d72105457af1f8e92d56ad95f339398e5774cb6f",
        expectedOutput: '[{"type":"28","version":"0x0303","length":32,"value":"0xc02beaae1dd2e9ec46c4d201d72105457af1f8e92d56ad95f339398e5774cb6f"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Unknown - Truncated within content",
        input: "1c03030020c02beaae1dd2e9ec46c4d201d7210545",
        expectedOutput: '[{"type":"28","version":"0x0303","length":32,"truncated":true,"value":"0xc02beaae1dd2e9ec46c4d201d7210545"}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    },
    {
        name: "Parse TLS record: Unknown - Truncated before content",
        input: "1c03030020",
        expectedOutput: '[{"type":"28","version":"0x0303","length":32,"truncated":true}]',
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Parse TLS record",
                args: []
            },
            {
                op: "JSON Minify",
                args: []
            }
        ]
    }
]);
