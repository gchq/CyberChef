/**
 * File signatures and extractor functions
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */
import Stream from "./Stream.mjs";

/**
 * A categorised table of file types, including signatures to identify them and functions
 * to extract them where possible.
 */
export const FILE_SIGNATURES = {
    "Images": [
        {
            name: "Joint Photographic Experts Group image",
            extension: "jpg,jpeg,jpe,thm,mpo",
            mime: "image/jpeg",
            description: "",
            signature: {
                0: 0xff,
                1: 0xd8,
                2: 0xff,
                3: [0xc0, 0xc4, 0xdb, 0xdd, 0xe0, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe7, 0xe8, 0xea, 0xeb, 0xec, 0xed, 0xee, 0xfe]
            },
            extractor: extractJPEG
        },
        {
            name: "Graphics Interchange Format image",
            extension: "gif",
            mime: "image/gif",
            description: "",
            signature: {
                0: 0x47, // GIF
                1: 0x49,
                2: 0x46,
                3: 0x38, // 8
                4: [0x37, 0x39], // 7|9
                5: 0x61  // a
            },
            extractor: extractGIF
        },
        {
            name: "Portable Network Graphics image",
            extension: "png",
            mime: "image/png",
            description: "",
            signature: {
                0: 0x89,
                1: 0x50, // PNG
                2: 0x4e,
                3: 0x47,
                4: 0x0d,
                5: 0x0a,
                6: 0x1a,
                7: 0x0a
            },
            extractor: extractPNG
        },
        {
            name: "WEBP Image",
            extension: "webp",
            mime: "image/webp",
            description: "",
            signature: {
                8: 0x57,
                9: 0x45,
                10: 0x42,
                11: 0x50
            },
            extractor: null
        },
        {
            name: "Camera Image File Format",
            extension: "crw",
            mime: "image/x-canon-crw",
            description: "",
            signature: {
                6: 0x48, // HEAPCCDR
                7: 0x45,
                8: 0x41,
                9: 0x50,
                10: 0x43,
                11: 0x43,
                12: 0x44,
                13: 0x52
            },
            extractor: null
        },
        { // Place before tiff check
            name: "Canon CR2 raw image",
            extension: "cr2",
            mime: "image/x-canon-cr2",
            description: "",
            signature: [
                {
                    0: 0x49,
                    1: 0x49,
                    2: 0x2a,
                    3: 0x0,
                    8: 0x43,
                    9: 0x52
                },
                {
                    0: 0x4d,
                    1: 0x4d,
                    2: 0x0,
                    3: 0x2a,
                    8: 0x43,
                    9: 0x52
                }
            ],
            extractor: null
        },
        {
            name: "Tagged Image File Format image",
            extension: "tif",
            mime: "image/tiff",
            description: "",
            signature: [
                {
                    0: 0x49,
                    1: 0x49,
                    2: 0x2a,
                    3: 0x0
                },
                {
                    0: 0x4d,
                    1: 0x4d,
                    2: 0x0,
                    3: 0x2a
                }
            ],
            extractor: null
        },
        {
            name: "Bitmap image",
            extension: "bmp",
            mime: "image/bmp",
            description: "",
            signature: {
                0: 0x42,
                1: 0x4d,
                7: 0x0,
                9: 0x0,
                14: [0x0c, 0x28, 0x38, 0x40, 0x6c, 0x7c],
                15: 0x0,
                16: 0x0,
                17: 0x0
            },
            extractor: extractBMP
        },
        {
            name: "JPEG Extended Range image",
            extension: "jxr",
            mime: "image/vnd.ms-photo",
            description: "",
            signature: {
                0: 0x49,
                1: 0x49,
                2: 0xbc
            },
            extractor: null
        },
        {
            name: "Photoshop image",
            extension: "psd",
            mime: "image/vnd.adobe.photoshop",
            description: "",
            signature: {
                0: 0x38, // 8BPS
                1: 0x42,
                2: 0x50,
                3: 0x53,
                4: 0x0,
                5: 0x1,
                6: 0x0,
                7: 0x0,
                8: 0x0,
                9: 0x0,
                10: 0x0,
                11: 0x0
            },
            extractor: null
        },
        {
            name: "Photoshop Large Document",
            extension: "psb",
            mime: "application/x-photoshop",
            description: "",
            signature: {
                0: 0x38, // 8BPS
                1: 0x42,
                2: 0x50,
                3: 0x53,
                4: 0x0,
                5: 0x2,
                6: 0x0,
                7: 0x0,
                8: 0x0,
                9: 0x0,
                10: 0x0,
                11: 0x0,
                12: 0x0
            },
            extractor: null
        },
        {
            name: "Paint Shop Pro image",
            extension: "psp",
            mime: "image/psp",
            description: "",
            signature: [
                {
                    0: 0x50, // Paint Shop Pro Im
                    1: 0x61,
                    2: 0x69,
                    3: 0x6e,
                    4: 0x74,
                    5: 0x20,
                    6: 0x53,
                    7: 0x68,
                    8: 0x6f,
                    9: 0x70,
                    10: 0x20,
                    11: 0x50,
                    12: 0x72,
                    13: 0x6f,
                    14: 0x20,
                    15: 0x49,
                    16: 0x6d
                },
                {
                    0: 0x7e,
                    1: 0x42,
                    2: 0x4b,
                    3: 0x0
                }
            ],
            extractor: null
        },
        {
            name: "The GIMP image",
            extension: "xcf",
            mime: "image/x-xcf",
            description: "",
            signature: {
                0: 0x67, // gimp xcf
                1: 0x69,
                2: 0x6d,
                3: 0x70,
                4: 0x20,
                5: 0x78,
                6: 0x63,
                7: 0x66,
                8: 0x20,
                9: [0x66, 0x76],
                10: [0x69, 0x30],
                11: [0x6c, 0x30],
                12: [0x65, 0x31, 0x32, 0x33]
            },
            extractor: null
        },
        {
            name: "Icon image",
            extension: "ico",
            mime: "image/x-icon",
            description: "",
            signature: {
                0: 0x0,
                1: 0x0,
                2: 0x1,
                3: 0x0,
                4: [0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15],
                5: 0x0,
                6: [0x10, 0x20, 0x30, 0x40, 0x80],
                7: [0x10, 0x20, 0x30, 0x40, 0x80],
                9: 0x0,
                10: [0x0, 0x1]
            },
            extractor: null
        },
        {
            name: "Radiance High Dynamic Range image",
            extension: "hdr",
            mime: "image/vnd.radiance",
            description: "",
            signature: {
                0: 0x23, // #?RADIANCE
                1: 0x3f,
                2: 0x52,
                3: 0x41,
                4: 0x44,
                5: 0x49,
                6: 0x41,
                7: 0x4e,
                8: 0x43,
                9: 0x45,
                10: 0x0a
            },
            extractor: null
        },
        {
            name: "Sony ARW image",
            extension: "arw",
            mime: "image/x-raw",
            description: "",
            signature: {
                0: 0x05,
                1: 0x0,
                2: 0x0,
                3: 0x0,
                4: 0x41,
                5: 0x57,
                6: 0x31,
                7: 0x2e
            },
            extractor: null
        },
        {
            name: "Fujifilm Raw Image",
            extension: "raf",
            mime: "image/x-raw",
            description: "",
            signature: {
                0: 0x46, // FUJIFILMCCD-RAW
                1: 0x55,
                2: 0x4a,
                3: 0x49,
                4: 0x46,
                5: 0x49,
                6: 0x4c,
                7: 0x4d,
                8: 0x43,
                9: 0x43,
                10: 0x44,
                11: 0x2d,
                12: 0x52,
                13: 0x41,
                14: 0x57
            },
            extractor: null
        },
        {
            name: "Minolta RAW image",
            extension: "mrw",
            mime: "image/x-raw",
            description: "",
            signature: {
                0: 0x0,
                1: 0x4d, // MRM
                2: 0x52,
                3: 0x4d
            },
            extractor: null
        },
        {
            name: "Adobe Bridge Thumbnail Cache",
            extension: "bct",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x6c,
                1: 0x6e,
                2: 0x62,
                3: 0x74,
                4: 0x02,
                5: 0x0,
                6: 0x0,
                7: 0x0
            },
            extractor: null
        },
        {
            name: "Microsoft Document Imaging",
            extension: "mdi",
            mime: "image/vnd.ms-modi",
            description: "",
            signature: {
                0: 0x45,
                1: 0x50,
                2: 0x2a,
                3: 0x00
            },
            extractor: null
        },
        {
            name: "Joint Photographic Experts Group image (under Base64)",
            extension: "B64",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x2f,
                1: 0x39,
                2: 0x6a,
                3: 0x2f,
                4: 0x34
            },
            extractor: null
        },
        {
            name: "Portable Network Graphics image (under Base64)",
            extension: "B64",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x69,
                1: 0x56,
                2: 0x42,
                3: 0x4f,
                4: 0x52,
                5: 0x77,
                6: 0x30
            },
            extractor: null
        },
        {
            name: "AutoCAD Drawing",
            extension: "dwg,123d",
            mime: "application/acad",
            description: "",
            signature: {
                0: 0x41,
                1: 0x43,
                2: 0x31,
                3: 0x30,
                4: [0x30, 0x31],
                5: [0x30, 0x31, 0x32, 0x33, 0x34, 0x35],
                6: 0x00
            },
            extractor: null
        },
        {
            name: "AutoCAD Drawing",
            extension: "dwg,dwt",
            mime: "application/acad",
            description: "",
            signature: [
                {
                    0: 0x41,
                    1: 0x43,
                    2: 0x31,
                    3: 0x30,
                    4: 0x31,
                    5: 0x38,
                    6: 0x00
                },
                {
                    0: 0x41,
                    1: 0x43,
                    2: 0x31,
                    3: 0x30,
                    4: 0x32,
                    5: 0x34,
                    6: 0x00
                },
                {
                    0: 0x41,
                    1: 0x43,
                    2: 0x31,
                    3: 0x30,
                    4: 0x32,
                    5: 0x37,
                    6: 0x00
                }
            ],
            extractor: null
        },
    ],
    "Video": [
        { // Place before webm
            name: "Matroska Multimedia Container",
            extension: "mkv",
            mime: "video/x-matroska",
            description: "",
            signature: {
                31: 0x6d,
                32: 0x61,
                33: 0x74,
                34: 0x72,
                35: 0x6f,
                36: 0x73,
                37: 0x6b,
                38: 0x61
            },
            extractor: null
        },
        {
            name: "WEBM video",
            extension: "webm",
            mime: "video/webm",
            description: "",
            signature: {
                0: 0x1a,
                1: 0x45,
                2: 0xdf,
                3: 0xa3
            },
            extractor: null
        },
        { // Place before MPEG-4
            name: "Flash MP4 video",
            extension: "f4v",
            mime: "video/mp4",
            description: "",
            signature: {
                4: 0x66,
                5: 0x74,
                6: 0x79,
                7: 0x70,
                8: [0x66, 0x46],
                9: 0x34,
                10: [0x76, 0x56],
                11: 0x20
            },
            extractor: null
        },
        {
            name: "MPEG-4 video",
            extension: "mp4",
            mime: "video/mp4",
            description: "",
            signature: [
                {
                    0: 0x0,
                    1: 0x0,
                    2: 0x0,
                    3: [0x18, 0x20],
                    4: 0x66,
                    5: 0x74,
                    6: 0x79,
                    7: 0x70
                },
                {
                    0: 0x33, // 3gp5
                    1: 0x67,
                    2: 0x70,
                    3: 0x35
                },
                {
                    0: 0x0,
                    1: 0x0,
                    2: 0x0,
                    3: 0x1c,
                    4: 0x66,
                    5: 0x74,
                    6: 0x79,
                    7: 0x70,
                    8: 0x6d,
                    9: 0x70,
                    10: 0x34,
                    11: 0x32,
                    16: 0x6d, // mp41mp42isom
                    17: 0x70,
                    18: 0x34,
                    19: 0x31,
                    20: 0x6d,
                    21: 0x70,
                    22: 0x34,
                    23: 0x32,
                    24: 0x69,
                    25: 0x73,
                    26: 0x6f,
                    27: 0x6d
                }
            ],
            extractor: null
        },
        {
            name: "M4V video",
            extension: "m4v",
            mime: "video/x-m4v",
            description: "",
            signature: {
                0: 0x0,
                1: 0x0,
                2: 0x0,
                3: 0x1c,
                4: 0x66,
                5: 0x74,
                6: 0x79,
                7: 0x70,
                8: 0x4d,
                9: 0x34,
                10: 0x56
            },
            extractor: null
        },
        {
            name: "Quicktime video",
            extension: "mov",
            mime: "video/quicktime",
            description: "",
            signature: {
                0: 0x0,
                1: 0x0,
                2: 0x0,
                3: 0x14,
                4: 0x66,
                5: 0x74,
                6: 0x79,
                7: 0x70
            },
            extractor: null
        },
        {
            name: "Audio Video Interleave",
            extension: "avi",
            mime: "video/x-msvideo",
            description: "",
            signature: {
                0: 0x52,
                1: 0x49,
                2: 0x46,
                3: 0x46,
                8: 0x41,
                9: 0x56,
                10: 0x49
            },
            extractor: null
        },
        {
            name: "Windows Media Video",
            extension: "wmv",
            mime: "video/x-ms-wmv",
            description: "",
            signature: {
                0: 0x30,
                1: 0x26,
                2: 0xb2,
                3: 0x75,
                4: 0x8e,
                5: 0x66,
                6: 0xcf,
                7: 0x11,
                8: 0xa6,
                9: 0xd9
            },
            extractor: null
        },
        {
            name: "MPEG video",
            extension: "mpg",
            mime: "video/mpeg",
            description: "",
            signature: {
                0: 0x0,
                1: 0x0,
                2: 0x1,
                3: 0xba
            },
            extractor: null
        },
        {
            name: "Flash Video",
            extension: "flv",
            mime: "video/x-flv",
            description: "",
            signature: {
                0: 0x46,
                1: 0x4c,
                2: 0x56,
                3: 0x1
            },
            extractor: extractFLV
        },
        {
            name: "OGG Video",
            extension: "ogv,ogm,opus,ogx",
            mime: "video/ogg",
            description: "",
            signature: [
                {
                    0: 0x4f, // OggS
                    1: 0x67,
                    2: 0x67,
                    3: 0x53,
                    4: 0x00,
                    5: 0x02,
                    28: 0x01,
                    29: 0x76, // video
                    30: 0x69,
                    31: 0x64,
                    32: 0x65,
                    33: 0x6f
                },
                {
                    0: 0x4f, // OggS
                    1: 0x67,
                    2: 0x67,
                    3: 0x53,
                    4: 0x00,
                    5: 0x02,
                    28: 0x80,
                    29: 0x74, // theora
                    30: 0x68,
                    31: 0x65,
                    32: 0x6f,
                    33: 0x72,
                    34: 0x61
                },
                {
                    0: 0x4f, // OggS
                    1: 0x67,
                    2: 0x67,
                    3: 0x53,
                    4: 0x00,
                    5: 0x02,
                    28: 0x66, // fishead
                    29: 0x69,
                    30: 0x73,
                    31: 0x68,
                    32: 0x65,
                    33: 0x61,
                    34: 0x64
                }
            ],
            extractor: null
        },
    ],
    "Audio": [
        {
            name: "Waveform Audio",
            extension: "wav",
            mime: "audio/x-wav",
            description: "",
            signature: {
                0: 0x52,
                1: 0x49,
                2: 0x46,
                3: 0x46,
                8: 0x57,
                9: 0x41,
                10: 0x56,
                11: 0x45
            },
            extractor: null
        },
        {
            name: "OGG audio",
            extension: "ogg",
            mime: "audio/ogg",
            description: "",
            signature: {
                0: 0x4f,
                1: 0x67,
                2: 0x67,
                3: 0x53
            },
            extractor: null
        },
        {
            name: "Musical Instrument Digital Interface audio",
            extension: "midi",
            mime: "audio/midi",
            description: "",
            signature: {
                0: 0x4d,
                1: 0x54,
                2: 0x68,
                3: 0x64
            },
            extractor: null
        },
        {
            name: "MPEG-3 audio",
            extension: "mp3",
            mime: "audio/mpeg",
            description: "",
            signature: [
                {
                    0: 0x49,
                    1: 0x44,
                    2: 0x33
                },
                {
                    0: 0xff,
                    1: 0xfb
                }
            ],
            extractor: null
        },
        {
            name: "MPEG-4 Part 14 audio",
            extension: "m4a",
            mime: "audio/m4a",
            description: "",
            signature: [
                {
                    4: 0x66,
                    5: 0x74,
                    6: 0x79,
                    7: 0x70,
                    8: 0x4d,
                    9: 0x34,
                    10: 0x41
                },
                {
                    0: 0x4d,
                    1: 0x34,
                    2: 0x41,
                    3: 0x20
                }
            ],
            extractor: null
        },
        {
            name: "Free Lossless Audio Codec",
            extension: "flac",
            mime: "audio/x-flac",
            description: "",
            signature: {
                0: 0x66,
                1: 0x4c,
                2: 0x61,
                3: 0x43
            },
            extractor: null
        },
        {
            name: "Adaptive Multi-Rate audio codec",
            extension: "amr",
            mime: "audio/amr",
            description: "",
            signature: {
                0: 0x23,
                1: 0x21,
                2: 0x41,
                3: 0x4d,
                4: 0x52,
                5: 0x0a
            },
            extractor: null
        },
        {
            name: "Audacity",
            extension: "au",
            mime: "audio/x-au",
            description: "",
            signature: {
                0: 0x64, // dns.
                1: 0x6e,
                2: 0x73,
                3: 0x2e,

                24: 0x41, // AudacityBlockFile
                25: 0x75,
                26: 0x64,
                27: 0x61,
                28: 0x63,
                29: 0x69,
                30: 0x74,
                31: 0x79,
                32: 0x42,
                33: 0x6c,
                34: 0x6f,
                35: 0x63,
                36: 0x6b,
                37: 0x46,
                38: 0x69,
                39: 0x6c,
                40: 0x65
            },
            extractor: null
        },
        {
            name: "Audacity Block",
            extension: "auf",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x41, // AudacityBlockFile
                1: 0x75,
                2: 0x64,
                3: 0x61,
                4: 0x63,
                5: 0x69,
                6: 0x74,
                7: 0x79,
                8: 0x42,
                9: 0x6c,
                10: 0x6f,
                11: 0x63,
                12: 0x6b,
                13: 0x46,
                14: 0x69,
                15: 0x6c,
                16: 0x65
            },
            extractor: null
        },
        {
            name: "Audio Interchange File",
            extension: "aif",
            mime: "audio/x-aiff",
            description: "",
            signature: {
                0: 0x46, // FORM
                1: 0x4f,
                2: 0x52,
                3: 0x4d,
                8: 0x41, // AIFF
                9: 0x49,
                10: 0x46,
                11: 0x46
            },
            extractor: null
        },
        {
            name: "Audio Interchange File (compressed)",
            extension: "aifc",
            mime: "audio/x-aifc",
            description: "",
            signature: {
                0: 0x46, // FORM
                1: 0x4f,
                2: 0x52,
                3: 0x4d,
                8: 0x41, // AIFC
                9: 0x49,
                10: 0x46,
                11: 0x43
            },
            extractor: null
        }
    ],
    "Documents": [
        {
            name: "Portable Document Format",
            extension: "pdf",
            mime: "application/pdf",
            description: "",
            signature: {
                0: 0x25,
                1: 0x50,
                2: 0x44,
                3: 0x46
            },
            extractor: extractPDF
        },
        {
            name: "Portable Document Format (under Base64)",
            extension: "B64",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x41,
                1: 0x4a,
                2: 0x56,
                3: 0x42,
                4: 0x45,
                5: 0x52,
                6: 0x69
            },
            extractor: null
        },
        { // Place before PostScript
            name: "Adobe PostScript",
            extension: "ps,eps,ai,pfa",
            mime: "application/postscript",
            description: "",
            signature: {
                0: 0x25,
                1: 0x21,
                2: 0x50,
                3: 0x53,
                4: 0x2d,
                5: 0x41,
                6: 0x64,
                7: 0x6f,
                8: 0x62,
                9: 0x65
            },
            extractor: null
        },
        {
            name: "PostScript",
            extension: "ps",
            mime: "application/postscript",
            description: "",
            signature: {
                0: 0x25,
                1: 0x21
            },
            extractor: null
        },
        {
            name: "Encapsulated PostScript",
            extension: "eps,ai",
            mime: "application/eps",
            description: "",
            signature: {
                0: 0xc5,
                1: 0xd0,
                2: 0xd3,
                3: 0xc6
            },
            extractor: null
        },
        {
            name: "Rich Text Format",
            extension: "rtf",
            mime: "application/rtf",
            description: "",
            signature: {
                0: 0x7b,
                1: 0x5c,
                2: 0x72,
                3: 0x74,
                4: 0x66
            },
            extractor: extractRTF
        },
        {
            name: "Microsoft Office document/OLE2",
            extension: "ole2,doc,xls,dot,ppt,xla,ppa,pps,pot,msi,sdw,db,vsd,msg",
            mime: "application/msword,application/vnd.ms-excel,application/vnd.ms-powerpoint",
            description: "Microsoft Office documents",
            signature: {
                0: 0xd0,
                1: 0xcf,
                2: 0x11,
                3: 0xe0,
                4: 0xa1,
                5: 0xb1,
                6: 0x1a,
                7: 0xe1
            },
            extractor: null
        },
        {
            name: "Microsoft Office document/OLE2 (under Base64)",
            extension: "B64",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x30,
                1: 0x4d,
                2: 0x38,
                3: 0x52,
                4: 0x34,
                5: 0x4b,
                6: 0x47,
                7: 0x78
            },
            extractor: null
        },
        {
            name: "Microsoft Office 2007+ document",
            extension: "docx,xlsx,pptx",
            mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation",
            description: "",
            signature: {
                38: 0x5f, // _Types].xml
                39: 0x54,
                40: 0x79,
                41: 0x70,
                42: 0x65,
                43: 0x73,
                44: 0x5d,
                45: 0x2e,
                46: 0x78,
                47: 0x6d,
                48: 0x6c
            },
            extractor: extractZIP
        },
        {
            name: "Microsoft Access database",
            extension: "mdb,mda,mde,mdt,fdb,psa",
            mime: "application/msaccess",
            description: "",
            signature: {
                0: 0x00,
                1: 0x01,
                2: 0x00,
                3: 0x00,
                4: 0x53, // Standard Jet
                5: 0x74,
                6: 0x61,
                7: 0x6e,
                8: 0x64,
                9: 0x61,
                10: 0x72,
                11: 0x64,
                12: 0x20,
                13: 0x4a,
                14: 0x65,
                15: 0x74
            },
            extractor: null
        },
        {
            name: "Microsoft Access 2007+ database",
            extension: "accdb,accde,accda,accdu",
            mime: "application/msaccess",
            description: "",
            signature: {
                0: 0x00,
                1: 0x01,
                2: 0x00,
                3: 0x00,
                4: 0x53, // Standard ACE DB
                5: 0x74,
                6: 0x61,
                7: 0x6e,
                8: 0x64,
                9: 0x61,
                10: 0x72,
                11: 0x64,
                12: 0x20,
                13: 0x41,
                14: 0x43,
                15: 0x45,
                16: 0x20
            },
            extractor: null
        },
        {
            name: "Microsoft OneNote document",
            extension: "one",
            mime: "application/onenote",
            description: "",
            signature: {
                0: 0xe4,
                1: 0x52,
                2: 0x5c,
                3: 0x7b,
                4: 0x8c,
                5: 0xd8,
                6: 0xa7,
                7: 0x4d,
                8: 0xae,
                9: 0xb1,
                10: 0x53,
                11: 0x78,
                12: 0xd0,
                13: 0x29,
                14: 0x96,
                15: 0xd3
            },
            extractor: null
        },
        {
            name: "Outlook Express database",
            extension: "dbx",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0xcf,
                1: 0xad,
                2: 0x12,
                3: 0xfe,
                4: [0x30, 0xc5, 0xc6, 0xc7],
                11: 0x11
            },
            extractor: null
        },
        {
            name: "Personal Storage Table (Outlook)",
            extension: "pst,ost,fdb,pab",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x21, // !BDN
                1: 0x42,
                2: 0x44,
                3: 0x4e
            },
            extractor: null
        },
        {
            name: "Microsoft Exchange Database",
            extension: "edb",
            mime: "application/octet-stream",
            description: "",
            signature: {
                4: 0xef,
                5: 0xcd,
                6: 0xab,
                7: 0x89,
                8: [0x20, 0x23],
                9: 0x06,
                10: 0x00,
                11: 0x00,
                12: [0x00, 0x01],
                13: 0x00,
                14: 0x00,
                15: 0x00
            },
            extractor: null
        },
        {
            name: "WordPerfect document",
            extension: "wpd,wp,wp5,wp6,wpp,bk!,wcm",
            mime: "application/wordperfect",
            description: "",
            signature: {
                0: 0xff,
                1: 0x57,
                2: 0x50,
                3: 0x43,
                7: [0x00, 0x01, 0x02],
                8: 0x01,
                9: 0x0a
            },
            extractor: null
        },
        {
            name: "EPUB e-book",
            extension: "epub",
            mime: "application/epub+zip",
            description: "",
            signature: {
                0: 0x50,
                1: 0x4b,
                2: 0x3,
                3: 0x4,
                30: 0x6d, // mimetypeapplication/epub_zip
                31: 0x69,
                32: 0x6d,
                33: 0x65,
                34: 0x74,
                35: 0x79,
                36: 0x70,
                37: 0x65,
                38: 0x61,
                39: 0x70,
                40: 0x70,
                41: 0x6c,
                42: 0x69,
                43: 0x63,
                44: 0x61,
                45: 0x74,
                46: 0x69,
                47: 0x6f,
                48: 0x6e,
                49: 0x2f,
                50: 0x65,
                51: 0x70,
                52: 0x75,
                53: 0x62,
                54: 0x2b,
                55: 0x7a,
                56: 0x69,
                57: 0x70
            },
            extractor: extractZIP
        },
    ],
    "Applications": [
        {
            name: "Windows Portable Executable",
            extension: "exe,dll,drv,vxd,sys,ocx,vbx,com,fon,scr",
            mime: "application/vnd.microsoft.portable-executable",
            description: "",
            signature: {
                0: 0x4d,
                1: 0x5a,
                3: [0x0, 0x1, 0x2],
                5: [0x0, 0x1, 0x2]
            },
            extractor: extractMZPE
        },
        {
            name: "Executable and Linkable Format",
            extension: "elf,bin,axf,o,prx,so",
            mime: "application/x-executable",
            description: "Executable and Linkable Format file. No standard file extension.",
            signature: {
                0: 0x7f,
                1: 0x45,
                2: 0x4c,
                3: 0x46
            },
            extractor: extractELF
        },
        {
            name: "MacOS Mach-O object",
            extension: "dylib",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0xca,
                1: 0xfe,
                2: 0xba,
                3: 0xbe,
                4: 0x00,
                5: 0x00,
                6: 0x00,
                7: [0x01, 0x02, 0x03]
            },
            extractor: null
        },
        {
            name: "MacOS Mach-O 64-bit object",
            extension: "dylib",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0xcf,
                1: 0xfa,
                2: 0xed,
                3: 0xfe
            },
            extractor: null
        },
        {
            name: "Adobe Flash",
            extension: "swf",
            mime: "application/x-shockwave-flash",
            description: "",
            signature: {
                0: [0x43, 0x46],
                1: 0x57,
                2: 0x53,
            },
            extractor: null
        },
        {
            name: "Java Class",
            extension: "class",
            mime: "application/java-vm",
            description: "",
            signature: {
                0: 0xca,
                1: 0xfe,
                2: 0xba,
                3: 0xbe
            },
            extractor: null
        },
        {
            name: "Dalvik Executable",
            extension: "dex",
            mime: "application/octet-stream",
            description: "Dalvik Executable as used by Android",
            signature: {
                0: 0x64,
                1: 0x65,
                2: 0x78,
                3: 0x0a,
                4: 0x30,
                5: 0x33,
                6: 0x35,
                7: 0x0
            },
            extractor: null
        },
        {
            name: "Google Chrome Extension",
            extension: "crx",
            mime: "application/crx",
            description: "Google Chrome extension or packaged app",
            signature: {
                0: 0x43,
                1: 0x72,
                2: 0x32,
                3: 0x34
            },
            extractor: null
        },
    ],
    "Archives": [
        {
            name: "PKZIP archive",
            extension: "zip",
            mime: "application/zip",
            description: "",
            signature: {
                0: 0x50,
                1: 0x4b,
                2: [0x3, 0x5, 0x7],
                3: [0x4, 0x6, 0x8]
            },
            extractor: extractZIP
        },
        {
            name: "PKZIP archive (under Base64)",
            extension: "B64",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x55,
                1: 0x45,
                2: 0x73,
                3: 0x44,
                4: 0x42,
                5: 0x42
            },
            extractor: null
        },
        {
            name: "TAR archive",
            extension: "tar",
            mime: "application/x-tar",
            description: "",
            signature: {
                257: 0x75, // ustar
                258: 0x73,
                259: 0x74,
                260: 0x61,
                261: 0x72
            },
            extractor: null
        },
        {
            name: "Roshal Archive",
            extension: "rar",
            mime: "application/x-rar-compressed",
            description: "",
            signature: {
                0: 0x52,
                1: 0x61,
                2: 0x72,
                3: 0x21,
                4: 0x1a,
                5: 0x7,
                6: [0x0, 0x1]
            },
            extractor: null
        },
        {
            name: "Gzip",
            extension: "gz",
            mime: "application/gzip",
            description: "",
            signature: {
                0: 0x1f,
                1: 0x8b,
                2: 0x8
            },
            extractor: extractGZIP
        },
        {
            name: "Bzip2",
            extension: "bz2",
            mime: "application/x-bzip2",
            description: "",
            signature: {
                0: 0x42,
                1: 0x5a,
                2: 0x68
            },
            extractor: extractBZIP2
        },
        {
            name: "7zip",
            extension: "7z",
            mime: "application/x-7z-compressed",
            description: "",
            signature: {
                0: 0x37,
                1: 0x7a,
                2: 0xbc,
                3: 0xaf,
                4: 0x27,
                5: 0x1c
            },
            extractor: null
        },
        {
            name: "Zlib Deflate",
            extension: "zlib",
            mime: "application/x-deflate",
            description: "",
            signature: {
                0: 0x78,
                1: [0x1, 0x9c, 0xda, 0x5e]
            },
            extractor: extractZlib
        },
        {
            name: "xz compression",
            extension: "xz",
            mime: "application/x-xz",
            description: "",
            signature: {
                0: 0xfd,
                1: 0x37,
                2: 0x7a,
                3: 0x58,
                4: 0x5a,
                5: 0x0
            },
            extractor: extractXZ
        },
        {
            name: "Tarball",
            extension: "tar.z",
            mime: "application/x-gtar",
            description: "",
            signature: {
                0: 0x1f,
                1: [0x9d, 0xa0]
            },
            extractor: null
        },
        {
            name: "ISO disk image",
            extension: "iso",
            mime: "application/octet-stream",
            description: "ISO 9660 CD/DVD image file",
            signature: [
                {
                    0x8001: 0x43,
                    0x8002: 0x44,
                    0x8003: 0x30,
                    0x8004: 0x30,
                    0x8005: 0x31
                },
                {
                    0x8801: 0x43,
                    0x8802: 0x44,
                    0x8803: 0x30,
                    0x8804: 0x30,
                    0x8805: 0x31
                },
                {
                    0x9001: 0x43,
                    0x9002: 0x44,
                    0x9003: 0x30,
                    0x9004: 0x30,
                    0x9005: 0x31
                }
            ],
            extractor: null
        },
        {
            name: "Virtual Machine Disk",
            extension: "vmdk",
            mime: "application/vmdk,application/x-virtualbox-vmdk",
            description: "",
            signature: {
                0: 0x4b,
                1: 0x44,
                2: 0x4d,
                3: 0x56,
                5: 0x00,
                6: 0x00,
                7: 0x00
            },
            extractor: null
        },
        {
            name: "Virtual Hard Drive",
            extension: "vhd",
            mime: "application/x-vhd",
            description: "",
            signature: {
                0: 0x63, // conectix
                1: 0x6f,
                2: 0x6e,
                3: 0x65,
                4: 0x63,
                5: 0x74,
                6: 0x69,
                7: 0x78
            },
            extractor: null
        },
        {
            name: "Macintosh disk image",
            extension: "dmf,dmg",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x78,
                1: 0x01,
                2: 0x73,
                3: 0x0d,
                4: 0x62,
                5: 0x62,
                6: 0x60,
                7: 0x60
            },
            extractor: null
        },
        {
            name: "ARJ Archive",
            extension: "arj",
            mime: "application/x-arj-compressed",
            description: "",
            signature: {
                0: 0x60,
                1: 0xea,
                8: [0x0, 0x10, 0x14],
                9: 0x0,
                10: 0x2
            },
            extractor: null
        },
        {
            name: "WinAce Archive",
            extension: "ace",
            mime: "application/x-ace-compressed",
            description: "",
            signature: {
                7: 0x2a, // **ACE**
                8: 0x2a,
                9: 0x41,
                10: 0x43,
                11: 0x45,
                12: 0x2a,
                13: 0x2a
            },
            extractor: null
        },
        {
            name: "Macintosh BinHex Encoded File",
            extension: "hqx",
            mime: "application/mac-binhex",
            description: "",
            signature: {
                11: 0x6d,  // must be converted with BinHex
                12: 0x75,
                13: 0x73,
                14: 0x74,
                15: 0x20,
                16: 0x62,
                17: 0x65,
                18: 0x20,
                19: 0x63,
                20: 0x6f,
                21: 0x6e,
                22: 0x76,
                23: 0x65,
                24: 0x72,
                25: 0x74,
                26: 0x65,
                27: 0x64,
                28: 0x20,
                29: 0x77,
                30: 0x69,
                31: 0x74,
                32: 0x68,
                33: 0x20,
                34: 0x42,
                35: 0x69,
                36: 0x6e,
                37: 0x48,
                38: 0x65,
                39: 0x78
            },
            extractor: null
        },
        {
            name: "ALZip Archive",
            extension: "alz",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x41, // ALZ
                1: 0x4c,
                2: 0x5a,
                3: 0x01,
                4: 0x0a,
                5: 0x0,
                6: 0x0,
                7: 0x0
            },
            extractor: null
        },
        {
            name: "KGB Compressed Archive",
            extension: "kgb",
            mime: "application/x-kgb-compressed",
            description: "",
            signature: {
                0: 0x4b, // KGB_arch -
                1: 0x47,
                2: 0x42,
                3: 0x5f,
                4: 0x61,
                5: 0x72,
                6: 0x63,
                7: 0x68,
                8: 0x20,
                9: 0x2d
            },
            extractor: null
        },
        {
            name: "Microsoft Cabinet",
            extension: "cab",
            mime: "vnd.ms-cab-compressed",
            description: "",
            signature: {
                0: 0x4d,
                1: 0x53,
                2: 0x43,
                3: 0x46,
                4: 0x00,
                5: 0x00,
                6: 0x00,
                7: 0x00
            },
            extractor: null
        },
        {
            name: "Jar Archive",
            extension: "jar",
            mime: "application/java-archive",
            description: "",
            signature: {
                0: 0x5f,
                1: 0x27,
                2: 0xa8,
                3: 0x89
            },
            extractor: null
        },
        {
            name: "lzop compressed",
            extension: "lzop,lzo",
            mime: "application/x-lzop",
            description: "",
            signature: {
                0: 0x89,
                1: 0x4c, // LZO
                2: 0x5a,
                3: 0x4f,
                4: 0x00,
                5: 0x0d,
                6: 0x0a,
                7: 0x1a
            },
            extractor: null
        },
    ],
    "Miscellaneous": [
        {
            name: "UTF-8 text",
            extension: "txt",
            mime: "text/plain",
            description: "UTF-8 encoded Unicode byte order mark, commonly but not exclusively seen in text files.",
            signature: {
                0: 0xef,
                1: 0xbb,
                2: 0xbf
            },
            extractor: null
        },
        { // Place before UTF-16 LE text
            name: "UTF-32 LE text",
            extension: "utf32le",
            mime: "charset/utf32le",
            description: "Little-endian UTF-32 encoded Unicode byte order mark.",
            signature: {
                0: 0xff,
                1: 0xfe,
                2: 0x00,
                3: 0x00
            },
            extractor: null
        },
        {
            name: "UTF-16 LE text",
            extension: "utf16le",
            mime: "charset/utf16le",
            description: "Little-endian UTF-16 encoded Unicode byte order mark.",
            signature: {
                0: 0xff,
                1: 0xfe
            },
            extractor: null
        },
        {
            name: "Web Open Font Format",
            extension: "woff",
            mime: "application/font-woff",
            description: "",
            signature: {
                0: 0x77,
                1: 0x4f,
                2: 0x46,
                3: 0x46,
                4: 0x0,
                5: 0x1,
                6: 0x0,
                7: 0x0
            },
            extractor: null
        },
        {
            name: "Web Open Font Format 2",
            extension: "woff2",
            mime: "application/font-woff",
            description: "",
            signature: {
                0: 0x77,
                1: 0x4f,
                2: 0x46,
                3: 0x32,
                4: 0x0,
                5: 0x1,
                6: 0x0,
                7: 0x0
            },
            extractor: null
        },
        {
            name: "Embedded OpenType font",
            extension: "eot",
            mime: "application/octet-stream",
            description: "",
            signature: [
                {
                    8: 0x2,
                    9: 0x0,
                    10: 0x1,
                    34: 0x4c,
                    35: 0x50
                },
                {
                    8: 0x1,
                    9: 0x0,
                    10: 0x0,
                    34: 0x4c,
                    35: 0x50
                },
                {
                    8: 0x2,
                    9: 0x0,
                    10: 0x2,
                    34: 0x4c,
                    35: 0x50
                },
            ],
            extractor: null
        },
        {
            name: "TrueType Font",
            extension: "ttf",
            mime: "application/font-sfnt",
            description: "",
            signature: {
                0: 0x0,
                1: 0x1,
                2: 0x0,
                3: 0x0,
                4: 0x0
            },
            extractor: null
        },
        {
            name: "OpenType Font",
            extension: "otf",
            mime: "application/font-sfnt",
            description: "",
            signature: {
                0: 0x4f,
                1: 0x54,
                2: 0x54,
                3: 0x4f,
                4: 0x0
            },
            extractor: null
        },
        {
            name: "SQLite",
            extension: "sqlite",
            mime: "application/x-sqlite3",
            description: "",
            signature: {
                0: 0x53,
                1: 0x51,
                2: 0x4c,
                3: 0x69
            },
            extractor: null
        },
        {
            name: "BitTorrent link",
            extension: "torrent",
            mime: "application/x-bittorrent",
            description: "",
            signature: [
                {
                    0: 0x64, // d8:announce##:
                    1: 0x38,
                    2: 0x3a,
                    3: 0x61,
                    4: 0x6e,
                    5: 0x6e,
                    6: 0x6f,
                    7: 0x75,
                    8: 0x6e,
                    9: 0x63,
                    10: 0x65,
                    11: 0x23,
                    12: 0x23,
                    13: 0x3a
                },
                {
                    0: 0x64, // d4:infod
                    1: 0x34,
                    2: 0x3a,
                    3: 0x69,
                    4: 0x6e,
                    5: 0x66,
                    6: 0x6f,
                    7: 0x64,
                    8: [0x34, 0x35, 0x36],
                    9: 0x3a
                }
            ],
            extractor: null
        },
        {
            name: "Cryptocurrency wallet",
            extension: "wallet",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x00,
                1: 0x00,
                2: 0x00,
                3: 0x00,
                4: 0x01,
                5: 0x00,
                6: 0x00,
                7: 0x00,
                8: 0x00,
                9: 0x00,
                10: 0x00,
                11: 0x00,
                12: 0x62,
                13: 0x31,
                14: 0x05,
                15: 0x00
            },
            extractor: null
        },
        {
            name: "Registry fragment",
            extension: "hbin",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x68, // hbin
                1: 0x62,
                2: 0x69,
                3: 0x6e,
                4: 0x00
            },
            extractor: null
        },
        {
            name: "Registry script",
            extension: "rgs",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x48, // HKCR
                1: 0x4b,
                2: 0x43,
                3: 0x52,
                4: 0x0d,
                5: 0x0a,
                6: 0x5c,
                7: 0x7b
            },
            extractor: null
        },
        {
            name: "WinNT Registry Hive",
            extension: "registry",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x72,
                1: 0x65,
                2: 0x67,
                3: 0x66
            },
            extractor: null
        },
        {
            name: "Windows Event Log",
            extension: "evt",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x30,
                1: 0x00,
                2: 0x00,
                3: 0x00,
                4: 0x4c,
                5: 0x66,
                6: 0x4c,
                7: 0x65
            },
            extractor: null
        },
        {
            name: "Windows Event Log",
            extension: "evtx",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x45, // ElfFile
                1: 0x6c,
                2: 0x66,
                3: 0x46,
                4: 0x69,
                5: 0x6c,
                6: 0x65
            },
            extractor: null
        },
        {
            name: "Windows Pagedump",
            extension: "dmp",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x50, // PAGEDU(MP|64)
                1: 0x41,
                2: 0x47,
                3: 0x45,
                4: 0x44,
                5: 0x55,
                6: [0x4d, 0x36],
                7: [0x50, 0x34]
            },
            extractor: null
        },
        {
            name: "Windows Prefetch",
            extension: "pf",
            mime: "application/x-pf",
            description: "",
            signature: {
                0: [0x11, 0x17, 0x1a],
                1: 0x0,
                2: 0x0,
                3: 0x0,
                4: 0x53,
                5: 0x43,
                6: 0x43,
                7: 0x41
            },
            extractor: null
        },
        {
            name: "Windows Prefetch (Win 10)",
            extension: "pf",
            mime: "application/x-pf",
            description: "",
            signature: {
                0: 0x4d,
                1: 0x41,
                2: 0x4d,
                3: 0x04,
                7: 0x0
            },
            extractor: null
        },
        {
            name: "PList (XML)",
            extension: "plist",
            mime: "application/xml",
            description: "",
            signature: {
                39: 0x3c, // <!DOCTYPE plist
                40: 0x21,
                41: 0x44,
                42: 0x4f,
                43: 0x43,
                44: 0x54,
                45: 0x59,
                46: 0x50,
                47: 0x45,
                48: 0x20,
                49: 0x70,
                50: 0x6c,
                51: 0x69,
                52: 0x73,
                53: 0x74
            },
            extractor: extractPListXML
        },
        {
            name: "PList (binary)",
            extension: "bplist,plist,ipmeta,abcdp,mdbackup,mdinfo,strings,nib,ichat,qtz,webbookmark,webhistory",
            mime: "application/x-plist",
            description: "",
            signature: {
                0: 0x62, // bplist00
                1: 0x70,
                2: 0x6c,
                3: 0x69,
                4: 0x73,
                5: 0x74,
                6: 0x30,
                7: 0x30
            },
            extractor: null
        },
        {
            name: "MacOS X Keychain",
            extension: "keychain",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0x6b, // keych
                1: 0x79,
                2: 0x63,
                3: 0x68,
                4: 0x00,
                5: 0x01
            },
            extractor: null
        },
        {
            name: "TCP Packet",
            extension: "tcp",
            mime: "application/tcp",
            description: "",
            signature: {
                12: 0x08,
                13: 0x00,
                14: 0x45,
                15: 0x00,
                21: 0x00,
                22: b => b >= 0x01 && b <= 0x80,
                23: 0x06
            },
            extractor: null
        },
        {
            name: "UDP Packet",
            extension: "udp",
            mime: "application/udp",
            description: "",
            signature: {
                12: 0x08,
                13: 0x00,
                14: 0x45,
                15: 0x00,
                16: [0x00, 0x01, 0x02, 0x03, 0x04, 0x05],
                22: b => b >= 0x01 && b <= 0x80,
                23: 0x11
            },
            extractor: null
        },
        {
            name: "Compiled HTML",
            extension: "chm,chw,chi",
            mime: "application/vnd.ms-htmlhelp",
            description: "",
            signature: {
                0: 0x49, // ITSF
                1: 0x54,
                2: 0x53,
                3: 0x46,
                4: 0x03,
                5: 0x00,
                6: 0x00,
                7: 0x00
            },
            extractor: null
        },
        {
            name: "Windows Password",
            extension: "pwl",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0xe3,
                1: 0x82,
                2: 0x85,
                3: 0x96
            },
            extractor: null
        },
        {
            name: "Bitlocker recovery key",
            extension: "bitlocker",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: 0xff,
                1: 0xfe,
                2: 0x42,
                3: 0x00,
                4: 0x69,
                5: 0x00,
                6: 0x74,
                7: 0x00,
                8: 0x4c,
                9: 0x00,
                10: 0x6f,
                11: 0x00,
                12: 0x63,
                13: 0x00,
                14: 0x6b,
                15: 0x00,
                16: 0x65,
                17: 0x00,
                18: 0x72,
                19: 0x00,
                20: 0x20,
                21: 0x00
            },
            extractor: null
        },
        {
            name: "Certificate",
            extension: "cer,cat,p7b,p7c,p7m,p7s,swz,rsa,crl,crt,der",
            mime: "application/pkix-cert",
            description: "",
            signature: {
                0: 0x30,
                1: 0x82,
                4: [0x06, 0x0a, 0x30]
            },
            extractor: null
        },
        {
            name: "Certificate",
            extension: "cat,swz,p7m",
            mime: "application/vnd.ms-pki.seccat",
            description: "",
            signature: {
                0: 0x30,
                1: 0x83,
                2: b => b !== 0x00,
                5: 0x06,
                6: 0x09
            },
            extractor: null
        },
        {
            name: "PGP pubring",
            extension: "pkr,gpg",
            mime: "application/pgp-keys",
            description: "",
            signature: {
                0: 0x99,
                1: 0x01,
                2: [0x0d, 0xa2],
                3: 0x04
            },
            extractor: null
        },
        {
            name: "PGP secring",
            extension: "skr",
            mime: "application/pgp-keys",
            description: "",
            signature: [
                {
                    0: 0x95,
                    1: 0x01,
                    2: 0xcf,
                    3: 0x04
                },
                {
                    0: 0x95,
                    1: 0x03,
                    2: 0xc6,
                    3: 0x04
                }
            ],
            extractor: null
        },
        {
            name: "PGP Safe",
            extension: "pgd",
            mime: "application/pgp-keys",
            description: "",
            signature: {
                0: 0x50, // PGPdMAIN
                1: 0x47,
                2: 0x50,
                3: 0x64,
                4: 0x4d,
                5: 0x41,
                6: 0x49,
                7: 0x4e,
                8: 0x60,
                9: 0x01,
                10: 0x00
            },
            extractor: null
        },
        {
            name: "Task Scheduler",
            extension: "job",
            mime: "application/octet-stream",
            description: "",
            signature: {
                0: [0x00, 0x01, 0x02, 0x03],
                1: [0x05, 0x06],
                2: 0x01,
                3: 0x00,
                20: 0x46,
                21: 0x00
            },
            extractor: null
        },
        {
            name: "Windows Shortcut",
            extension: "lnk",
            mime: "application/x-ms-shortcut",
            description: "",
            signature: {
                0: 0x4c,
                1: 0x00,
                2: 0x00,
                3: 0x00,
                4: 0x01,
                5: 0x14,
                6: 0x02,
                7: 0x00,
                8: 0x00,
                9: 0x00,
                10: 0x00,
                11: 0x00,
                12: 0xc0,
                13: 0x00,
                14: 0x00,
                15: 0x00,
                16: 0x00,
                17: 0x00,
                18: 0x00,
                19: 0x46
            },
            extractor: null
        }
    ]
};


