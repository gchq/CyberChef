/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { X509Certificate, KeyUsagesExtension, BasicConstraintsExtension, ExtendedKeyUsageExtension, SubjectAlternativeNameExtension, SubjectKeyIdentifierExtension, AuthorityKeyIdentifierExtension, CRLDistributionPointsExtension } from "@peculiar/x509";
import { AsnParser } from "@peculiar/asn1-schema";
import { Certificate, SubjectAlternativeName, IssueAlternativeName } from "@peculiar/asn1-x509";
import { runHash } from "../lib/Hash.mjs";
import { formatByteStr, formatDnObj } from "../lib/PublicKey.mjs";
import {
    bytesToHex,
    decodeX509Input,
    describeSpki,
    formatGeneralName,
    isDerEcdsaSignature,
    parseDerEcdsaSignature,
    sigAlgOidToName,
} from "../lib/X509.mjs";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Parse X.509 certificate operation
 */
class ParseX509Certificate extends Operation {

    /**
     * ParseX509Certificate constructor
     */
    constructor() {
        super();

        this.name = "Parse X.509 certificate";
        this.module = "PublicKey";
        this.description = "X.509 is an ITU-T standard for a public key infrastructure (PKI) and Privilege Management Infrastructure (PMI). It is commonly involved with SSL/TLS security.<br><br>This operation displays the contents of a certificate in a human readable format, similar to the openssl command line tool.<br><br>Tags: X509, server hello, handshake";
        this.infoURL = "https://wikipedia.org/wiki/X.509";
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
                "pattern": "^-+BEGIN CERTIFICATE-+\\r?\\n[\\da-z+/\\n\\r]+-+END CERTIFICATE-+\\r?\\n?$",
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

        let cert;
        try {
            cert = new X509Certificate(derBytes);
        } catch (e) {
            throw new OperationError(`Certificate load error (non-certificate input?): ${e.message}`);
        }

        const fingerprintInput = Utils.strToArrayBuffer(Utils.byteArrayToChars(Array.from(new Uint8Array(cert.rawData))));

        const asnCert = AsnParser.parse(new Uint8Array(cert.rawData), Certificate);
        const versionInt = (asnCert.tbsCertificate.version || 0) + 1;
        const serialHex = bytesToHex(new Uint8Array(asnCert.tbsCertificate.serialNumber));
        const serialDecimal = serialHex.length ? BigInt("0x" + serialHex).toString() : "0";
        const sigAlgOid = asnCert.signatureAlgorithm.algorithm;
        const sigAlgName = sigAlgOidToName(sigAlgOid);

        const spki = describeSpki(new Uint8Array(cert.publicKey.rawData));
        const pkFields = [{ key: "Algorithm", value: spkiAlgorithmLabel(spki) }];

        switch (spki.type) {
            case "EC":
                pkFields.push({ key: "Curve Name", value: spki.asn1Curve });
                pkFields.push({ key: "Length", value: spki.bitLength + " bits" });
                pkFields.push({ key: "pub", value: formatByteStr(spki.pubKeyHex, 16, 18) });
                break;
            case "DSA":
                pkFields.push({ key: "pub", value: formatByteStr(spki.yHex, 16, 18) });
                pkFields.push({ key: "P",   value: formatByteStr(spki.pHex, 16, 18) });
                pkFields.push({ key: "Q",   value: formatByteStr(spki.qHex, 16, 18) });
                pkFields.push({ key: "G",   value: formatByteStr(spki.gHex, 16, 18) });
                break;
            case "RSA":
                pkFields.push({ key: "Length",   value: spki.bitLength + " bits" });
                pkFields.push({ key: "Modulus",  value: formatByteStr(spki.nHex, 16, 18) });
                pkFields.push({ key: "Exponent", value: spki.eValue + " (0x" + spki.eValue.toString(16) + ")" });
                break;
            case "EdDSA":
                pkFields.push({ key: "Curve Name", value: spki.curveName });
                pkFields.push({ key: "pub", value: formatByteStr(spki.pubKeyHex, 16, 18) });
                break;
            default:
                pkFields.push({ key: "Error", value: "Unknown Public Key type" });
        }

        let pkStr = "";
        for (const field of pkFields) {
            pkStr += `  ${field.key}:${(field.value + "\n").padStart(
                18 - (field.key.length + 3) + field.value.length + 1, " ")}`;
        }

        const sigHex = bytesToHex(new Uint8Array(cert.signature));
        let sigStr;
        if (isDerEcdsaSignature(sigHex)) {
            const { r, s } = parseDerEcdsaSignature(sigHex);
            sigStr = `  r:              ${formatByteStr(r, 16, 18)}\n  s:              ${formatByteStr(s, 16, 18)}`;
        } else {
            sigStr = `  Signature:      ${formatByteStr(sigHex, 16, 18)}`;
        }

        const nbDate = formatDate(formatAsn1Date(cert.notBefore));
        const naDate = formatDate(formatAsn1Date(cert.notAfter));
        const issuerStr = formatDnObj(cert.issuerName.toJSON(), 2);
        const subjectStr = formatDnObj(cert.subjectName.toJSON(), 2);

        const versionDisplay = `${versionInt} (0x${Utils.hex(versionInt - 1)})`;

        const extensionsText = formatExtensions(cert);

        return `Version:          ${versionDisplay}
Serial number:    ${serialDecimal} (0x${serialHex})
Algorithm ID:     ${sigAlgName}
Validity
  Not Before:     ${nbDate} (dd-mm-yyyy hh:mm:ss) (${formatAsn1Date(cert.notBefore)})
  Not After:      ${naDate} (dd-mm-yyyy hh:mm:ss) (${formatAsn1Date(cert.notAfter)})
Issuer
${issuerStr}
Subject
${subjectStr}
Fingerprints
  MD5:            ${runHash("md5", fingerprintInput)}
  SHA1:           ${runHash("sha1", fingerprintInput)}
  SHA256:         ${runHash("sha256", fingerprintInput)}
Public Key
${pkStr.slice(0, -1)}
Certificate Signature
  Algorithm:      ${sigAlgName}
${sigStr}

Extensions
${extensionsText}`;
    }
}

