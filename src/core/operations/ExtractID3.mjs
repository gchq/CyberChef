/**
 * @author n1073645 [n1073645@gmail.com]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Extract ID3 operation
 */
class ExtractID3 extends Operation {

    /**
     * ExtractID3 constructor
     */
    constructor() {
        super();

        this.name = "Extract ID3";
        this.module = "Default";
        this.description = "This operation extracts ID3 metadata from an MP3 file.<br><br>ID3 is a metadata container most often used in conjunction with the MP3 audio file format. It allows information such as the title, artist, album, track number, and other information about the file to be stored in the file itself.";
        this.infoURL = "https://wikipedia.org/wiki/ID3";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.presentType = "html";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        input = new Uint8Array(input);

        /**
         * Extracts the ID3 header fields.
         */
        function extractHeader() {
            if (!Array.from(input.slice(0, 3)).equals([0x49, 0x44, 0x33]))
                throw new OperationError("No valid ID3 header.");

            const header = {
                "Type": "ID3",
                // Tag version
                "Version": input[3].toString() + "." + input[4].toString(),
                // Header version
                "Flags": input[5].toString()
            };

            input = input.slice(6);
            return header;
        }

        /**
         * Converts the size fields to a single integer.
         *
         * @param {number} num
         * @returns {string}
         */
        function readSize(num) {
            let result = 0;

            // The sizes are 7 bit numbers stored in 8 bit locations
            for (let i = (num) * 7; i; i -= 7) {
                result = (result << i) | input[0];
                input = input.slice(1);
            }
            return result;
        }

        /**
         * Reads frame header based on ID.
         *
         * @param {string} id
         * @returns {number}
         */
        function readFrame(id) {
            const frame = {};

            // Size of frame
            const size = readSize(4);
            frame.Size = size.toString();
            frame.Description = FRAME_DESCRIPTIONS[id];
            input = input.slice(2);

            // Read data from frame
            let data = "";
            for (let i = 1; i < size; i++)
                data += String.fromCharCode(input[i]);
            frame.Data = data;

            // Move to next Frame
            input = input.slice(size);

            return [frame, size];
        }

        const result = extractHeader();

        const headerTagSize = readSize(4);
        result.Size = headerTagSize.toString();

        const tags = {};
        let pos = 10;

        // While the current element is in the header
        while (pos < headerTagSize) {

            // Frame Identifier of frame
            let id = String.fromCharCode(input[0]) + String.fromCharCode(input[1]) + String.fromCharCode(input[2]);
            input = input.slice(3);

            // If the next character is non-zero it is an identifier
            if (input[0] !== 0) {
                id += String.fromCharCode(input[0]);
            }
            input = input.slice(1);

            if (id in FRAME_DESCRIPTIONS) {
                const [frame, size] = readFrame(id);
                tags[id] = frame;
                pos += 10 + size;
            } else if (id === "\x00\x00\x00") { // end of header
                break;
            } else {
                throw new OperationError("Unknown Frame Identifier: " + id);
            }
        }

        result.Tags = tags;

        return result;
    }

    /**
     * Displays the extracted data in a more accessible format for web apps.
     * @param {JSON} data
     * @returns {html}
     */
    present(data) {
        if (!data || !Object.prototype.hasOwnProperty.call(data, "Tags"))
            return JSON.stringify(data, null, 4);

        let output = `<table class="table table-hover table-sm table-bordered table-nonfluid">
            <tr><th>Tag</th><th>Description</th><th>Data</th></tr>`;

        for (const tagID in data.Tags) {
            const description = data.Tags[tagID].Description,
                contents = data.Tags[tagID].Data;
            output += `<tr><td>${tagID}</td><td>${Utils.escapeHtml(description)}</td><td>${Utils.escapeHtml(contents)}</td></tr>`;
        }
        output += "</table>";
        return output;
    }

}