/**
 * JPEG extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractJPEG(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    while (stream.hasMore()) {
        const marker = stream.getBytes(2);
        if (marker[0] !== 0xff) throw new Error(`Invalid marker while parsing JPEG at pos ${stream.position}: ${marker}`);

        let segmentSize = 0;
        switch (marker[1]) {
            // No length
            case 0xd8: // Start of Image
            case 0x01: // For temporary use in arithmetic coding
                break;
            case 0xd9: // End found
                return stream.carve();

            // Variable size segment
            case 0xc0: // Start of frame (Baseline DCT)
            case 0xc1: // Start of frame (Extended sequential DCT)
            case 0xc2: // Start of frame (Progressive DCT)
            case 0xc3: // Start of frame (Lossless sequential)
            case 0xc4: // Define Huffman Table
            case 0xc5: // Start of frame (Differential sequential DCT)
            case 0xc6: // Start of frame (Differential progressive DCT)
            case 0xc7: // Start of frame (Differential lossless)
            case 0xc8: // Reserved for JPEG extensions
            case 0xc9: // Start of frame (Extended sequential DCT)
            case 0xca: // Start of frame (Progressive DCT)
            case 0xcb: // Start of frame (Lossless sequential)
            case 0xcc: // Define arithmetic conditioning table
            case 0xcd: // Start of frame (Differential sequential DCT)
            case 0xce: // Start of frame (Differential progressive DCT)
            case 0xcf: // Start of frame (Differential lossless)
            case 0xdb: // Define Quantization Table
            case 0xde: // Define hierarchical progression
            case 0xe0: // Application-specific
            case 0xe1: // Application-specific
            case 0xe2: // Application-specific
            case 0xe3: // Application-specific
            case 0xe4: // Application-specific
            case 0xe5: // Application-specific
            case 0xe6: // Application-specific
            case 0xe7: // Application-specific
            case 0xe8: // Application-specific
            case 0xe9: // Application-specific
            case 0xea: // Application-specific
            case 0xeb: // Application-specific
            case 0xec: // Application-specific
            case 0xed: // Application-specific
            case 0xee: // Application-specific
            case 0xef: // Application-specific
            case 0xfe: // Comment
                segmentSize = stream.readInt(2, "be");
                stream.position += segmentSize - 2;
                break;

            // 1 byte
            case 0xdf: // Expand reference image
                stream.position++;
                break;

            // 2 bytes
            case 0xdc: // Define number of lines
            case 0xdd: // Define restart interval
                stream.position += 2;
                break;

            // Start scan
            case 0xda: // Start of scan
                segmentSize = stream.readInt(2, "be");
                stream.position += segmentSize - 2;
                stream.continueUntil(0xff);
                break;

            // Continue through encoded data
            case 0x00: // Byte stuffing
            case 0xd0: // Restart
            case 0xd1: // Restart
            case 0xd2: // Restart
            case 0xd3: // Restart
            case 0xd4: // Restart
            case 0xd5: // Restart
            case 0xd6: // Restart
            case 0xd7: // Restart
                stream.continueUntil(0xff);
                break;

            default:
                stream.continueUntil(0xff);
                break;
        }
    }

    throw new Error("Unable to parse JPEG successfully");
}


/**
 * GIF extractor.
 *
 * @param {Uint8Array} bytes
 * @param {Number} offset
 * @returns {Uint8Array}
 */
