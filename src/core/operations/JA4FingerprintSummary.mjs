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
        let retString = "Fingerprint summary of: " + input + "\n+------------------------------------------------------------+"
        if (inputFormat === "JA4") {
            const protocolMap = { t: "TCP", q: "QUIC" };
            const tlsMap = {
                "13": "1.3", "12": "1.2", "11": "1.1", "10": "1.0",
                "s3": "SSL 3.0", "s2": "SSL 2.0", "s1": "SSL 1.0"
            };
            const sniMap = { d: "Yes (to domain)", i: "No (to IP)" };
            const alpnMap = {
                "00": "No ALPN Chosen", "dt": "DNS-over-TLS", 
                "h1": "HTTP/1.1", "h2": "HTTP/2"
            };
        
            // Protocol
            retString += `\nProtocol: ${protocolMap[input[0]] || "Unknown"}`;
        
            // TLS Version
            retString += `\nTLS Version: ${tlsMap[input.slice(1, 3)] || input.slice(1, 3)}`;
        
            // SNI Extension
            retString += `\nSNI Extension Present: ${sniMap[input[3]] || "Invalid symbol: " + input[3]}`;
        
            // Number of Cipher Suites and Extensions
            retString += `\nNumber of Cipher Suites: ${input.slice(4, 6)}`;
            retString += `\nNumber of Extensions: ${input.slice(6, 8)}`;
        
            // ALPN
            retString += `\nALPN Chosen: ${alpnMap[input.slice(8, 10)] || input.slice(8, 10)}`;
        
            // Truncated SHA256 hashes
            retString += `\nTruncated SHA256 hash of the Cipher Suites, sorted: ${input.slice(11, 23)}`;
            retString += `\nTruncated SHA256 hash of the Extensions, sorted + Signature Algorithms, in the order they appear: ${input.slice(24)}`;
        }
        

        if (inputFormat == "JA4Server"){
            const protocolMap = { t: "TCP", q: "QUIC" };
            const tlsMap = {
                "13": "1.3", "12": "1.2", "11": "1.1", "10": "1.0",
                "s3": "SSL 3.0", "s2": "SSL 2.0", "s1": "SSL 1.0"
            };
            const alpnMap = {
                "00": "No ALPN Chosen", "dt": "DNS-over-TLS", 
                "h1": "HTTP/1.1", "h2": "HTTP/2"
            };
        
            // Protocol
            retString += `\nProtocol: ${protocolMap[input[0]] || "Unknown"}`;
        
            // TLS Version
            retString += `\nTLS Version: ${tlsMap[input.slice(1, 3)] || input.slice(1, 3)}`;
            
            // Number of Extensions
            retString += `\nNumber of Extensions: ${input.slice(3, 5)}`;

            // ALPN
            retString += `\nALPN Chosen: ${alpnMap[input.slice(5, 7)] || input.slice(5, 7)}`;
            
            // Cipher Suite
            retString += `\nCipher Suite Chosen: ${input.slice(8,12)}`;

            // Truncated SHA256 hashes
            retString += `\nTruncated SH256 hash of the Extensions, in the order they appear: ${input.slice(13)}`;
        }

        return retString
    }

}

export default JA4FingerprintSummary;
/**
 * Truncated SHA256 hash of the Cipher Suites, sorted 
 * Truncated SHA256 hash of the Extensions, sorted + Signature Algorithms, in the order they appear 
 */