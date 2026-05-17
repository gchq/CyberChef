/**
 * @author jkataja
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import { Pkcs10CertificateRequest } from "@peculiar/x509";
import { AsnParser } from "@peculiar/asn1-schema";
import {
    BasicConstraints, ExtendedKeyUsage, Extensions, KeyUsage,
    SubjectAlternativeName,
} from "@peculiar/asn1-x509";
import * as asn1X509 from "@peculiar/asn1-x509";
import { CertificationRequest } from "@peculiar/asn1-csr";
import * as asnPkcs9 from "@peculiar/asn1-pkcs9";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { formatDnObj } from "../lib/PublicKey.mjs";
import {
    bytesToHex,
    describeSpki,
    formatGeneralName,
    formatHexColonWrapped,
    parseDerEcdsaSignature,
    sigAlgOidToName,
} from "../lib/X509.mjs";
import Utils from "../Utils.mjs";

const ID_CE_BASIC_CONSTRAINTS = asn1X509.id_ce_basicConstraints;
const ID_CE_EXT_KEY_USAGE = asn1X509.id_ce_extKeyUsage;
const ID_CE_KEY_USAGE = asn1X509.id_ce_keyUsage;
const ID_CE_SUBJECT_ALT_NAME = asn1X509.id_ce_subjectAltName;
const ID_PKCS9_AT_EXTENSION_REQUEST = asnPkcs9.id_pkcs9_at_extensionRequest;

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
     * @returns {string}
     */
    run(input, args) {
        if (!input.length) return "No input";

        let csr;
        try {
            csr = new Pkcs10CertificateRequest(input);
        } catch (e) {
            throw new OperationError(`Failed to parse CSR: ${e.message}`);
        }

        const subjectStr = formatDnObj(csr.subjectName.toJSON(), 2);
        const spki = describeSpki(new Uint8Array(csr.publicKey.rawData));
        const asnCsr = AsnParser.parse(new Uint8Array(csr.rawData), CertificationRequest);
        const sigAlgName = sigAlgOidToName(asnCsr.signatureAlgorithm.algorithm);
        const sigHex = bytesToHex(new Uint8Array(csr.signature));

        return `Subject\n${subjectStr}
Public Key${formatPublicKey(spki)}
Signature${formatSignature(sigAlgName, sigHex)}
Requested Extensions${formatRequestedExtensions(csr)}`;
    }
}

/**
 * Format the public-key section.
 *
 * @param {object} spki
 * @returns {string}
 */
function formatPublicKey(spki) {
    let out = "\n";
    if (spki.type === "RSA") {
        out += `  Algorithm:      RSA
  Length:         ${spki.bitLength} bits
  Modulus:        ${formatHexColonWrapped(prefix00IfMsbSet(spki.nHex), 48, 18)}
  Exponent:       ${spki.eValue} (0x${Utils.hex(spki.eValue)})\n`;
    } else if (spki.type === "EC") {
        out += `  Algorithm:      ECDSA
  Length:         ${spki.bitLength} bits
  Pub:            ${formatHexColonWrapped(spki.pubKeyHex, 48, 18)}
  ASN1 OID:       ${spki.asn1Curve}
  NIST CURVE:     ${spki.nistCurve}\n`;
    } else if (spki.type === "DSA") {
        out += `  Algorithm:      DSA
  Length:         ${spki.bitLength} bits
  Pub:            ${formatHexColonWrapped(prefix00IfMsbSet(spki.yHex), 48, 18)}
  P:              ${formatHexColonWrapped(prefix00IfMsbSet(spki.pHex), 48, 18)}
  Q:              ${formatHexColonWrapped(prefix00IfMsbSet(spki.qHex), 48, 18)}
  G:              ${formatHexColonWrapped(prefix00IfMsbSet(spki.gHex), 48, 18)}\n`;
    } else {
        out += `unsupported public key algorithm\n`;
    }
    return chop(out);
}

/**
 * Prefix the hex string with "00" when its most significant bit is set.
 * Mirrors the legacy "ensureHexIsPositiveInTwosComplement" behaviour the
 * golden CSR fixtures depend on.
 *
 * @param {string} hex
 * @returns {string}
 */
function prefix00IfMsbSet(hex) {
    if (hex.length % 2 !== 0) hex = "0" + hex;
    if (hex.length >= 2 && (parseInt(hex.substring(0, 2), 16) & 0x80)) {
        hex = "00" + hex;
    }
    return hex;
}

/**
 * Format the signature section.
 *
 * @param {string} sigAlgName
 * @param {string} sigHex
 * @returns {string}
 */
function formatSignature(sigAlgName, sigHex) {
    let out = `\n  Algorithm:      ${sigAlgName}\n`;

    if (/withdsa/i.test(sigAlgName)) {
        const { r, s } = parseDerEcdsaSignature(sigHex);
        out += `  Signature:
      R:          ${formatHexColonWrapped(prefix00IfMsbSet(r), 48, 18)}
      S:          ${formatHexColonWrapped(prefix00IfMsbSet(s), 48, 18)}\n`;
    } else if (/withrsa/i.test(sigAlgName)) {
        out += `  Signature:      ${formatHexColonWrapped(sigHex, 48, 18)}\n`;
    } else {
        out += `  Signature:      ${formatHexColonWrapped(prefix00IfMsbSet(sigHex), 48, 18)}\n`;
    }

    return chop(out);
}

/**
 * Format the Requested Extensions section.  Reads the extensionRequest
 * attribute (OID 1.2.840.113549.1.9.14) and dispatches the well-known
 * extension types to per-type formatters.  Unknown extensions render as
 * `(unsuported extension)` to match the existing golden output.
 *
 * @param {object} csr
 * @returns {string}
 */