export function extractGIF(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    //Move to application extension block.
    stream.continueUntil([0x21, 0xff]);

    //Move to Graphic Control Extension for frame #1.
    stream.continueUntil([0x21, 0xf9]);
    stream.moveForwardsBy(2);
    while (stream.hasMore()) {

        //Move to Image descriptor.
        stream.moveForwardsBy(stream.getBytes(1)[0]+1);

        //Move past Image descriptor to the image data.
        stream.moveForwardsBy(11);

        //Loop until next Graphic Control Extension.
        while (stream.getBytes(2) !== [0x21, 0xf9]) {
            stream.moveBackwardsBy(2);
            stream.moveForwardsBy(stream.getBytes(1)[0]);
            if (!stream.getBytes(1)[0])
                break;
            stream.moveBackwardsBy(1);
        }
        //When the end of the file is [0x00, 0x3b], end.
        if (stream.getBytes(1)[0] === 0x3b)
            break;
        stream.moveForwardsBy(1);
    }
    return stream.carve();
}


/**
 * Portable executable extractor.
 * Assumes that the offset refers to an MZ header.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractMZPE(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Read pointer to PE header
    stream.moveTo(0x3c);
    const peAddress = stream.readInt(4, "le");

    // Move to PE header
    stream.moveTo(peAddress);

    // Get number of sections
    stream.moveForwardsBy(6);
    const numSections = stream.readInt(2, "le");

    // Read Optional Header Magic to determine the state of the image file
    // 0x10b = normal executable, 0x107 = ROM image, 0x20b = PE32+ executable
    stream.moveForwardsBy(16);
    const optionalMagic = stream.readInt(2, "le");
    const pe32Plus = optionalMagic === 0x20b;

    // Move to Data Directory
    const dataDirectoryOffset = pe32Plus ? 112 : 96;
    stream.moveForwardsBy(dataDirectoryOffset - 2);

    // Read Certificate Table address and size (IMAGE_DIRECTORY_ENTRY_SECURITY)
    stream.moveForwardsBy(32);
    const certTableAddress = stream.readInt(4, "le");
    const certTableSize = stream.readInt(4, "le");

    // PE files can contain extra data appended to the end of the file called an "overlay".
    // This data is not covered by the PE header and could be any arbitrary format, so its
    // length cannot be determined without contextual information.
    // However, the Attribute Certificate Table is stored in the overlay - usually right at
    // the end. Therefore, if this table is defined, we can use its offset and size to carve
    // out the entire PE file, including the overlay.
    // If the Certificate Table is not defined, we continue to parse the PE file as best we
    // can up to the end of the final section, not including any appended data in the overlay.
    if (certTableAddress > 0) {
        stream.moveTo(certTableAddress + certTableSize);
        return stream.carve();
    }

    // Move past Optional Header to Section Header
    stream.moveForwardsBy(88);

    // Move to final section header
    stream.moveForwardsBy((numSections - 1) * 0x28);

    // Get raw data info
    stream.moveForwardsBy(16);
    const rawDataSize = stream.readInt(4, "le");
    const rawDataAddress = stream.readInt(4, "le");

    // Move to end of final section
    stream.moveTo(rawDataAddress + rawDataSize);

    return stream.carve();
}


/**
 * PDF extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractPDF(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Find end-of-file marker (%%EOF)
    stream.continueUntil([0x25, 0x25, 0x45, 0x4f, 0x46]);
    stream.moveForwardsBy(5);
    stream.consumeIf(0x0d);
    stream.consumeIf(0x0a);

    return stream.carve();
}


/**
 * ZIP extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractZIP(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Find End of central directory record
    stream.continueUntil([0x50, 0x4b, 0x05, 0x06]);

    // Get comment length and consume
    stream.moveForwardsBy(20);
    const commentLength = stream.readInt(2, "le");
    stream.moveForwardsBy(commentLength);

    return stream.carve();
}


/**
 * PNG extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractPNG(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Move past signature to first chunk
    stream.moveForwardsBy(8);

    let chunkSize = 0,
        chunkType = "";

    while (chunkType !== "IEND") {
        chunkSize = stream.readInt(4, "be");
        chunkType = stream.readString(4);

        // Chunk data size + CRC checksum
        stream.moveForwardsBy(chunkSize + 4);
    }


    return stream.carve();
}


/**
 * BMP extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractBMP(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Move past header
    stream.moveForwardsBy(2);

    // Read full file size
    const bmpSize = stream.readInt(4, "le");

    // Move to end of file (file size minus header and size field)
    stream.moveForwardsBy(bmpSize - 6);

    return stream.carve();
}


/**
 * FLV extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractFLV(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Move past signature, version and flags
    stream.moveForwardsBy(5);

    // Read header size
    const headerSize = stream.readInt(4, "be");

    // Skip through the rest of the header
    stream.moveForwardsBy(headerSize - 9);

    let tagSize = -11; // Fake size of previous tag header
    while (stream.hasMore()) {
        const prevTagSize = stream.readInt(4, "be");
        const tagType = stream.readInt(1);

        if ([8, 9, 18].indexOf(tagType) < 0) {
            // This tag is not valid
            stream.moveBackwardsBy(1);
            break;
        }

        if (prevTagSize !== (tagSize + 11)) {
            // Previous tag was not valid, reverse back over this header
            // and the previous tag body and header
            stream.moveBackwardsBy(tagSize + 11 + 5);
            break;
        }

        tagSize = stream.readInt(3, "be");

        // Move past the rest of the tag header and payload
        stream.moveForwardsBy(7 + tagSize);
    }

    return stream.carve();
}


/**
 * RTF extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractRTF(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    let openTags = 0;

    if (stream.readInt(1) !== 0x7b) { // {
        throw new Error("Not a valid RTF file");
    } else {
        openTags++;
    }

    while (openTags > 0 && stream.hasMore()) {
        switch (stream.readInt(1)) {
            case 0x7b: // {
                openTags++;
                break;
            case 0x7d: // }
                openTags--;
                break;
            case 0x5c: // \
                // Consume any more escapes and then skip over the next character
                stream.consumeIf(0x5c);
                stream.position++;
                break;
            default:
                break;
        }
    }

    return stream.carve();
}


/**
 * PList (XML) extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractPListXML(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Find closing tag (</plist>)
    stream.continueUntil([0x3c, 0x2f, 0x70, 0x6c, 0x69, 0x73, 0x74, 0x3e]);
    stream.moveForwardsBy(8);
    stream.consumeIf(0x0a);

    return stream.carve();
}


/**
 * GZIP extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractGZIP(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));


    /* HEADER */

    // Skip over signature and compression method
    stream.moveForwardsBy(3);

    // Read flags
    const flags = stream.readInt(1);

    // Skip over last modification time
    stream.moveForwardsBy(4);

    // Read compression flags
    stream.readInt(1);

    // Skip over OS
    stream.moveForwardsBy(1);


    /* OPTIONAL HEADERS */

    // Extra fields
    if (flags & 0x4) {
        const extraFieldsSize = stream.readInt(2, "le");
        stream.moveForwardsby(extraFieldsSize);
    }

    // Original filename
    if (flags & 0x8) {
        stream.continueUntil(0x00);
        stream.moveForwardsBy(1);
    }

    // Comment
    if (flags & 0x10) {
        stream.continueUntil(0x00);
        stream.moveForwardsBy(1);
    }

    // Checksum
    if (flags & 0x2) {
        stream.moveForwardsBy(2);
    }


    /* DEFLATE DATA */

    parseDEFLATE(stream);


    /* FOOTER */

    // Skip over checksum and size of original uncompressed input
    stream.moveForwardsBy(8);

    return stream.carve();
}


