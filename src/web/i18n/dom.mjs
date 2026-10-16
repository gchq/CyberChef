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
 * 这些区域内的属性和文本都不翻译（输入输出编辑器中的用户数据、显式跳过的元素）。
 */
const SKIP_ALL = ".cm-editor, #input-text, #output-text, [data-i18n-skip]";

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
