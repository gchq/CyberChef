/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * Parse UNIX file permissions operation
 */
class ParseUNIXFilePermissions extends Operation {

    /**
     * ParseUNIXFilePermissions constructor
     */
    constructor() {
        super();

        this.name = "Parse UNIX file permissions";
        this.module = "Default";
        this.description = "Given a UNIX/Linux file permission string in octal or textual format, this operation explains which permissions are granted to which user groups.<br><br>Input should be in either octal (e.g. <code>755</code>) or textual (e.g. <code>drwxr-xr-x</code>) format.";
        this.infoURL = "https://wikipedia.org/wiki/File_system_permissions#Traditional_Unix_permissions";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const perms = {
            d:  false, // directory
            sl: false, // symbolic link
            np: false, // named pipe
            s:  false, // socket
            cd: false, // character device
            bd: false, // block device
            dr: false, // door
            sb: false, // sticky bit
            su: false, // setuid
            sg: false, // setgid
            ru: false, // read user
            wu: false, // write user
            eu: false, // execute user
            rg: false, // read group
            wg: false, // write group
            eg: false, // execute group
            ro: false, // read other
            wo: false, // write other
            eo: false  // execute other
        };
        let d = 0,
            u = 0,
            g = 0,
            o = 0,
            output = "",
            octal = null,
            textual = null;

        if (input.search(/\s*[0-7]{1,4}\s*/i) === 0) {
            // Input is octal
            octal = input.match(/\s*([0-7]{1,4})\s*/i)[1];

            if (octal.length === 4) {
                d = parseInt(octal[0], 8);
                u = parseInt(octal[1], 8);
                g = parseInt(octal[2], 8);
                o = parseInt(octal[3], 8);
            } else {
                if (octal.length > 0) u = parseInt(octal[0], 8);
                if (octal.length > 1) g = parseInt(octal[1], 8);
                if (octal.length > 2) o = parseInt(octal[2], 8);
            }

            perms.su = d >> 2 & 0x1;
            perms.sg = d >> 1 & 0x1;
            perms.sb = d & 0x1;

            perms.ru = u >> 2 & 0x1;
            perms.wu = u >> 1 & 0x1;
            perms.eu = u & 0x1;

            perms.rg = g >> 2 & 0x1;
            perms.wg = g >> 1 & 0x1;
            perms.eg = g & 0x1;

            perms.ro = o >> 2 & 0x1;
            perms.wo = o >> 1 & 0x1;
            perms.eo = o & 0x1;
        } else if (input.search(/\s*[dlpcbDrwxsStT-]{1,10}\s*/) === 0) {
            // Input is textual
            textual = input.match(/\s*([dlpcbDrwxsStT-]{1,10})\s*/)[1];

            switch (textual[0]) {
                case "d":
                    perms.d = true;
                    break;
                case "l":
                    perms.sl = true;
                    break;
                case "p":
                    perms.np = true;
                    break;
                case "s":
                    perms.s = true;
                    break;
                case "c":
                    perms.cd = true;
                    break;
                case "b":
                    perms.bd = true;
                    break;
                case "D":
                    perms.dr = true;
                    break;
            }

            if (textual.length > 1) perms.ru = textual[1] === "r";
            if (textual.length > 2) perms.wu = textual[2] === "w";
            if (textual.length > 3) {
                switch (textual[3]) {
                    case "x":
                        perms.eu = true;
                        break;
                    case "s":
                        perms.eu = true;
                        perms.su = true;
                        break;
                    case "S":
                        perms.su = true;
                        break;
                }
            }

            if (textual.length > 4) perms.rg = textual[4] === "r";
            if (textual.length > 5) perms.wg = textual[5] === "w";
            if (textual.length > 6) {
                switch (textual[6]) {
                    case "x":
                        perms.eg = true;
                        break;
                    case "s":
                        perms.eg = true;
                        perms.sg = true;
                        break;
                    case "S":
                        perms.sg = true;
                        break;
                }
            }

            if (textual.length > 7) perms.ro = textual[7] === "r";
            if (textual.length > 8) perms.wo = textual[8] === "w";
            if (textual.length > 9) {
                switch (textual[9]) {
                    case "x":
                        perms.eo = true;
                        break;
                    case "t":
                        perms.eo = true;
                        perms.sb = true;
                        break;
                    case "T":
                        perms.sb = true;
                        break;
                }
            }
        } else {
            throw new OperationError("Invalid input format.\nPlease enter the permissions in either octal (e.g. 755) or textual (e.g. drwxr-xr-x) format.");
        }

        output += "Textual representation: " + permsToStr(perms);
        output += "\nOctal representation:   " + permsToOctal(perms);

        // File type
        if (textual) {
            output += "\nFile type: " + ftFromPerms(perms);
        }

        // setuid, setgid
        if (perms.su) {
            output += "\nThe setuid flag is set";
        }
        if (perms.sg) {
            output += "\nThe setgid flag is set";
        }

        // sticky bit
        if (perms.sb) {
            output += "\nThe sticky bit is set";
        }

        // Permission matrix
        output += `

 +---------+-------+-------+-------+
 |         | User  | Group | Other |
 +---------+-------+-------+-------+
 |    Read |   ${perms.ru ? "X" : " "}   |   ${perms.rg ? "X" : " "}   |   ${perms.ro ? "X" : " "}   |
 +---------+-------+-------+-------+
 |   Write |   ${perms.wu ? "X" : " "}   |   ${perms.wg ? "X" : " "}   |   ${perms.wo ? "X" : " "}   |
 +---------+-------+-------+-------+
 | Execute |   ${perms.eu ? "X" : " "}   |   ${perms.eg ? "X" : " "}   |   ${perms.eo ? "X" : " "}   |
 +---------+-------+-------+-------+`;

        return output;
    }

}


