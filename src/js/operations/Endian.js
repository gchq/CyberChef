/**
 * Endian operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Endian = {
    
    /**
     * @constant
     * @default
     */
    DATA_FORMAT: ["Hex", "Raw"],
    /**
     * @constant
     * @default
     */
    WORD_LENGTH: 4,
    /**
     * @constant
     * @default
     */
    PAD_INCOMPLETE_WORDS: true,
    
    /**
     * Swap endianness operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_swap_endianness: function(input, args) {
        var data_format = args[0],
            word_length = args[1],
            pad_incomplete_words = args[2],
            data = [],
            result = [],
            words = [],
            i = 0,
            j = 0;
            
        if (word_length <= 0) {
            return "Word length must be greater than 0";
        }
            
        // Convert input to raw data based on specified data format
        switch (data_format) {
            case "Hex":
                data = Utils.from_hex(input);
                break;
            case "Raw":
                data = Utils.str_to_byte_array(input);
                break;
            default:
                data = input;
        }
        
        // Split up into words
        for (i = 0; i < data.length; i += word_length) {
            var word = data.slice(i, i + word_length);
            
            // Pad word if too short
            if (pad_incomplete_words && word.length < word_length){
                for (j = word.length; j < word_length; j++) {
                    word.push(0);
                }
            }
            
            words.push(word);
        }
        
        // Swap endianness and flatten
        for (i = 0; i < words.length; i++) {
            j = words[i].length;
            while (j--) {
                result.push(words[i][j]);
            }
        }
        
        // Convert data back to specified data format
        switch (data_format) {
            case "Hex":
                return Utils.to_hex(result);
            case "Raw":
                return Utils.byte_array_to_utf8(result);
            default:
                return result;
        }
    },
    
};
