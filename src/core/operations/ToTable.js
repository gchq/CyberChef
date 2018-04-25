import Utils from "../Utils.js";

/**
 * ToTable operations.
 *
 * @author Mark Jones [github.com/justanothermark]
 * @namespace
 */
 const ToTable = {
    /**
     * @constant
     * @default
     */
    SEPARATORS: [
        {name: "Comma", value:","},
        {name: "Tab", value: escape("\t")},
        {name: "Pipe", value: "|"},
        {name: "Custom", value: ""}
    ],

    /**
     * @constant
     * @default
     */
    FORMATS: [
        'ASCII',
        'HTML'
    ],

    /**
     * To Table operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runToTable: function (input, args) {
        let separator = args[1];
        let firstRowHeader = args[2];
        let format = args[3];
        let tableData = [];

        // If the separator contains any tabs, convert them to tab characters.
        separator = separator.replace('\\t', '\t');

        // Process the input into a nested array of elements.
        let rows = input.split('\n');
        rows.forEach(function(element) {
            if (separator == '') {
                tableData.push([element]);
            }
            else {
                tableData.push(element.split(separator));
            }
        });

        // Render the data in the requested format.
        let output = '';
        switch (format) {
            case 'ASCII':
                output = asciiOutput(tableData);
                break;

            default:
                output = htmlOutput(tableData);
                break;
        }

        return output;

        /**
         * Outputs an array of data as an ASCII table.
         *
         * @param {Array[]} tableData
         * @returns {string}
         */
        function asciiOutput(tableData) {
            const horizontalBorder = '-';
            const verticalBorder = '|';
            const crossBorder = '+';

            let output = '';
            let longestCells = [];

            // Find longestCells value per column to pad cells equally.
            tableData.forEach(function(row, index) {
                row.forEach(function(cell, cellIndex) {
                    if (longestCells[cellIndex] == undefined || cell.length > longestCells[cellIndex]) {
                        longestCells[cellIndex] = cell.length;
                    }
                });
            });

            // Calculate the complete row length. This is the length of the
            // longest cell for each column plus 3 characters per cell
            // (1 padding each side of the value and 1 for the cell border)
            // plus 1 for the final cell border.
            let rowLength = (longestCells.length * 3) + 1;
            longestCells.forEach(function(celllongestCells) {
                rowLength += celllongestCells;
            });

            // Add the top border of the table to the output.
            output += outputHorizontalBorder(longestCells);

            // If the first row is a header, remove the row from the data and
            // add it to the output with another horizontal border.
            if (firstRowHeader) {
                let row = tableData.shift();
                output += outputRow(row, longestCells);
                output += outputHorizontalBorder(longestCells);
            }

            // Add the rest of the table rows.
            tableData.forEach(function(row, index) {
                output += outputRow(row, longestCells);
            });

            // Close the table with a final horizontal border.
            output += outputHorizontalBorder(longestCells);

            return output;

            /**
             * Outputs a row of correctly padded cells.
             */
            function outputRow(row, longestCells) {
                let rowOutput = verticalBorder;
                row.forEach(function(cell, index) {
                    rowOutput += ' ' + cell + ' '.repeat(longestCells[index] - cell.length) + ' ' + verticalBorder;
                });
                rowOutput += '\n';
                return rowOutput;
            }

            /**
             * Outputs a horizontal border with a different character where
             * the horizontal border meets a vertical border.
             */
            function outputHorizontalBorder(longestCells) {
                let rowOutput = crossBorder;
                longestCells.forEach(function(cellLength) {
                    rowOutput += horizontalBorder.repeat(cellLength + 2) + crossBorder;
                });
                rowOutput += '\n';
                return rowOutput;
            }
        }

        /**
         * Outputs a table of data as a HTML table.
         */
        function htmlOutput(tableData) {
            // Start the HTML output with suitable classes for styling.
            let output = "<table class='table table-hover table-condensed table-bordered table-nonfluid'>";

            // If the first row is a header then put it in <thead> with <th> cells.
            if (firstRowHeader) {
                let row = tableData.shift();
                output += "<thead>";
                output += outputRow(row, 'th');
                output += "</thead>";
            }

            // Output the rest of the rows in the <tbody>.
            output += "<tbody>";
            tableData.forEach(function(row, index) {
                output += outputRow(row, 'td');
            });

            // Close the body and table elements.
            output += "</tbody></table>";
            return output;

            function outputRow(row, cellType) {
                let output = "<tr>";
                row.forEach(function(cell) {
                    output += "<" + cellType + ">" + cell + "</" + cellType + ">";
                });
                output += "</tr>";
                return output;
            }
        }

        return output;
    }
};

export default ToTable;