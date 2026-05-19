# Payment Recipe Starters

Owner:
- Jacob Marks, `https://jacobmarks.com`
- Fork home: `https://github.com/J8k3/CyberChef`

These recipe starters are for software-only payment-crypto emulation, inspection, regression tests, and interoperability work.


## Naming Convention

All payment operation display names follow **Title Case** throughout. Acronyms (DUKPT, AES, EMV, MAC, PAN, PVV, KCV, ARQC, ARPC, TR-31, TR-34) are always upper-case. Brand names retain their canonical capitalisation (`payShield`).

Pattern: `[Domain Prefix] [Verb] [Qualifier]`
- Domain prefixes: EMV, DUKPT, PIN Block, PIN Data, PAN, Card Validation Data, VISA PVV, IBM 3624, AS2805, HSM, Payment, MAC, Key, TR-31, TR-34
- Verbs: Generate, Verify, Parse, Build, Translate, Derive, Calculate, Encrypt, Decrypt, Re-Encrypt
- The prefix comes first so operations sort and scan by topic in the UI list
- Only operations authored in this fork belong in the Payments category — do not add upstream CyberChef ops
- When adding a new payment operation, follow this pattern and update this file.

## UI Arrangement

The `Payments` category is sorted alphabetically. The domain-prefix naming convention means related operations naturally cluster together in the list (all EMV ops together, all PIN Block ops together, etc.).

## 1) Encrypt / Decrypt / Re-Encrypt Payment Data

Operations:
- `Payment Encrypt Data`
- `Payment Decrypt Data`
- `Payment Re-Encrypt Data`

Use this when:
- you want payment-facing names for AES, TDES, or the implemented DUKPT-TDES profiles
- you want one operation for decrypt-then-encrypt rewrapping

Input:
- plaintext or ciphertext in the selected input format

Important assumptions:
- current derived-data coverage is AES, TDES, and the implemented DUKPT-TDES profiles
- this is software emulation and does not model AWS key ARNs or HSM custody

## 2) Generate / Verify Payment MAC

Operations:
- `MAC Generate`
- `MAC Verify`

Supported methods:
- `HMAC SHA-224`
- `HMAC SHA-256`
- `HMAC SHA-384`
- `HMAC SHA-512`
- `AES-CMAC`
- `TDES-CMAC`
- `ISO 9797-1 Algorithm 1`
- `ISO 9797-1 Algorithm 3`
- `AS2805-4.1`
- `DUKPT MAC Request CMAC`
- `DUKPT MAC Response CMAC`
- `DUKPT ISO 9797-1 Algorithm 1`
- `DUKPT ISO 9797-1 Algorithm 3`

Use this when:
- you want one payment-facing MAC surface instead of deciding between generic `HMAC`, `CMAC`, ISO9797, DUKPT, and AS2805 yourself

Input:
- message data in the selected input format

Important assumptions:
- ISO9797 and AS2805 methods use clear TDES keys in software
- DUKPT methods expect a clear BDK plus full KSN
- EMV MAC is handled by the dedicated EMV MAC operations below

## 3) Generate / Verify EMV MAC

Operations:
- `EMV Generate MAC`
- `EMV Verify MAC`
- `EMV Generate MAC (PIN Change)`

Use this when:
- you already have the EMV session integrity key
- you want issuer-script MAC generation or verification
- you need a dedicated offline PIN-change MAC helper

Input:
- issuer-script or EMV command payload as hex

Important assumptions:
- these operations do not derive EMV session keys
- they apply retail-MAC style EMV MAC generation with ISO9797 padding method 2
- `EMV Generate MAC (PIN Change)` expects the new PIN block to already be encrypted before you call it

## 4) Generate / Verify EMV ARQC And ARPC

Operations:
- `EMV Generate ARQC`
- `EMV Verify ARQC`
- `EMV Generate ARPC`

