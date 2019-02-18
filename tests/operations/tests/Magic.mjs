/**
 * Magic tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";


TestRegister.addTests([
    {
        name: "Magic: nothing",
        input: "",
        expectedOutput: "Nothing of interest could be detected about the input data.\nHave you tried modifying the operation arguments?",
        recipeConfig: [
            {
                op: "Magic",
                args: [3, false, false]
            }
        ],
    },
    {
        name: "Magic: hex",
        input: "41 42 43 44 45",
        expectedMatch: /"#recipe=From_Hex\('Space'\)"/,
        recipeConfig: [
            {
                op: "Magic",
                args: [3, false, false]
            }
        ],
    },
    {
        name: "Magic: jpeg",
        input: "\xFF\xD8\xFF",
        expectedMatch: /Render_Image\('Raw'\)/,
        recipeConfig: [
            {
                op: "Magic",
                args: [3, false, false]
            }
        ],
    },
    {
        name: "Magic: mojibake",
        input: "d091d18bd100d182d180d0b0d10020d0bad0bed180d0b8d187d0bdd0b5d0b2d0b0d10020d0bbd0b8d100d0b020d0bfd180d18bd0b3d0b0d0b5d18220d187d0b5d180d0b5d0b720d0bbd0b5d0bdd0b8d0b2d183d18e20d100d0bed0b1d0b0d0bad1832e",
        expectedMatch: /Быртрар коричневар лира прыгает через ленивую робаку./,
        recipeConfig: [
            {
                op: "Magic",
                args: [3, true, false]
            }
        ],
    },
]);
