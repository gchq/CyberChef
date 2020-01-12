/**
SIGABA machine tests

@author hettysymes
@copyright hettysymes 2020
@license Apache-2.0
*/
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "SIGABA: encrypt",
        input: "hello world testing the sigaba machine",
        expectedOutput: "ULBECJCZJBJFVUDLIXGLGIVXSYGMFRJVCERGOX",
        recipeConfig: [
            {
                "op": "SIGABA",
                "args": [
                    "BHKWECJDOVAYLFMITUGXRNSPZQ", true, "G",
                    "CDTAKGQOZXLVJYHSWMIBPRUNEF", false, "L",
                    "WAXHJZMBVDPOLTUYRCQFNSGKEI", false, "I",
                    "HUSCWIMJQXDALVGBFTOYZKRPNE", false, "T",
                    "RTLSMNKXFVWQUZGCHEJBYDAIPO", false, "B",
                    "GHAQBRJWDMNZTSKLOUXYPFIECV", false, "N",
                    "VFLGEMTCXZIQDYAKRPBONHWSUJ", true, "Q",
                    "ZQCAYHRJNXPFLKIOTBUSVWMGDE", false, "B",
                    "EZVSWPCTULGAOFDJNBIYMXKQHR", false, "J",
                    "ELKSGDXMVYJUZNCAROQBPWHITF", false, "R",
                    "3891625740", "3",
                    "6297135408", "1",
                    "2389715064", "8",
                    "9264351708", "6",
                    "9573086142", "6",
                    "Encrypt"
                ]
            }
        ]
    },
    {
        name: "SIGABA: decrypt",
        input: "helloxworldxtestingxthexsigabaxmachine",
        expectedOutput: "XWCIWSAIQKNPBUKAP QXVYW RRNYAWXKRBGCQS",
        recipeConfig: [
            {
                "op": "SIGABA",
                "args": [
                    "ZECIPSQVBYKJTNRLOXUFGAWHMD", false, "C",
                    "IPHECDYSZTRXQUKWNVGOBLFJAM", true, "J",
                    "YHXUSRKIJVQWTPLAZOMDCGNEFB", true, "Z",
                    "TDPVSOBXULANZQYEHIGFMCRWJK", false, "W",
                    "THZGFXQRVBSDUICNYJWPAEMOKL", false, "F",
                    "KOVUTBMZQWGYDNAICSPHERXJLF", false, "F",
                    "DSTRLAUFXGWCEOKQPVMBZNIYJH", true, "A",
                    "KCULNSIXJDPEHGQYRTFZVWOBAM", false, "H",
                    "DZANEQLOWYRXKGUSIVJFMPBCHT", true, "M",
                    "MVRLHTPFWCAOKEGXZBJYIQUNSD", false, "E",
                    "9421765830", "3",
                    "3476815902", "2",
                    "5701842693", "7",
                    "4178920536", "0",
                    "5243709861", "1",
                    "Decrypt"
                ]
            }
        ]
    }
]);
