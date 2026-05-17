/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

// ── X9.143 (TR-31) lookup tables ─────────────────────────────────────────────

const VERSION_IDS = {
    A: "ANSI X9.24-1 (2009) — DEA, no MAC authentication (deprecated, insecure)",
    B: "ANSI X9.24-1 (2009) — TDEA, Key Derivation Binding Method",
    C: "ANSI X9.24-1 (2009) — TDEA, Key Variant Binding Method",
    D: "ANSI X9.24-2 (2017) — AES, Key Derivation Binding Method (current PCI standard)",
    R: "AS 2805.6.1 — Australian Standard extension",
};

const KEY_USAGE_CODES = {
    B0: "BDK — Base Derivation Key (DUKPT)",
    B1: "Initial DUKPT Key (IK)",
    B2: "Base Derivation Key, version 2",
    C0: "CVK — Card Verification Key",
    D0: "Symmetric Data Encryption Key (DEK)",
    D1: "Asymmetric Data Encryption Key",
    D2: "Data Decryption Key",
    E0: "EMV Issuer Master Key — Application Cryptogram",
    E1: "EMV Issuer Master Key — Secure Messaging Confidentiality",
    E2: "EMV Issuer Master Key — Secure Messaging Integrity",
    E3: "EMV Issuer Master Key — Data Authentication Code",
    E4: "EMV Issuer Master Key — Dynamic Number",
    E5: "EMV Issuer Master Key — Card Personalization",
    E6: "EMV Issuer Master Key — Session Key (DEA)",
    I0: "Initialization Value (IV) — Encryption",
    I1: "Initialization Value (IV) — MACs",
    K0: "Key Encryption or Wrapping (KEK)",
    K1: "TR-34 Asymmetric RSA Key for Key Wrapping",
    K2: "TR-31 Key Block Protection Key (KBPK)",
    K3: "DUKPT Key (Derived Unique Key Per Transaction)",
    M0: "ISO 16609 MAC — Algorithm 1 (3DEA)",
    M1: "ISO 9797-1 MAC — Algorithm 1",
    M2: "ISO 9797-1 MAC — Algorithm 2",
    M3: "ISO 9797-1 MAC — Algorithm 3",
    M4: "ISO 9797-1 MAC — Algorithm 4",
    M5: "ISO 9797-1 MAC — Algorithm 5",
    M6: "ISO 9797-1 MAC — Algorithm 6 (CMAC; PCI default for AES)",
    M7: "HMAC",
    M8: "ISO 9797-1 MAC — Algorithm 3 Padded",
    P0: "PIN Encryption",
    S0: "Asymmetric Key Pair for Digital Signature",
    S1: "Asymmetric Key Pair — CA Certificate",
    S2: "Asymmetric Key Pair — Non-X9.24",
    V0: "PIN Verification Key (PVK)",
    V1: "PIN Verification Key — IBM 3624 PIN Offset Method",
    V2: "PIN Verification Key — Visa PVV",
    V3: "PIN Verification Key — PIN Change",
    V4: "PIN Verification Key — Other",
};

const ALGORITHMS = {
    A: "AES",
    D: "DEA (Single DES) — PROHIBITED for new keys",
    E: "Elliptic Curve",
    H: "HMAC",
    R: "RSA",
    S: "DSA",
    T: "Triple DEA (3DES / TDEA)",
    "0": "Not applicable",
};

const MODES_OF_USE = {
    B: "Both Encrypt and Decrypt / Both Generate and Verify",
    C: "Combined MAC Generate and Verify",
    D: "Decrypt only",
    E: "Encrypt only",
    G: "MAC Generate only",
    N: "No restrictions / Not applicable",
    S: "Secure Messaging (Sign/Verify)",
    T: "Both Sign and Decrypt (asymmetric)",
    V: "MAC Verify only",
    X: "Key Derivation only",
    Y: "Derivation Data (e.g. session keys)",
};

