/**
 * Reads an ontology's class hierarchy, class descriptions, restrictions and the
 * properties that apply to each class (via rdfs:domain, including inherited
 * ones), for the Ontology Summary operation.
 *
 * All functions take a `select` function that runs a SPARQL SELECT (with the
 * usual prefixes added) and returns an array of binding Maps.
 *
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import { WELL_KNOWN_PREFIXES, localName, langMatches } from "./RDF.mjs";

const OWL = WELL_KNOWN_PREFIXES.owl, RDFS = WELL_KNOWN_PREFIXES.rdfs, RDF = WELL_KNOWN_PREFIXES.rdf;
const OWL_THING = OWL + "Thing";
/** Domains that mean "any class". */
const ANY_CLASS = new Set([OWL_THING, RDFS + "Resource"]);
/** Property types, most specific first. */
const PROPERTY_KINDS = [
    [OWL + "ObjectProperty", "object"],
    [OWL + "DatatypeProperty", "datatype"],
    [OWL + "AnnotationProperty", "annotation"],
    [RDF + "Property", "property"],
];
/** Predicates read as descriptions, in display order. */
const DESCRIPTION_PREDICATES = [
    WELL_KNOWN_PREFIXES.skos + "definition",
    "http://purl.obolibrary.org/obo/IAO_0000115", // OBO "definition"
    RDFS + "comment",
    WELL_KNOWN_PREFIXES.dcterms + "description",
    WELL_KNOWN_PREFIXES.dc + "description",
];
const MAX_EXPRESSION_DEPTH = 6;

/**
 * Reads the named-class hierarchy from rdfs:subClassOf.
 *
 * @param {function(string): Map<string, Object>[]} select
 * @param {function(string): string|null} labelOf
 * @returns {{classes: Set<string>, parents: Map<string, Set<string>>, children: Map<string, string[]>,
 *     roots: string[], byName: function(string, string): number}}
 */
export function readClassHierarchy(select, labelOf) {
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

    const sortKey = iri => (labelOf(iri) || localName(iri)).toLowerCase();
    const byName = (a, b) => sortKey(a).localeCompare(sortKey(b)) || (a < b ? -1 : a > b ? 1 : 0);
    for (const list of children.values()) list.sort(byName);

    // Roots: classes without a named superclass. Classes only reachable through
    // a subClassOf cycle get no root, so add one member of each such cycle.
    const roots = [...classes].filter(c => !parents.has(c)).sort(byName);
    const reached = new Set();
    const mark = c => {
        const stack = [c];
        while (stack.length) {
            const next = stack.pop();
            if (reached.has(next)) continue;
            reached.add(next);
            stack.push(...(children.get(next) || []));
        }
    };
    roots.forEach(mark);
    for (const c of [...classes].sort(byName)) {
        if (!reached.has(c)) {
            roots.push(c);
            mark(c);
        }
    }
    return { classes, parents, children, roots, byName };
}

/**
 * Returns a class's ancestors, nearest first (breadth-first over rdfs:subClassOf).
 *
 * @param {string} iri
 * @param {Map<string, Set<string>>} parents
 * @returns {{iri: string, distance: number}[]}
 */
function ancestorsOf(iri, parents) {
    const result = [];
    const seen = new Set([iri]);
    let frontier = [iri];
    for (let distance = 1; frontier.length; distance++) {
        const next = [];
        for (const c of frontier) {
            for (const p of [...(parents.get(c) || [])].sort()) {
                if (seen.has(p)) continue;
                seen.add(p);
                result.push({ iri: p, distance });
                next.push(p);
            }
        }
        frontier = next;
    }
    return result;
}

/**
 * Reads anonymous class expressions (unions, intersections, enumerations,
 * complements, datatype restrictions) and property restrictions, and returns
 * a function that writes any class expression in Manchester-like syntax,
 * e.g. "hasTopping some (Mozzarella or Tomato)".
 *
 * @param {function(string): Map<string, Object>[]} select
 * @param {function(string): string} short - IRI shortener
 * @returns {{describe: function(Object): string, restrictions: Map<string, Object>}}
 */
