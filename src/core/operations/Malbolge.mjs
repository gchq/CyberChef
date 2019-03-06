/**
 * @author Karsten Silkenbäumer [github.com/kassi]
 * @copyright Karsten Silkenbäumer 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import mb from "malbolge-vm";

/**
 * Malbolge operation
 */
class Malbolge extends Operation {
    /**
     * Malbolge constructor
     */
    constructor () {
        super();

        this.name = "Malbolge";
        this.module = "Default";
        this.description = "Malbolge, invented by Ben Olmstead in 1998, is an esoteric programming language designed to be as difficult to program in as possible. The first ‘Hello, world!’ program written in it was produced by a Lisp program using a local beam search of the space of all possible programs. It is modeled as a virtual machine based on ternary digits.";
        this.infoURL = "http://esolangs.org/wiki/Malbolge";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "User Input (line by line)",
                "type": "text",
                "value": ""
            }
        ];
        this.patterns = [
            {
                match: "^(?:[\\x21-\\x7e])?$",
                flags: "i",
                args: []
            }
        ];
    }

    /**
     * @param {String} input - A Malbolge program
     * @param {Object[]} args
     * @returns {String}
     */
    run (input, args) {
        if (input.length === 0) {
            return "";
        }

        const [userInputString] = args,
            vm = mb.load(input),
            userInputArray = userInputString.split("").map(e => e.charCodeAt(0));

        let userInput = null,
            output = "",
            loop = true,
            temp;

        while (loop) {
            try {
                while ((temp = mb.step(vm, userInput)) !== mb.EXIT) {
                    userInput = null;

                    if (temp !== null) {
                        output += String.fromCharCode(temp);
                    }
                }
                loop = false;
            } catch (err) {
                if (err === mb.WANTS_INPUT) {
                    if (userInputArray.length) {
                        userInput = userInputArray.shift();
                        continue;
                    }
                    output += "Error: Input required";
                    loop = false;
                } else {
                    throw new OperationError(err);
                }
            }
        }

        return output;
    }
}

export default Malbolge;
