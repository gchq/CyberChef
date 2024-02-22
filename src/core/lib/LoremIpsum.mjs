/**
 * Lorem Ipsum generator.
 *
 * @author Klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/**
 * Generate lorem ipsum paragraphs.
 *
 * @param {number} length
 * @returns {string}
 */
export function GenerateParagraphs(length=3) {
    const paragraphs = [];
    while (paragraphs.length < length) {
        const paragraphLength = getRandomLength(PARAGRAPH_LENGTH_MEAN, PARAGRAPH_LENGTH_STD_DEV);
        const sentences = [];
        while (sentences.length < paragraphLength) {
            const sentenceLength = getRandomLength(SENTENCE_LENGTH_MEAN, SENTENCE_LENGTH_STD_DEV);
            const sentence = getWords(sentenceLength);
            sentences.push(formatSentence(sentence));
        }
        paragraphs.push(formatParagraph(sentences));
    }
    paragraphs[paragraphs.length-1] = paragraphs[paragraphs.length-1].slice(0, -2);
    paragraphs[0] = replaceStart(paragraphs[0]);
    return paragraphs.join("");
}


/**
 * Generate lorem ipsum sentences.
 *
 * @param {number} length
 * @returns {string}
 */
export function GenerateSentences(length=3) {
    const sentences = [];
    while (sentences.length < length) {
        const sentenceLength = getRandomLength(SENTENCE_LENGTH_MEAN, SENTENCE_LENGTH_STD_DEV);
        const sentence = getWords(sentenceLength);
        sentences.push(formatSentence(sentence));
    }
    const paragraphs = sentencesToParagraphs(sentences);
    return paragraphs.join("");
}


/**
 * Generate lorem ipsum words.
 *
 * @param {number} length
 * @returns {string}
 */
export function GenerateWords(length=3) {
    const words = getWords(length);
    const sentences = wordsToSentences(words);
    const paragraphs = sentencesToParagraphs(sentences);
    return paragraphs.join("");
}


/**
 * Generate lorem ipsum bytes.
 *
 * @param {number} length
 * @returns {string}
 */
export function GenerateBytes(length=3) {
    const str = GenerateWords(length/3);
    return str.slice(0, length);
}


/**
 * Get array of randomly selected words from the lorem ipsum wordList.
 *
 * @param {number} length
 * @returns {string[]}
 * @private
 */
function getWords(length=3) {
    const words = [];
    let word;
    let previousWord;
    while (words.length < length) {
        do {
            word = wordList[Math.floor(Math.random() * wordList.length)];
        } while (previousWord === word);
        words.push(word);
        previousWord = word;
    }
    return words;
}


/**
 * Convert an array of words into an array of sentences
 *
 * @param {string[]} words
 * @returns {string[]}
 * @private
 */
function wordsToSentences(words) {
    const sentences = [];
    while (words.length > 0) {
        const sentenceLength = getRandomLength(SENTENCE_LENGTH_MEAN, SENTENCE_LENGTH_STD_DEV);
        if (sentenceLength <= words.length) {
            sentences.push(formatSentence(words.splice(0, sentenceLength)));
        } else {
            sentences.push(formatSentence(words.splice(0, words.length)));
        }
    }
    return sentences;
}


/**
 * Convert an array of sentences into an array of paragraphs
 *
 * @param {string[]} sentences
 * @returns {string[]}
 * @private
 */
function sentencesToParagraphs(sentences) {
    const paragraphs = [];
    while (sentences.length > 0) {
        const paragraphLength = getRandomLength(PARAGRAPH_LENGTH_MEAN, PARAGRAPH_LENGTH_STD_DEV);
        paragraphs.push(formatParagraph(sentences.splice(0, paragraphLength)));
    }
    paragraphs[paragraphs.length-1] = paragraphs[paragraphs.length-1].slice(0, -1);
    paragraphs[0] = replaceStart(paragraphs[0]);
    return paragraphs;
}


/**
 * Format an array of words into a sentence.
 *
 * @param {string[]} words
 * @returns {string}
 * @private
 */
function formatSentence(words) {
    // 0.35 chance of a  comma being added randomly to the sentence.
    if (Math.random() < PROBABILITY_OF_A_COMMA) {
        const pos = Math.round(Math.random()*(words.length-1));
        words[pos] +=",";
    }
    let sentence = words.join(" ");
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    sentence += ".";
    return sentence;
}


/**
 * Format an array of sentences into a paragraph.
 *
 * @param {string[]} sentences
 * @returns {string}
 * @private
 */
function formatParagraph(sentences) {
    let paragraph = sentences.join(" ");
    paragraph += "\n\n";
    return paragraph;
}


/**
 * Get a random number based on a mean and standard deviation.
 *
 * @param {number} mean
 * @param {number} stdDev
 * @returns {number}
 * @private
 */
function getRandomLength(mean, stdDev) {
    let length;
    do {
        length =  Math.round((Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)*stdDev+mean);
    } while (length <= 0);
    return length;
}


/**
 * Replace first 5 words with "Lorem ipsum dolor sit amet"
 *
 * @param {string[]} str
 * @returns {string[]}
 * @private
 */
function replaceStart(str) {
    let words = str.split(" ");
    if (words.length > 5) {
        words.splice(0, 5, "Lorem", "ipsum", "dolor", "sit", "amet");
        return words.join(" ");
    } else {
        const lorem = ["Lorem", "ipsum", "dolor", "sit", "amet"];
        words = lorem.slice(0, words.length);
        str = words.join(" ");
        str += ".";
        return str;
    }
}


const SENTENCE_LENGTH_MEAN = 15;
const SENTENCE_LENGTH_STD_DEV = 9;
const PARAGRAPH_LENGTH_MEAN = 5;
const PARAGRAPH_LENGTH_STD_DEV = 2;
const PROBABILITY_OF_A_COMMA = 0.35;

const wordList = [
    "ad", "adipisicing", "aliqua", "aliquip", "amet", "anim",
    "aute", "cillum", "commodo", "consectetur", "consequat", "culpa",
    "cupidatat", "deserunt", "do", "dolor", "dolore", "duis",
    "ea", "eiusmod", "elit", "enim", "esse", "est",
    "et", "eu", "ex", "excepteur", "exercitation", "fugiat",
    "id", "in", "incididunt", "ipsum", "irure", "labore",
    "laboris", "laborum", "Lorem", "magna", "minim", "mollit",
    "nisi", "non", "nostrud", "nulla", "occaecat", "officia",
    "pariatur", "proident", "qui", "quis", "reprehenderit", "sint",
    "sit", "sunt", "tempor", "ullamco", "ut", "velit",
    "veniam", "voluptate",
];
