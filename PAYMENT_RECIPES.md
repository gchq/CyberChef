# Payment Recipe Starters

Owner:
- Jacob Marks, `https://jacobmarks.com`
- Fork home: `https://github.com/J8k3/CyberChef`

These recipe starters are for software-only payment-crypto emulation, inspection, regression tests, and interoperability work.

For AWS operation mapping, see `AWS_PAYMENT_CRYPTOGRAPHY_RECIPES.md`.
For validation posture, standards references, and release guardrails, see `PAYMENT_VALIDATION_AUDIT.md`.

## Naming Convention

All payment operation display names follow **Title Case** throughout. Acronyms (DUKPT, AES, EMV, MAC, PAN, PVV, KCV, ARQC, ARPC, TR-31, TR-34) are always upper-case. Brand names retain their canonical capitalisation (`payShield`).

Pattern: `[Verb] [Optional Qualifier] [Noun]`
- Verbs: Generate, Verify, Parse, Build, Translate, Derive, Calculate, Encrypt, Decrypt, Re-Encrypt
- When adding a new payment operation, follow this pattern and update this file.

## UI Arrangement

The `Payments` category is arranged in this order:
- payment-facing wrappers first
- EMV and card-validation flows next
- PIN and issuer-verification helpers after that
- key derivation, generation, KCV, and parser utilities next
- generic crypto primitives last for chaining

That keeps common testing tasks near the top without hiding the underlying `HMAC`, `CMAC`, cipher, and key-wrap primitives that some chains still need.

## 1) Encrypt / Decrypt / Re-Encrypt Payment Data

Operations:
- `Encrypt Payment Data`
- `Decrypt Payment Data`
- `Re-Encrypt Payment Data`

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
- `Generate Payment MAC`
- `Verify Payment MAC`

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
- `Generate EMV MAC`
- `Verify EMV MAC`
- `Generate EMV MAC For PIN Change`

Use this when:
- you already have the EMV session integrity key
- you want issuer-script MAC generation or verification
- you need a dedicated offline PIN-change MAC helper

Input:
- issuer-script or EMV command payload as hex

Important assumptions:
- these operations do not derive EMV session keys
- they apply retail-MAC style EMV MAC generation with ISO9797 padding method 2
- `Generate EMV MAC For PIN Change` expects the new PIN block to already be encrypted before you call it

## 4) Generate / Verify EMV ARQC And ARPC

Operations:
- `Generate EMV ARQC`
- `Verify EMV ARQC`
- `Generate EMV ARPC`

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
- `Generate Test PAN`
- `Parse PAN`
- `Generate Card Validation Data`
- `Verify Card Validation Data`

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
- `Parse PAN` now outputs `cardType`, `cardTypeConfidence`, and `majorIndustryIdentifierDescription` in addition to network and Luhn fields

Recommended chain:
- `Generate Test PAN` -> `Parse PAN` -> `Generate Card Validation Data`

Use `Generate Test PAN` when:
- you want a Visa, Mastercard, American Express, or Discover PAN to feed into later recipes

Use `Parse PAN` when:
- you want to confirm network, card type hint, IIN, length, and Luhn validity before continuing

## 6) Generate / Verify Payment PIN Data

Operations:
- `Generate Payment PIN Data`
- `Verify Payment PIN Data`

> **Note:** `Translate Payment PIN Data` is deprecated — use `Translate PIN Block` (section 7) instead. See issue #4.

Use this when:
- you want AWS-style PIN-data naming for clear ISO 9564 block flows

Input:
- `Generate Payment PIN Data`: clear PIN digits
- `Verify Payment PIN Data`: clear PIN block hex

Important assumptions:
- these wrappers currently cover clear ISO formats `0`, `1`, and `3`
- encrypted PEK/BDK translation is still done by chaining lower-level steps

## 7) Build / Parse / Translate PIN Block

Operations:
- `Build PIN Block`
- `Parse PIN Block`
- `Translate PIN Block`

Use this when:
- you want the lower-level clear PIN-block tools directly

Input:
- `Build PIN Block`: clear PIN digits
- `Parse PIN Block`: clear PIN block hex
- `Translate PIN Block`: clear PIN block hex

Important assumptions:
- current clear-block support is ISO formats `0`, `1`, and `3`

## 8) Issuer PIN Verification Helpers

Operations:
- `Generate IBM 3624 PIN Offset`
- `Verify IBM 3624 PIN`
- `Generate VISA PVV`
- `Verify VISA PVV`

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
- `Derive DUKPT Key` — TDES DUKPT (10-byte KSN, IPEK-based)
- `Derive DUKPT AES Key` — AES-128 DUKPT per ANSI X9.24-3 (12-byte KSN, IK-based)
- `Derive ECDH Key Material`
- `Generate Key` — random AES-128/192/256, TDES, or custom bytes; optional AES CMAC KCV
- `Calculate Payment KCV`
- `Generate AS2805 KEK Validation`