// Borrowed from https://github.com/aadsm/jsmediatags
const FRAME_DESCRIPTIONS = {
    // v2.2
    "BUF": "Recommended buffer size",
    "CNT": "Play counter",
    "COM": "Comments",
    "CRA": "Audio encryption",
    "CRM": "Encrypted meta frame",
    "ETC": "Event timing codes",
    "EQU": "Equalization",
    "GEO": "General encapsulated object",
    "IPL": "Involved people list",
    "LNK": "Linked information",
    "MCI": "Music CD Identifier",
    "MLL": "MPEG location lookup table",
    "PIC": "Attached picture",
    "POP": "Popularimeter",
    "REV": "Reverb",
    "RVA": "Relative volume adjustment",
    "SLT": "Synchronized lyric/text",
    "STC": "Synced tempo codes",
    "TAL": "Album/Movie/Show title",
    "TBP": "BPM (Beats Per Minute)",
    "TCM": "Composer",
    "TCO": "Content type",
    "TCR": "Copyright message",
    "TDA": "Date",
    "TDY": "Playlist delay",
    "TEN": "Encoded by",
    "TFT": "File type",
    "TIM": "Time",
    "TKE": "Initial key",
    "TLA": "Language(s)",
    "TLE": "Length",
    "TMT": "Media type",
    "TOA": "Original artist(s)/performer(s)",
    "TOF": "Original filename",
    "TOL": "Original Lyricist(s)/text writer(s)",
    "TOR": "Original release year",
    "TOT": "Original album/Movie/Show title",
    "TP1": "Lead artist(s)/Lead performer(s)/Soloist(s)/Performing group",
    "TP2": "Band/Orchestra/Accompaniment",
    "TP3": "Conductor/Performer refinement",
    "TP4": "Interpreted, remixed, or otherwise modified by",
    "TPA": "Part of a set",
    "TPB": "Publisher",
    "TRC": "ISRC (International Standard Recording Code)",
    "TRD": "Recording dates",
    "TRK": "Track number/Position in set",
    "TSI": "Size",
    "TSS": "Software/hardware and settings used for encoding",
    "TT1": "Content group description",
    "TT2": "Title/Songname/Content description",
    "TT3": "Subtitle/Description refinement",
    "TXT": "Lyricist/text writer",
    "TXX": "User defined text information frame",
    "TYE": "Year",
    "UFI": "Unique file identifier",
    "ULT": "Unsychronized lyric/text transcription",
    "WAF": "Official audio file webpage",
    "WAR": "Official artist/performer webpage",
    "WAS": "Official audio source webpage",
    "WCM": "Commercial information",
    "WCP": "Copyright/Legal information",
    "WPB": "Publishers official webpage",
    "WXX": "User defined URL link frame",
    // v2.3
    "AENC": "Audio encryption",
    "APIC": "Attached picture",
    "ASPI": "Audio seek point index",
    "CHAP": "Chapter",
    "CTOC": "Table of contents",
    "COMM": "Comments",
    "COMR": "Commercial frame",
    "ENCR": "Encryption method registration",
    "EQU2": "Equalisation (2)",
    "EQUA": "Equalization",
    "ETCO": "Event timing codes",
    "GEOB": "General encapsulated object",
    "GRID": "Group identification registration",
    "IPLS": "Involved people list",
    "LINK": "Linked information",
    "MCDI": "Music CD identifier",
    "MLLT": "MPEG location lookup table",
    "OWNE": "Ownership frame",
    "PRIV": "Private frame",
    "PCNT": "Play counter",
    "POPM": "Popularimeter",
    "POSS": "Position synchronisation frame",
    "RBUF": "Recommended buffer size",
    "RVA2": "Relative volume adjustment (2)",
    "RVAD": "Relative volume adjustment",
    "RVRB": "Reverb",
    "SEEK": "Seek frame",
    "SYLT": "Synchronized lyric/text",
    "SYTC": "Synchronized tempo codes",
    "TALB": "Album/Movie/Show title",
    "TBPM": "BPM (beats per minute)",
    "TCOM": "Composer",
    "TCON": "Content type",
    "TCOP": "Copyright message",
    "TDAT": "Date",
    "TDLY": "Playlist delay",
    "TDRC": "Recording time",
    "TDRL": "Release time",
    "TDTG": "Tagging time",
    "TENC": "Encoded by",
    "TEXT": "Lyricist/Text writer",
    "TFLT": "File type",
    "TIME": "Time",
    "TIPL": "Involved people list",
    "TIT1": "Content group description",
    "TIT2": "Title/songname/content description",
    "TIT3": "Subtitle/Description refinement",
    "TKEY": "Initial key",
    "TLAN": "Language(s)",
    "TLEN": "Length",
    "TMCL": "Musician credits list",
    "TMED": "Media type",
    "TMOO": "Mood",
    "TOAL": "Original album/movie/show title",
    "TOFN": "Original filename",
    "TOLY": "Original lyricist(s)/text writer(s)",
    "TOPE": "Original artist(s)/performer(s)",
    "TORY": "Original release year",
    "TOWN": "File owner/licensee",
    "TPE1": "Lead performer(s)/Soloist(s)",
    "TPE2": "Band/orchestra/accompaniment",
    "TPE3": "Conductor/performer refinement",
    "TPE4": "Interpreted, remixed, or otherwise modified by",
    "TPOS": "Part of a set",
    "TPRO": "Produced notice",
    "TPUB": "Publisher",
    "TRCK": "Track number/Position in set",
    "TRDA": "Recording dates",
    "TRSN": "Internet radio station name",
    "TRSO": "Internet radio station owner",
    "TSOA": "Album sort order",
    "TSOP": "Performer sort order",
    "TSOT": "Title sort order",
    "TSIZ": "Size",
    "TSRC": "ISRC (international standard recording code)",
    "TSSE": "Software/Hardware and settings used for encoding",
    "TSST": "Set subtitle",
    "TYER": "Year",
    "TXXX": "User defined text information frame",
    "UFID": "Unique file identifier",
    "USER": "Terms of use",
    "USLT": "Unsychronized lyric/text transcription",
    "WCOM": "Commercial information",
    "WCOP": "Copyright/Legal information",
    "WOAF": "Official audio file webpage",
    "WOAR": "Official artist/performer webpage",
    "WOAS": "Official audio source webpage",
    "WORS": "Official internet radio station homepage",
    "WPAY": "Payment",
    "WPUB": "Publishers official webpage",
    "WXXX": "User defined URL link frame"
};

export default ExtractID3;
