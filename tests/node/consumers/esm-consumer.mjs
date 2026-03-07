/**
 * Tests to ensure that a consuming app can use ESM imports
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import assert from "assert";
import chef from "cyberchef";
import { bake, toHex, reverse, unique, multiply } from "cyberchef";

const a = bake("Testing, 1 2 3", [
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

assert.equal(a.value, "630957449041920");

const b = chef.bake("Testing, 1 2 3", [
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

assert.equal(b.value, "630957449041920");
