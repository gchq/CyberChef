# AWS Payment Cryptography Recipe Coverage

This guide maps AWS Payment Cryptography Data Plane operations to CyberChef recipe starters.

Intent:
- This fork is not a certified HSM.
- It is intended to emulate HSM-style payment cryptography behavior in software for development, QA, regression, interoperability, and integration testing.
- The goal of this guide is therefore twofold:
  1. document what can already be emulated with the current operation set
  2. identify which AWS Payment Cryptography use cases should be added next to improve test-harness coverage

Source baseline:
- AWS Payment Cryptography Data Plane API Reference: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/Welcome.html
- AWS Data Plane actions list: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_Operations.html

Coverage legend:
- `Direct`: CyberChef can reproduce the core cryptographic shape of the AWS operation.
- `Partial`: CyberChef can help with preimage assembly, derivation, or one stage of the flow, but not the full AWS behavior.
- `Not yet implemented`: This is a valid testing/emulation target for the fork, but the required payment primitives are not implemented yet.

## Coverage Summary

| AWS operation | Coverage | Notes |
| --- | --- | --- |
| `EncryptData` | `Direct` / `Partial` | Direct for AES, TDES, RSA. Partial for DUKPT and EMV-derived encryption. |
| `DecryptData` | `Direct` / `Partial` | Direct for AES, TDES, RSA. Partial for DUKPT and EMV-derived decryption. |
| `ReEncryptData` | `Direct` / `Partial` | Direct for plain decrypt-then-encrypt workflows. Partial for DUKPT re-encryption. |
| `GenerateMac` | `Direct` / `Partial` | Direct for static-key HMAC and CMAC, and direct for the implemented DUKPT CMAC wrapper modes. Partial for ISO 9797, EMV MAC, and AS2805 flows. |
| `VerifyMac` | `Direct` / `Partial` | Direct for static-key HMAC and CMAC, and direct for the implemented DUKPT CMAC wrapper modes. Partial for ISO 9797, EMV MAC, and AS2805 flows. |
| `VerifyAuthRequestCryptogram` | `Partial` | Usable for AES-CMAC ARQC/ARPC-style checking when session key and preimage are already known. Dedicated ARQC and ARPC generators now exist for that constrained profile. |
| `TranslateKeyMaterial` | `Partial` | Useful for ECDH derivation and TR-31 inspection, not full HSM-side rewrap semantics. |
| `GenerateCardValidationData` | `Direct` | Direct for software CVV/CVV2/iCVV generation when the combined CVK pair is provided as clear hex. |
| `VerifyCardValidationData` | `Direct` | Direct for software CVV/CVV2/iCVV verification using the same clear-CVK assumptions as generation. |
| `GeneratePinData` | `Partial` | Clear PIN-block build coverage now exists for ISO formats 0, 1, and 3. PVV, IBM3624, and encrypted-generation paths are still missing. |
| `TranslatePinData` | `Partial` | Clear PIN-block parse and translate coverage now exists for ISO formats 0, 1, and 3. Encrypted PEK/BDK/ECDH translation is still missing. |
| `VerifyPinData` | `Partial` | Clear PIN-block decoding exists, but PVV / IBM3624 verification behavior is still missing. |
| `GenerateMacEmvPinChange` | `Not yet implemented` | Requires issuer-script PIN-change building blocks. |
| `GenerateAs2805KekValidation` | `Not yet implemented` | Requires AS2805-specific KEK-validation primitives. |

## Direct Recipe Starters

## 1) AWS `EncryptData`: AES / TDES / RSA
Operations:
- `AES Encrypt` or `Triple DES Encrypt` or `RSA Encrypt`

Suggested use:
- Paste the AWS `PlainText` hexBinary value into the input field.
- Set the operation input mode to `Hex` and output mode to `Hex`.
- Paste the key into the key argument using the correct format selector.
- Match the AWS algorithm and mode manually in the chosen CyberChef operation.

