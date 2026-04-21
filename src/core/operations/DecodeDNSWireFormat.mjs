/**
 * @author rayane-ara []
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Decode DNS Wire Format operation
 */
class DecodeDNSWireFormat extends Operation {

    /**
     * DecodeDNSWireFormat constructor
     */
    constructor() {
        super();

        this.name = "Decode DNS Wire Format";
        this.module = "Default";
        this.description = "Decodes a DNS (Domain Name System) wire format message into a human-readable format similar to the output of <code>dig</code>. The binary format is specified in RFC 1035.<br><br>Supports query and response messages, including all standard record types (A, AAAA, NS, CNAME, MX, TXT, SOA, PTR, SRV, CAA, DS, DNSKEY, RRSIG, NSEC, TLSA…) as well as DNS message compression pointers.<br><br>This is particularly useful when analyzing DNS over HTTPS (DoH) or DNS over TLS (DoT) traffic.";
        this.infoURL = "https://wikipedia.org/wiki/Domain_Name_System";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input.length < 12) {
            throw new OperationError("Input too short: a DNS message requires at least 12 bytes for the header.");
        }

        const bytes = new Uint8Array(input);

        // 1. HEADER (12 bytes)
        const id      = (bytes[0] << 8) | bytes[1];
        const flags   = (bytes[2] << 8) | bytes[3];
        const qdcount = (bytes[4] << 8) | bytes[5];
        const ancount = (bytes[6] << 8) | bytes[7];
        const nscount = (bytes[8] << 8) | bytes[9];
        const arcount = (bytes[10] << 8) | bytes[11];

        // Flag fields
        const qr     = (flags >> 15) & 0x1;
        const opcode = (flags >> 11) & 0xF;
        const aa     = (flags >> 10) & 0x1;
        const tc     = (flags >>  9) & 0x1;
        const rd     = (flags >>  8) & 0x1;
        const ra     = (flags >>  7) & 0x1;
        const z      = (flags >>  6) & 0x1;
        const ad     = (flags >>  5) & 0x1;
        const cd     = (flags >>  4) & 0x1;
        const rcode  =  flags        & 0xF;

        // 2. LOOKUP TABLES
        const OPCODES = {
            0: "QUERY", 1: "IQUERY", 2: "STATUS", 4: "NOTIFY", 5: "UPDATE"
        };
        const RCODES = {
            0: "NOERROR",  1: "FORMERR",   2: "SERVFAIL", 3: "NXDOMAIN",
            4: "NOTIMP",   5: "REFUSED",   6: "YXDOMAIN", 7: "YXRRSET",
            8: "NXRRSET",  9: "NOTAUTH",  10: "NOTZONE"
        };
        const TYPES = {
            1: "A",       2: "NS",     5: "CNAME",   6: "SOA",     12: "PTR",
            15: "MX",     16: "TXT",   28: "AAAA",   33: "SRV",    35: "NAPTR",
            43: "DS",     46: "RRSIG", 47: "NSEC",   48: "DNSKEY", 52: "TLSA",
            99: "SPF",   255: "ANY",  257: "CAA",    41: "OPT"
        };
        const CLASSES = {
            1: "IN", 3: "CH", 4: "HS", 255: "ANY"
        };

        const getType  = t => TYPES[t]   || `TYPE${t}`;
        const getClass = c => CLASSES[c] || `CLASS${c}`;

        // 3. NAME DECODER (supports RFC 1035 compression pointers)
        /**
         * Reads a domain name starting at 'startOffset' in 'bytes'.
         * Returns { name: string, newOffset: number }
         * where newOffset points to the byte AFTER the name in the original stream
         * (ignoring any pointer jumps).
         */
        const readName = (startOffset) => {
            let name       = "";
            let offset     = startOffset;
            let jumped     = false;
            let postJumpOff = -1;
            let jumps      = 0;
            const MAX_JUMPS = 128; // guard against pointer loops

            while (offset < bytes.length) {
                const len = bytes[offset];

                // Compression pointer: top two bits are 11
                if ((len & 0xC0) === 0xC0) {
                    if (offset + 1 >= bytes.length) {
                        throw new OperationError("Truncated DNS compression pointer.");
                    }
                    if (!jumped) {
                        postJumpOff = offset + 2; // resume here after resolution
                    }
                    offset = ((len & 0x3F) << 8) | bytes[offset + 1];
                    jumped = true;
                    if (++jumps > MAX_JUMPS) {
                        throw new OperationError("DNS message contains a compression pointer loop.");
                    }
                    continue;
                }

                // Null label -> end of name
                if (len === 0) {
                    offset++;
                    break;
                }

                // Regular label
                if (offset + 1 + len > bytes.length) {
                    throw new OperationError("Truncated DNS label in domain name.");
                }
                offset++;
                for (let i = 0; i < len; i++) {
                    name += String.fromCharCode(bytes[offset + i]);
                }
                name += ".";
                offset += len;
            }

            return {
                name:      name || ".",
                newOffset: jumped ? postJumpOff : offset
            };
        };

