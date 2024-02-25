/**
 * @author tlwr [toby@toby.codes]
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import * as d3temp from "d3";
import * as nodomtemp from "nodom";
import { getSeriesValues, RECORD_DELIMITER_OPTIONS, FIELD_DELIMITER_OPTIONS } from "../lib/Charts.mjs";

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

const d3 = d3temp.default ? d3temp.default : d3temp;
const nodom = nodomtemp.default ? nodomtemp.default : nodomtemp;

/**
 * Series chart operation
 */
class SeriesChart extends Operation {
    /**
     * SeriesChart constructor
     */
    constructor() {
        super();

        this.name = "Series chart";
        this.module = "Charts";
        this.description
            = "A time series graph is a line graph of repeated measurements taken over regular time intervals.";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                name: "Record delimiter",
                type: "option",
                value: RECORD_DELIMITER_OPTIONS
            },
            {
                name: "Field delimiter",
                type: "option",
                value: FIELD_DELIMITER_OPTIONS
            },
            {
                name: "X label",
                type: "string",
                value: ""
            },
            {
                name: "Point radius",
                type: "number",
                value: 1
            },
            {
                name: "Series colours",
                type: "string",
                value: "mediumseagreen, dodgerblue, tomato"
            }
        ];
    }

    /**
     * Series chart operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const recordDelimiter = Utils.charRep(args[0]),
            fieldDelimiter = Utils.charRep(args[1]),
            xLabel = args[2],
            pipRadius = args[3],
            // Escape HTML from all colours to prevent reflected XSS. See https://github.com/gchq/CyberChef/issues/1265
            seriesColours = args[4].split(",").map((colour) => {
                return Utils.escapeHtml(colour);
            }),
            svgWidth = 500,
            interSeriesPadding = 20,
            xAxisHeight = 50,
            seriesLabelWidth = 50,
            seriesHeight = 100,
            seriesWidth = svgWidth - seriesLabelWidth - interSeriesPadding;

        const { xValues, series } = getSeriesValues(input, recordDelimiter, fieldDelimiter),
            allSeriesHeight = Object.keys(series).length * (interSeriesPadding + seriesHeight),
            svgHeight = allSeriesHeight + xAxisHeight + interSeriesPadding;

        const document = new nodom.Document();
        let svg = document.createElement("svg");
        svg = d3
            .select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

        const xAxis = d3.scalePoint().domain(xValues).range([0, seriesWidth]);

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(${seriesLabelWidth}, ${xAxisHeight})`)
            .call(
                d3.axisTop(xAxis).tickValues(
                    xValues.filter((x, i) => {
                        return [0, Math.round(xValues.length / 2), xValues.length - 1].indexOf(i) >= 0;
                    })
                )
            );

        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", xAxisHeight / 2)
            .style("text-anchor", "middle")
            .text(xLabel);

        const tooltipText = {},
            tooltipAreaWidth = seriesWidth / xValues.length;

        xValues.forEach((x) => {
            const tooltip = [];

            series.forEach((serie) => {
                const y = serie.data[x];
                if (typeof y === "undefined") return;

                tooltip.push(`${serie.name}: ${y}`);
            });

            tooltipText[x] = tooltip.join("\n");
        });

        const chartArea = svg.append("g").attr("transform", `translate(${seriesLabelWidth}, ${xAxisHeight})`);

        chartArea
            .append("g")
            .selectAll("rect")
            .data(xValues)
            .enter()
            .append("rect")
            .attr("x", (x) => {
                return xAxis(x) - tooltipAreaWidth / 2;
            })
            .attr("y", 0)
            .attr("width", tooltipAreaWidth)
            .attr("height", allSeriesHeight)
            .attr("stroke", "none")
            .attr("fill", "transparent")
            .append("title")
            .text((x) => {
                return `${x}\n
                    --\n
                    ${tooltipText[x]}\n
                `.replace(/\s{2,}/g, "\n");
            });

        const yAxesArea = svg.append("g").attr("transform", `translate(0, ${xAxisHeight})`);

        series.forEach((serie, seriesIndex) => {
            const yExtent = d3.extent(Object.values(serie.data)),
                yAxis = d3.scaleLinear().domain(yExtent).range([seriesHeight, 0]);

            const seriesGroup = chartArea
                .append("g")
                .attr(
                    "transform",
                    `translate(0, ${seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`
                );

            let path = "";
            xValues.forEach((x, xIndex) => {
                let nextX = xValues[xIndex + 1],
                    y = serie.data[x],
                    nextY = serie.data[nextX];

                if (typeof y === "undefined" || typeof nextY === "undefined") return;

                x = xAxis(x);
                nextX = xAxis(nextX);
                y = yAxis(y);
                nextY = yAxis(nextY);

                path += `M ${x} ${y} L ${nextX} ${nextY} z `;
            });

            seriesGroup
                .append("path")
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", seriesColours[seriesIndex % seriesColours.length])
                .attr("stroke-width", "1");

            xValues.forEach((x) => {
                const y = serie.data[x];
                if (typeof y === "undefined") return;

                seriesGroup
                    .append("circle")
                    .attr("cx", xAxis(x))
                    .attr("cy", yAxis(y))
                    .attr("r", pipRadius)
                    .attr("fill", seriesColours[seriesIndex % seriesColours.length])
                    .append("title")
                    .text((d) => {
                        return `${x}\n
                            --\n
                            ${tooltipText[x]}\n
                        `.replace(/\s{2,}/g, "\n");
                    });
            });

            yAxesArea
                .append("g")
                .attr(
                    "transform",
                    `translate(${seriesLabelWidth - interSeriesPadding}, ${seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`
                )
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(yAxis).ticks(5));

            yAxesArea
                .append("g")
                .attr(
                    "transform",
                    `translate(0, ${seriesHeight / 2 + seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`
                )
                .append("text")
                .style("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text(serie.name);
        });

        return svg._groups[0][0].outerHTML;
    }
}

export default SeriesChart;
