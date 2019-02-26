/**
* @author kassi [kassi@noreply.com]
* @copyright KS 2018
* @license Apache-2.0
*/

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

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
    * @param {String} input
    * @param {Object[]} args
    * @returns {String}
    */
    run (input, args) {
        const [userInput] = args;
        const EOF = 59048;

        const mb = require("malbolge-vm");
        const vm = mb.load(input);
        const userInputLines = userInput.split("\n");
        const inputLoop = true;
        let temp,
            userInputIndex = 0,
            output = "";

        while (inputLoop) {
            try {
                while ((temp = mb.step(vm)) !== mb.EXIT) {
                    if (temp !== null) {
                        output += String.fromCharCode(temp);
                    }
                }
                break;
            } catch (e) {
                if (e === mb.WANTS_INPUT) {
                    let txt;
                    if (userInputIndex < userInputLines.length) {
                        txt = userInputLines[userInputIndex];
                        userInputIndex++;
                    } else {
                        txt = window.prompt("User input expected", "");
                    }
                    for (let i = 0; i < txt.length; i++) {
                        mb.step(vm, txt.charCodeAt(i));
                    }
                    mb.step(vm, EOF);
                } else {
                    throw new OperationError(`Error: ${e}`);
                }
            }
            break;
        }

        return output;
    }
}

export default Malbolge;
