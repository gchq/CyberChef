/**
 * @author tlwr [toby@toby.codes]
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import * as d3temp from "d3";
import * as nodomtemp from "nodom";
import { getScatterValues, RECORD_DELIMITER_OPTIONS, COLOURS, FIELD_DELIMITER_OPTIONS } from "../lib/Charts";

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";

const d3 = d3temp.default ? d3temp.default : d3temp;
const nodom = nodomtemp.default ? nodomtemp.default: nodomtemp;

/**
 * Heatmap chart operation
 */
class HeatmapChart extends Operation {

    /**
     * HeatmapChart constructor
     */
    constructor() {
        super();

        this.name = "Heatmap chart";
        this.module = "Charts";
        this.description = "A heatmap is a graphical representation of data where the individual values contained in a matrix are represented as colors.";
        this.infoURL = "https://wikipedia.org/wiki/Heat_map";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                name: "Record delimiter",
                type: "option",
                value: RECORD_DELIMITER_OPTIONS,
            },
            {
                name: "Field delimiter",
                type: "option",
                value: FIELD_DELIMITER_OPTIONS,
            },
            {
                name: "Number of vertical bins",
                type: "number",
                value: 25,
            },
            {
                name: "Number of horizontal bins",
                type: "number",
                value: 25,
            },
            {
                name: "Use column headers as labels",
                type: "boolean",
                value: true,
            },
            {
                name: "X label",
                type: "string",
                value: "",
            },
            {
                name: "Y label",
                type: "string",
                value: "",
            },
            {
                name: "Draw bin edges",
                type: "boolean",
                value: false,
            },
            {
                name: "Min colour value",
                type: "string",
                value: COLOURS.min,
            },
            {
                name: "Max colour value",
                type: "string",
                value: COLOURS.max,
            },
        ];
    }

    /**
     * Heatmap chart operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const recordDelimiter = Utils.charRep(args[0]),
            fieldDelimiter = Utils.charRep(args[1]),
            vBins = args[2],
            hBins = args[3],
            columnHeadingsAreIncluded = args[4],
            drawEdges = args[7],
            minColour = args[8],
            maxColour = args[9],
            dimension = 500;
        if (vBins <= 0) throw new OperationError("Number of vertical bins must be greater than 0");
        if (hBins <= 0) throw new OperationError("Number of horizontal bins must be greater than 0");

        let xLabel = args[5],
            yLabel = args[6];
        const { headings, values } = getScatterValues(
            input,
            recordDelimiter,
            fieldDelimiter,
            columnHeadingsAreIncluded
        );

        if (headings) {
            xLabel = headings.x;
            yLabel = headings.y;
        }

        const document = new nodom.Document();
        let svg = document.createElement("svg");
        svg = d3.select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${dimension} ${dimension}`);

        const margin = {
                top: 10,
                right: 0,
                bottom: 40,
                left: 30,
            },
            width = dimension - margin.left - margin.right,
            height = dimension - margin.top - margin.bottom,
            binWidth = width / hBins,
            binHeight = height/ vBins,
            marginedSpace = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const bins = this.getHeatmapPacking(values, vBins, hBins),
            maxCount = Math.max(...bins.map(row => {
                const lengths = row.map(cell => cell.length);
                return Math.max(...lengths);
            }));

        const xExtent = d3.extent(values, d => d[0]),
            yExtent = d3.extent(values, d => d[1]);

        const xAxis = d3.scaleLinear()
            .domain(xExtent)
            .range([0, width]);
        const yAxis = d3.scaleLinear()
            .domain(yExtent)
            .range([height, 0]);

        const colour = d3.scaleSequential(d3.interpolateLab(minColour, maxColour))
            .domain([0, maxCount]);

        marginedSpace.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        marginedSpace.append("g")
            .attr("class", "bins")
            .attr("clip-path", "url(#clip)")
            .selectAll("g")
            .data(bins)
            .enter()
            .append("g")
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", (d) => binWidth * d.x)
            .attr("y", (d) => (height - binHeight * (d.y + 1)))
            .attr("width", binWidth)
            .attr("height", binHeight)
            .attr("fill", (d) => colour(d.length))
            .attr("stroke", drawEdges ? "rgba(0, 0, 0, 0.5)" : "none")
            .attr("stroke-width", drawEdges ? "0.5" : "none")
            .append("title")
            .text(d => {
                const count = d.length,
                    perc = 100.0 * d.length / values.length,
                    tooltip = `Count: ${count}\n
                               Percentage: ${perc.toFixed(2)}%\n
                    `.replace(/\s{2,}/g, "\n");
                return tooltip;
            });

        marginedSpace.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yAxis).tickSizeOuter(-width));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("x", -(height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yLabel);

        marginedSpace.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xAxis).tickSizeOuter(-height));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", dimension)
            .style("text-anchor", "middle")
            .text(xLabel);

        return svg._groups[0][0].outerHTML;
    }

    /**
     * Packs a list of x, y coordinates into a number of bins for use in a heatmap.
     *
     * @param {Object[]} points
     * @param {number} number of vertical bins
     * @param {number} number of horizontal bins
     * @returns {Object[]} a list of bins (each bin is an Array) with x y coordinates, filled with the points
     */
    getHeatmapPacking(values, vBins, hBins) {
        const xBounds = d3.extent(values, d => d[0]),
            yBounds = d3.extent(values, d => d[1]),
            bins = [];

        if (xBounds[0] === xBounds[1]) throw "Cannot pack points. There is no difference between the minimum and maximum X coordinate.";
        if (yBounds[0] === yBounds[1]) throw "Cannot pack points. There is no difference between the minimum and maximum Y coordinate.";

        for (let y = 0; y < vBins; y++) {
            bins.push([]);
            for (let x = 0; x < hBins; x++) {
                const item = [];
                item.y = y;
                item.x = x;

                bins[y].push(item);
            } // x
        } // y

        const epsilon = 0.000000001; // This is to clamp values that are exactly the maximum;

        values.forEach(v => {
            const fractionOfY = (v[1] - yBounds[0]) / ((yBounds[1] + epsilon) - yBounds[0]),
                fractionOfX = (v[0] - xBounds[0]) / ((xBounds[1] + epsilon) - xBounds[0]),
                y = Math.floor(vBins * fractionOfY),
                x = Math.floor(hBins * fractionOfX);

            bins[y][x].push({x: v[0], y: v[1]});
        });

        return bins;
    }

}

export default HeatmapChart;
