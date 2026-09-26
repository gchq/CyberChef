/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {
    getOxigraph, loadStore, serialise, inputPrefixes, allPrefixes, withPrefixes, shortenIRI,
    INPUT_FORMATS, OUTPUT_FORMATS, RDF_FORMATS
} from "../lib/RDF.mjs";

/**
 * SPARQL Query operation
 */
class SPARQLQuery extends Operation {

    /**
     * SPARQLQuery constructor
     */
    constructor() {
        super();

        this.name = "SPARQL Query";
        this.module = "Ontology";
        this.description = "Runs a SPARQL 1.1 query against the input ontology or RDF data, which is loaded into an in-memory triple store.<br><br>" +
            "<ul><li><b>SELECT</b> returns CSV, TSV, SPARQL JSON or SPARQL XML results. To view them as a table, follow this operation with <b>To Table</b> (cell delimiter <code>,</code>, 'Make first row header' ticked).</li>" +
            "<li><b>ASK</b> returns <code>true</code> or <code>false</code>.</li>" +
            "<li><b>CONSTRUCT</b> and <b>DESCRIBE</b> return RDF in the chosen graph output format, so the result can be chained into other ontology operations.</li></ul>" +
            "Prefixes declared in the input (and common ones such as owl, rdfs, rdf, xsd, skos) are added to the query automatically, so <code>SELECT ?c WHERE { ?c a owl:Class }</code> works without PREFIX lines.<br><br>" +
            "Named graphs in TriG/N-Quads input are queried as one merged default graph." +
            "<br><br><b>Additional prefixes</b>: prefix declarations to use as well as those in the input (Turtle <code>@prefix</code>, SPARQL <code>PREFIX</code>, RDF/XML <code>xmlns:</code> or a JSON-LD <code>@context</code>). " +
            "To reuse the prefixes of the original file after a step that loses them (e.g. N-Triples), put <b>Register</b> at the start of the recipe and enter <code>$R0</code> here.";
        this.infoURL = "https://www.w3.org/TR/sparql11-query/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Query",
                type: "text",
                value: "SELECT ?class ?label WHERE {\n  ?class a owl:Class .\n  OPTIONAL { ?class rdfs:label ?label }\n}\nORDER BY ?class\nLIMIT 100"
            },
            {
                name: "Input format",
                type: "option",
                value: INPUT_FORMATS
            },
            {
                name: "Results format",
                type: "option",
                value: ["CSV", "TSV", "JSON", "XML"]
            },
            {
                name: "Shorten IRIs with prefixes",
                type: "boolean",
                value: true
            },
            {
                name: "Graph output format",
                type: "option",
                value: OUTPUT_FORMATS
            },
            {
                name: "Base IRI",
                type: "string",
                value: ""
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
        const [query, inputFormat, resultsFormat, shorten, graphFormat, baseIRI, additionalPrefixes] = args;
        if (!query.trim()) throw new OperationError("Enter a SPARQL query.");

        const ox = await getOxigraph();
        const { store } = loadStore(ox, input, inputFormat, baseIRI.trim());
        const declared = inputPrefixes(input, additionalPrefixes);
        const prefixes = allPrefixes(declared);
        const fullQuery = withPrefixes(query, prefixes);

        const options = {
            "use_default_graph_as_union": true,
            "results_format": "json",
            ...(baseIRI.trim() ? { "base_iri": baseIRI.trim() } : {})
        };

        let result;
        try {
            result = store.query(fullQuery, options);
        } catch (err) {
            const msg = err.message || String(err);
            const hint = /^\s*(INSERT|DELETE|LOAD|CLEAR|CREATE|DROP|COPY|MOVE|ADD|WITH)\b/im.test(query) ?
                "\n\nSPARQL Update (INSERT/DELETE etc.) is not supported by this operation." : "";
            throw new OperationError(`SPARQL error: ${msg}${hint}`);
        }

        // SELECT and ASK return SPARQL JSON results; CONSTRUCT and DESCRIBE return
        // the resulting graph as JSON-LD, which is loaded into a new store.
        if (!result.startsWith("{\"head\"")) {
            const graph = new ox.Store();
            graph.load(result, { format: RDF_FORMATS["JSON-LD"].mime });
            return serialise(ox, graph, graphFormat, declared);
        }

        const json = JSON.parse(result);
        if (typeof json.boolean === "boolean") {
            if (resultsFormat === "JSON") return JSON.stringify(json, null, 2);
            if (resultsFormat === "XML") return store.query(fullQuery, { ...options, "results_format": "xml" });
            return String(json.boolean);
        }

        switch (resultsFormat) {
            case "JSON":
                return JSON.stringify(json, null, 2);
            case "XML":
                return store.query(fullQuery, { ...options, "results_format": "xml" });
            case "TSV":
                return tabular(json, shorten ? prefixes : null, "\t", tsvCell);
            case "CSV":
            default:
                return tabular(json, shorten ? prefixes : null, ",", csvCell);
        }
    }

}

/**
 * Formats SPARQL JSON results as delimited text, one row per solution.
 *
 * @param {Object} json - SPARQL 1.1 JSON results
 * @param {Object<string, string>|null} prefixes - prefixes for shortening IRIs, or null
 * @param {string} delimiter
 * @param {function(string): string} escapeCell
 * @returns {string}
 */
function tabular(json, prefixes, delimiter, escapeCell) {
    const vars = json.head.vars || [];
    const rows = [vars.map(escapeCell).join(delimiter)];
    for (const binding of json.results.bindings) {
        rows.push(vars.map(v => escapeCell(termText(binding[v], prefixes))).join(delimiter));
    }
    return rows.join("\n");
}

/**
 * Returns the display text for one bound value.
 *
 * @param {Object|undefined} term - SPARQL JSON term
 * @param {Object<string, string>|null} prefixes
 * @returns {string}
 */
function termText(term, prefixes) {
    if (!term) return "";
    if (term.type === "uri") return (prefixes && shortenIRI(term.value, prefixes)) || term.value;
    if (term.type === "bnode") return "_:" + term.value;
    return term.value;
}

/**
 * Quotes a CSV cell when needed (RFC 4180).
 *
 * @param {string} value
 * @returns {string}
 */
function csvCell(value) {
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
}

/**
 * Escapes tabs and line breaks in a TSV cell.
 *
 * @param {string} value
 * @returns {string}
 */
function tsvCell(value) {
    return value.replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

export default SPARQLQuery;
