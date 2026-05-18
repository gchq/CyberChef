# AWS Payment Cryptography Recipe Coverage

Owner:
- Jacob Marks, `https://jacobmarks.com`
- Fork home: `https://github.com/J8k3/CyberChef`

This guide maps AWS Payment Cryptography Data Plane operations to the current payment-facing CyberChef surface.
For validation posture, standards references, and release guardrails, see `PAYMENT_VALIDATION_AUDIT.md`.

Source baseline:
- AWS Payment Cryptography Data Plane API Reference: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/Welcome.html
- AWS Data Plane actions list: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_Operations.html

Coverage legend:
- `Direct`: there is a payment-facing operation or straightforward recipe chain for the software-emulation shape of the AWS action
- `Chained`: there is no single operation, but the flow is cleanly achievable by chaining existing operations
- `Emulated`: there is a dedicated operation, but the inline comments call out simplifications versus AWS or HSM custody semantics

## Coverage Summary

| AWS operation | Coverage | Use |
| --- | --- | --- |
| `EncryptData` | `Direct` | `Payment Encrypt Data` |
| `DecryptData` | `Direct` | `Payment Decrypt Data` |
| `ReEncryptData` | `Direct` | `Payment Re-Encrypt Data` |
| `GenerateMac` | `Direct` | `MAC Generate` or `EMV Generate MAC` |
| `VerifyMac` | `Direct` | `MAC Verify` or `EMV Verify MAC` |
| `VerifyAuthRequestCryptogram` | `Direct` | `EMV Verify ARQC` |
| `GenerateCardValidationData` | `Direct` | `Card Validation Data Generate` |
| `VerifyCardValidationData` | `Direct` | `Card Validation Data Verify` |
| `GeneratePinData` | `Direct` / `Chained` | `PIN Data Generate`, `IBM 3624 Generate PIN Offset`, `VISA PVV Generate` |
| `TranslatePinData` | `Direct` / `Chained` | `Translate Payment PIN Data` or clear PIN block plus cipher chaining |
| `VerifyPinData` | `Direct` | `PIN Data Verify`, `IBM 3624 Verify PIN`, `VISA PVV Verify` |
| `TranslateKeyMaterial` | `Chained` | `Derive ECDH Key Material` + wrap/unwrap + TR-31/TR-34 helpers |
| `GenerateAs2805KekValidation` | `Emulated` | `AS2805 Generate KEK Validation` |
| `GenerateMacEmvPinChange` | `Direct` / `Emulated` | `EMV Generate MAC (PIN Change)` |

## AWS `EncryptData`
Preferred operation:
- `Payment Encrypt Data`

Good chain:
- `DUKPT Derive TDES Key` -> `Triple DES Encrypt`
- `Derive ECDH Key Material` -> KDF if needed -> `AES Encrypt`

Notes:
- use the payment wrapper when you want payment terminology in one operation
- use the generic ciphers directly when you need fine-grained mode control

## AWS `DecryptData`
Preferred operation:
- `Payment Decrypt Data`

Good chain:
- `DUKPT Derive TDES Key` -> `Triple DES Decrypt`
- `Derive ECDH Key Material` -> KDF if needed -> `AES Decrypt`

## AWS `ReEncryptData`
Preferred operation:
- `Payment Re-Encrypt Data`

Good chain:
- `Payment Decrypt Data` -> `Payment Encrypt Data`

## AWS `GenerateMac`
Preferred operations:
- `MAC Generate`
- `EMV Generate MAC`

Current MAC coverage:
- HMAC SHA-224 / 256 / 384 / 512
- AES-CMAC
- TDES-CMAC
- ISO 9797-1 Algorithm 1
- ISO 9797-1 Algorithm 3
- AS2805-4.1
- DUKPT TDES-CMAC
- DUKPT ISO 9797-1 Algorithm 1
- DUKPT ISO 9797-1 Algorithm 3
- EMV retail-MAC style generation with a provided session key

