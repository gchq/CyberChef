# Upstream PR Draft

Upstream compare URL:

`https://github.com/gchq/CyberChef/compare/master...J8k3:master?expand=1`

Suggested PR title:

`Add payment cryptography emulation operations, recipes, and validation guardrails`

Suggested PR body:

```md
## Summary

This PR adds a payment-focused extension surface to CyberChef aimed at software emulation, testing, interoperability work, and education.

It does **not** present CyberChef as a certified HSM or production key-custody platform. The added payment operations and recipe docs are explicitly framed as software-only tooling with inline validation, assumption, and security guardrails.

## What This Adds

### Payment-facing operations

- Payment data wrappers:
  - `Encrypt Payment Data`
  - `Decrypt Payment Data`
  - `Re-Encrypt Payment Data`
- MAC coverage:
  - `Generate Payment MAC`
  - `Verify Payment MAC`
  - `Generate EMV MAC`
  - `Verify EMV MAC`
  - `Generate EMV MAC For PIN Change`
- EMV cryptogram helpers:
  - `Generate EMV ARQC`
  - `Verify EMV ARQC`
  - `Generate EMV ARPC`
- PIN workflows:
  - `Build PIN Block`
  - `Parse PIN Block`
  - `Translate PIN Block`
  - `Generate Payment PIN Data`
  - `Translate Payment PIN Data`
  - `Verify Payment PIN Data`
  - `Generate IBM 3624 PIN Offset`
  - `Verify IBM 3624 PIN`
  - `Generate VISA PVV`
  - `Verify VISA PVV`
- Card-validation helpers:
  - `Generate Card Validation Data`
  - `Verify Card Validation Data`
- Key / key-material helpers:
  - `Calculate Payment KCV`
  - `Derive DUKPT Key`
  - `Derive ECDH Key Material`
  - `Generate AS2805 KEK Validation`
- Test-data and parsing helpers:
  - `Generate Test PAN`
  - `Parse PAN`
  - `Parse TR-31 key block`
  - `Parse TR-34 B9 envelope`

### Recipe and documentation work

- Added payment recipe starters and chaining guidance:
  - `PAYMENT_RECIPES.md`
  - `AWS_PAYMENT_CRYPTOGRAPHY_RECIPES.md`
  - `PAYMENT_SIM_RECIPES.md`
- Added a validation / release audit:
  - `PAYMENT_VALIDATION_AUDIT.md`

### UI / usability work

- Added inline recipe-card guidance for payment operations.
- Added visible validation/scope/security wording on higher-risk operations.
- Added `Populate test data` support and payment test-input generation helpers.
- Reorganized the `Payments` category so payment-facing wrappers appear before lower-level primitives.

## Validation / Guardrails

This PR intentionally distinguishes between:

- behavior verified against public standards or public vendor docs
- behavior aligned to AWS Payment Cryptography semantics
- behavior externally cross-checked where the governing scheme spec is not public here
- explicit emulation / inspection helpers

That classification is documented in `PAYMENT_VALIDATION_AUDIT.md` and summarized inline in the payment operation descriptions.

## Scope Notes

- This is intended for software emulation, QA, interoperability, and educational use.
- It is **not** a certified HSM implementation.
- It is **not** presented as a PCI-scoped production key-custody or transaction-security surface.
- Some payment domains are necessarily profile-specific or emulated, and those limitations are surfaced directly in the UI/docs.

## Verification

- Docker build completed successfully from this branch.
- Payment-focused vectors and operation tests were added/expanded in `tests/operations/tests/Payment.mjs`.
- Common recipe chains are documented rather than left implicit.

## Review Notes

This is a broad feature addition. If maintainers prefer smaller upstream review units, I can split this into follow-up PRs along these lines:

1. Payment core primitives and category plumbing
2. MAC / KCV / DUKPT / ECDH / PIN block operations
3. EMV / card-validation / issuer-verification helpers
4. Test-data generators, docs, and validation guardrails
```

Submission notes:
- Upstream `gchq/CyberChef` currently uses `master` as the default branch.
- On first submission, GitHub will prompt you to sign the GCHQ CLA:
  - https://github.com/gchq/CyberChef
