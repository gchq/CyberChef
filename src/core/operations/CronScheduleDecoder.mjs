/**
 * @author mmustafasenoglu
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

/**
 * Cron Schedule Decoder operation
 */
class CronScheduleDecoder extends Operation {

    /**
     * CronScheduleDecoder constructor
     */
    constructor() {
        super();

        this.name = "Cron Schedule Decoder";
        this.module = "Default";
        this.description = "Decodes a standard 5-field cron expression into a human-readable description.<br><br>e.g. <code>0 0,12 1 */2 *</code> becomes <code>At minute 0 past hour 0 and 12 on day-of-month 1 in every 2nd month</code><br><br>Supports <code>*</code> (any), <code>,</code> (list), <code>-</code> (range), and <code>/</code> (step) operators in each field.";
        this.infoURL = "https://en.wikipedia.org/wiki/Cron";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if the cron expression is invalid
     */
    run(input, args) {
        const expr = input.trim();
        const parts = expr.split(/\s+/);

        if (parts.length !== 5) {
            throw new OperationError(
                `Invalid cron expression: expected 5 fields, got ${parts.length}. ` +
                `Format: minute hour day-of-month month day-of-week`
            );
        }

        const [minPart, hourPart, domPart, monthPart, dowPart] = parts;

        const minute = this.parseField(minPart, 0, 59, "minute");
        const hour = this.parseField(hourPart, 0, 23, "hour");
        const dom = this.parseField(domPart, 1, 31, "day-of-month");
        const month = this.parseField(monthPart, 1, 12, "month");
        const dow = this.parseField(dowPart, 0, 7, "day-of-week");

        if (dow.has(7)) {
            dow.add(0);
            dow.delete(7);
        }

        return this.buildDescription(minute, hour, dom, month, dow, minPart, hourPart, domPart, monthPart, dowPart);
    }

    /**
     * Parses a single cron field into a Set of valid values.
     */
    parseField(field, min, max, fieldName) {
        if (!field || field.length === 0) {
            throw new OperationError(`Empty ${fieldName} field`);
        }

        const values = new Set();

        for (const part of field.split(",")) {
            if (part.includes("/")) {
                const slashParts = part.split("/");
                if (slashParts.length !== 2) {
                    throw new OperationError(`Invalid step expression '${part}' in ${fieldName} field`);
                }
                const [rangePart, stepStr] = slashParts;
                const step = parseInt(stepStr, 10);
                if (String(step) !== stepStr || isNaN(step) || step <= 0) {
                    throw new OperationError(`Invalid step value '${stepStr}' in ${fieldName} field`);
                }

                let rangeMin = min;
                let rangeMax = max;
                if (rangePart !== "*") {
                    if (rangePart.includes("-")) {
                        const dashParts = rangePart.split("-");
                        if (dashParts.length !== 2) {
                            throw new OperationError(`Invalid range '${rangePart}' in ${fieldName} field`);
                        }
                        const [rMin, rMax] = dashParts.map(Number);
                        if (isNaN(rMin) || isNaN(rMax) || rMin < min || rMax > max || rMin > rMax) {
                            throw new OperationError(`Invalid range '${rangePart}' in ${fieldName} field`);
                        }
                        rangeMin = rMin;
                        rangeMax = rMax;
                    } else {
                        const val = parseInt(rangePart, 10);
                        if (String(val) !== rangePart || isNaN(val) || val < min || val > max) {
                            throw new OperationError(`Invalid value '${rangePart}' in ${fieldName} field`);
                        }
                        rangeMin = val;
                        rangeMax = max;
                    }
                }

                for (let i = rangeMin; i <= rangeMax; i += step) {
                    values.add(i);
                }
            } else if (part.includes("-")) {
                const dashParts = part.split("-");
                if (dashParts.length !== 2) {
                    throw new OperationError(`Invalid range '${part}' in ${fieldName} field`);
                }
                const [rMin, rMax] = dashParts.map(Number);
                if (isNaN(rMin) || isNaN(rMax) || rMin < min || rMax > max || rMin > rMax) {
                    throw new OperationError(`Invalid range '${part}' in ${fieldName} field`);
                }
                for (let i = rMin; i <= rMax; i++) {
                    values.add(i);
                }
            } else if (part === "*") {
                for (let i = min; i <= max; i++) {
                    values.add(i);
                }
            } else {
                const val = parseInt(part, 10);
                if (String(val) !== part || isNaN(val) || val < min || val > max) {
                    throw new OperationError(`Invalid value '${part}' in ${fieldName} field`);
                }
                values.add(val);
            }
        }

        if (values.size === 0) {
            throw new OperationError(`No valid values in ${fieldName} field`);
        }

        return values;
    }

    /**
     * Joins a list of strings with commas and "and" for the final item.
     */
    joinList(items) {
        if (items.length === 0) return "";
        if (items.length === 1) return items[0];
        if (items.length === 2) return items[0] + " and " + items[1];
        return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
    }

    /**
     * Builds the human-readable description from parsed fields.
     */
    buildDescription(minute, hour, dom, month, dow, minPart, hourPart, domPart, monthPart, dowPart) {
        const parts = [];

        // Minute
        if (minute.size === 60) {
            parts.push("Every minute");
        } else {
            const minStr = this.describeRange(minute, 0, 59);
            parts.push(`At minute ${minStr}`);
        }

        // Hour
        if (hour.size === 24) {
            if (minute.size < 60) parts.push("past every hour");
        } else if (hourPart !== "*") {
            if (minute.size < 60) {
                parts.push(`past hour ${this.describeRange(hour, 0, 23)}`);
            } else {
                parts.push(`past hour ${this.describeRange(hour, 0, 23)}`);
            }
        }

        // Day of month
        if (domPart !== "*") {
            if (dom.size === 1) {
                const val = dom.values().next().value;
                parts.push(`on day-of-month ${val}`);
            } else {
                parts.push(`on day-of-month ${this.describeRange(dom, 1, 31)}`);
            }
        }

        // Month
        if (monthPart !== "*") {
            if (month.size === 1) {
                const val = month.values().next().value;
                parts.push(`in ${MONTHS[val]}`);
            } else if (this.isStepField(monthPart)) {
                const step = parseInt(monthPart.split("/")[1], 10);
                parts.push(`in every ${this.ordinal(step)} month`);
            } else {
                const monthNames = [...month].sort((a, b) => a - b).map(m => MONTHS[m]);
                parts.push(`in ${this.joinList(monthNames)}`);
            }
        }

        // Day of week
        if (dowPart !== "*") {
            if (dow.size === 1) {
                const val = dow.values().next().value;
                parts.push(`on ${DAYS[val]}`);
            } else if (this.isStepField(dowPart)) {
                const step = parseInt(dowPart.split("/")[1], 10);
                parts.push(`every ${this.ordinal(step)} day of the week`);
            } else {
                const dayNames = [...dow].sort((a, b) => a - b).map(d => DAYS[d]);
                parts.push(`on ${this.joinList(dayNames)}`);
            }
        }

        return parts.join(" ") + ".";
    }

    /**
     * Describes a set of values, using range notation where possible.
     */
    describeRange(values, min, max) {
        if (values.size === (max - min + 1)) return "every " + min;
        if (values.size === 1) return values.values().next().value.toString();

        const sorted = [...values].sort((a, b) => a - b);
        const ranges = [];
        let start = sorted[0];
        let end = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === end + 1) {
                end = sorted[i];
            } else {
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                start = sorted[i];
                end = sorted[i];
            }
        }
        ranges.push(start === end ? `${start}` : `${start}-${end}`);

        return this.joinList(ranges);
    }

    /**
     * Returns the ordinal form of a number.
     */
    ordinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    /**
     * Checks if a field uses step notation.
     */
    isStepField(field) {
        return field.includes("/");
    }
}

export default CronScheduleDecoder;
