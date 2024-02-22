/**
 * Base62 tests.
 *
 * @author tcode2k16 [tcode2k16@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Base62: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Base62",
                args: ["0-9A-Za-z"],
            },
        ],
    },
    {
        name: "To Base62: Hello, World!",
        input: "Hello, World!",
        expectedOutput: "1wJfrzvdbtXUOlUjUf",
        recipeConfig: [
            {
                op: "To Base62",
                args: ["0-9A-Za-z"],
            },
        ],
    },
    {
        name: "To Base62: UTF-8",
        input: "ნუ პანიკას",
        expectedOutput: "BPDNbjoGvDCDzHbKT77eWg0vGQrJuWRXltuRVZ",
        recipeConfig: [
            {
                op: "To Base62",
                args: ["0-9A-Za-z"],
            },
        ],
    },
    {
        name: "From Base62: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Base62",
                args: ["0-9A-Za-z"],
            },
        ],
    },
    {
        name: "From Base62: Hello, World!",
        input: "1wJfrzvdbtXUOlUjUf",
        expectedOutput: "Hello, World!",
        recipeConfig: [
            {
                op: "From Base62",
                args: ["0-9A-Za-z"],
            },
        ],
    },
    {
        name: "From Base62: UTF-8",
        input: "BPDNbjoGvDCDzHbKT77eWg0vGQrJuWRXltuRVZ",
        expectedOutput: "ნუ პანიკას",
        recipeConfig: [
            {
                op: "From Base62",
                args: ["0-9A-Za-z"],
            },
        ],
    }
]);
