/**
 * DeriveECDHKeyMaterial tests.
 *
 * Test vectors generated with Node.js WebCrypto (crypto.subtle) and cross-verified
 * in both directions (Alice→Bob and Bob→Alice produce identical shared secrets).
 *
 * @author Jacob Marks
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

// Alice's P-256 private key (PKCS#8 PEM)
const ALICE_PRIV_P256 = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg4HBsMvgcOvEQBrYJ
dEXulke/dh5vYiOvfI41AToqfbWhRANCAAQgZgScW2pSpRRTOADLPL5D+8TF6xXx
x9GDOE8V1xYj7arujDYH5935uCdVxXa84lUEw35+afHuh0bDmBDxolmx
-----END PRIVATE KEY-----`;

// Bob's P-256 public key (SPKI PEM)
const BOB_PUB_P256 = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEa+FXJzzko0OZ9DcOaXpLzAkSt7bE
XXVKQqYfsmuelH6QgH86dMR04/bvnhl4bF7YKbMWDlPRHs9haSeR/PhFNg==
-----END PUBLIC KEY-----`;

// Shared secret = x-coordinate of ECDH(Alice_priv, Bob_pub)
const SHARED_SECRET_HEX = "4E030938FB1958545CCEFC98007DFB5F5780497161EB92D004391AF41D431ACF";

// Concat KDF SHA-256 over the shared secret, 32 bytes output, no shared info
const KDF_SHA256_32B_HEX = "61F4121E618428606D52ADC4626990A34BB59C14C4D14C3DD3AF5D082475FA85";

TestRegister.addTests([
    {
        name: "Derive ECDH Key Material: P-256 raw shared secret (None KDF)",
        input: ALICE_PRIV_P256,
        expectedOutput: SHARED_SECRET_HEX,
        recipeConfig: [
            {
                "op": "Derive ECDH Key Material",
                "args": ["PEM", "P-256", "PEM", BOB_PUB_P256, "None", 32, "", "Hex"]
            }
        ]
    },
    {
        name: "Derive ECDH Key Material: P-256 Concat KDF SHA-256 (32 bytes, no shared info)",
        input: ALICE_PRIV_P256,
        expectedOutput: KDF_SHA256_32B_HEX,
        recipeConfig: [
            {
                "op": "Derive ECDH Key Material",
                "args": ["PEM", "P-256", "PEM", BOB_PUB_P256, "Concat KDF SHA-256", 32, "", "Hex"]
            }
        ]
    },
    {
        name: "Derive ECDH Key Material: missing peer public key returns error",
        input: ALICE_PRIV_P256,
        expectedOutput: "Missing key input.",
        recipeConfig: [
            {
                "op": "Derive ECDH Key Material",
                "args": ["PEM", "P-256", "PEM", "", "None", 32, "", "Hex"]
            }
        ]
    },
]);
