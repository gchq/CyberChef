import PGP from "../../operations/PGP.js";


/**
 * PGP module.
 *
 * Libraries:
 *  - kbpgp
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.PGP = {
    "Generate PGP Key Pair": PGP.runGenerateKeyPair,
};

export default OpModules;
