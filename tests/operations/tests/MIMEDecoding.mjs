/**
 * MIME Header Decoding tests
 * 
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Encoded =?",
        input: "=?=?utf-8?q?test?=",
        expectedOutput: "=?test",
        recipeConfig: [
            {
                "op": "MIME Decoding",
                "args": []
            }
        ]
    },
    {
        name: "UTF-8 Encodings Multiple Headers",
        input: "=?utf-8?q?=C3=89ric?= <eric@example.org>, =?utf-8?q?Ana=C3=AFs?= <anais@example.org>",
        expectedOutput: "Éric <eric@example.org>, Anaïs <anais@example.org>",
        recipeConfig: [
            {
                "op": "MIME Decoding",
                "args": []
            }
        ]
    },
    {
        name: "UTF-8 Encodings Single Header",
        input: "=?utf-8?q?=C2=A1Hola,?= =?utf-8?q?_se=C3=B1or!?=",
        expectedOutput: "¡Hola, señor!",
        recipeConfig: [
            {
                "op": "MIME Decoding",
                "args": []
            }
        ]
    },

]);
