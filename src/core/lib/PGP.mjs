/**
 * PGP functions.
 *
 * @author tlwr [toby@toby.codes]
 * @author Matt C [matt@artemisbot.uk]
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */

import kbpgp from "kbpgp";
import promisifyDefault from "es6-promisify";
const promisify = promisifyDefault.promisify;
/**
 * Progress callback
 *
 */
export const ASP = kbpgp.ASP({
    "progress_hook": info => {
        let msg = "";

        switch (info.what) {
            case "guess":
                msg = "Guessing a prime";
                break;
            case "fermat":
                msg = "Factoring prime using Fermat's factorization method";
                break;
            case "mr":
                msg = "Performing Miller-Rabin primality test";
                break;
            case "passed_mr":
                msg = "Passed Miller-Rabin primality test";
                break;
            case "failed_mr":
                msg = "Failed Miller-Rabin primality test";
                break;
            case "found":
                msg = "Prime found";
                break;
            default:
                msg = `Stage: ${info.what}`;
        }

        if (ENVIRONMENT_IS_WORKER())
            self.sendStatusMessage(msg);
    }
});

/**
 * Get size of subkey
 *
 * @param {number} keySize
 * @returns {number}
 */
export function getSubkeySize(keySize) {
    return {
        1024: 1024,
        2048: 1024,
        4096: 2048,
        256:   256,
        384:   256,
    }[keySize];
}

/**
* Import private key and unlock if necessary
*
* @param {string} privateKey
* @param {string} [passphrase]
* @returns {Object}
*/
export async function importPrivateKey(privateKey, passphrase) {
    try {
        const key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
            armored: privateKey,
            opts: {
                "no_check_keys": true
            }
        });
        if (key.is_pgp_locked()) {
            if (passphrase) {
                await promisify(key.unlock_pgp.bind(key))({
                    passphrase
                });
            } else {
                throw "Did not provide passphrase with locked private key.";
            }
        }
        return key;
    } catch (err) {
        throw `Could not import private key: ${err}`;
    }
}

/**
 * Import public key
 *
 * @param {string} publicKey
 * @returns {Object}
 */
export async function importPublicKey (publicKey) {
    try {
        const key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
            armored: publicKey,
            opts: {
                "no_check_keys": true
            }
        });
        return key;
    } catch (err) {
        throw `Could not import public key: ${err}`;
    }
}
