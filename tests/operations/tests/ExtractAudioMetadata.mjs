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
