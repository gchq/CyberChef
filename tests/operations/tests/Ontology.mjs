/**
 * Ontology / RDF operation tests (Convert RDF Format, SPARQL Query, Ontology Summary).
 *
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const PIZZA_TTL = `@prefix : <http://example.org/pizza#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<http://example.org/pizza> a owl:Ontology ;
    rdfs:label "Pizza ontology" ;
    owl:versionIRI <http://example.org/pizza/1.0> .

:Food a owl:Class .
:Pizza a owl:Class ; rdfs:subClassOf :Food ; rdfs:label "Pizza, Italian"@en .
:Mozzarella a owl:Class ; rdfs:subClassOf :Food .
:Margherita a owl:Class ;
    rdfs:subClassOf :Pizza , [ a owl:Restriction ; owl:onProperty :hasTopping ; owl:someValuesFrom :Mozzarella ] .
:hasTopping a owl:ObjectProperty ; rdfs:domain :Pizza ; rdfs:range :Food .
`;

const PIZZA_RDFXML = `<?xml version="1.0" encoding="utf-8"?>
<rdf:RDF
    xmlns="http://example.org/pizza#"
    xmlns:owl="http://www.w3.org/2002/07/owl#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
    <owl:Ontology rdf:about="http://example.org/pizza">
        <owl:versionIRI rdf:resource="http://example.org/pizza/1.0"/>
        <rdfs:label>Pizza ontology</rdfs:label>
    </owl:Ontology>
    <owl:Class rdf:about="http://example.org/pizza#Food"/>
    <owl:ObjectProperty rdf:about="http://example.org/pizza#hasTopping">
        <rdfs:domain rdf:resource="http://example.org/pizza#Pizza"/>
        <rdfs:range rdf:resource="http://example.org/pizza#Food"/>
    </owl:ObjectProperty>
    <owl:Class rdf:about="http://example.org/pizza#Margherita">
        <rdfs:subClassOf rdf:resource="http://example.org/pizza#Pizza"/>
        <rdfs:subClassOf>
            <owl:Restriction>
                <owl:onProperty rdf:resource="http://example.org/pizza#hasTopping"/>
                <owl:someValuesFrom rdf:resource="http://example.org/pizza#Mozzarella"/>
            </owl:Restriction>
        </rdfs:subClassOf>
    </owl:Class>
    <owl:Class rdf:about="http://example.org/pizza#Mozzarella">
        <rdfs:subClassOf rdf:resource="http://example.org/pizza#Food"/>
    </owl:Class>
    <owl:Class rdf:about="http://example.org/pizza#Pizza">
        <rdfs:label xml:lang="en">Pizza, Italian</rdfs:label>
        <rdfs:subClassOf rdf:resource="http://example.org/pizza#Food"/>
    </owl:Class>
</rdf:RDF>
`;

const PIZZA_PRETTY_TTL = `@prefix : <http://example.org/pizza#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.

<http://example.org/pizza> a owl:Ontology;
  rdfs:label "Pizza ontology";
  owl:versionIRI <http://example.org/pizza/1.0>.

:Food a owl:Class.

:hasTopping a owl:ObjectProperty;
  rdfs:domain :Pizza;
  rdfs:range :Food.

:Margherita a owl:Class;
  rdfs:subClassOf
    :Pizza, [ a owl:Restriction;
      owl:onProperty :hasTopping;
      owl:someValuesFrom :Mozzarella
    ].

:Mozzarella a owl:Class;
  rdfs:subClassOf :Food.

:Pizza a owl:Class;
  rdfs:label "Pizza, Italian"@en;
  rdfs:subClassOf :Food.
`;

const DEFAULT_QUERY = "SELECT ?class ?label WHERE {\n  ?class a owl:Class .\n  OPTIONAL { ?class rdfs:label ?label }\n}\nORDER BY ?class\nLIMIT 100";

/**
 * Builds a SPARQL Query recipe step.
 *
 * @param {string} query
 * @param {string} resultsFormat
 * @param {string} graphFormat
 * @returns {Object}
 */
function sparql(query, resultsFormat = "CSV", graphFormat = "Turtle") {
    return { op: "SPARQL Query", args: [query, "Auto", resultsFormat, true, graphFormat, "", ""] };
}

