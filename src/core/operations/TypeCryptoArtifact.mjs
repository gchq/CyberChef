/**
 * Attempts to determine the type of cryptocurrency artifact passed in.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023, geco 2019
 * @license MIT
 */

import {b58DoubleSHAChecksum} from "../lib/Bitcoin.mjs";
import { segwitChecksum } from "../lib/Bech32.mjs";
import Operation from "../Operation.mjs";
/**
 * Converts a Public Key to a P2PKH Address of the given type.
 */
class TypeCryptoArtifact extends Operation {
     /**
     * Attempts to Type a Cryptocurrency artifact.
     */
    constructor() {
        super();

        this.name = "Type Cryptocurrency Artifact";
        this.module = "Default";
        this.description = "Attempts to type and return information about a cryptocurrency artifact. ";
        this.inputType = "string";
        this.outputType = "JSON";
        this.presentType = "string";
        this.args = [];
        this.checks = [
            {
                pattern: "^0(3|2)[0-9A-Fa-f]{64}$",
                flags: "",
                args: []
            },
            {
                pattern: "^04[0-9A-Fa-f]{128}$",
                flags: "",
                args: []
            },
            {
                pattern: "^[0-9A-Fa-f]{64}$",
                flags: "",
                args: []
            },
            {
                pattern: "^0x[0-9A-Fa-f]{40}$",
                flags: "",
                args: []
            },
            {
                pattern: "^(X|x|Y|y|Z|z|L|l|T|t)[pub|prv|tbv|tub][A-HJ-NP-Za-km-z1-9]{2,}$",
                flags: "",
                args: []
            },
            {
                pattern: "^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}$",
                flags: "",
                args: []
            },
            {
                pattern: "^5[HJK][a-km-zA-HJ-NP-Z1-9]{49}$",
                flags: "",
                args: []
            },
            {
                pattern: "^5[HJK][a-km-zA-HJ-NP-Z1-9]{49}$",
                flags: "",
                args: []
            },
            {
                pattern: "^[KL][a-km-zA-HJ-NP-Z1-9]{51}$",
                flags: "",
                args: []
            },
            {
                pattern: "^6P[a-km-zA-HJ-NP-Z1-9]{56}$",
                flags: "",
                args: []
            },
            {
                pattern: "^(bc|tb)1q[023456789ac-hj-np-z]{36,}$",
                flags: "",
                args: []
            },
            {
                pattern: "^(bc|tb)1p[023456789ac-hj-np-z]{36,}$",
                flags: "",
                args: []
            }

        ];
    }

    /**
     * Formats the return data to be easier to read.
     * @param {Object} output
     * @returns {string}
     */
    present(output) {
        switch (output.type) {
            case "P2PKH":
                return "Input " + output.value + " is possibly a Bitcoin P2PKH address.\n";
            case "P2SH":
                return "Input " + output.value + " is possibly a P2SH, or P2SH-P2WPKH address.\n";
            case "XPUB":
                return "Input " + output.value + " is possibly an extended public key.\n";
            case "XPRV":
                return "Input " + output.value + " is possibly an extended private key.\n";
            case "compressedWIF":
                return "Input " + output.value + " is possibly a compressed WIF (Wallet-Input-Format) Key.\n";
            case "uncompressedWIF":
                return "Input " + output.value + " is possibly an uncompressed WIF (Wallet-Input-Format) Key.\n";
            case "eth":
                return "Input " + output.value + " is possibly an ethereum address.\n";
            case "bip38":
                return "Input " + output.value + " is possibly a BIP38 encrypted key.\n";
            case "segwit":
                return "Input " + output.value + " is possibly a Segwit address (P2WPKH/P2WSH).\n";
            case "taproot":
                return "Input " + output.value + " is possibly a taproot.\n";
            case "compressed_public":
                return "Input " + output.value + " is possibly a compressed public key in raw bytes.\n";
            case "uncompressed_public":
                return "Input " + output.value + " is possibly an uncompressed public key in raw bytes.\n";
            case "private":
                return "Input " + output.value + " is possibly a private key in raw bytes.\n";
            case "unknownB58":
                return "Input " + output.value + " is a B58 encoded string, but of unknown type.\n";
            case "unknownSegwit":
                return "Input " + output.value + " is a Segwit encoded string, but of unknown type.\n";
            case "error":
                return "Error with input " + output.value + " \n";
            case "blank":
                return "";
        }

    }

