/**
 * IP resources.
 *
 * @author picapi
 * @author n1474335 [n1474335@gmail.com]
 * @author Klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Parses an IPv4 CIDR range (e.g. 192.168.0.0/24) and displays information about it.
 *
 * @param {RegExp} cidr
 * @param {boolean} includeNetworkInfo
 * @param {boolean} enumerateAddresses
 * @param {boolean} allowLargeList
 * @returns {string}
 */
export function ipv4CidrRange(cidr, includeNetworkInfo, enumerateAddresses, allowLargeList) {
    const network = strToIpv4(cidr[1]),
        cidrRange = parseInt(cidr[2], 10);
    let output = "";

    if (!validateCidr(cidrRange)) {
        throw new OperationError("IPv4 CIDR must be less than 32");
    }

    const mask = ~(0xFFFFFFFF >>> cidrRange),
        ip1 = network & mask,
        ip2 = ip1 | ~mask;

    if (includeNetworkInfo) {
        output += "Network: " + ipv4ToStr(network) + "\n";
        output += "CIDR: " + cidrRange + "\n";
        output += "Mask: " + ipv4ToStr(mask) + "\n";
        output += "Range: " + ipv4ToStr(ip1) + " - " + ipv4ToStr(ip2) + "\n";
        output += "Total addresses in range: " + (((ip2 - ip1) >>> 0) + 1) + "\n\n";
    }

    if (enumerateAddresses) {
        if (cidrRange >= 16 || allowLargeList) {
            output += generateIpv4Range(ip1, ip2).join("\n");
        } else {
            output += _LARGE_RANGE_ERROR;
        }
    }
    return output;
}

/**
 * Parses an IPv6 CIDR range (e.g. ff00::/48) and displays information about it.
 *
 * @param {RegExp} cidr
 * @param {boolean} includeNetworkInfo
 * @returns {string}
 */
export function ipv6CidrRange(cidr, includeNetworkInfo) {
    let output = "";
    const network = strToIpv6(cidr[1]),
        cidrRange = parseInt(cidr[cidr.length-1], 10);

    if (cidrRange < 0 || cidrRange > 127) {
        throw new OperationError("IPv6 CIDR must be less than 128");
    }

    const ip1 = new Array(8),
        ip2 = new Array(8),
        total = new Array(128);

    const mask = genIpv6Mask(cidrRange);
    let totalDiff = "";


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
        output += "Network: " + ipv6ToStr(network) + "\n";
        output += "Shorthand: " + ipv6ToStr(network, true) + "\n";
        output += "CIDR: " + cidrRange + "\n";
        output += "Mask: " + ipv6ToStr(mask) + "\n";
        output += "Range: " + ipv6ToStr(ip1) + " - " + ipv6ToStr(ip2) + "\n";
        output += "Total addresses in range: " + (parseInt(total.join(""), 2) + 1) + "\n\n";
    }

    return output;
}

/**
 * Parses an IPv4 hyphenated range (e.g. 192.168.0.0 - 192.168.0.255) and displays information
 * about it.
 *
 * @param {RegExp} range
 * @param {boolean} includeNetworkInfo
 * @param {boolean} enumerateAddresses
 * @param {boolean} allowLargeList
 * @returns {string}
 */
export function ipv4HyphenatedRange(range, includeNetworkInfo, enumerateAddresses, allowLargeList) {
    const ip1 = strToIpv4(range[0].split("-")[0].trim()),
        ip2 = strToIpv4(range[0].split("-")[1].trim());

    let output = "";

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
    const network = ip1 & mask,
        subIp1 = network & mask,
        subIp2 = subIp1 | ~mask;

    if (includeNetworkInfo) {
        output += `Minimum subnet required to hold this range:
\tNetwork: ${ipv4ToStr(network)}
\tCIDR: ${cidr}
\tMask: ${ipv4ToStr(mask)}
\tSubnet range: ${ipv4ToStr(subIp1)} - ${ipv4ToStr(subIp2)}
\tTotal addresses in subnet: ${(((subIp2 - subIp1) >>> 0) + 1)}

Range: ${ipv4ToStr(ip1)} - ${ipv4ToStr(ip2)}
Total addresses in range: ${(((ip2 - ip1) >>> 0) + 1)}

`;
    }

    if (enumerateAddresses) {
        if (((ip2 - ip1) >>> 0) <= 65536 || allowLargeList) {
            output += generateIpv4Range(ip1, ip2).join("\n");
        } else {
            output += _LARGE_RANGE_ERROR;
        }
    }
    return output;
}

