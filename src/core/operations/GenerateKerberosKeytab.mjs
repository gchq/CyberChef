/**
 * @author mansiverma897993
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Serialize a single keytab entry into a binary Uint8Array.
 *
 * @param {string} principal
 * @param {string} realm
 * @param {number} kvno
 * @param {number} etype
 * @param {Uint8Array} keyBytes
 * @returns {Uint8Array}
 */
function serializeEntry(principal, realm, kvno, etype, keyBytes) {
    const components = principal.split("/").map(c => c.trim()).filter(Boolean);
    const realmBytes = new TextEncoder().encode(realm.trim().toUpperCase());

    let componentsSize = 0;
    const componentsBytes = components.map(c => {
        const bytes = new TextEncoder().encode(c);
        componentsSize += 2 + bytes.length;
        return bytes;
    });

    const nameType = 1; // KRB5_NT_PRINCIPAL
    const timestamp = 0; // Fixed to 0 for deterministic testing
    const vno8 = kvno & 0xff;

    // Entry content size:
    // num_components (2)
    // realm len (2) + realmBytes.length
    // componentsSize (each comp: 2 len + data)
    // name_type (4)
    // timestamp (4)
    // vno8 (1)
    // keyblock: keytype (2) + keylen (2) + keyBytes.length
    // vno (4)
    const entrySize = 2 + 2 + realmBytes.length + componentsSize + 4 + 4 + 1 + 2 + 2 + keyBytes.length + 4;

    const buffer = new Uint8Array(4 + entrySize);
    const view = new DataView(buffer.buffer);

    let offset = 0;

    // 1. size (4 bytes, signed 32-bit big-endian)
    view.setInt32(offset, entrySize, false);
    offset += 4;

    // 2. num_components (2 bytes, big-endian)
    view.setInt16(offset, components.length, false);
    offset += 2;

    // 3. realm length (2 bytes, big-endian)
    view.setUint16(offset, realmBytes.length, false);
    offset += 2;

    // 4. realm data
    buffer.set(realmBytes, offset);
    offset += realmBytes.length;

    // 5. components
    for (const compBytes of componentsBytes) {
        view.setUint16(offset, compBytes.length, false);
        offset += 2;
        buffer.set(compBytes, offset);
        offset += compBytes.length;
    }

    // 6. name_type (4 bytes, big-endian)
    view.setUint32(offset, nameType, false);
    offset += 4;

    // 7. timestamp (4 bytes, big-endian)
    view.setUint32(offset, timestamp, false);
    offset += 4;

    // 8. vno8 (1 byte)
    view.setUint8(offset, vno8);
    offset += 1;

    // 9. keytype (2 bytes, big-endian)
    view.setUint16(offset, etype, false);
    offset += 2;

    // 10. keylen (2 bytes, big-endian)
    view.setUint16(offset, keyBytes.length, false);
    offset += 2;

    // 11. key data
    buffer.set(keyBytes, offset);
    offset += keyBytes.length;

    // 12. vno (4 bytes, big-endian)
    view.setUint32(offset, kvno, false);
    offset += 4;

    return buffer;
}

/**
 * Generate Kerberos Keytab operation
 */
class GenerateKerberosKeytab extends Operation {

