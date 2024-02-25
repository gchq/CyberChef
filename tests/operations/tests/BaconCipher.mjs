/**
 * Bacon Cipher tests.
 *
 * @author Karsten Silkenbäumer [github.com/kassi]
 * @copyright Karsten Silkenbäumer 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import {
    BACON_ALPHABETS,
    BACON_TRANSLATIONS,
} from "../../../src/core/lib/Bacon.mjs";

const alphabets = Object.keys(BACON_ALPHABETS);
const translations = BACON_TRANSLATIONS;

TestRegister.addTests([
    {
        name: "Bacon Decode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[0], false],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet 0/1",
        input: "00011 00100 00010 01101 00011 01000 01100 00110 00001 00000 00010 01101 01100 10100 01101 10000 01001 10001",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[0], false],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet 0/1 inverse",
        input: "11100 11011 11101 10010 11100 10111 10011 11001 11110 11111 11101 10010 10011 01011 10010 01111 10110 01110",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[0], true],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet A/B lower case",
        input: "aaabb aabaa aaaba abbab aaabb abaaa abbaa aabba aaaab aaaaa aaaba abbab abbaa babaa abbab baaaa abaab baaab",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[1], false],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet A/B lower case inverse",
        input: "bbbaa bbabb bbbab baaba bbbaa babbb baabb bbaab bbbba bbbbb bbbab baaba baabb ababb baaba abbbb babba abbba",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[1], true],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet A/B upper case",
        input: "AAABB AABAA AAABA ABBAB AAABB ABAAA ABBAA AABBA AAAAB AAAAA AAABA ABBAB ABBAA BABAA ABBAB BAAAA ABAAB BAAAB",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[1], false],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet A/B upper case inverse",
        input: "BBBAA BBABB BBBAB BAABA BBBAA BABBB BAABB BBAAB BBBBA BBBBB BBBAB BAABA BAABB ABABB BAABA ABBBB BABBA ABBBA",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[1], true],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet case code",
        input: "thiS IsaN exampLe oF ThE bacON cIpher WIth upPPercasE letters tRanSLaTiNG to OnEs anD LoWErcase To zERoes. KS",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[2], false],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet case code inverse",
        input: "THIs iS An EXAMPlE Of tHe BACon CiPHER wiTH UPppERCASe LETTERS TrANslAtIng TO oNeS ANd lOweRCASE tO ZerOES. ks",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[2], true],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet case code",
        input: "A little example of the Bacon Cipher to be decoded. It is a working example and shorter than my others, but it anyways works tremendously. And just that's important, correct?",
        expectedOutput: "DECODE",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[3], false],
            },
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet case code inverse",
        input: "Well, there's now another example which will be not only strange to read but sound weird for everyone not knowing what the thing is about. Nevertheless, works great out of the box.",
        expectedOutput: "DECODE",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[3], true],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet 0/1",
        input: "00011 00100 00010 01110 00011 01000 01101 00110 00001 00000 00010 01110 01101 10110 01110 10001 01010 10010",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[0], false],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet 0/1 inverse",
        input: "11100 11011 11101 10001 11100 10111 10010 11001 11110 11111 11101 10001 10010 01001 10001 01110 10101 01101",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[0], true],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet A/B lower case",
        input: "aaabb aabaa aaaba abbba aaabb abaaa abbab aabba aaaab aaaaa aaaba abbba abbab babba abbba baaab ababa baaba",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[1], false],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet A/B lower case inverse",
        input: "bbbaa bbabb bbbab baaab bbbaa babbb baaba bbaab bbbba bbbbb bbbab baaab baaba abaab baaab abbba babab abbab",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[1], true],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet A/B upper case",
        input: "AAABB AABAA AAABA ABBBA AAABB ABAAA ABBAB AABBA AAAAB AAAAA AAABA ABBBA ABBAB BABBA ABBBA BAAAB ABABA BAABA",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[1], false],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet A/B upper case inverse",
        input: "BBBAA BBABB BBBAB BAAAB BBBAA BABBB BAABA BBAAB BBBBA BBBBB BBBAB BAAAB BAABA ABAAB BAAAB ABBBA BABAB ABBAB",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[1], true],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet case code",
        input: "thiS IsaN exampLe oF THe bacON cIpher WItH upPPercasE letters tRanSLAtiNG tO OnES anD LOwErcaSe To ZeRoeS. kS",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[2], false],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet case code inverse",
        input: "THIs iSAn EXAMPlE Of thE BACon CiPHER wiTh UPppERCASe LETTERS TrANslaTIng To zEroES and LoWERcAsE tO oNEs. Ks",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[2], true],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet case code",
        input: "A little example of the Bacon Cipher to be decoded. It is a working example and shorter than the first, but it anyways works tremendously. And just that's important, correct?",
        expectedOutput: "DECODE",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[3], false],
            },
        ],
    },
    {
        name: "Bacon Decode: complete alphabet case code inverse",
        input: "Well, there's now another example   which will be not only strange to read but sound weird for everyone knowing nothing what the thing is about. Nevertheless, works great out of the box. ",
        expectedOutput: "DECODE",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[3], true],
            },
        ],
    },
    {
        name: "Bacon Encode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[0], false, false],
            },
        ],
    },
    {
        name: "Bacon Encode: reduced alphabet 0/1",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "10010 00111 00100 10000 00100 10001 00000 00101 01101 10101 00000 01100 00011 01000 10010 01000 10011 01011 01110 10001 01101 10011 00100 10000 10010 00111 00100 00101 00100 01100 00010 00100",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[0], false, false],
            },
        ],
    },
    {
        name: "Bacon Encode: reduced alphabet 0/1 inverse",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "01101 11000 11011 01111 11011 01110 11111 11010 10010 01010 11111 10011 11100 10111 01101 10111 01100 10100 10001 01110 10010 01100 11011 01111 01101 11000 11011 11010 11011 10011 11101 11011",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[0], false, true],
            },
        ],
    },
    {
        name: "Bacon Encode: reduced alphabet 0/1, keeping extra characters",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "1001000111001001000000100'10001 00000 001010110110101, 000000110000011 0100010010 0100010011010110111010001 01101100110010010000 100100011100100 0010100100011000001000100.",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[0], true, false],
            },
        ],
    },
    {
        name: "Bacon Encode: reduced alphabet 0/1 inverse, keeping extra characters",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "0110111000110110111111011'01110 11111 110101001001010, 111111001111100 1011101101 1011101100101001000101110 10010011001101101111 011011100011011 1101011011100111110111011.",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[0], true, true],
            },
        ],
    },
    {
        name: "Bacon Encode: reduced alphabet A/B",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "BAABA AABBB AABAA BAAAA AABAA BAAAB AAAAA AABAB ABBAB BABAB AAAAA ABBAA AAABB ABAAA BAABA ABAAA BAABB ABABB ABBBA BAAAB ABBAB BAABB AABAA BAAAA BAABA AABBB AABAA AABAB AABAA ABBAA AAABA AABAA",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[1], false, false],
            },
        ],
    },
    {
        name: "Bacon Encode: reduced alphabet A/B inverse",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "ABBAB BBAAA BBABB ABBBB BBABB ABBBA BBBBB BBABA BAABA ABABA BBBBB BAABB BBBAA BABBB ABBAB BABBB ABBAA BABAA BAAAB ABBBA BAABA ABBAA BBABB ABBBB ABBAB BBAAA BBABB BBABA BBABB BAABB BBBAB BBABB",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[1], false, true],
            },
        ],
    },
    {
        name: "Bacon Encode: reduced alphabet A/B, keeping extra characters",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "BAABAAABBBAABAABAAAAAABAA'BAAAB AAAAA AABABABBABBABAB, AAAAAABBAAAAABB ABAAABAABA ABAAABAABBABABBABBBABAAAB ABBABBAABBAABAABAAAA BAABAAABBBAABAA AABABAABAAABBAAAAABAAABAA.",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[1], true, false],
            },
        ],
    },
    {
        name: "Bacon Encode: reduced alphabet A/B inverse, keeping extra characters",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "ABBABBBAAABBABBABBBBBBABB'ABBBA BBBBB BBABABAABAABABA, BBBBBBAABBBBBAA BABBBABBAB BABBBABBAABABAABAAABABBBA BAABAABBAABBABBABBBB ABBABBBAAABBABB BBABABBABBBAABBBBBABBBABB.",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[0], translations[1], true, true],
            },
        ],
    },
    {
        name: "Bacon Encode: complete alphabet 0/1",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "10011 00111 00100 10001 00100 10010 00000 00101 01110 10111 00000 01101 00011 01000 10011 01001 10100 01100 01111 10010 01110 10101 00100 10001 10011 00111 00100 00101 00100 01101 00010 00100",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[1], translations[0], false, false],
            },
        ],
    },
    {
        name: "Bacon Encode: complete alphabet 0/1 inverse",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "01100 11000 11011 01110 11011 01101 11111 11010 10001 01000 11111 10010 11100 10111 01100 10110 01011 10011 10000 01101 10001 01010 11011 01110 01100 11000 11011 11010 11011 10010 11101 11011",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[1], translations[0], false, true],
            },
        ],
    },
    {
        name: "Bacon Encode: complete alphabet 0/1, keeping extra characters",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "1001100111001001000100100'10010 00000 001010111010111, 000000110100011 0100010011 0100110100011000111110010 01110101010010010001 100110011100100 0010100100011010001000100.",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[1], translations[0], true, false],
            },
        ],
    },
    {
        name: "Bacon Encode: complete alphabet 0/1 inverse, keeping extra characters",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "0110011000110110111011011'01101 11111 110101000101000, 111111001011100 1011101100 1011001011100111000001101 10001010101101101110 011001100011011 1101011011100101110111011.",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[1], translations[0], true, true],
            },
        ],
    },
    {
        name: "Bacon Encode: complete alphabet A/B",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "BAABB AABBB AABAA BAAAB AABAA BAABA AAAAA AABAB ABBBA BABBB AAAAA ABBAB AAABB ABAAA BAABB ABAAB BABAA ABBAA ABBBB BAABA ABBBA BABAB AABAA BAAAB BAABB AABBB AABAA AABAB AABAA ABBAB AAABA AABAA",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[1], translations[1], false, false],
            },
        ],
    },
    {
        name: "Bacon Encode: complete alphabet A/B inverse",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "ABBAA BBAAA BBABB ABBBA BBABB ABBAB BBBBB BBABA BAAAB ABAAA BBBBB BAABA BBBAA BABBB ABBAA BABBA ABABB BAABB BAAAA ABBAB BAAAB ABABA BBABB ABBBA ABBAA BBAAA BBABB BBABA BBABB BAABA BBBAB BBABB",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[1], translations[1], false, true],
            },
        ],
    },
    {
        name: "Bacon Encode: complete alphabet A/B, keeping extra characters",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "BAABBAABBBAABAABAAABAABAA'BAABA AAAAA AABABABBBABABBB, AAAAAABBABAAABB ABAAABAABB ABAABBABAAABBAAABBBBBAABA ABBBABABABAABAABAAAB BAABBAABBBAABAA AABABAABAAABBABAAABAAABAA.",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[1], translations[1], true, false],
            },
        ],
    },
    {
        name: "Bacon Encode: complete alphabet A/B inverse, keeping extra characters",
        input: "There's a fox, and it jumps over the fence.",
        expectedOutput:
            "ABBAABBAAABBABBABBBABBABB'ABBAB BBBBB BBABABAAABABAAA, BBBBBBAABABBBAA BABBBABBAA BABBAABABBBAABBBAAAAABBAB BAAABABABABBABBABBBA ABBAABBAAABBABB BBABABBABBBAABABBBABBBABB.",
        recipeConfig: [
            {
                op: "Bacon Cipher Encode",
                args: [alphabets[1], translations[1], true, true],
            },
        ],
    },
]);
