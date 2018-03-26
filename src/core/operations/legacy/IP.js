import Utils from "../Utils.js";
import Checksum from "./Checksum.js";
import {BigInteger} from "jsbn";


/**
 * Internet Protocol address operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const IP = {

    /**
     * @constant
     * @default
     */
    INCLUDE_NETWORK_INFO: true,
    /**
     * @constant
     * @default
     */
    ENUMERATE_ADDRESSES: true,
    /**
     * @constant
     * @default
     */
    ALLOW_LARGE_LIST: false,

    /**
     * Parse IP range operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runParseIpRange: function (input, args) {
        let includeNetworkInfo = args[0],
            enumerateAddresses = args[1],
            allowLargeList = args[2];

        // Check what type of input we are looking at
        let ipv4CidrRegex = /^\s*((?:\d{1,3}\.){3}\d{1,3})\/(\d\d?)\s*$/,
            ipv4RangeRegex = /^\s*((?:\d{1,3}\.){3}\d{1,3})\s*-\s*((?:\d{1,3}\.){3}\d{1,3})\s*$/,
            ipv6CidrRegex = /^\s*(((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\4)::|:\b|(?![\dA-F])))|(?!\3\4)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\/(\d\d?\d?)\s*$/i,
            ipv6RangeRegex = /^\s*(((?=.*::)(?!.*::[^-]+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\4)::|:\b|(?![\dA-F])))|(?!\3\4)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\s*-\s*(((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\17)::|:\b|(?![\dA-F])))|(?!\16\17)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\s*$/i,
            match;

        if ((match = ipv4CidrRegex.exec(input))) {
            return IP._ipv4CidrRange(match, includeNetworkInfo, enumerateAddresses, allowLargeList);
        } else if ((match = ipv4RangeRegex.exec(input))) {
            return IP._ipv4HyphenatedRange(match, includeNetworkInfo, enumerateAddresses, allowLargeList);
        } else if ((match = ipv6CidrRegex.exec(input))) {
            return IP._ipv6CidrRange(match, includeNetworkInfo);
        } else if ((match = ipv6RangeRegex.exec(input))) {
            return IP._ipv6HyphenatedRange(match, includeNetworkInfo);
        } else {
            return "Invalid input.\n\nEnter either a CIDR range (e.g. 10.0.0.0/24) or a hyphenated range (e.g. 10.0.0.0 - 10.0.1.0). IPv6 also supported.";
        }
    },


    /**
     * @constant
     * @default
     */
    IPV4_REGEX: /^\s*((?:\d{1,3}\.){3}\d{1,3})\s*$/,
    /**
     * @constant
     * @default
     */
    IPV6_REGEX: /^\s*(((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\4)::|:\b|(?![\dA-F])))|(?!\3\4)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\s*$/i,

    /**
     * Parse IPv6 address operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runParseIPv6: function (input, args) {
        let match,
            output = "";

        if ((match = IP.IPV6_REGEX.exec(input))) {
            let ipv6 = IP._strToIpv6(match[1]),
                longhand = IP._ipv6ToStr(ipv6),
                shorthand = IP._ipv6ToStr(ipv6, true);

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
                output += "\nMapped IPv4 address: " + IP._ipv4ToStr((ipv6[6] << 16) + ipv6[7]);
                output += "\nIPv4-mapped IPv6 addresses range: ::ffff:0:0/96";
            } else if (ipv6[0] === 0 && ipv6[1] === 0 && ipv6[2] === 0 &&
                ipv6[3] === 0 && ipv6[4] === 0xffff && ipv6[5] === 0) {
                // IPv4-translated address
                output += "\nIPv4-translated address detected. Used by Stateless IP/ICMP Translation (SIIT). See RFCs 6145 and 6052 for more details.";
                output += "\nTranslated IPv4 address: " + IP._ipv4ToStr((ipv6[6] << 16) + ipv6[7]);
                output += "\nIPv4-translated addresses range: ::ffff:0:0:0/96";
            } else if (ipv6[0] === 0x100) {
                // Discard prefix per RFC 6666
                output += "\nDiscard prefix detected. This is used when forwarding traffic to a sinkhole router to mitigate the effects of a denial-of-service attack. See RFC 6666 for more details.";
                output += "\nDiscard range: 100::/64";
            } else if (ipv6[0] === 0x64 && ipv6[1] === 0xff9b && ipv6[2] === 0 &&
                ipv6[3] === 0 && ipv6[4] === 0 && ipv6[5] === 0) {
                // IPv4/IPv6 translation per RFC 6052
                output += "\n'Well-Known' prefix for IPv4/IPv6 translation detected. See RFC 6052 for more details.";
                output += "\nTranslated IPv4 address: " + IP._ipv4ToStr((ipv6[6] << 16) + ipv6[7]);
                output += "\n'Well-Known' prefix range: 64:ff9b::/96";
            } else if (ipv6[0] === 0x2001 && ipv6[1] === 0) {
                // Teredo tunneling
                output += "\nTeredo tunneling IPv6 address detected\n";
                let serverIpv4  = (ipv6[2] << 16) + ipv6[3],
                    udpPort     = (~ipv6[5]) & 0xffff,
                    clientIpv4  = ~((ipv6[6] << 16) + ipv6[7]),
                    flagCone    = (ipv6[4] >>> 15) & 1,
                    flagR       = (ipv6[4] >>> 14) & 1,
                    flagRandom1 = (ipv6[4] >>> 10) & 15,
                    flagUg      = (ipv6[4] >>> 8) & 3,
                    flagRandom2 = ipv6[4] & 255;

                output += "\nServer IPv4 address: " + IP._ipv4ToStr(serverIpv4) +
                    "\nClient IPv4 address: " + IP._ipv4ToStr(clientIpv4) +
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

                let v4Addr = IP._ipv4ToStr((ipv6[1] << 16) + ipv6[2]),
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

                let intIdent = Utils.hex(ipv6[4] >>> 8) + ":" + Utils.hex(ipv6[4] & 0xff) + ":" +
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
    },


    /**
     * @constant
     * @default
     */
    IP_FORMAT_LIST: ["Dotted Decimal", "Decimal", "Hex"],

    /**
     * Change IP format operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runChangeIpFormat: function(input, args) {
        let inFormat = args[0],
            outFormat = args[1],
            lines = input.split("\n"),
            output = "",
            j = 0;


        for (let i = 0; i < lines.length; i++) {
            if (lines[i] === "") continue;
            let baIp = [];
            let octets;
            let decimal;

            if (inFormat === outFormat) {
                output += lines[i] + "\n";
                continue;
            }

            // Convert to byte array IP from input format
            switch (inFormat) {
                case "Dotted Decimal":
                    octets = lines[i].split(".");
                    for (j = 0; j < octets.length; j++) {
                        baIp.push(parseInt(octets[j], 10));
                    }
                    break;
                case "Decimal":
                    decimal = lines[i].toString();
                    baIp.push(decimal >> 24 & 255);
                    baIp.push(decimal >> 16 & 255);
                    baIp.push(decimal >> 8 & 255);
                    baIp.push(decimal & 255);
                    break;
                case "Hex":
                    baIp = Utils.fromHex(lines[i]);
                    break;
                default:
                    throw "Unsupported input IP format";
            }

            let ddIp;
            let decIp;
            let hexIp;

            // Convert byte array IP to output format
            switch (outFormat) {
                case "Dotted Decimal":
                    ddIp = "";
                    for (j = 0; j < baIp.length; j++) {
                        ddIp += baIp[j] + ".";
                    }
                    output += ddIp.slice(0, ddIp.length-1) + "\n";
                    break;
                case "Decimal":
                    decIp = ((baIp[0] << 24) | (baIp[1] << 16) | (baIp[2] << 8) | baIp[3]) >>> 0;
                    output += decIp.toString() + "\n";
                    break;
                case "Hex":
                    hexIp = "";
                    for (j = 0; j < baIp.length; j++) {
                        hexIp += Utils.hex(baIp[j]);
                    }
                    output += hexIp + "\n";
                    break;
                default:
                    throw "Unsupported output IP format";
            }
        }

        return output.slice(0, output.length-1);
    },


    /**
     * @constant
     * @default
     */
    DELIM_OPTIONS: ["Line feed", "CRLF", "Space", "Comma", "Semi-colon"],
    /**
     * @constant
     * @default
     */
    GROUP_CIDR: 24,
    /**
     * @constant
     * @default
     */
    GROUP_ONLY_SUBNET: false,

    /**
     * Group IP addresses operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runGroupIps: function(input, args) {
        let delim = Utils.charRep(args[0]),
            cidr = args[1],
            onlySubnets = args[2],
            ipv4Mask = cidr < 32 ? ~(0xFFFFFFFF >>> cidr) : 0xFFFFFFFF,
            ipv6Mask = IP._genIpv6Mask(cidr),
            ips = input.split(delim),
            ipv4Networks = {},
            ipv6Networks = {},
            match = null,
            output = "",
            ip = null,
            network = null,
            networkStr = "",
            i;

        if (cidr < 0 || cidr > 127) {
            return "CIDR must be less than 32 for IPv4 or 128 for IPv6";
        }

        // Parse all IPs and add to network dictionary
        for (i = 0; i < ips.length; i++) {
            if ((match = IP.IPV4_REGEX.exec(ips[i]))) {
                ip = IP._strToIpv4(match[1]) >>> 0;
                network = ip & ipv4Mask;

                if (ipv4Networks.hasOwnProperty(network)) {
                    ipv4Networks[network].push(ip);
                } else {
                    ipv4Networks[network] = [ip];
                }
            } else if ((match = IP.IPV6_REGEX.exec(ips[i]))) {
                ip = IP._strToIpv6(match[1]);
                network = [];
                networkStr = "";

                for (let j = 0; j < 8; j++) {
                    network.push(ip[j] & ipv6Mask[j]);
                }

                networkStr = IP._ipv6ToStr(network, true);

                if (ipv6Networks.hasOwnProperty(networkStr)) {
                    ipv6Networks[networkStr].push(ip);
                } else {
                    ipv6Networks[networkStr] = [ip];
                }
            }
        }

        // Sort IPv4 network dictionaries and print
        for (network in ipv4Networks) {
            ipv4Networks[network] = ipv4Networks[network].sort();

            output += IP._ipv4ToStr(network) + "/" + cidr + "\n";

            if (!onlySubnets) {
                for (i = 0; i < ipv4Networks[network].length; i++) {
                    output += "  " + IP._ipv4ToStr(ipv4Networks[network][i]) + "\n";
                }
                output += "\n";
            }
        }

        // Sort IPv6 network dictionaries and print
        for (networkStr in ipv6Networks) {
            //ipv6Networks[networkStr] = ipv6Networks[networkStr].sort();  TODO

            output += networkStr + "/" + cidr + "\n";

            if (!onlySubnets) {
                for (i = 0; i < ipv6Networks[networkStr].length; i++) {
                    output += "  " + IP._ipv6ToStr(ipv6Networks[networkStr][i], true) + "\n";
                }
                output += "\n";
            }
        }

        return output;
    },


    /**
     * @constant
     * @default
     */
    IP_HEADER_FORMAT: ["Hex", "Raw"],

    /**
     * Parse IPv4 header operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    runParseIPv4Header: function(input, args) {
        let format = args[0],
            output;

        if (format === "Hex") {
            input = Utils.fromHex(input);
        } else if (format === "Raw") {
            input = Utils.strToByteArray(input);
        } else {
            return "Unrecognised input format.";
        }

        let version = (input[0] >>> 4) & 0x0f,
            ihl = input[0] & 0x0f,
            dscp = (input[1] >>> 2) & 0x3f,
            ecn = input[1] & 0x03,
            length = input[2] << 8 | input[3],
            identification = input[4] << 8 | input[5],
            flags = (input[6] >>> 5) & 0x07,
            fragOffset = (input[6] & 0x1f) << 8 | input[7],
            ttl = input[8],
            protocol = input[9],
            checksum = input[10] << 8 | input[11],
            srcIP = input[12] << 24 | input[13] << 16 | input[14] << 8 | input[15],
            dstIP = input[16] << 24 | input[17] << 16 | input[18] << 8 | input[19],
            checksumHeader = input.slice(0, 10).concat([0, 0]).concat(input.slice(12, 20)),
            options = [];

        // Version
        if (version !== 4) {
            version = version + " (Error: for IPv4 headers, this should always be set to 4)";
        }

        // IHL
        if (ihl < 5) {
            ihl = ihl + " (Error: this should always be at least 5)";
        } else if (ihl > 5) {
            // sort out options...
            const optionsLen = ihl * 4 - 20;
            options = input.slice(20, optionsLen + 20);
        }

        // Protocol
        const protocolInfo = IP._protocolLookup[protocol] || {keyword: "", protocol: ""};

        // Checksum
        let correctChecksum = Checksum.runTCPIP(checksumHeader, []),
            givenChecksum = Utils.hex(checksum),
            checksumResult;
        if (correctChecksum === givenChecksum) {
            checksumResult = givenChecksum + " (correct)";
        } else {
            checksumResult = givenChecksum + " (incorrect, should be " + correctChecksum + ")";
        }

        output = "<table class='table table-hover table-condensed table-bordered table-nonfluid'><tr><th>Field</th><th>Value</th></tr>" +
            "<tr><td>Version</td><td>" + version + "</td></tr>" +
            "<tr><td>Internet Header Length (IHL)</td><td>" + ihl + " (" + (ihl * 4) + " bytes)</td></tr>" +
            "<tr><td>Differentiated Services Code Point (DSCP)</td><td>" + dscp + "</td></tr>" +
            "<tr><td>Explicit Congestion Notification (ECN)</td><td>" + ecn + "</td></tr>" +
            "<tr><td>Total length</td><td>" + length + " bytes" +
            "\n  IP header: " + (ihl * 4) + " bytes" +
            "\n  Data: " + (length - ihl * 4) + " bytes</td></tr>" +
            "<tr><td>Identification</td><td>0x" + Utils.hex(identification) + " (" + identification + ")</td></tr>" +
            "<tr><td>Flags</td><td>0x" + Utils.hex(flags, 2) +
            "\n  Reserved bit:" + (flags >> 2) + " (must be 0)" +
            "\n  Don't fragment:" + (flags >> 1 & 1) +
            "\n  More fragments:" + (flags & 1) + "</td></tr>" +
            "<tr><td>Fragment offset</td><td>" + fragOffset + "</td></tr>" +
            "<tr><td>Time-To-Live</td><td>" + ttl + "</td></tr>" +
            "<tr><td>Protocol</td><td>" + protocol + ", " + protocolInfo.protocol + " (" + protocolInfo.keyword + ")</td></tr>" +
            "<tr><td>Header checksum</td><td>" + checksumResult + "</td></tr>" +
            "<tr><td>Source IP address</td><td>" + IP._ipv4ToStr(srcIP) + "</td></tr>" +
            "<tr><td>Destination IP address</td><td>" + IP._ipv4ToStr(dstIP) + "</td></tr>";

        if (ihl > 5) {
            output += "<tr><td>Options</td><td>" + Utils.toHex(options) + "</td></tr>";
        }

        return output + "</table>";
    },


    /**
     * @constant
     * @default
     * @private
     */
    _LARGE_RANGE_ERROR: "The specified range contains more than 65,536 addresses. Running this query could crash your browser. If you want to run it, select the \"Allow large queries\" option. You are advised to turn off \"Auto Bake\" whilst editing large ranges.",

    /**
     * Parses an IPv4 CIDR range (e.g. 192.168.0.0/24) and displays information about it.
     *
     * @private
     * @param {RegExp} cidr
     * @param {boolean} includeNetworkInfo
     * @param {boolean} enumerateAddresses
     * @param {boolean} allowLargeList
     * @returns {string}
     */
    _ipv4CidrRange: function(cidr, includeNetworkInfo, enumerateAddresses, allowLargeList) {
        let output = "",
            network = IP._strToIpv4(cidr[1]),
            cidrRange = parseInt(cidr[2], 10);

        if (cidrRange < 0 || cidrRange > 31) {
            return "IPv4 CIDR must be less than 32";
        }

        let mask = ~(0xFFFFFFFF >>> cidrRange),
            ip1 = network & mask,
            ip2 = ip1 | ~mask;

        if (includeNetworkInfo) {
            output += "Network: " + IP._ipv4ToStr(network) + "\n";
            output += "CIDR: " + cidrRange + "\n";
            output += "Mask: " + IP._ipv4ToStr(mask) + "\n";
            output += "Range: " + IP._ipv4ToStr(ip1) + " - " + IP._ipv4ToStr(ip2) + "\n";
            output += "Total addresses in range: " + (((ip2 - ip1) >>> 0) + 1) + "\n\n";
        }

        if (enumerateAddresses) {
            if (cidrRange >= 16 || allowLargeList) {
                output += IP._generateIpv4Range(ip1, ip2).join("\n");
            } else {
                output += IP._LARGE_RANGE_ERROR;
            }
        }
        return output;
    },


    /**
     * Parses an IPv6 CIDR range (e.g. ff00::/48) and displays information about it.
     *
     * @private
     * @param {RegExp} cidr
     * @param {boolean} includeNetworkInfo
     * @returns {string}
     */
    _ipv6CidrRange: function(cidr, includeNetworkInfo) {
        let output = "",
            network = IP._strToIpv6(cidr[1]),
            cidrRange = parseInt(cidr[cidr.length-1], 10);

        if (cidrRange < 0 || cidrRange > 127) {
            return "IPv6 CIDR must be less than 128";
        }

        let mask = IP._genIpv6Mask(cidrRange),
            ip1 = new Array(8),
            ip2 = new Array(8),
            totalDiff = "",
            total = new Array(128);

        for (let i = 0; i < 8; i++) {
            ip1[i] = network[i] & mask[i];
            ip2[i] = ip1[i] | (~mask[i] & 0x0000FFFF);
            totalDiff = (ip2[i] - ip1[i]).toString(2);

            if (totalDiff !== "0") {
                for (let n = 0; n < totalDiff.length; n++) {
                    total[i*16 + 16-(totalDiff.length-n)] = totalDiff[n];
                }
            }
        }

        if (includeNetworkInfo) {
            output += "Network: " + IP._ipv6ToStr(network) + "\n";
            output += "Shorthand: " + IP._ipv6ToStr(network, true) + "\n";
            output += "CIDR: " + cidrRange + "\n";
            output += "Mask: " + IP._ipv6ToStr(mask) + "\n";
            output += "Range: " + IP._ipv6ToStr(ip1) + " - " + IP._ipv6ToStr(ip2) + "\n";
            output += "Total addresses in range: " + (parseInt(total.join(""), 2) + 1) + "\n\n";
        }

        return output;
    },


    /**
     * Generates an IPv6 subnet mask given a CIDR value.
     *
     * @private
     * @param {number} cidr
     * @returns {number[]}
     */
    _genIpv6Mask: function(cidr) {
        let mask = new Array(8),
            shift;

        for (let i = 0; i < 8; i++) {
            if (cidr > ((i+1)*16)) {
                mask[i] = 0x0000FFFF;
            } else {
                shift = cidr-(i*16);
                if (shift < 0) shift = 0;
                mask[i] = ~((0x0000FFFF >>> shift) | 0xFFFF0000);
            }
        }

        return mask;
    },


    /**
     * Parses an IPv4 hyphenated range (e.g. 192.168.0.0 - 192.168.0.255) and displays information
     * about it.
     *
     * @private
     * @param {RegExp} range
     * @param {boolean} includeNetworkInfo
     * @param {boolean} enumerateAddresses
     * @param {boolean} allowLargeList
     * @returns {string}
     */
    _ipv4HyphenatedRange: function(range, includeNetworkInfo, enumerateAddresses, allowLargeList) {
        let output = "",
            ip1 = IP._strToIpv4(range[1]),
            ip2 = IP._strToIpv4(range[2]);

        // Calculate mask
        let diff = ip1 ^ ip2,
            cidr = 32,
            mask = 0;

        while (diff !== 0) {
            diff >>= 1;
            cidr--;
            mask = (mask << 1) | 1;
        }

        mask = ~mask >>> 0;
        let network = ip1 & mask,
            subIp1 = network & mask,
            subIp2 = subIp1 | ~mask;

        if (includeNetworkInfo) {
            output += "Minimum subnet required to hold this range:\n";
            output += "\tNetwork: " + IP._ipv4ToStr(network) + "\n";
            output += "\tCIDR: " + cidr + "\n";
            output += "\tMask: " + IP._ipv4ToStr(mask) + "\n";
            output += "\tSubnet range: " + IP._ipv4ToStr(subIp1) + " - " + IP._ipv4ToStr(subIp2) + "\n";
            output += "\tTotal addresses in subnet: " + (((subIp2 - subIp1) >>> 0) + 1) + "\n\n";
            output += "Range: " + IP._ipv4ToStr(ip1) + " - " + IP._ipv4ToStr(ip2) + "\n";
            output += "Total addresses in range: " + (((ip2 - ip1) >>> 0) + 1) + "\n\n";
        }

        if (enumerateAddresses) {
            if (((ip2 - ip1) >>> 0) <= 65536 || allowLargeList) {
                output += IP._generateIpv4Range(ip1, ip2).join("\n");
            } else {
                output += IP._LARGE_RANGE_ERROR;
            }
        }
        return output;
    },


    /**
     * Parses an IPv6 hyphenated range (e.g. ff00:: - ffff::) and displays information about it.
     *
     * @private
     * @param {RegExp} range
     * @param {boolean} includeNetworkInfo
     * @returns {string}
     */
    _ipv6HyphenatedRange: function(range, includeNetworkInfo) {
        let output = "",
            ip1 = IP._strToIpv6(range[1]),
            ip2 = IP._strToIpv6(range[14]);

        let t = "",
            total = new Array(128).fill(),
            i;

        for (i = 0; i < 8; i++) {
            t = (ip2[i] - ip1[i]).toString(2);
            if (t !== "0") {
                for (let n = 0; n < t.length; n++) {
                    total[i*16 + 16-(t.length-n)] = t[n];
                }
            }
        }

        if (includeNetworkInfo) {
            output += "Range: " + IP._ipv6ToStr(ip1) + " - " + IP._ipv6ToStr(ip2) + "\n";
            output += "Shorthand range: " + IP._ipv6ToStr(ip1, true) + " - " + IP._ipv6ToStr(ip2, true) + "\n";
            output += "Total addresses in range: " + (parseInt(total.join(""), 2) + 1) + "\n\n";
        }

        return output;
    },


    /**
     * Converts an IPv4 address from string format to numerical format.
     *
     * @private
     * @param {string} ipStr
     * @returns {number}
     *
     * @example
     * // returns 168427520
     * IP._strToIpv4("10.10.0.0");
     */
    _strToIpv4: function (ipStr) {
        let blocks = ipStr.split("."),
            numBlocks = parseBlocks(blocks),
            result = 0;

        result += numBlocks[0] << 24;
        result += numBlocks[1] << 16;
        result += numBlocks[2] << 8;
        result += numBlocks[3];

        return result;

        /**
         * Converts a list of 4 numeric strings in the range 0-255 to a list of numbers.
         */
        function parseBlocks(blocks) {
            if (blocks.length !== 4)
                throw "More than 4 blocks.";

            const numBlocks = [];
            for (let i = 0; i < 4; i++) {
                numBlocks[i] = parseInt(blocks[i], 10);
                if (numBlocks[i] < 0 || numBlocks[i] > 255)
                    throw "Block out of range.";
            }
            return numBlocks;
        }
    },


    /**
     * Converts an IPv4 address from numerical format to string format.
     *
     * @private
     * @param {number} ipInt
     * @returns {string}
     *
     * @example
     * // returns "10.10.0.0"
     * IP._ipv4ToStr(168427520);
     */
    _ipv4ToStr: function(ipInt) {
        let blockA = (ipInt >> 24) & 255,
            blockB = (ipInt >> 16) & 255,
            blockC = (ipInt >> 8) & 255,
            blockD = ipInt & 255;

        return blockA + "." + blockB + "." + blockC + "." + blockD;
    },


    /**
     * Converts an IPv6 address from string format to numerical array format.
     *
     * @private
     * @param {string} ipStr
     * @returns {number[]}
     *
     * @example
     * // returns [65280, 0, 0, 0, 0, 0, 4369, 8738]
     * IP._strToIpv6("ff00::1111:2222");
     */
    _strToIpv6: function(ipStr) {
        let blocks = ipStr.split(":"),
            numBlocks = parseBlocks(blocks),
            j = 0,
            ipv6 = new Array(8);

        for (let i = 0; i < 8; i++) {
            if (isNaN(numBlocks[j])) {
                ipv6[i] = 0;
                if (i === (8-numBlocks.slice(j).length)) j++;
            } else {
                ipv6[i] = numBlocks[j];
                j++;
            }
        }
        return ipv6;

        /**
         * Converts a list of 3-8 numeric hex strings in the range 0-65535 to a list of numbers.
         */
        function parseBlocks(blocks) {
            if (blocks.length < 3 || blocks.length > 8)
                throw "Badly formatted IPv6 address.";
            const numBlocks = [];
            for (let i = 0; i < blocks.length; i++) {
                numBlocks[i] = parseInt(blocks[i], 16);
                if (numBlocks[i] < 0 || numBlocks[i] > 65535)
                    throw "Block out of range.";
            }
            return numBlocks;
        }
    },


    /**
     * Converts an IPv6 address from numerical array format to string format.
     *
     * @private
     * @param {number[]} ipv6
     * @param {boolean} compact - Whether or not to return the address in shorthand or not
     * @returns {string}
     *
     * @example
     * // returns "ff00::1111:2222"
     * IP._ipv6ToStr([65280, 0, 0, 0, 0, 0, 4369, 8738], true);
     *
     * // returns "ff00:0000:0000:0000:0000:0000:1111:2222"
     * IP._ipv6ToStr([65280, 0, 0, 0, 0, 0, 4369, 8738], false);
     */
    _ipv6ToStr: function(ipv6, compact) {
        let output = "",
            i = 0;

        if (compact) {
            let start = -1,
                end = -1,
                s = 0,
                e = -1;

            for (i = 0; i < 8; i++) {
                if (ipv6[i] === 0 && e === (i-1)) {
                    e = i;
                } else if (ipv6[i] === 0) {
                    s = i; e = i;
                }
                if (e >= 0 && (e-s) > (end - start)) {
                    start = s;
                    end = e;
                }
            }

            for (i = 0; i < 8; i++) {
                if (i !== start) {
                    output += Utils.hex(ipv6[i], 1) + ":";
                } else {
                    output += ":";
                    i = end;
                    if (end === 7) output += ":";
                }
            }
            if (output[0] === ":")
                output = ":" + output;
        } else {
            for (i = 0; i < 8; i++) {
                output += Utils.hex(ipv6[i], 4) + ":";
            }
        }
        return output.slice(0, output.length-1);
    },


    /**
     * Generates a list of IPv4 addresses in string format between two given numerical values.
     *
     * @private
     * @param {number} ip
     * @param {number} endIp
     * @returns {string[]}
     *
     * @example
     * // returns ["0.0.0.1", "0.0.0.2", "0.0.0.3"]
     * IP._generateIpv4Range(1, 3);
     */
    _generateIpv4Range: function(ip, endIp) {
        const range = [];
        if (endIp >= ip) {
            for (; ip <= endIp; ip++) {
                range.push(IP._ipv4ToStr(ip));
            }
        } else {
            range[0] = "Second IP address smaller than first.";
        }
        return range;
    },


    /**
     * Lookup table for Internet Protocols.
     * Taken from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml
     *
     * @private
     * @constant
     */
    _protocolLookup: {
        0: {keyword: "HOPOPT", protocol: "IPv6 Hop-by-Hop Option"},
        1: {keyword: "ICMP", protocol: "Internet Control Message"},
        2: {keyword: "IGMP", protocol: "Internet Group Management"},
        3: {keyword: "GGP", protocol: "Gateway-to-Gateway"},
        4: {keyword: "IPv4", protocol: "IPv4 encapsulation"},
        5: {keyword: "ST", protocol: "Stream"},
        6: {keyword: "TCP", protocol: "Transmission Control"},
        7: {keyword: "CBT", protocol: "CBT"},
        8: {keyword: "EGP", protocol: "Exterior Gateway Protocol"},
        9: {keyword: "IGP", protocol: "any private interior gateway (used by Cisco for their IGRP)"},
        10: {keyword: "BBN-RCC-MON", protocol: "BBN RCC Monitoring"},
        11: {keyword: "NVP-II", protocol: "Network Voice Protocol"},
        12: {keyword: "PUP", protocol: "PUP"},
        13: {keyword: "ARGUS (deprecated)", protocol: "ARGUS"},
        14: {keyword: "EMCON", protocol: "EMCON"},
        15: {keyword: "XNET", protocol: "Cross Net Debugger"},
        16: {keyword: "CHAOS", protocol: "Chaos"},
        17: {keyword: "UDP", protocol: "User Datagram"},
        18: {keyword: "MUX", protocol: "Multiplexing"},
        19: {keyword: "DCN-MEAS", protocol: "DCN Measurement Subsystems"},
        20: {keyword: "HMP", protocol: "Host Monitoring"},
        21: {keyword: "PRM", protocol: "Packet Radio Measurement"},
        22: {keyword: "XNS-IDP", protocol: "XEROX NS IDP"},
        23: {keyword: "TRUNK-1", protocol: "Trunk-1"},
        24: {keyword: "TRUNK-2", protocol: "Trunk-2"},
        25: {keyword: "LEAF-1", protocol: "Leaf-1"},
        26: {keyword: "LEAF-2", protocol: "Leaf-2"},
        27: {keyword: "RDP", protocol: "Reliable Data Protocol"},
        28: {keyword: "IRTP", protocol: "Internet Reliable Transaction"},
        29: {keyword: "ISO-TP4", protocol: "ISO Transport Protocol Class 4"},
        30: {keyword: "NETBLT", protocol: "Bulk Data Transfer Protocol"},
        31: {keyword: "MFE-NSP", protocol: "MFE Network Services Protocol"},
        32: {keyword: "MERIT-INP", protocol: "MERIT Internodal Protocol"},
        33: {keyword: "DCCP", protocol: "Datagram Congestion Control Protocol"},
        34: {keyword: "3PC", protocol: "Third Party Connect Protocol"},
        35: {keyword: "IDPR", protocol: "Inter-Domain Policy Routing Protocol"},
        36: {keyword: "XTP", protocol: "XTP"},
        37: {keyword: "DDP", protocol: "Datagram Delivery Protocol"},
        38: {keyword: "IDPR-CMTP", protocol: "IDPR Control Message Transport Proto"},
        39: {keyword: "TP++", protocol: "TP++ Transport Protocol"},
        40: {keyword: "IL", protocol: "IL Transport Protocol"},
        41: {keyword: "IPv6", protocol: "IPv6 encapsulation"},
        42: {keyword: "SDRP", protocol: "Source Demand Routing Protocol"},
        43: {keyword: "IPv6-Route", protocol: "Routing Header for IPv6"},
        44: {keyword: "IPv6-Frag", protocol: "Fragment Header for IPv6"},
        45: {keyword: "IDRP", protocol: "Inter-Domain Routing Protocol"},
        46: {keyword: "RSVP", protocol: "Reservation Protocol"},
        47: {keyword: "GRE", protocol: "Generic Routing Encapsulation"},
        48: {keyword: "DSR", protocol: "Dynamic Source Routing Protocol"},
        49: {keyword: "BNA", protocol: "BNA"},
        50: {keyword: "ESP", protocol: "Encap Security Payload"},
        51: {keyword: "AH", protocol: "Authentication Header"},
        52: {keyword: "I-NLSP", protocol: "Integrated Net Layer Security  TUBA"},
        53: {keyword: "SWIPE (deprecated)", protocol: "IP with Encryption"},
        54: {keyword: "NARP", protocol: "NBMA Address Resolution Protocol"},
        55: {keyword: "MOBILE", protocol: "IP Mobility"},
        56: {keyword: "TLSP", protocol: "Transport Layer Security Protocol using Kryptonet key management"},
        57: {keyword: "SKIP", protocol: "SKIP"},
        58: {keyword: "IPv6-ICMP", protocol: "ICMP for IPv6"},
        59: {keyword: "IPv6-NoNxt", protocol: "No Next Header for IPv6"},
        60: {keyword: "IPv6-Opts", protocol: "Destination Options for IPv6"},
        61: {keyword: "", protocol: "any host internal protocol"},
        62: {keyword: "CFTP", protocol: "CFTP"},
        63: {keyword: "", protocol: "any local network"},
        64: {keyword: "SAT-EXPAK", protocol: "SATNET and Backroom EXPAK"},
        65: {keyword: "KRYPTOLAN", protocol: "Kryptolan"},
        66: {keyword: "RVD", protocol: "MIT Remote Virtual Disk Protocol"},
        67: {keyword: "IPPC", protocol: "Internet Pluribus Packet Core"},
        68: {keyword: "", protocol: "any distributed file system"},
        69: {keyword: "SAT-MON", protocol: "SATNET Monitoring"},
        70: {keyword: "VISA", protocol: "VISA Protocol"},
        71: {keyword: "IPCV", protocol: "Internet Packet Core Utility"},
        72: {keyword: "CPNX", protocol: "Computer Protocol Network Executive"},
        73: {keyword: "CPHB", protocol: "Computer Protocol Heart Beat"},
        74: {keyword: "WSN", protocol: "Wang Span Network"},
        75: {keyword: "PVP", protocol: "Packet Video Protocol"},
        76: {keyword: "BR-SAT-MON", protocol: "Backroom SATNET Monitoring"},
        77: {keyword: "SUN-ND", protocol: "SUN ND PROTOCOL-Temporary"},
        78: {keyword: "WB-MON", protocol: "WIDEBAND Monitoring"},
        79: {keyword: "WB-EXPAK", protocol: "WIDEBAND EXPAK"},
        80: {keyword: "ISO-IP", protocol: "ISO Internet Protocol"},
        81: {keyword: "VMTP", protocol: "VMTP"},
        82: {keyword: "SECURE-VMTP", protocol: "SECURE-VMTP"},
        83: {keyword: "VINES", protocol: "VINES"},
        84: {keyword: "TTP", protocol: "Transaction Transport Protocol"},
        85: {keyword: "NSFNET-IGP", protocol: "NSFNET-IGP"},
        86: {keyword: "DGP", protocol: "Dissimilar Gateway Protocol"},
        87: {keyword: "TCF", protocol: "TCF"},
        88: {keyword: "EIGRP", protocol: "EIGRP"},
        89: {keyword: "OSPFIGP", protocol: "OSPFIGP"},
        90: {keyword: "Sprite-RPC", protocol: "Sprite RPC Protocol"},
        91: {keyword: "LARP", protocol: "Locus Address Resolution Protocol"},
        92: {keyword: "MTP", protocol: "Multicast Transport Protocol"},
        93: {keyword: "AX.25", protocol: "AX.25 Frames"},
        94: {keyword: "IPIP", protocol: "IP-within-IP Encapsulation Protocol"},
        95: {keyword: "MICP (deprecated)", protocol: "Mobile Internetworking Control Pro."},
        96: {keyword: "SCC-SP", protocol: "Semaphore Communications Sec. Pro."},
        97: {keyword: "ETHERIP", protocol: "Ethernet-within-IP Encapsulation"},
        98: {keyword: "ENCAP", protocol: "Encapsulation Header"},
        99: {keyword: "", protocol: "any private encryption scheme"},
        100: {keyword: "GMTP", protocol: "GMTP"},
        101: {keyword: "IFMP", protocol: "Ipsilon Flow Management Protocol"},
        102: {keyword: "PNNI", protocol: "PNNI over IP"},
        103: {keyword: "PIM", protocol: "Protocol Independent Multicast"},
        104: {keyword: "ARIS", protocol: "ARIS"},
        105: {keyword: "SCPS", protocol: "SCPS"},
        106: {keyword: "QNX", protocol: "QNX"},
        107: {keyword: "A/N", protocol: "Active Networks"},
        108: {keyword: "IPComp", protocol: "IP Payload Compression Protocol"},
        109: {keyword: "SNP", protocol: "Sitara Networks Protocol"},
        110: {keyword: "Compaq-Peer", protocol: "Compaq Peer Protocol"},
        111: {keyword: "IPX-in-IP", protocol: "IPX in IP"},
        112: {keyword: "VRRP", protocol: "Virtual Router Redundancy Protocol"},
        113: {keyword: "PGM", protocol: "PGM Reliable Transport Protocol"},
        114: {keyword: "", protocol: "any 0-hop protocol"},
        115: {keyword: "L2TP", protocol: "Layer Two Tunneling Protocol"},
        116: {keyword: "DDX", protocol: "D-II Data Exchange (DDX)"},
        117: {keyword: "IATP", protocol: "Interactive Agent Transfer Protocol"},
        118: {keyword: "STP", protocol: "Schedule Transfer Protocol"},
        119: {keyword: "SRP", protocol: "SpectraLink Radio Protocol"},
        120: {keyword: "UTI", protocol: "UTI"},
        121: {keyword: "SMP", protocol: "Simple Message Protocol"},
        122: {keyword: "SM (deprecated)", protocol: "Simple Multicast Protocol"},
        123: {keyword: "PTP", protocol: "Performance Transparency Protocol"},
        124: {keyword: "ISIS over IPv4", protocol: ""},
        125: {keyword: "FIRE", protocol: ""},
        126: {keyword: "CRTP", protocol: "Combat Radio Transport Protocol"},
        127: {keyword: "CRUDP", protocol: "Combat Radio User Datagram"},
        128: {keyword: "SSCOPMCE", protocol: ""},
        129: {keyword: "IPLT", protocol: ""},
        130: {keyword: "SPS", protocol: "Secure Packet Shield"},
        131: {keyword: "PIPE", protocol: "Private IP Encapsulation within IP"},
        132: {keyword: "SCTP", protocol: "Stream Control Transmission Protocol"},
        133: {keyword: "FC", protocol: "Fibre Channel"},
        134: {keyword: "RSVP-E2E-IGNORE", protocol: ""},
        135: {keyword: "Mobility Header", protocol: ""},
        136: {keyword: "UDPLite", protocol: ""},
        137: {keyword: "MPLS-in-IP", protocol: ""},
        138: {keyword: "manet", protocol: "MANET Protocols"},
        139: {keyword: "HIP", protocol: "Host Identity Protocol"},
        140: {keyword: "Shim6", protocol: "Shim6 Protocol"},
        141: {keyword: "WESP", protocol: "Wrapped Encapsulating Security Payload"},
        142: {keyword: "ROHC", protocol: "Robust Header Compression"},
        253: {keyword: "", protocol: "Use for experimentation and testing"},
        254: {keyword: "", protocol: "Use for experimentation and testing"},
        255: {keyword: "Reserved", protocol: ""}
    },

};

export default IP;
