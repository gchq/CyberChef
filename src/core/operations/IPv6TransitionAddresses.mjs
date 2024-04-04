/**
 * @author jb30795 [jb30795@proton.me]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * IPv6 Transition Addresses operation
 */
class IPv6TransitionAddresses extends Operation {

    /**
     * IPv6TransitionAddresses constructor
     */
    constructor() {
        super();

        this.name = "IPv6 Transition Addresses";
        this.module = "Default";
        this.description = "Converts IPv4 addresses to their IPv6 Transition addresses. IPv6 Transition addresses can also be converted back into their original IPv4 address. MAC addresses can also be converted into the EUI-64 format, this can them be appended to your IPv6 /64 range to obtain a full /128 address.<br><br>Transition technologies enable translation between IPv4 and IPv6 addresses or tunneling to allow traffic to pass through the incompatible network, allowing the two standards to coexist.";
        this.infoURL = "https://wikipedia.org/wiki/IPv6_transition_mechanism";
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
        const XOR = {"0": "2", "1": "3", "2": "0", "3": "1", "4": "6", "5": "7", "6": "4", "7": "5", "8": "A", "9": "B", "A": "8", "B": "9", "C": "E", "D": "F", "E": "C", "F": "D"};

        /**
	 * Function to convert to hex
	 */
        function hexify(octet) {
            return Number(octet).toString(16).padStart(2, "0");
        }

        /**
	 * Function to convert Hex to Int
	 */
        function intify(hex) {
            return parseInt(hex, 16);
        }

        /**
	 * Function converts IPv4 to IPv6 Transtion address
	 */
        function ipTransition(input) {
            let output = "";
            const HEXIP = input.split(".");

            /**
	     * 6to4
	     */
            output += "6to4: " + "2002:" + hexify(HEXIP[0]) + hexify(HEXIP[1]) + ":" + hexify(HEXIP[2]) + hexify(HEXIP[3]) + "::/48\n";

            /**
	     * Mapped
	     */
            output += "IPv4 Mapped: " + "::ffff:" + hexify(HEXIP[0]) + hexify(HEXIP[1]) + ":" + hexify(HEXIP[2]) + hexify(HEXIP[3]) + "\n";

            /**
	     * Translated
	     */
            output += "IPv4 Translated: " + "::ffff:0:" + hexify(HEXIP[0]) + hexify(HEXIP[1]) + ":" + hexify(HEXIP[2]) + hexify(HEXIP[3]) + "\n";

            /**
	     * Nat64
	     */
            output += "Nat 64: " + "64:ff9b::" + hexify(HEXIP[0]) + hexify(HEXIP[1]) + ":" + hexify(HEXIP[2]) + hexify(HEXIP[3]) + "\n";


            return output;
        }

        /**
	 * Convert MAC to EUI-64
	 */
        function macTransition(input) {
            let output = "";
            const MACPARTS = input.split(":");
            output += "EUI-64 Interface ID: ";
            const MAC = MACPARTS[0] + MACPARTS[1] + ":" + MACPARTS[2] + "ff:fe" + MACPARTS[3] + ":" + MACPARTS[4] + MACPARTS[5];
            output += MAC.slice(0, 1) + XOR[MAC.slice(1, 2).toUpperCase()].toLowerCase() + MAC.slice(2);

            return output;
        }


        /**
	 * Convert IPv6 address to its original IPv4 or MAC address
	 */
        function unTransition(input) {
            let output = "";
            let hextets = "";

            /**
	     * 6to4
	     */
            if (input.startsWith("2002:")) {
                output += "IPv4: " + String(intify(input.slice(5, 7))) + "." + String(intify(input.slice(7, 9)))+ "." + String(intify(input.slice(10, 12)))+ "." + String(intify(input.slice(12, 14)));
            } else if (input.startsWith("::ffff:") || input.startsWith("0000:0000:0000:0000:0000:ffff:") || input.startsWith("::ffff:0000:") || input.startsWith("0000:0000:0000:0000:ffff:0000:") || input.startsWith("64:ff9b::") || input.startsWith("0064:ff9b:0000:0000:0000:0000:")) {
		/**
		 * Mapped/Translated/Nat64
		 */
                hextets = /:([0-9a-z]{1,4}):[0-9a-z]{1,4}$/.exec(input)[1].padStart(4, "0") + /:([0-9a-z]{1,4})$/.exec(input)[1].padStart(4, "0");
                output += "IPv4: " + intify(hextets.slice(-8, -7) +  hextets.slice(-7, -6)) + "." +intify(hextets.slice(-6, -5) +  hextets.slice(-5, -4)) + "." +intify(hextets.slice(-4, -3) +  hextets.slice(-3, -2)) + "." +intify(hextets.slice(-2, -1) +  hextets.slice(-1,));
            } else if (input.slice(-12, -7).toUpperCase() === "FF:FE") {
		/**
		 * EUI-64
		 */
                output += "Mac Address: ";
                const MAC = (input.slice(-19, -17) + ":" + input.slice(-17, -15) + ":" + input.slice(-14, -12) + ":" + input.slice(-7, -5) + ":" + input.slice(-4, -2) + ":" + input.slice(-2,)).toUpperCase();
                output += MAC.slice(0, 1) + XOR[MAC.slice(1, 2)] + MAC.slice(2);
            }

            return output;
        }


        /**
	 * Main
	 */
        let output = "";
        if (/^[0-9]{1,3}(?:\.[0-9]{1,3}){3}$/.test(input)) {
            output = ipTransition(input);
        } else if (/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(input.toUpperCase())) {
            output = macTransition(input.toLowerCase());
        } else if (/^((?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(input)) {
            output = unTransition(input);
        } else {
            output = "Enter a compressed or expanded IPv6 address, IPv4 address or MAC Address.";
        }


        return output;
    }

}

export default IPv6TransitionAddresses;
