/**
 * Colossus - an emulation of the world's first electronic computer
 *
 * @author VirtualColossus
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import {INIT_PATTERNS, ITA2_TABLE, ROTOR_SIZES} from "../lib/Lorenz.mjs";

/**
 * Colossus simulator class.
 */
export class ColossusComputer {
    /**
     * Construct a Colossus.
     *
     * @param {string} ciphertext
     * @param {string} pattern - named pattern of Chi, Mu and Psi wheels
     * @param {Object} qbusin - which data inputs are being sent to q bus - each can be null, plain or delta
     * @param {Object[]} qbusswitches - Q bus calculation switches, multiple rows
     * @param {Object} control - control switches which specify stepping modes
     * @param {Object} starts - rotor start positions
     */
    constructor(ciphertext, pattern, qbusin, qbusswitches, control, starts, settotal, limit) {

        this.ITAlookup = ITA2_TABLE;
        this.ReverseITAlookup = {};
        for (const letter in this.ITAlookup) {
            const code = this.ITAlookup[letter];
            this.ReverseITAlookup[code] = letter;
        }

        this.initThyratrons(pattern);

        this.ciphertext = ciphertext;
        this.qbusin = qbusin;
        this.qbusswitches = qbusswitches;
        this.control = control;
        this.starts = starts;
        this.settotal = settotal;
        this.limitations = limit;


        this.allCounters = [0, 0, 0, 0, 0];

        this.Zbits = [0, 0, 0, 0, 0]; // Z input is the cipher tape
        this.ZbitsOneBack = [0, 0, 0, 0, 0]; // for delta
        this.Qbits = [0, 0, 0, 0, 0]; // input generated for placing onto the Q-bus (the logic processor)

        this.Xbits = [0, 0, 0, 0, 0]; // X is the Chi wheel bits
        this.Xptr = [0, 0, 0, 0, 0]; // pointers to the current X bits (Chi wheels)
        this.XbitsOneBack = [0, 0, 0, 0, 0]; // the X bits one back (for delta)

        this.Sbits = [0, 0, 0, 0, 0]; // S is the Psi wheel bits
        this.Sptr = [0, 0, 0, 0, 0]; // pointers to the current S bits (Psi wheels)
        this.SbitsOneBack = [0, 0, 0, 0, 0]; // the S bits one back (for delta)

        this.Mptr = [0, 0];

        this.rotorPtrs = {};

        this.totalmotor = 0;
        this.P5Zbit = [0, 0];

    }

    /**
     * Begin a run
     * @returns {object} -
     */
    run() {

        const result = {
            printout: ""
        };

        // loop until our start positions are back to the beginning
        this.rotorPtrs = {X1: this.starts.X1, X2: this.starts.X2, X3: this.starts.X3, X4: this.starts.X4, X5: this.starts.X5, M61: this.starts.M61, M37: this.starts.M37, S1: this.starts.S1, S2: this.starts.S2, S3: this.starts.S3, S4: this.starts.S4, S5: this.starts.S5};
        // this.rotorPtrs = this.starts;
        let runcount = 1;

        const fast = this.control.fast;
        const slow = this.control.slow;

        // Print Headers
        result.printout += fast + " " + slow + "\n";

        do {

            this.allCounters = [0, 0, 0, 0, 0];
            this.ZbitsOneBack = [0, 0, 0, 0, 0];
            this.XbitsOneBack = [0, 0, 0, 0, 0];

            // Run full tape loop and process counters
            this.runTape();

            // Only print result if larger than set total
            let fastRef = "00";
            let slowRef = "00";
            if (fast !== "") fastRef = this.leftPad(this.rotorPtrs[fast], 2);
            if (slow !== "") slowRef = this.leftPad(this.rotorPtrs[slow], 2);
            let printline = "";
            for (let c=0;c<5;c++) {
                if (this.allCounters[c] > this.settotal) {
                    printline += String.fromCharCode(c+97) + this.allCounters[c]+" ";
                }
            }
            if (printline !== "") {
                result.printout += fastRef + " " + slowRef + " : ";
                result.printout += printline;
                result.printout += "\n";
            }

            // Step fast rotor if required
            if (fast !== "") {
                this.rotorPtrs[fast]++;
                if (this.rotorPtrs[fast] > ROTOR_SIZES[fast]) this.rotorPtrs[fast] = 1;
            }

            // Step slow rotor if fast rotor has returned to initial start position
            if (slow !== "" && this.rotorPtrs[fast] === this.starts[fast]) {
                this.rotorPtrs[slow]++;
                if (this.rotorPtrs[slow] > ROTOR_SIZES[slow]) this.rotorPtrs[slow] = 1;
            }

            runcount++;

        } while (JSON.stringify(this.rotorPtrs) !== JSON.stringify(this.starts));

        result.counters = this.allCounters;
        result.runcount = runcount;

        return result;
    }

