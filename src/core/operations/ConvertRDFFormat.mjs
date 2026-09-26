/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { getOxigraph, loadStore, serialise, inputPrefixes, INPUT_FORMATS, OUTPUT_FORMATS } from "../lib/RDF.mjs";

/**
 * Convert RDF Format operation
 */
class ConvertRDFFormat extends Operation {

    /**
     * ConvertRDFFormat constructor
     */
    constructor() {
        super();

        this.name = "Convert RDF Format";
        this.module = "Ontology";
        this.description = "Converts an ontology or other RDF data between serialisation formats, e.g. Turtle (.ttl) to RDF/XML (.rdf/.owl) for tools that only accept RDF/XML.<br><br>" +
            "The input is parsed into an in-memory RDF store and written out again, so the output contains the same triples in the new syntax.<br><br>" +
            "Supported formats: Turtle, RDF/XML, JSON-LD, N-Triples, N-Quads, TriG, N3. 'Auto' detects the input format.<br><br>" +
            "Not supported: OWL/XML (.owx), OWL Functional Syntax (.ofn), Manchester Syntax (.omn) and OBO (.obo). These are OWL syntaxes, not RDF serialisations; convert them with Protégé or ROBOT first.<br><br>" +
            "With 'Use prefixes' on, Turtle, RDF/XML and JSON-LD output use the namespace prefixes declared in the input (plus common ones such as owl, rdfs, xsd). " +
            "Named graphs are merged when writing a format that has no graphs (Turtle, RDF/XML, N-Triples, N3)." +
            "<br><br><b>Additional prefixes</b>: prefix declarations to use as well as those in the input (Turtle <code>@prefix</code>, SPARQL <code>PREFIX</code>, RDF/XML <code>xmlns:</code> or a JSON-LD <code>@context</code>). " +
            "To reuse the prefixes of the original file after a step that loses them (e.g. N-Triples), put <b>Register</b> at the start of the recipe and enter <code>$R0</code> here.";
        this.infoURL = "https://www.w3.org/TR/rdf11-primer/#section-graph-syntax";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input format",
                type: "option",
                value: INPUT_FORMATS
            },
            {
                name: "Output format",
                type: "option",
                value: ["RDF/XML", ...OUTPUT_FORMATS.filter(f => f !== "RDF/XML")]
            },
            {
                name: "Base IRI",
                type: "string",
                value: ""
            },
            {
                name: "Use prefixes",
                type: "boolean",
                value: true
            },
            {
                name: "Additional prefixes",
                type: "text",
                value: ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Promise<string>}
     */
    async run(input, args) {
        const [inputFormat, outputFormat, baseIRI, usePrefixes, additionalPrefixes] = args;
        const ox = await getOxigraph();
        const { store } = loadStore(ox, input, inputFormat, baseIRI.trim());
        return serialise(ox, store, outputFormat, usePrefixes ? inputPrefixes(input, additionalPrefixes) : null);
    }

}

export default ConvertRDFFormat;
