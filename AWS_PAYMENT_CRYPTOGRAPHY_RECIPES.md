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
| `EncryptData` | `Direct` | `Encrypt Payment Data` |
| `DecryptData` | `Direct` | `Decrypt Payment Data` |
| `ReEncryptData` | `Direct` | `Re-Encrypt Payment Data` |
| `GenerateMac` | `Direct` | `Generate Payment MAC` or `Generate EMV MAC` |
| `VerifyMac` | `Direct` | `Verify Payment MAC` or `Verify EMV MAC` |
| `VerifyAuthRequestCryptogram` | `Direct` | `Verify EMV ARQC` |
| `GenerateCardValidationData` | `Direct` | `Generate Card Validation Data` |
| `VerifyCardValidationData` | `Direct` | `Verify Card Validation Data` |
| `GeneratePinData` | `Direct` / `Chained` | `Generate Payment PIN Data`, `Generate IBM 3624 PIN Offset`, `Generate VISA PVV` |
| `TranslatePinData` | `Direct` / `Chained` | `Translate Payment PIN Data` or clear PIN block plus cipher chaining |
| `VerifyPinData` | `Direct` | `Verify Payment PIN Data`, `Verify IBM 3624 PIN`, `Verify VISA PVV` |
| `TranslateKeyMaterial` | `Chained` | `Derive ECDH Key Material` + wrap/unwrap + TR-31/TR-34 helpers |
| `GenerateAs2805KekValidation` | `Emulated` | `Generate AS2805 KEK Validation` |
| `GenerateMacEmvPinChange` | `Direct` / `Emulated` | `Generate EMV MAC For PIN Change` |

## AWS `EncryptData`
Preferred operation:
- `Encrypt Payment Data`

Good chain:
- `Derive DUKPT Key` -> `Triple DES Encrypt`
- `Derive ECDH Key Material` -> KDF if needed -> `AES Encrypt`

Notes:
- use the payment wrapper when you want payment terminology in one operation
- use the generic ciphers directly when you need fine-grained mode control

## AWS `DecryptData`
Preferred operation:
- `Decrypt Payment Data`

Good chain:
- `Derive DUKPT Key` -> `Triple DES Decrypt`
- `Derive ECDH Key Material` -> KDF if needed -> `AES Decrypt`

## AWS `ReEncryptData`
Preferred operation:
- `Re-Encrypt Payment Data`

Good chain:
- `Decrypt Payment Data` -> `Encrypt Payment Data`

## AWS `GenerateMac`
Preferred operations:
- `Generate Payment MAC`
- `Generate EMV MAC`

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

Use `Generate EMV MAC` when:
- the AWS flow is EMV-session-key based rather than a static or DUKPT MAC key

## AWS `VerifyMac`
Preferred operations:
- `Verify Payment MAC`
- `Verify EMV MAC`

Use the same method, padding rule, and key context as generation.

## AWS `VerifyAuthRequestCryptogram`
Preferred operation:
- `Verify EMV ARQC`

Good chain:
- preassemble the ARQC input block
- derive or supply the session key
- verify the ARQC

Important assumption:
- current ARQC / ARPC support is the implemented AES-CMAC profile

## AWS `GenerateCardValidationData`
Preferred operation:
- `Generate Card Validation Data`

Profiles:
- CVV / CVC
- CVV2 / CVC2
- iCVV

## AWS `VerifyCardValidationData`
Preferred operation:
- `Verify Card Validation Data`

## AWS `GeneratePinData`
Preferred operations:
- `Generate Payment PIN Data`
- `Generate IBM 3624 PIN Offset`
- `Generate VISA PVV`

Use:
- `Generate Payment PIN Data` for clear ISO format `0`, `1`, and `3` PIN blocks
- `Generate IBM 3624 PIN Offset` for issuer-host offset workflows
- `Generate VISA PVV` for PVV workflows

Good chains:
- clear PIN -> `Generate Payment PIN Data` -> `Encrypt Payment Data`
- clear PIN -> `Generate IBM 3624 PIN Offset`
- clear PIN -> `Generate VISA PVV`

## AWS `TranslatePinData`
Preferred operation:
- `Translate Payment PIN Data`

Good chains:
- `Parse PIN Block` -> inspect -> `Translate PIN Block`
- `Decrypt Payment Data` -> `Translate Payment PIN Data` -> `Encrypt Payment Data`

Important assumption:
- the direct wrapper is for clear ISO PIN-block translation
- encrypted-key-custody semantics are still emulated by chaining

## AWS `VerifyPinData`
Preferred operations:
- `Verify Payment PIN Data`
- `Verify IBM 3624 PIN`
- `Verify VISA PVV`

Use:
- `Verify Payment PIN Data` for clear ISO PIN blocks
- `Verify IBM 3624 PIN` for issuer offset checks
- `Verify VISA PVV` for PVV checks

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
- `Generate AS2805 KEK Validation`

Important assumption:
- this is an explicit software emulation helper
- the operation comments call out that it does not claim exact HSM-side AS2805 node-initialization behavior

## AWS `GenerateMacEmvPinChange`
Preferred operation:
- `Generate EMV MAC For PIN Change`

Good chain:
- build or obtain the encrypted target PIN block
- assemble the issuer-script APDU body
- generate the PIN-change MAC

Important assumption:
- the helper expects the new PIN block to already be encrypted

## Common Chains

## A) DUKPT Request MAC
- `Generate Payment MAC`

Method:
- `DUKPT MAC Request CMAC`
- or `DUKPT ISO 9797-1 Algorithm 1`
- or `DUKPT ISO 9797-1 Algorithm 3`

## B) EMV Issuer Script MAC
- `Generate EMV MAC`
- `Verify EMV MAC`

## C) EMV PIN Change
- `Generate EMV MAC For PIN Change`

## D) Clear PIN To Encrypted PIN Data
- `Generate Payment PIN Data`
- `Encrypt Payment Data`

## E) ECDH-Based Key Translation Lab Flow
- `Derive ECDH Key Material`
- `AES Key Unwrap`
- `AES Key Wrap`
- `Parse TR-31 key block`