/**
 * BZIP2 extractor.
 *
 * @param {Uint8Array} bytes
 * @param {Number} offset
 * @returns {Uint8Array}
 */
export function extractBZIP2(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    //The EOFs shifted between all possible combinations.
    const lookingfor = [
        [0x77, 0x24, 0x53, 0x85, 0x09],
        [0xee, 0x48, 0xa7, 0x0a, 0x12],
        [0xdc, 0x91, 0x4e, 0x14, 0x24],
        [0xb9, 0x22, 0x9c, 0x28, 0x48],
        [0x72, 0x45, 0x38, 0x50, 0x90],
        [0xbb, 0x92, 0x29, 0xc2, 0x84],
        [0x5d, 0xc9, 0x14, 0xe1, 0x42],
        [0x2e, 0xe4, 0x8a, 0x70, 0xa1],
        [0x17, 0x72, 0x45, 0x38, 0x50]];

    for (let i = 0; i < lookingfor.length; i++) {

        //Continue until an EOF.
        stream.continueUntil(lookingfor[i]);
        if (stream.getBytes(5).join("") === lookingfor[i].join(""))
            break;

        //Jump back to the start if invalid EOF.
        stream.moveTo(0);
    }
    stream.moveForwardsBy(4);
    return stream.carve();
}


