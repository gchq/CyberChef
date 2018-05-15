import Utils from "../Utils";

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
export function _ipv4CidrRange(cidr, includeNetworkInfo, enumerateAddresses, allowLargeList) {
    const network = _strToIpv4(cidr[1]),
        cidrRange = parseInt(cidr[2], 10);
    let output = "";

    if (cidrRange < 0 || cidrRange > 31) {
        return "IPv4 CIDR must be less than 32";
    }

    const mask = ~(0xFFFFFFFF >>> cidrRange),
        ip1 = network & mask,
        ip2 = ip1 | ~mask;

    if (includeNetworkInfo) {
        output += "Network: " + _ipv4ToStr(network) + "\n";
        output += "CIDR: " + cidrRange + "\n";
        output += "Mask: " + _ipv4ToStr(mask) + "\n";
        output += "Range: " + _ipv4ToStr(ip1) + " - " + _ipv4ToStr(ip2) + "\n";
        output += "Total addresses in range: " + (((ip2 - ip1) >>> 0) + 1) + "\n\n";
    }

    if (enumerateAddresses) {
        if (cidrRange >= 16 || allowLargeList) {
            output += _generateIpv4Range(ip1, ip2).join("\n");
        } else {
            output += _LARGE_RANGE_ERROR;
        }
    }
    return output;
}

    /**
     * Parses an IPv6 CIDR range (e.g. ff00::/48) and displays information about it.
     *
     * @private
     * @param {RegExp} cidr
     * @param {boolean} includeNetworkInfo
     * @returns {string}
     */
export function _ipv6CidrRange(cidr, includeNetworkInfo) {
    let output = "";
    const network = _strToIpv6(cidr[1]),
        cidrRange = parseInt(cidr[cidr.length-1], 10);

    if (cidrRange < 0 || cidrRange > 127) {
        return "IPv6 CIDR must be less than 128";
    }

    const ip1 = new Array(8),
        ip2 = new Array(8),
        total = new Array(128);

    const mask = _genIpv6Mask(cidrRange);
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
        output += "Network: " + _ipv6ToStr(network) + "\n";
        output += "Shorthand: " + _ipv6ToStr(network, true) + "\n";
        output += "CIDR: " + cidrRange + "\n";
        output += "Mask: " + _ipv6ToStr(mask) + "\n";
        output += "Range: " + _ipv6ToStr(ip1) + " - " + _ipv6ToStr(ip2) + "\n";
        output += "Total addresses in range: " + (parseInt(total.join(""), 2) + 1) + "\n\n";
    }

    return output;
}

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
export function _ipv4HyphenatedRange(range, includeNetworkInfo, enumerateAddresses, allowLargeList) {
    const ip1 = _strToIpv4(range[1]),
        ip2 = _strToIpv4(range[2]);

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
        output += "Minimum subnet required to hold this range:\n";
        output += "\tNetwork: " + _ipv4ToStr(network) + "\n";
        output += "\tCIDR: " + cidr + "\n";
        output += "\tMask: " + _ipv4ToStr(mask) + "\n";
        output += "\tSubnet range: " + _ipv4ToStr(subIp1) + " - " + _ipv4ToStr(subIp2) + "\n";
        output += "\tTotal addresses in subnet: " + (((subIp2 - subIp1) >>> 0) + 1) + "\n\n";
        output += "Range: " + _ipv4ToStr(ip1) + " - " + _ipv4ToStr(ip2) + "\n";
        output += "Total addresses in range: " + (((ip2 - ip1) >>> 0) + 1) + "\n\n";
    }

    if (enumerateAddresses) {
        if (((ip2 - ip1) >>> 0) <= 65536 || allowLargeList) {
            output += _generateIpv4Range(ip1, ip2).join("\n");
        } else {
            output += _LARGE_RANGE_ERROR;
        }
    }
    return output;
}


    /**
     * Parses an IPv6 hyphenated range (e.g. ff00:: - ffff::) and displays information about it.
     *
     * @private
     * @param {RegExp} range
     * @param {boolean} includeNetworkInfo
     * @returns {string}
     */
