/**
 * End-to-end tests for the ontology / RDF operations via Nightwatch.
 * These run offline: they check that the Oxigraph WASM module loads in the
 * browser's ChefWorker and that results render (including via To Table).
 *
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

const browserUtils = require("./browserUtils.js");

const PIZZA_TTL = `@prefix : <http://example.org/pizza#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
:Pizza a owl:Class ; rdfs:label "Pizza, Italian"@en .
:Margherita a owl:Class ; rdfs:subClassOf :Pizza .
`;

/**
 * Returns the current output text.
 *
 * @param {Object} browser
 * @param {function(string)} callback
 */
function readOutput(browser, callback) {
    browser.execute(function () {
        return window.app.manager.output.outputEditorView.state.doc.toString();
    }, [], function ({ value }) {
        callback(value);
    });
}

module.exports = {

    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "Convert RDF Format: Turtle to RDF/XML in the browser": function (browser) {
        browserUtils.loadRecipeConfig(browser, [
            { op: "Convert RDF Format", args: ["Auto", "RDF/XML", "", true, ""] }
        ], PIZZA_TTL);
        browserUtils.bake(browser);
        browser.pause(3000); // First use downloads and compiles the WASM module

        readOutput(browser, value => {
            browser.assert.ok(value.includes("<rdf:RDF"), `Expected RDF/XML output, got: ${value}`);
            browser.assert.ok(value.includes("<owl:Class rdf:about=\"http://example.org/pizza#Margherita\">"), `Expected typed node for Margherita, got: ${value}`);
        });
    },

    "SPARQL Query: SELECT rendered with To Table": function (browser) {
        browserUtils.loadRecipeConfig(browser, [
            { op: "SPARQL Query", args: ["SELECT ?c ?l WHERE { ?c a owl:Class OPTIONAL { ?c rdfs:label ?l } } ORDER BY ?c", "Auto", "CSV", true, "Turtle", "", ""] },
            { op: "To Table", args: [",", "\\r\\n", true, "HTML"] }
        ], PIZZA_TTL);
        browserUtils.bake(browser);
        browser.pause(2000);

        browser.expect.element("#output-html table").to.be.present.before(5000);
        browser.expect.element("#output-html table").text.to.contain("Pizza, Italian");
        browser.expect.element("#output-html table").text.to.contain(":Margherita");
    },

    "Ontology Summary: class hierarchy": function (browser) {
        browserUtils.loadRecipeConfig(browser, [
            { op: "Ontology Summary", args: ["Auto", "Text report", true, 10, ""] }
        ], PIZZA_TTL);
        browserUtils.bake(browser);
        browser.pause(2000);

        readOutput(browser, value => {
            browser.assert.ok(value.includes(":Pizza \"Pizza, Italian\"\n    :Margherita"), `Expected class tree, got: ${value}`);
        });
    },

    "Ontology Graph: draws with vis-network": function (browser) {
        browserUtils.loadRecipeConfig(browser, [
            { op: "Ontology Graph", args: ["Auto", "Classes and properties", 200, "Label, else prefixed name", "Force-directed", ""] }
        ], PIZZA_TTL);
        browserUtils.bake(browser);

        // vis-network is fetched from unpkg on first use and draws into a canvas
        browser.expect.element("#ontologyGraph canvas").to.be.present.before(15000);
        browser.expect.element("#output-html").text.to.contain("2 nodes, 1 edges.");
        browser.saveScreenshot("tests/browser/output/ontology-graph.png");
    },

    after: browser => {
        browser.end();
    }
};
