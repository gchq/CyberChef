/**
 * Format-specific audio metadata parsers.
 *
 * @author d0s1nt [d0s1nt@cyberchefaudio]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

/* eslint-disable camelcase */

import {
    ascii4, indexOfAscii,
    u32be, u32le, u16le, u64le, synchsafeToInt,
    decodeUtf16LE, readNullTerminated, decodeText,
    safeUtf8, decodeLatin1Trim,
} from "./AudioBytes.mjs";

/** Parses MP3 metadata: ID3v2 frames, ID3v1 footer, APEv2 tags. */
export function parseMp3(b, report, maxTextBytes = 1024 * 512) {
    processId3v2(b, report, maxTextBytes);
    processId3v1(b, report);

    const ape = parseApeV2BestEffort(b);
    if (ape) {
        report.detections.metadata_systems.push("apev2");
        report.tags.raw.apev2 = ape;
    }
}

/** Iterates ID3v2 frames and populates the report. */
function processId3v2(b, report, maxTextBytes) {
    report.detections.metadata_systems.push("id3v2");

    const id3 = parseId3v2(b);
    report.tags.raw.id3v2 = id3 ? { header: id3.header, frames: [] } : null;

    if (id3) {
        for (const f of id3.frames) {
            const entry = { id: f.id, size: f.size, description: ID3_FRAME_DESCRIPTIONS[f.id] || null };

            if (f.id[0] === "T" && f.id !== "TXXX" && f.id !== "TXX") {
                const text = f.data?.length >= 1 ?
                    decodeText(f.data.slice(1), f.data[0]).replace(/\u0000/g, "").trim() :
                    "";
                const encoded = decodeEncodedTextValue(text);
                entry.decoded = encoded ? { value: text, value_decoded: encoded } : text;
                if (f.id === "TLEN") {
                    const ms = normalizeTlen(text);
                    if (ms !== null) entry.normalized_ms = ms;
                }
                mapCommonId3(report, f.id, text);
                recordElevenLabsMetadata(report, `id3v2:${f.id}`, { frame_id: f.id, value: text });
            } else if (f.id === "TXXX" || f.id === "TXX") {
                const txxx = decodeTxxx(f.data);
                entry.decoded = txxx;
                pushRaw(report.tags.raw.id3v2, "txxx", txxx);
                recordElevenLabsMetadata(report, `id3v2:${f.id}`, txxx);
            } else if (f.id === "COMM" || f.id === "COM") {
                const comm = decodeCommFrame(f.data);
                entry.decoded = comm;
                if (comm?.text && !report.tags.common.comment) report.tags.common.comment = comm.text;
                recordElevenLabsMetadata(report, `id3v2:${f.id}`, comm);
            } else if (f.id === "GEOB" || f.id === "GEO") {
                processGeobFrame(f, entry, report);
            } else if (f.id === "APIC" || f.id === "PIC") {
                const apic = f.id === "PIC" ? decodePicFrame(f.data) : decodeApicFrame(f.data);
                entry.decoded = apic;
                pushRaw(report.tags.raw.id3v2, "apic", apic);
                if (apic?.image_length)
                    addEmbedded(report, `id3v2:${f.id}`, apic.mime_type, apic.image_length, apic.description, null);
            } else if (f.id === "USLT" || f.id === "ULT") {
                const uslt = decodeUsltFrame(f.data, maxTextBytes);
                entry.decoded = uslt;
                pushRaw(report.tags.raw.id3v2, "uslt", uslt);
                recordElevenLabsMetadata(report, `id3v2:${f.id}`, uslt);
            } else if (f.id === "PRIV") {
                const priv = decodeOwnerPayload(f.data, "data", "data_length");
                entry.decoded = priv;
                pushRaw(report.tags.raw.id3v2, "priv", priv);
                recordElevenLabsMetadata(report, "id3v2:PRIV", priv);
            } else if (f.id === "UFID" || f.id === "UFI") {
                const ufid = decodeOwnerPayload(f.data, "identifier", "identifier_length");
                entry.decoded = ufid;
                pushRaw(report.tags.raw.id3v2, "ufid", ufid);
                recordElevenLabsMetadata(report, `id3v2:${f.id}`, ufid);
            } else if (f.id === "WXXX" || f.id === "WXX") {
                const wxxx = decodeWxxxFrame(f.data);
                entry.decoded = wxxx;
                pushRaw(report.tags.raw.id3v2, "wxxx", wxxx);
                recordElevenLabsMetadata(report, `id3v2:${f.id}`, wxxx);
            } else if (f.id[0] === "W") {
                const url = decodeUrlFrame(f.id, f.data);
                entry.decoded = url;
                pushRaw(report.tags.raw.id3v2, "urls", url);
                recordElevenLabsMetadata(report, `id3v2:${f.id}`, url);
            } else if (f.id === "POPM" || f.id === "POP") {
                const popm = decodePopmFrame(f.data);
                entry.decoded = popm;
                pushRaw(report.tags.raw.id3v2, "popm", popm);
            } else {
                entry.decoded = {
                    data_length: f.data.length,
                    ...decodeBinaryPayload(f.data, "data"),
                };
                recordElevenLabsMetadata(report, `id3v2:${f.id}`, entry.decoded);
            }

            report.tags.raw.id3v2.frames.push(entry);
        }
    } else {
        report.detections.metadata_systems = report.detections.metadata_systems.filter((x) => x !== "id3v2");
    }
}

/** Appends a raw metadata entry to a lazily-created array. */
function pushRaw(target, key, value) {
    if (!target[key]) target[key] = [];
    target[key].push(value);
}

/** Adds a value once to an array. */
function pushUnique(target, value) {
    if (!target.includes(value)) target.push(value);
}

/** Parses GEOB frame contents, populates entry, embedded objects, and C2PA provenance. */
function processGeobFrame(f, entry, report) {
    const source = `id3v2:${f.id}`;
    const d = f.data, enc = d[0];
    let off = 1;
    const mime = readNullTerminated(d, off, 0);
    const mimeType = decodeLatin1Trim(mime.valueBytes);
    off = mime.next;
    const file = readNullTerminated(d, off, enc);
    const filename = decodeText(file.valueBytes, enc).replace(/\u0000/g, "").trim();
    off = file.next;
    const desc = readNullTerminated(d, off, enc);
    const description = decodeText(desc.valueBytes, enc).replace(/\u0000/g, "").trim();
    off = desc.next;
    const objectBytes = d.slice(Math.min(off, d.length));
    const objLen = objectBytes.length;
    const embeddedObjectMetadata = decodeEmbeddedObjectMetadata(objectBytes, mimeType);
    const jumbf = embeddedObjectMetadata.object_jumbf;
    const binaryObjectSummary = jumbf ? {} : decodeBinaryPayload(objectBytes, "object");

    entry.geob = {
        mimeType,
        filename,
        description,
        object_bytes: objLen,
        ...(jumbf ? {} : embeddedObjectMetadata),
        ...binaryObjectSummary,
    };

    const mt = (mimeType || "").toLowerCase();
    const isC2paObject = mt.includes("c2pa") || mt.includes("jumbf") || mt.includes("application/x-c2pa-manifest-store");
    if (isC2paObject) {
        report.provenance.c2pa.present = true;
        pushUnique(report.detections.provenance_systems, "c2pa");
        report.provenance.c2pa.carrier = {
            source,
            content_type: mimeType,
            filename,
            description,
            byte_length: objLen,
        };
        applyC2paJumbfMetadata(report, jumbf);
    } else {
        recordElevenLabsMetadata(report, source, entry.geob);
    }
}

/** Adds an embedded binary object summary without storing the payload bytes. */
function addEmbedded(report, source, contentType, byteLength, description, filename) {
    const base = source.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "embedded";
    const id = `${base}_${report.embedded.filter((x) => x.id.startsWith(`${base}_`)).length}`;
    report.embedded.push({
        id,
        source,
        content_type: contentType || null,
        byte_length: byteLength || 0,
        description: description || null,
        filename: filename || null,
    });
}

/** Processes the 128-byte ID3v1 footer tag. */
function processId3v1(b, report) {
    const id3v1 = parseId3v1(b);
    if (!id3v1) return;

    report.detections.metadata_systems.push("id3v1");
    report.tags.raw.id3v1 = id3v1;
    mapCommon(report, id3v1, ID3V1_TO_COMMON);
}

/** Parses WAV/BWF/BW64 RIFF chunks: LIST/INFO, bext, iXML, axml, ds64. */
export function parseRiffWave(b, report, maxTextBytes) {
    report.detections.metadata_systems.push("riff_info");

    const chunks = enumerateChunks(b, 12, b.length, 50000);
    const riff = { chunks: [], info: null, bext: null, ixml: null, axml: null, ds64: null };

    const info = {};
    for (const c of chunks) {
        const chunkEntry = { id: c.id, size: c.size, offset: c.dataOff };
        riff.chunks.push(chunkEntry);
        processRiffChunk(b, c, chunkEntry, riff, info, report, maxTextBytes);
    }

    riff.info = Object.keys(info).length ? info : null;
    report.tags.raw.riff = riff;
    if (riff.info) mapCommon(report, riff.info, RIFF_TO_COMMON);
}