        // 4. RDATA DECODER
        /**
         * Decodes the RDATA section of a resource record.
         * 'rdStart' is the absolute offset into 'bytes' where RDATA begins.
         */
        const parseRdata = (type, rdStart, rdLength) => {
            const end = rdStart + rdLength;

            switch (type) {

                case 1: { // A - IPv4
                    if (rdLength !== 4) return `\\# ${rdLength} (invalid A record)`;
                    return `${bytes[rdStart]}.${bytes[rdStart+1]}.${bytes[rdStart+2]}.${bytes[rdStart+3]}`;
                }

                case 28: { // AAAA - IPv6
                    if (rdLength !== 16) return `\\# ${rdLength} (invalid AAAA record)`;
                    const groups = [];
                    for (let i = 0; i < 16; i += 2) {
                        groups.push(
                            (((bytes[rdStart + i] << 8) | bytes[rdStart + i + 1]) >>> 0)
                                .toString(16)
                        );
                    }
                    // Compact consecutive zero groups (RFC 5952)
                    return compressIPv6(groups);
                }

                case 2:  // NS
                case 5:  // CNAME
                case 12: { // PTR
                    return readName(rdStart).name;
                }

                case 15: { // MX
                    if (rdLength < 3) return `\\# ${rdLength} (invalid MX record)`;
                    const pref = (bytes[rdStart] << 8) | bytes[rdStart + 1];
                    const { name } = readName(rdStart + 2);
                    return `${pref} ${name}`;
                }

                case 16: // TXT
                case 99: { // SPF (same encoding as TXT)
                    const parts = [];
                    let pos = rdStart;
                    while (pos < end) {
                        const strLen = bytes[pos++];
                        if (pos + strLen > end) break;
                        let s = '"';
                        for (let i = 0; i < strLen; i++) {
                            const ch = bytes[pos + i];
                            // Escape backslash and double-quote
                            if (ch === 0x22 || ch === 0x5C) s += `\\${String.fromCharCode(ch)}`;
                            else if (ch < 0x20 || ch > 0x7E) s += `\\${ch.toString().padStart(3, "0")}`;
                            else s += String.fromCharCode(ch);
                        }
                        s += '"';
                        parts.push(s);
                        pos += strLen;
                    }
                    return parts.join(" ");
                }

                case 6: { // SOA
                    const { name: mname, newOffset: o1 } = readName(rdStart);
                    const { name: rname, newOffset: o2 } = readName(o1);
                    if (o2 + 20 > bytes.length) return `\\# ${rdLength} (truncated SOA)`;
                    const serial  = read32(o2);
                    const refresh = read32(o2 + 4);
                    const retry   = read32(o2 + 8);
                    const expire  = read32(o2 + 12);
                    const minimum = read32(o2 + 16);
                    return `${mname} ${rname} ${serial} ${refresh} ${retry} ${expire} ${minimum}`;
                }

                case 33: { // SRV
                    if (rdLength < 7) return `\\# ${rdLength} (invalid SRV record)`;
                    const priority = (bytes[rdStart]     << 8) | bytes[rdStart + 1];
                    const weight   = (bytes[rdStart + 2] << 8) | bytes[rdStart + 3];
                    const port     = (bytes[rdStart + 4] << 8) | bytes[rdStart + 5];
                    const { name } = readName(rdStart + 6);
                    return `${priority} ${weight} ${port} ${name}`;
                }

                case 257: { // CAA
                    if (rdLength < 2) return `\\# ${rdLength} (invalid CAA record)`;
                    const caaFlags = bytes[rdStart];
                    const tagLen   = bytes[rdStart + 1];
                    if (rdStart + 2 + tagLen > end) return `\\# ${rdLength} (truncated CAA)`;
                    let tag = "";
                    for (let i = 0; i < tagLen; i++) tag += String.fromCharCode(bytes[rdStart + 2 + i]);
                    let value = "";
                    for (let i = rdStart + 2 + tagLen; i < end; i++) value += String.fromCharCode(bytes[i]);
                    return `${caaFlags} ${tag} "${value}"`;
                }

                case 48: { // DNSKEY
                    if (rdLength < 4) return `\\# ${rdLength} (invalid DNSKEY record)`;
                    const dnskeyFlags   = (bytes[rdStart] << 8) | bytes[rdStart + 1];
                    const protocol      = bytes[rdStart + 2];
                    const algorithm     = bytes[rdStart + 3];
                    const keyB64        = base64Encode(bytes.slice(rdStart + 4, end));
                    return `${dnskeyFlags} ${protocol} ${algorithm} ${keyB64}`;
                }

                case 43: { // DS
                    if (rdLength < 4) return `\\# ${rdLength} (invalid DS record)`;
                    const keyTag    = (bytes[rdStart] << 8) | bytes[rdStart + 1];
                    const algorithm = bytes[rdStart + 2];
                    const digestType= bytes[rdStart + 3];
                    const digest    = Array.from(bytes.slice(rdStart + 4, end))
                        .map(b => b.toString(16).padStart(2, "0"))
                        .join("").toUpperCase();
                    return `${keyTag} ${algorithm} ${digestType} ${digest}`;
                }

                case 47: { // NSEC
                    const { name: nextName, newOffset: bitmapStart } = readName(rdStart);
                    const types = parseBitmap(bitmapStart, end);
                    return `${nextName} ${types.join(" ")}`;
                }

                case 46: { // RRSIG
                    if (rdLength < 18) return `\\# ${rdLength} (invalid RRSIG record)`;
                    const coveredType  = (bytes[rdStart]     << 8) | bytes[rdStart + 1];
                    const algorithm    = bytes[rdStart + 2];
                    const labels       = bytes[rdStart + 3];
                    const origTTL      = read32(rdStart + 4);
                    const sigExp       = read32(rdStart + 8);
                    const sigInc       = read32(rdStart + 12);
                    const keyTag       = (bytes[rdStart + 16] << 8) | bytes[rdStart + 17];
                    const { name: signerName, newOffset: sigStart } = readName(rdStart + 18);
                    const sig          = base64Encode(bytes.slice(sigStart, end));
                    return `${getType(coveredType)} ${algorithm} ${labels} ${origTTL} ${formatEpoch(sigExp)} ${formatEpoch(sigInc)} ${keyTag} ${signerName} ${sig}`;
                }

                case 52: { // TLSA
                    if (rdLength < 3) return `\\# ${rdLength} (invalid TLSA record)`;
                    const usage    = bytes[rdStart];
                    const selector = bytes[rdStart + 1];
                    const matching = bytes[rdStart + 2];
                    const certData = Array.from(bytes.slice(rdStart + 3, end))
                        .map(b => b.toString(16).padStart(2, "0"))
                        .join("").toUpperCase();
                    return `${usage} ${selector} ${matching} ${certData}`;
                }

                case 41: { // OPT (EDNS0 pseudo-RR - just show raw hex)
                    return hexDump(bytes.slice(rdStart, end));
                }

                default: {
                    // Unknown type -> RFC 3597 generic notation
                    return `\\# ${rdLength}${rdLength > 0 ? " " + hexDump(bytes.slice(rdStart, end)) : ""}`;
                }
            }
        };

