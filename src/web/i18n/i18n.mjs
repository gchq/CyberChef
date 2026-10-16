/**
 * CyberChef 中文汉化：显示层翻译。
 *
 * 约定：操作的 name 是标识（配方、URL、收藏夹、Categories.json 都使用它），
 * 永远保持英文。这里只提供“显示用”的译文，词典中缺失的条目一律回退到英文原文。
 *
 * 本模块不依赖 DOM，可以在 Node 中直接测试。DOM 替换逻辑见 ./dom.mjs。
 *
 * @license Apache-2.0
 */

import uiDict from "./zh-CN/ui.json" with { type: "json" };
import categoriesDict from "./zh-CN/categories.json" with { type: "json" };
import operationsDict from "./zh-CN/operations.json" with { type: "json" };

export const LANGUAGES = ["zh-CN", "en"];
export const DEFAULT_LANGUAGE = "zh-CN";
export const LANGUAGE_STORAGE_KEY = "language";

/**
 * 把普通对象转换成 Map，避免 "constructor" / "__proto__" 等键命中原型链。
 *
 * @param {Object} obj
 * @returns {Map}
 */
function toMap(obj) {
    const map = new Map();
    if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj)) {
            map.set(key, obj[key]);
        }
    }
    return map;
}

/**
 * 压缩空白，供 DOM 文本和 ui.json 的键匹配使用。
 *
 * @param {string} str
 * @returns {string}
 */
export function normalise(str) {
    return String(str).replace(/\s+/g, " ").trim();
}

const UI = new Map();
for (const [key, value] of toMap(uiDict)) {
    if (typeof value === "string" && value.length) UI.set(normalise(key), value);
}
const CATEGORIES = toMap(categoriesDict);
const OPERATIONS = toMap(operationsDict);
const ARGS = new Map();
for (const [name, entry] of OPERATIONS) {
    ARGS.set(name, toMap(entry && entry.args));
}

let language = detectLanguage();

/**
 * 读取用户选择的界面语言（localStorage 不可用时使用默认语言）。
 *
 * @returns {string}
 */
function detectLanguage() {
    try {
        const stored = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
        if (LANGUAGES.includes(stored)) return stored;
    } catch (err) {}
    return DEFAULT_LANGUAGE;
}

/**
 * @returns {string} 当前界面语言
 */
export function getLanguage() {
    return language;
}

/**
 * 设置界面语言。只影响之后的翻译调用，已渲染的内容需要刷新页面。
 *
 * @param {string} lang
 * @param {boolean} [persist=true] - 是否写入 localStorage
 */
