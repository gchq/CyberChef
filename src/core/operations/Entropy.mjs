/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import * as d3temp from "d3";
import * as nodomtemp from "nodom";

import Operation from "../Operation";
import Utils from "../Utils";

const d3 = d3temp.default ? d3temp.default : d3temp;
const nodom = nodomtemp.default ? nodomtemp.default: nodomtemp;

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
        this.infoURL = "https://wikipedia.org/wiki/Entropy_(information_theory)";
        this.inputType = "byteArray";
        this.outputType = "html";
        this.args = [
            {
                "name": "Visualisation",
                "type": "option",
                "value": ["Shannon", "Histogram (Bar)", "Histogram (Line)", "Curve", "Image"]
            }
        ];
    }

    /**
     * Calculates the frequency of bytes in the input.
     *
     * @param {byteArray} input
     * @returns {frequency}
     */
    calculateShannonEntropy(input) {
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
     *
     * @param inputBytes
     * @returns {entropyData}
     */
    calculateScanningEntropy(inputBytes, binWidth) {
        const entropyData = [];

        if (inputBytes.length < 256) binWidth = 8;
        else binWidth = 256;

        for (let bytePos = 0; bytePos < inputBytes.length; bytePos+=binWidth) {
            const block = inputBytes.slice(bytePos, bytePos+binWidth);
            entropyData.push(this.calculateShannonEntropy(block));
        }

        return { entropyData, binWidth };
    }

    /**
     * Calculates the frequency of bytes in the input.
     *
     * @param {object} svg
     * @param {function} xScale
     * @param {function} yScale
     * @param {integer} svgHeight
     * @param {integer} svgWidth
     * @param {object} margins
     * @param {string} xTitle
     * @param {string} yTitle
     * @returns {undefined}
     */
    createAxes(svg, xScale, yScale, svgHeight, svgWidth, margins, title, xTitle, yTitle) {
        // Axes
        const yAxis = d3.axisLeft()
            .scale(yScale);

        const xAxis = d3.axisBottom()
            .scale(xScale);

        svg.append("g")
            .attr("transform", `translate(0, ${svgHeight - margins.bottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${margins.left},0)`)
            .call(yAxis);

        // Axes labels
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margins.left)
            .attr("x", 0 - (svgHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yTitle);

        svg.append("text")
            .attr("transform", `translate(${svgWidth / 2}, ${svgHeight - margins.bottom + 40})`)
            .style("text-anchor", "middle")
            .text(xTitle);

        // Add title
        svg.append("text")
            .attr("transform", `translate(${svgWidth / 2}, ${margins.top - 10})`)
            .style("text-anchor", "middle")
            .text(title);
    }

    /**
     * Calculates the frequency of bytes in the input.
     *
     * @param {byteArray} inputBytes
     * @returns {frequency}
     */
    calculateByteFrequency(inputBytes) {
        const byteFrequency = [];
        for (let i = 0; i < 256; i++) {
            if (inputBytes.length > 0) {
                let count = 0;
                for (const byte of inputBytes) {
                    if (byte === i) count++;
                }
                byteFrequency.push(count / inputBytes.length);
            } else {
                byteFrequency.push(0);
            }
        }

        return byteFrequency;
    }

    /**
     * Calculates the frequency of bytes in the input.
     *
     * @param {byteArray} byteFrequency
     * @returns {frequency}
     */
    createByteFrequencyLineHistogram(byteFrequency) {
        const margins = { top: 30, right: 20, bottom: 50, left: 30 };

        const svgWidth = 500,
            svgHeight = 500;

        const document = new nodom.Document();
        let svg = document.createElement("svg");

        svg = d3.select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(byteFrequency, d => d)])
            .range([svgHeight - margins.bottom, margins.top]);

        const xScale = d3.scaleLinear()
            .domain([0, byteFrequency.length - 1])
            .range([margins.left, svgWidth - margins.right]);

        const line = d3.line()
            .x((_, i) => xScale(i))
            .y(d => yScale(d))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(byteFrequency)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("d", line);

        this.createAxes(svg, xScale, yScale, svgHeight, svgWidth, margins, "", "Byte", "Byte Frequency");

        return svg._groups[0][0].outerHTML;
    }

    /**
     * Creates a byte frequency histogram
     *
     * @param {byteArray} byteFrequency
     * @returns {HTML}
     */
    createByteFrequencyBarHistogram(byteFrequency) {
        const margins = { top: 30, right: 20, bottom: 50, left: 30 };

        const svgWidth = 500,
            svgHeight = 500,
            binWidth = 1;

        const document = new nodom.Document();
        let svg = document.createElement("svg");
        svg = d3.select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

        const yExtent = d3.extent(byteFrequency, d => d);
        const yScale = d3.scaleLinear()
            .domain(yExtent)
            .range([svgHeight - margins.bottom, margins.top]);

        const xScale = d3.scaleLinear()
            .domain([0, byteFrequency.length - 1])
            .range([margins.left - binWidth, svgWidth - margins.right]);

        svg.selectAll("rect")
            .data(byteFrequency)
            .enter().append("rect")
            .attr("x", (_, i) => xScale(i) + binWidth)
            .attr("y", dataPoint => yScale(dataPoint))
            .attr("width", binWidth)
            .attr("height", dataPoint => yScale(yExtent[0]) - yScale(dataPoint))
            .attr("fill", "blue");

        this.createAxes(svg, xScale, yScale, svgHeight, svgWidth, margins, "", "Byte", "Byte Frequency");

        return svg._groups[0][0].outerHTML;
    }

    /**
     * Creates a byte frequency histogram
     *
     * @param {byteArray} input
     * @param {number} blockSize
     * @returns {HTML}
     */
    createEntropyCurve(entropyData) {
        const margins = { top: 30, right: 20, bottom: 50, left: 30 };

        const svgWidth = 500,
            svgHeight = 500;

        const document = new nodom.Document();
        let svg = document.createElement("svg");
        svg = d3.select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(entropyData, d => d)])
            .range([svgHeight - margins.bottom, margins.top]);

        const xScale = d3.scaleLinear()
            .domain([0, entropyData.length])
            .range([margins.left, svgWidth - margins.right]);

        const line = d3.line()
            .x((_, i) => xScale(i))
            .y(d => yScale(d))
            .curve(d3.curveMonotoneX);

        if (entropyData.length > 0) {
            svg.append("path")
                .datum(entropyData)
                .attr("d", line);

            svg.selectAll("path").attr("fill", "none").attr("stroke", "steelblue");
        }

        this.createAxes(svg, xScale, yScale, svgHeight, svgWidth, margins, "Scanning Entropy", "Block", "Entropy");

        return svg._groups[0][0].outerHTML;
    }

    /**
     * Creates an image representation of the entropy
     *
     * @param {byteArray} input
     * @param {number} blockSize
     * @returns {HTML}
     */
    createEntropyImage(entropyData) {
        const svgHeight = 100,
            svgWidth = 100,
            cellSize = 1,
            nodes = [];

        for (let i = 0; i < entropyData.length; i++) {
            nodes.push({
                x: i % svgWidth,
                y: Math.floor(i / svgWidth),
                entropy: entropyData[i]
            });
        }

        const document = new nodom.Document();
        let svg = document.createElement("svg");
        svg = d3.select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

        const greyScale = d3.scaleLinear()
            .domain([0, d3.max(entropyData, d => d)])
            .range(["#000000", "#FFFFFF"])
            .interpolate(d3.interpolateRgb);

        svg
            .selectAll("rect")
            .data(nodes)
            .enter().append("rect")
            .attr("x", d => d.x * cellSize)
            .attr("y", d => d.y * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .style("fill", d => greyScale(d.entropy));

        return svg._groups[0][0].outerHTML;
    }

    /**
     * Displays the entropy as a scale bar for web apps.
     *
     * @param {number} entropy
     * @returns {html}
     */
    createShannonEntropyVisualization(entropy) {
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

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const visualizationType = args[0];

        if (visualizationType === 'Shannon') {
            return this.createShannonEntropyVisualization(this.calculateShannonEntropy(input));
        } else if (visualizationType === "Histogram (Bar)") {
            return this.createByteFrequencyBarHistogram(this.calculateByteFrequency(input));
        } else if (visualizationType === "Histogram (Line)") {
            return this.createByteFrequencyLineHistogram(this.calculateByteFrequency(input));
        } else if (visualizationType === "Curve") {
            return this.createEntropyCurve(this.calculateScanningEntropy(input).entropyData);
        } else if (visualizationType === "Image") {
            return this.createEntropyImage(this.calculateScanningEntropy(input).entropyData);
        }
    }
}

export default Entropy;
