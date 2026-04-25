/**
 * Executables in various formats for use in tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

/**
 * ---------------ELF Header---------------
 * 7f454c46         - Magic:            .ELF
 * 01               - Format:           32 bit
 * 01               - Endianness:       Little
 * 01               - ELF Version:      1
 * 00               - Target ABI:       System V
 * 00               - ABI Version:      0
 * 00000000000000   - Padding
 * 0200             - File Type:        Executable File
 * 0300             - ISA:              x86
 * 01000000         - ELF Version:      1
 * 50210608         - Entry Point:      0x8062150
 * 34000000         - PH Offset:        0x34
 * 54000000         - SH Offset:        0x54
 * 00000000         - Flags:            0
 * 3400             - ELF Header Size:  0x34
 * 2000             - PH Header Size:   0x20
 * 0100             - PH Entries:       1
 * 2800             - SH Size:          0x28
 * 0300             - SH Entries:       0x3
 * 0000             - SH Names Offset:  0x0
 *
 * -------------Program Header-------------
 * 06000000         - PH Type:          Program Header Table
 * 34000000         - Segment Offset:   0x34
 * 34800408         - VAddr of segment: 134512692
 * 34800408         - PAddr of segment: 134512692
 * 00010000         - Size of segment:  256
 * 00010000         - Size of segment:  256
 * 05000000         - Flags:            Execute,Read
 * 04000000         - Alignment
 *
 * --------------SH .shstrtab--------------
 * 00000000         - SH Name Offset:   0
 * 03000000         - SH Type:          String Table
 * 00000000         - Flags:
 * 00000000         - VAddr of section: 0
 * cc000000         - Section offset:   204
 * 1c000000         - Section size:     28
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 00000000         - Alignment
 * 00000000         - Entry Size:       0
 *
 * ---------------SH .symtab---------------
 * 09000000         - SH Name Offset:   9
 * 02000000         - SH Type:          Symbol Table
 * 00000000         - Flags:
 * 00000000         - VAddr of section: 0
 * e6000000         - Section offset:   230
 * 10000000         - Section size:     16
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 00000000         - Alignment
 * 10000000         - Entry Size:       16
 *
 * ---------------SH .strtab---------------
 * 11000000         - SH Name Offset:   17
 * 03000000         - SH Type:          String Table
 * 00000000         - Flags:
 * 00000000         - VAddr of section: 0
 * f5000000         - Section offset:   245
 * 04000000         - Section size:     4
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 00000000         - Alignment
 * 00000000         - Entry Size:       0
 *
 * ---------------.shstrtab---------------
 * 2e73687374726162002e73796d746162002e73747274616200 - .shstrab\0.symtab\0.strtab\0
 *
 * ----------------.symtab----------------
 * 00000000         - Name Offset:      0
 * 00000000         - Value:            0
 * 00000000         - Size:             0
 * 00               - Info
 * 00               - other
 * 0000             - shdx
 *
 * ----------------.strtab----------------
 * 74657374         - test
 */
export const ELF32_LE = "7f454c46010101000000000000000000020003000100000050210608340000005400000000000000340020000100280003000000" +
                        "0600000034000000348004083480040800010000000100000500000004000000" +
                        "00000000030000000000000000000000cc0000001c00000000000000000000000000000000000000" +
                        "09000000020000000000000000000000e60000001000000000000000000000000000000010000000" +
                        "11000000030000000000000000000000f50000000400000000000000000000000000000000000000" +
                        "2e73687374726162002e73796d746162002e73747274616200" +
                        "00000000000000000000000000000000" +
                        "74657374";

