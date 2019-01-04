/**
 * Remove Diacritics tests.
 *
 * @author Klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister";

TestRegister.addTests([
    {
        name: "Remove Diacritics",
        input: "\xe0, \xe8, \xec, \xf2, \xf9  \xc0, \xc8, \xcc, \xd2, \xd9\n\xe1, \xe9, \xed, \xf3, \xfa, \xfd \xc1, \xc9, \xcd, \xd3, \xda, \xdd\n\xe2, \xea, \xee, \xf4, \xfb \xc2, \xca, \xce, \xd4, \xdb\n\xe3, \xf1, \xf5 \xc3, \xd1, \xd5\n\xe4, \xeb, \xef, \xf6, \xfc, \xff \xc4, \xcb, \xcf, \xd6, \xdc, \u0178\n\xe5, \xc5",
        expectedOutput: "a, e, i, o, u  A, E, I, O, U\na, e, i, o, u, y A, E, I, O, U, Y\na, e, i, o, u A, E, I, O, U\na, n, o A, N, O\na, e, i, o, u, y A, E, I, O, U, Y\na, A",
        recipeConfig: [
            {
                "op": "Remove Diacritics",
                "args": []
            },
        ],
    },
]);
