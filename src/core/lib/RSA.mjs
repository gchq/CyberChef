/**
 * RSA resources.
 *
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import forge from "node-forge";

export const MD_ALGORITHMS = {
    "SHA-1": forge.md.sha1,
    MD5: forge.md.md5,
    "SHA-256": forge.md.sha256,
    "SHA-384": forge.md.sha384,
    "SHA-512": forge.md.sha512,
};
