/**
 * YARA Rules tests.
 *
 * @author Matt C [matt@artemisbot.uk]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const CONSOLE_COMPILE_WARNING_RULE = `import "console"
rule a
{
  strings:
    $s=" "
  condition:
    $s and console.log("log rule a")
}
rule b
{
  strings:
    $s=" "
  condition:
    $s and console.hex("log rule b: int8(0)=", int8(0))
}`;

TestRegister.addTests([
    {
        name: "YARA Match: simple foobar",
        input: "foobar foobar bar foo foobar",
        expectedOutput:
            'Rule "foo" matches (4 times):\nPos 0, length 3, identifier $re1, data: "foo"\nPos 7, length 3, identifier $re1, data: "foo"\nPos 18, length 3, identifier $re1, data: "foo"\nPos 22, length 3, identifier $re1, data: "foo"\nRule "bar" matches (4 times):\nPos 3, length 3, identifier $re1, data: "bar"\nPos 10, length 3, identifier $re1, data: "bar"\nPos 14, length 3, identifier $re1, data: "bar"\nPos 25, length 3, identifier $re1, data: "bar"\n',
        recipeConfig: [
            {
                "op": "YARA Rules",
                "args": [
                    "rule foo {strings: $re1 = /foo/ condition: $re1} rule bar {strings: $re1 = /bar/ condition: $re1}",
                    true,
                    true,
                    true,
                    true
                ]
            }
        ]
    },
    {
        name: "YARA Match: hashing rules",
        input: "Hello World!",
        expectedOutput: 'Input matches rule "HelloWorldMD5".\nInput matches rule "HelloWorldSHA256".\n',
        recipeConfig: [
            {
                "op": "YARA Rules",
                "args": [
                    `import "hash"
                    rule HelloWorldMD5 {
                        condition:
                            hash.md5(0,filesize) == "ed076287532e86365e841e92bfc50d8c"
                    }

                    rule HelloWorldSHA256 {
                        condition:
                            hash.sha256(0,filesize) == "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
                    }`,
                    true,
                    true,
                    true,
                    true,
                    false,
                    false
                ]
            }
        ]
    },
    {
        name: "YARA Match: compile warnings",
        input: "CyberChef Yara",
        expectedOutput:
            'Warning on line 5: string "$s" may slow down scanning\n'
            + 'Warning on line 12: string "$s" may slow down scanning\n'
            + 'Input matches rule "a".\n'
            + 'Input matches rule "b".\n',
        recipeConfig: [
            {
                "op": "YARA Rules",
                "args": [CONSOLE_COMPILE_WARNING_RULE, false, false, false, false, true, false]
            }
        ]
    },
    {
        name: "YARA Match: console messages",
        input: "CyberChef Yara",
        expectedOutput:
            "log rule a\n" + "log rule b: int8(0)=0x43\n" + 'Input matches rule "a".\n' + 'Input matches rule "b".\n',
        recipeConfig: [
            {
                "op": "YARA Rules",
                "args": [CONSOLE_COMPILE_WARNING_RULE, false, false, false, false, false, true]
            }
        ]
    }
]);