/** Processes a single RIFF chunk, updating riff state and the report. */
function processRiffChunk(b, c, chunkEntry, riff, info, report, maxTextBytes) {
    if (c.id === "ds64") {
        riff.ds64 = { present: true, size: c.size };
        pushUnique(report.detections.metadata_systems, "bw64_ds64");
        if (report.artifact.container.type === "wav") report.artifact.container.type = "bw64";
    }

    if (c.id === "LIST" && ascii4(b, c.dataOff) === "INFO") {
        chunkEntry.list_type = "INFO";
        chunkEntry.subchunks = [];
        for (const s of enumerateChunks(b, c.dataOff + 4, c.dataOff + c.size, 10000)) {
            const value = decodeLatin1Trim(b.slice(s.dataOff, s.dataOff + s.size));
            info[s.id] = value;
            chunkEntry.subchunks.push({
                id: s.id,
                size: s.size,
                offset: s.dataOff,
                value,
            });
        }
    }

    if (c.id === "bext") {
        pushUnique(report.detections.metadata_systems, "bwf_bext");
        riff.bext = parseBext(b, c.dataOff, c.size);
    }

    if (c.id === "iXML" || c.id === "axml") {
        const key = c.id === "iXML" ? "ixml" : "axml";
        pushUnique(report.detections.metadata_systems, key);
        const payload = b.slice(c.dataOff, c.dataOff + c.size);
        riff[key] = { xml: safeUtf8(payload.slice(0, Math.min(payload.length, maxTextBytes))), truncated: payload.length > maxTextBytes };
        report.embedded.push({
            id: `${key}_0`, source: `riff:${c.id}`, content_type: "application/xml",
            byte_length: payload.length, description: `${c.id} chunk`, filename: null,
        });
    }
}

/** Parses FLAC metablocks: STREAMINFO, Vorbis Comment, PICTURE. */
export function parseFlac(b, report, maxTextBytes) {
    report.detections.metadata_systems.push("flac_metablocks");

    const blocks = parseFlacMetaBlocks(b);
    report.tags.raw.flac = { blocks: [] };

    for (const blk of blocks) {
        const blockEntry = {
            type: blk.typeName,
            raw_type: blk.type,
            length: blk.length,
            offset: blk.offset,
            is_last: blk.isLast,
        };
        report.tags.raw.flac.blocks.push(blockEntry);

        if (blk.typeName === "VORBIS_COMMENT") {
            pushUnique(report.detections.metadata_systems, "vorbis_comments");
            const vc = parseVorbisComment(blk.data);
            blockEntry.parsed = vc;
            report.tags.raw.vorbis_comments = vc;
            mapVorbisCommon(report, vc);
            recordElevenLabsMetadata(report, "flac:VORBIS_COMMENT", vc);
        } else if (blk.typeName === "PICTURE") {
            const pic = parseFlacPicture(blk.data, maxTextBytes);
            blockEntry.parsed = pic;
            report.embedded.push({
                id: `cover_art_${report.embedded.filter((x) => x.id.startsWith("cover_art_")).length}`,
                source: "flac:PICTURE", content_type: pic.mime || null,
                byte_length: pic.dataLength, description: pic.description || null, filename: null,
            });
        } else if (blk.typeName === "STREAMINFO") {
            blockEntry.parsed = parseFlacStreamInfo(blk.data);
        } else if (blk.typeName === "APPLICATION") {
            blockEntry.parsed = {
                application_id: safeUtf8(blk.data.slice(0, Math.min(4, blk.data.length))) || null,
            };
        } else if (blk.typeName === "SEEKTABLE") {
            blockEntry.parsed = { seekpoint_count: Math.floor(blk.data.length / 18) };
        } else if (blk.typeName === "CUESHEET") {
            blockEntry.parsed = {
                media_catalog_number: decodeLatin1Trim(blk.data.slice(0, Math.min(128, blk.data.length))) || null,
            };
        }
    }
}

/** Parses OGG/Opus Vorbis comments. */
export function parseOgg(b, report) {
    pushUnique(report.detections.metadata_systems, "ogg_opus_tags");

    const scanEnd = Math.min(b.length, 1024 * 1024);
    let tags = null;
    const opusTagsIdx = indexOfAscii(b, "OpusTags", 0, scanEnd);
    if (opusTagsIdx >= 0) {
        report.artifact.container.type = "opus";
        tags = parseVorbisComment(b.slice(opusTagsIdx + 8, scanEnd));
    } else {
        const vorbisIdx = indexOfAscii(b, "\x03vorbis", 0, scanEnd);
        if (vorbisIdx >= 0) tags = parseVorbisComment(b.slice(vorbisIdx + 7, scanEnd));
    }

    report.tags.raw.ogg = {
        has_opustags: opusTagsIdx >= 0,
        has_vorbis_comment: !!tags,
    };

    if (tags) {
        pushUnique(report.detections.metadata_systems, "vorbis_comments");
        report.tags.raw.vorbis_comments = tags;
        mapVorbisCommon(report, tags);
        recordElevenLabsMetadata(report, "ogg:VORBIS_COMMENT", tags);
    }
}

/** Best-effort top-level atom scan for MP4/M4A. */
export function parseMp4BestEffort(b, report) {
    report.detections.metadata_systems.push("mp4_atoms");
    const atomState = { count: 0, flat: [] };
    const atoms = parseMp4Atoms(b, 0, b.length, [], 0, atomState);
    const ilstItems = parseMp4IlstItems(b, atoms);

    if (ilstItems.length) pushUnique(report.detections.metadata_systems, "mp4_ilst");

    report.tags.raw.mp4 = {
        top_level_atoms: atomState.flat.filter((a) => a.depth === 0).slice(0, 200),
        atom_index: atomState.flat.slice(0, 2000),
        ilst_items: ilstItems,
        hints: {
            hasMoov: atomState.flat.some((a) => a.type === "moov"),
            hasUdta: atomState.flat.some((a) => a.type === "udta"),
            hasMeta: atomState.flat.some((a) => a.type === "meta"),
            hasIlst: atomState.flat.some((a) => a.type === "ilst"),
        },
    };

    for (const item of ilstItems) {
        const field = MP4_TO_COMMON[item.key];
        if (field && item.value) report.tags.common[field] = report.tags.common[field] || item.value;
        recordElevenLabsMetadata(report, `mp4:ilst:${item.key}`, item);
        if (item.atom_type === "covr" || item.key === "covr") {
            for (const value of item.values || []) {
                const contentType = mp4DataContentType(value.data_type);
                if (contentType)
                    addEmbedded(report, `mp4:ilst:${item.key}`, contentType, value.data_length, "Cover art", null);
            }
        }
    }
}

/** Best-effort AIFF/AIFC chunk scanning for NAME, AUTH, ANNO. */
export function parseAiffBestEffort(b, report, maxTextBytes) {
    report.detections.metadata_systems.push("aiff_chunks");
    let off = 12;
    const chunks = [];
    while (off + 8 <= b.length && chunks.length < 2000) {
        const id = ascii4(b, off);
        const size = u32be(b, off + 4);
        const dataOff = off + 8;
        const chunkEntry = {
            id,
            size,
            offset: off,
        };
        chunks.push(chunkEntry);

        if (["NAME", "AUTH", "ANNO", "(c) "].includes(id)) {
            const txt = safeUtf8(b.slice(dataOff, dataOff + Math.min(size, maxTextBytes)));
            if (!report.tags.raw.aiff) report.tags.raw.aiff = { chunks: [] };
            chunkEntry.value = txt;
            chunkEntry.truncated = size > maxTextBytes;
            report.tags.raw.aiff.chunks.push({ id, value: txt, truncated: size > maxTextBytes });
        }

        off = dataOff + size + (size % 2);
    }

    if (!report.tags.raw.aiff) report.tags.raw.aiff = {};
    report.tags.raw.aiff.chunk_index = chunks.slice(0, 500);

    const nameChunk = report.tags.raw.aiff?.chunks?.find((ch) => ch.id === "NAME")?.value;
    if (nameChunk) report.tags.common.title = report.tags.common.title || nameChunk;
}

const AAC_SAMPLE_RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
const AAC_PROFILES = ["Main", "LC", "SSR", "LTP"];
const AAC_CHANNELS = ["defined in AOT", "mono", "stereo", "3.0", "4.0", "5.0", "5.1", "7.1"];

/** Parses AAC ADTS frame header for audio parameters. */
export function parseAacAdts(b, report) {
    report.detections.metadata_systems.push("adts_header");
    if (b.length < 7) return;

    const id = (b[1] >> 3) & 0x01;
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

const AC3_SAMPLE_RATES = [48000, 44100, 32000];
const AC3_BITRATES = [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 448, 512, 576, 640];
const AC3_ACMODES = [
    "2.0 (Ch1+Ch2)", "1.0 (C)", "2.0 (L R)", "3.0 (L C R)",
    "2.1 (L R S)", "3.1 (L C R S)", "2.2 (L R SL SR)", "3.2 (L C R SL SR)",
];

/** Parses AC3 (Dolby Digital) bitstream info. */
export function parseAc3(b, report) {
    report.detections.metadata_systems.push("ac3_bsi");
    if (b.length < 8) return;

    const fscod = (b[4] >> 6) & 0x03;
    const frmsizecod = b[4] & 0x3f;
    const bsid = (b[5] >> 3) & 0x1f;
    const bsmod = b[5] & 0x07;
    const acmod = (b[6] >> 5) & 0x07;

    report.tags.raw.ac3 = {
        sample_rate: AC3_SAMPLE_RATES[fscod] || null,
        fscod,
        bitrate_kbps: AC3_BITRATES[frmsizecod >> 1] || null,
        frmsizecod, bsid, bsmod, acmod,
        channel_layout: AC3_ACMODES[acmod] || null,
    };
}

/** Parses WMA files (ASF container) for content description metadata. */
export function parseWmaAsf(b, report) {
    report.detections.metadata_systems.push("asf_header");
    if (b.length < 30) return;

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
        const objectEntry = {
            guid_prefix: guid4.map(x => x.toString(16).padStart(2, "0")).join(""),
            known_type: ASF_GUID_PREFIX_NAMES[guid4.map(x => x.toString(16).padStart(2, "0")).join("")] || null,
            size: objSize,
            offset: off,
            data_length: dataLen,
        };

        if (guid4[0] === 0x33 && guid4[1] === 0x26 && guid4[2] === 0xb2 && guid4[3] === 0x75 && dataLen >= 10) {
            const cd = parseAsfContentDescription(b, dataOff);
            pushUnique(report.detections.metadata_systems, "asf_content_desc");
            if (!report.tags.raw.asf) report.tags.raw.asf = {};
            report.tags.raw.asf.content_description = cd;
            mapCommon(report, cd, ASF_CD_TO_COMMON);
        }

        if (guid4[0] === 0x40 && guid4[1] === 0xa4 && guid4[2] === 0xd0 && guid4[3] === 0xd2 && dataLen >= 2) {
            const ext = parseAsfExtContentDescription(b, dataOff, dataOff + dataLen);
            pushUnique(report.detections.metadata_systems, "asf_ext_content_desc");
            if (!report.tags.raw.asf) report.tags.raw.asf = {};
            report.tags.raw.asf.extended_content = ext;

            const c = report.tags.common;
            for (const d of ext) {
                const field = WMA_TO_COMMON[(d.name || "").toUpperCase()];
                if (field && d.value) c[field] = c[field] || d.value;
            }
        }

        objects.push(objectEntry);
        off += objSize;
    }

    if (!report.tags.raw.asf) report.tags.raw.asf = {};
    report.tags.raw.asf.header_objects = objects;
}