    /**
     * Run tape loop
     */
    runTape() {

        let charZin = "";

        this.Xptr = [this.rotorPtrs.X1, this.rotorPtrs.X2, this.rotorPtrs.X3, this.rotorPtrs.X4, this.rotorPtrs.X5];
        this.Mptr = [this.rotorPtrs.M37, this.rotorPtrs.M61];
        this.Sptr = [this.rotorPtrs.S1, this.rotorPtrs.S2, this.rotorPtrs.S3, this.rotorPtrs.S4, this.rotorPtrs.S5];
        // console.log(this.Xptr);

        // Run full loop of all character on the input tape (Z)
        for (let i=0; i<this.ciphertext.length; i++) {
            charZin = this.ciphertext.charAt(i);

            // console.log('reading tape char #'+i+' : '+charZin);

            // Firstly, we check what inputs are specified on the Q-bus input switches
            this.getQbusInputs(charZin);

            /*
             * Pattern conditions on individual impulses. Matching patterns of bits on the Q bus.
             * This is the top section on Colussus K rack - the Q bus programming switches
             */
            this.runQbusProcessingConditional();

            /*
             * Addition of impulses.
             * This is the bottom section of Colossus K rack.
             */
            this.runQbusProcessingAddition();

            // Store Z bit impulse 5 two back required for P5 limitation
            this.P5Zbit[1] = this.P5Zbit[0];
            this.P5Zbit[0] = this.ITAlookup[charZin].split("")[4];

            // Step rotors
            this.stepThyratrons();

        }

    }

    /**
     * Step thyratron rings to simulate movement of Lorenz rotors
     * Chi rotors all step one per character
     * Motor M61 rotor steps one per character, M37 steps dependant on M61 setting
     * Psi rotors only step dependant on M37 setting + limitation
     */
    stepThyratrons() {
        let X2bPtr = this.Xptr[1]-1;
        if (X2bPtr===0) X2bPtr = ROTOR_SIZES.X2;
        let S1bPtr = this.Sptr[0]-1;
        if (S1bPtr===0) S1bPtr = ROTOR_SIZES.S1;

        // Get Chi rotor 5 two back to calculate plaintext (Z+Chi+Psi=Plain)
        let X5bPtr=this.Xptr[4]-1;
        if (X5bPtr==0) X5bPtr=ROTOR_SIZES.X5;
        X5bPtr=X5bPtr-1;
        if (X5bPtr==0) X5bPtr=ROTOR_SIZES.X5;
        // Get Psi rotor 5 two back to calculate plaintext (Z+Chi+Psi=Plain)
        let S5bPtr=this.Sptr[4]-1;
        if (S5bPtr==0) S5bPtr=ROTOR_SIZES.S5;
        S5bPtr=S5bPtr-1;
        if (S5bPtr==0) S5bPtr=ROTOR_SIZES.S5;

        const x2sw = this.limitations.X2;
        const s1sw = this.limitations.S1;
        const p5sw = this.limitations.P5;

        // Limitation calculations
        let lim=1;
        if (x2sw) lim = this.rings.X[2][X2bPtr-1];
        if (s1sw) lim = lim ^ this.rings.S[1][S1bPtr-1];

        // P5
        if (p5sw) {
            let p5lim = this.P5Zbit[1];
            p5lim = p5lim ^ this.rings.X[5][X5bPtr-1];
            p5lim = p5lim ^ this.rings.S[5][S5bPtr-1];
            lim = lim ^ p5lim;
        }

        // console.log(this.Mptr);
        // console.log(this.rings.M[2]);
        const basicmotor = this.rings.M[2][this.Mptr[0]-1];
        this.totalmotor = basicmotor;

        if (x2sw || s1sw) {
            if (basicmotor===0 && lim===1) {
                this.totalmotor = 0;
            } else {
                this.totalmotor = 1;
            }
        }

        // console.log('BM='+basicmotor+', TM='+this.totalmotor);

        // Step Chi rotors
        for (let r=0; r<5; r++) {
            this.Xptr[r]++;
            if (this.Xptr[r] > ROTOR_SIZES["X"+(r+1)]) this.Xptr[r] = 1;
        }

        if (this.totalmotor) {
            // console.log('step Psi');
            // Step Psi rotors
            for (let r=0; r<5; r++) {
                this.Sptr[r]++;
                if (this.Sptr[r] > ROTOR_SIZES["S"+(r+1)]) this.Sptr[r] = 1;
            }
        }

        // Move M37 rotor if M61 set
        if (this.rings.M[1][this.Mptr[1]-1]===1) this.Mptr[0]++;
        if (this.Mptr[0] > ROTOR_SIZES.M37) this.Mptr[0]=1;

        // Always move M61 rotor
        this.Mptr[1]++;
        if (this.Mptr[1] > ROTOR_SIZES.M61) this.Mptr[1]=1;

    }

