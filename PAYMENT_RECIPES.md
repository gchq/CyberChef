# Payment Recipe Starters

These recipe starters are designed for software-only inspection, validation, and prototyping workflows.

For AWS-specific mappings, see `AWS_PAYMENT_CRYPTOGRAPHY_RECIPES.md`.

## 1) TR-31 Header Parse
Operations:
- `Parse TR-31 key block`

## 2) TR-34 B9 Envelope Split
Operations:
- `Parse TR-34 B9 envelope`

## 3) KCV Validation
Operations:
- `Calculate payment KCV`

## 4) ECDH Key Agreement (Software)
Operations:
- `Derive ECDH key material`

Suggested use:
- Import a local private key and peer public key.
- Derive raw shared secret or run Concat KDF (`SHA-256` or `SHA-512`) with shared-info.

## 5) DUKPT Derivation (Software)
Operations:
- `Derive DUKPT key`

Suggested use:
- Derive IPEK from BDK + KSN.
- Derive base session key and apply a variant mask (`PIN`, `MAC Request`, `MAC Response`, `Data`).

## 6) PIN Block Build / Parse / Translate
Operations:
- `Build PIN block`
- `Parse PIN block`
- `Translate PIN block`

Suggested use:
- Build clear ISO 9564 format 0, 1, or 3 PIN blocks from a PIN and PAN.
- Parse clear test PIN blocks back into PIN, PIN field, PAN field, and filler details.
- Translate clear test PIN blocks between supported formats before feeding them into cipher steps.

Scope note:
- This starter currently covers clear software test blocks for ISO formats 0, 1, and 3.
- It does not yet generate PVV, IBM 3624 offsets, or encrypted PEK/BDK translation flows by itself.

## 7) Card Validation Data (CVV / CVV2 / iCVV)
Operations:
- `Generate card validation data`
- `Verify card validation data`

Suggested use:
- Paste the combined CVK pair into the input field as 16-byte or 24-byte hex.
- Choose whether you want CVV/CVC, CVV2/CVC2, or iCVV behavior.
- Provide the PAN, expiry month/year, and service-code context in the argument fields.

Scope note:
- This implementation is intended for software test harnesses.
- CVV2 forces service code `000` and iCVV forces `999`.
- It does not try to emulate scheme-specific dCVV, token CVV, or issuer-host formatting differences beyond the common decimalization flow.

## 8) EMV ARQC Generation (AES-CMAC Profile)
Operations:
- `Generate EMV ARQC`

Suggested use:
- Paste the already-assembled ARQC input block into the input field as hex.
- Provide the already-derived AES session key in the argument field.
- Choose how many leftmost CMAC bytes to keep as the final cryptogram.

Scope note:
- This operation is intentionally limited to AES-CMAC-style EMV profiles.
- It does not derive EMV session keys or assemble CDOL/tag data for you.

## 9) EMV ARPC Generation (AES-CMAC Response Profile)
Operations:
- `Generate EMV ARPC`

Suggested use:
- Paste the already-assembled ARPC response input block into the input field as hex.
- Provide the already-derived issuer AES session key in the argument field.
- Choose how many leftmost CMAC bytes to keep as the final cryptogram.

Scope note:
- This operation is intentionally limited to AES-CMAC response profiles where the issuer session key and exact preimage are already known.
- Legacy 3DES EMV ARQC/ARPC flows are not covered.

## 10) Combined Message Triage
Operations:
- `Parse TR-34 B9 envelope`
- `Parse ASN.1 hex string`
