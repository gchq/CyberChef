/**
 * @author bueddl [mail@bueddl.de]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * From Intel Hex operation
 */
class FromIntelHex extends Operation {

    /**
     * FromIntelHex constructor
     */
    constructor() {
        super();

        this.name = "From Intel Hex";
        this.module = "Default";
        this.description = "Decodes raw bytes from intel hex (ihex) format.";
        this.infoURL = "https://wikipedia.org/wiki/Intel_HEX";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            /* Example arguments. See the project wiki for full details.
            {
                name: "First arg",
                type: "string",
                value: "Don't Panic"
            },
            {
                name: "Second arg",
                type: "number",
                value: 42
            }
            */
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const records = [];   // { addr, bytes }
        let base = 0;
        let lo = Infinity, hi = 0;

        const fromHex = v => parseInt(v, 16);
        const toHex = v => v.toString(16).toUpperCase().padStart(2, "0");

        const lines = input.split("\n");
        outer:
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            const startIndex = line.indexOf(":");
            if (startIndex === -1) continue;

            const record = line.substring(startIndex + 1).trim();
            const byteCount = fromHex(record.substring(0, 2));
            const address = fromHex(record.substring(2, 6));
            const recordType = fromHex(record.substring(6, 8));
            const bytes = new Uint8Array(byteCount);
            for (let i = 0; i < byteCount; i++) {
                bytes[i] = fromHex(record.substring(8 + i * 2, 10 + i * 2));
            }
            const checksum = fromHex(record.substring(8 + byteCount * 2, 10 + byteCount * 2));

            let sum = byteCount + (address >> 8) + (address & 0xFF) + recordType;
            for (const b of bytes) sum += b;
            const expected = (-sum) & 0xFF;
            if (expected !== checksum) {
                throw new OperationError(`Invalid checksum on line ${index + 1} (got ${toHex(checksum)}, expected ${toHex(expected)})`);
            }

            switch (recordType) {
                case 0x00: {
                    const addr = base + address;
                    records.push({ addr, bytes });
                    lo = Math.min(lo, addr);
                    hi = Math.max(hi, addr + byteCount);
                    break;
                }
                case 0x01:
                    break outer;
                case 0x02: // extended segment address
                    base = ((bytes[0] << 8) | bytes[1]) * 16;
                    break;
                case 0x04: // extended linear address
                    base = ((bytes[0] << 8) | bytes[1]) * 0x10000;
                    break;
                case 0x03: // start segment address (CS:IP), irrelevant for the image
                case 0x05: // start linear address (entry point)
                    break;
                default:
                    throw new OperationError(`Unsupported record type ${recordType} on line ${index + 1}`);
            }
        }

        if (!records.length) return [];
        const out = new Uint8Array(hi - lo).fill(0xFF);
        for (const { addr, bytes } of records) out.set(bytes, addr - lo);
        return Array.from(out);
    }

}

export default FromIntelHex;
