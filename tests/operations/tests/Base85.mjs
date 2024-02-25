/**
 * Base85 tests
 *
 * @author john19696
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

// Example from Wikipedia
const wpExample
    = "Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.";
// Escape newline, quote & backslash
const wpOutput
    = "9jqo^BlbD-BleB1DJ+*+F(f,q/0JhKF<GL>Cj@.4Gp$d7F!,L7@<6@)/0JDEF<G%<+EV:2F!,O<\
DJ+*.@<*K0@<6L(Df-\\0Ec5e;DffZ(EZee.Bl.9pF\"AGXBPCsi+DGm>@3BB/F*&OCAfu2/AKYi(\
DIb:@FD,*)+C]U=@3BN#EcYf8ATD3s@q?d$AftVqCh[NqF<G:8+EV:.+Cf>-FD5W8ARlolDIal(\
DId<j@<?3r@:F%a+D58'ATD4$Bl@l3De:,-DJs`8ARoFb/0JMK@qB4^F!,R<AKZ&-DfTqBG%G>u\
D.RTpAKYo'+CT/5+Cei#DII?(E,9)oF*2M7/c";

const allZeroExample
    = "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff";

const allZeroOutput
    = "zz!!*-'\"9eu7#RLhG$k3[W&.oNg'GVB\"(`=52*$$(B+<_pR,UFcb-n-Vr/1iJ-0JP==1c70M3&s#]4?Ykm5X@_(6q'R884cEH9MJ8X:f1+h<)lt#=BSg3>[:ZC?t!MSA7]@cBPD3sCi+'.E,fo>FEMbNG^4U^I!pHnJ:W<)KS>/9Ll%\"IN/`jYOHG]iPa.Q$R$jD4S=Q7DTV8*TUnsrdW2ZetXKAY/Yd(L?['d?O\\@K2_]Y2%o^qmn*`5Ta:aN;TJbg\"GZd*^:jeCE.%f\\,!5gtgiEi8N\\UjQ5OekiqBum-X60nF?)@o_%qPq\"ad`r;HWp";

TestRegister.addTests([
    {
        name: "To Base85",
        input: wpExample,
        expectedOutput: wpOutput,
        recipeConfig: [{ "op": "To Base85", "args": ["!-u"] }]
    },
    {
        name: "From Base85",
        input: wpOutput + "\n",
        expectedOutput: wpExample,
        recipeConfig: [{ "op": "From Base85", "args": ["!-u", true] }]
    },
    {
        name: "From Base85",
        input: wpOutput + "v",
        expectedError: true,
        expectedOutput: "From Base85 - Invalid character 'v' at index 337",
        recipeConfig: [{ "op": "From Base85", "args": ["!-u", false] }]
    },
    {
        name: "To Base85",
        input: allZeroExample,
        expectedOutput: allZeroOutput,
        recipeConfig: [{ "op": "To Base85", "args": ["!-u"] }]
    },
    {
        name: "From Base85",
        input: allZeroOutput,
        expectedOutput: allZeroExample,
        recipeConfig: [{ "op": "From Base85", "args": ["!-u", true, "z"] }]
    }
]);
