/**
 * extract bitcoin address tests.
 *
 * @author homerjonathan [homer.jonathan@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extract Bitcoin Addresse",
        input: "Ransomware I received once! My modest consulting fee is 1650 US Dollars transferred in Bitcoin. Exchange rate at the time of the transfer.\nYou need to send that amount to this wallet: 1HSb4fZHmyNro5LGyjQFpcDwqKjRUqJhh2",
        expectedOutput: "1HSb4fZHmyNro5LGyjQFpcDwqKjRUqJhh2\n",
        recipeConfig: [
            {
                "op": "Extract Bitcoin Addresses",
                "args": [false]
            },
        ],
    },
    {
        name: "Extract Bitcoin Addresse - Display total",
        input: "Ransomware I received once! My modest consulting fee is 1650 US Dollars transferred in Bitcoin. Exchange rate at the time of the transfer.\nYou need to send that amount to this wallet: 1HSb4fZHmyNro5LGyjQFpcDwqKjRUqJhh2",
        expectedOutput: "Total found: 1\n\n1HSb4fZHmyNro5LGyjQFpcDwqKjRUqJhh2\n",
        recipeConfig: [
            {
                "op": "Extract Bitcoin Addresses",
                "args": [true]
            },
        ],
    },
    {
        name: "Extract Mulitple Bitcoin Addresses",
        input: "1HSb4fZHmyNro5LGyjQFpcDwqKjRUqJhh2 and 17U1BaXwyuxeX2sZyMjC25G8skrZ8mtTdz plus this one 1NGCsGqSdNEKpptQ4DKbJEva59cTSk369o",
        expectedOutput: "1HSb4fZHmyNro5LGyjQFpcDwqKjRUqJhh2\n17U1BaXwyuxeX2sZyMjC25G8skrZ8mtTdz\n1NGCsGqSdNEKpptQ4DKbJEva59cTSk369o\n",
        recipeConfig: [
            {
                "op": "Extract Bitcoin Addresses",
                "args": [false]
            },
        ],
    },
]);