Use this when:
- you already know the exact preassembled EMV data block
- you already have the derived EMV session key

Input:
- preassembled EMV cryptogram input data as hex

Important assumptions:
- current coverage is the implemented AES-CMAC profile
- these operations do not assemble CDOL data or derive issuer/session keys

## 5) Generate / Verify Card Validation Data

Operations:
- `PAN Generate`
- `PAN Parse`
- `Card Validation Data Generate`
- `Card Validation Data Verify`

Profiles:
- `CVV / CVC (use service code arg)`
- `CVV2 / CVC2 (force 000)`
- `iCVV (force 999)`

Input:
- combined CVK pair as clear hex

Important assumptions:
- CVV2 forces service code `000`
- iCVV forces service code `999`
- this is a clear-key software emulation of common card-validation flows
- `PAN Parse` now outputs `cardType`, `cardTypeConfidence`, and `majorIndustryIdentifierDescription` in addition to network and Luhn fields

Recommended chain:
- `PAN Generate` -> `PAN Parse` -> `Card Validation Data Generate`

Use `PAN Generate` when:
- you want a Visa, Mastercard, American Express, or Discover PAN to feed into later recipes

Use `PAN Parse` when:
- you want to confirm network, card type hint, IIN, length, and Luhn validity before continuing

## 6) Generate / Verify Payment PIN Data

Operations:
- `PIN Data Generate`
- `PIN Data Verify`

