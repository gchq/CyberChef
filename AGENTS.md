# AGENTS.md

Guidance for AI agents (Claude Code, etc.) working on the **jsrsasign removal** in this repo.

Read [plan-jsrsasign.md](plan-jsrsasign.md) for the full migration plan. This file captures cross-PR conventions and workflow that must survive between sessions.

## Workflow

- **One PR per session.** Six PRs total — see the plan's "Phased plan" section. Don't try to fuse phases; each PR has its own test bundle that acts as the correctness gate.
- **Stop at "ready to commit." The human handles git.** Do all the implementation, fixture updates, lint/test/build runs, and plan updates — but do NOT `git add`, `git commit`, `git push`, or `gh pr create`. Leave the working tree dirty and hand back a summary of what's staged-worthy. Leon commits and opens the PR himself.
- **At the end of each session, update [plan-jsrsasign.md](plan-jsrsasign.md):**
  - Tick the PR in the "Status" block at the top.
  - Add an entry to the "Changelog" section at the bottom for any deviation from the original plan (chosen API differed, extra dep added, test fixture updated, gotcha discovered, scope adjusted).
  - Leave a one-line "Notes for next session" if anything is partially done or worth flagging.
- **Per-PR verification (must all pass before handing back):**
  - `npm run lint`
  - `npm test`
  - `npm run build`
  - `grep -rn "from \"jsrsasign\"" src/core/` — count strictly decreases from the previous PR

## Library decisions (don't relitigate)

- **ECDSA: `@noble/curves`, NOT Web Crypto.** Web Crypto refuses MD5/SHA-1 digests, which the existing UI exposes. `@noble/hashes/legacy` provides MD5/SHA-1.
- **X.509/CSR/CRL: `@peculiar/x509`** (plus `@peculiar/asn1-*` schemas as needed). Not `pkijs`.
- **SM2: `@noble/curves/sm2`.** Not `sm-crypto`.
- **DSA in `PubKeyFromPrivKey`: keep using `node-forge`** (already a dep, no new lib for a single op).
- **Generic ASN.1 dump: `asn1js`** (transitive via `@peculiar/x509` anyway).
- The "Not adopted, with reasons" list in the plan is final — don't reopen these choices without user input.

## Cross-PR coding conventions

- **PEM line endings: `\n` only.** No `\r\n`. The old jsrsasign output used `\r\n` in places; tests have been (or will be) updated to expect `\n`.
- **Hex coord padding: `.padStart(64, "0")`** after `bigint.toString(16)` for SM2/P-256 point coords. **P-521 uses 66 bytes (132 hex chars)**, not 64.
- **JWK field order:** build the object literal in this exact order so `JSON.stringify` emits it correctly: `{ kty, crv, x, y, d? }` for EC, `{ kty, n, e, d?, p?, q?, dp?, dq?, qi? }` for RSA. Insertion order is the serialization order.
- **ECDSA r/s leading-zero quirk:** `parseSigHexInHexRS` historically prepends `00` to r or s when the MSB is set (DER 2's-complement artefact). Replicate this — existing tests depend on it.
- **RFC 6979 determinism:** signature outputs *should* match jsrsasign byte-for-byte. If they diverge for a curve+digest combo, the signature is still valid — update the fixture and note it in the PR's changelog entry. Don't try to massage `@noble/curves` into matching.
- **Cosmetic drift in golden text outputs is accepted** for `ParseX509Certificate`, `ParseCSR`, `ParseX509CRL`, `ParseASN1HexString`. Update fixtures. Note in CHANGELOG in PR 6.
- **Cryptographic correctness is NOT negotiable.** SM2 ciphertext→plaintext fixtures in [tests/operations/tests/SM2.mjs](tests/operations/tests/SM2.mjs) must pass unchanged — those pin actual crypto behavior, not formatting.

## Shared helper modules

Created in PR 1 and PR 3. Use these instead of duplicating logic across operations:

- [src/core/lib/Asn1.mjs](src/core/lib/Asn1.mjs) (PR 1): `oidHexToInt`, `oidIntToHex`, `derToPem`, `dumpAsn1Hex`.
- [src/core/lib/Ecdsa.mjs](src/core/lib/Ecdsa.mjs) (PR 3): `loadEcKey`, `signEcdsa`, `verifyEcdsa`, signature-format converters, `isAsn1Hex`, `generateEcKeyPair`.
- [src/core/lib/PublicKey.mjs](src/core/lib/PublicKey.mjs) (extended in PR 5): `formatDnObj` accepts both legacy and `@peculiar/x509` `JsonName` shapes.
- [src/core/lib/SM2.mjs](src/core/lib/SM2.mjs) (rewritten in PR 2): preserves both GMT 0009 BBB and GMT 0010 C1C2C3/C1C3C2 ciphertext layouts.

## Key file locations

- Operations being migrated: [src/core/operations/](src/core/operations/) — 14 files, listed in the plan.
- Tests: [tests/operations/tests/](tests/operations/tests/) — golden fixtures live here.
- Dependency manifest: [package.json](package.json).

## When in doubt

- Check the gotcha section of the relevant PR in [plan-jsrsasign.md](plan-jsrsasign.md) before writing code.
- If you discover something the plan didn't anticipate, add a Changelog entry — don't silently work around it.
- If a test fixture needs updating, decide: is it cosmetic drift (OK, update it) or cryptographic divergence (stop and surface to the user)?
