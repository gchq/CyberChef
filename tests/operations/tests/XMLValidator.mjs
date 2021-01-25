/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "XML Validator, valid XML",
        input: "<bookstore><book category=\"WEB\"><title lang=\"en\">Learning XML</title><author>Erik T. Ray</author><year>2003</year><price>39.95</price></book></bookstore>",
        expectedOutput: "<bookstore><book category=\"WEB\"><title lang=\"en\">Learning XML</title><author>Erik T. Ray</author><year>2003</year><price>39.95</price></book></bookstore>",
        recipeConfig: [
            {
                op: "XML Validator",
                args: [],
            },
        ],
    },
    {
        name: "XML Validator, invalid XML",
        input: "<bookstore><book category=\"WE><title lang=\"en\">Learning XML</title><author>Erik T. Ray</author><year>2003</year><price>39.95</price></book></bookstore>",
        expectedOutput: "Error: [xmldom error]	element parse error: Error: [xmldom warning]	attribute space is required\"category\"!!\n@#[line:undefined,col:undefined]\n@#[line:undefined,col:undefined]",
        recipeConfig: [
            {
                op: "XML Validator",
                args: [],
            },
        ],
    },
]);
