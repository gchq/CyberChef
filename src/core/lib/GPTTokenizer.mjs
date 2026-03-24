// noinspection SpellCheckingInspection

/**
 * @author grmartin [grmartin@engineer.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

const exportModule = (m) => {
    return {
        countTokens: m.countTokens, // # of tokens
        encode: m.encode,           // tokens ids
        decodeGenerator: m.decodeGenerator, // tokens
    };
};

export const defaultValue = Symbol("*");

// Tokenizer module constants
const GPT_35_TURBO_TOKENIZER = () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => exportModule(m));
const TEXT_EMBEDDING_ADA_002_TOKENIZER = () => import("gpt-tokenizer/model/text-embedding-ada-002").then(m => exportModule(m));
const TEXT_EMBEDDING_3_LARGE_TOKENIZER = () => import("gpt-tokenizer/model/text-embedding-3-large").then(m => exportModule(m));
const TEXT_EMBEDDING_3_SMALL_TOKENIZER = () => import("gpt-tokenizer/model/text-embedding-3-small").then(m => exportModule(m));
const CODE_DAVINCI_002_TOKENIZER = () => import("gpt-tokenizer/model/code-davinci-002").then(m => exportModule(m));
const CODE_CUSHMAN_002_TOKENIZER = () => import("gpt-tokenizer/model/code-cushman-002").then(m => exportModule(m));
const TEXT_DAVINCI_002_TOKENIZER = () => import("gpt-tokenizer/model/text-davinci-002").then(m => exportModule(m));
const TEXT_DAVINCI_003_TOKENIZER = () => import("gpt-tokenizer/model/text-davinci-003").then(m => exportModule(m));
const TEXT_DAVINCI_EDIT_001_TOKENIZER = () => import("gpt-tokenizer/model/text-davinci-edit-001").then(m => exportModule(m));
const CODE_DAVINCI_EDIT_001_TOKENIZER = () => import("gpt-tokenizer/model/code-davinci-edit-001").then(m => exportModule(m));
const DAVINCI_TOKENIZER = () => import("gpt-tokenizer/model/davinci").then(m => exportModule(m));
const CURIE_TOKENIZER = () => import("gpt-tokenizer/model/curie").then(m => exportModule(m));
const BABBAGE_TOKENIZER = () => import("gpt-tokenizer/model/babbage").then(m => exportModule(m));
const ADA_TOKENIZER = () => import("gpt-tokenizer/model/ada").then(m => exportModule(m));

// This mapping returns a Promise that resolves to the correct countTokens function for the model.
export const MODEL_TO_MODULES = {
    // cl100k_base models
    [defaultValue]: GPT_35_TURBO_TOKENIZER,
    "gpt-4": GPT_35_TURBO_TOKENIZER,
    "gpt-4-32k": GPT_35_TURBO_TOKENIZER,
    "gpt-4-turbo": GPT_35_TURBO_TOKENIZER,
    "gpt-4o": GPT_35_TURBO_TOKENIZER,
    "gpt-4-0125-preview": GPT_35_TURBO_TOKENIZER,
    "gpt-4-1106-preview": GPT_35_TURBO_TOKENIZER,
    "gpt-3.5-turbo": GPT_35_TURBO_TOKENIZER,
    "gpt-3.5-turbo-16k": GPT_35_TURBO_TOKENIZER,
    "gpt-3.5-turbo-instruct": GPT_35_TURBO_TOKENIZER,
    "gpt-3.5-turbo-0125": GPT_35_TURBO_TOKENIZER,
    "gpt-3.5-turbo-1106": GPT_35_TURBO_TOKENIZER,
    "text-embedding-ada-002": TEXT_EMBEDDING_ADA_002_TOKENIZER,
    "text-embedding-3-large": TEXT_EMBEDDING_3_LARGE_TOKENIZER,
    "text-embedding-3-small": TEXT_EMBEDDING_3_SMALL_TOKENIZER,

    // p50k_base models
    "code-davinci-002": CODE_DAVINCI_002_TOKENIZER,
    "code-davinci-001": CODE_DAVINCI_002_TOKENIZER,
    "code-cushman-002": CODE_CUSHMAN_002_TOKENIZER,
    "code-cushman-001": CODE_CUSHMAN_002_TOKENIZER,
    "text-davinci-002": TEXT_DAVINCI_002_TOKENIZER,
    "text-davinci-003": TEXT_DAVINCI_003_TOKENIZER,

    // p50k_edit models
    "text-davinci-edit-001": TEXT_DAVINCI_EDIT_001_TOKENIZER,
    "code-davinci-edit-001": CODE_DAVINCI_EDIT_001_TOKENIZER,

    // r50k_base models
    "davinci": DAVINCI_TOKENIZER,
    "curie": CURIE_TOKENIZER,
    "babbage": BABBAGE_TOKENIZER,
    "ada": ADA_TOKENIZER,
};
