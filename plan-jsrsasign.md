# Replace jsrsasign in CyberChef

> See [AGENTS.md](AGENTS.md) for cross-PR conventions, workflow, and library decisions agents must follow.

## Status

- [x] PR 1 — Setup + ASN.1 utilities
- [ ] PR 2 — SM2 rewrite
- [ ] PR 3 — ECDSA primitives
- [ ] PR 4 — PEM/JWK conversion + key extraction
- [ ] PR 5 — X.509 / CSR / CRL parsing
- [ ] PR 6 — Removal

_Notes for next session:_
- **PR 2 blocker:** `@noble/curves` v2 dropped the `/sm2` subpath. v2 exposes only `nist`, `secp256k1`, `bls12-381`, `bn254`, `ed25519`, `ed448` and the `abstract/*` primitives. Before starting PR 2, either pin `@noble/curves` to v1 (which still ships sm2 — but check what other v1→v2 API gaps that introduces) or build SM2 on top of the abstract Weierstrass primitive in `@noble/curves/abstract/weierstrass.js` (curve parameters published in GM/T 0003-2012).
- **PR 5 blocker:** `@peculiar/x509` v2 needs a `reflect-metadata` polyfill at every entry point — PR 1 pinned to `^1.14.3` to avoid that. Stay on v1 unless the polyfill cost gets resolved.

## Context

