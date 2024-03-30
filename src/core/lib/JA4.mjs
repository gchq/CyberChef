/**
 * JA4 resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 *
 * JA4 Copyright 2023 FoxIO, LLC.
 * @license BSD-3-Clause
 */

import OperationError from "../errors/OperationError.mjs";
import { parseTLSRecord, parseHighestSupportedVersion, parseFirstALPNValue } from "./TLS.mjs";
import { toHexFast } from "./Hex.mjs";
import { runHash } from "./Hash.mjs";
import Utils from "../Utils.mjs";


/**
 * Calculate the JA4 from a given TLS Client Hello Stream
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function toJA4(bytes) {
    let tlsr = {};
    try {
        tlsr = parseTLSRecord(bytes);
    } catch (err) {
        throw new OperationError("Data is not a valid TLS Client Hello. QUIC is not yet supported.\n" + err);
    }

    /* QUIC
        “q” or “t”, which denotes whether the hello packet is for QUIC or TCP.
        TODO: Implement QUIC
    */
    const ptype = "t";

    /* TLS Version
        TLS version is shown in 3 different places. If extension 0x002b exists (supported_versions), then the version
        is the highest value in the extension. Remember to ignore GREASE values. If the extension doesn’t exist, then
        the TLS version is the value of the Protocol Version. Handshake version (located at the top of the packet)
        should be ignored.
    */
    let version = tlsr.version.value;
    for (const ext of tlsr.handshake.value.extensions.value) {
        if (ext.type.value === "supported_versions") {
            version = parseHighestSupportedVersion(ext.value.data);
            break;
        }
    }
    switch (version) {
        case 0x0304: version = "13"; break; // TLS 1.3
        case 0x0303: version = "12"; break; // TLS 1.2
        case 0x0302: version = "11"; break; // TLS 1.1
        case 0x0301: version = "10"; break; // TLS 1.0
        case 0x0300: version = "s3"; break; // SSL 3.0
        case 0x0200: version = "s2"; break; // SSL 2.0
        case 0x0100: version = "s1"; break; // SSL 1.0
        default: version = "00"; // Unknown
    }

    /* SNI
        If the SNI extension (0x0000) exists, then the destination of the connection is a domain, or “d” in the fingerprint.
        If the SNI does not exist, then the destination is an IP address, or “i”.
    */
    let sni = "i";
    for (const ext of tlsr.handshake.value.extensions.value) {
        if (ext.type.value === "server_name") {
            sni = "d";
            break;
        }
    }

    /* Number of Ciphers
        2 character number of cipher suites, so if there’s 6 cipher suites in the hello packet, then the value should be “06”.
        If there’s > 99, which there should never be, then output “99”. Remember, ignore GREASE values. They don’t count.
    */
    let cipherLen = 0;
    for (const cs of tlsr.handshake.value.cipherSuites.value) {
        if (cs.value !== "GREASE") cipherLen++;
    }
    cipherLen = cipherLen > 99 ? "99" : cipherLen.toString().padStart(2, "0");

    /* Number of Extensions
        Same as counting ciphers. Ignore GREASE. Include SNI and ALPN.
    */
    let extLen = 0;
    for (const ext of tlsr.handshake.value.extensions.value) {
        if (ext.type.value !== "GREASE") extLen++;
    }
    extLen = extLen > 99 ? "99" : extLen.toString().padStart(2, "0");

    /* ALPN Extension Value
        The first and last characters of the ALPN (Application-Layer Protocol Negotiation) first value.
        If there are no ALPN values or no ALPN extension then we print “00” as the value in the fingerprint.
    */
    let alpn = "00";
    for (const ext of tlsr.handshake.value.extensions.value) {
        if (ext.type.value === "application_layer_protocol_negotiation") {
            alpn = parseFirstALPNValue(ext.value.data);
            alpn = alpn.charAt(0) + alpn.charAt(alpn.length - 1);
            break;
        }
    }

    /* Cipher hash
        A 12 character truncated sha256 hash of the list of ciphers sorted in hex order, first 12 characters.
        The list is created using the 4 character hex values of the ciphers, lower case, comma delimited, ignoring GREASE.
    */
    const originalCiphersList = [];
    for (const cs of tlsr.handshake.value.cipherSuites.value) {
        if (cs.value !== "GREASE") {
            originalCiphersList.push(toHexFast(cs.data));
        }
    }
    const sortedCiphersList = [...originalCiphersList].sort();
    const sortedCiphersRaw = sortedCiphersList.join(",");
    const originalCiphersRaw = originalCiphersList.join(",");
    const sortedCiphers = runHash(
        "sha256",
        Utils.strToArrayBuffer(sortedCiphersRaw)
    ).substring(0, 12);
    const originalCiphers = runHash(
        "sha256",
        Utils.strToArrayBuffer(originalCiphersRaw)
    ).substring(0, 12);

    /* Extension hash
        A 12 character truncated sha256 hash of the list of extensions, sorted by hex value, followed by the list of signature
        algorithms, in the order that they appear (not sorted).
        The extension list is created using the 4 character hex values of the extensions, lower case, comma delimited, sorted
        (not in the order they appear). Ignore the SNI extension (0000) and the ALPN extension (0010) as we’ve already captured
        them in the a section of the fingerprint. These values are omitted so that the same application would have the same b
        section of the fingerprint regardless of if it were going to a domain, IP, or changing ALPNs.
    */
    const originalExtensionsList = [];
    let signatureAlgorithms = "";
    for (const ext of tlsr.handshake.value.extensions.value) {
        if (ext.type.value !== "GREASE") {
            originalExtensionsList.push(toHexFast(ext.type.data));
        }
        if (ext.type.value === "signature_algorithms") {
            signatureAlgorithms = toHexFast(ext.value.data.slice(2));
            signatureAlgorithms = signatureAlgorithms.replace(/(.{4})/g, "$1,");
            signatureAlgorithms = signatureAlgorithms.substring(0, signatureAlgorithms.length - 1);
        }
    }
    const sortedExtensionsList = [...originalExtensionsList].filter(e => e !== "0000" && e !== "0010").sort();
    const sortedExtensionsRaw = sortedExtensionsList.join(",") + "_" + signatureAlgorithms;
    const originalExtensionsRaw = originalExtensionsList.join(",") + "_" + signatureAlgorithms;
    const sortedExtensions = runHash(
        "sha256",
        Utils.strToArrayBuffer(sortedExtensionsRaw)
    ).substring(0, 12);
    const originalExtensions = runHash(
        "sha256",
        Utils.strToArrayBuffer(originalExtensionsRaw)
    ).substring(0, 12);

    return {
        "JA4":    `${ptype}${version}${sni}${cipherLen}${extLen}${alpn}_${sortedCiphers}_${sortedExtensions}`,
        "JA4_o":  `${ptype}${version}${sni}${cipherLen}${extLen}${alpn}_${originalCiphers}_${originalExtensions}`,
        "JA4_r":  `${ptype}${version}${sni}${cipherLen}${extLen}${alpn}_${sortedCiphersRaw}_${sortedExtensionsRaw}`,
        "JA4_ro": `${ptype}${version}${sni}${cipherLen}${extLen}${alpn}_${originalCiphersRaw}_${originalExtensionsRaw}`,
    };
}