    /**
     * GenerateKerberosKeytab constructor
     */
    constructor() {
        super();

        this.name = "Generate Kerberos Keytab";
        this.module = "Crypto";
        this.description = "Generates a Wireshark-compatible Kerberos (KRB5) keytab file from user-provided principal keys or NT hashes. The input can be a single key in the arguments or a list of keys in the main input (in CSV/lines or JSON format).<br><br><b>Input formats:</b><br>- CSV/lines: <code>principal,realm,kvno,etype,key</code> (one per line). Supports shorter forms like <code>principal,key</code> or <code>principal,realm,key</code>.<br>- JSON: an array of keytab entry objects, e.g. <code>[{\"principal\": \"eshellstrop\", \"realm\": \"WORKGROUP\", \"kvno\": 1, \"etype\": 23, \"key\": \"hex_key\"}]</code>.<br><br><b>Supported encryption types:</b><br>- RC4-HMAC / 23 (16-byte key / 32 hex characters)<br>- AES128-CTS-HMAC-SHA1-96 / 17 (16-byte key / 32 hex characters)<br>- AES256-CTS-HMAC-SHA1-96 / 18 (32-byte key / 64 hex characters)";
        this.infoURL = "https://web.mit.edu/kerberos/krb5-latest/doc/basic/keytab_def.html";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Principal",
                "type": "string",
                "value": ""
            },
            {
                "name": "Realm",
                "type": "string",
                "value": ""
            },
            {
                "name": "KVNO",
                "type": "number",
                "value": 1
            },
            {
                "name": "Encryption Type",
                "type": "option",
                "value": [
                    "RC4-HMAC (23)",
                    "AES128-CTS-HMAC-SHA1-96 (17)",
                    "AES256-CTS-HMAC-SHA1-96 (18)"
                ]
            },
            {
                "name": "Key / NT Hash (Hex)",
                "type": "string",
                "value": ""
            },
            {
                "name": "Output Format",
                "type": "option",
                "value": [
                    "Raw Keytab File",
                    "Hex",
                    "Base64",
                    "Detailed Summary Text"
                ]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const entries = [];

        // 1. Try parsing main input first
        if (input && input.trim()) {
            let parsedJson = null;
            try {
                const trimmed = input.trim();
                if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                    parsedJson = JSON.parse(trimmed);
                }
            } catch (e) {
                // Not valid JSON, fallback to CSV/lines
            }

            if (parsedJson) {
                const list = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
                for (const item of list) {
                    if (typeof item === "object" && item !== null) {
                        const principal = item.principal || item.username || "";
                        const realm = item.realm || "";
                        const kvno = item.kvno !== undefined ? item.kvno : 1;
                        const etypeInput = item.etype || item.encryption_type || 23;
                        const key = item.key || item.nt_hash || item.value || "";

                        if (principal && key) {
                            entries.push({ principal, realm, kvno, etypeInput, key });
                        }
                    }
                }
            } else {
                const rows = Utils.parseCSV(input.trim());
                for (const row of rows) {
                    if (row.length === 0) continue;

                    const firstCol = row[0].trim();
                    if (firstCol.startsWith("#") || firstCol === "") continue;

                    // Ignore header line
                    const col1Lower = firstCol.toLowerCase();
                    if (col1Lower === "principal" || col1Lower === "username") continue;

                    if (row.length < 2) continue;

                    let principal = "";
                    let realm = "";
                    let kvno = 1;
                    let etypeInput = 23;
                    let key = "";

                    if (row.length === 2) {
                        principal = row[0];
                        key = row[1];
                    } else if (row.length === 3) {
                        principal = row[0];
                        realm = row[1];
                        key = row[2];
                    } else if (row.length === 4) {
                        principal = row[0];
                        realm = row[1];
                        const val = parseInt(row[2].trim(), 10);
                        if (isNaN(val)) {
                            etypeInput = row[2];
                        } else if (val === 23 || val === 17 || val === 18) {
                            etypeInput = val;
                        } else {
                            kvno = val;
                        }
                        key = row[3];
                    } else {
                        principal = row[0];
                        realm = row[1];
                        kvno = parseInt(row[2].trim(), 10) || 1;
                        etypeInput = row[3];
                        key = row[4];
                    }

                    if (principal && key) {
                        entries.push({ principal, realm, kvno, etypeInput, key });
                    }
                }
            }
        }

        // 2. Fall back to UI args if no entries found in main input
        if (entries.length === 0) {
            const principal = args[0] || "";
            const realm = args[1] || "";
            const kvno = args[2] !== undefined ? args[2] : 1;
            const etypeInput = args[3];
            const key = args[4] || "";

            if (principal && key) {
                entries.push({ principal, realm, kvno, etypeInput, key });
            }
        }

        if (entries.length === 0) {
            throw new OperationError("No principal/key entries provided or found in input/arguments.");
        }

