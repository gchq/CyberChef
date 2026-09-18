/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

/**
 * Create a module loader for a classic worker. Local builds receive bundled source
 * from the document because blob workers cannot import file URLs directly.
 * @param {WorkerGlobalScope} worker
 * @param {Object} modules
 * @param {Object} operationConfig
 * @returns {Function}
 */
export function createWorkerModuleLoader(worker, modules, operationConfig) {
    const pending = new Map(), loading = new Map();
    worker.addEventListener("message", ({data}) => {
        if (data.action !== "moduleSource" || !pending.has(data.data.module)) return;
        const request = pending.get(data.data.module);
        pending.delete(data.data.module);
        if (data.data.error) request.reject(new Error(data.data.error));
        else request.resolve(data.data.source);
    });

    /**
     * Load one module, sharing an in-flight request between simultaneous recipes.
     * @param {string} name
     * @returns {Promise}
     */
    async function load(name) {
        if (Object.hasOwn(modules, name)) return;
        if (loading.has(name)) return loading.get(name);
        const promise = (async () => {
            worker.sendStatusMessage(`Loading ${name} module`);
            try {
                if (worker.docURL.startsWith("file:")) {
                    const source = await new Promise((resolve, reject) => {
                        pending.set(name, {resolve, reject});
                        worker.postMessage({action: "loadModule", data: {module: name}});
                    });
                    const url = worker.URL.createObjectURL(new worker.Blob([source], {type: "text/javascript"}));
                    try {
                        worker.importScripts(url);
                    } finally {
                        worker.URL.revokeObjectURL(url);
                    }
                } else {
                    worker.importScripts(`${worker.docURL}/modules/${name}.js`);
                }
                if (!Object.hasOwn(modules, name)) throw new Error(`Module ${name} did not load.`);
            } finally {
                worker.sendStatusMessage("");
            }
        })();
        loading.set(name, promise);
        try {
            await promise;
        } finally {
            loading.delete(name);
        }
    }

    return async recipeConfig => {
        for (const operation of recipeConfig) {
            if (!Object.hasOwn(operationConfig, operation.op)) throw new Error(`Unknown operation: ${operation.op}`);
            await load(operationConfig[operation.op].module);
        }
    };
}
