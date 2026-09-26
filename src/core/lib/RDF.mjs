/**
 * RDF / ontology helpers shared by the ontology operations.
 *
 * Input text is loaded into an in-memory Oxigraph store (WASM), queried or
 * transformed there, and serialised back out. Oxigraph handles parsing,
 * SPARQL and most serialisations; @rdfjs/serializer-turtle is used for
 * human-readable Turtle (prefixes, nested blank nodes, lists).
 *
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import * as oxigraphModule from "oxigraph";
import TurtleSerializer from "@rdfjs/serializer-turtle/lib/TurtleSerializer.js";
import OperationError from "../errors/OperationError.mjs";

/**
 * Supported RDF serialisations, keyed by display name.
 * `dataset` formats can hold named graphs; the rest hold triples only.
 */
export const RDF_FORMATS = {
    "Turtle": { mime: "text/turtle", dataset: false },
    "RDF/XML": { mime: "application/rdf+xml", dataset: false },
    "JSON-LD": { mime: "application/ld+json", dataset: true },
    "N-Triples": { mime: "application/n-triples", dataset: false },
    "N-Quads": { mime: "application/n-quads", dataset: true },
    "TriG": { mime: "application/trig", dataset: true },
    "N3": { mime: "text/n3", dataset: false },
};

export const OUTPUT_FORMATS = Object.keys(RDF_FORMATS);
export const INPUT_FORMATS = ["Auto", ...OUTPUT_FORMATS];

/** Common vocabularies, used when the input does not declare them itself. */
export const WELL_KNOWN_PREFIXES = {
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    owl: "http://www.w3.org/2002/07/owl#",
    xsd: "http://www.w3.org/2001/XMLSchema#",
    skos: "http://www.w3.org/2004/02/skos/core#",
    dc: "http://purl.org/dc/elements/1.1/",
    dcterms: "http://purl.org/dc/terms/",
    foaf: "http://xmlns.com/foaf/0.1/",
    schema: "https://schema.org/",
    prov: "http://www.w3.org/ns/prov#",
    sh: "http://www.w3.org/ns/shacl#",
};

const UNSUPPORTED_HINT = "Only RDF serialisations (Turtle, RDF/XML, JSON-LD, N-Triples, N-Quads, TriG, N3) are supported. " +
    "Convert the file to RDF/XML or Turtle first, e.g. with Protégé ('Save as') or ROBOT ('robot convert').";

let oxigraphReady = null;

/**
 * Returns the Oxigraph module, initialising the WASM binary on first use.
 * The browser build exports an async default `init`; the Node build is
 * ready as soon as it is imported.
 *
 * @returns {Promise<Object>}
 */
export function getOxigraph() {
    if (!oxigraphReady) {
        oxigraphReady = (async () => {
            // Oxigraph uses Web Crypto for random blank node ids. Node 18 does
            // not expose it globally (browsers and Node 19+ do).
            if (typeof globalThis.crypto === "undefined" && typeof process !== "undefined" && process.versions?.node) {
                const { webcrypto } = await import(/* webpackIgnore: true */ "crypto");
                globalThis.crypto = webcrypto;
            }
            if (typeof oxigraphModule.default === "function") {
                // Browser build: webpack inlines the WASM as base64 (see
                // webpack.config.js), as the default URL-based loading fails in the worker.
                const { default: wasmBase64 } = await import("oxigraph/web_bg.wasm");
                const bytes = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
                await oxigraphModule.default({ "module_or_path": bytes });
            }
            return oxigraphModule.Store ? oxigraphModule : oxigraphModule.default;
        })();
        oxigraphReady.catch(() => {
            oxigraphReady = null;
        });
    }
    return oxigraphReady;
}

/**
 * Throws if the text is an OWL syntax that is not an RDF serialisation.
 *
 * @param {string} text
 * @throws {OperationError}
 */
