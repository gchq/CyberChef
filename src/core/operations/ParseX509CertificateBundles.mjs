/**
 * @author nehagopinath [nehagowri94@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import r from "jsrsasign";
import {toHex} from "../lib/Hex";
import {fromBase64} from "../lib/Base64";
import Utils from "../Utils";
import {formatDnStr} from "../lib/PublicKey";

/**
 * ParseX509CertificateBundles operation
 */
class ParseX509CertificateBundles extends Operation {

    /**
     * ParseX509CertificateBundles constructor
     */
    constructor() {
        super();

        this.name = "ParseX509CertificateBundles";
        this.module = "PublicKey";
        this.description = "X.509 is an ITU-T standard for a public key infrastructure (PKI) and Privilege Management Infrastructure (PMI). It is commonly involved with SSL/TLS security.<br><br>This operation displays the required contents of different certificates bundled in the input file in a human readable format, similar to the openssl command line tool.<br><br>Tags: X509, server hello, handshake";
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
        this.patterns = [
            {
                "match": "^-+BEGIN CERTIFICATE-+\\r?\\n[\\da-z+/\\n\\r]+-+END CERTIFICATE-+\\r?\\n?$",
                "flags": "i",
                "args": [
                    "PEM"
                ]
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

        switch (inputFormat) {
            case "DER Hex":
                input = input.replace(/\s/g, "");
                cert.readCertHex(input);
                break;
            case "PEM":
                cert.readCertPEM(input);
                break;
            case "Base64":
                cert.readCertHex(toHex(fromBase64(input, null, "byteArray"), ""));
                break;
            case "Raw":
                cert.readCertHex(toHex(Utils.strToByteArray(input), ""));
                break;
            default:
                throw "Undefined input format";
        }

        const issuer = cert.getIssuerString(),
            subject = cert.getSubjectString();

        let extensions = "";

        // Extensions
        try {
            // extensions =cert.getInfo();
            extensions = cert.getInfo().split("basicConstraints :\n")[1].split("signature")[0];
        } catch (err) {}

        const issuerStr = formatDnStr(issuer, 2),
            nbDate = formatDate(cert.getNotBefore()),
            naDate = formatDate(cert.getNotAfter()),
            subjectStr = formatDnStr(subject, 2);

        return `Validity
  Not Before: ${nbDate} (dd-mm-yyyy hh:mm:ss) (${cert.getNotBefore()})
  Not After: ${naDate} (dd-mm-yyyy hh:mm:ss) (${cert.getNotAfter()})
Issuer
${issuerStr}
Subject
${subjectStr}
Extensions/basicConstraints 
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

export default ParseX509CertificateBundles;
