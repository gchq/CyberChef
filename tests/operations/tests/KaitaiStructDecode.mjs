/**
 * @author kendallgoto [k@kgo.to]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";
TestRegister.addTests([
    {
        "name": "Kaitai Struct Decode: Gif Decode",
        "input": "R0lGODdhIAA0APABAP",
        "expectedOutput": "[71,73,70]",
        "recipeConfig": [
            {
                "op": "From Base64",
                "args": ["A-Za-z0-9+/=", true]
            },
            {
                "op": "Kaitai Struct Decode",
                "args": [
                    // https://kaitai.io/#quick-start
                    "meta:\n  id: gif\n  file-extension: gif\n  endian: le\nseq:\n  - id: header\n    type: header\n  - id: logical_screen\n    type: logical_screen\ntypes:\n  header:\n    seq:\n      - id: magic\n        contents: 'GIF'\n      - id: version\n        size: 3\n  logical_screen:\n    seq:\n      - id: image_width\n        type: u2\n      - id: image_height\n        type: u2\n      - id: flags\n        type: u1\n      - id: bg_color_index\n        type: u1\n      - id: pixel_aspect_ratio\n        type: u1",
                ],
            },
            {
                "op": "Jq",
                "args": [
                    ".header.magic",
                ],
            },
        ],
    },
    {
        "name": "Kaitai Struct Decode: Incomplete Error",
        "input": "",
        "expectedOutput": "EOFError: requested 1 bytes, but only 0 bytes available",
        "recipeConfig": [
            {
                "op": "Kaitai Struct Decode",
                "args": [
                    "seq:\n- id: entry\n  type: u1\n  repeat: expr\n  repeat-expr: 10", // read 10 uint8s, one by one
                ],
            }
        ],
    },
    {
        "name": "Kaitai Struct Decode: Incomplete Error (ignored)",
        "input": "\x00\x01\x02\x03\x04",
        "expectedOutput": "[0,1,2,3,4]",
        "recipeConfig": [
            {
                "op": "Kaitai Struct Decode",
                "args": [
                    "seq:\n- id: entry\n  type: u1\n  repeat: expr\n  repeat-expr: 10", // read 10 uint8s, one by one
                    true
                ],
            },
            {
                "op": "Jq",
                "args": [
                    ".entry",
                ],
            },
        ],
    }
]);