export function setLanguage(lang, persist=true) {
    if (!LANGUAGES.includes(lang)) return;
    language = lang;
    if (!persist) return;
    try {
        globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (err) {}
}

/**
 * @returns {boolean} 当前是否启用中文
 */
export function isActive() {
    return language === "zh-CN";
}

/**
 * 用参数替换 {0}、{name} 形式的占位符。
 *
 * @param {string} str
 * @param {Array|Object} params
 * @returns {string}
 */
function format(str, params) {
    if (params === undefined || params === null) return str;
    return str.replace(/\{(\w+)\}/g, (match, key) =>
        Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
    );
}

/**
 * 翻译界面文字。键为英文原文，缺失时返回英文原文。
 *
 * @param {string} str - 英文原文，可包含 {0} / {name} 占位符
 * @param {Array|Object} [params] - 占位符参数
 * @returns {string}
 *
 * @example
 * t("Save recipe");                         // "保存配方"
 * t("{0} length", ["Input"]);               // "输入 长度"（取决于词典）
 */
export function t(str, params) {
    let result = str;
    if (isActive()) {
        const key = normalise(str);
        if (UI.has(key)) result = UI.get(key);
    }
    return format(result, params);
}

/**
 * 查找 DOM 文本的译文，未命中返回 null（不做占位符替换）。
 *
 * @param {string} str
 * @returns {string|null}
 */
export function lookupUi(str) {
    if (!isActive()) return null;
    const key = normalise(str);
    return key && UI.has(key) ? UI.get(key) : null;
}

/**
 * @param {string} name - 操作的英文 name
 * @returns {Object|null} operations.json 中的条目
 */
function opEntry(name) {
    if (!isActive()) return null;
    const entry = OPERATIONS.get(name);
    return entry && typeof entry === "object" ? entry : null;
}

/**
 * 操作的显示名。
 *
 * @param {string} name - 操作的英文 name
 * @returns {string}
 */
export function opName(name) {
    const entry = opEntry(name);
    return entry && typeof entry.displayName === "string" && entry.displayName ? entry.displayName : name;
}

/**
 * 操作是否有中文显示名。
 *
 * @param {string} name
 * @returns {boolean}
 */
export function hasOpTranslation(name) {
    return opName(name) !== name;
}

/**
 * 操作说明（HTML）。
 *
 * @param {string} name - 操作的英文 name
 * @param {string} fallback - 英文说明
 * @returns {string}
 */
export function opDescription(name, fallback) {
    const entry = opEntry(name);
    return entry && typeof entry.description === "string" && entry.description ? entry.description : fallback;
}

/**
 * 参数的显示名。只用于 label，参数值和 arg-name 属性保持英文。
 *
 * @param {string} op - 操作的英文 name
 * @param {string} arg - 参数的英文名
 * @returns {string}
 */
export function argName(op, arg) {
    if (!isActive()) return arg;
    const value = ARGS.get(op)?.get(arg);
    return typeof value === "string" && value ? value : arg;
}

/**
 * 参数的悬停提示。优先使用 operations.json 中的 argHints，其次是 ui.json。
 *
 * @param {string} op - 操作的英文 name
 * @param {string} arg - 参数的英文名
 * @param {string} hint - 英文提示
 * @returns {string}
 */
export function argHint(op, arg, hint) {
    if (!hint) return hint;
    const entry = opEntry(op);
    const hints = entry && entry.argHints;
    if (hints && Object.prototype.hasOwnProperty.call(hints, arg) &&
        typeof hints[arg] === "string" && hints[arg]) {
        return hints[arg];
    }
    return t(hint);
}

/**
 * 分类的显示名。
 *
 * @param {string} name - 分类的英文名
 * @returns {string}
 */
export function catName(name) {
    if (!isActive()) return name;
    const value = CATEGORIES.get(name);
    return typeof value === "string" && value ? value : name;
}

/**
 * 从操作元素中读取英文 name。
 * 所有需要把 DOM 元素还原成操作标识的地方都必须使用此函数，而不是 textContent。
 *
 * @param {Element} el - li.operation 或 .op-title
 * @returns {string}
 */
export function getOpName(el) {
    if (!el) return "";
    // 事件目标可能是搜索高亮产生的 <b> 等子元素
    const holder = el.closest ? el.closest("[data-name]") : null;
    if (holder) return holder.getAttribute("data-name");
    const title = el.querySelector ? el.querySelector(".op-title[data-name]") : null;
    if (title) return title.getAttribute("data-name");
    return el.textContent;
}

/**
 * 翻译错误信息开头的操作名，例如 "From Base64 - Invalid ..." 。
 * 错误由 core 的 Recipe.mjs 生成，形如 `${op.name} - ${message}` 。
 *
 * @param {string} str
 * @returns {string}
 */
export function localiseError(str) {
    if (!isActive() || typeof str !== "string") return str;
    const sep = " - ";
    let idx = str.indexOf(sep);
    while (idx > 0) {
        const prefix = str.slice(0, idx);
        if (hasOpTranslation(prefix)) {
            return opName(prefix) + str.slice(idx);
        }
        idx = str.indexOf(sep, idx + 1);
    }
    return str;
}