TestRegister.addTests([
    {
        name: "Convert RDF Format: Turtle to RDF/XML",
        input: PIZZA_TTL,
        expectedOutput: PIZZA_RDFXML,
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "RDF/XML", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: RDF/XML back to pretty Turtle",
        input: PIZZA_TTL,
        expectedOutput: PIZZA_PRETTY_TTL,
        recipeConfig: [
            { op: "Convert RDF Format", args: ["Auto", "RDF/XML", "", true, ""] },
            { op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] },
        ],
    },
    {
        name: "Convert RDF Format: round trip through every format keeps all triples",
        input: PIZZA_TTL,
        // N-Triples carries no prefix declarations, so the ':' names come back as full IRIs.
        expectedOutput: PIZZA_PRETTY_TTL.replace("@prefix : <http://example.org/pizza#>.\n", "")
            .replace(/(^|[\s(,]):(\w+)/gm, "$1<http://example.org/pizza#$2>"),
        recipeConfig: ["N-Triples", "N-Quads", "TriG", "N3", "RDF/XML", "Turtle"]
            .map(f => ({ op: "Convert RDF Format", args: ["Auto", f, "", true, ""] })),
    },
    {
        name: "Convert RDF Format: JSON-LD output names the default namespace and keeps all triples",
        input: PIZZA_TTL,
        expectedMatch: /^@prefix owl: <http:\/\/www\.w3\.org\/2002\/07\/owl#>\.\n@prefix pizza: <http:\/\/example\.org\/pizza#>\.\n[\s\S]*\npizza:Margherita a owl:Class;\n {2}rdfs:subClassOf\n {4}pizza:Pizza, \[ a owl:Restriction;/,
        recipeConfig: [
            { op: "Convert RDF Format", args: ["Auto", "JSON-LD", "", true, ""] },
            { op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] },
        ],
    },
    {
        name: "Convert RDF Format: without prefixes writes full IRIs",
        input: PIZZA_TTL,
        expectedMatch: /^<http:\/\/example\.org\/pizza> a <http:\/\/www\.w3\.org\/2002\/07\/owl#Ontology> ;/,
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "Turtle", "", false, ""] }],
    },
    {
        name: "Convert RDF Format: N-Triples detected and converted to Turtle",
        input: "<http://example.org/a> <http://www.w3.org/2000/01/rdf-schema#label> \"A\" .\n<http://example.org/a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Class> .\n",
        expectedOutput: "@prefix owl: <http://www.w3.org/2002/07/owl#>.\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.\n\n<http://example.org/a> a owl:Class;\n  rdfs:label \"A\".\n",
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: JSON-LD context prefixes are kept",
        input: JSON.stringify({
            "@context": { "ex": "http://example.org/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#" },
            "@id": "ex:thing",
            "rdfs:label": "Thing",
        }),
        expectedOutput: "@prefix ex: <http://example.org/>.\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.\n\nex:thing\n  rdfs:label \"Thing\".\n",
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: TriG named graph to N-Quads",
        input: "@prefix ex: <http://example.org/> .\nex:g1 { ex:a ex:p ex:b . }\n",
        expectedOutput: "<http://example.org/a> <http://example.org/p> <http://example.org/b> <http://example.org/g1> .\n",
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "N-Quads", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: named graphs are merged for Turtle output",
        input: "@prefix ex: <http://example.org/> .\nex:g1 { ex:a ex:p ex:b . }\nex:c ex:p ex:d .\n",
        expectedOutput: "@prefix ex: <http://example.org/>.\n\nex:a\n  ex:p ex:b.\n\nex:c\n  ex:p ex:d.\n",
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: relative IRIs resolved with Base IRI",
        input: "<a> <http://www.w3.org/2000/01/rdf-schema#label> \"A\" .",
        expectedOutput: "<http://example.org/a> <http://www.w3.org/2000/01/rdf-schema#label> \"A\" .\n",
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "N-Triples", "http://example.org/", true, ""] }],
    },
    {
        name: "Convert RDF Format: blank node cycle is not lost in Turtle",
        input: "@prefix ex: <http://example.org/> .\n_:a ex:next _:b .\n_:b ex:next _:a .\n",
        expectedMatch: /(_:b\d+)\n {2}ex:next \[\n {6}ex:next \1\n {4}\]\./,
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: list inside a nested restriction stays pretty",
        input: "@prefix : <http://example.org/p#> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n" +
            ":American rdfs:subClassOf [ a owl:Restriction ; owl:onProperty :hasTopping ; owl:allValuesFrom [ a owl:Class ; owl:unionOf ( :A :B ) ] ] .\n",
        expectedOutput: "@prefix : <http://example.org/p#>.\n@prefix owl: <http://www.w3.org/2002/07/owl#>.\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.\n\n" +
            ":American\n  rdfs:subClassOf [ a owl:Restriction;\n      owl:allValuesFrom [ a owl:Class;\n          owl:unionOf (:A :B)\n        ];\n      owl:onProperty :hasTopping\n    ].\n",
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: RDF/XML list written as parseType Collection",
        input: "@prefix ex: <http://example.org/> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\nex:U owl:unionOf ( ex:A ex:B ) .\n",
        expectedMatch: /<owl:unionOf rdf:parseType="Collection">\n {12}<rdf:Description rdf:about="http:\/\/example\.org\/A"\/>\n {12}<rdf:Description rdf:about="http:\/\/example\.org\/B"\/>\n {8}<\/owl:unionOf>/,
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "RDF/XML", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: prefixes restored from the original file via Register",
        input: PIZZA_TTL,
        expectedOutput: PIZZA_PRETTY_TTL,
        recipeConfig: [
            { op: "Register", args: ["([\\s\\S]*)", true, false, false] },
            { op: "Convert RDF Format", args: ["Auto", "N-Triples", "", true, ""] },
            { op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, "$R0"] },
        ],
    },
    {
        name: "SPARQL Query: additional prefixes shorten IRIs from N-Triples input",
        input: "<http://example.org/pizza#Pizza> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Class> .\n",
        expectedOutput: "c\npizza:Pizza",
        recipeConfig: [
            { op: "SPARQL Query", args: ["SELECT ?c WHERE { ?c a owl:Class }", "Auto", "CSV", true, "Turtle", "", "PREFIX pizza: <http://example.org/pizza#>"] },
        ],
    },
    {
        name: "Convert RDF Format: Manchester syntax is rejected with a clear error",
        input: "Prefix: : <http://example.org/>\nOntology: <http://example.org/o>\nClass: Pizza\n",
        expectedOutput: "The input looks like OWL Manchester Syntax, which is not an RDF serialisation. Only RDF serialisations (Turtle, RDF/XML, JSON-LD, N-Triples, N-Quads, TriG, N3) are supported. Convert the file to RDF/XML or Turtle first, e.g. with Protégé ('Save as') or ROBOT ('robot convert').",
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] }],
    },
    {
        name: "Convert RDF Format: OWL/XML is rejected with a clear error",
        input: "<?xml version=\"1.0\"?>\n<Ontology xmlns=\"http://www.w3.org/2002/07/owl#\" ontologyIRI=\"http://example.org/o\">\n  <Declaration><Class IRI=\"#Pizza\"/></Declaration>\n</Ontology>\n",
        expectedOutput: "The input looks like OWL/XML, which is not an RDF serialisation. Only RDF serialisations (Turtle, RDF/XML, JSON-LD, N-Triples, N-Quads, TriG, N3) are supported. Convert the file to RDF/XML or Turtle first, e.g. with Protégé ('Save as') or ROBOT ('robot convert').",
        recipeConfig: [{ op: "Convert RDF Format", args: ["Auto", "Turtle", "", true, ""] }],
    },
    {
        name: "SPARQL Query: SELECT as CSV with prefixes added automatically",
        input: PIZZA_TTL,
        expectedOutput: "class,label\n:Food,\n:Margherita,\n:Mozzarella,\n:Pizza,\"Pizza, Italian\"",
        recipeConfig: [sparql(DEFAULT_QUERY)],
    },
    {
        name: "SPARQL Query: SELECT as TSV with full IRIs",
        input: PIZZA_TTL,
        expectedOutput: "c\nhttp://example.org/pizza#Mozzarella\nhttp://example.org/pizza#Pizza",
        recipeConfig: [{ op: "SPARQL Query", args: ["SELECT ?c WHERE { ?c rdfs:subClassOf :Food } ORDER BY ?c", "Auto", "TSV", false, "Turtle", "", ""] }],
    },
    {
        name: "SPARQL Query: SELECT results rendered with To Table",
        input: PIZZA_TTL,
        expectedOutput: `+-------------+----------------+
| class       | label          |
+-------------+----------------+
| :Food       |                |
| :Margherita |                |
| :Mozzarella |                |
| :Pizza      | Pizza, Italian |
+-------------+----------------+
`,
        recipeConfig: [
            sparql(DEFAULT_QUERY),
            { op: "To Table", args: [",", "\\r\\n", true, "ASCII"] },
        ],
    },
    {
        name: "SPARQL Query: SELECT as SPARQL JSON",
        input: PIZZA_TTL,
        expectedMatch: /"head": \{\s+"vars": \[\s+"class",\s+"label"\s+\]/,
        recipeConfig: [sparql(DEFAULT_QUERY, "JSON")],
    },
    {
        name: "SPARQL Query: ASK with property path",
        input: PIZZA_TTL,
        expectedOutput: "true",
        recipeConfig: [sparql("ASK { :Margherita rdfs:subClassOf+ :Food }")],
    },
    {
        name: "SPARQL Query: CONSTRUCT returns Turtle",
        input: PIZZA_TTL,
        expectedOutput: "@prefix : <http://example.org/pizza#>.\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.\n\n<http://example.org/pizza>\n  rdfs:label \"Pizza ontology\".\n\n:Pizza\n  rdfs:label \"Pizza, Italian\"@en.\n",
        recipeConfig: [sparql("CONSTRUCT { ?c rdfs:label ?l } WHERE { ?c rdfs:label ?l }")],
    },
    {
        name: "Ontology Graph: classes and properties view",
        input: PIZZA_TTL,
        expectedMatch: /4 nodes, 5 edges\.[\s\S]*"from":"http:\/\/example\.org\/pizza#Margherita","to":"http:\/\/example\.org\/pizza#Mozzarella","label":":hasTopping \(some\)","dashes":true/,
        recipeConfig: [{ op: "Ontology Graph", args: ["Auto", "Classes and properties", 200, "Label, else prefixed name", "Force-directed", ""] }],
    },
    {
        name: "Ontology Graph: class hierarchy view has only subclass edges",
        input: PIZZA_TTL,
        expectedMatch: /4 nodes, 3 edges\./,
        recipeConfig: [{ op: "Ontology Graph", args: ["Auto", "Class hierarchy", 200, "Prefixed name", "Hierarchical", ""] }],
    },
    {
        name: "Ontology Graph: max nodes limits the drawing",
        input: PIZZA_TTL,
        expectedMatch: /Showing 3 of 8 nodes and \d+ of 9 edges \(limited by &#x27;Max nodes&#x27;\)\./,
        recipeConfig: [{ op: "Ontology Graph", args: ["Auto", "All triples", 3, "Prefixed name", "Force-directed", ""] }],
    },
    {
        name: "Ontology Graph: labels cannot break out of the script element",
        input: "<http://example.org/x> <http://www.w3.org/2000/01/rdf-schema#label> \"</script><img src=x onerror=alert(1)>\" ; a <http://www.w3.org/2002/07/owl#Class> .",
        unexpectedMatch: /<img src=x/,
        recipeConfig: [{ op: "Ontology Graph", args: ["Auto", "Class hierarchy", 200, "Label, else prefixed name", "Force-directed", ""] }],
    },
    {
        name: "Ontology Graph: outputs graph JSON when not the last operation",
        input: PIZZA_TTL,
        expectedMatch: /^\{"truncated":false,"totalNodes":4,"totalEdges":3,"nodes":\[/,
        recipeConfig: [
            { op: "Ontology Graph", args: ["Auto", "Class hierarchy", 200, "Prefixed name", "Force-directed", ""] },
            { op: "JSON Minify", args: [] },
        ],
    },
    {
        name: "Ontology Summary: text report",
        input: PIZZA_TTL,
        expectedOutput: `Ontology
IRI:          http://example.org/pizza
Version IRI:  http://example.org/pizza/1.0
Title:        Pizza ontology
Input format: Turtle

Counts
  Triples                18
  Distinct subjects      7
  Classes                4
  Object properties      1
  Restrictions           1

Namespaces (by usage)
  :     http://example.org/pizza#  (19)
  owl:  http://www.w3.org/2002/07/owl#  (10)
  rdfs: http://www.w3.org/2000/01/rdf-schema#  (8)
  rdf:  http://www.w3.org/1999/02/22-rdf-syntax-ns#  (7)
        http://example.org/  (3)
        http://example.org/pizza/  (1)

Class hierarchy
  :Food
    :Mozzarella
    :Pizza "Pizza, Italian"
      :Margherita`,
        recipeConfig: [{ op: "Ontology Summary", args: ["Auto", "Text report", true, 10, ""] }],
    },
    {
        name: "Ontology Summary: max tree depth",
        input: PIZZA_TTL,
        expectedMatch: /Class hierarchy\n {2}:Food\n {4}… \(2 subclasses below max depth\)$/,
        recipeConfig: [{ op: "Ontology Summary", args: ["Auto", "Text report", true, 1, ""] }],
    },
    {
        name: "Ontology Summary: counts CSV rendered with To Table",
        input: PIZZA_TTL,
        expectedMatch: /^\+-+\+-+\+\n\| metric +\| count \|\n\+-+\+-+\+\n\| Triples +\| 18 +\|\n/,
        recipeConfig: [
            { op: "Ontology Summary", args: ["Auto", "Counts CSV", false, 10, ""] },
            { op: "To Table", args: [",", "\\r\\n", true, "ASCII"] },
        ],
    },
]);
