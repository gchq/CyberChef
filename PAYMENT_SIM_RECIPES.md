# Payment Simulation Recipe Candidates

This list targets software-only development and testing environments.

## Frame And Transport Simulation
1. Length-prefix builder/parser pairs for command and response replay.
2. Status code mutation recipes (success/error branch testing).
3. Header-length fuzzing recipes for parser hardening.

## TR-31 Simulation
1. Header mutation recipes (usage, mode, exportability, optional block counts).
2. Optional-block truncation and malformed-length negative tests.
3. Prefix-normalization recipes (`R` prefix handling).
4. Create TR-31 key block recipes for symmetric test keys and round-trip parse validation.

## TR-34 Simulation
1. Envelope section split/rebuild recipes.
2. ASN.1 length corruption tests.
3. Signature-length mismatch recipes.

## KCV And Key Lifecycle Simulation
1. KCV cross-check recipes across TDES, AES-CMAC, and HMAC methods.
2. Variant-mask simulation for derived key classes.
3. Deterministic fixed-vector recipes for regression checks.

## ECDH Simulation
1. Static keypair handshake vectors.
2. Shared-info permutations in Concat KDF.
3. Curve mismatch and malformed key negative tests.

## DUKPT Simulation
1. IPEK derivation from known BDK/KSN vectors.
2. Counter progression replay across KSN ranges.
3. Variant-mask output sets for transaction classes.

## EMV/Scheme-Level Candidate Recipes
1. ARQC generation checks for AES-CMAC profiles with fixed session keys and known CDOL payloads.
2. ARPC generation checks for AES-CMAC response profiles with explicit ARC/CSU/proprietary-data assembly.
3. Tag concatenation and canonical ordering checks.
4. Session derivation input normalization checks.
5. Cryptogram preimage assembly validation recipes.
6. PAN parser and network classifier recipes for Visa (`4`, typically 13/16/19 digits), Mastercard (`51`-`55`, `2221`-`2720`, 16 digits), American Express (`34`, `37`, 15 digits), and Discover (`6011`, `644`-`649`, `65`, and `622126`-`622925`, typically 16-19 digits), including Luhn validation and issuer-range explanation.

## AWS Payment Cryptography Candidate Recipes
1. `EncryptData` and `DecryptData` parity vectors for AES, TDES, and RSA.
2. `ReEncryptData` parity vectors for decrypt-then-encrypt workflows.
3. `GenerateMac` and `VerifyMac` parity vectors across HMAC, CMAC, ISO9797, DUKPT, AS2805, and EMV MAC profiles.
4. `VerifyAuthRequestCryptogram` preimage-validation recipes for the implemented AES-CMAC EMV profiles.
5. DUKPT derivation-plus-cipher recipes for AWS derived-key lab testing.
6. ECDH plus wrap/unwrap plus TR-31 inspection recipes for `TranslateKeyMaterial` interoperability debugging.
7. Remaining gap-tracking recipes for encrypted PIN translation, richer EMV session derivation, and fuller TR-31/TR-34 generation flows.