Notes:
- AWS documents `EncryptData` as supporting symmetric `TDES` and `AES`, asymmetric `RSA`, and derived `DUKPT` or `EMV` schemes.
- This starter directly covers only the non-derived AES, TDES, and RSA cases.

## 2) AWS `DecryptData`: AES / TDES / RSA
Operations:
- `AES Decrypt` or `Triple DES Decrypt` or `RSA Decrypt`

Suggested use:
- Paste the AWS `CipherText` hexBinary value into the input field.
- Set the operation input mode to `Hex` and output mode to `Hex` or `Raw`.
- Paste the key into the key argument using the correct format selector.
- Match the AWS algorithm and mode manually in the chosen CyberChef operation.

## 3) AWS `ReEncryptData`: Symmetric Rewrap
Operations:
- `AES Decrypt` or `Triple DES Decrypt`
- `AES Encrypt` or `Triple DES Encrypt`

Suggested use:
- Paste the incoming ciphertext into the input field as hex.
- First decrypt with the incoming key and mode.
- Then encrypt with the outgoing key and mode.

Notes:
- This covers the software-visible decrypt-then-encrypt pattern.
- It does not model AWS wrapped-key handling or HSM-side key custody.

## 4) AWS `GenerateMac`: HMAC
Operations:
- `From Hex`
- `HMAC`
- `Take bytes`

Suggested use:
- Paste the AWS `MessageData` hexBinary value into the input field.
- Run `From Hex`.
- Run `HMAC` with the appropriate key and hash function.
- If AWS truncates the MAC, use `Take bytes` to keep the leftmost bytes that match `MacLength`.

## 5) AWS `GenerateMac`: CMAC
Operations:
- `From Hex`
- `CMAC`
- `Take bytes`

Suggested use:
- Paste the AWS `MessageData` hexBinary value into the input field.
- Run `From Hex`.
- Run `CMAC` with `Encryption algorithm` set to `AES` or `Triple DES`.
- Use `Take bytes` to match the requested `MacLength` if truncation is required.

## 6) AWS `VerifyMac`: Recompute And Compare
Operations:
- `Verify payment MAC`

Suggested use:
- Paste the message into the input field, choose the MAC method, and provide either the direct key or the DUKPT BDK plus KSN.
- Supply the expected MAC in hex and let the wrapper recompute and compare it.

Notes:
- This covers the implemented static-key HMAC/CMAC and DUKPT-CMAC wrapper modes directly.
- ISO 9797, EMV MAC, and AS2805-specific verification are still partial gaps.

## 7) AWS `GenerateMac`: Payment Wrapper
Operations:
- `Generate payment MAC`

Suggested use:
- Paste the message into the input field and choose the payment MAC method that best matches the AWS attributes.
- Use direct key input for static HMAC or CMAC modes, or provide a BDK plus KSN for the implemented DUKPT CMAC request and response modes.

Notes:
- This wrapper exists for usability so payment users can stay in the `Payments` category without needing to know which low-level primitive is underneath.
- It intentionally reuses the existing generic `HMAC` and `CMAC` implementations.

## 8) AWS `GenerateCardValidationData`: CVV / CVV2 / iCVV
Operations:
- `Generate card validation data`

Suggested use:
- Paste the clear combined CVK pair into the input field as hex.
- Choose the profile that matches the AWS card-validation mode you want to emulate.
- Provide the PAN, expiry, and service-code context in the argument fields.

Notes:
- This directly covers software generation of CVV/CVV2/iCVV-style values.
- Assumption: CVV2 forces service code `000` and iCVV forces `999`.

## 9) AWS `VerifyCardValidationData`: CVV / CVV2 / iCVV
Operations:
- `Verify card validation data`

Suggested use:
- Use the same card context as generation, then supply the incoming value in the `Expected value` argument.
- The operation recomputes the value and returns structured verification output.

Notes:
- This is intended for software parity and regression checks.
- It does not emulate AWS key custody or HSM-side audit semantics.

## Partial Recipe Starters

