/**
 * @author kendallgoto [k@kgo.to]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import KaitaiStructCompiler from "kaitai-struct-compiler";
import { KaitaiStream } from "kaitai-struct";
import YAML from "yaml";

/**
 * Kaitai Struct Decode operation
 */
class KaitaiStructDecode extends Operation {

    /**
     * KaitaiStructDecode constructor
     */
    constructor() {
        super();

        this.name = "Kaitai Struct Decode";
        this.module = "Kaitai";
        this.description = "Using a Kaitai Struct schema definition, read the provided input binary data into an annotated structure.";
        this.infoURL = "https://kaitai.io/";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.presentType = "string";
        this.args = [
            {
                name: "Kaitai definition (.ksy)",
                type: "text",
                value: "seq:\n- id: value\n  type: u2"
            },
            {
                "name": "Ignore errors",
                "type": "boolean",
                "value": false
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {Object}
     */
    async run(input, args) {
        const [ksyDef, errorsOk] = args;
        let ksyDefObj = {};
        try {
            // apply some default headers to simplify what the user has to provide
            ksyDefObj = YAML.parse(ksyDef);
            ksyDefObj.meta = Object.assign(
                { "file-extension": "none", "endian": "le", "bit-endian": "be"},
                ksyDefObj.meta
            );
            // ensure id is always 'generated' for deterministic output class / file name
            ksyDefObj.meta.id = "generated";
        } catch (err) {
            throw new OperationError(err);
        }

        let parsed = {};
        try {
            const files = await KaitaiStructCompiler.compile("javascript", ksyDefObj, null, true);
            const ctx = {
                Generated: {},
                KaitaiStream: KaitaiStream
            };
            // for dynamic include, modify the wrapper function to store our generated content in a well-defined context object
            // eslint-disable-next-line no-eval
            eval(files["Generated.js"].replace(/\(root, factory\) {/g, "(_, factory) { return factory(ctx.Generated, ctx.KaitaiStream);"));
            parsed = new ctx.Generated.Generated(new KaitaiStream(input));
            parsed._read();
        } catch (err) {
            if (!errorsOk) {
                throw new OperationError(err);
            }
        }

        return this.cleanKaitai(parsed.constructor, parsed);
    }

    /**
     * Given a Kaitai Struct object, clean it up by removing Kaitai internal keys
     * while annotating values using the underlying debug data
     *
     * @param {Object} inp Raw Kaitai Object
     * @returns {Object} Cleaned object
     */
    cleanKaitai(baseobj, inp, debug=null) {
        if (typeof inp !== "object" || !inp) { // Replace primitives with annotated, wrapped objects
            let out;
            switch (typeof inp) {
                case "string": out = new String(inp); break;
                case "number": out = new Number(inp); break;
                case "boolean": out = new Boolean(inp); break;
            }
            // values that are assigned to enumerations should receive their enum type and string value as annotations
            if (debug && "enumName" in debug) {
                let enumParent = baseobj;
                const enumPath = debug.enumName.split(".").slice(1);
                const enumTypeName = enumPath.pop();
                enumPath.forEach(path => enumParent = enumParent[path]);
                out._type = enumTypeName;
                out._valstr = enumParent[enumTypeName][out];
            }
            out.start = debug.start;
            out.end = debug.end;
            return out;
        } else if (Array.isArray(inp) || ArrayBuffer.isView(inp)) { // Recursively clean arrays of elements
            const out = [];
            for (let i = 0; i < inp.length; i++) {
                let elementDebug = {};
                if ("arr" in debug) {
                    elementDebug = debug.arr[i];
                } else if (ArrayBuffer.isView(inp)) {
                    // for ArrayBuffers, Kaitai doesn't add debug arguments since all elements are fixed-size
                    // instead, we can look at the ArrayBuffer parameters
                    elementDebug = {
                        start: debug.start + (i * inp.BYTES_PER_ELEMENT),
                        end: debug.start + (i * inp.BYTES_PER_ELEMENT) + inp.BYTES_PER_ELEMENT
                    };
                }
                out.push(this.cleanKaitai(baseobj, inp[i], elementDebug));
            }
            Object.defineProperty(out, "start", {
                value: debug.start,
                enumerable: false
            });
            Object.defineProperty(out, "end", {
                value: debug.end,
                enumerable: false
            });
            return out;
        } else { // Recursively clean each key in objects
            const out = {};
            Object.defineProperty(out, "_type", {
                value: inp.constructor.name,
                enumerable: false
            });
            if (debug) {
                Object.defineProperty(out, "start", {
                    value: debug.start,
                    enumerable: false
                });
                Object.defineProperty(out, "end", {
                    value: debug.end,
                    enumerable: false
                });
            }
            for (const [key, value] of Object.entries(inp)) {
                // debug structure contains all real keys; ignoring Kaitai internal objects or type parametrization values
                if (!(key in inp._debug)) continue;
                out[key] = this.cleanKaitai(baseobj, value, inp._debug[key]);
            }
            return out;
        }
    }

    /**
     * Given a Kaitai Struct object, walk the structure to provide printout with type annotations
     *
     * @param {Object} inp Raw Kaitai Object
     * @param {Number} indent Current depth in printout for prefixed whitespace
     * @returns {string} Formatted printout text
     */
    printKaitai(inp, indent=0) {
        if (typeof inp !== "object") {
            return "";
        } else {
            let out = "";
            for (const [key, value] of Object.entries(inp)) {
                if (value.toString() !== "[object Object]" && !Array.isArray(value)) {
                    if ("_valstr" in value)
                        out += `${"\t".repeat(indent)}${key}[${value.start}:${value.end ?? ""}]: ${value._valstr} (${value.valueOf()})\n`;
                    else
                        out += `${"\t".repeat(indent)}${key}[${value.start}:${value.end ?? ""}]: ${value.valueOf()}\n`;
                } else {
                    if ("_type" in value)
                        out += `${"\t".repeat(indent)}${key}[${value.start}:${value.end ?? ""}]: [${value._type}]\n`;
                    else if ("start" in value)
                        out += `${"\t".repeat(indent)}${key}[${value.start}:${value.end ?? ""}]:\n`;
                    else
                        out += `${"\t".repeat(indent)}${key}:\n`;
                    out += this.printKaitai(value, indent+1);
                }
            }
            return out;
        }
    }

    /**
     * Creates an annotated tree of a Kaitai object by walking the structure and expanding debug
     * annotations including type hints, binary offsets, and enum strings
     *
     * @param {Object} o Kaitai result object with debug annotations applied
     * @returns {string} Annotated tree of the Kaitai structure
     */
    present(o) {
        return this.printKaitai(o, 0);
    }

}

export default KaitaiStructDecode;
