import PGP from "../../operations/PGP.js";

/**
 * PGP module.
 *
 * Libraries:
 *  - openpgp
 *  - crypto-js
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.PGP = {
    "PGP Encrypt":               PGP.runEncrypt,
    "PGP Decrypt":               PGP.runDecrypt,
    
    "PGP Sign":                  PGP.runSign,
    "PGP Verify":                PGP.runVerify,

    "Sign PGP Detached":         PGP.runSignDetached,
    "Verify PGP Detached":       PGP.runVerifyDetached,

    "Sign PGP Cleartext":        PGP.runSignCleartext,
    "Verify PGP Cleartext":      PGP.runVerifyCleartext,

    "Generate PGP Key Pair":     PGP.runGenKeyPair,
    "Detach PGP Cleartext":      PGP.runVerifyCleartext,

    "Add PGP ASCII Armour":      PGP.runAddArmour,
    "Remove PGP ASCII Armour":   PGP.runAddArmour,
};

export default OpModules;
