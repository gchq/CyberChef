var Utils = require("../core/Utils.js");


/**
 * HTML operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var HTML = module.exports = {

    /**
     * @constant
     * @default
     */
    CONVERT_ALL: false,
    /**
     * @constant
     * @default
     */
    CONVERT_OPTIONS: ["Named entities where possible", "Numeric entities", "Hex entities"],

    /**
     * To HTML Entity operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runToEntity: function(input, args) {
        var convertAll = args[0],
            numeric = args[1] === "Numeric entities",
            hexa = args[1] === "Hex entities";

        var charcodes = Utils.strToCharcode(input);
        var output = "";

        for (var i = 0; i < charcodes.length; i++) {
            if (convertAll && numeric) {
                output += "&#" + charcodes[i] + ";";
            } else if (convertAll && hexa) {
                output += "&#x" + Utils.hex(charcodes[i]) + ";";
            } else if (convertAll) {
                output += HTML._byteToEntity[charcodes[i]] || "&#" + charcodes[i] + ";";
            } else if (numeric) {
                if (charcodes[i] > 255 || HTML._byteToEntity.hasOwnProperty(charcodes[i])) {
                    output += "&#" + charcodes[i] + ";";
                } else {
                    output += Utils.chr(charcodes[i]);
                }
            } else if (hexa) {
                if (charcodes[i] > 255 || HTML._byteToEntity.hasOwnProperty(charcodes[i])) {
                    output += "&#x" + Utils.hex(charcodes[i]) + ";";
                } else {
                    output += Utils.chr(charcodes[i]);
                }
            } else {
                output += HTML._byteToEntity[charcodes[i]] || (
                    charcodes[i] > 255 ?
                        "&#" + charcodes[i] + ";" :
                        Utils.chr(charcodes[i])
                );
            }
        }
        return output;
    },


    /**
     * From HTML Entity operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFromEntity: function(input, args) {
        var regex = /&(#?x?[a-zA-Z0-9]{1,8});/g,
            output = "",
            m,
            i = 0;

        while ((m = regex.exec(input))) {
            // Add up to match
            for (; i < m.index;)
                output += input[i++];

            // Add match
            var bite = HTML._entityToByte[m[1]];
            if (bite) {
                output += Utils.chr(bite);
            } else if (!bite && m[1][0] === "#" && m[1].length > 1 && /^#\d{1,5}$/.test(m[1])) {
                // Numeric entity (e.g. &#10;)
                var num = m[1].slice(1, m[1].length);
                output += Utils.chr(parseInt(num, 10));
            } else if (!bite && m[1][0] === "#" && m[1].length > 3 && /^#x[\dA-F]{2,8}$/i.test(m[1])) {
                // Hex entity (e.g. &#x3A;)
                var hex = m[1].slice(2, m[1].length);
                output += Utils.chr(parseInt(hex, 16));
            } else {
                // Not a valid entity, print as normal
                for (; i < regex.lastIndex;)
                    output += input[i++];
            }

            i = regex.lastIndex;
        }
        // Add all after final match
        for (; i < input.length;)
            output += input[i++];

        return output;
    },


    /**
     * @constant
     * @default
     */
    REMOVE_INDENTATION: true,
    /**
     * @constant
     * @default
     */
    REMOVE_LINE_BREAKS: true,

    /**
     * Strip HTML tags operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runStripTags: function(input, args) {
        var removeIndentation = args[0],
            removeLineBreaks = args[1];

        input = Utils.stripHtmlTags(input);

        if (removeIndentation) {
            input = input.replace(/\n[ \f\t]+/g, "\n");
        }

        if (removeLineBreaks) {
            input = input.replace(/^\s*\n/, "") // first line
                         .replace(/(\n\s*){2,}/g, "\n"); // all others
        }

        return input;
    },


    /**
     * Parse colour code operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runParseColourCode: function(input, args) {
        var m = null,
            r = 0, g = 0, b = 0, a = 1;

        // Read in the input
        if ((m = input.match(/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/i))) {
            // Hex - #d9edf7
            r = parseInt(m[1], 16);
            g = parseInt(m[2], 16);
            b = parseInt(m[3], 16);
        } else if ((m = input.match(/rgba?\((\d{1,3}(?:\.\d+)?),\s?(\d{1,3}(?:\.\d+)?),\s?(\d{1,3}(?:\.\d+)?)(?:,\s?(\d(?:\.\d+)?))?\)/i))) {
            // RGB or RGBA - rgb(217,237,247) or rgba(217,237,247,1)
            r = parseFloat(m[1]);
            g = parseFloat(m[2]);
            b = parseFloat(m[3]);
            a = m[4] ? parseFloat(m[4]) : 1;
        } else if ((m = input.match(/hsla?\((\d{1,3}(?:\.\d+)?),\s?(\d{1,3}(?:\.\d+)?)%,\s?(\d{1,3}(?:\.\d+)?)%(?:,\s?(\d(?:\.\d+)?))?\)/i))) {
            // HSL or HSLA - hsl(200, 65%, 91%) or hsla(200, 65%, 91%, 1)
            var h_ = parseFloat(m[1]) / 360,
                s_ = parseFloat(m[2]) / 100,
                l_ = parseFloat(m[3]) / 100,
                rgb_ = HTML._hslToRgb(h_, s_, l_);

            r = rgb_[0];
            g = rgb_[1];
            b = rgb_[2];
            a = m[4] ? parseFloat(m[4]) : 1;
        } else if ((m = input.match(/cmyk\((\d(?:\.\d+)?),\s?(\d(?:\.\d+)?),\s?(\d(?:\.\d+)?),\s?(\d(?:\.\d+)?)\)/i))) {
            // CMYK - cmyk(0.12, 0.04, 0.00, 0.03)
            var c_ = parseFloat(m[1]),
                m_ = parseFloat(m[2]),
                y_ = parseFloat(m[3]),
                k_ = parseFloat(m[4]);

            r = Math.round(255 * (1 - c_) * (1 - k_));
            g = Math.round(255 * (1 - m_) * (1 - k_));
            b = Math.round(255 * (1 - y_) * (1 - k_));
        }

        var hsl_ = HTML._rgbToHsl(r, g, b),
            h = Math.round(hsl_[0] * 360),
            s = Math.round(hsl_[1] * 100),
            l = Math.round(hsl_[2] * 100),
            k = 1 - Math.max(r/255, g/255, b/255),
            c = (1 - r/255 - k) / (1 - k),
            m = (1 - g/255 - k) / (1 - k), // eslint-disable-line no-redeclare
            y = (1 - b/255 - k) / (1 - k);

        c = isNaN(c) ? "0" : c.toFixed(2);
        m = isNaN(m) ? "0" : m.toFixed(2);
        y = isNaN(y) ? "0" : y.toFixed(2);
        k = k.toFixed(2);

        var hex = "#" +
                Utils.padLeft(Math.round(r).toString(16), 2) +
                Utils.padLeft(Math.round(g).toString(16), 2) +
                Utils.padLeft(Math.round(b).toString(16), 2),
            rgb  = "rgb(" + r + ", " + g + ", " + b + ")",
            rgba = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")",
            hsl  = "hsl(" + h + ", " + s + "%, " + l + "%)",
            hsla = "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")",
            cmyk = "cmyk(" + c + ", " + m + ", " + y + ", " + k + ")";

        // Generate output
        return "<div id='colorpicker' style='display: inline-block'></div>" +
            "Hex:  " + hex + "\n" +
            "RGB:  " + rgb + "\n" +
            "RGBA: " + rgba + "\n" +
            "HSL:  " + hsl + "\n" +
            "HSLA: " + hsla + "\n" +
            "CMYK: " + cmyk +
            "<script>\
                $('#colorpicker').colorpicker({\
                    format: 'rgba',\
                    color: '" + rgba + "',\
                    container: true,\
                    inline: true,\
                }).on('changeColor', function(e) {\
                    var color = e.color.toRGB();\
                    document.getElementById('input-text').value = 'rgba(' +\
                        color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')';\
                    window.app.autoBake();\
                });\
            </script>";
    },


    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_colorSpace.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @private
     * @author Mohsen (http://stackoverflow.com/a/9493060)
     *
     * @param {number} h - The hue
     * @param {number} s - The saturation
     * @param {number} l - The lightness
     * @return {Array} The RGB representation
     */
    _hslToRgb: function(h, s, l){
        var r, g, b;

        if (s === 0){
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },


    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_colorSpace.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @private
     * @author Mohsen (http://stackoverflow.com/a/9493060)
     *
     * @param {number} r - The red color value
     * @param {number} g - The green color value
     * @param {number} b - The blue color value
     * @return {Array} The HSL representation
     */
    _rgbToHsl: function(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    },


    /**
     * Lookup table to translate byte values to their HTML entity codes.
     *
     * @private
     * @constant
     */
    _byteToEntity: {
        34 : "&quot;",
        38 : "&amp;",
        39 : "&apos;",
        60 : "&lt;",
        62 : "&gt;",
        160 : "&nbsp;",
        161 : "&iexcl;",
        162 : "&cent;",
        163 : "&pound;",
        164 : "&curren;",
        165 : "&yen;",
        166 : "&brvbar;",
        167 : "&sect;",
        168 : "&uml;",
        169 : "&copy;",
        170 : "&ordf;",
        171 : "&laquo;",
        172 : "&not;",
        173 : "&shy;",
        174 : "&reg;",
        175 : "&macr;",
        176 : "&deg;",
        177 : "&plusmn;",
        178 : "&sup2;",
        179 : "&sup3;",
        180 : "&acute;",
        181 : "&micro;",
        182 : "&para;",
        183 : "&middot;",
        184 : "&cedil;",
        185 : "&sup1;",
        186 : "&ordm;",
        187 : "&raquo;",
        188 : "&frac14;",
        189 : "&frac12;",
        190 : "&frac34;",
        191 : "&iquest;",
        192 : "&Agrave;",
        193 : "&Aacute;",
        194 : "&Acirc;",
        195 : "&Atilde;",
        196 : "&Auml;",
        197 : "&Aring;",
        198 : "&AElig;",
        199 : "&Ccedil;",
        200 : "&Egrave;",
        201 : "&Eacute;",
        202 : "&Ecirc;",
        203 : "&Euml;",
        204 : "&Igrave;",
        205 : "&Iacute;",
        206 : "&Icirc;",
        207 : "&Iuml;",
        208 : "&ETH;",
        209 : "&Ntilde;",
        210 : "&Ograve;",
        211 : "&Oacute;",
        212 : "&Ocirc;",
        213 : "&Otilde;",
        214 : "&Ouml;",
        215 : "&times;",
        216 : "&Oslash;",
        217 : "&Ugrave;",
        218 : "&Uacute;",
        219 : "&Ucirc;",
        220 : "&Uuml;",
        221 : "&Yacute;",
        222 : "&THORN;",
        223 : "&szlig;",
        224 : "&agrave;",
        225 : "&aacute;",
        226 : "&acirc;",
        227 : "&atilde;",
        228 : "&auml;",
        229 : "&aring;",
        230 : "&aelig;",
        231 : "&ccedil;",
        232 : "&egrave;",
        233 : "&eacute;",
        234 : "&ecirc;",
        235 : "&euml;",
        236 : "&igrave;",
        237 : "&iacute;",
        238 : "&icirc;",
        239 : "&iuml;",
        240 : "&eth;",
        241 : "&ntilde;",
        242 : "&ograve;",
        243 : "&oacute;",
        244 : "&ocirc;",
        245 : "&otilde;",
        246 : "&ouml;",
        247 : "&divide;",
        248 : "&oslash;",
        249 : "&ugrave;",
        250 : "&uacute;",
        251 : "&ucirc;",
        252 : "&uuml;",
        253 : "&yacute;",
        254 : "&thorn;",
        255 : "&yuml;",
        338 : "&OElig;",
        339 : "&oelig;",
        352 : "&Scaron;",
        353 : "&scaron;",
        376 : "&Yuml;",
        402 : "&fnof;",
        710 : "&circ;",
        732 : "&tilde;",
        913 : "&Alpha;",
        914 : "&Beta;",
        915 : "&Gamma;",
        916 : "&Delta;",
        917 : "&Epsilon;",
        918 : "&Zeta;",
        919 : "&Eta;",
        920 : "&Theta;",
        921 : "&Iota;",
        922 : "&Kappa;",
        923 : "&Lambda;",
        924 : "&Mu;",
        925 : "&Nu;",
        926 : "&Xi;",
        927 : "&Omicron;",
        928 : "&Pi;",
        929 : "&Rho;",
        931 : "&Sigma;",
        932 : "&Tau;",
        933 : "&Upsilon;",
        934 : "&Phi;",
        935 : "&Chi;",
        936 : "&Psi;",
        937 : "&Omega;",
        945 : "&alpha;",
        946 : "&beta;",
        947 : "&gamma;",
        948 : "&delta;",
        949 : "&epsilon;",
        950 : "&zeta;",
        951 : "&eta;",
        952 : "&theta;",
        953 : "&iota;",
        954 : "&kappa;",
        955 : "&lambda;",
        956 : "&mu;",
        957 : "&nu;",
        958 : "&xi;",
        959 : "&omicron;",
        960 : "&pi;",
        961 : "&rho;",
        962 : "&sigmaf;",
        963 : "&sigma;",
        964 : "&tau;",
        965 : "&upsilon;",
        966 : "&phi;",
        967 : "&chi;",
        968 : "&psi;",
        969 : "&omega;",
        977 : "&thetasym;",
        978 : "&upsih;",
        982 : "&piv;",
        8194 : "&ensp;",
        8195 : "&emsp;",
        8201 : "&thinsp;",
        8204 : "&zwnj;",
        8205 : "&zwj;",
        8206 : "&lrm;",
        8207 : "&rlm;",
        8211 : "&ndash;",
        8212 : "&mdash;",
        8216 : "&lsquo;",
        8217 : "&rsquo;",
        8218 : "&sbquo;",
        8220 : "&ldquo;",
        8221 : "&rdquo;",
        8222 : "&bdquo;",
        8224 : "&dagger;",
        8225 : "&Dagger;",
        8226 : "&bull;",
        8230 : "&hellip;",
        8240 : "&permil;",
        8242 : "&prime;",
        8243 : "&Prime;",
        8249 : "&lsaquo;",
        8250 : "&rsaquo;",
        8254 : "&oline;",
        8260 : "&frasl;",
        8364 : "&euro;",
        8465 : "&image;",
        8472 : "&weierp;",
        8476 : "&real;",
        8482 : "&trade;",
        8501 : "&alefsym;",
        8592 : "&larr;",
        8593 : "&uarr;",
        8594 : "&rarr;",
        8595 : "&darr;",
        8596 : "&harr;",
        8629 : "&crarr;",
        8656 : "&lArr;",
        8657 : "&uArr;",
        8658 : "&rArr;",
        8659 : "&dArr;",
        8660 : "&hArr;",
        8704 : "&forall;",
        8706 : "&part;",
        8707 : "&exist;",
        8709 : "&empty;",
        8711 : "&nabla;",
        8712 : "&isin;",
        8713 : "&notin;",
        8715 : "&ni;",
        8719 : "&prod;",
        8721 : "&sum;",
        8722 : "&minus;",
        8727 : "&lowast;",
        8730 : "&radic;",
        8733 : "&prop;",
        8734 : "&infin;",
        8736 : "&ang;",
        8743 : "&and;",
        8744 : "&or;",
        8745 : "&cap;",
        8746 : "&cup;",
        8747 : "&int;",
        8756 : "&there4;",
        8764 : "&sim;",
        8773 : "&cong;",
        8776 : "&asymp;",
        8800 : "&ne;",
        8801 : "&equiv;",
        8804 : "&le;",
        8805 : "&ge;",
        8834 : "&sub;",
        8835 : "&sup;",
        8836 : "&nsub;",
        8838 : "&sube;",
        8839 : "&supe;",
        8853 : "&oplus;",
        8855 : "&otimes;",
        8869 : "&perp;",
        8901 : "&sdot;",
        8942 : "&vellip;",
        8968 : "&lceil;",
        8969 : "&rceil;",
        8970 : "&lfloor;",
        8971 : "&rfloor;",
        9001 : "&lang;",
        9002 : "&rang;",
        9674 : "&loz;",
        9824 : "&spades;",
        9827 : "&clubs;",
        9829 : "&hearts;",
        9830 : "&diams;",
    },


    /**
     * Lookup table to translate HTML entity codes to their byte values.
     *
     * @private
     * @constant
     */
    _entityToByte : {
        "quot" : 34,
        "amp" : 38,
        "apos" : 39,
        "lt" : 60,
        "gt" : 62,
        "nbsp" : 160,
        "iexcl" : 161,
        "cent" : 162,
        "pound" : 163,
        "curren" : 164,
        "yen" : 165,
        "brvbar" : 166,
        "sect" : 167,
        "uml" : 168,
        "copy" : 169,
        "ordf" : 170,
        "laquo" : 171,
        "not" : 172,
        "shy" : 173,
        "reg" : 174,
        "macr" : 175,
        "deg" : 176,
        "plusmn" : 177,
        "sup2" : 178,
        "sup3" : 179,
        "acute" : 180,
        "micro" : 181,
        "para" : 182,
        "middot" : 183,
        "cedil" : 184,
        "sup1" : 185,
        "ordm" : 186,
        "raquo" : 187,
        "frac14" : 188,
        "frac12" : 189,
        "frac34" : 190,
        "iquest" : 191,
        "Agrave" : 192,
        "Aacute" : 193,
        "Acirc" : 194,
        "Atilde" : 195,
        "Auml" : 196,
        "Aring" : 197,
        "AElig" : 198,
        "Ccedil" : 199,
        "Egrave" : 200,
        "Eacute" : 201,
        "Ecirc" : 202,
        "Euml" : 203,
        "Igrave" : 204,
        "Iacute" : 205,
        "Icirc" : 206,
        "Iuml" : 207,
        "ETH" : 208,
        "Ntilde" : 209,
        "Ograve" : 210,
        "Oacute" : 211,
        "Ocirc" : 212,
        "Otilde" : 213,
        "Ouml" : 214,
        "times" : 215,
        "Oslash" : 216,
        "Ugrave" : 217,
        "Uacute" : 218,
        "Ucirc" : 219,
        "Uuml" : 220,
        "Yacute" : 221,
        "THORN" : 222,
        "szlig" : 223,
        "agrave" : 224,
        "aacute" : 225,
        "acirc" : 226,
        "atilde" : 227,
        "auml" : 228,
        "aring" : 229,
        "aelig" : 230,
        "ccedil" : 231,
        "egrave" : 232,
        "eacute" : 233,
        "ecirc" : 234,
        "euml" : 235,
        "igrave" : 236,
        "iacute" : 237,
        "icirc" : 238,
        "iuml" : 239,
        "eth" : 240,
        "ntilde" : 241,
        "ograve" : 242,
        "oacute" : 243,
        "ocirc" : 244,
        "otilde" : 245,
        "ouml" : 246,
        "divide" : 247,
        "oslash" : 248,
        "ugrave" : 249,
        "uacute" : 250,
        "ucirc" : 251,
        "uuml" : 252,
        "yacute" : 253,
        "thorn" : 254,
        "yuml" : 255,
        "OElig" : 338,
        "oelig" : 339,
        "Scaron" : 352,
        "scaron" : 353,
        "Yuml" : 376,
        "fnof" : 402,
        "circ" : 710,
        "tilde" : 732,
        "Alpha" : 913,
        "Beta" : 914,
        "Gamma" : 915,
        "Delta" : 916,
        "Epsilon" : 917,
        "Zeta" : 918,
        "Eta" : 919,
        "Theta" : 920,
        "Iota" : 921,
        "Kappa" : 922,
        "Lambda" : 923,
        "Mu" : 924,
        "Nu" : 925,
        "Xi" : 926,
        "Omicron" : 927,
        "Pi" : 928,
        "Rho" : 929,
        "Sigma" : 931,
        "Tau" : 932,
        "Upsilon" : 933,
        "Phi" : 934,
        "Chi" : 935,
        "Psi" : 936,
        "Omega" : 937,
        "alpha" : 945,
        "beta" : 946,
        "gamma" : 947,
        "delta" : 948,
        "epsilon" : 949,
        "zeta" : 950,
        "eta" : 951,
        "theta" : 952,
        "iota" : 953,
        "kappa" : 954,
        "lambda" : 955,
        "mu" : 956,
        "nu" : 957,
        "xi" : 958,
        "omicron" : 959,
        "pi" : 960,
        "rho" : 961,
        "sigmaf" : 962,
        "sigma" : 963,
        "tau" : 964,
        "upsilon" : 965,
        "phi" : 966,
        "chi" : 967,
        "psi" : 968,
        "omega" : 969,
        "thetasym" : 977,
        "upsih" : 978,
        "piv" : 982,
        "ensp" : 8194,
        "emsp" : 8195,
        "thinsp" : 8201,
        "zwnj" : 8204,
        "zwj" : 8205,
        "lrm" : 8206,
        "rlm" : 8207,
        "ndash" : 8211,
        "mdash" : 8212,
        "lsquo" : 8216,
        "rsquo" : 8217,
        "sbquo" : 8218,
        "ldquo" : 8220,
        "rdquo" : 8221,
        "bdquo" : 8222,
        "dagger" : 8224,
        "Dagger" : 8225,
        "bull" : 8226,
        "hellip" : 8230,
        "permil" : 8240,
        "prime" : 8242,
        "Prime" : 8243,
        "lsaquo" : 8249,
        "rsaquo" : 8250,
        "oline" : 8254,
        "frasl" : 8260,
        "euro" : 8364,
        "image" : 8465,
        "weierp" : 8472,
        "real" : 8476,
        "trade" : 8482,
        "alefsym" : 8501,
        "larr" : 8592,
        "uarr" : 8593,
        "rarr" : 8594,
        "darr" : 8595,
        "harr" : 8596,
        "crarr" : 8629,
        "lArr" : 8656,
        "uArr" : 8657,
        "rArr" : 8658,
        "dArr" : 8659,
        "hArr" : 8660,
        "forall" : 8704,
        "part" : 8706,
        "exist" : 8707,
        "empty" : 8709,
        "nabla" : 8711,
        "isin" : 8712,
        "notin" : 8713,
        "ni" : 8715,
        "prod" : 8719,
        "sum" : 8721,
        "minus" : 8722,
        "lowast" : 8727,
        "radic" : 8730,
        "prop" : 8733,
        "infin" : 8734,
        "ang" : 8736,
        "and" : 8743,
        "or" : 8744,
        "cap" : 8745,
        "cup" : 8746,
        "int" : 8747,
        "there4" : 8756,
        "sim" : 8764,
        "cong" : 8773,
        "asymp" : 8776,
        "ne" : 8800,
        "equiv" : 8801,
        "le" : 8804,
        "ge" : 8805,
        "sub" : 8834,
        "sup" : 8835,
        "nsub" : 8836,
        "sube" : 8838,
        "supe" : 8839,
        "oplus" : 8853,
        "otimes" : 8855,
        "perp" : 8869,
        "sdot" : 8901,
        "vellip" : 8942,
        "lceil" : 8968,
        "rceil" : 8969,
        "lfloor" : 8970,
        "rfloor" : 8971,
        "lang" : 9001,
        "rang" : 9002,
        "loz" : 9674,
        "spades" : 9824,
        "clubs" : 9827,
        "hearts" : 9829,
        "diams" : 9830,
    },

};
