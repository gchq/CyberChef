/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "assert";
import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";
import { LocalModuleLoader } from "../../../src/web/LocalModuleLoader.mjs";
import { createWorkerModuleLoader } from "../../../src/core/lib/WorkerModuleLoader.mjs";

/**
 * @returns {Object}
 */
function documentFixture() {
    const scripts = [];
    const page = {
        location: {protocol: "file:", href: "file:///offline/CyberChef.html#recipe=test"},
        defaultView: {},
        createElement: () => ({remove() {
            this.removed = true;
        }}),
        head: {appendChild: script => scripts.push(script)}
    };
    return {page, scripts, loader: new LocalModuleLoader(page)};
}

/**
 * @param {string} protocol
 * @returns {Object}
 */
function workerFixture(protocol="file:") {
    const modules = {}, messages = [], imports = [], revoked = [], statuses = [];
    const listeners = [];
    const worker = {
        docURL: protocol + "///offline",
        addEventListener: (event, listener) => listeners.push(listener),
        postMessage: message => messages.push(message),
        sendStatusMessage: message => statuses.push(message),
        Blob,
        URL: {createObjectURL: () => "blob:module", revokeObjectURL: url => revoked.push(url)},
        importScripts: url => {
            imports.push(url); modules.PublicKey = {};
        }
    };
    return {
        worker, modules, messages, imports, revoked, statuses,
        reply: data => listeners.forEach(listener => listener({data: {action: "moduleSource", data}})),
        load: createWorkerModuleLoader(worker, modules, {Certificate: {module: "PublicKey"}})
    };
}

TestRegister.addApiTests([
    it("Local modules: share script loads and remove transient source", async () => {
        const {page, scripts, loader} = documentFixture();
        const first = loader.load("PublicKey"), second = loader.load("PublicKey");
        assert.strictEqual(scripts.length, 1);
        assert.strictEqual(scripts[0].src, "file:///offline/local-modules/PublicKey.js");
        page.defaultView.CyberChefModuleSources.PublicKey = "trusted bundled source";
        scripts[0].onload();
        assert.deepStrictEqual(await Promise.all([first, second]), ["trusted bundled source", "trusted bundled source"]);
        assert.strictEqual(await loader.load("PublicKey"), "trusted bundled source");
        assert.strictEqual(scripts.length, 1);
        assert.strictEqual(scripts[0].removed, true);
        assert.strictEqual(page.defaultView.CyberChefModuleSources.PublicKey, undefined);
    }),
    it("Local modules: reject unknown names and remote document requests", async () => {
        const {page, scripts, loader} = documentFixture();
        for (const name of ["../PublicKey", "__proto__", "constructor", "https://example.com/code", "Unknown"]) {
            await assert.rejects(loader.load(name), /Invalid local module request/);
        }
        page.location.protocol = "https:";
        await assert.rejects(loader.load("PublicKey"), /Invalid local module request/);
        assert.strictEqual(scripts.length, 0);
    }),
    it("Local modules: failed files can be retried", async () => {
        const {page, scripts, loader} = documentFixture();
        const failed = assert.rejects(loader.load("PublicKey"), /Unable to load local PublicKey/);
        scripts[0].onerror();
        await failed;
        const success = loader.load("PublicKey");
        page.defaultView.CyberChefModuleSources.PublicKey = "source";
        scripts[1].onload();
        assert.strictEqual(await success, "source");
    }),
    it("Local modules: reject a script without its source payload", async () => {
        const {scripts, loader} = documentFixture();
        const failed = assert.rejects(loader.load("PublicKey"), /Unable to load local/);
        scripts[0].onload();
        await failed;
    }),
    it("Worker modules: hosted builds retain direct imports", async () => {
        const fixture = workerFixture("https:");
        await fixture.load([{op: "Certificate"}]);
        await fixture.load([{op: "Certificate"}]);
        assert.deepStrictEqual(fixture.imports, ["https:///offline/modules/PublicKey.js"]);
        assert.deepStrictEqual(fixture.messages, []);
    }),
    it("Worker modules: await source, share requests and revoke blobs", async () => {
        const fixture = workerFixture();
        const first = fixture.load([{op: "Certificate"}]), second = fixture.load([{op: "Certificate"}]);
        assert.deepStrictEqual(fixture.imports, []);
        assert.strictEqual(fixture.messages.length, 1);
        fixture.reply({module: "PublicKey", source: "source"});
        await Promise.all([first, second]);
        assert.deepStrictEqual(fixture.imports, ["blob:module"]);
        assert.deepStrictEqual(fixture.revoked, ["blob:module"]);
        assert.strictEqual(fixture.statuses.at(-1), "");
    }),
    it("Worker modules: forward failures and permit retry", async () => {
        const fixture = workerFixture();
        const failed = assert.rejects(fixture.load([{op: "Certificate"}]), /Unavailable/);
        fixture.reply({module: "PublicKey", error: "Unavailable"});
        await failed;
        const success = fixture.load([{op: "Certificate"}]);
        fixture.reply({module: "PublicKey", source: "source"});
        await success;
        assert.strictEqual(fixture.messages.length, 2);
    }),
    it("Worker modules: release blobs after an import failure", async () => {
        const fixture = workerFixture();
        fixture.worker.importScripts = () => {
            throw new Error("Invalid bundle");
        };
        const failed = assert.rejects(fixture.load([{op: "Certificate"}]), /Invalid bundle/);
        fixture.reply({module: "PublicKey", source: "source"});
        await failed;
        assert.deepStrictEqual(fixture.revoked, ["blob:module"]);
        assert.strictEqual(fixture.statuses.at(-1), "");
    }),
    it("Worker modules: require successful registration", async () => {
        const fixture = workerFixture("https:");
        fixture.worker.importScripts = () => undefined;
        await assert.rejects(fixture.load([{op: "Certificate"}]), /did not load/);
    }),
    it("Worker modules: reject unknown operations before requesting code", async () => {
        const fixture = workerFixture();
        await assert.rejects(fixture.load([{op: "constructor"}]), /Unknown operation/);
        assert.deepStrictEqual(fixture.messages, []);
    })
]);