     /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Object}
     */
    run(input, args) {
        // We check if input is blank.
        // If its blank or just whitespace, we don't need to bother dealing with it.
        if (input.trim() === "") {
            return {"value": input, "type": "blank"};
        }
        input = input.trim();
        // We check to see if the input is hex or not.
        const hexRe = /^[0-9A-Fa-f]{4,}$/g;
        const inputIsHex = hexRe.test(input);
        if (inputIsHex) {
            const compressedPubkeyRe = /^0(3|2)[0-9A-Fa-f]{64}$/g;
            const uncompressedPubKeyRe = /^04[0-9A-Fa-f]{128}$/g;
            const privateKeyRe = /^[0-9A-Fa-f]{64}$/g;
            if (compressedPubkeyRe.test(input)) {
                return {"value": input, "type": "compressed_public"};
            }
            if (uncompressedPubKeyRe.test(input)) {
                return {"value": input, "type": "uncompressed_public"};
            }
            if (privateKeyRe.test(input)) {
                return {"value": input, "type": "private"};
            }

        } else {
            const ethereumRe = /^0x[0-9A-Fa-f]{40}$/g;
            if (ethereumRe.test(input)) {
                return {"value": input, "type": "eth"};
            }
            const b58Checksum = b58DoubleSHAChecksum(input);

            const sChecksum = segwitChecksum(input);
            if (b58Checksum) {
                const xRe = /^(X|x|Y|y|Z|z|L|l|T|t)[pub|prv|tbv|tub][A-HJ-NP-Za-km-z1-9]{2,}$/g;
                const btcRe = /^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}$/g;
                const wifUncompressedRe = /^5[HJK][a-km-zA-HJ-NP-Z1-9]{49}$/g;
                const wifCompressedRe = /^[KL][a-km-zA-HJ-NP-Z1-9]{51}$/g;
                const bip38Re = /^6P[a-km-zA-HJ-NP-Z1-9]{56}$/g;

                if (xRe.test(input)) {
                    if (input.slice(0, 4).includes("tbv") || input.slice(0, 4).includes("prv")) {
                        return {"value": input, "type": "XPRV"};
                    } else {
                        return {"value": input, "type": "XPUB"};
                    }
                } else if (btcRe.test(input)) {
                    if (input.startsWith("1")) {
                        return {"value": input, "type": "P2PKH"};
                    } else {
                        return {"value": input, "type": "P2SH"};
                    }
                } else if (wifCompressedRe.test(input)) {
                    return {"value": input, "type": "compressedWIF"};
                } else if (wifUncompressedRe.test(input)) {
                    return {"value": input, "type": "uncompressedWIF"};
                } else if (bip38Re.test(input)) {
                    return {"value": input, "type": "bip38"};
                } else {
                    return {"value": input, "type": "unknownB58"};
                }
            }
            if (sChecksum) {
                const oldSegwitRe = /^(bc|tb)1q[023456789ac-hj-np-z]{36,}$/;
                const newSegwitRe = /^(bc|tb)1p[023456789ac-hj-np-z]{36,}$/;

                if (oldSegwitRe.test(input)) {
                    return {"value": input, "type": "segwit"};
                } else if (newSegwitRe.test(input)) {
                    return {"value": input, "type": "taproot"};
                } else {
                    return {"value": input, "type": "unknownSegwit"};
                }
            }
            return {"value": input, "type": "error"};

        }

    }
}

export default TypeCryptoArtifact;
