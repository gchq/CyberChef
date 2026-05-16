/**
 * Hexdump tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

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
        name: "Hexdump: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Hexdump",
                args: [16, false, false]
            },
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "Hexdump: Hello, World!",
        input: "Hello, World!",
        expectedOutput: "Hello, World!",
        recipeConfig: [
            {
                op: "To Hexdump",
                args: [16, false, false]
            },
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "Hexdump: UTF-8",
        input: "ნუ პანიკას",
        expectedOutput: "ნუ პანიკას",
        recipeConfig: [
            {
                op: "To Hexdump",
                args: [16, false, false]
            },
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "Hexdump: All bytes",
        input: ALL_BYTES,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "To Hexdump",
                args: [16, false, false]
            },
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "To Hexdump: UTF-8",
        input: "ნუ პანიკას",
        expectedOutput: `00000000  e1 83 9c e1 83 a3 20 e1 83 9e e1 83 90 e1 83 9c  |á..á.£ á..á..á..|
00000010  e1 83 98 e1 83 99 e1 83 90 e1 83 a1              |á..á..á..á.¡|`,
        recipeConfig: [
            {
                op: "To Hexdump",
                args: [16, false, false]
            }
        ],
    },
    {
        name: "To Hexdump: All bytes",
        input: ALL_BYTES,
        expectedOutput: `00000000  00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f  |................|
00000010  10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f  |................|
00000020  20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f  | !"#$%&'()*+,-./|
00000030  30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f  |0123456789:;<=>?|
00000040  40 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 4f  |@ABCDEFGHIJKLMNO|
00000050  50 51 52 53 54 55 56 57 58 59 5a 5b 5c 5d 5e 5f  |PQRSTUVWXYZ[\\]^_|
00000060  60 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f  |\`abcdefghijklmno|
00000070  70 71 72 73 74 75 76 77 78 79 7a 7b 7c 7d 7e 7f  |pqrstuvwxyz{|}~.|
00000080  80 81 82 83 84 85 86 87 88 89 8a 8b 8c 8d 8e 8f  |................|
00000090  90 91 92 93 94 95 96 97 98 99 9a 9b 9c 9d 9e 9f  |................|
000000a0  a0 a1 a2 a3 a4 a5 a6 a7 a8 a9 aa ab ac ad ae af  |\xa0¡¢£¤¥¦§¨©ª«¬.®¯|
000000b0  b0 b1 b2 b3 b4 b5 b6 b7 b8 b9 ba bb bc bd be bf  |°±²³´µ¶·¸¹º»¼½¾¿|
000000c0  c0 c1 c2 c3 c4 c5 c6 c7 c8 c9 ca cb cc cd ce cf  |ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏ|
000000d0  d0 d1 d2 d3 d4 d5 d6 d7 d8 d9 da db dc dd de df  |ÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß|
000000e0  e0 e1 e2 e3 e4 e5 e6 e7 e8 e9 ea eb ec ed ee ef  |àáâãäåæçèéêëìíîï|
000000f0  f0 f1 f2 f3 f4 f5 f6 f7 f8 f9 fa fb fc fd fe ff  |ðñòóôõö÷øùúûüýþÿ|`,
        recipeConfig: [
            {
                op: "To Hexdump",
                args: [16, false, false]
            }
        ],
    },
    {
        name: "From Hexdump: xxd",
        input: `00000000: 0001 0203 0405 0607 0809 0a0b 0c0d 0e0f  ................
00000010: 1011 1213 1415 1617 1819 1a1b 1c1d 1e1f  ................
00000020: 2021 2223 2425 2627 2829 2a2b 2c2d 2e2f   !"#$%&'()*+,-./
00000030: 3031 3233 3435 3637 3839 3a3b 3c3d 3e3f  0123456789:;<=>?
00000040: 4041 4243 4445 4647 4849 4a4b 4c4d 4e4f  @ABCDEFGHIJKLMNO
00000050: 5051 5253 5455 5657 5859 5a5b 5c5d 5e5f  PQRSTUVWXYZ[\\]^_
00000060: 6061 6263 6465 6667 6869 6a6b 6c6d 6e6f  \`abcdefghijklmno
00000070: 7071 7273 7475 7677 7879 7a7b 7c7d 7e7f  pqrstuvwxyz{|}~.
00000080: 8081 8283 8485 8687 8889 8a8b 8c8d 8e8f  ................
00000090: 9091 9293 9495 9697 9899 9a9b 9c9d 9e9f  ................
000000a0: a0a1 a2a3 a4a5 a6a7 a8a9 aaab acad aeaf  ................
000000b0: b0b1 b2b3 b4b5 b6b7 b8b9 babb bcbd bebf  ................
000000c0: c0c1 c2c3 c4c5 c6c7 c8c9 cacb cccd cecf  ................
000000d0: d0d1 d2d3 d4d5 d6d7 d8d9 dadb dcdd dedf  ................
000000e0: e0e1 e2e3 e4e5 e6e7 e8e9 eaeb eced eeef  ................
000000f0: f0f1 f2f3 f4f5 f6f7 f8f9 fafb fcfd feff  ................`,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "From Hexdump: xxd format, odd number of bytes",
        input: "00000000: 6162 6364 65                             abcde",
        expectedOutput: "abcde",
        recipeConfig: [
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "From Hexdump: Wireshark",
        input: `00000000  00 01 02 03 04 05 06 07  08 09 0a 0b 0c 0d 0e 0f ........ ........
00000010  10 11 12 13 14 15 16 17  18 19 1a 1b 1c 1d 1e 1f ........ ........
00000020  20 21 22 23 24 25 26 27  28 29 2a 2b 2c 2d 2e 2f  !"#$%&' ()*+,-./
00000030  30 31 32 33 34 35 36 37  38 39 3a 3b 3c 3d 3e 3f 01234567 89:;<=>?
00000040  40 41 42 43 44 45 46 47  48 49 4a 4b 4c 4d 4e 4f @ABCDEFG HIJKLMNO
00000050  50 51 52 53 54 55 56 57  58 59 5a 5b 5c 5d 5e 5f PQRSTUVW XYZ[\\]^_
00000060  60 61 62 63 64 65 66 67  68 69 6a 6b 6c 6d 6e 6f \`abcdefg hijklmno
00000070  70 71 72 73 74 75 76 77  78 79 7a 7b 7c 7d 7e 7f pqrstuvw xyz{|}~.
00000080  80 81 82 83 84 85 86 87  88 89 8a 8b 8c 8d 8e 8f ........ ........
00000090  90 91 92 93 94 95 96 97  98 99 9a 9b 9c 9d 9e 9f ........ ........
000000A0  a0 a1 a2 a3 a4 a5 a6 a7  a8 a9 aa ab ac ad ae af ........ ........
000000B0  b0 b1 b2 b3 b4 b5 b6 b7  b8 b9 ba bb bc bd be bf ........ ........
000000C0  c0 c1 c2 c3 c4 c5 c6 c7  c8 c9 ca cb cc cd ce cf ........ ........
000000D0  d0 d1 d2 d3 d4 d5 d6 d7  d8 d9 da db dc dd de df ........ ........
000000E0  e0 e1 e2 e3 e4 e5 e6 e7  e8 e9 ea eb ec ed ee ef ........ ........
000000F0  f0 f1 f2 f3 f4 f5 f6 f7  f8 f9 fa fb fc fd fe ff ........ ........
`,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "From Hexdump: Wireshark alt",
        input: `0000   00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f
0010   10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f
0020   20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f
0030   30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f
0040   40 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 4f
0050   50 51 52 53 54 55 56 57 58 59 5a 5b 5c 5d 5e 5f
0060   60 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f
0070   70 71 72 73 74 75 76 77 78 79 7a 7b 7c 7d 7e 7f
0080   80 81 82 83 84 85 86 87 88 89 8a 8b 8c 8d 8e 8f
0090   90 91 92 93 94 95 96 97 98 99 9a 9b 9c 9d 9e 9f
00a0   a0 a1 a2 a3 a4 a5 a6 a7 a8 a9 aa ab ac ad ae af
00b0   b0 b1 b2 b3 b4 b5 b6 b7 b8 b9 ba bb bc bd be bf
00c0   c0 c1 c2 c3 c4 c5 c6 c7 c8 c9 ca cb cc cd ce cf
00d0   d0 d1 d2 d3 d4 d5 d6 d7 d8 d9 da db dc dd de df
00e0   e0 e1 e2 e3 e4 e5 e6 e7 e8 e9 ea eb ec ed ee ef
00f0   f0 f1 f2 f3 f4 f5 f6 f7 f8 f9 fa fb fc fd fe ff`,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "From Hexdump: 010",
        input: `0000h: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  ................ 
0010h: 10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F  ................ 
0020h: 20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F   !"#$%&'()*+,-./ 
0030h: 30 31 32 33 34 35 36 37 38 39 3A 3B 3C 3D 3E 3F  0123456789:;<=>? 
0040h: 40 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F  @ABCDEFGHIJKLMNO 
0050h: 50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F  PQRSTUVWXYZ[\\]^_ 
0060h: 60 61 62 63 64 65 66 67 68 69 6A 6B 6C 6D 6E 6F  \`abcdefghijklmno 
0070h: 70 71 72 73 74 75 76 77 78 79 7A 7B 7C 7D 7E 7F  pqrstuvwxyz{|}~ 
0080h: 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F  €.‚ƒ„…†‡ˆ‰Š‹Œ...
0090h: 90 91 92 93 94 95 96 97 98 99 9A 9B 9C 9D 9E 9F  .‘’“”•–—˜™š›œ.žŸ
00A0h: A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF  \xa0¡¢£¤¥¦§¨©ª«¬­®¯ 
00B0h: B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF  °±²³´µ¶·¸¹º»¼½¾¿ 
00C0h: C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF  ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏ 
00D0h: D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE DF  ÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß 
00E0h: E0 E1 E2 E3 E4 E5 E6 E7 E8 E9 EA EB EC ED EE EF  àáâãäåæçèéêëìíîï 
00F0h: F0 F1 F2 F3 F4 F5 F6 F7 F8 F9 FA FB FC FD FE FF  ðñòóôõö÷øùúûüýþÿ`,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
    {
        name: "From Hexdump: Linux hexdump",
        input: `00000000  00 01 02 03 04 05 06 07  08 09 0a 0b 0c 0d 0e 0f  |................|
00000010  10 11 12 13 14 15 16 17  18 19 1a 1b 1c 1d 1e 1f  |................|
00000020  20 21 22 23 24 25 26 27  28 29 2a 2b 2c 2d 2e 2f  | !"#$%&'()*+,-./|
00000030  30 31 32 33 34 35 36 37  38 39 3a 3b 3c 3d 3e 3f  |0123456789:;<=>?|
00000040  40 41 42 43 44 45 46 47  48 49 4a 4b 4c 4d 4e 4f  |@ABCDEFGHIJKLMNO|
00000050  50 51 52 53 54 55 56 57  58 59 5a 5b 5c 5d 5e 5f  |PQRSTUVWXYZ[\\]^_|
00000060  60 61 62 63 64 65 66 67  68 69 6a 6b 6c 6d 6e 6f  |\`abcdefghijklmno|
00000070  70 71 72 73 74 75 76 77  78 79 7a 7b 7c 7d 7e 7f  |pqrstuvwxyz{|}~.|
00000080  80 81 82 83 84 85 86 87  88 89 8a 8b 8c 8d 8e 8f  |................|
00000090  90 91 92 93 94 95 96 97  98 99 9a 9b 9c 9d 9e 9f  |................|
000000a0  a0 a1 a2 a3 a4 a5 a6 a7  a8 a9 aa ab ac ad ae af  |................|
000000b0  b0 b1 b2 b3 b4 b5 b6 b7  b8 b9 ba bb bc bd be bf  |................|
000000c0  c0 c1 c2 c3 c4 c5 c6 c7  c8 c9 ca cb cc cd ce cf  |................|
000000d0  d0 d1 d2 d3 d4 d5 d6 d7  d8 d9 da db dc dd de df  |................|
000000e0  e0 e1 e2 e3 e4 e5 e6 e7  e8 e9 ea eb ec ed ee ef  |................|
000000f0  f0 f1 f2 f3 f4 f5 f6 f7  f8 f9 fa fb fc fd fe ff  |................|
00000100`,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "From Hexdump",
                args: []
            }
        ],
    },
]);
