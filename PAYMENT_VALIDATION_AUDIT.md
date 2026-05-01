# Payment Validation Audit

Owner:
- Jacob Marks, `https://jacobmarks.com`
- Fork home: `https://github.com/J8k3/CyberChef`

This audit records how each payment-facing operation in this fork was validated, what source material it maps to, and how it should be described before publishing.

Validation classes:
- `Verified`: backed by a public standard or official vendor documentation plus deterministic local vectors.
- `Vendor-aligned`: behavior is intentionally shaped to AWS Payment Cryptography or scheme/vendor semantics, but the full underlying standard is not publicly auditable here.
- `Externally cross-checked`: implementation was checked against known-good vectors or an external implementation, but the governing spec is not public here.
- `Emulation helper`: intentionally useful for testing, parsing, or workflow emulation, but not a full standards-faithful implementation.

Release guidance:
- `Publish`: safe to publish with normal guardrails.
- `Publish with guardrails`: publish, but keep the validation/security/assumption warnings visible in the recipe UI and docs.
- `Hold`: do not publish without more verification.

Primary public references used in this audit:
- AWS Payment Cryptography Data Plane API Reference: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/Welcome.html
- AWS Data Plane operations list: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_Operations.html
- AWS MAC overview: https://docs.aws.amazon.com/payment-cryptography/latest/userguide/crypto-ops-mac.html
- AWS EMV MAC use case: https://docs.aws.amazon.com/payment-cryptography/latest/userguide/use-cases-issuers.generalfunctions.emvmac.html
- AWS TranslateKeyMaterial: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_TranslateKeyMaterial.html
- AWS ECDH derivation attributes: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_EcdhDerivationAttributes.html
- AWS IBM 3624 PIN verification object: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_Ibm3624PinVerification.html
- AWS VISA PIN verification object: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_VisaPinVerification.html
- NIST SP 800-38B CMAC: https://csrc.nist.gov/pubs/sp/800/38/b/upd1/final
- RFC 3394 AES Key Wrap: https://www.rfc-editor.org/rfc/rfc3394
- Discover public test-card page: https://www.discoverglobalnetwork.com/resources/businesses/check-your-card-reader/
- Mastercard AVS test scenarios with public sample PANs: https://static.developer.mastercard.com/content/mastercard-send-avs/uploads/avs-test-case-scenario-v4.pdf
- Payment card number background and ranges: https://en.wikipedia.org/wiki/Payment_card_number

## Matrix

