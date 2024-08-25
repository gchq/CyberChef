/**
 * @author robinsandhu
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";
import { fromBase64 } from "../lib/Base64.mjs";
import { toHex } from "../lib/Hex.mjs";
import { formatDnObj } from "../lib/PublicKey.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

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
     * @returns {string} Human-readable description of a Certificate Revocation List (CRL).
     */
    run(input, args) {
        if (!input.length) {
            return "No input";
        }

        const inputFormat = args[0];

        let undefinedInputFormat = false;
        try {
            switch (inputFormat) {
                case "DER Hex":
                    input = input.replace(/\s/g, "").toLowerCase();
                    break;
                case "PEM":
                    break;
                case "Base64":
                    input = toHex(fromBase64(input, null, "byteArray"), "");
                    break;
                case "Raw":
                    input = toHex(Utils.strToArrayBuffer(input), "");
                    break;
                default:
                    undefinedInputFormat = true;
            }
        } catch (e) {
            throw "Certificate load error (non-certificate input?)";
        }
        if (undefinedInputFormat) throw "Undefined input format";

        console.log(input);

        const crl = new r.X509CRL(input);

        let out = `Certificate Revocation List (CRL):
    Version: ${crl.getVersion() === null ? "1 (0x0)" : "2 (0x1)"}
    Signature Algorithm: ${crl.getSignatureAlgorithmField()}
    Issuer:\n${formatDnObj(crl.getIssuer(), 8)}
    Last Update: ${generalizedDateTimeToUTC(crl.getThisUpdate())}
    Next Update: ${generalizedDateTimeToUTC(crl.getNextUpdate())}\n`;

        if (crl.getParam().ext !== undefined) {
            out += `\tCRL extensions:\n${formatCRLExtensions(crl.getParam().ext, 8)}\n`;
        }

        out += `Revoked Certificates:\n${formatRevokedCertificates(crl.getRevCertArray(), 4)}
Signature Value:\n${formatCRLSignature(crl.getSignatureValueHex(), 8)}`;

        return out;
    }
}

/**
 * Generalized date time string to UTC.
 * @param {string} datetime
 * @returns UTC datetime string.
 */
function generalizedDateTimeToUTC(datetime) {
    // Ensure the string is in the correct format
    if (!/^\d{12,14}Z$/.test(datetime)) {
        throw new OperationError(`failed to format datetime string ${datetime}`);
    }

    // Extract components
    let centuary = "20";
    if (datetime.length === 15) {
        centuary = datetime.substring(0, 2);
        datetime = datetime.slice(2);
    }
    const year = centuary + datetime.substring(0, 2);
    const month = datetime.substring(2, 4);
    const day = datetime.substring(4, 6);
    const hour = datetime.substring(6, 8);
    const minute = datetime.substring(8, 10);
    const second = datetime.substring(10, 12);

    // Construct ISO 8601 format string
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;

    // Parse using standard Date object
    const isoDateTime = new Date(isoString);

    return isoDateTime.toUTCString();
}

/**
 * Format CRL extensions.
 * @param {r.ExtParam[] | undefined} extensions
 * @param {Number} indent
 * @returns Formatted string detailing CRL extensions.
 */
function formatCRLExtensions(extensions, indent) {
    if (Array.isArray(extensions) === false || extensions.length === 0) {
        return indentString(`No CRL extensions.`, indent);
    }

    let out = ``;

    extensions.sort((a, b) => {
        if (!Object.hasOwn(a, "extname") || !Object.hasOwn(b, "extname")) {
            return 0;
        }
        if (a.extname < b.extname) {
            return -1;
        } else if (a.extname === b.extname) {
            return 0;
        } else {
            return 1;
        }
    });

    extensions.forEach((ext) => {
        if (!Object.hasOwn(ext, "extname")) {
            throw new OperationError(`CRL entry extension object missing 'extname' key: ${ext}`);
        }
        switch (ext.extname) {
            case "authorityKeyIdentifier":
                out += `X509v3 Authority Key Identifier:\n`;
                if (Object.hasOwn(ext, "kid")) {
                    out += `\tkeyid:${colonDelimitedHexFormatString(ext.kid.hex.toUpperCase())}\n`;
                }
                if (Object.hasOwn(ext, "issuer")) {
                    out += `\tDirName:${ext.issuer.str}\n`;
                }
                if (Object.hasOwn(ext, "sn")) {
                    out += `\tserial:${colonDelimitedHexFormatString(ext.sn.hex.toUpperCase())}\n`;
                }
                break;
            case "cRLDistributionPoints":
                out += `X509v3 CRL Distribution Points:\n`;
                ext.array.forEach((distPoint) => {
                    out += `\tFull Name:\n`;
                    distPoint.dpname.full.forEach((name) => {
                        if (Object.hasOwn(name, "ip")) {
                            out += `\t\tIP:${name.ip}\n`;
                        }
                        if (Object.hasOwn(name, "dns")) {
                            out += `\t\tDNS:${name.dns}\n`;
                        }
                        if (Object.hasOwn(name, "uri")) {
                            out += `\t\tURI:${name.uri}\n`;
                        }
                        if (Object.hasOwn(name, "rfc822")) {
                            out += `\t\tEMAIL:${name.rfc822}\n`;
                        }
                    });
                });
                break;
            case "cRLNumber":
                if (!Object.hasOwn(ext, "num")) {
                    throw new OperationError(`'cRLNumber' CRL entry extension missing 'num' key: ${ext}`);
                }
                out += `X509v3 CRL Number:\n\t${ext.num.hex.toUpperCase()}\n`;
                break;
            default:
                out += `${ext.extname}:\n`;
                out += `\tUnsupported CRL extension. Try openssl CLI.\n`;
                break;
        }
    });

    return indentString(chop(out), indent);
}

