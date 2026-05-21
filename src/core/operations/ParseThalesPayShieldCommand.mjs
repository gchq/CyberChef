/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

const STX = "\x02";
const ETX = "\x03";
const END_MESSAGE_DELIMITER = "\x19";

const REQUEST_COMMANDS = {
    AA: { responseCodes: ["AB"], names: ["Translate a TMK, TPK or PVK"], manualPages: [49] },
    AC: { responseCodes: ["AD"], names: ["Translate a TAK"], manualPages: [54] },
    AE: { responseCodes: ["AF"], names: ["Translate a TMK, TPK or PVK from LMK to Another TMK, TPK or PVK"], manualPages: [22] },
    AG: { responseCodes: ["AH"], names: ["Translate a TAK from LMK to TMK Encryption"], manualPages: [24] },
    AI: { responseCodes: ["AJ"], names: ["Encrypt Data Block with SEED algorithm"], manualPages: [161] },
    AK: { responseCodes: ["AL"], names: ["Decrypt Data Block with SEED algorithm"], manualPages: [163] },
    AM: { responseCodes: ["AN"], names: ["Translate Data Block with SEED algorithm"], manualPages: [165] },
    AO: { responseCodes: ["AP"], names: ["Generate Round Key from SEED Key"], manualPages: [167] },
    AS: { responseCodes: ["AT"], names: ["Generate a CVK Pair"], manualPages: [26] },
    AU: { responseCodes: ["AV"], names: ["Translate a CVK Pair from LMK to ZMK Encryption"], manualPages: [45] },
    AW: { responseCodes: ["AX"], names: ["Translate a CVK Pair from ZMK to LMK Encryption"], manualPages: [47] },
    AY: { responseCodes: ["AZ"], names: ["Translate a CVK Pair from Old LMK to New LMK Encryption"], manualPages: [44] },
    BI: { responseCodes: ["BJ"], names: ["Generate a BDK"], manualPages: [80] },
    CI: { responseCodes: ["CJ"], names: ["Translate a PIN from BDK to ZPK Encryption (DUKPT)"], manualPages: [110] },
    CK: { responseCodes: ["CL"], names: ["Verify a PIN Using the IBM Offset Method (DUKPT)"], manualPages: [112] },
    CM: { responseCodes: ["CN"], names: ["Verify a PIN Using the ABA PVV Method (DUKPT)"], manualPages: [115] },
    CO: { responseCodes: ["CP"], names: ["Verify a PIN Using the Diebold Method (DUKPT)"], manualPages: [117] },
    CQ: { responseCodes: ["CR"], names: ["Verify a PIN Using the Encrypted PIN Method (DUKPT)"], manualPages: [119] },
    DI: { responseCodes: ["DJ"], names: ["Generate and Export a KML"], manualPages: [85] },
    DK: { responseCodes: ["DL"], names: ["Import a KML"], manualPages: [87] },
    DM: { responseCodes: ["DN"], names: ["Verify Load Signature S1 and Generate Load Signature S2"], manualPages: [128] },
    DO: { responseCodes: ["DP"], names: ["Verify Load Completion Signature S3"], manualPages: [130] },
    DQ: { responseCodes: ["DR"], names: ["Verify Unload Signature S1 and Generate Unload Signature S2"], manualPages: [131] },
    DS: { responseCodes: ["DT"], names: ["Verify Unload Completion Signature S3"], manualPages: [133] },
    DW: { responseCodes: ["DX"], names: ["Translate a BDK from ZMK to LMK Encryption"], manualPages: [81] },
    DY: { responseCodes: ["DZ"], names: ["Translate a BDK from LMK to ZMK Encryption"], manualPages: [83] },
    FA: { responseCodes: ["FB"], names: ["Translate a ZPK from ZMK to LMK Encryption"], manualPages: [70] },
    FC: { responseCodes: ["FD"], names: ["Translate a TMK, TPK or PVK from ZMK to LMK Encryption"], manualPages: [52] },
    FE: { responseCodes: ["FF"], names: ["Translate a TMK, TPK or PVK from LMK to ZMK Encryption"], manualPages: [50] },
    FG: { responseCodes: ["FH"], names: ["Generate a Pair of PVKs"], manualPages: [29] },
    FI: { responseCodes: ["FJ"], names: ["Generate ZEK/ZAK"], manualPages: [32] },
    FK: { responseCodes: ["FL"], names: ["Translate a ZEK/ZAK from ZMK to LMK Encryption"], manualPages: [65] },
    FM: { responseCodes: ["FN"], names: ["Translate a ZEK/ZAK from LMK to ZMK Encryption"], manualPages: [63] },
    FO: { responseCodes: ["FP"], names: ["Generate a Watchword Key"], manualPages: [31] },
    FQ: { responseCodes: ["FR"], names: ["Translate a Watchword Key from LMK to ZMK Encryption"], manualPages: [59] },
    FS: { responseCodes: ["FT"], names: ["Translate a Watchword Key from ZMK to LMK Encryption"], manualPages: [61] },
    FU: { responseCodes: ["FV"], names: ["Verify a Watchword Response"], manualPages: [135] },
    G2: { responseCodes: ["G3"], names: ["Verify an Interchange PIN using the comparison method with SEED encryption algorithm"], manualPages: [155] },
    G4: { responseCodes: ["G5"], names: ["Verify a Terminal PIN using the comparison method with SEED encryption algorithm"], manualPages: [156] },
    G6: { responseCodes: ["G7"], names: ["Translate a PIN from one ZPK to another ZPK with SEED encryption algorithm"], manualPages: [157] },
    G8: { responseCodes: ["G9"], names: ["Translate a PIN from TPK to ZPK with SEED encryption algorithm"], manualPages: [159] },
    GC: { responseCodes: ["GD"], names: ["Translate a ZPK from LMK to ZMK Encryption"], manualPages: [68] },
    GE: { responseCodes: ["GF"], names: ["Translate a ZMK"], manualPages: [72] },
    GG: { responseCodes: ["GH"], names: ["Form a ZMK from Three ZMK Components"], manualPages: [36] },
    GY: { responseCodes: ["GZ"], names: ["Form a ZMK from 2 to 9 ZMK Components"], manualPages: [38] },
    HA: { responseCodes: ["HB"], names: ["Generate a TAK"], manualPages: [20] },
    HC: { responseCodes: ["HD"], names: ["Generate a TMK, TPK or PVK"], manualPages: [19] },
    HE: { responseCodes: ["HF"], names: ["Encrypt Data Block"], manualPages: [107] },
    HG: { responseCodes: ["HH"], names: ["Decrypt Data Block"], manualPages: [108] },
    IA: { responseCodes: ["IB"], names: ["Generate a ZPK"], manualPages: [34] },
    JS: { responseCodes: ["JT"], names: ["ARQC Verification and/or ARPC Generation (UnionPay)"], manualPages: [122] },
    JU: { responseCodes: ["JV"], names: ["Generate Secure Message with Integrity and optional Confidentiality (UnionPay)"], manualPages: [124] },
    KA: { responseCodes: ["KB"], names: ["Generate a Key Check Value (Not Double-Length ZMK)"], manualPages: [73] },
    KC: { responseCodes: ["KD"], names: ["Translate a ZPK"], manualPages: [67] },
    LK: { responseCodes: ["LL"], names: ["Generate a Decimal MAC"], manualPages: [136] },
    LM: { responseCodes: ["LN"], names: ["Verify a Decimal MAC"], manualPages: [137] },
    MA: { responseCodes: ["MB"], names: ["Generate a MAC"], manualPages: [90] },
    MC: { responseCodes: ["MD"], names: ["Verify a MAC"], manualPages: [91] },
    ME: { responseCodes: ["MF"], names: ["Verify and Translate a MAC"], manualPages: [92] },
    MG: { responseCodes: ["MH"], names: ["Translate a TAK from LMK to ZMK Encryption"], manualPages: [55] },
    MI: { responseCodes: ["MJ"], names: ["Translate a TAK from ZMK to LMK Encryption"], manualPages: [57] },
    MK: { responseCodes: ["ML"], names: ["Generate a Binary MAC"], manualPages: [98] },
    MM: { responseCodes: ["MN"], names: ["Verify a Binary MAC"], manualPages: [99] },
    MO: { responseCodes: ["MP"], names: ["Verify and Translate a Binary MAC"], manualPages: [100] },
    MQ: { responseCodes: ["MR"], names: ["Generate MAC (MAB) for Large Message"], manualPages: [94] },
    MS: { responseCodes: ["MT"], names: ["Generate MAC (MAB) using ANSI X9.19 Method for a Large Message"], manualPages: [96] },
    MU: { responseCodes: ["MV"], names: ["Generate a MAC on a Binary Message"], manualPages: [102] },
    MW: { responseCodes: ["MX"], names: ["Verify a MAC on a Binary Message"], manualPages: [104] },
    OC: { responseCodes: ["OD", "OZ"], names: ["Generate and Print a ZMK Component"], manualPages: [40] },
    OE: { responseCodes: ["OF", "OZ"], names: ["Generate and Print a TMK, TPK or PVK"], manualPages: [27] },
    R2: { responseCodes: ["R3"], names: ["Export Electronic Purse Card Key Set"], manualPages: [207] },
    RY: { responseCodes: ["RZ"], names: ["Generate a CSCK", "Export a CSCK", "Import a CSCK"], manualPages: [75, 76, 78] },
    T0: { responseCodes: ["T1"], names: ["Unlinked Load Transaction Request"], manualPages: [184] },
    T2: { responseCodes: ["T3"], names: ["Release RLSAM"], manualPages: [186] },
    T4: { responseCodes: ["T5"], names: ["Release R2LSAM"], manualPages: [187] },
    T6: { responseCodes: ["T7"], names: ["Verify RCEP"], manualPages: [188] },
    TA: { responseCodes: ["TB", "TZ"], names: ["Print TMK Mailer"], manualPages: [42] },
    U0: { responseCodes: ["U1"], names: ["Decrypt R1 and validate the MACLSAM"], manualPages: [169] },
    U2: { responseCodes: ["U3"], names: ["Compute HCEP"], manualPages: [171] },
    U4: { responseCodes: ["U5"], names: ["Validate the S1 MAC (Load and Unload)"], manualPages: [172] },
    U6: { responseCodes: ["U7"], names: ["Validate the S1 MAC (Currency Exchange)"], manualPages: [174] },
    U8: { responseCodes: ["U9"], names: ["Generate the S2 MAC (Linked load, declined unlinked load, unload)"], manualPages: [176] },
    V0: { responseCodes: ["V1"], names: ["Generate the S2 MAC (Currency Exchange)"], manualPages: [177] },
    V2: { responseCodes: ["V3"], names: ["Generate the S2 MAC (Approved Unlinked Load)"], manualPages: [178] },
    V4: { responseCodes: ["V5"], names: ["Validate the S3 MAC (Currency Exchange transactions)"], manualPages: [179] },
    V6: { responseCodes: ["V7"], names: ["Validate the S3 MAC (Load or Unload transactions)"], manualPages: [181] },
    V8: { responseCodes: ["V9"], names: ["Validate the H2LSAM"], manualPages: [183] },
    W0: { responseCodes: ["W1"], names: ["Validate S6 MAC"], manualPages: [189] },
    W2: { responseCodes: ["W3"], names: ["Validate S6' MAC"], manualPages: [190] },
    W4: { responseCodes: ["W5"], names: ["Validate S6'' MAC"], manualPages: [191] },
    W6: { responseCodes: ["W7"], names: ["Validate S5',DLT MAC"], manualPages: [192] },
    W8: { responseCodes: ["W9"], names: ["Validate S5',ISS MAC"], manualPages: [193] },
    X0: { responseCodes: ["X1"], names: ["Validate the S4 MAC (Old Terminals)"], manualPages: [194] },
    X2: { responseCodes: ["X3"], names: ["Validate the S4 MAC (New Terminals)"], manualPages: [195] },
    X4: { responseCodes: ["X5"], names: ["Validate the S5 MAC (Old Terminals)"], manualPages: [196] },
    X6: { responseCodes: ["X7"], names: ["Validate the S5' MAC (MAC of the PSAM for a Transaction) (New Terminals)"], manualPages: [197] },
    X8: { responseCodes: ["X9"], names: ["Validate the S5 Variant MAC (MAC of the PSAM for an Issuer Total) (New Terminals)"], manualPages: [199] },
    XK: { responseCodes: ["XL"], names: ["Verify PIN Block from Internet and Verify MAC"], manualPages: [140] },
    XM: { responseCodes: ["XN"], names: ["Verify PIN Block from Internet, Verify MAC & Return New Encrypted PIN"], manualPages: [142] },
    XO: { responseCodes: ["XP"], names: ["Verify MAC"], manualPages: [144] },
    XQ: { responseCodes: ["XR"], names: ["Generate MAC"], manualPages: [146] },
    XS: { responseCodes: ["XT"], names: ["Translate PIN Block from Internet, Verify MAC and Optionally Generate a MAC"], manualPages: [148] },
    XU: { responseCodes: ["XV"], names: ["Decrypt Data"], manualPages: [150] },
    XW: { responseCodes: ["XX"], names: ["Encrypt Data"], manualPages: [152] },
    Y0: { responseCodes: ["Y1"], names: ["Create the Acknowledgement MAC (Old Terminals)"], manualPages: [201] },
    Y2: { responseCodes: ["Y3"], names: ["Create the Acknowledgement MAC (New Terminals)"], manualPages: [202] },
    Y4: { responseCodes: ["Y5"], names: ["Create the Update MAC"], manualPages: [203] },
    Y6: { responseCodes: ["Y7"], names: ["Validate the SADMIN MAC (Administrative MAC of the PSAM)"], manualPages: [204] },
    Y8: { responseCodes: ["Y9"], names: ["Create the Merchant Acquirer MAC"], manualPages: [205] },
    Z0: { responseCodes: ["Z1"], names: ["Validate the Card Issuer MAC"], manualPages: [206] },
};

