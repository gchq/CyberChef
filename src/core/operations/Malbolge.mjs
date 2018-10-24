/**
 * @author kassi [kassi@noreply.com]
 * @copyright KS 2018
 * @license Apache-2.0
 */

import Operation from '../Operation';

/**
 * Malbolge operation
 */
class Malbolge extends Operation {
    /**
     * Malbolge constructor
     */

  constructor () {
    super();

    this.name = 'Malbolge';
    this.module = 'Default';
    this.description = 'Malbolge, invented by Ben Olmstead in 1998, is an esoteric programming language designed to be as difficult to program in as possible. The first ‘Hello, world!’ program written in it was produced by a Lisp program using a local beam search of the space of all possible programs. It is modeled as a virtual machine based on ternary digits.';
    this.infoURL = 'http://esolangs.org/wiki/Malbolge';
    this.inputType = 'string';
    this.outputType = 'string';
    this.args = [
      {
        'name': 'User Input (line by line)',
        'type': 'text',
        'value': ''
      }
    ];
    this.patterns = [
      {
        match: '^(?:[\\x21-\\x7e])?$',
        flags: 'i',
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

    var mb = require('malbolge-vm'),
      vm = mb.load(input),
      temp,
      userInputLines = userInput.split('\n'),
      userInputIndex = 0,
      output = '';

    while (true) {
      try {
        while ((temp = mb.step(vm)) !== mb.EXIT) {
          if (temp !== null) { output += String.fromCharCode(temp); }
        }
        break;
      } catch (e) {
        if (e === mb.WANTS_INPUT) {
          var txt;
          if (userInputIndex < userInputLines.length) {
            txt = userInputLines[userInputIndex];
            userInputIndex++;
          } else {
            txt = window.prompt('User input expected', '');
          }
          for (var i = 0; i < txt.length; i++) {
            mb.step(vm, txt.charCodeAt(i));
          }
          mb.step(vm, EOF);
        } else {
          console.log('Error: ' + e);
        }
      }
      break;
    }

    return output;
  }
}

export default Malbolge;
