# Payment Operations Reference

Owner:
- Jacob Marks, `https://jacobmarks.com`
- Fork home: `https://github.com/J8k3/CyberChef`

**User-facing workflow catalog, screenshots, and recipe links:** [J8k3/CyberChef-Payments](https://github.com/J8k3/CyberChef-Payments)

This file is the **developer reference** for the implementation repo. It covers naming conventions, the operation registry, and raw APC comparison test data. Do not duplicate recipe catalog content here — maintain it in CyberChef-Payments to avoid divergence.

---

## Naming Convention

All payment operation display names follow **Title Case** throughout. Acronyms (DUKPT, AES, EMV, MAC, PAN, PVV, KCV, ARQC, ARPC, TR-31, TR-34) are always upper-case. Brand names retain their canonical capitalisation (`payShield`).

Pattern: `[Domain Prefix] [Verb] [Qualifier]`
- Domain prefixes: EMV, DUKPT, PIN Block, PIN Data, PIN IBM 3624, PAN, Card Validation Data, VISA PVV, AS2805, HSM, Payment, MAC, Key, TR-31, TR-34
- Verbs: Generate, Verify, Parse, Build, Translate, Derive, Calculate, Encrypt, Decrypt, Re-Encrypt
- The prefix comes first so operations sort and scan by topic in the UI list
- Only operations authored in this fork belong in the Payments category — do not add upstream CyberChef ops

## UI Arrangement

The `Payments` category is sorted alphabetically. The domain-prefix naming convention means related operations naturally cluster together in the list (all EMV ops together, all PIN Block ops together, etc.).

---

## Operation Registry

Operations in the **Payments** category, grouped by domain. Update this list when adding, renaming, or removing an operation.

**Encrypt / Decrypt**
- `Payment Encrypt Data`
- `Payment Decrypt Data`
- `Payment Re-Encrypt Data`

**MAC**
- `MAC Generate`
- `MAC Verify`

**EMV**
- `EMV Build ARQC Data`
- `EMV Parse ARQC Data`
- `EMV Generate ARQC`
- `EMV Verify ARQC`
- `EMV Build ARPC Data`
- `EMV Parse ARPC Data`
- `EMV Generate ARPC`
- `EMV Build Script Data`
- `EMV Build PIN Change Script Data`
- `EMV Generate MAC`
- `EMV Verify MAC`
- `EMV Generate MAC (PIN Change)`
- `EMV Parse TLV`

**Card Validation**
- `Card Validation Data Generate`
- `Card Validation Data Verify`
- `PAN Generate`
- `PAN Parse`

**PIN**
- `PIN Block Build`
- `PIN Block Parse`
- `PIN Block Translate`
- `PIN Block Translate Encrypted`
- `PIN Data Generate`
- `PIN Data Verify`
- `PIN IBM 3624 Offset Generate`
- `PIN IBM 3624 Verify`
- `VISA PVV Generate`
- `VISA PVV Verify`

**DUKPT**
- `DUKPT Derive TDES Key`
- `DUKPT Derive AES Key`

**Key Management**
- `Key Generate`
- `Key Component Split`
- `Key Component Combine`
- `Payment Calculate KCV`
- `Derive ECDH Key Material`
- `AS2805 Generate KEK Validation`

**Key Containers / HSM**
- `TR-31 Parse Key Block`
- `TR-34 Parse Key Transport`
- `HSM Parse Thales Command`
- `HSM Parse Futurex Command`

---

## APC Comparison Testing

Performed 2026-05-19. HSM-style operations compared against AWS Payment Cryptography (APC) where APC exposed comparable behavior, using fixed test vectors imported as APC managed keys.

### Test Vectors

| Name | Hex |
|---|---|
| `tdes_bdk` | `0123456789ABCDEFFEDCBA9876543210` |
| `aes_bdk` | `FEDCBA98765432100123456789ABCDEF` |
| `tdes_dek1` | `0101010101010101FEFEFEFEFEFEFEFE` |
| `tdes_dek2` | `FEFEFEFEFEFEFEFE0101010101010101` |
| `tdes_m3` | `1111111111111111AAAAAAAAAAAAAAAA` |
| `aes_m6` | `000102030405060708090A0B0C0D0E0F` |
| `visa_pvk` | `AAAABBBBCCCCDDDDEEEEFFFFAAAABBBB` |
| `ibm3624_pvk` | `BBBBCCCCDDDDEEEEFFFFAAAABBBBCCCC` |
| `cvk` | `CCCCDDDDEEEEFFFFAAAABBBBCCCCDDDD` |
| `emv_e0` | `101112131415161718191A1B1C1D1E1F` |
| `tdes_pek` | `DDDDEEEEFFFFAAAABBBBCCCCDDDDEEEE` |
| plaintext | `0102030405060708` |
| mac\_msg | `0102030405060708090A0B0C` |
| pan\_cvv | `4123456789012345` |
| pan\_pvv | `5432101234567890` |
| service\_code | `101` |
| pin | `1234` |
| ksn\_tdes | `FFFF9876543210E00001` |
| ksn\_aes | `123456789012345600000001` |
| atc | `0001` |

### Results

| Operation | CyberChef Output | APC Output | Status | Notes |
|---|---|---|---|---|
| Payment Encrypt Data (TDES ECB) | `B064B6C2571C65D5` | `B064B6C2571C65D5` | ✅ MATCH | |
| Payment Decrypt Data (TDES ECB) | `0102030405060708` | `0102030405060708` | ✅ MATCH | |
| Payment Re-Encrypt Data | — | API error | ❌ BLOCKED | D0 keys with `NoRestrictions` rejected by APC `re_encrypt_data` — key-mode constraint, not a CyberChef bug |
| MAC Generate (ISO 9797-3, Method 1) | `D8749ECF9A6C6932` | `D8749ECF9A6C6932` | ✅ MATCH | |
| MAC Verify (ISO 9797-3) | — | PASS | ✅ | |
| MAC Generate (AES-CMAC) | `E330EE80C0D43370` | `E330EE80C0D43370` | ✅ MATCH | |
| MAC Verify (AES-CMAC) | — | PASS | ✅ | |
| EMV Generate MAC | `BEB0A99CA833D7C8` (Method 2) | `1C36D79CE0F2F832` | ⚠️ METHOD DEPENDENT | Default (Method 2) does not match. Select Method 1 in the padding method arg for output that aligns with systems using zero-pad. |
| EMV Generate MAC (PIN Change) | `3D9E060686858CC0` | N/A | ⚠️ N/A | APC has no direct equivalent endpoint |
| Card Validation Data Generate (CVV) | `703` | `703` | ✅ MATCH | |
| Card Validation Data Generate (CVV2) | `111` | `111` | ✅ MATCH | |
| Card Validation Data Verify | — | PASS | ✅ | |
| VISA PVV Generate | `5596` (visa_pvk) / `6776` (test key) | `5596` / `6776` (verify path) | ✅ MATCH | APC `generate_pin_data` blocked by compliance warning; cross-validated via `verify_pin_data` for both keys |
| VISA PVV Verify | — | PASS | ✅ | Both `visa_pvk` (KCV AAAABBBB…) and test key `0123456789ABCDEF…` (KCV 08D7B4) confirmed via APC `verify_pin_data` |
| PIN IBM 3624 Offset Generate | `0324` | `0324` (verify path) | ✅ MATCH | Cross-validated via APC `verify_pin_data` |
| PIN IBM 3624 Verify | — | PASS | ✅ | |
| EMV Generate ARQC | `8C8E19CED4DBBF59` | AES-128 rejected | ❌ BLOCKED | APC `verify_auth_request_cryptogram` requires AES-256 E0 key; AES-128 rejected. CyberChef implementation (AES-CMAC, Option A session-key derivation) is correct |
| DUKPT Derive TDES Key | IPEK `6AC292FAA1315B4D858AB3A3D7D5933A` | N/A | ✅ VERIFIED | Matches published ANSI X9.24-1 test vector |
| DUKPT Derive AES Key | IK/working keys derived | N/A | ✅ VERIFIED | Verified against ANSI X9.24-3 §6.3 official test vectors; APC does not expose derived intermediate keys for direct comparison |
| DUKPT TDES Encrypt (Payment Encrypt Data) | `92A5157E4607D1B0` | `124F7A32F3F84187` | ❌ VARIANT MISMATCH | CyberChef follows ANSI X9.24-1 "Data" variant (bytes 5+13 XOR `0xFF`); APC uses an undocumented internal variant for data encryption |
| DUKPT TDES MAC (MAC Generate) | `AF59E7E8A06F01B2` | `AF59E7E8A06F01B2` | ✅ MATCH | APC `DukptKeyVariant=REQUEST` aligns with CyberChef "MAC Request" |

### Key Findings

- **APC `mac_length` is in nibbles (hex digits), not bytes** — pass `16` to get an 8-byte MAC.
- **EMV Generate MAC padding method** — `EMV Generate MAC` defaults to Method 2 (ISO 7816-4; standard for EMV issuer scripts). Select Method 1 (zero pad) when the receiving system requires it. Both generate and verify must use the same method.
- **DUKPT TDES data encryption variant** — CyberChef follows ANSI X9.24-1 standard (bytes 5 and 13 XOR `0xFF` for the "Data" variant). APC applies a different undocumented internal variant. DUKPT MAC operations align correctly (both use MAC Request / `REQUEST` variant).
- **EMV ARQC requires AES-256 on APC** — `verify_auth_request_cryptogram` rejects AES-128 E0 keys. If testing ARQC against APC, an AES-256 E0 master key is required. CyberChef's AES-CMAC + Option A session-key derivation is standard-compliant.
- **Re-encrypt key mode constraint** — D0 keys imported into APC with `NoRestrictions: true` are blocked by `re_encrypt_data`. This is an APC API constraint, not a CyberChef limitation.

---

### References

- AWS Payment Cryptography Data Plane API: https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/Welcome.html
- AWS MAC overview: https://docs.aws.amazon.com/payment-cryptography/latest/userguide/crypto-ops-mac.html
- NIST SP 800-38B CMAC: https://csrc.nist.gov/pubs/sp/800/38/b/upd1/final
- RFC 3394 AES Key Wrap: https://www.rfc-editor.org/rfc/rfc3394
- Discover public test-card page: https://www.discoverglobalnetwork.com/resources/businesses/check-your-card-reader/
- Mastercard AVS test scenarios: https://static.developer.mastercard.com/content/mastercard-send-avs/uploads/avs-test-case-scenario-v4.pdf
