/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import OperationError from "../errors/OperationError";
import {IP_DELIM_OPTIONS} from "../lib/Delim";
import {ipv6ToStr, genIpv6Mask, IPV4_REGEX, strToIpv6,  ipv4ToStr, IPV6_REGEX, strToIpv4} from "../lib/IP";

/**
 * Group IP addresses operation
 */
class GroupIPAddresses extends Operation {

    /**
     * GroupIPAddresses constructor
     */
    constructor() {
        super();

        this.name = "Group IP addresses";
        this.module = "JSBN";
        this.description = "Groups a list of IP addresses into subnets. Supports both IPv4 and IPv6 addresses.";
        this.infoURL = "https://wikipedia.org/wiki/Subnetwork";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": IP_DELIM_OPTIONS
            },
            {
                "name": "Subnet (CIDR)",
                "type": "number",
                "value": 24
            },
            {
                "name": "Only show the subnets",
                "type": "boolean",
                "value": false,
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]),
            cidr = args[1],
            onlySubnets = args[2],
            ipv4Mask = cidr < 32 ? ~(0xFFFFFFFF >>> cidr) : 0xFFFFFFFF,
            ipv6Mask = genIpv6Mask(cidr),
            ips = input.split(delim),
            ipv4Networks = {},
            ipv6Networks = {};
        let match = null,
            output = "",
            ip = null,
            network = null,
            networkStr = "",
            i;

        if (cidr < 0 || cidr > 127) {
            throw new OperationError("CIDR must be less than 32 for IPv4 or 128 for IPv6");
        }

        // Parse all IPs and add to network dictionary
        for (i = 0; i < ips.length; i++) {
            if ((match = IPV4_REGEX.exec(ips[i]))) {
                ip = strToIpv4(match[1]) >>> 0;
                network = ip & ipv4Mask;

                if (ipv4Networks.hasOwnProperty(network)) {
                    ipv4Networks[network].push(ip);
                } else {
                    ipv4Networks[network] = [ip];
                }
            } else if ((match = IPV6_REGEX.exec(ips[i]))) {
                ip = strToIpv6(match[1]);
                network = [];
                networkStr = "";

                for (let j = 0; j < 8; j++) {
                    network.push(ip[j] & ipv6Mask[j]);
                }

                networkStr = ipv6ToStr(network, true);

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

            output += ipv4ToStr(network) + "/" + cidr + "\n";

            if (!onlySubnets) {
                for (i = 0; i < ipv4Networks[network].length; i++) {
                    output += "  " + ipv4ToStr(ipv4Networks[network][i]) + "\n";
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
                    output += "  " + ipv6ToStr(ipv6Networks[networkStr][i], true) + "\n";
                }
                output += "\n";
            }
        }

        return output;
    }

}

export default GroupIPAddresses;
