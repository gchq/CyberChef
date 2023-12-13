/**
 * @author sw5678
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {INPUT_DELIM_OPTIONS} from "../lib/Delim.mjs";

/**
 * Unique operation
 */
class FileTree extends Operation {

    /**
     * Unique constructor
     */
    constructor() {
        super();

        this.name = "File Tree";
        this.module = "Default";
        this.description = "Creates file tree from list of file paths (Similar too tree linux command)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "File Path Delimiter",
                type: "binaryString",
                value: "/"
            },
            {
                name: "Delimiter",
                type: "option",
                value: INPUT_DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

        // Set up arrow and pipe for nice output display
        const ARROW = '|---';
        const PIPE = '|   ';

        // Get args from input
        const file_delim = args[0];
        const entry_delim = Utils.charRep(args[1]); 

        // Store path to print
        let completed_list = [];
        let print_list = [];

        // Loop through all entries
        const file_paths = input.split(entry_delim).unique().sort();
        for (var i = 0; i < file_paths.length; i++)
        {
            // Split by file delimiter
            let path = file_paths[i].split(file_delim);

            if (path[0] == '')
            {
                path  = path.slice(1, path.length);
            }

            for (var j = 0; j < path.length; j++)
            {
                let print_line;
                let key;
                if (j == 0)
                {
                    print_line = path[j];
                    key = path[j];
                }
                else
                {
                    print_line = PIPE.repeat(j-1) + ARROW + path[j]
                    key = path.slice(0, j+1).join("/");
                }

                // Check to see we have already added that path
                if (!completed_list.includes(key))
                {
                    completed_list.push(key);
                    print_list.push(print_line);
                }
            }
        }
        return print_list.join("\n");
    }

}

export default FileTree;
