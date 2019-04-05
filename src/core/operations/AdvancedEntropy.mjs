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
        this.description = "Adds advanced views for examining entropy";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "html";
        this.presentType = "html";
        this.args = [];
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
     * Calculates the frequency of bytes in the input.
     * 
     * @param {byteArray} inputBytes
     * @returns {frequency}
     */
    calculateByteFrequency(inputBytes) {
        console.log(inputBytes);

        let byteFrequency = [];
        for (let i = 0; i < 256; i++) {
            let count = 0;
            for (let byte of inputBytes) {
                if (byte === i) {
                    count++;
                }
            }

            byteFrequency.push(count / (inputBytes.length + 1))
        }

        return byteFrequency;
    }

    /**
     * Creates a byte frequency histogram
     * 
     * @param {byteArray} entropyData
     * @returns {HTML}
     */
    createByteFrequencyHistogram(entropyData) {
        const byteFrequency = entropyData.byteFrequency;

        const svgWidth = 500,
            svgHeight = 500,
            binWidth = 1;

        const document = new nodom.Document();
        let svg = document.createElement("svg");
        svg = d3.select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
        
        const margins = {top: 30, right: 20, bottom: 50, left: 30};

        const yScale = d3.scaleLinear()
            .domain(d3.extent(byteFrequency, d => d))
            .range([svgHeight - margins.bottom, margins.top])

        const xScale = d3.scaleLinear()
            .domain([0, byteFrequency.length - 1])
            .range([margins.left - binWidth, svgWidth - margins.right])

        svg.selectAll("rect")
            .data(byteFrequency)
            .enter().append("rect")
            .attr("x", (_, i) => xScale(i) + binWidth)
            .attr("y", (dataPoint) => yScale(dataPoint))
            .attr("width", binWidth)
            .attr("height", dataPoint => yScale(0) - yScale(dataPoint))
            .attr("fill", "blue")

        // Axes
        const yAxis = d3.axisLeft()
            .scale(yScale);

        const xAxis = d3.axisBottom()
            .scale(xScale)

        svg.append("g")
            .attr("transform", `translate(${binWidth}, ${svgHeight - margins.bottom})`)
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
            .text("Frequency (%)")

        svg.append("text")
            .attr("transform", `translate(${svgWidth / 2}, ${svgHeight - margins.bottom + 40})`)
            .style("text-anchor", "middle")
            .text("Byte")

        // Add title
        svg.append("text")
            .attr("transform", `translate(${svgWidth / 2}, ${margins.top - 10})`)
            .style("text-anchor", "middle")
            .text("Byte Frequency")

        return svg._groups[0][0].outerHTML;
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {       
        const entropyData = {
            entropy: this.calculateShannonEntropy(input),
            byteFrequency: this.calculateByteFrequency(input) 
        }; 
        let svgData = this.createByteFrequencyHistogram(entropyData)
       return svgData
    }
}

export default AdvancedEntropy;
