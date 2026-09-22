/**
 * Report skeleton and container detection for audio metadata extraction.
 *
 * @author d0s1nt [d0s1nt@cyberchefaudio]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

/* eslint-disable camelcase */

import { ascii4, indexOfAscii } from "./AudioBytes.mjs";

/** Builds the empty report skeleton ready for a format parser to populate. */
export function makeEmptyReport(filename, byteLength, container) {
    return {
        schema_version: "audio-meta-1.0",
        artifact: {
            filename,
            byte_length: byteLength,
            container: { type: container.type, brand: container.brand || null, mime: container.mime || null },
        },
        detections: { metadata_systems: [], provenance_systems: [] },
        tags: {
            common: {
                title: null, artist: null, album: null, date: null, track: null,
                genre: null, comment: null, composer: null, copyright: null, language: null,
            },
            raw: {},
        },
        embedded: [],
        provenance: {
            c2pa: {
                present: false,
                embedding: [],
                manifest_store: { active_manifest_urn: null, instance_id: null, claim_generator: null },
                assertions: [],
                signature: {
                    algorithm: null, signing_time: null,
                    certificate: { subject_cn: null, issuer_cn: null, serial_number: null },
                },
                validation: { validation_state: "Unknown", reasons: [], details_raw: null },
            },
        },
        errors: [],
    };
}

/** Detects the audio container format from magic bytes. */
export function sniffContainer(b) {
    if (b.length >= 3 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33)
        return { type: "mp3", mime: "audio/mpeg" };
    if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) {
        if ((b[1] & 0x06) === 0x00) return { type: "aac", mime: "audio/aac" };
        return { type: "mp3", mime: "audio/mpeg" };
    }
    if (b.length >= 8 && b[0] === 0x0b && b[1] === 0x77)
        return { type: "ac3", mime: "audio/ac3" };
    if (b.length >= 16 &&
        b[0] === 0x30 && b[1] === 0x26 && b[2] === 0xb2 && b[3] === 0x75 &&
        b[4] === 0x8e && b[5] === 0x66 && b[6] === 0xcf && b[7] === 0x11)
        return { type: "wma", mime: "audio/x-ms-wma" };
    if (b.length >= 12 && ascii4(b, 0) === "RIFF" && ascii4(b, 8) === "WAVE")
        return { type: "wav", mime: "audio/wav" };
    if (b.length >= 12 && ascii4(b, 0) === "BW64" && ascii4(b, 8) === "WAVE")
        return { type: "bw64", mime: "audio/wav" };
    if (b.length >= 4 && ascii4(b, 0) === "fLaC")
        return { type: "flac", mime: "audio/flac" };
    if (b.length >= 4 && ascii4(b, 0) === "OggS") {
        const idx = indexOfAscii(b, "OpusHead", 0, Math.min(b.length, 65536));
        return idx >= 0 ? { type: "opus", mime: "audio/ogg" } : { type: "ogg", mime: "audio/ogg" };
    }
    if (b.length >= 12 && ascii4(b, 4) === "ftyp") {
        const brand = ascii4(b, 8);
        const isM4A = brand === "M4A " || brand === "M4B " || brand === "M4P ";
        return { type: isM4A ? "m4a" : "mp4", mime: isM4A ? "audio/mp4" : "video/mp4", brand };
    }
    if (b.length >= 12 && ascii4(b, 0) === "FORM") {
        const formType = ascii4(b, 8);
        if (formType === "AIFF" || formType === "AIFC") return { type: "aiff", mime: "audio/aiff", brand: formType };
    }
    return { type: "unknown", mime: null };
}