const ID3_FRAME_DESCRIPTIONS = {
    TIT2: "Title/songname/content description", TPE1: "Lead performer(s)/Soloist(s)",
    TRCK: "Track number/Position in set", TALB: "Album/Movie/Show title",
    TDRC: "Recording time", TYER: "Year", TCON: "Content type",
    TPE2: "Band/orchestra/accompaniment", TLEN: "Length (ms)", TCOM: "Composer",
    COMM: "Comments", APIC: "Attached picture", GEOB: "General encapsulated object",
    TXXX: "User defined text information frame", UFID: "Unique file identifier", PRIV: "Private frame",
    USLT: "Unsynchronised lyrics/text transcription", POPM: "Popularimeter",
    TT2: "Title/songname/content description", TP1: "Lead performer(s)/Soloist(s)",
    TRK: "Track number/Position in set", TAL: "Album/Movie/Show title",
    TYE: "Year", TCO: "Content type", TP2: "Band/orchestra/accompaniment",
    TCM: "Composer", COM: "Comments", PIC: "Attached picture", GEO: "General encapsulated object",
    TXX: "User defined text information frame", UFI: "Unique file identifier",
    ULT: "Unsynchronised lyrics/text transcription", POP: "Popularimeter",
};

const ID3_URL_FRAME_DESCRIPTIONS = {
    WCOM: "Commercial information", WCOP: "Copyright/legal information",
    WOAF: "Official audio file webpage", WOAR: "Official artist/performer webpage",
    WOAS: "Official audio source webpage", WORS: "Official internet radio station homepage",
    WPAY: "Payment", WPUB: "Publishers official webpage",
    WAF: "Official audio file webpage", WAR: "Official artist/performer webpage",
    WAS: "Official audio source webpage", WPB: "Publishers official webpage",
};
const ID3_ENCODING_NAMES = ["ISO-8859-1", "UTF-16", "UTF-16BE", "UTF-8"];
const ID3_PICTURE_TYPES = [
    "Other", "32x32 pixels file icon", "Other file icon", "Cover (front)", "Cover (back)",
    "Leaflet page", "Media", "Lead artist/performer/soloist", "Artist/performer",
    "Conductor", "Band/Orchestra", "Composer", "Lyricist/text writer", "Recording location",
    "During recording", "During performance", "Movie/video screen capture",
    "A bright coloured fish", "Illustration", "Band/artist logotype", "Publisher/studio logotype",
];

const ID3_TO_COMMON = {
    TIT2: "title", TPE1: "artist", TALB: "album", TDRC: "date", TYER: "date",
    TRCK: "track", TCON: "genre", COMM: "comment", TCOM: "composer", TCOP: "copyright", TLAN: "language",
    TT2: "title", TP1: "artist", TAL: "album", TYE: "date",
    TRK: "track", TCO: "genre", COM: "comment", TCM: "composer", TCR: "copyright", TLA: "language",
};
const VORBIS_TO_COMMON = {
    TITLE: "title", ARTIST: "artist", ALBUM: "album", DATE: "date",
    TRACKNUMBER: "track", GENRE: "genre", COMMENT: "comment", COMPOSER: "composer", LANGUAGE: "language",
};
const WMA_TO_COMMON = {
    "WM/ALBUMTITLE": "album", "WM/GENRE": "genre", "WM/YEAR": "date",
    "WM/TRACKNUMBER": "track", "WM/COMPOSER": "composer", "WM/LANGUAGE": "language",
};
const ID3V1_TO_COMMON = { title: "title", artist: "artist", album: "album", year: "date", comment: "comment", genre: "genre", track: "track" };
const RIFF_TO_COMMON = { INAM: "title", IART: "artist", ICMT: "comment", IGNR: "genre", ICRD: "date", ICOP: "copyright" };
const ASF_CD_TO_COMMON = { title: "title", author: "artist", copyright: "copyright", description: "comment" };
const MP4_TO_COMMON = {
    "\xa9nam": "title", "\xa9ART": "artist", "\xa9alb": "album", "\xa9day": "date",
    trkn: "track", "\xa9gen": "genre", gnre: "genre", "\xa9cmt": "comment",
    "\xa9wrt": "composer", "\xa9cpy": "copyright",
};
const ASF_GUID_PREFIX_NAMES = {
    "3326b275": "Content Description Object",
    "40a4d0d2": "Extended Content Description Object",
    "8cabdca1": "File Properties Object",
    "b7dc0791": "Stream Properties Object",
    "d6e229dc": "Header Extension Object",
};
const MP4_CONTAINER_ATOMS = new Set([
    "moov", "trak", "mdia", "minf", "stbl", "edts", "udta", "ilst", "----",
]);
const JUMBF_BOX_TYPE_NAMES = {
    jumb: "JUMBF superbox",
    jumd: "JUMBF description",
    json: "JSON payload",
    cbor: "CBOR payload",
    "xml ": "XML payload",
    xml_: "XML payload",
    c2sh: "C2PA salted hash",
};
const JUMBF_CONTENT_TYPE_NAMES = {
    c2pa: "C2PA manifest store",
    c2ma: "C2PA manifest",
    c2as: "C2PA assertion store",
    c2cl: "C2PA claim",
    c2cs: "C2PA signature",
    cbor: "CBOR assertion",
    json: "JSON assertion",
};
const COSE_HEADER_LABELS = {
    "1": "alg",
    "2": "crit",
    "3": "content_type",
    "4": "kid",
    "5": "iv",
    "6": "partial_iv",
    "32": "x5bag",
    "33": "x5chain",
    "34": "x5t",
    "35": "x5u",
};
const COSE_ALGORITHMS = {
    "-7": "ES256",
    "-35": "ES384",
    "-36": "ES512",
    "-37": "PS256",
    "-38": "PS384",
    "-39": "PS512",
    "-257": "RS256",
    "-258": "RS384",
    "-259": "RS512",
};

/** Maps source object fields to the common tags layer via a mapping table. */
function mapCommon(report, source, mapping) {
    const c = report.tags.common;
    for (const [sk, ck] of Object.entries(mapping))
        c[ck] = c[ck] || source[sk] || null;
}

/** Maps an ID3v2 frame value to the common tags layer. */
function mapCommonId3(report, frameId, text) {
    const field = ID3_TO_COMMON[frameId];
    if (field) report.tags.common[field] = report.tags.common[field] || text || null;
}

/** Decodes an ID3v2 COMM (Comments) frame. */
function decodeCommFrame(data) {
    if (!data || data.length < 5) return null;
    const enc = data[0];
    const language = String.fromCharCode(data[1], data[2], data[3]);
    const { valueBytes: descBytes, next } = readNullTerminated(data, 4, enc);
    const short_description = decodeText(descBytes, enc).replace(/\u0000/g, "").trim() || null;
    const text = decodeText(data.slice(next), enc).replace(/\u0000/g, "").trim() || null;
    const encoded = decodeEncodedTextValue(text);
    return {
        language,
        short_description,
        text,
        ...(encoded ? { text_decoded: encoded } : {}),
    };
}

/** Normalizes TLEN to integer milliseconds. */
function normalizeTlen(s) {
    if (!s) return null;
    if (/^\s*\d+\s*$/.test(s)) return parseInt(s.trim(), 10);
    const f = Number(s);
    if (Number.isFinite(f) && f > 0 && f < 100000) return Math.round(f * 1000);
    return null;
}

/** Parses the ID3v2 tag header and frames. */
function parseId3v2(mp3) {
    if (mp3.length < 10 || mp3[0] !== 0x49 || mp3[1] !== 0x44 || mp3[2] !== 0x33) return null;

    const major = mp3[3], minor = mp3[4], flags = mp3[5];
    const tagSize = synchsafeToInt(mp3[6], mp3[7], mp3[8], mp3[9]);
    let offset = 10;
    let end = Math.min(mp3.length, 10 + tagSize);
    const header = { version: `${major}.${minor}`, flags, tag_size: tagSize };
    if (major === 4 && (flags & 0x10)) {
        header.footer_present = true;
        end = Math.max(offset, end - 10);
    }

    const frames = [];
    if (major === 2) {
        while (offset + 6 <= end) {
            const id = String.fromCharCode(mp3[offset], mp3[offset + 1], mp3[offset + 2]);
            if (!/^[A-Z0-9]{3}$/.test(id)) break;
            const size = (mp3[offset + 3] << 16) | (mp3[offset + 4] << 8) | mp3[offset + 5];
            offset += 6;
            if (size <= 0 || offset + size > end) break;
            frames.push({ id, size, data: mp3.slice(offset, offset + size) });
            offset += size;
        }
        return { header, frames };
    }

    if ((major === 3 || major === 4) && (flags & 0x40)) {
        const extendedHeader = parseId3ExtendedHeader(mp3, offset, end, major);
        if (extendedHeader) {
            header.extended_header = extendedHeader.header;
            offset = extendedHeader.next;
        } else {
            header.extended_header = { warning: "Extended header is truncated or invalid" };
            return { header, frames };
        }
    }

    while (offset + 10 <= end) {
        const id = String.fromCharCode(mp3[offset], mp3[offset + 1], mp3[offset + 2], mp3[offset + 3]);
        if (!/^[A-Z0-9]{4}$/.test(id)) break;
        const size = major === 4 ?
            synchsafeToInt(mp3[offset + 4], mp3[offset + 5], mp3[offset + 6], mp3[offset + 7]) :
            u32be(mp3, offset + 4);
        offset += 10;
        if (size <= 0 || offset + size > end) break;
        frames.push({ id, size, data: mp3.slice(offset, offset + size) });
        offset += size;
    }

    return { header, frames };
}

