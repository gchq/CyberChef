/**
 * TLS resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import Stream from "../lib/Stream.mjs";

/**
 * Parse a TLS Record
 * @param {Uint8Array} bytes
 * @returns {JSON}
 */
export function parseTLSRecord(bytes) {
    const s = new Stream(bytes);
    const b = s.clone();
    const r = {};

    // Content type
    r.contentType = {
        description: "Content Type",
        length: 1,
        data: b.getBytes(1),
        value: s.readInt(1)
    };
    if (r.contentType.value !== 0x16)
        throw new OperationError("Not handshake data.");

    // Version
    r.version = {
        description: "Protocol Version",
        length: 2,
        data: b.getBytes(2),
        value: s.readInt(2)
    };

    // Length
    r.length = {
        description: "Record Length",
        length: 2,
        data: b.getBytes(2),
        value: s.readInt(2)
    };
    if (s.length !== r.length.value + 5)
        throw new OperationError("Incorrect handshake length.");

    // Handshake
    r.handshake = {
        description: "Handshake",
        length: r.length.value,
        data: b.getBytes(r.length.value),
        value: parseHandshake(s.getBytes(r.length.value))
    };

    return r;
}

/**
 * Parse a TLS Handshake
 * @param {Uint8Array} bytes
 * @returns {JSON}
 */
function parseHandshake(bytes) {
    const s = new Stream(bytes);
    const b = s.clone();
    const h = {};

    // Handshake type
    h.handshakeType = {
        description: "Client Hello",
        length: 1,
        data: b.getBytes(1),
        value: s.readInt(1)
    };
    if (h.handshakeType.value !== 0x01)
        throw new OperationError("Not a Client Hello.");

    // Handshake length
    h.handshakeLength = {
        description: "Handshake Length",
        length: 3,
        data: b.getBytes(3),
        value: s.readInt(3)
    };
    if (s.length !== h.handshakeLength.value + 4)
        throw new OperationError("Not enough data in Client Hello.");

    // Hello version
    h.helloVersion = {
        description: "Client Hello Version",
        length: 2,
        data: b.getBytes(2),
        value: s.readInt(2)
    };

    // Random
    h.random = {
        description: "Client Random",
        length: 32,
        data: b.getBytes(32),
        value: s.getBytes(32)
    };

    // Session ID Length
    h.sessionIDLength = {
        description: "Session ID Length",
        length: 1,
        data: b.getBytes(1),
        value: s.readInt(1)
    };

    // Session ID
    h.sessionID = {
        description: "Session ID",
        length: h.sessionIDLength.value,
        data: b.getBytes(h.sessionIDLength.value),
        value: s.getBytes(h.sessionIDLength.value)
    };

    // Cipher Suites Length
    h.cipherSuitesLength = {
        description: "Cipher Suites Length",
        length: 2,
        data: b.getBytes(2),
        value: s.readInt(2)
    };

    // Cipher Suites
    h.cipherSuites = {
        description: "Cipher Suites",
        length: h.cipherSuitesLength.value,
        data: b.getBytes(h.cipherSuitesLength.value),
        value: parseCipherSuites(s.getBytes(h.cipherSuitesLength.value))
    };

    // Compression Methods Length
    h.compressionMethodsLength = {
        description: "Compression Methods Length",
        length: 1,
        data: b.getBytes(1),
        value: s.readInt(1)
    };

    // Compression Methods
    h.compressionMethods = {
        description: "Compression Methods",
        length: h.compressionMethodsLength.value,
        data: b.getBytes(h.compressionMethodsLength.value),
        value: parseCompressionMethods(s.getBytes(h.compressionMethodsLength.value))
    };

    // Extensions Length
    h.extensionsLength = {
        description: "Extensions Length",
        length: 2,
        data: b.getBytes(2),
        value: s.readInt(2)
    };

    // Extensions
    h.extensions = {
        description: "Extensions",
        length: h.extensionsLength.value,
        data: b.getBytes(h.extensionsLength.value),
        value: parseExtensions(s.getBytes(h.extensionsLength.value))
    };

    return h;
}

/**
 * Parse Cipher Suites
 * @param {Uint8Array} bytes
 * @returns {JSON}
 */
function parseCipherSuites(bytes) {
    const s = new Stream(bytes);
    const b = s.clone();
    const cs = [];

    while (s.hasMore()) {
        cs.push({
            description: "Cipher Suite",
            length: 2,
            data: b.getBytes(2),
            value: CIPHER_SUITES_LOOKUP[s.readInt(2)] || "Unknown"
        });
    }
    return cs;
}

/**
 * Parse Compression Methods
 * @param {Uint8Array} bytes
 * @returns {JSON}
 */
function parseCompressionMethods(bytes) {
    const s = new Stream(bytes);
    const b = s.clone();
    const cm = [];

    while (s.hasMore()) {
        cm.push({
            description: "Compression Method",
            length: 1,
            data: b.getBytes(1),
            value: s.readInt(1) // TODO: Compression method name here
        });
    }
    return cm;
}