[jsrsasign](https://github.com/kjur/jsrsasign) (currently pinned at `^11.1.3` in [package.json:148](package.json#L148)) has [announced end-of-support](https://github.com/kjur/jsrsasign/blob/master/README.md#end-of-support-announcement-for-jsrsasign). It is used in 14 operations and one library file in CyberChef and covers X.509/CSR/CRL parsing, ECDSA signing/verification, key format conversion, ASN.1/OID utilities, and SM2 elliptic-curve encryption.

Continuing to ship an unmaintained crypto library is a security risk. This plan replaces every jsrsasign call with proven, actively-maintained alternatives, then removes the dependency entirely.

## Library choices

Add these production dependencies, all MIT/BSD-3 (compatible with CyberChef's Apache-2.0 license), all pure-JS, all browser + Node:

| Library | Used for | Why this one |
|---|---|---|
| **[@peculiar/x509](https://github.com/PeculiarVentures/x509)** (^1.14) | X.509 certs, PKCS#10 CSRs, X.509 CRLs, SPKI/PKCS#8 key parsing | Peculiar Ventures specialise in browser PKI. Built on Web Crypto + asn1js. Used by Microsoft, Cloudflare. MIT. |
| **[asn1js](https://github.com/PeculiarVentures/ASN1.js)** (^3) | Generic ASN.1 parse + tree dump for `ParseASN1HexString` | Same author. BSD-3. Pulled in transitively by @peculiar/x509 anyway. |
| **[@noble/curves](https://github.com/paulmillr/noble-curves)** (^2) | ECDSA sign/verify, signature format conversion, key generation, SM2 curve | Audited by Cure53, Trail of Bits, Kudelski. Zero dependencies. Used by MetaMask, Coinbase, Ethereum Foundation. Built-in `@noble/curves/sm2`. Same author as the already-installed `@noble/hashes`. |
| **node-forge** (already a dep) | DSA path inside `PubKeyFromPrivKey` only | Avoids adding another lib just for DSA. |

**Not adopted, with reasons:** `pkijs` (covered by @peculiar/x509); `jose`/panva (overkill for two JWK round-trip ops); `sm-crypto`/`sm-crypto-v2` (@noble/curves/sm2 handles it); native Web Crypto for ECDSA (refuses MD5/SHA-1 digests that the UI exposes, and JWK/format gymnastics outweigh the dependency saving).

**End state:** `npm uninstall jsrsasign`; remove from [package.json](package.json).

## Decisions confirmed with user

- Phased delivery: **6 PRs**, one per phase below.
- Output fidelity: **cosmetic drift accepted** for golden text-output tests (`ParseX509Certificate`, `ParseCSR`, `ParseX509CRL`, `ParseASN1HexString`). Update fixtures, document in CHANGELOG.
- DSA in `PubKeyFromPrivKey`: **keep via node-forge** (no user-visible regression).
- ECDSA signature fixtures: **update to @noble values** if RFC 6979 outputs diverge (signatures remain valid).

## Files to be modified

**14 operations** (all under [src/core/operations/](src/core/operations/)):
- ASN.1 / encoding: `HexToObjectIdentifier.mjs`, `ObjectIdentifierToHex.mjs`, `HexToPEM.mjs`, `ParseASN1HexString.mjs`
- X.509 / CSR / CRL: `ParseX509Certificate.mjs`, `PubKeyFromCert.mjs`, `ParseCSR.mjs`, `ParseX509CRL.mjs`
- Key conversion: `PEMToJWK.mjs`, `JWKToPem.mjs`, `PubKeyFromPrivKey.mjs`
- ECDSA: `ECDSASign.mjs`, `ECDSAVerify.mjs`, `ECDSASignatureConversion.mjs`, `GenerateECDSAKeyPair.mjs`

**Library files:**
- [src/core/lib/SM2.mjs](src/core/lib/SM2.mjs) — full rewrite, drop jsrsasign
- [src/core/lib/PublicKey.mjs](src/core/lib/PublicKey.mjs) — extend `formatDnObj` to accept @peculiar/x509's `Name.toJSON()` shape
- **NEW** [src/core/lib/Asn1.mjs](src/core/lib/Asn1.mjs) — `oidHexToInt`, `oidIntToHex`, `derToPem`, `dumpAsn1Hex`
- **NEW** [src/core/lib/Ecdsa.mjs](src/core/lib/Ecdsa.mjs) — shared ECDSA helpers (key load, sign/verify, sig format conversions)

**Build/manifest:**
- [package.json](package.json) — add 3 deps in PR 1, remove jsrsasign in PR 6
- `CHANGELOG.md` — note in PR 6

## Phased plan

### PR 1 — Setup + ASN.1 utilities (PublicKey bundle)

**Goal:** Add the three new deps, ship the `Asn1.mjs` helper module, migrate the four utility operations.

1. `npm install --save @peculiar/x509 asn1js @noble/curves`. Confirm webpack builds; smoke-test `npm test`.
2. Create [src/core/lib/Asn1.mjs](src/core/lib/Asn1.mjs):
   - `oidHexToInt(hex)` — inline BER OID decode (~25 lines, handles arc0/arc1 combined byte and base-128 multibyte arcs).
   - `oidIntToHex(oid)` — inverse.
   - `derToPem(hex, label)` — base64 + 64-col wrap with `\n` line endings.
   - `dumpAsn1Hex(hex, { truncate, startIndex })` — walks `asn1js.fromBER` output and emits an indented tree.
3. Migrate:
   - [HexToObjectIdentifier.mjs](src/core/operations/HexToObjectIdentifier.mjs): `r.KJUR.asn1.ASN1Util.oidHexToInt` → `oidHexToInt`.
   - [ObjectIdentifierToHex.mjs](src/core/operations/ObjectIdentifierToHex.mjs): `r.KJUR.asn1.ASN1Util.oidIntToHex` → `oidIntToHex`.
   - [HexToPEM.mjs](src/core/operations/HexToPEM.mjs): `r.KJUR.asn1.ASN1Util.getPEMStringFromHex` → `derToPem`.
   - [ParseASN1HexString.mjs](src/core/operations/ParseASN1HexString.mjs): `r.ASN1HEX.dump` → `dumpAsn1Hex`.
4. Tests:
   - Add round-trip OID tests (sample OIDs incl. `2.5.4.3`, `1.3.6.1.4.1.311.2.1.4`, edge case with arc > 127).
   - Update `ParseASN1HexString` golden output to new tree format (drift allowed).

**Risks:** OID encoding edge cases — verify the `40·a + b` first byte and base-128 arcs.

### PR 2 — SM2 (Ciphers bundle)

**Goal:** Rewrite [src/core/lib/SM2.mjs](src/core/lib/SM2.mjs) on top of `@noble/curves/sm2`.

API mapping:
| jsrsasign | @noble/curves/sm2 |
|---|---|
| `r.crypto.ECParameterDB.regist("sm2p256v1", …)` + `getByName` | `import { sm2 } from "@noble/curves/sm2"` (curve built-in) |
| `r.SecureRandom` + `new r.BigInteger(bits, rng).mod(n-1)+1` | `sm2.utils.randomPrivateKey()` |
| `ecParams.G.multiply(k)` | `sm2.Point.BASE.multiply(k)` (k is `bigint`) |
| `ecParams.curve.decodePointHex("04"+x+y)` | `sm2.Point.fromHex("04"+x+y)` |
| `point.getX().toBigInteger()` / `getY()` | `point.toAffine().x` / `.y` (both `bigint`) |
| `point.isInfinity()` | `point.is0()` (or `equals(sm2.Point.ZERO)`) |
| `new r.BigInteger(hex, 16)` | `BigInt("0x" + hex)` |

**Gotchas:**
- Pad point coords with `.padStart(64, "0")` after `bigint.toString(16)` — existing tests depend on fixed-width hex.
- KDF logic (SM3-based) is already pure-JS; do **not** change it.
- Preserve both ciphertext layouts (GMT 0009 BBB vs GMT 0010 C1C2C3/C1C3C2) — keep current format-string handling.

**Tests:** [tests/operations/tests/SM2.mjs](tests/operations/tests/SM2.mjs) has hard-coded ciphertext→plaintext fixtures. They MUST pass unchanged — they pin cryptographic correctness.

### PR 3 — ECDSA primitives (Ciphers bundle)

**Goal:** Migrate the four ECDSA operations to `@noble/curves` + `@noble/hashes`.

1. Create [src/core/lib/Ecdsa.mjs](src/core/lib/Ecdsa.mjs) with shared helpers:
   - `loadEcKey(pem)` — parse SEC1 / PKCS#8 / SPKI via `@peculiar/asn1-ecc` + `@peculiar/asn1-pkcs8`; return `{ curve, isPrivate, d?, x, y, jwk }`.
   - `signEcdsa(curve, dBytes, digest)`, `verifyEcdsa(curve, qBytes, digest, sigDer)`.
   - `asn1SigToConcatHex`, `concatHexToAsn1Sig`, `parseAsn1SigToHexRS`, `hexRSToAsn1Sig` — wrap `Signature.fromBytes(.., 'der'|'compact')` and `.toBytes(format)`.
   - `isAsn1Hex(hex)` — try `asn1js.fromBER`.
   - `generateEcKeyPair(curveName)` — `curve.utils.randomPrivateKey()`, build SPKI + PKCS#8 via `@peculiar/asn1-*` schemas, derive JWK.

2. Migrate operations:
   - [ECDSASign.mjs](src/core/operations/ECDSASign.mjs): use `loadEcKey` + hash (md5/sha1/sha256/sha384/sha512 from `@noble/hashes`; **md5/sha1 come from `@noble/hashes/legacy`**) + `signEcdsa`. Format conversion via the helpers.
   - [ECDSAVerify.mjs](src/core/operations/ECDSAVerify.mjs): `isAsn1Hex` for input-format auto-detect; `verifyEcdsa`.
   - [ECDSASignatureConversion.mjs](src/core/operations/ECDSASignatureConversion.mjs): format conversions only — no key handling.
   - [GenerateECDSAKeyPair.mjs](src/core/operations/GenerateECDSAKeyPair.mjs): `generateEcKeyPair`; drop the `\r` stripping (was a jsrsasign artefact).

**Gotchas:**
- **MD5/SHA-1 digests** — `@noble/hashes/legacy` (the v2 split). Web Crypto cannot do this, which is why we chose `@noble/curves`.
- **P-521 byte length is 66**, not 65 — important for P1363 padding and JWK `x`/`y` encoding.
- **`parseSigHexInHexRS`** historically returns r/s with a leading `00` when the MSB is set (DER 2's-complement artefact). Replicate this — tests depend on it.
- **RFC 6979 determinism** — outputs should match jsrsasign byte-for-byte. If they don't, update fixtures (signatures still valid; document in CHANGELOG).
- **JWK field ordering** for the JWK output of `GenerateECDSAKeyPair`: build the literal as `{kty, crv, x, y, d?}` — `JSON.stringify` preserves insertion order.

**Tests:** [tests/operations/tests/ECDSA.mjs](tests/operations/tests/ECDSA.mjs) has 83 tests covering all curves × digests × formats. Run; update fixtures where needed.

### PR 4 — PEM/JWK conversion + key extraction (PublicKey bundle)

**Goal:** Migrate [PEMToJWK.mjs](src/core/operations/PEMToJWK.mjs), [JWKToPem.mjs](src/core/operations/JWKToPem.mjs), [PubKeyFromPrivKey.mjs](src/core/operations/PubKeyFromPrivKey.mjs).

API mapping:
| jsrsasign | Replacement |
|---|---|
| `r.KEYUTIL.getKey(pem)` RSA | `node-forge` `pki.privateKeyFromPem` / `publicKeyFromPem` |
| `r.KEYUTIL.getKey(pem)` EC | `loadEcKey` from `Ecdsa.mjs` |
| `r.KEYUTIL.getKey(pem)` DSA | `node-forge` DSA parsing |
| `r.KEYUTIL.getKey(jwk)` | Inline: detect `kty`, dispatch to RSA / EC builders |
| `r.KEYUTIL.getJWKFromKey(key)` | Inline literal `{ kty, …, [d] }` |
| `r.KEYUTIL.getPEM(key)` SPKI | `@peculiar/x509` `PublicKey(spki).toString("pem")` |
| `r.KEYUTIL.getPEM(key, "PKCS8PRV")` | Build PKCS#8 via `@peculiar/asn1-pkcs8`'s `PrivateKeyInfo` |
| `new r.RSAKey().setPublic(n, e)` + getPEM | `node-forge` `pki.setRsaPublicKey(n, e)` + `publicKeyToPem` |
| `new r.KJUR.crypto.ECDSA({curve}).setPublicKeyHex/generatePublicKeyHex` | Derive Q with `curve.getPublicKey(d, false)`; build SPKI |
| `new r.KJUR.crypto.DSA().setPublic(p, q, g, y)` | `node-forge` DSA public key + `publicKeyToPem` |

**Gotchas:**
- JWK field order and PEM line endings (`\n` not `\r\n`) — see PR 3.
- `JWKToPem`'s `PKCS8PRV` output: build via `@peculiar/asn1-pkcs8` + the algorithm-specific key schema (RSA or EC).
- DSA PKCS#8 with no `y`: keep the current "unsupported" throw — test already accepts it.

**Tests:** [tests/operations/tests/JWK.mjs](tests/operations/tests/JWK.mjs), [tests/operations/tests/PubKeyFromPrivKey.mjs](tests/operations/tests/PubKeyFromPrivKey.mjs) — should pass with minor whitespace adjustments.

### PR 5 — X.509 / CSR / CRL parsing (PublicKey bundle)

**Goal:** Migrate the four cert-family operations to `@peculiar/x509`.

1. **Before any code changes:** add a regression test for [ParseX509Certificate.mjs](src/core/operations/ParseX509Certificate.mjs) (currently uncovered — confirm with `ls tests/operations/tests/ | grep -i x509certificate`). Use the existing test certs from [PubKeyFromCert.mjs](tests/operations/tests/PubKeyFromCert.mjs).
2. Extend [src/core/lib/PublicKey.mjs](src/core/lib/PublicKey.mjs): adapt `formatDnObj` to accept either the legacy `{array: [[{type, value}]]}` shape OR @peculiar/x509's `JsonName` array shape.
3. Migrate:

**`ParseX509Certificate`:**
| jsrsasign | @peculiar/x509 |
|---|---|
| `new r.X509(); readCertHex/readCertPEM` | `new X509Certificate(input)` (accepts PEM string or BufferSource) |
| `cert.hex` | `bytesToHex(cert.rawData)` |
| `cert.getSerialNumberHex()` | `cert.serialNumber` |
| `cert.getIssuer()` / `getSubject()` | `cert.issuerName.toJSON()` / `cert.subjectName.toJSON()` → `formatDnObj` |
| `cert.getPublicKey()` | `cert.publicKey`; parse `rawData` with `@peculiar/asn1-rsa` `RSAPublicKey` or `@peculiar/asn1-ecc` `ECPoint` to extract `n`/`e` or `(x, y)` |
| `cert.getSignatureValueHex()` | `bytesToHex(cert.signature)` |
| `cert.version` | `cert.version` |
| `cert.getSignatureAlgorithm*` | `cert.signatureAlgorithm.name` |
| `cert.getNotBefore()` / `getNotAfter()` | `cert.notBefore` / `cert.notAfter` (`Date`) — reformat to the existing yymmddHHMMSSZ string |
| `cert.getInfo()` extensions text | Iterate `cert.extensions`, format known types (BasicConstraints, KeyUsage, EKU, SAN, AKI, SKI, CRLDistributionPoints, AIA) — reuse formatters in current [ParseCSR.mjs](src/core/operations/ParseCSR.mjs) |
| `r.BigInteger` keylen | native `BigInt("0x"+hex)` |

**`PubKeyFromCert`:** `new X509Certificate(pem).publicKey.toString("pem")`.

**`ParseCSR`:**
| jsrsasign | @peculiar/x509 |
|---|---|
| `r.KJUR.asn1.csr.CSRUtil.getParam(input)` | `new Pkcs10CertificateRequest(input)` |
| `csrParam.sbjpubkey` | `csr.publicKey.toString("pem")` |
| `csrParam.sigalg` | `csr.signatureAlgorithm.name` |
| `csrParam.sighex` | `bytesToHex(csr.signature)` |
| `csrParam.extreq` | walk `csr.attributes`, find OID `1.2.840.113549.1.9.14`, decode with `@peculiar/asn1-pkcs9` |

**`ParseX509CRL`:**
| jsrsasign | @peculiar/x509 |
|---|---|
| `new r.X509CRL(input)` | `new X509Crl(input)` (convert hex input → `Uint8Array` first) |
| `crl.getVersion / SignatureAlgorithm* / Issuer / ThisUpdate / NextUpdate` | `crl.version / signatureAlgorithm.name / issuer / thisUpdate / nextUpdate` |
| `crl.getParam().ext` | `crl.extensions` |
| `crl.getRevCertArray()` | `crl.entries` (each has `serialNumber`, `revocationDate`, `extensions`) |
| `crl.getSignatureValueHex()` | `bytesToHex(crl.signature)` |

**Gotchas:**
- `cert.getInfo()` is the trickiest dependency — the current op extracts extensions text by string-splitting on `"X509v3 Extensions:\n"` and `"signature"`. Replace with a real extension walker (reuse `formatGeneralNames`, KeyUsage bit mapping, etc. from existing `ParseCSR.mjs`).
- CRL hex input: convert hex → `Uint8Array` before passing to `X509Crl`.
- DSA-in-cert: rare; use `@peculiar/asn1-x509` DSA params or fall back to a placeholder text block.
- Date formatting: produce both raw `yymmddHHMMSSZ` and a human-readable form, as currently displayed.

**Tests:** Update goldens for [ParseCSR.mjs](tests/operations/tests/ParseCSR.mjs), [ParseX509CRL.mjs](tests/operations/tests/ParseX509CRL.mjs), [PubKeyFromCert.mjs](tests/operations/tests/PubKeyFromCert.mjs) as needed. Add fixtures for the new `ParseX509Certificate` test from step 1.

### PR 6 — Removal

1. `grep -rn jsrsasign src/` — must return zero matches.
2. `npm uninstall jsrsasign`; remove from [package.json](package.json) dependencies.
3. `npm run lint && npm test` — full suite green.
4. `npm run build` — confirm bundle builds; check PublicKey and Ciphers chunk size deltas.
5. Update `CHANGELOG.md`: removed jsrsasign; added @peculiar/x509, asn1js, @noble/curves; note any cosmetic output-format changes in the affected ops.

## Verification

After **each PR:**
- `npm run lint`
- `npm test` (Node + browser test suites)
- `npm run build` succeeds
- `grep -rn "from \"jsrsasign\"" src/core/` shrinks monotonically toward zero

After **PR 6:**
- `grep -rn jsrsasign .` returns zero results outside `package-lock.json` and `CHANGELOG.md`
- Manual UI smoke test: launch `npm start`, try each migrated operation in the browser with representative input
- Check bundle size: `npm run build` and compare `web/assets/*.js` sizes against the pre-migration baseline

## Open follow-ups (not in scope)

- Audit other crypto deps (`crypto-api`, `crypto-js`, `node-forge`) for similar end-of-life risk.
- Consider whether `crypto-api` (used for SM3 in [SM2.mjs](src/core/lib/SM2.mjs)) could also be retired in favour of `@noble/hashes/sm3` in a future cleanup.

## Changelog

Record deviations from the original plan here, newest at the top. One bullet per change: what changed, why, and which PR.

### PR 1 — 2026-05-17
- Pinned `@peculiar/x509` to `^1.14.3` instead of the latest (`2.x`). v2 hard-requires a `reflect-metadata` import at every entry point and the plan didn't budget for polyfilling every webpack chunk. Sticking with v1 keeps the bundle changes scoped to this PR.
- `@noble/curves` installed at `^2.2.0`. v2 no longer exports an `/sm2` subpath — see PR 2 note in "Notes for next session" above.
- `derToPem` was deliberately made lenient (whitespace stripped, odd length left-padded with `0`, non-hex chars treated as nibble `0`) to preserve the recipe-API tests that piped non-hex output from `To Morse Code` through `Hex to PEM`. The actual base64 emitted now follows standard byte-pair semantics, not jsrsasign's quirky `hex2b64` (3-hex-chars-→-2-base64-chars) layout — so the expected outputs in `tests/node/tests/nodeApi.mjs` for those recipe-format tests were regenerated.
- `dumpAsn1Hex` returns a plain `ASN.1 parse error: …` string when asn1js can't make sense of the input, rather than throwing. jsrsasign produced a best-effort `UNKNOWN(<tag>) <bytes>` dump in this case; replicating that on asn1js would be a meaningful chunk of code and the operation has no automated-fixture exposure of the difference, so we accepted the drift.
- PEM line endings switched from `\r\n` to `\n` (per the cross-PR convention in [AGENTS.md](AGENTS.md)). Updated the `Hex to PEM` and `Parse ASN.1 hex string` golden tests in `tests/node/tests/operations.mjs`.
- New per-op fixture file [tests/operations/tests/ASN1.mjs](tests/operations/tests/ASN1.mjs) covers OID round-trips, the multi-byte OID arc edge case, PEM line wrapping, and basic ASN.1 dumps. Wired in via `tests/operations/index.mjs`.

<!-- e.g.
### PR 2 — 2026-05-20
- Added `@noble/hashes` peer-dep bump (was on ^1.x, needed ^2 for the `legacy` subpath). No code impact.
- SM2 ciphertext fixture #3 was already wrong (decoded to the wrong plaintext under jsrsasign too) — confirmed via independent SM2 implementation, regenerated fixture.
-->

