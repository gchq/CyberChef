import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * To Base32 operation
 */
class ToBase32FromBase16 extends Operation {

    /**
     * ToBase32 constructor
     */
    constructor() {
        super();

        this.name = "To Base32 (From Base16)";
        this.module = "Default";
        this.description = "Converts Base16 to Base32 using Base2 as an intermediate and 5 bits at a time.";
        this.infoURL = "https://wikipedia.org/wiki/Base32";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
    }

    /**
     * @param {ArrayBuffer} input
     * @returns {string}
     */
    run(input) {
        if (!input) return "";
        input = new Uint8Array(input);
        const toStr = Utils.byteArrayToChars(input).toUpperCase();
        const b16Regex = new RegExp("^[A-Fa-f0-9]+$");
        if (b16Regex.test(toStr) === true) {
            const b32Map = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            let binary = "";
            for (const c of toStr) {
                const binRep = parseInt(c, 16).toString(2).padStart(4, "0");
                binary += binRep;
            }
            let b32 = "";
            for (let i = 0; i < binary.length; i+=5) {
                const slice = binary.slice(i, i+5);
                const toB32 = b32Map[parseInt(slice, 2)];
                b32 += toB32;
            }
            return b32;
        } else {
            return "";
        }
    }

}

export default ToBase32FromBase16;
