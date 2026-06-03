/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "From MS-DOS Date and Time",
        "input": "21854 25692",
        "expectedOutput": "2022-10-30 12:34:56",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: minimum date",
        "input": "33 0",
        "expectedOutput": "1980-01-01 00:00:00",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: maximum date",
        "input": "65439 49021",
        "expectedOutput": "2107-12-31 23:59:58",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: month too small",
        "input": "21534 25692",
        "expectedOutput": "invalid datetime",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: month too large",
        "input": "21950 25692",
        "expectedOutput": "invalid datetime",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: date too small",
        "input": "21824 25692",
        "expectedOutput": "invalid datetime",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: date too large",
        "input": "21823 25692",
        "expectedOutput": "invalid datetime",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: hour too large",
        "input": "21854 50268",
        "expectedOutput": "invalid datetime",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: minute too large",
        "input": "21854 26524",
        "expectedOutput": "invalid datetime",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: second too large",
        "input": "21854 25694",
        "expectedOutput": "invalid datetime",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: hexadecimal input",
        "input": "2a47 75b1",
        "expectedOutput": "2001-02-07 14:45:34",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Hex", true],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: disable validation",
        "input": "21954 55711",
        "expectedOutput": "2022-14-02 27:12:62",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", false],
            },
        ],
    },
    {
        "name": "From MS-DOS Date and Time: ignore extra elements",
        "input": "18137 10735 21566",
        "expectedOutput": "2015-06-25 05:15:30",
        "recipeConfig": [
            {
                "op": "From MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "To MS-DOS Date and Time",
        "input": "2022-10-30 13:24:56",
        "expectedOutput": "21854 27420 (2022-10-30 13:24:56)",
        "recipeConfig": [
            {
                "op": "To MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "To MS-DOS Date and Time: minimum year",
        "input": "1980-01-01 00:00:00",
        "expectedOutput": "33 0 (1980-01-01 00:00:00)",
        "recipeConfig": [
            {
                "op": "To MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "To MS-DOS Date and Time: maximum year",
        "input": "2107-12-31 23:59:59",
        "expectedOutput": "65439 49021 (2107-12-31 23:59:59)",
        "recipeConfig": [
            {
                "op": "To MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "To MS-DOS Date and Time: minimum year - 1",
        "input": "1979-12-31 23:59:59",
        "expectedOutput": "out-of-range",
        "recipeConfig": [
            {
                "op": "To MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "To MS-DOS Date and Time: maximum year + 1",
        "input": "2108-01-01 00:00:00",
        "expectedOutput": "out-of-range",
        "recipeConfig": [
            {
                "op": "To MS-DOS Date and Time",
                "args": ["Decimal", true],
            },
        ],
    },
    {
        "name": "To MS-DOS Date and Time: hexadecimal output",
        "input": "2004-09-13 15:02:28",
        "expectedOutput": "312d 784e (2004-09-13 15:02:28)",
        "recipeConfig": [
            {
                "op": "To MS-DOS Date and Time",
                "args": ["Hex", true],
            },
        ],
    },
    {
        "name": "To MS-DOS Date and Time: hexadecimal output, small values",
        "input": "1985-05-23 00:04:48",
        "expectedOutput": "0ab7 0098 (1985-05-23 00:04:48)",
        "recipeConfig": [
            {
                "op": "To MS-DOS Date and Time",
                "args": ["Hex", true],
            },
        ],
    },
    {
        "name": "To MS-DOS Date and Time: no parsed datetime",
        "input": "1998-11-06 21:37:52",
        "expectedOutput": "9574 44218",
        "recipeConfig": [
            {
                "op": "To MS-DOS Date and Time",
                "args": ["Decimal", false],
            },
        ],
    },
]);
