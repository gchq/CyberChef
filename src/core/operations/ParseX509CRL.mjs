/**
 * @author robinsandhu
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import { X509Crl } from "@peculiar/x509";
import { AsnParser } from "@peculiar/asn1-schema";
import {
    AuthorityKeyIdentifier, CertificateList, CRLDistributionPoints, CRLNumber, CRLReason,
    InvalidityDate, IssueAlternativeName,
} from "@peculiar/asn1-x509";
import * as asn1X509 from "@peculiar/asn1-x509";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { formatDnObj } from "../lib/PublicKey.mjs";
import {
    bytesToHex,
    decodeX509Input,
    formatGeneralName,
    sigAlgOidToName,
} from "../lib/X509.mjs";

const ID_CE_AUTHORITY_KEY_IDENTIFIER = asn1X509.id_ce_authorityKeyIdentifier;
const ID_CE_CRL_DISTRIBUTION_POINTS  = asn1X509.id_ce_cRLDistributionPoints;
const ID_CE_CRL_NUMBER               = asn1X509.id_ce_cRLNumber;
const ID_CE_CRL_REASONS              = asn1X509.id_ce_cRLReasons;
const ID_CE_INVALIDITY_DATE          = asn1X509.id_ce_invalidityDate;
const ID_CE_ISSUER_ALT_NAME          = asn1X509.id_ce_issuerAltName;

const HOLD_INSTRUCTION_EXT_OID = "2.5.29.23";

const CRL_REASON_TO_NAME = {
    0: "Unspecified",
    1: "Key Compromise",
    2: "CA Compromise",
    3: "Affiliation Changed",
    4: "Superseded",
    5: "Cessation Of Operation",
    6: "Certificate Hold",
    8: "Remove From CRL",
    9: "Privilege Withdrawn",
    10: "AA Compromise",
};

const HOLD_INSTRUCTION_OID_TO_NAME = {
    "1.2.840.10040.2.1": "Hold Instruction None",
    "1.2.840.10040.2.2": "Hold Instruction Call Issuer",
    "1.2.840.10040.2.3": "Hold Instruction Reject",
};

/**
 * Parse X.509 CRL operation
 */
class ParseX509CRL extends Operation {

    /**
     * ParseX509CRL constructor
     */
    constructor() {
        super();

        this.name = "Parse X.509 CRL";
        this.module = "PublicKey";
        this.description = "Parse Certificate Revocation List (CRL)";
        this.infoURL = "https://wikipedia.org/wiki/Certificate_revocation_list";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Input format",
                "type": "option",
                "value": ["PEM", "DER Hex", "Base64", "Raw"]
            }
        ];
        this.checks = [
            {
                "pattern": "^-+BEGIN X509 CRL-+\\r?\\n[\\da-z+/\\n\\r]+-+END X509 CRL-+\\r?\\n?$",
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

        const inputFormat = args[0];
        let derBytes;
        try {
            derBytes = decodeX509Input(input, inputFormat);
        } catch (e) {
            throw new OperationError(`Certificate load error (non-certificate input?): ${e.message}`);
        }

        let crl;
        try {
            crl = new X509Crl(derBytes);
        } catch (e) {
            throw new OperationError(`Certificate load error (non-certificate input?): ${e.message}`);
        }

        const asnCrl = AsnParser.parse(new Uint8Array(crl.rawData), CertificateList);
        const sigAlgName = sigAlgOidToName(asnCrl.signatureAlgorithm.algorithm);

        let out = `Certificate Revocation List (CRL):
    Version: ${crl.version === undefined || crl.version === 0 ? "1 (0x0)" : "2 (0x1)"}
    Signature Algorithm: ${sigAlgName}
    Issuer:\n${formatDnObj(crl.issuerName.toJSON(), 8)}
    Last Update: ${crl.thisUpdate.toUTCString()}
    Next Update: ${crl.nextUpdate ? crl.nextUpdate.toUTCString() : "undefined"}\n`;

        if (crl.extensions && crl.extensions.length > 0) {
            out += `\tCRL extensions:\n${formatCRLExtensions(crl.extensions, 8)}\n`;
        }

        out += `Revoked Certificates:\n${formatRevokedCertificates(crl.entries, 4)}
Signature Value:\n${formatCRLSignature(bytesToHex(new Uint8Array(crl.signature)), 8)}`;

        return out;
    }
}

/**
 * Format the CRL extensions block.
 *
 * Extensions are emitted in OID-ascending order to match the legacy output:
 * the old code sorted by `extname` string, but the asn1-x509 OID constants
 * we get back from peculiar/x509 sort identically for the supported types.
 *
 * Unsupported extensions are listed as `<oid>:` followed by an
 * "Unsupported CRL extension. Try openssl CLI." line — same as before.
 *
 * @param {object[]} extensions - peculiar/x509 Extension objects.
 * @param {number} indentSpaces
 * @returns {string}
 */
