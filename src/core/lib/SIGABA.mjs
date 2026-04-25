/**
 * Emulation of the SIGABA machine
 *
 * @author hettysymes
 * @copyright hettysymes 2020
 * @license Apache-2.0
 */

/**
 * A set of randomised example SIGABA cipher/control rotors (these rotors are interchangeable). Cipher and control rotors can be referred to as C and R rotors respectively.
 */
export const CR_ROTORS = [
    {name: "Example 1", value: "SRGWANHPJZFXVIDQCEUKBYOLMT"},
    {name: "Example 2", value: "THQEFSAZVKJYULBODCPXNIMWRG"},
    {name: "Example 3", value: "XDTUYLEVFNQZBPOGIRCSMHWKAJ"},
    {name: "Example 4", value: "LOHDMCWUPSTNGVXYFJREQIKBZA"},
    {name: "Example 5", value: "ERXWNZQIJYLVOFUMSGHTCKPBDA"},
    {name: "Example 6", value: "FQECYHJIOUMDZVPSLKRTGWXBAN"},
    {name: "Example 7", value: "TBYIUMKZDJSOPEWXVANHLCFQGR"},
    {name: "Example 8", value: "QZUPDTFNYIAOMLEBWJXCGHKRSV"},
    {name: "Example 9", value: "CZWNHEMPOVXLKRSIDGJFYBTQAU"},
    {name: "Example 10", value: "ENPXJVKYQBFZTICAGMOHWRLDUS"}
];

/**
 * A set of randomised example SIGABA index rotors (may be referred to as I rotors).
 */
export const I_ROTORS = [
    {name: "Example 1", value: "6201348957"},
    {name: "Example 2", value: "6147253089"},
    {name: "Example 3", value: "8239647510"},
    {name: "Example 4", value: "7194835260"},
    {name: "Example 5", value: "4873205916"}
];

export const NUMBERS = "0123456789".split("");

/**
 * Converts a letter to uppercase (if it already isn't)
 *
 * @param {char} letter - letter to convert to uppercase
 * @returns {char}
 */
export function convToUpperCase(letter) {
    const charCode = letter.charCodeAt();
    if (97<=charCode && charCode<=122) {
        return String.fromCharCode(charCode-32);
    }
    return letter;
}

/**
 * The SIGABA machine consisting of the 3 rotor banks: cipher, control and index banks.
 */
export class SigabaMachine {

    /**
     * SigabaMachine constructor
     *
     * @param {Object[]} cipherRotors - list of CRRotors
     * @param {Object[]} controlRotors - list of CRRotors
     * @param {object[]} indexRotors - list of IRotors
     */
    constructor(cipherRotors, controlRotors, indexRotors) {
        this.cipherBank = new CipherBank(cipherRotors);
        this.controlBank = new ControlBank(controlRotors);
        this.indexBank = new IndexBank(indexRotors);
    }

    /**
     * Steps all the correct rotors in the machine.
     */
    step() {
        const controlOut = this.controlBank.goThroughControl();
        const indexOut = this.indexBank.goThroughIndex(controlOut);
        this.cipherBank.step(indexOut);
    }

    /**
     * Encrypts a letter. A space is converted to a "Z" before encryption, and a "Z" is converted to an "X". This allows spaces to be encrypted.
     *
     * @param {char} letter - letter to encrypt
     * @returns {char}
     */
    encryptLetter(letter) {
        letter = convToUpperCase(letter);
        if (letter === " ") {
            letter = "Z";
        } else if (letter === "Z") {
            letter = "X";
        }
        const encryptedLetter = this.cipherBank.encrypt(letter);
        this.step();
        return encryptedLetter;
    }

    /**
     * Decrypts a letter. A letter decrypted as a "Z" is converted to a space before it is output, since spaces are converted to "Z"s before encryption.
     *
     * @param {char} letter - letter to decrypt
     * @returns {char}
     */
    decryptLetter(letter) {
        letter = convToUpperCase(letter);
        let decryptedLetter = this.cipherBank.decrypt(letter);
        if (decryptedLetter === "Z") {
            decryptedLetter = " ";
        }
        this.step();
        return decryptedLetter;
    }

    /**
     * Encrypts a message of one or more letters
     *
     * @param {string} msg - message to encrypt
     * @returns {string}
     */
    encrypt(msg) {
        let ciphertext = "";
        for (const letter of msg) {
            ciphertext = ciphertext.concat(this.encryptLetter(letter));
        }
        return ciphertext;
    }

    /**
     * Decrypts a message of one or more letters
     *
     * @param {string} msg - message to decrypt
     * @returns {string}
     */
    decrypt(msg) {
        let plaintext = "";
        for (const letter of msg) {
            plaintext = plaintext.concat(this.decryptLetter(letter));
        }
        return plaintext;
    }

}

/**
 * The cipher rotor bank consists of 5 cipher rotors in either a forward or reversed orientation.
 */
export class CipherBank {

