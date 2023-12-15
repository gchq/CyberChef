/**
 * @author tlwr [toby@toby.codes]
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";


/**
 * Wordcloud chart operation
 */
class WordcloudChart extends Operation {

    /**
     * WordcloudChart constructor
     */
    constructor() {
        super();

        this.name = "Wordcloud chart";
        this.module = "Charts";
        this.description = "Word Cloud Chart is a visualization method that allows you to quickly see which words appear more frequently in a bunch of text";
        this.infoURL = "https://en.wikipedia.org/wiki/Tag_cloud";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                name: "Exclude Words",
                type: "string",
                values: "A, The, And"
            }
        ];
    }

    /**
     * Wordcloud chart operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const excludeWords = args[0];
        const uniqueWords = [...new Set(input.split(" "))].filter((word) => !excludeWords.includes(word));

        const count = input.split(" ").reduce((acc, curr) => {
            acc[curr] = -~acc[curr];
            return acc;
        }, {});
        const words = uniqueWords
            .map(function(d) {
                return {text: d, size: count[d]};
            });
        const output = `<canvas id='chart-area'></canvas><br>
            
            <script>
                var canvas = document.getElementById("chart-area"),
                    parentRect = canvas.closest(".cm-scroller").getBoundingClientRect(),
                    inputWords = ${JSON.stringify(words)};
            
                canvas.width = parentRect.width * 0.95;
                canvas.height = parentRect.height * 0.9;
            
                CanvasComponents.drawWordCloudChart(canvas, inputWords);
            </script>`;
        return output;
    }


}

export default WordcloudChart;