/**
 * Given a permissions object dictionary, generates a textual permissions string.
 *
 * @param {Object} perms
 * @returns {string}
 */
function permsToStr(perms) {
    let str = "",
        type = "-";

    if (perms.d) type = "d";
    if (perms.sl) type = "l";
    if (perms.np) type = "p";
    if (perms.s) type = "s";
    if (perms.cd) type = "c";
    if (perms.bd) type = "b";
    if (perms.dr) type = "D";

    str = type;

    str += perms.ru ? "r" : "-";
    str += perms.wu ? "w" : "-";
    if (perms.eu && perms.su) {
        str += "s";
    } else if (perms.su) {
        str += "S";
    } else if (perms.eu) {
        str += "x";
    } else {
        str += "-";
    }

    str += perms.rg ? "r" : "-";
    str += perms.wg ? "w" : "-";
    if (perms.eg && perms.sg) {
        str += "s";
    } else if (perms.sg) {
        str += "S";
    } else if (perms.eg) {
        str += "x";
    } else {
        str += "-";
    }

    str += perms.ro ? "r" : "-";
    str += perms.wo ? "w" : "-";
    if (perms.eo && perms.sb) {
        str += "t";
    } else if (perms.sb) {
        str += "T";
    } else if (perms.eo) {
        str += "x";
    } else {
        str += "-";
    }

    return str;
}

/**
 * Given a permissions object dictionary, generates an octal permissions string.
 *
 * @param {Object} perms
 * @returns {string}
 */
function permsToOctal(perms) {
    let d = 0,
        u = 0,
        g = 0,
        o = 0;

    if (perms.su) d += 4;
    if (perms.sg) d += 2;
    if (perms.sb) d += 1;

    if (perms.ru) u += 4;
    if (perms.wu) u += 2;
    if (perms.eu) u += 1;

    if (perms.rg) g += 4;
    if (perms.wg) g += 2;
    if (perms.eg) g += 1;

    if (perms.ro) o += 4;
    if (perms.wo) o += 2;
    if (perms.eo) o += 1;

    return d.toString() + u.toString() + g.toString() + o.toString();
}


/**
 * Given a permissions object dictionary, returns the file type.
 *
 * @param {Object} perms
 * @returns {string}
 */
function ftFromPerms(perms) {
    if (perms.d) return "Directory";
    if (perms.sl) return "Symbolic link";
    if (perms.np) return "Named pipe";
    if (perms.s) return "Socket";
    if (perms.cd) return "Character device";
    if (perms.bd) return "Block device";
    if (perms.dr) return "Door";
    return "Regular file";
}

export default ParseUNIXFilePermissions;