/** Parses and skips ID3v2.3/v2.4 extended headers. */
function parseId3ExtendedHeader(mp3, offset, end, major) {
    if (offset + 4 > end) return null;

    if (major === 4) {
        const size = synchsafeToInt(mp3[offset], mp3[offset + 1], mp3[offset + 2], mp3[offset + 3]);
        if (size < 4 || offset + size > end) return null;
        return {
            header: { size, size_includes_header: true },
            next: offset + size,
        };
    }

    const size = u32be(mp3, offset);
    const next = offset + 4 + size;
    if (size < 6 || next > end) return null;
    return {
        header: {
            size,
            size_includes_header: false,
            flags: offset + 6 <= end ? u16be(mp3, offset + 4) : null,
            padding_size: offset + 10 <= end ? u32be(mp3, offset + 6) : null,
        },
        next,
    };
}

/** Parses the 128-byte ID3v1 tag at the end of the file. */
function parseId3v1(b) {
    if (b.length < 128) return null;
    const off = b.length - 128;
    if (b[off] !== 0x54 || b[off + 1] !== 0x41 || b[off + 2] !== 0x47) return null;

    let track = null;
    if (b[off + 125] === 0x00 && b[off + 126] !== 0x00) track = String(b[off + 126]);

    return {
        title: decodeLatin1Trim(b.slice(off + 3, off + 33)),
        artist: decodeLatin1Trim(b.slice(off + 33, off + 63)),
        album: decodeLatin1Trim(b.slice(off + 63, off + 93)),
        year: decodeLatin1Trim(b.slice(off + 93, off + 97)),
        comment: decodeLatin1Trim(b.slice(off + 97, off + 127)),
        track, genre: String(b[off + 127]),
    };
}

/** Decodes an ID3v2 TXXX (user-defined text) frame. */
function decodeTxxx(data) {
    if (!data || data.length < 2) return null;
    const enc = data[0];
    const { valueBytes: descBytes, next } = readNullTerminated(data, 1, enc);
    const desc = decodeText(descBytes, enc).replace(/\u0000/g, "").trim();
    const val = decodeText(data.slice(next), enc).replace(/\u0000/g, "").trim();
    const result = { description: desc || null, value: val || null };
    const parsed = parseJsonValue(val);
    if (parsed !== null) result.value_json = parsed;
    const encoded = decodeEncodedTextValue(val);
    if (encoded) result.value_decoded = encoded;
    return result;
}

/** Decodes ID3v2 owner-identifier frames such as PRIV and UFID. */
function decodeOwnerPayload(data, prefix, lengthKey) {
    if (!data || data.length < 1) return null;
    const owner = readNullTerminated(data, 0, 0);
    const payload = data.slice(Math.min(owner.next, data.length));
    return {
        owner_identifier: decodeLatin1Trim(owner.valueBytes) || null,
        [lengthKey]: payload.length,
        ...decodeBinaryPayload(payload, prefix),
    };
}

/** Decodes an ID3v2 WXXX (user-defined URL link) frame. */
function decodeWxxxFrame(data) {
    if (!data || data.length < 2) return null;
    const enc = data[0];
    const { valueBytes: descBytes, next } = readNullTerminated(data, 1, enc);
    return {
        text_encoding: ID3_ENCODING_NAMES[enc] || `encoding_${enc}`,
        description: decodeText(descBytes, enc).replace(/\u0000/g, "").trim() || null,
        url: decodeLatin1Trim(data.slice(next)) || null,
    };
}

/** Decodes a standard ID3v2 URL link frame. */
function decodeUrlFrame(frameId, data) {
    return {
        frame_id: frameId,
        description: ID3_URL_FRAME_DESCRIPTIONS[frameId] || ID3_FRAME_DESCRIPTIONS[frameId] || null,
        url: decodeLatin1Trim(data) || null,
    };
}

/** Decodes an ID3v2 APIC (attached picture) frame without retaining image bytes. */
function decodeApicFrame(data) {
    if (!data || data.length < 4) return null;
    const enc = data[0];
    let off = 1;
    const mime = readNullTerminated(data, off, 0);
    const mimeType = decodeLatin1Trim(mime.valueBytes) || null;
    off = Math.min(mime.next, data.length);
    const pictureType = off < data.length ? data[off] : null;
    off += pictureType === null ? 0 : 1;
    const desc = readNullTerminated(data, off, enc);
    const description = decodeText(desc.valueBytes, enc).replace(/\u0000/g, "").trim() || null;
    off = Math.min(desc.next, data.length);

    return {
        text_encoding: ID3_ENCODING_NAMES[enc] || `encoding_${enc}`,
        mime_type: mimeType,
        picture_type: pictureType,
        picture_type_name: ID3_PICTURE_TYPES[pictureType] || null,
        description,
        image_length: Math.max(0, data.length - off),
    };
}

/** Decodes the ID3v2.2 PIC attached-picture frame layout. */
function decodePicFrame(data) {
    if (!data || data.length < 5) return null;
    const enc = data[0];
    const imageFormat = decodeLatin1Trim(data.slice(1, 4)).toUpperCase() || null;
    const pictureType = data[4];
    const desc = readNullTerminated(data, 5, enc);
    const description = decodeText(desc.valueBytes, enc).replace(/\u0000/g, "").trim() || null;
    const imageStart = Math.min(desc.next, data.length);

    return {
        text_encoding: ID3_ENCODING_NAMES[enc] || `encoding_${enc}`,
        image_format: imageFormat,
        mime_type: id3v22ImageMime(imageFormat),
        picture_type: pictureType,
        picture_type_name: ID3_PICTURE_TYPES[pictureType] || null,
        description,
        image_length: Math.max(0, data.length - imageStart),
    };
}

/** Maps ID3v2.2 three-character image formats to MIME types. */
function id3v22ImageMime(format) {
    if (!format) return null;
    if (format === "JPG" || format === "JPEG") return "image/jpeg";
    if (format === "PNG") return "image/png";
    return `image/${format.toLowerCase()}`;
}

/** Decodes an ID3v2 USLT lyrics/transcription frame. */
function decodeUsltFrame(data, maxTextBytes) {
    if (!data || data.length < 4) return null;
    const enc = data[0];
    const language = String.fromCharCode(data[1], data[2], data[3]);
    const desc = readNullTerminated(data, 4, enc);
    const textBytes = data.slice(Math.min(desc.next, data.length));
    const limitedTextBytes = textBytes.slice(0, Math.min(textBytes.length, maxTextBytes));
    const text = decodeText(limitedTextBytes, enc).replace(/\u0000/g, "").trim() || null;

    const encoded = decodeEncodedTextValue(text);
    return {
        text_encoding: ID3_ENCODING_NAMES[enc] || `encoding_${enc}`,
        language,
        description: decodeText(desc.valueBytes, enc).replace(/\u0000/g, "").trim() || null,
        text,
        ...(encoded ? { text_decoded: encoded } : {}),
        text_bytes: textBytes.length,
        text_truncated: textBytes.length > maxTextBytes,
    };
}

/** Decodes an ID3v2 POPM (popularimeter) frame. */
function decodePopmFrame(data) {
    if (!data || data.length < 2) return null;
    const email = readNullTerminated(data, 0, 0);
    const ratingOff = Math.min(email.next, data.length);
    const rating = ratingOff < data.length ? data[ratingOff] : null;
    const counterBytes = data.slice(Math.min(ratingOff + 1, data.length));
    let counter = 0n;
    for (const byte of counterBytes) counter = (counter << 8n) | BigInt(byte);

    return {
        email: decodeLatin1Trim(email.valueBytes) || null,
        rating,
        counter: counterBytes.length ? counter.toString() : null,
        counter_bytes: counterBytes.length,
    };
}

/** Adds ElevenLabs-specific parsed metadata to the metadata-source layer when detected. */
function recordElevenLabsMetadata(report, source, metadata) {
    if (!metadata) return;

    let haystack = "";
    try {
        haystack = JSON.stringify(metadata);
    } catch {
        haystack = String(metadata);
    }

    if (!/(elevenlabs|eleven labs)/i.test(haystack)) return;

    if (!report.metadata_sources) report.metadata_sources = {};
    if (!report.metadata_sources.elevenlabs)
        report.metadata_sources.elevenlabs = { present: false, entries: [] };
    report.metadata_sources.elevenlabs.present = true;
    report.metadata_sources.elevenlabs.entries.push({ source, metadata });

    if (!report.detections.metadata_sources) report.detections.metadata_sources = [];
    pushUnique(report.detections.metadata_sources, "elevenlabs");
}

