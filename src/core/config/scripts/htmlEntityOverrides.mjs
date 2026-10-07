/**
 * Canonical entity-name overrides for generateHTMLEntities.mjs.
 *
 * The WHATWG named character reference set assigns MANY names to some code
 * points (e.g. U+2211 is both &sum; and &Sum;), but does not designate a
 * canonical one. The generator therefore needs a rule to pick a single name per
 * code point for ENCODING. It uses a deterministic tiebreak (prefer a
 * lower-case name, then the shortest, then alphabetical), which reproduces the
 * historically-emitted name for ~1355 of the ~1414 encodable code points.
 *
 * This file pins the canonical name for the code points where the tiebreak
 * would otherwise change the emitted entity. Every value here is still a valid
 * WHATWG name for that code point (the generator asserts this) — these are
 * editorial choices, not correctness fixes, kept so "To HTML Entity" output
 * stays stable. Trim an entry to let the tiebreak decide instead.
 *
 * @author roberson-io [michaelroberson@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

/**
 * @constant
 * @type {Object.<number, string>}
 */
export const HTML_ENTITY_CANONICAL_OVERRIDES = {
    124: "verbar",
    168: "uml",
    177: "plusmn",
    189: "frac12",
    247: "divide",
    711: "caron",
    728: "breve",
    937: "Omega",
    949: "epsilon",
    965: "upsilon",
    977: "thetasym",
    978: "upsih",
    981: "straightphi",
    8208: "hyphen",
    8214: "Verbar",
    8230: "hellip",
    8289: "ApplyFunction",
    8290: "InvisibleTimes",
    8291: "InvisibleComma",
    8459: "hamilt",
    8461: "quaternions",
    8463: "planck",
    8465: "image",
    8472: "weierp",
    8474: "rationals",
    8476: "real",
    8477: "reals",
    8484: "integers",
    8492: "bernou",
    8499: "phmmat",
    8500: "order",
    8501: "alefsym",
    8518: "DifferentialD",
    8519: "ExponentialE",
    8520: "ImaginaryI",
    8612: "LeftTeeArrow",
    8613: "UpTeeArrow",
    8615: "DownTeeArrow",
    8624: "lsh",
    8625: "rsh",
    8660: "hArr",
    8704: "forall",
    8711: "nabla",
    8712: "isin",
    8721: "sum",
    8723: "mnplus",
    8730: "radic",
    8750: "conint",
    8768: "wreath",
    8776: "asymp",
    8781: "asympeq",
    8784: "esdot",
    8788: "colone",
    8869: "perp",
    8896: "xwedge",
    8897: "xvee",
    8902: "sstarf",
    10536: "nesear",
    10537: "seswar"
};
