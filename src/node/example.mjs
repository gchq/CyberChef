/**
 * Before using this file, run `npm run build-node`
 *
 * Run with `node --experimental-modules src/node/example.mjs` from proj root
 */


import chef from "./index";
import {
    setUnion,
    toBase32,
    fromBase32
} from "./index";
import OperationError from "../core/errors/OperationError";

// All ops under the chef object.
let result = chef.toBase32("input");

/**
 * Display
 */

// override .inspect so it prints the Dish value
console.log(result); // => NFXHA5LU

// toString override
console.log(String(result)); // => NFXHA5LU

// toValue override
console.log(""+result); // => "NaN"
console.log(3 + chef.fromBase32(chef.toBase32("32"))); // => 35

/**
 * Conversion
 */

// synchronous type conversion
console.log(result.get("bytearray")); // => [ 78, 97, 78 ]

console.log(result.get("number")); // => NaN

/**
 * Accepts normal input (with args in object) and dish (for chaining)
 */

// default args
console.log(toBase32("something")); // => ONXW2ZLUNBUW4ZY=

// override arg (doesnt have to be them all) - arg names are lenient,
// e.g. would accept 'alphabet', 'Alphabet' & ignores whitespace
console.log(toBase32("something", { alphabet: "A-S" })); // => ONLNB

// Pass result of one op to another
console.log(fromBase32(toBase32("66"))); // => "66"

/**
 * Errors
 */

// let all errors (even OperationErrors) bubble up
try {
    setUnion("1");
} catch (e) {
    console.log(e instanceof OperationError); // => true
}
