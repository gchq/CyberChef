/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {
    getOxigraph, loadStore, inputPrefixes, allPrefixes, withPrefixes, shortenIRI, localName, preferredLabels, INPUT_FORMATS
} from "../lib/RDF.mjs";

const OWL_THING = "http://www.w3.org/2002/07/owl#Thing";
const MAX_TREE_LINES = 5000;

/** Counted metrics: label -> SPARQL pattern binding ?x. */
const COUNTS = [
    ["Classes", "{ ?x a owl:Class } UNION { ?x a rdfs:Class } FILTER(isIRI(?x))"],
    ["Object properties", "?x a owl:ObjectProperty"],
    ["Datatype properties", "?x a owl:DatatypeProperty"],
    ["Annotation properties", "?x a owl:AnnotationProperty"],
    ["RDF properties", "?x a rdf:Property"],
    ["Named individuals", "?x a owl:NamedIndividual"],
    ["Restrictions", "?x a owl:Restriction"],
    ["SKOS concepts", "?x a skos:Concept"],
    ["Deprecated terms", "?x owl:deprecated true"],
];

/**
 * Ontology Summary operation
 */
class OntologySummary extends Operation {

    /**
     * OntologySummary constructor
     */
    constructor() {
        super();

        this.name = "Ontology Summary";
        this.module = "Ontology";
        this.description = "Summarises an ontology or other RDF data: the ontology IRI, version, title and imports; counts of triples, classes, properties, individuals and restrictions; the namespaces in use; and the class hierarchy (rdfs:subClassOf between named classes) as an indented tree.<br><br>" +
            "Choose 'Counts CSV' and follow this operation with <b>To Table</b> ('Make first row header' ticked) to show the counts as a table." +
            "<br><br><b>Additional prefixes</b>: prefix declarations to use as well as those in the input (Turtle <code>@prefix</code>, SPARQL <code>PREFIX</code>, RDF/XML <code>xmlns:</code> or a JSON-LD <code>@context</code>). " +
            "To reuse the prefixes of the original file after a step that loses them (e.g. N-Triples), put <b>Register</b> at the start of the recipe and enter <code>$R0</code> here.";
        this.infoURL = "https://www.w3.org/TR/owl2-primer/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input format",
                type: "option",
                value: INPUT_FORMATS
            },
            {
                name: "Output",
                type: "option",
                value: ["Text report", "JSON", "Counts CSV"]
            },
            {
                name: "Include class hierarchy",
                type: "boolean",
                value: true
            },
            {
                name: "Max tree depth",
                type: "number",
                value: 10,
                min: 1
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
        const [inputFormat, output, includeTree, maxDepth, additionalPrefixes] = args;
        const ox = await getOxigraph();
        const { store, format } = loadStore(ox, input, inputFormat);
        const prefixes = allPrefixes(inputPrefixes(input, additionalPrefixes));

        const select = query => store.query(withPrefixes(query, prefixes), { "use_default_graph_as_union": true });
        const values = (rows, name) => [...new Set(rows.map(r => r.get(name)?.value).filter(Boolean))];
        const short = iri => shortenIRI(iri, prefixes) || iri;

        // Ontology header
        const ontRows = select("SELECT ?o ?v ?imp WHERE { ?o a owl:Ontology OPTIONAL { ?o owl:versionIRI ?v } OPTIONAL { ?o owl:imports ?imp } }");
        const titleRows = select("SELECT ?t WHERE { ?o a owl:Ontology ; dcterms:title|dc:title|rdfs:label ?t }");
        const descRows = select("SELECT ?d WHERE { ?o a owl:Ontology ; dcterms:description|dc:description|rdfs:comment ?d }");
        const ontology = {
            iri: values(ontRows, "o"),
            versionIRI: values(ontRows, "v"),
            title: values(titleRows, "t"),
            description: values(descRows, "d"),
            imports: values(ontRows, "imp"),
        };

        // Counts
        const counts = { "Triples": store.size };
        counts["Distinct subjects"] = countOf(select("SELECT (COUNT(DISTINCT ?s) AS ?n) WHERE { ?s ?p ?o }"));
        for (const [label, pattern] of COUNTS) {
            counts[label] = countOf(select(`SELECT (COUNT(DISTINCT ?x) AS ?n) WHERE { ${pattern} }`));
        }
        counts["Named graphs"] = countOf(select("SELECT (COUNT(DISTINCT ?g) AS ?n) WHERE { GRAPH ?g { ?s ?p ?o } }"));

        // Namespaces by number of IRI occurrences
        const nsCounts = new Map();
        const addIRI = t => {
            if (t.termType !== "NamedNode") return;
            const m = /^(.*[#/])[^#/]*$/.exec(t.value);
            const ns = m ? m[1] : t.value;
            nsCounts.set(ns, (nsCounts.get(ns) || 0) + 1);
        };
        for (const q of store.match()) [q.subject, q.predicate, q.object].forEach(addIRI);
        const nsToPrefix = new Map(Object.entries(prefixes).map(([name, ns]) => [ns, name]));
        const namespaces = [...nsCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([namespace, count]) => ({ namespace, prefix: nsToPrefix.get(namespace) ?? null, count }));

        // Class hierarchy
        let hierarchy = null;
        if (includeTree) {
            hierarchy = classTree(select, short, Math.max(1, maxDepth || 1), preferredLabels(ox, store));
        }

        if (output === "JSON") {
            return JSON.stringify({ format, ontology, counts, namespaces, classHierarchy: hierarchy ? hierarchy.nodes : undefined }, null, 2);
        }
        if (output === "Counts CSV") {
            return ["metric,count", ...Object.entries(counts).map(([k, v]) => `${k},${v}`)].join("\n");
        }
        return textReport(format, ontology, counts, namespaces, hierarchy);
    }

}

/**
 * Reads the ?n count from a COUNT query result.
 *
 * @param {Map<string, Object>[]} rows
 * @returns {number}
 */
function countOf(rows) {
    return rows.length ? parseInt(rows[0].get("n").value, 10) : 0;
}

/**
 * Builds the class hierarchy from rdfs:subClassOf between named classes.
 *
 * @param {function(string): Map<string, Object>[]} select
 * @param {function(string): string} short - IRI shortener
 * @param {number} maxDepth
 * @param {Map<string, string>} labels - IRI -> preferred label
 * @returns {{nodes: Object[], lines: string[], truncated: boolean}}
 */
function classTree(select, short, maxDepth, labels) {
    const classes = new Set(select("SELECT DISTINCT ?c WHERE { { ?c a owl:Class } UNION { ?c a rdfs:Class } FILTER(isIRI(?c)) }").map(r => r.get("c").value));
    const parents = new Map();
    const children = new Map();
    for (const r of select("SELECT DISTINCT ?c ?p WHERE { ?c rdfs:subClassOf ?p FILTER(isIRI(?c) && isIRI(?p) && ?c != ?p) }")) {
        const c = r.get("c").value, p = r.get("p").value;
        classes.add(c);
        if (p === OWL_THING) continue;
        classes.add(p);
        if (!parents.has(c)) parents.set(c, new Set());
        parents.get(c).add(p);
        if (!children.has(p)) children.set(p, []);
        children.get(p).push(c);
    }
    classes.delete(OWL_THING);

    const labelOf = iri => labels.get(iri) ?? null;
    const display = iri => {
        const name = short(iri), label = labelOf(iri);
        return label && label !== localName(iri) ? `${name} "${label}"` : name;
    };
    const sortKey = iri => (labelOf(iri) || localName(iri)).toLowerCase();
    const byName = (a, b) => sortKey(a).localeCompare(sortKey(b));

    // Roots: classes without a named superclass. Classes only reachable through
    // a subClassOf cycle get no root, so add one member of each such cycle.
    const roots = [...classes].filter(c => !parents.has(c)).sort(byName);
    const reached = new Set();
    const mark = (c, seen = new Set()) => {
        if (seen.has(c)) return;
        seen.add(c);
        reached.add(c);
        (children.get(c) || []).forEach(k => mark(k, seen));
    };
    roots.forEach(r => mark(r));
    for (const c of [...classes].sort(byName)) {
        if (!reached.has(c)) {
            roots.push(c);
            mark(c);
        }
    }

    const lines = [];
    let truncated = false;
    const build = (iri, depth, path) => {
        const node = { iri, label: labelOf(iri) };
        if (lines.length >= MAX_TREE_LINES) {
            truncated = true;
            return node;
        }
        lines.push("  ".repeat(depth) + display(iri));
        const kids = (children.get(iri) || []).filter(k => !path.has(k)).sort(byName);
        if (kids.length && depth + 1 >= maxDepth) {
            lines.push("  ".repeat(depth + 1) + `… (${kids.length} subclass${kids.length === 1 ? "" : "es"} below max depth)`);
        } else if (kids.length) {
            path.add(iri);
            node.children = kids.map(k => build(k, depth + 1, path));
            path.delete(iri);
        }
        return node;
    };
    const nodes = roots.map(r => build(r, 0, new Set()));
    return { nodes, lines, truncated };
}

/**
 * Formats the summary as a plain-text report.
 *
 * @param {string} format - detected input format
 * @param {Object} ontology
 * @param {Object<string, number>} counts
 * @param {Object[]} namespaces
 * @param {Object|null} hierarchy
 * @returns {string}
 */
function textReport(format, ontology, counts, namespaces, hierarchy) {
    const out = [];
    const field = (name, vals) => {
        if (vals.length) out.push(`${(name + ":").padEnd(14)}${vals.map(v => v.replace(/\s+/g, " ")).join("\n" + " ".repeat(14))}`);
    };
    out.push("Ontology");
    field("IRI", ontology.iri.length ? ontology.iri : ["(no owl:Ontology declared)"]);
    field("Version IRI", ontology.versionIRI);
    field("Title", ontology.title);
    field("Description", ontology.description);
    field("Imports", ontology.imports);
    field("Input format", [format]);

    out.push("", "Counts");
    const width = Math.max(...Object.keys(counts).map(k => k.length)) + 2;
    for (const [k, v] of Object.entries(counts)) {
        if (v || k === "Triples" || k === "Classes") out.push(`  ${k.padEnd(width)}${v}`);
    }

    out.push("", "Namespaces (by usage)");
    const prefixWidth = Math.max(0, ...namespaces.map(n => (n.prefix ?? "").length)) + 2;
    for (const n of namespaces.slice(0, 30)) {
        out.push(`  ${(n.prefix !== null ? n.prefix + ":" : "").padEnd(prefixWidth)}${n.namespace}  (${n.count})`);
    }
    if (namespaces.length > 30) out.push(`  … ${namespaces.length - 30} more`);

    if (hierarchy) {
        out.push("", "Class hierarchy");
        out.push(...(hierarchy.lines.length ? hierarchy.lines.map(l => "  " + l) : ["  (no classes)"]));
        if (hierarchy.truncated) out.push(`  … truncated at ${MAX_TREE_LINES} lines`);
    }
    return out.join("\n");
}

export default OntologySummary;
