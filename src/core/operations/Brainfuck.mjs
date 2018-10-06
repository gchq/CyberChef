/**
 * @author kassi [kassi@noreply.com]
 * @copyright KS 2018
 * @license Apache-2.0
 */

import Operation from '../Operation';

/**
 * Brainfuck operation
 */
class Brainfuck extends Operation {
    /**
     * Brainfuck constructor
     */

  constructor () {
    super();

    this.name = 'Brainfuck';
    this.module = 'Default';
    this.description = 'Brainfuck is the most famous esoteric programming language, and has inspired the creation of a host of other languages. Due to the fact that the last half of its name is often considered one of the most offensive words in the English language, it is sometimes referred to as brainf***, brainf*ck, brainfsck, b****fuck, brainf**k, branflakes, or BF. This can make it a bit difficult to search for information regarding brainfuck on the web, as the proper name might not be used at all in some articles.';
    this.infoURL = 'http://esolangs.org/wiki/Brainfuck';
    this.inputType = 'string';
    this.outputType = 'string';
    this.args = [
      {
        'name': 'User Input',
        'type': 'text',
        'value': ''
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
    var brainfuck = require('brainfuck-javascript');
    let output = brainfuck.text(input, userInput);
    return output;
  }
}

export default Brainfuck;
