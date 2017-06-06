import * as d3 from "d3";
import {hexbin as d3hexbin} from "d3-hexbin";
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
     * @constant
     * @default
     */
    RECORD_DELIMITER_OPTIONS: ["Line feed", "CRLF"],


    /**
     * @constant
     * @default
     */
    FIELD_DELIMITER_OPTIONS: ["Space", "Comma", "Semi-colon", "Colon", "Tab"],


    /**
     * Default from colour
     *
     * @constant
     * @default
     */
    COLOURS: {
        min: "white",
        max: "black",
    },


    /**
     * Gets values from input for a plot.
     *
     * @param {string} input
     * @param {string} recordDelimiter
     * @param {string} fieldDelimiter
     * @param {boolean} columnHeadingsAreIncluded - whether we should skip the first record
     * @returns {Object[]}
     */
    _getValues(input, recordDelimiter, fieldDelimiter, columnHeadingsAreIncluded, length) {
        let headings;
        const values = [];

        input
            .split(recordDelimiter)
            .forEach((row, rowIndex) => {
                let split = row.split(fieldDelimiter);

                if (split.length !== length) throw `Each row must have length ${length}.`;

                if (columnHeadingsAreIncluded && rowIndex === 0) {
                    headings = split;
                } else {
                    values.push(split);
                }
            });

        return { headings, values};
    },


    /**
     * Gets values from input for a scatter plot.
     *
     * @param {string} input
     * @param {string} recordDelimiter
     * @param {string} fieldDelimiter
     * @param {boolean} columnHeadingsAreIncluded - whether we should skip the first record
     * @returns {Object[]}
     */
    _getScatterValues(input, recordDelimiter, fieldDelimiter, columnHeadingsAreIncluded) {
        let { headings, values } = Charts._getValues(
            input,
            recordDelimiter, fieldDelimiter,
            columnHeadingsAreIncluded,
            2
        );

        if (headings) {
            headings = {x: headings[0], y: headings[1]};
        }

        values = values.map(row => {
            let x = parseFloat(row[0], 10),
                y = parseFloat(row[1], 10);

            if (Number.isNaN(x)) throw "Values must be numbers in base 10.";
            if (Number.isNaN(y)) throw "Values must be numbers in base 10.";

            return [x, y];
        });

        return { headings, values };
    },

    
    /**
     * Gets values from input for a scatter plot with colour from the third column.
     *
     * @param {string} input
     * @param {string} recordDelimiter
     * @param {string} fieldDelimiter
     * @param {boolean} columnHeadingsAreIncluded - whether we should skip the first record
     * @returns {Object[]}
     */
    _getScatterValuesWithColour(input, recordDelimiter, fieldDelimiter, columnHeadingsAreIncluded) {
        let { headings, values } = Charts._getValues(
            input,
            recordDelimiter, fieldDelimiter,
            columnHeadingsAreIncluded,
            3
        );

        if (headings) {
            headings = {x: headings[0], y: headings[1]};
        }

        values = values.map(row => {
            let x = parseFloat(row[0], 10),
                y = parseFloat(row[1], 10),
                colour = row[2];

            if (Number.isNaN(x)) throw "Values must be numbers in base 10.";
            if (Number.isNaN(y)) throw "Values must be numbers in base 10.";

            return [x, y, colour];
        });

        return { headings, values };
    },


    /**
     * Hex Bin chart operation.
     *
     * @param {Object[]} - centres
     * @param {number} - radius
     * @returns {Object[]}
     */
    _getEmptyHexagons(centres, radius) {
        const emptyCentres = [];
        let boundingRect = [d3.extent(centres, d => d.x), d3.extent(centres, d => d.y)],
            indent = false,
            hexagonCenterToEdge = Math.cos(2 * Math.PI / 12) * radius,
            hexagonEdgeLength = Math.sin(2 * Math.PI / 12) * radius;

        for (let y = boundingRect[1][0]; y <= boundingRect[1][1] + radius; y += hexagonEdgeLength + radius) {
            for (let x = boundingRect[0][0]; x <= boundingRect[0][1] + radius; x += 2 * hexagonCenterToEdge) {
                let cx = x,
                    cy = y;

                if (indent && x >= boundingRect[0][1]) break;
                if (indent) cx += hexagonCenterToEdge;

                emptyCentres.push({x: cx, y: cy});
            }
            indent = !indent;
        }

        return emptyCentres;
    },


    /**
     * Hex Bin chart operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runHexDensityChart: function (input, args) {
        const recordDelimiter = Utils.charRep[args[0]],
            fieldDelimiter = Utils.charRep[args[1]],
            packRadius = args[2],
            drawRadius = args[3],
            columnHeadingsAreIncluded = args[4],
            drawEdges = args[7],
            minColour = args[8],
            maxColour = args[9],
            drawEmptyHexagons = args[10],
            dimension = 500;

        let xLabel = args[5],
            yLabel = args[6],
            { headings, values } = Charts._getScatterValues(
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

        let hexbin = d3hexbin()
            .radius(packRadius)
            .extent([0, 0], [width, height]);

        let hexPoints = hexbin(values),
            maxCount = Math.max(...hexPoints.map(b => b.length));

        let xExtent = d3.extent(hexPoints, d => d.x),
            yExtent = d3.extent(hexPoints, d => d.y);
        xExtent[0] -= 2 * packRadius;
        xExtent[1] += 3 * packRadius;
        yExtent[0] -= 2 * packRadius;
        yExtent[1] += 2 * packRadius;

        let xAxis = d3.scaleLinear()
            .domain(xExtent)
            .range([0, width]);
        let yAxis = d3.scaleLinear()
            .domain(yExtent)
            .range([height, 0]);

        let colour = d3.scaleSequential(d3.interpolateLab(minColour, maxColour))
            .domain([0, maxCount]);

        marginedSpace.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        if (drawEmptyHexagons) {
            marginedSpace.append("g")
                .attr("class", "empty-hexagon")
                .selectAll("path")
                .data(Charts._getEmptyHexagons(hexPoints, packRadius))
                .enter()
                .append("path")
                .attr("d", d => {
                    return `M${xAxis(d.x)},${yAxis(d.y)} ${hexbin.hexagon(drawRadius)}`;
                })
                .attr("fill", (d) => colour(0))
                .attr("stroke", drawEdges ? "black" : "none")
                .attr("stroke-width", drawEdges ? "0.5" : "none")
                .append("title")
                .text(d => {
                    let count = 0,
                        perc = 0,
                        tooltip = `Count: ${count}\n
                                Percentage: ${perc.toFixed(2)}%\n
                                Center: ${d.x.toFixed(2)}, ${d.y.toFixed(2)}\n
                        `.replace(/\s{2,}/g, "\n");
                    return tooltip;
                });
        }

        marginedSpace.append("g")
            .attr("class", "hexagon")
            .attr("clip-path", "url(#clip)")
            .selectAll("path")
            .data(hexPoints)
            .enter()
            .append("path")
            .attr("d", d => {
                return `M${xAxis(d.x)},${yAxis(d.y)} ${hexbin.hexagon(drawRadius)}`;
            })
            .attr("fill", (d) => colour(d.length))
            .attr("stroke", drawEdges ? "black" : "none")
            .attr("stroke-width", drawEdges ? "0.5" : "none")
            .append("title")
            .text(d => {
                let count = d.length,
                    perc = 100.0 * d.length / values.length,
                    CX = d.x,
                    CY = d.y,
                    xMin = Math.min(...d.map(d => d[0])),
                    xMax = Math.max(...d.map(d => d[0])),
                    yMin = Math.min(...d.map(d => d[1])),
                    yMax = Math.max(...d.map(d => d[1])),
                    tooltip = `Count: ${count}\n
                               Percentage: ${perc.toFixed(2)}%\n
                               Center: ${CX.toFixed(2)}, ${CY.toFixed(2)}\n
                               Min X: ${xMin.toFixed(2)}\n
                               Max X: ${xMax.toFixed(2)}\n
                               Min Y: ${yMin.toFixed(2)}\n
                               Max Y: ${yMax.toFixed(2)}
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
     * Packs a list of x, y coordinates into a number of bins for use in a heatmap.
     * 
     * @param {Object[]} points
     * @param {number} number of vertical bins
     * @param {number} number of horizontal bins
     * @returns {Object[]} a list of bins (each bin is an Array) with x y coordinates, filled with the points
     */
    _getHeatmapPacking(values, vBins, hBins) {
        const xBounds = d3.extent(values, d => d[0]),
            yBounds = d3.extent(values, d => d[1]),
            bins = [];

        if (xBounds[0] === xBounds[1]) throw "Cannot pack points. There is no difference between the minimum and maximum X coordinate.";
        if (yBounds[0] === yBounds[1]) throw "Cannot pack points. There is no difference between the minimum and maximum Y coordinate.";

        for (let y = 0; y < vBins; y++) {
            bins.push([]);
            for (let x = 0; x < hBins; x++) {
                let item = [];
                item.y = y;
                item.x = x;

                bins[y].push(item);
            } // x
        } // y

        let epsilon = 0.000000001; // This is to clamp values that are exactly the maximum;

        values.forEach(v => {
            let fractionOfY = (v[1] - yBounds[0]) / ((yBounds[1] + epsilon) - yBounds[0]),
                fractionOfX = (v[0] - xBounds[0]) / ((xBounds[1] + epsilon) - xBounds[0]);
            let y = Math.floor(vBins * fractionOfY),
                x = Math.floor(hBins * fractionOfX);

            bins[y][x].push({x: v[0], y: v[1]});
        });

        return bins;
    },


    /**
     * Heatmap chart operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runHeatmapChart: function (input, args) {
        const recordDelimiter = Utils.charRep[args[0]],
            fieldDelimiter = Utils.charRep[args[1]],
            vBins = args[2],
            hBins = args[3],
            columnHeadingsAreIncluded = args[4],
            drawEdges = args[7],
            minColour = args[8],
            maxColour = args[9],
            dimension = 500;
        
        if (vBins <= 0) throw "Number of vertical bins must be greater than 0";
        if (hBins <= 0) throw "Number of horizontal bins must be greater than 0";

        let xLabel = args[5],
            yLabel = args[6],
            { headings, values } = Charts._getScatterValues(
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
            binWidth = width / hBins,
            binHeight = height/ vBins,
            marginedSpace = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let bins = Charts._getHeatmapPacking(values, vBins, hBins),
            maxCount = Math.max(...bins.map(row => {
                let lengths = row.map(cell => cell.length);
                return Math.max(...lengths);
            }));

        let xExtent = d3.extent(values, d => d[0]),
            yExtent = d3.extent(values, d => d[1]);

        let xAxis = d3.scaleLinear()
            .domain(xExtent)
            .range([0, width]);
        let yAxis = d3.scaleLinear()
            .domain(yExtent)
            .range([height, 0]);

        let colour = d3.scaleSequential(d3.interpolateLab(minColour, maxColour))
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
                let count = d.length,
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
    },


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
};

export default Charts;