/** Produces text/JSON/hex views for binary ID3 fields. */
function decodeBinaryPayload(bytes, prefix) {
    const result = {
        [`${prefix}_hex_preview`]: bytesToHex(bytes.slice(0, 512)),
        [`${prefix}_truncated`]: bytes.length > 512,
    };

    const text = decodePrintableText(bytes);
    if (text !== null) {
        result[`${prefix}_text`] = text.length > 8192 ? `${text.slice(0, 8192)}...` : text;
        result[`${prefix}_text_truncated`] = text.length > 8192;

        const parsed = parseJsonValue(text);
        if (parsed !== null) result[`${prefix}_json`] = parsed;
        const encoded = decodeEncodedTextValue(text);
        if (encoded) result[`${prefix}_decoded`] = encoded;
    }

    return result;
}

/** Decodes text values that are themselves encoded as hex/base64 metadata. */
function decodeEncodedTextValue(text) {
    if (!text || typeof text !== "string") return null;
    const trimmed = text.trim();
    if (trimmed.length < 16 || /\s/.test(trimmed)) return null;

    const hexBytes = decodeHexString(trimmed);
    if (hexBytes) return summarizeEncodedBytes("hex", hexBytes);

    const base64Bytes = decodeBase64String(trimmed);
    if (base64Bytes) return summarizeEncodedBytes("base64", base64Bytes);
    return null;
}

/** Summarizes decoded encoded bytes only when they contain printable text/JSON metadata. */
function summarizeEncodedBytes(encoding, bytes) {
    const decodedText = decodePrintableText(bytes);
    if (decodedText === null) return null;

    const result = {
        encoding,
        byte_length: bytes.length,
        text: decodedText,
    };
    const parsed = parseJsonValue(decodedText);
    if (parsed !== null) result.json = parsed;
    return result;
}

/** Decodes a strict hexadecimal string. */
function decodeHexString(text) {
    if (text.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(text)) return null;
    const bytes = new Uint8Array(text.length / 2);
    for (let i = 0; i < bytes.length; i++)
        bytes[i] = parseInt(text.slice(i * 2, i * 2 + 2), 16);
    return bytes;
}

/** Decodes strict base64/base64url text without accepting arbitrary short strings. */
function decodeBase64String(text) {
    if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(text)) return null;
    let normalized = text.replace(/-/g, "+").replace(/_/g, "/");
    if (normalized.length % 4 === 1) return null;
    while (normalized.length % 4) normalized += "=";
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized) || /=[^=]/.test(normalized)) return null;

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const out = [];
    for (let i = 0; i < normalized.length; i += 4) {
        const chunk = normalized.slice(i, i + 4);
        const vals = Array.from(chunk, (ch) => ch === "=" ? 0 : alphabet.indexOf(ch));
        if (vals.some((v) => v < 0)) return null;
        const n = (vals[0] << 18) | (vals[1] << 12) | (vals[2] << 6) | vals[3];
        out.push((n >> 16) & 0xff);
        if (chunk[2] !== "=") out.push((n >> 8) & 0xff);
        if (chunk[3] !== "=") out.push(n & 0xff);
    }
    return new Uint8Array(out);
}

/** Decodes known embedded metadata containers inside binary objects. */
function decodeEmbeddedObjectMetadata(bytes, mimeType) {
    const result = {};
    const mt = (mimeType || "").toLowerCase();
    if (mt.includes("c2pa") || mt.includes("jumbf") || looksLikeBoxSequence(bytes)) {
        const jumbf = parseJumbfContainer(bytes);
        if (jumbf?.boxes?.length) result.object_jumbf = jumbf;
    }
    return result;
}

/** Applies decoded C2PA/JUMBF fields to the normalized provenance layer. */
function applyC2paJumbfMetadata(report, jumbf) {
    if (!jumbf) return;

    const activeManifest = jumbf.labels?.find((label) => /^urn:c2pa:/i.test(label));
    if (activeManifest && !report.provenance.c2pa.manifest_store.active_manifest_urn)
        report.provenance.c2pa.manifest_store.active_manifest_urn = activeManifest;
    report.provenance.c2pa.jumbf = {
        format: jumbf.format,
        box_count: jumbf.box_count,
        truncated: jumbf.truncated,
        labels: jumbf.labels,
        boxes: jumbf.boxes,
    };

    for (const payload of jumbf.decoded_payloads || []) {
        const rawValue = payload.json ?? payload.cbor ?? payload.text ?? null;
        const value = normalizeC2paAssertionValue(payload.label, rawValue);
        report.provenance.c2pa.assertions.push({
            source: payload.path,
            type: payload.type,
            label: payload.label || null,
            value,
        });
    }
}

/** Adds C2PA-specific structure around generic CBOR values where the encoding is known. */
function normalizeC2paAssertionValue(label, value) {
    if (label === "c2pa.signature" && value?.tag === 18 && Array.isArray(value.value))
        return normalizeCoseSign1(value);
    return value;
}

/** Expands COSE_Sign1 from CBOR tag 18 into named fields instead of positional array indexes. */
function normalizeCoseSign1(tagged) {
    const [protectedBytes, unprotectedHeaders, payload, signature] = tagged.value;
    const result = {
        tag: tagged.tag,
        structure: "COSE_Sign1",
    };

    if (protectedBytes?.type === "bytes") {
        result.protected_bytes = compactByteSummary(protectedBytes);
        if (protectedBytes.decoded_cbor)
            result.protected_headers = labelCoseHeaders(protectedBytes.decoded_cbor);
    } else {
        result.protected = protectedBytes;
    }

    result.unprotected_headers = labelCoseHeaders(unprotectedHeaders);
    result.payload = payload;
    result.signature = signature;
    return result;
}

/** Keeps byte-string evidence while moving decoded nested structure into named fields. */
function compactByteSummary(value) {
    if (!value || typeof value !== "object") return value;
    const compact = { ...value };
    delete compact.decoded_cbor;
    delete compact.decoded_cbor_bytes_read;
    return compact;
}

/** Replaces numeric COSE header labels with stable names and decodes common algorithm ids. */
function labelCoseHeaders(headers) {
    if (!headers || typeof headers !== "object" || Array.isArray(headers)) return headers;
    const labelled = {};
    for (const [key, value] of Object.entries(headers)) {
        const label = COSE_HEADER_LABELS[key] || key;
        if (label === "alg") {
            labelled.alg = {
                id: value,
                name: COSE_ALGORITHMS[String(value)] || null,
            };
        } else {
            labelled[label] = value;
        }
    }
    return labelled;
}

/** Parses a JSON-looking text value, returning null when it is not JSON. */
function parseJsonValue(text) {
    if (!text) return null;
    const trimmed = text.trim();
    if (trimmed[0] !== "{" && trimmed[0] !== "[") return null;
    try {
        return JSON.parse(trimmed);
    } catch {
        return null;
    }
}

/** Returns a best-effort text representation only when bytes look textual. */
function decodePrintableText(bytes) {
    const text = safeUtf8(bytes).replace(/\u0000/g, "").trim();
    if (!text) return null;

    let printable = 0;
    for (const ch of text) {
        const code = ch.codePointAt(0);
        if (code === 0xfffd) continue;
        if (code === 0x09 || code === 0x0a || code === 0x0d || code >= 0x20) printable++;
    }

    return printable / text.length >= 0.85 ? text : null;
}

/** Encodes a byte array as lowercase hex. */
function bytesToHex(bytes) {
    return Array.from(bytes, (x) => x.toString(16).padStart(2, "0")).join("");
}

/** Encodes bytes as base64 without depending on Node-only Buffer. */
function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
        const chunk = bytes.slice(i, i + 0x8000);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

/** Returns true when a byte range starts with an ISO BMFF/JUMBF-style box. */
function looksLikeBoxSequence(bytes) {
    if (!bytes || bytes.length < 8) return false;
    const size = u32be(bytes, 0);
    const type = ascii4(bytes, 4);
    return size >= 8 && size <= bytes.length && /^[A-Za-z0-9 _-]{4}$/.test(type);
}

/** Parses a JUMBF/ISO BMFF box sequence and decodes JSON/CBOR/XML payload boxes. */
function parseJumbfContainer(bytes) {
    const state = { count: 0, maxBoxes: 500 };
    const boxes = parseJumbfBoxes(bytes, 0, bytes.length, [], 0, state);
    const decodedPayloads = [];
    const labels = [];
    collectJumbfPayloads(boxes, [], decodedPayloads, labels);
    stripJumbfDecodedPayloads(boxes);
    return {
        format: "jumbf",
        box_count: state.count,
        truncated: state.count >= state.maxBoxes,
        labels: Array.from(new Set(labels)),
        boxes,
        decoded_payloads: decodedPayloads,
    };
}