function readExpressions(select, short) {
    const expressions = new Map();
    const exprRows = select(`SELECT ?x ?kind ?m WHERE {
        { ?x owl:unionOf/rdf:rest*/rdf:first ?m BIND("or" AS ?kind) }
        UNION { ?x owl:intersectionOf/rdf:rest*/rdf:first ?m BIND("and" AS ?kind) }
        UNION { ?x owl:oneOf/rdf:rest*/rdf:first ?m BIND("oneOf" AS ?kind) }
        UNION { ?x owl:complementOf ?m BIND("not" AS ?kind) }
        UNION { ?x owl:onDatatype ?m BIND("datatype" AS ?kind) }
        FILTER(isBlank(?x))
    }`);
    for (const r of exprRows) {
        const id = r.get("x").value;
        if (!expressions.has(id)) expressions.set(id, { kind: r.get("kind").value, members: [] });
        expressions.get(id).members.push(r.get("m"));
    }

    const restrictions = new Map();
    const restrictionRows = select(`SELECT ?r ?p ?some ?all ?val ?min ?max ?exact ?on WHERE {
        ?r owl:onProperty ?p .
        OPTIONAL { ?r owl:someValuesFrom ?some }
        OPTIONAL { ?r owl:allValuesFrom ?all }
        OPTIONAL { ?r owl:hasValue ?val }
        OPTIONAL { ?r owl:minCardinality|owl:minQualifiedCardinality ?min }
        OPTIONAL { ?r owl:maxCardinality|owl:maxQualifiedCardinality ?max }
        OPTIONAL { ?r owl:cardinality|owl:qualifiedCardinality ?exact }
        OPTIONAL { ?r owl:onClass|owl:onDataRange ?on }
        FILTER(isBlank(?r))
    }`);
    for (const row of restrictionRows) {
        const id = row.get("r").value;
        if (!restrictions.has(id)) restrictions.set(id, { property: row.get("p").value });
        const restriction = restrictions.get(id);
        for (const key of ["some", "all", "val", "min", "max", "exact", "on"]) {
            if (row.get(key)) restriction[key] = row.get(key);
        }
    }

    const wrap = s => (/\s/.test(s) && !/^[({]/.test(s) ? `(${s})` : s);
    const describe = (term, depth = 0) => {
        if (!term) return "";
        if (term.termType === "NamedNode") return short(term.value);
        if (term.termType === "Literal") {
            const suffix = term.language ? "@" + term.language :
                term.datatype && !term.datatype.value.endsWith("#string") ? "^^" + short(term.datatype.value) : "";
            return JSON.stringify(term.value) + suffix;
        }
        if (depth > MAX_EXPRESSION_DEPTH) return "…";
        const r = restrictions.get(term.value);
        if (r) {
            const on = r.on ? " " + wrap(describe(r.on, depth + 1)) : "";
            const parts = [];
            if (r.some) parts.push("some " + wrap(describe(r.some, depth + 1)));
            if (r.all) parts.push("only " + wrap(describe(r.all, depth + 1)));
            if (r.val) parts.push("value " + describe(r.val, depth + 1));
            if (r.min) parts.push(`min ${r.min.value}${on}`);
            if (r.max) parts.push(`max ${r.max.value}${on}`);
            if (r.exact) parts.push(`exactly ${r.exact.value}${on}`);
            return `${short(r.property)} ${parts.join(", ") || "(restriction)"}`;
        }
        const e = expressions.get(term.value);
        if (!e) return "(anonymous class)";
        const members = e.members.map(m => describe(m, depth + 1)).sort();
        switch (e.kind) {
            case "or": return members.map(wrap).join(" or ");
            case "and": return members.map(wrap).join(" and ");
            case "oneOf": return `{${members.join(", ")}}`;
            case "not": return "not " + wrap(members[0]);
            case "datatype": return `${members[0]}[…]`;
            default: return "(anonymous class)";
        }
    };
    return { describe, restrictions, expressions };
}

/**
 * Collects descriptions (definitions, comments) per IRI in the wanted language(s).
 *
 * @param {function(string): Map<string, Object>[]} select
 * @param {string} language - e.g. "en"; "" for all
 * @returns {Map<string, string[]>}
 */
export function readDescriptions(select, language) {
    const byPredicate = new Map();
    const values = DESCRIPTION_PREDICATES.map(p => `<${p}>`).join(" ");
    for (const r of select(`SELECT ?s ?p ?d WHERE { VALUES ?p { ${values} } ?s ?p ?d FILTER(isIRI(?s) && isLiteral(?d)) }`)) {
        const d = r.get("d");
        if (!langMatches(d.language, language)) continue;
        const key = r.get("s").value;
        if (!byPredicate.has(key)) byPredicate.set(key, []);
        byPredicate.get(key).push([DESCRIPTION_PREDICATES.indexOf(r.get("p").value), d.value.trim()]);
    }
    const result = new Map();
    for (const [iri, list] of byPredicate) {
        const ordered = list.sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1])).map(([, text]) => text);
        result.set(iri, [...new Set(ordered)].filter(Boolean));
    }
    return result;
}

