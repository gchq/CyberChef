/**
 * @author r4mos [2k95ljkhg@mozmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * CRC Checksum operation
 */
class CRCChecksum extends Operation {

    /**
     * CRCChecksum constructor
     */
    constructor() {
        super();

        this.name = "CRC Checksum";
        this.module = "Default";
        this.description = "A Cyclic Redundancy Check (<b>CRC</b>) is an error-detecting code commonly used in digital networks and storage devices to detect accidental changes to raw data.";
        this.infoURL = "https://wikipedia.org/wiki/Cyclic_redundancy_check";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Algorithm",
                type: "argSelector",
                value: [
                    {
                        name: "Custom",
                        on: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-3/GSM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-3/ROHC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-4/G-704",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-4/INTERLAKEN",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-4/ITU",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-5/EPC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-5/EPC-C1G2",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-5/G-704",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-5/ITU",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-5/USB",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-6/CDMA2000-A",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-6/CDMA2000-B",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-6/DARC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-6/G-704",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-6/GSM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-6/ITU",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-7/MMC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-7/ROHC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-7/UMTS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/8H2F",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/AES",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/AUTOSAR",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/BLUETOOTH",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/CDMA2000",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/DARC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/DVB-S2",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/EBU",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/GSM-A",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/GSM-B",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/HITAG",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/I-432-1",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/I-CODE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/ITU",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/LTE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/MAXIM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/MAXIM-DOW",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/MIFARE-MAD",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/NRSC-5",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/OPENSAFETY",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/ROHC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/SAE-J1850",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/SAE-J1850-ZERO",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/SMBUS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/TECH-3250",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-8/WCDMA",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-10/ATM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-10/CDMA2000",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-10/GSM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-10/I-610",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-11/FLEXRAY",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-11/UMTS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-12/3GPP",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-12/CDMA2000",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-12/DECT",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-12/GSM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-12/UMTS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-13/BBC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-14/DARC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-14/GSM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-15/CAN",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-15/MPT1327",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/A",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/ACORN",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/ARC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/AUG-CCITT",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/AUTOSAR",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/B",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/BLUETOOTH",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/BUYPASS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/CCITT",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/CCITT-FALSE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/CCITT-TRUE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/CCITT-ZERO",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/CDMA2000",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/CMS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/DARC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/DDS-110",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/DECT-R",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/DECT-X",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/DNP",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/EN-13757",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/EPC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/EPC-C1G2",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/GENIBUS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/GSM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/I-CODE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/IBM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/IBM-3740",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/IBM-SDLC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/IEC-61158-2",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/ISO-HDLC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/ISO-IEC-14443-3-A",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/ISO-IEC-14443-3-B",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/KERMIT",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/LHA",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/LJ1200",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/LTE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/M17",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/MAXIM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/MAXIM-DOW",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/MCRF4XX",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/MODBUS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/NRSC-5",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/OPENSAFETY-A",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/OPENSAFETY-B",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/PROFIBUS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/RIELLO",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/SPI-FUJITSU",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/T10-DIF",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/TELEDISK",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/TMS37157",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/UMTS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/USB",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/V-41-LSB",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/V-41-MSB",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/VERIFONE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/X-25",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/XMODEM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-16/ZMODEM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-17/CAN-FD",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-21/CAN-FD",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-24/BLE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-24/FLEXRAY-A",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-24/FLEXRAY-B",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-24/INTERLAKEN",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-24/LTE-A",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-24/LTE-B",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-24/OPENPGP",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-24/OS-9",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-30/CDMA",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-31/PHILIPS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/AAL5",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/ADCCP",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/AIXM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/AUTOSAR",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/BASE91-C",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/BASE91-D",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/BZIP2",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/C",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/CASTAGNOLI",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/CD-ROM-EDC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/CKSUM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/D",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/DECT-B",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/INTERLAKEN",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/ISCSI",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/ISO-HDLC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/JAMCRC",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/MEF",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/MPEG-2",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/NVME",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/PKZIP",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/POSIX",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/Q",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/SATA",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/V-42",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/XFER",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-32/XZ",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-40/GSM",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-64/ECMA-182",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-64/GO-ECMA",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-64/GO-ISO",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-64/MS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-64/NVME",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-64/REDIS",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-64/WE",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-64/XZ",
                        off: [1, 2, 3, 4, 5, 6]
                    },
                    {
                        name: "CRC-82/DARC",
                        off: [1, 2, 3, 4, 5, 6]
                    }
                ]
            },
            {
                name: "Width (bits)",
                type: "toggleString",
                value: "0",
                toggleValues: ["Decimal"]
            },
            {
                name: "Polynomial",
                type: "toggleString",
                value: "0",
                toggleValues: ["Hex"]
            },
            {
                name: "Initialization",
                type: "toggleString",
                value: "0",
                toggleValues: ["Hex"]
            },
            {
                name: "Reflect input",
                type: "option",
                value: ["True", "False"]
            },
            {
                name: "Reflect output",
                type: "option",
                value: ["True", "False"]
            },
            {
                name: "Xor Output",
                type: "toggleString",
                value: "0",
                toggleValues: ["Hex"]
            }
        ];
    }

    /**
     * Reverse the order of bits in a number
     *
     * @param {BigInt} data
     * @param {BigInt} reflect
     */
    reflectData(data, reflect) {
        let value = 0n;
        for (let bit = 0n; bit < reflect; bit++) {
            if ((data & 1n) === 1n) {
                value |= (1n << ((reflect - 1n) - bit));
            }
            data >>= 1n;
        }
        return value;
    }

    /**
     * Performs the CRC Checksum calculation bit per bit without acceleration
     *
     * @param {BigInt} width
     * @param {ArrayBuffer} input
     * @param {BigInt} poly
     * @param {BigInt} remainder
     * @param {boolean} reflectIn
     * @param {boolean} reflectOut
     * @param {BigInt} xorOut
     */
    calculateCrcBitPerBit(width, input, poly, remainder, reflectIn, reflectOut, xorOut) {
        const TOP_BIT = 1n << (width - 1n);
        const MASK = (1n << width) - 1n;

        for (let byte of input) {
            byte = BigInt(byte);
            if (reflectIn) {
                byte = this.reflectData(byte, 8n);
            }

            for (let i = 0x80n; i !== 0n; i >>= 1n) {
                let bit = remainder & TOP_BIT;

                remainder = (remainder << 1n) & MASK;

                if ((byte & i) !== 0n) {
                    bit ^= TOP_BIT;
                }

                if (bit !== 0n) {
                    remainder ^= poly;
                }
            }
        }

        if (reflectOut) {
            remainder = this.reflectData(remainder, width);
        }

        return remainder ^ xorOut;
    }

    /**
     * Generates the necessary table to speed up the calculation
     *
     * @param {BigInt} width
     * @param {BigInt} poly
     * @param {BigInt} MASK
     * @param {BigInt} TOP_BIT
     */
    generateTable(width, poly, MASK, TOP_BIT) {
        const table = new Array(256n);
        for (let byte = 0n; byte < 256n; byte++) {
            let value = ((byte << width - 8n) & MASK);
            for (let bit = 0n; bit < 8n; bit++) {
                value = (value & TOP_BIT) === 0n ?
                    ((value << 1n) & MASK) :
                    ((value << 1n) & MASK) ^ poly;
            }
            table[byte] = value;
        }
        return table;
    }

    /**
     * Performs the CRC Checksum calculation byte per byte using a computed table to accelerate it
     *
     * @param {BigInt} width
     * @param {ArrayBuffer} input
     * @param {BigInt} poly
     * @param {BigInt} remainder
     * @param {boolean} reflectIn
     * @param {boolean} reflectOut
     * @param {BigInt} xorOut
     */
    calculateCrcBytePerByte(width, input, poly, remainder, reflectIn, reflectOut, xorOut) {
        const TOP_BIT = 1n << (width - 1n);
        const MASK = (1n << width) - 1n;
        const TABLE = this.generateTable(width, poly, MASK, TOP_BIT);

        for (let byte of input) {
            byte = BigInt(byte);
            if (reflectIn) {
                byte = this.reflectData(byte, 8n);
            }
            remainder ^= (byte << width - 8n) & MASK;

            const INDEX = remainder >> width - 8n;
            remainder = (remainder << 8n) & MASK;
            remainder ^= TABLE[INDEX];
        }

        if (reflectOut) {
            remainder = this.reflectData(remainder, width);
        }
        return remainder ^ xorOut;
    }

    /**
     * Calculates the CRC Checksum using Bigint (https://developer.mozilla.org/en-US/docs/Glossary/BigInt)
     *
     * @param {BigInt} width
     * @param {ArrayBuffer} input
     * @param {BigInt} poly
     * @param {BigInt} init
     * @param {boolean} reflectIn
     * @param {boolean} reflectOut
     * @param {BigInt} xorOut
     */
    crc(width, input, poly, init, reflectIn, reflectOut, xorOut) {
        const VALUE = width < 8n ?
            this.calculateCrcBitPerBit(width, input, poly, init, reflectIn, reflectOut, xorOut) :
            this.calculateCrcBytePerByte(width, input, poly, init, reflectIn, reflectOut, xorOut);

        return VALUE.toString(16).padStart(Math.ceil(Number(width) / 4), "0");
    }

    /**
     * Validates user input to perform a custom CRC
     *
     * @param {Object} widthObject
     * @param {ArrayBuffer} input
     * @param {Object} polyObject
     * @param {Object} initObject
     * @param {Object} reflectInObject
     * @param {Object} reflectOutObject
     * @param {Object} xorOutObject
     */
    custom(widthObject, input, polyObject, initObject, reflectInObject, reflectOutObject, xorOutObject) {
        try {
            const width = BigInt(widthObject.string);
            const poly = BigInt("0x" + polyObject.string);
            const init = BigInt("0x" + initObject.string);
            const reflectIn = reflectInObject === "True";
            const reflectOut = reflectOutObject === "True";
            const xorOut = BigInt("0x" + xorOutObject.string);

            return this.crc(width, input, poly, init, reflectIn, reflectOut, xorOut);
        } catch (error) {
            throw new OperationError("Invalid custom CRC arguments");
        }
    }

    /**
     * Calculation of all known CRCs. Names and constants extracted from https://reveng.sourceforge.io/crc-catalogue/all.htm
     *
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const algorithm = args[0];
        input = new Uint8Array(input);

        switch (algorithm) {
            case "Custom":                   return this.custom(args[1], input, args[2], args[3], args[4], args[5], args[6]);
            case "CRC-3/GSM":                return this.crc(3n, input, 0x3n, 0x0n, false, false, 0x7n);
            case "CRC-3/ROHC":               return this.crc(3n, input, 0x3n, 0x7n, true,  true,  0x0n);
            case "CRC-4/G-704":              return this.crc(4n, input, 0x3n, 0x0n, true,  true,  0x0n);
            case "CRC-4/INTERLAKEN":         return this.crc(4n, input, 0x3n, 0xFn, false, false, 0xFn);
            case "CRC-4/ITU":                return this.crc(4n, input, 0x3n, 0x0n, true,  true,  0x0n);
            case "CRC-5/EPC":                return this.crc(5n, input, 0x09n, 0x09n, false, false, 0x00n);
            case "CRC-5/EPC-C1G2":           return this.crc(5n, input, 0x09n, 0x09n, false, false, 0x00n);
            case "CRC-5/G-704":              return this.crc(5n, input, 0x15n, 0x00n, true,  true,  0x00n);
            case "CRC-5/ITU":                return this.crc(5n, input, 0x15n, 0x00n, true,  true,  0x00n);
            case "CRC-5/USB":                return this.crc(5n, input, 0x05n, 0x1Fn, true,  true,  0x1Fn);
            case "CRC-6/CDMA2000-A":         return this.crc(6n, input, 0x27n, 0x3Fn, false, false, 0x00n);
            case "CRC-6/CDMA2000-B":         return this.crc(6n, input, 0x07n, 0x3Fn, false, false, 0x00n);
            case "CRC-6/DARC":               return this.crc(6n, input, 0x19n, 0x00n, true,  true,  0x00n);
            case "CRC-6/G-704":              return this.crc(6n, input, 0x03n, 0x00n, true,  true,  0x00n);
            case "CRC-6/GSM":                return this.crc(6n, input, 0x2Fn, 0x00n, false, false, 0x3Fn);
            case "CRC-6/ITU":                return this.crc(6n, input, 0x03n, 0x00n, true,  true,  0x00n);
            case "CRC-7/MMC":                return this.crc(7n, input, 0x09n, 0x00n, false, false, 0x00n);
            case "CRC-7/ROHC":               return this.crc(7n, input, 0x4Fn, 0x7Fn, true,  true,  0x00n);
            case "CRC-7/UMTS":               return this.crc(7n, input, 0x45n, 0x00n, false, false, 0x00n);
            case "CRC-8":                    return this.crc(8n, input, 0x07n, 0x00n, false, false, 0x00n);
            case "CRC-8/8H2F":               return this.crc(8n, input, 0x2Fn, 0xFFn, false, false, 0xFFn);
            case "CRC-8/AES":                return this.crc(8n, input, 0x1Dn, 0xFFn, true,  true,  0x00n);
            case "CRC-8/AUTOSAR":            return this.crc(8n, input, 0x2Fn, 0xFFn, false, false, 0xFFn);
            case "CRC-8/BLUETOOTH":          return this.crc(8n, input, 0xA7n, 0x00n, true,  true,  0x00n);
            case "CRC-8/CDMA2000":           return this.crc(8n, input, 0x9Bn, 0xFFn, false, false, 0x00n);
            case "CRC-8/DARC":               return this.crc(8n, input, 0x39n, 0x00n, true,  true,  0x00n);
            case "CRC-8/DVB-S2":             return this.crc(8n, input, 0xD5n, 0x00n, false, false, 0x00n);
            case "CRC-8/EBU":                return this.crc(8n, input, 0x1Dn, 0xFFn, true,  true,  0x00n);
            case "CRC-8/GSM-A":              return this.crc(8n, input, 0x1Dn, 0x00n, false, false, 0x00n);
            case "CRC-8/GSM-B":              return this.crc(8n, input, 0x49n, 0x00n, false, false, 0xFFn);
            case "CRC-8/HITAG":              return this.crc(8n, input, 0x1Dn, 0xFFn, false, false, 0x00n);
            case "CRC-8/I-432-1":            return this.crc(8n, input, 0x07n, 0x00n, false, false, 0x55n);
            case "CRC-8/I-CODE":             return this.crc(8n, input, 0x1Dn, 0xFDn, false, false, 0x00n);
            case "CRC-8/ITU":                return this.crc(8n, input, 0x07n, 0x00n, false, false, 0x55n);
            case "CRC-8/LTE":                return this.crc(8n, input, 0x9Bn, 0x00n, false, false, 0x00n);
            case "CRC-8/MAXIM":              return this.crc(8n, input, 0x31n, 0x00n, true,  true,  0x00n);
            case "CRC-8/MAXIM-DOW":          return this.crc(8n, input, 0x31n, 0x00n, true,  true,  0x00n);
            case "CRC-8/MIFARE-MAD":         return this.crc(8n, input, 0x1Dn, 0xC7n, false, false, 0x00n);
            case "CRC-8/NRSC-5":             return this.crc(8n, input, 0x31n, 0xFFn, false, false, 0x00n);
            case "CRC-8/OPENSAFETY":         return this.crc(8n, input, 0x2Fn, 0x00n, false, false, 0x00n);
            case "CRC-8/ROHC":               return this.crc(8n, input, 0x07n, 0xFFn, true,  true,  0x00n);
            case "CRC-8/SAE-J1850":          return this.crc(8n, input, 0x1Dn, 0xFFn, false, false, 0xFFn);
            case "CRC-8/SAE-J1850-ZERO":     return this.crc(8n, input, 0x1Dn, 0x00n, false, false, 0x00n);
            case "CRC-8/SMBUS":              return this.crc(8n, input, 0x07n, 0x00n, false, false, 0x00n);
            case "CRC-8/TECH-3250":          return this.crc(8n, input, 0x1Dn, 0xFFn, true,  true,  0x00n);
            case "CRC-8/WCDMA":              return this.crc(8n, input, 0x9Bn, 0x00n, true,  true,  0x00n);
            case "CRC-10/ATM":               return this.crc(10n, input, 0x233n, 0x000n, false, false, 0x000n);
            case "CRC-10/CDMA2000":          return this.crc(10n, input, 0x3D9n, 0x3FFn, false, false, 0x000n);
            case "CRC-10/GSM":               return this.crc(10n, input, 0x175n, 0x000n, false, false, 0x3FFn);
            case "CRC-10/I-610":             return this.crc(10n, input, 0x233n, 0x000n, false, false, 0x000n);
            case "CRC-11/FLEXRAY":           return this.crc(11n, input, 0x385n, 0x01An, false, false, 0x000n);
            case "CRC-11/UMTS":              return this.crc(11n, input, 0x307n, 0x000n, false, false, 0x000n);
            case "CRC-12/3GPP":              return this.crc(12n, input, 0x80Fn, 0x000n, false, true,  0x000n);
            case "CRC-12/CDMA2000":          return this.crc(12n, input, 0xF13n, 0xFFFn, false, false, 0x000n);
            case "CRC-12/DECT":              return this.crc(12n, input, 0x80Fn, 0x000n, false, false, 0x000n);
            case "CRC-12/GSM":               return this.crc(12n, input, 0xD31n, 0x000n, false, false, 0xFFFn);
            case "CRC-12/UMTS":              return this.crc(12n, input, 0x80Fn, 0x000n, false, true,  0x000n);
            case "CRC-13/BBC":               return this.crc(13n, input, 0x1CF5n, 0x0000n, false, false, 0x0000n);
            case "CRC-14/DARC":              return this.crc(14n, input, 0x0805n, 0x0000n, true,  true,  0x0000n);
            case "CRC-14/GSM":               return this.crc(14n, input, 0x202Dn, 0x0000n, false, false, 0x3FFFn);
            case "CRC-15/CAN":               return this.crc(15n, input, 0x4599n, 0x0000n, false, false, 0x0000n);
            case "CRC-15/MPT1327":           return this.crc(15n, input, 0x6815n, 0x0000n, false, false, 0x0001n);
            case "CRC-16":                   return this.crc(16n, input, 0x8005n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/A":                 return this.crc(16n, input, 0x1021n, 0xC6C6n, true,  true,  0x0000n);
            case "CRC-16/ACORN":             return this.crc(16n, input, 0x1021n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/ARC":               return this.crc(16n, input, 0x8005n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/AUG-CCITT":         return this.crc(16n, input, 0x1021n, 0x1D0Fn, false, false, 0x0000n);
            case "CRC-16/AUTOSAR":           return this.crc(16n, input, 0x1021n, 0xFFFFn, false, false, 0x0000n);
            case "CRC-16/B":                 return this.crc(16n, input, 0x1021n, 0xFFFFn, true,  true,  0xFFFFn);
            case "CRC-16/BLUETOOTH":         return this.crc(16n, input, 0x1021n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/BUYPASS":           return this.crc(16n, input, 0x8005n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/CCITT":             return this.crc(16n, input, 0x1021n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/CCITT-FALSE":       return this.crc(16n, input, 0x1021n, 0xFFFFn, false, false, 0x0000n);
            case "CRC-16/CCITT-TRUE":        return this.crc(16n, input, 0x1021n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/CCITT-ZERO":        return this.crc(16n, input, 0x1021n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/CDMA2000":          return this.crc(16n, input, 0xC867n, 0xFFFFn, false, false, 0x0000n);
            case "CRC-16/CMS":               return this.crc(16n, input, 0x8005n, 0xFFFFn, false, false, 0x0000n);
            case "CRC-16/DARC":              return this.crc(16n, input, 0x1021n, 0xFFFFn, false, false, 0xFFFFn);
            case "CRC-16/DDS-110":           return this.crc(16n, input, 0x8005n, 0x800Dn, false, false, 0x0000n);
            case "CRC-16/DECT-R":            return this.crc(16n, input, 0x0589n, 0x0000n, false, false, 0x0001n);
            case "CRC-16/DECT-X":            return this.crc(16n, input, 0x0589n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/DNP":               return this.crc(16n, input, 0x3D65n, 0x0000n, true,  true,  0xFFFFn);
            case "CRC-16/EN-13757":          return this.crc(16n, input, 0x3D65n, 0x0000n, false, false, 0xFFFFn);
            case "CRC-16/EPC":               return this.crc(16n, input, 0x1021n, 0xFFFFn, false, false, 0xFFFFn);
            case "CRC-16/EPC-C1G2":          return this.crc(16n, input, 0x1021n, 0xFFFFn, false, false, 0xFFFFn);
            case "CRC-16/GENIBUS":           return this.crc(16n, input, 0x1021n, 0xFFFFn, false, false, 0xFFFFn);
            case "CRC-16/GSM":               return this.crc(16n, input, 0x1021n, 0x0000n, false, false, 0xFFFFn);
            case "CRC-16/I-CODE":            return this.crc(16n, input, 0x1021n, 0xFFFFn, false, false, 0xFFFFn);
            case "CRC-16/IBM":               return this.crc(16n, input, 0x8005n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/IBM-3740":          return this.crc(16n, input, 0x1021n, 0xFFFFn, false, false, 0x0000n);
            case "CRC-16/IBM-SDLC":          return this.crc(16n, input, 0x1021n, 0xFFFFn, true,  true,  0xFFFFn);
            case "CRC-16/IEC-61158-2":       return this.crc(16n, input, 0x1DCFn, 0xFFFFn, false, false, 0xFFFFn);
            case "CRC-16/ISO-HDLC":          return this.crc(16n, input, 0x1021n, 0xFFFFn, true,  true,  0xFFFFn);
            case "CRC-16/ISO-IEC-14443-3-A": return this.crc(16n, input, 0x1021n, 0xC6C6n, true,  true,  0x0000n);
            case "CRC-16/ISO-IEC-14443-3-B": return this.crc(16n, input, 0x1021n, 0xFFFFn, true,  true,  0xFFFFn);
            case "CRC-16/KERMIT":            return this.crc(16n, input, 0x1021n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/LHA":               return this.crc(16n, input, 0x8005n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/LJ1200":            return this.crc(16n, input, 0x6F63n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/LTE":               return this.crc(16n, input, 0x1021n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/M17":               return this.crc(16n, input, 0x5935n, 0xFFFFn, false, false, 0x0000n);
            case "CRC-16/MAXIM":             return this.crc(16n, input, 0x8005n, 0x0000n, true,  true,  0xFFFFn);
            case "CRC-16/MAXIM-DOW":         return this.crc(16n, input, 0x8005n, 0x0000n, true,  true,  0xFFFFn);
            case "CRC-16/MCRF4XX":           return this.crc(16n, input, 0x1021n, 0xFFFFn, true,  true,  0x0000n);
            case "CRC-16/MODBUS":            return this.crc(16n, input, 0x8005n, 0xFFFFn, true,  true,  0x0000n);
            case "CRC-16/NRSC-5":            return this.crc(16n, input, 0x080Bn, 0xFFFFn, true,  true,  0x0000n);
            case "CRC-16/OPENSAFETY-A":      return this.crc(16n, input, 0x5935n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/OPENSAFETY-B":      return this.crc(16n, input, 0x755Bn, 0x0000n, false, false, 0x0000n);
            case "CRC-16/PROFIBUS":          return this.crc(16n, input, 0x1DCFn, 0xFFFFn, false, false, 0xFFFFn);
            case "CRC-16/RIELLO":            return this.crc(16n, input, 0x1021n, 0xB2AAn, true,  true,  0x0000n);
            case "CRC-16/SPI-FUJITSU":       return this.crc(16n, input, 0x1021n, 0x1D0Fn, false, false, 0x0000n);
            case "CRC-16/T10-DIF":           return this.crc(16n, input, 0x8BB7n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/TELEDISK":          return this.crc(16n, input, 0xA097n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/TMS37157":          return this.crc(16n, input, 0x1021n, 0x89ECn, true,  true,  0x0000n);
            case "CRC-16/UMTS":              return this.crc(16n, input, 0x8005n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/USB":               return this.crc(16n, input, 0x8005n, 0xFFFFn, true,  true,  0xFFFFn);
            case "CRC-16/V-41-LSB":          return this.crc(16n, input, 0x1021n, 0x0000n, true,  true,  0x0000n);
            case "CRC-16/V-41-MSB":          return this.crc(16n, input, 0x1021n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/VERIFONE":          return this.crc(16n, input, 0x8005n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/X-25":              return this.crc(16n, input, 0x1021n, 0xFFFFn, true,  true,  0xFFFFn);
            case "CRC-16/XMODEM":            return this.crc(16n, input, 0x1021n, 0x0000n, false, false, 0x0000n);
            case "CRC-16/ZMODEM":            return this.crc(16n, input, 0x1021n, 0x0000n, false, false, 0x0000n);
            case "CRC-17/CAN-FD":            return this.crc(17n, input, 0x1685Bn, 0x00000n, false, false, 0x00000n);
            case "CRC-21/CAN-FD":            return this.crc(21n, input, 0x102899n, 0x000000n, false, false, 0x000000n);
            case "CRC-24/BLE":               return this.crc(24n, input, 0x00065Bn, 0x555555n, true,  true,  0x000000n);
            case "CRC-24/FLEXRAY-A":         return this.crc(24n, input, 0x5D6DCBn, 0xFEDCBAn, false, false, 0x000000n);
            case "CRC-24/FLEXRAY-B":         return this.crc(24n, input, 0x5D6DCBn, 0xABCDEFn, false, false, 0x000000n);
            case "CRC-24/INTERLAKEN":        return this.crc(24n, input, 0x328B63n, 0xFFFFFFn, false, false, 0xFFFFFFn);
            case "CRC-24/LTE-A":             return this.crc(24n, input, 0x864CFBn, 0x000000n, false, false, 0x000000n);
            case "CRC-24/LTE-B":             return this.crc(24n, input, 0x800063n, 0x000000n, false, false, 0x000000n);
            case "CRC-24/OPENPGP":           return this.crc(24n, input, 0x864CFBn, 0xB704CEn, false, false, 0x000000n);
            case "CRC-24/OS-9":              return this.crc(24n, input, 0x800063n, 0xFFFFFFn, false, false, 0xFFFFFFn);
            case "CRC-30/CDMA":              return this.crc(30n, input, 0x2030B9C7n, 0x3FFFFFFFn, false, false, 0x3FFFFFFFn);
            case "CRC-31/PHILIPS":           return this.crc(31n, input, 0x04C11DB7n, 0x7FFFFFFFn, false, false, 0x7FFFFFFFn);
            case "CRC-32":                   return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/AAL5":              return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, false, false, 0xFFFFFFFFn);
            case "CRC-32/ADCCP":             return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/AIXM":              return this.crc(32n, input, 0x814141ABn, 0x00000000n, false, false, 0x00000000n);
            case "CRC-32/AUTOSAR":           return this.crc(32n, input, 0xF4ACFB13n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/BASE91-C":          return this.crc(32n, input, 0x1EDC6F41n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/BASE91-D":          return this.crc(32n, input, 0xA833982Bn, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/BZIP2":             return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, false, false, 0xFFFFFFFFn);
            case "CRC-32/C":                 return this.crc(32n, input, 0x1EDC6F41n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/CASTAGNOLI":        return this.crc(32n, input, 0x1EDC6F41n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/CD-ROM-EDC":        return this.crc(32n, input, 0x8001801Bn, 0x00000000n, true,  true,  0x00000000n);
            case "CRC-32/CKSUM":             return this.crc(32n, input, 0x04C11DB7n, 0x00000000n, false, false, 0xFFFFFFFFn);
            case "CRC-32/D":                 return this.crc(32n, input, 0xA833982Bn, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/DECT-B":            return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, false, false, 0xFFFFFFFFn);
            case "CRC-32/INTERLAKEN":        return this.crc(32n, input, 0x1EDC6F41n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/ISCSI":             return this.crc(32n, input, 0x1EDC6F41n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/ISO-HDLC":          return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/JAMCRC":            return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, true,  true,  0x00000000n);
            case "CRC-32/MEF":               return this.crc(32n, input, 0x741B8CD7n, 0xFFFFFFFFn, true,  true,  0x00000000n);
            case "CRC-32/MPEG-2":            return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, false, false, 0x00000000n);
            case "CRC-32/NVME":              return this.crc(32n, input, 0x1EDC6F41n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/PKZIP":             return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/POSIX":             return this.crc(32n, input, 0x04C11DB7n, 0x00000000n, false, false, 0xFFFFFFFFn);
            case "CRC-32/Q":                 return this.crc(32n, input, 0x814141ABn, 0x00000000n, false, false, 0x00000000n);
            case "CRC-32/SATA":              return this.crc(32n, input, 0x04C11DB7n, 0x52325032n, false, false, 0x00000000n);
            case "CRC-32/V-42":              return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-32/XFER":              return this.crc(32n, input, 0x000000AFn, 0x00000000n, false, false, 0x00000000n);
            case "CRC-32/XZ":                return this.crc(32n, input, 0x04C11DB7n, 0xFFFFFFFFn, true,  true,  0xFFFFFFFFn);
            case "CRC-40/GSM":               return this.crc(40n, input, 0x0004820009n, 0x0000000000n, false, false, 0xFFFFFFFFFFn);
            case "CRC-64/ECMA-182":          return this.crc(64n, input, 0x42F0E1EBA9EA3693n, 0x0000000000000000n, false, false, 0x0000000000000000n);
            case "CRC-64/GO-ECMA":           return this.crc(64n, input, 0x42F0E1EBA9EA3693n, 0xFFFFFFFFFFFFFFFFn, true,  true,  0xFFFFFFFFFFFFFFFFn);
            case "CRC-64/GO-ISO":            return this.crc(64n, input, 0x000000000000001Bn, 0xFFFFFFFFFFFFFFFFn, true,  true,  0xFFFFFFFFFFFFFFFFn);
            case "CRC-64/MS":                return this.crc(64n, input, 0x259C84CBA6426349n, 0xFFFFFFFFFFFFFFFFn, true,  true,  0x0000000000000000n);
            case "CRC-64/NVME":              return this.crc(64n, input, 0xAD93D23594C93659n, 0xFFFFFFFFFFFFFFFFn, true,  true,  0xFFFFFFFFFFFFFFFFn);
            case "CRC-64/REDIS":             return this.crc(64n, input, 0xAD93D23594C935A9n, 0x0000000000000000n, true,  true,  0x0000000000000000n);
            case "CRC-64/WE":                return this.crc(64n, input, 0x42F0E1EBA9EA3693n, 0xFFFFFFFFFFFFFFFFn, false, false, 0xFFFFFFFFFFFFFFFFn);
            case "CRC-64/XZ":                return this.crc(64n, input, 0x42F0E1EBA9EA3693n, 0xFFFFFFFFFFFFFFFFn, true,  true,  0xFFFFFFFFFFFFFFFFn);
            case "CRC-82/DARC":              return this.crc(82n, input, 0x0308C0111011401440411n, 0x000000000000000000000n, true, true, 0x000000000000000000000n);
            default:                         throw new OperationError("Unknown checksum algorithm");
        }
    }

}

export default CRCChecksum;
