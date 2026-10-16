/**
 * 中文汉化（src/web/i18n）测试。
 *
 * 重点验证：操作的英文 name 作为标识始终不变，译文只用于显示，词典缺失时回退英文。
 *
 * @license Apache-2.0
 */

/* eslint camelcase: ["error", {"properties": "never"}] */

import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";
import assert from "assert";
import Categories from "../../../src/core/config/Categories.json" with { type: "json" };
import OperationConfig from "../../../src/core/config/OperationConfig.json" with { type: "json" };
import uiDict from "../../../src/web/i18n/zh-CN/ui.json" with { type: "json" };
import categoriesDict from "../../../src/web/i18n/zh-CN/categories.json" with { type: "json" };
import operationsDict from "../../../src/web/i18n/zh-CN/operations.json" with { type: "json" };
import {
    t, opName, opDescription, argName, argHint, catName, getOpName, localiseError,
    getLanguage, setLanguage, hasOpTranslation, lookupUi
} from "../../../src/web/i18n/i18n.mjs";
import HTMLOperation from "../../../src/web/HTMLOperation.mjs";
import {
    compareOperations, compareCategories, compareUi, extractHtmlStrings, extractCodeStrings, buildTemplate
} from "../../../scripts/i18n-check.mjs";

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

/**
 * 在指定语言下执行函数，结束后恢复原语言（不写 localStorage）。
 *
 * @param {string} lang
 * @param {function} fn
 */
function withLanguage(lang, fn) {
    const prev = getLanguage();
    setLanguage(lang, false);
    try {
        fn();
    } finally {
        setLanguage(prev, false);
    }
}

/**
 * 模拟 DOM 元素，只实现 getOpName 用到的方法。
 *
 * @param {Object} attrs
 * @param {string} text
 * @param {Object} [parent]
 * @param {Object} [child]
 * @returns {Object}
 */
function fakeEl(attrs, text, parent=null, child=null) {
    const el = {
        textContent: text,
        getAttribute: name => has(attrs, name) ? attrs[name] : null,
        closest: sel => {
            const attr = sel.match(/^\[([\w-]+)\]$/)[1];
            for (let e = el; e; e = e.parent) {
                if (e.getAttribute(attr) !== null) return e;
            }
            return null;
        },
        querySelector: () => child,
        parent
    };
    return el;
}

const fakeApp = (() => {
    let id = 0;
    return {nextIngId: () => id++};
})();

const fakeManager = {addDynamicListener: () => {}};

