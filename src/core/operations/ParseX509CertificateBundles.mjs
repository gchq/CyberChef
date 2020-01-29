/**
 * @author nehagopinath [nehagowri94@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import r from "jsrsasign";
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
                "value": ["PEM"]
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

        const regex1 = /^-----BEGIN CERTIFICATE-----\r?\n((?:(?!-----).*\r?\n)*)-----END CERTIFICATE-----/gm;
        const regex2 = /^-----BEGIN TRUSTED CERTIFICATE-----\r?\n((?:(?!-----).*\r?\n)*)-----END TRUSTED CERTIFICATE-----/gm;

        let m;
        let res = "";
        let count = 0;

        while ((m = regex1.exec(input)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex1.lastIndex) {
                regex1.lastIndex++;

            }

            count++;
            res += "\nCertificate:\n" + parseCert("-----BEGIN CERTIFICATE-----" + "\n" + m[1] + "\n" + "-----END CERTIFICATE-----");
        }

        while ((m = regex2.exec(input)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex2.lastIndex) {
                regex2.lastIndex++;

            }

            count++;
            res += "\nCertificate:\n" + parseCert("-----BEGIN TRUSTED CERTIFICATE-----" + "\n" + m[1] + "\n" + "-----END TRUSTED CERTIFICATE-----");
        }


        return "Parsed Certificates =" + count + ":\n" + res;

    }
}

/**
 * parses individual certificates.
 *
 * @param {string} input
 * @returns {string}
 */
function parseCert(input) {

    const cert = new r.X509();
    cert.readCertPEM(input);

    const issuer = cert.getIssuerString(),
        subject = cert.getSubjectString();

    let extensions = "";

    // Extensions
    try {
        // extensions =cert.getInfo();
        extensions = cert.getInfo().split("X509v3 Extensions:\n")[1].split("signature")[0];
    } catch (err) {
    }

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

/**
 * Formats dates.
 *
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
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