Use `EMV Generate MAC` when:
- the AWS flow is EMV-session-key based rather than a static or DUKPT MAC key

## AWS `VerifyMac`
Preferred operations:
- `MAC Verify`
- `EMV Verify MAC`

Use the same method, padding rule, and key context as generation.

## AWS `VerifyAuthRequestCryptogram`
Preferred operation:
- `EMV Verify ARQC`

Good chain:
- preassemble the ARQC input block
- derive or supply the session key
- verify the ARQC

Important assumption:
- current ARQC / ARPC support is the implemented AES-CMAC profile

## AWS `GenerateCardValidationData`
Preferred operation:
- `Card Validation Data Generate`

Profiles:
- CVV / CVC
- CVV2 / CVC2
- iCVV

## AWS `VerifyCardValidationData`
Preferred operation:
- `Card Validation Data Verify`

## AWS `GeneratePinData`
Preferred operations:
- `PIN Data Generate`
- `IBM 3624 Generate PIN Offset`
- `VISA PVV Generate`

Use:
- `PIN Data Generate` for clear ISO format `0`, `1`, and `3` PIN blocks
- `IBM 3624 Generate PIN Offset` for issuer-host offset workflows
- `VISA PVV Generate` for PVV workflows

Good chains:
- clear PIN -> `PIN Data Generate` -> `Payment Encrypt Data`
- clear PIN -> `IBM 3624 Generate PIN Offset`
- clear PIN -> `VISA PVV Generate`

## AWS `TranslatePinData`
Preferred operation:
- `Translate Payment PIN Data`

Good chains:
- `PIN Block Parse` -> inspect -> `PIN Block Translate`
- `Payment Decrypt Data` -> `Translate Payment PIN Data` -> `Payment Encrypt Data`

Important assumption:
- the direct wrapper is for clear ISO PIN-block translation
- encrypted-key-custody semantics are still emulated by chaining

## AWS `VerifyPinData`
Preferred operations:
- `PIN Data Verify`
- `IBM 3624 Verify PIN`
- `VISA PVV Verify`

Use:
- `PIN Data Verify` for clear ISO PIN blocks
- `IBM 3624 Verify PIN` for issuer offset checks
- `VISA PVV Verify` for PVV checks

## AWS `TranslateKeyMaterial`
Preferred chain:
- `Derive ECDH Key Material`
- KDF if needed
- `AES Key Wrap` or `AES Key Unwrap`
- `Parse TR-31 key block`
- `Parse TR-34 B9 envelope`

Important assumption:
- this is a recipe chain, not a single HSM-like rewrap boundary

## AWS `GenerateAs2805KekValidation`
Preferred operation:
- `AS2805 Generate KEK Validation`

Important assumption:
- this is an explicit software emulation helper
- the operation comments call out that it does not claim exact HSM-side AS2805 node-initialization behavior

## AWS `GenerateMacEmvPinChange`
Preferred operation:
- `EMV Generate MAC (PIN Change)`

Good chain:
- build or obtain the encrypted target PIN block
- assemble the issuer-script APDU body
- generate the PIN-change MAC

Important assumption:
- the helper expects the new PIN block to already be encrypted

## Common Chains

## A) DUKPT Request MAC
- `MAC Generate`

Method:
- `DUKPT MAC Request CMAC`
- or `DUKPT ISO 9797-1 Algorithm 1`
- or `DUKPT ISO 9797-1 Algorithm 3`

## B) EMV Issuer Script MAC
- `EMV Generate MAC`
- `EMV Verify MAC`

## C) EMV PIN Change
- `EMV Generate MAC (PIN Change)`

## D) Clear PIN To Encrypted PIN Data
- `PIN Data Generate`
- `Payment Encrypt Data`

## E) ECDH-Based Key Translation Lab Flow
- `Derive ECDH Key Material`
- `AES Key Unwrap`
- `AES Key Wrap`
- `Parse TR-31 key block`