/** Recursively parses JUMBF boxes. */
function parseJumbfBoxes(bytes, start, end, path, depth, state) {
    const boxes = [];
    let off = start;

    while (off + 8 <= end && state.count < state.maxBoxes) {
        const size32 = u32be(bytes, off);
        const type = ascii4(bytes, off + 4);
        let headerSize = 8;
        let size = size32;

        if (!/^[A-Za-z0-9 _-]{4}$/.test(type)) break;
        if (size32 === 1) {
            if (off + 16 > end) break;
            size = Number(u64be(bytes, off + 8));
            headerSize = 16;
        } else if (size32 === 0) {
            size = end - off;
        }
        if (size < headerSize || off + size > end) break;

        const dataOff = off + headerSize;
        const boxEnd = off + size;
        const boxPath = [...path, `${type}[${boxes.length}]`];
        const entry = {
            type,
            type_name: JUMBF_BOX_TYPE_NAMES[type] || null,
            size,
            offset: off,
            data_length: size - headerSize,
            path: boxPath.join("."),
        };
        state.count++;

        const payload = bytes.slice(dataOff, boxEnd);
        if (type === "jumd") {
            entry.description = parseJumbfDescription(payload);
        } else if (type === "json") {
            const text = safeUtf8(payload).replace(/\u0000/g, "").trim();
            const parsed = parseJsonValue(text);
            entry.payload_type = "json";
            entry.payload_bytes = payload.length;
            entry.decoded = parsed !== null;
            if (parsed !== null) {
                entry.decoded_payload = { json: parsed };
            } else {
                entry.text_length = text.length;
                entry.text_truncated = text.length > 512;
                if (text) entry.decoded_payload = { text };
            }
        } else if (type === "cbor") {
            const cbor = parseCborPayload(payload);
            entry.payload_type = "cbor";
            entry.payload_bytes = payload.length;
            if (cbor.value !== undefined) {
                entry.decoded = true;
                entry.bytes_read = cbor.bytes_read;
                entry.trailing_bytes = cbor.trailing_bytes;
                entry.decoded_payload = { cbor: cbor.value };
            } else {
                entry.decoded = false;
                entry.warning = cbor.warning;
                entry.data_hex_preview = cbor.hex_preview;
                entry.data_truncated = cbor.truncated;
            }
        } else if (type === "xml " || type === "xml_") {
            const text = safeUtf8(payload).replace(/\u0000/g, "").trim();
            entry.payload_type = type.trim() || "xml";
            entry.payload_bytes = payload.length;
            entry.decoded = !!text;
            entry.text_length = text.length;
            entry.text_truncated = text.length > 512;
            if (text) entry.decoded_payload = { text };
        } else if (type === "jumb" && depth < 16) {
            entry.children = parseJumbfBoxes(bytes, dataOff, boxEnd, boxPath, depth + 1, state);
            const desc = entry.children.find((child) => child.type === "jumd")?.description;
            if (desc) entry.description = desc;
        } else {
            const text = decodePrintableText(payload);
            if (text !== null) entry.text_preview = text.slice(0, 512);
            else entry.data_hex_preview = bytesToHex(payload.slice(0, 64));
            entry.data_truncated = payload.length > 64;
        }

        boxes.push(entry);
        off = boxEnd;
    }

    return boxes;
}

/** Parses a JUMBF Description box. */
function parseJumbfDescription(payload) {
    if (payload.length < 17) return { warning: "JUMBF description is truncated" };
    const contentTypeBytes = payload.slice(0, 16);
    const contentTypeCode = safeUtf8(contentTypeBytes.slice(0, 4)).replace(/\u0000/g, "").trim() || null;
    const toggles = payload[16];
    const labelBytes = readNullTerminated(payload, 17, 0).valueBytes;
    const label = decodeLatin1Trim(labelBytes) || null;
    const contentType = (contentTypeCode && JUMBF_CONTENT_TYPE_NAMES[contentTypeCode]) ||
        decodePrintableText(contentTypeBytes)?.replace(/\u0000/g, "") || null;
    return {
        content_type_uuid: bytesToHex(contentTypeBytes),
        content_type_code: contentTypeCode,
        content_type: contentType,
        toggles,
        label,
    };
}

/** Collects decoded JSON/CBOR/XML payloads and labels from a parsed JUMBF tree. */
function collectJumbfPayloads(boxes, labelStack, decodedPayloads, labels) {
    for (const box of boxes) {
        const nextLabels = [...labelStack];
        if (box.description?.label) {
            nextLabels.push(box.description.label);
            labels.push(box.description.label);
        }

        if (box.decoded_payload) {
            decodedPayloads.push({
                path: box.path,
                type: box.type,
                label: nextLabels[nextLabels.length - 1] || null,
                ...box.decoded_payload,
            });
        }

        if (box.children) collectJumbfPayloads(box.children, nextLabels, decodedPayloads, labels);
    }
}

/** Removes temporary decoded payload bodies from the structural JUMBF tree. */
function stripJumbfDecodedPayloads(boxes) {
    for (const box of boxes) {
        delete box.decoded_payload;
        if (box.children) stripJumbfDecodedPayloads(box.children);
    }
}

/** Decodes a CBOR payload into JSON-compatible values. */
function parseCborPayload(bytes) {
    try {
        const state = { count: 0, maxItems: 10000 };
        const decoded = readCborValue(bytes, 0, 0, state);
        return {
            value: decoded.value,
            bytes_read: decoded.offset,
            trailing_bytes: Math.max(0, bytes.length - decoded.offset),
        };
    } catch (e) {
        return {
            warning: String(e?.message || e),
            byte_length: bytes.length,
            hex_preview: bytesToHex(bytes.slice(0, 128)),
            truncated: bytes.length > 128,
        };
    }
}

/** Reads one CBOR value. */
function readCborValue(bytes, offset, depth, state) {
    if (offset >= bytes.length) throw new Error("CBOR value is truncated");
    if (depth > 64 || state.count++ > state.maxItems) throw new Error("CBOR nesting/item limit exceeded");

    const initial = bytes[offset++];
    const major = initial >> 5;
    const additional = initial & 0x1f;
    if (major === 7) return readCborSimple(bytes, offset, additional);

    const len = readCborLength(bytes, offset, additional);
    offset = len.offset;

    if (major === 0) return { value: cborIntValue(len.value), offset };
    if (major === 1) return { value: cborNegativeValue(len.value), offset };

    if (major === 2) {
        if (len.indefinite) return readIndefiniteCborBytes(bytes, offset, depth, state);
        if (offset + Number(len.value) > bytes.length) throw new Error("CBOR byte string is truncated");
        const data = bytes.slice(offset, offset + Number(len.value));
        return { value: summarizeCborBytes(data), offset: offset + Number(len.value) };
    }

    if (major === 3) {
        if (len.indefinite) return readIndefiniteCborText(bytes, offset, depth, state);
        if (offset + Number(len.value) > bytes.length) throw new Error("CBOR text string is truncated");
        const text = safeUtf8(bytes.slice(offset, offset + Number(len.value)));
        return { value: text, offset: offset + Number(len.value) };
    }

    if (major === 4) return readCborArray(bytes, offset, len, depth, state);
    if (major === 5) return readCborMap(bytes, offset, len, depth, state);
    if (major === 6) {
        const tagged = readCborValue(bytes, offset, depth + 1, state);
        return { value: { tag: cborIntValue(len.value), value: tagged.value }, offset: tagged.offset };
    }

    throw new Error(`Unsupported CBOR major type ${major}`);
}

/** Reads a CBOR length/additional-info field. */
function readCborLength(bytes, offset, additional) {
    if (additional < 24) return { value: BigInt(additional), offset };
    if (additional === 31) return { indefinite: true, value: null, offset };

    const width = additional === 24 ? 1 : additional === 25 ? 2 : additional === 26 ? 4 : additional === 27 ? 8 : 0;
    if (!width) throw new Error(`Unsupported CBOR additional information ${additional}`);
    if (offset + width > bytes.length) throw new Error(`CBOR uint${width * 8} length is truncated`);

    const value = width === 1 ? BigInt(bytes[offset]) :
        width === 2 ? BigInt(u16be(bytes, offset)) :
            width === 4 ? BigInt(u32be(bytes, offset)) : u64be(bytes, offset);
    return { value, offset: offset + width };
}

/** Converts a CBOR unsigned integer to a JSON-safe value. */
function cborIntValue(value) {
    return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : value.toString();
}

/** Converts a CBOR negative integer to a JSON-safe value. */
function cborNegativeValue(value) {
    const result = -1n - value;
    return result >= BigInt(Number.MIN_SAFE_INTEGER) ? Number(result) : result.toString();
}

/** Reads a CBOR array. */
function readCborArray(bytes, offset, len, depth, state) {
    const arr = [];
    if (len.indefinite) {
        while (offset < bytes.length && bytes[offset] !== 0xff) {
            const item = readCborValue(bytes, offset, depth + 1, state);
            arr.push(item.value);
            offset = item.offset;
        }
        if (offset >= bytes.length) throw new Error("CBOR indefinite array missing break");
        return { value: arr, offset: offset + 1 };
    }

    for (let i = 0; i < Number(len.value); i++) {
        const item = readCborValue(bytes, offset, depth + 1, state);
        arr.push(item.value);
        offset = item.offset;
    }
    return { value: arr, offset };
}

/** Reads a CBOR map. */
function readCborMap(bytes, offset, len, depth, state) {
    const obj = {};
    const count = len.indefinite ? null : Number(len.value);
    let i = 0;
    while (count === null ? offset < bytes.length && bytes[offset] !== 0xff : i < count) {
        const key = readCborValue(bytes, offset, depth + 1, state);
        const val = readCborValue(bytes, key.offset, depth + 1, state);
        const mapKey = typeof key.value === "string" ? key.value : JSON.stringify(key.value);
        obj[mapKey] = val.value;
        offset = val.offset;
        i++;
    }
    if (count === null) {
        if (offset >= bytes.length) throw new Error("CBOR indefinite map missing break");
        offset++;
    }
    return { value: obj, offset };
}

/** Reads CBOR simple values and floats. */
function readCborSimple(bytes, offset, additional) {
    if (additional === 20) return { value: false, offset };
    if (additional === 21) return { value: true, offset };
    if (additional === 22) return { value: null, offset };
    if (additional === 23) return { value: undefined, offset };
    if (additional === 24) {
        if (offset + 1 > bytes.length) throw new Error("CBOR simple value is truncated");
        return { value: { simple: bytes[offset] }, offset: offset + 1 };
    }
    if (additional === 25) {
        if (offset + 2 > bytes.length) throw new Error("CBOR float16 is truncated");
        return { value: { float16_hex: bytesToHex(bytes.slice(offset, offset + 2)) }, offset: offset + 2 };
    }
    if (additional === 26 || additional === 27) {
        const width = additional === 26 ? 4 : 8;
        if (offset + width > bytes.length) throw new Error(`CBOR float${width * 8} is truncated`);
        const view = new DataView(bytes.buffer, bytes.byteOffset + offset, width);
        return { value: width === 4 ? view.getFloat32(0, false) : view.getFloat64(0, false), offset: offset + width };
    }
    if (additional === 31) throw new Error("Unexpected CBOR break");
    return { value: { simple: additional }, offset };
}