/**
 * Works out, for every class, the properties that apply to it through
 * rdfs:domain on the class or one of its ancestors, plus its restrictions.
 *
 * Domain rules: a union domain (A or B) applies to each member; several
 * rdfs:domain statements (or an intersection) apply only to classes under all
 * of them (RDFS semantics); a property without a domain inherits the domain of
 * its nearest super-property; a property whose domain is owl:Thing, or that
 * has none, applies to any class and is listed once rather than per class.
 *
 * @param {Object} options
 * @param {function(string): Map<string, Object>[]} options.select
 * @param {Object} options.hierarchy - from readClassHierarchy()
 * @param {function(string): string} options.short - IRI shortener
 * @param {function(string): string|null} options.labelOf
 * @param {Map<string, string[]>} options.descriptions - from readDescriptions()
 * @returns {{classes: Object[], anyClass: Object[], unmatched: Object[]}}
 */
export function buildClassDetails({ select, hierarchy, short, labelOf, descriptions }) {
    const { describe, restrictions, expressions } = readExpressions(select, short);

    // Properties: kind, domains, ranges, super-properties
    const props = new Map();
    const prop = iri => {
        if (!props.has(iri)) props.set(iri, { iri, kind: null, domains: [], ranges: [], supers: [] });
        return props.get(iri);
    };
    const kindRank = new Map(PROPERTY_KINDS.map(([iri], i) => [iri, i]));
    const kindValues = PROPERTY_KINDS.map(([iri]) => `<${iri}>`).join(" ");
    for (const r of select(`SELECT ?p ?k WHERE { VALUES ?k { ${kindValues} } ?p a ?k FILTER(isIRI(?p)) }`)) {
        const p = prop(r.get("p").value), k = r.get("k").value;
        if (p.kind === null || kindRank.get(k) < kindRank.get(p.kind)) p.kind = k;
    }
    for (const r of select("SELECT ?p ?d WHERE { ?p rdfs:domain ?d FILTER(isIRI(?p)) }")) prop(r.get("p").value).domains.push(r.get("d"));
    for (const r of select("SELECT ?p ?r WHERE { ?p rdfs:range ?r FILTER(isIRI(?p)) }")) prop(r.get("p").value).ranges.push(r.get("r"));
    for (const r of select("SELECT ?p ?s WHERE { ?p rdfs:subPropertyOf ?s FILTER(isIRI(?p) && isIRI(?s) && ?p != ?s) }")) {
        prop(r.get("p").value).supers.push(r.get("s").value);
    }

    /**
     * Returns the property's own domains/ranges, or those of its nearest super-property.
     *
     * @param {Object} p
     * @param {string} key - "domains" or "ranges"
     * @returns {{terms: Object[], via: string|null}}
     */
    const effective = (p, key) => {
        if (p[key].length) return { terms: p[key], via: null };
        const seen = new Set([p.iri]);
        let frontier = [...p.supers];
        while (frontier.length) {
            const next = [];
            for (const s of frontier.sort()) {
                if (seen.has(s)) continue;
                seen.add(s);
                const sp = props.get(s);
                if (sp && sp[key].length) return { terms: sp[key], via: s };
                if (sp) next.push(...sp.supers);
            }
            frontier = next;
        }
        return { terms: [], via: null };
    };

    // Turn each property's domains into requirement groups: the class must be
    // under at least one member of every group.
    const kindName = new Map(PROPERTY_KINDS);
    const info = [...props.values()].sort((a, b) => short(a.iri).localeCompare(short(b.iri))).map(p => {
        const domain = effective(p, "domains");
        const range = effective(p, "ranges");
        const groups = [];
        let complex = false;
        for (const d of domain.terms) {
            if (d.termType === "NamedNode") {
                if (!ANY_CLASS.has(d.value)) groups.push([d.value]);
                continue;
            }
            const e = d.termType === "BlankNode" ? expressions.get(d.value) : null;
            const named = e ? e.members.filter(m => m.termType === "NamedNode").map(m => m.value) : [];
            if (e && e.kind === "or" && named.length === e.members.length) {
                if (!named.some(m => ANY_CLASS.has(m))) groups.push(named);
            } else if (e && e.kind === "and" && named.length) {
                named.filter(m => !ANY_CLASS.has(m)).forEach(m => groups.push([m]));
                if (named.length !== e.members.length) complex = true;
            } else {
                complex = true;
            }
        }
        return {
            iri: p.iri,
            name: short(p.iri),
            label: labelOf(p.iri),
            kind: p.kind ? kindName.get(p.kind) : "property",
            domain: domain.terms.map(t => describe(t)).join(" and "),
            domainVia: domain.via ? short(domain.via) : null,
            range: range.terms.map(t => describe(t)).join(" and "),
            rangeVia: range.via ? short(range.via) : null,
            description: (descriptions.get(p.iri) || []).join(" "),
            groups,
            complex,
        };
    });

    // Restrictions each class states directly (subClassOf, incl. inside an intersection)
    const ownRestrictions = new Map();
    const otherSupers = new Map();
    const superRows = select(`SELECT DISTINCT ?c ?x WHERE {
        { ?c rdfs:subClassOf ?x } UNION { ?c rdfs:subClassOf/owl:intersectionOf/rdf:rest*/rdf:first ?x }
        FILTER(isIRI(?c) && isBlank(?x))
    }`);
    for (const r of superRows) {
        const c = r.get("c").value, x = r.get("x");
        const target = restrictions.has(x.value) ? ownRestrictions : otherSupers;
        if (target === otherSupers && expressions.get(x.value)?.kind === "and") continue; // members handled above
        if (!target.has(c)) target.set(c, new Set());
        target.get(c).add(describe(x));
    }
    const equivalents = new Map();
    for (const r of select("SELECT ?c ?e WHERE { ?c owl:equivalentClass ?e FILTER(isIRI(?c) && ?c != ?e) }")) {
        const c = r.get("c").value;
        if (!equivalents.has(c)) equivalents.set(c, new Set());
        equivalents.get(c).add(describe(r.get("e")));
    }

    // Depth-first order through the hierarchy; each class appears once.
    const { parents, children, roots, byName } = hierarchy;
    const order = [];
    const visited = new Set();
    const visit = (iri, depth, path) => {
        if (visited.has(iri)) return;
        visited.add(iri);
        order.push({ iri, depth, path: [...path, iri] });
        for (const child of children.get(iri) || []) visit(child, depth + 1, [...path, iri]);
    };
    roots.forEach(r => visit(r, 0, []));

    const matched = new Set();
    const classes = order.map(({ iri, depth, path }) => {
        const lineage = [{ iri, distance: 0 }, ...ancestorsOf(iri, parents)];
        const distance = new Map(lineage.map(a => [a.iri, a.distance]));

        const properties = [];
        for (const p of info) {
            if (!p.groups.length) continue;
            let source = null, sourceDistance = 0, ok = true;
            for (const [i, group] of p.groups.entries()) {
                const hits = group.filter(g => distance.has(g)).sort((a, b) => distance.get(a) - distance.get(b));
                if (!hits.length) {
                    ok = false;
                    break;
                }
                if (i === 0) {
                    source = hits[0];
                    sourceDistance = distance.get(hits[0]);
                }
            }
            if (!ok) continue;
            matched.add(p.iri);
            properties.push({
                iri: p.iri, name: p.name, label: p.label, kind: p.kind,
                range: p.range, rangeVia: p.rangeVia, domainVia: p.domainVia,
                description: p.description,
                from: sourceDistance === 0 ? null : short(source),
                distance: sourceDistance,
                ...(p.groups.length > 1 ? { domain: p.domain } : {}),
            });
        }
        properties.sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name));

        const restrictionList = [];
        for (const { iri: c, distance: d } of lineage) {
            for (const text of [...(ownRestrictions.get(c) || [])].sort()) {
                restrictionList.push({ text, from: d === 0 ? null : short(c) });
            }
        }

        return {
            iri,
            name: short(iri),
            label: labelOf(iri),
            depth,
            path: path.map(short),
            subClassOf: [
                ...[...(parents.get(iri) || [])].sort(byName).map(short),
                ...[...(otherSupers.get(iri) || [])].sort(),
            ],
            equivalentTo: [...(equivalents.get(iri) || [])].sort(),
            descriptions: descriptions.get(iri) || [],
            properties: properties.map(p => {
                delete p.distance;
                return p;
            }),
            restrictions: restrictionList,
        };
    });

    const pick = p => ({ iri: p.iri, name: p.name, label: p.label, kind: p.kind, range: p.range, domain: p.domain, description: p.description });
    return {
        classes,
        anyClass: info.filter(p => !p.groups.length && !p.complex).map(pick),
        unmatched: info.filter(p => (p.groups.length && !matched.has(p.iri)) || (p.complex && !p.groups.length)).map(pick),
    };
}
