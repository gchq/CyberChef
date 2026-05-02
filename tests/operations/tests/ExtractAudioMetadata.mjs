/**
 * Extract Audio Metadata operation tests.
 *
 * @author d0s1nt
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import {
    MP3_HEX, WAV_HEX, FLAC_HEX, AAC_HEX,
    AC3_HEX, OGG_HEX, OPUS_HEX, WMA_HEX,
    M4A_HEX, AIFF_HEX
} from "../../samples/Audio.mjs";

const asciiBytes = (s) => Array.from(s, (ch) => ch.charCodeAt(0));
const utf16beBytes = (s) => Array.from(s, (ch) => {
    const code = ch.charCodeAt(0);
    return [code >> 8, code & 0xff];
}).flat();
const bytesToHex = (bytes) => bytes.map((x) => x.toString(16).padStart(2, "0")).join("");
const synchsafe = (n) => [(n >> 21) & 0x7f, (n >> 14) & 0x7f, (n >> 7) & 0x7f, n & 0x7f];
const id3v23Frame = (id, data) => [
    ...asciiBytes(id),
    (data.length >>> 24) & 0xff, (data.length >>> 16) & 0xff, (data.length >>> 8) & 0xff, data.length & 0xff,
    0x00, 0x00,
    ...data,
];
const id3v23Tag = (frames, flags = 0, prefix = []) => {
    const body = [...prefix, ...frames.flat()];
    return bytesToHex([...asciiBytes("ID3"), 0x03, 0x00, flags, ...synchsafe(body.length), ...body]);
};
const id3v22Frame = (id, data) => [
    ...asciiBytes(id),
    (data.length >>> 16) & 0xff, (data.length >>> 8) & 0xff, data.length & 0xff,
    ...data,
];
const id3v22Tag = (frames) => {
    const body = frames.flat();
    return bytesToHex([...asciiBytes("ID3"), 0x02, 0x00, 0x00, ...synchsafe(body.length), ...body]);
};
const be32 = (n) => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
const le32 = (n) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
const mp4Atom = (type, payload) => [...be32(payload.length + 8), ...asciiBytes(type), ...payload];
const mp4DataAtomTyped = (dataType, payload) => mp4Atom("data", [
    ...be32(dataType),
    0x00, 0x00, 0x00, 0x00,
    ...payload,
]);
const mp4DataAtom = (value) => mp4DataAtomTyped(1, asciiBytes(value));
const mp4TextChild = (type, value) => mp4Atom(type, [0x00, 0x00, 0x00, 0x00, ...asciiBytes(value)]);
const vorbisCommentBytes = (vendor, comments) => [
    ...le32(vendor.length), ...asciiBytes(vendor),
    ...le32(comments.length),
    ...comments.flatMap((comment) => [...le32(comment.length), ...asciiBytes(comment)]),
];
const cborText = (s) => s.length < 24 ? [0x60 + s.length, ...asciiBytes(s)] : [0x78, s.length, ...asciiBytes(s)];
const cborMap = (entries) => [
    0xa0 + entries.length,
    ...entries.flatMap(([key, value]) => [...cborText(key), ...(typeof value === "string" ? cborText(value) : value)]),
];
const c2paContentTypeUuid = (code) => [...asciiBytes(code), 0x00, 0x11, 0x00, 0x10, 0x80, 0x00, 0x00, 0xaa, 0x00, 0x38, 0x9b, 0x71];
const jumbfDescription = (label, contentType = "c2pa") => mp4Atom("jumd", [...c2paContentTypeUuid(contentType), 0x03, ...asciiBytes(label), 0x00]);
const jumbfSuperbox = (label, children, contentType = "c2pa") => mp4Atom("jumb", [...jumbfDescription(label, contentType), ...children.flat()]);
const ELEVENLABS_METADATA = JSON.stringify({
    provider: "ElevenLabs",
    "model_id": "eleven_multilingual_v2",
    "voice_id": "Rachel",
});
const ELEVENLABS_MP3_HEX = id3v23Tag([
    id3v23Frame("TXXX", [0x03, ...asciiBytes("elevenlabs_metadata"), 0x00, ...asciiBytes(ELEVENLABS_METADATA)]),
    id3v23Frame("PRIV", [...asciiBytes("com.elevenlabs.metadata"), 0x00, ...asciiBytes(ELEVENLABS_METADATA)]),
]);
const ENCODED_ELEVENLABS_BASE64 = "eyJwcm92aWRlciI6IkVsZXZlbkxhYnMiLCJ2b2ljZV9pZCI6IlJhY2hlbCJ9";
const ENCODED_ELEVENLABS_HEX = "7b2270726f7669646572223a22456c6576656e4c616273222c22766f6963655f6964223a2252616368656c227d";
const ENCODED_ELEVENLABS_MP3_HEX = id3v23Tag([
    id3v23Frame("TXXX", [0x03, ...asciiBytes("base64_metadata"), 0x00, ...asciiBytes(ENCODED_ELEVENLABS_BASE64)]),
    id3v23Frame("TXXX", [0x03, ...asciiBytes("hex_metadata"), 0x00, ...asciiBytes(ENCODED_ELEVENLABS_HEX)]),
]);
const STANDARD_TEXT_ELEVENLABS_MP3_HEX = id3v23Tag([
    id3v23Frame("TIT2", [0x03, ...asciiBytes("ElevenLabs Standard Text")]),
]);
const GEOB_ELEVENLABS_MP3_HEX = id3v23Tag([
    id3v23Frame("GEOB", [
        0x03, ...asciiBytes("application/json"), 0x00,
        ...asciiBytes("metadata.json"), 0x00,
        ...asciiBytes("ElevenLabs object"), 0x00,
        ...asciiBytes(ELEVENLABS_METADATA),
    ]),
]);
const C2PA_JUMBF_GEOB_MP3_HEX = id3v23Tag([
    id3v23Frame("GEOB", [
        0x03, ...asciiBytes("application/x-c2pa-manifest-store"), 0x00,
        ...asciiBytes("c2pa"), 0x00,
        ...asciiBytes("c2pa manifest store"), 0x00,
        ...jumbfSuperbox("c2pa", [
            jumbfSuperbox("urn:c2pa:test-manifest", [
                jumbfSuperbox("c2pa.assertions", [
                    jumbfSuperbox("c2pa.actions.v2", [
                        mp4Atom("cbor", cborMap([
                            ["softwareAgent", "ElevenLabs"],
                            ["digitalSourceType", "trainedAlgorithmicMedia"],
                        ])),
                    ], "cbor"),
                    jumbfSuperbox("stds.schema-org.CreativeWork", [
                        mp4Atom("json", asciiBytes(JSON.stringify({ "claim_generator": "ElevenLabs Test Generator" }))),
                    ], "json"),
                ]),
            ]),
        ]),
    ]),
]);
const RICH_ID3_MP3_HEX = id3v23Tag([
    id3v23Frame("APIC", [0x03, ...asciiBytes("image/jpeg"), 0x00, 0x03, ...asciiBytes("Front cover"), 0x00, 0xff, 0xd8, 0xff, 0xdb, 0x00]),
    id3v23Frame("WOAR", asciiBytes("https://artist.example/profile")),
    id3v23Frame("USLT", [0x03, ...asciiBytes("eng"), ...asciiBytes("Transcript"), 0x00, ...asciiBytes("Hello lyric line")]),
    id3v23Frame("POPM", [...asciiBytes("user@example.com"), 0x00, 196, 0x00, 0x00, 0x00, 0x05]),
]);
const EXTENDED_HEADER_MP3_HEX = id3v23Tag([
    id3v23Frame("TIT2", [0x03, ...asciiBytes("Extended Header Song")]),
], 0x40, [
    ...be32(6),
    0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
]);
const ID3V22_MP3_HEX = id3v22Tag([
    id3v22Frame("TT2", [0x03, ...asciiBytes("Legacy Song")]),
    id3v22Frame("WAR", asciiBytes("https://legacy.example/artist")),
    id3v22Frame("PIC", [0x03, ...asciiBytes("JPG"), 0x03, ...asciiBytes("Legacy cover"), 0x00, 0xff, 0xd8, 0xff, 0xdb]),
]);
const ELEVENLABS_OGG_HEX = bytesToHex([
    ...asciiBytes("OggS"), 0x00, 0x00, 0x00, 0x00,
    ...asciiBytes("OpusTags"),
    ...vorbisCommentBytes("test-vendor", ["PROVIDER=ElevenLabs", "MODEL=eleven_multilingual_v2"]),
]);
const NESTED_M4A_HEX = bytesToHex([
    ...mp4Atom("ftyp", [...asciiBytes("M4A "), 0x00, 0x00, 0x02, 0x00, ...asciiBytes("M4A "), ...asciiBytes("isom")]),
    ...mp4Atom("moov", [
        ...mp4Atom("udta", [
            ...mp4Atom("meta", [
                0x00, 0x00, 0x00, 0x00,
                ...mp4Atom("ilst", [
                    ...mp4Atom("\xa9nam", [...mp4DataAtom("Nested Song")]),
                    ...mp4Atom("\xa9ART", [...mp4DataAtom("Nested Artist")]),
                ]),
            ]),
        ]),
    ]),
]);
const COVER_M4A_HEX = bytesToHex([
    ...mp4Atom("ftyp", [...asciiBytes("M4A "), 0x00, 0x00, 0x02, 0x00, ...asciiBytes("M4A "), ...asciiBytes("isom")]),
    ...mp4Atom("moov", [
        ...mp4Atom("udta", [
            ...mp4Atom("meta", [
                0x00, 0x00, 0x00, 0x00,
                ...mp4Atom("ilst", [
                    ...mp4Atom("covr", [...mp4DataAtomTyped(13, [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])]),
                ]),
            ]),
        ]),
    ]),
]);
const UTF16_M4A_HEX = bytesToHex([
    ...mp4Atom("ftyp", [...asciiBytes("M4A "), 0x00, 0x00, 0x02, 0x00, ...asciiBytes("M4A "), ...asciiBytes("isom")]),
    ...mp4Atom("moov", [
        ...mp4Atom("udta", [
            ...mp4Atom("meta", [
                0x00, 0x00, 0x00, 0x00,
                ...mp4Atom("ilst", [
                    ...mp4Atom("\xa9nam", [...mp4DataAtomTyped(2, utf16beBytes("UTF16 Song"))]),
                ]),
            ]),
        ]),
    ]),
]);
const RICH_M4A_HEX = bytesToHex([
    ...mp4Atom("ftyp", [...asciiBytes("M4A "), 0x00, 0x00, 0x02, 0x00, ...asciiBytes("M4A "), ...asciiBytes("isom")]),
    ...mp4Atom("moov", [
        ...mp4Atom("udta", [
            ...mp4Atom("meta", [
                0x00, 0x00, 0x00, 0x00,
                ...mp4Atom("ilst", [
                    ...mp4Atom("trkn", [...mp4DataAtomTyped(0, [0x00, 0x00, 0x00, 0x02, 0x00, 0x09, 0x00, 0x00])]),
                    ...mp4Atom("tmpo", [...mp4DataAtomTyped(21, [0x78])]),
                    ...mp4Atom("covr", [...mp4DataAtomTyped(14, [0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00, 0x00])]),
                    ...mp4Atom("----", [
                        ...mp4TextChild("mean", "com.apple.iTunes"),
                        ...mp4TextChild("name", "ELEVENLABS_METADATA"),
                        ...mp4DataAtom(ELEVENLABS_METADATA),
                    ]),
                ]),
            ]),
        ]),
    ]),
]);

TestRegister.addTests([
    // ---- MP3 ----
    {
        name: "Extract Audio Metadata: MP3 container and MIME",
        input: MP3_HEX,
        expectedMatch: /Container<\/td><td>mp3<\/td>.*MIME<\/td><td>audio\/mpeg<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 common tags (title, artist)",
        input: MP3_HEX,
        expectedMatch: /Title<\/td><td>Galway<\/td>.*Artist<\/td><td>Kevin MacLeod<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 ID3v2 frames (TIT2, TPE1, TSSE)",
        input: MP3_HEX,
        expectedMatch: /ID3v2 Frames.*TIT2.*Galway.*TPE1.*Kevin MacLeod.*TSSE.*Lavf56\.40\.101/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 detections (id3v2)",
        input: MP3_HEX,
        expectedMatch: /Metadata systems<\/td><td>id3v2<\/td>/,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 ElevenLabs private metadata",
        input: ELEVENLABS_MP3_HEX,
        expectedMatch: /Metadata sources<\/td><td>elevenlabs<\/td>.*ID3v2 Private Frames.*com\.elevenlabs\.metadata.*model_id.*eleven_multilingual_v2.*ElevenLabs Metadata Source.*id3v2:TXXX.*value_json.*id3v2:PRIV.*data_json.*voice_id.*Rachel/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["elevenlabs.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 encoded hex/base64 text metadata",
        input: ENCODED_ELEVENLABS_MP3_HEX,
        expectedMatch: /Metadata sources<\/td><td>elevenlabs<\/td>.*base64_metadata.*value_decoded.*encoding.*base64.*text.*provider.*ElevenLabs.*json.*voice_id.*Rachel.*hex_metadata.*value_decoded.*encoding.*hex.*text.*provider.*ElevenLabs.*json.*voice_id.*Rachel/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["encoded-elevenlabs.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 ElevenLabs standard text metadata",
        input: STANDARD_TEXT_ELEVENLABS_MP3_HEX,
        expectedMatch: /Metadata sources<\/td><td>elevenlabs<\/td>.*Title<\/td><td>ElevenLabs Standard Text<\/td>.*ElevenLabs Metadata Source.*id3v2:TIT2.*ElevenLabs Standard Text/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["elevenlabs-text.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 GEOB JSON metadata",
        input: GEOB_ELEVENLABS_MP3_HEX,
        expectedMatch: /Metadata sources<\/td><td>elevenlabs<\/td>.*ID3v2 Frames.*GEOB.*object_bytes.*object_json.*model_id.*eleven_multilingual_v2.*ID3v2 GEOB Objects.*metadata\.json.*ElevenLabs Metadata Source.*id3v2:GEOB.*voice_id.*Rachel/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["geob-elevenlabs.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 GEOB C2PA JUMBF metadata",
        input: C2PA_JUMBF_GEOB_MP3_HEX,
        expectedMatch: /^(?=[\s\S]*Provenance systems<\/td><td>c2pa<\/td>)(?=[\s\S]*Metadata sources<\/td><td>None<\/td>)(?=[\s\S]*C2PA Provenance)(?=[\s\S]*Carrier source<\/td><td>id3v2:GEOB<\/td>)(?=[\s\S]*Carrier content_type<\/td><td>application\/x-c2pa-manifest-store<\/td>)(?=[\s\S]*Carrier filename<\/td><td>c2pa<\/td>)(?=[\s\S]*Carrier description<\/td><td>c2pa manifest store<\/td>)(?=[\s\S]*Carrier byte_length<\/td><td>\d+<\/td>)(?=[\s\S]*Active manifest<\/td><td>urn:c2pa:test-manifest<\/td>)(?=[\s\S]*C2PA\/JUMBF Structure)(?=[\s\S]*JUMBF superbox)(?=[\s\S]*Assertions<\/td><td>2<\/td>)(?=[\s\S]*C2PA Assertion: c2pa\.actions\.v2)(?=[\s\S]*Source<\/td><td>jumb\[0\]\.jumb\[1\]\.jumb\[1\]\.jumb\[1\]\.cbor\[1\]<\/td>)(?=[\s\S]*softwareAgent<\/td><td>ElevenLabs<\/td>)(?=[\s\S]*digitalSourceType<\/td><td>trainedAlgorithmicMedia<\/td>)(?=[\s\S]*C2PA Assertion: stds\.schema-org\.CreativeWork)(?=[\s\S]*claim_generator<\/td><td>ElevenLabs Test Generator<\/td>)(?=[\s\S]*urn:c2pa:test-manifest)(?=[\s\S]*cbor)[\s\S]*$/,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["c2pa-jumbf.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 C2PA output avoids decoded payload duplication",
        input: C2PA_JUMBF_GEOB_MP3_HEX,
        unexpectedMatch: /C2PA\/JUMBF Summary|ID3v2 GEOB Objects|GEOB \u2014 General encapsulated object|object_jumbf|decoded_payloads|object_hex_preview/,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["c2pa-jumbf.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 structured ID3v2 metadata families",
        input: RICH_ID3_MP3_HEX,
        expectedMatch: /ID3v2 Attached Pictures.*image\/jpeg.*Cover \(front\).*image_length.*5.*ID3v2 URL Frames.*WOAR.*https:\/\/artist\.example\/profile.*ID3v2 Lyrics\/Text.*language.*eng.*Hello lyric line.*text_bytes.*16.*ID3v2 Popularimeters.*user@example\.com.*rating.*196.*counter.*5.*Embedded Objects.*id3v2:APIC.*image\/jpeg/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["rich-id3.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 ID3v2 extended header",
        input: EXTENDED_HEADER_MP3_HEX,
        expectedMatch: /Title<\/td><td>Extended Header Song<\/td>.*ID3v2 Header.*extended_header.*size.*6.*ID3v2 Frames.*TIT2.*Extended Header Song/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["extended-header.mp3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: MP3 ID3v2.2 legacy metadata",
        input: ID3V22_MP3_HEX,
        expectedMatch: /Title<\/td><td>Legacy Song<\/td>.*ID3v2 Frames.*TT2.*Legacy Song.*PIC.*Attached picture.*ID3v2 Attached Pictures.*Legacy cover.*image\/jpeg.*ID3v2 URL Frames.*WAR.*https:\/\/legacy\.example\/artist.*Embedded Objects.*id3v2:PIC/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["legacy-id3v22.mp3", 524288] }
        ]
    },

    // ---- WAV ----
    {
        name: "Extract Audio Metadata: WAV container and MIME",
        input: WAV_HEX,
        expectedMatch: /Container<\/td><td>wav<\/td>.*MIME<\/td><td>audio\/wav<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.wav", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: WAV RIFF chunks (fmt)",
        input: WAV_HEX,
        expectedMatch: /RIFF Chunks.*fmt .*16 bytes @ offset 20/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.wav", 524288] }
        ]
    },

    // ---- FLAC ----
    {
        name: "Extract Audio Metadata: FLAC container and common tags",
        input: FLAC_HEX,
        expectedMatch: /Container<\/td><td>flac<\/td>.*Title<\/td><td>Galway<\/td>.*Artist<\/td><td>Kevin MacLeod<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.flac", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: FLAC metadata blocks (STREAMINFO, VORBIS_COMMENT)",
        input: FLAC_HEX,
        expectedMatch: /FLAC Metadata Blocks.*STREAMINFO<\/td><td>34 bytes<\/td>.*VORBIS_COMMENT<\/td><td>86 bytes<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.flac", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: FLAC Vorbis comments (vendor, tags)",
        input: FLAC_HEX,
        expectedMatch: /Vorbis Comments.*Vendor<\/td><td>Lavf56\.40\.101<\/td>.*TITLE<\/td><td>Galway<\/td>.*ARTIST<\/td><td>Kevin MacLeod<\/td>.*ENCODER<\/td><td>Lavf56\.40\.101<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.flac", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: FLAC detections",
        input: FLAC_HEX,
        expectedMatch: /Metadata systems<\/td><td>flac_metablocks, vorbis_comments<\/td>/,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.flac", 524288] }
        ]
    },

    // ---- AAC ----
    {
        name: "Extract Audio Metadata: AAC container and MIME",
        input: AAC_HEX,
        expectedMatch: /Container<\/td><td>aac<\/td>.*MIME<\/td><td>audio\/aac<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.aac", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: AAC ADTS technical fields",
        input: AAC_HEX,
        expectedMatch: /AAC ADTS.*mpeg_version<\/td><td>MPEG-4<\/td>.*profile<\/td><td>LC<\/td>.*sample_rate<\/td><td>44100<\/td>.*channel_description<\/td><td>stereo<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.aac", 524288] }
        ]
    },

    // ---- AC3 ----
    {
        name: "Extract Audio Metadata: AC3 container and MIME",
        input: AC3_HEX,
        expectedMatch: /Container<\/td><td>ac3<\/td>.*MIME<\/td><td>audio\/ac3<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.ac3", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: AC3 technical fields (sample rate, bitrate, channels)",
        input: AC3_HEX,
        expectedMatch: /AC3 \(Dolby Digital\).*sample_rate<\/td><td>44100<\/td>.*bitrate_kbps<\/td><td>192<\/td>.*channel_layout<\/td><td>2\.0 \(L R\)<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.ac3", 524288] }
        ]
    },

    // ---- OGG Vorbis ----
    {
        name: "Extract Audio Metadata: OGG container and common tags",
        input: OGG_HEX,
        expectedMatch: /Container<\/td><td>ogg<\/td>.*Title<\/td><td>Galway<\/td>.*Artist<\/td><td>Kevin MacLeod<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.ogg", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: OGG Vorbis comments (vendor, encoder)",
        input: OGG_HEX,
        expectedMatch: /Vorbis Comments.*Vendor<\/td><td>Lavf56\.40\.101<\/td>.*ENCODER<\/td><td>Lavc56\.60\.100 libvorbis<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.ogg", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: OGG ElevenLabs Vorbis provenance",
        input: ELEVENLABS_OGG_HEX,
        expectedMatch: /Metadata sources<\/td><td>elevenlabs<\/td>.*Vorbis Comments.*PROVIDER<\/td><td>ElevenLabs<\/td>.*MODEL<\/td><td>eleven_multilingual_v2<\/td>.*ElevenLabs Metadata Source.*ogg:VORBIS_COMMENT/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["elevenlabs.ogg", 524288] }
        ]
    },

    // ---- Opus ----
    {
        name: "Extract Audio Metadata: Opus container and common tags",
        input: OPUS_HEX,
        expectedMatch: /Container<\/td><td>opus<\/td>.*Title<\/td><td>Galway<\/td>.*Artist<\/td><td>Kevin MacLeod<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.opus", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: Opus Vorbis comments (vendor, encoder)",
        input: OPUS_HEX,
        expectedMatch: /Vorbis Comments.*Vendor<\/td><td>Lavf58\.19\.102<\/td>.*ENCODER<\/td><td>Lavc58\.34\.100 libopus<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.opus", 524288] }
        ]
    },

    // ---- WMA/ASF ----
    {
        name: "Extract Audio Metadata: WMA container and MIME",
        input: WMA_HEX,
        expectedMatch: /Container<\/td><td>wma<\/td>.*MIME<\/td><td>audio\/x-ms-wma<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.wma", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: WMA common tags (title, artist)",
        input: WMA_HEX,
        expectedMatch: /Title<\/td><td>Galway<\/td>.*Artist<\/td><td>Kevin MacLeod<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.wma", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: WMA ASF Content Description",
        input: WMA_HEX,
        expectedMatch: /ASF Content Description.*title<\/td><td>Galway<\/td>.*author<\/td><td>Kevin MacLeod<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.wma", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: WMA ASF Extended Content (encoding settings)",
        input: WMA_HEX,
        expectedMatch: /ASF Extended Content.*WM\/EncodingSettings<\/td><td>Lavf56\.40\.101<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.wma", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: WMA detections",
        input: WMA_HEX,
        expectedMatch: /Metadata systems<\/td><td>asf_header, asf_content_desc, asf_ext_content_desc<\/td>/,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.wma", 524288] }
        ]
    },

    // ---- M4A ----
    {
        name: "Extract Audio Metadata: M4A container, MIME and brand",
        input: M4A_HEX,
        expectedMatch: /Container<\/td><td>m4a<\/td>.*MIME<\/td><td>audio\/mp4<\/td>.*Brand<\/td><td>M4A <\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.m4a", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: M4A top-level atoms (ftyp, mdat)",
        input: M4A_HEX,
        expectedMatch: /MP4 Top-Level Atoms.*ftyp<\/td>.*mdat<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.m4a", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: M4A nested ilst metadata",
        input: NESTED_M4A_HEX,
        expectedMatch: /Metadata systems<\/td><td>mp4_atoms, mp4_ilst<\/td>.*Title<\/td><td>Nested Song<\/td>.*Artist<\/td><td>Nested Artist<\/td>.*MP4 Metadata Items.*\xA9nam.*Nested Song/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["nested.m4a", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: M4A cover art metadata",
        input: COVER_M4A_HEX,
        expectedMatch: /MP4 Metadata Items.*covr.*JPEG image.*Embedded Objects.*mp4:ilst:covr.*image\/jpeg.*6 bytes/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["cover.m4a", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: M4A UTF-16 ilst text metadata",
        input: UTF16_M4A_HEX,
        expectedMatch: /Title<\/td><td>UTF16 Song<\/td>.*MP4 Metadata Items.*UTF-16 text.*UTF16 Song/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["utf16.m4a", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: M4A rich ilst metadata",
        input: RICH_M4A_HEX,
        expectedMatch: /Metadata sources<\/td><td>elevenlabs<\/td>.*Track<\/td><td>2\/9<\/td>.*MP4 Metadata Items.*trkn.*2\/9.*tmpo.*Signed integer.*120.*covr.*PNG image.*ELEVENLABS_METADATA.*com\.apple\.iTunes.*Embedded Objects.*mp4:ilst:covr.*image\/png.*8 bytes.*ElevenLabs Metadata Source.*mp4:ilst:ELEVENLABS_METADATA/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["rich.m4a", 524288] }
        ]
    },

    // ---- AIFF ----
    {
        name: "Extract Audio Metadata: AIFF container, MIME and brand",
        input: AIFF_HEX,
        expectedMatch: /Container<\/td><td>aiff<\/td>.*MIME<\/td><td>audio\/aiff<\/td>.*Brand<\/td><td>AIFF<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.aiff", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: AIFF common tag (title from NAME chunk)",
        input: AIFF_HEX,
        expectedMatch: /Title<\/td><td>Galway<\/td>/,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.aiff", 524288] }
        ]
    },
    {
        name: "Extract Audio Metadata: AIFF chunks (NAME)",
        input: AIFF_HEX,
        expectedMatch: /AIFF Chunks.*NAME<\/td><td>Galway<\/td>/s,
        recipeConfig: [
            { op: "From Hex", args: ["None"] },
            { op: "Extract Audio Metadata", args: ["test.aiff", 524288] }
        ]
    },
]);
