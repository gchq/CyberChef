/**
 * Enigma machine tests.
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        // Simplest test: A single keypress in the default position on a basic
        // Enigma.
        name: "Enigma: basic wiring",
        input: "G",
        expectedOutput: "P",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    // Note: start on Z because it steps when the key is pressed
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "Z", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    ""
                ]
            }
        ]
    },
    {
        // Rotor position test: single keypress, basic rotors, random start
        // positions, no advancement of other rotors.
        name: "Enigma: rotor position",
        input: "A",
        expectedOutput: "T",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "W",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "F",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "N",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Rotor ring setting test: single keypress, basic rotors, one rotor
        // ring offset by one, basic start position, no advancement of other
        // rotors.
        name: "Enigma: rotor ring setting",
        input: "A",
        expectedOutput: "O",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "B", "Z",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Rotor ring setting test: single keypress, basic rotors, random ring
        // settings, basic start position, no advancement of other rotors.
        name: "Enigma: rotor ring setting 2",
        input: "A",
        expectedOutput: "F",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "W", "Z",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "F", "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "N", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Stepping: basic configuration, enough input to cause middle rotor to
        // step
        name: "Enigma: stepping",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "UBDZG OWCXL TKSBT MCDLP BMUQO F",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "Z",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Ensure that we can decrypt an encrypted message.
        name: "Enigma: reflectivity",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "Z",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            },
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "Z",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Stepping: with rotors set so we're about to trigger the double step
        // anomaly
        name: "Enigma: double step anomaly",
        input: "AAAAA",
        expectedOutput: "EQIBM",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "U",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "D",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Stepping: with rotors set so we're about to trigger the double step
        // anomaly
        name: "Enigma: double step anomaly 2",
        input: "AAAA",
        expectedOutput: "BRNC",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "U",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "E",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Stepping: with rotors set so we're about to trigger the double step
        // anomaly
        name: "Enigma: double step anomaly 3",
        input: "AAAAA AAA",
        expectedOutput: "ZEEQI BMG",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "S",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "D",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Stepping: with a ring setting
        name: "Enigma: ring setting stepping",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "PBMFE BOUBD ZGOWC XLTKS BTXSH I",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "H", "Z",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Stepping: with a ring setting and double step
        name: "Enigma: ring setting double step",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "TEVFK UTIIW EDWVI JPMVP GDEZS P",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "H", "F",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "C", "D",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "Q", "A",
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    ""
                ]
            }
        ]
    },
    {
        // Four-rotor Enigma, random settings, no plugboard
        name: "Enigma: four rotor",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "GZXGX QUSUW JPWVI GVBTU DQZNZ J",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "D", "Q",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "P", "F",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "O", "E",
                    "LEYJVCNIXWPBQMDRTAKZGFUHOS", "A", "X", // Beta
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    ""
                ]
            }
        ]
    },
    {
        // Four-rotor Enigma, different wheel set, no plugboard
        name: "Enigma: four rotor 2",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "HZJLP IKWBZ XNCWF FIHWL EROOZ C",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "ESOVPZJAYQUIRHXLNFTGKDCMWB<K", "W", "U", // IV
                    "VZBRGITYUPSDNHLXAWMJQOFECK<A", "M", "G", // V
                    "JPGVOUMFYQBENHZRDKASXLICTW<AN", "A", "J", // VI
                    "FSOKANUERHMBTIYCWLQPZXVGJD", "A", "L", // Gamma
                    "AR BD CO EJ FN GT HK IV LM PW QZ SX UY", // C thin
                    ""
                ]
            }
        ]
    },
    {
        // Four-rotor Enigma, different wheel set, random plugboard
        name: "Enigma: plugboard",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "GHLIM OJIUW DKLWM JGNJK DYJVD K",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "FKQHTLXOCBJSPDZRAMEWNIUYGV<AN", "U", "Z", // VIII
                    "ESOVPZJAYQUIRHXLNFTGKDCMWB<K", "O", "O", // IV
                    "NZJHGRCXMYSWBOUFAIVLPEKQDT<AN", "I", "V", // VII
                    "FSOKANUERHMBTIYCWLQPZXVGJD", "A", "I", // Gamma
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "WN MJ LX YB FP QD US IH CE GR"
                ]
            }
        ]
    },
    {
        // Decryption test on above input
        name: "Enigma: decryption",
        input: "GHLIM OJIUW DKLWM JGNJK DYJVD K",
        expectedOutput: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "FKQHTLXOCBJSPDZRAMEWNIUYGV<AN", "U", "Z", // VIII
                    "ESOVPZJAYQUIRHXLNFTGKDCMWB<K", "O", "O", // IV
                    "NZJHGRCXMYSWBOUFAIVLPEKQDT<AN", "I", "V", // VII
                    "FSOKANUERHMBTIYCWLQPZXVGJD", "A", "I", // Gamma
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "WN MJ LX YB FP QD US IH CE GR"
                ]
            }
        ]
    },
    {
        // Decryption test on real message
        name: "Enigma: decryption 2",
        input: "LANOTCTOUARBBFPMHPHGCZXTDYGAHGUFXGEWKBLKGJWLQXXTGPJJAVTOCKZFSLPPQIHZFXOEBWIIEKFZLCLOAQJULJOYHSSMBBGWHZANVOIIPYRBRTDJQDJJOQKCXWDNBBTYVXLYTAPGVEATXSONPNYNQFUDBBHHVWEPYEYDOHNLXKZDNWRHDUWUJUMWWVIIWZXIVIUQDRHYMNCYEFUAPNHOTKHKGDNPSAKNUAGHJZSMJBMHVTREQEDGXHLZWIFUSKDQVELNMIMITHBHDBWVHDFYHJOQIHORTDJDBWXEMEAYXGYQXOHFDMYUXXNOJAZRSGHPLWMLRECWWUTLRTTVLBHYOORGLGOWUXNXHMHYFAACQEKTHSJW",
        expectedOutput: "KRKRALLEXXFOLGENDESISTSOFORTBEKANNTZUGEBENXXICHHABEFOLGELNBEBEFEHLERHALTENXXJANSTERLEDESBISHERIGXNREICHSMARSCHALLSJGOERINGJSETZTDERFUEHRERSIEYHVRRGRZSSADMIRALYALSSEINENNACHFOLGEREINXSCHRIFTLSCHEVOLLMACHTUNTERWEGSXABSOFORTSOLLENSIESAEMTLICHEMASSNAHMENVERFUEGENYDIESICHAUSDERGEGENWAERTIGENLAGEERGEBENXGEZXREICHSLEITEIKKTULPEKKJBORMANNJXXOBXDXMMMDURNHFKSTXKOMXADMXUUUBOOIEXKP",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "FKQHTLXOCBJSPDZRAMEWNIUYGV<AN", "L", "Z", // VIII
                    "JPGVOUMFYQBENHZRDKASXLICTW<AN", "E", "S", // VI
                    "VZBRGITYUPSDNHLXAWMJQOFECK<A", "P", "D", // V
                    "LEYJVCNIXWPBQMDRTAKZGFUHOS", "E", "C", // Beta
                    "AR BD CO EJ FN GT HK IV LM PW QZ SX UY", // C thin
                    "AE BF CM DQ HU JN LX PR SZ VW"
                ]
            }
        ]
    },
    {
        // Non-alphabet characters drop test
        name: "Enigma: non-alphabet drop",
        input: "Hello, world. This is a test.",
        expectedOutput: "ILBDA AMTAZ MORNZ DDIOT U",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "", true
                ]
            }
        ]
    },
    {
        // Non-alphabet characters passthrough test
        name: "Enigma: non-alphabet passthrough",
        input: "Hello, world. This is a test.",
        expectedOutput: "ILBDA, AMTAZ. MORN ZD D IOTU.",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "", false
                ]
            }
        ]
    },
    {
        name: "Enigma: rotor validation 1",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor wiring must be 26 unique uppercase letters",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQ", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    ""
                ]
            }
        ]
    },
    {
        name: "Enigma: rotor validation 2",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor wiring must be 26 unique uppercase letters",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQo", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    ""
                ]
            }
        ]
    },
    {
        name: "Enigma: rotor validation 3",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor wiring must have each letter exactly once",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQA", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    ""
                ]
            }
        ]
    },
    {
        name: "Enigma: rotor validation 4",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor steps must be unique",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<RR", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    ""
                ]
            }
        ]
    },
    {
        name: "Enigma: rotor validation 5",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor steps must be 0-26 unique uppercase letters",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<a", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    ""
                ]
            }
        ]
    },
    // The ring setting and positions are dropdowns in the interface so not
    // gonna bother testing them
    {
        name: "Enigma: reflector validation 1",
        input: "Hello, world. This is a test.",
        expectedOutput: "Reflector must have exactly 13 pairs covering every letter",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY BR CU DH EQ FS GL IP JX KN MO", // B
                    ""
                ]
            }
        ]
    },
    {
        name: "Enigma: reflector validation 2",
        input: "Hello, world. This is a test.",
        expectedOutput: "Reflector: cannot connect A to itself",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AA BR CU DH EQ FS GL IP JX KN MO TZ", // B
                    ""
                ]
            }
        ]
    },
    {
        name: "Enigma: reflector validation 3",
        input: "Hello, world. This is a test.",
        expectedOutput: "Reflector connects A more than once",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AY AR CU DH EQ FS GL IP JX KN MO TZ", // B
                    ""
                ]
            }
        ]
    },
    {
        name: "Enigma: reflector validation 4",
        input: "Hello, world. This is a test.",
        expectedOutput: "Reflector must be a whitespace-separated list of uppercase letter pairs",
        recipeConfig: [
            {
                "op": "Enigma",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", "A", "A", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", "A", "A", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", "A", "A", // I
                    "", "A", "A",
                    "AYBR CU DH EQ FS GL IP JX KN MO TZ", // B
                    ""
                ]
            }
        ]
    },
]);
