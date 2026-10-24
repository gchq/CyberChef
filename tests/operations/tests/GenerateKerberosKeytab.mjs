/**
 * Generate Kerberos Keytab operation tests
 *
 * @author mansiverma897993
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Generate Kerberos Keytab: Single key via UI args (RC4)",
        input: "",
        expectedOutput: "05020000003b00010009574f524b47524f5550000b657368656c6c7374726f70000000010000000001001700103f29138a04aadc19214e9c04028bf38100000001",
        recipeConfig: [
            {
                op: "Generate Kerberos Keytab",
                args: [
                    "eshellstrop",
                    "WORKGROUP",
                    1,
                    "RC4-HMAC (23)",
                    "3f29138a04aadc19214e9c04028bf381",
                    "Hex"
                ],
            },
        ],
    },
    {
        name: "Generate Kerberos Keytab: Multiple keys via CSV input",
        input: "eshellstrop,WORKGROUP,1,23,3f29138a04aadc19214e9c04028bf381\ncifs/server.example.local,EXAMPLE.LOCAL,2,18,00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
        expectedOutput: "05020000003b00010009574f524b47524f5550000b657368656c6c7374726f70000000010000000001001700103f29138a04aadc19214e9c04028bf381000000010000005e0002000d4558414d504c452e4c4f43414c00046369667300147365727665722e6578616d706c652e6c6f63616c0000000100000000020012002000112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00000002",
        recipeConfig: [
            {
                op: "Generate Kerberos Keytab",
                args: [
                    "",
                    "",
                    1,
                    "RC4-HMAC (23)",
                    "",
                    "Hex"
                ],
            },
        ],
    },
    {
        name: "Generate Kerberos Keytab: JSON input format",
        input: '[\n  {"principal": "eshellstrop", "realm": "WORKGROUP", "kvno": 1, "etype": 23, "key": "3f29138a04aadc19214e9c04028bf381"}\n]',
        expectedOutput: "05020000003b00010009574f524b47524f5550000b657368656c6c7374726f70000000010000000001001700103f29138a04aadc19214e9c04028bf38100000001",
        recipeConfig: [
            {
                op: "Generate Kerberos Keytab",
                args: [
                    "",
                    "",
                    1,
                    "RC4-HMAC (23)",
                    "",
                    "Hex"
                ],
            },
        ],
    },
    {
        name: "Generate Kerberos Keytab: Detailed Summary Text output",
        input: "",
        expectedOutput: "Kerberos KRB5 Keytab Generation Summary:\n-----------------------------------------\nSuccessfully generated a keytab file with 1 entries:\n\nEntry 1:\n  Principal:   eshellstrop\n  Realm:       WORKGROUP\n  KVNO:        1\n  Etype:       RC4-HMAC (23)\n  Key (Hex):   3f29138a04aadc19214e9c04028bf381\n\nWireshark Configuration Instructions:\n-------------------------------------\n1. Save the generated keytab output as a file (e.g. krb5.keytab).\n2. Open Wireshark and go to: Edit -> Preferences -> Protocols -> KRB5\n3. Enable \"Decrypt Kerberos traffic\" (if available).\n4. Click \"Browse...\" next to \"Kerberos keytab file\" and select the generated file.\n5. Wireshark will now automatically decrypt Kerberos, DCE/RPC, LDAP, and SMB traffic where these keys are valid.\n",
        recipeConfig: [
            {
                op: "Generate Kerberos Keytab",
                args: [
                    "eshellstrop",
                    "WORKGROUP",
                    1,
                    "RC4-HMAC (23)",
                    "3f29138a04aadc19214e9c04028bf381",
                    "Detailed Summary Text"
                ],
            },
        ],
    },
]);
