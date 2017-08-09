import PublicKey from "../../operations/PublicKey.js";


/**
 * PublicKey module.
 *
 * Libraries:
 *  - jsrsasign
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = self.OpModules || {};

OpModules.PublicKey = {
    "Parse X.509 certificate":  PublicKey.runParseX509,
    "Parse ASN.1 hex string":   PublicKey.runParseAsn1HexString,
    "PEM to Hex":               PublicKey.runPemToHex,
    "Hex to PEM":               PublicKey.runHexToPem,
    "Hex to Object Identifier": PublicKey.runHexToObjectIdentifier,
    "Object Identifier to Hex": PublicKey.runObjectIdentifierToHex,
};

export default OpModules;