function rejectNonRDFSyntaxes(text) {
    let name = null;
    if (/^\s*<(\?xml|!|[A-Za-z])/.test(text) && !/<([\w.-]+:)?RDF[\s>]/.test(text) &&
        (/\bontologyIRI\s*=/.test(text) || /<([\w.-]+:)?Declaration[\s>]/.test(text))) {
        name = "OWL/XML";
    } else if (/^\s*(Prefix|Ontology)\s*\(/m.test(text)) {
        name = "OWL Functional Syntax";
    } else if (/^\s*(Ontology|Class|ObjectProperty|DataProperty|AnnotationProperty|Individual):\s/m.test(text)) {
        name = "OWL Manchester Syntax";
    } else if (/^format-version:/m.test(text) || /^\[Term\]\s*$/m.test(text)) {
        name = "OBO";
    }
    if (name) {
        throw new OperationError(`The input looks like ${name}, which is not an RDF serialisation. ${UNSUPPORTED_HINT}`);
    }
}

/**
 * Guesses which RDF formats to try for the given text, most likely first.
 * Turtle's parser also accepts N-Triples, so that is not listed separately.
 *
 * @param {string} text
 * @returns {string[]} format names from RDF_FORMATS
 * @throws {OperationError} if the text is an unsupported OWL syntax
 */
export function detectFormats(text) {
    rejectNonRDFSyntaxes(text);
    const t = text.trimStart();
    // An RDF/XML root element always carries attributes (at least xmlns); a
    // Turtle/N-Triples line starting with an IRI such as "<a> <b> <c> ." does not.
    if (t.startsWith("<?xml") || t.startsWith("<!") || /^<[A-Za-z_][\w.-]*(:[\w.-]+)?\s+[\w.:-]+\s*=\s*["']/.test(t)) return ["RDF/XML"];
    if (t.startsWith("{") || /^\[\s*[{\]]/.test(t)) return ["JSON-LD"];
    if (/=>|@forAll|@forSome/.test(t)) return ["N3", "Turtle"];
    if (/^\s*(GRAPH\s+)?(<[^>]*>|[\w.-]*:[\w.-]*)?\s*\{/im.test(t)) return ["TriG", "Turtle"];
    return ["Turtle", "N-Quads", "TriG"];
}

/**
 * Parses RDF text into a new Oxigraph store.
 *
 * @param {Object} ox - Oxigraph module from getOxigraph()
 * @param {string} text - serialised RDF
 * @param {string} format - "Auto" or a key of RDF_FORMATS
 * @param {string} [baseIRI] - base IRI for resolving relative IRIs
 * @returns {{store: Object, format: string}} the store and the format that parsed
 * @throws {OperationError}
 */
export function loadStore(ox, text, format, baseIRI = "") {
    if (!text || !text.trim()) throw new OperationError("No RDF input to parse.");
    text = text.replace(/^\uFEFF/, "");
    const candidates = format === "Auto" ? detectFormats(text) : [format];

    let firstError = null;
    for (const candidate of candidates) {
        const store = new ox.Store();
        const options = { format: RDF_FORMATS[candidate].mime, ...(baseIRI ? { "base_iri": baseIRI } : {}) };
        try {
            store.load(text, options);
            return { store, format: candidate };
        } catch (err) {
            if (!firstError) firstError = { format: candidate, message: err.message || String(err) };
        }
    }

    let msg = `Could not parse the input as ${firstError.format}: ${firstError.message}`;
    if (/relative IRI|No scheme found/i.test(firstError.message) && !baseIRI) {
        msg += "\n\nThe input contains relative IRIs. Set the 'Base IRI' argument (e.g. http://example.org/).";
    } else if (format === "Auto") {
        msg += "\n\nIf the format was detected wrongly, choose it in the 'Input format' argument.";
    }
    throw new OperationError(msg);
}

/**
 * Collects the namespace prefixes declared in the input text (Turtle/TriG/N3
 * and SPARQL-style PREFIX lines, RDF/XML xmlns attributes, JSON-LD @context).
 *
 * @param {string} text
 * @returns {Object<string, string>} prefix -> namespace IRI
 */
export function extractPrefixes(text) {
    const prefixes = {};
    const wellKnown = new Set(Object.values(WELL_KNOWN_PREFIXES));
    const add = (name, ns) => {
        // A default namespace (e.g. RDF/XML xmlns="...owl#") that is a common
        // vocabulary is better written with its usual prefix name.
        if (name === "" && wellKnown.has(ns)) return;
        if (!(name in prefixes) && /^[a-z][\w:/.#-]*[#/:]$/i.test(ns) && /^([A-Za-z][\w.-]*)?$/.test(name)) {
            prefixes[name] = ns;
        }
    };

    for (const m of text.matchAll(/(?:@prefix|\bPREFIX)\s+([A-Za-z][\w.-]*)?:\s*<([^>\s]*)>/gi)) {
        add(m[1] || "", m[2]);
    }
    for (const m of text.matchAll(/\bxmlns(?::([A-Za-z_][\w.-]*))?\s*=\s*["']([^"']*)["']/g)) {
        add(m[1] || "", m[2]);
    }
    const trimmed = text.trimStart();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
            collectJSONLDContexts(JSON.parse(text), add);
        } catch (e) {
            // Not valid JSON: nothing to collect.
        }
    }
    return prefixes;
}

/**
 * Combines prefixes found in the input with prefixes given explicitly in an
 * operation argument (declarations in any syntax extractPrefixes reads, e.g.
 * a whole original file stored with the Register operation as $R0).
 * Explicit prefixes win; an input prefix is dropped if its name or namespace
 * is already taken.
 *
 * @param {string} input
 * @param {string} additional
 * @returns {Object<string, string>}
 */
export function inputPrefixes(input, additional = "") {
    const result = extractPrefixes(additional || "");
    const namespaces = new Set(Object.values(result));
    for (const [name, ns] of Object.entries(extractPrefixes(input))) {
        if (!(name in result) && !namespaces.has(ns)) {
            result[name] = ns;
            namespaces.add(ns);
        }
    }
    return result;
}

/**
 * Walks a JSON-LD document and adds string-valued @context entries.
 *
 * @param {*} node
 * @param {function(string, string)} add
 */
function collectJSONLDContexts(node, add) {
    if (Array.isArray(node)) {
        node.forEach(n => collectJSONLDContexts(n, add));
    } else if (node && typeof node === "object") {
        const contexts = [].concat(node["@context"] || []);
        for (const ctx of contexts) {
            if (ctx && typeof ctx === "object") {
                for (const [k, v] of Object.entries(ctx)) {
                    if (typeof v === "string" && !k.startsWith("@")) add(k, v);
                    if (k === "@vocab" && typeof v === "string") add("", v);
                }
            }
        }
        if (node["@graph"]) collectJSONLDContexts(node["@graph"], add);
    }
}

/**
 * Builds the prefix map to use for output: prefixes declared in the input,
 * then well-known ones, keeping only namespaces that the data actually uses
 * and at most one prefix per namespace.
 *
 * @param {Iterable<Object>} quads
 * @param {Object<string, string>} declared
 * @returns {Object<string, string>}
 */
export function usedPrefixes(quads, declared = {}) {
    const iris = new Set();
    const addTerm = t => {
        if (!t) return;
        if (t.termType === "NamedNode") iris.add(t.value);
        else if (t.termType === "Literal" && t.datatype) iris.add(t.datatype.value);
        else if (t.termType === "Quad") [t.subject, t.predicate, t.object].forEach(addTerm);
    };
    for (const q of quads) [q.subject, q.predicate, q.object, q.graph].forEach(addTerm);

    const result = {};
    const seenNs = new Set();
    for (const [name, ns] of [...Object.entries(declared), ...Object.entries(WELL_KNOWN_PREFIXES)]) {
        if (name in result || seenNs.has(ns)) continue;
        for (const iri of iris) {
            if (iri.startsWith(ns) && iri.length > ns.length) {
                result[name] = ns;
                seenNs.add(ns);
                break;
            }
        }
    }
    return result;
}

// Conservative subset of Turtle's PN_LOCAL: anything needing escapes stays a full IRI.
const SAFE_LOCAL_NAME = /^(?:[A-Za-z0-9_\u00C0-\uFFFF](?:[A-Za-z0-9_.\-\u00B7\u00C0-\uFFFF]*[A-Za-z0-9_\-\u00B7\u00C0-\uFFFF])?)?$/;

/**
 * Shortens an IRI to prefix:local form if the prefix map allows it and the
 * local part is a valid Turtle/SPARQL local name.
 *
 * @param {string} iri
 * @param {Object<string, string>} prefixes
 * @returns {string|null} the prefixed name, or null if it cannot be shortened
 */
export function shortenIRI(iri, prefixes) {
    let best = null;
    for (const [name, ns] of Object.entries(prefixes)) {
        if (iri.startsWith(ns) && (!best || ns.length > best[1].length)) best = [name, ns];
    }
    if (!best) return null;
    const local = iri.slice(best[1].length);
    return SAFE_LOCAL_NAME.test(local) ? `${best[0]}:${local}` : null;
}

/**
 * Returns a store holding every quad of the input moved into the default
 * graph, for serialising datasets to triple-only formats.
 *
 * @param {Object} ox
 * @param {Object} store
 * @returns {Object}
 */
function flattenToDefaultGraph(ox, store) {
    const flat = new ox.Store();
    for (const q of store.match()) {
        flat.add(ox.quad(q.subject, q.predicate, q.object, ox.defaultGraph()));
    }
    return flat;
}

/**
 * Serialises Turtle with prefixes, nested blank nodes and collections.
 *
 * @param {Object} ox
 * @param {Object[]} quads
 * @param {Object<string, string>} prefixes
 * @returns {string}
 */
function prettyTurtle(ox, quads, prefixes) {
    const entries = Object.entries(prefixes).map(([name, ns]) => [name, ox.namedNode(ns)]);
    const serializer = new TurtleSerializer(quads, { prefixes: entries });
    // The library shortens any IRI that starts with a namespace, even when the
    // local part is not a valid Turtle local name (e.g. "ex:a(1)"). Refuse those.
    serializer.prefixes.shrink = term => {
        // rdf:type is written as "a" and lists as "( )", so these terms should
        // not pull in an rdf: prefix on their own.
        if (!term || LIST_AND_TYPE_TERMS.has(term.value)) return null;
        const short = shortenIRI(term.value, prefixes);
        return short === null ? null : { termType: "NamedNode", value: short };
    };
    // The library only writes a blank node at the top level if it is referenced
    // other than exactly once, expecting single-use nodes to be nested inside
    // their referrer. Blank nodes in a cycle (a -> b -> a) are then never
    // written. Give one node per such cycle an extra ref so it gets a label.
    // Referrers are taken from the triples: the library's own refs also hold
    // list-structure links, which would show false cycles.
    const referrers = new Map();
    for (const q of quads) {
        if (q.object.termType !== "BlankNode") continue;
        if (!referrers.has(q.object.value)) referrers.set(q.object.value, new Set());
        referrers.get(q.object.value).add(q.subject.termType === "BlankNode" ? q.subject.value : null);
    }
    const nodesByLabel = new Map([...serializer.tree.subjects.values()]
        .filter(n => n.term.termType === "BlankNode")
        .map(n => [n.term.value, n]));
    const patched = new Set();
    for (const [label, node] of nodesByLabel) {
        if (node.refs.length !== 1 || node.isListItem || node.isListValue) continue;
        const seen = new Set();
        let current = label;
        while (current !== null && !seen.has(current) && !patched.has(current)) {
            seen.add(current);
            const refs = referrers.get(current);
            current = refs && refs.size === 1 ? [...refs][0] : null;
        }
        // Back at the start without reaching an IRI or a shared blank node: a cycle.
        // One labelled node per cycle is enough for the rest to nest under it.
        if (current === label) {
            node.refs.push(node);
            patched.add(label);
        }
    }
    // A subject with only rdf:type comes out as "<s> a owl:Ontology;\n." (valid
    // but untidy). Literals are always single-line escaped, so this is safe.
    return serializer.serialize().join("").replace(/;\n(\s*)\./g, "$1.");
}

const RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
const RDF_LANG_STRING = RDF_NS + "langString";
const LIST_AND_TYPE_TERMS = new Set(["type", "first", "rest", "nil"].map(t => RDF_NS + t));
const NCNAME = /^[A-Za-z_À-￿][\w.\-·À-￿]*$/;

/**
 * Escapes text content for XML.
 *
 * @param {string} s
 * @returns {string}
 */
function xmlText(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#13;");
}

/**
 * Escapes an XML attribute value (double-quoted).
 *
 * @param {string} s
 * @returns {string}
 */
function xmlAttr(s) {
    return xmlText(s).replace(/"/g, "&quot;").replace(/\n/g, "&#10;").replace(/\t/g, "&#9;");
}

/**
 * Serialises triples as RDF/XML in the style Protégé writes: namespaces
 * declared once on rdf:RDF, typed node elements (e.g. owl:Class), blank nodes
 * that are used once nested in place, and well-formed lists written with
 * rdf:parseType="Collection".
 *
 * @param {Object[]} quads - triples (graph names are ignored)
 * @param {Object<string, string>} declared - prefixes declared in the input
 * @returns {string}
 */
function prettyRDFXML(quads, declared) {
    const prefixes = usedPrefixes(quads, declared);
    for (const [name, ns] of Object.entries(prefixes)) {
        if (ns === RDF_NS || name === "rdf") delete prefixes[name];
    }
    prefixes.rdf = RDF_NS;
    const nsToPrefix = new Map(Object.entries(prefixes).map(([name, ns]) => [ns, name]));
    let generated = 0;

    /**
     * Returns the XML qualified name for an IRI, declaring a namespace if needed.
     *
     * @param {string} iri
     * @param {boolean} required - throw if no qualified name is possible
     * @returns {string|null}
     */
    const qname = (iri, required) => {
        let best = null;
        for (const [ns, name] of nsToPrefix) {
            const local = iri.slice(ns.length);
            if (iri.startsWith(ns) && NCNAME.test(local) && (!best || ns.length > best[0].length)) best = [ns, name, local];
        }
        if (best) return best[1] ? `${best[1]}:${best[2]}` : best[2];
        const m = /^(.*[#/])([A-Za-z_À-￿][\w.\-·À-￿]*)$/.exec(iri);
        if (!m) {
            if (required) {
                throw new OperationError(`The predicate <${iri}> cannot be written as RDF/XML because it does not end in a valid XML name. Choose another output format.`);
            }
            return null;
        }
        let name;
        do {
            name = `ns${generated++}`;
        } while (name in prefixes);
        prefixes[name] = m[1];
        nsToPrefix.set(m[1], name);
        return `${name}:${m[2]}`;
    };

    const key = t => (t.termType === "BlankNode" ? "_:" : "") + t.value;
    const subjects = new Map();
    const blankRefs = new Map();
    for (const q of quads) {
        if (q.subject.termType === "Quad" || q.object.termType === "Quad") {
            throw new OperationError("RDF/XML cannot represent RDF-star quoted triples. Choose another output format.");
        }
        const k = key(q.subject);
        if (!subjects.has(k)) subjects.set(k, { term: q.subject, props: [] });
        subjects.get(k).props.push(q);
        if (q.object.termType === "BlankNode") blankRefs.set(q.object.value, (blankRefs.get(q.object.value) || 0) + 1);
    }

    const nodeIds = new Map();
    const nodeId = value => {
        if (!nodeIds.has(value)) nodeIds.set(value, `b${nodeIds.size}`);
        return nodeIds.get(value);
    };
    const written = new Set();
    const nestable = t => t.termType === "BlankNode" && blankRefs.get(t.value) === 1 && !written.has("_:" + t.value);

    /**
     * Returns the items of a well-formed list starting at a blank node, or null.
     *
     * @param {Object} head
     * @returns {Object[]|null}
     */
    const listItems = head => {
        const items = [];
        const nodes = [];
        let node = head;
        while (node.termType === "BlankNode") {
            const s = subjects.get("_:" + node.value);
            if (!s || !nestable(node) || nodes.includes(s) || s.props.length !== 2) return null;
            const first = s.props.find(q => q.predicate.value === RDF_NS + "first");
            const rest = s.props.find(q => q.predicate.value === RDF_NS + "rest");
            if (!first || !rest || first.object.termType === "Literal") return null;
            items.push(first.object);
            nodes.push(s);
            node = rest.object;
        }
        if (node.termType !== "NamedNode" || node.value !== RDF_NS + "nil" || !items.length) return null;
        nodes.forEach(s => written.add(key(s.term)));
        return items;
    };

    const out = [];

    /**
     * Writes a node element for a subject and its properties.
     *
     * @param {Object} term
     * @param {number} depth
     * @param {boolean} topLevel
     */
    const writeNode = (term, depth, topLevel) => {
        const pad = "    ".repeat(depth);
        const s = subjects.get(key(term)) || { term, props: [] };
        written.add(key(term));

        let props = s.props;
        let element = "rdf:Description";
        const typeQuad = props.find(q => q.predicate.value === RDF_NS + "type" && q.object.termType === "NamedNode" && qname(q.object.value, false));
        if (typeQuad) {
            element = qname(typeQuad.object.value, false);
            props = props.filter(q => q !== typeQuad);
        }

        let idAttr = "";
        if (term.termType === "NamedNode") idAttr = ` rdf:about="${xmlAttr(term.value)}"`;
        else if (topLevel) idAttr = ` rdf:nodeID="${nodeId(term.value)}"`;

        if (!props.length) {
            out.push(`${pad}<${element}${idAttr}/>`);
            return;
        }
        out.push(`${pad}<${element}${idAttr}>`);
        const sorted = [...props].sort((a, b) => qname(a.predicate.value, true).localeCompare(qname(b.predicate.value, true)));
        for (const q of sorted) writeProperty(q, depth + 1);
        out.push(`${pad}</${element}>`);
    };

    /**
     * Writes one property element.
     *
     * @param {Object} q
     * @param {number} depth
     */
    const writeProperty = (q, depth) => {
        const pad = "    ".repeat(depth);
        const p = qname(q.predicate.value, true);
        const o = q.object;
        if (o.termType === "NamedNode") {
            out.push(`${pad}<${p} rdf:resource="${xmlAttr(o.value)}"/>`);
        } else if (o.termType === "Literal") {
            let attrs = "";
            if (o.language) attrs = ` xml:lang="${xmlAttr(o.language)}"`;
            else if (o.datatype && o.datatype.value !== XSD_STRING && o.datatype.value !== RDF_LANG_STRING) {
                attrs = ` rdf:datatype="${xmlAttr(o.datatype.value)}"`;
            }
            out.push(`${pad}<${p}${attrs}>${xmlText(o.value)}</${p}>`);
        } else if (nestable(o)) {
            const items = listItems(o);
            if (items) {
                out.push(`${pad}<${p} rdf:parseType="Collection">`);
                for (const item of items) {
                    if (item.termType === "NamedNode") out.push(`${pad}    <rdf:Description rdf:about="${xmlAttr(item.value)}"/>`);
                    else if (nestable(item)) writeNode(item, depth + 1, false);
                    else out.push(`${pad}    <rdf:Description rdf:nodeID="${nodeId(item.value)}"/>`);
                }
                out.push(`${pad}</${p}>`);
            } else {
                out.push(`${pad}<${p}>`);
                writeNode(o, depth + 1, false);
                out.push(`${pad}</${p}>`);
            }
        } else {
            out.push(`${pad}<${p} rdf:nodeID="${nodeId(o.value)}"/>`);
        }
    };

    const ordered = [...subjects.values()].sort((a, b) =>
        (a.term.termType === b.term.termType ? 0 : a.term.termType === "NamedNode" ? -1 : 1) || a.term.value.localeCompare(b.term.value));
    // IRIs and blank nodes that are not nested elsewhere go at the top level.
    for (const s of ordered) {
        if (s.term.termType === "NamedNode" || blankRefs.get(s.term.value) !== 1) writeNode(s.term, 1, true);
    }
    // Anything left over is part of a blank-node cycle; write it with an id.
    for (const s of ordered) {
        if (!written.has(key(s.term))) writeNode(s.term, 1, true);
    }

    const decls = Object.entries(prefixes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, ns]) => `    xmlns${name ? ":" + name : ""}="${xmlAttr(ns)}"`);
    return `<?xml version="1.0" encoding="utf-8"?>\n<rdf:RDF\n${decls.join("\n")}>\n${out.join("\n")}${out.length ? "\n" : ""}</rdf:RDF>\n`;
}

/**
 * Makes a prefix name for a namespace from its last path segment, e.g.
 * "http://example.org/ontologies/pizza.owl#" -> "pizza".
 *
 * @param {string} ns
 * @param {Object<string, string>} taken - existing prefixes, whose names are avoided
 * @returns {string}
 */
function derivePrefixName(ns, taken) {
    const segment = ns.replace(/[#/]+$/, "").split(/[/#:]/).pop().replace(/\.(owl|rdf|ttl|xml|jsonld|nt|n3)$/i, "");
    let base = segment.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!/^[a-z]/.test(base) || base.length > 20) base = "ns";
    let name = base;
    for (let i = 1; name in taken; i++) name = `${base}${i}`;
    return name;
}

/**
 * Compacts Oxigraph's expanded JSON-LD using the given prefixes as @context.
 * Only property keys, @id and @type values are compacted; literal values are
 * never changed.
 *
 * @param {string} expanded
 * @param {Object<string, string>} prefixes
 * @returns {string}
 */
function compactJSONLD(expanded, prefixes) {
    // JSON-LD has no empty prefix, so give the default namespace a name taken
    // from its IRI (e.g. http://example.org/pizza# -> "pizza").
    const usable = {};
    for (const [name, ns] of Object.entries(prefixes)) {
        usable[name || derivePrefixName(ns, prefixes)] = ns;
    }
    const context = { ...usable };
    const iri = v => (typeof v === "string" && !v.startsWith("_:") ? shortenIRI(v, usable) || v : v);
    const walk = node => {
        if (Array.isArray(node)) return node.map(walk);
        if (!node || typeof node !== "object") return node;
        const out = {};
        for (const [k, v] of Object.entries(node)) {
            if (k === "@id") out[k] = iri(v);
            else if (k === "@type") out[k] = Array.isArray(v) ? v.map(iri) : iri(v);
            else if (k.startsWith("@")) out[k] = k === "@value" ? v : walk(v);
            else out[iri(k)] = walk(v);
        }
        return out;
    };
    const data = JSON.parse(expanded);
    const graph = walk(data);
    const doc = Object.keys(context).length ? { "@context": context, "@graph": graph } : graph;
    return JSON.stringify(doc, null, 2);
}

/**
 * Serialises a store in the requested format.
 *
 * @param {Object} ox
 * @param {Object} store
 * @param {string} format - key of RDF_FORMATS
 * @param {Object<string, string>|null} declaredPrefixes - prefixes from the input,
 *     or null to write without prefixes (Oxigraph's plain output)
 * @returns {string}
 */
export function serialise(ox, store, format, declaredPrefixes = {}) {
    const info = RDF_FORMATS[format];
    if (!info) throw new OperationError(`Unsupported output format: ${format}`);

    const source = info.dataset ? store : flattenToDefaultGraph(ox, store);
    const dumpOptions = { format: info.mime, ...(info.dataset ? {} : { "from_graph_name": ox.defaultGraph() }) };

    try {
        if (declaredPrefixes && ["Turtle", "JSON-LD", "RDF/XML"].includes(format)) {
            const quads = source.match();
            if (format === "RDF/XML") return prettyRDFXML(quads, declaredPrefixes);
            const prefixes = usedPrefixes(quads, declaredPrefixes);
            if (format === "Turtle") {
                const pretty = prettyTurtle(ox, quads, prefixes);
                // Safety net: never return pretty output that lost triples.
                const check = new ox.Store();
                check.load(pretty, { format: RDF_FORMATS.Turtle.mime });
                if (check.size === source.size) return pretty;
            }
            if (format === "Turtle") return source.dump(dumpOptions);
            return compactJSONLD(source.dump(dumpOptions), prefixes);
        }
        return source.dump(dumpOptions);
    } catch (err) {
        if (err instanceof OperationError) throw err;
        throw new OperationError(`Could not serialise as ${format}: ${err.message || err}`);
    }
}

/**
 * Prepends PREFIX declarations for any of the given prefixes that the query
 * does not declare itself, so users can write owl:Class etc. without a prologue.
 *
 * @param {string} query
 * @param {Object<string, string>} prefixes - prefix -> namespace IRI
 * @returns {string}
 */
export function withPrefixes(query, prefixes) {
    const declared = new Set([...query.matchAll(/\bPREFIX\s+([A-Za-z][\w.-]*)?:/gi)].map(m => m[1] || ""));
    const lines = Object.entries(prefixes)
        .filter(([name]) => !declared.has(name))
        .map(([name, ns]) => `PREFIX ${name}: <${ns}>`);
    return lines.length ? lines.join("\n") + "\n" + query : query;
}

/**
 * Merges prefixes declared in the input with the well-known ones; the input
 * wins when a name is used for different namespaces.
 *
 * @param {Object<string, string>} declared
 * @returns {Object<string, string>}
 */
export function allPrefixes(declared) {
    return { ...WELL_KNOWN_PREFIXES, ...declared };
}

/**
 * Returns a display label for each subject that has an rdfs:label or
 * skos:prefLabel, preferring English or untagged literals.
 *
 * @param {Object} ox
 * @param {Object} store
 * @returns {Map<string, string>} term value -> label
 */
export function preferredLabels(ox, store) {
    const found = new Map();
    for (const predicate of [WELL_KNOWN_PREFIXES.rdfs + "label", WELL_KNOWN_PREFIXES.skos + "prefLabel"]) {
        for (const q of store.match(null, ox.namedNode(predicate), null, null)) {
            if (q.object.termType !== "Literal") continue;
            const preferred = !q.object.language || q.object.language.toLowerCase().startsWith("en");
            const current = found.get(q.subject.value);
            if (!current || (preferred && !current.preferred)) found.set(q.subject.value, { value: q.object.value, preferred });
        }
    }
    return new Map([...found].map(([k, v]) => [k, v.value]));
}

/**
 * Returns the local part of an IRI (after the last '#' or '/').
 *
 * @param {string} iri
 * @returns {string}
 */
export function localName(iri) {
    const m = /[^#/:]+$/.exec(iri);
    return m ? m[0] : iri;
}