const RESPONSE_COMMANDS = Object.entries(REQUEST_COMMANDS).reduce((responses, [requestCode, details]) => {
    details.responseCodes.forEach((responseCode) => {
        if (!responses[responseCode]) {
            responses[responseCode] = {
                requestCodes: [],
                names: [],
                manualPages: []
            };
        }

        responses[responseCode].requestCodes.push(requestCode);
        details.names.forEach((name) => {
            if (!responses[responseCode].names.includes(name)) {
                responses[responseCode].names.push(name);
            }
        });
        details.manualPages.forEach((page) => {
            if (!responses[responseCode].manualPages.includes(page)) {
                responses[responseCode].manualPages.push(page);
            }
        });
    });
    return responses;
}, {});

/**
 * Parses transport framing and trailer fields from a payShield message.
 *
 * @param {string} input
 * @returns {{message: string, framing: object, messageTrailer: string}}
 */
function parseTransport(input) {
    let message = input;
    const framing = {
        stxPresent: false,
        etxPresent: false,
        endMessageDelimiterPresent: false
    };

    if (message.startsWith(STX)) {
        framing.stxPresent = true;
        message = message.substring(1);
    }

    if (message.endsWith(ETX)) {
        framing.etxPresent = true;
        message = message.substring(0, message.length - 1);
    }

    let messageTrailer = "";
    const endMessageIndex = message.lastIndexOf(END_MESSAGE_DELIMITER);
    if (endMessageIndex !== -1) {
        framing.endMessageDelimiterPresent = true;
        messageTrailer = message.substring(endMessageIndex + 1);
        message = message.substring(0, endMessageIndex);
    }

    return { message, framing, messageTrailer };
}