/**
 * ---------------ELF Header---------------
 * 7f454c46         - Magic:            .ELF
 * 01               - Format:           32 bit
 * 02               - Endianness:       Big
 * 01               - ELF Version:      1
 * 00               - Target ABI:       System V
 * 00               - ABI Version:      0
 * 00000000000000   - Padding
 * 0002             - File Type:        Executable File
 * 0003             - ISA:              x86
 * 00000001         - ELF Version:      1
 * 08062150         - Entry Point:      0x8062150
 * 00000034         - PH Offset:        0x34
 * 00000054         - SH Offset:        0x54
 * 00000000         - Flags:            0
 * 0034             - ELF Header Size:  0x34
 * 0020             - PH Header Size:   0x20
 * 0001             - PH Entries:       1
 * 0028             - SH Size:          0x28
 * 0003             - SH Entries:       0x3
 * 0000             - SH Names Offset:  0x0
 *
 * -------------Program Header-------------
 * 00000006         - PH Type:          Program Header Table
 * 00000034         - Segment Offset:   0x34
 * 08048034         - VAddr of segment: 134512692
 * 08048034         - PAddr of segment: 134512692
 * 00000100         - Size of segment:  256
 * 00000100         - Size of segment:  256
 * 00000005         - Flags:            Execute,Read
 * 00000004         - Alignment
 *
 * --------------SH .shstrtab--------------
 * 00000000         - SH Name Offset:   0
 * 00000003         - SH Type:          String Table
 * 00000000         - Flags:
 * 00000000         - VAddr of section: 0
 * 000000cc         - Section offset:   204
 * 0000001c         - Section size:     28
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 00000000         - Alignment
 * 00000000         - Entry Size:       0
 *
 * ---------------SH .symtab---------------
 * 00000009         - SH Name Offset:   9
 * 00000002         - SH Type:          Symbol Table
 * 00000000         - Flags:
 * 00000000         - VAddr of section: 0
 * 000000e6         - Section offset:   230
 * 00000010         - Section size:     16
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 00000000         - Alignment
 * 00000010         - Entry Size:       16
 *
 * ---------------SH .strtab---------------
 * 00000011         - SH Name Offset:   17
 * 00000003         - SH Type:          String Table
 * 00000000         - Flags:
 * 00000000         - VAddr of section: 0
 * 000000f5         - Section offset:   245
 * 00000004         - Section size:     4
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 00000000         - Alignment
 * 00000000         - Entry Size:       0
 *
 * ---------------.shstrtab---------------
 * 2e73687374726162002e73796d746162002e73747274616200 - .shstrab\0.symtab\0.strtab\0
 *
 * ----------------.symtab----------------
 * 00000000         - Name Offset:      0
 * 00000000         - Value:            0
 * 00000000         - Size:             0
 * 00               - Info
 * 00               - other
 * 0000             - shdx
 *
 * ----------------.strtab----------------
 * 74657374         - test
 */
export const ELF32_BE =     "7f454c46010201000000000000000000000200030000000108062150000000340000005400000000003400200001002800030000" +
                            "0000000600000034080480340804803400000100000001000000000500000004" +
                            "00000000000000030000000000000000000000cc0000001c00000000000000000000000000000000" +
                            "00000009000000020000000000000000000000e60000001000000000000000000000000000000010" +
                            "00000011000000030000000000000000000000f50000000400000000000000000000000000000000" +
                            "2e73687374726162002e73796d746162002e73747274616200" +
                            "00000000000000000000000000000000" +
                            "74657374";

/**
 * ---------------ELF Header---------------
 * 7f454c46         - Magic:            .ELF
 * 02               - Format:           64 bit
 * 01               - Endianness:       Little
 * 01               - ELF Version:      1
 * 00               - Target ABI:       System V
 * 00               - ABI Version:      0
 * 00000000000000   - Padding
 * 0200             - File Type:        Executable File
 * 3e00             - ISA:              AMD x86-64
 * 01000000         - ELF Version:      1
 * 5021060800000000 - Entry Point:      0x8062150
 * 4000000000000000 - PH Offset:        0x40
 * 7800000000000000 - SH Offset:        0x78
 * 00000000         - Flags:            0
 * 4000             - ELF Header Size:  0x40
 * 3800             - PH Header Size:   0x38
 * 0100             - PH Entries:       1
 * 4000             - SH Size:          0x40
 * 0300             - SH Entries:       0x3
 * 0000             - SH Names Offset:  0x0
 *
 * -------------Program Header-------------
 * 06000000         - PH Type:          Program Header Table
 * 05000000         - Flags:            Execute,Read
 * 3400000000000000 - Segment Offset:   0x34
 * 3480040800000000 - VAddr of segment: 134512692
 * 3480040800000000 - PAddr of segment: 134512692
 * 0001000000000000 - Size of segment:  256
 * 0001000000000000 - Size of segment:  256
 * 0400000000000000 - Alignment
 *
 * --------------SH .shstrtab--------------
 * 00000000         - SH Name Offset:   0
 * 03000000         - SH Type:          String Table
 * 0000000000000000 - Flags:
 * 0000000000000000 - VAddr of section: 0
 * 3801000000000000 - Section offset:   312
 * 1c00000000000000 - Section size:     28
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 0000000000000000 - Alignment
 * 0000000000000000 - Entry Size:       0
 *
 * ---------------SH .symtab---------------
 * 09000000         - SH Name Offset:   9
 * 02000000         - SH Type:          Symbol Table
 * 0000000000000000 - Flags:
 * 0000000000000000 - VAddr of section: 0
 * 5001000000000000 - Section offset:   336
 * 1000000000000000 - Section size:     16
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 0000000000000000 - Alignment
 * 1800000000000000 - Entry Size:       24
 *
 * ---------------SH .strtab---------------
 * 11000000         - SH Name Offset:   17
 * 03000000         - SH Type:          String Table
 * 0000000000000000 - Flags:
 * 0000000000000000 - VAddr of section: 0
 * 6901000000000000 - Section offset:   361
 * 0400000000000000 - Section size:     4
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 0000000000000000 - Alignment
 * 0000000000000000 - Entry Size:       0
 *
 * ---------------.shstrtab---------------
 * 2e73687374726162002e73796d746162002e73747274616200 - .shstrab\0.symtab\0.strtab\0
 *
 * ----------------.symtab----------------
 * 00000000         - Name Offset:      0
 * 00               - Info
 * 00               - other
 * 0000             - shdx
 * 0000000000000000 - Value:            0
 * 0000000000000000 - Size:             0
 *
 * ----------------.strtab----------------
 * 74657374         - test
 */