/**
 * Format the algorithm label for the Public Key block. The golden fixtures
 * use short labels for the classic key families: "EC", "DSA", "RSA".
 *
 * @param {object} spki
 * @returns {string}
 */
function spkiAlgorithmLabel(spki) {
    if (spki.type === "EC") return "EC";
    if (spki.type === "DSA") return "DSA";
    if (spki.type === "RSA") return "RSA";
    if (spki.type === "EdDSA") return spki.curveName;
    return "Unknown";
}

/**
 * Format the certificate extensions block.  Uses the rich peculiar/x509
 * extension types where available, falls back to the OID for unknown ones.
 *
 * @param {object} cert
 * @returns {string}
 */
function formatExtensions(cert) {
    const lines = [];
    for (const ext of cert.extensions) {
        if (ext instanceof SubjectKeyIdentifierExtension) {
            lines.push(`  subjectKeyIdentifier${ext.critical ? " CRITICAL" : ""} :`);
            lines.push(`    ${ext.keyId}`);
        } else if (ext instanceof AuthorityKeyIdentifierExtension) {
            lines.push(`  authorityKeyIdentifier${ext.critical ? " CRITICAL" : ""} :`);
            if (ext.keyId) lines.push(`    kid=${ext.keyId}`);
            if (ext.certId && ext.certId.serialNumber) {
                lines.push(`    serial=${ext.certId.serialNumber.toUpperCase()}`);
            }
        } else if (ext instanceof BasicConstraintsExtension) {
            lines.push(`  basicConstraints${ext.critical ? " CRITICAL" : ""}:`);
            lines.push(`    cA=${ext.ca}` + (ext.pathLength !== undefined ? `,pathLen=${ext.pathLength}` : ""));
        } else if (ext instanceof KeyUsagesExtension) {
            lines.push(`  keyUsage${ext.critical ? " CRITICAL" : ""}:`);
            lines.push(`    ${ext.usages.toString()}`);
        } else if (ext instanceof ExtendedKeyUsageExtension) {
            lines.push(`  extKeyUsage${ext.critical ? " CRITICAL" : ""}:`);
            for (const usage of ext.usages) lines.push(`    ${usage}`);
        } else if (ext instanceof SubjectAlternativeNameExtension) {
            lines.push(`  subjectAltName${ext.critical ? " CRITICAL" : ""}:`);
            const asn = AsnParser.parse(new Uint8Array(ext.value), SubjectAlternativeName);
            for (const gn of asn) lines.push(`    ${formatGeneralName(gn, "csr")}`);
        } else if (ext instanceof CRLDistributionPointsExtension) {
            lines.push(`  cRLDistributionPoints${ext.critical ? " CRITICAL" : ""}:`);
            for (const dp of ext.distributionPoints) {
                if (dp.distributionPoint && dp.distributionPoint.fullName) {
                    for (const gn of dp.distributionPoint.fullName) {
                        lines.push(`    ${formatGeneralName(gn, "csr")}`);
                    }
                }
            }
        } else if (ext.type === "2.5.29.18") { // issuerAltName
            lines.push(`  issuerAltName${ext.critical ? " CRITICAL" : ""}:`);
            const asn = AsnParser.parse(new Uint8Array(ext.value), IssueAlternativeName);
            for (const gn of asn) lines.push(`    ${formatGeneralName(gn, "csr")}`);
        } else {
            lines.push(`  ${ext.type}${ext.critical ? " CRITICAL" : ""} :`);
            lines.push(`    ${bytesToHex(new Uint8Array(ext.value))}`);
        }
    }
    return lines.join("\n");
}

/**
 * Format a JS Date as an ASN.1 UTCTime/GeneralizedTime string: `yymmddHHMMSSZ`
 * or `yyyymmddHHMMSSZ` for dates past 2049.
 *
 * @param {Date} date
 * @returns {string}
 */
function formatAsn1Date(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hour = String(date.getUTCHours()).padStart(2, "0");
    const min = String(date.getUTCMinutes()).padStart(2, "0");
    const sec = String(date.getUTCSeconds()).padStart(2, "0");
    if (year < 1950 || year > 2049) {
        return `${year}${month}${day}${hour}${min}${sec}Z`;
    }
    return `${String(year).slice(2)}${month}${day}${hour}${min}${sec}Z`;
}

/**
 * Formats dates.
 *
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
    if (dateStr.length === 13) {
        dateStr = (dateStr[0] < "5" ? "20" : "19") + dateStr;
    }
    return dateStr[6] + dateStr[7] + "/" +
        dateStr[4] + dateStr[5] + "/" +
        dateStr[0] + dateStr[1] + dateStr[2] + dateStr[3] + " " +
        dateStr[8] + dateStr[9] + ":" +
        dateStr[10] + dateStr[11] + ":" +
        dateStr[12] + dateStr[13];
}

export default ParseX509Certificate;
