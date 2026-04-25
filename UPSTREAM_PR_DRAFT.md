# Upstream PR Draft

Upstream compare URL:

`https://github.com/gchq/CyberChef/compare/master...J8k3:master?expand=1`

Suggested PR title:

`Add payment cryptography emulation operations, recipes, and validation guardrails`

Suggested PR body:

```md
## Summary

This PR adds a payment-focused extension surface to CyberChef for software emulation, testing, interoperability work, and education.

It is intentionally documented as software-only tooling rather than a certified HSM or production key-custody surface.

## What This Adds

- A new `Payments` category with payment-facing operations for:
  - data encryption / decryption / re-encryption
  - MAC generation / verification
  - EMV ARQC / ARPC / MAC helpers
  - clear PIN block build / parse / translate
  - card validation data
  - DUKPT / ECDH / KCV helpers
  - test PAN generation / parsing
  - TR-31 / TR-34 inspection helpers
- Payment recipe and chaining docs:
  - `PAYMENT_RECIPES.md`
  - `AWS_PAYMENT_CRYPTOGRAPHY_RECIPES.md`
  - `PAYMENT_SIM_RECIPES.md`
- A validation audit with explicit guardrails:
  - `PAYMENT_VALIDATION_AUDIT.md`
- UI improvements for payment operations:
  - inline recipe-card guidance
  - visible validation / scope / security wording
  - built-in test-data population helpers

## Validation / Guardrails

The payment operations are explicitly classified in `PAYMENT_VALIDATION_AUDIT.md` as:
- verified against public standards / vectors
- vendor-aligned
- externally cross-checked
- emulation helpers

That status is also surfaced inline on higher-risk operations so users can see scope and limitations in the recipe UI.

## Scope Notes

- Intended for software emulation, QA, interoperability, and educational use.
- Not a certified HSM implementation.
- Not presented as a PCI-scoped production key-custody surface.

## Verification

- Docker build completed successfully from this branch.
- Payment-focused vectors and operation tests were added/expanded in `tests/operations/tests/Payment.mjs`.
- Common recipe chains are documented explicitly in the payment docs.

## If This Is Too Broad

If maintainers would prefer smaller review units, I can split this into follow-up PRs by:
1. payment primitives and category plumbing
2. MAC / KCV / DUKPT / ECDH / PIN block operations
3. EMV / card-validation / issuer-verification helpers
4. test-data generators, docs, and validation guardrails
```

Submission notes:
- Upstream `gchq/CyberChef` currently uses `master` as the default branch.
- On first submission, GitHub will prompt you to sign the GCHQ CLA:
  - https://github.com/gchq/CyberChef
