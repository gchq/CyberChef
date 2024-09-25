/**
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * JA4 Fingerprint Summary operation
 */
class JA4FingerprintSummary extends Operation {

    /**
     * JA4FingerprintSummary constructor
     */
    constructor() {
        super();

        this.name = "JA4 Fingerprint Summary";
        this.module = "Crypto";
        this.description = "Generates a JA4 fingerprint summary to explain the hash output of the JA4 Fingerprint recipe.<br><br>Input: A standard JA4/JA4Server Fingerprint";
        this.infoURL = "https://blog.foxio.io/ja4%2B-network-fingerprinting";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Fingerprint format",
                type: "option",
                value: ["JA4", "JA4Server"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [inputFormat] = args;
        let retString = `Fingerprint summary of: ${input}\n+------------------------------------------------------------+`;
        // Define format validation logic
        const isValidJA4 = (input) => /[a-z-0-9]{10}_[a-z-0-9]{12}_[a-z-0-9]{12}/.test(input);
        const isValidJA4Server = (input) => /[a-z-0-9]{7}_[a-z-0-9]{4}_[a-z-0-9]{12}/.test(input);        
        // Validate the input based on inputFormat
        if (inputFormat === "JA4" && !isValidJA4(input)) {
            return `Error: The input does not match the expected JA4 format. Please check your input: ${input}`;
        } 
        if (inputFormat === "JA4Server" && !isValidJA4Server(input)) {
            return `Error: The input does not match the expected JA4Server format. Please check your input: ${input}`;
        }
        const protocolMap = { t: "TCP", q: "QUIC" };
        const tlsMap = {
            "13": "1.3", "12": "1.2", "11": "1.1", "10": "1.0",
            "s3": "SSL 3.0", "s2": "SSL 2.0", "s1": "SSL 1.0"
        };
        const alpnMap = {
            "00": "No ALPN Chosen", "dt": "DNS-over-TLS",
            "h1": "HTTP/1.1", "h2": "HTTP/2"
        };
        const getProtocol = (input) => `\nProtocol: ${protocolMap[input[0]] || "Unknown"}`;
        const getTLSVersion = (input, start = 1, end = 3) => `\nTLS Version: ${tlsMap[input.slice(start, end)] || input.slice(start, end)}`;
        const getALPN = (input, start, end) => `\nALPN Chosen: ${alpnMap[input.slice(start, end)] || input.slice(start, end)}`;
        if (inputFormat === "JA4") {
            const sniMap = { d: "Yes (to domain)", i: "No (to IP)" };
            retString += getProtocol(input);
            retString += getTLSVersion(input);
            retString += `\nSNI Extension Present: ${sniMap[input[3]] || "Invalid symbol: " + input[3]}`;
            retString += `\nNumber of Cipher Suites: ${input.slice(4, 6)}`;
            retString += `\nNumber of Extensions: ${input.slice(6, 8)}`;
            retString += getALPN(input, 8, 10);
            retString += `\nTruncated SHA256 hash of the Cipher Suites, sorted: ${input.slice(11, 23)}`;
            retString += `\nTruncated SHA256 hash of the Extensions, sorted + Signature Algorithms, in the order they appear: ${input.slice(24)}`;
        } else if (inputFormat === "JA4Server") {
            retString += getProtocol(input);
            retString += getTLSVersion(input);
            retString += `\nNumber of Extensions: ${input.slice(3, 5)}`;
            retString += getALPN(input, 5, 7);
            retString += `\nCipher Suite Chosen: ${input.slice(8, 12)}`;
            retString += `\nTruncated SHA256 hash of the Extensions, in the order they appear: ${input.slice(13)}`;
        }
        return retString;
    }
}

export default JA4FingerprintSummary;
