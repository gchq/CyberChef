/**
 * Entropy operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Entropy = {

    /**
     * @constant
     * @default
     */
    CHUNK_SIZE: 1000,

    /**
     * Entropy operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    runEntropy: function(input, args) {
        var chunkSize = args[0],
            output = "",
            entropy = Entropy._calcEntropy(input);

        output += "Shannon entropy: " + entropy + "\n" +
            "<br><canvas id='chart-area'></canvas><br>\n" +
            "- 0 represents no randomness (i.e. all the bytes in the data have the same value) whereas 8, the maximum, represents a completely random string.\n" +
            "- Standard English text usually falls somewhere between 3.5 and 5.\n" +
            "- Properly encrypted or compressed data of a reasonable length should have an entropy of over 7.5.\n\n" +
            "The following results show the entropy of chunks of the input data. Chunks with particularly high entropy could suggest encrypted or compressed sections.\n\n" +
            "<br><script>\
                var canvas = document.getElementById('chart-area'),\
                    parentRect = canvas.parentNode.getBoundingClientRect(),\
                    entropy = " + entropy + ",\
                    height = parentRect.height * 0.25;\
                \
                canvas.width = parentRect.width * 0.95;\
                canvas.height = height > 150 ? 150 : height;\
                \
                CanvasComponents.drawScaleBar(canvas, entropy, 8, [\
                    {\
                        label: 'English text',\
                        min: 3.5,\
                        max: 5\
                    },{\
                        label: 'Encrypted/compressed',\
                        min: 7.5,\
                        max: 8\
                    }\
                ]);\
            </script>";

        var chunkEntropy = 0;
        if (chunkSize !== 0) {
            for (var i = 0; i < input.length; i += chunkSize) {
                chunkEntropy = Entropy._calcEntropy(input.slice(i, i+chunkSize));
                output += "Bytes " + i + " to " + (i+chunkSize) + ": " + chunkEntropy + "\n";
            }
        } else {
            output += "Chunk size cannot be 0.";
        }

        return output;
    },


    /**
     * @constant
     * @default
     */
    FREQ_ZEROS: false,

    /**
     * Frequency distribution operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    runFreqDistrib: function (input, args) {
        if (!input.length) return "No data";

        var distrib = new Array(256),
            percentages = new Array(256),
            len = input.length,
            showZeroes = args[0];

        // Initialise distrib to 0
        for (var i = 0; i < 256; i++) {
            distrib[i] = 0;
        }

        // Count bytes
        for (i = 0; i < len; i++) {
            distrib[input[i]]++;
        }

        // Calculate percentages
        var repr = 0;
        for (i = 0; i < 256; i++) {
            if (distrib[i] > 0) repr++;
            percentages[i] = distrib[i] / len * 100;
        }

        // Print
        var output = "<canvas id='chart-area'></canvas><br>" +
            "Total data length: " + len +
            "\nNumber of bytes represented: " + repr +
            "\nNumber of bytes not represented: " + (256-repr) +
            "\n\nByte   Percentage\n" +
            "<script>\
                var canvas = document.getElementById('chart-area'),\
                    parentRect = canvas.parentNode.getBoundingClientRect(),\
                    scores = " + JSON.stringify(percentages) + ";\
                \
                canvas.width = parentRect.width * 0.95;\
                canvas.height = parentRect.height * 0.9;\
                \
                CanvasComponents.drawBarChart(canvas, scores, 'Byte', 'Frequency %', 16, 6);\
            </script>";

        for (i = 0; i < 256; i++) {
            if (distrib[i] || showZeroes) {
                output += " " + Utils.hex(i, 2) + "    (" +
                        Utils.padRight(percentages[i].toFixed(2).replace(".00", "") + "%)", 8) +
                        Array(Math.ceil(percentages[i])+1).join("|") + "\n";
            }
        }

        return output;
    },


    /**
     * Calculates the Shannon entropy for a given chunk of data.
     *
     * @private
     * @param {byteArray} data
     * @returns {number}
     */
    _calcEntropy: function(data) {
        var prob = [],
            uniques = data.unique(),
            str = Utils.byteArrayToChars(data);

        for (var i = 0; i < uniques.length; i++) {
            prob.push(str.count(Utils.chr(uniques[i])) / data.length);
        }

        var entropy = 0,
            p;

        for (i = 0; i < prob.length; i++) {
            p = prob[i];
            entropy += p * Math.log(p) / Math.log(2);
        }

        return -entropy;
    },

};
