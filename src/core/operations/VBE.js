/**
 * Decodes Microsft Encoded VBS files that can be read and executed by cscript.exe/wscript.exe.
 * This is a conversion of a Python script that was originally created by Didier Stevens (https://DidierStevens.com).
 *
 * @author bmwhitn [brian.m.whitney@outlook.com]
 *
 * @namespace
 */
const VBE = {

    /**
     * @constant
     * @default
     */
    D_DECODE: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x57\x6E\x7B",
        "\x4A\x4C\x41",
        "\x0B\x0B\x0B",
        "\x0C\x0C\x0C",
        "\x4A\x4C\x41",
        "\x0E\x0E\x0E",
        "\x0F\x0F\x0F",
        "\x10\x10\x10",
        "\x11\x11\x11",
        "\x12\x12\x12",
        "\x13\x13\x13",
        "\x14\x14\x14",
        "\x15\x15\x15",
        "\x16\x16\x16",
        "\x17\x17\x17",
        "\x18\x18\x18",
        "\x19\x19\x19",
        "\x1A\x1A\x1A",
        "\x1B\x1B\x1B",
        "\x1C\x1C\x1C",
        "\x1D\x1D\x1D",
        "\x1E\x1E\x1E",
        "\x1F\x1F\x1F",
        "\x2E\x2D\x32",
        "\x47\x75\x30",
        "\x7A\x52\x21",
        "\x56\x60\x29",
        "\x42\x71\x5B",
        "\x6A\x5E\x38",
        "\x2F\x49\x33",
        "\x26\x5C\x3D",
        "\x49\x62\x58",
        "\x41\x7D\x3A",
        "\x34\x29\x35",
        "\x32\x36\x65",
        "\x5B\x20\x39",
        "\x76\x7C\x5C",
        "\x72\x7A\x56",
        "\x43\x7F\x73",
        "\x38\x6B\x66",
        "\x39\x63\x4E",
        "\x70\x33\x45",
        "\x45\x2B\x6B",
        "\x68\x68\x62",
        "\x71\x51\x59",
        "\x4F\x66\x78",
        "\x09\x76\x5E",
        "\x62\x31\x7D",
        "\x44\x64\x4A",
        "\x23\x54\x6D",
        "\x75\x43\x71",
        "\x4A\x4C\x41",
        "\x7E\x3A\x60",
        "\x4A\x4C\x41",
        "\x5E\x7E\x53",
        "\x40\x4C\x40",
        "\x77\x45\x42",
        "\x4A\x2C\x27",
        "\x61\x2A\x48",
        "\x5D\x74\x72",
        "\x22\x27\x75",
        "\x4B\x37\x31",
        "\x6F\x44\x37",
        "\x4E\x79\x4D",
        "\x3B\x59\x52",
        "\x4C\x2F\x22",
        "\x50\x6F\x54",
        "\x67\x26\x6A",
        "\x2A\x72\x47",
        "\x7D\x6A\x64",
        "\x74\x39\x2D",
        "\x54\x7B\x20",
        "\x2B\x3F\x7F",
        "\x2D\x38\x2E",
        "\x2C\x77\x4C",
        "\x30\x67\x5D",
        "\x6E\x53\x7E",
        "\x6B\x47\x6C",
        "\x66\x34\x6F",
        "\x35\x78\x79",
        "\x25\x5D\x74",
        "\x21\x30\x43",
        "\x64\x23\x26",
        "\x4D\x5A\x76",
        "\x52\x5B\x25",
        "\x63\x6C\x24",
        "\x3F\x48\x2B",
        "\x7B\x55\x28",
        "\x78\x70\x23",
        "\x29\x69\x41",
        "\x28\x2E\x34",
        "\x73\x4C\x09",
        "\x59\x21\x2A",
        "\x33\x24\x44",
        "\x7F\x4E\x3F",
        "\x6D\x50\x77",
        "\x55\x09\x3B",
        "\x53\x56\x55",
        "\x7C\x73\x69",
        "\x3A\x35\x61",
        "\x5F\x61\x63",
        "\x65\x4B\x50",
        "\x46\x58\x67",
        "\x58\x3B\x51",
        "\x31\x57\x49",
        "\x69\x22\x4F",
        "\x6C\x6D\x46",
        "\x5A\x4D\x68",
        "\x48\x25\x7C",
        "\x27\x28\x36",
        "\x5C\x46\x70",
        "\x3D\x4A\x6E",
        "\x24\x32\x7A",
        "\x79\x41\x2F",
        "\x37\x3D\x5F",
        "\x60\x5F\x4B",
        "\x51\x4F\x5A",
        "\x20\x42\x2C",
        "\x36\x65\x57"
    ],

    /**
     * @constant
     * @default
     */
    D_COMBINATION: [
        0,
        1,
        2,
        0,
        1,
        2,
        1,
        2,
        2,
        1,
        2,
        1,
        0,
        2,
        1,
        2,
        0,
        2,
        1,
        2,
        0,
        0,
        1,
        2,
        2,
        1,
        0,
        2,
        1,
        2,
        2,
        1,
        0,
        0,
        2,
        1,
        2,
        1,
        2,
        0,
        2,
        0,
        0,
        1,
        2,
        0,
        2,
        1,
        0,
        2,
        1,
        2,
        0,
        0,
        1,
        2,
        2,
        0,
        0,
        1,
        2,
        0,
        2,
        1
    ],

    /**
     * @param {string} input
     * @returns {string}
     */
    decode: function (data) {
        let result = "";
        let index = -1;
        data = data.replace("@&", String.fromCharCode(10));
        data = data.replace("@#", String.fromCharCode(13));
        data = data.replace("@*", ">");
        data = data.replace("@!", "<");
        data = data.replace("@$", "@");
        for (let i = 0; i < data.length; i++) {
            let byte = data.charCodeAt(i);
            if (byte < 128){
                index++;
            }
            if ((9 === byte || 31 < byte && 128 > byte) && 60 !== byte && 62 !== byte && 64 !== byte) {
                let char = VBE.D_DECODE[byte].charAt([VBE.D_COMBINATION[index % 64]]);
                result = result.concat(char);
            }
        }
        return result;
    },

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDecodeVBE: function (data, args) {
        let matcher = /#@~\^......==(.+)......==\^#~@/,
            result = "",
            encodedData;
        while ((encodedData = matcher.exec(data))) {
            result = result.concat(VBE.decode(encodedData[1]));
        }
        return result;
    },
};

export default VBE;
