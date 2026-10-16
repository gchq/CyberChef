/**
 * CyberChef 中文汉化：译文覆盖检查。
 *
 * 对比构建生成的 src/core/config/OperationConfig.json 与 src/web/i18n/zh-CN/operations.json，
 * 输出“新增 / 原文已变更 / 已删除”三类操作条目；同时检查分类和 ui.json 的覆盖情况。
 *
 * 用法（在仓库根目录执行）：
 *   npx grunt exec:generateConfig          # 先生成 OperationConfig.json（构建或 npm test 也会生成）
 *   node scripts/i18n-check.mjs            # 输出报告
 *   node scripts/i18n-check.mjs --template i18n-todo.json   # 另外输出待翻译模板
 *   node scripts/i18n-check.mjs --verbose  # 列出全部未翻译操作（默认只显示数量和前若干条）
 *   node scripts/i18n-check.mjs --strict   # 存在“原文已变更/已删除”或 JSON 问题时返回非零退出码
 *
 * @license Apache-2.0
 */

/* eslint no-console: ["off"], camelcase: ["error", {"properties": "never"}] */

import fs from "fs";
import path from "path";
import process from "process";
import {fileURLToPath, pathToFileURL} from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const I18N_DIR = path.join(ROOT, "src/web/i18n/zh-CN");

export const PATHS = {
    operationConfig: path.join(ROOT, "src/core/config/OperationConfig.json"),
    categoriesConfig: path.join(ROOT, "src/core/config/Categories.json"),
    indexHtml: path.join(ROOT, "src/web/html/index.html"),
    webSrc: path.join(ROOT, "src/web"),
    operations: path.join(I18N_DIR, "operations.json"),
    categories: path.join(I18N_DIR, "categories.json"),
    ui: path.join(I18N_DIR, "ui.json"),
};

/** 与 src/web/i18n/dom.mjs 保持一致 */
const TRANSLATABLE_ATTRS = ["title", "data-original-title", "placeholder", "aria-label", "data-help-title", "data-help", "alt"];

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

/**
 * @param {string} str
 * @returns {string}
 */
function normalise(str) {
    return String(str).replace(/\s+/g, " ").trim();
}

/**
 * 读取 JSON 文件。
 *
 * @param {string} file
 * @returns {*}
 */
