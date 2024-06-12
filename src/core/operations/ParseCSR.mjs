/**
 * @author jkataja
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";
import { formatDnObj } from "../lib/PublicKey.mjs";
import Utils from "../Utils.mjs";

/**
 * Parse CSR operation
 */
class ParseCSR extends Operation {

    /**
     * ParseCSR constructor
     */
    constructor() {
        super();

        this.name = "Parse CSR";
        this.module = "PublicKey";
        this.description = "Parse Certificate Signing Request (CSR) for an X.509 certificate";
        this.infoURL = "https://wikipedia.org/wiki/Certificate_signing_request";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Input format",
                "type": "option",
                "value": ["PEM"]
            }
        ];
        this.checks = [
            {
                "pattern": "^-+BEGIN CERTIFICATE REQUEST-+\\r?\\n[\\da-z+/\\n\\r]+-+END CERTIFICATE REQUEST-+\\r?\\n?$",
                "flags": "i",
                "args": ["PEM"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string} Human-readable description of a Certificate Signing Request (CSR).
     */
    run(input, args) {
        if (!input.length) {
            return "No input";
        }

        // Parse the CSR into JSON parameters
        const csrParam = new r.KJUR.asn1.csr.CSRUtil.getParam(input);

        return `Subject\n${formatDnObj(csrParam.subject, 2)}
Public Key${formatSubjectPublicKey(csrParam.sbjpubkey)}
Signature${formatSignature(csrParam.sigalg, csrParam.sighex)}
Requested Extensions${formatRequestedExtensions(csrParam)}`;
    }
}

/**
 * Format signature of a CSR
 * @param {*} sigAlg string
 * @param {*} sigHex string
 * @returns Multi-line string describing CSR Signature
 */
function formatSignature(sigAlg, sigHex) {
    let out = `\n`;

    out += `  Algorithm:      ${sigAlg}\n`;

    if (new RegExp("withdsa", "i").test(sigAlg)) {
        const d = new r.KJUR.crypto.DSA();
        const sigParam = d.parseASN1Signature(sigHex);
        out += `  Signature:
      R:          ${formatHexOntoMultiLine(absBigIntToHex(sigParam[0]))}
      S:          ${formatHexOntoMultiLine(absBigIntToHex(sigParam[1]))}\n`;
    } else if (new RegExp("withrsa", "i").test(sigAlg)) {
        out += `  Signature:      ${formatHexOntoMultiLine(sigHex)}\n`;
    } else {
        out += `  Signature:      ${formatHexOntoMultiLine(ensureHexIsPositiveInTwosComplement(sigHex))}\n`;
    }

    return chop(out);
}

/**
 * Format Subject Public Key from PEM encoded public key string
 * @param {*} publicKeyPEM string
 * @returns Multi-line string describing Subject Public Key Info
 */
function formatSubjectPublicKey(publicKeyPEM) {
    let out = "\n";

    const publicKey = r.KEYUTIL.getKey(publicKeyPEM);
    if (publicKey instanceof r.RSAKey) {
        out += `  Algorithm:      RSA
  Length:         ${publicKey.n.bitLength()} bits
  Modulus:        ${formatHexOntoMultiLine(absBigIntToHex(publicKey.n))}
  Exponent:       ${publicKey.e} (0x${Utils.hex(publicKey.e)})\n`;
    } else if (publicKey instanceof r.KJUR.crypto.ECDSA) {
        out += `  Algorithm:      ECDSA
  Length:         ${publicKey.ecparams.keylen} bits
  Pub:            ${formatHexOntoMultiLine(publicKey.pubKeyHex)}
  ASN1 OID:       ${r.KJUR.crypto.ECDSA.getName(publicKey.getShortNISTPCurveName())}
  NIST CURVE:     ${publicKey.getShortNISTPCurveName()}\n`;
    } else if (publicKey instanceof r.KJUR.crypto.DSA) {
        out += `  Algorithm:      DSA
  Length:         ${publicKey.p.toString(16).length * 4} bits
  Pub:            ${formatHexOntoMultiLine(absBigIntToHex(publicKey.y))}
  P:              ${formatHexOntoMultiLine(absBigIntToHex(publicKey.p))}
  Q:              ${formatHexOntoMultiLine(absBigIntToHex(publicKey.q))}
  G:              ${formatHexOntoMultiLine(absBigIntToHex(publicKey.g))}\n`;
    } else {
        out += `unsupported public key algorithm\n`;
    }

    return chop(out);
}

/**
 * Format known extensions of a CSR
 * @param {*} csrParam object
 * @returns Multi-line string describing CSR Requested Extensions
 */
function formatRequestedExtensions(csrParam) {
    const formattedExtensions = new Array(4).fill("");

    if (Object.hasOwn(csrParam, "extreq")) {
        for (const extension of csrParam.extreq) {
            let parts = [];
            switch (extension.extname) {
                case "basicConstraints" :
                    parts = describeBasicConstraints(extension);
                    formattedExtensions[0] = `  Basic Constraints:${formatExtensionCriticalTag(extension)}\n${indent(4, parts)}`;
                    break;
                case "keyUsage" :
                    parts = describeKeyUsage(extension);
                    formattedExtensions[1] = `  Key Usage:${formatExtensionCriticalTag(extension)}\n${indent(4, parts)}`;
                    break;
                case "extKeyUsage" :
                    parts = describeExtendedKeyUsage(extension);
                    formattedExtensions[2] = `  Extended Key Usage:${formatExtensionCriticalTag(extension)}\n${indent(4, parts)}`;
                    break;
                case "subjectAltName" :
                    parts = describeSubjectAlternativeName(extension);
                    formattedExtensions[3] = `  Subject Alternative Name:${formatExtensionCriticalTag(extension)}\n${indent(4, parts)}`;
                    break;
                default :
                    parts = ["(unsuported extension)"];
                    formattedExtensions.push(`  ${extension.extname}:${formatExtensionCriticalTag(extension)}\n${indent(4, parts)}`);
            }
        }
    }

    let out = "\n";

    formattedExtensions.forEach((formattedExtension) => {
        if (formattedExtension !== undefined && formattedExtension !== null && formattedExtension.length !== 0) {
            out += formattedExtension;
        }
    });

    return chop(out);
}

/**
 * Format extension critical tag
 * @param {*} extension Object
 * @returns String describing whether the extension is critical or not
 */
function formatExtensionCriticalTag(extension) {
    return Object.hasOwn(extension, "critical") && extension.critical ? " critical" : "";
}

/**
 * Format string input as a comma separated hex string on multiple lines
 * @param {*} hex String
 * @returns Multi-line string describing the Hex input
 */
function formatHexOntoMultiLine(hex) {
    if (hex.length % 2 !== 0) {
        hex = "0" + hex
    }

    return formatMultiLine(chop(hex.replace(/(..)/g, "$&:")));
}

/**
 * Convert BigInt to abs value in Hex
 * @param {*} int BigInt
 * @returns String representing absolute value in Hex
 */
function absBigIntToHex(int) {
    int = int < 0n ? -int : int;
    let hInt = int.toString(16);

    return ensureHexIsPositiveInTwosComplement(hInt);
}

/**
 * Ensure Hex String remains positive in 2's complement
 * @param {*} hex String
 * @returns Hex String ensuring value remains positive in 2's complement
 */
function ensureHexIsPositiveInTwosComplement(hex) {
    if (hex.length % 2 !== 0) {
        return "0" + hex;
    }

    // prepend 00 if most significant bit is 1 (sign bit)
    if (hex.length >=2 && (parseInt(hex.substring(0, 2), 16) & 128)) {
        hex = "00" + hex;
    }

    return hex
}

/**
 * Format string onto multiple lines
 * @param {*} longStr
 * @returns String as a multi-line string
 */
function formatMultiLine(longStr) {
    const lines = [];

    for (let remain = longStr ; remain !== "" ; remain = remain.substring(48)) {
        lines.push(remain.substring(0, 48));
    }

    return lines.join("\n                  ");
}

/**
 * Describe Basic Constraints
 * @see RFC 5280 4.2.1.9. Basic Constraints https://www.ietf.org/rfc/rfc5280.txt
 * @param {*} extension CSR extension with the name `basicConstraints`
 * @returns Array of strings describing Basic Constraints
 */
function describeBasicConstraints(extension) {
    const constraints = [];

    constraints.push(`CA = ${Object.hasOwn(extension, "cA") && extension.cA ? "true" : "false"}`);
    if (Object.hasOwn(extension, "pathLen")) constraints.push(`PathLenConstraint = ${extension.pathLen}`);

    return constraints;
}

/**
 * Describe Key Usage extension permitted use cases
 * @see RFC 5280 4.2.1.3. Key Usage https://www.ietf.org/rfc/rfc5280.txt
 * @param {*} extension CSR extension with the name `keyUsage`
 * @returns Array of strings describing Key Usage extension permitted use cases
 */
function describeKeyUsage(extension) {
    const usage = [];

    const kuIdentifierToName = {
        digitalSignature: "Digital Signature",
        nonRepudiation:   "Non-repudiation",
        keyEncipherment:  "Key encipherment",
        dataEncipherment: "Data encipherment",
        keyAgreement:     "Key agreement",
        keyCertSign:      "Key certificate signing",
        cRLSign:          "CRL signing",
        encipherOnly:     "Encipher Only",
        decipherOnly:     "Decipher Only",
    };

    if (Object.hasOwn(extension, "names")) {
        extension.names.forEach((ku) => {
            if (Object.hasOwn(kuIdentifierToName, ku)) {
                usage.push(kuIdentifierToName[ku]);
            } else {
                usage.push(`unknown key usage (${ku})`);
            }
        });
    }

    if (usage.length === 0) usage.push("(none)");

    return usage;
}

/**
 * Describe Extended Key Usage extension permitted use cases
 * @see RFC 5280 4.2.1.12. Extended Key Usage https://www.ietf.org/rfc/rfc5280.txt
 * @param {*} extension CSR extension with the name `extendedKeyUsage`
 * @returns Array of strings describing Extended Key Usage extension permitted use cases
 */
function describeExtendedKeyUsage(extension) {
    const usage = [];

    const ekuIdentifierToName = {
        "serverAuth":             "TLS Web Server Authentication",
        "clientAuth":             "TLS Web Client Authentication",
        "codeSigning":            "Code signing",
        "emailProtection":        "E-mail Protection (S/MIME)",
        "timeStamping":           "Trusted Timestamping",
        "1.3.6.1.4.1.311.2.1.21": "Microsoft Individual Code Signing",  // msCodeInd
        "1.3.6.1.4.1.311.2.1.22": "Microsoft Commercial Code Signing",  // msCodeCom
        "1.3.6.1.4.1.311.10.3.1": "Microsoft Trust List Signing",  // msCTLSign
        "1.3.6.1.4.1.311.10.3.3": "Microsoft Server Gated Crypto",  // msSGC
        "1.3.6.1.4.1.311.10.3.4": "Microsoft Encrypted File System",  // msEFS
        "1.3.6.1.4.1.311.20.2.2": "Microsoft Smartcard Login",  // msSmartcardLogin
        "2.16.840.1.113730.4.1":  "Netscape Server Gated Crypto",  // nsSGC
    };

    if (Object.hasOwn(extension, "array")) {
        extension.array.forEach((eku) => {
            if (Object.hasOwn(ekuIdentifierToName, eku)) {
                usage.push(ekuIdentifierToName[eku]);
            } else {
                usage.push(eku);
            }
        });
    }

    if (usage.length === 0) usage.push("(none)");

    return usage;
}

/**
 * Format Subject Alternative Names from the name `subjectAltName` extension
 * @see RFC 5280 4.2.1.6. Subject Alternative Name https://www.ietf.org/rfc/rfc5280.txt
 * @param {*} extension object
 * @returns Array of strings describing Subject Alternative Name extension
 */
function describeSubjectAlternativeName(extension) {
    const names = [];

    if (Object.hasOwn(extension, "extname") && extension.extname === "subjectAltName") {
        if (Object.hasOwn(extension, "array")) {
            for (const altName of extension.array) {
                Object.keys(altName).forEach((key) => {
                    switch (key) {
                        case "rfc822":
                            names.push(`EMAIL: ${altName[key]}`);
                            break;
                        case "dns":
                            names.push(`DNS: ${altName[key]}`);
                            break;
                        case "uri":
                            names.push(`URI: ${altName[key]}`);
                            break;
                        case "ip":
                            names.push(`IP: ${altName[key]}`);
                            break;
                        case "dn":
                            names.push(`DIR: ${altName[key].str}`);
                            break;
                        case "other" :
                            names.push(`Other: ${altName[key].oid}::${altName[key].value.utf8str.str}`);
                            break;
                        default:
                            names.push(`(unable to format SAN '${key}':${altName[key]})\n`);
                    }
                });
            }
        }
    }

    return names;
}

/**
 * Join an array of strings and add leading spaces to each line.
 * @param {*} n How many leading spaces
 * @param {*} parts Array of strings
 * @returns Joined and indented string.
 */
function indent(n, parts) {
    const fluff = " ".repeat(n);
    return fluff + parts.join("\n" + fluff) + "\n";
}

/**
 * Remove last character from a string.
 * @param {*} s String
 * @returns Chopped string.
 */
function chop(s) {
    return s.substring(0, s.length - 1);
}

export default ParseCSR;
