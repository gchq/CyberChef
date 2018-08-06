/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";

/**
 * Entropy operation
 */
class Entropy extends Operation {

    /**
     * Entropy constructor
     */
    constructor() {
        super();

        this.name = "Entropy";
        this.module = "Default";
        this.description = "Shannon Entropy, in the context of information theory, is a measure of the rate at which information is produced by a source of data. It can be used, in a broad sense, to detect whether data is likely to be structured or unstructured. 8 is the maximum, representing highly unstructured, 'random' data. English language text usually falls somewhere between 3.5 and 5. Properly encrypted or compressed data should have an entropy of over 7.5.";
        this.inputType = "byteArray";
        this.outputType = "number";
        this.presentType = "html";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {
        const prob = [],
            uniques = input.unique(),
            str = Utils.byteArrayToChars(input);
        let i;

        for (i = 0; i < uniques.length; i++) {
            prob.push(str.count(Utils.chr(uniques[i])) / input.length);
        }

        let entropy = 0,
            p;

        for (i = 0; i < prob.length; i++) {
            p = prob[i];
            entropy += p * Math.log(p) / Math.log(2);
        }

        return -entropy;
    }

    /**
     * Displays the entropy as a scale bar for web apps.
     *
     * @param {number} entropy
     * @returns {html}
     */
    present(entropy) {
        return `Shannon entropy: ${entropy}
<br><canvas id='chart-area'></canvas><br>
- 0 represents no randomness (i.e. all the bytes in the data have the same value) whereas 8, the maximum, represents a completely random string.
- Standard English text usually falls somewhere between 3.5 and 5.
- Properly encrypted or compressed data of a reasonable length should have an entropy of over 7.5.

The following results show the entropy of chunks of the input data. Chunks with particularly high entropy could suggest encrypted or compressed sections.

<br><script>
    var canvas = document.getElementById("chart-area"),
        parentRect = canvas.parentNode.getBoundingClientRect(),
        entropy = ${entropy},
        height = parentRect.height * 0.25;

    canvas.width = parentRect.width * 0.95;
    canvas.height = height > 150 ? 150 : height;

    CanvasComponents.drawScaleBar(canvas, entropy, 8, [
        {
            label: "English text",
            min: 3.5,
            max: 5
        },{
            label: "Encrypted/compressed",
            min: 7.5,
            max: 8
        }
    ]);
</script>`;
    }

}

export default Entropy;
