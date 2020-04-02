/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

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
        this.description = "";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

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

        input = new Uint8Array(input);
        let result = "";

        /**
         * Extracts the ID3 header fields.
         */
        function extractHeader() {
            if (input.slice(0, 3).toString() !== [0x49, 0x44, 0x33].toString())
                throw new OperationError("No valid ID3 header.");
            result = "{\n";
            result += "    Type: \"ID3\",\n";

            // Tag version.
            result += "    Version: \"" + input[3].toString() + "." + input[4].toString() + "\",\n";

            // Header flags.
            result += "    Flags: " + input[5].toString() + ",\n";
            input = input.slice(6);
        }

        /**
         * Converts the size fields to a single integer.
         *
         * @param {number} num
         * @returns {string}
         */
        function readSize(num) {
            let result = 0;

            // The sizes are 7 bit numbers stored in 8 bit locations.
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
            result += "        " + id + ": {\n";
            result += "            ID: \"" + id + "\",\n";

            // Size of frame.
            const size = readSize(4);
            result += "            Size: " + size.toString() + ",\n";
            result += "            Description: \"" + FRAME_DESCRIPTIONS[id] + "\",\n";
            input = input.slice(2);
            let data = "";

            // Read data from frame.
            for (let i = 1; i < size; i++)
                data += String.fromCharCode(input[i]);

            // Move to next Frame
            input = input.slice(size);
            result += "            Data: \"" + data + "\",\n";
            result += "        },\n";
            return size;
        }

        extractHeader();

        const headerTagSize = readSize(4);
        result += "    Tags: {\n";

        let pos = 10;

        // While the current element is in the header.
        while (pos < headerTagSize) {

            // Frame Identifier of frame.
            let id = String.fromCharCode(input[0]) + String.fromCharCode(input[1]) + String.fromCharCode(input[2]);
            input = input.slice(3);

            // If the next character is non-zero it is an identifier.
            if (input[0] !== 0) {
                id += String.fromCharCode(input[0]);
            }
            input = input.slice(1);
            if (id in FRAME_DESCRIPTIONS) {
                pos += 10 + readFrame(id);
            // If end of header.
            } else if (id === "\x00\x00\x00") {
                break;
            } else {
                throw new OperationError("Unknown Frame Identifier: " + id);
            }
        }

        // Tidy up the output.
        result += "    },\n";
        result += "    Size: "+headerTagSize.toString() + ",\n";
        result += "}";
        return result;

    }

}

export default ExtractID3;
