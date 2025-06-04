/**
 * @author grmartin [grmartin@engineer.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {defaultValue, MODEL_TO_MODULES} from "../lib/GPTTokenizer.mjs";

/**
 * Count AI Tokens operation
 */
class CountAITokens extends Operation {

    /**
     * Count AI Tokens constructor
     */
    constructor() {
        super();

        this.name = "Count AI Tokens";
        this.module = "AI";
        this.infoURL = "https://github.com/niieani/gpt-tokenizer";
        this.description = "Counts the number of GPT tokens in the input text using niieani/gpt-tokenizer. Select the model to use the correct encoding.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Model",
                type: "option",
                value: Object.keys(MODEL_TO_MODULES),
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        if (!input) return "";

        const [model] = args;
        let countTokensFn;
        if (MODEL_TO_MODULES[model]) {
            countTokensFn = (await MODEL_TO_MODULES[model]()).countTokens;
        } else {
            // fallback to default (gpt-3.5-turbo encoding)
            countTokensFn = (await MODEL_TO_MODULES[defaultValue]()).countTokens;
        }
        const tokenCount = countTokensFn(input);
        return tokenCount.toString();
    }

}

export default CountAITokens;

