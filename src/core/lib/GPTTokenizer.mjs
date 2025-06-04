// noinspection SpellCheckingInspection

/**
 * @author grmartin [grmartin@engineer.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * Convert an imported module in to a solid type
 * @param m an imported module
 * @returns {TokenizerModule}
 */
const exportModule = (m) => {
    return {
        countTokens: m.countTokens, // # of tokens
        encode: m.encode,           // tokens
        decode: m.decode,           // token ids
    };
};

export const defaultValue = Symbol("*");

// Tokenizer module constants
/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const GPT_35_TURBO_TOKENIZER = () => import("gpt-tokenizer/model/gpt-3.5-turbo").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const TEXT_EMBEDDING_ADA_002_TOKENIZER = () => import("gpt-tokenizer/model/text-embedding-ada-002").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const TEXT_EMBEDDING_3_LARGE_TOKENIZER = () => import("gpt-tokenizer/model/text-embedding-3-large").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const TEXT_EMBEDDING_3_SMALL_TOKENIZER = () => import("gpt-tokenizer/model/text-embedding-3-small").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const CODE_DAVINCI_002_TOKENIZER = () => import("gpt-tokenizer/model/code-davinci-002").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const CODE_CUSHMAN_002_TOKENIZER = () => import("gpt-tokenizer/model/code-cushman-002").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const TEXT_DAVINCI_002_TOKENIZER = () => import("gpt-tokenizer/model/text-davinci-002").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const TEXT_DAVINCI_003_TOKENIZER = () => import("gpt-tokenizer/model/text-davinci-003").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const TEXT_DAVINCI_EDIT_001_TOKENIZER = () => import("gpt-tokenizer/model/text-davinci-edit-001").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const CODE_DAVINCI_EDIT_001_TOKENIZER = () => import("gpt-tokenizer/model/code-davinci-edit-001").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const DAVINCI_TOKENIZER = () => import("gpt-tokenizer/model/davinci").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const CURIE_TOKENIZER = () => import("gpt-tokenizer/model/curie").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
const BABBAGE_TOKENIZER = () => import("gpt-tokenizer/model/babbage").then(m => exportModule(m));

/**
 * @returns {Promise<TokenizerModule>}
 * @constructor
 */
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

/**
 * @typedef {Object} EncodeOptions
 * @property {Set<string>|'all'} [allowedSpecial] - A list of special tokens that are allowed in the input.
 * If set to 'all', all special tokens are allowed except those in disallowedSpecial.
 * @default undefined
 * @property {Set<string>|'all'} [disallowedSpecial] - A list of special tokens that are disallowed in the input.
 * If set to 'all', all special tokens are disallowed except those in allowedSpecial.
 * @default 'all'
 */

/**
 * @typedef {Object} ChatMessage
 * @property {'system'|'user'|'assistant'} [role] - The role of the message sender.
 * @property {string} [name] - The name of the message sender.
 * @property {string} content - The content of the message.
 */

/**
 * @func EncodeFn
 * @param {string} lineToEncode - The string to encode.
 * @param {EncodeOptions} [encodeOptions] - Optional encoding options.
 * @returns {number[]} An array of numbers representing the encoded result.
 */

/**
 * @func DecodeFn
 * @param {Iterable<number>} inputTokensToDecode - An iterable collection of numbers to decode.
 * @returns {string} The decoded string.
 */

/**
 * A function that counts tokens.
 *
 * @func CountTokensFn
 * @param {string | Iterable<ChatMessage>} input - The input string or an iterable of ChatMessage objects.
 * @param {EncodeOptions} [encodeOptions] - Optional encoding options to customize the token counting process.
 * @returns {number} The total number of tokens counted.
 */

/**
 * @typedef {Object} TokenizerModule
 * @property {CountTokensFn} countTokens - Function to count tokens in input
 * @property {DecodeFn} decode - Function to convert token IDs back to text
 * @property {EncodeFn} encode - Function to convert text to token IDs
 */
