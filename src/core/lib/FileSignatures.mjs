/**
 * File signatures and extractor functions
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */
import Stream from "./Stream";

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
            extractor: null
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
                0: 0x38,
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
                9: 0x00,
                10: [0x0, 0x1]
            },
            extractor: null
        }
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
            name: "Microsoft Office documents/OLE2",
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
            name: "Microsoft Office 2007+ documents",
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
            mime: "application/x-msdownload",
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
            name: "Executable and Linkable Format file",
            extension: "elf,bin,axf,o,prx,so",
            mime: "application/x-executable",
            description: "Executable and Linkable Format file. No standard file extension.",
            signature: {
                0: 0x7f,
                1: 0x45,
                2: 0x4c,
                3: 0x46
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
                2: 0x53
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
            name: "TAR archive",
            extension: "tar",
            mime: "application/x-tar",
            description: "",
            signature: {
                257: 0x75,
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
            extractor: null
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
            extractor: null
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
            extractor: null
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
                2: 0x4d
            },
            extractor: null
        },
    ],
    "Miscellaneous": [
        {
            name: "UTF-8 text file",
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
        { // Place before UTF-16 LE file
            name: "UTF-32 LE file",
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
            name: "UTF-16 LE file",
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
        if (marker[0] !== 0xff) throw new Error("Invalid JPEG marker: " + marker);

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
 * Portable executable extractor.
 * Assumes that the offset refers to an MZ header.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractMZPE(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Move to PE header pointer
    stream.moveTo(0x3c);
    const peAddress = stream.readInt(4, "le");

    // Move to PE header
    stream.moveTo(peAddress);

    // Get number of sections
    stream.moveForwardsBy(6);
    const numSections = stream.readInt(2, "le");

    // Get optional header size
    stream.moveForwardsBy(12);
    const optionalHeaderSize = stream.readInt(2, "le");

    // Move past optional header to section header
    stream.moveForwardsBy(2 + optionalHeaderSize);

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
    const compressionFlags = stream.readInt(1);

    // Skip over OS
    stream.moveForwardsBy(1);


    /* OPTIONAL HEADERS */

    // Extra fields
    if (flags & 0x4) {
        console.log("Extra fields");
        const extraFieldsSize = stream.readInt(2, "le");
        stream.moveForwardsby(extraFieldsSize);
    }

    // Original filename
    if (flags & 0x8) {
        console.log("Filename");
        stream.continueUntil(0x00);
        stream.moveForwardsBy(1);
    }

    // Comment
    if (flags & 0x10) {
        console.log("Comment");
        stream.continueUntil(0x00);
        stream.moveForwardsBy(1);
    }

    // Checksum
    if (flags & 0x2) {
        console.log("Checksum");
        stream.moveForwardsBy(2);
    }


    /* DEFLATE DATA */

    let finalBlock = 0;

    while (!finalBlock) {
        // Read header
        finalBlock = stream.readBits(1);
        const blockType = stream.readBits(2);

        if (blockType === 0) {
            // No compression
            stream.moveForwardsBy(1);
            const blockLength = stream.readInt(2, "le");
            console.log("No compression. Length: " + blockLength);
            stream.moveForwardsBy(2 + blockLength);
        } else if (blockType === 1) {
            // Fixed Huffman
            console.log("Fixed Huffman");

        } else if (blockType === 2) {
            // Dynamic Huffman
            console.log("Dynamic Huffman");
        } else {
            throw new Error("Invalid block type");
            break;
        }
    }

    /* FOOTER */

    // Skip over checksum and size of original uncompressed input
    stream.moveForwardsBy(8);

    console.log("Ending at " + stream.position);

    return stream.carve();
}
