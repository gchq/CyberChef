/**
 * Dark Reader v4.9.32
 * https://darkreader.org/
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DarkReader = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }

    var userAgent = typeof navigator === 'undefined' ? 'some useragent' : navigator.userAgent.toLowerCase();
    var platform = typeof navigator === 'undefined' ? 'some platform' : navigator.platform.toLowerCase();
    var isChromium = userAgent.includes('chrome') || userAgent.includes('chromium');
    var isThunderbird = userAgent.includes('thunderbird');
    var isFirefox = userAgent.includes('firefox') || isThunderbird;
    userAgent.includes('vivaldi');
    userAgent.includes('yabrowser');
    userAgent.includes('opr') || userAgent.includes('opera');
    userAgent.includes('edg');
    var isSafari = userAgent.includes('safari') && !isChromium;
    var isWindows = platform.startsWith('win');
    var isMacOS = platform.startsWith('mac');
    userAgent.includes('mobile');
    var isShadowDomSupported = typeof ShadowRoot === 'function';
    var isMatchMediaChangeEventListenerSupported = (typeof MediaQueryList === 'function' &&
        typeof MediaQueryList.prototype.addEventListener === 'function');
    ((function () {
        var m = userAgent.match(/chrom[e|ium]\/([^ ]+)/);
        if (m && m[1]) {
            return m[1];
        }
        else {
            return '';
        }
    }))();
    var isDefinedSelectorSupported = (function () {
        try {
            document.querySelector(':defined');
            return true;
        }
        catch (err) {
            return false;
        }
    })();
    ((function () {
        try {
            new CSSStyleSheet();
            return true;
        }
        catch (err) {
            return false;
        }
    }))();

    function getOKResponse(url, mimeType) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch(url, {
                            cache: 'force-cache',
                            credentials: 'omit',
                        })];
                    case 1:
                        response = _a.sent();
                        if (isFirefox && mimeType === 'text/css' && url.startsWith('moz-extension://') && url.endsWith('.css')) {
                            return [2, response];
                        }
                        if (mimeType && !response.headers.get('Content-Type').startsWith(mimeType)) {
                            throw new Error("Mime type mismatch when loading " + url);
                        }
                        if (!response.ok) {
                            throw new Error("Unable to load " + url + " " + response.status + " " + response.statusText);
                        }
                        return [2, response];
                }
            });
        });
    }
    function loadAsDataURL(url, mimeType) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, getOKResponse(url, mimeType)];
                    case 1:
                        response = _a.sent();
                        return [4, readResponseAsDataURL(response)];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    }
    function readResponseAsDataURL(response) {
        return __awaiter(this, void 0, void 0, function () {
            var blob, dataURL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, response.blob()];
                    case 1:
                        blob = _a.sent();
                        return [4, (new Promise(function (resolve) {
                                var reader = new FileReader();
                                reader.onloadend = function () { return resolve(reader.result); };
                                reader.readAsDataURL(blob);
                            }))];
                    case 2:
                        dataURL = _a.sent();
                        return [2, dataURL];
                }
            });
        });
    }

    var throwCORSError = function (url) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, Promise.reject(new Error([
                    'Embedded Dark Reader cannot access a cross-origin resource',
                    url,
                    'Overview your URLs and CORS policies or use',
                    '`DarkReader.setFetchMethod(fetch: (url) => Promise<Response>))`.',
                    'See if using `DarkReader.setFetchMethod(window.fetch)`',
                    'before `DarkReader.enable()` works.'
                ].join(' ')))];
        });
    }); };
    var fetcher = throwCORSError;
    function setFetchMethod(fetch) {
        if (fetch) {
            fetcher = fetch;
        }
        else {
            fetcher = throwCORSError;
        }
    }
    function callFetchMethod(url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetcher(url)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    }

    if (!window.chrome) {
        window.chrome = {};
    }
    if (!chrome.runtime) {
        chrome.runtime = {};
    }
    var messageListeners = new Set();
    function sendMessage() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var id_1, _a, url, responseType, response, text_1, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(args[0] && args[0].type === 'fetch')) return [3, 8];
                        id_1 = args[0].id;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        _a = args[0].data, url = _a.url, responseType = _a.responseType;
                        return [4, callFetchMethod(url)];
                    case 2:
                        response = _b.sent();
                        if (!(responseType === 'data-url')) return [3, 4];
                        return [4, readResponseAsDataURL(response)];
                    case 3:
                        text_1 = _b.sent();
                        return [3, 6];
                    case 4: return [4, response.text()];
                    case 5:
                        text_1 = _b.sent();
                        _b.label = 6;
                    case 6:
                        messageListeners.forEach(function (cb) { return cb({ type: 'fetch-response', data: text_1, error: null, id: id_1 }); });
                        return [3, 8];
                    case 7:
                        err_1 = _b.sent();
                        console.error(err_1);
                        messageListeners.forEach(function (cb) { return cb({ type: 'fetch-response', data: null, err: err_1, id: id_1 }); });
                        return [3, 8];
                    case 8: return [2];
                }
            });
        });
    }
    function addMessageListener(callback) {
        messageListeners.add(callback);
    }
    if (typeof chrome.runtime.sendMessage === 'function') {
        var nativeSendMessage_1 = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            sendMessage.apply(void 0, __spreadArray([], __read(args)));
            nativeSendMessage_1.apply(chrome.runtime, args);
        };
    }
    else {
        chrome.runtime.sendMessage = sendMessage;
    }
    if (!chrome.runtime.onMessage) {
        chrome.runtime.onMessage = {};
    }
    if (typeof chrome.runtime.onMessage.addListener === 'function') {
        var nativeAddListener_1 = chrome.runtime.onMessage.addListener;
        chrome.runtime.onMessage.addListener = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            addMessageListener.apply(void 0, __spreadArray([], __read(args)));
            nativeAddListener_1.apply(chrome.runtime.onMessage, args);
        };
    }
    else {
        chrome.runtime.onMessage.addListener = addMessageListener;
    }

    var ThemeEngines = {
        cssFilter: 'cssFilter',
        svgFilter: 'svgFilter',
        staticTheme: 'staticTheme',
        dynamicTheme: 'dynamicTheme',
    };

    var DEFAULT_COLORS = {
        darkScheme: {
            background: '#181a1b',
            text: '#e8e6e3',
        },
        lightScheme: {
            background: '#dcdad7',
            text: '#181a1b',
        },
    };
    var DEFAULT_THEME = {
        mode: 1,
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        sepia: 0,
        useFont: false,
        fontFamily: isMacOS ? 'Helvetica Neue' : isWindows ? 'Segoe UI' : 'Open Sans',
        textStroke: 0,
        engine: ThemeEngines.dynamicTheme,
        stylesheet: '',
        darkSchemeBackgroundColor: DEFAULT_COLORS.darkScheme.background,
        darkSchemeTextColor: DEFAULT_COLORS.darkScheme.text,
        lightSchemeBackgroundColor: DEFAULT_COLORS.lightScheme.background,
        lightSchemeTextColor: DEFAULT_COLORS.lightScheme.text,
        scrollbarColor: isMacOS ? '' : 'auto',
        selectionColor: 'auto',
        styleSystemControls: true,
    };

    function isArrayLike(items) {
        return items.length != null;
    }
    function forEach(items, iterator) {
        var e_1, _a;
        if (isArrayLike(items)) {
            for (var i = 0, len = items.length; i < len; i++) {
                iterator(items[i]);
            }
        }
        else {
            try {
                for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                    var item = items_1_1.value;
                    iterator(item);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    }
    function push(array, addition) {
        forEach(addition, function (a) { return array.push(a); });
    }
    function toArray(items) {
        var results = [];
        for (var i = 0, len = items.length; i < len; i++) {
            results.push(items[i]);
        }
        return results;
    }

    function logInfo() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
    function logWarn() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }

    function throttle(callback) {
        var pending = false;
        var frameId = null;
        var lastArgs;
        var throttled = (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            lastArgs = args;
            if (frameId) {
                pending = true;
            }
            else {
                callback.apply(void 0, __spreadArray([], __read(lastArgs)));
                frameId = requestAnimationFrame(function () {
                    frameId = null;
                    if (pending) {
                        callback.apply(void 0, __spreadArray([], __read(lastArgs)));
                        pending = false;
                    }
                });
            }
        });
        var cancel = function () {
            cancelAnimationFrame(frameId);
            pending = false;
            frameId = null;
        };
        return Object.assign(throttled, { cancel: cancel });
    }
    function createAsyncTasksQueue() {
        var tasks = [];
        var frameId = null;
        function runTasks() {
            var task;
            while ((task = tasks.shift())) {
                task();
            }
            frameId = null;
        }
        function add(task) {
            tasks.push(task);
            if (!frameId) {
                frameId = requestAnimationFrame(runTasks);
            }
        }
        function cancel() {
            tasks.splice(0);
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        return { add: add, cancel: cancel };
    }

    function getDuration(time) {
        var duration = 0;
        if (time.seconds) {
            duration += time.seconds * 1000;
        }
        if (time.minutes) {
            duration += time.minutes * 60 * 1000;
        }
        if (time.hours) {
            duration += time.hours * 60 * 60 * 1000;
        }
        if (time.days) {
            duration += time.days * 24 * 60 * 60 * 1000;
        }
        return duration;
    }

    function removeNode(node) {
        node && node.parentNode && node.parentNode.removeChild(node);
    }
    function watchForNodePosition(node, mode, onRestore) {
        if (onRestore === void 0) { onRestore = Function.prototype; }
        var MAX_ATTEMPTS_COUNT = 10;
        var RETRY_TIMEOUT = getDuration({ seconds: 2 });
        var ATTEMPTS_INTERVAL = getDuration({ seconds: 10 });
        var prevSibling = node.previousSibling;
        var parent = node.parentNode;
        if (!parent) {
            throw new Error('Unable to watch for node position: parent element not found');
        }
        if (mode === 'prev-sibling' && !prevSibling) {
            throw new Error('Unable to watch for node position: there is no previous sibling');
        }
        var attempts = 0;
        var start = null;
        var timeoutId = null;
        var restore = throttle(function () {
            if (timeoutId) {
                return;
            }
            attempts++;
            var now = Date.now();
            if (start == null) {
                start = now;
            }
            else if (attempts >= MAX_ATTEMPTS_COUNT) {
                if (now - start < ATTEMPTS_INTERVAL) {
                    logWarn("Node position watcher paused: retry in " + RETRY_TIMEOUT + "ms", node, prevSibling);
                    timeoutId = setTimeout(function () {
                        start = null;
                        attempts = 0;
                        timeoutId = null;
                        restore();
                    }, RETRY_TIMEOUT);
                    return;
                }
                start = now;
                attempts = 1;
            }
            if (mode === 'parent') {
                if (prevSibling && prevSibling.parentNode !== parent) {
                    logWarn('Unable to restore node position: sibling parent changed', node, prevSibling, parent);
                    stop();
                    return;
                }
            }
            if (mode === 'prev-sibling') {
                if (prevSibling.parentNode == null) {
                    logWarn('Unable to restore node position: sibling was removed', node, prevSibling, parent);
                    stop();
                    return;
                }
                if (prevSibling.parentNode !== parent) {
                    logWarn('Style was moved to another parent', node, prevSibling, parent);
                    updateParent(prevSibling.parentNode);
                }
            }
            logWarn('Restoring node position', node, prevSibling, parent);
            parent.insertBefore(node, prevSibling ? prevSibling.nextSibling : parent.firstChild);
            observer.takeRecords();
            onRestore && onRestore();
        });
        var observer = new MutationObserver(function () {
            if ((mode === 'parent' && node.parentNode !== parent) ||
                (mode === 'prev-sibling' && node.previousSibling !== prevSibling)) {
                restore();
            }
        });
        var run = function () {
            observer.observe(parent, { childList: true });
        };
        var stop = function () {
            clearTimeout(timeoutId);
            observer.disconnect();
            restore.cancel();
        };
        var skip = function () {
            observer.takeRecords();
        };
        var updateParent = function (parentNode) {
            parent = parentNode;
            stop();
            run();
        };
        run();
        return { run: run, stop: stop, skip: skip };
    }
    function iterateShadowHosts(root, iterator) {
        if (root == null) {
            return;
        }
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
            acceptNode: function (node) {
                return node.shadowRoot == null ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
            }
        });
        for (var node = (root.shadowRoot ? walker.currentNode : walker.nextNode()); node != null; node = walker.nextNode()) {
            iterator(node);
            iterateShadowHosts(node.shadowRoot, iterator);
        }
    }
    function isDOMReady() {
        return document.readyState === 'complete' || document.readyState === 'interactive';
    }
    var readyStateListeners = new Set();
    function addDOMReadyListener(listener) {
        readyStateListeners.add(listener);
    }
    function removeDOMReadyListener(listener) {
        readyStateListeners.delete(listener);
    }
    if (!isDOMReady()) {
        var onReadyStateChange_1 = function () {
            if (isDOMReady()) {
                document.removeEventListener('readystatechange', onReadyStateChange_1);
                readyStateListeners.forEach(function (listener) { return listener(); });
                readyStateListeners.clear();
            }
        };
        document.addEventListener('readystatechange', onReadyStateChange_1);
    }
    var HUGE_MUTATIONS_COUNT = 1000;
    function isHugeMutation(mutations) {
        if (mutations.length > HUGE_MUTATIONS_COUNT) {
            return true;
        }
        var addedNodesCount = 0;
        for (var i = 0; i < mutations.length; i++) {
            addedNodesCount += mutations[i].addedNodes.length;
            if (addedNodesCount > HUGE_MUTATIONS_COUNT) {
                return true;
            }
        }
        return false;
    }
    function getElementsTreeOperations(mutations) {
        var additions = new Set();
        var deletions = new Set();
        var moves = new Set();
        mutations.forEach(function (m) {
            forEach(m.addedNodes, function (n) {
                if (n instanceof Element && n.isConnected) {
                    additions.add(n);
                }
            });
            forEach(m.removedNodes, function (n) {
                if (n instanceof Element) {
                    if (n.isConnected) {
                        moves.add(n);
                    }
                    else {
                        deletions.add(n);
                    }
                }
            });
        });
        moves.forEach(function (n) { return additions.delete(n); });
        var duplicateAdditions = [];
        var duplicateDeletions = [];
        additions.forEach(function (node) {
            if (additions.has(node.parentElement)) {
                duplicateAdditions.push(node);
            }
        });
        deletions.forEach(function (node) {
            if (deletions.has(node.parentElement)) {
                duplicateDeletions.push(node);
            }
        });
        duplicateAdditions.forEach(function (node) { return additions.delete(node); });
        duplicateDeletions.forEach(function (node) { return deletions.delete(node); });
        return { additions: additions, moves: moves, deletions: deletions };
    }
    var optimizedTreeObservers = new Map();
    var optimizedTreeCallbacks = new WeakMap();
    function createOptimizedTreeObserver(root, callbacks) {
        var observer;
        var observerCallbacks;
        var domReadyListener;
        if (optimizedTreeObservers.has(root)) {
            observer = optimizedTreeObservers.get(root);
            observerCallbacks = optimizedTreeCallbacks.get(observer);
        }
        else {
            var hadHugeMutationsBefore_1 = false;
            var subscribedForReadyState_1 = false;
            observer = new MutationObserver(function (mutations) {
                if (isHugeMutation(mutations)) {
                    if (!hadHugeMutationsBefore_1 || isDOMReady()) {
                        observerCallbacks.forEach(function (_a) {
                            var onHugeMutations = _a.onHugeMutations;
                            return onHugeMutations(root);
                        });
                    }
                    else {
                        if (!subscribedForReadyState_1) {
                            domReadyListener = function () { return observerCallbacks.forEach(function (_a) {
                                var onHugeMutations = _a.onHugeMutations;
                                return onHugeMutations(root);
                            }); };
                            addDOMReadyListener(domReadyListener);
                            subscribedForReadyState_1 = true;
                        }
                    }
                    hadHugeMutationsBefore_1 = true;
                }
                else {
                    var elementsOperations_1 = getElementsTreeOperations(mutations);
                    observerCallbacks.forEach(function (_a) {
                        var onMinorMutations = _a.onMinorMutations;
                        return onMinorMutations(elementsOperations_1);
                    });
                }
            });
            observer.observe(root, { childList: true, subtree: true });
            optimizedTreeObservers.set(root, observer);
            observerCallbacks = new Set();
            optimizedTreeCallbacks.set(observer, observerCallbacks);
        }
        observerCallbacks.add(callbacks);
        return {
            disconnect: function () {
                observerCallbacks.delete(callbacks);
                if (domReadyListener) {
                    removeDOMReadyListener(domReadyListener);
                }
                if (observerCallbacks.size === 0) {
                    observer.disconnect();
                    optimizedTreeCallbacks.delete(observer);
                    optimizedTreeObservers.delete(root);
                }
            },
        };
    }

    var anchor;
    var parsedURLCache = new Map();
    function fixBaseURL($url) {
        if (!anchor) {
            anchor = document.createElement('a');
        }
        anchor.href = $url;
        return anchor.href;
    }
    function parseURL($url, $base) {
        if ($base === void 0) { $base = null; }
        var key = "" + $url + ($base ? ';' + $base : '');
        if (parsedURLCache.has(key)) {
            return parsedURLCache.get(key);
        }
        if ($base) {
            var parsedURL_1 = new URL($url, fixBaseURL($base));
            parsedURLCache.set(key, parsedURL_1);
            return parsedURL_1;
        }
        var parsedURL = new URL(fixBaseURL($url));
        parsedURLCache.set($url, parsedURL);
        return parsedURL;
    }
    function getAbsoluteURL($base, $relative) {
        if ($relative.match(/^data\:/)) {
            return $relative;
        }
        var b = parseURL($base);
        var a = parseURL($relative, b.href);
        return a.href;
    }

    function iterateCSSRules(rules, iterate) {
        forEach(rules, function (rule) {
            if (rule instanceof CSSMediaRule) {
                var media = Array.from(rule.media);
                var isScreenOrAll = media.some(function (m) { return m.startsWith('screen') || m.startsWith('all'); });
                var isPrintOrSpeech = media.some(function (m) { return m.startsWith('print') || m.startsWith('speech'); });
                if (isScreenOrAll || !isPrintOrSpeech) {
                    iterateCSSRules(rule.cssRules, iterate);
                }
            }
            else if (rule instanceof CSSStyleRule) {
                iterate(rule);
            }
            else if (rule instanceof CSSImportRule) {
                try {
                    iterateCSSRules(rule.styleSheet.cssRules, iterate);
                }
                catch (err) {
                    logWarn(err);
                }
            }
            else if (rule instanceof CSSSupportsRule) {
                if (CSS.supports(rule.conditionText)) {
                    iterateCSSRules(rule.cssRules, iterate);
                }
            }
            else {
                logWarn("CSSRule type not supported", rule);
            }
        });
    }
    var shorthandVarDependantProperties = [
        'background',
        'border',
        'border-color',
        'border-bottom',
        'border-left',
        'border-right',
        'border-top',
        'outline',
        'outline-color',
    ];
    var shorthandVarDepPropRegexps = isSafari ? shorthandVarDependantProperties.map(function (prop) {
        var regexp = new RegExp(prop + ":\\s*(.*?)\\s*;");
        return [prop, regexp];
    }) : null;
    function iterateCSSDeclarations(style, iterate) {
        forEach(style, function (property) {
            var value = style.getPropertyValue(property).trim();
            if (!value) {
                return;
            }
            iterate(property, value);
        });
        if (isSafari && style.cssText.includes('var(')) {
            shorthandVarDepPropRegexps.forEach(function (_a) {
                var _b = __read(_a, 2), prop = _b[0], regexp = _b[1];
                var match = style.cssText.match(regexp);
                if (match && match[1]) {
                    var val = match[1].trim();
                    iterate(prop, val);
                }
            });
        }
        else {
            shorthandVarDependantProperties.forEach(function (prop) {
                var val = style.getPropertyValue(prop);
                if (val && val.includes('var(')) {
                    iterate(prop, val);
                }
            });
        }
    }
    var cssURLRegex = /url\((('.+?')|(".+?")|([^\)]*?))\)/g;
    var cssImportRegex = /@import\s*(url\()?(('.+?')|(".+?")|([^\)]*?))\)?;?/g;
    function getCSSURLValue(cssURL) {
        return cssURL.replace(/^url\((.*)\)$/, '$1').replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    }
    function getCSSBaseBath(url) {
        var cssURL = parseURL(url);
        return "" + cssURL.origin + cssURL.pathname.replace(/\?.*$/, '').replace(/(\/)([^\/]+)$/i, '$1');
    }
    function replaceCSSRelativeURLsWithAbsolute($css, cssBasePath) {
        return $css.replace(cssURLRegex, function (match) {
            var pathValue = getCSSURLValue(match);
            return "url(\"" + getAbsoluteURL(cssBasePath, pathValue) + "\")";
        });
    }
    var cssCommentsRegex = /\/\*[\s\S]*?\*\//g;
    function removeCSSComments($css) {
        return $css.replace(cssCommentsRegex, '');
    }
    var fontFaceRegex = /@font-face\s*{[^}]*}/g;
    function replaceCSSFontFace($css) {
        return $css.replace(fontFaceRegex, '');
    }

    function hslToRGB(_a) {
        var h = _a.h, s = _a.s, l = _a.l, _b = _a.a, a = _b === void 0 ? 1 : _b;
        if (s === 0) {
            var _c = __read([l, l, l].map(function (x) { return Math.round(x * 255); }), 3), r_1 = _c[0], b_1 = _c[1], g_1 = _c[2];
            return { r: r_1, g: g_1, b: b_1, a: a };
        }
        var c = (1 - Math.abs(2 * l - 1)) * s;
        var x = c * (1 - Math.abs((h / 60) % 2 - 1));
        var m = l - c / 2;
        var _d = __read((h < 60 ? [c, x, 0] :
            h < 120 ? [x, c, 0] :
                h < 180 ? [0, c, x] :
                    h < 240 ? [0, x, c] :
                        h < 300 ? [x, 0, c] :
                            [c, 0, x]).map(function (n) { return Math.round((n + m) * 255); }), 3), r = _d[0], g = _d[1], b = _d[2];
        return { r: r, g: g, b: b, a: a };
    }
    function rgbToHSL(_a) {
        var r255 = _a.r, g255 = _a.g, b255 = _a.b, _b = _a.a, a = _b === void 0 ? 1 : _b;
        var r = r255 / 255;
        var g = g255 / 255;
        var b = b255 / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var c = max - min;
        var l = (max + min) / 2;
        if (c === 0) {
            return { h: 0, s: 0, l: l, a: a };
        }
        var h = (max === r ? (((g - b) / c) % 6) :
            max === g ? ((b - r) / c + 2) :
                ((r - g) / c + 4)) * 60;
        if (h < 0) {
            h += 360;
        }
        var s = c / (1 - Math.abs(2 * l - 1));
        return { h: h, s: s, l: l, a: a };
    }
    function toFixed(n, digits) {
        if (digits === void 0) { digits = 0; }
        var fixed = n.toFixed(digits);
        if (digits === 0) {
            return fixed;
        }
        var dot = fixed.indexOf('.');
        if (dot >= 0) {
            var zerosMatch = fixed.match(/0+$/);
            if (zerosMatch) {
                if (zerosMatch.index === dot + 1) {
                    return fixed.substring(0, dot);
                }
                return fixed.substring(0, zerosMatch.index);
            }
        }
        return fixed;
    }
    function rgbToString(rgb) {
        var r = rgb.r, g = rgb.g, b = rgb.b, a = rgb.a;
        if (a != null && a < 1) {
            return "rgba(" + toFixed(r) + ", " + toFixed(g) + ", " + toFixed(b) + ", " + toFixed(a, 2) + ")";
        }
        return "rgb(" + toFixed(r) + ", " + toFixed(g) + ", " + toFixed(b) + ")";
    }
    function rgbToHexString(_a) {
        var r = _a.r, g = _a.g, b = _a.b, a = _a.a;
        return "#" + (a != null && a < 1 ? [r, g, b, Math.round(a * 255)] : [r, g, b]).map(function (x) {
            return "" + (x < 16 ? '0' : '') + x.toString(16);
        }).join('');
    }
    function hslToString(hsl) {
        var h = hsl.h, s = hsl.s, l = hsl.l, a = hsl.a;
        if (a != null && a < 1) {
            return "hsla(" + toFixed(h) + ", " + toFixed(s * 100) + "%, " + toFixed(l * 100) + "%, " + toFixed(a, 2) + ")";
        }
        return "hsl(" + toFixed(h) + ", " + toFixed(s * 100) + "%, " + toFixed(l * 100) + "%)";
    }
    var rgbMatch = /^rgba?\([^\(\)]+\)$/;
    var hslMatch = /^hsla?\([^\(\)]+\)$/;
    var hexMatch = /^#[0-9a-f]+$/i;
    function parse($color) {
        var c = $color.trim().toLowerCase();
        if (c.match(rgbMatch)) {
            return parseRGB(c);
        }
        if (c.match(hslMatch)) {
            return parseHSL(c);
        }
        if (c.match(hexMatch)) {
            return parseHex(c);
        }
        if (knownColors.has(c)) {
            return getColorByName(c);
        }
        if (systemColors.has(c)) {
            return getSystemColor(c);
        }
        if ($color === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0 };
        }
        throw new Error("Unable to parse " + $color);
    }
    function getNumbersFromString(str, splitter, range, units) {
        var raw = str.split(splitter).filter(function (x) { return x; });
        var unitsList = Object.entries(units);
        var numbers = raw.map(function (r) { return r.trim(); }).map(function (r, i) {
            var n;
            var unit = unitsList.find(function (_a) {
                var _b = __read(_a, 1), u = _b[0];
                return r.endsWith(u);
            });
            if (unit) {
                n = parseFloat(r.substring(0, r.length - unit[0].length)) / unit[1] * range[i];
            }
            else {
                n = parseFloat(r);
            }
            if (range[i] > 1) {
                return Math.round(n);
            }
            return n;
        });
        return numbers;
    }
    var rgbSplitter = /rgba?|\(|\)|\/|,|\s/ig;
    var rgbRange = [255, 255, 255, 1];
    var rgbUnits = { '%': 100 };
    function parseRGB($rgb) {
        var _a = __read(getNumbersFromString($rgb, rgbSplitter, rgbRange, rgbUnits), 4), r = _a[0], g = _a[1], b = _a[2], _b = _a[3], a = _b === void 0 ? 1 : _b;
        return { r: r, g: g, b: b, a: a };
    }
    var hslSplitter = /hsla?|\(|\)|\/|,|\s/ig;
    var hslRange = [360, 1, 1, 1];
    var hslUnits = { '%': 100, 'deg': 360, 'rad': 2 * Math.PI, 'turn': 1 };
    function parseHSL($hsl) {
        var _a = __read(getNumbersFromString($hsl, hslSplitter, hslRange, hslUnits), 4), h = _a[0], s = _a[1], l = _a[2], _b = _a[3], a = _b === void 0 ? 1 : _b;
        return hslToRGB({ h: h, s: s, l: l, a: a });
    }
    function parseHex($hex) {
        var h = $hex.substring(1);
        switch (h.length) {
            case 3:
            case 4: {
                var _a = __read([0, 1, 2].map(function (i) { return parseInt("" + h[i] + h[i], 16); }), 3), r = _a[0], g = _a[1], b = _a[2];
                var a = h.length === 3 ? 1 : (parseInt("" + h[3] + h[3], 16) / 255);
                return { r: r, g: g, b: b, a: a };
            }
            case 6:
            case 8: {
                var _b = __read([0, 2, 4].map(function (i) { return parseInt(h.substring(i, i + 2), 16); }), 3), r = _b[0], g = _b[1], b = _b[2];
                var a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 16) / 255);
                return { r: r, g: g, b: b, a: a };
            }
        }
        throw new Error("Unable to parse " + $hex);
    }
    function getColorByName($color) {
        var n = knownColors.get($color);
        return {
            r: (n >> 16) & 255,
            g: (n >> 8) & 255,
            b: (n >> 0) & 255,
            a: 1
        };
    }
    function getSystemColor($color) {
        var n = systemColors.get($color);
        return {
            r: (n >> 16) & 255,
            g: (n >> 8) & 255,
            b: (n >> 0) & 255,
            a: 1
        };
    }
    var knownColors = new Map(Object.entries({
        aliceblue: 0xf0f8ff,
        antiquewhite: 0xfaebd7,
        aqua: 0x00ffff,
        aquamarine: 0x7fffd4,
        azure: 0xf0ffff,
        beige: 0xf5f5dc,
        bisque: 0xffe4c4,
        black: 0x000000,
        blanchedalmond: 0xffebcd,
        blue: 0x0000ff,
        blueviolet: 0x8a2be2,
        brown: 0xa52a2a,
        burlywood: 0xdeb887,
        cadetblue: 0x5f9ea0,
        chartreuse: 0x7fff00,
        chocolate: 0xd2691e,
        coral: 0xff7f50,
        cornflowerblue: 0x6495ed,
        cornsilk: 0xfff8dc,
        crimson: 0xdc143c,
        cyan: 0x00ffff,
        darkblue: 0x00008b,
        darkcyan: 0x008b8b,
        darkgoldenrod: 0xb8860b,
        darkgray: 0xa9a9a9,
        darkgrey: 0xa9a9a9,
        darkgreen: 0x006400,
        darkkhaki: 0xbdb76b,
        darkmagenta: 0x8b008b,
        darkolivegreen: 0x556b2f,
        darkorange: 0xff8c00,
        darkorchid: 0x9932cc,
        darkred: 0x8b0000,
        darksalmon: 0xe9967a,
        darkseagreen: 0x8fbc8f,
        darkslateblue: 0x483d8b,
        darkslategray: 0x2f4f4f,
        darkslategrey: 0x2f4f4f,
        darkturquoise: 0x00ced1,
        darkviolet: 0x9400d3,
        deeppink: 0xff1493,
        deepskyblue: 0x00bfff,
        dimgray: 0x696969,
        dimgrey: 0x696969,
        dodgerblue: 0x1e90ff,
        firebrick: 0xb22222,
        floralwhite: 0xfffaf0,
        forestgreen: 0x228b22,
        fuchsia: 0xff00ff,
        gainsboro: 0xdcdcdc,
        ghostwhite: 0xf8f8ff,
        gold: 0xffd700,
        goldenrod: 0xdaa520,
        gray: 0x808080,
        grey: 0x808080,
        green: 0x008000,
        greenyellow: 0xadff2f,
        honeydew: 0xf0fff0,
        hotpink: 0xff69b4,
        indianred: 0xcd5c5c,
        indigo: 0x4b0082,
        ivory: 0xfffff0,
        khaki: 0xf0e68c,
        lavender: 0xe6e6fa,
        lavenderblush: 0xfff0f5,
        lawngreen: 0x7cfc00,
        lemonchiffon: 0xfffacd,
        lightblue: 0xadd8e6,
        lightcoral: 0xf08080,
        lightcyan: 0xe0ffff,
        lightgoldenrodyellow: 0xfafad2,
        lightgray: 0xd3d3d3,
        lightgrey: 0xd3d3d3,
        lightgreen: 0x90ee90,
        lightpink: 0xffb6c1,
        lightsalmon: 0xffa07a,
        lightseagreen: 0x20b2aa,
        lightskyblue: 0x87cefa,
        lightslategray: 0x778899,
        lightslategrey: 0x778899,
        lightsteelblue: 0xb0c4de,
        lightyellow: 0xffffe0,
        lime: 0x00ff00,
        limegreen: 0x32cd32,
        linen: 0xfaf0e6,
        magenta: 0xff00ff,
        maroon: 0x800000,
        mediumaquamarine: 0x66cdaa,
        mediumblue: 0x0000cd,
        mediumorchid: 0xba55d3,
        mediumpurple: 0x9370db,
        mediumseagreen: 0x3cb371,
        mediumslateblue: 0x7b68ee,
        mediumspringgreen: 0x00fa9a,
        mediumturquoise: 0x48d1cc,
        mediumvioletred: 0xc71585,
        midnightblue: 0x191970,
        mintcream: 0xf5fffa,
        mistyrose: 0xffe4e1,
        moccasin: 0xffe4b5,
        navajowhite: 0xffdead,
        navy: 0x000080,
        oldlace: 0xfdf5e6,
        olive: 0x808000,
        olivedrab: 0x6b8e23,
        orange: 0xffa500,
        orangered: 0xff4500,
        orchid: 0xda70d6,
        palegoldenrod: 0xeee8aa,
        palegreen: 0x98fb98,
        paleturquoise: 0xafeeee,
        palevioletred: 0xdb7093,
        papayawhip: 0xffefd5,
        peachpuff: 0xffdab9,
        peru: 0xcd853f,
        pink: 0xffc0cb,
        plum: 0xdda0dd,
        powderblue: 0xb0e0e6,
        purple: 0x800080,
        rebeccapurple: 0x663399,
        red: 0xff0000,
        rosybrown: 0xbc8f8f,
        royalblue: 0x4169e1,
        saddlebrown: 0x8b4513,
        salmon: 0xfa8072,
        sandybrown: 0xf4a460,
        seagreen: 0x2e8b57,
        seashell: 0xfff5ee,
        sienna: 0xa0522d,
        silver: 0xc0c0c0,
        skyblue: 0x87ceeb,
        slateblue: 0x6a5acd,
        slategray: 0x708090,
        slategrey: 0x708090,
        snow: 0xfffafa,
        springgreen: 0x00ff7f,
        steelblue: 0x4682b4,
        tan: 0xd2b48c,
        teal: 0x008080,
        thistle: 0xd8bfd8,
        tomato: 0xff6347,
        turquoise: 0x40e0d0,
        violet: 0xee82ee,
        wheat: 0xf5deb3,
        white: 0xffffff,
        whitesmoke: 0xf5f5f5,
        yellow: 0xffff00,
        yellowgreen: 0x9acd32,
    }));
    var systemColors = new Map(Object.entries({
        ActiveBorder: 0x3b99fc,
        ActiveCaption: 0x000000,
        AppWorkspace: 0xaaaaaa,
        Background: 0x6363ce,
        ButtonFace: 0xffffff,
        ButtonHighlight: 0xe9e9e9,
        ButtonShadow: 0x9fa09f,
        ButtonText: 0x000000,
        CaptionText: 0x000000,
        GrayText: 0x7f7f7f,
        Highlight: 0xb2d7ff,
        HighlightText: 0x000000,
        InactiveBorder: 0xffffff,
        InactiveCaption: 0xffffff,
        InactiveCaptionText: 0x000000,
        InfoBackground: 0xfbfcc5,
        InfoText: 0x000000,
        Menu: 0xf6f6f6,
        MenuText: 0xffffff,
        Scrollbar: 0xaaaaaa,
        ThreeDDarkShadow: 0x000000,
        ThreeDFace: 0xc0c0c0,
        ThreeDHighlight: 0xffffff,
        ThreeDLightShadow: 0xffffff,
        ThreeDShadow: 0x000000,
        Window: 0xececec,
        WindowFrame: 0xaaaaaa,
        WindowText: 0x000000,
        '-webkit-focus-ring-color': 0xe59700
    }).map(function (_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        return [key.toLowerCase(), value];
    }));

    function scale(x, inLow, inHigh, outLow, outHigh) {
        return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
    }
    function clamp(x, min, max) {
        return Math.min(max, Math.max(min, x));
    }
    function multiplyMatrices(m1, m2) {
        var result = [];
        for (var i = 0, len = m1.length; i < len; i++) {
            result[i] = [];
            for (var j = 0, len2 = m2[0].length; j < len2; j++) {
                var sum = 0;
                for (var k = 0, len3 = m1[0].length; k < len3; k++) {
                    sum += m1[i][k] * m2[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    function getMatches(regex, input, group) {
        if (group === void 0) { group = 0; }
        var matches = [];
        var m;
        while ((m = regex.exec(input))) {
            matches.push(m[group]);
        }
        return matches;
    }
    function formatCSS(text) {
        function trimLeft(text) {
            return text.replace(/^\s+/, '');
        }
        function getIndent(depth) {
            if (depth === 0) {
                return '';
            }
            return ' '.repeat(4 * depth);
        }
        var emptyRuleRegexp = /[^{}]+{\s*}/g;
        while (emptyRuleRegexp.test(text)) {
            text = text.replace(emptyRuleRegexp, '');
        }
        var css = (text
            .replace(/\s{2,}/g, ' ')
            .replace(/\{/g, '{\n')
            .replace(/\}/g, '\n}\n')
            .replace(/\;(?![^\(|\"]*(\)|\"))/g, ';\n')
            .replace(/\,(?![^\(|\"]*(\)|\"))/g, ',\n')
            .replace(/\n\s*\n/g, '\n')
            .split('\n'));
        var depth = 0;
        var formatted = [];
        for (var x = 0, len = css.length; x < len; x++) {
            var line = css[x] + '\n';
            if (line.match(/\{/)) {
                formatted.push(getIndent(depth++) + trimLeft(line));
            }
            else if (line.match(/\}/)) {
                formatted.push(getIndent(--depth) + trimLeft(line));
            }
            else {
                formatted.push(getIndent(depth) + trimLeft(line));
            }
        }
        return formatted.join('').trim();
    }
    function getParenthesesRange(input, searchStartIndex) {
        if (searchStartIndex === void 0) { searchStartIndex = 0; }
        var length = input.length;
        var depth = 0;
        var firstOpenIndex = -1;
        for (var i = searchStartIndex; i < length; i++) {
            if (depth === 0) {
                var openIndex = input.indexOf('(', i);
                if (openIndex < 0) {
                    break;
                }
                firstOpenIndex = openIndex;
                depth++;
                i = openIndex;
            }
            else {
                var closingIndex = input.indexOf(')', i);
                if (closingIndex < 0) {
                    break;
                }
                var openIndex = input.indexOf('(', i);
                if (openIndex < 0 || closingIndex < openIndex) {
                    depth--;
                    if (depth === 0) {
                        return { start: firstOpenIndex, end: closingIndex + 1 };
                    }
                    i = closingIndex;
                }
                else {
                    depth++;
                    i = openIndex;
                }
            }
        }
        return null;
    }

    function createFilterMatrix(config) {
        var m = Matrix.identity();
        if (config.sepia !== 0) {
            m = multiplyMatrices(m, Matrix.sepia(config.sepia / 100));
        }
        if (config.grayscale !== 0) {
            m = multiplyMatrices(m, Matrix.grayscale(config.grayscale / 100));
        }
        if (config.contrast !== 100) {
            m = multiplyMatrices(m, Matrix.contrast(config.contrast / 100));
        }
        if (config.brightness !== 100) {
            m = multiplyMatrices(m, Matrix.brightness(config.brightness / 100));
        }
        if (config.mode === 1) {
            m = multiplyMatrices(m, Matrix.invertNHue());
        }
        return m;
    }
    function applyColorMatrix(_a, matrix) {
        var _b = __read(_a, 3), r = _b[0], g = _b[1], b = _b[2];
        var rgb = [[r / 255], [g / 255], [b / 255], [1], [1]];
        var result = multiplyMatrices(matrix, rgb);
        return [0, 1, 2].map(function (i) { return clamp(Math.round(result[i][0] * 255), 0, 255); });
    }
    var Matrix = {
        identity: function () {
            return [
                [1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        invertNHue: function () {
            return [
                [0.333, -0.667, -0.667, 0, 1],
                [-0.667, 0.333, -0.667, 0, 1],
                [-0.667, -0.667, 0.333, 0, 1],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        brightness: function (v) {
            return [
                [v, 0, 0, 0, 0],
                [0, v, 0, 0, 0],
                [0, 0, v, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        contrast: function (v) {
            var t = (1 - v) / 2;
            return [
                [v, 0, 0, 0, t],
                [0, v, 0, 0, t],
                [0, 0, v, 0, t],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        sepia: function (v) {
            return [
                [(0.393 + 0.607 * (1 - v)), (0.769 - 0.769 * (1 - v)), (0.189 - 0.189 * (1 - v)), 0, 0],
                [(0.349 - 0.349 * (1 - v)), (0.686 + 0.314 * (1 - v)), (0.168 - 0.168 * (1 - v)), 0, 0],
                [(0.272 - 0.272 * (1 - v)), (0.534 - 0.534 * (1 - v)), (0.131 + 0.869 * (1 - v)), 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        grayscale: function (v) {
            return [
                [(0.2126 + 0.7874 * (1 - v)), (0.7152 - 0.7152 * (1 - v)), (0.0722 - 0.0722 * (1 - v)), 0, 0],
                [(0.2126 - 0.2126 * (1 - v)), (0.7152 + 0.2848 * (1 - v)), (0.0722 - 0.0722 * (1 - v)), 0, 0],
                [(0.2126 - 0.2126 * (1 - v)), (0.7152 - 0.7152 * (1 - v)), (0.0722 + 0.9278 * (1 - v)), 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
    };

    function getBgPole(theme) {
        var isDarkScheme = theme.mode === 1;
        var prop = isDarkScheme ? 'darkSchemeBackgroundColor' : 'lightSchemeBackgroundColor';
        return theme[prop];
    }
    function getFgPole(theme) {
        var isDarkScheme = theme.mode === 1;
        var prop = isDarkScheme ? 'darkSchemeTextColor' : 'lightSchemeTextColor';
        return theme[prop];
    }
    var colorModificationCache = new Map();
    var colorParseCache = new Map();
    function parseToHSLWithCache(color) {
        if (colorParseCache.has(color)) {
            return colorParseCache.get(color);
        }
        var rgb = parse(color);
        var hsl = rgbToHSL(rgb);
        colorParseCache.set(color, hsl);
        return hsl;
    }
    function clearColorModificationCache() {
        colorModificationCache.clear();
        colorParseCache.clear();
    }
    var rgbCacheKeys = ['r', 'g', 'b', 'a'];
    var themeCacheKeys = ['mode', 'brightness', 'contrast', 'grayscale', 'sepia', 'darkSchemeBackgroundColor', 'darkSchemeTextColor', 'lightSchemeBackgroundColor', 'lightSchemeTextColor'];
    function getCacheId(rgb, theme) {
        return rgbCacheKeys.map(function (k) { return rgb[k]; })
            .concat(themeCacheKeys.map(function (k) { return theme[k]; }))
            .join(';');
    }
    function modifyColorWithCache(rgb, theme, modifyHSL, poleColor, anotherPoleColor) {
        var fnCache;
        if (colorModificationCache.has(modifyHSL)) {
            fnCache = colorModificationCache.get(modifyHSL);
        }
        else {
            fnCache = new Map();
            colorModificationCache.set(modifyHSL, fnCache);
        }
        var id = getCacheId(rgb, theme);
        if (fnCache.has(id)) {
            return fnCache.get(id);
        }
        var hsl = rgbToHSL(rgb);
        var pole = poleColor == null ? null : parseToHSLWithCache(poleColor);
        var anotherPole = anotherPoleColor == null ? null : parseToHSLWithCache(anotherPoleColor);
        var modified = modifyHSL(hsl, pole, anotherPole);
        var _a = hslToRGB(modified), r = _a.r, g = _a.g, b = _a.b, a = _a.a;
        var matrix = createFilterMatrix(theme);
        var _b = __read(applyColorMatrix([r, g, b], matrix), 3), rf = _b[0], gf = _b[1], bf = _b[2];
        var color = (a === 1 ?
            rgbToHexString({ r: rf, g: gf, b: bf }) :
            rgbToString({ r: rf, g: gf, b: bf, a: a }));
        fnCache.set(id, color);
        return color;
    }
    function noopHSL(hsl) {
        return hsl;
    }
    function modifyColor(rgb, theme) {
        return modifyColorWithCache(rgb, theme, noopHSL);
    }
    function modifyLightSchemeColor(rgb, theme) {
        var poleBg = getBgPole(theme);
        var poleFg = getFgPole(theme);
        return modifyColorWithCache(rgb, theme, modifyLightModeHSL, poleFg, poleBg);
    }
    function modifyLightModeHSL(_a, poleFg, poleBg) {
        var h = _a.h, s = _a.s, l = _a.l, a = _a.a;
        var isDark = l < 0.5;
        var isNeutral;
        if (isDark) {
            isNeutral = l < 0.2 || s < 0.12;
        }
        else {
            var isBlue = h > 200 && h < 280;
            isNeutral = s < 0.24 || (l > 0.8 && isBlue);
        }
        var hx = h;
        var sx = l;
        if (isNeutral) {
            if (isDark) {
                hx = poleFg.h;
                sx = poleFg.s;
            }
            else {
                hx = poleBg.h;
                sx = poleBg.s;
            }
        }
        var lx = scale(l, 0, 1, poleFg.l, poleBg.l);
        return { h: hx, s: sx, l: lx, a: a };
    }
    var MAX_BG_LIGHTNESS = 0.4;
    function modifyBgHSL(_a, pole) {
        var h = _a.h, s = _a.s, l = _a.l, a = _a.a;
        var isDark = l < 0.5;
        var isBlue = h > 200 && h < 280;
        var isNeutral = s < 0.12 || (l > 0.8 && isBlue);
        if (isDark) {
            var lx_1 = scale(l, 0, 0.5, 0, MAX_BG_LIGHTNESS);
            if (isNeutral) {
                var hx_1 = pole.h;
                var sx = pole.s;
                return { h: hx_1, s: sx, l: lx_1, a: a };
            }
            return { h: h, s: s, l: lx_1, a: a };
        }
        var lx = scale(l, 0.5, 1, MAX_BG_LIGHTNESS, pole.l);
        if (isNeutral) {
            var hx_2 = pole.h;
            var sx = pole.s;
            return { h: hx_2, s: sx, l: lx, a: a };
        }
        var hx = h;
        var isYellow = h > 60 && h < 180;
        if (isYellow) {
            var isCloserToGreen = h > 120;
            if (isCloserToGreen) {
                hx = scale(h, 120, 180, 135, 180);
            }
            else {
                hx = scale(h, 60, 120, 60, 105);
            }
        }
        return { h: hx, s: s, l: lx, a: a };
    }
    function modifyBackgroundColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        var pole = getBgPole(theme);
        return modifyColorWithCache(rgb, __assign(__assign({}, theme), { mode: 0 }), modifyBgHSL, pole);
    }
    var MIN_FG_LIGHTNESS = 0.55;
    function modifyBlueFgHue(hue) {
        return scale(hue, 205, 245, 205, 220);
    }
    function modifyFgHSL(_a, pole) {
        var h = _a.h, s = _a.s, l = _a.l, a = _a.a;
        var isLight = l > 0.5;
        var isNeutral = l < 0.2 || s < 0.24;
        var isBlue = !isNeutral && h > 205 && h < 245;
        if (isLight) {
            var lx_2 = scale(l, 0.5, 1, MIN_FG_LIGHTNESS, pole.l);
            if (isNeutral) {
                var hx_3 = pole.h;
                var sx = pole.s;
                return { h: hx_3, s: sx, l: lx_2, a: a };
            }
            var hx_4 = h;
            if (isBlue) {
                hx_4 = modifyBlueFgHue(h);
            }
            return { h: hx_4, s: s, l: lx_2, a: a };
        }
        if (isNeutral) {
            var hx_5 = pole.h;
            var sx = pole.s;
            var lx_3 = scale(l, 0, 0.5, pole.l, MIN_FG_LIGHTNESS);
            return { h: hx_5, s: sx, l: lx_3, a: a };
        }
        var hx = h;
        var lx;
        if (isBlue) {
            hx = modifyBlueFgHue(h);
            lx = scale(l, 0, 0.5, pole.l, Math.min(1, MIN_FG_LIGHTNESS + 0.05));
        }
        else {
            lx = scale(l, 0, 0.5, pole.l, MIN_FG_LIGHTNESS);
        }
        return { h: hx, s: s, l: lx, a: a };
    }
    function modifyForegroundColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        var pole = getFgPole(theme);
        return modifyColorWithCache(rgb, __assign(__assign({}, theme), { mode: 0 }), modifyFgHSL, pole);
    }
    function modifyBorderHSL(_a, poleFg, poleBg) {
        var h = _a.h, s = _a.s, l = _a.l, a = _a.a;
        var isDark = l < 0.5;
        var isNeutral = l < 0.2 || s < 0.24;
        var hx = h;
        var sx = s;
        if (isNeutral) {
            if (isDark) {
                hx = poleFg.h;
                sx = poleFg.s;
            }
            else {
                hx = poleBg.h;
                sx = poleBg.s;
            }
        }
        var lx = scale(l, 0, 1, 0.5, 0.2);
        return { h: hx, s: sx, l: lx, a: a };
    }
    function modifyBorderColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        var poleFg = getFgPole(theme);
        var poleBg = getBgPole(theme);
        return modifyColorWithCache(rgb, __assign(__assign({}, theme), { mode: 0 }), modifyBorderHSL, poleFg, poleBg);
    }
    function modifyShadowColor(rgb, filter) {
        return modifyBackgroundColor(rgb, filter);
    }
    function modifyGradientColor(rgb, filter) {
        return modifyBackgroundColor(rgb, filter);
    }

    function createTextStyle(config) {
        var lines = [];
        lines.push('*:not(pre, .far, .fa, .glyphicon) {');
        if (config.useFont && config.fontFamily) {
            lines.push("  font-family: " + config.fontFamily + " !important;");
        }
        if (config.textStroke > 0) {
            lines.push("  -webkit-text-stroke: " + config.textStroke + "px !important;");
            lines.push("  text-stroke: " + config.textStroke + "px !important;");
        }
        lines.push('}');
        return lines.join('\n');
    }

    var FilterMode;
    (function (FilterMode) {
        FilterMode[FilterMode["light"] = 0] = "light";
        FilterMode[FilterMode["dark"] = 1] = "dark";
    })(FilterMode || (FilterMode = {}));
    function getCSSFilterValue(config) {
        var filters = [];
        if (config.mode === FilterMode.dark) {
            filters.push('invert(100%) hue-rotate(180deg)');
        }
        if (config.brightness !== 100) {
            filters.push("brightness(" + config.brightness + "%)");
        }
        if (config.contrast !== 100) {
            filters.push("contrast(" + config.contrast + "%)");
        }
        if (config.grayscale !== 0) {
            filters.push("grayscale(" + config.grayscale + "%)");
        }
        if (config.sepia !== 0) {
            filters.push("sepia(" + config.sepia + "%)");
        }
        if (filters.length === 0) {
            return null;
        }
        return filters.join(' ');
    }

    function toSVGMatrix(matrix) {
        return matrix.slice(0, 4).map(function (m) { return m.map(function (m) { return m.toFixed(3); }).join(' '); }).join(' ');
    }
    function getSVGFilterMatrixValue(config) {
        return toSVGMatrix(createFilterMatrix(config));
    }

    var counter = 0;
    var resolvers = new Map();
    var rejectors = new Map();
    function bgFetch(request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        var id = ++counter;
                        resolvers.set(id, resolve);
                        rejectors.set(id, reject);
                        chrome.runtime.sendMessage({ type: 'fetch', data: request, id: id });
                    })];
            });
        });
    }
    chrome.runtime.onMessage.addListener(function (_a) {
        var type = _a.type, data = _a.data, error = _a.error, id = _a.id;
        if (type === 'fetch-response') {
            var resolve = resolvers.get(id);
            var reject = rejectors.get(id);
            resolvers.delete(id);
            rejectors.delete(id);
            if (error) {
                reject && reject(error);
            }
            else {
                resolve && resolve(data);
            }
        }
    });

    function getImageDetails(url) {
        return __awaiter(this, void 0, void 0, function () {
            var dataURL, image, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!url.startsWith('data:')) return [3, 1];
                        dataURL = url;
                        return [3, 3];
                    case 1: return [4, getImageDataURL(url)];
                    case 2:
                        dataURL = _a.sent();
                        _a.label = 3;
                    case 3: return [4, urlToImage(dataURL)];
                    case 4:
                        image = _a.sent();
                        info = analyzeImage(image);
                        return [2, __assign({ src: url, dataURL: dataURL, width: image.naturalWidth, height: image.naturalHeight }, info)];
                }
            });
        });
    }
    function getImageDataURL(url) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedURL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsedURL = new URL(url);
                        if (!(parsedURL.origin === location.origin)) return [3, 2];
                        return [4, loadAsDataURL(url)];
                    case 1: return [2, _a.sent()];
                    case 2: return [4, bgFetch({ url: url, responseType: 'data-url' })];
                    case 3: return [2, _a.sent()];
                }
            });
        });
    }
    function urlToImage(url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        var image = new Image();
                        image.onload = function () { return resolve(image); };
                        image.onerror = function () { return reject("Unable to load image " + url); };
                        image.src = url;
                    })];
            });
        });
    }
    var MAX_ANALIZE_PIXELS_COUNT = 32 * 32;
    var canvas;
    var context;
    function createCanvas() {
        var maxWidth = MAX_ANALIZE_PIXELS_COUNT;
        var maxHeight = MAX_ANALIZE_PIXELS_COUNT;
        canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        context = canvas.getContext('2d');
        context.imageSmoothingEnabled = false;
    }
    function removeCanvas() {
        canvas = null;
        context = null;
    }
    function analyzeImage(image) {
        if (!canvas) {
            createCanvas();
        }
        var naturalWidth = image.naturalWidth, naturalHeight = image.naturalHeight;
        if (naturalHeight === 0 || naturalWidth === 0) {
            logWarn("logWarn(Image is empty " + image.currentSrc + ")");
            return null;
        }
        var naturalPixelsCount = naturalWidth * naturalHeight;
        var k = Math.min(1, Math.sqrt(MAX_ANALIZE_PIXELS_COUNT / naturalPixelsCount));
        var width = Math.ceil(naturalWidth * k);
        var height = Math.ceil(naturalHeight * k);
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, naturalWidth, naturalHeight, 0, 0, width, height);
        var imageData = context.getImageData(0, 0, width, height);
        var d = imageData.data;
        var TRANSPARENT_ALPHA_THRESHOLD = 0.05;
        var DARK_LIGHTNESS_THRESHOLD = 0.4;
        var LIGHT_LIGHTNESS_THRESHOLD = 0.7;
        var transparentPixelsCount = 0;
        var darkPixelsCount = 0;
        var lightPixelsCount = 0;
        var i, x, y;
        var r, g, b, a;
        var l;
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = 4 * (y * width + x);
                r = d[i + 0] / 255;
                g = d[i + 1] / 255;
                b = d[i + 2] / 255;
                a = d[i + 3] / 255;
                if (a < TRANSPARENT_ALPHA_THRESHOLD) {
                    transparentPixelsCount++;
                }
                else {
                    l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    if (l < DARK_LIGHTNESS_THRESHOLD) {
                        darkPixelsCount++;
                    }
                    if (l > LIGHT_LIGHTNESS_THRESHOLD) {
                        lightPixelsCount++;
                    }
                }
            }
        }
        var totalPixelsCount = width * height;
        var opaquePixelsCount = totalPixelsCount - transparentPixelsCount;
        var DARK_IMAGE_THRESHOLD = 0.7;
        var LIGHT_IMAGE_THRESHOLD = 0.7;
        var TRANSPARENT_IMAGE_THRESHOLD = 0.1;
        var LARGE_IMAGE_PIXELS_COUNT = 800 * 600;
        return {
            isDark: ((darkPixelsCount / opaquePixelsCount) >= DARK_IMAGE_THRESHOLD),
            isLight: ((lightPixelsCount / opaquePixelsCount) >= LIGHT_IMAGE_THRESHOLD),
            isTransparent: ((transparentPixelsCount / totalPixelsCount) >= TRANSPARENT_IMAGE_THRESHOLD),
            isLarge: (naturalPixelsCount >= LARGE_IMAGE_PIXELS_COUNT),
        };
    }
    var objectURLs = new Set();
    function getFilteredImageDataURL(_a, filter) {
        var dataURL = _a.dataURL, width = _a.width, height = _a.height;
        var matrix = getSVGFilterMatrixValue(filter);
        var svg = [
            "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"" + width + "\" height=\"" + height + "\">",
            '<defs>',
            '<filter id="darkreader-image-filter">',
            "<feColorMatrix type=\"matrix\" values=\"" + matrix + "\" />",
            '</filter>',
            '</defs>',
            "<image width=\"" + width + "\" height=\"" + height + "\" filter=\"url(#darkreader-image-filter)\" xlink:href=\"" + dataURL + "\" />",
            '</svg>',
        ].join('');
        var bytes = new Uint8Array(svg.length);
        for (var i = 0; i < svg.length; i++) {
            bytes[i] = svg.charCodeAt(i);
        }
        var blob = new Blob([bytes], { type: 'image/svg+xml' });
        var objectURL = URL.createObjectURL(blob);
        objectURLs.add(objectURL);
        return objectURL;
    }
    function cleanImageProcessingCache() {
        removeCanvas();
        objectURLs.forEach(function (u) { return URL.revokeObjectURL(u); });
        objectURLs.clear();
    }

    function getModifiableCSSDeclaration(property, value, rule, variablesStore, ignoreImageSelectors, isCancelled) {
        var important = Boolean(rule && rule.style && rule.style.getPropertyPriority(property));
        var sourceValue = value;
        if (property.startsWith('--')) {
            var modifier = getVariableModifier(variablesStore, property, value, rule, ignoreImageSelectors, isCancelled);
            if (modifier) {
                return { property: property, value: modifier, important: important, sourceValue: sourceValue };
            }
        }
        else if (value.includes('var(')) {
            var modifier = getVariableDependantModifier(variablesStore, property, value);
            if (modifier) {
                return { property: property, value: modifier, important: important, sourceValue: sourceValue };
            }
        }
        else if ((property.includes('color') && property !== '-webkit-print-color-adjust') ||
            property === 'fill' ||
            property === 'stroke' ||
            property === 'stop-color') {
            var modifier = getColorModifier(property, value);
            if (modifier) {
                return { property: property, value: modifier, important: important, sourceValue: sourceValue };
            }
        }
        else if (property === 'background-image' || property === 'list-style-image') {
            var modifier = getBgImageModifier(value, rule, ignoreImageSelectors, isCancelled);
            if (modifier) {
                return { property: property, value: modifier, important: important, sourceValue: sourceValue };
            }
        }
        else if (property.includes('shadow')) {
            var modifier = getShadowModifier(value);
            if (modifier) {
                return { property: property, value: modifier, important: important, sourceValue: sourceValue };
            }
        }
        return null;
    }
    function getModifiedUserAgentStyle(theme, isIFrame, styleSystemControls) {
        var lines = [];
        if (!isIFrame) {
            lines.push('html {');
            lines.push("    background-color: " + modifyBackgroundColor({ r: 255, g: 255, b: 255 }, theme) + " !important;");
            lines.push('}');
        }
        lines.push("" + (isIFrame ? '' : 'html, body, ') + (styleSystemControls ? 'input, textarea, select, button' : '') + " {");
        lines.push("    background-color: " + modifyBackgroundColor({ r: 255, g: 255, b: 255 }, theme) + ";");
        lines.push('}');
        lines.push("html, body, " + (styleSystemControls ? 'input, textarea, select, button' : '') + " {");
        lines.push("    border-color: " + modifyBorderColor({ r: 76, g: 76, b: 76 }, theme) + ";");
        lines.push("    color: " + modifyForegroundColor({ r: 0, g: 0, b: 0 }, theme) + ";");
        lines.push('}');
        lines.push('a {');
        lines.push("    color: " + modifyForegroundColor({ r: 0, g: 64, b: 255 }, theme) + ";");
        lines.push('}');
        lines.push('table {');
        lines.push("    border-color: " + modifyBorderColor({ r: 128, g: 128, b: 128 }, theme) + ";");
        lines.push('}');
        lines.push('::placeholder {');
        lines.push("    color: " + modifyForegroundColor({ r: 169, g: 169, b: 169 }, theme) + ";");
        lines.push('}');
        lines.push('input:-webkit-autofill,');
        lines.push('textarea:-webkit-autofill,');
        lines.push('select:-webkit-autofill {');
        lines.push("    background-color: " + modifyBackgroundColor({ r: 250, g: 255, b: 189 }, theme) + " !important;");
        lines.push("    color: " + modifyForegroundColor({ r: 0, g: 0, b: 0 }, theme) + " !important;");
        lines.push('}');
        if (theme.scrollbarColor) {
            lines.push(getModifiedScrollbarStyle(theme));
        }
        if (theme.selectionColor) {
            lines.push(getModifiedSelectionStyle(theme));
        }
        return lines.join('\n');
    }
    function getSelectionColor(theme) {
        var backgroundColorSelection;
        var foregroundColorSelection;
        if (theme.selectionColor === 'auto') {
            backgroundColorSelection = modifyBackgroundColor({ r: 0, g: 96, b: 212 }, __assign(__assign({}, theme), { grayscale: 0 }));
            foregroundColorSelection = modifyForegroundColor({ r: 255, g: 255, b: 255 }, __assign(__assign({}, theme), { grayscale: 0 }));
        }
        else {
            var rgb = parse(theme.selectionColor);
            var hsl = rgbToHSL(rgb);
            backgroundColorSelection = theme.selectionColor;
            if (hsl.l < 0.5) {
                foregroundColorSelection = '#FFF';
            }
            else {
                foregroundColorSelection = '#000';
            }
        }
        return { backgroundColorSelection: backgroundColorSelection, foregroundColorSelection: foregroundColorSelection };
    }
    function getModifiedSelectionStyle(theme) {
        var lines = [];
        var modifiedSelectionColor = getSelectionColor(theme);
        var backgroundColorSelection = modifiedSelectionColor.backgroundColorSelection;
        var foregroundColorSelection = modifiedSelectionColor.foregroundColorSelection;
        ['::selection', '::-moz-selection'].forEach(function (selection) {
            lines.push(selection + " {");
            lines.push("    background-color: " + backgroundColorSelection + " !important;");
            lines.push("    color: " + foregroundColorSelection + " !important;");
            lines.push('}');
        });
        return lines.join('\n');
    }
    function getModifiedScrollbarStyle(theme) {
        var lines = [];
        var colorTrack;
        var colorIcons;
        var colorThumb;
        var colorThumbHover;
        var colorThumbActive;
        var colorCorner;
        if (theme.scrollbarColor === 'auto') {
            colorTrack = modifyBackgroundColor({ r: 241, g: 241, b: 241 }, theme);
            colorIcons = modifyForegroundColor({ r: 96, g: 96, b: 96 }, theme);
            colorThumb = modifyBackgroundColor({ r: 176, g: 176, b: 176 }, theme);
            colorThumbHover = modifyBackgroundColor({ r: 144, g: 144, b: 144 }, theme);
            colorThumbActive = modifyBackgroundColor({ r: 96, g: 96, b: 96 }, theme);
            colorCorner = modifyBackgroundColor({ r: 255, g: 255, b: 255 }, theme);
        }
        else {
            var rgb = parse(theme.scrollbarColor);
            var hsl_1 = rgbToHSL(rgb);
            var isLight = hsl_1.l > 0.5;
            var lighten = function (lighter) { return (__assign(__assign({}, hsl_1), { l: clamp(hsl_1.l + lighter, 0, 1) })); };
            var darken = function (darker) { return (__assign(__assign({}, hsl_1), { l: clamp(hsl_1.l - darker, 0, 1) })); };
            colorTrack = hslToString(darken(0.4));
            colorIcons = hslToString(isLight ? darken(0.4) : lighten(0.4));
            colorThumb = hslToString(hsl_1);
            colorThumbHover = hslToString(lighten(0.1));
            colorThumbActive = hslToString(lighten(0.2));
        }
        lines.push('::-webkit-scrollbar {');
        lines.push("    background-color: " + colorTrack + ";");
        lines.push("    color: " + colorIcons + ";");
        lines.push('}');
        lines.push('::-webkit-scrollbar-thumb {');
        lines.push("    background-color: " + colorThumb + ";");
        lines.push('}');
        lines.push('::-webkit-scrollbar-thumb:hover {');
        lines.push("    background-color: " + colorThumbHover + ";");
        lines.push('}');
        lines.push('::-webkit-scrollbar-thumb:active {');
        lines.push("    background-color: " + colorThumbActive + ";");
        lines.push('}');
        lines.push('::-webkit-scrollbar-corner {');
        lines.push("    background-color: " + colorCorner + ";");
        lines.push('}');
        if (isFirefox) {
            lines.push('* {');
            lines.push("    scrollbar-color: " + colorThumb + " " + colorTrack + ";");
            lines.push('}');
        }
        return lines.join('\n');
    }
    function getModifiedFallbackStyle(filter, _a) {
        var strict = _a.strict;
        var lines = [];
        lines.push("html, body, " + (strict ? 'body :not(iframe)' : 'body > :not(iframe)') + " {");
        lines.push("    background-color: " + modifyBackgroundColor({ r: 255, g: 255, b: 255 }, filter) + " !important;");
        lines.push("    border-color: " + modifyBorderColor({ r: 64, g: 64, b: 64 }, filter) + " !important;");
        lines.push("    color: " + modifyForegroundColor({ r: 0, g: 0, b: 0 }, filter) + " !important;");
        lines.push('}');
        return lines.join('\n');
    }
    var unparsableColors = new Set([
        'inherit',
        'transparent',
        'initial',
        'currentcolor',
        'none',
        'unset',
    ]);
    var colorParseCache$1 = new Map();
    function parseColorWithCache($color) {
        $color = $color.trim();
        if (colorParseCache$1.has($color)) {
            return colorParseCache$1.get($color);
        }
        var color = parse($color);
        colorParseCache$1.set($color, color);
        return color;
    }
    function tryParseColor($color) {
        try {
            return parseColorWithCache($color);
        }
        catch (err) {
            return null;
        }
    }
    function getColorModifier(prop, value) {
        if (unparsableColors.has(value.toLowerCase())) {
            return value;
        }
        try {
            var rgb_1 = parseColorWithCache(value);
            if (prop.includes('background')) {
                return function (filter) { return modifyBackgroundColor(rgb_1, filter); };
            }
            if (prop.includes('border') || prop.includes('outline')) {
                return function (filter) { return modifyBorderColor(rgb_1, filter); };
            }
            return function (filter) { return modifyForegroundColor(rgb_1, filter); };
        }
        catch (err) {
            logWarn('Color parse error', err);
            return null;
        }
    }
    var gradientRegex = /[\-a-z]+gradient\(([^\(\)]*(\(([^\(\)]*(\(.*?\)))*[^\(\)]*\))){0,15}[^\(\)]*\)/g;
    var imageDetailsCache = new Map();
    var awaitingForImageLoading = new Map();
    function shouldIgnoreImage(selectorText, selectors) {
        if (!selectorText || selectors.length === 0) {
            return false;
        }
        if (selectors.some(function (s) { return s === '*'; })) {
            return true;
        }
        var ruleSelectors = selectorText.split(/,\s*/g);
        var _loop_1 = function (i) {
            var ignoredSelector = selectors[i];
            if (ruleSelectors.some(function (s) { return s === ignoredSelector; })) {
                return { value: true };
            }
        };
        for (var i = 0; i < selectors.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return false;
    }
    function getBgImageModifier(value, rule, ignoreImageSelectors, isCancelled) {
        var _this = this;
        try {
            var gradients = getMatches(gradientRegex, value);
            var urls = getMatches(cssURLRegex, value);
            if (urls.length === 0 && gradients.length === 0) {
                return value;
            }
            var getIndices = function (matches) {
                var index = 0;
                return matches.map(function (match) {
                    var valueIndex = value.indexOf(match, index);
                    index = valueIndex + match.length;
                    return { match: match, index: valueIndex };
                });
            };
            var matches_1 = getIndices(urls).map(function (i) { return (__assign({ type: 'url' }, i)); })
                .concat(getIndices(gradients).map(function (i) { return (__assign({ type: 'gradient' }, i)); }))
                .sort(function (a, b) { return a.index - b.index; });
            var getGradientModifier_1 = function (gradient) {
                var match = gradient.match(/^(.*-gradient)\((.*)\)$/);
                var type = match[1];
                var content = match[2];
                var partsRegex = /([^\(\),]+(\([^\(\)]*(\([^\(\)]*\)*[^\(\)]*)?\))?[^\(\),]*),?/g;
                var colorStopRegex = /^(from|color-stop|to)\(([^\(\)]*?,\s*)?(.*?)\)$/;
                var parts = getMatches(partsRegex, content, 1).map(function (part) {
                    part = part.trim();
                    var rgb = tryParseColor(part);
                    if (rgb) {
                        return function (filter) { return modifyGradientColor(rgb, filter); };
                    }
                    var space = part.lastIndexOf(' ');
                    rgb = tryParseColor(part.substring(0, space));
                    if (rgb) {
                        return function (filter) { return modifyGradientColor(rgb, filter) + " " + part.substring(space + 1); };
                    }
                    var colorStopMatch = part.match(colorStopRegex);
                    if (colorStopMatch) {
                        rgb = tryParseColor(colorStopMatch[3]);
                        if (rgb) {
                            return function (filter) { return colorStopMatch[1] + "(" + (colorStopMatch[2] ? colorStopMatch[2] + ", " : '') + modifyGradientColor(rgb, filter) + ")"; };
                        }
                    }
                    return function () { return part; };
                });
                return function (filter) {
                    return type + "(" + parts.map(function (modify) { return modify(filter); }).join(', ') + ")";
                };
            };
            var getURLModifier_1 = function (urlValue) {
                var _a;
                if (shouldIgnoreImage(rule.selectorText, ignoreImageSelectors)) {
                    return null;
                }
                var url = getCSSURLValue(urlValue);
                var parentStyleSheet = rule.parentStyleSheet;
                var baseURL = parentStyleSheet.href ?
                    getCSSBaseBath(parentStyleSheet.href) :
                    ((_a = parentStyleSheet.ownerNode) === null || _a === void 0 ? void 0 : _a.baseURI) || location.origin;
                url = getAbsoluteURL(baseURL, url);
                var absoluteValue = "url(\"" + url + "\")";
                return function (filter) { return __awaiter(_this, void 0, void 0, function () {
                    var imageDetails, awaiters_1, err_1, bgImageValue;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!imageDetailsCache.has(url)) return [3, 1];
                                imageDetails = imageDetailsCache.get(url);
                                return [3, 7];
                            case 1:
                                _a.trys.push([1, 6, , 7]);
                                if (!awaitingForImageLoading.has(url)) return [3, 3];
                                awaiters_1 = awaitingForImageLoading.get(url);
                                return [4, new Promise(function (resolve) { return awaiters_1.push(resolve); })];
                            case 2:
                                imageDetails = _a.sent();
                                if (!imageDetails) {
                                    return [2, null];
                                }
                                return [3, 5];
                            case 3:
                                awaitingForImageLoading.set(url, []);
                                return [4, getImageDetails(url)];
                            case 4:
                                imageDetails = _a.sent();
                                imageDetailsCache.set(url, imageDetails);
                                awaitingForImageLoading.get(url).forEach(function (resolve) { return resolve(imageDetails); });
                                awaitingForImageLoading.delete(url);
                                _a.label = 5;
                            case 5:
                                if (isCancelled()) {
                                    return [2, null];
                                }
                                return [3, 7];
                            case 6:
                                err_1 = _a.sent();
                                logWarn(err_1);
                                if (awaitingForImageLoading.has(url)) {
                                    awaitingForImageLoading.get(url).forEach(function (resolve) { return resolve(null); });
                                    awaitingForImageLoading.delete(url);
                                }
                                return [2, absoluteValue];
                            case 7:
                                bgImageValue = getBgImageValue_1(imageDetails, filter) || absoluteValue;
                                return [2, bgImageValue];
                        }
                    });
                }); };
            };
            var getBgImageValue_1 = function (imageDetails, filter) {
                var isDark = imageDetails.isDark, isLight = imageDetails.isLight, isTransparent = imageDetails.isTransparent, isLarge = imageDetails.isLarge, width = imageDetails.width;
                var result;
                if (isDark && isTransparent && filter.mode === 1 && !isLarge && width > 2) {
                    logInfo("Inverting dark image " + imageDetails.src);
                    var inverted = getFilteredImageDataURL(imageDetails, __assign(__assign({}, filter), { sepia: clamp(filter.sepia + 10, 0, 100) }));
                    result = "url(\"" + inverted + "\")";
                }
                else if (isLight && !isTransparent && filter.mode === 1) {
                    if (isLarge) {
                        result = 'none';
                    }
                    else {
                        logInfo("Dimming light image " + imageDetails.src);
                        var dimmed = getFilteredImageDataURL(imageDetails, filter);
                        result = "url(\"" + dimmed + "\")";
                    }
                }
                else if (filter.mode === 0 && isLight && !isLarge) {
                    logInfo("Applying filter to image " + imageDetails.src);
                    var filtered = getFilteredImageDataURL(imageDetails, __assign(__assign({}, filter), { brightness: clamp(filter.brightness - 10, 5, 200), sepia: clamp(filter.sepia + 10, 0, 100) }));
                    result = "url(\"" + filtered + "\")";
                }
                else {
                    result = null;
                }
                return result;
            };
            var modifiers_1 = [];
            var index_1 = 0;
            matches_1.forEach(function (_a, i) {
                var match = _a.match, type = _a.type, matchStart = _a.index;
                var prefixStart = index_1;
                var matchEnd = matchStart + match.length;
                index_1 = matchEnd;
                modifiers_1.push(function () { return value.substring(prefixStart, matchStart); });
                modifiers_1.push(type === 'url' ? getURLModifier_1(match) : getGradientModifier_1(match));
                if (i === matches_1.length - 1) {
                    modifiers_1.push(function () { return value.substring(matchEnd); });
                }
            });
            return function (filter) {
                var results = modifiers_1.filter(Boolean).map(function (modify) { return modify(filter); });
                if (results.some(function (r) { return r instanceof Promise; })) {
                    return Promise.all(results)
                        .then(function (asyncResults) {
                        return asyncResults.join('');
                    });
                }
                return results.join('');
            };
        }
        catch (err) {
            logWarn("Unable to parse gradient " + value, err);
            return null;
        }
    }
    function getShadowModifier(value) {
        try {
            var index_2 = 0;
            var colorMatches_1 = getMatches(/(^|\s)([a-z]+\(.+?\)|#[0-9a-f]+|[a-z]+)(.*?(inset|outset)?($|,))/ig, value, 2);
            var modifiers_2 = colorMatches_1.map(function (match, i) {
                var prefixIndex = index_2;
                var matchIndex = value.indexOf(match, index_2);
                var matchEnd = matchIndex + match.length;
                index_2 = matchEnd;
                var rgb = tryParseColor(match);
                if (!rgb) {
                    return function () { return value.substring(prefixIndex, matchEnd); };
                }
                return function (filter) { return "" + value.substring(prefixIndex, matchIndex) + modifyShadowColor(rgb, filter) + (i === colorMatches_1.length - 1 ? value.substring(matchEnd) : ''); };
            });
            return function (filter) { return modifiers_2.map(function (modify) { return modify(filter); }).join(''); };
        }
        catch (err) {
            logWarn("Unable to parse shadow " + value, err);
            return null;
        }
    }
    function getVariableModifier(variablesStore, prop, value, rule, ignoredImgSelectors, isCancelled) {
        return variablesStore.getModifierForVariable({
            varName: prop,
            sourceValue: value,
            rule: rule,
            ignoredImgSelectors: ignoredImgSelectors,
            isCancelled: isCancelled,
        });
    }
    function getVariableDependantModifier(variablesStore, prop, value) {
        return variablesStore.getModifierForVarDependant(prop, value);
    }
    function cleanModificationCache() {
        colorParseCache$1.clear();
        clearColorModificationCache();
        imageDetailsCache.clear();
        cleanImageProcessingCache();
        awaitingForImageLoading.clear();
    }

    var VAR_TYPE_BGCOLOR = 1 << 0;
    var VAR_TYPE_TEXTCOLOR = 1 << 1;
    var VAR_TYPE_BORDERCOLOR = 1 << 2;
    var VAR_TYPE_BGIMG = 1 << 3;
    var VariablesStore = (function () {
        function VariablesStore() {
            this.varTypes = new Map();
            this.rulesQueue = [];
            this.definedVars = new Set();
            this.varRefs = new Map();
            this.unknownColorVars = new Set();
            this.unknownBgVars = new Set();
            this.undefinedVars = new Set();
            this.initialVarTypes = new Map();
            this.changedTypeVars = new Set();
            this.typeChangeSubscriptions = new Map();
            this.unstableVarValues = new Map();
        }
        VariablesStore.prototype.clear = function () {
            this.varTypes.clear();
            this.rulesQueue.splice(0);
            this.definedVars.clear();
            this.varRefs.clear();
            this.unknownColorVars.clear();
            this.unknownBgVars.clear();
            this.undefinedVars.clear();
            this.initialVarTypes.clear();
            this.changedTypeVars.clear();
            this.typeChangeSubscriptions.clear();
            this.unstableVarValues.clear();
        };
        VariablesStore.prototype.isVarType = function (varName, typeNum) {
            return (this.varTypes.has(varName) &&
                (this.varTypes.get(varName) & typeNum) > 0);
        };
        VariablesStore.prototype.addRulesForMatching = function (rules) {
            this.rulesQueue.push(rules);
        };
        VariablesStore.prototype.matchVariablesAndDependants = function () {
            var _this = this;
            this.changedTypeVars.clear();
            this.initialVarTypes = new Map(this.varTypes);
            this.collectRootVariables();
            this.rulesQueue.forEach(function (rules) { return _this.collectVariables(rules); });
            this.rulesQueue.forEach(function (rules) { return _this.collectVarDependants(rules); });
            this.rulesQueue.splice(0);
            this.collectRootVarDependants();
            this.varRefs.forEach(function (refs, v) {
                refs.forEach(function (r) {
                    if (_this.varTypes.has(v)) {
                        _this.resolveVariableType(r, _this.varTypes.get(v));
                    }
                });
            });
            this.unknownColorVars.forEach(function (v) {
                if (_this.unknownBgVars.has(v)) {
                    _this.unknownColorVars.delete(v);
                    _this.unknownBgVars.delete(v);
                    _this.resolveVariableType(v, VAR_TYPE_BGCOLOR);
                }
                else if (_this.isVarType(v, VAR_TYPE_BGCOLOR | VAR_TYPE_TEXTCOLOR | VAR_TYPE_BORDERCOLOR)) {
                    _this.unknownColorVars.delete(v);
                }
                else {
                    _this.undefinedVars.add(v);
                }
            });
            this.unknownBgVars.forEach(function (v) {
                var hasColor = _this.findVarRef(v, function (ref) {
                    return (_this.unknownColorVars.has(ref) ||
                        _this.isVarType(ref, VAR_TYPE_TEXTCOLOR | VAR_TYPE_BORDERCOLOR));
                }) != null;
                if (hasColor) {
                    _this.itarateVarRefs(v, function (ref) {
                        _this.resolveVariableType(ref, VAR_TYPE_BGCOLOR);
                    });
                }
                else if (_this.isVarType(v, VAR_TYPE_BGCOLOR | VAR_TYPE_BGIMG)) {
                    _this.unknownBgVars.delete(v);
                }
                else {
                    _this.undefinedVars.add(v);
                }
            });
            this.changedTypeVars.forEach(function (varName) {
                if (_this.typeChangeSubscriptions.has(varName)) {
                    _this.typeChangeSubscriptions
                        .get(varName)
                        .forEach(function (callback) {
                        callback();
                    });
                }
            });
            this.changedTypeVars.clear();
        };
        VariablesStore.prototype.getModifierForVariable = function (options) {
            var _this = this;
            return function (theme) {
                var varName = options.varName, sourceValue = options.sourceValue, rule = options.rule, ignoredImgSelectors = options.ignoredImgSelectors, isCancelled = options.isCancelled;
                var getDeclarations = function () {
                    var declarations = [];
                    var addModifiedValue = function (typeNum, varNameWrapper, colorModifier) {
                        if (!_this.isVarType(varName, typeNum)) {
                            return;
                        }
                        var property = varNameWrapper(varName);
                        var modifiedValue;
                        if (isVarDependant(sourceValue)) {
                            if (isConstructedColorVar(sourceValue)) {
                                var value = insertVarValues(sourceValue, _this.unstableVarValues);
                                if (!value) {
                                    value = typeNum === VAR_TYPE_BGCOLOR ? '#ffffff' : '#000000';
                                }
                                modifiedValue = colorModifier(value, theme);
                            }
                            else {
                                modifiedValue = replaceCSSVariablesNames(sourceValue, function (v) { return varNameWrapper(v); }, function (fallback) { return colorModifier(fallback, theme); });
                            }
                        }
                        else {
                            modifiedValue = colorModifier(sourceValue, theme);
                        }
                        declarations.push({
                            property: property,
                            value: modifiedValue,
                        });
                    };
                    addModifiedValue(VAR_TYPE_BGCOLOR, wrapBgColorVariableName, tryModifyBgColor);
                    addModifiedValue(VAR_TYPE_TEXTCOLOR, wrapTextColorVariableName, tryModifyTextColor);
                    addModifiedValue(VAR_TYPE_BORDERCOLOR, wrapBorderColorVariableName, tryModifyBorderColor);
                    if (_this.isVarType(varName, VAR_TYPE_BGIMG)) {
                        var property = wrapBgImgVariableName(varName);
                        var modifiedValue = sourceValue;
                        if (isVarDependant(sourceValue)) {
                            modifiedValue = replaceCSSVariablesNames(sourceValue, function (v) { return wrapBgColorVariableName(v); }, function (fallback) { return tryModifyBgColor(fallback, theme); });
                        }
                        var bgModifier = getBgImageModifier(modifiedValue, rule, ignoredImgSelectors, isCancelled);
                        modifiedValue = typeof bgModifier === 'function' ? bgModifier(theme) : bgModifier;
                        declarations.push({
                            property: property,
                            value: modifiedValue,
                        });
                    }
                    return declarations;
                };
                var callbacks = new Set();
                var addListener = function (onTypeChange) {
                    var callback = function () {
                        var decs = getDeclarations();
                        onTypeChange(decs);
                    };
                    callbacks.add(callback);
                    _this.subscribeForVarTypeChange(varName, callback);
                };
                var removeListeners = function () {
                    callbacks.forEach(function (callback) {
                        _this.unsubscribeFromVariableTypeChanges(varName, callback);
                    });
                };
                return {
                    declarations: getDeclarations(),
                    onTypeChange: { addListener: addListener, removeListeners: removeListeners },
                };
            };
        };
        VariablesStore.prototype.getModifierForVarDependant = function (property, sourceValue) {
            var _this = this;
            if (sourceValue.match(/^\s*(rgb|hsl)a?\(/)) {
                var isBg_1 = property.startsWith('background');
                var isText_1 = property === 'color';
                return function (theme) {
                    var value = insertVarValues(sourceValue, _this.unstableVarValues);
                    if (!value) {
                        value = isBg_1 ? '#ffffff' : '#000000';
                    }
                    var modifier = isBg_1 ? tryModifyBgColor : isText_1 ? tryModifyTextColor : tryModifyBorderColor;
                    return modifier(value, theme);
                };
            }
            if (property === 'background-color') {
                return function (theme) {
                    return replaceCSSVariablesNames(sourceValue, function (v) { return wrapBgColorVariableName(v); }, function (fallback) { return tryModifyBgColor(fallback, theme); });
                };
            }
            if (property === 'color') {
                return function (theme) {
                    return replaceCSSVariablesNames(sourceValue, function (v) { return wrapTextColorVariableName(v); }, function (fallback) { return tryModifyTextColor(fallback, theme); });
                };
            }
            if (property === 'background' || property === 'background-image' || property === 'box-shadow') {
                return function (theme) {
                    var unknownVars = new Set();
                    var modify = function () { return replaceCSSVariablesNames(sourceValue, function (v) {
                        if (_this.isVarType(v, VAR_TYPE_BGCOLOR)) {
                            return wrapBgColorVariableName(v);
                        }
                        if (_this.isVarType(v, VAR_TYPE_BGIMG)) {
                            return wrapBgImgVariableName(v);
                        }
                        unknownVars.add(v);
                        return v;
                    }, function (fallback) { return tryModifyBgColor(fallback, theme); }); };
                    var modified = modify();
                    if (unknownVars.size > 0) {
                        return new Promise(function (resolve) {
                            var firstUnknownVar = unknownVars.values().next().value;
                            var callback = function () {
                                _this.unsubscribeFromVariableTypeChanges(firstUnknownVar, callback);
                                var newValue = modify();
                                resolve(newValue);
                            };
                            _this.subscribeForVarTypeChange(firstUnknownVar, callback);
                        });
                    }
                    return modified;
                };
            }
            if (property.startsWith('border') || property.startsWith('outline')) {
                if (sourceValue.endsWith(')')) {
                    var colorTypeMatch = sourceValue.match(/((rgb|hsl)a?)\(/);
                    if (colorTypeMatch) {
                        var index_1 = colorTypeMatch.index;
                        return function (theme) {
                            var value = insertVarValues(sourceValue, _this.unstableVarValues);
                            if (!value) {
                                return sourceValue;
                            }
                            var beginning = sourceValue.substring(0, index_1);
                            var color = sourceValue.substring(index_1, sourceValue.length);
                            var inserted = insertVarValues(color, _this.unstableVarValues);
                            var modified = tryModifyBorderColor(inserted, theme);
                            return "" + beginning + modified;
                        };
                    }
                }
                return function (theme) {
                    return replaceCSSVariablesNames(sourceValue, function (v) { return wrapBorderColorVariableName(v); }, function (fallback) { return tryModifyTextColor(fallback, theme); });
                };
            }
            return null;
        };
        VariablesStore.prototype.subscribeForVarTypeChange = function (varName, callback) {
            if (!this.typeChangeSubscriptions.has(varName)) {
                this.typeChangeSubscriptions.set(varName, new Set());
            }
            this.typeChangeSubscriptions.get(varName).add(callback);
        };
        VariablesStore.prototype.unsubscribeFromVariableTypeChanges = function (varName, callback) {
            if (this.typeChangeSubscriptions.has(varName)) {
                this.typeChangeSubscriptions.get(varName).delete(callback);
            }
        };
        VariablesStore.prototype.collectVariables = function (rules) {
            var _this = this;
            iterateVariables(rules, function (varName, value) {
                _this.inspectVariable(varName, value);
            });
        };
        VariablesStore.prototype.collectRootVariables = function () {
            var _this = this;
            iterateCSSDeclarations(document.documentElement.style, function (property, value) {
                if (isVariable(property)) {
                    _this.inspectVariable(property, value);
                }
            });
        };
        VariablesStore.prototype.inspectVariable = function (varName, value) {
            this.unstableVarValues.set(varName, value);
            if (isVarDependant(value) && isConstructedColorVar(value)) {
                this.unknownColorVars.add(varName);
                this.definedVars.add(varName);
            }
            if (this.definedVars.has(varName)) {
                return;
            }
            this.definedVars.add(varName);
            var color = tryParseColor(value);
            if (color) {
                this.unknownColorVars.add(varName);
            }
            else if (value.includes('url(') ||
                value.includes('linear-gradient(') ||
                value.includes('radial-gradient(')) {
                this.resolveVariableType(varName, VAR_TYPE_BGIMG);
            }
        };
        VariablesStore.prototype.resolveVariableType = function (varName, typeNum) {
            var initialType = this.initialVarTypes.get(varName) || 0;
            var currentType = this.varTypes.get(varName) || 0;
            var newType = currentType | typeNum;
            this.varTypes.set(varName, newType);
            if (newType !== initialType || this.undefinedVars.has(varName)) {
                this.changedTypeVars.add(varName);
                this.undefinedVars.delete(varName);
            }
            this.unknownColorVars.delete(varName);
            this.unknownBgVars.delete(varName);
        };
        VariablesStore.prototype.collectVarDependants = function (rules) {
            var _this = this;
            iterateVarDependants(rules, function (property, value) {
                _this.inspectVerDependant(property, value);
            });
        };
        VariablesStore.prototype.collectRootVarDependants = function () {
            var _this = this;
            iterateCSSDeclarations(document.documentElement.style, function (property, value) {
                if (isVarDependant(value)) {
                    _this.inspectVerDependant(property, value);
                }
            });
        };
        VariablesStore.prototype.inspectVerDependant = function (property, value) {
            var _this = this;
            if (isVariable(property)) {
                this.iterateVarDeps(value, function (ref) {
                    if (!_this.varRefs.has(property)) {
                        _this.varRefs.set(property, new Set());
                    }
                    _this.varRefs.get(property).add(ref);
                });
            }
            else if (property === 'background-color' || property === 'box-shadow') {
                this.iterateVarDeps(value, function (v) { return _this.resolveVariableType(v, VAR_TYPE_BGCOLOR); });
            }
            else if (property === 'color') {
                this.iterateVarDeps(value, function (v) { return _this.resolveVariableType(v, VAR_TYPE_TEXTCOLOR); });
            }
            else if (property.startsWith('border') || property.startsWith('outline')) {
                this.iterateVarDeps(value, function (v) { return _this.resolveVariableType(v, VAR_TYPE_BORDERCOLOR); });
            }
            else if (property === 'background' || property === 'background-image') {
                this.iterateVarDeps(value, function (v) {
                    if (_this.isVarType(v, VAR_TYPE_BGCOLOR | VAR_TYPE_BGIMG)) {
                        return;
                    }
                    var isBgColor = _this.findVarRef(v, function (ref) {
                        return (_this.unknownColorVars.has(ref) ||
                            _this.isVarType(ref, VAR_TYPE_TEXTCOLOR | VAR_TYPE_BORDERCOLOR));
                    }) != null;
                    _this.itarateVarRefs(v, function (ref) {
                        if (isBgColor) {
                            _this.resolveVariableType(ref, VAR_TYPE_BGCOLOR);
                        }
                        else {
                            _this.unknownBgVars.add(ref);
                        }
                    });
                });
            }
        };
        VariablesStore.prototype.iterateVarDeps = function (value, iterator) {
            var varDeps = new Set();
            iterateVarDependencies(value, function (v) { return varDeps.add(v); });
            varDeps.forEach(function (v) { return iterator(v); });
        };
        VariablesStore.prototype.findVarRef = function (varName, iterator, stack) {
            var e_1, _a;
            if (stack === void 0) { stack = new Set(); }
            if (stack.has(varName)) {
                return null;
            }
            stack.add(varName);
            var result = iterator(varName);
            if (result) {
                return varName;
            }
            var refs = this.varRefs.get(varName);
            if (!refs || refs.size === 0) {
                return null;
            }
            try {
                for (var refs_1 = __values(refs), refs_1_1 = refs_1.next(); !refs_1_1.done; refs_1_1 = refs_1.next()) {
                    var ref = refs_1_1.value;
                    var found = this.findVarRef(ref, iterator, stack);
                    if (found) {
                        return found;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (refs_1_1 && !refs_1_1.done && (_a = refs_1.return)) _a.call(refs_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        VariablesStore.prototype.itarateVarRefs = function (varName, iterator) {
            this.findVarRef(varName, function (ref) {
                iterator(ref);
                return false;
            });
        };
        VariablesStore.prototype.putRootVars = function (styleElement, theme) {
            var e_2, _a;
            var _this = this;
            var sheet = styleElement.sheet;
            if (sheet.cssRules.length > 0) {
                sheet.deleteRule(0);
            }
            var declarations = new Map();
            iterateCSSDeclarations(document.documentElement.style, function (property, value) {
                if (isVariable(property)) {
                    if (_this.isVarType(property, VAR_TYPE_BGCOLOR)) {
                        declarations.set(wrapBgColorVariableName(property), tryModifyBgColor(value, theme));
                    }
                    if (_this.isVarType(property, VAR_TYPE_TEXTCOLOR)) {
                        declarations.set(wrapTextColorVariableName(property), tryModifyTextColor(value, theme));
                    }
                    if (_this.isVarType(property, VAR_TYPE_BORDERCOLOR)) {
                        declarations.set(wrapBorderColorVariableName(property), tryModifyBorderColor(value, theme));
                    }
                }
            });
            var cssLines = [];
            cssLines.push(':root {');
            try {
                for (var declarations_1 = __values(declarations), declarations_1_1 = declarations_1.next(); !declarations_1_1.done; declarations_1_1 = declarations_1.next()) {
                    var _b = __read(declarations_1_1.value, 2), property = _b[0], value = _b[1];
                    cssLines.push("    " + property + ": " + value + ";");
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (declarations_1_1 && !declarations_1_1.done && (_a = declarations_1.return)) _a.call(declarations_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            cssLines.push('}');
            var cssText = cssLines.join('\n');
            sheet.insertRule(cssText);
        };
        return VariablesStore;
    }());
    var variablesStore = new VariablesStore();
    function getVariableRange(input, searchStart) {
        if (searchStart === void 0) { searchStart = 0; }
        var start = input.indexOf('var(', searchStart);
        if (start >= 0) {
            var range = getParenthesesRange(input, start + 3);
            if (range) {
                return { start: start, end: range.end };
            }
            return null;
        }
    }
    function getVariablesMatches(input) {
        var ranges = [];
        var i = 0;
        var range;
        while ((range = getVariableRange(input, i))) {
            var start = range.start, end = range.end;
            ranges.push({ start: start, end: end, value: input.substring(start, end) });
            i = range.end + 1;
        }
        return ranges;
    }
    function replaceVariablesMatches(input, replacer) {
        var matches = getVariablesMatches(input);
        var matchesCount = matches.length;
        if (matchesCount === 0) {
            return input;
        }
        var inputLength = input.length;
        var replacements = matches.map(function (m) { return replacer(m.value); });
        var parts = [];
        parts.push(input.substring(0, matches[0].start));
        for (var i = 0; i < matchesCount; i++) {
            parts.push(replacements[i]);
            var start = matches[i].end;
            var end = i < matchesCount - 1 ? matches[i + 1].start : inputLength;
            parts.push(input.substring(start, end));
        }
        return parts.join('');
    }
    function getVariableNameAndFallback(match) {
        var commaIndex = match.indexOf(',');
        var name;
        var fallback;
        if (commaIndex >= 0) {
            name = match.substring(4, commaIndex).trim();
            fallback = match.substring(commaIndex + 1, match.length - 1).trim();
        }
        else {
            name = match.substring(4, match.length - 1);
            fallback = '';
        }
        return { name: name, fallback: fallback };
    }
    function replaceCSSVariablesNames(value, nemeReplacer, fallbackReplacer) {
        var matchReplacer = function (match) {
            var _a = getVariableNameAndFallback(match), name = _a.name, fallback = _a.fallback;
            var newName = nemeReplacer(name);
            if (!fallback) {
                return "var(" + newName + ")";
            }
            var newFallback;
            if (isVarDependant(fallback)) {
                newFallback = replaceCSSVariablesNames(fallback, nemeReplacer, fallbackReplacer);
            }
            else if (fallbackReplacer) {
                newFallback = fallbackReplacer(fallback);
            }
            else {
                newFallback = fallback;
            }
            return "var(" + newName + ", " + newFallback + ")";
        };
        return replaceVariablesMatches(value, matchReplacer);
    }
    function iterateVariables(rules, iterator) {
        iterateCSSRules(rules, function (rule) {
            rule.style && iterateCSSDeclarations(rule.style, function (property, value) {
                if (property.startsWith('--')) {
                    iterator(property, value);
                }
            });
        });
    }
    function iterateVarDependants(rules, iterator) {
        iterateCSSRules(rules, function (rule) {
            rule.style && iterateCSSDeclarations(rule.style, function (property, value) {
                if (isVarDependant(value)) {
                    iterator(property, value);
                }
            });
        });
    }
    function iterateVarDependencies(value, iterator) {
        replaceCSSVariablesNames(value, function (varName) {
            iterator(varName);
            return varName;
        });
    }
    function wrapBgColorVariableName(name) {
        return "--darkreader-bg" + name;
    }
    function wrapTextColorVariableName(name) {
        return "--darkreader-text" + name;
    }
    function wrapBorderColorVariableName(name) {
        return "--darkreader-border" + name;
    }
    function wrapBgImgVariableName(name) {
        return "--darkreader-bgimg" + name;
    }
    function isVariable(property) {
        return property.startsWith('--');
    }
    function isVarDependant(value) {
        return value.includes('var(');
    }
    function isConstructedColorVar(value) {
        return value.match(/^\s*(rgb|hsl)a?\(/);
    }
    function tryModifyBgColor(color, theme) {
        var rgb = tryParseColor(color);
        return rgb ? modifyBackgroundColor(rgb, theme) : color;
    }
    function tryModifyTextColor(color, theme) {
        var rgb = tryParseColor(color);
        return rgb ? modifyForegroundColor(rgb, theme) : color;
    }
    function tryModifyBorderColor(color, theme) {
        var rgb = tryParseColor(color);
        return rgb ? modifyBorderColor(rgb, theme) : color;
    }
    function insertVarValues(source, varValues, stack) {
        if (stack === void 0) { stack = new Set(); }
        var containsUnresolvedVar = false;
        var matchReplacer = function (match) {
            var _a = getVariableNameAndFallback(match), name = _a.name, fallback = _a.fallback;
            if (stack.has(name)) {
                containsUnresolvedVar = true;
                return null;
            }
            stack.add(name);
            var varValue = varValues.get(name) || fallback;
            var inserted = null;
            if (varValue) {
                if (isVarDependant(varValue)) {
                    inserted = insertVarValues(varValue, varValues, stack);
                }
                else {
                    inserted = varValue;
                }
            }
            if (!inserted) {
                containsUnresolvedVar = true;
                return null;
            }
            return inserted;
        };
        var replaced = replaceVariablesMatches(source, matchReplacer);
        if (containsUnresolvedVar) {
            return null;
        }
        return replaced;
    }

    var overrides = {
        'background-color': {
            customProp: '--darkreader-inline-bgcolor',
            cssProp: 'background-color',
            dataAttr: 'data-darkreader-inline-bgcolor',
        },
        'background-image': {
            customProp: '--darkreader-inline-bgimage',
            cssProp: 'background-image',
            dataAttr: 'data-darkreader-inline-bgimage',
        },
        'border-color': {
            customProp: '--darkreader-inline-border',
            cssProp: 'border-color',
            dataAttr: 'data-darkreader-inline-border',
        },
        'border-bottom-color': {
            customProp: '--darkreader-inline-border-bottom',
            cssProp: 'border-bottom-color',
            dataAttr: 'data-darkreader-inline-border-bottom',
        },
        'border-left-color': {
            customProp: '--darkreader-inline-border-left',
            cssProp: 'border-left-color',
            dataAttr: 'data-darkreader-inline-border-left',
        },
        'border-right-color': {
            customProp: '--darkreader-inline-border-right',
            cssProp: 'border-right-color',
            dataAttr: 'data-darkreader-inline-border-right',
        },
        'border-top-color': {
            customProp: '--darkreader-inline-border-top',
            cssProp: 'border-top-color',
            dataAttr: 'data-darkreader-inline-border-top',
        },
        'box-shadow': {
            customProp: '--darkreader-inline-boxshadow',
            cssProp: 'box-shadow',
            dataAttr: 'data-darkreader-inline-boxshadow',
        },
        'color': {
            customProp: '--darkreader-inline-color',
            cssProp: 'color',
            dataAttr: 'data-darkreader-inline-color',
        },
        'fill': {
            customProp: '--darkreader-inline-fill',
            cssProp: 'fill',
            dataAttr: 'data-darkreader-inline-fill',
        },
        'stroke': {
            customProp: '--darkreader-inline-stroke',
            cssProp: 'stroke',
            dataAttr: 'data-darkreader-inline-stroke',
        },
        'outline-color': {
            customProp: '--darkreader-inline-outline',
            cssProp: 'outline-color',
            dataAttr: 'data-darkreader-inline-outline',
        },
        'stop-color': {
            customProp: '--darkreader-inline-stopcolor',
            cssProp: 'stop-color',
            dataAttr: 'data-darkreader-inline-stopcolor',
        },
    };
    var overridesList = Object.values(overrides);
    var INLINE_STYLE_ATTRS = ['style', 'fill', 'stop-color', 'stroke', 'bgcolor', 'color'];
    var INLINE_STYLE_SELECTOR = INLINE_STYLE_ATTRS.map(function (attr) { return "[" + attr + "]"; }).join(', ');
    function getInlineOverrideStyle() {
        return overridesList.map(function (_a) {
            var dataAttr = _a.dataAttr, customProp = _a.customProp, cssProp = _a.cssProp;
            return [
                "[" + dataAttr + "] {",
                "  " + cssProp + ": var(" + customProp + ") !important;",
                '}',
            ].join('\n');
        }).join('\n');
    }
    function getInlineStyleElements(root) {
        var results = [];
        if (root instanceof Element && root.matches(INLINE_STYLE_SELECTOR)) {
            results.push(root);
        }
        if (root instanceof Element || (isShadowDomSupported && root instanceof ShadowRoot) || root instanceof Document) {
            push(results, root.querySelectorAll(INLINE_STYLE_SELECTOR));
        }
        return results;
    }
    var treeObservers = new Map();
    var attrObservers = new Map();
    function watchForInlineStyles(elementStyleDidChange, shadowRootDiscovered) {
        deepWatchForInlineStyles(document, elementStyleDidChange, shadowRootDiscovered);
        iterateShadowHosts(document.documentElement, function (host) {
            deepWatchForInlineStyles(host.shadowRoot, elementStyleDidChange, shadowRootDiscovered);
        });
    }
    function deepWatchForInlineStyles(root, elementStyleDidChange, shadowRootDiscovered) {
        if (treeObservers.has(root)) {
            treeObservers.get(root).disconnect();
            attrObservers.get(root).disconnect();
        }
        var discoveredNodes = new WeakSet();
        function discoverNodes(node) {
            getInlineStyleElements(node).forEach(function (el) {
                if (discoveredNodes.has(el)) {
                    return;
                }
                discoveredNodes.add(el);
                elementStyleDidChange(el);
            });
            iterateShadowHosts(node, function (n) {
                if (discoveredNodes.has(node)) {
                    return;
                }
                discoveredNodes.add(node);
                shadowRootDiscovered(n.shadowRoot);
                deepWatchForInlineStyles(n.shadowRoot, elementStyleDidChange, shadowRootDiscovered);
            });
        }
        var treeObserver = createOptimizedTreeObserver(root, {
            onMinorMutations: function (_a) {
                var additions = _a.additions;
                additions.forEach(function (added) { return discoverNodes(added); });
            },
            onHugeMutations: function () {
                discoverNodes(root);
            },
        });
        treeObservers.set(root, treeObserver);
        var attemptCount = 0;
        var start = null;
        var ATTEMPTS_INTERVAL = getDuration({ seconds: 10 });
        var RETRY_TIMEOUT = getDuration({ seconds: 2 });
        var MAX_ATTEMPTS_COUNT = 50;
        var cache = [];
        var timeoutId = null;
        var handleAttributeMutations = throttle(function (mutations) {
            mutations.forEach(function (m) {
                if (INLINE_STYLE_ATTRS.includes(m.attributeName)) {
                    elementStyleDidChange(m.target);
                }
            });
        });
        var attrObserver = new MutationObserver(function (mutations) {
            if (timeoutId) {
                cache.push.apply(cache, __spreadArray([], __read(mutations)));
                return;
            }
            attemptCount++;
            var now = Date.now();
            if (start == null) {
                start = now;
            }
            else if (attemptCount >= MAX_ATTEMPTS_COUNT) {
                if (now - start < ATTEMPTS_INTERVAL) {
                    timeoutId = setTimeout(function () {
                        start = null;
                        attemptCount = 0;
                        timeoutId = null;
                        var attributeCache = cache;
                        cache = [];
                        handleAttributeMutations(attributeCache);
                    }, RETRY_TIMEOUT);
                    cache.push.apply(cache, __spreadArray([], __read(mutations)));
                    return;
                }
                start = now;
                attemptCount = 1;
            }
            handleAttributeMutations(mutations);
        });
        attrObserver.observe(root, {
            attributes: true,
            attributeFilter: INLINE_STYLE_ATTRS.concat(overridesList.map(function (_a) {
                var dataAttr = _a.dataAttr;
                return dataAttr;
            })),
            subtree: true,
        });
        attrObservers.set(root, attrObserver);
    }
    function stopWatchingForInlineStyles() {
        treeObservers.forEach(function (o) { return o.disconnect(); });
        attrObservers.forEach(function (o) { return o.disconnect(); });
        treeObservers.clear();
        attrObservers.clear();
    }
    var inlineStyleCache = new WeakMap();
    var filterProps = ['brightness', 'contrast', 'grayscale', 'sepia', 'mode'];
    function getInlineStyleCacheKey(el, theme) {
        return INLINE_STYLE_ATTRS
            .map(function (attr) { return attr + "=\"" + el.getAttribute(attr) + "\""; })
            .concat(filterProps.map(function (prop) { return prop + "=\"" + theme[prop] + "\""; }))
            .join(' ');
    }
    function shouldIgnoreInlineStyle(element, selectors) {
        for (var i = 0, len = selectors.length; i < len; i++) {
            var ingnoredSelector = selectors[i];
            if (element.matches(ingnoredSelector)) {
                return true;
            }
        }
        return false;
    }
    function overrideInlineStyle(element, theme, ignoreInlineSelectors, ignoreImageSelectors) {
        var cacheKey = getInlineStyleCacheKey(element, theme);
        if (cacheKey === inlineStyleCache.get(element)) {
            return;
        }
        var unsetProps = new Set(Object.keys(overrides));
        function setCustomProp(targetCSSProp, modifierCSSProp, cssVal) {
            var _a = overrides[targetCSSProp], customProp = _a.customProp, dataAttr = _a.dataAttr;
            var mod = getModifiableCSSDeclaration(modifierCSSProp, cssVal, null, variablesStore, ignoreImageSelectors, null);
            if (!mod) {
                return;
            }
            var value = mod.value;
            if (typeof value === 'function') {
                value = value(theme);
            }
            element.style.setProperty(customProp, value);
            if (!element.hasAttribute(dataAttr)) {
                element.setAttribute(dataAttr, '');
            }
            unsetProps.delete(targetCSSProp);
        }
        if (ignoreInlineSelectors.length > 0) {
            if (shouldIgnoreInlineStyle(element, ignoreInlineSelectors)) {
                unsetProps.forEach(function (cssProp) {
                    element.removeAttribute(overrides[cssProp].dataAttr);
                });
                return;
            }
        }
        if (element.hasAttribute('bgcolor')) {
            var value = element.getAttribute('bgcolor');
            if (value.match(/^[0-9a-f]{3}$/i) || value.match(/^[0-9a-f]{6}$/i)) {
                value = "#" + value;
            }
            setCustomProp('background-color', 'background-color', value);
        }
        if (element.hasAttribute('color')) {
            var value = element.getAttribute('color');
            if (value.match(/^[0-9a-f]{3}$/i) || value.match(/^[0-9a-f]{6}$/i)) {
                value = "#" + value;
            }
            setCustomProp('color', 'color', value);
        }
        if (element instanceof SVGElement) {
            if (element.hasAttribute('fill')) {
                var SMALL_SVG_LIMIT = 32;
                var value = element.getAttribute('fill');
                var isBg = false;
                if (!(element instanceof SVGTextElement)) {
                    var _a = element.getBoundingClientRect(), width = _a.width, height = _a.height;
                    isBg = (width > SMALL_SVG_LIMIT || height > SMALL_SVG_LIMIT);
                }
                setCustomProp('fill', isBg ? 'background-color' : 'color', value);
            }
            if (element.hasAttribute('stop-color')) {
                setCustomProp('stop-color', 'background-color', element.getAttribute('stop-color'));
            }
        }
        if (element.hasAttribute('stroke')) {
            var value = element.getAttribute('stroke');
            setCustomProp('stroke', element instanceof SVGLineElement || element instanceof SVGTextElement ? 'border-color' : 'color', value);
        }
        element.style && iterateCSSDeclarations(element.style, function (property, value) {
            if (property === 'background-image' && value.includes('url')) {
                return;
            }
            if (overrides.hasOwnProperty(property)) {
                setCustomProp(property, property, value);
            }
        });
        if (element.style && element instanceof SVGTextElement && element.style.fill) {
            setCustomProp('fill', 'color', element.style.getPropertyValue('fill'));
        }
        forEach(unsetProps, function (cssProp) {
            element.removeAttribute(overrides[cssProp].dataAttr);
        });
        inlineStyleCache.set(element, getInlineStyleCacheKey(element, theme));
    }

    var metaThemeColorName = 'theme-color';
    var metaThemeColorSelector = "meta[name=\"" + metaThemeColorName + "\"]";
    var srcMetaThemeColor = null;
    var observer = null;
    function changeMetaThemeColor(meta, theme) {
        srcMetaThemeColor = srcMetaThemeColor || meta.content;
        try {
            var color = parse(srcMetaThemeColor);
            meta.content = modifyBackgroundColor(color, theme);
        }
        catch (err) {
            logWarn(err);
        }
    }
    function changeMetaThemeColorWhenAvailable(theme) {
        var meta = document.querySelector(metaThemeColorSelector);
        if (meta) {
            changeMetaThemeColor(meta, theme);
        }
        else {
            if (observer) {
                observer.disconnect();
            }
            observer = new MutationObserver(function (mutations) {
                loop: for (var i = 0; i < mutations.length; i++) {
                    var addedNodes = mutations[i].addedNodes;
                    for (var j = 0; j < addedNodes.length; j++) {
                        var node = addedNodes[j];
                        if (node instanceof HTMLMetaElement && node.name === metaThemeColorName) {
                            observer.disconnect();
                            observer = null;
                            changeMetaThemeColor(node, theme);
                            break loop;
                        }
                    }
                }
            });
            observer.observe(document.head, { childList: true });
        }
    }
    function restoreMetaThemeColor() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        var meta = document.querySelector(metaThemeColorSelector);
        if (meta && srcMetaThemeColor) {
            meta.content = srcMetaThemeColor;
        }
    }

    var themeCacheKeys$1 = [
        'mode',
        'brightness',
        'contrast',
        'grayscale',
        'sepia',
        'darkSchemeBackgroundColor',
        'darkSchemeTextColor',
        'lightSchemeBackgroundColor',
        'lightSchemeTextColor',
    ];
    function getThemeKey(theme) {
        return themeCacheKeys$1.map(function (p) { return p + ":" + theme[p]; }).join(';');
    }
    var asyncQueue = createAsyncTasksQueue();
    function createStyleSheetModifier() {
        var renderId = 0;
        var rulesTextCache = new Map();
        var rulesModCache = new Map();
        var varTypeChangeCleaners = new Set();
        var prevFilterKey = null;
        function modifySheet(options) {
            var rules = options.sourceCSSRules;
            var theme = options.theme, ignoreImageAnalysis = options.ignoreImageAnalysis, force = options.force, prepareSheet = options.prepareSheet, isAsyncCancelled = options.isAsyncCancelled;
            var rulesChanged = (rulesModCache.size === 0);
            var notFoundCacheKeys = new Set(rulesModCache.keys());
            var themeKey = getThemeKey(theme);
            var themeChanged = (themeKey !== prevFilterKey);
            var modRules = [];
            iterateCSSRules(rules, function (rule) {
                var cssText = rule.cssText;
                var textDiffersFromPrev = false;
                notFoundCacheKeys.delete(cssText);
                if (!rulesTextCache.has(cssText)) {
                    rulesTextCache.set(cssText, cssText);
                    textDiffersFromPrev = true;
                }
                if (textDiffersFromPrev) {
                    rulesChanged = true;
                }
                else {
                    modRules.push(rulesModCache.get(cssText));
                    return;
                }
                var modDecs = [];
                rule.style && iterateCSSDeclarations(rule.style, function (property, value) {
                    var mod = getModifiableCSSDeclaration(property, value, rule, variablesStore, ignoreImageAnalysis, isAsyncCancelled);
                    if (mod) {
                        modDecs.push(mod);
                    }
                });
                var modRule = null;
                if (modDecs.length > 0) {
                    var parentRule = rule.parentRule;
                    modRule = { selector: rule.selectorText, declarations: modDecs, parentRule: parentRule };
                    modRules.push(modRule);
                }
                rulesModCache.set(cssText, modRule);
            });
            notFoundCacheKeys.forEach(function (key) {
                rulesTextCache.delete(key);
                rulesModCache.delete(key);
            });
            prevFilterKey = themeKey;
            if (!force && !rulesChanged && !themeChanged) {
                return;
            }
            renderId++;
            function setRule(target, index, rule) {
                var selector = rule.selector, declarations = rule.declarations;
                var getDeclarationText = function (dec) {
                    var property = dec.property, value = dec.value, important = dec.important, sourceValue = dec.sourceValue;
                    return property + ": " + (value == null ? sourceValue : value) + (important ? ' !important' : '') + ";";
                };
                var ruleText = selector + " { " + declarations.map(getDeclarationText).join(' ') + " }";
                target.insertRule(ruleText, index);
            }
            var asyncDeclarations = new Map();
            var varDeclarations = new Map();
            var asyncDeclarationCounter = 0;
            var varDeclarationCounter = 0;
            var rootReadyGroup = { rule: null, rules: [], isGroup: true };
            var groupRefs = new WeakMap();
            function getGroup(rule) {
                if (rule == null) {
                    return rootReadyGroup;
                }
                if (groupRefs.has(rule)) {
                    return groupRefs.get(rule);
                }
                var group = { rule: rule, rules: [], isGroup: true };
                groupRefs.set(rule, group);
                var parentGroup = getGroup(rule.parentRule);
                parentGroup.rules.push(group);
                return group;
            }
            varTypeChangeCleaners.forEach(function (clear) { return clear(); });
            varTypeChangeCleaners.clear();
            modRules.filter(function (r) { return r; }).forEach(function (_a) {
                var selector = _a.selector, declarations = _a.declarations, parentRule = _a.parentRule;
                var group = getGroup(parentRule);
                var readyStyleRule = { selector: selector, declarations: [], isGroup: false };
                var readyDeclarations = readyStyleRule.declarations;
                group.rules.push(readyStyleRule);
                function handleAsyncDeclaration(property, modified, important, sourceValue) {
                    var asyncKey = ++asyncDeclarationCounter;
                    var asyncDeclaration = { property: property, value: null, important: important, asyncKey: asyncKey, sourceValue: sourceValue };
                    readyDeclarations.push(asyncDeclaration);
                    var currentRenderId = renderId;
                    modified.then(function (asyncValue) {
                        if (!asyncValue || isAsyncCancelled() || currentRenderId !== renderId) {
                            return;
                        }
                        asyncDeclaration.value = asyncValue;
                        asyncQueue.add(function () {
                            if (isAsyncCancelled() || currentRenderId !== renderId) {
                                return;
                            }
                            rebuildAsyncRule(asyncKey);
                        });
                    });
                }
                function handleVarDeclarations(property, modified, important, sourceValue) {
                    var _a = modified, varDecs = _a.declarations, onTypeChange = _a.onTypeChange;
                    var varKey = ++varDeclarationCounter;
                    var currentRenderId = renderId;
                    var initialIndex = readyDeclarations.length;
                    var oldDecs = [];
                    if (varDecs.length === 0) {
                        var tempDec = { property: property, value: sourceValue, important: important, sourceValue: sourceValue, varKey: varKey };
                        readyDeclarations.push(tempDec);
                        oldDecs = [tempDec];
                    }
                    varDecs.forEach(function (mod) {
                        if (mod.value instanceof Promise) {
                            handleAsyncDeclaration(mod.property, mod.value, important, sourceValue);
                        }
                        else {
                            var readyDec = { property: mod.property, value: mod.value, important: important, sourceValue: sourceValue, varKey: varKey };
                            readyDeclarations.push(readyDec);
                            oldDecs.push(readyDec);
                        }
                    });
                    onTypeChange.addListener(function (newDecs) {
                        if (isAsyncCancelled() || currentRenderId !== renderId) {
                            return;
                        }
                        var readyVarDecs = newDecs.map(function (mod) {
                            return { property: mod.property, value: mod.value, important: important, sourceValue: sourceValue, varKey: varKey };
                        });
                        var index = readyDeclarations.indexOf(oldDecs[0], initialIndex);
                        readyDeclarations.splice.apply(readyDeclarations, __spreadArray([index, oldDecs.length], __read(readyVarDecs)));
                        oldDecs = readyVarDecs;
                        rebuildVarRule(varKey);
                    });
                    varTypeChangeCleaners.add(function () { return onTypeChange.removeListeners(); });
                }
                declarations.forEach(function (_a) {
                    var property = _a.property, value = _a.value, important = _a.important, sourceValue = _a.sourceValue;
                    if (typeof value === 'function') {
                        var modified = value(theme);
                        if (modified instanceof Promise) {
                            handleAsyncDeclaration(property, modified, important, sourceValue);
                        }
                        else if (property.startsWith('--')) {
                            handleVarDeclarations(property, modified, important, sourceValue);
                        }
                        else {
                            readyDeclarations.push({ property: property, value: modified, important: important, sourceValue: sourceValue });
                        }
                    }
                    else {
                        readyDeclarations.push({ property: property, value: value, important: important, sourceValue: sourceValue });
                    }
                });
            });
            var sheet = prepareSheet();
            function buildStyleSheet() {
                function createTarget(group, parent) {
                    var rule = group.rule;
                    if (rule instanceof CSSMediaRule) {
                        var media = rule.media;
                        var index = parent.cssRules.length;
                        parent.insertRule("@media " + media.mediaText + " {}", index);
                        return parent.cssRules[index];
                    }
                    return parent;
                }
                function iterateReadyRules(group, target, styleIterator) {
                    group.rules.forEach(function (r) {
                        if (r.isGroup) {
                            var t = createTarget(r, target);
                            iterateReadyRules(r, t, styleIterator);
                        }
                        else {
                            styleIterator(r, target);
                        }
                    });
                }
                iterateReadyRules(rootReadyGroup, sheet, function (rule, target) {
                    var index = target.cssRules.length;
                    rule.declarations.forEach(function (_a) {
                        var asyncKey = _a.asyncKey, varKey = _a.varKey;
                        if (asyncKey != null) {
                            asyncDeclarations.set(asyncKey, { rule: rule, target: target, index: index });
                        }
                        if (varKey != null) {
                            varDeclarations.set(varKey, { rule: rule, target: target, index: index });
                        }
                    });
                    setRule(target, index, rule);
                });
            }
            function rebuildAsyncRule(key) {
                var _a = asyncDeclarations.get(key), rule = _a.rule, target = _a.target, index = _a.index;
                target.deleteRule(index);
                setRule(target, index, rule);
                asyncDeclarations.delete(key);
            }
            function rebuildVarRule(key) {
                var _a = varDeclarations.get(key), rule = _a.rule, target = _a.target, index = _a.index;
                target.deleteRule(index);
                setRule(target, index, rule);
            }
            buildStyleSheet();
        }
        return { modifySheet: modifySheet };
    }

    var STYLE_SELECTOR = 'style, link[rel*="stylesheet" i]:not([disabled])';
    function shouldManageStyle(element) {
        return (((element instanceof HTMLStyleElement) ||
            (element instanceof SVGStyleElement) ||
            (element instanceof HTMLLinkElement &&
                element.rel &&
                element.rel.toLowerCase().includes('stylesheet') &&
                !element.disabled)) &&
            !element.classList.contains('darkreader') &&
            element.media !== 'print' &&
            !element.classList.contains('stylus'));
    }
    function getManageableStyles(node, results, deep) {
        if (results === void 0) { results = []; }
        if (deep === void 0) { deep = true; }
        if (shouldManageStyle(node)) {
            results.push(node);
        }
        else if (node instanceof Element || (isShadowDomSupported && node instanceof ShadowRoot) || node === document) {
            forEach(node.querySelectorAll(STYLE_SELECTOR), function (style) { return getManageableStyles(style, results, false); });
            if (deep) {
                iterateShadowHosts(node, function (host) { return getManageableStyles(host.shadowRoot, results, false); });
            }
        }
        return results;
    }
    var syncStyleSet = new WeakSet();
    var corsStyleSet = new WeakSet();
    var canOptimizeUsingProxy = false;
    document.addEventListener('__darkreader__inlineScriptsAllowed', function () {
        canOptimizeUsingProxy = true;
    });
    function manageStyle(element, _a) {
        var update = _a.update, loadingStart = _a.loadingStart, loadingEnd = _a.loadingEnd;
        var prevStyles = [];
        var next = element;
        while ((next = next.nextElementSibling) && next.matches('.darkreader')) {
            prevStyles.push(next);
        }
        var corsCopy = prevStyles.find(function (el) { return el.matches('.darkreader--cors') && !corsStyleSet.has(el); }) || null;
        var syncStyle = prevStyles.find(function (el) { return el.matches('.darkreader--sync') && !syncStyleSet.has(el); }) || null;
        var corsCopyPositionWatcher = null;
        var syncStylePositionWatcher = null;
        var cancelAsyncOperations = false;
        var isOverrideEmpty = true;
        var sheetModifier = createStyleSheetModifier();
        var observer = new MutationObserver(function () {
            update();
        });
        var observerOptions = { attributes: true, childList: true, subtree: true, characterData: true };
        function containsCSSImport() {
            return element instanceof HTMLStyleElement && element.textContent.trim().match(cssImportRegex);
        }
        function getRulesSync() {
            if (corsCopy) {
                return corsCopy.sheet.cssRules;
            }
            if (containsCSSImport()) {
                return null;
            }
            return safeGetSheetRules();
        }
        function insertStyle() {
            if (corsCopy) {
                if (element.nextSibling !== corsCopy) {
                    element.parentNode.insertBefore(corsCopy, element.nextSibling);
                }
                if (corsCopy.nextSibling !== syncStyle) {
                    element.parentNode.insertBefore(syncStyle, corsCopy.nextSibling);
                }
            }
            else if (element.nextSibling !== syncStyle) {
                element.parentNode.insertBefore(syncStyle, element.nextSibling);
            }
        }
        function createSyncStyle() {
            syncStyle = element instanceof SVGStyleElement ?
                document.createElementNS('http://www.w3.org/2000/svg', 'style') :
                document.createElement('style');
            syncStyle.classList.add('darkreader');
            syncStyle.classList.add('darkreader--sync');
            syncStyle.media = 'screen';
            if (!isChromium && element.title) {
                syncStyle.title = element.title;
            }
            syncStyleSet.add(syncStyle);
        }
        var isLoadingRules = false;
        var wasLoadingError = false;
        function getRulesAsync() {
            return __awaiter(this, void 0, void 0, function () {
                var cssText, cssBasePath, _a, cssRules, accessError, err_1, fullCSSText, err_2;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(element instanceof HTMLLinkElement)) return [3, 7];
                            _a = __read(getRulesOrError(), 2), cssRules = _a[0], accessError = _a[1];
                            if (accessError) {
                                logWarn(accessError);
                            }
                            if (!((!cssRules && !accessError && !isSafari) ||
                                (isSafari && !element.sheet) ||
                                isStillLoadingError(accessError))) return [3, 5];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4, linkLoading(element)];
                        case 2:
                            _c.sent();
                            return [3, 4];
                        case 3:
                            err_1 = _c.sent();
                            logWarn(err_1);
                            wasLoadingError = true;
                            return [3, 4];
                        case 4:
                            if (cancelAsyncOperations) {
                                return [2, null];
                            }
                            _b = __read(getRulesOrError(), 2), cssRules = _b[0], accessError = _b[1];
                            if (accessError) {
                                logWarn(accessError);
                            }
                            _c.label = 5;
                        case 5:
                            if (cssRules != null) {
                                return [2, cssRules];
                            }
                            return [4, loadText(element.href)];
                        case 6:
                            cssText = _c.sent();
                            cssBasePath = getCSSBaseBath(element.href);
                            if (cancelAsyncOperations) {
                                return [2, null];
                            }
                            return [3, 8];
                        case 7:
                            if (containsCSSImport()) {
                                cssText = element.textContent.trim();
                                cssBasePath = getCSSBaseBath(location.href);
                            }
                            else {
                                return [2, null];
                            }
                            _c.label = 8;
                        case 8:
                            if (!cssText) return [3, 13];
                            _c.label = 9;
                        case 9:
                            _c.trys.push([9, 11, , 12]);
                            return [4, replaceCSSImports(cssText, cssBasePath)];
                        case 10:
                            fullCSSText = _c.sent();
                            corsCopy = createCORSCopy(element, fullCSSText);
                            return [3, 12];
                        case 11:
                            err_2 = _c.sent();
                            logWarn(err_2);
                            return [3, 12];
                        case 12:
                            if (corsCopy) {
                                corsCopyPositionWatcher = watchForNodePosition(corsCopy, 'prev-sibling');
                                return [2, corsCopy.sheet.cssRules];
                            }
                            _c.label = 13;
                        case 13: return [2, null];
                    }
                });
            });
        }
        function details() {
            var rules = getRulesSync();
            if (!rules) {
                if (isLoadingRules || wasLoadingError) {
                    return null;
                }
                isLoadingRules = true;
                loadingStart();
                getRulesAsync().then(function (results) {
                    isLoadingRules = false;
                    loadingEnd();
                    if (results) {
                        update();
                    }
                }).catch(function (err) {
                    logWarn(err);
                    isLoadingRules = false;
                    loadingEnd();
                });
                return null;
            }
            return { rules: rules };
        }
        var forceRenderStyle = false;
        function render(theme, ignoreImageAnalysis) {
            var rules = getRulesSync();
            if (!rules) {
                return;
            }
            cancelAsyncOperations = false;
            function prepareOverridesSheet() {
                if (!syncStyle) {
                    createSyncStyle();
                }
                syncStylePositionWatcher && syncStylePositionWatcher.stop();
                insertStyle();
                if (syncStyle.sheet == null) {
                    syncStyle.textContent = '';
                }
                var sheet = syncStyle.sheet;
                for (var i = sheet.cssRules.length - 1; i >= 0; i--) {
                    sheet.deleteRule(i);
                }
                if (syncStylePositionWatcher) {
                    syncStylePositionWatcher.run();
                }
                else {
                    syncStylePositionWatcher = watchForNodePosition(syncStyle, 'prev-sibling', function () {
                        forceRenderStyle = true;
                        buildOverrides();
                    });
                }
                return syncStyle.sheet;
            }
            function buildOverrides() {
                var force = forceRenderStyle;
                forceRenderStyle = false;
                sheetModifier.modifySheet({
                    prepareSheet: prepareOverridesSheet,
                    sourceCSSRules: rules,
                    theme: theme,
                    ignoreImageAnalysis: ignoreImageAnalysis,
                    force: force,
                    isAsyncCancelled: function () { return cancelAsyncOperations; },
                });
                isOverrideEmpty = syncStyle.sheet.cssRules.length === 0;
            }
            buildOverrides();
        }
        function getRulesOrError() {
            try {
                if (element.sheet == null) {
                    return [null, null];
                }
                return [element.sheet.cssRules, null];
            }
            catch (err) {
                return [null, err];
            }
        }
        function isStillLoadingError(error) {
            return error && error.message && error.message.includes('loading');
        }
        function safeGetSheetRules() {
            var _a = __read(getRulesOrError(), 2), cssRules = _a[0], err = _a[1];
            if (err) {
                logWarn(err);
                return null;
            }
            return cssRules;
        }
        function watchForSheetChanges() {
            watchForSheetChangesUsingProxy();
            if (!isThunderbird && !(canOptimizeUsingProxy && element.sheet)) {
                watchForSheetChangesUsingRAF();
            }
        }
        var rulesChangeKey = null;
        var rulesCheckFrameId = null;
        function getRulesChangeKey() {
            var rules = safeGetSheetRules();
            return rules ? rules.length : null;
        }
        function didRulesKeyChange() {
            return getRulesChangeKey() !== rulesChangeKey;
        }
        function watchForSheetChangesUsingRAF() {
            rulesChangeKey = getRulesChangeKey();
            stopWatchingForSheetChangesUsingRAF();
            var checkForUpdate = function () {
                if (didRulesKeyChange()) {
                    rulesChangeKey = getRulesChangeKey();
                    update();
                }
                if (canOptimizeUsingProxy && element.sheet) {
                    stopWatchingForSheetChangesUsingRAF();
                    return;
                }
                rulesCheckFrameId = requestAnimationFrame(checkForUpdate);
            };
            checkForUpdate();
        }
        function stopWatchingForSheetChangesUsingRAF() {
            cancelAnimationFrame(rulesCheckFrameId);
        }
        var areSheetChangesPending = false;
        function onSheetChange() {
            canOptimizeUsingProxy = true;
            stopWatchingForSheetChangesUsingRAF();
            if (areSheetChangesPending) {
                return;
            }
            function handleSheetChanges() {
                areSheetChangesPending = false;
                if (cancelAsyncOperations) {
                    return;
                }
                update();
            }
            areSheetChangesPending = true;
            if (typeof queueMicrotask === 'function') {
                queueMicrotask(handleSheetChanges);
            }
            else {
                requestAnimationFrame(handleSheetChanges);
            }
        }
        function watchForSheetChangesUsingProxy() {
            element.addEventListener('__darkreader__updateSheet', onSheetChange);
        }
        function stopWatchingForSheetChangesUsingProxy() {
            element.removeEventListener('__darkreader__updateSheet', onSheetChange);
        }
        function stopWatchingForSheetChanges() {
            stopWatchingForSheetChangesUsingProxy();
            stopWatchingForSheetChangesUsingRAF();
        }
        function pause() {
            observer.disconnect();
            cancelAsyncOperations = true;
            corsCopyPositionWatcher && corsCopyPositionWatcher.stop();
            syncStylePositionWatcher && syncStylePositionWatcher.stop();
            stopWatchingForSheetChanges();
        }
        function destroy() {
            pause();
            removeNode(corsCopy);
            removeNode(syncStyle);
        }
        function watch() {
            observer.observe(element, observerOptions);
            if (element instanceof HTMLStyleElement) {
                watchForSheetChanges();
            }
        }
        var maxMoveCount = 10;
        var moveCount = 0;
        function restore() {
            if (!syncStyle) {
                return;
            }
            moveCount++;
            if (moveCount > maxMoveCount) {
                logWarn('Style sheet was moved multiple times', element);
                return;
            }
            logWarn('Restore style', syncStyle, element);
            insertStyle();
            corsCopyPositionWatcher && corsCopyPositionWatcher.skip();
            syncStylePositionWatcher && syncStylePositionWatcher.skip();
            if (!isOverrideEmpty) {
                forceRenderStyle = true;
                update();
            }
        }
        return {
            details: details,
            render: render,
            pause: pause,
            destroy: destroy,
            watch: watch,
            restore: restore,
        };
    }
    function linkLoading(link) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        var cleanUp = function () {
                            link.removeEventListener('load', onLoad);
                            link.removeEventListener('error', onError);
                        };
                        var onLoad = function () {
                            cleanUp();
                            resolve();
                        };
                        var onError = function () {
                            cleanUp();
                            reject("Link loading failed " + link.href);
                        };
                        link.addEventListener('load', onLoad);
                        link.addEventListener('error', onError);
                    })];
            });
        });
    }
    function getCSSImportURL(importDeclaration) {
        return getCSSURLValue(importDeclaration.substring(8).replace(/;$/, ''));
    }
    function loadText(url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!url.startsWith('data:')) return [3, 3];
                        return [4, fetch(url)];
                    case 1: return [4, (_a.sent()).text()];
                    case 2: return [2, _a.sent()];
                    case 3: return [4, bgFetch({ url: url, responseType: 'text', mimeType: 'text/css' })];
                    case 4: return [2, _a.sent()];
                }
            });
        });
    }
    function replaceCSSImports(cssText, basePath, cache) {
        if (cache === void 0) { cache = new Map(); }
        return __awaiter(this, void 0, void 0, function () {
            var importMatches, importMatches_1, importMatches_1_1, match, importURL, absoluteURL, importedCSS, err_3, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cssText = removeCSSComments(cssText);
                        cssText = replaceCSSFontFace(cssText);
                        cssText = replaceCSSRelativeURLsWithAbsolute(cssText, basePath);
                        importMatches = getMatches(cssImportRegex, cssText);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, 11, 12]);
                        importMatches_1 = __values(importMatches), importMatches_1_1 = importMatches_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!importMatches_1_1.done) return [3, 9];
                        match = importMatches_1_1.value;
                        importURL = getCSSImportURL(match);
                        absoluteURL = getAbsoluteURL(basePath, importURL);
                        importedCSS = void 0;
                        if (!cache.has(absoluteURL)) return [3, 3];
                        importedCSS = cache.get(absoluteURL);
                        return [3, 7];
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        return [4, loadText(absoluteURL)];
                    case 4:
                        importedCSS = _b.sent();
                        cache.set(absoluteURL, importedCSS);
                        return [4, replaceCSSImports(importedCSS, getCSSBaseBath(absoluteURL), cache)];
                    case 5:
                        importedCSS = _b.sent();
                        return [3, 7];
                    case 6:
                        err_3 = _b.sent();
                        logWarn(err_3);
                        importedCSS = '';
                        return [3, 7];
                    case 7:
                        cssText = cssText.split(match).join(importedCSS);
                        _b.label = 8;
                    case 8:
                        importMatches_1_1 = importMatches_1.next();
                        return [3, 2];
                    case 9: return [3, 12];
                    case 10:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3, 12];
                    case 11:
                        try {
                            if (importMatches_1_1 && !importMatches_1_1.done && (_a = importMatches_1.return)) _a.call(importMatches_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7];
                    case 12:
                        cssText = cssText.trim();
                        return [2, cssText];
                }
            });
        });
    }
    function createCORSCopy(srcElement, cssText) {
        if (!cssText) {
            return null;
        }
        var cors = document.createElement('style');
        cors.classList.add('darkreader');
        cors.classList.add('darkreader--cors');
        cors.media = 'screen';
        cors.textContent = cssText;
        srcElement.parentNode.insertBefore(cors, srcElement.nextSibling);
        cors.sheet.disabled = true;
        corsStyleSet.add(cors);
        return cors;
    }

    var observers = [];
    var observedRoots;
    var undefinedGroups = new Map();
    var elementsDefinitionCallback;
    function collectUndefinedElements(root) {
        if (!isDefinedSelectorSupported) {
            return;
        }
        forEach(root.querySelectorAll(':not(:defined)'), function (el) {
            var tag = el.tagName.toLowerCase();
            if (!undefinedGroups.has(tag)) {
                undefinedGroups.set(tag, new Set());
                customElementsWhenDefined(tag).then(function () {
                    if (elementsDefinitionCallback) {
                        var elements = undefinedGroups.get(tag);
                        undefinedGroups.delete(tag);
                        elementsDefinitionCallback(Array.from(elements));
                    }
                });
            }
            undefinedGroups.get(tag).add(el);
        });
    }
    var canOptimizeUsingProxy$1 = false;
    document.addEventListener('__darkreader__inlineScriptsAllowed', function () {
        canOptimizeUsingProxy$1 = true;
    });
    var resolvers$1 = new Map();
    function handleIsDefined(e) {
        canOptimizeUsingProxy$1 = true;
        if (resolvers$1.has(e.detail.tag)) {
            var resolve = resolvers$1.get(e.detail.tag);
            resolve();
        }
    }
    function customElementsWhenDefined(tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve) {
                        if (window.customElements && typeof customElements.whenDefined === 'function') {
                            customElements.whenDefined(tag).then(resolve);
                        }
                        else if (canOptimizeUsingProxy$1) {
                            resolvers$1.set(tag, resolve);
                            document.dispatchEvent(new CustomEvent('__darkreader__addUndefinedResolver', { detail: { tag: tag } }));
                        }
                        else {
                            var checkIfDefined_1 = function () {
                                var elements = undefinedGroups.get(tag);
                                if (elements && elements.size > 0) {
                                    if (elements.values().next().value.matches(':defined')) {
                                        resolve();
                                    }
                                    else {
                                        requestAnimationFrame(checkIfDefined_1);
                                    }
                                }
                            };
                            requestAnimationFrame(checkIfDefined_1);
                        }
                    })];
            });
        });
    }
    function watchWhenCustomElementsDefined(callback) {
        elementsDefinitionCallback = callback;
    }
    function unsubscribeFromDefineCustomElements() {
        elementsDefinitionCallback = null;
        undefinedGroups.clear();
        document.removeEventListener('__darkreader__isDefined', handleIsDefined);
    }
    function watchForStyleChanges(currentStyles, update, shadowRootDiscovered) {
        stopWatchingForStyleChanges();
        var prevStyles = new Set(currentStyles);
        var prevStyleSiblings = new WeakMap();
        var nextStyleSiblings = new WeakMap();
        function saveStylePosition(style) {
            prevStyleSiblings.set(style, style.previousElementSibling);
            nextStyleSiblings.set(style, style.nextElementSibling);
        }
        function forgetStylePosition(style) {
            prevStyleSiblings.delete(style);
            nextStyleSiblings.delete(style);
        }
        function didStylePositionChange(style) {
            return (style.previousElementSibling !== prevStyleSiblings.get(style) ||
                style.nextElementSibling !== nextStyleSiblings.get(style));
        }
        currentStyles.forEach(saveStylePosition);
        function handleStyleOperations(operations) {
            var createdStyles = operations.createdStyles, removedStyles = operations.removedStyles, movedStyles = operations.movedStyles;
            createdStyles.forEach(function (s) { return saveStylePosition(s); });
            movedStyles.forEach(function (s) { return saveStylePosition(s); });
            removedStyles.forEach(function (s) { return forgetStylePosition(s); });
            createdStyles.forEach(function (s) { return prevStyles.add(s); });
            removedStyles.forEach(function (s) { return prevStyles.delete(s); });
            if (createdStyles.size + removedStyles.size + movedStyles.size > 0) {
                update({
                    created: Array.from(createdStyles),
                    removed: Array.from(removedStyles),
                    moved: Array.from(movedStyles),
                    updated: [],
                });
            }
        }
        function handleMinorTreeMutations(_a) {
            var additions = _a.additions, moves = _a.moves, deletions = _a.deletions;
            var createdStyles = new Set();
            var removedStyles = new Set();
            var movedStyles = new Set();
            additions.forEach(function (node) { return getManageableStyles(node).forEach(function (style) { return createdStyles.add(style); }); });
            deletions.forEach(function (node) { return getManageableStyles(node).forEach(function (style) { return removedStyles.add(style); }); });
            moves.forEach(function (node) { return getManageableStyles(node).forEach(function (style) { return movedStyles.add(style); }); });
            handleStyleOperations({ createdStyles: createdStyles, removedStyles: removedStyles, movedStyles: movedStyles });
            additions.forEach(function (n) {
                iterateShadowHosts(n, subscribeForShadowRootChanges);
                collectUndefinedElements(n);
            });
        }
        function handleHugeTreeMutations(root) {
            var styles = new Set(getManageableStyles(root));
            var createdStyles = new Set();
            var removedStyles = new Set();
            var movedStyles = new Set();
            styles.forEach(function (s) {
                if (!prevStyles.has(s)) {
                    createdStyles.add(s);
                }
            });
            prevStyles.forEach(function (s) {
                if (!styles.has(s)) {
                    removedStyles.add(s);
                }
            });
            styles.forEach(function (s) {
                if (!createdStyles.has(s) && !removedStyles.has(s) && didStylePositionChange(s)) {
                    movedStyles.add(s);
                }
            });
            handleStyleOperations({ createdStyles: createdStyles, removedStyles: removedStyles, movedStyles: movedStyles });
            iterateShadowHosts(root, subscribeForShadowRootChanges);
            collectUndefinedElements(root);
        }
        function handleAttributeMutations(mutations) {
            var updatedStyles = new Set();
            var removedStyles = new Set();
            mutations.forEach(function (m) {
                var target = m.target;
                if (target.isConnected) {
                    if (shouldManageStyle(target)) {
                        updatedStyles.add(target);
                    }
                    else if (target instanceof HTMLLinkElement && target.disabled) {
                        removedStyles.add(target);
                    }
                }
            });
            if (updatedStyles.size + removedStyles.size > 0) {
                update({
                    updated: Array.from(updatedStyles),
                    created: [],
                    removed: Array.from(removedStyles),
                    moved: [],
                });
            }
        }
        function observe(root) {
            var treeObserver = createOptimizedTreeObserver(root, {
                onMinorMutations: handleMinorTreeMutations,
                onHugeMutations: handleHugeTreeMutations,
            });
            var attrObserver = new MutationObserver(handleAttributeMutations);
            attrObserver.observe(root, { attributes: true, attributeFilter: ['rel', 'disabled', 'media'], subtree: true });
            observers.push(treeObserver, attrObserver);
            observedRoots.add(root);
        }
        function subscribeForShadowRootChanges(node) {
            var shadowRoot = node.shadowRoot;
            if (shadowRoot == null || observedRoots.has(shadowRoot)) {
                return;
            }
            observe(shadowRoot);
            shadowRootDiscovered(shadowRoot);
        }
        observe(document);
        iterateShadowHosts(document.documentElement, subscribeForShadowRootChanges);
        watchWhenCustomElementsDefined(function (hosts) {
            var newStyles = [];
            hosts.forEach(function (host) { return push(newStyles, getManageableStyles(host.shadowRoot)); });
            update({ created: newStyles, updated: [], removed: [], moved: [] });
            hosts.forEach(function (host) {
                var shadowRoot = host.shadowRoot;
                if (shadowRoot == null) {
                    return;
                }
                subscribeForShadowRootChanges(host);
                iterateShadowHosts(shadowRoot, subscribeForShadowRootChanges);
                collectUndefinedElements(shadowRoot);
            });
        });
        document.addEventListener('__darkreader__isDefined', handleIsDefined);
        collectUndefinedElements(document);
    }
    function resetObservers() {
        observers.forEach(function (o) { return o.disconnect(); });
        observers.splice(0, observers.length);
        observedRoots = new WeakSet();
    }
    function stopWatchingForStyleChanges() {
        resetObservers();
        unsubscribeFromDefineCustomElements();
    }

    function hexify(number) {
        return ((number < 16 ? '0' : '') + number.toString(16));
    }
    function generateUID() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(function (x) { return hexify(x); }).join('');
    }

    var adoptedStyleOverrides = new WeakMap();
    var overrideList = new WeakSet();
    function createAdoptedStyleSheetOverride(node) {
        var cancelAsyncOperations = false;
        function injectSheet(sheet, override) {
            var newSheets = __spreadArray([], __read(node.adoptedStyleSheets));
            var sheetIndex = newSheets.indexOf(sheet);
            var existingIndex = newSheets.indexOf(override);
            if (sheetIndex === existingIndex - 1) {
                return;
            }
            if (existingIndex >= 0) {
                newSheets.splice(existingIndex, 1);
            }
            newSheets.splice(sheetIndex + 1, 0, override);
            node.adoptedStyleSheets = newSheets;
        }
        function destroy() {
            cancelAsyncOperations = true;
            var newSheets = __spreadArray([], __read(node.adoptedStyleSheets));
            node.adoptedStyleSheets.forEach(function (adoptedStyleSheet) {
                if (overrideList.has(adoptedStyleSheet)) {
                    var existingIndex = newSheets.indexOf(adoptedStyleSheet);
                    if (existingIndex >= 0) {
                        newSheets.splice(existingIndex, 1);
                    }
                    adoptedStyleOverrides.delete(adoptedStyleSheet);
                    overrideList.delete(adoptedStyleSheet);
                }
            });
            node.adoptedStyleSheets = newSheets;
        }
        function render(theme, ignoreImageAnalysis) {
            node.adoptedStyleSheets.forEach(function (sheet) {
                if (overrideList.has(sheet)) {
                    return;
                }
                var rules = sheet.rules;
                var override = new CSSStyleSheet();
                function prepareOverridesSheet() {
                    for (var i = override.cssRules.length - 1; i >= 0; i--) {
                        override.deleteRule(i);
                    }
                    injectSheet(sheet, override);
                    adoptedStyleOverrides.set(sheet, override);
                    overrideList.add(override);
                    return override;
                }
                var sheetModifier = createStyleSheetModifier();
                sheetModifier.modifySheet({
                    prepareSheet: prepareOverridesSheet,
                    sourceCSSRules: rules,
                    theme: theme,
                    ignoreImageAnalysis: ignoreImageAnalysis,
                    force: false,
                    isAsyncCancelled: function () { return cancelAsyncOperations; },
                });
            });
        }
        return {
            render: render,
            destroy: destroy
        };
    }

    function injectProxy() {
        document.dispatchEvent(new CustomEvent('__darkreader__inlineScriptsAllowed'));
        var addRuleDescriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'addRule');
        var insertRuleDescriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'insertRule');
        var deleteRuleDescriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'deleteRule');
        var removeRuleDescriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'removeRule');
        var shouldWrapDocStyleSheets = location.hostname.endsWith('pushbullet.com') || location.hostname.endsWith('ilsole24ore.com');
        var documentStyleSheetsDescriptor = shouldWrapDocStyleSheets ? Object.getOwnPropertyDescriptor(Document.prototype, 'styleSheets') : null;
        var cleanUp = function () {
            Object.defineProperty(CSSStyleSheet.prototype, 'addRule', addRuleDescriptor);
            Object.defineProperty(CSSStyleSheet.prototype, 'insertRule', insertRuleDescriptor);
            Object.defineProperty(CSSStyleSheet.prototype, 'deleteRule', deleteRuleDescriptor);
            Object.defineProperty(CSSStyleSheet.prototype, 'removeRule', removeRuleDescriptor);
            document.removeEventListener('__darkreader__cleanUp', cleanUp);
            document.removeEventListener('__darkreader__addUndefinedResolver', addUndefinedResolver);
            if (shouldWrapDocStyleSheets) {
                Object.defineProperty(Document.prototype, 'styleSheets', documentStyleSheetsDescriptor);
            }
        };
        var addUndefinedResolver = function (e) {
            customElements.whenDefined(e.detail.tag).then(function () {
                document.dispatchEvent(new CustomEvent('__darkreader__isDefined', { detail: { tag: e.detail.tag } }));
            });
        };
        document.addEventListener('__darkreader__cleanUp', cleanUp);
        document.addEventListener('__darkreader__addUndefinedResolver', addUndefinedResolver);
        var updateSheetEvent = new Event('__darkreader__updateSheet');
        function proxyAddRule(selector, style, index) {
            addRuleDescriptor.value.call(this, selector, style, index);
            if (this.ownerNode && !this.ownerNode.classList.contains('darkreader')) {
                this.ownerNode.dispatchEvent(updateSheetEvent);
            }
            return -1;
        }
        function proxyInsertRule(rule, index) {
            var returnValue = insertRuleDescriptor.value.call(this, rule, index);
            if (this.ownerNode && !this.ownerNode.classList.contains('darkreader')) {
                this.ownerNode.dispatchEvent(updateSheetEvent);
            }
            return returnValue;
        }
        function proxyDeleteRule(index) {
            deleteRuleDescriptor.value.call(this, index);
            if (this.ownerNode && !this.ownerNode.classList.contains('darkreader')) {
                this.ownerNode.dispatchEvent(updateSheetEvent);
            }
        }
        function proxyRemoveRule(index) {
            removeRuleDescriptor.value.call(this, index);
            if (this.ownerNode && !this.ownerNode.classList.contains('darkreader')) {
                this.ownerNode.dispatchEvent(updateSheetEvent);
            }
        }
        function proxyDocumentStyleSheets() {
            var docSheets = documentStyleSheetsDescriptor.get.call(this);
            var filtered = __spreadArray([], __read(docSheets)).filter(function (styleSheet) {
                return !styleSheet.ownerNode.classList.contains('darkreader');
            });
            return Object.setPrototypeOf(filtered, StyleSheetList.prototype);
        }
        Object.defineProperty(CSSStyleSheet.prototype, 'addRule', Object.assign({}, addRuleDescriptor, { value: proxyAddRule }));
        Object.defineProperty(CSSStyleSheet.prototype, 'insertRule', Object.assign({}, insertRuleDescriptor, { value: proxyInsertRule }));
        Object.defineProperty(CSSStyleSheet.prototype, 'deleteRule', Object.assign({}, deleteRuleDescriptor, { value: proxyDeleteRule }));
        Object.defineProperty(CSSStyleSheet.prototype, 'removeRule', Object.assign({}, removeRuleDescriptor, { value: proxyRemoveRule }));
        if (shouldWrapDocStyleSheets) {
            Object.defineProperty(Document.prototype, 'styleSheets', Object.assign({}, documentStyleSheetsDescriptor, { get: proxyDocumentStyleSheets }));
        }
    }

    var INSTANCE_ID = generateUID();
    var styleManagers = new Map();
    var adoptedStyleManagers = [];
    var filter = null;
    var fixes = null;
    var isIFrame = null;
    var ignoredImageAnalysisSelectors = null;
    var ignoredInlineSelectors = null;
    function createOrUpdateStyle(className, root) {
        if (root === void 0) { root = document.head || document; }
        var element = root.querySelector("." + className);
        if (!element) {
            element = document.createElement('style');
            element.classList.add('darkreader');
            element.classList.add(className);
            element.media = 'screen';
            element.textContent = '';
        }
        return element;
    }
    function createOrUpdateScript(className, root) {
        if (root === void 0) { root = document.head || document; }
        var element = root.querySelector("." + className);
        if (!element) {
            element = document.createElement('script');
            element.classList.add('darkreader');
            element.classList.add(className);
        }
        return element;
    }
    var nodePositionWatchers = new Map();
    function setupNodePositionWatcher(node, alias) {
        nodePositionWatchers.has(alias) && nodePositionWatchers.get(alias).stop();
        nodePositionWatchers.set(alias, watchForNodePosition(node, 'parent'));
    }
    function stopStylePositionWatchers() {
        forEach(nodePositionWatchers.values(), function (watcher) { return watcher.stop(); });
        nodePositionWatchers.clear();
    }
    function createStaticStyleOverrides() {
        var fallbackStyle = createOrUpdateStyle('darkreader--fallback', document);
        fallbackStyle.textContent = getModifiedFallbackStyle(filter, { strict: true });
        document.head.insertBefore(fallbackStyle, document.head.firstChild);
        setupNodePositionWatcher(fallbackStyle, 'fallback');
        var userAgentStyle = createOrUpdateStyle('darkreader--user-agent');
        userAgentStyle.textContent = getModifiedUserAgentStyle(filter, isIFrame, filter.styleSystemControls);
        document.head.insertBefore(userAgentStyle, fallbackStyle.nextSibling);
        setupNodePositionWatcher(userAgentStyle, 'user-agent');
        var textStyle = createOrUpdateStyle('darkreader--text');
        if (filter.useFont || filter.textStroke > 0) {
            textStyle.textContent = createTextStyle(filter);
        }
        else {
            textStyle.textContent = '';
        }
        document.head.insertBefore(textStyle, fallbackStyle.nextSibling);
        setupNodePositionWatcher(textStyle, 'text');
        var invertStyle = createOrUpdateStyle('darkreader--invert');
        if (fixes && Array.isArray(fixes.invert) && fixes.invert.length > 0) {
            invertStyle.textContent = [
                fixes.invert.join(', ') + " {",
                "    filter: " + getCSSFilterValue(__assign(__assign({}, filter), { contrast: filter.mode === 0 ? filter.contrast : clamp(filter.contrast - 10, 0, 100) })) + " !important;",
                '}',
            ].join('\n');
        }
        else {
            invertStyle.textContent = '';
        }
        document.head.insertBefore(invertStyle, textStyle.nextSibling);
        setupNodePositionWatcher(invertStyle, 'invert');
        var inlineStyle = createOrUpdateStyle('darkreader--inline');
        inlineStyle.textContent = getInlineOverrideStyle();
        document.head.insertBefore(inlineStyle, invertStyle.nextSibling);
        setupNodePositionWatcher(inlineStyle, 'inline');
        var overrideStyle = createOrUpdateStyle('darkreader--override');
        overrideStyle.textContent = fixes && fixes.css ? replaceCSSTemplates(fixes.css) : '';
        document.head.appendChild(overrideStyle);
        setupNodePositionWatcher(overrideStyle, 'override');
        var variableStyle = createOrUpdateStyle('darkreader--variables');
        var selectionColors = getSelectionColor(filter);
        var darkSchemeBackgroundColor = filter.darkSchemeBackgroundColor, darkSchemeTextColor = filter.darkSchemeTextColor, lightSchemeBackgroundColor = filter.lightSchemeBackgroundColor, lightSchemeTextColor = filter.lightSchemeTextColor, mode = filter.mode;
        var schemeBackgroundColor = mode === 0 ? lightSchemeBackgroundColor : darkSchemeBackgroundColor;
        var schemeTextColor = mode === 0 ? lightSchemeTextColor : darkSchemeTextColor;
        schemeBackgroundColor = modifyBackgroundColor(parse(schemeBackgroundColor), filter);
        schemeTextColor = modifyForegroundColor(parse(schemeTextColor), filter);
        variableStyle.textContent = [
            ":root {",
            "   --darkreader-neutral-background: " + schemeBackgroundColor + ";",
            "   --darkreader-neutral-text: " + schemeTextColor + ";",
            "   --darkreader-selection-background: " + selectionColors.backgroundColorSelection + ";",
            "   --darkreader-selection-text: " + selectionColors.foregroundColorSelection + ";",
            "}"
        ].join('\n');
        document.head.insertBefore(variableStyle, inlineStyle.nextSibling);
        setupNodePositionWatcher(variableStyle, 'variables');
        var rootVarsStyle = createOrUpdateStyle('darkreader--root-vars');
        document.head.insertBefore(rootVarsStyle, variableStyle.nextSibling);
        var proxyScript = createOrUpdateScript('darkreader--proxy');
        proxyScript.textContent = "(" + injectProxy + ")()";
        document.head.insertBefore(proxyScript, rootVarsStyle.nextSibling);
    }
    var shadowRootsWithOverrides = new Set();
    function createShadowStaticStyleOverrides(root) {
        var inlineStyle = createOrUpdateStyle('darkreader--inline', root);
        inlineStyle.textContent = getInlineOverrideStyle();
        root.insertBefore(inlineStyle, root.firstChild);
        var overrideStyle = createOrUpdateStyle('darkreader--override', root);
        overrideStyle.textContent = fixes && fixes.css ? replaceCSSTemplates(fixes.css) : '';
        root.insertBefore(overrideStyle, inlineStyle.nextSibling);
        shadowRootsWithOverrides.add(root);
    }
    function replaceCSSTemplates($cssText) {
        return $cssText.replace(/\${(.+?)}/g, function (m0, $color) {
            try {
                var color = parseColorWithCache($color);
                return modifyColor(color, filter);
            }
            catch (err) {
                logWarn(err);
                return $color;
            }
        });
    }
    function cleanFallbackStyle() {
        var fallback = document.querySelector('.darkreader--fallback');
        if (fallback) {
            fallback.textContent = '';
        }
    }
    function createDynamicStyleOverrides() {
        cancelRendering();
        var allStyles = getManageableStyles(document);
        var newManagers = allStyles
            .filter(function (style) { return !styleManagers.has(style); })
            .map(function (style) { return createManager(style); });
        newManagers
            .map(function (manager) { return manager.details(); })
            .filter(function (detail) { return detail && detail.rules.length > 0; })
            .forEach(function (detail) {
            variablesStore.addRulesForMatching(detail.rules);
        });
        variablesStore.matchVariablesAndDependants();
        variablesStore.putRootVars(document.head.querySelector('.darkreader--root-vars'), filter);
        styleManagers.forEach(function (manager) { return manager.render(filter, ignoredImageAnalysisSelectors); });
        if (loadingStyles.size === 0) {
            cleanFallbackStyle();
        }
        newManagers.forEach(function (manager) { return manager.watch(); });
        var inlineStyleElements = toArray(document.querySelectorAll(INLINE_STYLE_SELECTOR));
        iterateShadowHosts(document.documentElement, function (host) {
            createShadowStaticStyleOverrides(host.shadowRoot);
            var elements = host.shadowRoot.querySelectorAll(INLINE_STYLE_SELECTOR);
            if (elements.length > 0) {
                push(inlineStyleElements, elements);
            }
        });
        inlineStyleElements.forEach(function (el) { return overrideInlineStyle(el, filter, ignoredInlineSelectors, ignoredImageAnalysisSelectors); });
        handleAdoptedStyleSheets(document);
    }
    var loadingStylesCounter = 0;
    var loadingStyles = new Set();
    function createManager(element) {
        var loadingStyleId = ++loadingStylesCounter;
        function loadingStart() {
            if (!isDOMReady() || !didDocumentShowUp) {
                loadingStyles.add(loadingStyleId);
                var fallbackStyle = document.querySelector('.darkreader--fallback');
                if (!fallbackStyle.textContent) {
                    fallbackStyle.textContent = getModifiedFallbackStyle(filter, { strict: false });
                }
            }
        }
        function loadingEnd() {
            loadingStyles.delete(loadingStyleId);
            if (loadingStyles.size === 0 && isDOMReady()) {
                cleanFallbackStyle();
            }
        }
        function update() {
            var details = manager.details();
            if (!details) {
                return;
            }
            variablesStore.addRulesForMatching(details.rules);
            variablesStore.matchVariablesAndDependants();
            manager.render(filter, ignoredImageAnalysisSelectors);
        }
        var manager = manageStyle(element, { update: update, loadingStart: loadingStart, loadingEnd: loadingEnd });
        styleManagers.set(element, manager);
        return manager;
    }
    function removeManager(element) {
        var manager = styleManagers.get(element);
        if (manager) {
            manager.destroy();
            styleManagers.delete(element);
        }
    }
    var throttledRenderAllStyles = throttle(function (callback) {
        styleManagers.forEach(function (manager) { return manager.render(filter, ignoredImageAnalysisSelectors); });
        adoptedStyleManagers.forEach(function (manager) { return manager.render(filter, ignoredImageAnalysisSelectors); });
        callback && callback();
    });
    var cancelRendering = function () {
        throttledRenderAllStyles.cancel();
    };
    function onDOMReady() {
        if (loadingStyles.size === 0) {
            cleanFallbackStyle();
        }
    }
    var documentVisibilityListener = null;
    var didDocumentShowUp = !document.hidden;
    function watchForDocumentVisibility(callback) {
        var alreadyWatching = Boolean(documentVisibilityListener);
        documentVisibilityListener = function () {
            if (!document.hidden) {
                stopWatchingForDocumentVisibility();
                callback();
                didDocumentShowUp = true;
            }
        };
        if (!alreadyWatching) {
            document.addEventListener('visibilitychange', documentVisibilityListener);
        }
    }
    function stopWatchingForDocumentVisibility() {
        document.removeEventListener('visibilitychange', documentVisibilityListener);
        documentVisibilityListener = null;
    }
    function createThemeAndWatchForUpdates() {
        createStaticStyleOverrides();
        function runDynamicStyle() {
            createDynamicStyleOverrides();
            watchForUpdates();
        }
        if (document.hidden) {
            watchForDocumentVisibility(runDynamicStyle);
        }
        else {
            runDynamicStyle();
        }
        changeMetaThemeColorWhenAvailable(filter);
    }
    function handleAdoptedStyleSheets(node) {
        if (Array.isArray(node.adoptedStyleSheets)) {
            if (node.adoptedStyleSheets.length > 0) {
                var newManger = createAdoptedStyleSheetOverride(node);
                adoptedStyleManagers.push(newManger);
                newManger.render(filter, ignoredImageAnalysisSelectors);
            }
        }
    }
    function watchForUpdates() {
        var managedStyles = Array.from(styleManagers.keys());
        watchForStyleChanges(managedStyles, function (_a) {
            var created = _a.created, updated = _a.updated, removed = _a.removed, moved = _a.moved;
            var stylesToRemove = removed;
            var stylesToManage = created.concat(updated).concat(moved)
                .filter(function (style) { return !styleManagers.has(style); });
            var stylesToRestore = moved
                .filter(function (style) { return styleManagers.has(style); });
            stylesToRemove.forEach(function (style) { return removeManager(style); });
            var newManagers = stylesToManage
                .map(function (style) { return createManager(style); });
            newManagers
                .map(function (manager) { return manager.details(); })
                .filter(function (detail) { return detail && detail.rules.length > 0; })
                .forEach(function (detail) {
                variablesStore.addRulesForMatching(detail.rules);
            });
            variablesStore.matchVariablesAndDependants();
            newManagers.forEach(function (manager) { return manager.render(filter, ignoredImageAnalysisSelectors); });
            newManagers.forEach(function (manager) { return manager.watch(); });
            stylesToRestore.forEach(function (style) { return styleManagers.get(style).restore(); });
        }, function (shadowRoot) {
            createShadowStaticStyleOverrides(shadowRoot);
            handleAdoptedStyleSheets(shadowRoot);
        });
        watchForInlineStyles(function (element) {
            overrideInlineStyle(element, filter, ignoredInlineSelectors, ignoredImageAnalysisSelectors);
            if (element === document.documentElement) {
                var styleAttr = element.getAttribute('style');
                if (styleAttr.includes('--')) {
                    variablesStore.matchVariablesAndDependants();
                    variablesStore.putRootVars(document.head.querySelector('.darkreader--root-vars'), filter);
                }
            }
        }, function (root) {
            createShadowStaticStyleOverrides(root);
            var inlineStyleElements = root.querySelectorAll(INLINE_STYLE_SELECTOR);
            if (inlineStyleElements.length > 0) {
                forEach(inlineStyleElements, function (el) { return overrideInlineStyle(el, filter, ignoredInlineSelectors, ignoredImageAnalysisSelectors); });
            }
        });
        addDOMReadyListener(onDOMReady);
    }
    function stopWatchingForUpdates() {
        styleManagers.forEach(function (manager) { return manager.pause(); });
        stopStylePositionWatchers();
        stopWatchingForStyleChanges();
        stopWatchingForInlineStyles();
        removeDOMReadyListener(onDOMReady);
    }
    function createDarkReaderInstanceMarker() {
        var metaElement = document.createElement('meta');
        metaElement.name = 'darkreader';
        metaElement.content = INSTANCE_ID;
        document.head.appendChild(metaElement);
    }
    function isAnotherDarkReaderInstanceActive() {
        var meta = document.querySelector('meta[name="darkreader"]');
        if (meta) {
            if (meta.content !== INSTANCE_ID) {
                return true;
            }
            return false;
        }
        else {
            createDarkReaderInstanceMarker();
            return false;
        }
    }
    function createOrUpdateDynamicTheme(filterConfig, dynamicThemeFixes, iframe) {
        filter = filterConfig;
        fixes = dynamicThemeFixes;
        if (fixes) {
            ignoredImageAnalysisSelectors = Array.isArray(fixes.ignoreImageAnalysis) ? fixes.ignoreImageAnalysis : [];
            ignoredInlineSelectors = Array.isArray(fixes.ignoreInlineStyle) ? fixes.ignoreInlineStyle : [];
        }
        else {
            ignoredImageAnalysisSelectors = [];
            ignoredInlineSelectors = [];
        }
        isIFrame = iframe;
        if (document.head) {
            if (isAnotherDarkReaderInstanceActive()) {
                return;
            }
            document.documentElement.setAttribute('data-darkreader-mode', 'dynamic');
            document.documentElement.setAttribute('data-darkreader-scheme', filter.mode ? 'dark' : 'dimmed');
            createThemeAndWatchForUpdates();
        }
        else {
            if (!isFirefox) {
                var fallbackStyle = createOrUpdateStyle('darkreader--fallback');
                document.documentElement.appendChild(fallbackStyle);
                fallbackStyle.textContent = getModifiedFallbackStyle(filter, { strict: true });
            }
            var headObserver_1 = new MutationObserver(function () {
                if (document.head) {
                    headObserver_1.disconnect();
                    if (isAnotherDarkReaderInstanceActive()) {
                        removeDynamicTheme();
                        return;
                    }
                    createThemeAndWatchForUpdates();
                }
            });
            headObserver_1.observe(document, { childList: true, subtree: true });
        }
    }
    function removeProxy() {
        document.dispatchEvent(new CustomEvent('__darkreader__cleanUp'));
        removeNode(document.head.querySelector('.darkreader--proxy'));
    }
    function removeDynamicTheme() {
        document.documentElement.removeAttribute("data-darkreader-mode");
        document.documentElement.removeAttribute("data-darkreader-scheme");
        cleanDynamicThemeCache();
        removeNode(document.querySelector('.darkreader--fallback'));
        if (document.head) {
            restoreMetaThemeColor();
            removeNode(document.head.querySelector('.darkreader--user-agent'));
            removeNode(document.head.querySelector('.darkreader--text'));
            removeNode(document.head.querySelector('.darkreader--invert'));
            removeNode(document.head.querySelector('.darkreader--inline'));
            removeNode(document.head.querySelector('.darkreader--override'));
            removeNode(document.head.querySelector('.darkreader--variables'));
            removeNode(document.head.querySelector('.darkreader--root-vars'));
            removeNode(document.head.querySelector('meta[name="darkreader"]'));
            removeProxy();
        }
        shadowRootsWithOverrides.forEach(function (root) {
            removeNode(root.querySelector('.darkreader--inline'));
            removeNode(root.querySelector('.darkreader--override'));
        });
        shadowRootsWithOverrides.clear();
        forEach(styleManagers.keys(), function (el) { return removeManager(el); });
        forEach(document.querySelectorAll('.darkreader'), removeNode);
        adoptedStyleManagers.forEach(function (manager) {
            manager.destroy();
        });
        adoptedStyleManagers.splice(0);
    }
    function cleanDynamicThemeCache() {
        variablesStore.clear();
        parsedURLCache.clear();
        stopWatchingForDocumentVisibility();
        cancelRendering();
        stopWatchingForUpdates();
        cleanModificationCache();
    }

    var blobRegex = /url\(\"(blob\:.*?)\"\)/g;
    function replaceBlobs(text) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        getMatches(blobRegex, text, 1).forEach(function (url) {
                            var promise = loadAsDataURL(url);
                            promises.push(promise);
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        data = _a.sent();
                        return [2, text.replace(blobRegex, function () { return "url(\"" + data.shift() + "\")"; })];
                }
            });
        });
    }
    var banner = "/*\n                        _______\n                       /       \\\n                      .==.    .==.\n                     ((  ))==((  ))\n                    / \"==\"    \"==\"\\\n                   /____|| || ||___\\\n       ________     ____    ________  ___    ___\n       |  ___  \\   /    \\   |  ___  \\ |  |  /  /\n       |  |  \\  \\ /  /\\  \\  |  |  \\  \\|  |_/  /\n       |  |   )  /  /__\\  \\ |  |__/  /|  ___  \\\n       |  |__/  /  ______  \\|  ____  \\|  |  \\  \\\n_______|_______/__/ ____ \\__\\__|___\\__\\__|___\\__\\____\n|  ___  \\ |  ____/ /    \\   |  ___  \\ |  ____|  ___  \\\n|  |  \\  \\|  |___ /  /\\  \\  |  |  \\  \\|  |___|  |  \\  \\\n|  |__/  /|  ____/  /__\\  \\ |  |   )  |  ____|  |__/  /\n|  ____  \\|  |__/  ______  \\|  |__/  /|  |___|  ____  \\\n|__|   \\__\\____/__/      \\__\\_______/ |______|__|   \\__\\\n                https://darkreader.org\n*/";
    function collectCSS() {
        return __awaiter(this, void 0, void 0, function () {
            function addStaticCSS(selector, comment) {
                var staticStyle = document.querySelector(selector);
                if (staticStyle && staticStyle.textContent) {
                    css.push("/* " + comment + " */");
                    css.push(staticStyle.textContent);
                    css.push('');
                }
            }
            var css, modifiedCSS, formattedCSS, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        css = [banner];
                        addStaticCSS('.darkreader--fallback', 'Fallback Style');
                        addStaticCSS('.darkreader--user-agent', 'User-Agent Style');
                        addStaticCSS('.darkreader--text', 'Text Style');
                        addStaticCSS('.darkreader--invert', 'Invert Style');
                        addStaticCSS('.darkreader--variables', 'Variables Style');
                        modifiedCSS = [];
                        document.querySelectorAll('.darkreader--sync').forEach(function (element) {
                            forEach(element.sheet.cssRules, function (rule) {
                                rule && rule.cssText && modifiedCSS.push(rule.cssText);
                            });
                        });
                        if (!(modifiedCSS.length != 0)) return [3, 2];
                        formattedCSS = formatCSS(modifiedCSS.join('\n'));
                        css.push('/* Modified CSS */');
                        _b = (_a = css).push;
                        return [4, replaceBlobs(formattedCSS)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        css.push('');
                        _c.label = 2;
                    case 2:
                        addStaticCSS('.darkreader--override', 'Override Style');
                        return [2, css.join('\n')];
                }
            });
        });
    }

    var isDarkReaderEnabled = false;
    var isIFrame$1 = (function () {
        try {
            return window.self !== window.top;
        }
        catch (err) {
            console.warn(err);
            return true;
        }
    })();
    function enable(themeOptions, fixes) {
        if (themeOptions === void 0) { themeOptions = {}; }
        if (fixes === void 0) { fixes = null; }
        var theme = __assign(__assign({}, DEFAULT_THEME), themeOptions);
        if (theme.engine !== ThemeEngines.dynamicTheme) {
            throw new Error('Theme engine is not supported.');
        }
        createOrUpdateDynamicTheme(theme, fixes, isIFrame$1);
        isDarkReaderEnabled = true;
    }
    function isEnabled() {
        return isDarkReaderEnabled;
    }
    function disable() {
        removeDynamicTheme();
        isDarkReaderEnabled = false;
    }
    var darkScheme = matchMedia('(prefers-color-scheme: dark)');
    var store = {
        themeOptions: null,
        fixes: null,
    };
    function handleColorScheme() {
        if (darkScheme.matches) {
            enable(store.themeOptions, store.fixes);
        }
        else {
            disable();
        }
    }
    function auto(themeOptions, fixes) {
        if (themeOptions === void 0) { themeOptions = {}; }
        if (fixes === void 0) { fixes = null; }
        if (themeOptions) {
            store = { themeOptions: themeOptions, fixes: fixes };
            handleColorScheme();
            if (isMatchMediaChangeEventListenerSupported) {
                darkScheme.addEventListener('change', handleColorScheme);
            }
            else {
                darkScheme.addListener(handleColorScheme);
            }
        }
        else {
            if (isMatchMediaChangeEventListenerSupported) {
                darkScheme.removeEventListener('change', handleColorScheme);
            }
            else {
                darkScheme.removeListener(handleColorScheme);
            }
            disable();
        }
    }
    function exportGeneratedCSS() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, collectCSS()];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    }
    var setFetchMethod$1 = setFetchMethod;

    exports.auto = auto;
    exports.disable = disable;
    exports.enable = enable;
    exports.exportGeneratedCSS = exportGeneratedCSS;
    exports.isEnabled = isEnabled;
    exports.setFetchMethod = setFetchMethod$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
