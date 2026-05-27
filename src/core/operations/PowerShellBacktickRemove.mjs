/**
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * PowerShell Backtick Remove operation
 */
class PowerShellBacktickRemove extends Operation {

    constructor() {
        super();

        this.name = "PowerShell Backtick Remove";
        this.module = "Default";
        this.description = "Removes obfuscating backtick characters from PowerShell code. Attackers insert backticks before regular letters to break up recognisable keywords without changing execution (<code>In&#96;voke-Ex&#96;pression</code> → <code>Invoke-Expression</code>).<br><br>By default all backticks are stripped, which maximally deobfuscates the script. Enable <b>Preserve escape sequences</b> to retain legitimate PowerShell escape sequences (<code>&#96;n</code>, <code>&#96;t</code>, <code>&#96;r</code>, <code>&#96;0</code>, <code>&#96;a</code>, <code>&#96;b</code>, <code>&#96;f</code>, <code>&#96;v</code>, <code>&#96;e</code>, <code>&#96;&quot;</code>, <code>&#96;'</code>, <code>&#96;&#96;</code>, <code>&#96;$</code>, <code>&#96;u</code>).";
        this.infoURL = "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_special_characters";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Preserve escape sequences",
                type: "boolean",
                value: false
            }
        ];
        this.checks = [
            {
                pattern: "`[a-zA-Z0-9]",
                flags: "",
                args: []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const preserveEscapes = args[0];

        if (!preserveEscapes) {
            // Strip all backticks — maximally deobfuscating.
            return input.replace(/`/g, "");
        }

        // Preserve recognised PowerShell escape sequences by consuming each backtick
        // together with its following character in one match. This ensures `` (two backticks)
        // is treated as a single escape unit rather than two independent backticks.
        //   `n `t `r `0 `a `b `f `v `e  →  control characters
        //   `" `' `` `$                  →  literal punctuation
        //   `u                           →  Unicode escape (PS 6+)
        return input.replace(/`([\s\S]?)/g, (match, next) => {
            return /[ntrabfve0"'`$u]/.test(next) ? match : next;
        });
    }

}

export default PowerShellBacktickRemove;
