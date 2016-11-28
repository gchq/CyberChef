/* globals BigInteger */

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
    run_parse_ip_range: function (input, args) {
        var include_network_info = args[0],
            enumerate_addresses = args[1],
            allow_large_list = args[2];
        
        // Check what type of input we are looking at
        var ipv4_cidr_regex = /^\s*((?:\d{1,3}\.){3}\d{1,3})\/(\d\d?)\s*$/,
            ipv4_range_regex = /^\s*((?:\d{1,3}\.){3}\d{1,3})\s*-\s*((?:\d{1,3}\.){3}\d{1,3})\s*$/,
            ipv6_cidr_regex = /^\s*(((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\4)::|:\b|(?![\dA-F])))|(?!\3\4)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\/(\d\d?\d?)\s*$/i,
            ipv6_range_regex = /^\s*(((?=.*::)(?!.*::[^-]+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\4)::|:\b|(?![\dA-F])))|(?!\3\4)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\s*-\s*(((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\17)::|:\b|(?![\dA-F])))|(?!\16\17)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\s*$/i,
            match;
        
        if (!!(match = ipv4_cidr_regex.exec(input))) {
            return IP._ipv4_cidr_range(match, include_network_info, enumerate_addresses, allow_large_list);
        } else if (!!(match = ipv4_range_regex.exec(input))) {
            return IP._ipv4_hyphenated_range(match, include_network_info, enumerate_addresses, allow_large_list);
        } else if (!!(match = ipv6_cidr_regex.exec(input))) {
            return IP._ipv6_cidr_range(match, include_network_info);
        } else if (!!(match = ipv6_range_regex.exec(input))) {
            return IP._ipv6_hyphenated_range(match, include_network_info);
        } else {
            return "Invalid input.\n\nEnter either a CIDR range (e.g. 10.0.0.0/24) or a hyphenated range (e.g. 10.0.0.0 - 10.0.1.0). IPv6 also supported.";
        }
    },
    
    
    /**
     * @constant
     * @default
     */
    IPv4_REGEX: /^\s*((?:\d{1,3}\.){3}\d{1,3})\s*$/,
    /**
     * @constant
     * @default
     */
    IPv6_REGEX: /^\s*(((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\4)::|:\b|(?![\dA-F])))|(?!\3\4)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\s*$/i,
    
    /**
     * Parse IPv6 address operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_parse_ipv6: function (input, args) {
        var match,
            output = "";
        
        if (!!(match = IP.IPv6_REGEX.exec(input))) {
            var ipv6 = IP._str_to_ipv6(match[1]),
                longhand = IP._ipv6_to_str(ipv6),
                shorthand = IP._ipv6_to_str(ipv6, true);
                
            output += "Longhand:  " + longhand + "\nShorthand: " + shorthand + "\n";
            
            // Detect reserved addresses
            if (shorthand == "::") {
                // Unspecified address
                output += "\nUnspecified address corresponding to 0.0.0.0/32 in IPv4.";
                output += "\nUnspecified address range: ::/128";
            } else if (shorthand == "::1") {
                // Loopback address
                output += "\nLoopback address to the local host corresponding to 127.0.0.1/8 in IPv4.";
                output += "\nLoopback addresses range: ::1/128";
            } else if (ipv6[0] === 0 && ipv6[1] === 0 && ipv6[2] === 0 &&
                ipv6[3] === 0 && ipv6[4] === 0 && ipv6[5] === 0xffff) {
                // IPv4-mapped IPv6 address
                output += "\nIPv4-mapped IPv6 address detected. IPv6 clients will be handled natively by default, and IPv4 clients appear as IPv6 clients at their IPv4-mapped IPv6 address.";
                output += "\nMapped IPv4 address: " + IP._ipv4_to_str((ipv6[6] << 16) + ipv6[7]);
                output += "\nIPv4-mapped IPv6 addresses range: ::ffff:0:0/96";
            } else if (ipv6[0] === 0 && ipv6[1] === 0 && ipv6[2] === 0 &&
                ipv6[3] === 0 && ipv6[4] === 0xffff && ipv6[5] === 0) {
                // IPv4-translated address
                output += "\nIPv4-translated address detected. Used by Stateless IP/ICMP Translation (SIIT). See RFCs 6145 and 6052 for more details.";
                output += "\nTranslated IPv4 address: " + IP._ipv4_to_str((ipv6[6] << 16) + ipv6[7]);
                output += "\nIPv4-translated addresses range: ::ffff:0:0:0/96";
            } else if (ipv6[0] === 0x100) {
                // Discard prefix per RFC 6666
                output += "\nDiscard prefix detected. This is used when forwarding traffic to a sinkhole router to mitigate the effects of a denial-of-service attack. See RFC 6666 for more details.";
                output += "\nDiscard range: 100::/64";
            } else if (ipv6[0] === 0x64 && ipv6[1] === 0xff9b && ipv6[2] === 0 &&
                ipv6[3] === 0 && ipv6[4] === 0 && ipv6[5] === 0) {
                // IPv4/IPv6 translation per RFC 6052
                output += "\n'Well-Known' prefix for IPv4/IPv6 translation detected. See RFC 6052 for more details.";
                output += "\nTranslated IPv4 address: " + IP._ipv4_to_str((ipv6[6] << 16) + ipv6[7]);
                output += "\n'Well-Known prefix range: 64:ff9b::/96";
            } else if (ipv6[0] === 0x2001 && ipv6[1] === 0) {
                // Teredo tunneling
                output += "\nTeredo tunneling IPv6 address detected\n";
                var server_ipv4  = (ipv6[2] << 16) + ipv6[3],
                    udp_port     = (~ipv6[5]) & 0xffff,
                    client_ipv4  = ~((ipv6[6] << 16) + ipv6[7]),
                    flag_cone    = (ipv6[4] >>> 15) & 1,
                    flag_r       = (ipv6[4] >>> 14) & 1,
                    flag_random1 = (ipv6[4] >>> 10) & 15,
                    flag_ug      = (ipv6[4] >>> 8) & 3,
                    flag_random2 = ipv6[4] & 255;
                
                output += "\nServer IPv4 address: " + IP._ipv4_to_str(server_ipv4) +
                    "\nClient IPv4 address: " + IP._ipv4_to_str(client_ipv4) +
                    "\nClient UDP port:     " + udp_port +
                    "\nFlags:" +
                    "\n\tCone:    " + flag_cone;
                    
                if (flag_cone) {
                    output += " (Client is behind a cone NAT)";
                } else {
                    output += " (Client is not behind a cone NAT)";
                }
                
                output += "\n\tR:       " + flag_r;
                
                if (flag_r) {
                    output += " Error: This flag should be set to 0. See RFC 5991 and RFC 4380.";
                }
                    
                output += "\n\tRandom1: " + Utils.bin(flag_random1, 4) +
                    "\n\tUG:      " + Utils.bin(flag_ug, 2);
                        
                if (flag_ug) {
                    output += " Error: This flag should be set to 00. See RFC 4380.";
                }
                    
                output += "\n\tRandom2: " + Utils.bin(flag_random2, 8);
                
                if (!flag_r && !flag_ug && flag_random1 && flag_random2) {
                    output += "\n\nThis is a valid Teredo address which complies with RFC 4380 and RFC 5991.";
                } else if (!flag_r && !flag_ug) {
                    output += "\n\nThis is a valid Teredo address which complies with RFC 4380, however it does not comply with RFC 5991 (Teredo Security Updates) as there are no randomised bits in the flag field.";
                } else {
                    output += "\n\nThis is an invalid Teredo address.";
                }
                output += "\n\nTeredo prefix range: 2001::/32";
            } else if (ipv6[0] === 0x2001 && ipv6[1] === 0x2 && ipv6[2] === 0) {
                // Benchmarking
                output += "\nAssigned to the Benchmarking Methodology Working Group (BMWG) for benchmarking IPv6. Corresponds to 198.18.0.0/15 for benchmarking IPv4. See RFC 5180 for more details.";
                output += "\nBMWG range: 2001:2::/48";
            } else if (ipv6[0] == 0x2001 && ipv6[1] >= 0x10 && ipv6[1] <= 0x1f) {
                // ORCHIDv1
                output += "\nDeprecated, previously ORCHIDv1 (Overlay Routable Cryptographic Hash Identifiers).\nORCHIDv1 range: 2001:10::/28\nORCHIDv2 now uses 2001:20::/28.";
            } else if (ipv6[0] == 0x2001 && ipv6[1] >= 0x20 && ipv6[1] <= 0x2f) {
                // ORCHIDv2
                output += "\nORCHIDv2 (Overlay Routable Cryptographic Hash Identifiers).\nThese are non-routed IPv6 addresses used for Cryptographic Hash Identifiers.";
                output += "\nORCHIDv2 range: 2001:20::/28";
            } else if (ipv6[0] == 0x2001 && ipv6[1] == 0xdb8) {
                // Documentation
                output += "\nThis is a documentation IPv6 address. This range should be used whenever an example IPv6 address is given or to model networking scenarios. Corresponds to 192.0.2.0/24, 198.51.100.0/24, and 203.0.113.0/24 in IPv4.";
                output += "\nDocumentation range: 2001:db8::/32";
            } else if (ipv6[0] == 0x2002) {
                // 6to4
                output += "\n6to4 transition IPv6 address detected. See RFC 3056 for more details." +
                    "\n6to4 prefix range: 2002::/16";
                
                var v4_addr = IP._ipv4_to_str((ipv6[1] << 16) + ipv6[2]),
                    sla_id = ipv6[3],
                    interface_id_str = ipv6[4].toString(16) + ipv6[5].toString(16) + ipv6[6].toString(16) + ipv6[7].toString(16),
                    interface_id = new BigInteger(interface_id_str, 16);
                
                output += "\n\nEncapsulated IPv4 address: " + v4_addr +
                    "\nSLA ID: " + sla_id +
                    "\nInterface ID (base 16): " + interface_id_str +
                    "\nInterface ID (base 10): " + interface_id.toString();
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
    run_change_ip_format: function(input, args) {
        var in_format  = args[0],
            out_format = args[1],
            lines = input.split("\n"),
            output = "",
            j = 0;
            
        
        for (var i = 0; i < lines.length; i++) {
            if (lines[i] === "") continue;
            var ba_ip = [];
            
            if (in_format == out_format) {
                output += lines[i] + "\n";
                continue;
            }
            
            // Convert to byte array IP from input format
            switch (in_format) {
                case "Dotted Decimal":
                    var octets = lines[i].split(".");
                    for (j = 0; j < octets.length; j++) {
                        ba_ip.push(parseInt(octets[j], 10));
                    }
                    break;
                case "Decimal":
                    var decimal = lines[i].toString();
                    ba_ip.push(decimal >> 24 & 255);
                    ba_ip.push(decimal >> 16 & 255);
                    ba_ip.push(decimal >> 8 & 255);
                    ba_ip.push(decimal & 255);
                    break;
                case "Hex":
                    ba_ip = Utils.hex_to_byte_array(lines[i]);
                    break;
                default:
                    throw "Unsupported input IP format";
            }
            
            // Convert byte array IP to output format
            switch (out_format) {
                case "Dotted Decimal":
                    var dd_ip = "";
                    for (j = 0; j < ba_ip.length; j++) {
                        dd_ip += ba_ip[j] + ".";
                    }
                    output += dd_ip.slice(0, dd_ip.length-1) + "\n";
                    break;
                case "Decimal":
                    var dec_ip = ((ba_ip[0] << 24) | (ba_ip[1] << 16) | (ba_ip[2] << 8) | ba_ip[3]) >>> 0;
                    output += dec_ip.toString() + "\n";
                    break;
                case "Hex":
                    var hex_ip = "";
                    for (j = 0; j < ba_ip.length; j++) {
                        hex_ip += Utils.hex(ba_ip[j]);
                    }
                    output += hex_ip + "\n";
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
    run_group_ips: function(input, args) {
        var delim = Utils.char_rep[args[0]],
            cidr = args[1],
            only_subnets = args[2],
            ipv4_mask = cidr < 32 ? ~(0xFFFFFFFF >>> cidr) : 0xFFFFFFFF,
            ipv6_mask = IP._gen_ipv6_mask(cidr),
            ips = input.split(delim),
            ipv4_networks = {},
            ipv6_networks = {},
            match = null,
            output = "",
            ip = null,
            network = null,
            network_str = "";
            
        if (cidr < 0 || cidr > 127) {
            return "CIDR must be less than 32 for IPv4 or 128 for IPv6";
        }
            
        // Parse all IPs and add to network dictionary
        for (var i = 0; i < ips.length; i++) {
            if (!!(match = IP.IPv4_REGEX.exec(ips[i]))) {
                ip = IP._str_to_ipv4(match[1]) >>> 0;
                network = ip & ipv4_mask;
                
                if (ipv4_networks.hasOwnProperty(network)) {
                    ipv4_networks[network].push(ip);
                } else {
                    ipv4_networks[network] = [ip];
                }
            } else if (!!(match = IP.IPv6_REGEX.exec(ips[i]))) {
                ip = IP._str_to_ipv6(match[1]);
                network = [];
                network_str = "";
                
                for (var j = 0; j < 8; j++) {
                    network.push(ip[j] & ipv6_mask[j]);
                }
                
                network_str = IP._ipv6_to_str(network, true);
                
                if (ipv6_networks.hasOwnProperty(network_str)) {
                    ipv6_networks[network_str].push(ip);
                } else {
                    ipv6_networks[network_str] = [ip];
                }
            }
        }
        
        // Sort IPv4 network dictionaries and print
        for (network in ipv4_networks) {
            ipv4_networks[network] = ipv4_networks[network].sort();
            
            output += IP._ipv4_to_str(network) + "/" + cidr + "\n";
            
            if (!only_subnets) {
                for (i = 0; i < ipv4_networks[network].length; i++) {
                    output += "  " + IP._ipv4_to_str(ipv4_networks[network][i]) + "\n";
                }
                output += "\n";
            }
        }
        
        // Sort IPv6 network dictionaries and print
        for (network_str in ipv6_networks) {
            //ipv6_networks[network_str] = ipv6_networks[network_str].sort();  TODO
            
            output += network_str + "/" + cidr + "\n";
            
            if (!only_subnets) {
                for (i = 0; i < ipv6_networks[network_str].length; i++) {
                    output += "  " + IP._ipv6_to_str(ipv6_networks[network_str][i], true) + "\n";
                }
                output += "\n";
            }
        }

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
     * @param {boolean} include_network_info
     * @param {boolean} enumerate_addresses
     * @param {boolean} allow_large_list
     * @returns {string}
     */
    _ipv4_cidr_range: function(cidr, include_network_info, enumerate_addresses, allow_large_list) {
        var output = "",
            network = IP._str_to_ipv4(cidr[1]),
            cidr_range = parseInt(cidr[2], 10);
            
        if (cidr_range < 0 || cidr_range > 31) {
            return "IPv4 CIDR must be less than 32";
        }
        
        var mask = ~(0xFFFFFFFF >>> cidr_range),
            ip1 = network & mask,
            ip2 = ip1 | ~mask;
        
        if (include_network_info) {
            output += "Network: " + IP._ipv4_to_str(network) + "\n";
            output += "CIDR: " + cidr_range + "\n";
            output += "Mask: " + IP._ipv4_to_str(mask) + "\n";
            output += "Range: " + IP._ipv4_to_str(ip1) + " - " + IP._ipv4_to_str(ip2) + "\n";
            output += "Total addresses in range: " + (((ip2 - ip1) >>> 0) + 1) + "\n\n";
        }
        
        if (enumerate_addresses) {
            if (cidr_range >= 16 || allow_large_list) {
                output += IP._generate_ipv4_range(ip1, ip2).join("\n");
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
     * @param {boolean} include_network_info
     * @returns {string}
     */
    _ipv6_cidr_range: function(cidr, include_network_info) {
        var output = "",
            network = IP._str_to_ipv6(cidr[1]),
            cidr_range = parseInt(cidr[cidr.length-1], 10);
            
        if (cidr_range < 0 || cidr_range > 127) {
            return "IPv6 CIDR must be less than 128";
        }
        
        var mask = IP._gen_ipv6_mask(cidr_range),
            ip1 = new Array(8),
            ip2 = new Array(8),
            total_diff = "",
            total = new Array(128);
            
        for (var i = 0; i < 8; i++) {
            ip1[i] = network[i] & mask[i];
            ip2[i] = ip1[i] | (~mask[i] & 0x0000FFFF);
            total_diff = (ip2[i] - ip1[i]).toString(2);
            
            if (total_diff != "0") {
                for (var n = 0; n < total_diff.length; n++) {
                    total[i*16 + 16-(total_diff.length-n)] = total_diff[n];
                }
            }
        }

        if (include_network_info) {
            output += "Network: " + IP._ipv6_to_str(network) + "\n";
            output += "Shorthand: " + IP._ipv6_to_str(network, true) + "\n";
            output += "CIDR: " + cidr_range + "\n";
            output += "Mask: " + IP._ipv6_to_str(mask) + "\n";
            output += "Range: " + IP._ipv6_to_str(ip1) + " - " + IP._ipv6_to_str(ip2) + "\n";
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
    _gen_ipv6_mask: function(cidr) {
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
     * @param {boolean} include_network_info
     * @param {boolean} enumerate_addresses
     * @param {boolean} allow_large_list
     * @returns {string}
     */
    _ipv4_hyphenated_range: function(range, include_network_info, enumerate_addresses, allow_large_list) {
        var output = "",
            ip1 = IP._str_to_ipv4(range[1]),
            ip2 = IP._str_to_ipv4(range[2]);
        
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
            sub_ip1 = network & mask,
            sub_ip2 = sub_ip1 | ~mask;
        
        if (include_network_info) {
            output += "Minimum subnet required to hold this range:\n";
            output += "\tNetwork: " + IP._ipv4_to_str(network) + "\n";
            output += "\tCIDR: " + cidr + "\n";
            output += "\tMask: " + IP._ipv4_to_str(mask) + "\n";
            output += "\tSubnet range: " + IP._ipv4_to_str(sub_ip1) + " - " + IP._ipv4_to_str(sub_ip2) + "\n";
            output += "\tTotal addresses in subnet: " + (((sub_ip2 - sub_ip1) >>> 0) + 1) + "\n\n";
            output += "Range: " + IP._ipv4_to_str(ip1) + " - " + IP._ipv4_to_str(ip2) + "\n";
            output += "Total addresses in range: " + (((ip2 - ip1) >>> 0) + 1) + "\n\n";
        }
        
        if (enumerate_addresses) {
            if (((ip2 - ip1) >>> 0) <= 65536 || allow_large_list) {
                output += IP._generate_ipv4_range(ip1, ip2).join("\n");
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
     * @param {boolean} include_network_info
     * @returns {string}
     */
    _ipv6_hyphenated_range: function(range, include_network_info) {
        var output = "",
            ip1 = IP._str_to_ipv6(range[1]),
            ip2 = IP._str_to_ipv6(range[14]);
        
        var t = "",
            total = new Array(128);
            
        // Initialise total array to "0"
        for (var i = 0; i < 128; i++)
            total[i] = "0";
        
        for (i = 0; i < 8; i++) {
            t = (ip2[i] - ip1[i]).toString(2);
            if (t != "0") {
                for (var n = 0; n < t.length; n++) {
                    total[i*16 + 16-(t.length-n)] = t[n];
                }
            }
        }
        
        if (include_network_info) {
            output += "Range: " + IP._ipv6_to_str(ip1) + " - " + IP._ipv6_to_str(ip2) + "\n";
            output += "Shorthand range: " + IP._ipv6_to_str(ip1, true) + " - " + IP._ipv6_to_str(ip2, true) + "\n";
            output += "Total addresses in range: " + (parseInt(total.join(""), 2) + 1) + "\n\n";
        }
        
        return output;
    },
    
    
    /**
     * Converts an IPv4 address from string format to numerical format.
     *
     * @private
     * @param {string} ip_str
     * @returns {number}
     *
     * @example
     * // returns 168427520
     * IP._str_to_ipv4("10.10.0.0");
     */
    _str_to_ipv4: function (ip_str) {
        var blocks = ip_str.split("."),
            num_blocks = parse_blocks(blocks),
            result = 0;
            
        result += num_blocks[0] << 24;
        result += num_blocks[1] << 16;
        result += num_blocks[2] << 8;
        result += num_blocks[3];
        
        return result;
        
        function parse_blocks(blocks) {
            if (blocks.length != 4)
                throw "More than 4 blocks.";
                
            var num_blocks = [];
            for (var i = 0; i < 4; i++) {
                num_blocks[i] = parseInt(blocks[i], 10);
                if (num_blocks[i] < 0 || num_blocks[i] > 255)
                    throw "Block out of range.";
            }
            return num_blocks;
        }
    },
    
    
    /**
     * Converts an IPv4 address from numerical format to string format.
     *
     * @private
     * @param {number} ip_int
     * @returns {string}
     *
     * @example
     * // returns "10.10.0.0"
     * IP._ipv4_to_str(168427520);
     */
    _ipv4_to_str: function(ip_int) {
        var blockA = (ip_int >> 24) & 255,
            blockB = (ip_int >> 16) & 255,
            blockC = (ip_int >> 8) & 255,
            blockD = ip_int & 255;
        
        return blockA + "." + blockB + "." + blockC + "." + blockD;
    },
    
    
    /**
     * Converts an IPv6 address from string format to numerical array format.
     *
     * @private
     * @param {string} ip_str
     * @returns {number[]}
     *
     * @example
     * // returns [65280, 0, 0, 0, 0, 0, 4369, 8738]
     * IP._str_to_ipv6("ff00::1111:2222");
     */
    _str_to_ipv6: function(ip_str) {
        var blocks = ip_str.split(":"),
            num_blocks = parse_blocks(blocks),
            j = 0,
            ipv6 = new Array(8);
        
        for (var i = 0; i < 8; i++) {
            if (isNaN(num_blocks[j])) {
                ipv6[i] = 0;
                if (i == (8-num_blocks.slice(j).length)) j++;
            } else {
                ipv6[i] = num_blocks[j];
                j++;
            }
        }
        return ipv6;
        
        function parse_blocks(blocks) {
            if (blocks.length < 3 || blocks.length > 8)
                throw "Badly formatted IPv6 address.";
            var num_blocks = [];
            for (var i = 0; i < blocks.length; i++) {
                num_blocks[i] = parseInt(blocks[i], 16);
                if (num_blocks[i] < 0 || num_blocks[i] > 65535)
                    throw "Block out of range.";
            }
            return num_blocks;
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
     * IP._ipv6_to_str([65280, 0, 0, 0, 0, 0, 4369, 8738], true);
     *
     * // returns "ff00:0000:0000:0000:0000:0000:1111:2222"
     * IP._ipv6_to_str([65280, 0, 0, 0, 0, 0, 4369, 8738], false);
     */
    _ipv6_to_str: function(ipv6, compact) {
        var output = "",
            skips = 0,
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
                if (i != start) {
                    output += Utils.hex(ipv6[i],1) + ":";
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
                output += Utils.hex(ipv6[i],4) + ":";
            }
        }
        return output.slice(0,output.length-1);
    },
    
    
    /**
     * Generates a list of IPv4 addresses in string format between two given numerical values.
     *
     * @private
     * @param {number} ip
     * @param {number} end_ip
     * @returns {string[]}
     *
     * @example
     * // returns ["0.0.0.1", "0.0.0.2", "0.0.0.3"]
     * IP._generate_ipv4_range(1, 3);
     */
    _generate_ipv4_range: function(ip, end_ip) {
        var range = [];
        if (end_ip >= ip) {
            for (; ip <= end_ip; ip++) {
                range.push(IP._ipv4_to_str(ip));
            }
        } else {
            range[0] = "Second IP address smaller than first.";
        }
        return range;
    },

};
