/**
 * @author d0s1nt [d0s1nt@cyberchefaudio]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

/* eslint-disable camelcase */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Extracts common audio metadata across MP3 (ID3v2/ID3v1/GEOB),
 * WAV/BWF/BW64 (INFO/bext/iXML/axml), FLAC (Vorbis Comment/Picture),
 * OGG (Vorbis/OpusTags), plus best-effort MP4/M4A and AIFF scanning.
 * Outputs normalized JSON.
 */
class ExtractAudioMetadata extends Operation {
    /** Creates the Extract Audio Metadata operation. */
    constructor() {
        super();

        this.name = "Extract Audio Metadata";
        this.module = "Default";
        this.description =
            "Extract common audio metadata across MP3 (ID3v2/ID3v1/GEOB), WAV/BWF/BW64 (INFO/bext/iXML/axml), FLAC (Vorbis Comment/Picture), OGG (Vorbis/OpusTags), AAC (ADTS), AC3 (Dolby Digital), WMA (ASF), plus best-effort MP4/M4A and AIFF scanning. Outputs normalized JSON.";
        this.infoURL = "https://github.com/gchq/CyberChef/wiki/Adding-a-new-operation";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.presentType = "html";

        this.args = [
            {
                name: "Filename (optional)",
                type: "string",
                value: "",
            },
            {
                name: "Max embedded text bytes (iXML/axml/etc)",
                type: "number",
                value: 1024 * 512, // 512KB
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {Object} Normalized metadata report.
     */
    run(input, args) {
        const filename = (args?.[0] || "").trim() || null;
        const maxTextBytes = Number.isFinite(args?.[1]) ? Math.max(1024, args[1]) : 1024 * 512;

        if (!(input instanceof ArrayBuffer) || input.byteLength === 0) {
            throw new OperationError("No input data. Load an audio file (drag/drop or use the open file button).");
        }

        const bytes = new Uint8Array(input);
        const container = sniffContainer(bytes);
        const report = makeEmptyReport(filename, bytes.length, container);

        try {
            switch (container.type) {
                case "mp3":
                    parseMp3(bytes, report);
                    break;
                case "wav":
                case "bw64":
                    parseRiffWave(bytes, report, maxTextBytes);
                    break;
                case "flac":
                    parseFlac(bytes, report, maxTextBytes);
                    break;
                case "ogg":
                case "opus":
                    parseOgg(bytes, report);
                    break;
                case "mp4":
                case "m4a":
                    parseMp4BestEffort(bytes, report);
                    break;
                case "aiff":
                    parseAiffBestEffort(bytes, report, maxTextBytes);
                    break;
                case "aac":
                    parseAacAdts(bytes, report);
                    break;
                case "ac3":
                    parseAc3(bytes, report);
                    break;
                case "wma":
                    parseWmaAsf(bytes, report);
                    break;
                default:
                    report.errors.push({
                        stage: "sniff",
                        message: "Unknown/unsupported container (best-effort scan not implemented).",
                    });
            }
        } catch (e) {
            report.errors.push({ stage: "parse", message: String(e?.message || e) });
        }

        return report;
    }

    /**
     * Renders the extracted metadata as an HTML table.
     *
     * @param {Object} data - Report object returned by run().
     * @returns {string} HTML table.
     */
    present(data) {
        if (!data || typeof data !== "object")
            return JSON.stringify(data, null, 4);

        const esc = Utils.escapeHtml;
        const row = (k, v) =>
            `<tr><td>${esc(String(k))}</td><td>${esc(String(v ?? ""))}</td></tr>\n`;
        const section = (title) =>
            `<tr><th colspan="2" style="background:#e9ecef;text-align:center">${esc(title)}</th></tr>\n`;

        let html = `<table class="table table-hover table-sm table-bordered table-nonfluid">\n`;

        // --- Artifact ---
        html += section("Artifact");
        html += row("Filename", data.artifact?.filename || "(none)");
        html += row("Size", `${(data.artifact?.byte_length ?? 0).toLocaleString()} bytes`);
        html += row("Container", data.artifact?.container?.type);
        html += row("MIME", data.artifact?.container?.mime);
        if (data.artifact?.container?.brand)
            html += row("Brand", data.artifact.container.brand);

        // --- Detections ---
        html += section("Detections");
        html += row("Metadata systems", (data.detections?.metadata_systems || []).join(", ") || "None");
        html += row("Provenance systems", (data.detections?.provenance_systems || []).join(", ") || "None");

        // --- Common tags ---
        const common = data.tags?.common || {};
        const hasCommon = Object.values(common).some((v) => v !== null);
        html += section("Common Tags");
        if (hasCommon) {
            for (const [key, val] of Object.entries(common)) {
                if (val !== null)
                    html += row(key.charAt(0).toUpperCase() + key.slice(1), val);
            }
        } else {
            html += row("(none)", "No common tags found");
        }

        // --- ID3v2 frames ---
        if (data.tags?.raw?.id3v2?.frames?.length) {
            html += section("ID3v2 Frames");
            for (const f of data.tags.raw.id3v2.frames) {
                const val = typeof f.decoded === "object" ?
                    JSON.stringify(f.decoded) :
                    (f.decoded ?? `(${f.size} bytes)`);
                const desc = f.description ? ` \u2014 ${f.description}` : "";
                html += row(f.id + desc, val);
            }
        }

        // --- ID3v1 ---
        if (data.tags?.raw?.id3v1) {
            html += section("ID3v1");
            for (const [key, val] of Object.entries(data.tags.raw.id3v1)) {
                if (val) html += row(key, val);
            }
        }

        // --- APEv2 ---
        if (data.tags?.raw?.apev2?.items?.length) {
            html += section("APEv2 Tags");
            for (const item of data.tags.raw.apev2.items) {
                html += row(item.key, item.value);
            }
        }

        // --- Vorbis Comments ---
        if (data.tags?.raw?.vorbis_comments?.comments?.length) {
            html += section("Vorbis Comments");
            html += row("Vendor", data.tags.raw.vorbis_comments.vendor);
            for (const c of data.tags.raw.vorbis_comments.comments) {
                html += row(c.key, c.value);
            }
        }

        // --- RIFF INFO ---
        if (data.tags?.raw?.riff?.info) {
            html += section("RIFF INFO");
            for (const [key, val] of Object.entries(data.tags.raw.riff.info)) {
                html += row(key, val);
            }
        }

        // --- BWF bext ---
        if (data.tags?.raw?.riff?.bext) {
            html += section("BWF bext");
            for (const [key, val] of Object.entries(data.tags.raw.riff.bext)) {
                if (val !== null) html += row(key, val);
            }
        }

        // --- RIFF chunks ---
        if (data.tags?.raw?.riff?.chunks?.length) {
            html += section("RIFF Chunks");
            for (const c of data.tags.raw.riff.chunks) {
                html += row(c.id, `${c.size} bytes @ offset ${c.offset}`);
            }
        }

        // --- FLAC blocks ---
        if (data.tags?.raw?.flac?.blocks?.length) {
            html += section("FLAC Metadata Blocks");
            for (const blk of data.tags.raw.flac.blocks) {
                html += row(blk.type, `${blk.length} bytes`);
            }
        }

        // --- MP4 atoms ---
        if (data.tags?.raw?.mp4?.top_level_atoms?.length) {
            html += section("MP4 Top-Level Atoms");
            const atoms = data.tags.raw.mp4.top_level_atoms;
            for (const a of atoms.slice(0, 50)) {
                html += row(a.type, `${a.size} bytes @ offset ${a.offset}`);
            }
            if (atoms.length > 50)
                html += row("...", `${atoms.length - 50} more atoms`);
        }

        // --- AIFF chunks ---
        if (data.tags?.raw?.aiff?.chunks?.length) {
            html += section("AIFF Chunks");
            for (const c of data.tags.raw.aiff.chunks) {
                html += row(c.id, c.value);
            }
        }

        // --- AAC ADTS ---
        if (data.tags?.raw?.aac) {
            html += section("AAC ADTS");
            for (const [key, val] of Object.entries(data.tags.raw.aac)) {
                if (val !== null) html += row(key, val);
            }
        }

        // --- AC3 ---
        if (data.tags?.raw?.ac3) {
            html += section("AC3 (Dolby Digital)");
            for (const [key, val] of Object.entries(data.tags.raw.ac3)) {
                if (val !== null) html += row(key, val);
            }
        }

        // --- WMA/ASF ---
        if (data.tags?.raw?.asf?.content_description) {
            html += section("ASF Content Description");
            for (const [key, val] of Object.entries(data.tags.raw.asf.content_description)) {
                if (val) html += row(key, val);
            }
        }
        if (data.tags?.raw?.asf?.extended_content?.length) {
            html += section("ASF Extended Content");
            for (const d of data.tags.raw.asf.extended_content) {
                html += row(d.name, d.value);
            }
        }

        // --- Embedded objects ---
        if (data.embedded?.length) {
            html += section("Embedded Objects");
            for (const e of data.embedded) {
                html += row(e.id, `${e.content_type || "unknown"} \u2014 ${(e.byte_length ?? 0).toLocaleString()} bytes`);
            }
        }

        // --- C2PA provenance ---
        if (data.provenance?.c2pa?.present) {
            html += section("C2PA Provenance");
            html += row("Present", "Yes");
            for (const emb of (data.provenance.c2pa.embedding || [])) {
                html += row("Carrier", `${emb.carrier} \u2014 ${(emb.byte_length ?? 0).toLocaleString()} bytes`);
            }
        }

        // --- Errors ---
        if (data.errors?.length) {
            html += section("Errors");
            for (const e of data.errors) {
                html += row(e.stage, e.message);
            }
        }

        html += "</table>";
        return html;
    }
}

export default ExtractAudioMetadata;

/* ----------------------------- Normalized schema ---------------------------- */

/**
 * Builds the empty report skeleton with all required fields.
 *
 * @param {string|null} filename - User-supplied filename.
 * @param {number} byteLength - Total byte length of the input.
 * @param {object} container - Container sniff result.
 * @returns {object} Empty report ready to be populated by a format parser.
 */
function makeEmptyReport(filename, byteLength, container) {
    return {
        schema_version: "audio-meta-1.0",
        artifact: {
            filename,
            byte_length: byteLength,
            container: {
                type: container.type,
                brand: container.brand || null,
                mime: container.mime || null,
            },
        },
        detections: {
            metadata_systems: [],
            provenance_systems: [],
        },
        tags: {
            common: {
                title: null,
                artist: null,
                album: null,
                date: null,
                track: null,
                genre: null,
                comment: null,
                composer: null,
                copyright: null,
                language: null,
            },
            raw: {},
        },
        embedded: [],
        provenance: {
            c2pa: {
                present: false,
                embedding: [],
                manifest_store: {
                    active_manifest_urn: null,
                    instance_id: null,
                    claim_generator: null,
                },
                assertions: [],
                signature: {
                    algorithm: null,
                    signing_time: null,
                    certificate: { subject_cn: null, issuer_cn: null, serial_number: null },
                },
                validation: {
                    validation_state: "Unknown",
                    reasons: [],
                    details_raw: null,
                },
            },
        },
        errors: [],
    };
}

/* ------------------------------ Container sniff ----------------------------- */

/**
 * Detects the audio container format from magic bytes.
 *
 * @param {Uint8Array} b - Raw file bytes.
 * @returns {{type: string, mime: string|null, brand?: string}}
 */
function sniffContainer(b) {
    // ID3v2 header → MP3
    if (b.length >= 3 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) {
        return { type: "mp3", mime: "audio/mpeg" };
    }
    // MPEG audio sync (0xFFE): distinguish AAC ADTS (layer=00) from MP3
    if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) {
        if ((b[1] & 0x06) === 0x00) {
            return { type: "aac", mime: "audio/aac" };
        }
        return { type: "mp3", mime: "audio/mpeg" };
    }
    // AC3 / Dolby Digital sync word
    if (b.length >= 8 && b[0] === 0x0b && b[1] === 0x77) {
        return { type: "ac3", mime: "audio/ac3" };
    }
    // ASF / WMA — 16-byte ASF Header Object GUID
    if (b.length >= 16 &&
        b[0] === 0x30 && b[1] === 0x26 && b[2] === 0xb2 && b[3] === 0x75 &&
        b[4] === 0x8e && b[5] === 0x66 && b[6] === 0xcf && b[7] === 0x11) {
        return { type: "wma", mime: "audio/x-ms-wma" };
    }
    if (b.length >= 12 && ascii4(b, 0) === "RIFF" && ascii4(b, 8) === "WAVE") {
        return { type: "wav", mime: "audio/wav" };
    }
    if (b.length >= 12 && ascii4(b, 0) === "BW64" && ascii4(b, 8) === "WAVE") {
        return { type: "bw64", mime: "audio/wav" };
    }
    if (b.length >= 4 && ascii4(b, 0) === "fLaC") {
        return { type: "flac", mime: "audio/flac" };
    }
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

/**
 * Reads 4 bytes as an ASCII string.
 *
 * @param {Uint8Array} b
 * @param {number} off
 * @returns {string}
 */
function ascii4(b, off) {
    if (off + 4 > b.length) return "";
    return String.fromCharCode(b[off], b[off + 1], b[off + 2], b[off + 3]);
}

/**
 * Finds the first occurrence of an ASCII string in a byte array.
 *
 * @param {Uint8Array} b
 * @param {string} s - ASCII needle.
 * @param {number} start
 * @param {number} end
 * @returns {number} Byte offset, or -1 if not found.
 */
function indexOfAscii(b, s, start, end) {
    const limit = Math.max(0, Math.min(end, b.length) - s.length);
    for (let i = start; i <= limit; i++) {
        let ok = true;
        for (let j = 0; j < s.length; j++) {
            if (b[i + j] !== s.charCodeAt(j)) {
                ok = false;
                break;
            }
        }
        if (ok) return i;
    }
    return -1;
}

/* ---------------------------------- MP3 ---------------------------------- */

/**
 * Parses MP3 metadata: ID3v2 frames, ID3v1 footer, and APEv2 tags.
 *
 * @param {Uint8Array} b
 * @param {object} report
 */
function parseMp3(b, report) {
    report.detections.metadata_systems.push("id3v2");

    const id3 = parseId3v2(b);
    report.tags.raw.id3v2 = id3 ? { header: id3.header, frames: [] } : null;

    if (id3) {
        for (const f of id3.frames) {
            const entry = {
                id: f.id,
                size: f.size,
                description: describeId3Frame(f.id),
            };

            if (f.id[0] === "T" && f.id !== "TXXX") {
                const text = decodeId3TextFrame(f.data);
                entry.decoded = text;

                if (f.id === "TLEN") {
                    const ms = normalizeTlen(text);
                    if (ms !== null) entry.normalized_ms = ms;
                }

                mapCommonId3(report, f.id, text);
            } else if (f.id === "TXXX") {
                const txxx = decodeTxxx(f.data);
                entry.decoded = txxx;
                if (!report.tags.raw.id3v2.txxx) report.tags.raw.id3v2.txxx = [];
                report.tags.raw.id3v2.txxx.push(txxx);
            } else if (f.id === "COMM") {
                const comm = decodeCommFrame(f.data);
                entry.decoded = comm;

                if (comm?.text && !report.tags.common.comment) {
                    report.tags.common.comment = comm.text;
                }
            } else if (f.id === "GEOB") {
                const geob = parseGeob(f.data);
                entry.geob = {
                    mimeType: geob.mimeType,
                    filename: geob.filename,
                    description: geob.description,
                    object_bytes: geob.objectData.length,
                };

                const geobId = `geob_${report.embedded.filter((x) => x.source === "id3v2:GEOB").length}`;

                report.embedded.push({
                    id: geobId,
                    source: "id3v2:GEOB",
                    content_type: geob.mimeType || null,
                    byte_length: geob.objectData.length,
                    description: geob.description || null,
                    filename: geob.filename || null,
                });

                const mt = (geob.mimeType || "").toLowerCase();
                if (mt.includes("c2pa") || mt.includes("jumbf") || mt.includes("application/x-c2pa-manifest-store")) {
                    report.provenance.c2pa.present = true;
                    report.provenance.c2pa.embedding.push({
                        carrier: "id3v2:GEOB",
                        content_type: geob.mimeType || null,
                        byte_length: geob.objectData.length,
                    });
                }
            }

            report.tags.raw.id3v2.frames.push(entry);
        }
    } else {
        report.detections.metadata_systems = report.detections.metadata_systems.filter((x) => x !== "id3v2");
    }

    // ID3v1 footer (128 bytes)
    const id3v1 = parseId3v1(b);
    if (id3v1) {
        report.detections.metadata_systems.push("id3v1");
        report.tags.raw.id3v1 = id3v1;

        report.tags.common.title = report.tags.common.title || id3v1.title || null;
        report.tags.common.artist = report.tags.common.artist || id3v1.artist || null;
        report.tags.common.album = report.tags.common.album || id3v1.album || null;
        report.tags.common.date = report.tags.common.date || id3v1.year || null;
        report.tags.common.comment = report.tags.common.comment || id3v1.comment || null;
        report.tags.common.genre = report.tags.common.genre || id3v1.genre || null;
        report.tags.common.track = report.tags.common.track || id3v1.track || null;
    }

    // APEv2 tag (best-effort: look for "APETAGEX" at end)
    const ape = parseApeV2BestEffort(b);
    if (ape) {
        report.detections.metadata_systems.push("apev2");
        report.tags.raw.apev2 = ape;
    }
}

/* -------------------------------- WAV/BWF ------------------------------- */

/**
 * Parses WAV/BWF/BW64 RIFF chunks: LIST/INFO, bext, iXML, axml, ds64.
 *
 * @param {Uint8Array} b
 * @param {object} report
 * @param {number} maxTextBytes
 */
function parseRiffWave(b, report, maxTextBytes) {
    report.detections.metadata_systems.push("riff_info");

    const chunks = riffChunks(b);
    const riff = { chunks: [], info: null, bext: null, ixml: null, axml: null, ds64: null };

    const info = {};
    for (const c of chunks) {
        riff.chunks.push({ id: c.id, size: c.size, offset: c.dataOff });

        if (c.id === "ds64") {
            riff.ds64 = { present: true, size: c.size };
            if (!report.detections.metadata_systems.includes("bw64_ds64")) report.detections.metadata_systems.push("bw64_ds64");
            if (report.artifact.container.type === "wav") report.artifact.container.type = "bw64";
        }

        if (c.id === "LIST" && ascii4(b, c.dataOff) === "INFO") {
            const sub = riffListSubchunks(b, c.dataOff + 4, c.dataOff + c.size);
            for (const s of sub) {
                const val = decodeLatin1Trim(b.slice(s.dataOff, s.dataOff + s.size));
                info[s.id] = val;
            }
        }

        if (c.id === "bext") {
            if (!report.detections.metadata_systems.includes("bwf_bext")) report.detections.metadata_systems.push("bwf_bext");
            riff.bext = parseBext(b, c.dataOff, c.size);
        }

        if (c.id === "iXML") {
            if (!report.detections.metadata_systems.includes("ixml")) report.detections.metadata_systems.push("ixml");
            const payload = b.slice(c.dataOff, c.dataOff + c.size);
            const xmlBytes = payload.slice(0, Math.min(payload.length, maxTextBytes));

            riff.ixml = { xml: safeUtf8(xmlBytes), truncated: payload.length > maxTextBytes };

            report.embedded.push({
                id: "ixml_0",
                source: "riff:iXML",
                content_type: "application/xml",
                byte_length: payload.length,
                description: "iXML chunk",
                filename: null,
            });
        }

        if (c.id === "axml") {
            if (!report.detections.metadata_systems.includes("axml")) report.detections.metadata_systems.push("axml");
            const payload = b.slice(c.dataOff, c.dataOff + c.size);
            const xmlBytes = payload.slice(0, Math.min(payload.length, maxTextBytes));

            riff.axml = { xml: safeUtf8(xmlBytes), truncated: payload.length > maxTextBytes };

            report.embedded.push({
                id: "axml_0",
                source: "riff:axml",
                content_type: "application/xml",
                byte_length: payload.length,
                description: "axml chunk",
                filename: null,
            });
        }
    }

    riff.info = Object.keys(info).length ? info : null;
    report.tags.raw.riff = riff;

    // map some INFO tags to common layer
    if (riff.info) {
        report.tags.common.title = report.tags.common.title || riff.info.INAM || null;
        report.tags.common.artist = report.tags.common.artist || riff.info.IART || null;
        report.tags.common.comment = report.tags.common.comment || riff.info.ICMT || null;
        report.tags.common.genre = report.tags.common.genre || riff.info.IGNR || null;
        report.tags.common.date = report.tags.common.date || riff.info.ICRD || null;
        report.tags.common.copyright = report.tags.common.copyright || riff.info.ICOP || null;
    }
}

/* ---------------------------------- FLAC --------------------------------- */

/**
 * Parses FLAC metablocks: STREAMINFO, Vorbis Comment, PICTURE.
 *
 * @param {Uint8Array} b
 * @param {object} report
 * @param {number} maxTextBytes
 */
function parseFlac(b, report, maxTextBytes) {
    report.detections.metadata_systems.push("flac_metablocks");

    const blocks = parseFlacMetaBlocks(b);
    report.tags.raw.flac = { blocks: [] };

    for (const blk of blocks) {
        report.tags.raw.flac.blocks.push({ type: blk.typeName, length: blk.length });

        if (blk.typeName === "VORBIS_COMMENT") {
            if (!report.detections.metadata_systems.includes("vorbis_comments")) report.detections.metadata_systems.push("vorbis_comments");
            const vc = parseVorbisComment(blk.data);
            report.tags.raw.vorbis_comments = vc;
            mapVorbisCommon(report, vc);
        } else if (blk.typeName === "PICTURE") {
            const pic = parseFlacPicture(blk.data, maxTextBytes);
            const picId = `cover_art_${report.embedded.filter((x) => x.id.startsWith("cover_art_")).length}`;

            report.embedded.push({
                id: picId,
                source: "flac:PICTURE",
                content_type: pic.mime || null,
                byte_length: pic.dataLength,
                description: pic.description || null,
                filename: null,
            });
        }
    }
}

/* ---------------------------------- OGG ---------------------------------- */

/**
 * Parses OGG/Opus Vorbis comments.
 *
 * @param {Uint8Array} b
 * @param {object} report
 */
function parseOgg(b, report) {
    if (!report.detections.metadata_systems.includes("ogg_opus_tags")) report.detections.metadata_systems.push("ogg_opus_tags");

    // Best-effort: scan first ~1MB for "OpusTags" or "\x03vorbis" comment header.
    const scanEnd = Math.min(b.length, 1024 * 1024);

    let tags = null;
    const opusTagsIdx = indexOfAscii(b, "OpusTags", 0, scanEnd);
    if (opusTagsIdx >= 0) {
        report.artifact.container.type = "opus";
        tags = parseVorbisComment(b.slice(opusTagsIdx + 8, scanEnd)); // after "OpusTags"
    } else {
        const afterVorbis = findVorbisCommentHeader(b, 0, scanEnd);
        if (afterVorbis >= 0) tags = parseVorbisComment(b.slice(afterVorbis, scanEnd));
    }

    report.tags.raw.ogg = { has_opustags: opusTagsIdx >= 0, has_vorbis_comment: !!tags };

    if (tags) {
        if (!report.detections.metadata_systems.includes("vorbis_comments")) report.detections.metadata_systems.push("vorbis_comments");
        report.tags.raw.vorbis_comments = tags;
        mapVorbisCommon(report, tags);
    }
}

/**
 * Locates the Vorbis comment header (0x03 + "vorbis") in the byte stream.
 *
 * @param {Uint8Array} b
 * @param {number} start
 * @param {number} end
 * @returns {number} Offset just past the header, or -1.
 */
function findVorbisCommentHeader(b, start, end) {
    const needle = new TextEncoder().encode("vorbis");
    for (let i = start; i < end - 7; i++) {
        if (b[i] === 0x03) {
            let ok = true;
            for (let j = 0; j < needle.length; j++) {
                if (b[i + 1 + j] !== needle[j]) {
                    ok = false;
                    break;
                }
            }
            if (ok) return i + 1 + needle.length;
        }
    }
    return -1;
}

/* --------------------------------- MP4/M4A ------------------------------- */

/**
 * Best-effort top-level atom scan for MP4/M4A containers.
 *
 * @param {Uint8Array} b
 * @param {object} report
 */
function parseMp4BestEffort(b, report) {
    report.detections.metadata_systems.push("mp4_atoms");
    const atoms = [];

    // naive top-level atom walk
    let off = 0;
    while (off + 8 <= b.length && atoms.length < 2000) {
        const size = u32be(b, off);
        const type = ascii4(b, off + 4);
        if (size < 8) break;
        atoms.push({ type, size, offset: off });
        off += size;
    }

    const hasMoov = atoms.some((a) => a.type === "moov");
    const hasUdta = atoms.some((a) => a.type === "udta");
    const hasMeta = atoms.some((a) => a.type === "meta");
    const hasIlst = atoms.some((a) => a.type === "ilst");

    report.tags.raw.mp4 = {
        top_level_atoms: atoms.slice(0, 200),
        hints: { hasMoov, hasUdta, hasMeta, hasIlst },
    };
}

/* ---------------------------------- AIFF --------------------------------- */

/**
 * Best-effort AIFF/AIFC chunk scanning for NAME, AUTH, ANNO.
 *
 * @param {Uint8Array} b
 * @param {object} report
 * @param {number} maxTextBytes
 */
function parseAiffBestEffort(b, report, maxTextBytes) {
    report.detections.metadata_systems.push("aiff_chunks");
    // FORM header: "FORM" [size] [AIFF/AIFC]
    let off = 12;
    const chunks = [];
    while (off + 8 <= b.length && chunks.length < 2000) {
        const id = ascii4(b, off);
        const size = u32be(b, off + 4);
        const dataOff = off + 8;
        chunks.push({ id, size, offset: off });

        // read a few common textual chunks
        if (["NAME", "AUTH", "ANNO", "(c) "].includes(id)) {
            const txt = safeUtf8(b.slice(dataOff, dataOff + Math.min(size, maxTextBytes)));
            if (!report.tags.raw.aiff) report.tags.raw.aiff = { chunks: [] };
            report.tags.raw.aiff.chunks.push({ id, value: txt, truncated: size > maxTextBytes });
        }

        off = dataOff + size + (size % 2); // AIFF chunks pad to even
    }

    if (!report.tags.raw.aiff) report.tags.raw.aiff = {};
    report.tags.raw.aiff.chunk_index = chunks.slice(0, 500);

    // map a little
    const nameChunk = report.tags.raw.aiff?.chunks?.find((c) => c.id === "NAME")?.value;
    if (nameChunk) report.tags.common.title = report.tags.common.title || nameChunk;
}

/* ---------------------------------- AAC ---------------------------------- */

const AAC_SAMPLE_RATES = [
    96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050,
    16000, 12000, 11025, 8000, 7350,
];
const AAC_PROFILES = ["Main", "LC", "SSR", "LTP"];
const AAC_CHANNELS = ["defined in AOT", "mono", "stereo", "3.0", "4.0", "5.0", "5.1", "7.1"];

/**
 * Parses AAC ADTS frame header for audio parameters.
 *
 * @param {Uint8Array} b
 * @param {object} report
 */
function parseAacAdts(b, report) {
    report.detections.metadata_systems.push("adts_header");

    if (b.length < 7) return;

    const id = (b[1] >> 3) & 0x01; // 0 = MPEG-4, 1 = MPEG-2
    const profile = (b[2] >> 6) & 0x03;
    const freqIdx = (b[2] >> 2) & 0x0f;
    const chanCfg = ((b[2] & 0x01) << 2) | ((b[3] >> 6) & 0x03);

    report.tags.raw.aac = {
        mpeg_version: id === 1 ? "MPEG-2" : "MPEG-4",
        profile: AAC_PROFILES[profile] || `Profile ${profile}`,
        sample_rate: AAC_SAMPLE_RATES[freqIdx] || null,
        sample_rate_index: freqIdx,
        channel_configuration: chanCfg,
        channel_description: AAC_CHANNELS[chanCfg] || null,
    };
}

/* ---------------------------------- AC3 ---------------------------------- */

const AC3_SAMPLE_RATES = [48000, 44100, 32000];
const AC3_BITRATES = [
    32, 40, 48, 56, 64, 80, 96, 112, 128, 160,
    192, 224, 256, 320, 384, 448, 512, 576, 640,
];
const AC3_ACMODES = [
    "2.0 (Ch1+Ch2)", "1.0 (C)", "2.0 (L R)", "3.0 (L C R)",
    "2.1 (L R S)", "3.1 (L C R S)", "2.2 (L R SL SR)", "3.2 (L C R SL SR)",
];

/**
 * Parses AC3 (Dolby Digital) bitstream info.
 *
 * @param {Uint8Array} b
 * @param {object} report
 */
function parseAc3(b, report) {
    report.detections.metadata_systems.push("ac3_bsi");

    if (b.length < 8) return;

    // bytes 0-1: sync (0x0B77), bytes 2-3: CRC1
    const fscod = (b[4] >> 6) & 0x03;
    const frmsizecod = b[4] & 0x3f;
    const bsid = (b[5] >> 3) & 0x1f;
    const bsmod = b[5] & 0x07;
    const acmod = (b[6] >> 5) & 0x07;

    report.tags.raw.ac3 = {
        sample_rate: AC3_SAMPLE_RATES[fscod] || null,
        fscod,
        bitrate_kbps: AC3_BITRATES[frmsizecod >> 1] || null,
        frmsizecod,
        bsid,
        bsmod,
        acmod,
        channel_layout: AC3_ACMODES[acmod] || null,
    };
}

/* --------------------------------- WMA/ASF ------------------------------- */

// ASF GUIDs (first 4 bytes are enough for identification within the header)
const ASF_CONTENT_DESC_GUID = [0x33, 0x26, 0xb2, 0x75];
const ASF_EXT_CONTENT_DESC_GUID = [0x40, 0xa4, 0xd0, 0xd2];

/**
 * Parses WMA files (ASF container) for content description metadata.
 *
 * @param {Uint8Array} b
 * @param {object} report
 */
function parseWmaAsf(b, report) {
    report.detections.metadata_systems.push("asf_header");

    if (b.length < 30) return;

    // ASF Header Object: GUID(16) + Size(8 LE) + NumObjects(4 LE) + Reserved(2)
    const headerSize = Number(u64le(b, 16));
    const numObjects = u32le(b, 24);
    const headerEnd = Math.min(b.length, headerSize);

    const objects = [];
    let off = 30;

    for (let i = 0; i < numObjects && off + 24 <= headerEnd; i++) {
        const guid4 = [b[off], b[off + 1], b[off + 2], b[off + 3]];
        const objSize = Number(u64le(b, off + 16));
        if (objSize < 24 || off + objSize > headerEnd) break;

        const dataOff = off + 24;
        const dataLen = objSize - 24;

        // Content Description Object
        if (guidMatch(guid4, ASF_CONTENT_DESC_GUID) && dataLen >= 10) {
            const cd = parseAsfContentDescription(b, dataOff);
            if (!report.detections.metadata_systems.includes("asf_content_desc"))
                report.detections.metadata_systems.push("asf_content_desc");
            if (!report.tags.raw.asf) report.tags.raw.asf = {};
            report.tags.raw.asf.content_description = cd;

            report.tags.common.title = report.tags.common.title || cd.title || null;
            report.tags.common.artist = report.tags.common.artist || cd.author || null;
            report.tags.common.copyright = report.tags.common.copyright || cd.copyright || null;
            report.tags.common.comment = report.tags.common.comment || cd.description || null;
        }

        // Extended Content Description Object
        if (guidMatch(guid4, ASF_EXT_CONTENT_DESC_GUID) && dataLen >= 2) {
            const ext = parseAsfExtContentDescription(b, dataOff, dataOff + dataLen);
            if (!report.detections.metadata_systems.includes("asf_ext_content_desc"))
                report.detections.metadata_systems.push("asf_ext_content_desc");
            if (!report.tags.raw.asf) report.tags.raw.asf = {};
            report.tags.raw.asf.extended_content = ext;

            for (const d of ext) {
                const k = (d.name || "").toUpperCase();
                if (k === "WM/ALBUMTITLE" && d.value)
                    report.tags.common.album = report.tags.common.album || d.value;
                if (k === "WM/GENRE" && d.value)
                    report.tags.common.genre = report.tags.common.genre || d.value;
                if (k === "WM/YEAR" && d.value)
                    report.tags.common.date = report.tags.common.date || d.value;
                if (k === "WM/TRACKNUMBER" && d.value)
                    report.tags.common.track = report.tags.common.track || d.value;
                if (k === "WM/COMPOSER" && d.value)
                    report.tags.common.composer = report.tags.common.composer || d.value;
                if (k === "WM/LANGUAGE" && d.value)
                    report.tags.common.language = report.tags.common.language || d.value;
            }
        }

        objects.push({ guid_prefix: guid4.map(x => x.toString(16).padStart(2, "0")).join(""), size: objSize });
        off += objSize;
    }

    if (!report.tags.raw.asf) report.tags.raw.asf = {};
    report.tags.raw.asf.header_objects = objects;
}

/** @param {number[]} a @param {number[]} b @returns {boolean} */
function guidMatch(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/**
 * Parses the ASF Content Description Object fields.
 *
 * @param {Uint8Array} b
 * @param {number} off - Start of object data (after GUID+size).
 * @returns {object}
 */
function parseAsfContentDescription(b, off) {
    const titleLen = u16le(b, off);
    const authorLen = u16le(b, off + 2);
    const copyrightLen = u16le(b, off + 4);
    const descLen = u16le(b, off + 6);
    const ratingLen = u16le(b, off + 8);
    let pos = off + 10;

    const title = decodeUtf16LE(b, pos, titleLen);
    pos += titleLen;
    const author = decodeUtf16LE(b, pos, authorLen);
    pos += authorLen;
    const copyright = decodeUtf16LE(b, pos, copyrightLen);
    pos += copyrightLen;
    const description = decodeUtf16LE(b, pos, descLen);
    pos += descLen;
    const rating = decodeUtf16LE(b, pos, ratingLen);

    return { title, author, copyright, description, rating };
}

/**
 * Parses the ASF Extended Content Description Object descriptors.
 *
 * @param {Uint8Array} b
 * @param {number} off
 * @param {number} end
 * @returns {Array}
 */
function parseAsfExtContentDescription(b, off, end) {
    const count = u16le(b, off);
    let pos = off + 2;
    const descriptors = [];

    for (let i = 0; i < count && pos + 6 <= end && descriptors.length < 5000; i++) {
        const nameLen = u16le(b, pos);
        pos += 2;
        if (pos + nameLen > end) break;
        const name = decodeUtf16LE(b, pos, nameLen);
        pos += nameLen;

        const valueType = u16le(b, pos);
        pos += 2;
        const valueLen = u16le(b, pos);
        pos += 2;
        if (pos + valueLen > end) break;

        let value;
        if (valueType === 0) {
            value = decodeUtf16LE(b, pos, valueLen);
        } else if (valueType === 3) {
            value = u32le(b, pos);
        } else if (valueType === 5) {
            value = u16le(b, pos);
        } else if (valueType === 2) {
            value = u32le(b, pos) !== 0;
        } else {
            value = `(${valueLen} bytes, type ${valueType})`;
        }
        pos += valueLen;
        descriptors.push({ name, value_type: valueType, value });
    }
    return descriptors;
}

/* ------------------------------- Helpers: ID3 ------------------------------ */

const ID3_FRAME_DESCRIPTIONS = {
    TIT2: "Title/songname/content description",
    TPE1: "Lead performer(s)/Soloist(s)",
    TRCK: "Track number/Position in set",
    TALB: "Album/Movie/Show title",
    TDRC: "Recording time",
    TYER: "Year",
    TCON: "Content type",
    TPE2: "Band/orchestra/accompaniment",
    TLEN: "Length (ms)",
    TCOM: "Composer",
    COMM: "Comments",
    APIC: "Attached picture",
    GEOB: "General encapsulated object",
    TXXX: "User defined text information frame",
    UFID: "Unique file identifier",
    PRIV: "Private frame",
};

/** @param {string} frameId @returns {string|null} */
function describeId3Frame(frameId) {
    return ID3_FRAME_DESCRIPTIONS[frameId] || null;
}

/** Decodes an ID3v2 COMM (Comments) frame. @param {Uint8Array} data @returns {object|null} */
function decodeCommFrame(data) {
    // [encoding:1][language:3][shortDesc: null-term][comment text]
    if (!data || data.length < 5) return null;

    const enc = data[0];
    const language = String.fromCharCode(data[1], data[2], data[3]);

    const { valueBytes: descBytes, next } = readNullTerminated(data, 4, enc);
    const short_description = decodeText(descBytes, enc).replace(/\u0000/g, "").trim() || null;

    const text = decodeText(data.slice(next), enc).replace(/\u0000/g, "").trim() || null;

    return { language, short_description, text };
}

/** Normalizes TLEN to integer milliseconds. @param {string} decodedString @returns {number|null} */
function normalizeTlen(decodedString) {
    if (!decodedString) return null;

    if (/^\s*\d+\s*$/.test(decodedString)) {
        return parseInt(decodedString.trim(), 10);
    }

    const f = Number(decodedString);
    if (Number.isFinite(f) && f > 0) {
        if (f < 100000) return Math.round(f * 1000);
    }
    return null;
}

/** Parses the ID3v2 tag header and frames. @param {Uint8Array} mp3 @returns {object|null} */
function parseId3v2(mp3) {
    if (mp3.length < 10) return null;
    if (mp3[0] !== 0x49 || mp3[1] !== 0x44 || mp3[2] !== 0x33) return null;

    const major = mp3[3];
    const minor = mp3[4];
    const flags = mp3[5];
    const tagSize = synchsafeToInt(mp3[6], mp3[7], mp3[8], mp3[9]);

    let offset = 10;
    const end = 10 + tagSize;

    // Extended header and unsynchronisation are not handled
    const frames = [];
    while (offset + 10 <= end) {
        const id = String.fromCharCode(mp3[offset], mp3[offset + 1], mp3[offset + 2], mp3[offset + 3]);
        if (!/^[A-Z0-9]{4}$/.test(id)) break;

        const size = major === 4 ?
            synchsafeToInt(mp3[offset + 4], mp3[offset + 5], mp3[offset + 6], mp3[offset + 7]) :
            u32be(mp3, offset + 4);

        offset += 10;
        if (size <= 0 || offset + size > mp3.length) break;

        const data = mp3.slice(offset, offset + size);
        offset += size;

        frames.push({ id, size, data });
    }

    return {
        header: { version: `${major}.${minor}`, flags, tag_size: tagSize },
        frames,
    };
}

/** Parses the 128-byte ID3v1 tag at the end of the file. @param {Uint8Array} b @returns {object|null} */
function parseId3v1(b) {
    if (b.length < 128) return null;
    const off = b.length - 128;
    if (b[off] !== 0x54 || b[off + 1] !== 0x41 || b[off + 2] !== 0x47) return null;

    const title = decodeLatin1Trim(b.slice(off + 3, off + 33));
    const artist = decodeLatin1Trim(b.slice(off + 33, off + 63));
    const album = decodeLatin1Trim(b.slice(off + 63, off + 93));
    const year = decodeLatin1Trim(b.slice(off + 93, off + 97));
    const comment = decodeLatin1Trim(b.slice(off + 97, off + 127));

    // ID3v1.1 track convention: if byte 125 == 0 then byte 126 is track
    let track = null;
    if (b[off + 125] === 0x00 && b[off + 126] !== 0x00) track = String(b[off + 126]);

    const genre = b[off + 127];

    return { title, artist, album, year, comment, track, genre: String(genre) };
}

/** Decodes an ID3v2 text frame (Txxx excluded). @param {Uint8Array} data @returns {string} */
function decodeId3TextFrame(data) {
    if (!data || data.length < 1) return "";
    const enc = data[0];
    const txt = decodeText(data.slice(1), enc);
    return txt.replace(/\u0000/g, "").trim();
}

/** Decodes an ID3v2 TXXX (user-defined text) frame. @param {Uint8Array} data @returns {object|null} */
function decodeTxxx(data) {
    if (!data || data.length < 2) return null;
    const enc = data[0];
    // description \0 value
    const { valueBytes: descBytes, next } = readNullTerminated(data, 1, enc);
    const desc = decodeText(descBytes, enc).replace(/\u0000/g, "").trim();
    const val = decodeText(data.slice(next), enc).replace(/\u0000/g, "").trim();
    return { description: desc || null, value: val || null };
}

/** Parses an ID3v2 GEOB (General Encapsulated Object) frame. @param {Uint8Array} frameData @returns {object} */
function parseGeob(frameData) {
    // [textEncoding:1][mime\0][filename\0][description\0][objectData...]
    const encoding = frameData[0];
    let off = 1;

    const mime = readNullTerminated(frameData, off, 0);
    const mimeType = decodeLatin1Trim(mime.valueBytes);
    off = mime.next;

    const file = readNullTerminated(frameData, off, encoding);
    const filename = decodeText(file.valueBytes, encoding).replace(/\u0000/g, "").trim();
    off = file.next;

    const desc = readNullTerminated(frameData, off, encoding);
    const description = decodeText(desc.valueBytes, encoding).replace(/\u0000/g, "").trim();
    off = desc.next;

    const objectData = frameData.slice(off);
    return { encoding, mimeType, filename, description, objectData };
}

/** Maps an ID3v2 frame value to the common tags layer. @param {object} report @param {string} frameId @param {string} text */
function mapCommonId3(report, frameId, text) {
    const v = text || null;
    switch (frameId) {
        case "TIT2":
            report.tags.common.title = report.tags.common.title || v;
            break;
        case "TPE1":
            report.tags.common.artist = report.tags.common.artist || v;
            break;
        case "TALB":
            report.tags.common.album = report.tags.common.album || v;
            break;
        case "TDRC":
        case "TYER":
            report.tags.common.date = report.tags.common.date || v;
            break;
        case "TRCK":
            report.tags.common.track = report.tags.common.track || v;
            break;
        case "TCON":
            report.tags.common.genre = report.tags.common.genre || v;
            break;
        case "COMM":
            report.tags.common.comment = report.tags.common.comment || v;
            break;
        case "TCOM":
            report.tags.common.composer = report.tags.common.composer || v;
            break;
        case "TCOP":
            report.tags.common.copyright = report.tags.common.copyright || v;
            break;
        case "TLAN":
            report.tags.common.language = report.tags.common.language || v;
            break;
    }
}

/* ------------------------------- Helpers: APE ------------------------------- */

/** Best-effort APEv2 tag parser scanning the last 32 KB. @param {Uint8Array} b @returns {object|null} */
function parseApeV2BestEffort(b) {
    // Look for "APETAGEX" footer within last 32KB
    const scanStart = Math.max(0, b.length - 32768);
    const idx = indexOfAscii(b, "APETAGEX", scanStart, b.length);
    if (idx < 0) return null;

    // Footer is 32 bytes: "APETAGEX"(8), ver(4 LE), size(4 LE), count(4 LE), flags(4 LE), reserved(8)
    if (idx + 32 > b.length) return { present: true, warning: "APETAGEX found but footer truncated." };

    const ver = u32le(b, idx + 8);
    const size = u32le(b, idx + 12);
    const count = u32le(b, idx + 16);
    const flags = u32le(b, idx + 20);

    // Tag data begins at (idx + 32 - size) for footer-at-end tags
    const tagStart = idx + 32 - size;
    if (tagStart < 0 || tagStart >= b.length) {
        return { present: true, version: ver, size, count, flags, warning: "APEv2 bounds invalid (non-standard placement)." };
    }

    // Parse items: [valueSize LE4][itemFlags LE4][key null-terminated][value bytes]
    const items = [];
    let off = tagStart + 32; // best-effort skip header
    const end = Math.min(b.length, idx); // stop before footer
    while (off + 8 < end && items.length < 5000) {
        const valueSize = u32le(b, off);
        const itemFlags = u32le(b, off + 4);
        off += 8;

        // key until 0x00
        let keyEnd = off;
        while (keyEnd < end && b[keyEnd] !== 0x00) keyEnd++;
        const key = decodeLatin1Trim(b.slice(off, keyEnd));
        off = keyEnd + 1;

        if (!key || off + valueSize > end) break;
        const valueBytes = b.slice(off, off + valueSize);
        off += valueSize;

        // most APE values are UTF-8 text
        const value = safeUtf8(valueBytes).replace(/\u0000/g, "").trim();
        items.push({ key, value, flags: itemFlags });
    }

    return { present: true, version: ver, size, count, flags, items };
}

/* ----------------------------- Helpers: RIFF/WAV ---------------------------- */

/** Enumerates top-level RIFF chunks after the WAVE header. @param {Uint8Array} b @returns {Array} */
function riffChunks(b) {
    // "RIFF" [size LE] "WAVE" then chunks
    const start = 12;
    const chunks = [];
    let off = start;
    while (off + 8 <= b.length && chunks.length < 50000) {
        const id = ascii4(b, off);
        const size = u32le(b, off + 4);
        const dataOff = off + 8;
        if (dataOff + size > b.length) break;
        chunks.push({ id, size, dataOff });
        off = dataOff + size + (size % 2); // pad to even
    }
    return chunks;
}

/** Enumerates subchunks within a RIFF LIST chunk. @param {Uint8Array} b @param {number} start @param {number} end @returns {Array} */
function riffListSubchunks(b, start, end) {
    const out = [];
    let off = start;
    while (off + 8 <= end && out.length < 10000) {
        const id = ascii4(b, off);
        const size = u32le(b, off + 4);
        const dataOff = off + 8;
        if (dataOff + size > end) break;
        out.push({ id, size, dataOff });
        off = dataOff + size + (size % 2);
    }
    return out;
}

/** Parses a BWF bext chunk. @param {Uint8Array} b @param {number} off @param {number} size @returns {object} */
function parseBext(b, off, size) {
    // BEXT is fixed-structure; we'll pull a few common fields (best-effort)
    const slice = b.slice(off, off + size);
    const description = decodeLatin1Trim(slice.slice(0, 256));
    const originator = decodeLatin1Trim(slice.slice(256, 288));
    const originatorRef = decodeLatin1Trim(slice.slice(288, 320));
    const originationDate = decodeLatin1Trim(slice.slice(320, 330));
    const originationTime = decodeLatin1Trim(slice.slice(330, 338));
    // timeReference (64-bit little endian) at 338
    const timeRefLow = u32le(slice, 338);
    const timeRefHigh = u32le(slice, 342);
    const timeReferenceSamples = (BigInt(timeRefHigh) << 32n) | BigInt(timeRefLow);

    return {
        description: description || null,
        originator: originator || null,
        originator_reference: originatorRef || null,
        origination_date: originationDate || null,
        origination_time: originationTime || null,
        time_reference_samples: timeReferenceSamples.toString(),
    };
}

/* ------------------------------- Helpers: FLAC ------------------------------ */

/** Parses FLAC metadata blocks following the "fLaC" marker. @param {Uint8Array} b @returns {Array} */
function parseFlacMetaBlocks(b) {
    // "fLaC" then metadata blocks
    const blocks = [];
    let off = 4;
    while (off + 4 <= b.length && blocks.length < 10000) {
        const header = b[off];
        const isLast = (header & 0x80) !== 0;
        const type = header & 0x7f;
        const len = (b[off + 1] << 16) | (b[off + 2] << 8) | b[off + 3];
        off += 4;
        if (off + len > b.length) break;
        const data = b.slice(off, off + len);
        off += len;
        blocks.push({ type, typeName: flacTypeName(type), length: len, data });
        if (isLast) break;
    }
    return blocks;
}

/** Maps a FLAC block type number to its name. @param {number} t @returns {string} */
function flacTypeName(t) {
    const map = {
        0: "STREAMINFO",
        1: "PADDING",
        2: "APPLICATION",
        3: "SEEKTABLE",
        4: "VORBIS_COMMENT",
        5: "CUESHEET",
        6: "PICTURE",
    };
    return map[t] || `TYPE_${t}`;
}

/** Parses a Vorbis Comment block (used by FLAC and OGG). @param {Uint8Array} buf @returns {object} */
function parseVorbisComment(buf) {
    // vendor_len LE4 + vendor + comment_count LE4 + [len LE4 + "KEY=VALUE"]...
    const b = buf;
    let off = 0;

    const vendorLen = u32le(b, off);
    off += 4;
    if (off + vendorLen > b.length) return { vendor: null, comments: [], warning: "vendor_len out of bounds" };
    const vendor = safeUtf8(b.slice(off, off + vendorLen));
    off += vendorLen;

    const count = u32le(b, off);
    off += 4;

    const comments = [];
    for (let i = 0; i < count && off + 4 <= b.length && comments.length < 20000; i++) {
        const l = u32le(b, off);
        off += 4;
        if (off + l > b.length) break;
        const s = safeUtf8(b.slice(off, off + l));
        off += l;
        const eq = s.indexOf("=");
        if (eq > 0) comments.push({ key: s.slice(0, eq).toUpperCase(), value: s.slice(eq + 1) });
    }
    return { vendor, comments };
}

/** Maps Vorbis Comment fields to the common tags layer. @param {object} report @param {object} vc */
function mapVorbisCommon(report, vc) {
    const get = (k) => vc.comments?.find((x) => x.key === k)?.value || null;
    report.tags.common.title = report.tags.common.title || get("TITLE");
    report.tags.common.artist = report.tags.common.artist || get("ARTIST");
    report.tags.common.album = report.tags.common.album || get("ALBUM");
    report.tags.common.date = report.tags.common.date || get("DATE");
    report.tags.common.track = report.tags.common.track || get("TRACKNUMBER");
    report.tags.common.genre = report.tags.common.genre || get("GENRE");
    report.tags.common.comment = report.tags.common.comment || get("COMMENT");
    report.tags.common.composer = report.tags.common.composer || get("COMPOSER");
    report.tags.common.language = report.tags.common.language || get("LANGUAGE");
}

/** Parses a FLAC PICTURE metadata block. @param {Uint8Array} data @param {number} maxTextBytes @returns {object} */
function parseFlacPicture(data, maxTextBytes) {
    // [type BE4][mimeLen BE4][mime][descLen BE4][desc][w BE4][h BE4][depth BE4][colors BE4][dataLen BE4][data]
    let off = 0;
    const type = u32be(data, off);
    off += 4;

    const mimeLen = u32be(data, off);
    off += 4;
    const mime = safeUtf8(data.slice(off, off + Math.min(mimeLen, maxTextBytes)));
    off += mimeLen;

    const descLen = u32be(data, off);
    off += 4;
    const description = safeUtf8(data.slice(off, off + Math.min(descLen, maxTextBytes)));
    off += descLen;

    const width = u32be(data, off);
    off += 4;
    const height = u32be(data, off);
    off += 4;
    const depth = u32be(data, off);
    off += 4;
    const colors = u32be(data, off);
    off += 4;

    const dataLen = u32be(data, off);
    off += 4;
    const dataBytes = data.slice(off, off + dataLen);

    return { type, mime, description, width, height, depth, colors, dataLength: dataLen, dataBytes };
}

/* ----------------------------- Encoding & bytes ---------------------------- */

/** Decodes an ID3v2 synchsafe integer. @param {number} b0 @param {number} b1 @param {number} b2 @param {number} b3 @returns {number} */
function synchsafeToInt(b0, b1, b2, b3) {
    return ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f);
}

/** Reads an unsigned 32-bit big-endian integer. @param {Uint8Array} bytes @param {number} off @returns {number} */
function u32be(bytes, off) {
    return ((bytes[off] << 24) >>> 0) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];
}

/** Reads an unsigned 32-bit little-endian integer. @param {Uint8Array} bytes @param {number} off @returns {number} */
function u32le(bytes, off) {
    return (bytes[off] | (bytes[off + 1] << 8) | (bytes[off + 2] << 16) | (bytes[off + 3] << 24)) >>> 0;
}

/** Reads an unsigned 16-bit little-endian integer. @param {Uint8Array} bytes @param {number} off @returns {number} */
function u16le(bytes, off) {
    return bytes[off] | (bytes[off + 1] << 8);
}

/** Reads an unsigned 64-bit little-endian integer as BigInt. @param {Uint8Array} bytes @param {number} off @returns {BigInt} */
function u64le(bytes, off) {
    return BigInt(u32le(bytes, off)) | (BigInt(u32le(bytes, off + 4)) << 32n);
}

/** Decodes a UTF-16LE byte range, stripping null terminators. @param {Uint8Array} b @param {number} off @param {number} len @returns {string} */
function decodeUtf16LE(b, off, len) {
    if (len <= 0 || off + len > b.length) return "";
    try {
        return new TextDecoder("utf-16le").decode(b.slice(off, off + len)).replace(/\u0000/g, "").trim();
    } catch {
        return "";
    }
}

/** Reads bytes until a null terminator (encoding-aware). @param {Uint8Array} bytes @param {number} start @param {number} encoding @returns {{valueBytes: Uint8Array, next: number}} */
function readNullTerminated(bytes, start, encoding) {
    const isUtf16 = encoding === 1 || encoding === 2;
    if (!isUtf16) {
        let i = start;
        while (i < bytes.length && bytes[i] !== 0x00) i++;
        return { valueBytes: bytes.slice(start, i), next: i + 1 };
    } else {
        let i = start;
        while (i + 1 < bytes.length && !(bytes[i] === 0x00 && bytes[i + 1] === 0x00)) i += 2;
        return { valueBytes: bytes.slice(start, i), next: i + 2 };
    }
}

/** Decodes bytes to string using the ID3v2 encoding byte. @param {Uint8Array} bytes @param {number} encoding @returns {string} */
function decodeText(bytes, encoding) {
    if (!bytes || bytes.length === 0) return "";
    try {
        if (encoding === 0) return new TextDecoder("iso-8859-1").decode(bytes);
        if (encoding === 3) return new TextDecoder("utf-8").decode(bytes);
        if (encoding === 2) return new TextDecoder("utf-16be").decode(bytes);
        return new TextDecoder("utf-16").decode(bytes); // encoding 1
    } catch {
        return safeUtf8(bytes);
    }
}

/** Decodes bytes as UTF-8 with replacement for invalid sequences. @param {Uint8Array} bytes @returns {string} */
function safeUtf8(bytes) {
    try {
        return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch {
        return "";
    }
}

/** Decodes bytes as ISO-8859-1, strips nulls and trims. @param {Uint8Array} bytes @returns {string} */
function decodeLatin1Trim(bytes) {
    try {
        return new TextDecoder("iso-8859-1").decode(bytes).replace(/\u0000/g, "").trim();
    } catch {
        return safeUtf8(bytes).replace(/\u0000/g, "").trim();
    }
}