    /**
     * CipherBank constructor
     *
     * @param {Object[]} rotors - list of CRRotors
     */
    constructor(rotors) {
        this.rotors = rotors;
    }

    /**
     * Encrypts a letter through the cipher rotors (signal goes from left-to-right)
     *
     * @param {char} inputPos - the input position of the signal (letter to be encrypted)
     * @returns {char}
     */
    encrypt(inputPos) {
        for (const rotor of this.rotors) {
            inputPos = rotor.crypt(inputPos, "leftToRight");
        }
        return inputPos;
    }

    /**
     * Decrypts a letter through the cipher rotors (signal goes from right-to-left)
     *
     * @param {char} inputPos - the input position of the signal (letter to be decrypted)
     * @returns {char}
     */
    decrypt(inputPos) {
        const revOrderedRotors = [...this.rotors].reverse();
        for (const rotor of revOrderedRotors) {
            inputPos = rotor.crypt(inputPos, "rightToLeft");
        }
        return inputPos;
    }

    /**
     * Step the cipher rotors forward according to the inputs from the index rotors
     *
     * @param {number[]} indexInputs - the inputs from the index rotors
     */
    step(indexInputs) {
        const logicDict = {0: [0, 9], 1: [7, 8], 2: [5, 6], 3: [3, 4], 4: [1, 2]};
        const rotorsToMove = [];
        for (const key in logicDict) {
            const item = logicDict[key];
            for (const i of indexInputs) {
                if (item.includes(i)) {
                    rotorsToMove.push(this.rotors[key]);
                    break;
                }
            }
        }
        for (const rotor of rotorsToMove) {
            rotor.step();
        }
    }

}

/**
 * The control rotor bank consists of 5 control rotors in either a forward or reversed orientation. Signals to the control rotor bank always go from right-to-left.
 */
export class ControlBank {

    /**
     * ControlBank constructor. The rotors have been reversed as signals go from right-to-left through the control rotors.
     *
     * @param {Object[]} rotors - list of CRRotors
     */
    constructor(rotors) {
        this.rotors = [...rotors].reverse();
    }

    /**
     * Encrypts a letter.
     *
     * @param {char} inputPos - the input position of the signal
     * @returns {char}
     */
    crypt(inputPos) {
        for (const rotor of this.rotors) {
            inputPos = rotor.crypt(inputPos, "rightToLeft");
        }
        return inputPos;
    }

    /**
     * Gets the outputs of the control rotors. The inputs to the control rotors are always "F", "G", "H" and "I".
     *
     * @returns {number[]}
     */
    getOutputs() {
        const outputs = [this.crypt("F"), this.crypt("G"), this.crypt("H"), this.crypt("I")];
        const logicDict = {1: "B", 2: "C", 3: "DE", 4: "FGH", 5: "IJK", 6: "LMNO", 7: "PQRST", 8: "UVWXYZ", 9: "A"};
        const numberOutputs = [];
        for (const key in logicDict) {
            const item = logicDict[key];
            for (const output of outputs) {
                if (item.includes(output)) {
                    numberOutputs.push(key);
                    break;
                }
            }
        }
        return numberOutputs;
    }

    /**
     * Steps the control rotors. Only 3 of the control rotors step: one after every encryption, one after every 26, and one after every 26 squared.
     */
    step() {
        const MRotor = this.rotors[1], FRotor = this.rotors[2], SRotor = this.rotors[3];
        // 14 is the offset of "O" from "A" - the next rotor steps once the previous rotor reaches "O"
        if (FRotor.state === 14) {
            if (MRotor.state === 14) {
                SRotor.step();
            }
            MRotor.step();
        }
        FRotor.step();
    }

    /**
     * The goThroughControl function combines getting the outputs from the control rotor bank and then stepping them.
     *
     * @returns {number[]}
     */
    goThroughControl() {
        const outputs = this.getOutputs();
        this.step();
        return outputs;
    }

}

/**
 * The index rotor bank consists of 5 index rotors all placed in the forwards orientation.
 */
export class IndexBank {

    /**
     * IndexBank constructor
     *
     * @param {Object[]} rotors - list of IRotors
     */
    constructor(rotors) {
        this.rotors = rotors;
    }

    /**
     * Encrypts a number.
     *
     * @param {number} inputPos - the input position of the signal
     * @returns {number}
     */
    crypt(inputPos) {
        for (const rotor of this.rotors) {
            inputPos = rotor.crypt(inputPos);
        }
        return inputPos;
    }

    /**
     * The goThroughIndex function takes the inputs from the control rotor bank and returns the list of outputs after encryption through the index rotors.
     *
     * @param {number[]} controlInputs - inputs from the control rotors
     * @returns {number[]}
     */
    goThroughIndex(controlInputs) {
        const outputs = [];
        for (const inp of controlInputs) {
            outputs.push(this.crypt(inp));
        }
        return outputs;
    }

}

/**
 * Rotor class
 */
export class Rotor {

