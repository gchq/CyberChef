/**
 * CyberChef 中文汉化：Web 入口。
 *
 * 由 src/web/index.js 在其他模块之前导入，因此这里注册的 DOMContentLoaded
 * 监听器先于 App 初始化执行，静态文字在 tooltip 初始化前就已翻译。
 *
 * @license Apache-2.0
 */

import moment from "moment-timezone";
import "moment/locale/zh-cn.js";
import {isActive, getLanguage, setLanguage} from "./i18n.mjs";

// 加载 locale 会切换 moment 的全局语言，这里恢复为英文，只在显示处按需使用中文
moment.locale("en");
import {translateDom, observeDom} from "./dom.mjs";


/**
 * 在顶部栏 Options 链接旁加入中/英切换链接。
 */
function addLanguageToggle() {
    const options = document.getElementById("options");
    if (!options || document.getElementById("i18n-language")) return;

    const toggle = document.createElement("a");
    toggle.href = "#";
    toggle.id = "i18n-language";
    toggle.setAttribute("data-i18n-skip", "");
    toggle.title = isActive() ? "Switch to English" : "切换到中文";
    toggle.setAttribute("data-help-title", isActive() ? "界面语言" : "Interface language");
    toggle.setAttribute("data-help", isActive() ?
        "在中文和英文界面之间切换。选择会保存在浏览器的本地存储中。配方、分享链接和收藏夹始终使用英文操作名，与语言无关。" :
        "Switch between the Chinese and English interface. The choice is stored in your browser's local storage.");

    const label = document.createElement("span");
    label.textContent = isActive() ? "English" : "中文";
    const icon = document.createElement("i");
    icon.className = "material-icons";
    icon.textContent = "translate";
    toggle.append(label, " ", icon);

    toggle.addEventListener("click", e => {
        e.preventDefault();
        setLanguage(getLanguage() === "zh-CN" ? "en" : "zh-CN");
        window.location.reload();
    });

    options.parentNode.insertBefore(toggle, options);
}


/**
 * 输入法提交中文时（尤其是用鼠标选择候选词）不一定触发 keyup，
 * 这里在 compositionend 时补发一次 keyup，让搜索结果及时刷新。
 */
function fixImeSearch() {
    const search = document.getElementById("search");
    if (!search) return;
    search.addEventListener("compositionend", () => {
        search.dispatchEvent(new KeyboardEvent("keyup", {bubbles: true}));
    });
}


/**
 * 中文文字较宽时的少量样式修正，只在中文界面生效。
 */
function addStyles() {
    const style = document.createElement("style");
    style.textContent = "#step { white-space: nowrap; }";
    document.head.appendChild(style);
}


/**
 * 页面加载后翻译静态内容并开始监听动态内容。
 */
function init() {
    document.removeEventListener("DOMContentLoaded", init, false);
    document.documentElement.lang = getLanguage();
    addLanguageToggle();
    fixImeSearch();
    if (!isActive()) return;

    addStyles();
    translateDom(document.body);
    observeDom(document.body);
}

document.addEventListener("DOMContentLoaded", init, false);
