/**
 * Base85 tests
 *
 * @author john19696
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

// Example from Wikipedia
const wpExample = "Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.";
// Escape newline, quote & backslash
const wpOutput = "9jqo^BlbD-BleB1DJ+*+F(f,q/0JhKF<GL>Cj@.4Gp$d7F!,L7@<6@)/0JDEF<G%<+EV:2F!,O<\
DJ+*.@<*K0@<6L(Df-\\0Ec5e;DffZ(EZee.Bl.9pF\"AGXBPCsi+DGm>@3BB/F*&OCAfu2/AKYi(\
DIb:@FD,*)+C]U=@3BN#EcYf8ATD3s@q?d$AftVqCh[NqF<G:8+EV:.+Cf>-FD5W8ARlolDIal(\
DId<j@<?3r@:F%a+D58'ATD4$Bl@l3De:,-DJs`8ARoFb/0JMK@qB4^F!,R<AKZ&-DfTqBG%G>u\
D.RTpAKYo'+CT/5+Cei#DII?(E,9)oF*2M7/c";

TestRegister.addTests([
    {
        name: "To Base85",
        input: wpExample,
        expectedOutput: wpOutput,
        recipeConfig: [
            { "op": "To Base85",
                "args": ["!-u"] }
        ]
    },
    {
        name: "From Base85",
        input: wpOutput + "\n",
        expectedOutput: wpExample,
        recipeConfig: [
            { "op": "From Base85",
                "args": ["!-u", true] }
        ]
    },
    {
        name: "From Base85",
        input: wpOutput + "v",
        expectedError: true,
        expectedOutput: "From Base85 - Invalid character 'v' at index 337",
        recipeConfig: [
            { "op": "From Base85",
                "args": ["!-u", false] }
        ]
    },
]);