/**
 * Zlib extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractZlib(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Skip over CMF
    stream.moveForwardsBy(1);

    // Read flags
    const flags = stream.readInt(1);

    // Skip over preset dictionary checksum
    if (flags & 0x20) {
        stream.moveForwardsBy(4);
    }

    // Parse DEFLATE stream
    parseDEFLATE(stream);

    // Skip over final checksum
    stream.moveForwardsBy(4);

    return stream.carve();
}


/**
 * XZ extractor.
 *
 * @param {Uint8Array} bytes
 * @param {Number} offset
 * @returns {string}
 */
export function extractXZ(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Move forward to EOF marker
    stream.continueUntil([0x00, 0x00, 0x00, 0x00, 0x04, 0x59, 0x5a]);

    // Move over EOF marker
    stream.moveForwardsBy(7);

    return stream.carve();
}


/**
 * ELF extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractELF(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Skip over magic number
    stream.moveForwardsBy(4);

    // Read architecture (x86 == 1, x64 == 2)
    const x86 = stream.readInt(1) === 1;

    // Read endianness (1 == little, 2 == big)
    const endian = stream.readInt(1) === 1 ? "le" : "be";

    // Skip over header values
    stream.moveForwardsBy(x86 ? 26 : 34);

    // Read section header table offset
    const shoff = x86 ? stream.readInt(4, endian) : stream.readInt(8, endian);

    // Skip over flags, header size and program header size and entries
    stream.moveForwardsBy(10);

    // Read section header table entry size
    const shentsize = stream.readInt(2, endian);

    // Read number of entries in the section header table
    const shnum = stream.readInt(2, endian);

    // Jump to section header table
    stream.moveTo(shoff);

    // Move past each section header
    stream.moveForwardsBy(shentsize * shnum);

    return stream.carve();
}


// Construct required Huffman Tables
const fixedLiteralTableLengths = new Array(288);
for (let i = 0; i < fixedLiteralTableLengths.length; i++) {
    fixedLiteralTableLengths[i] =
        (i <= 143) ? 8 :
            (i <= 255) ? 9 :
                (i <= 279) ? 7 :
                    8;
}
const fixedLiteralTable = buildHuffmanTable(fixedLiteralTableLengths);
const fixedDistanceTableLengths = new Array(30).fill(5);
const fixedDistanceTable = buildHuffmanTable(fixedDistanceTableLengths);
const huffmanOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

/**
 * Steps through a DEFLATE stream
 *
 * @param {Stream} stream
 */
