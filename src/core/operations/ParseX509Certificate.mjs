/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import r from "jsrsasign";

// Register SM2 curve parameters, OID, and curve name mappings in jsrsasign
try {
    r.crypto.ECParameterDB.regist(
        "sm2p256v1",
        256,
        "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF", // p
        "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC", // a
        "28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93", // b
        "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123", // n
        "1", // h
        "32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7", // gx
        "BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0", // gy
        []
    );
} catch (e) {
    // If it's already registered, this is fine
}

const originalGetName = r.crypto.ECDSA.getName;
if (originalGetName) {
    r.crypto.ECDSA.getName = function(oid) {
        if (oid === "2a811ccf5501822d" || oid === "1.2.156.10197.1.301") {
            return "sm2p256v1";
        }
        return originalGetName(oid);
    };
}

try {
    r.KJUR.asn1.x509.OID.registerOIDs({
        "sm2p256v1": "1.2.156.10197.1.301",
        "SM2": "1.2.156.10197.1.301",
        "SM3": "1.2.156.10197.1.401",
        "SM2-with-SM3": "1.2.156.10197.1.501"
    });
} catch (e) {
    // ignore
}
import { fromBase64 } from "../lib/Base64.mjs";
import { runHash } from "../lib/Hash.mjs";
import { fromHex, toHex } from "../lib/Hex.mjs";
import { formatByteStr, formatDnObj } from "../lib/PublicKey.mjs";
import Operation from "../Operation.mjs";
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
        if (!input.length) {
            return "No input";
        }

        const cert = new r.X509(),
            inputFormat = args[0];

        let undefinedInputFormat = false;
        try {
            switch (inputFormat) {
                case "DER Hex":
                    input = input.replace(/\s/g, "").toLowerCase();
                    cert.readCertHex(input);
                    break;
                case "PEM":
                    cert.readCertPEM(input);
                    break;
                case "Base64":
                    cert.readCertHex(toHex(fromBase64(input, null, "byteArray"), ""));
                    break;
                case "Raw":
                    cert.readCertHex(toHex(Utils.strToArrayBuffer(input), ""));
                    break;
                default:
                    undefinedInputFormat = true;
            }
        } catch (e) {
            throw "Certificate load error (non-certificate input?)";
        }
        if (undefinedInputFormat) throw "Undefined input format";

        const hex = Utils.strToArrayBuffer(Utils.byteArrayToChars(fromHex(cert.hex))),
            sn = cert.getSerialNumberHex(),
            issuer = cert.getIssuer(),
            subject = cert.getSubject(),
            pkFields = [],
            sig = cert.getSignatureValueHex();

        let pk;
        let pkLoadError = null;
        try {
            pk = cert.getPublicKey();
        } catch (e) {
            pkLoadError = e.message || e.toString();
            pk = {
                type: "Unknown",
                error: pkLoadError
            };
        }

        let pkStr = "",
            sigStr = "",
            extensions = "";

        // Public Key fields
        pkFields.push({
            key: "Algorithm",
            value: pk.type
        });

        if (pk.type === "EC") { // ECDSA
            pkFields.push({
                key: "Curve Name",
                value: pk.curveName
            });
            pkFields.push({
                key: "Length",
                value: (((new r.BigInteger(pk.pubKeyHex, 16)).bitLength()-3) /2) + " bits"
            });
            pkFields.push({
                key: "pub",
                value: formatByteStr(pk.pubKeyHex, 16, 18)
            });
        } else if (pk.type === "DSA") { // DSA
            pkFields.push({
                key: "pub",
                value: formatByteStr(pk.y.toString(16), 16, 18)
            });
            pkFields.push({
                key: "P",
                value: formatByteStr(pk.p.toString(16), 16, 18)
            });
            pkFields.push({
                key: "Q",
                value: formatByteStr(pk.q.toString(16), 16, 18)
            });
            pkFields.push({
                key: "G",
                value: formatByteStr(pk.g.toString(16), 16, 18)
            });
        } else if (pk.e) { // RSA
            pkFields.push({
                key: "Length",
                value: pk.n.bitLength() + " bits"
            });
            pkFields.push({
                key: "Modulus",
                value: formatByteStr(pk.n.toString(16), 16, 18)
            });
            pkFields.push({
                key: "Exponent",
                value: pk.e + " (0x" + pk.e.toString(16) + ")"
            });
        } else {
            let spkiHex = "";
            try {
                spkiHex = cert.getPublicKeyHex();
            } catch (err) {}

            if (spkiHex) {
                pkFields.push({
                    key: "Raw SPKI Hex",
                    value: formatByteStr(spkiHex, 16, 18)
                });
            }
            pkFields.push({
                key: "Error",
                value: pkLoadError || "Unknown Public Key type"
            });
        }

        // Format Public Key fields
        for (let i = 0; i < pkFields.length; i++) {
            pkStr += `  ${pkFields[i].key}:${(pkFields[i].value + "\n").padStart(
                18 - (pkFields[i].key.length + 3) + pkFields[i].value.length + 1,
                " "
            )}`;
        }

        // Signature fields
        let breakoutSig = false;
        try {
            breakoutSig = r.ASN1HEX.dump(sig).indexOf("SEQUENCE") === 0;
        } catch (err) {
            // Error processing signature, output without further breakout
        }

        if (breakoutSig) { // DSA or ECDSA
            sigStr = `  r:              ${formatByteStr(r.ASN1HEX.getV(sig, 4), 16, 18)}
  s:              ${formatByteStr(r.ASN1HEX.getV(sig, 48), 16, 18)}`;
        } else { // RSA or unknown
            sigStr = `  Signature:      ${formatByteStr(sig, 16, 18)}`;
        }

        // Extensions
        try {
            extensions = cert.getInfo().split("X509v3 Extensions:\n")[1].split("signature")[0];
        } catch (err) {}

        const issuerStr = formatDnObj(issuer, 2),
            nbDate = formatDate(cert.getNotBefore()),
            naDate = formatDate(cert.getNotAfter()),
            subjectStr = formatDnObj(subject, 2);

        return `Version:          ${cert.version} (0x${Utils.hex(cert.version - 1)})
Serial number:    ${new r.BigInteger(sn, 16).toString()} (0x${sn})
Algorithm ID:     ${cert.getSignatureAlgorithmField()}
Validity
  Not Before:     ${nbDate} (dd-mm-yyyy hh:mm:ss) (${cert.getNotBefore()})
  Not After:      ${naDate} (dd-mm-yyyy hh:mm:ss) (${cert.getNotAfter()})
Issuer
${issuerStr}
Subject
${subjectStr}
Fingerprints
  MD5:            ${runHash("md5", hex)}
  SHA1:           ${runHash("sha1", hex)}
  SHA256:         ${runHash("sha256", hex)}
Public Key
${pkStr.slice(0, -1)}
Certificate Signature
  Algorithm:      ${cert.getSignatureAlgorithmName()}
${sigStr}

Extensions
${extensions}`;
    }

}

/**
 * Formats dates.
 *
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate (dateStr) {
    if (dateStr.length === 13) { // UTC Time
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