/**
 * Parse Extensions
 * @param {Uint8Array} bytes
 * @returns {JSON}
 */
function parseExtensions(bytes) {
    const s = new Stream(bytes);
    const b = s.clone();

    const exts = [];
    while (s.hasMore()) {
        const ext = {};

        // Type
        ext.type = {
            description: "Extension Type",
            length: 2,
            data: b.getBytes(2),
            value: EXTENSION_LOOKUP[s.readInt(2)] || "unknown"
        };

        // Length
        ext.length = {
            description: "Extension Length",
            length: 2,
            data: b.getBytes(2),
            value: s.readInt(2)
        };

        // Value
        ext.value = {
            description: "Extension Value",
            length: ext.length.value,
            data: b.getBytes(ext.length.value),
            value: s.getBytes(ext.length.value)
        };

        exts.push(ext);
    }

    return exts;
}

/**
 * Extension type lookup table
 */
const EXTENSION_LOOKUP = {
    0: "server_name",
    1: "max_fragment_length",
    2: "client_certificate_url",
    3: "trusted_ca_keys",
    4: "truncated_hmac",
    5: "status_request",
    6: "user_mapping",
    7: "client_authz",
    8: "server_authz",
    9: "cert_type",
    10: "supported_groups",
    11: "ec_point_formats",
    12: "srp",
    13: "signature_algorithms",
    14: "use_srtp",
    15: "heartbeat",
    16: "application_layer_protocol_negotiation",
    17: "status_request_v2",
    18: "signed_certificate_timestamp",
    19: "client_certificate_type",
    20: "server_certificate_type",
    21: "padding",
    22: "encrypt_then_mac",
    23: "extended_master_secret",
    24: "token_binding",
    25: "cached_info",
    26: "tls_lts",
    27: "compress_certificate",
    28: "record_size_limit",
    29: "pwd_protect",
    30: "pwd_clear",
    31: "password_salt",
    32: "ticket_pinning",
    33: "tls_cert_with_extern_psk",
    34: "delegated_credential",
    35: "session_ticket",
    36: "TLMSP",
    37: "TLMSP_proxying",
    38: "TLMSP_delegate",
    39: "supported_ekt_ciphers",
    40: "Reserved",
    41: "pre_shared_key",
    42: "early_data",
    43: "supported_versions",
    44: "cookie",
    45: "psk_key_exchange_modes",
    46: "Reserved",
    47: "certificate_authorities",
    48: "oid_filters",
    49: "post_handshake_auth",
    50: "signature_algorithms_cert",
    51: "key_share",
    52: "transparency_info",
    53: "connection_id (deprecated)",
    54: "connection_id",
    55: "external_id_hash",
    56: "external_session_id",
    57: "quic_transport_parameters",
    58: "ticket_request",
    59: "dnssec_chain",
    60: "sequence_number_encryption_algorithms",
    61: "rrc",
    2570: "GREASE",
    6682: "GREASE",
    10794: "GREASE",
    14906: "GREASE",
    17513: "application_settings",
    19018: "GREASE",
    23130: "GREASE",
    27242: "GREASE",
    31354: "GREASE",
    35466: "GREASE",
    39578: "GREASE",
    43690: "GREASE",
    47802: "GREASE",
    51914: "GREASE",
    56026: "GREASE",
    60138: "GREASE",
    64250: "GREASE",
    64768: "ech_outer_extensions",
    65037: "encrypted_client_hello",
    65281: "renegotiation_info"
};

/**
 * Cipher suites lookup table
 */
