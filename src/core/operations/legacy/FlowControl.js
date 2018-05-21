import Recipe from "./Recipe.js";
import Dish from "./Dish.js";
import Magic from "./lib/Magic.js";
import Utils from "./Utils.js";


/**
 * Flow Control operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const FlowControl = {

    /**
     * Fork operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runFork: async function(state) {
        const opList     = state.opList,
            inputType    = opList[state.progress].inputType,
            outputType   = opList[state.progress].outputType,
            input        = await state.dish.get(inputType),
            ings         = opList[state.progress].ingValues,
            splitDelim   = ings[0],
            mergeDelim   = ings[1],
            ignoreErrors = ings[2],
            subOpList    = [];
        let inputs       = [],
            i;

        if (input)
            inputs = input.split(splitDelim);

        // Create subOpList for each tranche to operate on
        // (all remaining operations unless we encounter a Merge)
        for (i = state.progress + 1; i < opList.length; i++) {
            if (opList[i].name === "Merge" && !opList[i].disabled) {
                break;
            } else {
                subOpList.push(opList[i]);
            }
        }

        const recipe = new Recipe();
        let output = "",
            progress = 0;

        state.forkOffset += state.progress + 1;

        recipe.addOperations(subOpList);

        // Take a deep(ish) copy of the ingredient values
        const ingValues = subOpList.map(op => JSON.parse(JSON.stringify(op.ingValues)));

        // Run recipe over each tranche
        for (i = 0; i < inputs.length; i++) {
            log.debug(`Entering tranche ${i + 1} of ${inputs.length}`);

            // Baseline ing values for each tranche so that registers are reset
            subOpList.forEach((op, i) => {
                op.ingValues = JSON.parse(JSON.stringify(ingValues[i]));
            });

            const dish = new Dish();
            dish.set(inputs[i], inputType);

            try {
                progress = await recipe.execute(dish, 0, state);
            } catch (err) {
                if (!ignoreErrors) {
                    throw err;
                }
                progress = err.progress + 1;
            }
            output += await dish.get(outputType) + mergeDelim;
        }

        state.dish.set(output, outputType);
        state.progress += progress;
        return state;
    },


    /**
     * Merge operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runMerge: function(state) {
        // No need to actually do anything here. The fork operation will
        // merge when it sees this operation.
        return state;
    },


    /**
     * Register operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runRegister: async function(state) {
        const ings = state.opList[state.progress].ingValues,
            extractorStr = ings[0],
            i = ings[1],
            m = ings[2];

        let modifiers = "";
        if (i) modifiers += "i";
        if (m) modifiers += "m";

        const extractor = new RegExp(extractorStr, modifiers),
            input = await state.dish.get(Dish.STRING),
            registers = input.match(extractor);

        if (!registers) return state;

        if (ENVIRONMENT_IS_WORKER()) {
            self.setRegisters(state.forkOffset + state.progress, state.numRegisters, registers.slice(1));
        }

        /**
         * Replaces references to registers (e.g. $R0) with the contents of those registers.
         *
         * @param {string} str
         * @returns {string}
         */
        function replaceRegister(str) {
            // Replace references to registers ($Rn) with contents of registers
            return str.replace(/(\\*)\$R(\d{1,2})/g, (match, slashes, regNum) => {
                const index = parseInt(regNum, 10) + 1;
                if (index <= state.numRegisters || index >= state.numRegisters + registers.length)
                    return match;
                if (slashes.length % 2 !== 0) return match.slice(1); // Remove escape
                return slashes + registers[index - state.numRegisters];
            });
        }

        // Step through all subsequent ops and replace registers in args with extracted content
        for (let i = state.progress + 1; i < state.opList.length; i++) {
            if (state.opList[i].disabled) continue;

            let args = state.opList[i].ingValues;
            args = args.map(arg => {
                if (typeof arg !== "string" && typeof arg !== "object") return arg;

                if (typeof arg === "object" && arg.hasOwnProperty("string")) {
                    arg.string = replaceRegister(arg.string);
                    return arg;
                }
                return replaceRegister(arg);
            });
            state.opList[i].setIngValues(args);
        }

        state.numRegisters += registers.length - 1;
        return state;
    },


    /**
     * Jump operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @param {number} state.numJumps - The number of jumps taken so far.
     * @returns {Object} The updated state of the recipe.
     */
    runJump: function(state) {
        const ings = state.opList[state.progress].ingValues,
            label = ings[0],
            maxJumps = ings[1],
            jmpIndex = FlowControl._getLabelIndex(label, state);

        if (state.numJumps >= maxJumps || jmpIndex === -1) {
            log.debug("Maximum jumps reached or label cannot be found");
            return state;
        }

        state.progress = jmpIndex;
        state.numJumps++;
        log.debug(`Jumping to label '${label}' at position ${jmpIndex} (jumps = ${state.numJumps})`);
        return state;
    },


    /**
     * Conditional Jump operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @param {number} state.numJumps - The number of jumps taken so far.
     * @returns {Object} The updated state of the recipe.
     */
    runCondJump: async function(state) {
        const ings   = state.opList[state.progress].ingValues,
            dish     = state.dish,
            regexStr = ings[0],
            invert   = ings[1],
            label    = ings[2],
            maxJumps = ings[3],
            jmpIndex = FlowControl._getLabelIndex(label, state);

        if (state.numJumps >= maxJumps || jmpIndex === -1) {
            log.debug("Maximum jumps reached or label cannot be found");
            return state;
        }

        if (regexStr !== "") {
            const str = await dish.get(Dish.STRING)
            const strMatch = str.search(regexStr) > -1;
            if (!invert && strMatch || invert && !strMatch) {
                state.progress = jmpIndex;
                state.numJumps++;
                log.debug(`Jumping to label '${label}' at position ${jmpIndex} (jumps = ${state.numJumps})`);
            }
        }

        return state;
    },


    /**
     * Return operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runReturn: function(state) {
        state.progress = state.opList.length;
        return state;
    },


    /**
     * Comment operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runComment: function(state) {
        return state;
    },


    /**
     * Magic operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runMagic: async function(state) {
        const ings = state.opList[state.progress].ingValues,
            depth = ings[0],
            intensive = ings[1],
            extLang = ings[2],
            dish = state.dish,
            currentRecipeConfig = state.opList.map(op => op.getConfig()),
            magic = new Magic(dish.get(Dish.ARRAY_BUFFER)),
            options = await magic.speculativeExecution(depth, extLang, intensive);

        let output = `<table
                class='table table-hover table-condensed table-bordered'
                style='table-layout: fixed;'>
            <tr>
                <th>Recipe (click to load)</th>
                <th>Result snippet</th>
                <th>Properties</th>
            </tr>`;

        /**
         * Returns a CSS colour value based on an integer input.
         *
         * @param {number} val
         * @returns {string}
         */
        function chooseColour(val) {
            if (val < 3) return "green";
            if (val < 5) return "goldenrod";
            return "red";
        }

        options.forEach(option => {
            // Construct recipe URL
            // Replace this Magic op with the generated recipe
            const recipeConfig = currentRecipeConfig.slice(0, state.progress)
                    .concat(option.recipe)
                    .concat(currentRecipeConfig.slice(state.progress + 1)),
                recipeURL = "recipe=" + Utils.encodeURIFragment(Utils.generatePrettyRecipe(recipeConfig));

            let language = "",
                fileType = "",
                matchingOps = "",
                useful = "",
                entropy = `<span data-toggle="tooltip" data-container="body" title="Shannon Entropy is measured from 0 to 8. High entropy suggests encrypted or compressed data. Normal text is usually around 3.5 to 5.">Entropy: <span style="color: ${chooseColour(option.entropy)}">${option.entropy.toFixed(2)}</span></span>`,
                validUTF8 = option.isUTF8 ? "<span data-toggle='tooltip' data-container='body' title='The data could be a valid UTF8 string based on its encoding.'>Valid UTF8</span>\n" : "";

            if (option.languageScores[0].probability > 0) {
                let likelyLangs = option.languageScores.filter(l => l.probability > 0);
                if (likelyLangs.length < 1) likelyLangs = [option.languageScores[0]];
                language = "<span data-toggle='tooltip' data-container='body' title='Based on a statistical comparison of the frequency of bytes in various languages. Ordered by likelihood.'>" +
                    "Possible languages:\n    " + likelyLangs.map(lang => {
                        return Magic.codeToLanguage(lang.lang);
                    }).join("\n    ") + "</span>\n";
            }

            if (option.fileType) {
                fileType = `<span data-toggle="tooltip" data-container="body" title="Based on the presence of magic bytes.">File type: ${option.fileType.mime} (${option.fileType.ext})</span>\n`;
            }

            if (option.matchingOps.length) {
                matchingOps = `Matching ops: ${[...new Set(option.matchingOps.map(op => op.op))].join(", ")}\n`;
            }

            if (option.useful) {
                useful = "<span data-toggle='tooltip' data-container='body' title='This could be an operation that displays data in a useful way, such as rendering an image.'>Useful op detected</span>\n";
            }

            output += `<tr>
                <td><a href="#${recipeURL}">${Utils.generatePrettyRecipe(option.recipe, true)}</a></td>
                <td>${Utils.escapeHtml(Utils.printable(Utils.truncate(option.data, 99)))}</td>
                <td>${language}${fileType}${matchingOps}${useful}${validUTF8}${entropy}</td>
            </tr>`;
        });

        output += "</table><script type='application/javascript'>$('[data-toggle=\"tooltip\"]').tooltip()</script>";

        if (!options.length) {
            output = "Nothing of interest could be detected about the input data.\nHave you tried modifying the operation arguments?";
        }
        dish.set(output, Dish.HTML);
        return state;
    },


    /**
     * Returns the index of a label.
     *
     * @private
     * @param {Object} state
     * @param {string} name
     * @returns {number}
     */
    _getLabelIndex: function(name, state) {
        for (let o = 0; o < state.opList.length; o++) {
            const operation = state.opList[o];
            if (operation.name === "Label"){
                const ings = operation.ingValues;
                if (name === ings[0]) {
                    return o;
                }
            }
        }
        return -1;
    },
};

export default FlowControl;
