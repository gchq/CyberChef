/**
 * GenerateAllChecksums tests.
 *
 * @author r4mos [2k95ljkhg@mozmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const CHECK_STRING = "123456789";

TestRegister.addTests([
    {
        name: "Full generate all checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-3/GSM:                4
CRC-3/ROHC:               6
CRC-4/G-704:              7
CRC-4/INTERLAKEN:         b
CRC-4/ITU:                7
CRC-5/EPC:                00
CRC-5/EPC-C1G2:           00
CRC-5/G-704:              07
CRC-5/ITU:                07
CRC-5/USB:                19
CRC-6/CDMA2000-A:         0d
CRC-6/CDMA2000-B:         3b
CRC-6/DARC:               26
CRC-6/G-704:              06
CRC-6/GSM:                13
CRC-6/ITU:                06
CRC-7/MMC:                75
CRC-7/ROHC:               53
CRC-7/UMTS:               61
CRC-8:                    f4
CRC-8/8H2F:               df
CRC-8/AES:                97
CRC-8/AUTOSAR:            df
CRC-8/BLUETOOTH:          26
CRC-8/CDMA2000:           da
CRC-8/DARC:               15
CRC-8/DVB-S2:             bc
CRC-8/EBU:                97
CRC-8/GSM-A:              37
CRC-8/GSM-B:              94
CRC-8/HITAG:              b4
CRC-8/I-432-1:            a1
CRC-8/I-CODE:             7e
CRC-8/ITU:                a1
CRC-8/LTE:                ea
CRC-8/MAXIM:              a1
CRC-8/MAXIM-DOW:          a1
CRC-8/MIFARE-MAD:         99
CRC-8/NRSC-5:             f7
CRC-8/OPENSAFETY:         3e
CRC-8/ROHC:               d0
CRC-8/SAE-J1850:          4b
CRC-8/SAE-J1850-ZERO:     37
CRC-8/SMBUS:              f4
CRC-8/TECH-3250:          97
CRC-8/WCDMA:              25
Fletcher-8:               0c
CRC-10/ATM:               199
CRC-10/CDMA2000:          233
CRC-10/GSM:               12a
CRC-10/I-610:             199
CRC-11/FLEXRAY:           5a3
CRC-11/UMTS:              061
CRC-12/3GPP:              daf
CRC-12/CDMA2000:          d4d
CRC-12/DECT:              f5b
CRC-12/GSM:               b34
CRC-12/UMTS:              daf
CRC-13/BBC:               04fa
CRC-14/DARC:              082d
CRC-14/GSM:               30ae
CRC-15/CAN:               059e
CRC-15/MPT1327:           2566
CRC-16:                   bb3d
CRC-16/A:                 bf05
CRC-16/ACORN:             31c3
CRC-16/ARC:               bb3d
CRC-16/AUG-CCITT:         e5cc
CRC-16/AUTOSAR:           29b1
CRC-16/B:                 906e
CRC-16/BLUETOOTH:         2189
CRC-16/BUYPASS:           fee8
CRC-16/CCITT:             2189
CRC-16/CCITT-FALSE:       29b1
CRC-16/CCITT-TRUE:        2189
CRC-16/CCITT-ZERO:        31c3
CRC-16/CDMA2000:          4c06
CRC-16/CMS:               aee7
CRC-16/DARC:              d64e
CRC-16/DDS-110:           9ecf
CRC-16/DECT-R:            007e
CRC-16/DECT-X:            007f
CRC-16/DNP:               ea82
CRC-16/EN-13757:          c2b7
CRC-16/EPC:               d64e
CRC-16/EPC-C1G2:          d64e
CRC-16/GENIBUS:           d64e
CRC-16/GSM:               ce3c
CRC-16/I-CODE:            d64e
CRC-16/IBM:               bb3d
CRC-16/IBM-3740:          29b1
CRC-16/IBM-SDLC:          906e
CRC-16/IEC-61158-2:       a819
CRC-16/ISO-HDLC:          906e
CRC-16/ISO-IEC-14443-3-A: bf05
CRC-16/ISO-IEC-14443-3-B: 906e
CRC-16/KERMIT:            2189
CRC-16/LHA:               bb3d
CRC-16/LJ1200:            bdf4
CRC-16/LTE:               31c3
CRC-16/M17:               772b
CRC-16/MAXIM:             44c2
CRC-16/MAXIM-DOW:         44c2
CRC-16/MCRF4XX:           6f91
CRC-16/MODBUS:            4b37
CRC-16/NRSC-5:            a066
CRC-16/OPENSAFETY-A:      5d38
CRC-16/OPENSAFETY-B:      20fe
CRC-16/PROFIBUS:          a819
CRC-16/RIELLO:            63d0
CRC-16/SPI-FUJITSU:       e5cc
CRC-16/T10-DIF:           d0db
CRC-16/TELEDISK:          0fb3
CRC-16/TMS37157:          26b1
CRC-16/UMTS:              fee8
CRC-16/USB:               b4c8
CRC-16/V-41-LSB:          2189
CRC-16/V-41-MSB:          31c3
CRC-16/VERIFONE:          fee8
CRC-16/X-25:              906e
CRC-16/XMODEM:            31c3
CRC-16/ZMODEM:            31c3
Fletcher-16:              1ede
CRC-17/CAN-FD:            04f03
CRC-21/CAN-FD:            0ed841
CRC-24/BLE:               c25a56
CRC-24/FLEXRAY-A:         7979bd
CRC-24/FLEXRAY-B:         1f23b8
CRC-24/INTERLAKEN:        b4f3e6
CRC-24/LTE-A:             cde703
CRC-24/LTE-B:             23ef52
CRC-24/OPENPGP:           21cf02
CRC-24/OS-9:              200fa5
CRC-30/CDMA:              04c34abf
CRC-31/PHILIPS:           0ce9e46c
Adler-32:                 091e01de
CRC-32:                   cbf43926
CRC-32/AAL5:              fc891918
CRC-32/ADCCP:             cbf43926
CRC-32/AIXM:              3010bf7f
CRC-32/AUTOSAR:           1697d06a
CRC-32/BASE91-C:          e3069283
CRC-32/BASE91-D:          87315576
CRC-32/BZIP2:             fc891918
CRC-32/C:                 e3069283
CRC-32/CASTAGNOLI:        e3069283
CRC-32/CD-ROM-EDC:        6ec2edc4
CRC-32/CKSUM:             765e7680
CRC-32/D:                 87315576
CRC-32/DECT-B:            fc891918
CRC-32/INTERLAKEN:        e3069283
CRC-32/ISCSI:             e3069283
CRC-32/ISO-HDLC:          cbf43926
CRC-32/JAMCRC:            340bc6d9
CRC-32/MEF:               d2c22f51
CRC-32/MPEG-2:            0376e6e7
CRC-32/NVME:              e3069283
CRC-32/PKZIP:             cbf43926
CRC-32/POSIX:             765e7680
CRC-32/Q:                 3010bf7f
CRC-32/SATA:              cf72afe8
CRC-32/V-42:              cbf43926
CRC-32/XFER:              bd0be338
CRC-32/XZ:                cbf43926
Fletcher-32:              df09d509
CRC-40/GSM:               d4164fc646
CRC-64/ECMA-182:          6c40df5f0b497347
CRC-64/GO-ECMA:           995dc9bbdf1939fa
CRC-64/GO-ISO:            b90956c775a41001
CRC-64/MS:                75d4b74f024eceea
CRC-64/NVME:              ae8b14860a799888
CRC-64/REDIS:             e9c6d914c4b8d9ca
CRC-64/WE:                62ec59e3f1a4f00a
CRC-64/XZ:                995dc9bbdf1939fa
Fletcher-64:              0d0803376c6a689f
CRC-82/DARC:              09ea83f625023801fd612
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["All", true]
            }
        ]
    },
    {
        name: "Full generate all checksums without name",
        input: CHECK_STRING,
        expectedOutput: `4
6
7
b
7
00
00
07
07
19
0d
3b
26
06
13
06
75
53
61
f4
df
97
df
26
da
15
bc
97
37
94
b4
a1
7e
a1
ea
a1
a1
99
f7
3e
d0
4b
37
f4
97
25
0c
199
233
12a
199
5a3
061
daf
d4d
f5b
b34
daf
04fa
082d
30ae
059e
2566
bb3d
bf05
31c3
bb3d
e5cc
29b1
906e
2189
fee8
2189
29b1
2189
31c3
4c06
aee7
d64e
9ecf
007e
007f
ea82
c2b7
d64e
d64e
d64e
ce3c
d64e
bb3d
29b1
906e
a819
906e
bf05
906e
2189
bb3d
bdf4
31c3
772b
44c2
44c2
6f91
4b37
a066
5d38
20fe
a819
63d0
e5cc
d0db
0fb3
26b1
fee8
b4c8
2189
31c3
fee8
906e
31c3
31c3
1ede
04f03
0ed841
c25a56
7979bd
1f23b8
b4f3e6
cde703
23ef52
21cf02
200fa5
04c34abf
0ce9e46c
091e01de
cbf43926
fc891918
cbf43926
3010bf7f
1697d06a
e3069283
87315576
fc891918
e3069283
e3069283
6ec2edc4
765e7680
87315576
fc891918
e3069283
e3069283
cbf43926
340bc6d9
d2c22f51
0376e6e7
e3069283
cbf43926
765e7680
3010bf7f
cf72afe8
cbf43926
bd0be338
cbf43926
df09d509
d4164fc646
6c40df5f0b497347
995dc9bbdf1939fa
b90956c775a41001
75d4b74f024eceea
ae8b14860a799888
e9c6d914c4b8d9ca
62ec59e3f1a4f00a
995dc9bbdf1939fa
0d0803376c6a689f
09ea83f625023801fd612
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["All", false]
            }
        ]
    },
    {
        name: "Full generate 3 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-3/GSM:                4
CRC-3/ROHC:               6
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["3", true]
            }
        ]
    },
    {
        name: "Full generate 4 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-4/G-704:              7
CRC-4/INTERLAKEN:         b
CRC-4/ITU:                7
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["4", true]
            }
        ]
    },
    {
        name: "Full generate 5 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-5/EPC:                00
CRC-5/EPC-C1G2:           00
CRC-5/G-704:              07
CRC-5/ITU:                07
CRC-5/USB:                19
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["5", true]
            }
        ]
    },
    {
        name: "Full generate 6 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-6/CDMA2000-A:         0d
CRC-6/CDMA2000-B:         3b
CRC-6/DARC:               26
CRC-6/G-704:              06
CRC-6/GSM:                13
CRC-6/ITU:                06
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["6", true]
            }
        ]
    },
    {
        name: "Full generate 7 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-7/MMC:                75
CRC-7/ROHC:               53
CRC-7/UMTS:               61
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["7", true]
            }
        ]
    },
    {
        name: "Full generate 8 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-8:                    f4
CRC-8/8H2F:               df
CRC-8/AES:                97
CRC-8/AUTOSAR:            df
CRC-8/BLUETOOTH:          26
CRC-8/CDMA2000:           da
CRC-8/DARC:               15
CRC-8/DVB-S2:             bc
CRC-8/EBU:                97
CRC-8/GSM-A:              37
CRC-8/GSM-B:              94
CRC-8/HITAG:              b4
CRC-8/I-432-1:            a1
CRC-8/I-CODE:             7e
CRC-8/ITU:                a1
CRC-8/LTE:                ea
CRC-8/MAXIM:              a1
CRC-8/MAXIM-DOW:          a1
CRC-8/MIFARE-MAD:         99
CRC-8/NRSC-5:             f7
CRC-8/OPENSAFETY:         3e
CRC-8/ROHC:               d0
CRC-8/SAE-J1850:          4b
CRC-8/SAE-J1850-ZERO:     37
CRC-8/SMBUS:              f4
CRC-8/TECH-3250:          97
CRC-8/WCDMA:              25
Fletcher-8:               0c
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["8", true]
            }
        ]
    },
    {
        name: "Full generate 10 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-10/ATM:               199
CRC-10/CDMA2000:          233
CRC-10/GSM:               12a
CRC-10/I-610:             199
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["10", true]
            }
        ]
    },
    {
        name: "Full generate 11 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-11/FLEXRAY:           5a3
CRC-11/UMTS:              061
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["11", true]
            }
        ]
    },
    {
        name: "Full generate 12 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-12/3GPP:              daf
CRC-12/CDMA2000:          d4d
CRC-12/DECT:              f5b
CRC-12/GSM:               b34
CRC-12/UMTS:              daf
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["12", true]
            }
        ]
    },
    {
        name: "Full generate 13 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-13/BBC:               04fa
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["13", true]
            }
        ]
    },
    {
        name: "Full generate 14 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-14/DARC:              082d
CRC-14/GSM:               30ae
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["14", true]
            }
        ]
    },
    {
        name: "Full generate 15 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-15/CAN:               059e
CRC-15/MPT1327:           2566
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["15", true]
            }
        ]
    },
    {
        name: "Full generate 16 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-16:                   bb3d
CRC-16/A:                 bf05
CRC-16/ACORN:             31c3
CRC-16/ARC:               bb3d
CRC-16/AUG-CCITT:         e5cc
CRC-16/AUTOSAR:           29b1
CRC-16/B:                 906e
CRC-16/BLUETOOTH:         2189
CRC-16/BUYPASS:           fee8
CRC-16/CCITT:             2189
CRC-16/CCITT-FALSE:       29b1
CRC-16/CCITT-TRUE:        2189
CRC-16/CCITT-ZERO:        31c3
CRC-16/CDMA2000:          4c06
CRC-16/CMS:               aee7
CRC-16/DARC:              d64e
CRC-16/DDS-110:           9ecf
CRC-16/DECT-R:            007e
CRC-16/DECT-X:            007f
CRC-16/DNP:               ea82
CRC-16/EN-13757:          c2b7
CRC-16/EPC:               d64e
CRC-16/EPC-C1G2:          d64e
CRC-16/GENIBUS:           d64e
CRC-16/GSM:               ce3c
CRC-16/I-CODE:            d64e
CRC-16/IBM:               bb3d
CRC-16/IBM-3740:          29b1
CRC-16/IBM-SDLC:          906e
CRC-16/IEC-61158-2:       a819
CRC-16/ISO-HDLC:          906e
CRC-16/ISO-IEC-14443-3-A: bf05
CRC-16/ISO-IEC-14443-3-B: 906e
CRC-16/KERMIT:            2189
CRC-16/LHA:               bb3d
CRC-16/LJ1200:            bdf4
CRC-16/LTE:               31c3
CRC-16/M17:               772b
CRC-16/MAXIM:             44c2
CRC-16/MAXIM-DOW:         44c2
CRC-16/MCRF4XX:           6f91
CRC-16/MODBUS:            4b37
CRC-16/NRSC-5:            a066
CRC-16/OPENSAFETY-A:      5d38
CRC-16/OPENSAFETY-B:      20fe
CRC-16/PROFIBUS:          a819
CRC-16/RIELLO:            63d0
CRC-16/SPI-FUJITSU:       e5cc
CRC-16/T10-DIF:           d0db
CRC-16/TELEDISK:          0fb3
CRC-16/TMS37157:          26b1
CRC-16/UMTS:              fee8
CRC-16/USB:               b4c8
CRC-16/V-41-LSB:          2189
CRC-16/V-41-MSB:          31c3
CRC-16/VERIFONE:          fee8
CRC-16/X-25:              906e
CRC-16/XMODEM:            31c3
CRC-16/ZMODEM:            31c3
Fletcher-16:              1ede
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["16", true]
            }
        ]
    },
    {
        name: "Full generate 17 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-17/CAN-FD:            04f03
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["17", true]
            }
        ]
    },
    {
        name: "Full generate 21 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-21/CAN-FD:            0ed841
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["21", true]
            }
        ]
    },
    {
        name: "Full generate 24 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-24/BLE:               c25a56
CRC-24/FLEXRAY-A:         7979bd
CRC-24/FLEXRAY-B:         1f23b8
CRC-24/INTERLAKEN:        b4f3e6
CRC-24/LTE-A:             cde703
CRC-24/LTE-B:             23ef52
CRC-24/OPENPGP:           21cf02
CRC-24/OS-9:              200fa5
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["24", true]
            }
        ]
    },
    {
        name: "Full generate 30 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-30/CDMA:              04c34abf
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["30", true]
            }
        ]
    },
    {
        name: "Full generate 31 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-31/PHILIPS:           0ce9e46c
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["31", true]
            }
        ]
    },
    {
        name: "Full generate 32 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `Adler-32:                 091e01de
CRC-32:                   cbf43926
CRC-32/AAL5:              fc891918
CRC-32/ADCCP:             cbf43926
CRC-32/AIXM:              3010bf7f
CRC-32/AUTOSAR:           1697d06a
CRC-32/BASE91-C:          e3069283
CRC-32/BASE91-D:          87315576
CRC-32/BZIP2:             fc891918
CRC-32/C:                 e3069283
CRC-32/CASTAGNOLI:        e3069283
CRC-32/CD-ROM-EDC:        6ec2edc4
CRC-32/CKSUM:             765e7680
CRC-32/D:                 87315576
CRC-32/DECT-B:            fc891918
CRC-32/INTERLAKEN:        e3069283
CRC-32/ISCSI:             e3069283
CRC-32/ISO-HDLC:          cbf43926
CRC-32/JAMCRC:            340bc6d9
CRC-32/MEF:               d2c22f51
CRC-32/MPEG-2:            0376e6e7
CRC-32/NVME:              e3069283
CRC-32/PKZIP:             cbf43926
CRC-32/POSIX:             765e7680
CRC-32/Q:                 3010bf7f
CRC-32/SATA:              cf72afe8
CRC-32/V-42:              cbf43926
CRC-32/XFER:              bd0be338
CRC-32/XZ:                cbf43926
Fletcher-32:              df09d509
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["32", true]
            }
        ]
    },
    {
        name: "Full generate 40 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-40/GSM:               d4164fc646
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["40", true]
            }
        ]
    },
    {
        name: "Full generate 64 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-64/ECMA-182:          6c40df5f0b497347
CRC-64/GO-ECMA:           995dc9bbdf1939fa
CRC-64/GO-ISO:            b90956c775a41001
CRC-64/MS:                75d4b74f024eceea
CRC-64/NVME:              ae8b14860a799888
CRC-64/REDIS:             e9c6d914c4b8d9ca
CRC-64/WE:                62ec59e3f1a4f00a
CRC-64/XZ:                995dc9bbdf1939fa
Fletcher-64:              0d0803376c6a689f
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["64", true]
            }
        ]
    },
    {
        name: "Full generate 82 bits checksums with name",
        input: CHECK_STRING,
        expectedOutput: `CRC-82/DARC:              09ea83f625023801fd612
`,
        recipeConfig: [
            {
                "op": "Generate all checksums",
                "args": ["82", true]
            }
        ]
    }
]);
