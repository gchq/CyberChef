/**
 * Cipher tests.
 *
 * @author Matt C [matt@artemisbot.uk]
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Affine Encode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Affine Cipher Encode",
                args: [1, 0]
            }
        ],
    },
    {
        name: "Affine Encode: invalid a & b (non-integer)",
        input: "some keys are shaped as locks. index[me]",
        expectedOutput: "The values of a and b can only be integers.",
        recipeConfig: [
            {
                op: "Affine Cipher Encode",
                args: [0.1, 0.00001]
            }
        ],
    },
    {
        name: "Affine Encode: no effect",
        input: "some keys are shaped as locks. index[me]",
        expectedOutput: "some keys are shaped as locks. index[me]",
        recipeConfig: [
            {
                op: "Affine Cipher Encode",
                args: [1, 0]
            }
        ],
    },
    {
        name: "Affine Encode: normal",
        input: "some keys are shaped as locks. index[me]",
        expectedOutput: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        recipeConfig: [
            {
                op: "Affine Cipher Encode",
                args: [23, 23]
            }
        ],
    },
    {
        name: "Affine Decode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Affine Cipher Decode",
                args: [1, 0]
            }
        ],
    },
    {
        name: "Affine Decode: invalid a & b (non-integer)",
        input: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        expectedOutput: "The values of a and b can only be integers.",
        recipeConfig: [
            {
                op: "Affine Cipher Decode",
                args: [0.1, 0.00001]
            }
        ],
    },
    {
        name: "Affine Decode: invalid a (coprime)",
        input: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        expectedOutput: "The value of `a` must be coprime to 26.",
        recipeConfig: [
            {
                op: "Affine Cipher Decode",
                args: [8, 23]
            }
        ],
    },
    {
        name: "Affine Decode: no effect",
        input: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        expectedOutput: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        recipeConfig: [
            {
                op: "Affine Cipher Decode",
                args: [1, 0]
            }
        ],
    },
    {
        name: "Affine Decode: normal",
        input: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        expectedOutput: "some keys are shaped as locks. index[me]",
        recipeConfig: [
            {
                op: "Affine Cipher Decode",
                args: [23, 23]
            }
        ],
    },
    {
        name: "A1Z26 Encode: normal",
        input: "This is the test sentence.",
        expectedOutput: "20 8 9 19 9 19 20 8 5 20 5 19 20 19 5 14 20 5 14 3 5",
        recipeConfig: [
            {
                op: "A1Z26 Cipher Encode",
                args: ["Space"]
            }
        ],
    },
    {
        name: "A1Z26 Decode: normal",
        input: "20 8 9 19 9 19 20 8 5 20 5 19 20 19 5 14 20 5 14 3 5",
        expectedOutput: "thisisthetestsentence",
        recipeConfig: [
            {
                op: "A1Z26 Cipher Decode",
                args: ["Space"]
            }
        ],
    },
    {
        name: "A1Z26 Decode: error",
        input: "20 8 9 27",
        expectedOutput: "Error: all numbers must be between 1 and 26.",
        recipeConfig: [
            {
                op: "A1Z26 Cipher Decode",
                args: ["Space"]
            }
        ],
    },
    {
        name: "Atbash: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Atbash Cipher",
                args: []
            }
        ],
    },
    {
        name: "Atbash: normal",
        input: "old slow slim horn",
        expectedOutput: "low hold horn slim",
        recipeConfig: [
            {
                op: "Atbash Cipher",
                args: []
            }
        ],
    },
    {
        name: "Bifid Cipher Encode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Bifid Cipher Encode",
                "args": ["nothing"]
            }
        ],
    },
    {
        name: "Bifid Cipher Encode: no key",
        input: "We recreate conditions similar to the Van-Allen radiation belt in our secure facilities.",
        expectedOutput: "Vq daqcliho rmltofvlnc qbdhlcr nt qdq Fbm-Rdkkm vuoottnoi aitp al axf tdtmvt owppkaodtx.",
        recipeConfig: [
            {
                "op": "Bifid Cipher Encode",
                "args": [""]
            }
        ],
    },
    {
        name: "Bifid Cipher Encode: invalid key (non-alphabetic)",
        input: "We recreate conditions similar to the Van-Allen radiation belt in our secure facilities.",
        expectedOutput: "The key must consist only of letters in the English alphabet",
        recipeConfig: [
            {
                "op": "Bifid Cipher Encode",
                "args": ["abc123"]
            }
        ],
    },
    {
        name: "Bifid Cipher Encode: normal",
        input: "We recreate conditions similar to the Van-Allen radiation belt in our secure facilities.",
        expectedOutput: "Wc snpsigdd cpfrrcxnfi hikdnnp dm crc Fcb-Pdeug vueageacc vtyl sa zxm crebzp lyoeuaiwpv.",
        recipeConfig: [
            {
                "op": "Bifid Cipher Encode",
                "args": ["Schrodinger"]
            }
        ],
    },
    {
        name: "Bifid Cipher Decode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Bifid Cipher Decode",
                "args": ["nothing"]
            }
        ],
    },
    {
        name: "Bifid Cipher Decode: no key",
        input: "Vq daqcliho rmltofvlnc qbdhlcr nt qdq Fbm-Rdkkm vuoottnoi aitp al axf tdtmvt owppkaodtx.",
        expectedOutput: "We recreate conditions similar to the Van-Allen radiation belt in our secure facilities.",
        recipeConfig: [
            {
                "op": "Bifid Cipher Decode",
                "args": [""]
            }
        ],
    },
    {
        name: "Bifid Cipher Decode: invalid key (non-alphabetic)",
        input: "Vq daqcliho rmltofvlnc qbdhlcr nt qdq Fbm-Rdkkm vuoottnoi aitp al axf tdtmvt owppkaodtx.",
        expectedOutput: "The key must consist only of letters in the English alphabet",
        recipeConfig: [
            {
                "op": "Bifid Cipher Decode",
                "args": ["abc123"]
            }
        ],
    },
    {
        name: "Bifid Cipher Decode: normal",
        input: "Wc snpsigdd cpfrrcxnfi hikdnnp dm crc Fcb-Pdeug vueageacc vtyl sa zxm crebzp lyoeuaiwpv.",
        expectedOutput: "We recreate conditions similar to the Van-Allen radiation belt in our secure facilities.",
        recipeConfig: [
            {
                "op": "Bifid Cipher Decode",
                "args": ["Schrodinger"]
            }
        ],
    },
    {
        name: "Citrix CTX1 Encode",
        input: "Password1",
        expectedOutput: "PFFAJEDBOHECJEDBODEGIMCJPOFLJKDPKLAO",
        recipeConfig: [
            {
                "op": "Citrix CTX1 Encode",
                "args": []
            }
        ],
    },
    {
        name: "Citrix CTX1 Decode: normal",
        input: "PFFAJEDBOHECJEDBODEGIMCJPOFLJKDPKLAO",
        expectedOutput: "Password1",
        recipeConfig: [
            {
                "op": "Citrix CTX1 Decode",
                "args": []
            }
        ],
    },
    {
        name: "Citrix CTX1 Decode: invalid length",
        input: "PFFAJEDBOHECJEDBODEGIMCJPOFLJKDPKLA",
        expectedOutput: "Incorrect hash length",
        recipeConfig: [
            {
                "op": "Citrix CTX1 Decode",
                "args": []
            }
        ],
    },
    {
        name: "Vigenère Encode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Vigenère Encode",
                "args": ["nothing"]
            }
        ],
    },
    {
        name: "Vigenère Encode: no key",
        input: "LUGGAGEBASEMENTVARENNESALLIESCANBECLOTHEDASENEMIESENEMIESCANBECLOTHEDASALLIESALWAYSUSEID",
        expectedOutput: "No key entered",
        recipeConfig: [
            {
                "op": "Vigenère Encode",
                "args": [""]
            }
        ],
    },
    {
        name: "Vigenère Encode: invalid key",
        input: "LUGGAGEBASEMENTVARENNESALLIESCANBECLOTHEDASENEMIESENEMIESCANBECLOTHEDASALLIESALWAYSUSEID",
        expectedOutput: "The key must consist only of letters",
        recipeConfig: [
            {
                "op": "Vigenère Encode",
                "args": ["abc123"]
            }
        ],
    },
    {
        name: "Vigenère Encode: normal",
        input: "LUGGAGEBASEMENTVARENNESALLIESCANBECLOTHEDASENEMIESENEMIESCANBECLOTHEDASALLIESALWAYSUSEID",
        expectedOutput: "PXCGRJIEWSVPIQPVRUIQJEJDPOEEJFEQXETOSWDEUDWHJEDLIVANVPMHOCRQFHYLFWLHZAJDPOEEJDPZWYJXWHED",
        recipeConfig: [
            {
                "op": "Vigenère Encode",
                "args": ["Edward"]
            }
        ],
    },
    {
        name: "Vigenère Decode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Vigenère Decode",
                "args": ["nothing"]
            }
        ],
    },
    {
        name: "Vigenère Decode: no key",
        input: "PXCGRJIEWSVPIQPVRUIQJEJDPOEEJFEQXETOSWDEUDWHJEDLIVANVPMHOCRQFHYLFWLHZAJDPOEEJDPZWYJXWHED",
        expectedOutput: "No key entered",
        recipeConfig: [
            {
                "op": "Vigenère Decode",
                "args": [""]
            }
        ],
    },
    {
        name: "Vigenère Decode: invalid key",
        input: "PXCGRJIEWSVPIQPVRUIQJEJDPOEEJFEQXETOSWDEUDWHJEDLIVANVPMHOCRQFHYLFWLHZAJDPOEEJDPZWYJXWHED",
        expectedOutput: "The key must consist only of letters",
        recipeConfig: [
            {
                "op": "Vigenère Decode",
                "args": ["abc123"]
            }
        ],
    },
    {
        name: "Vigenère Decode: normal",
        input: "PXCGRJIEWSVPIQPVRUIQJEJDPOEEJFEQXETOSWDEUDWHJEDLIVANVPMHOCRQFHYLFWLHZAJDPOEEJDPZWYJXWHED",
        expectedOutput: "LUGGAGEBASEMENTVARENNESALLIESCANBECLOTHEDASENEMIESENEMIESCANBECLOTHEDASALLIESALWAYSUSEID",
        recipeConfig: [
            {
                "op": "Vigenère Decode",
                "args": ["Edward"]
            }
        ],
    },
    {
        name: "Substitute: no pt/ct",
        input: "flee at once. we are discovered!",
        expectedOutput: "flee at once. we are discovered!",
        recipeConfig: [
            {
                "op": "Substitute",
                "args": ["", ""]
            }
        ],
    },
    {
        name: "Substitute: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Substitute",
                "args": ["abcdefghijklmnopqrstuvwxyz", "zebrascdfghijklmnopqtuvwxy"]
            }
        ],
    },
    {
        name: "Substitute: uneven pt/ct",
        input: "flee at once. we are discovered!",
        expectedOutput: "Warning: Plaintext and Ciphertext lengths differ\n\nsiaa zq lkba. va zoa rfpbluaoar!",
        recipeConfig: [
            {
                "op": "Substitute",
                "args": ["abcdefghijklmnopqrstuvwxyz", "zebrascdfghijklmnopqtuvwx"]
            }
        ],
    },
    {
        name: "Substitute: normal",
        input: "flee at once. we are discovered!",
        expectedOutput: "siaa zq lkba. va zoa rfpbluaoar!",
        recipeConfig: [
            {
                "op": "Substitute",
                "args": ["abcdefghijklmnopqrstuvwxyz", "zebrascdfghijklmnopqtuvwxy"]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Decode: normal",
        input: "Cytgah sTEAto rtn rsligcdsrporpyi H r fWiigo ovn oe",
        expectedOutput: "Cryptography is THE Art of Writing or solving codes",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Decode",
                "args": [2, 0]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Decode: key has to be bigger than 2",
        input: "Cytgah sTEAto rtn rsligcdsrporpyi H r fWiigo ovn oe",
        expectedOutput: "Key has to be bigger than 2",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Decode",
                "args": [1, 0]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Decode: key has to be smaller than input's length",
        input: "shortinput",
        expectedOutput: "Key should be smaller than the cipher's length",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Decode",
                "args": [22, 0]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Decode: offset should be positive",
        input: "shortinput",
        expectedOutput: "Offset has to be a positive integer",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Decode",
                "args": [2, -1]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Decode: Normal with Offset non-null",
        input: "51746026813793592840",
        expectedOutput: "12345678901234567890",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Decode",
                "args": [4, 2]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Encode: normal",
        input: "Cryptography is THE Art of Writing or solving codes",
        expectedOutput: "Cytgah sTEAto rtn rsligcdsrporpyi H r fWiigo ovn oe",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Encode",
                "args": [2, 0]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Encode: key has to be bigger than 2",
        input: "Cryptography is THE Art of Writing or solving codes",
        expectedOutput: "Key has to be bigger than 2",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Encode",
                "args": [1, 0]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Encode: key has to be smaller than input's length",
        input: "shortinput",
        expectedOutput: "Key should be smaller than the plain text's length",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Encode",
                "args": [22, 0]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Encode: offset should be positive",
        input: "shortinput",
        expectedOutput: "Offset has to be a positive integer",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Encode",
                "args": [2, -1]
            }
        ],
    },
    {
        name: "Rail Fence Cipher Encode: Normal with Offset non-null",
        input: "12345678901234567890",
        expectedOutput: "51746026813793592840",
        recipeConfig: [
            {
                "op": "Rail Fence Cipher Encode",
                "args": [4, 2]
            }
        ],
    },
]);
