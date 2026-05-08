/**
 * @author r4mos [2k95ljkhg@mozmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Adler32Checksum from "./Adler32Checksum.mjs";
import CRCChecksum from "./CRCChecksum.mjs";
import Fletcher8Checksum from "./Fletcher8Checksum.mjs";
import Fletcher16Checksum from "./Fletcher16Checksum.mjs";
import Fletcher32Checksum from "./Fletcher32Checksum.mjs";
import Fletcher64Checksum from "./Fletcher64Checksum.mjs";

/**
 * Generate all checksums operation
 */
class GenerateAllChecksums extends Operation {

    /**
     * GenerateAllChecksums constructor
     */
    constructor() {
        super();

        this.name = "Generate all checksums";
        this.module = "Crypto";
        this.description = "Generates all available checksums for the input.";
        this.infoURL = "https://wikipedia.org/wiki/Checksum";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Length (bits)",
                type: "option",
                value: [
                    "All", "3", "4", "5", "6", "7", "8", "10", "11", "12", "13", "14", "15", "16", "17", "21", "24", "30", "31", "32", "40", "64", "82"
                ]
            },
            {
                name: "Include names",
                type: "boolean",
                value: true
            },
        ];

        const adler32 = new Adler32Checksum;
        const crc = new CRCChecksum;
        const fletcher8 = new Fletcher8Checksum;
        const fletcher16 = new Fletcher16Checksum;
        const fletcher32 = new Fletcher32Checksum;
        const fletcher64 = new Fletcher64Checksum;
        this.checksums = [
            {name: "CRC-3/GSM", algo: crc, params: ["CRC-3/GSM"]},
            {name: "CRC-3/ROHC", algo: crc, params: ["CRC-3/ROHC"]},
            {name: "CRC-4/G-704", algo: crc, params: ["CRC-4/G-704"]},
            {name: "CRC-4/INTERLAKEN", algo: crc, params: ["CRC-4/INTERLAKEN"]},
            {name: "CRC-4/ITU", algo: crc, params: ["CRC-4/ITU"]},
            {name: "CRC-5/EPC", algo: crc, params: ["CRC-5/EPC"]},
            {name: "CRC-5/EPC-C1G2", algo: crc, params: ["CRC-5/EPC-C1G2"]},
            {name: "CRC-5/G-704", algo: crc, params: ["CRC-5/G-704"]},
            {name: "CRC-5/ITU", algo: crc, params: ["CRC-5/ITU"]},
            {name: "CRC-5/USB", algo: crc, params: ["CRC-5/USB"]},
            {name: "CRC-6/CDMA2000-A", algo: crc, params: ["CRC-6/CDMA2000-A"]},
            {name: "CRC-6/CDMA2000-B", algo: crc, params: ["CRC-6/CDMA2000-B"]},
            {name: "CRC-6/DARC", algo: crc, params: ["CRC-6/DARC"]},
            {name: "CRC-6/G-704", algo: crc, params: ["CRC-6/G-704"]},
            {name: "CRC-6/GSM", algo: crc, params: ["CRC-6/GSM"]},
            {name: "CRC-6/ITU", algo: crc, params: ["CRC-6/ITU"]},
            {name: "CRC-7/MMC", algo: crc, params: ["CRC-7/MMC"]},
            {name: "CRC-7/ROHC", algo: crc, params: ["CRC-7/ROHC"]},
            {name: "CRC-7/UMTS", algo: crc, params: ["CRC-7/UMTS"]},
            {name: "CRC-8", algo: crc, params: ["CRC-8"]},
            {name: "CRC-8/8H2F", algo: crc, params: ["CRC-8/8H2F"]},
            {name: "CRC-8/AES", algo: crc, params: ["CRC-8/AES"]},
            {name: "CRC-8/AUTOSAR", algo: crc, params: ["CRC-8/AUTOSAR"]},
            {name: "CRC-8/BLUETOOTH", algo: crc, params: ["CRC-8/BLUETOOTH"]},
            {name: "CRC-8/CDMA2000", algo: crc, params: ["CRC-8/CDMA2000"]},
            {name: "CRC-8/DARC", algo: crc, params: ["CRC-8/DARC"]},
            {name: "CRC-8/DVB-S2", algo: crc, params: ["CRC-8/DVB-S2"]},
            {name: "CRC-8/EBU", algo: crc, params: ["CRC-8/EBU"]},
            {name: "CRC-8/GSM-A", algo: crc, params: ["CRC-8/GSM-A"]},
            {name: "CRC-8/GSM-B", algo: crc, params: ["CRC-8/GSM-B"]},
            {name: "CRC-8/HITAG", algo: crc, params: ["CRC-8/HITAG"]},
            {name: "CRC-8/I-432-1", algo: crc, params: ["CRC-8/I-432-1"]},
            {name: "CRC-8/I-CODE", algo: crc, params: ["CRC-8/I-CODE"]},
            {name: "CRC-8/ITU", algo: crc, params: ["CRC-8/ITU"]},
            {name: "CRC-8/LTE", algo: crc, params: ["CRC-8/LTE"]},
            {name: "CRC-8/MAXIM", algo: crc, params: ["CRC-8/MAXIM"]},
            {name: "CRC-8/MAXIM-DOW", algo: crc, params: ["CRC-8/MAXIM-DOW"]},
            {name: "CRC-8/MIFARE-MAD", algo: crc, params: ["CRC-8/MIFARE-MAD"]},
            {name: "CRC-8/NRSC-5", algo: crc, params: ["CRC-8/NRSC-5"]},
            {name: "CRC-8/OPENSAFETY", algo: crc, params: ["CRC-8/OPENSAFETY"]},
            {name: "CRC-8/ROHC", algo: crc, params: ["CRC-8/ROHC"]},
            {name: "CRC-8/SAE-J1850", algo: crc, params: ["CRC-8/SAE-J1850"]},
            {name: "CRC-8/SAE-J1850-ZERO", algo: crc, params: ["CRC-8/SAE-J1850-ZERO"]},
            {name: "CRC-8/SMBUS", algo: crc, params: ["CRC-8/SMBUS"]},
            {name: "CRC-8/TECH-3250", algo: crc, params: ["CRC-8/TECH-3250"]},
            {name: "CRC-8/WCDMA", algo: crc, params: ["CRC-8/WCDMA"]},
            {name: "Fletcher-8", algo: fletcher8, params: []},
            {name: "CRC-10/ATM", algo: crc, params: ["CRC-10/ATM"]},
            {name: "CRC-10/CDMA2000", algo: crc, params: ["CRC-10/CDMA2000"]},
            {name: "CRC-10/GSM", algo: crc, params: ["CRC-10/GSM"]},
            {name: "CRC-10/I-610", algo: crc, params: ["CRC-10/I-610"]},
            {name: "CRC-11/FLEXRAY", algo: crc, params: ["CRC-11/FLEXRAY"]},
            {name: "CRC-11/UMTS", algo: crc, params: ["CRC-11/UMTS"]},
            {name: "CRC-12/3GPP", algo: crc, params: ["CRC-12/3GPP"]},
            {name: "CRC-12/CDMA2000", algo: crc, params: ["CRC-12/CDMA2000"]},
            {name: "CRC-12/DECT", algo: crc, params: ["CRC-12/DECT"]},
            {name: "CRC-12/GSM", algo: crc, params: ["CRC-12/GSM"]},
            {name: "CRC-12/UMTS", algo: crc, params: ["CRC-12/UMTS"]},
            {name: "CRC-13/BBC", algo: crc, params: ["CRC-13/BBC"]},
            {name: "CRC-14/DARC", algo: crc, params: ["CRC-14/DARC"]},
            {name: "CRC-14/GSM", algo: crc, params: ["CRC-14/GSM"]},
            {name: "CRC-15/CAN", algo: crc, params: ["CRC-15/CAN"]},
            {name: "CRC-15/MPT1327", algo: crc, params: ["CRC-15/MPT1327"]},
            {name: "CRC-16", algo: crc, params: ["CRC-16"]},
            {name: "CRC-16/A", algo: crc, params: ["CRC-16/A"]},
            {name: "CRC-16/ACORN", algo: crc, params: ["CRC-16/ACORN"]},
            {name: "CRC-16/ARC", algo: crc, params: ["CRC-16/ARC"]},
            {name: "CRC-16/AUG-CCITT", algo: crc, params: ["CRC-16/AUG-CCITT"]},
            {name: "CRC-16/AUTOSAR", algo: crc, params: ["CRC-16/AUTOSAR"]},
            {name: "CRC-16/B", algo: crc, params: ["CRC-16/B"]},
            {name: "CRC-16/BLUETOOTH", algo: crc, params: ["CRC-16/BLUETOOTH"]},
            {name: "CRC-16/BUYPASS", algo: crc, params: ["CRC-16/BUYPASS"]},
            {name: "CRC-16/CCITT", algo: crc, params: ["CRC-16/CCITT"]},
            {name: "CRC-16/CCITT-FALSE", algo: crc, params: ["CRC-16/CCITT-FALSE"]},
            {name: "CRC-16/CCITT-TRUE", algo: crc, params: ["CRC-16/CCITT-TRUE"]},
            {name: "CRC-16/CCITT-ZERO", algo: crc, params: ["CRC-16/CCITT-ZERO"]},
            {name: "CRC-16/CDMA2000", algo: crc, params: ["CRC-16/CDMA2000"]},
            {name: "CRC-16/CMS", algo: crc, params: ["CRC-16/CMS"]},
            {name: "CRC-16/DARC", algo: crc, params: ["CRC-16/DARC"]},
            {name: "CRC-16/DDS-110", algo: crc, params: ["CRC-16/DDS-110"]},
            {name: "CRC-16/DECT-R", algo: crc, params: ["CRC-16/DECT-R"]},
            {name: "CRC-16/DECT-X", algo: crc, params: ["CRC-16/DECT-X"]},
            {name: "CRC-16/DNP", algo: crc, params: ["CRC-16/DNP"]},
            {name: "CRC-16/EN-13757", algo: crc, params: ["CRC-16/EN-13757"]},
            {name: "CRC-16/EPC", algo: crc, params: ["CRC-16/EPC"]},
            {name: "CRC-16/EPC-C1G2", algo: crc, params: ["CRC-16/EPC-C1G2"]},
            {name: "CRC-16/GENIBUS", algo: crc, params: ["CRC-16/GENIBUS"]},
            {name: "CRC-16/GSM", algo: crc, params: ["CRC-16/GSM"]},
            {name: "CRC-16/I-CODE", algo: crc, params: ["CRC-16/I-CODE"]},
            {name: "CRC-16/IBM", algo: crc, params: ["CRC-16/IBM"]},
            {name: "CRC-16/IBM-3740", algo: crc, params: ["CRC-16/IBM-3740"]},
            {name: "CRC-16/IBM-SDLC", algo: crc, params: ["CRC-16/IBM-SDLC"]},
            {name: "CRC-16/IEC-61158-2", algo: crc, params: ["CRC-16/IEC-61158-2"]},
            {name: "CRC-16/ISO-HDLC", algo: crc, params: ["CRC-16/ISO-HDLC"]},
            {name: "CRC-16/ISO-IEC-14443-3-A", algo: crc, params: ["CRC-16/ISO-IEC-14443-3-A"]},
            {name: "CRC-16/ISO-IEC-14443-3-B", algo: crc, params: ["CRC-16/ISO-IEC-14443-3-B"]},
            {name: "CRC-16/KERMIT", algo: crc, params: ["CRC-16/KERMIT"]},
            {name: "CRC-16/LHA", algo: crc, params: ["CRC-16/LHA"]},
            {name: "CRC-16/LJ1200", algo: crc, params: ["CRC-16/LJ1200"]},
            {name: "CRC-16/LTE", algo: crc, params: ["CRC-16/LTE"]},
            {name: "CRC-16/M17", algo: crc, params: ["CRC-16/M17"]},
            {name: "CRC-16/MAXIM", algo: crc, params: ["CRC-16/MAXIM"]},
            {name: "CRC-16/MAXIM-DOW", algo: crc, params: ["CRC-16/MAXIM-DOW"]},
            {name: "CRC-16/MCRF4XX", algo: crc, params: ["CRC-16/MCRF4XX"]},
            {name: "CRC-16/MODBUS", algo: crc, params: ["CRC-16/MODBUS"]},
            {name: "CRC-16/NRSC-5", algo: crc, params: ["CRC-16/NRSC-5"]},
            {name: "CRC-16/OPENSAFETY-A", algo: crc, params: ["CRC-16/OPENSAFETY-A"]},
            {name: "CRC-16/OPENSAFETY-B", algo: crc, params: ["CRC-16/OPENSAFETY-B"]},
            {name: "CRC-16/PROFIBUS", algo: crc, params: ["CRC-16/PROFIBUS"]},
            {name: "CRC-16/RIELLO", algo: crc, params: ["CRC-16/RIELLO"]},
            {name: "CRC-16/SPI-FUJITSU", algo: crc, params: ["CRC-16/SPI-FUJITSU"]},
            {name: "CRC-16/T10-DIF", algo: crc, params: ["CRC-16/T10-DIF"]},
            {name: "CRC-16/TELEDISK", algo: crc, params: ["CRC-16/TELEDISK"]},
            {name: "CRC-16/TMS37157", algo: crc, params: ["CRC-16/TMS37157"]},
            {name: "CRC-16/UMTS", algo: crc, params: ["CRC-16/UMTS"]},
            {name: "CRC-16/USB", algo: crc, params: ["CRC-16/USB"]},
            {name: "CRC-16/V-41-LSB", algo: crc, params: ["CRC-16/V-41-LSB"]},
            {name: "CRC-16/V-41-MSB", algo: crc, params: ["CRC-16/V-41-MSB"]},
            {name: "CRC-16/VERIFONE", algo: crc, params: ["CRC-16/VERIFONE"]},
            {name: "CRC-16/X-25", algo: crc, params: ["CRC-16/X-25"]},
            {name: "CRC-16/XMODEM", algo: crc, params: ["CRC-16/XMODEM"]},
            {name: "CRC-16/ZMODEM", algo: crc, params: ["CRC-16/ZMODEM"]},
            {name: "Fletcher-16", algo: fletcher16, params: []},
            {name: "CRC-17/CAN-FD", algo: crc, params: ["CRC-17/CAN-FD"]},
            {name: "CRC-21/CAN-FD", algo: crc, params: ["CRC-21/CAN-FD"]},
            {name: "CRC-24/BLE", algo: crc, params: ["CRC-24/BLE"]},
            {name: "CRC-24/FLEXRAY-A", algo: crc, params: ["CRC-24/FLEXRAY-A"]},
            {name: "CRC-24/FLEXRAY-B", algo: crc, params: ["CRC-24/FLEXRAY-B"]},
            {name: "CRC-24/INTERLAKEN", algo: crc, params: ["CRC-24/INTERLAKEN"]},
            {name: "CRC-24/LTE-A", algo: crc, params: ["CRC-24/LTE-A"]},
            {name: "CRC-24/LTE-B", algo: crc, params: ["CRC-24/LTE-B"]},
            {name: "CRC-24/OPENPGP", algo: crc, params: ["CRC-24/OPENPGP"]},
            {name: "CRC-24/OS-9", algo: crc, params: ["CRC-24/OS-9"]},
            {name: "CRC-30/CDMA", algo: crc, params: ["CRC-30/CDMA"]},
            {name: "CRC-31/PHILIPS", algo: crc, params: ["CRC-31/PHILIPS"]},
            {name: "Adler-32", algo: adler32, params: []},
            {name: "CRC-32", algo: crc, params: ["CRC-32"]},
            {name: "CRC-32/AAL5", algo: crc, params: ["CRC-32/AAL5"]},
            {name: "CRC-32/ADCCP", algo: crc, params: ["CRC-32/ADCCP"]},
            {name: "CRC-32/AIXM", algo: crc, params: ["CRC-32/AIXM"]},
            {name: "CRC-32/AUTOSAR", algo: crc, params: ["CRC-32/AUTOSAR"]},
            {name: "CRC-32/BASE91-C", algo: crc, params: ["CRC-32/BASE91-C"]},
            {name: "CRC-32/BASE91-D", algo: crc, params: ["CRC-32/BASE91-D"]},
            {name: "CRC-32/BZIP2", algo: crc, params: ["CRC-32/BZIP2"]},
            {name: "CRC-32/C", algo: crc, params: ["CRC-32/C"]},
            {name: "CRC-32/CASTAGNOLI", algo: crc, params: ["CRC-32/CASTAGNOLI"]},
            {name: "CRC-32/CD-ROM-EDC", algo: crc, params: ["CRC-32/CD-ROM-EDC"]},
            {name: "CRC-32/CKSUM", algo: crc, params: ["CRC-32/CKSUM"]},
            {name: "CRC-32/D", algo: crc, params: ["CRC-32/D"]},
            {name: "CRC-32/DECT-B", algo: crc, params: ["CRC-32/DECT-B"]},
            {name: "CRC-32/INTERLAKEN", algo: crc, params: ["CRC-32/INTERLAKEN"]},
            {name: "CRC-32/ISCSI", algo: crc, params: ["CRC-32/ISCSI"]},
            {name: "CRC-32/ISO-HDLC", algo: crc, params: ["CRC-32/ISO-HDLC"]},
            {name: "CRC-32/JAMCRC", algo: crc, params: ["CRC-32/JAMCRC"]},
            {name: "CRC-32/MEF", algo: crc, params: ["CRC-32/MEF"]},
            {name: "CRC-32/MPEG-2", algo: crc, params: ["CRC-32/MPEG-2"]},
            {name: "CRC-32/NVME", algo: crc, params: ["CRC-32/NVME"]},
            {name: "CRC-32/PKZIP", algo: crc, params: ["CRC-32/PKZIP"]},
            {name: "CRC-32/POSIX", algo: crc, params: ["CRC-32/POSIX"]},
            {name: "CRC-32/Q", algo: crc, params: ["CRC-32/Q"]},
            {name: "CRC-32/SATA", algo: crc, params: ["CRC-32/SATA"]},
            {name: "CRC-32/V-42", algo: crc, params: ["CRC-32/V-42"]},
            {name: "CRC-32/XFER", algo: crc, params: ["CRC-32/XFER"]},
            {name: "CRC-32/XZ", algo: crc, params: ["CRC-32/XZ"]},
            {name: "Fletcher-32", algo: fletcher32, params: []},
            {name: "CRC-40/GSM", algo: crc, params: ["CRC-40/GSM"]},
            {name: "CRC-64/ECMA-182", algo: crc, params: ["CRC-64/ECMA-182"]},
            {name: "CRC-64/GO-ECMA", algo: crc, params: ["CRC-64/GO-ECMA"]},
            {name: "CRC-64/GO-ISO", algo: crc, params: ["CRC-64/GO-ISO"]},
            {name: "CRC-64/MS", algo: crc, params: ["CRC-64/MS"]},
            {name: "CRC-64/NVME", algo: crc, params: ["CRC-64/NVME"]},
            {name: "CRC-64/REDIS", algo: crc, params: ["CRC-64/REDIS"]},
            {name: "CRC-64/WE", algo: crc, params: ["CRC-64/WE"]},
            {name: "CRC-64/XZ", algo: crc, params: ["CRC-64/XZ"]},
            {name: "Fletcher-64", algo: fletcher64, params: []},
            {name: "CRC-82/DARC", algo: crc, params: ["CRC-82/DARC"]}
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [length, includeNames] = args;
        let output = "";
        this.checksums.forEach(checksum => {
            const checksumLength = checksum.name.match(new RegExp("-(\\d{1,2})(\\/|$)"))[1];
            if (length === "All" || length === checksumLength) {
                const value = checksum.algo.run(new Uint8Array(input), checksum.params || []);
                output += includeNames ?
                    `${checksum.name}:${" ".repeat(25-checksum.name.length)}${value}\n`:
                    `${value}\n`;
            }
        });
        return output;
    }
}

export default GenerateAllChecksums;
