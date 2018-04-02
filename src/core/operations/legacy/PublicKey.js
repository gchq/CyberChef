import Utils from "../Utils.js";
import {fromBase64} from "../lib/Base64";
import * as r from "jsrsasign";


/**
 * Public Key operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const PublicKey = {

    /**
     * @constant
     * @default
     */
    X509_INPUT_FORMAT: ["PEM", "DER Hex", "Base64", "Raw"],

    /**
     * Parse X.509 certificate operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runParseX509: function (input, args) {
        if (!input.length) {
            return "No input";
        }

        let cert = new r.X509(),
            inputFormat = args[0];

        switch (inputFormat) {
            case "DER Hex":
                input = input.replace(/\s/g, "");
                cert.readCertHex(input);
                break;
            case "PEM":
                cert.readCertPEM(input);
                break;
            case "Base64":
                cert.readCertHex(Utils.toHex(fromBase64(input, null, "byteArray"), ""));
                break;
            case "Raw":
                cert.readCertHex(Utils.toHex(Utils.strToByteArray(input), ""));
                break;
            default:
                throw "Undefined input format";
        }

        let sn = cert.getSerialNumberHex(),
            issuer = cert.getIssuerString(),
            subject = cert.getSubjectString(),
            pk = cert.getPublicKey(),
            pkFields = [],
            pkStr = "",
            sig = cert.getSignatureValueHex(),
            sigStr = "",
            extensions = cert.getInfo().split("X509v3 Extensions:\n")[1].split("signature")[0];

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
                value: PublicKey._formatByteStr(pk.pubKeyHex, 16, 18)
            });
        } else if (pk.type === "DSA") { // DSA
            pkFields.push({
                key: "pub",
                value: PublicKey._formatByteStr(pk.y.toString(16), 16, 18)
            });
            pkFields.push({
                key: "P",
                value: PublicKey._formatByteStr(pk.p.toString(16), 16, 18)
            });
            pkFields.push({
                key: "Q",
                value: PublicKey._formatByteStr(pk.q.toString(16), 16, 18)
            });
            pkFields.push({
                key: "G",
                value: PublicKey._formatByteStr(pk.g.toString(16), 16, 18)
            });
        } else if (pk.e) { // RSA
            pkFields.push({
                key: "Length",
                value: pk.n.bitLength() + " bits"
            });
            pkFields.push({
                key: "Modulus",
                value: PublicKey._formatByteStr(pk.n.toString(16), 16, 18)
            });
            pkFields.push({
                key: "Exponent",
                value: pk.e + " (0x" + pk.e.toString(16) + ")"
            });
        } else {
            pkFields.push({
                key: "Error",
                value: "Unknown Public Key type"
            });
        }

        // Format Public Key fields
        for (let i = 0; i < pkFields.length; i++) {
            pkStr += "  " + pkFields[i].key + ":" +
                (pkFields[i].value + "\n").padStart(
                    18 - (pkFields[i].key.length + 3) + pkFields[i].value.length + 1,
                    " "
                );
        }

        // Signature fields
        let breakoutSig = false;
        try {
            breakoutSig = r.ASN1HEX.dump(sig).indexOf("SEQUENCE") === 0;
        } catch (err) {
            // Error processing signature, output without further breakout
        }

        if (breakoutSig) { // DSA or ECDSA
            sigStr = "  r:              " + PublicKey._formatByteStr(r.ASN1HEX.getV(sig, 4), 16, 18) + "\n" +
                "  s:              " + PublicKey._formatByteStr(r.ASN1HEX.getV(sig, 48), 16, 18);
        } else { // RSA or unknown
            sigStr = "  Signature:      " + PublicKey._formatByteStr(sig, 16, 18);
        }


        let issuerStr = PublicKey._formatDnStr(issuer, 2),
            nbDate = PublicKey._formatDate(cert.getNotBefore()),
            naDate = PublicKey._formatDate(cert.getNotAfter()),
            subjectStr = PublicKey._formatDnStr(subject, 2);

        return `Version:          ${cert.version} (0x${Utils.hex(cert.version - 1)})
Serial number:    ${new r.BigInteger(sn, 16).toString()} (0x${sn})
Algorithm ID:     ${cert.getSignatureAlgorithmField()}
Validity
  Not Before:     ${nbDate} (dd-mm-yy hh:mm:ss) (${cert.getNotBefore()})
  Not After:      ${naDate} (dd-mm-yy hh:mm:ss) (${cert.getNotAfter()})
Issuer
${issuerStr}
Subject
${subjectStr}
Public Key
${pkStr.slice(0, -1)}
Certificate Signature
  Algorithm:      ${cert.getSignatureAlgorithmName()}
${sigStr}

Extensions
${extensions}`;
    },


    /**
     * PEM to Hex operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runPemToHex: function(input, args) {
        if (input.indexOf("-----BEGIN") < 0) {
            // Add header so that the KEYUTIL function works
            input = "-----BEGIN CERTIFICATE-----" + input;
        }
        if (input.indexOf("-----END") < 0) {
            // Add footer so that the KEYUTIL function works
            input = input + "-----END CERTIFICATE-----";
        }
        let cert = new r.X509();
        cert.readCertPEM(input);
        return cert.hex;
    },


    /**
     * @constant
     * @default
     */
    PEM_HEADER_STRING: "CERTIFICATE",

    /**
     * Hex to PEM operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runHexToPem: function(input, args) {
        return r.KJUR.asn1.ASN1Util.getPEMStringFromHex(input.replace(/\s/g, ""), args[0]);
    },


    /**
     * Hex to Object Identifier operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runHexToObjectIdentifier: function(input, args) {
        return r.KJUR.asn1.ASN1Util.oidHexToInt(input.replace(/\s/g, ""));
    },


    /**
     * Object Identifier to Hex operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runObjectIdentifierToHex: function(input, args) {
        return r.KJUR.asn1.ASN1Util.oidIntToHex(input);
    },


    /**
     * @constant
     * @default
     */
    ASN1_TRUNCATE_LENGTH: 32,

    /**
     * Parse ASN.1 hex string operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runParseAsn1HexString: function(input, args) {
        let truncateLen = args[1],
            index = args[0];
        return r.ASN1HEX.dump(input.replace(/\s/g, ""), {
            "ommitLongOctet": truncateLen
        }, index);
    },


    /**
     * Formats Distinguished Name (DN) strings.
     *
     * @private
     * @param {string} dnStr
     * @param {number} indent
     * @returns {string}
     */
    _formatDnStr: function(dnStr, indent) {
        let output = "",
            fields = dnStr.substr(1).replace(/([^\\])\//g, "$1$1/").split(/[^\\]\//),
            maxKeyLen = 0,
            key,
            value,
            i,
            str;

        for (i = 0; i < fields.length; i++) {
            if (!fields[i].length) continue;

            key = fields[i].split("=")[0];

            maxKeyLen = key.length > maxKeyLen ? key.length : maxKeyLen;
        }

        for (i = 0; i < fields.length; i++) {
            if (!fields[i].length) continue;

            key = fields[i].split("=")[0];
            value = fields[i].split("=")[1];
            str = key.padEnd(maxKeyLen, " ") + " = " + value + "\n";

            output += str.padStart(indent + str.length, " ");
        }

        return output.slice(0, -1);
    },


    /**
     * Formats byte strings by adding line breaks and delimiters.
     *
     * @private
     * @param {string} byteStr
     * @param {number} length - Line width
     * @param {number} indent
     * @returns {string}
     */
    _formatByteStr: function(byteStr, length, indent) {
        byteStr = Utils.toHex(Utils.fromHex(byteStr), ":");
        length = length * 3;
        let output = "";

        for (let i = 0; i < byteStr.length; i += length) {
            const str = byteStr.slice(i, i + length) + "\n";
            if (i === 0) {
                output += str;
            } else {
                output += str.padStart(indent + str.length, " ");
            }
        }

        return output.slice(0, output.length-1);
    },


    /**
     * Formats dates.
     *
     * @private
     * @param {string} dateStr
     * @returns {string}
     */
    _formatDate: function(dateStr) {
        return dateStr[4] + dateStr[5] + "/" +
            dateStr[2] + dateStr[3] + "/" +
            dateStr[0] + dateStr[1] + " " +
            dateStr[6] + dateStr[7] + ":" +
            dateStr[8] + dateStr[9] + ":" +
            dateStr[10] + dateStr[11];
    },

};

export default PublicKey;
