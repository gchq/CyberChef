# Cryptography Implementation Guide

This document captures the architectural decisions and coding conventions established during the migration away from `jsrsasign`. It serves as a reference for understanding library choices, implementation patterns, and maintenance of cryptographic operations.

## Library Choices

The following libraries were selected for specific cryptographic operations. These decisions prioritize compatibility with the existing CyberChef API surface and cryptographic correctness.

### ECDSA: `@noble/curves`

Uses `@noble/curves` with `@noble/hashes/legacy` for MD5/SHA-1 digests.

**Why not Web Crypto?** The Web Crypto API refuses MD5 and SHA-1 digests, which the CyberChef UI exposes to users. `@noble/curves` with legacy hash support maintains this functionality.

### X.509 / CSR / CRL: `@peculiar/x509`

Uses `@peculiar/x509` for certificate, CSR, and CRL parsing and generation, with `@peculiar/asn1-*` schema packages as needed.

**Why not pkijs?** `@peculiar/x509` offers a cleaner API better suited to CyberChef's operation model.

### SM2: `@noble/curves/sm2`

Uses the SM2 implementation from `@noble/curves`.

**Why not sm-crypto?** `@noble/curves` provides a reliable, actively maintained SM2 implementation.

### DSA: `node-forge`

The `PubKeyFromPrivKey` operation continues to use `node-forge` for DSA key generation.

**Why?** `node-forge` is already a project dependency, and DSA is a single, localized operation not worth introducing a new library for.

### Generic ASN.1 Dump: `asn1js`

Uses `asn1js` for generic ASN.1 hex structure dumping.

**Note:** This is a transitive dependency of `@peculiar/x509` and requires no additional imports for most use cases.

## Coding Conventions

These conventions ensure consistency across cryptographic operations and maintain compatibility with existing test fixtures.

### PEM Line Endings

Use `\n` only for PEM-encoded output. Do not use `\r\n`.

The legacy `jsrsasign` output used `\r\n` in some cases. All test fixtures have been updated to expect `\n` exclusively.

### Hex Coordinate Padding

When converting elliptic curve point coordinates from `bigint` to hex:

- **P-256 and SM2:** Use `.padStart(64, "0")` (32 bytes = 64 hex characters)
- **P-521:** Use `.padStart(132, "0")` (66 bytes = 132 hex characters)

Apply this after calling `bigint.toString(16)`.

### JWK Field Ordering

Build JWK objects using literal syntax in this exact order so `JSON.stringify` emits fields in the correct sequence:

**Elliptic Curve:**
```javascript
{ kty, crv, x, y, d? }
```

**RSA:**
```javascript
{ kty, n, e, d?, p?, q?, dp?, dq?, qi? }
```

JavaScript preserves insertion order for object properties, and downstream consumers may depend on this ordering.

### ECDSA r/s Leading-Zero Quirk

The `parseSigHexInHexRS` function historically prepends `00` to the r or s component when its most significant bit is set. This is a quirk from DER 2's-complement encoding.

**Replicate this behavior.** Existing test fixtures depend on it, and changing it breaks compatibility.

### RFC 6979 Determinism

ECDSA signature outputs from `@noble/curves` *should* match `jsrsasign` byte-for-byte when using the same curve and digest algorithm.

**If they diverge:** The signature is still cryptographically valid. Update the test fixture and document the divergence in the changelog. Do not attempt to massage the library output to force a match.

### Golden Output Cosmetic Drift

For text-based operations that dump parsed structures (`ParseX509Certificate`, `ParseCSR`, `ParseX509CRL`, `ParseASN1HexString`), minor formatting differences between `jsrsasign` and the new implementation are acceptable.

**Action:** Update the test fixture and note the change in the changelog.

### Cryptographic Correctness is Non-Negotiable

Fixture data that exercises actual cryptographic operations (e.g., SM2 ciphertext→plaintext transformations in [tests/operations/tests/SM2.mjs](tests/operations/tests/SM2.mjs)) must pass unchanged. These fixtures pin real cryptographic behavior and cannot be updated cosmetically.

## Shared Helper Modules

To avoid duplicating logic across operations, use these utility modules:

### [src/core/lib/Asn1.mjs](src/core/lib/Asn1.mjs)

ASN.1 utilities for OID and DER manipulation:
- `oidHexToInt()` — convert ASN.1 OID hex encoding to integer dotted notation
- `oidIntToHex()` — convert integer dotted notation to ASN.1 OID hex
- `derToPem()` — wrap DER bytes in PEM format
- `dumpAsn1Hex()` — generic ASN.1 hex structure dump (uses `asn1js`)

### [src/core/lib/Ecdsa.mjs](src/core/lib/Ecdsa.mjs)

ECDSA operations with `@noble/curves`:
- `loadEcKey()` — parse EC private/public keys from PEM or JWK
- `signEcdsa()` — sign data with an EC private key
- `verifyEcdsa()` — verify an ECDSA signature
- Signature format converters (ASN.1 DER ↔ r/s hex format)
- `isAsn1Hex()` — detect ASN.1 DER-encoded data
- `generateEcKeyPair()` — generate a new EC key pair

### [src/core/lib/PublicKey.mjs](src/core/lib/PublicKey.mjs)

Public key utilities and DN formatting. The `formatDnObj()` function handles both legacy jsrsasign DN objects and `@peculiar/x509` `JsonName` shapes for backward compatibility.

### [src/core/lib/SM2.mjs](src/core/lib/SM2.mjs)

SM2 encryption and decryption with support for multiple ciphertext layouts:
- GMT 0009 BBB format
- GMT 0010 C1C2C3 format
- GMT 0010 C1C3C2 format

Preserves compatibility with existing test fixtures for all three layouts.

## Key File Locations

- **Cryptographic operations:** [src/core/operations/](src/core/operations/)
- **Test fixtures:** [tests/operations/tests/](tests/operations/tests/) — golden output fixtures live here
- **Dependencies:** [package.json](package.json)
- **Library modules:** [src/core/lib/](src/core/lib/)
