/* globals BigInteger, Checksum */

/**
 * Internet Protocol address operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var IP = {

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
        var includeNetworkInfo = args[0],
            enumerateAddresses = args[1],
            allowLargeList = args[2];

        // Check what type of input we are looking at
        var ipv4CidrRegex = /^\s*((?:\d{1,3}\.){3}\d{1,3})\/(\d\d?)\s*$/,
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
        var match,
            output = "";

        if ((match = IP.IPV6_REGEX.exec(input))) {
            var ipv6 = IP._strToIpv6(match[1]),
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
                var serverIpv4  = (ipv6[2] << 16) + ipv6[3],
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

                var v4Addr = IP._ipv4ToStr((ipv6[1] << 16) + ipv6[2]),
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
        var inFormat = args[0],
            outFormat = args[1],
            lines = input.split("\n"),
            output = "",
            j = 0;


        for (var i = 0; i < lines.length; i++) {
            if (lines[i] === "") continue;
            var baIp = [];

            if (inFormat === outFormat) {
                output += lines[i] + "\n";
                continue;
            }

            // Convert to byte array IP from input format
            switch (inFormat) {
                case "Dotted Decimal":
                    var octets = lines[i].split(".");
                    for (j = 0; j < octets.length; j++) {
                        baIp.push(parseInt(octets[j], 10));
                    }
                    break;
                case "Decimal":
                    var decimal = lines[i].toString();
                    baIp.push(decimal >> 24 & 255);
                    baIp.push(decimal >> 16 & 255);
                    baIp.push(decimal >> 8 & 255);
                    baIp.push(decimal & 255);
                    break;
                case "Hex":
                    baIp = Utils.hexToByteArray(lines[i]);
                    break;
                default:
                    throw "Unsupported input IP format";
            }

            // Convert byte array IP to output format
            switch (outFormat) {
                case "Dotted Decimal":
                    var ddIp = "";
                    for (j = 0; j < baIp.length; j++) {
                        ddIp += baIp[j] + ".";
                    }
                    output += ddIp.slice(0, ddIp.length-1) + "\n";
                    break;
                case "Decimal":
                    var decIp = ((baIp[0] << 24) | (baIp[1] << 16) | (baIp[2] << 8) | baIp[3]) >>> 0;
                    output += decIp.toString() + "\n";
                    break;
                case "Hex":
                    var hexIp = "";
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
        var delim = Utils.charRep[args[0]],
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
            networkStr = "";

        if (cidr < 0 || cidr > 127) {
            return "CIDR must be less than 32 for IPv4 or 128 for IPv6";
        }

        // Parse all IPs and add to network dictionary
        for (var i = 0; i < ips.length; i++) {
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

                for (var j = 0; j < 8; j++) {
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
     * @returns {string}
     */
    runParseIPv4Header: function(input, args) {
        var format = args[0],
            output;

        if (format === "Hex") {
            input = Utils.fromHex(input);
        } else if (format === "Raw") {
            input = Utils.strToByteArray(input);
        } else {
            return "Unrecognised input format.";
        }

        var version = (input[0] >>> 4) & 0x0f,
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
            checksumHeader = input.slice(0, 10).concat([0, 0]).concat(input.slice(12, 20));

        // Version
        if (version !== 4) {
            version = version + " (Error: for IPv4 headers, this should always be set to 4)";
        }

        // IHL
        if (ihl < 5) {
            ihl = ihl + " (Error: this should always be at least 5)";
        } else if (ihl > 5) {
            // sort out options...
        }

        // 


        // Check checksum
        var correctChecksum = Checksum.runTCPIP(checksumHeader, []),
            givenChecksum = Utils.hex(checksum),
            checksumResult;
        if (correctChecksum === givenChecksum) {
            checksumResult = givenChecksum + " (correct)";
        } else {
            checksumResult = givenChecksum + " (incorrect, should be " + correctChecksum + ")";
        }

        output = "Version: " + version +
            "\nInternet Header Length (IHL): " + ihl +
            "\nDifferentiated Services Code Point (DSCP): " + dscp +
            "\nECN: " + ecn +
            "\nTotal length: " + length +
            "\nIdentification: " + identification +
            "\nFlags: " + flags +
            "\nFragment offset: " + fragOffset +
            "\nTime-To-Live: " + ttl +
            "\nProtocol: " + protocol +
            "\nHeader checksum: " + checksumResult +
            "\nSource IP address: " + IP._ipv4ToStr(srcIP) +
            "\nDestination IP address: " + IP._ipv4ToStr(dstIP) +
            "\nCorrect checksum: " + Checksum.runTCPIP(checksumHeader, []);


        return output;
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
        var output = "",
            network = IP._strToIpv4(cidr[1]),
            cidrRange = parseInt(cidr[2], 10);

        if (cidrRange < 0 || cidrRange > 31) {
            return "IPv4 CIDR must be less than 32";
        }

        var mask = ~(0xFFFFFFFF >>> cidrRange),
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
        var output = "",
            network = IP._strToIpv6(cidr[1]),
            cidrRange = parseInt(cidr[cidr.length-1], 10);

        if (cidrRange < 0 || cidrRange > 127) {
            return "IPv6 CIDR must be less than 128";
        }

        var mask = IP._genIpv6Mask(cidrRange),
            ip1 = new Array(8),
            ip2 = new Array(8),
            totalDiff = "",
            total = new Array(128);

        for (var i = 0; i < 8; i++) {
            ip1[i] = network[i] & mask[i];
            ip2[i] = ip1[i] | (~mask[i] & 0x0000FFFF);
            totalDiff = (ip2[i] - ip1[i]).toString(2);

            if (totalDiff !== "0") {
                for (var n = 0; n < totalDiff.length; n++) {
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
        var mask = new Array(8),
            shift;

        for (var i = 0; i < 8; i++) {
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
        var output = "",
            ip1 = IP._strToIpv4(range[1]),
            ip2 = IP._strToIpv4(range[2]);

        // Calculate mask
        var diff = ip1 ^ ip2,
            cidr = 32,
            mask = 0;

        while (diff !== 0) {
            diff >>= 1;
            cidr--;
            mask = (mask << 1) | 1;
        }

        mask = ~mask >>> 0;
        var network = ip1 & mask,
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
        var output = "",
            ip1 = IP._strToIpv6(range[1]),
            ip2 = IP._strToIpv6(range[14]);

        var t = "",
            total = new Array(128);

        // Initialise total array to "0"
        for (var i = 0; i < 128; i++)
            total[i] = "0";

        for (i = 0; i < 8; i++) {
            t = (ip2[i] - ip1[i]).toString(2);
            if (t !== "0") {
                for (var n = 0; n < t.length; n++) {
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
        var blocks = ipStr.split("."),
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

            var numBlocks = [];
            for (var i = 0; i < 4; i++) {
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
        var blockA = (ipInt >> 24) & 255,
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
        var blocks = ipStr.split(":"),
            numBlocks = parseBlocks(blocks),
            j = 0,
            ipv6 = new Array(8);

        for (var i = 0; i < 8; i++) {
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
            var numBlocks = [];
            for (var i = 0; i < blocks.length; i++) {
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
        var output = "",
            i = 0;

        if (compact) {
            var start = -1,
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
        var range = [];
        if (endIp >= ip) {
            for (; ip <= endIp; ip++) {
                range.push(IP._ipv4ToStr(ip));
            }
        } else {
            range[0] = "Second IP address smaller than first.";
        }
        return range;
    },

};