function parseDEFLATE(stream) {
    // Parse DEFLATE data
    let finalBlock = 0;

    while (!finalBlock) {
        // Read header
        finalBlock = stream.readBits(1);
        const blockType = stream.readBits(2);

        if (blockType === 0) {
            /* No compression */

            // Consume the rest of the current byte
            stream.moveForwardsBy(1);
            // Read the block length value
            const blockLength = stream.readInt(2, "le");
            // Move to the end of this block
            stream.moveForwardsBy(2 + blockLength);
        } else if (blockType === 1) {
            /* Fixed Huffman */

            parseHuffmanBlock(stream, fixedLiteralTable, fixedDistanceTable);
        } else if (blockType === 2) {
            /* Dynamic Huffman */

            // Read the number of liternal and length codes
            const hlit = stream.readBits(5) + 257;
            // Read the number of distance codes
            const hdist = stream.readBits(5) + 1;
            // Read the number of code lengths
            const hclen = stream.readBits(4) + 4;

            // Parse code lengths
            const codeLengths = new Uint8Array(huffmanOrder.length);
            for (let i = 0; i < hclen; i++) {
                codeLengths[huffmanOrder[i]] = stream.readBits(3);
            }

            // Parse length table
            const codeLengthsTable = buildHuffmanTable(codeLengths);
            const lengthTable = new Uint8Array(hlit + hdist);

            let code, repeat, prev;
            for (let i = 0; i < hlit + hdist;) {
                code = readHuffmanCode(stream, codeLengthsTable);
                switch (code) {
                    case 16:
                        repeat = 3 + stream.readBits(2);
                        while (repeat--) lengthTable[i++] = prev;
                        break;
                    case 17:
                        repeat = 3 + stream.readBits(3);
                        while (repeat--) lengthTable[i++] = 0;
                        prev = 0;
                        break;
                    case 18:
                        repeat = 11 + stream.readBits(7);
                        while (repeat--) lengthTable[i++] = 0;
                        prev = 0;
                        break;
                    default:
                        lengthTable[i++] = code;
                        prev = code;
                        break;
                }
            }

            const dynamicLiteralTable = buildHuffmanTable(lengthTable.subarray(0, hlit));
            const dynamicDistanceTable = buildHuffmanTable(lengthTable.subarray(hlit));

            parseHuffmanBlock(stream, dynamicLiteralTable, dynamicDistanceTable);
        } else {
            throw new Error(`Invalid block type while parsing DEFLATE stream at pos ${stream.position}`);
        }
    }

    // Consume final byte if it has not been fully consumed yet
    if (stream.bitPos > 0)
        stream.moveForwardsBy(1);
}


