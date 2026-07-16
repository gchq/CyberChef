/**
 * Responsive phone / tablet layout for CyberChef.
 * Uses container width (ResizeObserver) so iframe embeds behave correctly.
 *
 * @author blepman
 * @license Apache-2.0
 */

const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1024;

/**
 * Manages layout modes: mobile | tablet | desktop.
 */
class ResponsiveLayoutWaiter {

    /**
     * @param {App} app
     * @param {Manager} manager
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
        this.root = null;
        this.observer = null;
        this.currentMode = null;
        this.mobilePane = "recipe"; // recipe | data
        this.dataSegment = "input"; // input | output
        this.opsOpen = false;
    }


    /**
     * Initialise observer and chrome after DOM is ready.
     */
    setup() {
        this.root = document.getElementById("content-wrapper");
        if (!this.root) return;

        this.root.classList.add("cyberchef-root");
        this.root.style.containerType = "inline-size";
        this.root.style.containerName = "cyberchef";

        this.bindChrome();

        if (typeof ResizeObserver !== "undefined") {
            this.observer = new ResizeObserver(entries => {
                const width = entries[0].contentRect.width;
                this.applyMode(this.modeFromWidth(width));
            });
            this.observer.observe(this.root);
            this.applyMode(this.modeFromWidth(this.root.getBoundingClientRect().width));
        } else {
            const onResize = () => {
                this.applyMode(this.modeFromWidth(window.innerWidth));
            };
            window.addEventListener("resize", onResize);
            onResize();
        }
    }


    /**
     * @param {number} width
     * @returns {"mobile"|"tablet"|"desktop"}
     */
    modeFromWidth(width) {
        if (width < BREAKPOINT_MOBILE) return "mobile";
        if (width < BREAKPOINT_TABLET) return "tablet";
        return "desktop";
    }


