/**
 * A modification of the CodeMirror Panel extension to enable panels to the
 * left and right of the editor.
 * Based on code here: https://github.com/codemirror/view/blob/main/src/panel.ts
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import {EditorView, ViewPlugin} from "@codemirror/view";
import {Facet} from "@codemirror/state";

const panelConfig = Facet.define({
    combine(configs) {
        let leftContainer, rightContainer;
        for (const c of configs) {
            leftContainer = leftContainer || c.leftContainer;
            rightContainer = rightContainer || c.rightContainer;
        }
        return {leftContainer, rightContainer};
    }
});

/**
 * Configures the panel-managing extension.
 * @param {PanelConfig} config
 * @returns Extension
 */
export function panels(config) {
    return config ? [panelConfig.of(config)] : [];
}

/**
 * Get the active panel created by the given constructor, if any.
 * This can be useful when you need access to your panels' DOM
 * structure.
 * @param {EditorView} view
 * @param {PanelConstructor} panel
 * @returns {Panel}
 */
export function getPanel(view, panel) {
    const plugin = view.plugin(panelPlugin);
    const index = plugin ? plugin.specs.indexOf(panel) : -1;
    return index > -1 ? plugin.panels[index] : null;
}

const panelPlugin = ViewPlugin.fromClass(class {

    /**
     * @param {EditorView} view
     */
    constructor(view) {
        this.input = view.state.facet(showSidePanel);
        this.specs = this.input.filter(s => s);
        this.panels = this.specs.map(spec => spec(view));
        const conf = view.state.facet(panelConfig);
        this.left = new PanelGroup(view, true, conf.leftContainer);
        this.right = new PanelGroup(view, false, conf.rightContainer);
        this.left.sync(this.panels.filter(p => p.left));
        this.right.sync(this.panels.filter(p => !p.left));
        for (const p of this.panels) {
            p.dom.classList.add("cm-panel");
            if (p.mount) p.mount();
        }
    }

    /**
     * @param {ViewUpdate} update
     */
    update(update) {
        const conf = update.state.facet(panelConfig);
        if (this.left.container !== conf.leftContainer) {
            this.left.sync([]);
            this.left = new PanelGroup(update.view, true, conf.leftContainer);
        }
        if (this.right.container !== conf.rightContainer) {
            this.right.sync([]);
            this.right = new PanelGroup(update.view, false, conf.rightContainer);
        }
        this.left.syncClasses();
        this.right.syncClasses();
        const input = update.state.facet(showSidePanel);
        if (input !== this.input) {
            const specs = input.filter(x => x);
            const panels = [], left = [], right = [], mount = [];
            for (const spec of specs) {
                const known = this.specs.indexOf(spec);
                let panel;
                if (known < 0) {
                    panel = spec(update.view);
                    mount.push(panel);
                } else {
                    panel = this.panels[known];
                    if (panel.update) panel.update(update);
                }
                panels.push(panel)
                ;(panel.left ? left : right).push(panel);
            }
            this.specs = specs;
            this.panels = panels;
            this.left.sync(left);
            this.right.sync(right);
            for (const p of mount) {
                p.dom.classList.add("cm-panel");
                if (p.mount) p.mount();
            }
        } else {
            for (const p of this.panels) if (p.update) p.update(update);
        }
    }

    /**
     * Destroy panel
     */
    destroy() {
        this.left.sync([]);
        this.right.sync([]);
    }
}, {
    // provide: PluginField.scrollMargins.from(value => ({left: value.left.scrollMargin(), right: value.right.scrollMargin()}))
});

/**
 * PanelGroup
 */
class PanelGroup {

    /**
     * @param {EditorView} view
     * @param {boolean} left
     * @param {HTMLElement} container
     */
    constructor(view, left, container) {
        this.view = view;
        this.left = left;
        this.container = container;
        this.dom = undefined;
        this.classes = "";
        this.panels = [];
        this.syncClasses();
    }

    /**
     * @param {Panel[]} panels
     */
    sync(panels) {
        for (const p of this.panels) if (p.destroy && panels.indexOf(p) < 0) p.destroy();
        this.panels = panels;
        this.syncDOM();
    }

    /**
     * Synchronise the DOM
     */
    syncDOM() {
        if (this.panels.length === 0) {
            if (this.dom) {
                this.dom.remove();
                this.dom = undefined;
                this.setScrollerMargin(0);
            }
            return;
        }

        const parent = this.container || this.view.dom;
        if (!this.dom) {
            this.dom = document.createElement("div");
            this.dom.className = this.left ? "cm-side-panels cm-panels-left" : "cm-side-panels cm-panels-right";
            parent.insertBefore(this.dom, parent.firstChild);
        }

        let curDOM = this.dom.firstChild;
        let bufferWidth = 0;
        for (const panel of this.panels) {
            bufferWidth += panel.width;
            if (panel.dom.parentNode === this.dom) {
                while (curDOM !== panel.dom) curDOM = rm(curDOM);
                curDOM = curDOM.nextSibling;
            } else {
                this.dom.insertBefore(panel.dom, curDOM);
                panel.dom.style.width = panel.width + "px";
                this.dom.style.width = bufferWidth + "px";
            }
        }
        while (curDOM) curDOM = rm(curDOM);

        this.setScrollerMargin(bufferWidth);
    }

    /**
     * Sets the margin of the cm-scroller element to make room for the panel
     */
    setScrollerMargin(width) {
        const parent = this.container || this.view.dom;
        const margin = this.left ? "marginLeft" : "marginRight";
        parent.querySelector(".cm-scroller").style[margin] = width + "px";
    }

    /**
     *
     */
    scrollMargin() {
        return !this.dom || this.container ? 0 :
            Math.max(0, this.left ?
                this.dom.getBoundingClientRect().right - Math.max(0, this.view.scrollDOM.getBoundingClientRect().left) :
                Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().right) - this.dom.getBoundingClientRect().left);
    }

    /**
     *
     */
    syncClasses() {
        if (!this.container || this.classes === this.view.themeClasses) return;
        for (const cls of this.classes.split(" ")) if (cls) this.container.classList.remove(cls);
        for (const cls of (this.classes = this.view.themeClasses).split(" ")) if (cls) this.container.classList.add(cls);
    }
}

/**
 * @param {ChildNode} node
 * @returns HTMLElement
 */
function rm(node) {
    const next = node.nextSibling;
    node.remove();
    return next;
}

const baseTheme = EditorView.baseTheme({
    ".cm-side-panels": {
        boxSizing: "border-box",
        position: "absolute",
        height: "100%",
        top: 0,
        bottom: 0
    },
    "&light .cm-side-panels": {
        backgroundColor: "#f5f5f5",
        color: "black"
    },
    "&light .cm-panels-left": {
        borderRight: "1px solid #ddd",
        left: 0
    },
    "&light .cm-panels-right": {
        borderLeft: "1px solid #ddd",
        right: 0
    },
    "&dark .cm-side-panels": {
        backgroundColor: "#333338",
        color: "white"
    }
});

/**
 * Opening a panel is done by providing a constructor function for
 * the panel through this facet. (The panel is closed again when its
 * constructor is no longer provided.) Values of `null` are ignored.
 */
export const showSidePanel = Facet.define({
    enables: [panelPlugin, baseTheme]
});