/**
 * Parses an IPv6 hyphenated range (e.g. ff00:: - ffff::) and displays information about it.
 *
 * @param {RegExp} range
 * @param {boolean} includeNetworkInfo
 * @returns {string}
 */
export function ipv6HyphenatedRange(range, includeNetworkInfo) {
    const ip1 = strToIpv6(range[0].split("-")[0].trim()),
        ip2 = strToIpv6(range[0].split("-")[1].trim()),
        total = new Array(128).fill();

    let output = "",
        t = "",
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
        output += "Range: " + ipv6ToStr(ip1) + " - " + ipv6ToStr(ip2) + "\n";
        output += "Shorthand range: " + ipv6ToStr(ip1, true) + " - " + ipv6ToStr(ip2, true) + "\n";
        output += "Total addresses in range: " + (parseInt(total.join(""), 2) + 1) + "\n\n";
    }

    return output;
}

/**
 * Parses an IPv4 subnet mask (e.g. 192.168.0.0/255.255.255.0) and displays information about it.
 *
 * @param {RegExp} match
 * @param {boolean} includeNetworkInfo
 * @param {boolean} enumerateAddresses
 * @param {boolean} allowLargeList
 * @returns {string}
 */
export function ipv4SubnetMask(match, includeNetworkInfo, enumerateAddresses, allowLargeList) {
    const network = strToIpv4(match[1]),
        mask = strToIpv4(match[2]);
    let output = "",
        maskCalculate = mask,
        cidr = 0;

    // Validate the subnet mask
    if (!validateSubnetMask(mask)) {
        throw new OperationError("Invalid subnet mask");
    }

    // Calculate the CIDR
    while (maskCalculate) {
        cidr += maskCalculate & 1;
        maskCalculate >>>= 1;
    }
    if (!validateCidr(cidr)) {
        throw new OperationError("IPv4 CIDR must be less than 32");
    }

    const ip1 = network & mask,
        ip2 = ip1 | ~mask;

    if (includeNetworkInfo) {
        output += "Network: " + ipv4ToStr(network) + "\n";
        output += "CIDR: " + cidr + "\n";
        output += "Mask: " + ipv4ToStr(mask) + "\n";
        output += "Range: " + ipv4ToStr(ip1) + " - " + ipv4ToStr(ip2) + "\n";
        output += "Total addresses in range: " + (((ip2 - ip1) >>> 0) + 1) + "\n\n";
    }

    if (enumerateAddresses) {
        if (cidr >= 16 || allowLargeList) {
            output += generateIpv4Range(ip1, ip2).join("\n");
        } else {
            output += _LARGE_RANGE_ERROR;
        }
    }
    return output;
}

/**
 * Parses a list of IPv4 addresses separated by a new line (\n) and displays information
 * about it.
 *
 * @param {RegExp} list
 * @param {boolean} includeNetworkInfo
 * @param {boolean} enumerateAddresses
 * @param {boolean} allowLargeList
 * @returns {string}
 */