    /**
     * Get Q bus inputs
     */
    getQbusInputs(charZin) {
        // Zbits - the bits from the current character from the cipher tape.
        this.Zbits = this.ITAlookup[charZin].split("");
        // console.log('Zbits = '+this.Zbits);
        if (this.qbusin.Z === "Z") {
            // direct Z
            this.Qbits = this.Zbits;
            // console.log('direct Z: Qbits = '+this.Qbits);
        } else if (this.qbusin.Z === "ΔZ") {
            // delta Z, the Bitwise XOR of this character Zbits + last character Zbits
            for (let b=0;b<5;b++) {
                this.Qbits[b] = this.Zbits[b] ^ this.ZbitsOneBack[b];
            }

            // console.log('delta Z: Qbits = '+this.Qbits);
        }
        this.ZbitsOneBack = this.Zbits.slice(); // copy value of object, not reference

        // console.log('Zin::Q bus now '+this.Qbits+'['+this.ReverseITAlookup[this.Qbits.join("")]+']');

        // Xbits - the current Chi wheel bits
        // console.log(this.rings.X);
        // console.log('Xptr = '+this.Xptr);

        for (let b=0;b<5;b++) {
            this.Xbits[b] = this.rings.X[b+1][this.Xptr[b]-1];
        }
        if (this.qbusin.Chi !== "") {
            // console.log('X Bits '+this.Xbits+'['+this.ReverseITAlookup[this.Xbits.join("")]+']');
            // console.log('X Char = ' + this.ReverseITAlookup[this.Xbits.join("")]);
            if (this.qbusin.Chi === "Χ") {
                // direct X added to Qbits
                for (let b=0;b<5;b++) {
                    this.Qbits[b] = this.Qbits[b] ^ this.Xbits[b];
                }
                // console.log('direct X: Qbits = '+this.Qbits);
            } else if (this.qbusin.Chi === "ΔΧ") {
                // delta X
                for (let b=0;b<5;b++) {
                    this.Qbits[b] = this.Qbits[b] ^ this.Xbits[b];
                    this.Qbits[b] = this.Qbits[b] ^ this.XbitsOneBack[b];
                }
                // console.log('delta X: Xbits = '+this.Xbits+' Xbits-1 = '+this.XbitsOneBack);
                // console.log('delta X: Qbits = '+this.Qbits);
            }
        }
        this.XbitsOneBack = this.Xbits.slice();
        // console.log('setting XbitsOneBack to '+this.Xbits);

        // console.log('Zin+Xin::Q bus now '+this.Qbits+'['+this.ReverseITAlookup[this.Qbits.join("")]+']');

        // Sbits - the current Psi wheel bits
        // console.log(this.rings.S);
        // console.log('Sptr = '+this.Sptr);
        for (let b=0;b<5;b++) {
            this.Sbits[b] = this.rings.S[b+1][this.Sptr[b]-1];
        }
        if (this.qbusin.Psi !== "") {
            // console.log('S Bits '+this.Sbits+'['+this.ReverseITAlookup[this.Sbits.join("")]+']');
            // console.log('S Char = ' + this.ReverseITAlookup[this.Sbits.join("")]);
            if (this.qbusin.Psi === "Ψ") {
                // direct S added to Qbits
                for (let b=0;b<5;b++) {
                    this.Qbits[b] = this.Qbits[b] ^ this.Sbits[b];
                }
                // console.log('direct S: Qbits = '+this.Qbits);
            } else if (this.qbusin.Psi === "ΔΨ") {
                // delta S
                for (let b=0;b<5;b++) {
                    this.Qbits[b] = this.Qbits[b] ^ this.Sbits[b];
                    this.Qbits[b] = this.Qbits[b] ^ this.SbitsOneBack[b];
                }
                // console.log('delta S: Qbits = '+this.Qbits);
            }
        }
        this.SbitsOneBack = this.Sbits.slice();

        // console.log('Q bus now '+this.Qbits+'['+this.ReverseITAlookup[this.Qbits.join("")]+']');
    }

