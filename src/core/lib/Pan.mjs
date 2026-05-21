/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import OperationError from "../errors/OperationError.mjs";

const PAN_BRANDS = ["Visa", "Mastercard", "American Express", "Discover"];
const MASTERCARD_SERIES = ["Any", "5-series (51-55)", "2-series (2221-2720)"];

// ── Card classification tables ────────────────────────────────────────────────

const MII_DESCRIPTIONS = {
    "0": "ISO/TC 68 — Reserved",
    "1": "Airlines",
    "2": "Airlines and other future industry assignments",
    "3": "Travel and entertainment (American Express, Diners Club)",
    "4": "Banking and financial (Visa)",
    "5": "Banking and financial (Mastercard)",
    "6": "Merchandising and banking (Discover, Maestro)",
    "7": "Petroleum and other future industry assignments",
    "8": "Healthcare, telecommunications, and other future assignments",
    "9": "National government assignment",
};

// Best-effort card type per brand — cannot determine credit/debit/prepaid
// from the PAN alone without a BIN database lookup.
const BRAND_TYPE_HINTS = {
    "Visa": {
        likelyType: "Unknown",
        confidence: "low",
        note: "Visa issues credit, debit, and prepaid cards. The product type is determined by the issuer BIN, not the PAN prefix — a BIN database lookup is required.",
    },
    "Mastercard": {
        likelyType: "Unknown",
        confidence: "low",
        note: "Mastercard issues credit, debit, and prepaid cards. The product type is determined by the issuer BIN, not the PAN prefix — a BIN database lookup is required.",
    },
    "American Express": {
        likelyType: "Credit / Charge",
        confidence: "high",
        note: "American Express does not issue traditional debit cards. Cards in the 34/37 BIN range are charge cards or credit products.",
    },
    "Discover": {
        likelyType: "Credit",
        confidence: "medium",
        note: "The common Discover BIN ranges (6011, 644-649, 65, 622126-622925) are predominantly credit cards. Discover does offer some debit products on separate BIN ranges.",
    },
};

const PAN_BRAND_RULES = {
    "Visa": {
        lengths: [13, 16, 19],
        curatedPan: "4024140000000131",
        curatedSource: "Public Visa test PAN published in Mastercard AVS scenario documentation.",
        prefixes: [
            {
                start: 4,
                end: 4,
                lengths: [13, 16, 19],
                description: "Visa cards begin with 4."
            }
        ]
    },
    "Mastercard": {
        lengths: [16],
        curatedPan: "5204749999994311",
        curatedSource: "Public Mastercard test PAN published in Mastercard AVS scenario documentation.",
        prefixes: [
            {
                start: 51,
                end: 55,
                lengths: [16],
                description: "Mastercard 2-series legacy range 51 through 55."
            },
            {
                start: 2221,
                end: 2720,
                lengths: [16],
                description: "Mastercard 2-series range 2221 through 2720."
            }
        ]
    },
    "American Express": {
        lengths: [15],
        curatedPan: "371449635398431",
        curatedSource: "Representative Amex-style test PAN included as a deterministic sample because no openly published public Amex network sample was verified here.",
        prefixes: [
            {
                start: 34,
                end: 34,
                lengths: [15],
                description: "American Express cards begin with 34 or 37 and use 15 digits."
            },
            {
                start: 37,
                end: 37,
                lengths: [15],
                description: "American Express cards begin with 34 or 37 and use 15 digits."
            }
        ]
    },
    "Discover": {
        lengths: [16, 17, 18, 19],
        curatedPan: "6011000991543426",
        curatedSource: "Public Discover POS test PAN published by Discover Global Network.",
        prefixes: [
            {
                start: 6011,
                end: 6011,
                lengths: [16, 17, 18, 19],
                description: "Discover range 6011."
            },
            {
                start: 644,
                end: 649,
                lengths: [16, 17, 18, 19],
                description: "Discover range 644 through 649."
            },
            {
                start: 65,
                end: 65,
                lengths: [16, 17, 18, 19],
                description: "Discover range 65."
            },
            {
                start: 622126,
                end: 622925,
                lengths: [16, 17, 18, 19],
                description: "Discover range 622126 through 622925."
            }
        ]
    }
};

/**
 * Normalizes a PAN.
 *
 * @param {string} pan
 * @returns {string}
 */
function normalizePan(pan) {
    const normalized = (pan || "").replace(/\s+/g, "");
    if (!/^\d{12,19}$/.test(normalized)) {
        throw new OperationError("PAN must be 12 to 19 digits.");
    }
    return normalized;
}

/**
 * Calculates a Luhn check digit for a numeric body.
 *
 * @param {string} body
 * @returns {number}
 */
function luhnCheckDigit(body) {
    let sum = 0;
    let doubleDigit = true;

    for (let i = body.length - 1; i >= 0; i--) {
        let digit = parseInt(body.charAt(i), 10);
        if (doubleDigit) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        doubleDigit = !doubleDigit;
    }

    return (10 - (sum % 10)) % 10;
}

/**
 * Returns whether a full PAN passes Luhn validation.
 *
 * @param {string} pan
 * @returns {boolean}
 */
