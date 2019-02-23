import * as d3 from "d3";
import Utils from "../Utils.js";

/**
 * Charting operations.
 *
 * @author tlwr [toby@toby.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Charts = {


    /**
     * Scatter chart operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runScatterChart: function (input, args) {
        const recordDelimiter = Utils.charRep[args[0]],
            fieldDelimiter = Utils.charRep[args[1]],
            columnHeadingsAreIncluded = args[2],
            fillColour = args[5],
            radius = args[6],
            colourInInput = args[7],
            dimension = 500;

        let xLabel = args[3],
            yLabel = args[4];

        let dataFunction = colourInInput ? Charts._getScatterValuesWithColour : Charts._getScatterValues;

        let { headings, values } = dataFunction(
                input,
                recordDelimiter,
                fieldDelimiter,
                columnHeadingsAreIncluded
            );

        if (headings) {
            xLabel = headings.x;
            yLabel = headings.y;
        }

        let svg = document.createElement("svg");
        svg = d3.select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${dimension} ${dimension}`);

        let margin = {
                top: 10,
                right: 0,
                bottom: 40,
                left: 30,
            },
            width = dimension - margin.left - margin.right,
            height = dimension - margin.top - margin.bottom,
            marginedSpace = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let xExtent = d3.extent(values, d => d[0]),
            xDelta = xExtent[1] - xExtent[0],
            yExtent = d3.extent(values, d => d[1]),
            yDelta = yExtent[1] - yExtent[0],
            xAxis = d3.scaleLinear()
                .domain([xExtent[0] - (0.1 * xDelta), xExtent[1] + (0.1 * xDelta)])
                .range([0, width]),
            yAxis = d3.scaleLinear()
                .domain([yExtent[0] - (0.1 * yDelta), yExtent[1] + (0.1 * yDelta)])
                .range([height, 0]);

        marginedSpace.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        marginedSpace.append("g")
            .attr("class", "points")
            .attr("clip-path", "url(#clip)")
            .selectAll("circle")
            .data(values)
            .enter()
            .append("circle")
            .attr("cx", (d) => xAxis(d[0]))
            .attr("cy", (d) => yAxis(d[1]))
            .attr("r", d => radius)
            .attr("fill", d => {
                return colourInInput ? d[2] : fillColour;
            })
            .attr("stroke", "rgba(0, 0, 0, 0.5)")
            .attr("stroke-width", "0.5")
            .append("title")
            .text(d => {
                let x = d[0],
                    y = d[1],
                    tooltip = `X: ${x}\n
                               Y: ${y}\n
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
    },


    /**
     * Series chart operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runSeriesChart(input, args) {
        const recordDelimiter = Utils.charRep[args[0]],
            fieldDelimiter = Utils.charRep[args[1]],
            xLabel = args[2],
            pipRadius = args[3],
            seriesColours = args[4].split(","),
            svgWidth = 500,
            interSeriesPadding = 20,
            xAxisHeight = 50,
            seriesLabelWidth = 50,
            seriesHeight = 100,
            seriesWidth = svgWidth - seriesLabelWidth - interSeriesPadding;

        let { xValues, series } = Charts._getSeriesValues(input, recordDelimiter, fieldDelimiter),
            allSeriesHeight = Object.keys(series).length * (interSeriesPadding + seriesHeight),
            svgHeight = allSeriesHeight + xAxisHeight + interSeriesPadding;

        let svg = document.createElement("svg");
        svg = d3.select(svg)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

        let xAxis = d3.scalePoint()
            .domain(xValues)
            .range([0, seriesWidth]);

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(${seriesLabelWidth}, ${xAxisHeight})`)
            .call(
                d3.axisTop(xAxis).tickValues(xValues.filter((x, i) => {
                    return [0, Math.round(xValues.length / 2), xValues.length -1].indexOf(i) >= 0;
                }))
            );

        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", xAxisHeight / 2)
            .style("text-anchor", "middle")
            .text(xLabel);

        let tooltipText = {},
            tooltipAreaWidth = seriesWidth / xValues.length;

        xValues.forEach(x => {
            let tooltip = [];

            series.forEach(serie => {
                let y = serie.data[x];
                if (typeof y === "undefined") return;

                tooltip.push(`${serie.name}: ${y}`);
            });

            tooltipText[x] = tooltip.join("\n");
        });

        let chartArea = svg.append("g")
            .attr("transform", `translate(${seriesLabelWidth}, ${xAxisHeight})`);

        chartArea
            .append("g")
            .selectAll("rect")
            .data(xValues)
            .enter()
            .append("rect")
            .attr("x", x => {
                return xAxis(x) - (tooltipAreaWidth / 2);
            })
            .attr("y", 0)
            .attr("width", tooltipAreaWidth)
            .attr("height", allSeriesHeight)
            .attr("stroke", "none")
            .attr("fill", "transparent")
            .append("title")
            .text(x => {
                return `${x}\n
                    --\n
                    ${tooltipText[x]}\n
                `.replace(/\s{2,}/g, "\n");
            });

        let yAxesArea = svg.append("g")
            .attr("transform", `translate(0, ${xAxisHeight})`);

        series.forEach((serie, seriesIndex) => {
            let yExtent = d3.extent(Object.values(serie.data)),
                yAxis = d3.scaleLinear()
                    .domain(yExtent)
                    .range([seriesHeight, 0]);

            let seriesGroup = chartArea
                .append("g")
                .attr("transform", `translate(0, ${seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`);

            let path = "";
            xValues.forEach((x, xIndex) => {
                let nextX = xValues[xIndex + 1],
                    y = serie.data[x],
                    nextY= serie.data[nextX];

                if (typeof y === "undefined" || typeof nextY === "undefined") return;

                x = xAxis(x); nextX = xAxis(nextX);
                y = yAxis(y); nextY = yAxis(nextY);

                path += `M ${x} ${y} L ${nextX} ${nextY} z `;
            });

            seriesGroup
                .append("path")
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", seriesColours[seriesIndex % seriesColours.length])
                .attr("stroke-width", "1");

            xValues.forEach(x => {
                let y = serie.data[x];
                if (typeof y === "undefined") return;

                seriesGroup
                    .append("circle")
                    .attr("cx", xAxis(x))
                    .attr("cy", yAxis(y))
                    .attr("r", pipRadius)
                    .attr("fill", seriesColours[seriesIndex % seriesColours.length])
                    .append("title")
                    .text(d => {
                        return `${x}\n
                            --\n
                            ${tooltipText[x]}\n
                        `.replace(/\s{2,}/g, "\n");
                    });
            });

            yAxesArea
                .append("g")
                .attr("transform", `translate(${seriesLabelWidth - interSeriesPadding}, ${seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`)
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(yAxis).ticks(5));

            yAxesArea
                .append("g")
                .attr("transform", `translate(0, ${seriesHeight / 2 + seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`)
                .append("text")
                .style("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text(serie.name);
        });

        return svg._groups[0][0].outerHTML;
    },
};

export default Charts;
