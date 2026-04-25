# Payment Recipe Starters

These recipe starters are for software-only payment-crypto emulation, inspection, regression tests, and interoperability work.

For AWS operation mapping, see `AWS_PAYMENT_CRYPTOGRAPHY_RECIPES.md`.

## UI Arrangement

The `Payments` category is arranged in this order:
- payment-facing wrappers first
- EMV and card-validation flows next
- PIN and issuer-verification helpers after that
- key-derivation, KCV, and parser utilities next
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

## 6) Generate / Translate / Verify Payment PIN Data
Operations:
- `Generate Payment PIN Data`
- `Translate Payment PIN Data`
- `Verify Payment PIN Data`

Use this when:
- you want AWS-style PIN-data naming for clear ISO 9564 block flows

Input:
- `Generate Payment PIN Data`: clear PIN digits
- `Translate Payment PIN Data`: clear PIN block hex
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

## 9) Key Derivation And Validation
Operations:
- `Derive DUKPT Key`
- `Derive ECDH Key Material`
- `Calculate Payment KCV`
- `Generate AS2805 KEK Validation`

Use this when:
- you need transaction keys, shared secrets, KCVs, or AS2805-style KEK-validation lab values

Important assumptions:
- `Derive DUKPT Key` is TDES DUKPT, not AES DUKPT
- `Generate AS2805 KEK Validation` is an emulation-oriented helper and explicitly documents its simplifications in the operation comments

## 10) Key Container Inspection
Operations:
- `Parse TR-31 key block`
- `Parse TR-34 B9 envelope`

Use this when:
- you need to inspect inbound wrapped-key material or transport frames during testing

Input:
- full TR-31 or TR-34 payload as text or hex, depending on the operation comment

## Chaining Patterns

## A) DUKPT MAC
Operations:
- `Derive DUKPT Key`
- `Generate Payment MAC`

Flow:
- derive the transaction key first if you want to inspect it
- or use a DUKPT MAC method directly in `Generate Payment MAC`
- use the same KSN and BDK on verify

## B) ECDH Wrap / Unwrap
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

## C) Clear PIN Block To Encrypted PIN Data
Operations:
- `Generate Payment PIN Data` or `Build PIN Block`
- `Encrypt Payment Data`

Flow:
- generate the clear ISO PIN block first
- encrypt that block under the desired AES or TDES profile

## D) Re-Encrypt Payment Data
Operations:
- `Re-Encrypt Payment Data`

Flow:
- define the source decrypt profile
- define the target encrypt profile
- keep the payload in hex end to end

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

## H) AS2805 KEK Validation
Operations:
- `Generate AS2805 KEK Validation`
- `Calculate Payment KCV`

Flow:
- inspect the KEK with `Calculate Payment KCV`
- generate request or response RandomKeySend / RandomKeyReceive values with the AS2805 helper
