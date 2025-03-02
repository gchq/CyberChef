/**
 * @author r4mos [2k95ljkhg@mozmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib//TestRegister.mjs";

const BASIC_STRING = "The ships hung in the sky in much the same way that bricks don't.";
const UTF8_STR = "ნუ პანიკას";
const ALL_BYTES = [
    "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
    "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f",
    "\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f",
    "\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f",
    "\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f",
    "\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f",
    "\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f",
    "\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f",
    "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f",
    "\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f",
    "\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf",
    "\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf",
    "\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf",
    "\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf",
    "\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef",
    "\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
].join("");

TestRegister.addTests([
    {
        name: "CRC-16: nothing",
        input: "",
        expectedOutput: "0000",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16"]
            }
        ]
    },
    {
        name: "CRC-16: basic string",
        input: BASIC_STRING,
        expectedOutput: "0c70",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16"]
            }
        ]
    },
    {
        name: "CRC-16: UTF-8",
        input: UTF8_STR,
        expectedOutput: "dcf6",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16"]
            }
        ]
    },
    {
        name: "CRC-16: all bytes",
        input: ALL_BYTES,
        expectedOutput: "bad3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16"]
            }
        ]
    },
    {
        name: "CRC-32: nothing",
        input: "",
        expectedOutput: "00000000",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32"]
            }
        ]
    },
    {
        name: "CRC-32: basic string",
        input: BASIC_STRING,
        expectedOutput: "bf4b739c",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32"]
            }
        ]
    },
    {
        name: "CRC-32: UTF-8",
        input: UTF8_STR,
        expectedOutput: "87553290",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32"]
            }
        ]
    },
    {
        name: "CRC-32: all bytes",
        input: ALL_BYTES,
        expectedOutput: "29058c73",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32"]
            }
        ]
    },
    {
        name: "CRC-3/GSM check",
        input: "123456789",
        expectedOutput: "4",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-3/GSM"]
            }
        ]
    },
    {
        name: "CRC-3/ROHC check",
        input: "123456789",
        expectedOutput: "6",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-3/ROHC"]
            }
        ]
    },
    {
        name: "CRC-4/G-704 check",
        input: "123456789",
        expectedOutput: "7",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-4/G-704"]
            }
        ]
    },
    {
        name: "CRC-4/INTERLAKEN check",
        input: "123456789",
        expectedOutput: "b",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-4/INTERLAKEN"]
            }
        ]
    },
    {
        name: "CRC-4/ITU check",
        input: "123456789",
        expectedOutput: "7",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-4/ITU"]
            }
        ]
    },
    {
        name: "CRC-5/EPC check",
        input: "123456789",
        expectedOutput: "00",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-5/EPC"]
            }
        ]
    },
    {
        name: "CRC-5/EPC-C1G2 check",
        input: "123456789",
        expectedOutput: "00",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-5/EPC-C1G2"]
            }
        ]
    },
    {
        name: "CRC-5/G-704 check",
        input: "123456789",
        expectedOutput: "07",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-5/G-704"]
            }
        ]
    },
    {
        name: "CRC-5/ITU check",
        input: "123456789",
        expectedOutput: "07",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-5/ITU"]
            }
        ]
    },
    {
        name: "CRC-5/USB check",
        input: "123456789",
        expectedOutput: "19",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-5/USB"]
            }
        ]
    },
    {
        name: "CRC-6/CDMA2000-A check",
        input: "123456789",
        expectedOutput: "0d",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-6/CDMA2000-A"]
            }
        ]
    },
    {
        name: "CRC-6/CDMA2000-B check",
        input: "123456789",
        expectedOutput: "3b",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-6/CDMA2000-B"]
            }
        ]
    },
    {
        name: "CRC-6/DARC check",
        input: "123456789",
        expectedOutput: "26",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-6/DARC"]
            }
        ]
    },
    {
        name: "CRC-6/G-704 check",
        input: "123456789",
        expectedOutput: "06",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-6/G-704"]
            }
        ]
    },
    {
        name: "CRC-6/GSM check",
        input: "123456789",
        expectedOutput: "13",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-6/GSM"]
            }
        ]
    },
    {
        name: "CRC-6/ITU check",
        input: "123456789",
        expectedOutput: "06",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-6/ITU"]
            }
        ]
    },
    {
        name: "CRC-7/MMC check",
        input: "123456789",
        expectedOutput: "75",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-7/MMC"]
            }
        ]
    },
    {
        name: "CRC-7/ROHC check",
        input: "123456789",
        expectedOutput: "53",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-7/ROHC"]
            }
        ]
    },
    {
        name: "CRC-7/UMTS check",
        input: "123456789",
        expectedOutput: "61",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-7/UMTS"]
            }
        ]
    },
    {
        name: "CRC-8 check",
        input: "123456789",
        expectedOutput: "f4",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8"]
            }
        ]
    },
    {
        name: "CRC-8/8H2F check",
        input: "123456789",
        expectedOutput: "df",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/8H2F"]
            }
        ]
    },
    {
        name: "CRC-8/AES check",
        input: "123456789",
        expectedOutput: "97",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/AES"]
            }
        ]
    },
    {
        name: "CRC-8/AUTOSAR check",
        input: "123456789",
        expectedOutput: "df",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/AUTOSAR"]
            }
        ]
    },
    {
        name: "CRC-8/BLUETOOTH check",
        input: "123456789",
        expectedOutput: "26",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/BLUETOOTH"]
            }
        ]
    },
    {
        name: "CRC-8/CDMA2000 check",
        input: "123456789",
        expectedOutput: "da",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/CDMA2000"]
            }
        ]
    },
    {
        name: "CRC-8/DARC check",
        input: "123456789",
        expectedOutput: "15",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/DARC"]
            }
        ]
    },
    {
        name: "CRC-8/DVB-S2 check",
        input: "123456789",
        expectedOutput: "bc",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/DVB-S2"]
            }
        ]
    },
    {
        name: "CRC-8/EBU check",
        input: "123456789",
        expectedOutput: "97",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/EBU"]
            }
        ]
    },
    {
        name: "CRC-8/GSM-A check",
        input: "123456789",
        expectedOutput: "37",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/GSM-A"]
            }
        ]
    },
    {
        name: "CRC-8/GSM-B check",
        input: "123456789",
        expectedOutput: "94",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/GSM-B"]
            }
        ]
    },
    {
        name: "CRC-8/HITAG check",
        input: "123456789",
        expectedOutput: "b4",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/HITAG"]
            }
        ]
    },
    {
        name: "CRC-8/I-432-1 check",
        input: "123456789",
        expectedOutput: "a1",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/I-432-1"]
            }
        ]
    },
    {
        name: "CRC-8/I-CODE check",
        input: "123456789",
        expectedOutput: "7e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/I-CODE"]
            }
        ]
    },
    {
        name: "CRC-8/ITU check",
        input: "123456789",
        expectedOutput: "a1",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/ITU"]
            }
        ]
    },
    {
        name: "CRC-8/LTE check",
        input: "123456789",
        expectedOutput: "ea",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/LTE"]
            }
        ]
    },
    {
        name: "CRC-8/MAXIM check",
        input: "123456789",
        expectedOutput: "a1",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/MAXIM"]
            }
        ]
    },
    {
        name: "CRC-8/MAXIM-DOW check",
        input: "123456789",
        expectedOutput: "a1",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/MAXIM-DOW"]
            }
        ]
    },
    {
        name: "CRC-8/MIFARE-MAD check",
        input: "123456789",
        expectedOutput: "99",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/MIFARE-MAD"]
            }
        ]
    },
    {
        name: "CRC-8/NRSC-5 check",
        input: "123456789",
        expectedOutput: "f7",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/NRSC-5"]
            }
        ]
    },
    {
        name: "CRC-8/OPENSAFETY check",
        input: "123456789",
        expectedOutput: "3e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/OPENSAFETY"]
            }
        ]
    },
    {
        name: "CRC-8/ROHC check",
        input: "123456789",
        expectedOutput: "d0",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/ROHC"]
            }
        ]
    },
    {
        name: "CRC-8/SAE-J1850 check",
        input: "123456789",
        expectedOutput: "4b",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/SAE-J1850"]
            }
        ]
    },
    {
        name: "CRC-8/SAE-J1850-ZERO check",
        input: "123456789",
        expectedOutput: "37",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/SAE-J1850-ZERO"]
            }
        ]
    },
    {
        name: "CRC-8/SMBUS check",
        input: "123456789",
        expectedOutput: "f4",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/SMBUS"]
            }
        ]
    },
    {
        name: "CRC-8/TECH-3250 check",
        input: "123456789",
        expectedOutput: "97",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/TECH-3250"]
            }
        ]
    },
    {
        name: "CRC-8/WCDMA check",
        input: "123456789",
        expectedOutput: "25",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-8/WCDMA"]
            }
        ]
    },
    {
        name: "CRC-10/ATM check",
        input: "123456789",
        expectedOutput: "199",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-10/ATM"]
            }
        ]
    },
    {
        name: "CRC-10/CDMA2000 check",
        input: "123456789",
        expectedOutput: "233",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-10/CDMA2000"]
            }
        ]
    },
    {
        name: "CRC-10/GSM check",
        input: "123456789",
        expectedOutput: "12a",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-10/GSM"]
            }
        ]
    },
    {
        name: "CRC-10/I-610 check",
        input: "123456789",
        expectedOutput: "199",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-10/I-610"]
            }
        ]
    },
    {
        name: "CRC-11/FLEXRAY check",
        input: "123456789",
        expectedOutput: "5a3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-11/FLEXRAY"]
            }
        ]
    },
    {
        name: "CRC-11/UMTS check",
        input: "123456789",
        expectedOutput: "061",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-11/UMTS"]
            }
        ]
    },
    {
        name: "CRC-12/3GPP check",
        input: "123456789",
        expectedOutput: "daf",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-12/3GPP"]
            }
        ]
    },
    {
        name: "CRC-12/CDMA2000 check",
        input: "123456789",
        expectedOutput: "d4d",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-12/CDMA2000"]
            }
        ]
    },
    {
        name: "CRC-12/DECT check",
        input: "123456789",
        expectedOutput: "f5b",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-12/DECT"]
            }
        ]
    },
    {
        name: "CRC-12/GSM check",
        input: "123456789",
        expectedOutput: "b34",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-12/GSM"]
            }
        ]
    },
    {
        name: "CRC-12/UMTS check",
        input: "123456789",
        expectedOutput: "daf",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-12/UMTS"]
            }
        ]
    },
    {
        name: "CRC-13/BBC check",
        input: "123456789",
        expectedOutput: "04fa",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-13/BBC"]
            }
        ]
    },
    {
        name: "CRC-14/DARC check",
        input: "123456789",
        expectedOutput: "082d",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-14/DARC"]
            }
        ]
    },
    {
        name: "CRC-14/GSM check",
        input: "123456789",
        expectedOutput: "30ae",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-14/GSM"]
            }
        ]
    },
    {
        name: "CRC-15/CAN check",
        input: "123456789",
        expectedOutput: "059e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-15/CAN"]
            }
        ]
    },
    {
        name: "CRC-15/MPT1327 check",
        input: "123456789",
        expectedOutput: "2566",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-15/MPT1327"]
            }
        ]
    },
    {
        name: "CRC-16 check",
        input: "123456789",
        expectedOutput: "bb3d",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16"]
            }
        ]
    },
    {
        name: "CRC-16/A check",
        input: "123456789",
        expectedOutput: "bf05",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/A"]
            }
        ]
    },
    {
        name: "CRC-16/ACORN check",
        input: "123456789",
        expectedOutput: "31c3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/ACORN"]
            }
        ]
    },
    {
        name: "CRC-16/ARC check",
        input: "123456789",
        expectedOutput: "bb3d",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/ARC"]
            }
        ]
    },
    {
        name: "CRC-16/AUG-CCITT check",
        input: "123456789",
        expectedOutput: "e5cc",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/AUG-CCITT"]
            }
        ]
    },
    {
        name: "CRC-16/AUTOSAR check",
        input: "123456789",
        expectedOutput: "29b1",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/AUTOSAR"]
            }
        ]
    },
    {
        name: "CRC-16/B check",
        input: "123456789",
        expectedOutput: "906e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/B"]
            }
        ]
    },
    {
        name: "CRC-16/BLUETOOTH check",
        input: "123456789",
        expectedOutput: "2189",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/BLUETOOTH"]
            }
        ]
    },
    {
        name: "CRC-16/BUYPASS check",
        input: "123456789",
        expectedOutput: "fee8",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/BUYPASS"]
            }
        ]
    },
    {
        name: "CRC-16/CCITT check",
        input: "123456789",
        expectedOutput: "2189",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/CCITT"]
            }
        ]
    },
    {
        name: "CRC-16/CCITT-FALSE check",
        input: "123456789",
        expectedOutput: "29b1",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/CCITT-FALSE"]
            }
        ]
    },
    {
        name: "CRC-16/CCITT-TRUE check",
        input: "123456789",
        expectedOutput: "2189",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/CCITT-TRUE"]
            }
        ]
    },
    {
        name: "CRC-16/CCITT-ZERO check",
        input: "123456789",
        expectedOutput: "31c3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/CCITT-ZERO"]
            }
        ]
    },
    {
        name: "CRC-16/CDMA2000 check",
        input: "123456789",
        expectedOutput: "4c06",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/CDMA2000"]
            }
        ]
    },
    {
        name: "CRC-16/CMS check",
        input: "123456789",
        expectedOutput: "aee7",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/CMS"]
            }
        ]
    },
    {
        name: "CRC-16/DARC check",
        input: "123456789",
        expectedOutput: "d64e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/DARC"]
            }
        ]
    },
    {
        name: "CRC-16/DDS-110 check",
        input: "123456789",
        expectedOutput: "9ecf",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/DDS-110"]
            }
        ]
    },
    {
        name: "CRC-16/DECT-R check",
        input: "123456789",
        expectedOutput: "007e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/DECT-R"]
            }
        ]
    },
    {
        name: "CRC-16/DECT-X check",
        input: "123456789",
        expectedOutput: "007f",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/DECT-X"]
            }
        ]
    },
    {
        name: "CRC-16/DNP check",
        input: "123456789",
        expectedOutput: "ea82",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/DNP"]
            }
        ]
    },
    {
        name: "CRC-16/EN-13757 check",
        input: "123456789",
        expectedOutput: "c2b7",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/EN-13757"]
            }
        ]
    },
    {
        name: "CRC-16/EPC check",
        input: "123456789",
        expectedOutput: "d64e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/EPC"]
            }
        ]
    },
    {
        name: "CRC-16/EPC-C1G2 check",
        input: "123456789",
        expectedOutput: "d64e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/EPC-C1G2"]
            }
        ]
    },
    {
        name: "CRC-16/GENIBUS check",
        input: "123456789",
        expectedOutput: "d64e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/GENIBUS"]
            }
        ]
    },
    {
        name: "CRC-16/GSM check",
        input: "123456789",
        expectedOutput: "ce3c",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/GSM"]
            }
        ]
    },
    {
        name: "CRC-16/I-CODE check",
        input: "123456789",
        expectedOutput: "d64e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/I-CODE"]
            }
        ]
    },
    {
        name: "CRC-16/IBM check",
        input: "123456789",
        expectedOutput: "bb3d",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/IBM"]
            }
        ]
    },
    {
        name: "CRC-16/IBM-3740 check",
        input: "123456789",
        expectedOutput: "29b1",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/IBM-3740"]
            }
        ]
    },
    {
        name: "CRC-16/IBM-SDLC check",
        input: "123456789",
        expectedOutput: "906e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/IBM-SDLC"]
            }
        ]
    },
    {
        name: "CRC-16/IEC-61158-2 check",
        input: "123456789",
        expectedOutput: "a819",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/IEC-61158-2"]
            }
        ]
    },
    {
        name: "CRC-16/ISO-HDLC check",
        input: "123456789",
        expectedOutput: "906e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/ISO-HDLC"]
            }
        ]
    },
    {
        name: "CRC-16/ISO-IEC-14443-3-A check",
        input: "123456789",
        expectedOutput: "bf05",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/ISO-IEC-14443-3-A"]
            }
        ]
    },
    {
        name: "CRC-16/ISO-IEC-14443-3-B check",
        input: "123456789",
        expectedOutput: "906e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/ISO-IEC-14443-3-B"]
            }
        ]
    },
    {
        name: "CRC-16/KERMIT check",
        input: "123456789",
        expectedOutput: "2189",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/KERMIT"]
            }
        ]
    },
    {
        name: "CRC-16/LHA check",
        input: "123456789",
        expectedOutput: "bb3d",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/LHA"]
            }
        ]
    },
    {
        name: "CRC-16/LJ1200 check",
        input: "123456789",
        expectedOutput: "bdf4",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/LJ1200"]
            }
        ]
    },
    {
        name: "CRC-16/LTE check",
        input: "123456789",
        expectedOutput: "31c3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/LTE"]
            }
        ]
    },
    {
        name: "CRC-16/M17 check",
        input: "123456789",
        expectedOutput: "772b",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/M17"]
            }
        ]
    },
    {
        name: "CRC-16/MAXIM check",
        input: "123456789",
        expectedOutput: "44c2",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/MAXIM"]
            }
        ]
    },
    {
        name: "CRC-16/MAXIM-DOW check",
        input: "123456789",
        expectedOutput: "44c2",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/MAXIM-DOW"]
            }
        ]
    },
    {
        name: "CRC-16/MCRF4XX check",
        input: "123456789",
        expectedOutput: "6f91",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/MCRF4XX"]
            }
        ]
    },
    {
        name: "CRC-16/MODBUS check",
        input: "123456789",
        expectedOutput: "4b37",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/MODBUS"]
            }
        ]
    },
    {
        name: "CRC-16/NRSC-5 check",
        input: "123456789",
        expectedOutput: "a066",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/NRSC-5"]
            }
        ]
    },
    {
        name: "CRC-16/OPENSAFETY-A check",
        input: "123456789",
        expectedOutput: "5d38",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/OPENSAFETY-A"]
            }
        ]
    },
    {
        name: "CRC-16/OPENSAFETY-B check",
        input: "123456789",
        expectedOutput: "20fe",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/OPENSAFETY-B"]
            }
        ]
    },
    {
        name: "CRC-16/PROFIBUS check",
        input: "123456789",
        expectedOutput: "a819",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/PROFIBUS"]
            }
        ]
    },
    {
        name: "CRC-16/RIELLO check",
        input: "123456789",
        expectedOutput: "63d0",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/RIELLO"]
            }
        ]
    },
    {
        name: "CRC-16/SPI-FUJITSU check",
        input: "123456789",
        expectedOutput: "e5cc",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/SPI-FUJITSU"]
            }
        ]
    },
    {
        name: "CRC-16/T10-DIF check",
        input: "123456789",
        expectedOutput: "d0db",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/T10-DIF"]
            }
        ]
    },
    {
        name: "CRC-16/TELEDISK check",
        input: "123456789",
        expectedOutput: "0fb3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/TELEDISK"]
            }
        ]
    },
    {
        name: "CRC-16/TMS37157 check",
        input: "123456789",
        expectedOutput: "26b1",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/TMS37157"]
            }
        ]
    },
    {
        name: "CRC-16/UMTS check",
        input: "123456789",
        expectedOutput: "fee8",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/UMTS"]
            }
        ]
    },
    {
        name: "CRC-16/USB check",
        input: "123456789",
        expectedOutput: "b4c8",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/USB"]
            }
        ]
    },
    {
        name: "CRC-16/V-41-LSB check",
        input: "123456789",
        expectedOutput: "2189",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/V-41-LSB"]
            }
        ]
    },
    {
        name: "CRC-16/V-41-MSB check",
        input: "123456789",
        expectedOutput: "31c3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/V-41-MSB"]
            }
        ]
    },
    {
        name: "CRC-16/VERIFONE check",
        input: "123456789",
        expectedOutput: "fee8",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/VERIFONE"]
            }
        ]
    },
    {
        name: "CRC-16/X-25 check",
        input: "123456789",
        expectedOutput: "906e",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/X-25"]
            }
        ]
    },
    {
        name: "CRC-16/XMODEM check",
        input: "123456789",
        expectedOutput: "31c3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/XMODEM"]
            }
        ]
    },
    {
        name: "CRC-16/ZMODEM check",
        input: "123456789",
        expectedOutput: "31c3",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-16/ZMODEM"]
            }
        ]
    },
    {
        name: "CRC-17/CAN-FD check",
        input: "123456789",
        expectedOutput: "04f03",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-17/CAN-FD"]
            }
        ]
    },
    {
        name: "CRC-21/CAN-FD check",
        input: "123456789",
        expectedOutput: "0ed841",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-21/CAN-FD"]
            }
        ]
    },
    {
        name: "CRC-24/BLE check",
        input: "123456789",
        expectedOutput: "c25a56",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-24/BLE"]
            }
        ]
    },
    {
        name: "CRC-24/FLEXRAY-A check",
        input: "123456789",
        expectedOutput: "7979bd",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-24/FLEXRAY-A"]
            }
        ]
    },
    {
        name: "CRC-24/FLEXRAY-B check",
        input: "123456789",
        expectedOutput: "1f23b8",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-24/FLEXRAY-B"]
            }
        ]
    },
    {
        name: "CRC-24/INTERLAKEN check",
        input: "123456789",
        expectedOutput: "b4f3e6",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-24/INTERLAKEN"]
            }
        ]
    },
    {
        name: "CRC-24/LTE-A check",
        input: "123456789",
        expectedOutput: "cde703",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-24/LTE-A"]
            }
        ]
    },
    {
        name: "CRC-24/LTE-B check",
        input: "123456789",
        expectedOutput: "23ef52",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-24/LTE-B"]
            }
        ]
    },
    {
        name: "CRC-24/OPENPGP check",
        input: "123456789",
        expectedOutput: "21cf02",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-24/OPENPGP"]
            }
        ]
    },
    {
        name: "CRC-24/OS-9 check",
        input: "123456789",
        expectedOutput: "200fa5",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-24/OS-9"]
            }
        ]
    },
    {
        name: "CRC-30/CDMA check",
        input: "123456789",
        expectedOutput: "04c34abf",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-30/CDMA"]
            }
        ]
    },
    {
        name: "CRC-31/PHILIPS check",
        input: "123456789",
        expectedOutput: "0ce9e46c",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-31/PHILIPS"]
            }
        ]
    },
    {
        name: "CRC-32 check",
        input: "123456789",
        expectedOutput: "cbf43926",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32"]
            }
        ]
    },
    {
        name: "CRC-32/AAL5 check",
        input: "123456789",
        expectedOutput: "fc891918",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/AAL5"]
            }
        ]
    },
    {
        name: "CRC-32/ADCCP check",
        input: "123456789",
        expectedOutput: "cbf43926",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/ADCCP"]
            }
        ]
    },
    {
        name: "CRC-32/AIXM check",
        input: "123456789",
        expectedOutput: "3010bf7f",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/AIXM"]
            }
        ]
    },
    {
        name: "CRC-32/AUTOSAR check",
        input: "123456789",
        expectedOutput: "1697d06a",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/AUTOSAR"]
            }
        ]
    },
    {
        name: "CRC-32/BASE91-C check",
        input: "123456789",
        expectedOutput: "e3069283",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/BASE91-C"]
            }
        ]
    },
    {
        name: "CRC-32/BASE91-D check",
        input: "123456789",
        expectedOutput: "87315576",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/BASE91-D"]
            }
        ]
    },
    {
        name: "CRC-32/BZIP2 check",
        input: "123456789",
        expectedOutput: "fc891918",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/BZIP2"]
            }
        ]
    },
    {
        name: "CRC-32/C check",
        input: "123456789",
        expectedOutput: "e3069283",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/C"]
            }
        ]
    },
    {
        name: "CRC-32/CASTAGNOLI check",
        input: "123456789",
        expectedOutput: "e3069283",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/CASTAGNOLI"]
            }
        ]
    },
    {
        name: "CRC-32/CD-ROM-EDC check",
        input: "123456789",
        expectedOutput: "6ec2edc4",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/CD-ROM-EDC"]
            }
        ]
    },
    {
        name: "CRC-32/CKSUM check",
        input: "123456789",
        expectedOutput: "765e7680",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/CKSUM"]
            }
        ]
    },
    {
        name: "CRC-32/D check",
        input: "123456789",
        expectedOutput: "87315576",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/D"]
            }
        ]
    },
    {
        name: "CRC-32/DECT-B check",
        input: "123456789",
        expectedOutput: "fc891918",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/DECT-B"]
            }
        ]
    },
    {
        name: "CRC-32/INTERLAKEN check",
        input: "123456789",
        expectedOutput: "e3069283",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/INTERLAKEN"]
            }
        ]
    },
    {
        name: "CRC-32/ISCSI check",
        input: "123456789",
        expectedOutput: "e3069283",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/ISCSI"]
            }
        ]
    },
    {
        name: "CRC-32/ISO-HDLC check",
        input: "123456789",
        expectedOutput: "cbf43926",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/ISO-HDLC"]
            }
        ]
    },
    {
        name: "CRC-32/JAMCRC check",
        input: "123456789",
        expectedOutput: "340bc6d9",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/JAMCRC"]
            }
        ]
    },
    {
        name: "CRC-32/MEF check",
        input: "123456789",
        expectedOutput: "d2c22f51",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/MEF"]
            }
        ]
    },
    {
        name: "CRC-32/MPEG-2 check",
        input: "123456789",
        expectedOutput: "0376e6e7",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/MPEG-2"]
            }
        ]
    },
    {
        name: "CRC-32/NVME check",
        input: "123456789",
        expectedOutput: "e3069283",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/NVME"]
            }
        ]
    },
    {
        name: "CRC-32/PKZIP check",
        input: "123456789",
        expectedOutput: "cbf43926",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/PKZIP"]
            }
        ]
    },
    {
        name: "CRC-32/POSIX check",
        input: "123456789",
        expectedOutput: "765e7680",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/POSIX"]
            }
        ]
    },
    {
        name: "CRC-32/Q check",
        input: "123456789",
        expectedOutput: "3010bf7f",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/Q"]
            }
        ]
    },
    {
        name: "CRC-32/SATA check",
        input: "123456789",
        expectedOutput: "cf72afe8",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/SATA"]
            }
        ]
    },
    {
        name: "CRC-32/V-42 check",
        input: "123456789",
        expectedOutput: "cbf43926",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/V-42"]
            }
        ]
    },
    {
        name: "CRC-32/XFER check",
        input: "123456789",
        expectedOutput: "bd0be338",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/XFER"]
            }
        ]
    },
    {
        name: "CRC-32/XZ check",
        input: "123456789",
        expectedOutput: "cbf43926",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-32/XZ"]
            }
        ]
    },
    {
        name: "CRC-40/GSM check",
        input: "123456789",
        expectedOutput: "d4164fc646",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-40/GSM"]
            }
        ]
    },
    {
        name: "CRC-64/ECMA-182 check",
        input: "123456789",
        expectedOutput: "6c40df5f0b497347",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-64/ECMA-182"]
            }
        ]
    },
    {
        name: "CRC-64/GO-ECMA check",
        input: "123456789",
        expectedOutput: "995dc9bbdf1939fa",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-64/GO-ECMA"]
            }
        ]
    },
    {
        name: "CRC-64/GO-ISO check",
        input: "123456789",
        expectedOutput: "b90956c775a41001",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-64/GO-ISO"]
            }
        ]
    },
    {
        name: "CRC-64/MS check",
        input: "123456789",
        expectedOutput: "75d4b74f024eceea",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-64/MS"]
            }
        ]
    },
    {
        name: "CRC-64/NVME check",
        input: "123456789",
        expectedOutput: "ae8b14860a799888",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-64/NVME"]
            }
        ]
    },
    {
        name: "CRC-64/REDIS check",
        input: "123456789",
        expectedOutput: "e9c6d914c4b8d9ca",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-64/REDIS"]
            }
        ]
    },
    {
        name: "CRC-64/WE check",
        input: "123456789",
        expectedOutput: "62ec59e3f1a4f00a",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-64/WE"]
            }
        ]
    },
    {
        name: "CRC-64/XZ check",
        input: "123456789",
        expectedOutput: "995dc9bbdf1939fa",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-64/XZ"]
            }
        ]
    },
    {
        name: "CRC-82/DARC check",
        input: "123456789",
        expectedOutput: "09ea83f625023801fd612",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-82/DARC"]
            }
        ]
    }
]);
