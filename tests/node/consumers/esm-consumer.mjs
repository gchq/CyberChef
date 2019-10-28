/**
 * Tests to ensure that a consuming app can use ESM imports
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import assert from "assert";
import chef from "cyberchef";

const d = chef.bake("Testing, 1 2 3", [
    chef.toHex,
    chef.reverse,
    {
        op: chef.unique,
        args: {
            delimiter: "Space",
        }
    },
    {
        op: chef.multiply,
        args: {
            delimiter: "Space",
        }
    }
]);

assert.equal(d.value, "630957449041920");
