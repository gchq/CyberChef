/**
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

const FIELD_CONFIGS = [
    {
        title: "Minute",
        min: 0,
        max: 59,
        singular: "minute",
        plural: "minutes",
        summaryPrefix: "At",
        detailPrefix: "at"
    },
    {
        title: "Hour",
        min: 0,
        max: 23,
        singular: "hour",
        plural: "hours",
        summaryPrefix: "past",
        detailPrefix: "at"
    },
    {
        title: "Day of month",
        min: 1,
        max: 31,
        singular: "day-of-month",
        plural: "days-of-month",
        summaryPrefix: "on",
        detailPrefix: "on"
    },
    {
        title: "Month",
        min: 1,
        max: 12,
        singular: "month",
        plural: "months",
        summaryPrefix: "in",
        detailPrefix: "in"
    },
    {
        title: "Day of week",
        min: 0,
        max: 7,
        singular: "day-of-week",
        plural: "days-of-week",
        summaryPrefix: "on",
        detailPrefix: "on"
    }
];

/**
 * Cron Expression operation
 */
class CronExpression extends Operation {

    /**
     * CronExpression constructor
     */
    constructor() {
        super();

        this.name = "Cron Expression";
        this.module = "Default";
        this.description = "Explains standard five-field cron expressions and can generate a five-field cron expression from a DateTime value. Supports comma-separated values, ranges, wildcards and step values.";
        this.infoURL = "https://wikipedia.org/wiki/Cron";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Mode",
                type: "option",
                value: ["Explain expression", "Generate expression"]
            },
            {
                name: "Input date format",
                type: "binaryString",
                value: "YYYY-MM-DD HH:mm"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const mode = args[0],
            inputFormat = args[1];

        switch (mode) {
            case "Explain expression":
                return explainExpression(input);
            case "Generate expression":
                return generateExpression(input, inputFormat);
            default:
                throw new OperationError("Unknown Cron Expression mode");
        }
    }

}

/**
 * @param {string} input
 * @returns {string}
 */
function explainExpression(input) {
    const expression = input.trim().replace(/\s+/g, " ");
    if (!expression) {
        throw new OperationError("Enter a five-field cron expression");
    }

    const fields = expression.split(" ");
    if (fields.length !== FIELD_CONFIGS.length) {
        throw new OperationError("Cron expressions must contain five fields: minute hour day-of-month month day-of-week");
    }

    const descriptions = fields.map((field, index) => describeField(field, FIELD_CONFIGS[index])),
        summaryParts = descriptions
            .filter(description => description.includeInSummary)
            .map(description => `${description.config.summaryPrefix} ${description.summary}`);

    return [
        summaryParts.join(" ") + ".",
        "",
        ...descriptions.map(description => `${description.config.title}: ${description.config.detailPrefix} ${description.detail}`)
    ].join("\n");
}

/**
 * @param {string} input
 * @param {string} inputFormat
 * @returns {string}
 */
function generateExpression(input, inputFormat) {
    const date = moment(input.trim(), inputFormat, true);

    if (!date.isValid()) {
        throw new OperationError("Input does not match the configured date format");
    }

    return [
        date.minute(),
        date.hour(),
        date.date(),
        date.month() + 1,
        "*"
    ].join(" ");
}

/**
 * @param {string} field
 * @param {Object} config
 * @returns {Object}
 */
function describeField(field, config) {
    validateFieldSyntax(field);

    if (field === "*") {
        return {
            config,
            summary: `every ${config.singular}`,
            detail: `every ${config.singular}`,
            includeInSummary: config.title !== "Day of week"
        };
    }

    const parts = field.split(",").map(part => describePart(part, config));

    return {
        config,
        summary: joinParts(parts.map(part => part.summary)),
        detail: joinParts(parts.map(part => part.detail)),
        includeInSummary: true
    };
}

/**
 * @param {string} part
 * @param {Object} config
 * @returns {Object}
 */
function describePart(part, config) {
    const [rangePart, stepPart] = part.split("/");

    if (stepPart !== undefined) {
        const step = parseNumber(stepPart, config);

        if (step < 1) {
            throw new OperationError(`${config.title} step must be a positive integer`);
        }

        if (rangePart === "*") {
            return {
                summary: `every ${ordinal(step)} ${config.singular}`,
                detail: `every ${ordinal(step)} ${config.singular}`
            };
        }

        const range = parseRange(rangePart, config);

        return {
            summary: `every ${ordinal(step)} ${config.singular} from ${range.start} through ${range.end}`,
            detail: `every ${ordinal(step)} ${config.singular} from ${range.start} through ${range.end}`
        };
    }

    if (rangePart.includes("-")) {
        const range = parseRange(rangePart, config);

        return {
            summary: `${config.plural} ${range.start} through ${range.end}`,
            detail: `${config.plural} ${range.start} through ${range.end}`
        };
    }

    const value = parseNumber(rangePart, config);
    validateBounds(value, config);

    return {
        summary: `${config.singular} ${value}`,
        detail: `${config.singular} ${value}`
    };
}

/**
 * @param {string} part
 */
function validateFieldSyntax(part) {
    const atomPattern = "(?:\\d+(?:-\\d+)?(?:\\/\\d+)?|\\*\\/\\d+)",
        fieldPattern = new RegExp(`^(?:\\*|${atomPattern}(?:,${atomPattern})*)$`);

    if (!fieldPattern.test(part)) {
        throw new OperationError(`Unsupported cron field: ${part}`);
    }
}

/**
 * @param {string} part
 * @param {Object} config
 * @returns {Object}
 */
function parseRange(part, config) {
    const [start, end] = part.split("-").map(value => parseNumber(value, config));

    validateBounds(start, config);
    validateBounds(end, config);

    if (start > end) {
        throw new OperationError(`${config.title} range start cannot be greater than range end`);
    }

    return {start, end};
}

/**
 * @param {string} value
 * @param {Object} config
 * @returns {number}
 */
function parseNumber(value, config) {
    const number = Number(value);

    if (!Number.isInteger(number)) {
        throw new OperationError(`${config.title} values must be integers`);
    }

    return number;
}

/**
 * @param {number} value
 * @param {Object} config
 */
function validateBounds(value, config) {
    if (value < config.min || value > config.max) {
        throw new OperationError(`${config.title} values must be between ${config.min} and ${config.max}`);
    }
}

/**
 * @param {string[]} parts
 * @returns {string}
 */
function joinParts(parts) {
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
}

/**
 * @param {number} value
 * @returns {string}
 */
function ordinal(value) {
    const suffix = value % 100 >= 11 && value % 100 <= 13 ? "th" : {
        1: "st",
        2: "nd",
        3: "rd"
    }[value % 10] || "th";

    return value + suffix;
}

export default CronExpression;