// Static length tables
const lengthExtraTable = [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0
];
const distanceExtraTable = [
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13
];

/**
 * Parses a Huffman Block given the literal and distance tables
 *
 * @param {Stream} stream
 * @param {Uint32Array} litTab
 * @param {Uint32Array} distTab
 */
function parseHuffmanBlock(stream, litTab, distTab) {
    let code;
    let loops = 0;
    while ((code = readHuffmanCode(stream, litTab))) {
        // console.log("Code: " + code + " (" + Utils.chr(code) + ") " + Utils.bin(code));

        // End of block
        if (code === 256) break;

        // Detect probably infinite loops
        if (++loops > 10000)
            throw new Error("Caught in probable infinite loop while parsing Huffman Block");

        // Literal
        if (code < 256) continue;

        // Length code
        stream.readBits(lengthExtraTable[code - 257]);

        // Dist code
        code = readHuffmanCode(stream, distTab);
        stream.readBits(distanceExtraTable[code]);
    }
}


/**
 * Builds a Huffman table given the relevant code lengths
 *
 * @param {Array} lengths
 * @returns {Array} result
 * @returns {Uint32Array} result.table
 * @returns {number} result.maxCodeLength
 * @returns {number} result.minCodeLength
 */
function buildHuffmanTable(lengths) {
    const maxCodeLength = Math.max.apply(Math, lengths);
    const minCodeLength = Math.min.apply(Math, lengths);
    const size = 1 << maxCodeLength;
    const table = new Uint32Array(size);

    for (let bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
        for (let i = 0; i < lengths.length; i++) {
            if (lengths[i] === bitLength) {
                let reversed, rtemp, j;
                for (reversed = 0, rtemp = code, j = 0; j < bitLength; j++) {
                    reversed = (reversed << 1) | (rtemp & 1);
                    rtemp >>= 1;
                }

                const value = (bitLength << 16) | i;
                for (let j = reversed; j < size; j += skip) {
                    table[j] = value;
                }

                code++;
            }
        }

        bitLength++;
        code <<= 1;
        skip <<= 1;
    }

    return [table, maxCodeLength, minCodeLength];
}


/**
 * Reads the next Huffman code from the stream, given the relevant code table
 *
 * @param {Stream} stream
 * @param {Uint32Array} table
 * @returns {number}
 */
function readHuffmanCode(stream, table) {
    const [codeTable, maxCodeLength] = table;

    // Read max length
    const bitsBuf = stream.readBits(maxCodeLength);
    const codeWithLength = codeTable[bitsBuf & ((1 << maxCodeLength) - 1)];
    const codeLength = codeWithLength >>> 16;

    if (codeLength > maxCodeLength) {
        throw new Error(`Invalid Huffman Code length while parsing DEFLATE block at pos ${stream.position}: ${codeLength}`);
    }

    stream.moveBackwardsByBits(maxCodeLength - codeLength);

    return codeWithLength & 0xffff;
}