function formatCRLExtensions(extensions, indentSpaces) {
    if (!Array.isArray(extensions) || extensions.length === 0) {
        return indentString("No CRL extensions.", indentSpaces);
    }

    // Sort to match the legacy alphabetical-by-extname ordering as closely
    // as possible.  Use a synthetic name per OID.
    const sorted = [...extensions].sort((a, b) => {
        const an = extDisplayName(a.type);
        const bn = extDisplayName(b.type);
        if (an < bn) return -1;
        if (an > bn) return 1;
        return 0;
    });

    let out = "";
    for (const ext of sorted) {
        out += formatCRLExtension(ext) + "\n";
    }

    return indentString(chop(out), indentSpaces);
}

/**
 * Pick a display name for an extension OID (used only for sort stability).
 *
 * @param {string} oid
 * @returns {string}
 */
function extDisplayName(oid) {
    switch (oid) {
        case ID_CE_AUTHORITY_KEY_IDENTIFIER: return "authorityKeyIdentifier";
        case ID_CE_CRL_DISTRIBUTION_POINTS:  return "cRLDistributionPoints";
        case ID_CE_CRL_NUMBER:               return "cRLNumber";
        case ID_CE_ISSUER_ALT_NAME:          return "issuerAltName";
        default:                             return oid;
    }
}

/**
 * Format a single CRL extension.
 *
 * @param {object} ext - peculiar/x509 Extension
 * @returns {string}
 */
function formatCRLExtension(ext) {
    const value = new Uint8Array(ext.value);

    if (ext.type === ID_CE_AUTHORITY_KEY_IDENTIFIER) {
        let out = `X509v3 Authority Key Identifier:\n`;
        const aki = AsnParser.parse(value, AuthorityKeyIdentifier);
        if (aki.keyIdentifier) {
            out += `\tkeyid:${colonHex(bytesToHex(new Uint8Array(aki.keyIdentifier.buffer))).toUpperCase()}\n`;
        }
        if (aki.authorityCertIssuer && aki.authorityCertIssuer.length > 0) {
            for (const gn of aki.authorityCertIssuer) {
                if (gn.directoryName) {
                    out += `\tDirName:${slashName(gn.directoryName)}\n`;
                } else {
                    out += `\t${formatGeneralName(gn, "crl")}\n`;
                }
            }
        }
        if (aki.authorityCertSerialNumber) {
            const serial = bytesToHex(new Uint8Array(aki.authorityCertSerialNumber)).toUpperCase();
            out += `\tserial:${colonHex(serial)}\n`;
        }
        return chop(out);
    }

    if (ext.type === ID_CE_CRL_DISTRIBUTION_POINTS) {
        const dps = AsnParser.parse(value, CRLDistributionPoints);
        let out = `X509v3 CRL Distribution Points:\n`;
        for (const dp of dps) {
            if (dp.distributionPoint && dp.distributionPoint.fullName) {
                const fullName = `Full Name:\n${dp.distributionPoint.fullName.map(gn => `    ${formatGeneralName(gn, "crl")}`).join("\n")}`;
                out += indentString(fullName, 4) + "\n";
            }
        }
        return chop(out);
    }

    if (ext.type === ID_CE_CRL_NUMBER) {
        const num = AsnParser.parse(value, CRLNumber);
        const hex = BigInt(num.value).toString(16).toUpperCase();
        return `X509v3 CRL Number:\n\t${hex}`;
    }

    if (ext.type === ID_CE_ISSUER_ALT_NAME) {
        const ian = AsnParser.parse(value, IssueAlternativeName);
        const lines = ian.map(gn => `    ${formatGeneralName(gn, "crl")}`).join("\n");
        return `X509v3 Issuer Alternative Name:\n${lines}`;
    }

    return `${ext.type}:\n\tUnsupported CRL extension. Try openssl CLI.`;
}

/**
 * Format an asn1-x509 Name as the OpenSSL slash representation
 * `/C=…/ST=…/…`.
 *
 * @param {object} asnName
 * @returns {string}
 */
function slashName(asnName) {
    const OID_SHORT = {
        "2.5.4.3": "CN", "2.5.4.4": "SN", "2.5.4.5": "serialNumber",
        "2.5.4.6": "C",  "2.5.4.7": "L",  "2.5.4.8": "ST",
        "2.5.4.9": "street", "2.5.4.10": "O", "2.5.4.11": "OU",
        "2.5.4.12": "T", "2.5.4.42": "G", "2.5.4.43": "I",
        "1.2.840.113549.1.9.1": "E",
    };
    let out = "";
    for (const rdn of asnName) {
        for (const atv of rdn) {
            const key = OID_SHORT[atv.type] || atv.type;
            out += `/${key}=${atv.value.toString()}`;
        }
    }
    return out;
}