/** Summarizes CBOR byte strings without retaining large binary blobs. */
function summarizeCborBytes(data) {
    const text = decodePrintableText(data);
    const summary = {
        type: "bytes",
        byte_length: data.length,
    };
    if (text !== null) {
        summary.text = text;
        const json = parseJsonValue(text);
        if (json !== null) summary.json = json;
        const encoded = decodeEncodedTextValue(text);
        if (encoded) summary.text_decoded = encoded;
        return summary;
    }

    if (data.length <= 256) {
        summary.hex = bytesToHex(data);
        summary.base64 = bytesToBase64(data);
        summary.truncated = false;
    } else {
        summary.hex_preview = bytesToHex(data.slice(0, 64));
        summary.base64_preview = bytesToBase64(data.slice(0, 64));
        summary.truncated = true;
    }

    const formatHint = detectBinaryFormat(data);
    if (formatHint) summary.format_hint = formatHint;

    const nested = decodeNestedCborBytes(data);
    if (nested) {
        summary.decoded_cbor = nested.value;
        summary.decoded_cbor_bytes_read = nested.bytes_read;
    }
    return summary;
}

/** Returns a conservative binary format hint for opaque byte strings. */
function detectBinaryFormat(data) {
    if (data.length >= 2 && data[0] === 0x30) return "ASN.1 DER sequence";
    if (data.length >= 4 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return "PNG";
    if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "JPEG";
    return null;
}

/** Decodes byte strings that themselves contain a complete nested CBOR map/array/tag. */
function decodeNestedCborBytes(data) {
    if (!data.length || data.length > 8192) return null;
    const major = data[0] >> 5;
    if (major !== 4 && major !== 5 && major !== 6) return null;

    const decoded = parseCborPayload(data);
    if (decoded.value === undefined || decoded.trailing_bytes !== 0) return null;
    if (!decoded.value || typeof decoded.value !== "object") return null;
    return {
        value: decoded.value,
        bytes_read: decoded.bytes_read,
    };
}

/** Reads an indefinite-length CBOR byte string. */
function readIndefiniteCborBytes(bytes, offset, depth, state) {
    const chunks = [];
    while (offset < bytes.length && bytes[offset] !== 0xff) {
        const chunk = readCborValue(bytes, offset, depth + 1, state);
        if (!chunk.value || chunk.value.type !== "bytes") throw new Error("Invalid CBOR byte string chunk");
        chunks.push(chunk.value);
        offset = chunk.offset;
    }
    if (offset >= bytes.length) throw new Error("CBOR indefinite byte string missing break");
    return { value: { type: "bytes", chunks }, offset: offset + 1 };
}

/** Reads an indefinite-length CBOR text string. */
function readIndefiniteCborText(bytes, offset, depth, state) {
    let text = "";
    while (offset < bytes.length && bytes[offset] !== 0xff) {
        const chunk = readCborValue(bytes, offset, depth + 1, state);
        if (typeof chunk.value !== "string") throw new Error("Invalid CBOR text string chunk");
        text += chunk.value;
        offset = chunk.offset;
    }
    if (offset >= bytes.length) throw new Error("CBOR indefinite text string missing break");
    return { value: text, offset: offset + 1 };
}

/** Recursively parses MP4 atoms, including nested metadata containers. */
function parseMp4Atoms(b, start, end, path, depth, state) {
    const atoms = [];
    let off = start;

    while (off + 8 <= end && state.count < 2000) {
        const size32 = u32be(b, off);
        const type = ascii4(b, off + 4);
        let headerSize = 8;
        let size = size32;

        if (size32 === 1) {
            if (off + 16 > end) break;
            size = Number(u64be(b, off + 8));
            headerSize = 16;
        } else if (size32 === 0) {
            size = end - off;
        }

        if (size < headerSize) break;

        const dataOff = off + headerSize;
        const declaredEnd = off + size;
        const atomEnd = Math.min(declaredEnd, end);
        const truncated = declaredEnd > end;
        const atomPath = [...path, type];
        const atomBase = {
            type,
            size,
            offset: off,
            data_offset: dataOff,
            depth,
            path: atomPath.join("."),
            ...(truncated ? { truncated: true, available_size: atomEnd - off } : {}),
        };
        const atom = { ...atomBase };
        atoms.push(atom);
        state.flat.push(atomBase);
        state.count++;

        const childStart = mp4ChildStart(type, dataOff, path);
        if (childStart !== null && childStart + 8 <= atomEnd)
            atom.children = parseMp4Atoms(b, childStart, atomEnd, atomPath, depth + 1, state);

        off = atomEnd;
    }

    return atoms;
}

/** Returns the first child atom offset for MP4 container atoms, or null for leaves. */
function mp4ChildStart(type, dataOff, parentPath) {
    if (type === "meta") return dataOff + 4;
    if (parentPath[parentPath.length - 1] === "ilst") return dataOff;
    if (MP4_CONTAINER_ATOMS.has(type)) return dataOff;
    return null;
}

/** Extracts iTunes-style MP4 metadata item atoms from all ilst containers. */
function parseMp4IlstItems(b, atoms) {
    const items = [];

    const walk = (atom) => {
        if (atom.type === "ilst" && atom.children) {
            for (const child of atom.children) {
                const item = parseMp4IlstItem(b, child);
                if (item) items.push(item);
            }
        }
        for (const child of (atom.children || [])) walk(child);
    };

    for (const atom of atoms) walk(atom);
    return items;
}

/** Parses one child of an MP4 ilst atom, including freeform ---- metadata. */
function parseMp4IlstItem(b, itemAtom) {
    const children = itemAtom.children || [];
    const dataAtoms = children.filter((child) => child.type === "data");
    const mean = parseMp4TextChild(b, children.find((child) => child.type === "mean"));
    const name = parseMp4TextChild(b, children.find((child) => child.type === "name"));
    const values = dataAtoms.map((atom) => parseMp4DataAtom(b, atom, itemAtom.type));
    if (!values.length && !mean && !name) return null;

    const firstValue = values.find((value) => value.value !== null && value.value !== undefined);
    const key = itemAtom.type === "----" && name ? name : itemAtom.type;

    return {
        key,
        atom_type: itemAtom.type,
        mean: mean || null,
        name: name || null,
        values,
        value: firstValue ? firstValue.value : null,
        offset: itemAtom.offset,
        size: itemAtom.size,
    };
}

/** Parses mean/name children in MP4 freeform metadata atoms. */
function parseMp4TextChild(b, atom) {
    if (!atom) return null;
    const start = atom.data_offset + 4 <= atom.offset + atom.size ? atom.data_offset + 4 : atom.data_offset;
    return safeUtf8(b.slice(start, atom.offset + atom.size)).replace(/\u0000/g, "").trim() || null;
}

/** Parses the payload of an MP4 data atom. */
function parseMp4DataAtom(b, atom, parentType) {
    const end = atom.offset + atom.size;
    if (atom.data_offset + 8 > end) {
        return {
            data_type: null,
            locale: null,
            value: null,
        };
    }

    const dataType = u32be(b, atom.data_offset);
    const locale = u32be(b, atom.data_offset + 4);
    const valueOff = atom.data_offset + 8;
    const valueBytes = b.slice(valueOff, end);

    const value = decodeMp4DataValue(parentType, dataType, valueBytes);
    const encoded = typeof value === "string" ? decodeEncodedTextValue(value) : null;
    return {
        data_type: dataType,
        data_type_name: mp4DataTypeName(dataType),
        locale,
        data_length: valueBytes.length,
        value,
        ...(encoded ? { value_decoded: encoded } : {}),
    };
}

/** Decodes common MP4 metadata payload value types. */
function decodeMp4DataValue(parentType, dataType, valueBytes) {
    if (parentType === "trkn" || parentType === "disk") {
        if (valueBytes.length >= 6)
            return `${u16be(valueBytes, 2)}${u16be(valueBytes, 4) ? `/${u16be(valueBytes, 4)}` : ""}`;
    }

    if (dataType === 1)
        return safeUtf8(valueBytes).replace(/\u0000/g, "").trim();
    if (dataType === 2)
        return decodeMp4Utf16(valueBytes);
    if (dataType === 21 || ["tmpo", "cpil", "rtng", "stik", "gnre"].includes(parentType))
        return decodeMp4Integer(valueBytes);
    if (dataType === 13) return `(JPEG image, ${valueBytes.length} bytes)`;
    if (dataType === 14) return `(PNG image, ${valueBytes.length} bytes)`;

    const text = decodePrintableText(valueBytes);
    if (text !== null) return text;
    return `(${valueBytes.length} bytes)`;
}

/** Decodes BOM-aware MP4 UTF-16 text, defaulting to big-endian when no BOM is present. */
function decodeMp4Utf16(valueBytes) {
    let encoding = "utf-16be";
    let start = 0;
    if (valueBytes.length >= 2 && valueBytes[0] === 0xff && valueBytes[1] === 0xfe) {
        encoding = "utf-16le";
        start = 2;
    } else if (valueBytes.length >= 2 && valueBytes[0] === 0xfe && valueBytes[1] === 0xff) {
        start = 2;
    }

    try {
        return new TextDecoder(encoding).decode(valueBytes.slice(start)).replace(/\u0000/g, "").trim();
    } catch {
        return decodeText(valueBytes, 1).replace(/\u0000/g, "").trim();
    }
}

/** Names common MP4 ilst data atom type indicators. */
function mp4DataTypeName(dataType) {
    return {
        1: "UTF-8 text",
        2: "UTF-16 text",
        13: "JPEG image",
        14: "PNG image",
        21: "Signed integer",
    }[dataType] || null;
}

/** Maps MP4 cover-art data types to MIME types. */
function mp4DataContentType(dataType) {
    return {
        13: "image/jpeg",
        14: "image/png",
    }[dataType] || null;
}

/** Decodes a big-endian MP4 integer payload. */
function decodeMp4Integer(valueBytes) {
    let value = 0;
    for (const byte of valueBytes) value = value * 256 + byte;
    return value;
}

/** @returns {number} Unsigned 16-bit big-endian read. */
function u16be(bytes, off) {
    return (bytes[off] << 8) | bytes[off + 1];
}

/** @returns {BigInt} Unsigned 64-bit big-endian read. */
function u64be(bytes, off) {
    return (BigInt(u32be(bytes, off)) << 32n) | BigInt(u32be(bytes, off + 4));
}

/** Best-effort APEv2 tag parser scanning the last 32 KB. */
function parseApeV2BestEffort(b) {
    const scanStart = Math.max(0, b.length - 32768);
    const idx = indexOfAscii(b, "APETAGEX", scanStart, b.length);
    if (idx < 0) return null;
    if (idx + 32 > b.length) return { present: true, warning: "APETAGEX found but footer truncated." };

    const ver = u32le(b, idx + 8), size = u32le(b, idx + 12);
    const count = u32le(b, idx + 16), flags = u32le(b, idx + 20);

    const tagStart = idx + 32 - size;
    if (tagStart < 0 || tagStart >= b.length)
        return { present: true, version: ver, size, count, flags, warning: "APEv2 bounds invalid (non-standard placement)." };

    const items = [];
    let off = tagStart + 32;
    const end = Math.min(b.length, idx);
    while (off + 8 < end && items.length < 5000) {
        const valueSize = u32le(b, off), itemFlags = u32le(b, off + 4);
        off += 8;
        let keyEnd = off;
        while (keyEnd < end && b[keyEnd] !== 0x00) keyEnd++;
        const key = decodeLatin1Trim(b.slice(off, keyEnd));
        off = keyEnd + 1;
        if (!key || off + valueSize > end) break;
        const value = safeUtf8(b.slice(off, off + valueSize)).replace(/\u0000/g, "").trim();
        off += valueSize;
        items.push({ key, value, flags: itemFlags });
    }

    return { present: true, version: ver, size, count, flags, items };
}

/** Enumerates RIFF-style chunks (id + LE32 size) within a byte range, padding to even. */
function enumerateChunks(b, start, end, maxCount) {
    const chunks = [];
    let off = start;
    while (off + 8 <= end && chunks.length < maxCount) {
        const id = ascii4(b, off);
        const size = u32le(b, off + 4);
        const dataOff = off + 8;
        if (dataOff + size > end) break;
        chunks.push({ id, size, dataOff });
        off = dataOff + size + (size % 2);
    }
    return chunks;
}

/** Parses a BWF bext chunk. */
function parseBext(b, off, size) {
    const slice = b.slice(off, off + size);
    const timeRefLow = u32le(slice, 338), timeRefHigh = u32le(slice, 342);
    return {
        description: decodeLatin1Trim(slice.slice(0, 256)) || null,
        originator: decodeLatin1Trim(slice.slice(256, 288)) || null,
        originator_reference: decodeLatin1Trim(slice.slice(288, 320)) || null,
        origination_date: decodeLatin1Trim(slice.slice(320, 330)) || null,
        origination_time: decodeLatin1Trim(slice.slice(330, 338)) || null,
        time_reference_samples: ((BigInt(timeRefHigh) << 32n) | BigInt(timeRefLow)).toString(),
    };
}

const FLAC_TYPE_NAMES = { 0: "STREAMINFO", 1: "PADDING", 2: "APPLICATION", 3: "SEEKTABLE", 4: "VORBIS_COMMENT", 5: "CUESHEET", 6: "PICTURE" };

/** Parses FLAC metadata blocks following the "fLaC" marker. */
function parseFlacMetaBlocks(b) {
    const blocks = [];
    let off = 4;
    while (off + 4 <= b.length && blocks.length < 10000) {
        const blockOffset = off;
        const header = b[off];
        const isLast = (header & 0x80) !== 0;
        const type = header & 0x7f;
        const len = (b[off + 1] << 16) | (b[off + 2] << 8) | b[off + 3];
        off += 4;
        if (off + len > b.length) break;
        blocks.push({
            type,
            typeName: FLAC_TYPE_NAMES[type] || `TYPE_${type}`,
            length: len,
            offset: blockOffset,
            isLast,
            data: b.slice(off, off + len),
        });
        off += len;
        if (isLast) break;
    }
    return blocks;
}

/** Parses FLAC STREAMINFO technical metadata. */
function parseFlacStreamInfo(data) {
    if (data.length < 34) return { warning: "STREAMINFO block truncated" };
    return {
        min_block_size: u16be(data, 0),
        max_block_size: u16be(data, 2),
        min_frame_size: (data[4] << 16) | (data[5] << 8) | data[6],
        max_frame_size: (data[7] << 16) | (data[8] << 8) | data[9],
        sample_rate: (data[10] << 12) | (data[11] << 4) | (data[12] >> 4),
        channels: ((data[12] >> 1) & 0x07) + 1,
        bits_per_sample: (((data[12] & 0x01) << 4) | (data[13] >> 4)) + 1,
        total_samples: ((BigInt(data[13] & 0x0f) << 32n) | BigInt(u32be(data, 14))).toString(),
        md5_signature: bytesToHex(data.slice(18, 34)),
    };
}

/** Parses a Vorbis Comment block (used by FLAC and OGG). */
function parseVorbisComment(buf) {
    let off = 0;
    const vendorLen = u32le(buf, off); off += 4;
    if (off + vendorLen > buf.length) return { vendor: null, comments: [], warning: "vendor_len out of bounds" };
    const vendor = safeUtf8(buf.slice(off, off + vendorLen)); off += vendorLen;
    const count = u32le(buf, off); off += 4;

    const comments = [];
    for (let i = 0; i < count && off + 4 <= buf.length && comments.length < 20000; i++) {
        const l = u32le(buf, off); off += 4;
        if (off + l > buf.length) break;
        const s = safeUtf8(buf.slice(off, off + l)); off += l;
        const eq = s.indexOf("=");
        if (eq > 0) {
            const value = s.slice(eq + 1);
            const encoded = decodeEncodedTextValue(value);
            comments.push({
                key: s.slice(0, eq).toUpperCase(),
                value,
                ...(encoded ? { value_decoded: encoded } : {}),
            });
        }
    }
    return { vendor, comments };
}

/** Maps Vorbis Comment fields to the common tags layer. */
function mapVorbisCommon(report, vc) {
    const c = report.tags.common;
    for (const [vk, ck] of Object.entries(VORBIS_TO_COMMON))
        c[ck] = c[ck] || vc.comments?.find((x) => x.key === vk)?.value || null;
}

/** Parses a FLAC PICTURE metadata block (extracts mime, description, data length). */
function parseFlacPicture(data, maxTextBytes) {
    let off = 0;
    const pictureType = u32be(data, off); off += 4;
    const mimeLen = u32be(data, off); off += 4;
    const mime = safeUtf8(data.slice(off, off + Math.min(mimeLen, maxTextBytes))); off += mimeLen;
    const descLen = u32be(data, off); off += 4;
    const description = safeUtf8(data.slice(off, off + Math.min(descLen, maxTextBytes))); off += descLen;
    const width = u32be(data, off); off += 4;
    const height = u32be(data, off); off += 4;
    const depth = u32be(data, off); off += 4;
    const indexedColors = u32be(data, off); off += 4;
    const dataLength = u32be(data, off);
    return { pictureType, mime, description, width, height, depth, indexedColors, dataLength };
}

/** Parses the ASF Content Description Object fields. */
function parseAsfContentDescription(b, off) {
    const titleLen = u16le(b, off), authorLen = u16le(b, off + 2);
    const copyrightLen = u16le(b, off + 4), descLen = u16le(b, off + 6), ratingLen = u16le(b, off + 8);
    let pos = off + 10;
    const title = decodeUtf16LE(b, pos, titleLen); pos += titleLen;
    const author = decodeUtf16LE(b, pos, authorLen); pos += authorLen;
    const copyright = decodeUtf16LE(b, pos, copyrightLen); pos += copyrightLen;
    const description = decodeUtf16LE(b, pos, descLen); pos += descLen;
    const rating = decodeUtf16LE(b, pos, ratingLen);
    return { title, author, copyright, description, rating };
}

/** Parses the ASF Extended Content Description Object descriptors. */
function parseAsfExtContentDescription(b, off, end) {
    const count = u16le(b, off);
    let pos = off + 2;
    const descriptors = [];
    for (let i = 0; i < count && pos + 6 <= end && descriptors.length < 5000; i++) {
        const nameLen = u16le(b, pos); pos += 2;
        if (pos + nameLen > end) break;
        const name = decodeUtf16LE(b, pos, nameLen); pos += nameLen;
        const valueType = u16le(b, pos); pos += 2;
        const valueLen = u16le(b, pos); pos += 2;
        if (pos + valueLen > end) break;
        let value;
        if (valueType === 0) value = decodeUtf16LE(b, pos, valueLen);
        else if (valueType === 3) value = u32le(b, pos);
        else if (valueType === 5) value = u16le(b, pos);
        else if (valueType === 2) value = u32le(b, pos) !== 0;
        else value = `(${valueLen} bytes, type ${valueType})`;
        pos += valueLen;
        descriptors.push({ name, value_type: valueType, value });
    }
    return descriptors;
}
