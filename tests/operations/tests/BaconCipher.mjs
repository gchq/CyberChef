/**
 * BaconCipher tests.
 *
 * @author Karsten Silkenbäumer [kassi@users.noreply.github.com]
 * @copyright Karsten Silkenbäumer 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";
import { BACON_ALPHABET_REDUCED, BACON_ALPHABET_COMPLETE, BACON_TRANSLATIONS } from "../../../src/core/lib/Bacon";

const alphabets = [BACON_ALPHABET_REDUCED, BACON_ALPHABET_COMPLETE];
const translations = BACON_TRANSLATIONS;

TestRegister.addTests([
    {
        name: "Bacon Decode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[0], false]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet 0/1",
        input: "00011 00100 00010 01101 00011 01000 01100 00110 00001 00000 00010 01101 01100 10100 01101 10000 01001 10001",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[0], false]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet 0/1 inverse",
        input: "11100 11011 11101 10010 11100 10111 10011 11001 11110 11111 11101 10010 10011 01011 10010 01111 10110 01110",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[0], true]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet A/B lower case",
        input: "aaabb aabaa aaaba abbab aaabb abaaa abbaa aabba aaaab aaaaa aaaba abbab abbaa babaa abbab baaaa abaab baaab",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[1], false]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet A/B lower case inverse",
        input: "bbbaa bbabb bbbab baaba bbbaa babbb baabb bbaab bbbba bbbbb bbbab baaba baabb ababb baaba abbbb babba abbba",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[1], true]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet A/B upper case",
        input: "AAABB AABAA AAABA ABBAB AAABB ABAAA ABBAA AABBA AAAAB AAAAA AAABA ABBAB ABBAA BABAA ABBAB BAAAA ABAAB BAAAB",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[1], false]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet A/B upper case inverse",
        input: "BBBAA BBABB BBBAB BAABA BBBAA BABBB BAABB BBAAB BBBBA BBBBB BBBAB BAABA BAABB ABABB BAABA ABBBB BABBA ABBBA",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[1], true]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet case code",
        input: "thiS IsaN exampLe oF ThE bacON cIpher WIth upPPercasE letters tRanSLaTiNG to OnEs anD LoWErcase To zERoes. KS",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[2], false]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet case code inverse",
        input: "THIs iS An EXAMPlE Of tHe BACon CiPHER wiTH UPppERCASe LETTERS TrANslAtIng TO oNeS ANd lOweRCASE tO ZerOES. ks",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[2], true]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet case code",
        input: "A little example of the Bacon Cipher to be decoded. It is a working example and shorter than my others, but it anyways works tremendously. And just that's important, correct?",
        expectedOutput: "DECODE",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[3], false]
            }
        ],
    },
    {
        name: "Bacon Decode: reduced alphabet case code inverse",
        input: "Well, there's now another example which will be not only strange to read but sound weird for everyone not knowing what the thing is about. Nevertheless, works great out of the box.",
        expectedOutput: "DECODE",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[0], translations[3], true]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet 0/1",
        input: "00011 00100 00010 01110 00011 01000 01101 00110 00001 00000 00010 01110 01101 10110 01110 10001 01010 10010",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[0], false]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet 0/1 inverse",
        input: "11100 11011 11101 10001 11100 10111 10010 11001 11110 11111 11101 10001 10010 01001 10001 01110 10101 01101",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[0], true]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet A/B lower case",
        input: "aaabb aabaa aaaba abbba aaabb abaaa abbab aabba aaaab aaaaa aaaba abbba abbab babba abbba baaab ababa baaba",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[1], false]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet A/B lower case inverse",
        input: "bbbaa bbabb bbbab baaab bbbaa babbb baaba bbaab bbbba bbbbb bbbab baaab baaba abaab baaab abbba babab abbab",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[1], true]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet A/B upper case",
        input: "AAABB AABAA AAABA ABBBA AAABB ABAAA ABBAB AABBA AAAAB AAAAA AAABA ABBBA ABBAB BABBA ABBBA BAAAB ABABA BAABA",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[1], false]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet A/B upper case inverse",
        input: "BBBAA BBABB BBBAB BAAAB BBBAA BABBB BAABA BBAAB BBBBA BBBBB BBBAB BAAAB BAABA ABAAB BAAAB ABBBA BABAB ABBAB",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[1], true]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet case code",
        input: "thiS IsaN exampLe oF THe bacON cIpher WItH upPPercasE letters tRanSLAtiNG tO OnES anD LOwErcaSe To ZeRoeS. kS",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[2], false]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet case code inverse",
        input: "THIs iSAn EXAMPlE Of thE BACon CiPHER wiTh UPppERCASe LETTERS TrANslaTIng To zEroES and LoWERcAsE tO oNEs. Ks",
        expectedOutput: "DECODINGBACONWORKS",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[2], true]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet case code",
        input: "A little example of the Bacon Cipher to be decoded. It is a working example and shorter than the first, but it anyways works tremendously. And just that's important, correct?",
        expectedOutput: "DECODE",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[3], false]
            }
        ],
    },
    {
        name: "Bacon Decode: complete alphabet case code inverse",
        input: "Well, there's now another example which will be not only strange to read but sound weird for everyone knowing nothing what the thing is about. Nevertheless, works great out of the box.",
        expectedOutput: "DECODE",
        recipeConfig: [
            {
                op: "Bacon Cipher Decode",
                args: [alphabets[1], translations[3], true]
            }
        ],
    },
]);
