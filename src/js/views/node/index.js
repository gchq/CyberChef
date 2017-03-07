var Chef = require("../../core/Chef.js");


/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

var chef = new Chef();

console.log(chef.bake("test", [{"op":"To Hex", "args":["Space"]}], {}, 0, false));

console.log(chef.bake("425a6839314159265359b218ed630000031380400104002a438c00200021a9ea601a10003202185d5ed68ca6442f1e177245385090b218ed63",
    [
        {
            "op" : "From Hex",
            "args" : ["Space"]
        },
        {
            "op" : "Bzip2 Decompress",
            "args" : []
        }
    ],
    {}, 0, false
));

console.log(chef.bake("192.168.0.0/30",
    [{"op":"Parse IP range", "args":[true, true, false]}],
    {}, 0, false
));
