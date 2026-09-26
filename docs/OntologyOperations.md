# Ontology / RDF operations

These operations work on ontologies and other RDF data. They run entirely in the browser and need no authentication or network access.

Each operation parses its input into an in-memory RDF store ([Oxigraph](https://github.com/oxigraph/oxigraph), compiled to WebAssembly), works on the store, and writes a result. Each operation parses its own input, so operations chain freely: for example, `SPARQL Query` (CONSTRUCT) → `Convert RDF Format`.

| Operation | What it does |
| :--- | :--- |
| Convert RDF Format | Converts between RDF serialisations, e.g. Turtle → RDF/XML for a visualiser that only accepts RDF/XML. |
| SPARQL Query | Runs a SPARQL 1.1 SELECT / ASK / CONSTRUCT / DESCRIBE query against the input. |
| Ontology Summary | Reports the ontology IRI, version, title and imports; counts; namespaces; the class hierarchy; and a per-class reference of descriptions, applicable properties (own and inherited) and restrictions. |
| Ontology Graph | Draws the ontology as an interactive graph (drag, zoom, hover for full IRIs), with a 'Max nodes' limit (default 200). |

All four are in the **Ontology / RDF** category. `Convert RDF Format` is also listed under **Data format**.

## Formats

| Format | Usual extensions | Read | Write |
| :--- | :--- | :---: | :---: |
| Turtle | `.ttl` | yes | yes (with prefixes, nested blank nodes, `( )` lists) |
| RDF/XML | `.rdf`, `.owl`, `.xml` | yes | yes (Protégé style: typed nodes, nested blank nodes, `parseType="Collection"`) |
| JSON-LD | `.jsonld`, `.json` | yes | yes (compacted with a prefix `@context`) |
| N-Triples | `.nt` | yes | yes |
| N-Quads | `.nq` | yes | yes |
| TriG | `.trig` | yes | yes |
| N3 | `.n3` | yes | yes |
| OWL/XML | `.owx` (sometimes `.owl`) | no | no |
| OWL Functional Syntax | `.ofn` | no | no |
| OWL Manchester Syntax | `.omn` | no | no |
| OBO | `.obo` | no | no |

The last four are OWL syntaxes, not RDF serialisations, and no maintained JavaScript library reads them. The operations recognise them and return an error suggesting conversion with Protégé or [ROBOT](https://robot.obolibrary.org/convert) (`robot convert`). An `.owl` file is usually RDF/XML, which is supported.

Notes:

- **Auto-detection.** 'Auto' picks the format from the content: XML → RDF/XML, `{` → JSON-LD, graph blocks → TriG; otherwise it tries Turtle, which also reads N-Triples, then N-Quads.
- **Prefixes.** With 'Use prefixes' on, output uses the prefixes declared in the input (`@prefix`, `PREFIX`, `xmlns:`, JSON-LD `@context`) plus common vocabularies (rdf, rdfs, owl, xsd, skos, dc, dcterms, foaf, schema, prov, sh). N-Triples and N-Quads contain no prefixes, so converting through them loses the prefix names, but not the data.
- **Restoring prefixes with Register.** All four operations have an 'Additional prefixes' argument. It accepts prefix declarations in any of the syntaxes above, and they take precedence over prefixes found in the input. To bring back the original file's prefixes after a step that drops them, store the file with the existing **Register** operation. Its default extractor `([\s\S]*)` puts the whole input into `$R0` and passes the input through unchanged.

  ```
  Register                (Extractor: ([\s\S]*))
  Convert RDF Format      (Output: N-Triples)
  … other steps …
  Convert RDF Format      (Output: Turtle, Additional prefixes: $R0)
  ```

  You can also type the declarations directly, e.g. `PREFIX pizza: <http://example.org/pizza#>`.
- **Named graphs.** When writing a format that has no graphs (Turtle, RDF/XML, N-Triples, N3), named graphs are merged into one graph.
- **Relative IRIs.** Input containing relative IRIs (e.g. `<a>`) needs the 'Base IRI' argument.
- **RDF/XML limits.** RDF/XML can't represent a predicate whose IRI doesn't end in a valid XML name, or RDF-star quoted triples. Converting such data to RDF/XML gives an error; choose another format.

## SPARQL Query

- Prefixes from the input and the common vocabularies above are added to the query automatically, so `SELECT ?c WHERE { ?c a owl:Class }` works without `PREFIX` lines. Prefixes declared in the query take precedence.
- **SELECT** → CSV (default), TSV, SPARQL JSON or SPARQL XML. With 'Shorten IRIs with prefixes' on, CSV/TSV show `:Pizza` rather than the full IRI.
- **ASK** → `true` / `false`.
- **CONSTRUCT / DESCRIBE** → RDF in the 'Graph output format'.
- Named graphs are queried as one merged default graph.
- SPARQL Update (INSERT/DELETE) is not supported yet.

### Showing results as a table

Use the existing **To Table** operation rather than a separate table output:

```
SPARQL Query      (Results format: CSV)
To Table          (Cell delimiters: ,   Make first row header: ticked   Format: HTML, ASCII or Markdown)
```

The same works for `Ontology Summary` with Output = 'Counts CSV'.

`To Table` previously HTML-escaped its input before splitting it into cells. That broke CSV quoting, so a quoted cell such as `"Pizza, Italian"` was split in two. It now escapes each cell after parsing.

## Ontology Summary: class details

With **Include class details** on (the default), the summary adds one entry per class, in depth-first hierarchy order. Each entry shows:

- **Path, superclasses, and equivalent-class definitions.** Class expressions are written in Protégé/Manchester style, e.g. `:Car and (:poweredBy some :Battery)`.
- **Descriptions** from `skos:definition`, the OBO definition (`IAO_0000115`), `rdfs:comment`, `dcterms:description` and `dc:description`. These are filtered by the **Language** argument: `en` by default, several can be given as `en, fr`, and leaving it empty includes all. Untagged text is always included. Labels prefer the chosen language but fall back to others, since many ontologies label in one language only.
- **Properties** that apply to the class, with range, kind, description and the class they are inherited from. Own properties come first, then inherited ones, nearest ancestor first.
- **Restrictions** on the class (`subClassOf` restrictions, including those inside an intersection) and those inherited from ancestors, e.g. `:hasTopping some :TomatoTopping (from :Pizza)`.

How a property is matched to classes:

| Domain | Applies to |
| :--- | :--- |
| `rdfs:domain :A` | `:A` and all its subclasses. |
| `rdfs:domain [ owl:unionOf (:A :B) ]` | each of `:A`, `:B` and their subclasses. |
| Several `rdfs:domain` statements, or an intersection | only classes under all of them (RDFS semantics). If no class qualifies, the property is listed under "Properties whose domain matches no class" and not silently dropped. |
| No domain, but a super-property has one | the super-property's domain (shown as "domain via"). The range is inherited the same way. |
| No domain at all, or `owl:Thing` / `rdfs:Resource` | any class. Listed once under "Properties that apply to any class" and not repeated for every class. |

Only asserted `rdfs:subClassOf` links are used; no reasoner runs. For example, a class defined only by `owl:equivalentClass` is not moved under its inferred superclass.

For a long ontology, choose **Output: Markdown** and add **Render Markdown**. It renders as a readable document. Properties are a list rather than a table, because a table with long descriptions is squeezed unreadably in the output pane. Render Markdown disables raw HTML, so descriptions from the file cannot inject markup. The JSON output includes the same data (`classes`, `propertiesForAnyClass`, `propertiesMatchingNoClass`).

## Ontology Graph

Views:

- **Classes and properties** (default): named classes, with an arrow from each subclass to its superclass. It also shows:
  - object properties as domain → range edges;
  - datatype properties as domain → datatype edges (each property gets its own datatype node, so `xsd:string` does not become a hub);
  - `someValuesFrom` / `allValuesFrom` restrictions as dashed edges labelled `property (some)` / `property (only)`.
- **Class hierarchy**: only classes and subclass arrows.
- **All triples**: every IRI and blank node, with one edge per triple. Literal values, and `rdf:type` links to OWL/RDFS/RDF built-ins such as `owl:Class`, go into the node's tooltip and colour instead of becoming edges. Otherwise every class would link to one `owl:Class` hub.

**Max nodes** (default 200) caps the drawing, because vis-network slows down and becomes unreadable with thousands of nodes. When the graph is larger, nodes are chosen breadth-first from the most connected node, so the part shown stays connected. The summary line says e.g. "Showing 200 of 514 nodes".

Other options:

- **Node labels**: `rdfs:label`/`skos:prefLabel` (English or untagged preferred), or prefixed names only.
- **Layout**: 'Force-directed' or 'Hierarchical'. Hierarchical draws a left-to-right tree with superclasses on the left.

If the whole graph only fits at an unreadable size, it opens zoomed in on the most connected node; scroll to zoom out and drag to pan. Physics stops once the layout settles, so dragged nodes stay put.

The graph is drawn only when this is the last operation. Otherwise it outputs the graph as JSON (`nodes`, `edges`, `totalNodes`, `truncated`), which can be saved or processed further.

Drawing loads vis-network 10.1.2 from unpkg.com at display time, the same way 'Show on map' loads Leaflet. It is pinned with a Subresource Integrity hash (`VIS_NETWORK_SRI` in `OntologyGraph.mjs`; update it when changing the version). This needs internet access; without it the op shows a message. Data embedded in the page's script is escaped (`<`, `>`, U+2028/9), so labels cannot inject HTML.

## Implementation

- `src/core/lib/OntologyModel.mjs`: class hierarchy, class expressions, restrictions, descriptions, and property-to-class matching for Ontology Summary.
- `src/core/lib/RDF.mjs`: shared helpers.
  - `getOxigraph()` initialises the WASM once. In the browser, `oxigraph/web_bg.wasm` is inlined as base64 by a `base64-loader` rule in `webpack.config.js` (the same pattern as argon2) and passed to `init()`. Oxigraph's default loader resolves the file from `import.meta.url`, which fails inside the ChefWorker; a separate `.wasm` file would also break the standalone build. The Node build loads the WASM itself.
  - It also provides format detection, `loadStore`, prefix extraction, and `serialise`.
- Turtle output uses `@rdfjs/serializer-turtle`, with two fixes applied in `RDF.mjs`:
  - Local names that are not valid in Turtle stay as full IRIs.
  - Blank-node cycles, which the library would otherwise drop, are given labels.

  As a safety net, the pretty output is re-parsed and replaced with Oxigraph's plain Turtle if any triple were missing.
- RDF/XML output is written by `prettyRDFXML` in `RDF.mjs`, because Oxigraph's RDF/XML writer declares a namespace on every element. The "Pretty" RDF/XML is checked by round-trip tests.
- The operations use their own webpack module (`Ontology`), so the WASM (~5.4 MB as base64) is only downloaded when an ontology operation is first used.
- Node 18 has no global `crypto`, which Oxigraph needs for blank-node ids, so `getOxigraph()` sets it from Node's `webcrypto`.
- Tests:
  - `tests/operations/tests/Ontology.mjs` and `tests/operations/tests/ToTable.mjs` (offline, `npm test`).
  - `tests/browser/OntologyOps.js` (Nightwatch; checks that the WASM loads in the real ChefWorker and that the graph draws from unpkg).

## Possible next steps

- **SPARQL Update.** INSERT/DELETE, then write the modified graph back out, e.g. to rename a namespace or remove deprecated terms.
- **SHACL validation** with `rdf-validate-shacl`.
- **Remote SPARQL endpoints** such as Wikidata or DBpedia. These need CSP `connect-src` entries.
- **OWL/XML, Functional, Manchester and OBO** via a ROBOT Cloud Run proxy, following the pattern in `infrastructure/`.
