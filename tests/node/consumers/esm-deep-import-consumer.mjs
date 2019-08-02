/**
 * Tests to ensure that a consuming app can use named imports from deep import patch
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import assert from "assert";
import { bake, toHex, reverse, unique, multiply } from "cyberchef/src/node/index.mjs";

const d = bake("Testing, 1 2 3", [
    toHex,
    reverse,
    {
        op: unique,
        args: {
            delimiter: "Space",
        }
    },
    {
        op: multiply,
        args: {
            delimiter: "Space",
        }
    }
]);

assert.equal(d.value, "630957449041920");