## 10) AWS `EncryptData` / `DecryptData`: DUKPT-Derived Symmetric Flows
Operations:
- `Derive DUKPT key`
- `AES Encrypt` or `AES Decrypt` or `Triple DES Encrypt` or `Triple DES Decrypt`

Suggested use:
- Derive the transaction key from BDK and KSN first.
- Feed the derived key into the cipher operation that matches your target algorithm.

Notes:
- This is useful for offline vector work.
- It does not claim one-to-one parity with every AWS DUKPT encryption attribute combination.

## 11) AWS `VerifyAuthRequestCryptogram`: EMV ARQC Check
Operations:
- `Generate EMV ARQC`

Suggested use:
- Paste the already-assembled EMV authorization-request preimage into the input field as hex.
- Provide the already-derived AES session key and cryptogram length.
- Compare the result to the incoming ARQC.

Notes:
- This is only practical when the session key and exact preimage assembly are already known.
- It is a good fit for AES-CMAC-based profiles, not a full generic EMV verifier.

## 12) AWS `TranslateKeyMaterial`: ECDH And Wrapped-Key Inspection
Operations:
- `Derive ECDH key material`
- `Parse TR-31 key block`
- `Parse TR-34 B9 envelope`

Suggested use:
- Use `Derive ECDH key material` to reproduce the shared-secret or KDF stage.
- Use the TR-31 or TR-34 parsers to inspect the wrapped key containers involved in the exchange.

Notes:
- This helps with interoperability debugging.
- It does not recreate AWS’s HSM-side translate-and-rewrap behavior.

## 13) AWS `GenerateMac`: EMV MAC Preimage Review
Operations:
- `From Hex`
- `CMAC`
- `Take bytes`

Suggested use:
- Use this to validate assembled EMV message blocks and truncation behavior when you already know the scheme profile and session key.

Notes:
- AWS documents `GenerateMac` as supporting EMV MAC.
- This fork does not yet have a dedicated EMV MAC operation, so this remains a profile-specific starter rather than a generic implementation.

## 14) AWS `GeneratePinData`: Clear PIN Block Build
Operations:
- `Build PIN block`

Suggested use:
- Paste the clear PIN into the input field.
- Choose ISO format 0, 1, or 3.
- Provide the PAN when the selected format requires it.

Notes:
- This is useful for software test harnesses that need deterministic clear PIN-block construction before encryption.
- It does not yet implement PVV generation, IBM 3624 offsets, or encrypted AWS response semantics.

## 15) AWS `TranslatePinData`: Clear PIN Block Translation
Operations:
- `Translate PIN block`

Suggested use:
- Paste the source clear PIN block into the input field as hex.
- Choose the source and target formats.
- Provide source and target PAN values where required.

Notes:
- This is a software emulation helper for test-vector work.
- It does not yet emulate encrypted HSM-bound translation between PEK, BDK, or ECDH-derived keys.

## 16) AWS `VerifyPinData`: Clear PIN Block Inspection
Operations:
- `Parse PIN block`

Suggested use:
- Paste the clear PIN block into the input field as hex.
- Decode the PIN-block structure and compare the recovered PIN to your expected test data.

Notes:
- This is only structural verification today.
- It does not yet implement VISA PVV or IBM 3624 verification logic.

## Not Yet Implemented

These AWS operations are still valid emulation targets, but do not yet have recipe-equivalent support in this fork:
- `GenerateMacEmvPinChange`
- `GenerateAs2805KekValidation`

Why:
- They depend on PVV/IBM3624/issuer-script/AS2805-specific payment primitives that are not implemented here.

## Good Next Additions

If you want closer AWS coverage, the highest-value missing operations are:
1. PIN block encode/decode for ISO 9564 formats 0, 1, 3, and 4.
2. IBM 3624 and VISA PVV generation and verification.
3. ISO 9797 and AS2805-specific MAC generation and verification.
4. Dedicated EMV MAC and profile-specific EMV session-derivation helpers.
5. Clear-to-encrypted and encrypted-to-encrypted PIN translation flows.
6. TR-31 unwrap and rewrap helpers for dynamic-key workflows.