export const ELF64_LE = "7f454c4602010100000000000000000002003e000100000050210608000000004000000000000000780000000000000000000000400038000100400003000000" +
                        "0600000005000000340000000000000034800408000000003480040800000000000100000000000000010000000000000400000000000000" +
                        "00000000030000000000000000000000000000000000000038010000000000001c00000000000000000000000000000000000000000000000000000000000000" +
                        "09000000020000000000000000000000000000000000000050010000000000001000000000000000000000000000000000000000000000001800000000000000" +
                        "11000000030000000000000000000000000000000000000069010000000000000400000000000000000000000000000000000000000000000000000000000000" +
                        "2e73687374726162002e73796d746162002e73747274616200" +
                        "000000000000000000000000000000000000000000000000" +
                        "74657374";

/**
 * ---------------ELF Header---------------
 * 7f454c46         - Magic:            .ELF
 * 02               - Format:           64 bit
 * 02               - Endianness:       Big
 * 01               - ELF Version:      1
 * 00               - Target ABI:       System V
 * 00               - ABI Version:      0
 * 00000000000000   - Padding
 * 0002             - File Type:        Executable File
 * 003e             - ISA:              AMD x86-64
 * 00000001         - ELF Version:      1
 * 0000000008062150 - Entry Point:      0x8062150
 * 0000000000000040 - PH Offset:        0x40
 * 0000000000000078 - SH Offset:        0x78
 * 00000000         - Flags:            0
 * 0040             - ELF Header Size:  0x40
 * 0038             - PH Header Size:   0x38
 * 0001             - PH Entries:       1
 * 0040             - SH Size:          0x40
 * 0003             - SH Entries:       0x3
 * 0000             - SH Names Offset:  0x0
 *
 * -------------Program Header-------------
 * 00000006         - PH Type:          Program Header Table
 * 00000005         - Flags:            Execute,Read
 * 0000000000000034 - Segment Offset:   0x34
 * 0000000008048034 - VAddr of segment: 134512692
 * 0000000008048034 - PAddr of segment: 134512692
 * 0000000000000100 - Size of segment:  256
 * 0000000000000100 - Size of segment:  256
 * 0400000000000000 - Alignment
 *
 * --------------SH .shstrtab--------------
 * 00000000         - SH Name Offset:   0
 * 00000003         - SH Type:          String Table
 * 0000000000000000 - Flags:
 * 0000000000000000 - VAddr of section: 0
 * 0000000000000138 - Section offset:   312
 * 000000000000001c - Section size:     28
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 0000000000000000 - Alignment
 * 0000000000000000 - Entry Size:       0
 *
 * ---------------SH .symtab---------------
 * 00000009         - SH Name Offset:   9
 * 00000002         - SH Type:          Symbol Table
 * 0000000000000000 - Flags:
 * 0000000000000000 - VAddr of section: 0
 * 0000000000000150 - Section offset:   336
 * 0000000000000010 - Section size:     16
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 0000000000000000 - Alignment
 * 0000000000000018 - Entry Size:       24
 *
 * ---------------SH .strtab---------------
 * 00000011         - SH Name Offset:   17
 * 00000003         - SH Type:          String Table
 * 0000000000000000 - Flags:
 * 0000000000000000 - VAddr of section: 0
 * 0000000000000169 - Section offset:   361
 * 0000000000000004 - Section size:     4
 * 00000000         - Associated:       0
 * 00000000         - Extra Info:       0
 * 0000000000000000 - Alignment
 * 0000000000000000 - Entry Size:       0
 *
 * ---------------.shstrtab---------------
 * 2e73687374726162002e73796d746162002e73747274616200 - .shstrab\0.symtab\0.strtab\0
 *
 * ----------------.symtab----------------
 * 00000000         - Name Offset:      0
 * 00               - Info
 * 00               - other
 * 0000             - shdx
 * 0000000000000000 - Value:            0
 * 0000000000000000 - Size:             0
 *
 * ----------------.strtab----------------
 * 74657374         - test
 */
export const ELF64_BE =     "7f454c460202010000000000000000000002003e0000000100000000080621500000000000000040000000000000007800000000004000380001004000030000" +
                            "0000000600000005000000000000003400000000080480340000000008048034000000000000010000000000000001000400000000000000" +
                            "0000000000000003000000000000000000000000000000000000000000000138000000000000001c000000000000000000000000000000000000000000000000" +
                            "00000009000000020000000000000000000000000000000000000000000001500000000000000010000000000000000000000000000000000000000000000018" +
                            "00000011000000030000000000000000000000000000000000000000000001690000000000000004000000000000000000000000000000000000000000000000" +
                            "2e73687374726162002e73796d746162002e73747274616200" +
                            "000000000000000000000000000000000000000000000000" +
                            "74657374";
