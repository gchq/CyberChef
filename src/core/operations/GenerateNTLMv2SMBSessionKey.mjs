/**
 * @author mansiverma897993
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import CryptoApi from "crypto-api/src/crypto-api.mjs";
import CryptoJS from "crypto-js";
import {runHash} from "../lib/Hash.mjs";

/**
 * Converts a string to a UTF-16LE binary string.
 *
 * @param {string} str
 * @returns {string}
 */
function toUtf16LE(str) {
    let out = "";
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        out += String.fromCharCode(code & 0xff) + String.fromCharCode((code >> 8) & 0xff);
    }
    return out;
}

/**
 * Calculates the NT Hash (MD4 of UTF-16LE representation) of a password.
 *
 * @param {string} password
 * @returns {string} Hex encoded NT Hash
 */
function calculateNTHash(password) {
    const buf = new ArrayBuffer(password.length * 2);
    const bufView = new Uint16Array(buf);
    for (let i = 0; i < password.length; i++) {
        bufView[i] = password.charCodeAt(i);
    }
    return runHash("md4", buf);
}

/**
 * Generate NTLMv2 SMB Session Key operation
 */
class GenerateNTLMv2SMBSessionKey extends Operation {

    /**
     * GenerateNTLMv2SMBSessionKey constructor
     */
    constructor() {
        super();

        this.name = "Generate NTLMv2 SMB Session Key";
        this.module = "Crypto";
        this.description = "Calculates the NTLMv2 ResponseKeyNT, SessionBaseKey (KeyExchangeKey) and decrypts the random session key/exported session key to generate the final SMB session key for Wireshark decryption.<br><br>Pass either a full NTLMv2 hash line (e.g. from responder/hashcat) as the input, or use the individual fields in the arguments.<br><br>If no Encrypted Session Key is provided, the SessionBaseKey itself will be returned as the final session key.";
        this.infoURL = "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/c0250a97-2940-40c7-82fb-20d208c71e96";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Username",
                "type": "string",
                "value": ""
            },
            {
                "name": "Domain",
                "type": "string",
                "value": ""
            },
            {
                "name": "Password / NT Hash",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex (NT Hash)", "UTF8 (Plaintext)"]
            },
            {
                "name": "NTProofStr",
                "type": "string",
                "value": ""
            },
            {
                "name": "Encrypted Session Key",
                "type": "string",
                "value": ""
            },
            {
                "name": "Session ID",
                "type": "string",
                "value": ""
            },
            {
                "name": "Output Format",
                "type": "option",
                "value": [
                    "Raw Session Key",
                    "Wireshark UAT line (SessionID,SessionKey)",
                    "TShark Command Line Option",
                    "JSON",
                    "Detailed Text"
                ]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const cleanHex = (val) => {
            if (!val) return "";
            return val.trim().replace(/^0x/i, "").replace(/[\s:]/g, "");
        };

        let username = "";
        let domain = "";
        let ntProofStr = "";
        let encryptedSessionKey = "";
        let sessionId = "";

        // 1. Attempt to parse main input first
        if (input && input.trim()) {
            const lines = input.trim().split(/\r?\n/);
            const firstLine = lines[0].trim();
            if (firstLine.includes("::") && firstLine.split(":").length >= 5) {
                const parts = firstLine.split(":");
                username = parts[0];
                domain = parts[2];
                ntProofStr = parts[4];
            } else {
                for (const line of lines) {
                    const colonIdx = line.indexOf(":");
                    if (colonIdx > 0) {
                        const key = line.substring(0, colonIdx).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                        const val = line.substring(colonIdx + 1).trim();
                        if (key === "username" || key === "user") username = val;
                        else if (key === "domain" || key === "workgroup") domain = val;
                        else if (key === "ntproofstr" || key === "ntproof") ntProofStr = val;
                        else if (key === "encryptedsessionkey" || key === "sessionkeyencrypted" || key === "encsessionkey") encryptedSessionKey = val;
                        else if (key === "sessionid" || key === "id") sessionId = val;
                    }
                }
            }
        }

        // 2. Fall back to UI args if not parsed from input
        username = username || args[0];
        domain = domain || args[1];
        ntProofStr = cleanHex(ntProofStr || args[3]);
        encryptedSessionKey = cleanHex(encryptedSessionKey || args[4]);
        sessionId = cleanHex(sessionId || args[5]);

        const passwordHashArg = args[2];
        const passwordHashString = passwordHashArg.string.trim();
        const passwordHashOption = passwordHashArg.option;
        const outputFormat = args[6];

        if (!passwordHashString) {
            throw new OperationError("Password or NT Hash is required.");
        }

        let ntHashHex = "";
        if (passwordHashOption === "Hex (NT Hash)") {
            const cleanNtHash = cleanHex(passwordHashString);
            if (!/^[a-fA-F0-9]{32}$/.test(cleanNtHash)) {
                throw new OperationError("NT Hash must be a 32-character hex string.");
            }
            ntHashHex = cleanNtHash;
        } else {
            ntHashHex = calculateNTHash(passwordHashString);
        }

        if (!username) {
            throw new OperationError("Username is required.");
        }
        if (!ntProofStr) {
            throw new OperationError("NTProofStr is required.");
        }
        if (!/^[a-fA-F0-9]{32}$/.test(ntProofStr)) {
            throw new OperationError("NTProofStr must be a 32-character hex string.");
        }
        if (encryptedSessionKey && !/^[a-fA-F0-9]{32}$/.test(encryptedSessionKey)) {
            throw new OperationError("Encrypted Session Key must be a 32-character hex string.");
        }

        let cleanedSessionId = cleanHex(sessionId);
        if (cleanedSessionId) {
            if (!/^[a-fA-F0-9]+$/.test(cleanedSessionId)) {
                throw new OperationError("Session ID must be a hex string.");
            }
            if (cleanedSessionId.length < 16) {
                cleanedSessionId = cleanedSessionId.padStart(16, "0");
            }
        }

        // Step 1: Calculate ResponseKeyNT
        // ResponseKeyNT = HMAC-MD5(unicode(upper(UserName) + Domain), NT Hash)
        const ntHashBytes = Utils.convertToByteString(ntHashHex, "hex");
        const userDomainBytes = toUtf16LE(username.toUpperCase() + domain);
        const hasher1 = CryptoApi.getHasher("md5");
        const mac1 = CryptoApi.getHmac(ntHashBytes, hasher1);
        mac1.update(userDomainBytes);
        const responseKeyNT = mac1.finalize();
        const responseKeyNTHex = CryptoApi.encoder.toHex(responseKeyNT);

        // Step 2: Calculate SessionBaseKey (also called KeyExchangeKey)
        // SessionBaseKey = HMAC-MD5(ResponseKeyNT, NTProofStr)
        const ntProofStrBytes = Utils.convertToByteString(ntProofStr, "hex");
        const hasher2 = CryptoApi.getHasher("md5");
        const mac2 = CryptoApi.getHmac(responseKeyNT, hasher2);
        mac2.update(ntProofStrBytes);
        const sessionBaseKey = mac2.finalize();
        const sessionBaseKeyHex = CryptoApi.encoder.toHex(sessionBaseKey);

        // Step 3: Decrypt Encrypted Session Key via RC4 (if provided)
        let decryptedSessionKey = "";
        if (encryptedSessionKey) {
            const ciphertextWA = CryptoJS.enc.Hex.parse(encryptedSessionKey);
            const keyWA = CryptoJS.enc.Hex.parse(sessionBaseKeyHex);
            const decrypted = CryptoJS.RC4.encrypt(ciphertextWA, keyWA);
            decryptedSessionKey = decrypted.ciphertext.toString(CryptoJS.enc.Hex);
        }

        const finalKey = encryptedSessionKey ? decryptedSessionKey : sessionBaseKeyHex;

        // Output formatting
        switch (outputFormat) {
            case "Raw Session Key":
                return finalKey;
            case "Wireshark UAT line (SessionID,SessionKey)":
                return `${cleanedSessionId || "0000000000000000"},${finalKey}`;
            case "TShark Command Line Option":
                return `-o "uat:smb2_seskey_list:${cleanedSessionId || "0000000000000000"},${finalKey},\\"\\",\\"\\""`;
            case "JSON":
                return JSON.stringify({
                    username: username,
                    domain: domain,
                    ntHash: ntHashHex,
                    ntProofStr: ntProofStr,
                    responseKeyNT: responseKeyNTHex,
                    sessionBaseKey: sessionBaseKeyHex,
                    encryptedSessionKey: encryptedSessionKey || null,
                    decryptedSessionKey: decryptedSessionKey || null,
                    finalSessionKey: finalKey,
                    sessionId: cleanedSessionId || null,
                    wiresharkUat: `${cleanedSessionId || "0000000000000000"},${finalKey}`
                }, null, 4);
            case "Detailed Text": {
                let out = `NTLMv2 / SMB Session Key Derivation Details:
---------------------------------------------
Username:             ${username}
Domain:               ${domain}
NT Hash:              ${ntHashHex}
NTProofStr:           ${ntProofStr}

ResponseKeyNT:        ${responseKeyNTHex}
                      (HMAC-MD5 of Username + Domain using NT Hash as key)

SessionBaseKey:       ${sessionBaseKeyHex}
                      (HMAC-MD5 of NTProofStr using ResponseKeyNT as key)
`;
                if (encryptedSessionKey) {
                    out += `
Encrypted SessionKey: ${encryptedSessionKey}
Decrypted SessionKey: ${decryptedSessionKey}
                      (RC4 decrypted Encrypted SessionKey using SessionBaseKey as key)

Final Session Key:    ${finalKey}
`;
                } else {
                    out += `
Final Session Key:    ${finalKey}
                      (Using SessionBaseKey directly since no Encrypted SessionKey was provided)
`;
                }
                if (cleanedSessionId) {
                    out += `
Session ID:           ${cleanedSessionId}

Wireshark SMB2 Preferences entry:
Session ID:  ${cleanedSessionId}
Session Key: ${finalKey}

TShark Option:
-o "uat:smb2_seskey_list:${cleanedSessionId},${finalKey},\\"\\",\\"\\""
`;
                }
                return out;
            }
            default:
                throw new OperationError(`Unknown output format: ${outputFormat}`);
        }
    }
}

export default GenerateNTLMv2SMBSessionKey;