function readJson(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * 还原 HTML 实体（只处理 index.html 中实际会出现的几种）。
 *
 * @param {string} str
 * @returns {string}
 */
function decodeEntities(str) {
    return str
        .replace(/&nbsp;/g, " ")
        .replace(/&copy;/g, "©")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
}

/**
 * 是否值得翻译：包含字母，且不是模板表达式。
 *
 * @param {string} str
 * @returns {boolean}
 */
function isTranslatable(str) {
    return /[A-Za-z]/.test(str) && !/<%|%>|\$\{/.test(str);
}

/**
 * 从 HTML 中提取可翻译的文本节点和属性值。
 *
 * @param {string} html
 * @returns {Set<string>}
 */
export function extractHtmlStrings(html) {
    const strings = new Set();
    const PLACEHOLDER = "\u0000";
    const add = str => {
        let i = 0;
        const s = normalise(decodeEntities(str)).replace(new RegExp(PLACEHOLDER, "g"), () => `{${i++}}`);
        if (s && isTranslatable(s) && /[A-Za-z]/.test(s.replace(/\{\d+\}/g, ""))) strings.add(s);
    };

    // EJS 输出表达式（构建时代入的版本号、编译时间等）视为占位符
    html = html.replace(/<%[=-][\s\S]*?%>/g, PLACEHOLDER);

    html = html
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

    // 属性
    const attrRe = new RegExp(`\\s(${TRANSLATABLE_ATTRS.join("|")})=(?:"([^"]*)"|'([^']*)')`, "g");
    let m;
    while ((m = attrRe.exec(html))) {
        add(m[2] ?? m[3]);
    }

    // 文本节点：先清空所有属性值，避免把 data-help 中的 HTML 当成文本
    let stripped = html.replace(/=\s*"[^"]*"/g, "=\"\"").replace(/=\s*'[^']*'/g, "=''");

    // 整句：只包含文本和简单内联元素的元素（与 dom.mjs 的 compoundKey 一致）
    const inline = "a|b|i|u|em|strong|code|kbd|span|small|sup|sub";
    // 允许落单的内联闭合标签（浏览器会忽略它们）
    const compoundRe = new RegExp(`<([a-zA-Z][\\w-]*)\\b[^>]*>((?:[^<]|<(?:${inline})\\b[^>]*>[^<]*</(?:${inline})>|</(?:${inline})>)*)</\\1>`, "g");
    stripped = stripped.replace(compoundRe, (whole, tag, inner) => {
        if (!/<(?:a|b|i|u|em|strong|code|kbd|span|small|sup|sub)\b/.test(inner)) return whole;
        const key = inner
            .replace(new RegExp(`<(${inline})\\b[^>]*>`, "g"), "<$1>")
            .replace(/<(\w+)>[^<]*<\/\1>|<\/\w+>/g, m => m.startsWith("</") ? "" : m);
        const outside = key.replace(new RegExp(`<(${inline})>[^<]*</\\1>`, "g"), "");
        if (!/[A-Za-z]/.test(outside)) return whole;
        if (/<i>[a-z_0-9]+<\/i>/.test(key)) return whole; // material icons
        add(key);
        return `<${tag}></${tag}>`;
    });
    const tagRe = /<([a-zA-Z][\w-]*)([^>]*)>([^<]+)/g;
    const iconTags = new Set();
    // 记录 material-icons 元素，跳过图标名
    const iconRe = /<i\s[^>]*class="[^"]*material-icons[^"]*"[^>]*>([^<]*)</g;
    while ((m = iconRe.exec(html))) iconTags.add(normalise(m[1]));
    while ((m = tagRe.exec(stripped))) {
        const tag = m[1].toLowerCase();
        const text = normalise(decodeEntities(m[3]));
        if (tag === "i" && iconTags.has(text)) continue;
        add(m[3]);
    }
    return strings;
}

/**
 * 递归列出目录下的 .mjs / .js 文件。
 *
 * @param {string} dir
 * @returns {string[]}
 */
function listSourceFiles(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "static" || entry.name === "i18n") continue;
            out.push(...listSourceFiles(full));
        } else if (/\.(mjs|js)$/.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

/**
 * 从 Web 源码中提取 t("...") 调用，以及字面量形式的 title / data-help 等属性。
 *
 * @param {string} code
 * @returns {Set<string>}
 */
export function extractCodeStrings(code) {
    const strings = new Set();
    const SENTINEL = "\u0000";
    code = code.replace(/\/\*[\s\S]*?\*\//g, ""); // 忽略块注释（JSDoc 示例等）
    // 把 ${...} 插值换成占位符；每个字符串内部从 {0} 开始编号
    const numbered = str => {
        let i = 0;
        return str.replace(new RegExp(SENTINEL, "g"), () => `{${i++}}`);
    };
    const add = str => {
        const s = numbered(normalise(decodeEntities(str.replace(/\\(["'`\\])/g, "$1"))));
        if (s && /[A-Za-z]/.test(s.replace(/\{\d+\}/g, ""))) strings.add(s);
    };
    const interp = /\$\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g;
    const literal = "(?:\"((?:[^\"\\\\]|\\\\.)*)\"|`((?:[^`\\\\]|\\\\.)*)`)";
    const lit = m => (m[1] ?? m[2] ?? "").replace(interp, SENTINEL);
    let m;

    // t("...")
    const tRe = /(?<![\w.$])t\(\s*"((?:[^"\\]|\\.)*)"/g;
    while ((m = tRe.exec(code))) add(m[1]);

    // setAttribute("title", "..." 或 `...`)
    const setRe = new RegExp(`setAttribute\\(\\s*"(?:${TRANSLATABLE_ATTRS.join("|")})"\\s*,\\s*${literal}`, "g");
    while ((m = setRe.exec(code))) add(lit(m));

    // alert(...) / confirm(...) 的第一个参数、textContent/innerText/title 赋值、statusMessage
    const otherRe = new RegExp(`(?:\\.alert\\(\\s*|\\.(?:textContent|innerText|title)\\s*=\\s*|statusMessage:\\s*)${literal}`, "g");
    while ((m = otherRe.exec(code))) add(lit(m));

    // confirm(title, body, accept, reject, ...) 的字符串参数
    const confirmRe = /\.confirm\(/g;
    while ((m = confirmRe.exec(code))) {
        const argRe = new RegExp(`\\s*${literal}\\s*,`, "y");
        argRe.lastIndex = confirmRe.lastIndex;
        let a;
        while ((a = argRe.exec(code))) add(lit(a));
    }

    // 包含 HTML 的模板字符串：提取其中的文本和属性
    const tplRe = /`((?:[^`\\]|\\.)*)`/g;
    while ((m = tplRe.exec(code))) {
        if (!m[1].includes("<")) continue;
        for (const str of extractHtmlStrings(m[1].replace(interp, SENTINEL))) add(str);
    }
    return strings;
}

/**
 * 收集界面中所有可翻译的英文字符串。
 *
 * @returns {Set<string>}
 */
export function collectUiStrings() {
    const strings = extractHtmlStrings(fs.readFileSync(PATHS.indexHtml, "utf8"));
    for (const file of listSourceFiles(PATHS.webSrc)) {
        for (const s of extractCodeStrings(fs.readFileSync(file, "utf8"))) strings.add(s);
    }
    // 参数的悬停提示（hint）也通过 ui.json 翻译
    if (fs.existsSync(PATHS.operationConfig)) {
        const config = readJson(PATHS.operationConfig);
        for (const op of Object.values(config)) {
            for (const arg of op.args || []) {
                if (typeof arg.hint === "string" && arg.hint) strings.add(normalise(arg.hint));
            }
        }
    }
    return strings;
}

/**
 * 对比操作配置和操作词典。
 *
 * @param {Object} config - OperationConfig.json
 * @param {Object} dict - operations.json
 * @returns {{added: string[], changed: Object[], removed: string[], invalid: string[]}}
 */
export function compareOperations(config, dict) {
    const added = [], changed = [], removed = [], invalid = [];

    for (const name of Object.keys(config)) {
        if (!has(dict, name)) {
            added.push(name);
            continue;
        }
        const entry = dict[name];
        if (!entry || typeof entry !== "object") {
            invalid.push(`${name}：条目必须是对象`);
            continue;
        }
        const reasons = [];
        if (entry.src_description !== config[name].description) {
            reasons.push("说明原文已变更");
        }
        const argNames = (config[name].args || []).map(a => a.name);
        const dictArgs = entry.args && typeof entry.args === "object" ? Object.keys(entry.args) : [];
        const newArgs = argNames.filter(a => !dictArgs.includes(a));
        const goneArgs = dictArgs.filter(a => !argNames.includes(a));
        if (newArgs.length) reasons.push(`新增参数：${newArgs.join(", ")}`);
        if (goneArgs.length) reasons.push(`参数已删除：${goneArgs.join(", ")}`);
        if (reasons.length) changed.push({name, reasons});
    }

    for (const name of Object.keys(dict)) {
        if (!has(config, name)) removed.push(name);
    }

    return {added, changed, removed, invalid};
}

/**
 * 对比分类。
 *
 * @param {Object[]} categories - Categories.json
 * @param {Object} dict - categories.json
 * @returns {{added: string[], removed: string[], total: number}}
 */
export function compareCategories(categories, dict) {
    const names = categories.map(c => c.name);
    if (!names.includes("Favourites")) names.unshift("Favourites");
    return {
        added: names.filter(n => !has(dict, n)),
        removed: Object.keys(dict).filter(n => !names.includes(n)),
        total: names.length,
    };
}

/**
 * 不需要翻译的字符串：图标名、快捷键组合。
 *
 * @param {string} str
 * @returns {boolean}
 */
function isIgnoredUiString(str) {
    return /^[a-z]+(_[a-z]+)+$/.test(str) || str === "clear" || /^Ctrl\+/.test(str);
}

/**
 * 对比 ui.json 与源码中的字符串。
 *
 * @param {Set<string>} strings
 * @param {Object} dict - ui.json
 * @returns {{missing: string[], unused: string[], translated: number, total: number}}
 */
export function compareUi(strings, dict) {
    strings = new Set([...strings].filter(s => !isIgnoredUiString(s)));
    const keys = new Set(Object.keys(dict).map(normalise));
    const missing = [...strings].filter(s => !keys.has(s)).sort();
    const unused = [...keys].filter(k => !strings.has(k)).sort();
    return {
        missing,
        unused,
        translated: strings.size - missing.length,
        total: strings.size,
    };
}

/**
 * 生成待翻译模板。
 *
 * @param {Object} config
 * @param {Object} opsDict
 * @param {Object} opsResult
 * @param {Object} catResult
 * @param {Object} uiResult
 * @returns {Object}
 */
export function buildTemplate(config, opsDict, opsResult, catResult, uiResult) {
    const operations = {};
    const names = [...opsResult.added, ...opsResult.changed.map(c => c.name)];
    for (const name of names) {
        const existing = has(opsDict, name) ? opsDict[name] : {};
        const args = {};
        for (const arg of config[name].args || []) {
            args[arg.name] = existing.args && has(existing.args, arg.name) ? existing.args[arg.name] : "";
        }
        operations[name] = {
            displayName: existing.displayName || "",
            src_description: config[name].description,
            description: existing.description || "",
            args,
        };
        if (existing.src_description && existing.src_description !== config[name].description) {
            operations[name].old_src_description = existing.src_description;
        }
    }
    const categories = {};
    for (const name of catResult.added) categories[name] = "";
    const ui = {};
    for (const key of uiResult.missing) ui[key] = "";
    return {operations, categories, ui};
}

/**
 * 打印一组条目，默认最多显示 limit 条。
 *
 * @param {string} title
 * @param {string[]} items
 * @param {number} limit
 */
function printList(title, items, limit) {
    console.log(`\n${title}（${items.length}）`);
    const shown = limit > 0 ? items.slice(0, limit) : items;
    for (const item of shown) console.log(`  - ${item}`);
    if (shown.length < items.length) console.log(`  ……另有 ${items.length - shown.length} 条，使用 --verbose 查看全部`);
}

/**
 * 命令行入口。
 *
 * @param {string[]} argv
 * @returns {number} 退出码
 */
export function main(argv) {
    const verbose = argv.includes("--verbose");
    const strict = argv.includes("--strict");
    const tplIdx = argv.indexOf("--template");
    const templatePath = tplIdx >= 0 ? argv[tplIdx + 1] : null;
    if (tplIdx >= 0 && !templatePath) {
        console.error("--template 需要指定输出文件路径");
        return 2;
    }

    if (!fs.existsSync(PATHS.operationConfig)) {
        console.error(`找不到 ${path.relative(ROOT, PATHS.operationConfig)}。`);
        console.error("请先在仓库根目录执行：npx grunt exec:generateConfig（或执行一次构建 / npm test）");
        return 2;
    }

    let config, opsDict, catDict, uiDict, categories;
    try {
        config = readJson(PATHS.operationConfig);
        categories = readJson(PATHS.categoriesConfig);
        opsDict = readJson(PATHS.operations);
        catDict = readJson(PATHS.categories);
        uiDict = readJson(PATHS.ui);
    } catch (err) {
        console.error(`读取 JSON 失败：${err.message}`);
        return 2;
    }

    const ops = compareOperations(config, opsDict);
    const cats = compareCategories(categories, catDict);
    const ui = compareUi(collectUiStrings(), uiDict);
    const limit = verbose ? 0 : 20;
    const totalOps = Object.keys(config).length;

    console.log("CyberChef 汉化覆盖检查");
    console.log("======================");
    console.log(`操作：已翻译 ${totalOps - ops.added.length} / ${totalOps}`);
    console.log(`分类：已翻译 ${cats.total - cats.added.length} / ${cats.total}`);
    console.log(`界面文字：已翻译 ${ui.translated} / ${ui.total}`);

    printList("【操作】新增（尚未翻译）", ops.added, limit);
    printList("【操作】原文已变更", ops.changed.map(c => `${c.name}：${c.reasons.join("；")}`), 0);
    printList("【操作】已删除（词典中多余）", ops.removed, 0);
    if (ops.invalid.length) printList("【操作】格式错误", ops.invalid, 0);
    printList("【分类】未翻译", cats.added, 0);
    printList("【分类】已删除（词典中多余）", cats.removed, 0);
    printList("【界面】未翻译", ui.missing, limit);
    printList("【界面】词典中未在源码找到（可能已被官方修改或删除）", ui.unused, 0);

    if (templatePath) {
        const tpl = buildTemplate(config, opsDict, ops, cats, ui);
        fs.writeFileSync(templatePath, JSON.stringify(tpl, null, 4) + "\n");
        console.log(`\n待翻译模板已写入 ${templatePath}`);
    }

    if (strict && (ops.changed.length || ops.removed.length || ops.invalid.length || cats.removed.length)) {
        return 1;
    }
    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = main(process.argv.slice(2));
}