/**
 * Resolves request/response metadata for a command code.
 *
 * @param {string} commandCode
 * @returns {{commandCodeType: string, commandNames: string[], expectedResponseCodes: string[], requestCodes: string[], manualPages: number[]}}
 */
function resolveCommandMetadata(commandCode) {
    if (REQUEST_COMMANDS[commandCode]) {
        return {
            commandCodeType: "request",
            commandNames: REQUEST_COMMANDS[commandCode].names,
            expectedResponseCodes: REQUEST_COMMANDS[commandCode].responseCodes,
            requestCodes: [commandCode],
            manualPages: REQUEST_COMMANDS[commandCode].manualPages
        };
    }

    if (RESPONSE_COMMANDS[commandCode]) {
        return {
            commandCodeType: "response",
            commandNames: RESPONSE_COMMANDS[commandCode].names,
            expectedResponseCodes: [commandCode],
            requestCodes: RESPONSE_COMMANDS[commandCode].requestCodes,
            manualPages: RESPONSE_COMMANDS[commandCode].manualPages
        };
    }

    return {
        commandCodeType: "unknown",
        commandNames: [],
        expectedResponseCodes: [],
        requestCodes: [],
        manualPages: []
    };
}

/**
 * Parses an optional trailing LMK identifier segment from a command payload.
 *
 * @param {string} payload
 * @returns {{payload: string, lmkIdentifier: string|null, lmkIdentifierDelimiterPresent: boolean, tildeDelimiterPresent: boolean}}
 */
