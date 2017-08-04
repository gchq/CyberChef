import Utils from "../Utils.js";
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
                cert.readCertHex(Utils.toHex(Utils.fromBase64(input, null, "byteArray"), ""));
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
                Utils.padLeft(
                    pkFields[i].value + "\n",
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
            str = Utils.padRight(key, maxKeyLen) + " = " + value + "\n";

            output += Utils.padLeft(str, indent + str.length, " ");
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
                output += Utils.padLeft(str, indent + str.length, " ");
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


/**
 * Overwrite DN attribute lookup in jsrasign library with a much more complete version from
 * https://github.com/nfephp-org/nfephp/blob/master/libs/Common/Certificate/Oids.php
 *
 * Various duplicates commented out.
 *
 * @constant
 */
r.X509.DN_ATTRHEX = {
    "0603550403": "commonName",
    "0603550404": "surname",
    "0603550406": "countryName",
    "0603550407": "localityName",
    "0603550408": "stateOrProvinceName",
    "0603550409": "streetAddress",
    "060355040a": "organizationName",
    "060355040b": "organizationalUnitName",
    "060355040c": "title",
    "0603550414": "telephoneNumber",
    "060355042a": "givenName",
    // "0603551d0e" : "id-ce-subjectKeyIdentifier",
    // "0603551d0f" : "id-ce-keyUsage",
    // "0603551d11" : "id-ce-subjectAltName",
    // "0603551d13" : "id-ce-basicConstraints",
    // "0603551d14" : "id-ce-cRLNumber",
    // "0603551d1f" : "id-ce-CRLDistributionPoints",
    // "0603551d20" : "id-ce-certificatePolicies",
    // "0603551d23" : "id-ce-authorityKeyIdentifier",
    // "0603551d25" : "id-ce-extKeyUsage",
    // "06032a864886f70d010901" : "Email",
    // "06032a864886f70d010101" : "RSAEncryption",
    // "06032a864886f70d010102" : "md2WithRSAEncryption",
    // "06032a864886f70d010104" : "md5withRSAEncryption",
    // "06032a864886f70d010105" : "SHA-1WithRSAEncryption",
    // "06032a8648ce380403" : "id-dsa-with-sha-1",
    // "06032b06010505070302" : "idKpClientAuth",
    // "06032b06010505070304" : "idKpSecurityemail",
    "06032b06010505070201": "idCertificatePolicies",
    "06036086480186f8420101": "netscape-cert-type",
    "06036086480186f8420102": "netscape-base-url",
    "06036086480186f8420103": "netscape-revocation-url",
    "06036086480186f8420104": "netscape-ca-revocation-url",
    "06036086480186f8420107": "netscape-cert-renewal-url",
    "06036086480186f8420108": "netscape-ca-policy-url",
    "06036086480186f842010c": "netscape-ssl-server-name",
    "06036086480186f842010d": "netscape-comment",
    "0603604c010201": "A1",
    "0603604c010203": "A3",
    "0603604c01020110": "Certification Practice Statement pointer",
    "0603604c010301": "Dados do cert parte 1",
    "0603604c010305": "Dados do cert parte 2",
    "0603604c010306": "Dados do cert parte 3",
    "06030992268993f22c640119": "domainComponent",
    "06032a24a0f2a07d01010a": "Signet pilot",
    "06032a24a0f2a07d01010b": "Signet intraNet",
    "06032a24a0f2a07d010102": "Signet personal",
    "06032a24a0f2a07d010114": "Signet securityPolicy",
    "06032a24a0f2a07d010103": "Signet business",
    "06032a24a0f2a07d010104": "Signet legal",
    "06032a24a497a35301640101": "Certificates Australia policyIdentifier",
    "06032a85702201": "seis-cp",
    "06032a8570220101": "SEIS certificatePolicy-s10",
    "06032a85702202": "SEIS pe",
    "06032a85702203": "SEIS at",
    "06032a8570220301": "SEIS at-personalIdentifier",
    "06032a8648ce380201": "holdinstruction-none",
    "06032a8648ce380202": "holdinstruction-callissuer",
    "06032a8648ce380203": "holdinstruction-reject",
    "06032a8648ce380401": "dsa",
    "06032a8648ce380403": "dsaWithSha1",
    "06032a8648ce3d01": "fieldType",
    "06032a8648ce3d0101": "prime-field",
    "06032a8648ce3d0102": "characteristic-two-field",
    "06032a8648ce3d010201": "ecPublicKey",
    "06032a8648ce3d010203": "characteristic-two-basis",
    "06032a8648ce3d01020301": "onBasis",
    "06032a8648ce3d01020302": "tpBasis",
    "06032a8648ce3d01020303": "ppBasis",
    "06032a8648ce3d02": "publicKeyType",
    "06032a8648ce3d0201": "ecPublicKey",
    "06032a8648ce3e0201": "dhPublicNumber",
    "06032a864886f67d07": "nsn",
    "06032a864886f67d0741": "nsn-ce",
    "06032a864886f67d074100": "entrustVersInfo",
    "06032a864886f67d0742": "nsn-alg",
    "06032a864886f67d07420a": "cast5CBC",
    "06032a864886f67d07420b": "cast5MAC",
    "06032a864886f67d07420c": "pbeWithMD5AndCAST5-CBC",
    "06032a864886f67d07420d": "passwordBasedMac",
    "06032a864886f67d074203": "cast3CBC",
    "06032a864886f67d0743": "nsn-oc",
    "06032a864886f67d074300": "entrustUser",
    "06032a864886f67d0744": "nsn-at",
    "06032a864886f67d074400": "entrustCAInfo",
    "06032a864886f67d07440a": "attributeCertificate",
    "06032a864886f70d0101": "pkcs-1",
    "06032a864886f70d010101": "rsaEncryption",
    "06032a864886f70d010102": "md2withRSAEncryption",
    "06032a864886f70d010103": "md4withRSAEncryption",
    "06032a864886f70d010104": "md5withRSAEncryption",
    "06032a864886f70d010105": "sha1withRSAEncryption",
    "06032a864886f70d010106": "rsaOAEPEncryptionSET",
    "06032a864886f70d010910020b": "SMIMEEncryptionKeyPreference",
    "06032a864886f70d010c": "pkcs-12",
    "06032a864886f70d010c01": "pkcs-12-PbeIds",
    "06032a864886f70d010c0101": "pbeWithSHAAnd128BitRC4",
    "06032a864886f70d010c0102": "pbeWithSHAAnd40BitRC4",
    "06032a864886f70d010c0103": "pbeWithSHAAnd3-KeyTripleDES-CBC",
    "06032a864886f70d010c0104": "pbeWithSHAAnd2-KeyTripleDES-CBC",
    "06032a864886f70d010c0105": "pbeWithSHAAnd128BitRC2-CBC",
    "06032a864886f70d010c0106": "pbeWithSHAAnd40BitRC2-CBC",
    "06032a864886f70d010c0a": "pkcs-12Version1",
    "06032a864886f70d010c0a01": "pkcs-12BadIds",
    "06032a864886f70d010c0a0101": "pkcs-12-keyBag",
    "06032a864886f70d010c0a0102": "pkcs-12-pkcs-8ShroudedKeyBag",
    "06032a864886f70d010c0a0103": "pkcs-12-certBag",
    "06032a864886f70d010c0a0104": "pkcs-12-crlBag",
    "06032a864886f70d010c0a0105": "pkcs-12-secretBag",
    "06032a864886f70d010c0a0106": "pkcs-12-safeContentsBag",
    "06032a864886f70d010c02": "pkcs-12-ESPVKID",
    "06032a864886f70d010c0201": "pkcs-12-PKCS8KeyShrouding",
    "06032a864886f70d010c03": "pkcs-12-BagIds",
    "06032a864886f70d010c0301": "pkcs-12-keyBagId",
    "06032a864886f70d010c0302": "pkcs-12-certAndCRLBagId",
    "06032a864886f70d010c0303": "pkcs-12-secretBagId",
    "06032a864886f70d010c0304": "pkcs-12-safeContentsId",
    "06032a864886f70d010c0305": "pkcs-12-pkcs-8ShroudedKeyBagId",
    "06032a864886f70d010c04": "pkcs-12-CertBagID",
    "06032a864886f70d010c0401": "pkcs-12-X509CertCRLBagID",
    "06032a864886f70d010c0402": "pkcs-12-SDSICertBagID",
    "06032a864886f70d010c05": "pkcs-12-OID",
    "06032a864886f70d010c0501": "pkcs-12-PBEID",
    "06032a864886f70d010c050101": "pkcs-12-PBEWithSha1And128BitRC4",
    "06032a864886f70d010c050102": "pkcs-12-PBEWithSha1And40BitRC4",
    "06032a864886f70d010c050103": "pkcs-12-PBEWithSha1AndTripleDESCBC",
    "06032a864886f70d010c050104": "pkcs-12-PBEWithSha1And128BitRC2CBC",
    "06032a864886f70d010c050105": "pkcs-12-PBEWithSha1And40BitRC2CBC",
    "06032a864886f70d010c050106": "pkcs-12-PBEWithSha1AndRC4",
    "06032a864886f70d010c050107": "pkcs-12-PBEWithSha1AndRC2CBC",
    "06032a864886f70d010c0502": "pkcs-12-EnvelopingID",
    "06032a864886f70d010c050201": "pkcs-12-RSAEncryptionWith128BitRC4",
    "06032a864886f70d010c050202": "pkcs-12-RSAEncryptionWith40BitRC4",
    "06032a864886f70d010c050203": "pkcs-12-RSAEncryptionWithTripleDES",
    "06032a864886f70d010c0503": "pkcs-12-SignatureID",
    "06032a864886f70d010c050301": "pkcs-12-RSASignatureWithSHA1Digest",
    "06032a864886f70d0103": "pkcs-3",
    "06032a864886f70d010301": "dhKeyAgreement",
    "06032a864886f70d0105": "pkcs-5",
    "06032a864886f70d010501": "pbeWithMD2AndDES-CBC",
    "06032a864886f70d01050a": "pbeWithSHAAndDES-CBC",
    "06032a864886f70d010503": "pbeWithMD5AndDES-CBC",
    "06032a864886f70d010504": "pbeWithMD2AndRC2-CBC",
    "06032a864886f70d010506": "pbeWithMD5AndRC2-CBC",
    "06032a864886f70d010509": "pbeWithMD5AndXOR",
    "06032a864886f70d0107": "pkcs-7",
    "06032a864886f70d010701": "data",
    "06032a864886f70d010702": "signedData",
    "06032a864886f70d010703": "envelopedData",
    "06032a864886f70d010704": "signedAndEnvelopedData",
    "06032a864886f70d010705": "digestData",
    "06032a864886f70d010706": "encryptedData",
    "06032a864886f70d010707": "dataWithAttributes",
    "06032a864886f70d010708": "encryptedPrivateKeyInfo",
    "06032a864886f70d0109": "pkcs-9",
    "06032a864886f70d010901": "emailAddress",
    "06032a864886f70d01090a": "issuerAndSerialNumber",
    "06032a864886f70d01090b": "passwordCheck",
    "06032a864886f70d01090c": "publicKey",
    "06032a864886f70d01090d": "signingDescription",
    "06032a864886f70d01090e": "extensionReq",
    "06032a864886f70d01090f": "sMIMECapabilities",
    "06032a864886f70d01090f01": "preferSignedData",
    "06032a864886f70d01090f02": "canNotDecryptAny",
    "06032a864886f70d01090f03": "receiptRequest",
    "06032a864886f70d01090f04": "receipt",
    "06032a864886f70d01090f05": "contentHints",
    "06032a864886f70d01090f06": "mlExpansionHistory",
    "06032a864886f70d010910": "id-sMIME",
    "06032a864886f70d01091000": "id-mod",
    "06032a864886f70d0109100001": "id-mod-cms",
    "06032a864886f70d0109100002": "id-mod-ess",
    "06032a864886f70d01091001": "id-ct",
    "06032a864886f70d0109100101": "id-ct-receipt",
    "06032a864886f70d01091002": "id-aa",
    "06032a864886f70d0109100201": "id-aa-receiptRequest",
    "06032a864886f70d0109100202": "id-aa-securityLabel",
    "06032a864886f70d0109100203": "id-aa-mlExpandHistory",
    "06032a864886f70d0109100204": "id-aa-contentHint",
    "06032a864886f70d010902": "unstructuredName",
    "06032a864886f70d010914": "friendlyName",
    "06032a864886f70d010915": "localKeyID",
    "06032a864886f70d010916": "certTypes",
    "06032a864886f70d01091601": "x509Certificate",
    "06032a864886f70d01091602": "sdsiCertificate",
    "06032a864886f70d010917": "crlTypes",
    "06032a864886f70d01091701": "x509Crl",
    "06032a864886f70d010903": "contentType",
    "06032a864886f70d010904": "messageDigest",
    "06032a864886f70d010905": "signingTime",
    "06032a864886f70d010906": "countersignature",
    "06032a864886f70d010907": "challengePassword",
    "06032a864886f70d010908": "unstructuredAddress",
    "06032a864886f70d010909": "extendedCertificateAttributes",
    "06032a864886f70d02": "digestAlgorithm",
    "06032a864886f70d0202": "md2",
    "06032a864886f70d0204": "md4",
    "06032a864886f70d0205": "md5",
    "06032a864886f70d03": "encryptionAlgorithm",
    "06032a864886f70d030a": "desCDMF",
    "06032a864886f70d0302": "rc2CBC",
    "06032a864886f70d0303": "rc2ECB",
    "06032a864886f70d0304": "rc4",
    "06032a864886f70d0305": "rc4WithMAC",
    "06032a864886f70d0306": "DESX-CBC",
    "06032a864886f70d0307": "DES-EDE3-CBC",
    "06032a864886f70d0308": "RC5CBC",
    "06032a864886f70d0309": "RC5-CBCPad",
    "06032a864886f7140403": "microsoftExcel",
    "06032a864886f7140404": "titledWithOID",
    "06032a864886f7140405": "microsoftPowerPoint",
    "06032b81051086480954": "x9-84",
    "06032b8105108648095400": "x9-84-Module",
    "06032b810510864809540001": "x9-84-Biometrics",
    "06032b810510864809540002": "x9-84-CMS",
    "06032b810510864809540003": "x9-84-Identifiers",
    "06032b8105108648095401": "biometric",
    "06032b810510864809540100": "id-unknown-Type",
    "06032b810510864809540101": "id-body-Odor",
    "06032b81051086480954010a": "id-palm",
    "06032b81051086480954010b": "id-retina",
    "06032b81051086480954010c": "id-signature",
    "06032b81051086480954010d": "id-speech-Pattern",
    "06032b81051086480954010e": "id-thermal-Image",
    "06032b81051086480954010f": "id-vein-Pattern",
    "06032b810510864809540110": "id-thermal-Face-Image",
    "06032b810510864809540111": "id-thermal-Hand-Image",
    "06032b810510864809540112": "id-lip-Movement",
    "06032b810510864809540113": "id-gait",
    "06032b810510864809540102": "id-dna",
    "06032b810510864809540103": "id-ear-Shape",
    "06032b810510864809540104": "id-facial-Features",
    "06032b810510864809540105": "id-finger-Image",
    "06032b810510864809540106": "id-finger-Geometry",
    "06032b810510864809540107": "id-hand-Geometry",
    "06032b810510864809540108": "id-iris-Features",
    "06032b810510864809540109": "id-keystroke-Dynamics",
    "06032b8105108648095402": "processing-algorithm",
    "06032b8105108648095403": "matching-method",
    "06032b8105108648095404": "format-Owner",
    "06032b810510864809540400": "cbeff-Owner",
    "06032b810510864809540401": "ibia-Owner",
    "06032b81051086480954040101": "id-ibia-SAFLINK",
    "06032b8105108648095404010a": "id-ibia-SecuGen",
    "06032b8105108648095404010b": "id-ibia-PreciseBiometric",
    "06032b8105108648095404010c": "id-ibia-Identix",
    "06032b8105108648095404010d": "id-ibia-DERMALOG",
    "06032b8105108648095404010e": "id-ibia-LOGICO",
    "06032b8105108648095404010f": "id-ibia-NIST",
    "06032b81051086480954040110": "id-ibia-A3Vision",
    "06032b81051086480954040111": "id-ibia-NEC",
    "06032b81051086480954040112": "id-ibia-STMicroelectronics",
    "06032b81051086480954040102": "id-ibia-Bioscrypt",
    "06032b81051086480954040103": "id-ibia-Visionics",
    "06032b81051086480954040104": "id-ibia-InfineonTechnologiesAG",
    "06032b81051086480954040105": "id-ibia-IridianTechnologies",
    "06032b81051086480954040106": "id-ibia-Veridicom",
    "06032b81051086480954040107": "id-ibia-CyberSIGN",
    "06032b81051086480954040108": "id-ibia-eCryp.",
    "06032b81051086480954040109": "id-ibia-FingerprintCardsAB",
    "06032b810510864809540402": "x9-Owner",
    "06032b0e021a05": "sha",
    "06032b0e03020101": "rsa",
    "06032b0e03020a": "desMAC",
    "06032b0e03020b": "rsaSignature",
    "06032b0e03020c": "dsa",
    "06032b0e03020d": "dsaWithSHA",
    "06032b0e03020e": "mdc2WithRSASignature",
    "06032b0e03020f": "shaWithRSASignature",
    "06032b0e030210": "dhWithCommonModulus",
    "06032b0e030211": "desEDE",
    "06032b0e030212": "sha",
    "06032b0e030213": "mdc-2",
    "06032b0e030202": "md4WitRSA",
    "06032b0e03020201": "sqmod-N",
    "06032b0e030214": "dsaCommon",
    "06032b0e030215": "dsaCommonWithSHA",
    "06032b0e030216": "rsaKeyTransport",
    "06032b0e030217": "keyed-hash-seal",
    "06032b0e030218": "md2WithRSASignature",
    "06032b0e030219": "md5WithRSASignature",
    "06032b0e03021a": "sha1",
    "06032b0e03021b": "dsaWithSHA1",
    "06032b0e03021c": "dsaWithCommonSHA1",
    "06032b0e03021d": "sha-1WithRSAEncryption",
    "06032b0e030203": "md5WithRSA",
    "06032b0e03020301": "sqmod-NwithRSA",
    "06032b0e030204": "md4WithRSAEncryption",
    "06032b0e030206": "desECB",
    "06032b0e030207": "desCBC",
    "06032b0e030208": "desOFB",
    "06032b0e030209": "desCFB",
    "06032b0e030301": "simple-strong-auth-mechanism",
    "06032b0e07020101": "ElGamal",
    "06032b0e07020301": "md2WithRSA",
    "06032b0e07020302": "md2WithElGamal",
    "06032b2403": "algorithm",
    "06032b240301": "encryptionAlgorithm",
    "06032b24030101": "des",
    "06032b240301010101": "desECBPad",
    "06032b24030101010101": "desECBPadISO",
    "06032b240301010201": "desCBCPad",
    "06032b24030101020101": "desCBCPadISO",
    "06032b24030102": "idea",
    "06032b2403010201": "ideaECB",
    "06032b240301020101": "ideaECBPad",
    "06032b24030102010101": "ideaECBPadISO",
    "06032b2403010202": "ideaCBC",
    "06032b240301020201": "ideaCBCPad",
    "06032b24030102020101": "ideaCBCPadISO",
    "06032b2403010203": "ideaOFB",
    "06032b2403010204": "ideaCFB",
    "06032b24030103": "des-3",
    "06032b240301030101": "des-3ECBPad",
    "06032b24030103010101": "des-3ECBPadISO",
    "06032b240301030201": "des-3CBCPad",
    "06032b24030103020101": "des-3CBCPadISO",
    "06032b240302": "hashAlgorithm",
    "06032b24030201": "ripemd160",
    "06032b24030202": "ripemd128",
    "06032b24030203": "ripemd256",
    "06032b24030204": "mdc2singleLength",
    "06032b24030205": "mdc2doubleLength",
    "06032b240303": "signatureAlgorithm",
    "06032b24030301": "rsa",
    "06032b2403030101": "rsaMitSHA-1",
    "06032b2403030102": "rsaMitRIPEMD160",
    "06032b24030302": "ellipticCurve",
    "06032b240304": "signatureScheme",
    "06032b24030401": "iso9796-1",
    "06032b2403040201": "iso9796-2",
    "06032b2403040202": "iso9796-2rsa",
    "06032b2404": "attribute",
    "06032b2405": "policy",
    "06032b2406": "api",
    "06032b240601": "manufacturerSpecific",
    "06032b240602": "functionalitySpecific",
    "06032b2407": "api",
    "06032b240701": "keyAgreement",
    "06032b240702": "keyTransport",
    "06032b06010401927c0a0101": "UNINETT policyIdentifier",
    "06032b0601040195180a": "ICE-TEL policyIdentifier",
    "06032b0601040197552001": "cryptlibEnvelope",
    "06032b0601040197552002": "cryptlibPrivateKey",
    "060a2b060104018237": "Microsoft OID",
    "060a2b0601040182370a": "Crypto 2.0",
    "060a2b0601040182370a01": "certTrustList",
    "060a2b0601040182370a0101": "szOID_SORTED_CTL",
    "060a2b0601040182370a0a": "Microsoft CMC OIDs",
    "060a2b0601040182370a0a01": "szOID_CMC_ADD_ATTRIBUTES",
    "060a2b0601040182370a0b": "Microsoft certificate property OIDs",
    "060a2b0601040182370a0b01": "szOID_CERT_PROP_ID_PREFIX",
    "060a2b0601040182370a0c": "CryptUI",
    "060a2b0601040182370a0c01": "szOID_ANY_APPLICATION_POLICY",
    "060a2b0601040182370a02": "nextUpdateLocation",
    "060a2b0601040182370a0301": "certTrustListSigning",
    "060a2b0601040182370a030a": "szOID_KP_QUALIFIED_SUBORDINATION",
    "060a2b0601040182370a030b": "szOID_KP_KEY_RECOVERY",
    "060a2b0601040182370a030c": "szOID_KP_DOCUMENT_SIGNING",
    "060a2b0601040182370a0302": "timeStampSigning",
    "060a2b0601040182370a0303": "serverGatedCrypto",
    "060a2b0601040182370a030301": "szOID_SERIALIZED",
    "060a2b0601040182370a0304": "encryptedFileSystem",
    "060a2b0601040182370a030401": "szOID_EFS_RECOVERY",
    "060a2b0601040182370a0305": "szOID_WHQL_CRYPTO",
    "060a2b0601040182370a0306": "szOID_NT5_CRYPTO",
    "060a2b0601040182370a0307": "szOID_OEM_WHQL_CRYPTO",
    "060a2b0601040182370a0308": "szOID_EMBEDDED_NT_CRYPTO",
    "060a2b0601040182370a0309": "szOID_ROOT_LIST_SIGNER",
    "060a2b0601040182370a0401": "yesnoTrustAttr",
    "060a2b0601040182370a0501": "szOID_DRM",
    "060a2b0601040182370a0502": "szOID_DRM_INDIVIDUALIZATION",
    "060a2b0601040182370a0601": "szOID_LICENSES",
    "060a2b0601040182370a0602": "szOID_LICENSE_SERVER",
    "060a2b0601040182370a07": "szOID_MICROSOFT_RDN_PREFIX",
    "060a2b0601040182370a0701": "szOID_KEYID_RDN",
    "060a2b0601040182370a0801": "szOID_REMOVE_CERTIFICATE",
    "060a2b0601040182370a0901": "szOID_CROSS_CERT_DIST_POINTS",
    "060a2b0601040182370c": "Catalog",
    "060a2b0601040182370c0101": "szOID_CATALOG_LIST",
    "060a2b0601040182370c0102": "szOID_CATALOG_LIST_MEMBER",
    "060a2b0601040182370c0201": "CAT_NAMEVALUE_OBJID",
    "060a2b0601040182370c0202": "CAT_MEMBERINFO_OBJID",
    "060a2b0601040182370d": "Microsoft PKCS10 OIDs",
    "060a2b0601040182370d01": "szOID_RENEWAL_CERTIFICATE",
    "060a2b0601040182370d0201": "szOID_ENROLLMENT_NAME_VALUE_PAIR",
    "060a2b0601040182370d0202": "szOID_ENROLLMENT_CSP_PROVIDER",
    "060a2b0601040182370d0203": "OS Version",
    "060a2b0601040182370f": "Microsoft Java",
    "060a2b06010401823710": "Microsoft Outlook/Exchange",
    "060a2b0601040182371004": "Outlook Express",
    "060a2b06010401823711": "Microsoft PKCS12 attributes",
    "060a2b0601040182371101": "szOID_LOCAL_MACHINE_KEYSET",
    "060a2b06010401823712": "Microsoft Hydra",
    "060a2b06010401823713": "Microsoft ISPU Test",
    "060a2b06010401823702": "Authenticode",
    "060a2b06010401823702010a": "spcAgencyInfo",
    "060a2b06010401823702010b": "spcStatementType",
    "060a2b06010401823702010c": "spcSpOpusInfo",
    "060a2b06010401823702010e": "certExtensions",
    "060a2b06010401823702010f": "spcPelmageData",
    "060a2b060104018237020112": "SPC_RAW_FILE_DATA_OBJID",
    "060a2b060104018237020113": "SPC_STRUCTURED_STORAGE_DATA_OBJID",
    "060a2b060104018237020114": "spcLink",
    "060a2b060104018237020115": "individualCodeSigning",
    "060a2b060104018237020116": "commercialCodeSigning",
    "060a2b060104018237020119": "spcLink",
    "060a2b06010401823702011a": "spcMinimalCriteriaInfo",
    "060a2b06010401823702011b": "spcFinancialCriteriaInfo",
    "060a2b06010401823702011c": "spcLink",
    "060a2b06010401823702011d": "SPC_HASH_INFO_OBJID",
    "060a2b06010401823702011e": "SPC_SIPINFO_OBJID",
    "060a2b060104018237020104": "spcIndirectDataContext",
    "060a2b0601040182370202": "CTL for Software Publishers Trusted CAs",
    "060a2b060104018237020201": "szOID_TRUSTED_CODESIGNING_CA_LIST",
    "060a2b060104018237020202": "szOID_TRUSTED_CLIENT_AUTH_CA_LIST",
    "060a2b060104018237020203": "szOID_TRUSTED_SERVER_AUTH_CA_LIST",
    "060a2b06010401823714": "Microsoft Enrollment Infrastructure",
    "060a2b0601040182371401": "szOID_AUTO_ENROLL_CTL_USAGE",
    "060a2b0601040182371402": "szOID_ENROLL_CERTTYPE_EXTENSION",
    "060a2b060104018237140201": "szOID_ENROLLMENT_AGENT",
    "060a2b060104018237140202": "szOID_KP_SMARTCARD_LOGON",
    "060a2b060104018237140203": "szOID_NT_PRINCIPAL_NAME",
    "060a2b0601040182371403": "szOID_CERT_MANIFOLD",
    "06092b06010401823715": "Microsoft CertSrv Infrastructure",
    "06092b0601040182371501": "szOID_CERTSRV_CA_VERSION",
    "06092b0601040182371514": "Client Information",
    "060a2b06010401823719": "Microsoft Directory Service",
    "060a2b0601040182371901": "szOID_NTDS_REPLICATION",
    "060a2b06010401823703": "Time Stamping",
    "060a2b060104018237030201": "SPC_TIME_STAMP_REQUEST_OBJID",
    "060a2b0601040182371e": "IIS",
    "060a2b0601040182371f": "Windows updates and service packs",
    "060a2b0601040182371f01": "szOID_PRODUCT_UPDATE",
    "060a2b06010401823704": "Permissions",
    "060a2b06010401823728": "Fonts",
    "060a2b06010401823729": "Microsoft Licensing and Registration",
    "060a2b0601040182372a": "Microsoft Corporate PKI (ITG)",
    "060a2b06010401823758": "CAPICOM",
    "060a2b0601040182375801": "szOID_CAPICOM_VERSION",
    "060a2b0601040182375802": "szOID_CAPICOM_ATTRIBUTE",
    "060a2b060104018237580201": "szOID_CAPICOM_DOCUMENT_NAME",
    "060a2b060104018237580202": "szOID_CAPICOM_DOCUMENT_DESCRIPTION",
    "060a2b0601040182375803": "szOID_CAPICOM_ENCRYPTED_DATA",
    "060a2b060104018237580301": "szOID_CAPICOM_ENCRYPTED_CONTENT",
    "06032b0601050507": "pkix",
    "06032b060105050701": "privateExtension",
    "06032b06010505070101": "authorityInfoAccess",
    "06032b06010505070c02": "CMC Data",
    "06032b060105050702": "policyQualifierIds",
    // "06032b06010505070201" : "cps",
    "06032b06010505070202": "unotice",
    "06032b060105050703": "keyPurpose",
    "06032b06010505070301": "serverAuth",
    "06032b06010505070302": "clientAuth",
    "06032b06010505070303": "codeSigning",
    "06032b06010505070304": "emailProtection",
    "06032b06010505070305": "ipsecEndSystem",
    "06032b06010505070306": "ipsecTunnel",
    "06032b06010505070307": "ipsecUser",
    "06032b06010505070308": "timeStamping",
    "06032b060105050704": "cmpInformationTypes",
    "06032b06010505070401": "caProtEncCert",
    "06032b06010505070402": "signKeyPairTypes",
    "06032b06010505070403": "encKeyPairTypes",
    "06032b06010505070404": "preferredSymmAlg",
    "06032b06010505070405": "caKeyUpdateInfo",
    "06032b06010505070406": "currentCRL",
    "06032b06010505073001": "ocsp",
    "06032b06010505073002": "caIssuers",
    "06032b06010505080101": "HMAC-MD5",
    "06032b06010505080102": "HMAC-SHA",
    "060360864801650201010a": "mosaicKeyManagementAlgorithm",
    "060360864801650201010b": "sdnsKMandSigAlgorithm",
    "060360864801650201010c": "mosaicKMandSigAlgorithm",
    "060360864801650201010d": "SuiteASignatureAlgorithm",
    "060360864801650201010e": "SuiteAConfidentialityAlgorithm",
    "060360864801650201010f": "SuiteAIntegrityAlgorithm",
    "06036086480186f84201": "cert-extension",
    // "06036086480186f8420101" : "netscape-cert-type",
    "06036086480186f842010a": "EntityLogo",
    "06036086480186f842010b": "UserPicture",
    // "06036086480186f842010c" : "netscape-ssl-server-name",
    // "06036086480186f842010d" : "netscape-comment",
    // "06036086480186f8420102" : "netscape-base-url",
    // "06036086480186f8420103" : "netscape-revocation-url",
    // "06036086480186f8420104" : "netscape-ca-revocation-url",
    // "06036086480186f8420107" : "netscape-cert-renewal-url",
    // "06036086480186f8420108" : "netscape-ca-policy-url",
    "06036086480186f8420109": "HomePage-url",
    "06036086480186f84202": "data-type",
    "06036086480186f8420201": "GIF",
    "06036086480186f8420202": "JPEG",
    "06036086480186f8420203": "URL",
    "06036086480186f8420204": "HTML",
    "06036086480186f8420205": "netscape-cert-sequence",
    "06036086480186f8420206": "netscape-cert-url",
    "06036086480186f84203": "directory",
    "06036086480186f8420401": "serverGatedCrypto",
    "06036086480186f845010603": "Unknown Verisign extension",
    "06036086480186f845010606": "Unknown Verisign extension",
    "06036086480186f84501070101": "Verisign certificatePolicy",
    "06036086480186f8450107010101": "Unknown Verisign policy qualifier",
    "06036086480186f8450107010102": "Unknown Verisign policy qualifier",
    "0603678105": "TCPA",
    "060367810501": "tcpaSpecVersion",
    "060367810502": "tcpaAttribute",
    "06036781050201": "tcpaAtTpmManufacturer",
    "0603678105020a": "tcpaAtSecurityQualities",
    "0603678105020b": "tcpaAtTpmProtectionProfile",
    "0603678105020c": "tcpaAtTpmSecurityTarget",
    "0603678105020d": "tcpaAtFoundationProtectionProfile",
    "0603678105020e": "tcpaAtFoundationSecurityTarget",
    "0603678105020f": "tcpaAtTpmIdLabel",
    "06036781050202": "tcpaAtTpmModel",
    "06036781050203": "tcpaAtTpmVersion",
    "06036781050204": "tcpaAtPlatformManufacturer",
    "06036781050205": "tcpaAtPlatformModel",
    "06036781050206": "tcpaAtPlatformVersion",
    "06036781050207": "tcpaAtComponentManufacturer",
    "06036781050208": "tcpaAtComponentModel",
    "06036781050209": "tcpaAtComponentVersion",
    "060367810503": "tcpaProtocol",
    "06036781050301": "tcpaPrttTpmIdProtocol",
    "0603672a00": "contentType",
    "0603672a0000": "PANData",
    "0603672a0001": "PANToken",
    "0603672a0002": "PANOnly",
    "0603672a01": "msgExt",
    "0603672a0a": "national",
    "0603672a0a8140": "Japan",
    "0603672a02": "field",
    "0603672a0200": "fullName",
    "0603672a0201": "givenName",
    "0603672a020a": "amount",
    "0603672a0202": "familyName",
    "0603672a0203": "birthFamilyName",
    "0603672a0204": "placeName",
    "0603672a0205": "identificationNumber",
    "0603672a0206": "month",
    "0603672a0207": "date",
    "0603672a02070b": "accountNumber",
    "0603672a02070c": "passPhrase",
    "0603672a0208": "address",
    "0603672a0209": "telephone",
    "0603672a03": "attribute",
    "0603672a0300": "cert",
    "0603672a030000": "rootKeyThumb",
    "0603672a030001": "additionalPolicy",
    "0603672a04": "algorithm",
    "0603672a05": "policy",
    "0603672a0500": "root",
    "0603672a06": "module",
    "0603672a07": "certExt",
    "0603672a0700": "hashedRootKey",
    "0603672a0701": "certificateType",
    "0603672a0702": "merchantData",
    "0603672a0703": "cardCertRequired",
    "0603672a0704": "tunneling",
    "0603672a0705": "setExtensions",
    "0603672a0706": "setQualifier",
    "0603672a08": "brand",
    "0603672a0801": "IATA-ATA",
    "0603672a081e": "Diners",
    "0603672a0822": "AmericanExpress",
    "0603672a0804": "VISA",
    "0603672a0805": "MasterCard",
    "0603672a08ae7b": "Novus",
    "0603672a09": "vendor",
    "0603672a0900": "GlobeSet",
    "0603672a0901": "IBM",
    "0603672a090a": "Griffin",
    "0603672a090b": "Certicom",
    "0603672a090c": "OSS",
    "0603672a090d": "TenthMountain",
    "0603672a090e": "Antares",
    "0603672a090f": "ECC",
    "0603672a0910": "Maithean",
    "0603672a0911": "Netscape",
    "0603672a0912": "Verisign",
    "0603672a0913": "BlueMoney",
    "0603672a0902": "CyberCash",
    "0603672a0914": "Lacerte",
    "0603672a0915": "Fujitsu",
    "0603672a0916": "eLab",
    "0603672a0917": "Entrust",
    "0603672a0918": "VIAnet",
    "0603672a0919": "III",
    "0603672a091a": "OpenMarket",
    "0603672a091b": "Lexem",
    "0603672a091c": "Intertrader",
    "0603672a091d": "Persimmon",
    "0603672a0903": "Terisa",
    "0603672a091e": "NABLE",
    "0603672a091f": "espace-net",
    "0603672a0920": "Hitachi",
    "0603672a0921": "Microsoft",
    "0603672a0922": "NEC",
    "0603672a0923": "Mitsubishi",
    "0603672a0924": "NCR",
    "0603672a0925": "e-COMM",
    "0603672a0926": "Gemplus",
    "0603672a0904": "RSADSI",
    "0603672a0905": "VeriFone",
    "0603672a0906": "TrinTech",
    "0603672a0907": "BankGate",
    "0603672a0908": "GTE",
    "0603672a0909": "CompuSource",
    "0603551d01": "authorityKeyIdentifier",
    "0603551d0a": "basicConstraints",
    "0603551d0b": "nameConstraints",
    "0603551d0c": "policyConstraints",
    "0603551d0d": "basicConstraints",
    "0603551d0e": "subjectKeyIdentifier",
    "0603551d0f": "keyUsage",
    "0603551d10": "privateKeyUsagePeriod",
    "0603551d11": "subjectAltName",
    "0603551d12": "issuerAltName",
    "0603551d13": "basicConstraints",
    "0603551d02": "keyAttributes",
    "0603551d14": "cRLNumber",
    "0603551d15": "cRLReason",
    "0603551d16": "expirationDate",
    "0603551d17": "instructionCode",
    "0603551d18": "invalidityDate",
    "0603551d1a": "issuingDistributionPoint",
    "0603551d1b": "deltaCRLIndicator",
    "0603551d1c": "issuingDistributionPoint",
    "0603551d1d": "certificateIssuer",
    "0603551d03": "certificatePolicies",
    "0603551d1e": "nameConstraints",
    "0603551d1f": "cRLDistributionPoints",
    "0603551d20": "certificatePolicies",
    "0603551d21": "policyMappings",
    "0603551d22": "policyConstraints",
    "0603551d23": "authorityKeyIdentifier",
    "0603551d24": "policyConstraints",
    "0603551d25": "extKeyUsage",
    "0603551d04": "keyUsageRestriction",
    "0603551d05": "policyMapping",
    "0603551d06": "subtreesConstraint",
    "0603551d07": "subjectAltName",
    "0603551d08": "issuerAltName",
    "0603551d09": "subjectDirectoryAttributes",
    "0603550400": "objectClass",
    "0603550401": "aliasObjectName",
    // "060355040c" : "title",
    "060355040d": "description",
    "060355040e": "searchGuide",
    "060355040f": "businessCategory",
    "0603550410": "postalAddress",
    "0603550411": "postalCode",
    "0603550412": "postOfficeBox",
    "0603550413": "physicalDeliveryOfficeName",
    "0603550402": "knowledgeInformation",
    // "0603550414" : "telephoneNumber",
    "0603550415": "telexNumber",
    "0603550416": "teletexTerminalIdentifier",
    "0603550417": "facsimileTelephoneNumber",
    "0603550418": "x121Address",
    "0603550419": "internationalISDNNumber",
    "060355041a": "registeredAddress",
    "060355041b": "destinationIndicator",
    "060355041c": "preferredDeliveryMehtod",
    "060355041d": "presentationAddress",
    "060355041e": "supportedApplicationContext",
    "060355041f": "member",
    "0603550420": "owner",
    "0603550421": "roleOccupant",
    "0603550422": "seeAlso",
    "0603550423": "userPassword",
    "0603550424": "userCertificate",
    "0603550425": "caCertificate",
    "0603550426": "authorityRevocationList",
    "0603550427": "certificateRevocationList",
    "0603550428": "crossCertificatePair",
    "0603550429": "givenName",
    // "060355042a" : "givenName",
    "0603550405": "serialNumber",
    "0603550434": "supportedAlgorithms",
    "0603550435": "deltaRevocationList",
    "060355043a": "crossCertificatePair",
    // "0603550409" : "streetAddress",
    "06035508": "X.500-Algorithms",
    "0603550801": "X.500-Alg-Encryption",
    "060355080101": "rsa",
    "0603604c0101": "DPC"
};
