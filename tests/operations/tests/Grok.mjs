/**
 * Grok tests
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

const APACHE_INPUT = "10.121.123.104 - - [01/Nov/2012:21:01:04 +0100] \"GET /cluster HTTP/1.1\" 200 1272";
const APACHE_PATTERN = "^%{IPORHOST:clientip} (?:-|%{USER:ident}) (?:-|%{USER:auth}) \\[%{HTTPDATE:timestamp}\\] \\\"(?:%{WORD:verb} %{NOTSPACE:request}(?: HTTP/%{NUMBER:httpversion})?|-)\\\" %{NUMBER:response} (?:-|%{NUMBER:bytes})";

TestRegister.addTests([
    {
        name: "Grok: Apache access log example",
        input: APACHE_INPUT,
        expectedOutput: JSON.stringify({
            clientip: "10.121.123.104",
            timestamp: "01/Nov/2012:21:01:04 +0100",
            verb: "GET",
            request: "/cluster",
            httpversion: 1.1,
            response: 200,
            bytes: 1272,
        }, null, 4),
        recipeConfig: [{ op: "Grok", args: [APACHE_PATTERN, ""] }],
    },
    {
        name: "Grok: explicit capture types",
        input: "42 4.25 true",
        expectedOutput: JSON.stringify({ count: 42, ratio: 4.25, enabled: true }, null, 4),
        recipeConfig: [{ op: "Grok", args: ["^%{INT:count:int} %{NUMBER:ratio:float} %{WORD:enabled:boolean}$", ""] }],
    },
    {
        name: "Grok: custom pattern definitions",
        input: "ticket-42",
        expectedOutput: JSON.stringify({ id: 42 }, null, 4),
        recipeConfig: [{ op: "Grok", args: ["^%{TICKET}$", "TICKET ticket-%{INT:id}"] }],
    },
    {
        name: "Grok: unknown pattern",
        input: "test",
        expectedOutput: "Unknown Grok pattern: DOES_NOT_EXIST",
        recipeConfig: [{ op: "Grok", args: ["%{DOES_NOT_EXIST:value}", ""] }],
    },
    {
        name: "Grok: non-matching input",
        input: "abc",
        expectedOutput: "Input does not match the Grok pattern.",
        recipeConfig: [{ op: "Grok", args: ["^%{INT:value}$", ""] }],
    },
    {
        name: "Grok: circular custom patterns",
        input: "abc",
        expectedOutput: "Circular Grok pattern reference: FIRST -> SECOND -> FIRST",
        recipeConfig: [{ op: "Grok", args: ["%{FIRST:value}", "FIRST %{SECOND}\nSECOND %{FIRST}"] }],
    },
]);
