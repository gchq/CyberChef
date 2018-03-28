import PGP from "../../operations/PGP.js";


/**
 * PGP module.
 *
 * Libraries:
 *  - kbpgp
 *
 * @author tlwr [toby@toby.codes]
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.PGP = {
    "Generate PGP Key Pair":  PGP.runGenerateKeyPair,
    "PGP Encrypt":            PGP.runEncrypt,
    "PGP Decrypt":            PGP.runDecrypt,
    "PGP Encrypt and Sign":   PGP.runSign,
    "PGP Decrypt and Verify": PGP.runVerify,
};

export default OpModules;
