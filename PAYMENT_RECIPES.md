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

## 6) Payment Data Encrypt / Decrypt / Re-encrypt
Operations:
- `Encrypt payment data`
- `Decrypt payment data`
- `Re-encrypt payment data`

Suggested use:
- Paste the message or ciphertext into the input field as hex.
- Choose a payment-facing cipher profile for AES, TDES, or DUKPT-derived TDES.
- Provide the direct key or BDK plus KSN, then add the IV when the selected mode requires one.

Scope note:
- These wrappers currently cover AES CBC/CTR/ECB, TDES CBC/ECB, and DUKPT-derived TDES CBC/ECB.
- They are intended for software test harnesses and intentionally reuse the existing generic cipher implementations underneath.

## 7) PIN Block Build / Parse / Translate
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

## 8) Payment PIN Data Wrappers
Operations:
- `Generate payment PIN data`
- `Translate payment PIN data`
- `Verify payment PIN data`

Suggested use:
- Use these wrappers when you want AWS-style PIN-data naming instead of the lower-level PIN-block operations.
- They currently cover clear ISO 9564 formats 0, 1, and 3 by delegating to the existing build, translate, and parse operations.

Scope note:
- This is still clear-PIN-block coverage only.
- Encrypted PIN data, PVV, and IBM 3624 are still future additions.

## 9) Card Validation Data (CVV / CVV2 / iCVV)
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

## 10) Payment MAC Generation And Verification
Operations:
- `Generate payment MAC`
- `Verify payment MAC`

Suggested use:
- Paste the message data into the input field.
- Choose whether the MAC should use static `HMAC`, static `CMAC`, or DUKPT-derived TDES-CMAC.
- Provide either a direct MAC key or a BDK plus KSN, depending on the selected method.

Scope note:
- This wrapper intentionally reuses the existing generic `HMAC` and `CMAC` implementations instead of duplicating crypto code.
- Current DUKPT coverage derives TDES session keys and applies TDES-CMAC for request and response MAC variants.
- ISO 9797, EMV session-derivation MAC, and AS2805 are still future additions.

## 11) EMV ARQC Generation And Verification (AES-CMAC Profile)
Operations:
- `Generate EMV ARQC`
- `Verify EMV ARQC`

Suggested use:
- Paste the already-assembled ARQC input block into the input field as hex.
- Provide the already-derived AES session key in the argument field.
- Choose how many leftmost CMAC bytes to keep as the final cryptogram.

Scope note:
- This operation is intentionally limited to AES-CMAC-style EMV profiles.
- It does not derive EMV session keys or assemble CDOL/tag data for you.

## 12) EMV ARPC Generation (AES-CMAC Response Profile)
Operations:
- `Generate EMV ARPC`

Suggested use:
- Paste the already-assembled ARPC response input block into the input field as hex.
- Provide the already-derived issuer AES session key in the argument field.
- Choose how many leftmost CMAC bytes to keep as the final cryptogram.

Scope note:
- This operation is intentionally limited to AES-CMAC response profiles where the issuer session key and exact preimage are already known.
- Legacy 3DES EMV ARQC/ARPC flows are not covered.

## 13) Combined Message Triage
Operations:
- `Parse TR-34 B9 envelope`
- `Parse ASN.1 hex string`