TestRegister.addApiTests([
    it("i18n: t() translates known strings and falls back to English", () => {
        withLanguage("zh-CN", () => {
            assert.strictEqual(t("Save recipe"), "保存配方");
            assert.strictEqual(t("  Save   recipe "), "保存配方");
            assert.strictEqual(t("This string does not exist"), "This string does not exist");
        });
    }),

    it("i18n: t() substitutes positional and named placeholders", () => {
        withLanguage("zh-CN", () => {
            assert.strictEqual(t("{0} more", [3]), "另 3 项");
            assert.strictEqual(t("Missing {0} and {name}", {0: "a", name: "b"}), "Missing a and b");
            assert.strictEqual(t("Keep {unknown}", []), "Keep {unknown}");
        });
    }),

    it("i18n: lookupUi matches placeholder patterns and translates captured values", () => {
        withLanguage("zh-CN", () => {
            assert.strictEqual(lookupUi("Input length"), "输入长度");
            assert.strictEqual(lookupUi("Tab 12"), "标签页 12");
            assert.strictEqual(lookupUi("Output character encoding:<br>UTF-8"), "输出字符编码：<br>UTF-8");
            assert.strictEqual(lookupUi("Recipe saved as \"my <recipe>\"."), "配方已保存为“my <recipe>”。");
            assert.strictEqual(lookupUi("No pattern matches this"), null);
            assert.strictEqual(lookupUi(""), null);
        });
        withLanguage("en", () => {
            assert.strictEqual(lookupUi("Input length"), null);
        });
    }),

    it("i18n: English mode returns original strings everywhere", () => {
        withLanguage("en", () => {
            assert.strictEqual(t("Save recipe"), "Save recipe");
            assert.strictEqual(lookupUi("Save recipe"), null);
            assert.strictEqual(opName("To Base64"), "To Base64");
            assert.strictEqual(catName("Favourites"), "Favourites");
            assert.strictEqual(argName("From Base64", "Strict mode"), "Strict mode");
            assert.strictEqual(opDescription("To Base64", "orig"), "orig");
            assert.strictEqual(localiseError("From Base64 - bad"), "From Base64 - bad");
        });
    }),

    it("i18n: setLanguage ignores unsupported languages", () => {
        const prev = getLanguage();
        setLanguage("fr", false);
        assert.strictEqual(getLanguage(), prev);
    }),

    it("i18n: operation display names, descriptions and args", () => {
        withLanguage("zh-CN", () => {
            assert.strictEqual(opName("To Base64"), "Base64 编码");
            assert.strictEqual(opName("Not An Operation"), "Not An Operation");
            assert.ok(hasOpTranslation("From Base64"));
            assert.ok(!hasOpTranslation("To Hex") || has(operationsDict, "To Hex"));
            assert.strictEqual(opDescription("Not An Operation", "fallback"), "fallback");
            assert.strictEqual(argName("From Base64", "Strict mode"), "严格模式");
            assert.strictEqual(argName("From Base64", "Unknown arg"), "Unknown arg");
            assert.strictEqual(argHint("From Base64", "Strict mode", undefined), undefined);
            assert.strictEqual(argHint("From Base64", "Strict mode", "Untranslated hint"), "Untranslated hint");
        });
    }),

    it("i18n: prototype keys are not treated as translations", () => {
        withLanguage("zh-CN", () => {
            assert.strictEqual(opName("constructor"), "constructor");
            assert.strictEqual(opName("__proto__"), "__proto__");
            assert.strictEqual(catName("toString"), "toString");
            assert.strictEqual(t("hasOwnProperty"), "hasOwnProperty");
            assert.strictEqual(argName("To Base64", "constructor"), "constructor");
        });
    }),

    it("i18n: category names", () => {
        withLanguage("zh-CN", () => {
            assert.strictEqual(catName("Favourites"), "收藏夹");
            assert.strictEqual(catName("No such category"), "No such category");
        });
    }),

    it("i18n: getOpName reads the English data-name, never the displayed text", () => {
        const li = fakeEl({"data-name": "To Base64"}, "Base64 编码");
        assert.strictEqual(getOpName(li), "To Base64");

        // Search highlighting wraps parts of the name in <b>; events may target that child
        const b = fakeEl({}, "Base64", li);
        assert.strictEqual(getOpName(b), "To Base64");

        // Recipe item without its own attribute: fall back to the .op-title child
        const title = fakeEl({"data-name": "MD5"}, "MD5");
        const recipeLi = fakeEl({}, "MD5 ...", null, title);
        assert.strictEqual(getOpName(recipeLi), "MD5");

        // Plain English element (e.g. added via addOperation(name)) still works
        assert.strictEqual(getOpName(fakeEl({}, "To Hex")), "To Hex");
        assert.strictEqual(getOpName(null), "");
    }),

    it("i18n: localiseError translates only a leading operation name", () => {
        withLanguage("zh-CN", () => {
            assert.strictEqual(localiseError("From Base64 - Invalid character"), "Base64 解码 - Invalid character");
            assert.strictEqual(localiseError("To Hex - Something"), opName("To Hex") + " - Something");
            assert.strictEqual(localiseError("Nothing to see - From Base64"), "Nothing to see - From Base64");
            assert.strictEqual(localiseError("No separator"), "No separator");
            assert.strictEqual(localiseError(undefined), undefined);
        });
    }),

    it("i18n: HTMLOperation keeps the English name as identifier", () => {
        withLanguage("zh-CN", () => {
            const op = new HTMLOperation("From Base64", OperationConfig["From Base64"], fakeApp, fakeManager);
            assert.strictEqual(op.name, "From Base64");
            assert.strictEqual(op.displayName, "Base64 解码");

            const stub = op.toStubHtml();
            assert.ok(stub.includes("data-name=\"From Base64\""), stub);
            assert.ok(stub.includes(">Base64 解码</li>"), stub);

            const full = op.toFullHtml();
            assert.ok(full.includes("<div class=\"op-title\" data-name=\"From Base64\">Base64 解码</div>"), full);
            // Labels are translated, arg-name attributes stay English
            assert.ok(full.includes("严格模式"), "translated arg label");
            assert.ok(full.includes("arg-name=\"Strict mode\""), "English arg-name");
            assert.ok(full.includes("value=\"Strict mode\""), "English checkbox value");

            op.highlightSearchStrings([[0, 6]], [[-1, 0]]);
            assert.strictEqual(op.name, "From Base64", "highlighting must not modify name");
            assert.strictEqual(op.displayName, "<b>Base64</b> 解码");
        });
    }),

    it("i18n: HTMLOperation escapes the data-name attribute", () => {
        const op = new HTMLOperation("A\"B<C>", {description: "", args: []}, fakeApp, fakeManager);
        assert.ok(op.toStubHtml().includes("data-name=\"A&quot;B&lt;C&gt;\""));
    }),

    it("i18n: HTMLOperation is unchanged in English mode", () => {
        withLanguage("en", () => {
            const op = new HTMLOperation("To Base64", OperationConfig["To Base64"], fakeApp, fakeManager);
            assert.strictEqual(op.displayName, "To Base64");
            assert.strictEqual(op.description, OperationConfig["To Base64"].description);
            assert.ok(op.toStubHtml().includes(">To Base64</li>"));
        });
    }),

    it("i18n dictionaries: operations.json entries are well-formed and refer to real operations", () => {
        const names = new Map();
        for (const [name, entry] of Object.entries(operationsDict)) {
            assert.ok(has(OperationConfig, name), `'${name}' is not an operation`);
            assert.strictEqual(typeof entry.displayName, "string", `${name}.displayName`);
            assert.ok(entry.displayName.trim().length, `${name}.displayName is empty`);
            assert.strictEqual(typeof entry.src_description, "string", `${name}.src_description`);
            assert.strictEqual(typeof entry.description, "string", `${name}.description`);
            assert.ok(entry.args && typeof entry.args === "object", `${name}.args`);
            const argNames = OperationConfig[name].args.map(a => a.name);
            for (const [arg, zh] of Object.entries(entry.args)) {
                assert.ok(argNames.includes(arg), `${name}: '${arg}' is not an argument`);
                assert.strictEqual(typeof zh, "string", `${name}.args.${arg}`);
            }
            // A translated name must not shadow another operation's English name
            if (entry.displayName !== name) {
                assert.ok(!has(OperationConfig, entry.displayName), `${name}: displayName clashes with an operation name`);
            }
            assert.ok(!names.has(entry.displayName), `'${entry.displayName}' used by both ${names.get(entry.displayName)} and ${name}`);
            names.set(entry.displayName, name);
        }
    }),

    it("i18n dictionaries: categories.json refers to real categories", () => {
        const catNames = Categories.map(c => c.name).concat("Favourites");
        for (const [name, zh] of Object.entries(categoriesDict)) {
            assert.ok(catNames.includes(name), `'${name}' is not a category`);
            assert.strictEqual(typeof zh, "string");
        }
    }),

    it("i18n dictionaries: ui.json values keep the same placeholders as their keys", () => {
        for (const [key, value] of Object.entries(uiDict)) {
            assert.strictEqual(typeof value, "string", key);
            const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(",");
            assert.strictEqual(ph(value), ph(key), `placeholders differ for '${key}'`);
        }
    }),

    it("i18n-check: compareOperations reports added, changed and removed entries", () => {
        const config = {
            "Op A": {description: "A", args: [{name: "x"}]},
            "Op B": {description: "B new", args: [{name: "y"}, {name: "z"}]},
            "Op C": {description: "C", args: []},
        };
        const dict = {
            "Op B": {displayName: "乙", src_description: "B old", description: "乙", args: {y: "Y", gone: "G"}},
            "Op C": {displayName: "丙", src_description: "C", description: "丙", args: {}},
            "Op D": {displayName: "丁", src_description: "D", description: "丁", args: {}},
        };
        const res = compareOperations(config, dict);
        assert.deepStrictEqual(res.added, ["Op A"]);
        assert.deepStrictEqual(res.removed, ["Op D"]);
        assert.strictEqual(res.changed.length, 1);
        assert.strictEqual(res.changed[0].name, "Op B");
        assert.strictEqual(res.changed[0].reasons.length, 3);

        const tpl = buildTemplate(config, dict, res, {added: []}, {missing: ["Hello"]});
        assert.deepStrictEqual(Object.keys(tpl.operations), ["Op A", "Op B"]);
        assert.strictEqual(tpl.operations["Op B"].src_description, "B new");
        assert.strictEqual(tpl.operations["Op B"].old_src_description, "B old");
        assert.deepStrictEqual(tpl.operations["Op B"].args, {y: "Y", z: ""});
        assert.deepStrictEqual(tpl.ui, {Hello: ""});
    }),

    it("i18n-check: compareCategories and compareUi", () => {
        const cats = compareCategories([{name: "Favourites"}, {name: "Hashing"}], {"Favourites": "收藏夹", "Old": "旧"});
        assert.deepStrictEqual(cats.added, ["Hashing"]);
        assert.deepStrictEqual(cats.removed, ["Old"]);

        const ui = compareUi(new Set(["Save", "Load"]), {"Save": "保存", "Gone": "没了"});
        assert.deepStrictEqual(ui.missing, ["Load"]);
        assert.deepStrictEqual(ui.unused, ["Gone"]);
        assert.strictEqual(ui.translated, 1);
    }),

    it("i18n-check: string extraction from HTML and code", () => {
        const html = `<div title="Save recipe" data-help="<p>Some <b>help</b></p>">
            Options <i class="material-icons">settings</i>
            <script>var x = "Not me";</script><!-- Nor me -->
            <span>&copy; 2016 &amp; more</span><span>   </span><span>42</span></div>`;
        const s = extractHtmlStrings(html);
        assert.ok(s.has("Save recipe"));
        assert.ok(s.has("<p>Some <b>help</b></p>"));
        assert.ok(s.has("Options"));
        assert.ok(s.has("© 2016 & more"));
        assert.ok(!s.has("settings"));
        assert.ok(!s.has("Some"));
        assert.ok(!s.has("Not me"));
        assert.ok(!s.has("Nor me"));
        assert.ok(!s.has("42"));

        const c = extractCodeStrings(`t("Hello {0}", [x]); foo.t("no"); el.setAttribute("title", "Tip \\"q\\""); \`<i title="Tpl">\`; \`<i title="\${x}">\`;`);
        assert.ok(c.has("Hello {0}"));
        assert.ok(c.has("Tip \"q\""));
        assert.ok(c.has("Tpl"));
        assert.ok(!c.has("no"));
        assert.strictEqual(c.size, 3);
    }),

    it("i18n-check: compound sentences with inline elements", () => {
        const s = extractHtmlStrings(`<p>There are <span class="num">many</span> ops, see <a href="x">here</a>.</p>
            <li><a href="y">Only a link</a></li>
            <p>Press <code>F1</code> now!</code></p>
            <a href="#">Download <i class="material-icons">file_download</i></a>`);
        assert.ok(s.has("There are <span>many</span> ops, see <a>here</a>."));
        assert.ok(!s.has("There are"), "fragments of a compound are not listed separately");
        assert.ok(s.has("Only a link"), "a lone inline element is translated as plain text");
        assert.ok(s.has("Press <code>F1</code> now!"), "stray closing tags are ignored");
        assert.ok(!s.has("Download <i>file_download</i>"), "icons are not part of compounds");
    }),

    it("i18n-check: dynamic strings in code", () => {
        const c = extractCodeStrings(`
            /** this.alert("Ignored example in JSDoc"); */
            this.app.alert(\`Recipe saved as "\${name}".\`, 3000);
            el.innerText = \`Tab \${n.toString()}\`;
            this.app.confirm("Title", "Body<br>Line", "Yes", "No", cb, this);
            x = { statusMessage: \`Input \${n} pending\` };
            html = \`<td>Place cursor</td><span title="\${label} length">\${v}</span>\`;
        `);
        const expected = [
            "Recipe saved as \"{0}\".", "Tab {0}", "Title", "Body<br>Line", "Yes", "No",
            "Input {0} pending", "Place cursor", "{0} length"
        ];
        for (const k of expected) {
            assert.ok(c.has(k), k);
        }
        assert.ok(!c.has("Ignored example in JSDoc"));
    }),
]);