        // 5. HELPERS

        /** Read a big-endian unsigned 32-bit integer from bytes at offset */
        const read32 = (off) =>
            (((bytes[off] << 24) | (bytes[off+1] << 16) | (bytes[off+2] << 8) | bytes[off+3]) >>> 0);

        /** Convert an array of 8 hex groups to a compressed IPv6 string */
        function compressIPv6(groups) {
            // Find longest run of "0" groups
            let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
            for (let i = 0; i <= groups.length; i++) {
                if (i < groups.length && groups[i] === "0") {
                    if (curStart === -1) {
                        curStart = i;
                        curLen = 0;
                    }
                    curLen++;
                } else {
                    if (curLen > bestLen) {
                        bestLen = curLen;
                        bestStart = curStart;
                    }
                    curStart = -1; curLen = 0;
                }
            }
            if (bestLen < 2) return groups.join(":");
            const left  = groups.slice(0, bestStart).join(":");
            const right = groups.slice(bestStart + bestLen).join(":");
            return `${left}::${right}`;
        }

        /** Hex dump helper */
        function hexDump(arr) {
            return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join(" ");
        }

        /** Parse NSEC type bitmap windows (RFC 4034 §4.1.2) */
        function parseBitmap(start, end) {
            const types = [];
            let pos = start;
            while (pos + 2 <= end) {
                const windowBlock = bytes[pos];
                const bitmapLen   = bytes[pos + 1];
                pos += 2;
                for (let i = 0; i < bitmapLen && pos + i < end; i++) {
                    const byt = bytes[pos + i];
                    for (let bit = 7; bit >= 0; bit--) {
                        if (byt & (1 << bit)) {
                            const typeNum = windowBlock * 256 + i * 8 + (7 - bit);
                            types.push(getType(typeNum));
                        }
                    }
                }
                pos += bitmapLen;
            }
            return types;
        }

