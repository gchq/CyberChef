/**
 * Enigma machine tests.
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        // Simplest test: A single keypress in the default position on a basic
        // Enigma.
        name: "Enigma: basic wiring",
        input: "G",
        expectedOutput: "P",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    // Note: start on Z because it steps when the key is pressed
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "Z", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "",
                ],
            },
        ],
    },
    {
        // Rotor position test: single keypress, basic rotors, random start
        // positions, no advancement of other rotors.
        name: "Enigma: rotor position",
        input: "A",
        expectedOutput: "T",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "N",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "F",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "W",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
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
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "B",
                    "Z",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Rotor ring setting test: single keypress, basic rotors, random ring
        // settings, basic start position, no advancement of other rotors.
        name: "Enigma: rotor ring setting 2",
        input: "A",
        expectedOutput: "F",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "N",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "F",
                    "A",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "W",
                    "Z",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Stepping: basic configuration, enough input to cause middle rotor to
        // step
        name: "Enigma: stepping",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "UBDZG OWCXL TKSBT MCDLP BMUQO F",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "Z",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Ensure that we can decrypt an encrypted message.
        name: "Enigma: reflectivity",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "Z",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "Z",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Stepping: with rotors set so we're about to trigger the double step
        // anomaly
        name: "Enigma: double step anomaly",
        input: "AAAAA",
        expectedOutput: "EQIBM",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "D",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "U",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Stepping: with rotors set so we're about to trigger the double step
        // anomaly
        name: "Enigma: double step anomaly 2",
        input: "AAAA",
        expectedOutput: "BRNC",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "E",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "U",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Stepping: with rotors set so we're about to trigger the double step
        // anomaly
        name: "Enigma: double step anomaly 3",
        input: "AAAAA AAA",
        expectedOutput: "ZEEQI BMG",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "D",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "S",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Stepping: with a ring setting
        name: "Enigma: ring setting stepping",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "PBMFE BOUBD ZGOWC XLTKS BTXSH I",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "H",
                    "Z",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Stepping: with a ring setting and double step
        name: "Enigma: ring setting double step",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "TEVFK UTIIW EDWVI JPMVP GDEZS P",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "Q",
                    "A",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "C",
                    "D",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "H",
                    "F",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
                    "",
                ],
            },
        ],
    },
    {
        // Four-rotor Enigma, random settings, no plugboard
        name: "Enigma: four rotor",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "GZXGX QUSUW JPWVI GVBTU DQZNZ J",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "4-rotor",
                    "LEYJVCNIXWPBQMDRTAKZGFUHOS",
                    "A",
                    "X", // Beta
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "O",
                    "E",
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "P",
                    "F",
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "D",
                    "Q",
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "",
                ],
            },
        ],
    },
    {
        // Four-rotor Enigma, different wheel set, no plugboard
        name: "Enigma: four rotor 2",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "HZJLP IKWBZ XNCWF FIHWL EROOZ C",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "4-rotor",
                    "FSOKANUERHMBTIYCWLQPZXVGJD",
                    "A",
                    "L", // Gamma
                    "JPGVOUMFYQBENHZRDKASXLICTW<AN",
                    "A",
                    "J", // VI
                    "VZBRGITYUPSDNHLXAWMJQOFECK<A",
                    "M",
                    "G", // V
                    "ESOVPZJAYQUIRHXLNFTGKDCMWB<K",
                    "W",
                    "U", // IV
                    "AR BD CO EJ FN GT HK IV LM PW QZ SX UY", // C thin
                    "",
                ],
            },
        ],
    },
    {
        // Four-rotor Enigma, different wheel set, random plugboard
        name: "Enigma: plugboard",
        input: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        expectedOutput: "GHLIM OJIUW DKLWM JGNJK DYJVD K",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "4-rotor",
                    "FSOKANUERHMBTIYCWLQPZXVGJD",
                    "A",
                    "I", // Gamma
                    "NZJHGRCXMYSWBOUFAIVLPEKQDT<AN",
                    "I",
                    "V", // VII
                    "ESOVPZJAYQUIRHXLNFTGKDCMWB<K",
                    "O",
                    "O", // IV
                    "FKQHTLXOCBJSPDZRAMEWNIUYGV<AN",
                    "U",
                    "Z", // VIII
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "WN MJ LX YB FP QD US IH CE GR",
                ],
            },
        ],
    },
    {
        // Decryption test on above input
        name: "Enigma: decryption",
        input: "GHLIM OJIUW DKLWM JGNJK DYJVD K",
        expectedOutput: "AAAAA AAAAA AAAAA AAAAA AAAAA A",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "4-rotor",
                    "FSOKANUERHMBTIYCWLQPZXVGJD",
                    "A",
                    "I", // Gamma
                    "NZJHGRCXMYSWBOUFAIVLPEKQDT<AN",
                    "I",
                    "V", // VII
                    "ESOVPZJAYQUIRHXLNFTGKDCMWB<K",
                    "O",
                    "O", // IV
                    "FKQHTLXOCBJSPDZRAMEWNIUYGV<AN",
                    "U",
                    "Z", // VIII
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "WN MJ LX YB FP QD US IH CE GR",
                ],
            },
        ],
    },
    {
        // Decryption test on real message
        name: "Enigma: decryption 2",
        input: "LANOTCTOUARBBFPMHPHGCZXTDYGAHGUFXGEWKBLKGJWLQXXTGPJJAVTOCKZFSLPPQIHZFXOEBWIIEKFZLCLOAQJULJOYHSSMBBGWHZANVOIIPYRBRTDJQDJJOQKCXWDNBBTYVXLYTAPGVEATXSONPNYNQFUDBBHHVWEPYEYDOHNLXKZDNWRHDUWUJUMWWVIIWZXIVIUQDRHYMNCYEFUAPNHOTKHKGDNPSAKNUAGHJZSMJBMHVTREQEDGXHLZWIFUSKDQVELNMIMITHBHDBWVHDFYHJOQIHORTDJDBWXEMEAYXGYQXOHFDMYUXXNOJAZRSGHPLWMLRECWWUTLRTTVLBHYOORGLGOWUXNXHMHYFAACQEKTHSJW",
        expectedOutput:
            "KRKRALLEXXFOLGENDESISTSOFORTBEKANNTZUGEBENXXICHHABEFOLGELNBEBEFEHLERHALTENXXJANSTERLEDESBISHERIGXNREICHSMARSCHALLSJGOERINGJSETZTDERFUEHRERSIEYHVRRGRZSSADMIRALYALSSEINENNACHFOLGEREINXSCHRIFTLSCHEVOLLMACHTUNTERWEGSXABSOFORTSOLLENSIESAEMTLICHEMASSNAHMENVERFUEGENYDIESICHAUSDERGEGENWAERTIGENLAGEERGEBENXGEZXREICHSLEITEIKKTULPEKKJBORMANNJXXOBXDXMMMDURNHFKSTXKOMXADMXUUUBOOIEXKP",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "4-rotor",
                    "LEYJVCNIXWPBQMDRTAKZGFUHOS",
                    "E",
                    "C", // Beta
                    "VZBRGITYUPSDNHLXAWMJQOFECK<A",
                    "P",
                    "D", // V
                    "JPGVOUMFYQBENHZRDKASXLICTW<AN",
                    "E",
                    "S", // VI
                    "FKQHTLXOCBJSPDZRAMEWNIUYGV<AN",
                    "L",
                    "Z", // VIII
                    "AR BD CO EJ FN GT HK IV LM PW QZ SX UY", // C thin
                    "AE BF CM DQ HU JN LX PR SZ VW",
                ],
            },
        ],
    },
    {
        // Non-alphabet characters drop test
        name: "Enigma: non-alphabet drop",
        input: "Hello, world. This is a test.",
        expectedOutput: "ILBDA AMTAZ MORNZ DDIOT U",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "A", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "",
                    true,
                ],
            },
        ],
    },
    {
        // Non-alphabet characters passthrough test
        name: "Enigma: non-alphabet passthrough",
        input: "Hello, world. This is a test.",
        expectedOutput: "ILBDA, AMTAZ. MORN ZD D IOTU.",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "A", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "",
                    false,
                ],
            },
        ],
    },
    {
        name: "Enigma: rotor validation 1",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor wiring must be 26 unique uppercase letters",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQ",
                    "A",
                    "A", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "",
                ],
            },
        ],
    },
    {
        name: "Enigma: rotor validation 2",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor wiring must be 26 unique uppercase letters",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQo",
                    "A",
                    "A", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "",
                ],
            },
        ],
    },
    {
        name: "Enigma: rotor validation 3",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor wiring must have each letter exactly once",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQA",
                    "A",
                    "A", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "",
                ],
            },
        ],
    },
    {
        name: "Enigma: rotor validation 4",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor steps must be unique",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<RR",
                    "A",
                    "A", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "",
                ],
            },
        ],
    },
    {
        name: "Enigma: rotor validation 5",
        input: "Hello, world. This is a test.",
        expectedOutput: "Rotor steps must be 0-26 unique uppercase letters",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<a",
                    "A",
                    "A", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "",
                ],
            },
        ],
    },
    // The ring setting and positions are dropdowns in the interface so not
    // gonna bother testing them
    {
        name: "Enigma: reflector validation 1",
        input: "Hello, world. This is a test.",
        expectedOutput:
            "Reflector must have exactly 13 pairs covering every letter",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "A", // III
                    "AY BR CU DH EQ FS GL IP JX KN MO", // B
                    "",
                ],
            },
        ],
    },
    {
        name: "Enigma: reflector validation 2",
        input: "Hello, world. This is a test.",
        expectedOutput:
            "Reflector must have exactly 13 pairs covering every letter",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "A", // III
                    "AA BR CU DH EQ FS GL IP JX KN MO TZ VV WY", // B
                    "",
                ],
            },
        ],
    },
    {
        name: "Enigma: reflector validation 3",
        input: "Hello, world. This is a test.",
        expectedOutput: "Reflector connects A more than once",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "A", // III
                    "AY AR CU DH EQ FS GL IP JX KN MO TZ", // B
                    "",
                ],
            },
        ],
    },
    {
        name: "Enigma: reflector validation 4",
        input: "Hello, world. This is a test.",
        expectedOutput:
            "Reflector must be a whitespace-separated list of uppercase letter pairs",
        recipeConfig: [
            {
                op: "Enigma",
                args: [
                    "3-rotor",
                    "",
                    "A",
                    "A",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
                    "A",
                    "A", // I
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
                    "A",
                    "A", // II
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "A",
                    "A", // III
                    "AYBR CU DH EQ FS GL IP JX KN MO TZ", // B
                    "",
                ],
            },
        ],
    },
]);