Use this when:
- you need transaction keys, shared secrets, random test keys, KCVs, or AS2805-style KEK-validation lab values

Important assumptions:
- `Derive DUKPT Key` is TDES DUKPT — do not confuse IPEK (TDES) with IK (AES DUKPT)
- `Derive DUKPT AES Key` implements AES-128 via AES-CMAC per ANSI X9.24-3; AES-192/256 are not yet implemented
- `Generate Key` is for test use only — production keys must be generated in an approved HSM
- `Generate AS2805 KEK Validation` is an emulation-oriented helper and explicitly documents its simplifications in the operation comments

## 10) Key Container And HSM Command Inspection

Operations:
- `Parse Thales payShield Command`
- `Parse Futurex Excrypt Command`
- `Parse TR-31 Key Block`
- `Parse TR-34 Key Transport`

Use this when:
- you need to inspect vendor HSM command syntax, wrapped-key material, or transport frames during testing

Input:
- `Parse Thales payShield Command`: raw legacy host command or response text
- `Parse Futurex Excrypt Command`: raw bracketed Excrypt command or response text
- `Parse TR-31 Key Block` / `Parse TR-34 Key Transport`: full payload as text or hex, depending on the operation comment

Important assumptions:
- the Thales and Futurex parsers currently focus on visible message syntax, delimiters, command identification, and field splitting rather than deep per-command semantic decoding
- `Parse Thales payShield Command` expects the configured message-header length to be supplied in the op args
- `Parse Futurex Excrypt Command` treats Excrypt messages as delimiter-based tag/value fields and commonly uses the `AO` field as the command code
- `Parse TR-31 Key Block` decodes all X9.143 header fields with descriptions and PCI compliance flags
- `Parse TR-34 Key Transport` handles B0–B9 message types, error codes, and peeks at the outer ASN.1 SEQUENCE of the CMS envelope

## Chaining Patterns

## A) TDES DUKPT MAC

Operations:
- `Derive DUKPT Key`
- `Generate Payment MAC`

Flow:
- derive the transaction key first if you want to inspect it
- or use a DUKPT MAC method directly in `Generate Payment MAC`
- use the same KSN and BDK on verify

## B) AES DUKPT Key Derivation

Operations:
- `Derive DUKPT AES Key`

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
- `Generate Payment PIN Data` or `Build PIN Block`
- `Encrypt Payment Data`

Flow:
- generate the clear ISO PIN block first
- encrypt that block under the desired AES or TDES profile

## E) EMV ARQC / ARPC Review

Operations:
- `Generate EMV ARQC`
- `Verify EMV ARQC`
- `Generate EMV ARPC`

Flow:
- build the exact request-data preimage outside the op
- generate or verify the ARQC with the derived session key
- build the response preimage and generate the ARPC

## F) EMV Script MAC And PIN Change

Operations:
- `Generate EMV MAC`
- `Verify EMV MAC`
- `Generate EMV MAC For PIN Change`

Flow:
- assemble the issuer-script APDU body as hex
- use the derived integrity key
- append the already-encrypted PIN block when generating the PIN-change MAC

## G) IBM 3624 / PVV Verification

Operations:
- `Generate IBM 3624 PIN Offset`
- `Verify IBM 3624 PIN`
- `Generate VISA PVV`
- `Verify VISA PVV`

Flow:
- keep the clear PIN in the input field
- keep issuer validation data, PAN, PVKI, decimalization table, and PVK in the args
- use the JSON output when you need to inspect how the verification artifact was assembled

## H) Brand Test Card Setup

Operations:
- `Generate Test PAN`
- `Parse PAN`
- `Generate Card Validation Data`
- `Generate Payment PIN Data`

Flow:
- generate a curated or locally generated brand-valid PAN
- parse it to confirm brand, card type hint, and Luhn validity
- feed the PAN into CVV, PIN, EMV, or parser recipes

## I) AS2805 KEK Validation

Operations:
- `Generate AS2805 KEK Validation`
- `Calculate Payment KCV`

Flow:
- inspect the KEK with `Calculate Payment KCV`
- generate request or response RandomKeySend / RandomKeyReceive values with the AS2805 helper

## J) Vendor Command Triage

Operations:
- `Parse Thales payShield Command`
- `Parse Futurex Excrypt Command`

Flow:
- paste the raw host message first before trying to interpret the business meaning
- use the parsed command code, delimiters, header, trailer, or tag/value split to confirm what family of command you are looking at
- follow with lower-level payment, EMV, PIN, or key-container recipes only after the transport syntax is understood

## K) Generate And Verify A Test Key

Operations:
- `Generate Key`
- `Calculate Payment KCV`

Flow:
- use `Generate Key` with JSON output to get a random AES-128/192/256 or TDES key plus its CMAC KCV
- cross-check the KCV with `Calculate Payment KCV` if you need to verify against an HSM-generated value
- pipe the hex key directly into derivation, MAC, or encryption recipes