/**
 * Format an array of bytes as `AA:BB:CC:...`.
 *
 * @param {string} hex
 * @returns {string}
 */
function colonHex(hex) {
    if (hex.length % 2 !== 0) hex = "0" + hex;
    return chop(hex.replace(/(..)/g, "$&:"));
}

/**
 * Format the revoked certificates list.
 *
 * @param {readonly object[]} entries - peculiar/x509 X509CrlEntry objects.
 * @param {number} indentSpaces
 * @returns {string}
 */
function formatRevokedCertificates(entries, indentSpaces) {
    if (!entries || entries.length === 0) {
        return indentString("No Revoked Certificates.", indentSpaces);
    }
    let out = "";
    for (const entry of entries) {
        out += `Serial Number: ${entry.serialNumber.toUpperCase()}
    Revocation Date: ${entry.revocationDate.toUTCString()}\n`;
        if (entry.extensions && entry.extensions.length > 0) {
            out += `\tCRL entry extensions:\n${indentString(formatCRLEntryExtensions(entry.extensions), 2 * indentSpaces)}\n`;
        }
    }
    return indentString(chop(out), indentSpaces);
}

/**
 * Format the CRL entry extensions for a single revoked-certificate row.
 *
 * @param {object[]} extensions
 * @returns {string}
 */
function formatCRLEntryExtensions(extensions) {
    let out = "";
    for (const ext of extensions) {
        const value = new Uint8Array(ext.value);
        if (ext.type === ID_CE_CRL_REASONS) {
            const reason = AsnParser.parse(value, CRLReason);
            const code = reason.reason;
            const name = Object.prototype.hasOwnProperty.call(CRL_REASON_TO_NAME, code) ?
                CRL_REASON_TO_NAME[code] :
                `invalid reason code: ${code}`;
            out += `X509v3 CRL Reason Code:\n    ${name}\n`;
        } else if (ext.type === HOLD_INSTRUCTION_EXT_OID) {
            // Hold Instruction; payload is an OID
            const oid = decodeOidValue(value);
            const name = HOLD_INSTRUCTION_OID_TO_NAME[oid] || `${oid}: unknown hold instruction OID`;
            out += `Hold Instruction Code:\n\t${name}\n`;
        } else if (ext.type === ID_CE_INVALIDITY_DATE) {
            const inv = AsnParser.parse(value, InvalidityDate);
            out += `Invalidity Date:\n\t${inv.value.toUTCString()}\n`;
        } else {
            out += `${ext.type}:\n\tUnsupported CRL entry extension. Try openssl CLI.\n`;
        }
    }
    return chop(out);
}

/**
 * Decode a DER OBJECT IDENTIFIER from raw bytes (including the 0x06 tag).
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function decodeOidValue(bytes) {
    if (bytes[0] !== 0x06) throw new OperationError("Expected OBJECT IDENTIFIER");
    // Length octet(s) follow tag; for any sensible OID this is one byte.
    let i = 1;
    if (bytes[i] >= 0x80) i += (bytes[i] & 0x7f);
    i += 1;
    const first = bytes[i++];
    const arcs = [Math.floor(first / 40).toString(), (first % 40).toString()];
    let acc = 0n;
    for (; i < bytes.length; i++) {
        acc = (acc << 7n) | BigInt(bytes[i] & 0x7f);
        if ((bytes[i] & 0x80) === 0) {
            arcs.push(acc.toString());
            acc = 0n;
        }
    }
    return arcs.join(".");
}

/**
 * Format the CRL signature as colon-delimited byte pairs wrapped to 54
 * characters per line, indented.
 *
 * @param {string} sigHex
 * @param {number} indentSpaces
 * @returns {string}
 */
function formatCRLSignature(sigHex, indentSpaces) {
    if (sigHex.length % 2 !== 0) sigHex = "0" + sigHex;
    const colonHexStr = chop(sigHex.replace(/(..)/g, "$&:"));
    const lines = [];
    for (let remain = colonHexStr; remain !== ""; remain = remain.substring(54)) {
        lines.push(remain.substring(0, 54));
    }
    return indentString(lines.join("\n"), indentSpaces);
}

/**
 * Indent a multi-line string by n spaces.
 *
 * @param {string} input
 * @param {number} spaces
 * @returns {string}
 */
function indentString(input, spaces) {
    const pad = " ".repeat(spaces);
    return input.replace(/^/gm, pad);
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

export default ParseX509CRL;
