import Uint32Array from 'core-js/modules/es6.typed.uint32-array';

/**
 * UUID operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const UUID = {

    /**
     * Generate UUID operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
  run_generate_v4(input, args) {
    if (typeof (window.crypto) !== 'undefined' && typeof (window.crypto.getRandomValues) !== 'undefined') {
      let buf = new Uint32Array(4),
        i = 0;
      window.crypto.getRandomValues(buf);
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = (buf[i >> 3] >> ((i % 8) * 4)) & 0xf,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        i++;
        return v.toString(16);
      });
    } else {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  },

};

export default UUID;