        /** Simple base64 encoder (no external dependency) */
        function base64Encode(arr) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let result = "";
            for (let i = 0; i < arr.length; i += 3) {
                const b0 = arr[i], b1 = arr[i+1] ?? 0, b2 = arr[i+2] ?? 0;
                result += chars[b0 >> 2];
                result += chars[((b0 & 3) << 4) | (b1 >> 4)];
                result += i+1 < arr.length ? chars[((b1 & 0xF) << 2) | (b2 >> 6)] : "=";
                result += i+2 < arr.length ? chars[b2 & 0x3F] : "=";
            }
            return result;
        }

        /** Format a Unix epoch timestamp as YYYYMMDDHHmmSS (RRSIG dates) */
        function formatEpoch(epoch) {
            const d = new Date(epoch * 1000);
            const pad = n => String(n).padStart(2, "0");
            return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}` +
                   `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
        }

        // 6. BUILD OUTPUT
        let out = "";
        let offset = 12; // current read position (past the header)

        // Header line
        out += `;; ->>HEADER<<- opcode: ${OPCODES[opcode] ?? `OPCODE${opcode}`}, ` +
               `status: ${RCODES[rcode] ?? `RCODE${rcode}`}, id: ${id}\n`;

        // Flags line
        const activeFlags = [];
        if (qr) activeFlags.push("qr");
        if (aa) activeFlags.push("aa");
        if (tc) activeFlags.push("tc");
        if (rd) activeFlags.push("rd");
        if (ra) activeFlags.push("ra");
        if (z)  activeFlags.push("z");
        if (ad) activeFlags.push("ad");
        if (cd) activeFlags.push("cd");

        out += `;; flags: ${activeFlags.join(" ")}; ` +
               `QUERY: ${qdcount}, ANSWER: ${ancount}, AUTHORITY: ${nscount}, ADDITIONAL: ${arcount}\n`;

        // Question section
        if (qdcount > 0) {
            out += `\n;; QUESTION SECTION:\n`;
            for (let i = 0; i < qdcount; i++) {
                if (offset >= bytes.length) throw new OperationError("Truncated DNS message in QUESTION section.");
                const { name, newOffset } = readName(offset);
                offset = newOffset;
                if (offset + 4 > bytes.length) throw new OperationError("Truncated DNS message: missing QTYPE/QCLASS.");
                const qtype  = (bytes[offset]     << 8) | bytes[offset + 1];
                const qclass = (bytes[offset + 2] << 8) | bytes[offset + 3];
                offset += 4;
                // Format: ;name<tab>CLASS<tab>TYPE  (mirroring dig output)
                out += `;${name.padEnd(24)}${getClass(qclass).padEnd(8)}${getType(qtype)}\n`;
            }
        }

        // Resource record parser (shared for ANSWER / AUTHORITY / ADDITIONAL)
        const parseSection = (count, sectionTitle) => {
            if (count <= 0) return;
            out += `\n;; ${sectionTitle}:\n`;
            for (let i = 0; i < count; i++) {
                if (offset >= bytes.length) throw new OperationError(`Truncated DNS message in ${sectionTitle}.`);
                const { name, newOffset: o1 } = readName(offset);
                offset = o1;
                if (offset + 10 > bytes.length) throw new OperationError(`Truncated RR header in ${sectionTitle}.`);
                const type     = (bytes[offset]     << 8) | bytes[offset + 1];
                const cls      = (bytes[offset + 2] << 8) | bytes[offset + 3];
                const ttl      = read32(offset + 4);
                const rdlength = (bytes[offset + 8] << 8) | bytes[offset + 9];
                offset += 10;
                if (offset + rdlength > bytes.length) throw new OperationError(`Truncated RDATA in ${sectionTitle}.`);

                // OPT records (EDNS0) use a special presentation format
                if (type === 41) {
                    const udpPayload = cls;          // CLASS field repurposed
                    out += `; EDNS: version: 0, flags:; udp: ${udpPayload}\n`;
                    offset += rdlength;
                    continue;
                }

                const rdata = parseRdata(type, offset, rdlength);
                offset += rdlength;

                // Format: name<pad>TTL<pad>CLASS<pad>TYPE<pad>RDATA
                out += `${name.padEnd(24)}${String(ttl).padEnd(8)}${getClass(cls).padEnd(8)}${getType(type).padEnd(8)}${rdata}\n`;
            }
        };

        parseSection(ancount, "ANSWER SECTION");
        parseSection(nscount, "AUTHORITY SECTION");
        parseSection(arcount, "ADDITIONAL SECTION");

        return out;
    }

}

export default DecodeDNSWireFormat;