    /**
     * Rotor constructor
     *
     * @param {number[]} wireSetting - the wirings within the rotor: mapping from left-to-right, the index of the number in the list maps onto the number at that index
     * @param {bool} rev - true if the rotor is reversed, false if it isn't
     * @param {number} key - the starting position or state of the rotor
     */
    constructor(wireSetting, key, rev) {
        this.state = key;
        this.numMapping = this.getNumMapping(wireSetting, rev);
        this.posMapping = this.getPosMapping(rev);
    }

    /**
     * Get the number mapping from the wireSetting (only different from wireSetting if rotor is reversed)
     *
     * @param {number[]} wireSetting - the wirings within the rotors
     * @param {bool} rev - true if reversed, false if not
     * @returns {number[]}
     */
    getNumMapping(wireSetting, rev) {
        if (rev===false) {
            return wireSetting;
        } else {
            const length = wireSetting.length;
            const tempMapping = new Array(length);
            for (let i=0; i<length; i++) {
                tempMapping[wireSetting[i]] = i;
            }
            return tempMapping;
        }
    }

    /**
     * Get the position mapping (how the position numbers map onto the numbers of the rotor)
     *
     * @param {bool} rev - true if reversed, false if not
     * @returns {number[]}
     */
    getPosMapping(rev) {
        const length = this.numMapping.length;
        const posMapping = [];
        if (rev===false) {
            for (let i = this.state; i < this.state+length; i++) {
                let res = i%length;
                if (res<0) {
                    res += length;
                }
                posMapping.push(res);
            }
        } else {
            for (let i = this.state; i > this.state-length; i--) {
                let res = i%length;
                if (res<0) {
                    res += length;
                }
                posMapping.push(res);
            }
        }
        return posMapping;
    }

    /**
     * Encrypt/decrypt data. This process is identical to the rotors of cipher machines such as Enigma or Typex.
     *
     * @param {number} inputPos - the input position of the signal (the data to encrypt/decrypt)
     * @param {string} direction - one of "leftToRight" and "rightToLeft", states the direction in which the signal passes through the rotor
     * @returns {number}
     */
    cryptNum(inputPos, direction) {
        const inpNum = this.posMapping[inputPos];
        let outNum;
        if (direction === "leftToRight") {
            outNum = this.numMapping[inpNum];
        } else if (direction === "rightToLeft") {
            outNum = this.numMapping.indexOf(inpNum);
        }
        const outPos = this.posMapping.indexOf(outNum);
        return outPos;
    }

    /**
     * Steps the rotor. The number at position 0 will be moved to position 1 etc.
     */
    step() {
        const lastNum = this.posMapping.pop();
        this.posMapping.splice(0, 0, lastNum);
        this.state = this.posMapping[0];
    }

}

/**
 * A CRRotor is a cipher (C) or control (R) rotor. These rotors are identical and interchangeable. A C or R rotor consists of 26 contacts, one for each letter, and may be put into either a forwards of reversed orientation.
 */
export class CRRotor extends Rotor {

    /**
     * CRRotor constructor
     *
     * @param {string} wireSetting - the rotor wirings (string of letters)
     * @param {char} key - initial state of rotor
     * @param {bool} rev - true if reversed, false if not
     */
    constructor(wireSetting, key, rev=false) {
        wireSetting = wireSetting.split("").map(CRRotor.letterToNum);
        super(wireSetting, CRRotor.letterToNum(key), rev);
    }

    /**
     * Static function which converts a letter into its number i.e. its offset from the letter "A"
     *
     * @param {char} letter - letter to convert to number
     * @returns {number}
     */
    static letterToNum(letter) {
        return letter.charCodeAt()-65;
    }

    /**
     * Static function which converts a number (a letter's offset from "A") into its letter
     *
     * @param {number} num - number to convert to letter
     * @returns {char}
     */
    static numToLetter(num) {
        return String.fromCharCode(num+65);
    }

    /**
     * Encrypts/decrypts a letter.
     *
     * @param {char} inputPos - the input position of the signal ("A" refers to position 0 etc.)
     * @param {string} direction - one of "leftToRight" and "rightToLeft"
     * @returns {char}
     */
    crypt(inputPos, direction) {
        inputPos = CRRotor.letterToNum(inputPos);
        const outPos = this.cryptNum(inputPos, direction);
        return CRRotor.numToLetter(outPos);
    }

}

/**
 * An IRotor is an index rotor, which consists of 10 contacts each numbered from 0 to 9. Unlike C and R rotors, they cannot be put in the reversed orientation. The index rotors do not step at any point during encryption or decryption.
 */
export class IRotor extends Rotor {

    /**
     * IRotor constructor
     *
     * @param {string} wireSetting - the rotor wirings (string of numbers)
     * @param {char} key - initial state of rotor
     */
    constructor(wireSetting, key) {
        wireSetting = wireSetting.split("").map(Number);
        super(wireSetting, Number(key), false);
    }

    /**
     * Encrypts a number
     *
     * @param {number} inputPos - the input position of the signal
     * @returns {number}
     */
    crypt(inputPos) {
        return this.cryptNum(inputPos, "leftToRight");
    }

}