const CIPHER_SUITES_LOOKUP = {
    0x0000: "TLS_NULL_WITH_NULL_NULL",
    0x0001: "TLS_RSA_WITH_NULL_MD5",
    0x0002: "TLS_RSA_WITH_NULL_SHA",
    0x0003: "TLS_RSA_EXPORT_WITH_RC4_40_MD5",
    0x0004: "TLS_RSA_WITH_RC4_128_MD5",
    0x0005: "TLS_RSA_WITH_RC4_128_SHA",
    0x0006: "TLS_RSA_EXPORT_WITH_RC2_CBC_40_MD5",
    0x0007: "TLS_RSA_WITH_IDEA_CBC_SHA",
    0x0008: "TLS_RSA_EXPORT_WITH_DES40_CBC_SHA",
    0x0009: "TLS_RSA_WITH_DES_CBC_SHA",
    0x000A: "TLS_RSA_WITH_3DES_EDE_CBC_SHA",
    0x000B: "TLS_DH_DSS_EXPORT_WITH_DES40_CBC_SHA",
    0x000C: "TLS_DH_DSS_WITH_DES_CBC_SHA",
    0x000D: "TLS_DH_DSS_WITH_3DES_EDE_CBC_SHA",
    0x000E: "TLS_DH_RSA_EXPORT_WITH_DES40_CBC_SHA",
    0x000F: "TLS_DH_RSA_WITH_DES_CBC_SHA",
    0x0010: "TLS_DH_RSA_WITH_3DES_EDE_CBC_SHA",
    0x0011: "TLS_DHE_DSS_EXPORT_WITH_DES40_CBC_SHA",
    0x0012: "TLS_DHE_DSS_WITH_DES_CBC_SHA",
    0x0013: "TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA",
    0x0014: "TLS_DHE_RSA_EXPORT_WITH_DES40_CBC_SHA",
    0x0015: "TLS_DHE_RSA_WITH_DES_CBC_SHA",
    0x0016: "TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA",
    0x0017: "TLS_DH_anon_EXPORT_WITH_RC4_40_MD5",
    0x0018: "TLS_DH_anon_WITH_RC4_128_MD5",
    0x0019: "TLS_DH_anon_EXPORT_WITH_DES40_CBC_SHA",
    0x001A: "TLS_DH_anon_WITH_DES_CBC_SHA",
    0x001B: "TLS_DH_anon_WITH_3DES_EDE_CBC_SHA",
    0x001E: "TLS_KRB5_WITH_DES_CBC_SHA",
    0x001F: "TLS_KRB5_WITH_3DES_EDE_CBC_SHA",
    0x0020: "TLS_KRB5_WITH_RC4_128_SHA",
    0x0021: "TLS_KRB5_WITH_IDEA_CBC_SHA",
    0x0022: "TLS_KRB5_WITH_DES_CBC_MD5",
    0x0023: "TLS_KRB5_WITH_3DES_EDE_CBC_MD5",
    0x0024: "TLS_KRB5_WITH_RC4_128_MD5",
    0x0025: "TLS_KRB5_WITH_IDEA_CBC_MD5",
    0x0026: "TLS_KRB5_EXPORT_WITH_DES_CBC_40_SHA",
    0x0027: "TLS_KRB5_EXPORT_WITH_RC2_CBC_40_SHA",
    0x0028: "TLS_KRB5_EXPORT_WITH_RC4_40_SHA",
    0x0029: "TLS_KRB5_EXPORT_WITH_DES_CBC_40_MD5",
    0x002A: "TLS_KRB5_EXPORT_WITH_RC2_CBC_40_MD5",
    0x002B: "TLS_KRB5_EXPORT_WITH_RC4_40_MD5",
    0x002C: "TLS_PSK_WITH_NULL_SHA",
    0x002D: "TLS_DHE_PSK_WITH_NULL_SHA",
    0x002E: "TLS_RSA_PSK_WITH_NULL_SHA",
    0x002F: "TLS_RSA_WITH_AES_128_CBC_SHA",
    0x0030: "TLS_DH_DSS_WITH_AES_128_CBC_SHA",
    0x0031: "TLS_DH_RSA_WITH_AES_128_CBC_SHA",
    0x0032: "TLS_DHE_DSS_WITH_AES_128_CBC_SHA",
    0x0033: "TLS_DHE_RSA_WITH_AES_128_CBC_SHA",
    0x0034: "TLS_DH_anon_WITH_AES_128_CBC_SHA",
    0x0035: "TLS_RSA_WITH_AES_256_CBC_SHA",
    0x0036: "TLS_DH_DSS_WITH_AES_256_CBC_SHA",
    0x0037: "TLS_DH_RSA_WITH_AES_256_CBC_SHA",
    0x0038: "TLS_DHE_DSS_WITH_AES_256_CBC_SHA",
    0x0039: "TLS_DHE_RSA_WITH_AES_256_CBC_SHA",
    0x003A: "TLS_DH_anon_WITH_AES_256_CBC_SHA",
    0x003B: "TLS_RSA_WITH_NULL_SHA256",
    0x003C: "TLS_RSA_WITH_AES_128_CBC_SHA256",
    0x003D: "TLS_RSA_WITH_AES_256_CBC_SHA256",
    0x003E: "TLS_DH_DSS_WITH_AES_128_CBC_SHA256",
    0x003F: "TLS_DH_RSA_WITH_AES_128_CBC_SHA256",
    0x0040: "TLS_DHE_DSS_WITH_AES_128_CBC_SHA256",
    0x0041: "TLS_RSA_WITH_CAMELLIA_128_CBC_SHA",
    0x0042: "TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA",
    0x0043: "TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA",
    0x0044: "TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA",
    0x0045: "TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA",
    0x0046: "TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA",
    0x0067: "TLS_DHE_RSA_WITH_AES_128_CBC_SHA256",
    0x0068: "TLS_DH_DSS_WITH_AES_256_CBC_SHA256",
    0x0069: "TLS_DH_RSA_WITH_AES_256_CBC_SHA256",
    0x006A: "TLS_DHE_DSS_WITH_AES_256_CBC_SHA256",
    0x006B: "TLS_DHE_RSA_WITH_AES_256_CBC_SHA256",
    0x006C: "TLS_DH_anon_WITH_AES_128_CBC_SHA256",
    0x006D: "TLS_DH_anon_WITH_AES_256_CBC_SHA256",
    0x0084: "TLS_RSA_WITH_CAMELLIA_256_CBC_SHA",
    0x0085: "TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA",
    0x0086: "TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA",
    0x0087: "TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA",
    0x0088: "TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA",
    0x0089: "TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA",
    0x008A: "TLS_PSK_WITH_RC4_128_SHA",
    0x008B: "TLS_PSK_WITH_3DES_EDE_CBC_SHA",
    0x008C: "TLS_PSK_WITH_AES_128_CBC_SHA",
    0x008D: "TLS_PSK_WITH_AES_256_CBC_SHA",
    0x008E: "TLS_DHE_PSK_WITH_RC4_128_SHA",
    0x008F: "TLS_DHE_PSK_WITH_3DES_EDE_CBC_SHA",
    0x0090: "TLS_DHE_PSK_WITH_AES_128_CBC_SHA",
    0x0091: "TLS_DHE_PSK_WITH_AES_256_CBC_SHA",
    0x0092: "TLS_RSA_PSK_WITH_RC4_128_SHA",
    0x0093: "TLS_RSA_PSK_WITH_3DES_EDE_CBC_SHA",
    0x0094: "TLS_RSA_PSK_WITH_AES_128_CBC_SHA",
    0x0095: "TLS_RSA_PSK_WITH_AES_256_CBC_SHA",
    0x0096: "TLS_RSA_WITH_SEED_CBC_SHA",
    0x0097: "TLS_DH_DSS_WITH_SEED_CBC_SHA",
    0x0098: "TLS_DH_RSA_WITH_SEED_CBC_SHA",
    0x0099: "TLS_DHE_DSS_WITH_SEED_CBC_SHA",
    0x009A: "TLS_DHE_RSA_WITH_SEED_CBC_SHA",
    0x009B: "TLS_DH_anon_WITH_SEED_CBC_SHA",
    0x009C: "TLS_RSA_WITH_AES_128_GCM_SHA256",
    0x009D: "TLS_RSA_WITH_AES_256_GCM_SHA384",
    0x009E: "TLS_DHE_RSA_WITH_AES_128_GCM_SHA256",
    0x009F: "TLS_DHE_RSA_WITH_AES_256_GCM_SHA384",
    0x00A0: "TLS_DH_RSA_WITH_AES_128_GCM_SHA256",
    0x00A1: "TLS_DH_RSA_WITH_AES_256_GCM_SHA384",
    0x00A2: "TLS_DHE_DSS_WITH_AES_128_GCM_SHA256",
    0x00A3: "TLS_DHE_DSS_WITH_AES_256_GCM_SHA384",
    0x00A4: "TLS_DH_DSS_WITH_AES_128_GCM_SHA256",
    0x00A5: "TLS_DH_DSS_WITH_AES_256_GCM_SHA384",
    0x00A6: "TLS_DH_anon_WITH_AES_128_GCM_SHA256",
    0x00A7: "TLS_DH_anon_WITH_AES_256_GCM_SHA384",
    0x00A8: "TLS_PSK_WITH_AES_128_GCM_SHA256",
    0x00A9: "TLS_PSK_WITH_AES_256_GCM_SHA384",
    0x00AA: "TLS_DHE_PSK_WITH_AES_128_GCM_SHA256",
    0x00AB: "TLS_DHE_PSK_WITH_AES_256_GCM_SHA384",
    0x00AC: "TLS_RSA_PSK_WITH_AES_128_GCM_SHA256",
    0x00AD: "TLS_RSA_PSK_WITH_AES_256_GCM_SHA384",
    0x00AE: "TLS_PSK_WITH_AES_128_CBC_SHA256",
    0x00AF: "TLS_PSK_WITH_AES_256_CBC_SHA384",
    0x00B0: "TLS_PSK_WITH_NULL_SHA256",
    0x00B1: "TLS_PSK_WITH_NULL_SHA384",
    0x00B2: "TLS_DHE_PSK_WITH_AES_128_CBC_SHA256",
    0x00B3: "TLS_DHE_PSK_WITH_AES_256_CBC_SHA384",
    0x00B4: "TLS_DHE_PSK_WITH_NULL_SHA256",
    0x00B5: "TLS_DHE_PSK_WITH_NULL_SHA384",
    0x00B6: "TLS_RSA_PSK_WITH_AES_128_CBC_SHA256",
    0x00B7: "TLS_RSA_PSK_WITH_AES_256_CBC_SHA384",
    0x00B8: "TLS_RSA_PSK_WITH_NULL_SHA256",
    0x00B9: "TLS_RSA_PSK_WITH_NULL_SHA384",
    0x00BA: "TLS_RSA_WITH_CAMELLIA_128_CBC_SHA256",
    0x00BB: "TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA256",
    0x00BC: "TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA256",
    0x00BD: "TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA256",
    0x00BE: "TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA256",
    0x00BF: "TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA256",
    0x00C0: "TLS_RSA_WITH_CAMELLIA_256_CBC_SHA256",
    0x00C1: "TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA256",
    0x00C2: "TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA256",
    0x00C3: "TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA256",
    0x00C4: "TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA256",
    0x00C5: "TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA256",
    0x00C6: "TLS_SM4_GCM_SM3",
    0x00C7: "TLS_SM4_CCM_SM3",
    0x00FF: "TLS_EMPTY_RENEGOTIATION_INFO_SCSV",
    0x0A0A: "GREASE",
    0x1301: "TLS_AES_128_GCM_SHA256",
    0x1302: "TLS_AES_256_GCM_SHA384",
    0x1303: "TLS_CHACHA20_POLY1305_SHA256",
    0x1304: "TLS_AES_128_CCM_SHA256",
    0x1305: "TLS_AES_128_CCM_8_SHA256",
    0x1306: "TLS_AEGIS_256_SHA512",
    0x1307: "TLS_AEGIS_128L_SHA256",
    0x1A1A: "GREASE",
    0x2A2A: "GREASE",
    0x3A3A: "GREASE",
    0x4A4A: "GREASE",
    0x5600: "TLS_FALLBACK_SCSV",
    0x5A5A: "GREASE",
    0x6A6A: "GREASE",
    0x7A7A: "GREASE",
    0x8A8A: "GREASE",
    0x9A9A: "GREASE",
    0xAAAA: "GREASE",
    0xBABA: "GREASE",
    0xC001: "TLS_ECDH_ECDSA_WITH_NULL_SHA",
    0xC002: "TLS_ECDH_ECDSA_WITH_RC4_128_SHA",
    0xC003: "TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA",
    0xC004: "TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA",
    0xC005: "TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA",
    0xC006: "TLS_ECDHE_ECDSA_WITH_NULL_SHA",
    0xC007: "TLS_ECDHE_ECDSA_WITH_RC4_128_SHA",
    0xC008: "TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA",
    0xC009: "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA",
    0xC00A: "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA",
    0xC00B: "TLS_ECDH_RSA_WITH_NULL_SHA",
    0xC00C: "TLS_ECDH_RSA_WITH_RC4_128_SHA",
    0xC00D: "TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA",
    0xC00E: "TLS_ECDH_RSA_WITH_AES_128_CBC_SHA",
    0xC00F: "TLS_ECDH_RSA_WITH_AES_256_CBC_SHA",
    0xC010: "TLS_ECDHE_RSA_WITH_NULL_SHA",
    0xC011: "TLS_ECDHE_RSA_WITH_RC4_128_SHA",
    0xC012: "TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA",
    0xC013: "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
    0xC014: "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA",
    0xC015: "TLS_ECDH_anon_WITH_NULL_SHA",
    0xC016: "TLS_ECDH_anon_WITH_RC4_128_SHA",
    0xC017: "TLS_ECDH_anon_WITH_3DES_EDE_CBC_SHA",
    0xC018: "TLS_ECDH_anon_WITH_AES_128_CBC_SHA",
    0xC019: "TLS_ECDH_anon_WITH_AES_256_CBC_SHA",
    0xC01A: "TLS_SRP_SHA_WITH_3DES_EDE_CBC_SHA",
    0xC01B: "TLS_SRP_SHA_RSA_WITH_3DES_EDE_CBC_SHA",
    0xC01C: "TLS_SRP_SHA_DSS_WITH_3DES_EDE_CBC_SHA",
    0xC01D: "TLS_SRP_SHA_WITH_AES_128_CBC_SHA",
    0xC01E: "TLS_SRP_SHA_RSA_WITH_AES_128_CBC_SHA",
    0xC01F: "TLS_SRP_SHA_DSS_WITH_AES_128_CBC_SHA",
    0xC020: "TLS_SRP_SHA_WITH_AES_256_CBC_SHA",
    0xC021: "TLS_SRP_SHA_RSA_WITH_AES_256_CBC_SHA",
    0xC022: "TLS_SRP_SHA_DSS_WITH_AES_256_CBC_SHA",
    0xC023: "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256",
    0xC024: "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384",
    0xC025: "TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256",
    0xC026: "TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384",
    0xC027: "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256",
    0xC028: "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384",
    0xC029: "TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256",
    0xC02A: "TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384",
    0xC02B: "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
    0xC02C: "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
    0xC02D: "TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256",
    0xC02E: "TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384",
    0xC02F: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    0xC030: "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
    0xC031: "TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256",
    0xC032: "TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384",
    0xC033: "TLS_ECDHE_PSK_WITH_RC4_128_SHA",
    0xC034: "TLS_ECDHE_PSK_WITH_3DES_EDE_CBC_SHA",
    0xC035: "TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA",
    0xC036: "TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA",
    0xC037: "TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA256",
    0xC038: "TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA384",
    0xC039: "TLS_ECDHE_PSK_WITH_NULL_SHA",
    0xC03A: "TLS_ECDHE_PSK_WITH_NULL_SHA256",
    0xC03B: "TLS_ECDHE_PSK_WITH_NULL_SHA384",
    0xC03C: "TLS_RSA_WITH_ARIA_128_CBC_SHA256",
    0xC03D: "TLS_RSA_WITH_ARIA_256_CBC_SHA384",
    0xC03E: "TLS_DH_DSS_WITH_ARIA_128_CBC_SHA256",
    0xC03F: "TLS_DH_DSS_WITH_ARIA_256_CBC_SHA384",
    0xC040: "TLS_DH_RSA_WITH_ARIA_128_CBC_SHA256",
    0xC041: "TLS_DH_RSA_WITH_ARIA_256_CBC_SHA384",
    0xC042: "TLS_DHE_DSS_WITH_ARIA_128_CBC_SHA256",
    0xC043: "TLS_DHE_DSS_WITH_ARIA_256_CBC_SHA384",
    0xC044: "TLS_DHE_RSA_WITH_ARIA_128_CBC_SHA256",
    0xC045: "TLS_DHE_RSA_WITH_ARIA_256_CBC_SHA384",
    0xC046: "TLS_DH_anon_WITH_ARIA_128_CBC_SHA256",
    0xC047: "TLS_DH_anon_WITH_ARIA_256_CBC_SHA384",
    0xC048: "TLS_ECDHE_ECDSA_WITH_ARIA_128_CBC_SHA256",
    0xC049: "TLS_ECDHE_ECDSA_WITH_ARIA_256_CBC_SHA384",
    0xC04A: "TLS_ECDH_ECDSA_WITH_ARIA_128_CBC_SHA256",
    0xC04B: "TLS_ECDH_ECDSA_WITH_ARIA_256_CBC_SHA384",
    0xC04C: "TLS_ECDHE_RSA_WITH_ARIA_128_CBC_SHA256",
    0xC04D: "TLS_ECDHE_RSA_WITH_ARIA_256_CBC_SHA384",
    0xC04E: "TLS_ECDH_RSA_WITH_ARIA_128_CBC_SHA256",
    0xC04F: "TLS_ECDH_RSA_WITH_ARIA_256_CBC_SHA384",
    0xC050: "TLS_RSA_WITH_ARIA_128_GCM_SHA256",
    0xC051: "TLS_RSA_WITH_ARIA_256_GCM_SHA384",
    0xC052: "TLS_DHE_RSA_WITH_ARIA_128_GCM_SHA256",
    0xC053: "TLS_DHE_RSA_WITH_ARIA_256_GCM_SHA384",
    0xC054: "TLS_DH_RSA_WITH_ARIA_128_GCM_SHA256",
    0xC055: "TLS_DH_RSA_WITH_ARIA_256_GCM_SHA384",
    0xC056: "TLS_DHE_DSS_WITH_ARIA_128_GCM_SHA256",
    0xC057: "TLS_DHE_DSS_WITH_ARIA_256_GCM_SHA384",
    0xC058: "TLS_DH_DSS_WITH_ARIA_128_GCM_SHA256",
    0xC059: "TLS_DH_DSS_WITH_ARIA_256_GCM_SHA384",
    0xC05A: "TLS_DH_anon_WITH_ARIA_128_GCM_SHA256",
    0xC05B: "TLS_DH_anon_WITH_ARIA_256_GCM_SHA384",
    0xC05C: "TLS_ECDHE_ECDSA_WITH_ARIA_128_GCM_SHA256",
    0xC05D: "TLS_ECDHE_ECDSA_WITH_ARIA_256_GCM_SHA384",
    0xC05E: "TLS_ECDH_ECDSA_WITH_ARIA_128_GCM_SHA256",
    0xC05F: "TLS_ECDH_ECDSA_WITH_ARIA_256_GCM_SHA384",
    0xC060: "TLS_ECDHE_RSA_WITH_ARIA_128_GCM_SHA256",
    0xC061: "TLS_ECDHE_RSA_WITH_ARIA_256_GCM_SHA384",
    0xC062: "TLS_ECDH_RSA_WITH_ARIA_128_GCM_SHA256",
    0xC063: "TLS_ECDH_RSA_WITH_ARIA_256_GCM_SHA384",
    0xC064: "TLS_PSK_WITH_ARIA_128_CBC_SHA256",
    0xC065: "TLS_PSK_WITH_ARIA_256_CBC_SHA384",
    0xC066: "TLS_DHE_PSK_WITH_ARIA_128_CBC_SHA256",
    0xC067: "TLS_DHE_PSK_WITH_ARIA_256_CBC_SHA384",
    0xC068: "TLS_RSA_PSK_WITH_ARIA_128_CBC_SHA256",
    0xC069: "TLS_RSA_PSK_WITH_ARIA_256_CBC_SHA384",
    0xC06A: "TLS_PSK_WITH_ARIA_128_GCM_SHA256",
    0xC06B: "TLS_PSK_WITH_ARIA_256_GCM_SHA384",
    0xC06C: "TLS_DHE_PSK_WITH_ARIA_128_GCM_SHA256",
    0xC06D: "TLS_DHE_PSK_WITH_ARIA_256_GCM_SHA384",
    0xC06E: "TLS_RSA_PSK_WITH_ARIA_128_GCM_SHA256",
    0xC06F: "TLS_RSA_PSK_WITH_ARIA_256_GCM_SHA384",
    0xC070: "TLS_ECDHE_PSK_WITH_ARIA_128_CBC_SHA256",
    0xC071: "TLS_ECDHE_PSK_WITH_ARIA_256_CBC_SHA384",
    0xC072: "TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_CBC_SHA256",
    0xC073: "TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_CBC_SHA384",
    0xC074: "TLS_ECDH_ECDSA_WITH_CAMELLIA_128_CBC_SHA256",
    0xC075: "TLS_ECDH_ECDSA_WITH_CAMELLIA_256_CBC_SHA384",
    0xC076: "TLS_ECDHE_RSA_WITH_CAMELLIA_128_CBC_SHA256",
    0xC077: "TLS_ECDHE_RSA_WITH_CAMELLIA_256_CBC_SHA384",
    0xC078: "TLS_ECDH_RSA_WITH_CAMELLIA_128_CBC_SHA256",
    0xC079: "TLS_ECDH_RSA_WITH_CAMELLIA_256_CBC_SHA384",
    0xC07A: "TLS_RSA_WITH_CAMELLIA_128_GCM_SHA256",
    0xC07B: "TLS_RSA_WITH_CAMELLIA_256_GCM_SHA384",
    0xC07C: "TLS_DHE_RSA_WITH_CAMELLIA_128_GCM_SHA256",
    0xC07D: "TLS_DHE_RSA_WITH_CAMELLIA_256_GCM_SHA384",
    0xC07E: "TLS_DH_RSA_WITH_CAMELLIA_128_GCM_SHA256",
    0xC07F: "TLS_DH_RSA_WITH_CAMELLIA_256_GCM_SHA384",
    0xC080: "TLS_DHE_DSS_WITH_CAMELLIA_128_GCM_SHA256",
    0xC081: "TLS_DHE_DSS_WITH_CAMELLIA_256_GCM_SHA384",
    0xC082: "TLS_DH_DSS_WITH_CAMELLIA_128_GCM_SHA256",
    0xC083: "TLS_DH_DSS_WITH_CAMELLIA_256_GCM_SHA384",
    0xC084: "TLS_DH_anon_WITH_CAMELLIA_128_GCM_SHA256",
    0xC085: "TLS_DH_anon_WITH_CAMELLIA_256_GCM_SHA384",
    0xC086: "TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_GCM_SHA256",
    0xC087: "TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_GCM_SHA384",
    0xC088: "TLS_ECDH_ECDSA_WITH_CAMELLIA_128_GCM_SHA256",
    0xC089: "TLS_ECDH_ECDSA_WITH_CAMELLIA_256_GCM_SHA384",
    0xC08A: "TLS_ECDHE_RSA_WITH_CAMELLIA_128_GCM_SHA256",
    0xC08B: "TLS_ECDHE_RSA_WITH_CAMELLIA_256_GCM_SHA384",
    0xC08C: "TLS_ECDH_RSA_WITH_CAMELLIA_128_GCM_SHA256",
    0xC08D: "TLS_ECDH_RSA_WITH_CAMELLIA_256_GCM_SHA384",
    0xC08E: "TLS_PSK_WITH_CAMELLIA_128_GCM_SHA256",
    0xC08F: "TLS_PSK_WITH_CAMELLIA_256_GCM_SHA384",
    0xC090: "TLS_DHE_PSK_WITH_CAMELLIA_128_GCM_SHA256",
    0xC091: "TLS_DHE_PSK_WITH_CAMELLIA_256_GCM_SHA384",
    0xC092: "TLS_RSA_PSK_WITH_CAMELLIA_128_GCM_SHA256",
    0xC093: "TLS_RSA_PSK_WITH_CAMELLIA_256_GCM_SHA384",
    0xC094: "TLS_PSK_WITH_CAMELLIA_128_CBC_SHA256",
    0xC095: "TLS_PSK_WITH_CAMELLIA_256_CBC_SHA384",
    0xC096: "TLS_DHE_PSK_WITH_CAMELLIA_128_CBC_SHA256",
    0xC097: "TLS_DHE_PSK_WITH_CAMELLIA_256_CBC_SHA384",
    0xC098: "TLS_RSA_PSK_WITH_CAMELLIA_128_CBC_SHA256",
    0xC099: "TLS_RSA_PSK_WITH_CAMELLIA_256_CBC_SHA384",
    0xC09A: "TLS_ECDHE_PSK_WITH_CAMELLIA_128_CBC_SHA256",
    0xC09B: "TLS_ECDHE_PSK_WITH_CAMELLIA_256_CBC_SHA384",
    0xC09C: "TLS_RSA_WITH_AES_128_CCM",
    0xC09D: "TLS_RSA_WITH_AES_256_CCM",
    0xC09E: "TLS_DHE_RSA_WITH_AES_128_CCM",
    0xC09F: "TLS_DHE_RSA_WITH_AES_256_CCM",
    0xC0A0: "TLS_RSA_WITH_AES_128_CCM_8",
    0xC0A1: "TLS_RSA_WITH_AES_256_CCM_8",
    0xC0A2: "TLS_DHE_RSA_WITH_AES_128_CCM_8",
    0xC0A3: "TLS_DHE_RSA_WITH_AES_256_CCM_8",
    0xC0A4: "TLS_PSK_WITH_AES_128_CCM",
    0xC0A5: "TLS_PSK_WITH_AES_256_CCM",
    0xC0A6: "TLS_DHE_PSK_WITH_AES_128_CCM",
    0xC0A7: "TLS_DHE_PSK_WITH_AES_256_CCM",
    0xC0A8: "TLS_PSK_WITH_AES_128_CCM_8",
    0xC0A9: "TLS_PSK_WITH_AES_256_CCM_8",
    0xC0AA: "TLS_PSK_DHE_WITH_AES_128_CCM_8",
    0xC0AB: "TLS_PSK_DHE_WITH_AES_256_CCM_8",
    0xC0AC: "TLS_ECDHE_ECDSA_WITH_AES_128_CCM",
    0xC0AD: "TLS_ECDHE_ECDSA_WITH_AES_256_CCM",
    0xC0AE: "TLS_ECDHE_ECDSA_WITH_AES_128_CCM_8",
    0xC0AF: "TLS_ECDHE_ECDSA_WITH_AES_256_CCM_8",
    0xC0B0: "TLS_ECCPWD_WITH_AES_128_GCM_SHA256",
    0xC0B1: "TLS_ECCPWD_WITH_AES_256_GCM_SHA384",
    0xC0B2: "TLS_ECCPWD_WITH_AES_128_CCM_SHA256",
    0xC0B3: "TLS_ECCPWD_WITH_AES_256_CCM_SHA384",
    0xC0B4: "TLS_SHA256_SHA256",
    0xC0B5: "TLS_SHA384_SHA384",
    0xC100: "TLS_GOSTR341112_256_WITH_KUZNYECHIK_CTR_OMAC",
    0xC101: "TLS_GOSTR341112_256_WITH_MAGMA_CTR_OMAC",
    0xC102: "TLS_GOSTR341112_256_WITH_28147_CNT_IMIT",
    0xC103: "TLS_GOSTR341112_256_WITH_KUZNYECHIK_MGM_L",
    0xC104: "TLS_GOSTR341112_256_WITH_MAGMA_MGM_L",
    0xC105: "TLS_GOSTR341112_256_WITH_KUZNYECHIK_MGM_S",
    0xC106: "TLS_GOSTR341112_256_WITH_MAGMA_MGM_S",
    0xCACA: "GREASE",
    0xCCA8: "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
    0xCCA9: "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
    0xCCAA: "TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
    0xCCAB: "TLS_PSK_WITH_CHACHA20_POLY1305_SHA256",
    0xCCAC: "TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256",
    0xCCAD: "TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256",
    0xCCAE: "TLS_RSA_PSK_WITH_CHACHA20_POLY1305_SHA256",
    0xD001: "TLS_ECDHE_PSK_WITH_AES_128_GCM_SHA256",
    0xD002: "TLS_ECDHE_PSK_WITH_AES_256_GCM_SHA384",
    0xD003: "TLS_ECDHE_PSK_WITH_AES_128_CCM_8_SHA256",
    0xD005: "TLS_ECDHE_PSK_WITH_AES_128_CCM_SHA256",
    0xDADA: "GREASE",
    0xEAEA: "GREASE",
    0xFAFA: "GREASE",
};