function parseTrailingLmkIdentifier(payload) {
    const match = payload.match(/^(.*?)(~)?%([0-9]{2})$/);
    if (!match) {
        return {
            payload,
            lmkIdentifier: null,
            lmkIdentifierDelimiterPresent: false,
            tildeDelimiterPresent: false
        };
    }

    return {
        payload: match[1],
        lmkIdentifier: match[3],
        lmkIdentifierDelimiterPresent: true,
        tildeDelimiterPresent: Boolean(match[2])
    };
}

/**
 * Parse Thales payShield host command operation.
 */
class ParseThalesPayShieldCommand extends Operation {

    /**
     * ParseThalesPayShieldCommand constructor
     */
    constructor() {
        super();

        this.name = "HSM Parse Thales Command";
        this.module = "Payment";
        this.description = "Paste a Thales payShield 10K legacy host command or response into the input field as text.<br><br><b>Scope:</b> This operation performs syntax parsing only. It identifies framing delimiters, splits the header, command code, payload, LMK suffix, and message trailer into labelled fields. It does not interpret, validate, or execute the command payload — field values, key material, and transaction semantics are not checked.<br><br><b>General syntax:</b> optional <code>STX</code>, then <code>m</code> header characters, then a 2-character command or response code, then the command payload, then optionally an LMK suffix such as <code>%nn</code> or <code>~%nn</code>, then optionally <code>X'19'</code> and a message trailer, then optional <code>ETX</code>.<br><br><b>Input:</b> raw command text, optionally including STX/ETX framing, message header, X'19' end-message delimiter, and message trailer.<br><b>Arguments:</b> provide the configured message-header length.";
        this.inlineHelp = "<strong>Scope:</strong> syntax parser only — field values are split and labelled but not validated or executed.<br><strong>Syntax:</strong> <code>[STX][header m][code 2][payload][~][%nn][EM trailer-delimiter][trailer][ETX]</code>.<br><strong>Input:</strong> raw payShield command or response text.<br><strong>Args:</strong> set the message-header length configured on the HSM link.";
        this.testDataSamples = [
            {
                name: "Encrypt Data Block with header and trailer",
                input: "\u0002HEADHE0123456789ABCDEF0011223344556677%00\u0019TAIL\u0003",
                args: [4]
            }
        ];
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Message header length",
                type: "number",
                value: 0,
                min: 0,
                max: 64,
                comment: "Number of characters at the start of the message that should be treated as the transport header (<code>m A</code> in the manual)."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [messageHeaderLength] = args;
        const rawInput = input || "";
        const notes = [];

        if (!rawInput.length) {
            throw new OperationError("No input.");
        }

        const { message, framing, messageTrailer } = parseTransport(rawInput.replace(/\r?\n/g, ""));
        if (message.length < messageHeaderLength + 2) {
            throw new OperationError("Input is too short for the configured message header length plus command code.");
        }

        const messageHeader = message.substring(0, messageHeaderLength);
        const commandCode = message.substring(messageHeaderLength, messageHeaderLength + 2).toUpperCase();
        const payloadWithSuffixes = message.substring(messageHeaderLength + 2);
        const lmk = parseTrailingLmkIdentifier(payloadWithSuffixes);
        const metadata = resolveCommandMetadata(commandCode);

        if (metadata.commandCodeType === "unknown") {
            notes.push("Command code was not found in the payShield 10K Legacy Host Commands manual lookup.");
        }

        const result = {
            rawInput,
            framing,
            normalizedMessage: message,
            messageHeaderLength,
            messageHeader,
            commandCode,
            commandCodeType: metadata.commandCodeType,
            commandNames: metadata.commandNames,
            requestCodes: metadata.requestCodes,
            expectedResponseCodes: metadata.expectedResponseCodes,
            manualPages: metadata.manualPages,
            payload: lmk.payload,
            payloadLength: lmk.payload.length,
            lmkIdentifier: lmk.lmkIdentifier,
            lmkIdentifierDelimiterPresent: lmk.lmkIdentifierDelimiterPresent,
            tildeDelimiterPresentBeforeLmkIdentifier: lmk.tildeDelimiterPresent,
            messageTrailer,
            notes
        };

        return JSON.stringify(result, null, 4);
    }
}

export default ParseThalesPayShieldCommand;