| Operation | Validation | Primary source(s) | Local evidence | Release note |
| --- | --- | --- | --- | --- |
| `Build PIN Block` | `Vendor-aligned` | AWS `GeneratePinData`; ISO 9564 format conventions are used, but full ISO text is not public here. | Deterministic vectors in `tests/operations/tests/Payment.mjs` for format `0`; UI warns that only clear formats `0/1/3` are implemented. | `Publish with guardrails` |
| `Parse PIN Block` | `Vendor-aligned` | AWS `VerifyPinData`; same clear ISO 9564 format assumptions as above. | Deterministic vectors in `tests/operations/tests/Payment.mjs`; JSON output exposes the exact parsed fields. | `Publish with guardrails` |
| `Translate PIN Block` | `Vendor-aligned` | AWS `TranslatePinData`; same clear ISO 9564 format assumptions as above. | Deterministic vectors in `tests/operations/tests/Payment.mjs`; current scope is clear block translation only. | `Publish with guardrails` |
| `Generate Payment PIN Data` | `Vendor-aligned` | AWS `GeneratePinData`. | Wrapper behavior is covered by the PIN block vectors and inline scope warnings. | `Publish with guardrails` |
| `Translate Payment PIN Data` | `Vendor-aligned` | AWS `TranslatePinData`. | Wrapper behavior is covered by the PIN block vectors and inline scope warnings. | `Publish with guardrails` |
| `Verify Payment PIN Data` | `Vendor-aligned` | AWS `VerifyPinData`. | Wrapper behavior is covered by the PIN block vectors and inline scope warnings. | `Publish with guardrails` |
| `Calculate Payment KCV` | `Verified` | NIST SP 800-38B for CMAC; generic AES/TDES/HMAC primitive behavior. | Fixed vectors for HMAC, AES-CMAC empty/zeros/ones, and AES-ECB zeros in `tests/operations/tests/Payment.mjs`. | `Publish` |
| `Derive DUKPT Key` | `Externally cross-checked` | ANSI X9.24 governs DUKPT, but the spec text is not public here; AWS terminology also aligns the feature surface. | Known IPEK vector in `tests/operations/tests/Payment.mjs`; transaction-key behavior was previously cross-checked against an external implementation. | `Publish with guardrails` |
| `Derive ECDH Key Material` | `Verified` | AWS `TranslateKeyMaterial`, AWS `EcdhDerivationAttributes`, RFC 3394 for downstream AES Key Wrap usage. | PEM/SPKI/SEC1 handling is exercised locally; operation is explicit that it returns shared secret material and not a wrapped-key workflow by itself. | `Publish` |
| `Encrypt Payment Data` | `Vendor-aligned` | AWS `EncryptData`. | Covered by wrapper tests and use of existing CyberChef AES/TDES primitives; docs state this is software emulation, not key-ARN/HSM custody. | `Publish with guardrails` |
| `Decrypt Payment Data` | `Vendor-aligned` | AWS `DecryptData`. | Covered by wrapper tests and use of existing CyberChef AES/TDES primitives. | `Publish with guardrails` |
| `Re-Encrypt Payment Data` | `Vendor-aligned` | AWS `ReEncryptData`. | Wrapper logic is straightforward decrypt-then-encrypt with payment-facing terminology; docs now document the explicit chain. | `Publish with guardrails` |
| `Generate Payment MAC` | `Verified` for static `HMAC` / `CMAC`; `Vendor-aligned` for ISO9797, DUKPT, and AS2805 modes. | NIST SP 800-38B; AWS MAC overview. | Fixed vectors for HMAC SHA-256, AES-CMAC, and DUKPT MAC in `tests/operations/tests/Payment.mjs`; UI now distinguishes primitive-backed modes from payment-profile modes. | `Publish with guardrails` |
| `Verify Payment MAC` | `Verified` for static `HMAC` / `CMAC`; `Vendor-aligned` for ISO9797, DUKPT, and AS2805 modes. | NIST SP 800-38B; AWS MAC overview. | Fixed verification vectors in `tests/operations/tests/Payment.mjs`; UI mirrors generation warnings. | `Publish with guardrails` |
| `Generate EMV MAC` | `Vendor-aligned` | AWS EMV MAC use case; AWS MAC overview. | Deterministic local vectors; UI explicitly states that the caller must supply the session integrity key and payload. | `Publish with guardrails` |
| `Verify EMV MAC` | `Vendor-aligned` | AWS EMV MAC use case; AWS MAC overview. | Deterministic local verification vectors; same scope and derivation warnings as generation. | `Publish with guardrails` |
| `Generate EMV MAC For PIN Change` | `Emulation helper` | AWS `GenerateMacEmvPinChange`. | Implemented as an issuer-script MAC helper with explicit assumptions; not a full issuer-script lifecycle. | `Publish with guardrails` |
| `Generate EMV ARQC` | `Vendor-aligned` | AWS `VerifyAuthRequestCryptogram`; EMV semantics are profile-specific here. | Deterministic local vectors; UI states that the EMV session key and preassembled data must already be provided. | `Publish with guardrails` |
| `Verify EMV ARQC` | `Vendor-aligned` | AWS `VerifyAuthRequestCryptogram`. | Deterministic local verification vectors; same session-key and preimage assumptions are visible in the recipe. | `Publish with guardrails` |
| `Generate EMV ARPC` | `Vendor-aligned` | AWS `VerifyAuthRequestCryptogram` related issuer flow semantics. | Deterministic local vectors; recipe text now states that ARPC generation assumes already-derived key material. | `Publish with guardrails` |
| `Generate Card Validation Data` | `Vendor-aligned` | AWS `GenerateCardValidationData`. | Known-good CVV2 sample vector in `tests/operations/tests/Payment.mjs`; UI calls out CVV2=`000` and iCVV=`999` service-code assumptions. | `Publish with guardrails` |
| `Verify Card Validation Data` | `Vendor-aligned` | AWS `VerifyCardValidationData`. | Verification vectors in `tests/operations/tests/Payment.mjs`; scope warnings mirror generation. | `Publish with guardrails` |
| `Generate IBM 3624 PIN Offset` | `Vendor-aligned` | AWS IBM 3624 PIN verification object. | Deterministic local vectors; AWS object model validates the parameter shape, but the full scheme spec was not audited here. | `Publish with guardrails` |
| `Verify IBM 3624 PIN` | `Vendor-aligned` | AWS IBM 3624 PIN verification object. | Deterministic local vectors; recipe warns that this is a software verification helper. | `Publish with guardrails` |
| `Generate VISA PVV` | `Vendor-aligned` | AWS VISA PIN verification object. | Deterministic local vectors; UI notes the PVKI/PVV assumptions and clear-key nature. | `Publish with guardrails` |
| `Verify VISA PVV` | `Vendor-aligned` | AWS VISA PIN verification object. | Deterministic local vectors; UI mirrors generation assumptions. | `Publish with guardrails` |
| `Generate AS2805 KEK Validation` | `Emulation helper` | AWS `GenerateAs2805KekValidation`; no public AS2805 standard text was audited here. | Deterministic local vectors; recipe now explicitly labels this as emulation rather than a certified host/HSM implementation. | `Publish with guardrails` |
| `Generate Test PAN` | `Verified` for Luhn and public-brand range generation; `Vendor-aligned` for curated samples. | Discover public test-card page; Mastercard public AVS scenarios; public numbering rules. | Fixed Visa curated vector and deterministic generated Amex vector in `tests/operations/tests/Payment.mjs`; UI distinguishes curated samples from generated valid PANs. | `Publish with guardrails` |
| `Parse PAN` | `Verified` for Luhn and public-brand range parsing. | Discover public test-card page; public numbering rules. | Discover sample vector in `tests/operations/tests/Payment.mjs`; parser output exposes matched rule and Luhn result. | `Publish` |
| `Parse TR-31 key block` | `Emulation helper` | AWS `TranslateKeyMaterial` as surrounding workflow context. | Header-only deterministic test vector in `tests/operations/tests/Payment.mjs`; UI states that this is a parser/inspection helper, not full TR-31 processing. | `Publish with guardrails` |
| `Parse TR-34 B9 envelope` | `Emulation helper` | AWS `TranslateKeyMaterial` as surrounding workflow context. | Deterministic synthetic parser sample in `tests/operations/tests/Payment.mjs`; UI states that this is an inspection helper, not full TR-34 validation. | `Publish with guardrails` |

## Publish Notes

Recommended release posture:
- publish the current payment surface
- keep the current inline `Validation`, `Security`, and `Assumptions` wording visible in the recipe UI
- do not describe the fork as a certified HSM, production key-custody platform, or PCI-scoped control surface
- describe it as a software emulation and interoperability tool for development, testing, and education

Recommended final pre-publish checks:
1. Rebuild Docker and manually confirm that the updated recipe descriptions are visible.
2. Re-run the payment operation subset tests.
3. Spot-check `Populate test data` on argument-heavy operations to ensure the floating-label fix still holds after the latest UI text changes.