/**
 * GREASE values
 */
export const GREASE_VALUES = [
    0x0a0a,
    0x1a1a,
    0x2a2a,
    0x3a3a,
    0x4a4a,
    0x5a5a,
    0x6a6a,
    0x7a7a,
    0x8a8a,
    0x9a9a,
    0xaaaa,
    0xbaba,
    0xcaca,
    0xdada,
    0xeaea,
    0xfafa
];

/**
 * Parses the supported_versions extension and returns the highest supported version.
 * @param {Uint8Array} bytes
 * @returns {number}
 */
export function parseHighestSupportedVersion(bytes) {
    const s = new Stream(bytes);

    // Length
    let i = s.readInt(1);

    let highestVersion = 0;
    while (s.hasMore() && i-- > 0) {
        const v = s.readInt(2);
        if (GREASE_VALUES.includes(v)) continue;
        if (v > highestVersion) highestVersion = v;
    }

    return highestVersion;
}

/**
 * Parses the application_layer_protocol_negotiation extension and returns the first value.
 * @param {Uint8Array} bytes
 * @returns {number}
 */
export function parseFirstALPNValue(bytes) {
    const s = new Stream(bytes);
    const alpnExtLen = s.readInt(2);
    if (alpnExtLen < 3) return "00";
    const strLen = s.readInt(1);
    if (strLen < 2) return "00";
    return s.readString(strLen);
}
