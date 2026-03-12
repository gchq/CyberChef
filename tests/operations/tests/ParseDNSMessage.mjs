/**
 * Parse DNS Message tests.
 *
 * @author Minghang Chen [chen@minghang.dev]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parse DNS Message: No Data",
        input: "",
        expectedOutput: "Malformed DNS message: ParseError: insufficient bytes remaining for read: needs 12, have 0",
        recipeConfig: [
            {
                op: "Parse DNS Message",
                args: ["dig-like"],
            },
        ],
    },
    {
        name: "Parse DNS Message: Malformed",
        input: "\xab\xcd\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x03\x77\x77\x77\x07\x65\x78\x61\x6d\x70\x6c\x65\x03\x63\x6f",
        expectedOutput: "Malformed DNS message: RangeError: try to access beyond buffer length: read 3 start from 25",
        recipeConfig: [
            {
                op: "Parse DNS Message",
                args: ["dig-like"],
            }
        ],
    },
    {
        name: "Parse DNS Message: dig-like",
        input: "\xab\xcd\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x03\x77\x77\x77\x07\x65\x78\x61\x6d\x70\x6c\x65\x03\x63\x6f\x6d\x00\x00\x01\x00\x01",
        expectedOutput: `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 43981
;; flags: rd; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 0

;; QUESTION SECTION:
;www.example.com.		IN	A`,
        recipeConfig: [
            {
                op: "Parse DNS Message",
                args: ["dig-like"],
            }
        ],
    },
    {
        name: "Parse DNS Message: dns-json",
        input: "\xab\xcd\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x03\x77\x77\x77\x07\x65\x78\x61\x6d\x70\x6c\x65\x03\x63\x6f\x6d\x00\x00\x01\x00\x01",
        expectedOutput: `{
  "Status": 0,
  "TC": false,
  "RD": true,
  "RA": false,
  "AD": false,
  "CD": false,
  "Question": [
    {
      "name": "www.example.com.",
      "type": 1
    }
  ],
  "Answer": []
}`,
        recipeConfig: [
            {
                op: "Parse DNS Message",
                args: ["dns-json"],
            }
        ],
    },
    {
        name: "Parse DNS Message: unsupported-output-format",
        input: "\xab\xcd\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x03\x77\x77\x77\x07\x65\x78\x61\x6d\x70\x6c\x65\x03\x63\x6f\x6d\x00\x00\x01\x00\x01",
        expectedOutput: "Unsupported output format: invalid",
        recipeConfig: [
            {
                op: "Parse DNS Message",
                args: ["invalid"],
            }
        ],
    }
]);
