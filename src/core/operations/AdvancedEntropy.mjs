/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import * as d3temp from "d3";
import * as nodomtemp from "nodom";

import Operation from "../Operation";
import Utils from "../Utils";

const d3 = d3temp.default ? d3temp.default : d3temp;
const nodom = nodomtemp.default ? nodomtemp.default: nodomtemp;

/**
 * Advanced Entropy operation
 */
class AdvancedEntropy extends Operation {

    /**
     * AdvancedEntropy constructor
     */
    constructor() {
        super();

        this.name = "Advanced Entropy";
        this.module = "Default";
        this.description = "Shannon Entropy, in the context of information theory, is a measure of the rate at which information is produced by a source of data. It can be used, in a broad sense, to detect whether data is likely to be structured or unstructured. 8 is the maximum, representing highly unstructured, 'random' data. English language text usually falls somewhere between 3.5 and 5. Properly encrypted or compressed data should have an entropy of over 7.5.";
        this.infoURL = "https://wikipedia.org/wiki/Entropy_(information_theory)";
        this.inputType = "byteArray";
        this.outputType = "html";
        this.args = [
            {
                "name": "Visualization",
                "type": "option",
                "value": ["Histogram (Bar)", "Histogram (Line)", "Curve", "Image"]
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
        binWidth = binWidth ?
            Math.floor(inputBytes.length / binWidth) :
            Math.floor(inputBytes.length / 256);

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
            let count = 0;
            for (const byte of inputBytes) {
                if (byte === i) {
                    count++;
                }
            }

            byteFrequency.push(count / (inputBytes.length + 1));
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
            .domain(d3.extent(byteFrequency, d => d))
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
            .attr("d", line)
            .attr("fill", "steelblue");

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

        const yScale = d3.scaleLinear()
            .domain(d3.extent(byteFrequency, d => d))
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
            .attr("height", dataPoint => yScale(0) - yScale(dataPoint))
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
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const visualizationType = args[0];

        if (visualizationType === "Histogram (Bar)") {
            return this.createByteFrequencyBarHistogram(this.calculateByteFrequency(input));
        } else if (visualizationType === "Histogram (Line)") {
            return this.createByteFrequencyLineHistogram(this.calculateByteFrequency(input));
        } else if (visualizationType === "Curve") {
            return this.createEntropyCurve(this.calculateScanningEntropy(input).entropyData);
        } else if (visualizationType === "Image") {
            return this.createEntropyImage(this.calculateScanningEntropy(input, 10000).entropyData);
        }
    }
}

export default AdvancedEntropy;