function formatRequestedExtensions(csr) {
    const extReqAttr = csr.attributes.find(a => a.type === ID_PKCS9_AT_EXTENSION_REQUEST);
    if (!extReqAttr || !extReqAttr.values || extReqAttr.values.length === 0) {
        return "\n";
    }

    let extensions;
    try {
        extensions = AsnParser.parse(new Uint8Array(extReqAttr.values[0]), Extensions);
    } catch {
        return "\n";
    }

    const formatted = new Array(4).fill("");
    const tail = [];

    for (const ext of extensions) {
        const criticalTag = ext.critical ? " critical" : "";
        const value = new Uint8Array(ext.extnValue.buffer);
        switch (ext.extnID) {
            case ID_CE_BASIC_CONSTRAINTS: {
                const bc = AsnParser.parse(value, BasicConstraints);
                const parts = [`CA = ${bc.cA ? "true" : "false"}`];
                if (bc.pathLenConstraint !== undefined) parts.push(`PathLenConstraint = ${bc.pathLenConstraint}`);
                formatted[0] = `  Basic Constraints:${criticalTag}\n${indent(4, parts)}`;
                break;
            }
            case ID_CE_KEY_USAGE: {
                const ku = AsnParser.parse(value, KeyUsage);
                formatted[1] = `  Key Usage:${criticalTag}\n${indent(4, describeKeyUsage(ku.toNumber()))}`;
                break;
            }
            case ID_CE_EXT_KEY_USAGE: {
                const eku = AsnParser.parse(value, ExtendedKeyUsage);
                formatted[2] = `  Extended Key Usage:${criticalTag}\n${indent(4, describeExtendedKeyUsage(Array.from(eku)))}`;
                break;
            }
            case ID_CE_SUBJECT_ALT_NAME: {
                const san = AsnParser.parse(value, SubjectAlternativeName);
                const items = san.map(gn => formatGeneralName(gn, "csr"));
                formatted[3] = `  Subject Alternative Name:${criticalTag}\n${indent(4, items)}`;
                break;
            }
            default:
                tail.push(`  ${ext.extnID}:${criticalTag}\n${indent(4, ["(unsuported extension)"])}`);
        }
    }

    let out = "\n";
    for (const block of [...formatted, ...tail]) {
        if (block && block.length !== 0) out += block;
    }
    return chop(out);
}

/**
 * Translate the KeyUsage bit-string flags into the bit-order list of
 * human-readable names the existing golden fixtures expect.
 *
 * @param {number} flags
 * @returns {string[]}
 */
function describeKeyUsage(flags) {
    const bitOrder = [
        [0x001, "Digital Signature"],
        [0x002, "Non-repudiation"],
        [0x004, "Key encipherment"],
        [0x008, "Data encipherment"],
        [0x010, "Key agreement"],
        [0x020, "Key certificate signing"],
        [0x040, "CRL signing"],
        [0x080, "Encipher Only"],
        [0x100, "Decipher Only"],
    ];
    const out = [];
    for (const [bit, label] of bitOrder) {
        if (flags & bit) out.push(label);
    }
    if (out.length === 0) out.push("(none)");
    return out;
}

/**
 * Translate the EKU OIDs (and aliases) into the human-readable names the
 * existing golden fixtures expect.
 *
 * @param {string[]} usages - List of OIDs/short names.
 * @returns {string[]}
 */
function describeExtendedKeyUsage(usages) {
    const ekuIdentifierToName = {
        "1.3.6.1.5.5.7.3.1": "TLS Web Server Authentication",
        "1.3.6.1.5.5.7.3.2": "TLS Web Client Authentication",
        "1.3.6.1.5.5.7.3.3": "Code signing",
        "1.3.6.1.5.5.7.3.4": "E-mail Protection (S/MIME)",
        "1.3.6.1.5.5.7.3.8": "Trusted Timestamping",
        "serverAuth":        "TLS Web Server Authentication",
        "clientAuth":        "TLS Web Client Authentication",
        "codeSigning":       "Code signing",
        "emailProtection":   "E-mail Protection (S/MIME)",
        "timeStamping":      "Trusted Timestamping",
        "1.3.6.1.4.1.311.2.1.21": "Microsoft Individual Code Signing",
        "1.3.6.1.4.1.311.2.1.22": "Microsoft Commercial Code Signing",
        "1.3.6.1.4.1.311.10.3.1": "Microsoft Trust List Signing",
        "1.3.6.1.4.1.311.10.3.3": "Microsoft Server Gated Crypto",
        "1.3.6.1.4.1.311.10.3.4": "Microsoft Encrypted File System",
        "1.3.6.1.4.1.311.20.2.2": "Microsoft Smartcard Login",
        "2.16.840.1.113730.4.1":  "Netscape Server Gated Crypto",
    };
    const out = usages.map(eku => ekuIdentifierToName[eku] || eku);
    if (out.length === 0) out.push("(none)");
    return out;
}

/**
 * Join an array of strings and add leading spaces to each line.
 *
 * @param {number} n
 * @param {string[]} parts
 * @returns {string}
 */
function indent(n, parts) {
    const fluff = " ".repeat(n);
    return fluff + parts.join("\n" + fluff) + "\n";
}

/**
 * Remove the last character from a string.
 *
 * @param {string} s
 * @returns {string}
 */
function chop(s) {
    return s.length === 0 ? s : s.substring(0, s.length - 1);
}

export default ParseCSR;
