/**
 * PGP node tests.
 *
 * @author C85297 [95289555+C85297@users.noreply.github.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "assert";
import kbpgp from "kbpgp";
import * as es6promisify from "es6-promisify";

import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";
import GeneratePGPKeyPair from "../../../src/core/operations/GeneratePGPKeyPair.mjs";

const promisify = es6promisify.default ? es6promisify.default.promisify : es6promisify.promisify;

const PUBLIC_KEY_BLOCK = /-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]*-----END PGP PUBLIC KEY BLOCK-----/;

/**
 * Generate a PGP key pair and import the generated public key.
 *
 * @param {string} keyType
 * @returns {Promise<Object>}
 */
async function generateAndImportPublicKey(keyType) {
    const operation = new GeneratePGPKeyPair();
    const generatedKeyPair = await operation.run("", [
        keyType,
        "",
        "User",
        "akb@notreal.gchq.gov.uk"
    ]);

    const publicKey = generatedKeyPair.match(PUBLIC_KEY_BLOCK);

    assert(publicKey, "Generated key pair should contain an ASCII-armoured public key");

    return promisify(kbpgp.KeyManager.import_from_armored_pgp)({
        armored: publicKey[0],
        opts: {
            "no_check_keys": true
        }
    });
}

TestRegister.addApiTests([
    it("Generate PGP Key Pair: ECC keys should include ECDSA signing and ECDH encryption subkeys", async () => {
        const publicKey = await generateAndImportPublicKey("ECC-256");
        const subkeyAlgorithms = publicKey.subkeys.map(subkey => subkey.key.type);

        assert.strictEqual(
            publicKey.primary.key.type,
            kbpgp.const.openpgp.public_key_algorithms.ECDSA,
            "Generated ECC PGP primary key should use ECDSA"
        );

        assert(
            subkeyAlgorithms.includes(kbpgp.const.openpgp.public_key_algorithms.ECDSA),
            "Generated ECC PGP key should include an ECDSA signing subkey"
        );

        assert(
            subkeyAlgorithms.includes(kbpgp.const.openpgp.public_key_algorithms.ECDH),
            "Generated ECC PGP key should include an ECDH encryption subkey"
        );
    })
]);