        const finalEntries = [];
        for (const entry of entries) {
            const principal = entry.principal.trim();
            const realm = entry.realm.trim() || "LOCAL";
            const kvno = parseInt(entry.kvno, 10) || 1;

            let etype = 23;
            const etypeStr = String(entry.etypeInput).toLowerCase().trim();
            if (etypeStr.includes("17") || etypeStr.includes("aes128")) {
                etype = 17;
            } else if (etypeStr.includes("18") || etypeStr.includes("aes256")) {
                etype = 18;
            } else if (etypeStr.includes("23") || etypeStr.includes("rc4") || etypeStr.includes("arcfour")) {
                etype = 23;
            } else {
                const parsed = parseInt(etypeStr, 10);
                if (!isNaN(parsed)) {
                    etype = parsed;
                } else {
                    throw new OperationError(`Unsupported or unrecognized encryption type: ${entry.etypeInput}`);
                }
            }

            const cleanKey = entry.key.trim().replace(/^0x/i, "").replace(/[\s:]/g, "");
            if (!/^[a-fA-F0-9]+$/.test(cleanKey)) {
                throw new OperationError(`Key for principal ${principal} must be a hex-encoded string.`);
            }

            const keyLengthInBytes = cleanKey.length / 2;
            if (etype === 23 && keyLengthInBytes !== 16) {
                throw new OperationError(`RC4 key (etype 23) for principal ${principal} must be 16 bytes (32 hex characters). Got ${keyLengthInBytes} bytes.`);
            } else if (etype === 17 && keyLengthInBytes !== 16) {
                throw new OperationError(`AES128 key (etype 17) for principal ${principal} must be 16 bytes (32 hex characters). Got ${keyLengthInBytes} bytes.`);
            } else if (etype === 18 && keyLengthInBytes !== 32) {
                throw new OperationError(`AES256 key (etype 18) for principal ${principal} must be 32 bytes (64 hex characters). Got ${keyLengthInBytes} bytes.`);
            }

            const keyBytes = Utils.convertToByteArray(cleanKey, "hex");
            finalEntries.push({ principal, realm, kvno, etype, keyBytes, cleanKey });
        }

        // Build the binary keytab data
        let totalLength = 2; // For format version bytes [0x05, 0x02]
        const serializedEntries = [];
        for (const entry of finalEntries) {
            const bytes = serializeEntry(entry.principal, entry.realm, entry.kvno, entry.etype, new Uint8Array(entry.keyBytes));
            serializedEntries.push(bytes);
            totalLength += bytes.length;
        }

        const keytabFile = new Uint8Array(totalLength);
        keytabFile[0] = 0x05;
        keytabFile[1] = 0x02;
        let offset = 2;
        for (const bytes of serializedEntries) {
            keytabFile.set(bytes, offset);
            offset += bytes.length;
        }

        const outputFormat = args[5];
        switch (outputFormat) {
            case "Raw Keytab File":
                return Array.from(keytabFile);
            case "Hex": {
                const hexStr = Array.from(keytabFile).map(b => b.toString(16).padStart(2, "0")).join("");
                return Utils.strToByteArray(hexStr);
            }
            case "Base64": {
                // Convert byteArray to string of chars, then base64 encode
                const chars = Utils.byteArrayToChars(Array.from(keytabFile));
                const b64 = btoa(chars);
                return Utils.strToByteArray(b64);
            }
            case "Detailed Summary Text": {
                let out = `Kerberos KRB5 Keytab Generation Summary:\n`;
                out += `-----------------------------------------\n`;
                out += `Successfully generated a keytab file with ${finalEntries.length} entries:\n\n`;

                finalEntries.forEach((entry, idx) => {
                    let etypeName = "Unknown";
                    if (entry.etype === 23) etypeName = "RC4-HMAC (23)";
                    else if (entry.etype === 17) etypeName = "AES128-CTS-HMAC-SHA1-96 (17)";
                    else if (entry.etype === 18) etypeName = "AES256-CTS-HMAC-SHA1-96 (18)";

                    out += `Entry ${idx + 1}:\n`;
                    out += `  Principal:   ${entry.principal}\n`;
                    out += `  Realm:       ${entry.realm}\n`;
                    out += `  KVNO:        ${entry.kvno}\n`;
                    out += `  Etype:       ${etypeName}\n`;
                    out += `  Key (Hex):   ${entry.cleanKey}\n\n`;
                });

                out += `Wireshark Configuration Instructions:\n`;
                out += `-------------------------------------\n`;
                out += `1. Save the generated keytab output as a file (e.g. krb5.keytab).\n`;
                out += `2. Open Wireshark and go to: Edit -> Preferences -> Protocols -> KRB5\n`;
                out += `3. Enable "Decrypt Kerberos traffic" (if available).\n`;
                out += `4. Click "Browse..." next to "Kerberos keytab file" and select the generated file.\n`;
                out += `5. Wireshark will now automatically decrypt Kerberos, DCE/RPC, LDAP, and SMB traffic where these keys are valid.\n`;

                return Utils.strToByteArray(out);
            }
            default:
                throw new OperationError(`Unknown output format: ${outputFormat}`);
        }
    }
}

export default GenerateKerberosKeytab;