    /**
     * Conditional impulse Q bus section
     */
    runQbusProcessingConditional() {
        const cnt = [-1, -1, -1, -1, -1];
        const numrows = this.qbusswitches.condition.length;

        for (let r=0;r<numrows;r++) {
            const row = this.qbusswitches.condition[r];
            if (row.Counter !== "") {
                let result = true;
                const cPnt = row.Counter-1;
                const Qswitch = this.readBusSwitches(row.Qswitches);
                // Match switches to bit pattern
                for (let s=0;s<5;s++) {
                    if (Qswitch[s] >= 0 && Qswitch[s] !== this.Qbits[s]) result = false;
                }
                // Check for NOT switch
                if (row.Negate) result = !result;

                // AND each row to get final result
                if (cnt[cPnt] === -1) {
                    cnt[cPnt] = (result?1:0);
                } else if (result === 0) {
                    cnt[cPnt] = 0;
                }
            }
        }

        // Negate the whole column, this allows A OR B by doing NOT(NOT A AND NOT B)
        for (let c=0;c<5;c++) {
            if (this.qbusswitches.condNegateAll) cnt[c] = !cnt[c];

            if (this.qbusswitches.totalMotor === "" || (this.qbusswitches.totalMotor === "x" && this.totalmotor === 0) || (this.qbusswitches.totalMotor === "." && this.totalmotor === 1)) {
                if (cnt[c]===1) this.allCounters[c]++;
            }

        }

    }

    /**
     * Addition of impulses Q bus section
     */
    runQbusProcessingAddition() {
        const row = this.qbusswitches.addition[0];
        const Qswitch = row.Qswitches.slice();
        if (row.C1) {
            let addition = 0;
            for (let s=0;s<5;s++) {
                // XOR addition
                if (Qswitch[s]) {
                    addition = addition ^ this.Qbits[s];
                }
            }
            const equals = (row.Equals===""?-1:(row.Equals==="."?0:1));
            if (addition === equals) {
                this.allCounters[0]++;
            }
        }
        // console.log("counter1="+this.allCounters[0]);
    }

    /**
     * Initialise thyratron rings
     * These hold the pattern of 1s & 0s for each rotor on banks of thyraton GT1C valves which act as a one-bit store.
     */
    initThyratrons(pattern) {
        this.rings = {
            X: {
                1: INIT_PATTERNS[pattern].X[1].slice().reverse(),
                2: INIT_PATTERNS[pattern].X[2].slice().reverse(),
                3: INIT_PATTERNS[pattern].X[3].slice().reverse(),
                4: INIT_PATTERNS[pattern].X[4].slice().reverse(),
                5: INIT_PATTERNS[pattern].X[5].slice().reverse()
            },
            M: {
                1: INIT_PATTERNS[pattern].M[1].slice().reverse(),
                2: INIT_PATTERNS[pattern].M[2].slice().reverse(),
            },
            S: {
                1: INIT_PATTERNS[pattern].S[1].slice().reverse(),
                2: INIT_PATTERNS[pattern].S[2].slice().reverse(),
                3: INIT_PATTERNS[pattern].S[3].slice().reverse(),
                4: INIT_PATTERNS[pattern].S[4].slice().reverse(),
                5: INIT_PATTERNS[pattern].S[5].slice().reverse()
            }
        };
    }

    /**
     * Left Pad number
     */
    leftPad(number, targetLength) {
        let output = number + "";
        while (output.length < targetLength) {
            output = "0" + output;
        }
        return output;
    }

    /**
     * Read argument bus switches X & . and convert to 1 & 0
     */
    readBusSwitches(row) {
        const output = [-1, -1, -1, -1, -1];
        for (let c=0;c<5;c++) {
            if (row[c]===".") output[c] = 0;
            if (row[c]==="x") output[c] = 1;
        }
        return output;
    }

}
