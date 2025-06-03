/**
 * @author grmartin [grmartin]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

// This mapping returns a Promise that resolves to the correct countTokens function for the model.
const MODEL_TO_COUNT_TOKENS = {
    // cl100k_base models
    "gpt-4": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-4-32k": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-4-turbo": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-4o": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-4-0125-preview": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-4-1106-preview": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-3.5-turbo": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-3.5-turbo-16k": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-3.5-turbo-instruct": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-3.5-turbo-0125": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "gpt-3.5-turbo-1106": () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => m.countTokens),
    "text-embedding-ada-002": () => import("gpt-tokenizer/model/text-embedding-ada-002").then(m => m.countTokens),
    "text-embedding-3-large": () => import("gpt-tokenizer/model/text-embedding-3-large").then(m => m.countTokens),
    "text-embedding-3-small": () => import("gpt-tokenizer/model/text-embedding-3-small").then(m => m.countTokens),

    // p50k_base models
    "code-davinci-002": () => import("gpt-tokenizer/model/code-davinci-002").then(m => m.countTokens),
    "code-davinci-001": () => import("gpt-tokenizer/model/code-davinci-002").then(m => m.countTokens),
    "code-cushman-002": () => import("gpt-tokenizer/model/code-cushman-002").then(m => m.countTokens),
    "code-cushman-001": () => import("gpt-tokenizer/model/code-cushman-002").then(m => m.countTokens),
    "text-davinci-002": () => import("gpt-tokenizer/model/text-davinci-002").then(m => m.countTokens),
    "text-davinci-003": () => import("gpt-tokenizer/model/text-davinci-003").then(m => m.countTokens),

    // p50k_edit models
    "text-davinci-edit-001": () => import("gpt-tokenizer/model/text-davinci-edit-001").then(m => m.countTokens),
    "code-davinci-edit-001": () => import("gpt-tokenizer/model/code-davinci-edit-001").then(m => m.countTokens),

    // r50k_base models
    "davinci": () => import("gpt-tokenizer/model/davinci").then(m => m.countTokens),
    "curie": () => import("gpt-tokenizer/model/curie").then(m => m.countTokens),
    "babbage": () => import("gpt-tokenizer/model/babbage").then(m => m.countTokens),
    "ada": () => import("gpt-tokenizer/model/ada").then(m => m.countTokens),
};


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
                value: Object.keys(MODEL_TO_COUNT_TOKENS),
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
        // const [model] = args;
        // // Use the mapping, fallback to cl100k_base if not found
        // const encoding = MODEL_TO_ENCODING[model] || cl100k_base;
        // const tokenCount = encoding.;
        // return tokenCount.toString();
        const [model] = args;
        let countTokensFn;
        if (MODEL_TO_COUNT_TOKENS[model]) {
            countTokensFn = await MODEL_TO_COUNT_TOKENS[model]();
        } else {
            // fallback to default (gpt-3.5-turbo encoding)
            countTokensFn = (await import("gpt-tokenizer/model/gpt-3.5-turbo")).countTokens;
        }
        const tokenCount = countTokensFn(input);
        return tokenCount.toString();
    }

}

export default CountAITokens;