/**
 * Colon-delimited hex formatted output.
 * @param {string} hexString Hex String
 * @returns String representing input hex string with colon delimiter.
 */
function colonDelimitedHexFormatString(hexString) {
    if (hexString.length % 2 !== 0) {
        hexString = "0" + hexString;
    }

    return chop(hexString.replace(/(..)/g, "$&:"));
}

/**
 * Format revoked certificates array
 * @param {r.RevokedCertificate[] | null} revokedCertificates
 * @param {Number} indent
 * @returns Multi-line formatted string output of revoked certificates array
 */
function formatRevokedCertificates(revokedCertificates, indent) {
    if (Array.isArray(revokedCertificates) === false || revokedCertificates.length === 0) {
        return indentString("No Revoked Certificates.", indent);
    }

    let out=``;

    revokedCertificates.forEach((revCert) => {
        if (!Object.hasOwn(revCert, "sn") || !Object.hasOwn(revCert, "date")) {
            throw new OperationError("invalid revoked certificate object, missing either serial number or date");
        }

        out += `Serial Number: ${revCert.sn.hex.toUpperCase()}
    Revocation Date: ${generalizedDateTimeToUTC(revCert.date)}\n`;
        if (Object.hasOwn(revCert, "ext") && Array.isArray(revCert.ext) && revCert.ext.length !== 0) {
            out += `\tCRL entry extensions:\n${indentString(formatCRLEntryExtensions(revCert.ext), 2*indent)}\n`;
        }
    });

    return indentString(chop(out), indent);
}

/**
 * Format CRL entry extensions.
 * @param {Object[]} exts
 * @returns Formatted multi-line string describing CRL entry extensions.
 */
function formatCRLEntryExtensions(exts) {
    let out = ``;

    const crlReasonCodeToReasonMessage = {
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

    const holdInstructionOIDToName = {
        "1.2.840.10040.2.1": "Hold Instruction None",
        "1.2.840.10040.2.2": "Hold Instruction Call Issuer",
        "1.2.840.10040.2.3": "Hold Instruction Reject",
    };

    exts.forEach((ext) => {
        if (!Object.hasOwn(ext, "extname")) {
            throw new OperationError(`CRL entry extension object missing 'extname' key: ${ext}`);
        }
        switch (ext.extname) {
            case "cRLReason":
                if (!Object.hasOwn(ext, "code")) {
                    throw new OperationError(`'cRLReason' CRL entry extension missing 'code' key: ${ext}`);
                }
                out += `X509v3 CRL Reason Code:
    ${Object.hasOwn(crlReasonCodeToReasonMessage, ext.code) ? crlReasonCodeToReasonMessage[ext.code] : `invalid reason code: ${ext.code}`}\n`;
                break;
            case "2.5.29.23": // Hold instruction
                out += `Hold Instruction Code:\n\t${Object.hasOwn(holdInstructionOIDToName, ext.extn.oid) ? holdInstructionOIDToName[ext.extn.oid] : `${ext.extn.oid}: unknown hold instruction OID`}\n`;
                break;
            case "2.5.29.24": // Invalidity Date
                out += `Invalidity Date:\n\t${generalizedDateTimeToUTC(ext.extn.gentime.str)}\n`;
                break;
            default:
                out += `${ext.extname}:\n`;
                out += `\tUnsupported CRL entry extension. Try openssl CLI.\n`;
                break;
        }
    });

    return chop(out);
}

/**
 * Format CRL signature.
 * @param {String} sigHex
 * @param {Number} indent
 * @returns String representing hex signature value formatted on multiple lines.
 */
function formatCRLSignature(sigHex, indent) {
    if (sigHex.length % 2 !== 0) {
        sigHex = "0" + sigHex;
    }

    return indentString(formatMultiLine(chop(sigHex.replace(/(..)/g, "$&:"))), indent);
}

/**
 * Format string onto multiple lines.
 * @param {string} longStr
 * @returns String as a multi-line string.
 */
function formatMultiLine(longStr) {
    const lines = [];

    for (let remain = longStr ; remain !== "" ; remain = remain.substring(54)) {
        lines.push(remain.substring(0, 54));
    }

    return lines.join("\n");
}

/**
 * Indent a multi-line string by n spaces.
 * @param {string} input String
 * @param {number} spaces How many leading spaces
 * @returns Indented string.
 */
function indentString(input, spaces) {
    const indent = " ".repeat(spaces);
    return input.replace(/^/gm, indent);
}

/**
 * Remove last character from a string.
 * @param {string} s String
 * @returns Chopped string.
 */
function chop(s) {
    if (s.length < 1) {
        return s;
    }
    return s.substring(0, s.length - 1);
}

export default ParseX509CRL;