export function _ipv6HyphenatedRange(range, includeNetworkInfo) {
    const ip1 = _strToIpv6(range[1]),
        ip2 = _strToIpv6(range[14]),
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
        output += "Range: " + _ipv6ToStr(ip1) + " - " + _ipv6ToStr(ip2) + "\n";
        output += "Shorthand range: " + _ipv6ToStr(ip1, true) + " - " + _ipv6ToStr(ip2, true) + "\n";
        output += "Total addresses in range: " + (parseInt(total.join(""), 2) + 1) + "\n\n";
    }

    return output;
}

     /**
     * Converts an IPv4 address from string format to numerical format.
     *
     * @private
     * @param {string} ipStr
     * @returns {number}
     *
     * @example
     * // returns 168427520
     * _strToIpv4("10.10.0.0");
     */
export function _strToIpv4(ipStr) {
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
            throw "More than 4 blocks.";

        const numBlocks = [];
        for (let i = 0; i < 4; i++) {
            numBlocks[i] = parseInt(blocks[i], 10);
            if (numBlocks[i] < 0 || numBlocks[i] > 255)
                throw "Block out of range.";
        }
        return numBlocks;
    }
}


    /**
     * Converts an IPv4 address from numerical format to string format.
     *
     * @private
     * @param {number} ipInt
     * @returns {string}
     *
     * @example
     * // returns "10.10.0.0"
     * _ipv4ToStr(168427520);
     */
export function _ipv4ToStr(ipInt) {
    const blockA = (ipInt >> 24) & 255,
        blockB = (ipInt >> 16) & 255,
        blockC = (ipInt >> 8) & 255,
        blockD = ipInt & 255;

    return blockA + "." + blockB + "." + blockC + "." + blockD;
}


    /**
     * Converts an IPv6 address from string format to numerical array format.
     *
     * @private
     * @param {string} ipStr
     * @returns {number[]}
     *
     * @example
     * // returns [65280, 0, 0, 0, 0, 0, 4369, 8738]
     * _strToIpv6("ff00::1111:2222");
     */
export function _strToIpv6(ipStr) {
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
            throw "Badly formatted IPv6 address.";
        const numBlocks = [];
        for (let i = 0; i < blocks.length; i++) {
            numBlocks[i] = parseInt(blocks[i], 16);
            if (numBlocks[i] < 0 || numBlocks[i] > 65535)
                throw "Block out of range.";
        }
        return numBlocks;
    }
}


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
     * _ipv6ToStr([65280, 0, 0, 0, 0, 0, 4369, 8738], true);
     *
     * // returns "ff00:0000:0000:0000:0000:0000:1111:2222"
     * _ipv6ToStr([65280, 0, 0, 0, 0, 0, 4369, 8738], false);
     */
export function _ipv6ToStr(ipv6, compact) {
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
     * @private
     * @param {number} ip
     * @param {number} endIp
     * @returns {string[]}
     *
     * @example
     * // returns ["0.0.0.1", "0.0.0.2", "0.0.0.3"]
     * IP._generateIpv4Range(1, 3);
     */
export function _generateIpv4Range(ip, endIp) {
    const range = [];
    if (endIp >= ip) {
        for (; ip <= endIp; ip++) {
            range.push(_ipv4ToStr(ip));
        }
    } else {
        range[0] = "Second IP address smaller than first.";
    }
    return range;
}

    /**
     * Generates an IPv6 subnet mask given a CIDR value.
     *
     * @private
     * @param {number} cidr
     * @returns {number[]}
     */
export function _genIpv6Mask(cidr) {
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
     * @constant
     * @default
     * @private
     */
const _LARGE_RANGE_ERROR = "The specified range contains more than 65,536 addresses. Running this query could crash your browser. If you want to run it, select the \"Allow large queries\" option. You are advised to turn off \"Auto Bake\" whilst editing large ranges.";
