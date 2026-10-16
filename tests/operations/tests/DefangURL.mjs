/**
 * DefangURL tests.
 *
 * @author Robert Sirois
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const DEFAULTS = [true, true, true, "Valid domains and full URLs"];

TestRegister.addTests([
    {
        name: "Defang URL: basic URL",
        input: "https://example.com/index.html",
        expectedOutput: "hxxps[://]example[.]com/index[.]html",
        recipeConfig: [
            {
                op: "Defang URL",
                args: DEFAULTS,
            },
        ],
    }, {
        name: "Defang URL: http in hostname",
        input: "https://httpsite.example.com/get",
        expectedOutput: "hxxps[://]httpsite[.]example[.]com/get",
        recipeConfig: [
            {
                op: "Defang URL",
                args: DEFAULTS,
            },
        ],
    }, {
        name: "Defang URL: http in path",
        input: "https://example.com/http/get",
        expectedOutput: "hxxps[://]example[.]com/http/get",
        recipeConfig: [
            {
                op: "Defang URL",
                args: DEFAULTS,
            },
        ],
    }, {
        name: "Defang URL: domain only",
        input: "httpsite.example.com",
        expectedOutput: "httpsite[.]example[.]com",
        recipeConfig: [
            {
                op: "Defang URL",
                args: DEFAULTS,
            },
        ],
    }, {
        name: "Defang URL: URL in query string",
        input: "https://example.com/r?u=http://httpsite.example.org/x",
        expectedOutput: "hxxps[://]example[.]com/r?u=hxxp[://]httpsite[.]example[.]org/x",
        recipeConfig: [
            {
                op: "Defang URL",
                args: DEFAULTS,
            },
        ],
    }, {
        name: "Defang URL: only full URLs",
        input: "https://example.com/ and httpsite.example.org",
        expectedOutput: "hxxps[://]example[.]com/ and httpsite.example.org",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Only full URLs"],
            },
        ],
    }, {
        name: "Defang URL: http escaping off",
        input: "https://example.com/",
        expectedOutput: "https[://]example[.]com/",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, false, true, "Valid domains and full URLs"],
            },
        ],
    }, {
        name: "Defang URL: git+https scheme",
        input: "git+https://example.com/repo.git",
        expectedOutput: "git+hxxps[://]example[.]com/repo[.]git",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Everything"],
            },
        ],
    }, {
        name: "Defang URL: custom app scheme",
        input: "myhttp://example.com/open",
        expectedOutput: "myhttp[://]example[.]com/open",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Everything"],
            },
        ],
    },
]);
