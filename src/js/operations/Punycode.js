

/**
 * Punycode operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Punycode = {

    /**
     * @constant
     * @default
     */
  IDN: false,

    /**
     * To Punycode operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
  run_to_ascii(input, args) {
    const idn = args[0];

    if (idn) {
      return punycode.ToASCII(input);
    } else {
      return punycode.encode(input);
    }
  },


    /**
     * From Punycode operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
  run_to_unicode(input, args) {
    const idn = args[0];

    if (idn) {
      return punycode.ToUnicode(input);
    } else {
      return punycode.decode(input);
    }
  },

};

export default Punycode;