const EXPORTABILITY = {
    E: "Exportable — can be wrapped under a KEK in a trusted key block",
    N: "Non-exportable",
    S: "Sensitive — exportable only to certain authorised systems",
};

const OPTIONAL_BLOCK_IDS = {
    AL: "Algorithm — algorithm override for non-standard usage",
    AT: "Asymmetric key type",
    BI: "Key block identifier",
    CT: "Certificate type",
    DA: "Derivations allowed",
    DD: "Derivation data",
    HM: "Hash algorithm for HMAC",
    IK: "Initial Key Identifier (AES DUKPT)",
    IS: "Issuer identification",
    KC: "Key check value — AES CMAC",
    KP: "Key parity / KCV",
    KS: "KSN Descriptor (DUKPT)",
    LB: "Label",
    PB: "Padding block",
    TS: "Time stamp",
    WP: "Wrapping key padding algorithm",
};

// ── Operation ─────────────────────────────────────────────────────────────────

/**
 * Parse TR-31 Key Block operation.
 */
class ParseTR31KeyBlock extends Operation {

    constructor() {
        super();

        this.name = "Parse TR-31 Key Block";
        this.module = "Payment";
        this.description = [
            "Parses a <b>TR-31</b> (ANSI X9.143) key block and decodes every header field into a human-readable description.",
            "<br><br>",
            "<b>Input:</b> Complete TR-31 key block string, with or without spaces.",
            " Enable <b>Trim leading R prefix</b> if the block begins with a transport <code>R</code>.",
            "<br><br>",
            "The 16-character fixed header layout: <code>V LLLL UU A M KK X CC RR</code>",
            "<br>",
            "<code>V</code>=version, <code>L</code>=block length, <code>U</code>=key usage, <code>A</code>=algorithm,",
            " <code>M</code>=mode of use, <code>K</code>=key version, <code>X</code>=exportability,",
            " <code>C</code>=optional block count, <code>R</code>=reserved.",
            "<br><br>",
            "<b>Version D</b> (AES Key Derivation) is the current PCI PIN standard.",
            " Versions A/B/C use TDEA or lack MAC authentication — flag for migration.",
            "<br><br>",
            "<b>References:</b> ANSI X9.143 / TR-31, PCI PIN v3.1 Req 18-3.",
        ].join("");

        this.inlineHelp = "<strong>Input:</strong> full TR-31 key block text.<br><strong>Args:</strong> enable R-prefix trim if the block starts with <code>R</code>.";

        this.testDataSamples = [
            {
                name: "AES KBPK header sample",
                input: "D0016K2AB00E0000",
                args: [true],
            },
        ];

        this.infoURL = "https://en.wikipedia.org/wiki/Key_block";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Trim leading R prefix",
                type: "boolean",
                value: true,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [trimLeadingR] = args;
        let keyBlock = (input || "").replace(/\s+/g, "").toUpperCase();
        const notes = [];
        const compliance = [];

        if (!keyBlock.length) throw new OperationError("No input.");

        if (trimLeadingR && keyBlock.startsWith("R")) {
            keyBlock = keyBlock.substring(1);
            notes.push("Removed leading R prefix.");
        }

        if (keyBlock.length < 16) throw new OperationError("Input too short for TR-31 header (need ≥16 characters).");

        const fixedHeader          = keyBlock.substring(0, 16);
        const versionId            = keyBlock[0];
        const declaredBlockLength  = parseInt(keyBlock.substring(1, 5), 10);
        const keyUsage             = keyBlock.substring(5, 7);
        const algorithm            = keyBlock[7];
        const modeOfUse            = keyBlock[8];
        const keyVersionNumber     = keyBlock.substring(9, 11);
        const exportability        = keyBlock[11];
        const optionalBlocksDeclared = parseInt(keyBlock.substring(12, 14), 10);
        const reserved             = keyBlock.substring(14, 16);

        // ── Compliance checks ───────────────────────────────────────────────
        if (versionId === "A") {
            compliance.push("HARD STOP: Version A has no MAC authentication — vulnerable to forgery; upgrade to D");
        } else if (versionId === "B" || versionId === "C") {
            compliance.push("WARN: Version B/C uses TDEA — consider migrating to AES (version D) per PCI PIN 18-3");
        } else if (versionId === "D") {
            compliance.push("OK: Version D (AES Key Derivation) — current PCI-required format");
        }

        if (algorithm === "D") {
            compliance.push("HARD STOP: Single DES (DEA) is prohibited for all new key deployments");
        }

        if (keyUsage === "P0" && algorithm === "T") {
            compliance.push("HARD STOP: Fixed TDES PIN Encryption key — prohibited since 1 January 2023 (PCI PIN Req 2-2)");
        }

        if (exportability === "E") {
            compliance.push("NOTE: Exportable key — verify the wrapping KEK is a PCI-approved key block protection key");
        }

        // ── Optional block parsing ──────────────────────────────────────────
        let offset = 16;
        let optionalBlocksParsed = 0;
        const optionalBlocks = [];

        while (optionalBlocksParsed < optionalBlocksDeclared && offset + 4 <= keyBlock.length) {
            const blockId     = keyBlock.substring(offset, offset + 2);
            const blockLength = parseInt(keyBlock.substring(offset + 2, offset + 4), 10);

            if (!Number.isFinite(blockLength) || blockLength < 4) {
                notes.push(`Stopped optional block parsing: invalid block length at offset ${offset}.`);
                break;
            }
            if (offset + blockLength > keyBlock.length) {
                notes.push(`Stopped optional block parsing: truncated block at offset ${offset}.`);
                break;
            }

            optionalBlocks.push({
                id:            blockId,
                idDescription: OPTIONAL_BLOCK_IDS[blockId] || "Unknown optional block type",
                length:        blockLength,
                value:         keyBlock.substring(offset + 4, offset + blockLength),
            });
            optionalBlocksParsed++;
            offset += blockLength;
        }

        // ── Assemble result ─────────────────────────────────────────────────
        const result = {
            raw: keyBlock,
            fixedHeader: {
                raw:                   fixedHeader,
                versionId,
                versionDescription:    VERSION_IDS[versionId] || "Unknown version ID",
                declaredBlockLength:   Number.isFinite(declaredBlockLength) ? declaredBlockLength : null,
                keyUsage,
                keyUsageDescription:   KEY_USAGE_CODES[keyUsage] || "Unknown key usage code",
                algorithm,
                algorithmDescription:  ALGORITHMS[algorithm] || "Unknown algorithm code",
                modeOfUse,
                modeOfUseDescription:  MODES_OF_USE[modeOfUse] || "Unknown mode of use",
                keyVersionNumber,
                exportability,
                exportabilityDescription: EXPORTABILITY[exportability] || "Unknown exportability code",
                optionalBlocksDeclared: Number.isFinite(optionalBlocksDeclared) ? optionalBlocksDeclared : null,
                reserved,
            },
            compliance,
            optionalBlocks,
            bodyOffset:    offset,
            remainingBody: keyBlock.substring(offset),
            notes,
        };

        if (result.fixedHeader.declaredBlockLength !== null &&
            result.fixedHeader.declaredBlockLength !== keyBlock.length) {
            result.notes.push(
                `Declared block length ${result.fixedHeader.declaredBlockLength} ` +
                `does not match actual length ${keyBlock.length}.`
            );
        }

        if (result.fixedHeader.optionalBlocksDeclared !== null &&
            result.fixedHeader.optionalBlocksDeclared !== optionalBlocks.length) {
            result.notes.push(
                `Declared ${result.fixedHeader.optionalBlocksDeclared} optional block(s) ` +
                `but parsed ${optionalBlocks.length}.`
            );
        }

        return JSON.stringify(result, null, 4);
    }
}

export default ParseTR31KeyBlock;