function isLuhnValid(pan) {
    const normalized = normalizePan(pan);
    const body = normalized.slice(0, -1);
    return luhnCheckDigit(body) === parseInt(normalized.slice(-1), 10);
}

/**
 * Returns the first matching brand rule for a PAN.
 *
 * @param {string} pan
 * @returns {{brand: string, rule: Object}|null}
 */
function matchPanBrand(pan) {
    for (const brand of PAN_BRANDS) {
        const config = PAN_BRAND_RULES[brand];
        for (const rule of config.prefixes) {
            const prefixLength = String(rule.start).length;
            if (!rule.lengths.includes(pan.length)) continue;
            const prefix = parseInt(pan.substring(0, prefixLength), 10);
            if (prefix >= rule.start && prefix <= rule.end) {
                return { brand, rule };
            }
        }
    }

    return null;
}

/**
 * Parses a PAN and returns payment-network details.
 *
 * @param {string} pan
 * @returns {Object}
 */
function parsePan(pan) {
    const normalized = normalizePan(pan);
    const match = matchPanBrand(normalized);

    const mii = normalized.charAt(0);
    const brand = match ? match.brand : null;
    const typeHint = brand ? BRAND_TYPE_HINTS[brand] : null;

    return {
        pan: normalized,
        network: brand || "Unknown",
        ...(typeHint && typeHint.confidence !== "low" ? {
            cardType: typeHint.likelyType,
            cardTypeConfidence: typeHint.confidence,
            cardTypeNote: typeHint.note,
        } : {}),
        majorIndustryIdentifier: mii,
        majorIndustryIdentifierDescription: MII_DESCRIPTIONS[mii] || "Unknown",
        issuerIdentificationNumber: normalized.substring(0, Math.min(8, normalized.length)),
        length: normalized.length,
        luhnValid: isLuhnValid(normalized),
        matchedRule: match ? {
            rangeStart: String(match.rule.start),
            rangeEnd: String(match.rule.end),
            lengths: match.rule.lengths,
            description: match.rule.description,
        } : null,
    };
}

/**
 * Appends a Luhn check digit to a numeric PAN body.
 *
 * @param {string} body
 * @returns {string}
 */
function finalizePan(body) {
    return `${body}${luhnCheckDigit(body)}`;
}

/**
 * Generates random filler digits.
 *
 * @param {number} length
 * @returns {string}
 */
function fillerDigits(length) {
    const buf = new Uint8Array(length);
    crypto.getRandomValues(buf);
    return Array.from(buf, b => b % 10).join("");
}

/**
 * Generates a random brand-valid PAN.
 *
 * @param {string} brand
 * @param {number} requestedLength
 * @param {string} mastercardSeries - "Any", "5-series (51-55)", or "2-series (2221-2720)"
 * @returns {{pan: string, prefixDescription: string}}
 */
function generateBrandPan(brand, requestedLength, mastercardSeries = "Any") {
    const config = PAN_BRAND_RULES[brand];
    if (!config) {
        throw new OperationError("Unsupported payment network.");
    }

    const length = config.lengths.includes(requestedLength) ? requestedLength : config.lengths[0];
    const eligibleRules = config.prefixes.filter(r => r.lengths.includes(length));

    let selectedRule;
    if (brand === "Mastercard") {
        if (mastercardSeries === "5-series (51-55)") {
            selectedRule = config.prefixes[0];
        } else if (mastercardSeries === "2-series (2221-2720)") {
            selectedRule = config.prefixes[1];
        } else {
            selectedRule = eligibleRules[Math.floor(Math.random() * eligibleRules.length)];
        }
    } else {
        selectedRule = eligibleRules[Math.floor(Math.random() * eligibleRules.length)];
    }

    const prefixValue = selectedRule.start + Math.floor(Math.random() * (selectedRule.end - selectedRule.start + 1));
    const prefix = String(prefixValue);
    const bodyLength = length - 1;
    const body = `${prefix}${fillerDigits(bodyLength - prefix.length)}`.substring(0, bodyLength);

    return {
        pan: finalizePan(body),
        prefixDescription: selectedRule.description
    };
}

/**
 * Generates a test PAN.
 *
 * @param {string} brand
 * @param {string} mode
 * @param {number} length
 * @param {string} mastercardSeries
 * @returns {Object}
 */
function generateTestPan(brand, mode, length, mastercardSeries = "Any") {
    const config = PAN_BRAND_RULES[brand];
    if (!config) {
        throw new OperationError("Unsupported payment network.");
    }

    if (mode === "Curated sample") {
        const parsed = parsePan(config.curatedPan);
        return {
            brand,
            mode,
            pan: config.curatedPan,
            source: config.curatedSource,
            ...parsed
        };
    }

    const generated = generateBrandPan(brand, Number(length) || config.lengths[0], mastercardSeries);
    const parsed = parsePan(generated.pan);
    return {
        brand,
        mode,
        pan: generated.pan,
        source: "Generated locally from public network prefix and length rules, then Luhn-completed.",
        generationRule: generated.prefixDescription,
        ...parsed
    };
}

export {
    PAN_BRANDS,
    MASTERCARD_SERIES,
    generateTestPan,
    isLuhnValid,
    parsePan,
};
