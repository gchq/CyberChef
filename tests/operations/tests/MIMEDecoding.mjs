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
        name: "Encoded comments",
        input: "(=?ISO-8859-1?Q?a?=)",
        expectedOutput: "(a)",
        recipeConfig: [
            {
                "op": "MIME Decoding",
                "args": []
            }
        ]
    },
    {
        name: "Encoded adjacent comments whitespace",
        input: "(=?ISO-8859-1?Q?a?= b)",
        expectedOutput: "(a b)",
        recipeConfig: [
            {
                "op": "MIME Decoding",
                "args": []
            }
        ]
    },
    {
        name: "Encoded adjacent single whitespace ignored",
        input: "(=?ISO-8859-1?Q?a?= =?ISO-8859-1?Q?b?=)",
        expectedOutput: "(ab)",
        recipeConfig: [
            {
                "op": "MIME Decoding",
                "args": []
            }
        ]
    },
    {
        name: "Encoded adjacent double whitespace ignored",
        input: "(=?ISO-8859-1?Q?a?=  =?ISO-8859-1?Q?b?=)",
        expectedOutput: "(ab)",
        recipeConfig: [
            {
                "op": "MIME Decoding",
                "args": []
            }
        ]
    },
    {
        name: "Encoded adjacent CRLF whitespace ignored",
        input: "(=?ISO-8859-1?Q?a?=\r\n =?ISO-8859-1?Q?b?=)",
        expectedOutput: "(ab)",
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
        name: "ISO Decoding",
        input: "From: =?US-ASCII?Q?Keith_Moore?= <moore@cs.utk.edu>\nTo: =?ISO-8859-1?Q?Keld_J=F8rn_Simonsen?= <keld@dkuug.dk>\nCC: =?ISO-8859-1?Q?Andr=E9?= Pirard <PIRARD@vm1.ulg.ac.be>\nSubject: =?ISO-8859-1?B?SWYgeW91IGNhbiByZWFkIHRoaXMgeW8=?=\n=?ISO-8859-2?B?dSB1bmRlcnN0YW5kIHRoZSBleGFtcGxlLg==?=",
        expectedOutput: "From: Keith Moore <moore@cs.utk.edu>\nTo: Keld Jørn Simonsen <keld@dkuug.dk>\nCC: André Pirard <PIRARD@vm1.ulg.ac.be>\nSubject: If you can read this you understand the example.",
        recipeConfig: [
            {
                "op": "MIME Decoding",
                "args": []
            }
        ]
    }
]);
