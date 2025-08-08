/**
 * @author mikecat
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { cryptNotice } from "../lib/Crypt.mjs";
import forge from "node-forge";
import { isWorkerEnvironment } from "../Utils.mjs";
import * as Ed25519 from "@noble/ed25519";
import createEd448 from "ed448-js";

/**
 * Generate EdDSA Key Pair operation
 */
class GenerateEdDSAKeyPair extends Operation {

    /**
     * GenerateEdDSAKeyPair constructor
     */
    constructor() {
        super();

        this.name = "Generate EdDSA Key Pair";
        this.module = "Ciphers";
        this.description = `Generate an EdDSA (Ed25519 and Ed448) key pair.<br><br>${cryptNotice}`;
        this.infoURL = "https://datatracker.ietf.org/doc/html/rfc8032";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Instance",
                "type": "option",
                "value": ["Ed25519", "Ed448"]
            },
            {
                "name": "Output Format",
                "type": "option",
                "value": ["PEM", "JWK", "OpenSSH", "Raw"]
            }
        ];
        // create Ed448 instance later (creating here resulted in errors in bundling)
        this.Ed448 = null;
        this.getRandomBytes = (length) => {
            if (isWorkerEnvironment() && self.crypto) {
                const result = new Uint8Array(length);
                self.crypto.getRandomValues(result);
                return Array.from(result);
            } else {
                const randomStr = forge.random.getBytesSync(length);
                return Array.from(randomStr).map((e) => e.charCodeAt(0));
            }
        };
        this.bytesToHex = (byteArray) => Ed25519.etc.bytesToHex(new Uint8Array(byteArray));
        this.bytesToBase64 = (byteArray) => btoa(byteArray.map((c) => String.fromCharCode(c)).join(""));
        this.bytesToBase64url = (byteArray) => (
            this.bytesToBase64(byteArray).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
        );
        this.insertNewlines = (str, length) => {
            let result = "";
            for (;;) {
                result += str.substring(0, length);
                str = str.substring(length);
                if (str.length > 0) {
                    result += "\n";
                } else {
                    return result;
                }
            }
        };
        this.textEncoder = new TextEncoder();
        this.strToBytes = (str) => Array.from(this.textEncoder.encode(str));
        this.uint32ToBytes = (value) => {
            const arrayBuffer = new ArrayBuffer(4);
            const dataView = new DataView(arrayBuffer);
            dataView.setUint32(0, value);
            return Array.from(new Uint8Array(arrayBuffer));
        };
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const instance = args[0], outputFormat = args[1];
        let privateKey, publicKey, crv, objectIdentifier, opensshKeyType;
        switch (instance) {
            case "Ed448":
                if (!this.Ed448) this.Ed448 = createEd448();
                privateKey = this.getRandomBytes(57);
                publicKey = Array.from(this.Ed448.getPublicKey(new Uint8Array(privateKey)));
                crv = "Ed448";
                objectIdentifier = [1 * 40 + 3, 101, 113];
                opensshKeyType = "ssh-ed448";
                break;
            default: // Ed25519
                privateKey = this.getRandomBytes(32);
                publicKey = Array.from(await Ed25519.getPublicKeyAsync(new Uint8Array(privateKey)));
                crv = "Ed25519";
                objectIdentifier = [1 * 40 + 3, 101, 112];
                opensshKeyType = "ssh-ed25519";
                break;
        }
        switch (outputFormat) {
            case "PEM":
            {
                // assuming data to deal with here is short enough
                const objectIdentifierSequence = [0x30, objectIdentifier.length + 2, 6, objectIdentifier.length].concat(objectIdentifier);
                const privateKeyOctetString = [4, privateKey.length + 2, 4, privateKey.length].concat(privateKey);
                const privateKeySequenceData = [2, 1, 0].concat(objectIdentifierSequence, privateKeyOctetString);
                const privateKeyBytes = [0x30, privateKeySequenceData.length].concat(privateKeySequenceData);
                const publicKeyBitString = [3, publicKey.length + 1, 0].concat(publicKey);
                const publicKeySequenceData = objectIdentifierSequence.concat(publicKeyBitString);
                const publicKeyBytes = [0x30, publicKeySequenceData.length].concat(publicKeySequenceData);
                return (
                    "-----BEGIN PUBLIC KEY-----\n" +
                    this.insertNewlines(this.bytesToBase64(publicKeyBytes), 64) +
                    "\n-----END PUBLIC KEY-----\n\n-----BEGIN PRIVATE KEY-----\n" +
                    this.insertNewlines(this.bytesToBase64(privateKeyBytes), 64) +
                    "\n-----END PRIVATE KEY-----\n"
                );
            }
            case "JWK":
            {
                const publicKeyJWK = {
                    kty: "OKP",
                    crv,
                    x: this.bytesToBase64url(publicKey)
                };
                return JSON.stringify({
                    keys: [
                        {
                            ...publicKeyJWK,
                            d: this.bytesToBase64url(privateKey),
                            key_ops: ["sign"], // eslint-disable-line camelcase
                            kid: "PrivateKey"
                        },
                        {
                            ...publicKeyJWK,
                            key_ops: ["verify"], // eslint-disable-line camelcase
                            kid: "PublicKey"
                        }
                    ]
                }, null, 4);
            }
            case "OpenSSH":
            {
                const comment = "cyberchef";
                const commentBytes = this.strToBytes(comment);
                const encryptMethodBytes = this.strToBytes("none");
                const kdfMethodBytes = this.strToBytes("none");
                const kdfParameterBytes = [];
                const checkValue = this.getRandomBytes(4);
                const keyTypeBytes = this.strToBytes(opensshKeyType);
                const publicKeyBytes = [].concat(
                    this.uint32ToBytes(keyTypeBytes.length),
                    keyTypeBytes,
                    this.uint32ToBytes(publicKey.length),
                    publicKey
                );
                const privateKeyDataBytes = [].concat(
                    checkValue,
                    checkValue,
                    publicKeyBytes,
                    this.uint32ToBytes(privateKey.length + publicKey.length),
                    privateKey,
                    publicKey,
                    this.uint32ToBytes(commentBytes.length),
                    commentBytes
                );
                for (let i = 1; privateKeyDataBytes.length % 8 !== 0; i++) {
                    privateKeyDataBytes.push(i % 256);
                }
                const privateKeyBytes = [].concat(
                    this.strToBytes("openssh-key-v1"),
                    [0],
                    this.uint32ToBytes(encryptMethodBytes.length),
                    encryptMethodBytes,
                    this.uint32ToBytes(kdfMethodBytes.length),
                    kdfMethodBytes,
                    this.uint32ToBytes(kdfParameterBytes.length),
                    kdfParameterBytes,
                    this.uint32ToBytes(1),
                    this.uint32ToBytes(publicKeyBytes.length),
                    publicKeyBytes,
                    this.uint32ToBytes(privateKeyDataBytes.length),
                    privateKeyDataBytes
                );
                return (
                    opensshKeyType + " " + this.bytesToBase64(publicKeyBytes) + " " + comment +
                    "\n\n-----BEGIN OPENSSH PRIVATE KEY-----\n" +
                    this.insertNewlines(this.bytesToBase64(privateKeyBytes), 70) +
                    "\n-----END OPENSSH PRIVATE KEY-----\n"
                );
            }
            default: // Raw
                return this.bytesToHex(new Uint8Array(privateKey.concat(publicKey)));
        }
    }

}

export default GenerateEdDSAKeyPair;