export function ipv4ListedRange(match, includeNetworkInfo, enumerateAddresses, allowLargeList) {

    let ipv4List = match[0].split("\n");
    ipv4List = ipv4List.filter(Boolean);

    const ipv4CidrList = ipv4List.filter(function(a) {
        return a.includes("/");
    });
    const cidrCheck = /^\d\d?$/;
    for (let i = 0; i < ipv4CidrList.length; i++) {
        const network = strToIpv4(ipv4CidrList[i].split("/")[0]);
        const cidr = ipv4CidrList[i].split("/")[1];
        let mask;

        // Check if this is a CIDR or subnet mask
        if (cidrCheck.exec(cidr)) {
            const cidrRange = parseInt(cidr, 10);
            if (!validateCidr(cidrRange)) {
                throw new OperationError("IPv4 CIDR must be less than 32");
            }
            mask = ~(0xFFFFFFFF >>> cidrRange);
        } else {
            mask = strToIpv4(cidr);
            if (!validateSubnetMask(mask)) {
                throw new OperationError("Invalid subnet mask");
            }
        }
        const cidrIp1 = network & mask;
        const cidrIp2 = cidrIp1 | ~mask;
        ipv4List.splice(ipv4List.indexOf(ipv4CidrList[i]), 1);
        ipv4List.push(ipv4ToStr(cidrIp1), ipv4ToStr(cidrIp2));
    }

    ipv4List = ipv4List.sort(ipv4Compare);
    const ip1 = ipv4List[0];
    const ip2 = ipv4List[ipv4List.length - 1];
    const range = [ip1 + " - " + ip2];
    return ipv4HyphenatedRange(range, includeNetworkInfo, enumerateAddresses, allowLargeList);
}

/**
 * Parses a list of IPv6 addresses separated by a new line (\n) and displays information
 * about it.
 *
 * @param {RegExp} list
 * @param {boolean} includeNetworkInfo
 * @returns {string}
 */
export function ipv6ListedRange(match, includeNetworkInfo) {

    let ipv6List = match[0].split("\n");
    ipv6List = ipv6List.filter(function(str) {
        return str.trim();
    });
    for (let i =0; i < ipv6List.length; i++) {
        ipv6List[i] = ipv6List[i].trim();
    }
    const ipv6CidrList = ipv6List.filter(function(a) {
        return a.includes("/");
    });

    for (let i = 0; i < ipv6CidrList.length; i++) {

        const network = strToIpv6(ipv6CidrList[i].split("/")[0]);
        const cidrRange = parseInt(ipv6CidrList[i].split("/")[1], 10);

        if (cidrRange < 0 || cidrRange > 127) {
            throw new OperationError("IPv6 CIDR must be less than 128");
        }

        const cidrIp1 = new Array(8),
            cidrIp2 = new Array(8);

        const mask = genIpv6Mask(cidrRange);

        for (let j = 0; j < 8; j++) {
            cidrIp1[j] = network[j] & mask[j];
            cidrIp2[j] = cidrIp1[j] | (~mask[j] & 0x0000FFFF);
        }
        ipv6List.splice(ipv6List.indexOf(ipv6CidrList[i]), 1);
        ipv6List.push(ipv6ToStr(cidrIp1), ipv6ToStr(cidrIp2));
    }
    ipv6List = ipv6List.sort(ipv6Compare);
    const ip1 = ipv6List[0];
    const ip2 = ipv6List[ipv6List.length - 1];
    const range = [ip1 + " - " + ip2];
    return ipv6HyphenatedRange(range, includeNetworkInfo);
}

/**
 * Converts an IPv4 address from string format to numerical format.
 *
 * @param {string} ipStr
 * @returns {number}
 *
 * @example
 * // returns 168427520
 * strToIpv4("10.10.0.0");
 */
export function strToIpv4(ipStr) {
    const blocks = ipStr.split("."),
        numBlocks = parseBlocks(blocks);
    let result = 0;

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
            throw new OperationError("More than 4 blocks.");

        const numBlocks = [];
        for (let i = 0; i < 4; i++) {
            numBlocks[i] = parseInt(blocks[i], 10);
            if (numBlocks[i] < 0 || numBlocks[i] > 255)
                throw new OperationError("Block out of range.");
        }
        return numBlocks;
    }
}

/**
 * Converts an IPv4 address from numerical format to string format.
 *
 * @param {number} ipInt
 * @returns {string}
 *
 * @example
 * // returns "10.10.0.0"
 * ipv4ToStr(168427520);
 */
export function ipv4ToStr(ipInt) {
    const blockA = (ipInt >> 24) & 255,
        blockB = (ipInt >> 16) & 255,
        blockC = (ipInt >> 8) & 255,
        blockD = ipInt & 255;

    return blockA + "." + blockB + "." + blockC + "." + blockD;
}


