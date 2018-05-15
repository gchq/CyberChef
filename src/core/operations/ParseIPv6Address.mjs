/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {_strToIpv6, _ipv6ToStr, _ipv4ToStr, IPV6_REGEX} from "../lib/Ip";
import BigInteger from "jsbn";

/**
 * Parse IPv6 address operation
 */
class ParseIPv6Address extends Operation {

    /**
     * ParseIPv6Address constructor
     */
    constructor() {
        super();

        this.name = "Parse IPv6 address";
        this.module = "JSBN";
        this.description = "Displays the longhand and shorthand versions of a valid IPv6 address.<br><br>Recognises all reserved ranges and parses encapsulated or tunnelled addresses including Teredo and 6to4.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let match,
            output = "";

        if ((match = IPV6_REGEX.exec(input))) {
            const ipv6 = _strToIpv6(match[1]),
                longhand = _ipv6ToStr(ipv6),
                shorthand = _ipv6ToStr(ipv6, true);

            output += "Longhand:  " + longhand + "\nShorthand: " + shorthand + "\n";

            // Detect reserved addresses
            if (shorthand === "::") {
                // Unspecified address
                output += "\nUnspecified address corresponding to 0.0.0.0/32 in IPv4.";
                output += "\nUnspecified address range: ::/128";
            } else if (shorthand === "::1") {
                // Loopback address
                output += "\nLoopback address to the local host corresponding to 127.0.0.1/8 in IPv4.";
                output += "\nLoopback addresses range: ::1/128";
            } else if (ipv6[0] === 0 && ipv6[1] === 0 && ipv6[2] === 0 &&
                ipv6[3] === 0 && ipv6[4] === 0 && ipv6[5] === 0xffff) {
                // IPv4-mapped IPv6 address
                output += "\nIPv4-mapped IPv6 address detected. IPv6 clients will be handled natively by default, and IPv4 clients appear as IPv6 clients at their IPv4-mapped IPv6 address.";
                output += "\nMapped IPv4 address: " + _ipv4ToStr((ipv6[6] << 16) + ipv6[7]);
                output += "\nIPv4-mapped IPv6 addresses range: ::ffff:0:0/96";
            } else if (ipv6[0] === 0 && ipv6[1] === 0 && ipv6[2] === 0 &&
                ipv6[3] === 0 && ipv6[4] === 0xffff && ipv6[5] === 0) {
                // IPv4-translated address
                output += "\nIPv4-translated address detected. Used by Stateless IP/ICMP Translation (SIIT). See RFCs 6145 and 6052 for more details.";
                output += "\nTranslated IPv4 address: " + _ipv4ToStr((ipv6[6] << 16) + ipv6[7]);
                output += "\nIPv4-translated addresses range: ::ffff:0:0:0/96";
            } else if (ipv6[0] === 0x100) {
                // Discard prefix per RFC 6666
                output += "\nDiscard prefix detected. This is used when forwarding traffic to a sinkhole router to mitigate the effects of a denial-of-service attack. See RFC 6666 for more details.";
                output += "\nDiscard range: 100::/64";
            } else if (ipv6[0] === 0x64 && ipv6[1] === 0xff9b && ipv6[2] === 0 &&
                ipv6[3] === 0 && ipv6[4] === 0 && ipv6[5] === 0) {
                // IPv4/IPv6 translation per RFC 6052
                output += "\n'Well-Known' prefix for IPv4/IPv6 translation detected. See RFC 6052 for more details.";
                output += "\nTranslated IPv4 address: " + _ipv4ToStr((ipv6[6] << 16) + ipv6[7]);
                output += "\n'Well-Known' prefix range: 64:ff9b::/96";
            } else if (ipv6[0] === 0x2001 && ipv6[1] === 0) {
                // Teredo tunneling
                output += "\nTeredo tunneling IPv6 address detected\n";
                const serverIpv4  = (ipv6[2] << 16) + ipv6[3],
                    udpPort     = (~ipv6[5]) & 0xffff,
                    clientIpv4  = ~((ipv6[6] << 16) + ipv6[7]),
                    flagCone    = (ipv6[4] >>> 15) & 1,
                    flagR       = (ipv6[4] >>> 14) & 1,
                    flagRandom1 = (ipv6[4] >>> 10) & 15,
                    flagUg      = (ipv6[4] >>> 8) & 3,
                    flagRandom2 = ipv6[4] & 255;

                output += "\nServer IPv4 address: " + _ipv4ToStr(serverIpv4) +
                    "\nClient IPv4 address: " + _ipv4ToStr(clientIpv4) +
                    "\nClient UDP port:     " + udpPort +
                    "\nFlags:" +
                    "\n\tCone:    " + flagCone;

                if (flagCone) {
                    output += " (Client is behind a cone NAT)";
                } else {
                    output += " (Client is not behind a cone NAT)";
                }

                output += "\n\tR:       " + flagR;

                if (flagR) {
                    output += " Error: This flag should be set to 0. See RFC 5991 and RFC 4380.";
                }

                output += "\n\tRandom1: " + Utils.bin(flagRandom1, 4) +
                    "\n\tUG:      " + Utils.bin(flagUg, 2);

                if (flagUg) {
                    output += " Error: This flag should be set to 00. See RFC 4380.";
                }

                output += "\n\tRandom2: " + Utils.bin(flagRandom2, 8);

                if (!flagR && !flagUg && flagRandom1 && flagRandom2) {
                    output += "\n\nThis is a valid Teredo address which complies with RFC 4380 and RFC 5991.";
                } else if (!flagR && !flagUg) {
                    output += "\n\nThis is a valid Teredo address which complies with RFC 4380, however it does not comply with RFC 5991 (Teredo Security Updates) as there are no randomised bits in the flag field.";
                } else {
                    output += "\n\nThis is an invalid Teredo address.";
                }
                output += "\n\nTeredo prefix range: 2001::/32";
            } else if (ipv6[0] === 0x2001 && ipv6[1] === 0x2 && ipv6[2] === 0) {
                // Benchmarking
                output += "\nAssigned to the Benchmarking Methodology Working Group (BMWG) for benchmarking IPv6. Corresponds to 198.18.0.0/15 for benchmarking IPv4. See RFC 5180 for more details.";
                output += "\nBMWG range: 2001:2::/48";
            } else if (ipv6[0] === 0x2001 && ipv6[1] >= 0x10 && ipv6[1] <= 0x1f) {
                // ORCHIDv1
                output += "\nDeprecated, previously ORCHIDv1 (Overlay Routable Cryptographic Hash Identifiers).\nORCHIDv1 range: 2001:10::/28\nORCHIDv2 now uses 2001:20::/28.";
            } else if (ipv6[0] === 0x2001 && ipv6[1] >= 0x20 && ipv6[1] <= 0x2f) {
                // ORCHIDv2
                output += "\nORCHIDv2 (Overlay Routable Cryptographic Hash Identifiers).\nThese are non-routed IPv6 addresses used for Cryptographic Hash Identifiers.";
                output += "\nORCHIDv2 range: 2001:20::/28";
            } else if (ipv6[0] === 0x2001 && ipv6[1] === 0xdb8) {
                // Documentation
                output += "\nThis is a documentation IPv6 address. This range should be used whenever an example IPv6 address is given or to model networking scenarios. Corresponds to 192.0.2.0/24, 198.51.100.0/24, and 203.0.113.0/24 in IPv4.";
                output += "\nDocumentation range: 2001:db8::/32";
            } else if (ipv6[0] === 0x2002) {
                // 6to4
                output += "\n6to4 transition IPv6 address detected. See RFC 3056 for more details." +
                    "\n6to4 prefix range: 2002::/16";

                const v4Addr = _ipv4ToStr((ipv6[1] << 16) + ipv6[2]),
                    slaId = ipv6[3],
                    interfaceIdStr = ipv6[4].toString(16) + ipv6[5].toString(16) + ipv6[6].toString(16) + ipv6[7].toString(16),
                    interfaceId = new BigInteger(interfaceIdStr, 16);

                output += "\n\nEncapsulated IPv4 address: " + v4Addr +
                    "\nSLA ID: " + slaId +
                    "\nInterface ID (base 16): " + interfaceIdStr +
                    "\nInterface ID (base 10): " + interfaceId.toString();
            } else if (ipv6[0] >= 0xfc00 && ipv6[0] <= 0xfdff) {
                // Unique local address
                output += "\nThis is a unique local address comparable to the IPv4 private addresses 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. See RFC 4193 for more details.";
                output += "\nUnique local addresses range: fc00::/7";
            } else if (ipv6[0] >= 0xfe80 && ipv6[0] <= 0xfebf) {
                // Link-local address
                output += "\nThis is a link-local address comparable to the auto-configuration addresses 169.254.0.0/16 in IPv4.";
                output += "\nLink-local addresses range: fe80::/10";
            } else if (ipv6[0] >= 0xff00) {
                // Multicast
                output += "\nThis is a reserved multicast address.";
                output += "\nMulticast addresses range: ff00::/8";
            }


            // Detect possible EUI-64 addresses
            if ((ipv6[5] & 0xff === 0xff) && (ipv6[6] >>> 8 === 0xfe)) {
                output += "\n\nThis IPv6 address contains a modified EUI-64 address, identified by the presence of FF:FE in the 12th and 13th octets.";

                const intIdent = Utils.hex(ipv6[4] >>> 8) + ":" + Utils.hex(ipv6[4] & 0xff) + ":" +
                    Utils.hex(ipv6[5] >>> 8) + ":" + Utils.hex(ipv6[5] & 0xff) + ":" +
                    Utils.hex(ipv6[6] >>> 8) + ":" + Utils.hex(ipv6[6] & 0xff) + ":" +
                    Utils.hex(ipv6[7] >>> 8) + ":" + Utils.hex(ipv6[7] & 0xff),
                    mac = Utils.hex((ipv6[4] >>> 8) ^ 2) + ":" + Utils.hex(ipv6[4] & 0xff) + ":" +
                    Utils.hex(ipv6[5] >>> 8) + ":" + Utils.hex(ipv6[6] & 0xff) + ":" +
                    Utils.hex(ipv6[7] >>> 8) + ":" + Utils.hex(ipv6[7] & 0xff);
                output += "\nInterface identifier: " + intIdent +
                    "\nMAC address:          " + mac;
            }
        } else {
            return "Invalid IPv6 address";
        }
        return output;
    }

}

export default ParseIPv6Address;
