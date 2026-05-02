/**
 * @author d0s1nt [d0s1nt@cyberchefaudio]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

/* eslint-disable camelcase */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { makeEmptyReport, sniffContainer } from "../lib/AudioMetaSchema.mjs";
import {
    parseMp3, parseRiffWave, parseFlac, parseOgg,
    parseMp4BestEffort, parseAiffBestEffort,
    parseAacAdts, parseAc3, parseWmaAsf,
} from "../lib/AudioParsers.mjs";

/**
 * Extract Audio Metadata operation.
 */
class ExtractAudioMetadata extends Operation {
    /** Creates the Extract Audio Metadata operation. */
    constructor() {
        super();

        this.name = "Extract Audio Metadata";
        this.module = "Default";
        this.description =
            "Extract common audio metadata across MP3 (ID3v2/ID3v1/GEOB), WAV/BWF/BW64 (INFO/bext/iXML/axml), FLAC (Vorbis Comment/Picture), OGG (Vorbis/OpusTags), AAC (ADTS), AC3 (Dolby Digital), WMA (ASF), plus best-effort MP4/M4A and AIFF scanning. Outputs normalized JSON.";
        this.infoURL = "https://wikipedia.org/wiki/Audio_file_format";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.presentType = "html";

        this.args = [
            { name: "Filename (optional)", type: "string", value: "" },
            { name: "Max embedded text bytes (iXML/axml/etc)", type: "number", value: 1024 * 512 },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {Object}
     */
    run(input, args) {
        const filename = (args?.[0] || "").trim() || null;
        const maxTextBytes = Number.isFinite(args?.[1]) ? Math.max(1024, args[1]) : 1024 * 512;

        if (!(input instanceof ArrayBuffer) || input.byteLength === 0)
            throw new OperationError("No input data. Load an audio file (drag/drop or use the open file button).");

        const bytes = new Uint8Array(input);
        const container = sniffContainer(bytes);
        const report = makeEmptyReport(filename, bytes.length, container);

        try {
            const parsers = {
                mp3: () => parseMp3(bytes, report, maxTextBytes),
                wav: () => parseRiffWave(bytes, report, maxTextBytes),
                bw64: () => parseRiffWave(bytes, report, maxTextBytes),
                flac: () => parseFlac(bytes, report, maxTextBytes),
                ogg: () => parseOgg(bytes, report),
                opus: () => parseOgg(bytes, report),
                mp4: () => parseMp4BestEffort(bytes, report),
                m4a: () => parseMp4BestEffort(bytes, report),
                aiff: () => parseAiffBestEffort(bytes, report, maxTextBytes),
                aac: () => parseAacAdts(bytes, report),
                ac3: () => parseAc3(bytes, report),
                wma: () => parseWmaAsf(bytes, report),
            };
            if (parsers[container.type]) {
                parsers[container.type]();
            } else {
                report.errors.push({ stage: "sniff", message: "Unknown/unsupported container (best-effort scan not implemented)." });
            }
        } catch (e) {
            report.errors.push({ stage: "parse", message: String(e?.message || e) });
        }

        return compactReport(report);
    }

    /** Renders the extracted metadata as an HTML table. */
    present(data) {
        if (!data || typeof data !== "object") return JSON.stringify(data, null, 4);

        const esc = Utils.escapeHtml;
        const formatValue = (v) => {
            if (v === null) return "null";
            if (v === undefined) return "";
            if (typeof v === "object") return JSON.stringify(v);
            return String(v);
        };
        const renderValue = (v) => {
            const formatted = formatValue(v);
            const escaped = esc(formatted);
            if (formatted.includes("\n")) {
                return `<pre style="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;margin:0">${escaped}</pre>`;
            }
            return formatted.length > 120 ?
                `<span style="overflow-wrap:anywhere;word-break:break-word">${escaped}</span>` :
                escaped;
        };
        const row = (k, v) => `<tr><td>${esc(String(k))}</td><td>${renderValue(v)}</td></tr>`;
        const section = (title) => `<tr><th colspan="2" style="background:#e9ecef;text-align:center">${esc(title)}</th></tr>`;
        const objRows = (obj, filter = (v) => v !== null) => {
            for (const [k, v] of Object.entries(obj)) {
                if (filter(v)) html += row(k, v);
            }
        };
        const objSection = (obj, title, filter) => {
            if (!obj) return;
            html += section(title);
            objRows(obj, filter);
        };
        const listSection = (arr, title, fmt) => {
            if (!arr?.length) return;
            html += section(title);
            for (const item of arr) html += fmt(item);
        };
        const stripRoot = (path) => path.replace(/^\$\.?/, "");
        const fieldKey = (prefix, path) => {
            const fieldPath = stripRoot(path);
            return fieldPath ? `${prefix}.${fieldPath}` : prefix;
        };
        const summarizeGeob = (geob) => {
            const summary = {
                mimeType: geob.mimeType || null,
                filename: geob.filename || null,
                description: geob.description || null,
                object_bytes: geob.object_bytes ?? 0,
            };

            if (geob.object_json !== undefined) {
                summary.object_json = geob.object_json;
            } else if (geob.object_jumbf) {
                summary.object_jumbf = geob.object_jumbf;
            } else if (geob.object_text) {
                summary.object_text = geob.object_text;
                if (geob.object_text_truncated) summary.object_text_truncated = true;
            } else if (geob.object_hex_preview) {
                summary.object_hex_preview = geob.object_hex_preview;
            }

            if (geob.object_truncated) summary.object_truncated = true;
            return summary;
        };
        const summarizeJumbfBox = (box) => {
            const desc = box.description || {};
            const payload = box.payload_type ?
                `${String(box.payload_type).toUpperCase()} ${box.decoded ? "decoded" : "not decoded"}` :
                box.data_hex_preview ? "binary preview" : null;
            return [
                box.type_name || box.type,
                desc.content_type ? `content: ${desc.content_type}` : null,
                desc.content_type_code ? `code: ${desc.content_type_code}` : null,
                `${(box.size || 0).toLocaleString()} bytes`,
                `offset: ${box.offset ?? "unknown"}`,
                box.payload_bytes !== undefined ? `payload: ${(box.payload_bytes || 0).toLocaleString()} bytes` : null,
                box.bytes_read !== undefined ? `read: ${(box.bytes_read || 0).toLocaleString()} bytes` : null,
                box.trailing_bytes ? `trailing: ${(box.trailing_bytes || 0).toLocaleString()} bytes` : null,
                box.warning ? `warning: ${box.warning}` : null,
                payload,
                `path: ${box.path}`,
            ].filter(Boolean).join(" | ");
        };
        const collectJumbfBoxes = (boxes, depth = 0, rows = []) => {
            for (const box of boxes || []) {
                rows.push({ depth, box });
                if (box.children?.length) collectJumbfBoxes(box.children, depth + 1, rows);
            }
            return rows;
        };
        const flattenFields = (value, path = "", rows = []) => {
            if (value === null || value === undefined || typeof value !== "object") {
                rows.push({ path: path || "value", value });
                return rows;
            }

            if (Array.isArray(value)) {
                if (!value.length) rows.push({ path: path || "value", value: [] });
                value.forEach((item, i) => flattenFields(item, `${path || "value"}[${i}]`, rows));
                return rows;
            }

            const entries = Object.entries(value);
            if (!entries.length) rows.push({ path: path || "value", value: {} });
            for (const [key, child] of entries) flattenFields(child, path ? `${path}.${key}` : key, rows);
            return rows;
        };

        let html = `<table class="table table-hover table-sm table-bordered" style="table-layout:fixed;width:100%;border-collapse:collapse;margin:0">`;
        html += `<colgroup><col style="width:28%"><col style="width:72%"></colgroup>`;

        html += section("Artifact");
        html += row("Filename", data.artifact?.filename || "(none)");
        html += row("Size", `${(data.artifact?.byte_length ?? 0).toLocaleString()} bytes`);
        html += row("Container", data.artifact?.container?.type);
        html += row("MIME", data.artifact?.container?.mime);
        if (data.artifact?.container?.brand) html += row("Brand", data.artifact.container.brand);

        html += section("Detections");
        html += row("Metadata systems", (data.detections?.metadata_systems || []).join(", ") || "None");
        html += row("Provenance systems", (data.detections?.provenance_systems || []).join(", ") || "None");
        html += row("Metadata sources", (data.detections?.metadata_sources || []).join(", ") || "None");

        const common = data.tags?.common || {};
        html += section("Common Tags");
        if (Object.values(common).some((v) => v !== null)) {
            for (const [key, val] of Object.entries(common)) {
                if (val !== null) html += row(key.charAt(0).toUpperCase() + key.slice(1), val);
            }
        } else {
            html += row("(none)", "No common tags found");
        }

        const id3v2Frames = data.tags?.raw?.id3v2?.frames || [];
        const geobFrames = id3v2Frames.filter((f) => f.geob);
        const displayId3v2Frames = id3v2Frames.filter((f) => !isC2paCarrierFrame(f));
        const displayGeobFrames = geobFrames.filter((f) => !isC2paCarrierFrame(f));

        objSection(data.tags?.raw?.id3v2?.header, "ID3v2 Header");
        listSection(displayId3v2Frames, "ID3v2 Frames", (f) => {
            const val = f.geob ? summarizeGeob(f.geob) : f.decoded ?? `(${f.size} bytes)`;
            return row(f.id + (f.description ? ` \u2014 ${f.description}` : ""), val);
        });
        listSection(displayGeobFrames, "ID3v2 GEOB Objects", (f) =>
            row(f.geob.filename || f.geob.description || f.geob.mimeType || f.id, summarizeGeob(f.geob)));
        for (const f of displayGeobFrames.filter((frame) => frame.geob?.object_json !== undefined)) {
            html += section("ID3v2 GEOB Decoded Fields");
            const prefix = f.geob.filename || f.geob.description || f.id;
            for (const field of flattenFields(f.geob.object_json))
                html += row(fieldKey(prefix, field.path), field.value);
        }
        listSection(data.tags?.raw?.id3v2?.apic, "ID3v2 Attached Pictures", (f) =>
            row(f.description || f.picture_type_name || f.mime_type || "(picture)", f));
        listSection(data.tags?.raw?.id3v2?.priv, "ID3v2 Private Frames", (f) => row(f.owner_identifier || "(no owner)", f));
        listSection(data.tags?.raw?.id3v2?.ufid, "ID3v2 Unique File IDs", (f) => row(f.owner_identifier || "(no owner)", f));
        listSection(data.tags?.raw?.id3v2?.wxxx, "ID3v2 User URLs", (f) => row(f.description || "(no description)", f.url));
        listSection(data.tags?.raw?.id3v2?.urls, "ID3v2 URL Frames", (f) =>
            row(f.frame_id + (f.description ? ` \u2014 ${f.description}` : ""), f.url));
        listSection(data.tags?.raw?.id3v2?.uslt, "ID3v2 Lyrics/Text", (f) => row(f.description || f.language || "(lyrics)", f));
        listSection(data.tags?.raw?.id3v2?.popm, "ID3v2 Popularimeters", (f) => row(f.email || "(no email)", f));
        objSection(data.tags?.raw?.id3v1, "ID3v1", (v) => !!v);
        listSection(data.tags?.raw?.apev2?.items, "APEv2 Tags", (i) => row(i.key, i.value));

        if (data.tags?.raw?.vorbis_comments?.comments?.length) {
            html += section("Vorbis Comments");
            html += row("Vendor", data.tags.raw.vorbis_comments.vendor);
            for (const c of data.tags.raw.vorbis_comments.comments) html += row(c.key, c.value);
        }

        objSection(data.tags?.raw?.riff?.info, "RIFF INFO", () => true);
        objSection(data.tags?.raw?.riff?.bext, "BWF bext");
        listSection(data.tags?.raw?.riff?.chunks, "RIFF Chunks", (c) => row(c.id, `${c.size} bytes @ offset ${c.offset}`));
        listSection(data.tags?.raw?.flac?.blocks, "FLAC Metadata Blocks", (b) => row(b.type, `${b.length} bytes`));

        if (data.tags?.raw?.mp4?.top_level_atoms?.length) {
            html += section("MP4 Top-Level Atoms");
            const atoms = data.tags.raw.mp4.top_level_atoms;
            for (const a of atoms.slice(0, 50)) {
                const truncation = a.truncated ? ` (truncated; ${a.available_size} bytes available)` : "";
                html += row(a.type, `${a.size} bytes @ offset ${a.offset}${truncation}`);
            }
            if (atoms.length > 50) html += row("...", `${atoms.length - 50} more atoms`);
        }
        listSection(data.tags?.raw?.mp4?.ilst_items, "MP4 Metadata Items", (i) => row(i.key, i));

        listSection(data.tags?.raw?.aiff?.chunks, "AIFF Chunks", (c) => row(c.id, c.value));
        objSection(data.tags?.raw?.aac, "AAC ADTS");
        objSection(data.tags?.raw?.ac3, "AC3 (Dolby Digital)");
        objSection(data.tags?.raw?.asf?.content_description, "ASF Content Description", (v) => !!v);
        listSection(data.tags?.raw?.asf?.extended_content, "ASF Extended Content", (d) => row(d.name, d.value));
        listSection(data.embedded, "Embedded Objects", (e) =>
            row(e.id, `${e.source || "unknown"} | ${e.content_type || "unknown"} | ${(e.byte_length ?? 0).toLocaleString()} bytes${e.description ? ` | ${e.description}` : ""}`));

        if (data.metadata_sources?.elevenlabs?.present) {
            html += section("ElevenLabs Metadata Source");
            for (const entry of (data.metadata_sources.elevenlabs.entries || []))
                html += row(entry.source, entry.metadata);
        }

        if (data.provenance?.c2pa) {
            html += section("C2PA Provenance");
            if (data.provenance.c2pa.carrier) {
                for (const [key, value] of Object.entries(data.provenance.c2pa.carrier))
                    html += row(`Carrier ${key}`, value);
            }
            if (data.provenance.c2pa.manifest_store?.active_manifest_urn)
                html += row("Active manifest", data.provenance.c2pa.manifest_store.active_manifest_urn);
            if (data.provenance.c2pa.jumbf) {
                const jumbf = data.provenance.c2pa.jumbf;
                html += section("C2PA/JUMBF Structure");
                html += row("Summary", [
                    `format: ${jumbf.format}`,
                    `${(jumbf.box_count || 0).toLocaleString()} boxes`,
                    `labels: ${(jumbf.labels || []).join(" > ") || "none"}`,
                    jumbf.truncated ? "truncated" : "complete",
                ].join(" | "));
                for (const item of collectJumbfBoxes(jumbf.boxes)) {
                    const label = item.box.description?.label || item.box.type || "box";
                    html += row(`${"> ".repeat(item.depth)}${label}`, summarizeJumbfBox(item.box));
                }
            }
            if (data.provenance.c2pa.assertions?.length) {
                html += row("Assertions", data.provenance.c2pa.assertions.length);
                for (const assertion of data.provenance.c2pa.assertions) {
                    html += section(`C2PA Assertion: ${assertion.label || assertion.type || "unknown"}`);
                    html += row("Type", assertion.type);
                    html += row("Source", assertion.source);
                    for (const field of flattenFields(assertion.value))
                        html += row(field.path, field.value);
                }
            }
        }

        listSection(data.errors, "Errors", (e) => row(e.stage, e.message));

        html += "</table>";
        return html;
    }
}

/** Removes empty/default placeholders so output contains extracted metadata only. */
function compactReport(report) {
    if (report.provenance?.c2pa && !report.provenance.c2pa.present) {
        delete report.provenance.c2pa;
    } else if (report.provenance?.c2pa) {
        delete report.provenance.c2pa.present;
    }
    compactId3v2(report);
    return pruneEmpty(report) || {};
}

/** Compacts parser diagnostics and carrier-only C2PA frames in final ID3v2 output. */
function compactId3v2(report) {
    const id3v2 = report.tags?.raw?.id3v2;
    if (!id3v2) return;

    if (id3v2.header && !id3v2.header.extended_header) delete id3v2.header;
    if (!Array.isArray(id3v2.frames)) return;

    id3v2.frames = id3v2.frames
        .map((frame) => {
            const compact = { ...frame };
            if (isTypedId3v2Frame(compact)) delete compact.decoded;
            if (isC2paCarrierFrame(compact)) {
                compact.geob = {
                    mimeType: compact.geob?.mimeType || null,
                    filename: compact.geob?.filename || null,
                    description: compact.geob?.description || null,
                    object_bytes: compact.geob?.object_bytes ?? null,
                };
            }
            return compact;
        });
}

/** Returns true when the frame is already represented in a typed ID3v2 section. */
function isTypedId3v2Frame(frame) {
    return /^(APIC|PIC|PRIV|UFID|UFI|WXXX|WXX|USLT|ULT|POPM|POP)$/i.test(frame.id) ||
        (frame.id?.[0] === "W" && frame.id !== "WXX" && frame.id !== "WXXX");
}

/** Returns true for raw carrier frames whose decoded metadata is emitted under provenance.c2pa. */
function isC2paCarrierFrame(frame) {
    const mimeType = frame.geob?.mimeType || "";
    return !!frame.geob?.object_jumbf || /c2pa|jumbf/i.test(mimeType);
}

/** Recursively removes null, undefined, empty arrays, and empty objects. */
function pruneEmpty(value) {
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) {
        const items = value.map((item) => pruneEmpty(item)).filter((item) => item !== undefined);
        return items.length ? items : undefined;
    }
    if (typeof value === "object") {
        const result = {};
        for (const [key, child] of Object.entries(value)) {
            const pruned = pruneEmpty(child);
            if (pruned !== undefined) result[key] = pruned;
        }
        return Object.keys(result).length ? result : undefined;
    }
    return value;
}

export default ExtractAudioMetadata;