> **Note:** `Translate Payment PIN Data` was removed (issue #4 — it was a duplicate of `PIN Block Translate`). Use `PIN Block Translate` (section 7) directly.

Use this when:
- you want AWS-style PIN-data naming for clear ISO 9564 block flows

Input:
- `PIN Data Generate`: clear PIN digits
- `PIN Data Verify`: clear PIN block hex

Important assumptions:
- these wrappers currently cover clear ISO formats `0`, `1`, and `3`
- encrypted PEK/BDK translation is still done by chaining lower-level steps

## 7) Build / Parse / Translate PIN Block

Operations:
- `PIN Block Build`
- `PIN Block Parse`
- `PIN Block Translate`

Use this when:
- you want the lower-level clear PIN-block tools directly

Input:
- `PIN Block Build`: clear PIN digits
- `PIN Block Parse`: clear PIN block hex
- `PIN Block Translate`: clear PIN block hex

Important assumptions:
- current clear-block support is ISO formats `0`, `1`, and `3`

## 8) Issuer PIN Verification Helpers

Operations:
- `IBM 3624 Generate PIN Offset`
- `IBM 3624 Verify PIN`
- `VISA PVV Generate`
- `VISA PVV Verify`

Use this when:
- you need issuer-side PIN verification artifacts rather than PIN blocks

Input:
- clear PIN digits

Important assumptions:
- these helpers use clear PVKs in software
- IBM 3624 expects a decimalization table and validation data
- VISA PVV uses the common PAN/PVKI/PIN assembly described in the inline comments

## 9) Key Derivation, Generation, And Validation

Operations:
- `DUKPT Derive TDES Key` — TDES DUKPT (10-byte KSN, IPEK-based)
- `DUKPT Derive AES Key` — AES-128 DUKPT per ANSI X9.24-3 (12-byte KSN, IK-based)
- `Derive ECDH Key Material`
- `Key Generate` — random AES-128/192/256, TDES, or custom bytes; optional AES CMAC KCV
- `Payment Calculate KCV`
- `AS2805 Generate KEK Validation`

Use this when:
- you need transaction keys, shared secrets, random test keys, KCVs, or AS2805-style KEK-validation lab values

Important assumptions:
- `DUKPT Derive TDES Key` is TDES DUKPT — do not confuse IPEK (TDES) with IK (AES DUKPT)
- `DUKPT Derive AES Key` implements AES-128 via AES-CMAC per ANSI X9.24-3; AES-192/256 are not yet implemented
- `Key Generate` is for test use only — production keys must be generated in an approved HSM
- `AS2805 Generate KEK Validation` is an emulation-oriented helper and explicitly documents its simplifications in the operation comments

## 10) Key Container And HSM Command Inspection

Operations:
- `HSM Parse Thales Command`
- `HSM Parse Futurex Command`
- `TR-31 Parse Key Block`
- `TR-34 Parse Key Transport`

Use this when:
- you need to inspect vendor HSM command syntax, wrapped-key material, or transport frames during testing

Input:
- `HSM Parse Thales Command`: raw legacy host command or response text
- `HSM Parse Futurex Command`: raw bracketed Excrypt command or response text
- `TR-31 Parse Key Block` / `TR-34 Parse Key Transport`: full payload as text or hex, depending on the operation comment

Important assumptions:
- the Thales and Futurex parsers currently focus on visible message syntax, delimiters, command identification, and field splitting rather than deep per-command semantic decoding
- `HSM Parse Thales Command` expects the configured message-header length to be supplied in the op args
- `HSM Parse Futurex Command` treats Excrypt messages as delimiter-based tag/value fields and commonly uses the `AO` field as the command code
- `TR-31 Parse Key Block` decodes all X9.143 header fields with descriptions and PCI compliance flags
- `TR-34 Parse Key Transport` handles B0–B9 message types, error codes, and peeks at the outer ASN.1 SEQUENCE of the CMS envelope

## Chaining Patterns

## A) TDES DUKPT MAC

Operations:
- `DUKPT Derive TDES Key`
- `MAC Generate`

Flow:
- derive the transaction key first if you want to inspect it
- or use a DUKPT MAC method directly in `MAC Generate`
- use the same KSN and BDK on verify

## B) AES DUKPT Key Derivation

Operations:
- `DUKPT Derive AES Key`

Flow:
- provide the 16-byte BDK (or IK if you already have it) as hex input
- provide the 12-byte KSN (8-byte IKI + 4-byte counter) in the args
- select "Working Key" and a purpose (PIN Encryption, MAC Generation, Data Encryption, etc.)
- use JSON output to inspect the full BDK → IK → transaction key → working key chain

## C) ECDH Wrap / Unwrap

Operations:
- `Derive ECDH Key Material`
- `AES Key Wrap`
- `AES Key Unwrap`

Flow:
- derive the shared secret
- optionally run a KDF if you need a specific KEK size
- feed the resulting key into `AES Key Wrap` or `AES Key Unwrap`

Important assumption:
- this is not a full TR-34 or AWS `TranslateKeyMaterial` implementation by itself

## D) Clear PIN Block To Encrypted PIN Data

Operations:
- `PIN Data Generate` or `PIN Block Build`
- `Payment Encrypt Data`

Flow:
- generate the clear ISO PIN block first
- encrypt that block under the desired AES or TDES profile

## E) EMV ARQC / ARPC Review

Operations:
- `EMV Generate ARQC`
- `EMV Verify ARQC`
- `EMV Generate ARPC`

Flow:
- build the exact request-data preimage outside the op
- generate or verify the ARQC with the derived session key
- build the response preimage and generate the ARPC

## F) EMV Script MAC And PIN Change

Operations:
- `EMV Generate MAC`
- `EMV Verify MAC`
- `EMV Generate MAC (PIN Change)`

Flow:
- assemble the issuer-script APDU body as hex
- use the derived integrity key
- append the already-encrypted PIN block when generating the PIN-change MAC

## G) IBM 3624 / PVV Verification

Operations:
- `IBM 3624 Generate PIN Offset`
- `IBM 3624 Verify PIN`
- `VISA PVV Generate`
- `VISA PVV Verify`

Flow:
- keep the clear PIN in the input field
- keep issuer validation data, PAN, PVKI, decimalization table, and PVK in the args
- use the JSON output when you need to inspect how the verification artifact was assembled

## H) Brand Test Card Setup

Operations:
- `PAN Generate`
- `PAN Parse`
- `Card Validation Data Generate`
- `PIN Data Generate`

Flow:
- generate a curated or locally generated brand-valid PAN
- parse it to confirm brand, card type hint, and Luhn validity
- feed the PAN into CVV, PIN, EMV, or parser recipes

## I) AS2805 KEK Validation

Operations:
- `AS2805 Generate KEK Validation`
- `Payment Calculate KCV`

Flow:
- inspect the KEK with `Payment Calculate KCV`
- generate request or response RandomKeySend / RandomKeyReceive values with the AS2805 helper

## J) Vendor Command Triage

Operations:
- `HSM Parse Thales Command`
- `HSM Parse Futurex Command`

Flow:
- paste the raw host message first before trying to interpret the business meaning
- use the parsed command code, delimiters, header, trailer, or tag/value split to confirm what family of command you are looking at
- follow with lower-level payment, EMV, PIN, or key-container recipes only after the transport syntax is understood

## K) Generate And Verify A Test Key

Operations:
- `Key Generate`
- `Payment Calculate KCV`

Flow:
- use `Key Generate` with JSON output to get a random AES-128/192/256 or TDES key plus its CMAC KCV
- cross-check the KCV with `Payment Calculate KCV` if you need to verify against an HSM-generated value
- pipe the hex key directly into derivation, MAC, or encryption recipes

## Validation Status

Validation classes:
- `Verified` — backed by a public standard or official vendor documentation plus deterministic local vectors
- `Vendor-aligned` — behavior is intentionally shaped to AWS Payment Cryptography or scheme/vendor semantics; the full underlying standard is not publicly auditable here
- `Externally cross-checked` — checked against known-good vectors or an external implementation; the governing spec is not public here
- `Test helper` — useful for testing, parsing, or workflow emulation but not a full standards-faithful implementation

Release guidance: `Publish` = safe with normal guardrails; `Publish with guardrails` = keep inline Validation/Security/Assumptions warnings visible.

| Operation | Validation | Primary source(s) | Release |
| --- | --- | --- | --- |
| `PIN Block Build` | Vendor-aligned | AWS `GeneratePinData`; ISO 9564 | Publish with guardrails |
| `PIN Block Parse` | Vendor-aligned | AWS `VerifyPinData`; ISO 9564 | Publish with guardrails |
| `PIN Block Translate` | Vendor-aligned | AWS `TranslatePinData`; ISO 9564 | Publish with guardrails |
| `PIN Data Generate` | Vendor-aligned | AWS `GeneratePinData` | Publish with guardrails |
| `PIN Data Verify` | Vendor-aligned | AWS `VerifyPinData` | Publish with guardrails |
| `Payment Calculate KCV` | Verified | NIST SP 800-38B; generic AES/TDES/HMAC primitives | Publish |
| `DUKPT Derive TDES Key` | Externally cross-checked | ANSI X9.24-1; AWS DUKPT terminology | Publish with guardrails |
| `DUKPT Derive AES Key` | Vendor-aligned | ANSI X9.24-3; AWS DUKPT terminology | Publish with guardrails |
| `Derive ECDH Key Material` | Verified | AWS `TranslateKeyMaterial`; AWS `EcdhDerivationAttributes`; RFC 3394 | Publish |
| `Payment Encrypt Data` | Vendor-aligned | AWS `EncryptData` | Publish with guardrails |
| `Payment Decrypt Data` | Vendor-aligned | AWS `DecryptData` | Publish with guardrails |
| `Payment Re-Encrypt Data` | Vendor-aligned | AWS `ReEncryptData` | Publish with guardrails |
| `MAC Generate` | Verified (HMAC/CMAC); Vendor-aligned (ISO9797/DUKPT/AS2805) | NIST SP 800-38B; AWS MAC overview | Publish with guardrails |
| `MAC Verify` | Verified (HMAC/CMAC); Vendor-aligned (ISO9797/DUKPT/AS2805) | NIST SP 800-38B; AWS MAC overview | Publish with guardrails |
| `EMV Generate MAC` | Vendor-aligned | AWS EMV MAC use case | Publish with guardrails |
| `EMV Verify MAC` | Vendor-aligned | AWS EMV MAC use case | Publish with guardrails |
| `EMV Generate MAC (PIN Change)` | Test helper | AWS `GenerateMacEmvPinChange` | Publish with guardrails |
| `EMV Generate ARQC` | Vendor-aligned | AWS `VerifyAuthRequestCryptogram` | Publish with guardrails |
| `EMV Verify ARQC` | Vendor-aligned | AWS `VerifyAuthRequestCryptogram` | Publish with guardrails |
| `EMV Generate ARPC` | Vendor-aligned | AWS `VerifyAuthRequestCryptogram` issuer flow | Publish with guardrails |
| `Card Validation Data Generate` | Vendor-aligned | AWS `GenerateCardValidationData` | Publish with guardrails |
| `Card Validation Data Verify` | Vendor-aligned | AWS `VerifyCardValidationData` | Publish with guardrails |
| `IBM 3624 Generate PIN Offset` | Vendor-aligned | AWS IBM 3624 PIN verification object | Publish with guardrails |
| `IBM 3624 Verify PIN` | Vendor-aligned | AWS IBM 3624 PIN verification object | Publish with guardrails |
| `VISA PVV Generate` | Vendor-aligned | AWS VISA PIN verification object | Publish with guardrails |
| `VISA PVV Verify` | Vendor-aligned | AWS VISA PIN verification object | Publish with guardrails |
| `AS2805 Generate KEK Validation` | Test helper | AWS `GenerateAs2805KekValidation` | Publish with guardrails |
| `PAN Generate` | Verified (Luhn/public ranges); Vendor-aligned (curated samples) | Discover public test-card page; Mastercard public AVS scenarios | Publish with guardrails |
| `PAN Parse` | Verified | Public card numbering rules | Publish |
| `TR-31 Parse Key Block` | Test helper | AWS `TranslateKeyMaterial` workflow context | Publish with guardrails |
| `TR-34 Parse Key Transport` | Test helper | AWS `TranslateKeyMaterial` workflow context | Publish with guardrails |
| `HSM Parse Thales Command` | Test helper | Thales payShield command syntax reference | Publish with guardrails |
| `HSM Parse Futurex Command` | Test helper | Futurex Excrypt command syntax reference | Publish with guardrails |

### Release Posture

- Publish the current payment surface with its existing inline warnings intact
- Do not describe the fork as a certified HSM, production key-custody platform, or PCI-scoped control surface
- Describe it as a software emulation and interoperability tool for development, testing, and education

Pre-publish checklist:
1. Rebuild Docker and confirm updated recipe descriptions are visible in the UI
2. Re-run the payment operation subset tests (`npm test` targeting `Payment.mjs`)
3. Spot-check `Populate test data` on argument-heavy operations

### References

- AWS Payment Cryptography Data Plane API: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/Welcome.html
- AWS MAC overview: https://docs.aws.amazon.com/payment-cryptography/latest/userguide/crypto-ops-mac.html
- NIST SP 800-38B CMAC: https://csrc.nist.gov/pubs/sp/800/38/b/upd1/final
- RFC 3394 AES Key Wrap: https://www.rfc-editor.org/rfc/rfc3394
- Discover public test-card page: https://www.discoverglobalnetwork.com/resources/businesses/check-your-card-reader/
- Mastercard AVS test scenarios: https://static.developer.mastercard.com/content/mastercard-send-avs/uploads/avs-test-case-scenario-v4.pdf
- Payment card number background: https://en.wikipedia.org/wiki/Payment_card_number