/**
 * Converts an IPv6 address from string format to numerical array format.
 *
 * @param {string} ipStr
 * @returns {number[]}
 *
 * @example
 * // returns [65280, 0, 0, 0, 0, 0, 4369, 8738]
 * strToIpv6("ff00::1111:2222");
 */
export function strToIpv6(ipStr) {
    let j = 0;
    const blocks = ipStr.split(":"),
        numBlocks = parseBlocks(blocks),
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
            throw new OperationError("Badly formatted IPv6 address.");
        const numBlocks = [];
        for (let i = 0; i < blocks.length; i++) {
            numBlocks[i] = parseInt(blocks[i], 16);
            if (numBlocks[i] < 0 || numBlocks[i] > 65535)
                throw new OperationError("Block out of range.");
        }
        return numBlocks;
    }
}

/**
 * Converts an IPv6 address from numerical array format to string format.
 *
 * @param {number[]} ipv6
 * @param {boolean} compact - Whether or not to return the address in shorthand or not
 * @returns {string}
 *
 * @example
 * // returns "ff00::1111:2222"
 * ipv6ToStr([65280, 0, 0, 0, 0, 0, 4369, 8738], true);
 *
 * // returns "ff00:0000:0000:0000:0000:0000:1111:2222"
 * ipv6ToStr([65280, 0, 0, 0, 0, 0, 4369, 8738], false);
 */
export function ipv6ToStr(ipv6, compact) {
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
}

/**
 * Generates a list of IPv4 addresses in string format between two given numerical values.
 *
 * @param {number} ip
 * @param {number} endIp
 * @returns {string[]}
 *
 * @example
 * // returns ["0.0.0.1", "0.0.0.2", "0.0.0.3"]
 * IP.generateIpv4Range(1, 3);
 */
export function generateIpv4Range(ip, endIp) {
    const range = [];
    if (endIp >= ip) {
        for (; ip <= endIp; ip++) {
            range.push(ipv4ToStr(ip));
        }
    } else {
        range[0] = "Second IP address smaller than first.";
    }
    return range;
}

/**
 * Generates an IPv6 subnet mask given a CIDR value.
 *
 * @param {number} cidr
 * @returns {number[]}
 */
export function genIpv6Mask(cidr) {
    const mask = new Array(8);
    let shift;

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
}

/**
 * Comparison operation for sorting of IPv4 addresses.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function ipv4Compare(a, b) {
    return strToIpv4(a) - strToIpv4(b);
}

/**
 * Comparison operation for sorting of IPv6 addresses.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function ipv6Compare(a, b) {

    const a_ = strToIpv6(a),
        b_ = strToIpv6(b);

    for (let i = 0; i < a_.length; i++) {
        if (a_[i] !== b_[i]) {
            return a_[i] - b_[i];
        }
    }
    return 0;
}
/**
 * Validates a given subnet mask
 *
 * @param {string} mask
 * @returns {boolean}
 */
export function validateSubnetMask (mask) {
    for (; mask !== 0; mask <<= 1) {
        if ((mask & (1<<31)) === 0) {
            return false;
        }
    }
    return true;
}

/**
 * Validates a given CIDR
 *
 * @param {string} cidr
 * @returns {boolean}
 */
export function validateCidr (cidr) {
    if (cidr < 0 || cidr > 31) {
        return false;
    } else {
        return true;
    }
}

const _LARGE_RANGE_ERROR = "The specified range contains more than 65,536 addresses. Running this query could crash your browser. If you want to run it, select the \"Allow large queries\" option. You are advised to turn off \"Auto Bake\" whilst editing large ranges.";

/**
 * A regular expression that matches an IPv4 address
 */
export const IPV4_REGEX = /^\s*((?:\d{1,3}\.){3}\d{1,3})\s*$/;

/**
 * A regular expression that matches an IPv6 address
 */
export const IPV6_REGEX = /^\s*(((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\4)::|:\b|(?![\dA-F])))|(?!\3\4)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4}))\s*$/i;

/**
 * Lookup table for Internet Protocols.
 * Taken from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml
 */
export const protocolLookup = {
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
};