    /**
     * Wire mobile/tablet chrome controls.
     */
    bindChrome() {
        const navRecipe = document.getElementById("nav-recipe");
        const navData = document.getElementById("nav-data");
        const navOps = document.getElementById("nav-ops-fab");
        const opsClose = document.getElementById("ops-close");
        const opsScrim = document.getElementById("ops-scrim");
        const segInput = document.getElementById("seg-input");
        const segOutput = document.getElementById("seg-output");

        if (navRecipe) {
            navRecipe.addEventListener("click", () => this.showMobilePane("recipe"));
        }
        if (navData) {
            navData.addEventListener("click", () => this.showMobilePane("data"));
        }
        if (navOps) {
            navOps.addEventListener("click", () => this.toggleOps(true));
        }
        if (opsClose) {
            opsClose.addEventListener("click", () => this.toggleOps(false));
        }
        if (opsScrim) {
            opsScrim.addEventListener("click", () => this.toggleOps(false));
        }
        if (segInput) {
            segInput.addEventListener("click", () => this.showDataSegment("input"));
        }
        if (segOutput) {
            segOutput.addEventListener("click", () => this.showDataSegment("output"));
        }

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.opsOpen) {
                this.toggleOps(false);
            }
        });

        const tabletOps = document.getElementById("tablet-ops-toggle");
        if (tabletOps) {
            tabletOps.addEventListener("click", () => this.toggleOps(!this.opsOpen));
        }
    }


    /**
     * Switch layout mode and manage Split.js.
     *
     * @param {"mobile"|"tablet"|"desktop"} mode
     */
    applyMode(mode) {
        if (mode === this.currentMode || !this.root) return;

        const prev = this.currentMode;
        this.currentMode = mode;
        this.root.dataset.layout = mode;
        document.body.dataset.layout = mode;

        this.placeControls(mode);

        if (mode === "desktop") {
            this.toggleOps(false);
            if (prev && prev !== "desktop") {
                this.app.initialiseSplitter();
            }
        } else {
            this.app.destroySplitters();
            if (mode === "mobile") {
                this.showMobilePane(this.mobilePane);
                this.showDataSegment(this.dataSegment);
            } else {
                this.showDataSegment("both");
            }
        }

        this.app.adjustComponentSizes();
    }


    /**
     * On mobile the Bake bar must stay visible across panes, so move #controls
     * out of #recipe (which is display:none when Data is active).
     *
     * @param {"mobile"|"tablet"|"desktop"} mode
     */
    placeControls(mode) {
        const controls = document.getElementById("controls");
        const recipe = document.getElementById("recipe");
        const workspace = document.getElementById("workspace-wrapper");
        if (!controls || !recipe || !workspace) return;

        if (mode === "mobile") {
            if (controls.parentElement !== workspace) {
                workspace.appendChild(controls);
            }
            controls.classList.add("mobile-controls-bar");
        } else if (controls.parentElement !== recipe) {
            recipe.appendChild(controls);
            controls.classList.remove("mobile-controls-bar");
        }
    }


    /**
     * @param {"recipe"|"data"} pane
     */
    showMobilePane(pane) {
        this.mobilePane = pane;
        if (this.root) {
            this.root.dataset.mobilePane = pane;
        }

        const navRecipe = document.getElementById("nav-recipe");
        const navData = document.getElementById("nav-data");
        if (navRecipe) {
            navRecipe.classList.toggle("active", pane === "recipe");
            navRecipe.setAttribute("aria-selected", pane === "recipe" ? "true" : "false");
        }
        if (navData) {
            navData.classList.toggle("active", pane === "data");
            navData.setAttribute("aria-selected", pane === "data" ? "true" : "false");
        }

        this.app.adjustComponentSizes();
    }


    /**
     * @param {"input"|"output"|"both"} segment
     */
    showDataSegment(segment) {
        this.dataSegment = segment === "both" ? "input" : segment;
        if (this.root) {
            this.root.dataset.dataSegment = segment;
        }

        const segInput = document.getElementById("seg-input");
        const segOutput = document.getElementById("seg-output");
        if (segInput && segment !== "both") {
            segInput.classList.toggle("active", segment === "input");
            segInput.setAttribute("aria-selected", segment === "input" ? "true" : "false");
        }
        if (segOutput && segment !== "both") {
            segOutput.classList.toggle("active", segment === "output");
            segOutput.setAttribute("aria-selected", segment === "output" ? "true" : "false");
        }

        this.app.adjustComponentSizes();
    }


    /**
     * Open / close operations sheet (mobile) or drawer (tablet).
     *
     * @param {boolean} open
     */
    toggleOps(open) {
        this.opsOpen = open;
        if (this.root) {
            this.root.classList.toggle("ops-open", open);
        }

        const overlay = document.getElementById("ops-overlay");
        if (overlay) {
            overlay.hidden = !open;
            overlay.setAttribute("aria-hidden", open ? "false" : "true");
        }

        const ops = document.getElementById("operations");
        if (ops) {
            ops.setAttribute("aria-hidden", open || this.currentMode === "desktop" ? "false" : "true");
            if (open) {
                const search = document.getElementById("search");
                if (search) search.focus();
            }
        }

        const fab = document.getElementById("nav-ops-fab");
        if (fab) {
            fab.setAttribute("aria-expanded", open ? "true" : "false");
        }

        const tabletOps = document.getElementById("tablet-ops-toggle");
        if (tabletOps) {
            tabletOps.setAttribute("aria-expanded", open ? "true" : "false");
        }
    }


    /**
     * After adding an operation from the list, keep sheet open for multi-add.
     */
    afterOperationAdded() {
        if (this.currentMode === "mobile") {
            this.showMobilePane("recipe");
        }
    }


    /**
     * @returns {boolean}
     */
    isTouchLayout() {
        return this.currentMode === "mobile" || this.currentMode === "tablet";
    }
}

export default ResponsiveLayoutWaiter;
