/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Parse colour code operation
 */
class ParseColourCode extends Operation {

    /**
     * ParseColourCode constructor
     */
    constructor() {
        super();

        this.name = "Parse colour code";
        this.module = "Default";
        this.description = "Converts a colour code in a standard format to other standard formats and displays the colour itself.<br><br><strong>Example inputs</strong><ul><li><code>#d9edf7</code></li><li><code>rgba(217,237,247,1)</code></li><li><code>hsla(200,65%,91%,1)</code></li><li><code>cmyk(0.12, 0.04, 0.00, 0.03)</code></li></ul>";
        this.infoURL = "https://wikipedia.org/wiki/Web_colors";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        let m = null,
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
            const h_ = parseFloat(m[1]) / 360,
                s_ = parseFloat(m[2]) / 100,
                l_ = parseFloat(m[3]) / 100,
                rgb_ = ParseColourCode._hslToRgb(h_, s_, l_);

            r = rgb_[0];
            g = rgb_[1];
            b = rgb_[2];
            a = m[4] ? parseFloat(m[4]) : 1;
        } else if ((m = input.match(/cmyk\((\d(?:\.\d+)?),\s?(\d(?:\.\d+)?),\s?(\d(?:\.\d+)?),\s?(\d(?:\.\d+)?)\)/i))) {
            // CMYK - cmyk(0.12, 0.04, 0.00, 0.03)
            const c_ = parseFloat(m[1]),
                m_ = parseFloat(m[2]),
                y_ = parseFloat(m[3]),
                k_ = parseFloat(m[4]);

            r = Math.round(255 * (1 - c_) * (1 - k_));
            g = Math.round(255 * (1 - m_) * (1 - k_));
            b = Math.round(255 * (1 - y_) * (1 - k_));
        }

        const hsl_ = ParseColourCode._rgbToHsl(r, g, b),
            h = Math.round(hsl_[0] * 360),
            s = Math.round(hsl_[1] * 100),
            l = Math.round(hsl_[2] * 100);
        let k = 1 - Math.max(r/255, g/255, b/255),
            c = (1 - r/255 - k) / (1 - k),
            y = (1 - b/255 - k) / (1 - k);

        m = (1 - g/255 - k) / (1 - k);

        c = isNaN(c) ? "0" : c.toFixed(2);
        m = isNaN(m) ? "0" : m.toFixed(2);
        y = isNaN(y) ? "0" : y.toFixed(2);
        k = k.toFixed(2);

        const hex = "#" +
                Math.round(r).toString(16).padStart(2, "0") +
                Math.round(g).toString(16).padStart(2, "0") +
                Math.round(b).toString(16).padStart(2, "0"),
            rgb  = "rgb(" + r + ", " + g + ", " + b + ")",
            rgba = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")",
            hsl  = "hsl(" + h + ", " + s + "%, " + l + "%)",
            hsla = "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")",
            cmyk = "cmyk(" + c + ", " + m + ", " + y + ", " + k + ")";

        // Generate output
        return `<div id="colorpicker" style="white-space: normal;"></div>
Hex:  ${hex}
RGB:  ${rgb}
RGBA: ${rgba}
HSL:  ${hsl}
HSLA: ${hsla}
CMYK: ${cmyk}
<script>
    $('#colorpicker').colorpicker({
        format: 'rgba',
        color: '${rgba}',
        container: true,
        inline: true,
        useAlpha: true
    }).on('colorpickerChange', function(e) {
        var color = e.color.string('rgba');
        window.app.manager.input.setInput(color);
        window.app.manager.input.inputChange(new Event("keyup"));
    });
</script>`;
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_colorSpace.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @author Mohsen (http://stackoverflow.com/a/9493060)
     *
     * @param {number} h - The hue
     * @param {number} s - The saturation
     * @param {number} l - The lightness
     * @return {Array} The RGB representation
     */
    static _hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_colorSpace.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @author Mohsen (http://stackoverflow.com/a/9493060)
     *
     * @param {number} r - The red color value
     * @param {number} g - The green color value
     * @param {number} b - The blue color value
     * @return {Array} The HSL representation
     */
    static _rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            l = (max + min) / 2;
        let h, s;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    }
}

export default ParseColourCode;
