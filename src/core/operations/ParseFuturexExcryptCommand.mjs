/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

const COMMANDS = {
    CAAV: "Calculate Account holder Authentication Value",
    DAPT: "Decrypt Apple Pay Token",
    DCDK: "Decrypt Cardholder Data Using DUKPT",
    DGPT: "Decrypt Google Pay Token",
    DRKI: "Identification Request",
    DRKK: "Key Request",
    DRKV: "Key Verification Request",
    DSPT: "Decrypt Samsung Pay Token",
    ECDK: "Encrypt Cardholder Data Using DUKPT",
    EMPT: "Translate PIN Block for EMV Personalization",
    EMVA: "Verify ARQC and optionally generate ARPC",
    EMVG: "Generate Master Key",
    EMVK: "Derive Key from Vendor Master Key and Derivation Data",
    EMVM: "Generate or Verify MAC",
    EMVP: "PIN Change",
    EMVR: "EMV RSA Private Key or Component Translation to Encryption Under a Personalization Key",
    EMVS: "Translate an ICC Master Key to Encryption Under a Personalization Key",
    EMVT: "EMV Translate Sensitive Data",
    GCAV: "Generate CAVV",
    GCIV: "Generate a CVC3 IV",
    GCSC: "Generate American Express CSC Value",
    GCVC: "Generate CVC and CVC2",
    GCVV: "Generate CVV or CVC Value",
    GDAC: "Generate a Data Authentication Code",
    GDCV: "Generate dCVV/CVC3",
    GDDC: "Generate Discover dynamic CVV",
    GEMC: "Generate EMV ICC Certificate",
    GEMQ: "Generate EMV Issuer CSR",
    GHMC: "Generate HCE Mobile Cryptogram",
    GHMD: "Generate HCE Magstripe Verification Value",
    GHMK: "Generate HCE Mobile Keys",
    GHPB: "Generate HMAC and PBKDF2 Obfuscated Value",
    GIDN: "Generate an ICC dynamic number",
    GMAC: "Generate Message Authentication Code",
    GNOF: "Generate New Offset",
    GOFC: "Generate Offset of Clear PIN",
    GOFF: "Generate PIN offset value",
    GOPC: "Generate Offset and EMV PIN Change",
    GPIN: "Generate PIN",
    GPMC: "General Purpose Symmetric MAC",
    GVDC: "Generate dynamic CVV",
    HMAC: "Generate MAC Hash",
    OFPC: "Perform EMV PIN Change Using Offset",
    ONGQ: "Translate PAN Encrypted Under an Asymmetric Key Pair to a Different Trusted Public Key",
    PEDK: "Key Request",
    RKHM: "Generate or Verify HMAC",
    RPIN: "PIN Change and Optional PIN Verification",
    SSAD: "Sign Static Authentication Data with Issuer Private Key",
    TCDK: "Translate Cardholder Data Using DUKPT",
    TDKD: "Translate Cardholder Data Using DUKPT and Symmetric Keys",
    TKDR: "Translate DUKPT Data to RSA with Specific Output Data",
    TPCP: "Translate Encrypted PIN Coordinates to a PEK for Generate New Map Collection",
    TPDD: "Allow an encrypted ANSI PIN block to be translated",
    TPIN: "Translate PIN blocks",
    TRPN: "Translate PIN from RSA to Symmetric PIN Block",
    TSPN: "Translate PIN from PIN block to RSA encryption",
    VAAV: "Verify Account Holder Authentication Value",
    VCAC: "Verify EMV Mastercard CAP Token",
    VCAV: "Verify Cardholder Authentication Verification Value",
    VCSC: "Verify American Express CSC Value",
    VCVC: "Verify CVC and CVC2",
    VCVV: "Verify CVV",
    VDAC: "Verify a Data Authentication Code",
    VDCV: "Verify CVC3",
    VDDC: "Verify dynamic CVC value",
    VEMI: "Verify an EMV Issuer Certificate",
    VHMC: "Verify HCE Mobile Cryptogram",
    VHMD: "Verify HCE Magstripe Verification Value",
    VIDN: "Verify an ICC dynamic number",
    VMAC: "Verify Message Authentication Code",
    VMAP: "Verify MAC and PIN",
    VPIN: "Verify PIN",
    VVDC: "Verify a dynamic CVV",
    WPIN: "Weak PIN checking",
    XPIN: "PIN translation"
};

/**
 * Parses an Excrypt field into tag/value components.
 *
 * @param {string} field
 * @returns {{raw: string, tag: string, value: string}}
 */
function parseField(field) {
    const tag = field.substring(0, Math.min(2, field.length)).toUpperCase();
    return {
        raw: field,
        tag,
        value: field.substring(tag.length)
    };
}

/**
 * Parse Futurex Excrypt command operation.
 */
class ParseFuturexExcryptCommand extends Operation {

    /**
     * ParseFuturexExcryptCommand constructor
     */
    constructor() {
        super();

        this.name = "Parse Futurex Excrypt command";
        this.module = "Payment";
        this.description = "Paste a Futurex Excrypt command or response into the input field as text.<br><br><b>General syntax:</b> Excrypt messages are enclosed by opening and closing delimiters, typically <code>[</code> and <code>]</code>. Inside the message, fields are semicolon-delimited. Each field is a tag/value pair, for example <code>AOECHO</code> where <code>AO</code> is the tag and <code>ECHO</code> is the value. The command code is commonly carried in the <code>AO</code> field.<br><br><b>Input:</b> raw Excrypt message text.<br><br>This operation parses the visible Excrypt message syntax, extracts semicolon-delimited fields, splits fields into tag/value pairs, and resolves the <code>AO</code> command code to a known payment command name when available from the Futurex payment integration guide.";
        this.inlineHelp = "<strong>Syntax:</strong> <code>[tagvalue;tagvalue;...]</code> where fields are separated by semicolons and tags are typically two characters such as <code>AO</code>.<br><strong>Input:</strong> raw Futurex Excrypt message text.";
        this.testDataSamples = [
            {
                name: "Excrypt command sample",
                input: "[AOGMAC;FS6;RV0011223344556677;]"
            }
        ];
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @returns {string}
     */
    run(input) {
        const rawInput = (input || "").replace(/\r?\n/g, "");
        if (!rawInput.length) {
            throw new OperationError("No input.");
        }

        const openingDelimiterPresent = rawInput.startsWith("[");
        const closingDelimiterPresent = rawInput.endsWith("]");
        const body = rawInput.replace(/^\[/, "").replace(/\]$/, "");
        const rawFields = body.split(";").filter(field => field.length > 0);

        if (!rawFields.length) {
            throw new OperationError("No Excrypt fields found.");
        }

        const fields = rawFields.map(parseField);
        const commandField = fields.find(field => field.tag === "AO") || fields[0];
        const commandCode = commandField.value.toUpperCase();
        const commandName = COMMANDS[commandCode] || null;
        const notes = [];

        if (!openingDelimiterPresent || !closingDelimiterPresent) {
            notes.push("Message is missing one or both expected Excrypt outer delimiters.");
        }

        if (!commandName) {
            notes.push("Command code was not found in the Futurex payment integration guide lookup.");
        }

        return JSON.stringify({
            rawInput,
            openingDelimiterPresent,
            closingDelimiterPresent,
            body,
            rawFields,
            fields,
            commandFieldTag: commandField.tag,
            commandCode,
            commandName,
            fieldCount: fields.length,
            notes
        }, null, 4);
    }
}

export default ParseFuturexExcryptCommand;
