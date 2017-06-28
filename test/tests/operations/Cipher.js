/**
 * Cipher tests.
 *
 * @author Matt C [matt@artemisbot.uk]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
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
]);
