/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {
    getOxigraph, loadStore, inputPrefixes, allPrefixes, withPrefixes, shortenIRI, localName, preferredLabels, langMatches, INPUT_FORMATS
} from "../lib/RDF.mjs";
import { readClassHierarchy, readDescriptions, buildClassDetails } from "../lib/OntologyModel.mjs";

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
            "<b>Include class details</b> adds a reference section with one entry per class, in hierarchy order: its superclasses and definitions, its descriptions (rdfs:comment, skos:definition, dcterms:description, OBO definition) in the chosen language, " +
            "every property that applies to it through rdfs:domain on the class or an ancestor (with the range and the class it is inherited from), and its OWL restrictions (e.g. <code>hasTopping some Tomato</code>). " +
            "Properties with no domain apply to any class and are listed once at the end.<br><br>" +
            "<b>Language</b> filters descriptions (e.g. <code>en</code>, or <code>en, fr</code>; leave empty for all). Untagged text is always included. Labels prefer this language and fall back to others.<br><br>" +
            "Choose 'Markdown' and follow this operation with <b>Render Markdown</b> to read the report as a formatted document, or 'Counts CSV' followed by <b>To Table</b> ('Make first row header' ticked) to show the counts as a table." +
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
                value: ["Text report", "Markdown", "JSON", "Counts CSV"]
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
                name: "Include class details",
                type: "boolean",
                value: true
            },
            {
                name: "Language",
                type: "string",
                value: "en"
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
        const [inputFormat, output, includeTree, maxDepth, includeDetails, language, additionalPrefixes] = args;
        const lang = (language || "").trim();
        const ox = await getOxigraph();
        const { store, format } = loadStore(ox, input, inputFormat);
        const prefixes = allPrefixes(inputPrefixes(input, additionalPrefixes));

        const select = query => store.query(withPrefixes(query, prefixes), { "use_default_graph_as_union": true });
        const values = (rows, name) => [...new Set(rows.map(r => r.get(name)?.value).filter(Boolean))];
        const inLanguage = (rows, name) => [...new Set(rows.map(r => r.get(name)).filter(t => t && langMatches(t.language, lang)).map(t => t.value))];
        const short = iri => shortenIRI(iri, prefixes) || iri;
        const labels = preferredLabels(ox, store, lang || "en");
        const labelOf = iri => labels.get(iri) ?? null;

        // Ontology header
        const ontRows = select("SELECT ?o ?v ?imp WHERE { ?o a owl:Ontology OPTIONAL { ?o owl:versionIRI ?v } OPTIONAL { ?o owl:imports ?imp } }");
        const titleRows = select("SELECT ?t WHERE { ?o a owl:Ontology ; dcterms:title|dc:title|rdfs:label ?t }");
        const descRows = select("SELECT ?d WHERE { ?o a owl:Ontology ; dcterms:description|dc:description|rdfs:comment ?d }");
        const ontology = {
            iri: values(ontRows, "o"),
            versionIRI: values(ontRows, "v"),
            title: inLanguage(titleRows, "t").length ? inLanguage(titleRows, "t") : values(titleRows, "t"),
            description: inLanguage(descRows, "d"),
            imports: values(ontRows, "imp"),
        };

        // Counts
        const counts = { "Triples": store.size };
        counts["Distinct subjects"] = countOf(select("SELECT (COUNT(DISTINCT ?s) AS ?n) WHERE { ?s ?p ?o }"));
        for (const [label, pattern] of COUNTS) {
            counts[label] = countOf(select(`SELECT (COUNT(DISTINCT ?x) AS ?n) WHERE { ${pattern} }`));
        }
        counts["Named graphs"] = countOf(select("SELECT (COUNT(DISTINCT ?g) AS ?n) WHERE { GRAPH ?g { ?s ?p ?o } }"));
        if (output === "Counts CSV") {
            return ["metric,count", ...Object.entries(counts).map(([k, v]) => `${k},${v}`)].join("\n");
        }

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

        // Class hierarchy and details
        const needHierarchy = includeTree || includeDetails;
        const hierarchy = needHierarchy ? readClassHierarchy(select, labelOf) : null;
        const tree = includeTree ? classTree(hierarchy, short, labelOf, Math.max(1, maxDepth || 1)) : null;
        const details = includeDetails ?
            buildClassDetails({ select, hierarchy, short, labelOf, descriptions: readDescriptions(select, lang) }) :
            null;

        const report = { format, language: lang, ontology, counts, namespaces, tree, details };
        if (output === "JSON") {
            return JSON.stringify({
                format, language: lang, ontology, counts, namespaces,
                classHierarchy: tree ? tree.nodes : undefined,
                classes: details ? details.classes : undefined,
                propertiesForAnyClass: details ? details.anyClass : undefined,
                propertiesMatchingNoClass: details ? details.unmatched : undefined,
            }, null, 2);
        }
        if (output === "Markdown") return markdownReport(report);
        return textReport(report);
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
 * Returns "name "label"" for display, omitting the label if it only repeats the name.
 *
 * @param {string} name - prefixed name
 * @param {string|null} label
 * @param {string} iri
 * @returns {string}
 */
function nameWithLabel(name, label, iri) {
    return label && label !== localName(iri) ? `${name} "${label}"` : name;
}

/**
 * Builds the class tree (a class with several superclasses appears under each).
 *
 * @param {Object} hierarchy - from readClassHierarchy()
 * @param {function(string): string} short - IRI shortener
 * @param {function(string): string|null} labelOf
 * @param {number} maxDepth
 * @returns {{nodes: Object[], rows: {depth: number, text: string, more: number}[], truncated: boolean}}
 */
function classTree(hierarchy, short, labelOf, maxDepth) {
    const { children, roots } = hierarchy;
    const rows = [];
    let truncated = false;
    const build = (iri, depth, path) => {
        const node = { iri, label: labelOf(iri) };
        if (rows.length >= MAX_TREE_LINES) {
            truncated = true;
            return node;
        }
        rows.push({ depth, text: nameWithLabel(short(iri), labelOf(iri), iri) });
        const kids = (children.get(iri) || []).filter(k => !path.has(k));
        if (kids.length && depth + 1 >= maxDepth) {
            rows.push({ depth: depth + 1, more: kids.length });
        } else if (kids.length) {
            path.add(iri);
            node.children = kids.map(k => build(k, depth + 1, path));
            path.delete(iri);
        }
        return node;
    };
    const nodes = roots.map(r => build(r, 0, new Set()));
    return { nodes, rows, truncated };
}

/**
 * Text for a tree row that stands for subclasses below the depth limit.
 *
 * @param {number} n
 * @returns {string}
 */
function moreText(n) {
    return `… (${n} subclass${n === 1 ? "" : "es"} below max depth)`;
}

/**
 * Formats a property's range, noting when it comes from a super-property.
 *
 * @param {Object} p
 * @returns {string}
 */
function rangeText(p) {
    if (!p.range) return "(any)";
    return p.range + (p.rangeVia ? ` (via ${p.rangeVia})` : "");
}

/**
 * Formats the summary as a plain-text report.
 *
 * @param {Object} report
 * @returns {string}
 */
function textReport({ format, language, ontology, counts, namespaces, tree, details }) {
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

    if (tree) {
        out.push("", "Class hierarchy");
        if (!tree.rows.length) out.push("  (no classes)");
        for (const row of tree.rows) out.push("  " + "  ".repeat(row.depth) + (row.more ? moreText(row.more) : row.text));
        if (tree.truncated) out.push(`  … truncated at ${MAX_TREE_LINES} lines`);
    }

    if (details) {
        const flat = s => s.replace(/\s+/g, " ");
        out.push("", `Class details${language ? ` (descriptions: ${language})` : ""}`);
        if (!details.classes.length) out.push("  (no classes)");
        for (const c of details.classes) {
            const pad = "  " + "  ".repeat(c.depth);
            const sub = (label, vals) => {
                vals.forEach((v, i) => out.push(`${pad}  ${(i ? "" : label + ":").padEnd(15)}${flat(v)}`));
            };
            out.push("", pad + nameWithLabel(c.name, c.label, c.iri));
            sub("Subclass of", c.subClassOf);
            sub("Equivalent to", c.equivalentTo);
            sub("Description", c.descriptions);
            if (c.properties.length) {
                out.push(`${pad}  Properties:`);
                const nameWidth = Math.max(...c.properties.map(p => p.name.length));
                for (const p of c.properties) {
                    const notes = [
                        p.kind,
                        p.from ? `from ${p.from}` : null,
                        p.domain ? `domain ${p.domain}` : null,
                        p.domainVia ? `domain via ${p.domainVia}` : null,
                    ].filter(Boolean).join(", ");
                    out.push(`${pad}    ${p.name.padEnd(nameWidth)}  → ${rangeText(p)}  (${notes})`);
                    if (p.description) out.push(`${pad}    ${" ".repeat(nameWidth)}    ${flat(p.description)}`);
                }
            }
            if (c.restrictions.length) {
                out.push(`${pad}  Restrictions:`);
                for (const r of c.restrictions) out.push(`${pad}    ${r.text}${r.from ? `  (from ${r.from})` : ""}`);
            }
        }
        const globalList = (title, list) => {
            if (!list.length) return;
            out.push("", title);
            const nameWidth = Math.max(...list.map(p => p.name.length));
            for (const p of list) {
                out.push(`  ${p.name.padEnd(nameWidth)}  → ${p.range || "(any)"}  (${p.kind}${p.domain ? `, domain ${p.domain}` : ""})`);
                if (p.description) out.push(`  ${" ".repeat(nameWidth)}    ${flat(p.description)}`);
            }
        };
        globalList("Properties that apply to any class (no domain, or owl:Thing)", details.anyClass);
        globalList("Properties whose domain matches no class", details.unmatched);
    }
    return out.join("\n");
}

/**
 * Escapes text for Markdown (including table cells).
 *
 * @param {string} s
 * @returns {string}
 */
function md(s) {
    return String(s).replace(/\s+/g, " ").replace(/([\\`*_[\]<>#|~])/g, "\\$1");
}

/**
 * Formats an identifier or class expression as inline code.
 *
 * @param {string} s
 * @returns {string}
 */
function code(s) {
    const text = String(s).replace(/\s+/g, " ").replace(/\|/g, "\\|");
    return text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``;
}

/**
 * Formats one property as a Markdown list item: name, range and notes on one
 * line, the description on the next. (A table would be squeezed unreadably in
 * the narrow output pane once descriptions are long.)
 *
 * @param {Object} p
 * @returns {string}
 */
function propertyItem(p) {
    const name = code(p.name) + (p.label && p.label !== localName(p.iri) ? ` ${md(p.label)}` : "");
    const range = (p.range ? code(p.range) : "(any)") + (p.rangeVia ? ` via ${code(p.rangeVia)}` : "");
    const notes = [
        p.kind,
        p.from ? `from ${code(p.from)}` : null,
        p.domain ? `domain ${code(p.domain)}` : null,
        p.domainVia ? `domain via ${code(p.domainVia)}` : null,
    ].filter(Boolean).join(", ");
    return `- ${name} → ${range} — ${notes}` + (p.description ? `  \n  ${md(p.description)}` : "");
}

/**
 * Formats the summary as Markdown, for the Render Markdown operation.
 *
 * @param {Object} report
 * @returns {string}
 */
function markdownReport({ format, language, ontology, counts, namespaces, tree, details }) {
    const out = [];
    out.push(`# ${md(ontology.title[0] || "Ontology summary")}`, "");
    const field = (name, vals, asCode) => {
        if (vals.length) out.push(`- **${name}:** ${vals.map(v => asCode ? code(v) : md(v)).join(", ")}`);
    };
    field("IRI", ontology.iri.length ? ontology.iri : ["(no owl:Ontology declared)"], ontology.iri.length > 0);
    field("Version IRI", ontology.versionIRI, true);
    field("Imports", ontology.imports, true);
    field("Input format", [format]);
    if (ontology.description.length) out.push("", ...ontology.description.map(d => md(d) + "\n"));

    out.push("", "## Counts", "", "| Metric | Count |", "| --- | ---: |");
    for (const [k, v] of Object.entries(counts)) {
        if (v || k === "Triples" || k === "Classes") out.push(`| ${k} | ${v} |`);
    }

    out.push("", "## Namespaces", "", "| Prefix | Namespace | Uses |", "| --- | --- | ---: |");
    for (const n of namespaces.slice(0, 30)) {
        out.push(`| ${n.prefix !== null ? code(n.prefix + ":") : ""} | ${code(n.namespace)} | ${n.count} |`);
    }
    if (namespaces.length > 30) out.push(`| | … ${namespaces.length - 30} more | |`);

    if (tree) {
        out.push("", "## Class hierarchy", "");
        if (!tree.rows.length) out.push("(no classes)");
        for (const row of tree.rows) {
            const pad = "  ".repeat(row.depth);
            if (row.more) {
                out.push(`${pad}- ${md(moreText(row.more))}`);
            } else {
                const m = /^(\S+)(?: "(.*)")?$/.exec(row.text);
                out.push(`${pad}- ${code(m ? m[1] : row.text)}${m && m[2] ? " " + md(m[2]) : ""}`);
            }
        }
        if (tree.truncated) out.push("", `… truncated at ${MAX_TREE_LINES} lines`);
    }

    if (details) {
        out.push("", "## Classes", "");
        if (language) out.push(`Descriptions in: ${md(language)} (and untagged).`, "");
        if (!details.classes.length) out.push("(no classes)");
        for (const c of details.classes) {
            out.push(`### ${code(c.name)}${c.label && c.label !== localName(c.iri) ? " " + md(c.label) : ""}`, "");
            const lines = [];
            if (c.path.length > 1) lines.push(`**Path:** ${c.path.map(code).join(" › ")}`);
            if (c.subClassOf.length) lines.push(`**Subclass of:** ${c.subClassOf.map(code).join(", ")}`);
            if (c.equivalentTo.length) lines.push(`**Equivalent to:** ${c.equivalentTo.map(code).join(", ")}`);
            lines.push(`**IRI:** ${code(c.iri)}`);
            out.push(lines.join("  \n"), "");
            for (const d of c.descriptions) out.push(`> ${md(d)}`, "");
            if (c.properties.length) {
                out.push("**Properties**", "");
                for (const p of c.properties) out.push(propertyItem(p));
                out.push("");
            }
            if (c.restrictions.length) {
                out.push("**Restrictions**", "");
                for (const r of c.restrictions) out.push(`- ${code(r.text)}${r.from ? ` *(from ${code(r.from)})*` : ""}`);
                out.push("");
            }
        }
        const globalList = (title, list) => {
            if (!list.length) return;
            out.push(`## ${title}`, "");
            for (const p of list) out.push(propertyItem(p));
            out.push("");
        };
        globalList("Properties that apply to any class", details.anyClass);
        globalList("Properties whose domain matches no class", details.unmatched);
    }
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export default OntologySummary;
