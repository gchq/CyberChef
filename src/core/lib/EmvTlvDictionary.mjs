/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 *
 * EMV tag dictionary covering EMV Books 1-4, EMVCo contactless, Nexo, and
 * common acquirer/terminal tags. Each entry carries metadata used by the
 * Parse EMV TLV operation.
 *
 * Sources: EMV Book 1 §A; EMV Book 3 §A; Nexo FAST 3.x; ISO 8583 DE 55 common tags.
 */

/**
 * Tag source abbreviations:
 *   "ICC"  — generated or maintained by the card
 *   "T"    — generated or maintained by the terminal
 *   "Both" — may originate from either
 *   "Host" — generated or maintained by the issuer host
 */

/**
 * Value format codes (EMV Book 3, Annex A):
 *   "a"    — alphabetic
 *   "an"   — alphanumeric
 *   "ans"  — alphanumeric special
 *   "b"    — binary
 *   "cn"   — compressed numeric (BCD)
 *   "n"    — numeric (BCD)
 *   "var"  — variable / scheme-specific
 */

const EMV_TAG_DICTIONARY = {
    // ── File Control Information ───────────────────────────────────────────────
    "6F": { name: "File Control Information (FCI) Template",     constructed: true,  source: "ICC",  format: "b",   class: "Application" },
    "A5": { name: "FCI Proprietary Template",                    constructed: true,  source: "ICC",  format: "b",   class: "Context-Specific" },
    "BF0C":{ name: "FCI Issuer Discretionary Data",             constructed: true,  source: "ICC",  format: "b",   class: "Private" },

    // ── Record / Response Templates ────────────────────────────────────────────
    "70": { name: "Record Template",                             constructed: true,  source: "ICC",  format: "b",   class: "Application" },
    "71": { name: "Issuer Script Template 1",                    constructed: true,  source: "Host", format: "b",   class: "Application" },
    "72": { name: "Issuer Script Template 2",                    constructed: true,  source: "Host", format: "b",   class: "Application" },
    "77": { name: "Response Message Template Format 2",          constructed: true,  source: "ICC",  format: "b",   class: "Application" },
    "80": { name: "Response Message Template Format 1",          constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "83": { name: "Command Template",                            constructed: false, source: "T",    format: "b",   class: "Context-Specific" },

    // ── Application Labels / Identifiers ───────────────────────────────────────
    "4F": { name: "Application Identifier (AID)",               constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "50": { name: "Application Label",                           constructed: false, source: "ICC",  format: "an",  class: "Application" },
    "84": { name: "Dedicated File (DF) Name",                   constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "87": { name: "Application Priority Indicator",             constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "9D": { name: "Directory Definition File (DDF) Name",       constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F06": { name: "Application Identifier (AID) — Terminal",  constructed: false, source: "T",    format: "b",   class: "Application" },
    "9F11": { name: "Issuer Code Table Index",                   constructed: false, source: "ICC",  format: "n",   class: "Application" },
    "9F12": { name: "Application Preferred Name",               constructed: false, source: "ICC",  format: "ans", class: "Application" },
    "9F38": { name: "Processing Options Data Object List (PDOL)",constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F4D": { name: "Log Entry",                                 constructed: false, source: "ICC",  format: "b",   class: "Application" },

    // ── Card / Cardholder Data ─────────────────────────────────────────────────
    "5A": { name: "Application PAN",                             constructed: false, source: "ICC",  format: "cn",  class: "Application" },
    "56": { name: "Track 1 Equivalent Data",                     constructed: false, source: "ICC",  format: "ans", class: "Application" },
    "57": { name: "Track 2 Equivalent Data",                     constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "5F20": { name: "Cardholder Name",                           constructed: false, source: "ICC",  format: "ans", class: "Application" },
    "5F24": { name: "Application Expiry Date (YYMMDD)",          constructed: false, source: "ICC",  format: "n",   class: "Application" },
    "5F25": { name: "Application Effective Date (YYMMDD)",       constructed: false, source: "ICC",  format: "n",   class: "Application" },
    "5F28": { name: "Issuer Country Code",                       constructed: false, source: "ICC",  format: "n",   class: "Application" },
    "5F2D": { name: "Language Preference",                       constructed: false, source: "ICC",  format: "an",  class: "Application" },
    "5F30": { name: "Service Code",                              constructed: false, source: "ICC",  format: "n",   class: "Application" },
    "5F34": { name: "Application PAN Sequence Number",           constructed: false, source: "ICC",  format: "n",   class: "Application" },

    // ── Transaction Amount / Currency ──────────────────────────────────────────
    "5F2A": { name: "Transaction Currency Code",                 constructed: false, source: "T",    format: "n",   class: "Application" },
    "5F36": { name: "Transaction Currency Exponent",             constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F02": { name: "Amount, Authorised",                        constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F03": { name: "Amount, Other",                             constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F04": { name: "Amount, Other (Binary)",                    constructed: false, source: "T",    format: "b",   class: "Application" },

    // ── Transaction Identification ─────────────────────────────────────────────
    "9A":   { name: "Transaction Date",                          constructed: false, source: "T",    format: "n",   class: "Application" },
    "9C":   { name: "Transaction Type",                          constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F21": { name: "Transaction Time",                          constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F37": { name: "Unpredictable Number",                      constructed: false, source: "T",    format: "b",   class: "Application" },
    "9F41": { name: "Transaction Sequence Counter",              constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F7C": { name: "Merchant Custom Data",                      constructed: false, source: "T",    format: "b",   class: "Application" },

    // ── Terminal Data ──────────────────────────────────────────────────────────
    "9F1A": { name: "Terminal Country Code",                     constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F33": { name: "Terminal Capabilities",                     constructed: false, source: "T",    format: "b",   class: "Application" },
    "9F35": { name: "Terminal Type",                             constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F40": { name: "Additional Terminal Capabilities",          constructed: false, source: "T",    format: "b",   class: "Application" },
    "9F1B": { name: "Terminal Floor Limit",                      constructed: false, source: "T",    format: "b",   class: "Application" },
    "9F1C": { name: "Terminal Identification",                   constructed: false, source: "T",    format: "an",  class: "Application" },
    "9F1D": { name: "Terminal Risk Management Data",             constructed: false, source: "T",    format: "b",   class: "Application" },
    "9F1E": { name: "Interface Device (IFD) Serial Number",      constructed: false, source: "T",    format: "an",  class: "Application" },
    "9F15": { name: "Merchant Category Code",                    constructed: false, source: "T",    format: "n",   class: "Application" },
    "9F16": { name: "Merchant Identifier",                       constructed: false, source: "T",    format: "ans", class: "Application" },

    // ── Cryptographic Data ─────────────────────────────────────────────────────
    "82":   { name: "Application Interchange Profile (AIP)",     constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "9F26": { name: "Application Cryptogram (ARQC/TC/AAC)",      constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F27": { name: "Cryptogram Information Data (CID)",         constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F36": { name: "Application Transaction Counter (ATC)",     constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F10": { name: "Issuer Application Data (IAD)",             constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F4B": { name: "Signed Dynamic Application Data",           constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F4C": { name: "ICC Dynamic Number",                        constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F45": { name: "Data Authentication Code",                  constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F4A": { name: "Static Data Authentication Tag List",       constructed: false, source: "ICC",  format: "b",   class: "Application" },

    // ── Risk Management ────────────────────────────────────────────────────────
    "95":   { name: "Terminal Verification Results (TVR)",       constructed: false, source: "T",    format: "b",   class: "Application" },
    "9B":   { name: "Transaction Status Information (TSI)",      constructed: false, source: "Both", format: "b",   class: "Application" },
    "9F0D": { name: "Issuer Action Code — Default",              constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F0E": { name: "Issuer Action Code — Denial",               constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F0F": { name: "Issuer Action Code — Online",               constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F07": { name: "Application Usage Control",                 constructed: false, source: "ICC",  format: "b",   class: "Application" },

    // ── CDOL / Script ──────────────────────────────────────────────────────────
    "8C":   { name: "Card Risk Management Data Object List 1 (CDOL1)", constructed: false, source: "ICC", format: "b", class: "Context-Specific" },
    "8D":   { name: "Card Risk Management Data Object List 2 (CDOL2)", constructed: false, source: "ICC", format: "b", class: "Context-Specific" },
    "86":   { name: "Issuer Script Command",                     constructed: false, source: "Host", format: "b",   class: "Context-Specific" },
    "9F18": { name: "Issuer Script Identifier",                  constructed: false, source: "Host", format: "b",   class: "Application" },

    // ── CVM ────────────────────────────────────────────────────────────────────
    "8E":   { name: "Cardholder Verification Method (CVM) List", constructed: false, source: "ICC", format: "b",   class: "Context-Specific" },
    "9F34": { name: "CVM Results",                               constructed: false, source: "T",    format: "b",   class: "Application" },

    // ── Short File Identifier / AFL ───────────────────────────────────────────
    "88":   { name: "Short File Identifier (SFI)",               constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "94":   { name: "Application File Locator (AFL)",            constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "8F":   { name: "Certification Authority Public Key Index",   constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },

    // ── Issuer / Online Auth ───────────────────────────────────────────────────
    "89":   { name: "Authorization Code",                        constructed: false, source: "Host", format: "an",  class: "Context-Specific" },
    "8A":   { name: "Authorization Response Code",               constructed: false, source: "Host", format: "an",  class: "Context-Specific" },
    "91":   { name: "Issuer Authentication Data",                constructed: false, source: "Host", format: "b",   class: "Context-Specific" },
    "9F08": { name: "Application Version Number — ICC",          constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F09": { name: "Application Version Number — Terminal",     constructed: false, source: "T",    format: "b",   class: "Application" },
    "9F0B": { name: "Cardholder Name Extended",                  constructed: false, source: "ICC",  format: "ans", class: "Application" },
    "9F0C": { name: "Issuer Country Code (alpha2)",              constructed: false, source: "ICC",  format: "a",   class: "Application" },
    "9F13": { name: "Last Online ATC Register",                  constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F14": { name: "Lower Consecutive Offline Limit",           constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F23": { name: "Upper Consecutive Offline Limit",           constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F17": { name: "PIN Try Counter",                           constructed: false, source: "ICC",  format: "b",   class: "Application" },

    // ── Public Key Data ────────────────────────────────────────────────────────
    "90":   { name: "Issuer Public Key Certificate",             constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "92":   { name: "Issuer Public Key Remainder",               constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "93":   { name: "Signed Static Application Data",            constructed: false, source: "ICC",  format: "b",   class: "Context-Specific" },
    "9F2D": { name: "ICC PIN Encipherment Public Key Certificate",constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F2E": { name: "ICC PIN Encipherment Public Key Exponent",  constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F2F": { name: "ICC PIN Encipherment Public Key Remainder",  constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F32": { name: "Issuer Public Key Exponent",                constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F46": { name: "ICC Public Key Certificate",                constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F47": { name: "ICC Public Key Exponent",                   constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F48": { name: "ICC Public Key Remainder",                  constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "9F49": { name: "Dynamic Data Authentication Data Object List (DDOL)", constructed: false, source: "ICC", format: "b", class: "Application" },

    // ── Contactless (EMVCo Book C / MSD) ──────────────────────────────────────
    "9F6D": { name: "Mag-Stripe Application Version Number — Reader", constructed: false, source: "T",  format: "b", class: "Application" },
    "9F6E": { name: "Third Party Data",                          constructed: false, source: "T",    format: "b",   class: "Application" },
    "9F7D": { name: "Application Capabilities Information",      constructed: false, source: "ICC",  format: "b",   class: "Application" },
    "DF8117": { name: "Card Data Input Capability",              constructed: false, source: "T",    format: "b",   class: "Private" },

    // ── Directory ──────────────────────────────────────────────────────────────
    "61":   { name: "Application Template",                      constructed: true,  source: "ICC",  format: "b",   class: "Application" },
    "73":   { name: "Directory Discretionary Template",          constructed: true,  source: "ICC",  format: "b",   class: "Application" },
};

export default EMV_TAG_DICTIONARY;
