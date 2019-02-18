/**
 * JWT Decode tests
 *
 * @author gchq77703 []
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

const outputObject = JSON.stringify({
    String: "SomeString",
    Number: 42,
    iat: 1
}, null, 4);

TestRegister.addTests([
    {
        name: "JWT Decode: HS",
        input: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.0ha6-j4FwvEIKPVZ-hf3S_R9Hy_UtXzq4dnedXcUrXk",
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "JWT Decode",
                args: [],
            }
        ],
    },
    {
        name: "JWT Decode: RS",
        input: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.MjEJhtZk2nXzigi24piMzANmrj3mILHJcDl0xOjl5a8EgdKVL1oaMEjTkMQp5RA8YrqeRBFaX-BGGCKOXn5zPY1DJwWsBUyN9C-wGR2Qye0eogH_3b4M9EW00TPCUPXm2rx8URFj7Wg9VlsmrGzLV2oKkPgkVxuFSxnpO3yjn1Y",
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "JWT Decode",
                args: [],
            }
        ],
    },
    {
        name: "JWT Decode: ES",
        input: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.WkECT51jSfpRkcpQ4x0h5Dwe7CFBI6u6Et2gWp91HC7mpN_qCFadRpsvJLtKubm6cJTLa68xtei0YrDD8fxIUA",
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "JWT Decode",
                args: [],
            }
        ],
    }
]);
