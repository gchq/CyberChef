/**
 * @author MannXo [prmma23@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import OperationError from "../errors/OperationError.mjs";
import {
    KEY_SLOTS,
    SLOT_NAMES,
    FLAGS,
    CONSTANTS,
    MAX_COUNTER,
    strToBytes,
    uint32ToBytes,
    concat,
    aesEcbEncryptBlock,
    aesCbcEncrypt,
    kdf,
    aesCmac
} from "../lib/SHE.mjs";

/**
 * SHE Key Update operation
 */
class SHEKeyUpdate extends Operation {

    /**
     * SHEKeyUpdate constructor
     */
    constructor() {
        super();

        this.name = "SHE Key Update";
        this.module = "Crypto";
        this.description = "Generates the M1-M5 memory update protocol messages used to load a key into an AUTOSAR SHE (Secure Hardware Extension) module.<br><br>The input is the new key value (KEY_NEW), 16 bytes. M1, M2 and M3 are sent to the SHE module to import the key; M4 and M5 are returned by the module for verification. Keys are derived from the authorising key with the SHE KDF (a Miyaguchi-Preneel one-way compression over AES-128).<br><br>Choose 'SHE+' for the extended memory update constants.";
        this.infoURL = "https://www.autosar.org/fileadmin/standards/R22-11/FO/AUTOSAR_TR_SecureHardwareExtensions.pdf";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Authorising key (KeyAUTH)",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "UID",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "New key slot (ID)",
                "type": "option",
                "value": SLOT_NAMES,
                "defaultIndex": SLOT_NAMES.indexOf("KEY_1")
            },
            {
                "name": "Authorising key slot (AuthID)",
                "type": "option",
                "value": SLOT_NAMES,
                "defaultIndex": SLOT_NAMES.indexOf("MASTER_ECU_KEY")
            },
            {
                "name": "Counter (CID)",
                "type": "number",
                "value": 1,
                "min": 0,
                "max": MAX_COUNTER
            },
            {
                "name": "Variant",
                "type": "option",
                "value": ["SHE", "SHE+"]
            },
            {
                "name": "Write protection",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Boot protection",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Debugger protection",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Key usage",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Wildcard",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Verify only (SHE+)",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const keyNew = new Uint8Array(input);
        const keyAuth = strToBytes(Utils.convertToByteString(args[0].string, args[0].option));
        const uid = strToBytes(Utils.convertToByteString(args[1].string, args[1].option));
        const id = KEY_SLOTS[args[2]];
        const authId = KEY_SLOTS[args[3]];
        const counter = args[4];
        const variant = args[5];
        const flagValues = args.slice(6);

        if (keyNew.length !== 16) {
            throw new OperationError(`The new key (input) must be 16 bytes (currently ${keyNew.length} bytes)`);
        }
        if (keyAuth.length !== 16) {
            throw new OperationError(`The authorising key must be 16 bytes (currently ${keyAuth.length} bytes)`);
        }
        if (uid.length !== 15) {
            throw new OperationError(`The UID must be 15 bytes (currently ${uid.length} bytes)`);
        }
        if (counter < 0 || counter > MAX_COUNTER) {
            throw new OperationError("The counter (CID) must be a 28-bit value between 0 and 268435455");
        }

        const flagOrder = Object.keys(FLAGS);
        let fid = 0;
        flagValues.forEach((enabled, i) => {
            if (enabled) fid |= FLAGS[flagOrder[i]];
        });

        const c = CONSTANTS[variant];

        const k1 = kdf(keyAuth, c.enc);
        const k2 = kdf(keyAuth, c.mac);
        const k3 = kdf(keyNew, c.enc);
        const k4 = kdf(keyNew, c.mac);

        const m1 = concat(uid, new Uint8Array([(id << 4) | (authId & 0x0f)]));

        const m2Plain = new Uint8Array(32);
        m2Plain.set(uint32ToBytes(counter * 16 + (0x0f & (fid >> 2))), 0);
        m2Plain[4] = (fid << 6) & 0xc0;
        m2Plain.set(keyNew, 16);
        const m2 = aesCbcEncrypt(k1, m2Plain);

        const m3 = aesCmac(k2, concat(m1, m2));

        const m4Star = aesEcbEncryptBlock(k3, concat(uint32ToBytes(counter * 16 + 0x08), new Uint8Array(12)));
        const m4 = concat(m1, m4Star);

        const m5 = aesCmac(k4, m4);

        return [
            `M1: ${toHexFast(m1)}`,
            `M2: ${toHexFast(m2)}`,
            `M3: ${toHexFast(m3)}`,
            `M4: ${toHexFast(m4)}`,
            `M5: ${toHexFast(m5)}`,
        ].join("\n");
    }

}

export default SHEKeyUpdate;
