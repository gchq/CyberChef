/**
 * Extract URI Tests
 *
 * @author David Tomaschik [dwt@google.com]
 * @copyright Google LLC 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extract URI: Test",
        input: "http://www.example.org:9999/path?foo=bar&baz=1&baz=2#frob",
        expectedOutput: JSON.stringify({
            "hash": "#frob",
            "hostname": "www.example.org",
            "pathname": "/path",
            "port": "9999",
            "protocol": "http:",
            "query": {
                "foo": "bar",
                "baz": [
                    "1",
                    "2"
                ]
            }
        }, null, 4),
        recipeConfig: [
            {
                "op": "Extract URI",
                "args": [],
            }
        ]
    }
]);
