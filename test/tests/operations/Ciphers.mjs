/**
 * Cipher tests.
 *
 * @author Matt C [matt@artemisbot.uk]
 * @author n1474335 [n1474335@gmail.com]
 * 
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";


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
]);
