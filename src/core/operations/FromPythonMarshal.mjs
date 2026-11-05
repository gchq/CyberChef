/**
 * @author GCHQ
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import PythonMarshal from "../lib/PythonMarshal.mjs";

/**
 * From Python Marshal operation
 */
class FromPythonMarshal extends Operation {

    /**
     * FromPythonMarshal constructor
     */
    constructor() {
        super();

        this.name = "From Python Marshal";
        this.module = "Code";
        this.description = "Decodes CPython marshal data to JSON-compatible values. Supports null, booleans, numbers, strings, byte strings, lists, tuples, sets and dictionaries with string keys. Byte strings are represented as <code>{&quot;_pythonMarshalType&quot;:&quot;bytes&quot;,&quot;hex&quot;:&quot;...&quot;}</code>; integers outside JavaScript's safe range use <code>{&quot;_pythonMarshalType&quot;:&quot;int&quot;,&quot;value&quot;:&quot;...&quot;}</code>. Code objects and other Python-only values are not supported.";
        this.infoURL = "https://docs.python.org/3/library/marshal.html";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        return PythonMarshal.decode(input);
    }

}

export default FromPythonMarshal;
