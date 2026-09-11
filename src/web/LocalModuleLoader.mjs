/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationConfig from "../core/config/OperationConfig.json" with { type: "json" };

const MODULE_NAMES = new Set(Object.values(OperationConfig).map(operation => operation.module));
let localLoader;

/**
 * Load trusted standalone module source through a classic script element.
 * The generated files only publish source strings; operations still run in workers.
 */
export class LocalModuleLoader {
    /**
     * @param {Document} page
     */
    constructor(page) {
        this.page = page;
        this.cache = new Map();
        this.sources = page.defaultView.CyberChefModuleSources ||= Object.create(null);
    }

    /**
     * @param {string} name
     * @returns {Promise<string>}
     */
    async load(name) {
        if (this.page.location.protocol !== "file:" || !MODULE_NAMES.has(name) || !/^[A-Za-z0-9]+$/.test(name)) {
            throw new Error("Invalid local module request.");
        }
        if (!this.cache.has(name)) {
            const promise = new Promise((resolve, reject) => {
                const script = this.page.createElement("script");
                const finish = error => {
                    clearTimeout(timer);
                    script.remove();
                    const source = this.sources[name];
                    delete this.sources[name];
                    if (error || typeof source !== "string") reject(new Error(`Unable to load local ${name} module.`));
                    else resolve(source);
                };
                const timer = setTimeout(() => finish(true), 30000);
                script.onload = () => finish(false);
                script.onerror = () => finish(true);
                script.src = new URL(`local-modules/${name}.js`, this.page.location.href).href;
                this.page.head.appendChild(script);
            });
            this.cache.set(name, promise);
            promise.catch(() => this.cache.delete(name));
        }
        return this.cache.get(name);
    }
}

/**
 * Reply only to the worker that requested a module, including load failures.
 * @param {Worker} worker
 * @param {string} name
 */
export function replyWithLocalModule(worker, name) {
    localLoader ||= new LocalModuleLoader(document);
    localLoader.load(name).then(
        source => worker.postMessage({action: "moduleSource", data: {module: name, source}}),
        error => worker.postMessage({action: "moduleSource", data: {module: name, error: error.message}})
    );
}
