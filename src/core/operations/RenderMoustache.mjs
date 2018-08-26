/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Moustache from "mustache";

/**
 * Render Moustache operation
 */
class RenderMoustache extends Operation {

    /**
     * Render Moustache constructor
     */
    constructor() {
        super();

        this.name = "Render Moustache";
        this.module = "Default";
        this.description = "Uses a provided Moustache template in order to render a JSON value.";
        this.infoURL = "https://mustache.github.io/mustache.5.html";
        this.inputType = "JSON";
        this.outputType = "html";
        this.args = [
            {
                name: "Template",
                type: "text",
                value: "Hello {{name}}."
            },
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [template] = args;

        return Moustache.render(template, input);
    }

}

export default RenderMoustache;
