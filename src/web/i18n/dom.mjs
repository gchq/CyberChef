/**
 * CyberChef 中文汉化：DOM 文本和属性替换。
 *
 * 对 index.html 的静态内容，以及之后插入页面的固定模板字符串，按 ui.json
 * 中的英文原文整串匹配并替换。用户数据、操作名和配方参数所在的区域被排除在外。
 *
 * @license Apache-2.0
 */

import {lookupUi, isActive} from "./i18n.mjs";

/** 需要翻译的属性 */
export const TRANSLATABLE_ATTRS = [
    "title",
    "data-original-title",
    "placeholder",
    "aria-label",
    "data-help-title",
    "data-help",
    "alt"
];

/**
 * 这些区域内的属性和文本都不翻译：
 * - .cm-scroller：输入输出编辑器的内容区和行号栏（用户数据、HTML 输出）。
 *   编辑器的状态栏面板不在其中，会被翻译。
 * - [data-i18n-skip]：显式跳过的元素。
 */
const SKIP_ALL = ".cm-scroller, [data-i18n-skip], " +
    // InputWaiter 读取此按钮的文字作为过滤类型（CONTENT/FILENAME），不能翻译
    "#input-filter-button, #input-filter-content, #input-filter-filename";

/**
 * 这些区域内的文本节点不翻译，但属性（title、data-help 等）仍会翻译：
 * - li.operation / .op-title：操作名是标识，由 HTMLOperation 负责显示译名
 * - #rec-list：配方参数中的下拉选项文本可能就是参数值
 * - .material-icons：图标名
 */
const SKIP_TEXT = "script, style, textarea, li.operation, .op-title, #rec-list, .material-icons, option:not([value])";

/**
 * @param {Element} el
 * @param {string} selector
 * @returns {boolean}
 */
function within(el, selector) {
    return !!(el && el.closest && el.closest(selector));
}

/**
 * 翻译单个文本节点，保留首尾空白。
 *
 * @param {Text} node
 */
function translateTextNode(node) {
    const original = node.data;
    if (!original || !/[A-Za-z]/.test(original)) return;
    const translated = lookupUi(original);
    if (translated === null) return;
    const lead = original.match(/^\s*/)[0];
    const trail = original.match(/\s*$/)[0];
    const value = lead + translated + trail;
    if (value !== original) node.data = value;
}

/**
 * 翻译元素上的一个属性。
 *
 * @param {Element} el
 * @param {string} attr
 */
function translateAttr(el, attr) {
    const original = el.getAttribute(attr);
    if (!original) return;
    const translated = lookupUi(original);
    if (translated !== null && translated !== original) el.setAttribute(attr, translated);
}

/** 整句翻译时允许出现的内联子元素 */
export const INLINE_TAGS = new Set(["A", "B", "I", "U", "EM", "STRONG", "CODE", "KBD", "SPAN", "SMALL", "SUP", "SUB"]);

/**
 * 若元素只包含文本和不含子元素的内联元素（且至少有一个），返回其整句键，
 * 形如 "There are <span>hundreds of</span> operations"；否则返回 null。
 *
 * @param {Element} el
 * @returns {string|null}
 */
function compoundKey(el) {
    let hasElement = false;
    let key = "";
    for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            key += child.data;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            if (!INLINE_TAGS.has(child.tagName) || child.children.length) return null;
            const tag = child.tagName.toLowerCase();
            key += `<${tag}>${child.textContent}</${tag}>`;
            hasElement = true;
        } else if (child.nodeType !== Node.COMMENT_NODE) {
            return null;
        }
    }
    return hasElement ? key : null;
}

/**
 * 按整句译文重建元素的子节点。复用原有的内联子元素（保留属性和事件），
 * 只修改它们的文字；不使用 innerHTML。
 *
 * @param {Element} el
 * @param {string} translated - 形如 "CyberChef 中有<span>数百</span>个操作"
 * @returns {boolean} 是否成功
 */
function applyCompound(el, translated) {
    const pool = new Map();
    for (const child of el.children) {
        const tag = child.tagName.toLowerCase();
        if (!pool.has(tag)) pool.set(tag, []);
        pool.get(tag).push(child);
    }
    const nodes = [];
    const re = /<([a-z]+)>([^<]*)<\/\1>/g;
    let last = 0, m;
    while ((m = re.exec(translated))) {
        if (m.index > last) nodes.push(document.createTextNode(translated.slice(last, m.index)));
        const list = pool.get(m[1]);
        if (!list || !list.length) return false;
        const child = list.shift();
        child.textContent = m[2];
        nodes.push(child);
        last = re.lastIndex;
    }
    if (last < translated.length) nodes.push(document.createTextNode(translated.slice(last)));
    if (/<[a-z]/.test(nodes.filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.data).join(""))) return false;
    el.replaceChildren(...nodes);
    return true;
}

/**
 * 翻译单个元素的属性和直接子文本节点（不递归）。
 *
 * @param {Element} el
 */
function translateElement(el) {
    for (const attr of TRANSLATABLE_ATTRS) {
        if (el.hasAttribute(attr)) translateAttr(el, attr);
    }
    if (within(el, SKIP_TEXT)) return;
    const key = compoundKey(el);
    if (key !== null) {
        const translated = lookupUi(key);
        if (translated !== null && applyCompound(el, translated)) return;
    }
    for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) translateTextNode(child);
    }
}

/**
 * 递归翻译一个子树。
 *
 * @param {Node} root
 */
export function translateDom(root) {
    if (!isActive() || !root) return;

    if (root.nodeType === Node.TEXT_NODE) {
        const parent = root.parentElement;
        if (parent && !within(parent, SKIP_ALL) && !within(parent, SKIP_TEXT)) {
            translateTextNode(root);
        }
        return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (within(root, SKIP_ALL)) return;

    translateElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: el => el.matches(SKIP_ALL) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let el;
    while ((el = walker.nextNode())) {
        translateElement(el);
    }
}

/**
 * 监听之后插入或修改的内容并翻译。
 *
 * @param {Element} root
 * @returns {MutationObserver|null}
 */
export function observeDom(root) {
    if (!isActive() || !root || typeof MutationObserver === "undefined") return null;

    const observer = new MutationObserver(records => {
        for (const record of records) {
            if (record.type === "attributes") {
                const el = record.target;
                if (!within(el, SKIP_ALL)) translateAttr(el, record.attributeName);
            } else {
                for (const node of record.addedNodes) {
                    translateDom(node);
                }
            }
        }
    });

    observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: TRANSLATABLE_ATTRS
    });
    return observer;
}
