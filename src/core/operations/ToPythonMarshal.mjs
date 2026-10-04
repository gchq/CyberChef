/**
 * @author GCHQ
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import PythonMarshal from "../lib/PythonMarshal.mjs";

/**
 * To Python Marshal operation
 */
class ToPythonMarshal extends Operation {

    /**
     * ToPythonMarshal constructor
     */
    constructor() {
        super();

        this.name = "To Python Marshal";
        this.module = "Code";
        this.description = "Encodes JSON-compatible values using CPython marshal format 4. Use <code>{&quot;_pythonMarshalType&quot;:&quot;bytes&quot;,&quot;hex&quot;:&quot;...&quot;}</code> for Python byte strings and <code>{&quot;_pythonMarshalType&quot;:&quot;int&quot;,&quot;value&quot;:&quot;...&quot;}</code> for arbitrary-size integers. Arrays encode as Python lists; objects encode as dictionaries with string keys.";
        this.infoURL = "https://docs.python.org/3/library/marshal.html";
        this.inputType = "JSON";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        return PythonMarshal.encode(input);
    }

}

export default ToPythonMarshal;
