/**
 * @author rayane-ara []
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Encode DNS Wire Format operation
 */
class EncodeDNSWireFormat extends Operation {

    /**
     * EncodeDNSWireFormat constructor
     */
    constructor() {
        super();

        this.name = "Encode DNS Wire Format";
        this.module = "Default";
        this.description = "Encodes a domain name into a DNS query message in binary wire format as specified in RFC 1035.<br><br>The input should be a single fully-qualified domain name (e.g. <code>www.example.com</code>). The output is the raw DNS query packet, ready to be sent over DNS over HTTPS (DoH) or DNS over TLS (DoT).<br><br>The format is similar to the DNS over HTTPS operation.";
        this.infoURL = "https://wikipedia.org/wiki/Domain_Name_System";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Record Type",
                type: "option",
                value: [
                    "A",
                    "AAAA",
                    "NS",
                    "CNAME",
                    "MX",
                    "TXT",
                    "SOA",
                    "PTR",
                    "SRV",
                    "CAA",
                    "DS",
                    "DNSKEY",
                    "RRSIG",
                    "NSEC",
                    "TLSA",
                    "ANY"
                ]
            },
            {
                name: "Record Class",
                type: "option",
                value: ["IN", "CH", "HS", "ANY"]
            },
            {
                name: "ID",
                type: "number",
                value: 0
            },
            {
                name: "Recursion Desired (RD)",
                type: "boolean",
                value: true
            },
            {
                name: "Checking Disabled (CD)",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const [recordType, recordClass, id, recursionDesired, checkingDisabled] = args;

        // 1. Validate and sanitise the domain name
        const domain = input.trim().replace(/\.$/, ""); // strip trailing dot if any

        if (domain.length === 0) {
            throw new OperationError("Input is empty. Please provide a domain name (e.g. www.example.com).");
        }

        // Basic domain name validation
        const labelRegex = /^[a-zA-Z0-9_]([a-zA-Z0-9\-_]{0,61}[a-zA-Z0-9_])?$/;
        const labels = domain.split(".");
        for (const label of labels) {
            if (label.length === 0) {
                throw new OperationError(`Invalid domain name: empty label found in "${domain}".`);
            }
            if (label.length > 63) {
                throw new OperationError(`Invalid domain name: label "${label}" exceeds 63 characters.`);
            }
            if (!labelRegex.test(label)) {
                throw new OperationError(`Invalid domain name: label "${label}" contains invalid characters.`);
            }
        }

        if (domain.length > 253) {
            throw new OperationError("Invalid domain name: total length exceeds 253 characters.");
        }

        // 2. Lookup tables
        const TYPES = {
            "A":       1,   "NS":     2,   "CNAME":  5,   "SOA":    6,
            "PTR":    12,   "MX":    15,   "TXT":   16,   "AAAA":  28,
            "SRV":    33,   "DS":    43,   "RRSIG": 46,   "NSEC":  47,
            "DNSKEY": 48,   "TLSA":  52,   "CAA":  257,   "ANY":  255
        };
        const CLASSES = {
            "IN": 1, "CH": 3, "HS": 4, "ANY": 255
        };

        const qtype  = TYPES[recordType];
        const qclass = CLASSES[recordClass];

        if (qtype === undefined) {
            throw new OperationError(`Unknown record type: "${recordType}".`);
        }
        if (qclass === undefined) {
            throw new OperationError(`Unknown record class: "${recordClass}".`);
        }

        // 3. Build the message
        const packet = [];

        // Helper: push a big-endian 16-bit value
        const push16 = (val) => {
            packet.push((val >> 8) & 0xFF, val & 0xFF);
        };

        // Header (12 bytes)
        // ID (2 bytes)
        push16(id & 0xFFFF);

        // Flags (2 bytes)
        // QR=0 (query), OPCODE=0 (QUERY), AA=0, TC=0
        // RD = recursionDesired, RA=0, Z=0, AD=0
        // CD = checkingDisabled, RCODE=0
        const rd = recursionDesired ? 1 : 0;
        const cd = checkingDisabled ? 1 : 0;
        const flags = (rd << 8) | (cd << 4);
        push16(flags);

        // QDCOUNT = 1 (one question)
        push16(1);
        // ANCOUNT = 0
        push16(0);
        // NSCOUNT = 0
        push16(0);
        // ARCOUNT = 0
        push16(0);

        // Question section
        // QNAME: sequence of labels, each prefixed by its length, terminated by 0x00
        for (const label of labels) {
            packet.push(label.length);
            for (let i = 0; i < label.length; i++) {
                packet.push(label.charCodeAt(i));
            }
        }
        packet.push(0x00); // root label (end of QNAME)

        // QTYPE (2 bytes)
        push16(qtype);

        // QCLASS (2 bytes)
        push16(qclass);

        return packet;
    }

}

export default EncodeDNSWireFormat;

