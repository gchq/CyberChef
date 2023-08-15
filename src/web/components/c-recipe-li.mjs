import HTMLIngredient from "../HTMLIngredient.mjs";

/**
 * c(ustom element)-recipe-li ( list item ).
 *
 * Note: This is the #recipe-list list item component, not to be confused with HTMLIngredient which make up the smaller
 * components of this list item. It would be good to eventually fuse that code into this component or alternatively, to
 * turn that into a separate native web component .
 */
export class CRecipeLi extends HTMLElement {
    /**
     * @param {App} app - The main view object for CyberChef
     * @param {string} name - The operation name
     * @param {object[]} args - The args properties of the operation ( see operation config file )
     */
    constructor(
        app,
        name,
        args = []
    ) {
        super();

        this.app = app;
        this.name = name;
        this.args = args;
        this.ingredients = [];

        this.flowControl = this.app.operations[this.name].flowControl;
        this.manualBake = this.app.operations[this.name].manualBake;

        for (let i = 0; i < args.length; i++) {
            const ing = new HTMLIngredient(args[i], this.app, this.app.manager);
            this.ingredients.push(ing);
        }

        this.build();

        // Use mousedown event instead of click to prevent accidentally firing the handler twice on mobile
        this.addEventListener("mousedown", this.handleMousedown.bind(this));
        this.addEventListener("dblclick", this.handleDoubleClick.bind(this));
    }

    /**
     * Remove listeners on disconnectedCallback
     */
    disconnectedCallback() {
        this.removeEventListener("mousedown", this.handleMousedown.bind(this));
        this.removeEventListener("dblclick", this.handleDoubleClick.bind(this));
    }

    /**
     * Handle double click
     *
     * @param {Event} e
     */
    handleDoubleClick(e) {
        // do not remove if icons or form elements are double-clicked
        if (e.target === this.querySelector("li") || e.target === this.querySelector("div.op-title")) {
            this.removeOperation();
        }
    }

    /**
     * Handle mousedown
     * @fires Manager#statechange
     * @param {Event} e
     */
    handleMousedown(e) {
        const disableIcon = this.querySelector("i.disable-icon");
        const breakpointIcon = this.querySelector("i.breakpoint-icon");

        // handle click on 'disable-icon'
        if (e.target === disableIcon) {
            if (disableIcon.getAttribute("disabled") === "false") {
                disableIcon.setAttribute("disabled", "true");
                disableIcon.classList.add("disable-icon-selected");
                this.querySelector("li.operation").classList.add("disabled");
            } else {
                disableIcon.setAttribute("disabled", "false");
                disableIcon.classList.remove("disable-icon-selected");
                this.querySelector("li.operation").classList.remove("disabled");
            }

            this.app.progress = 0;
            window.dispatchEvent(this.app.manager.statechange);
        }

        // handle click on 'breakpoint-icon'
        if (e.target === breakpointIcon) {
            if (breakpointIcon.getAttribute("break") === "false") {
                breakpointIcon.setAttribute("break", "true");
                breakpointIcon.classList.add("breakpoint-selected");
            } else {
                breakpointIcon.setAttribute("break", "false");
                breakpointIcon.classList.remove("breakpoint-selected");
            }

            window.dispatchEvent(this.app.manager.statechange);
        }
    }

    /**
     * Remove this operation from the recipe list
     *
     * @fires Manager#statechange
     */
    removeOperation() {
        this.remove();
        log.debug("Operation removed from recipe");
        window.dispatchEvent(this.app.manager.statechange);
        window.dispatchEvent(this.app.manager.operationremove);
    }

    /**
     * Build the ingredient list item
     *
     * @returns {HTMLElement}
     */
    build() {
        const li = document.createElement("li");
        li.classList.add("operation");
        li.setAttribute("data-name", this.name);

        const titleDiv = document.createElement("div");
        titleDiv.classList.add("op-title");
        titleDiv.innerText = this.name;

        const ingredientDiv = document.createElement("div");
        ingredientDiv.classList.add("ingredients");

        li.appendChild(titleDiv);
        li.appendChild(ingredientDiv);

        for (let i = 0; i < this.ingredients.length; i++) {
            ingredientDiv.innerHTML += (this.ingredients[i].toHtml());
        }

        const icons = this.buildIcons();

        const clearfixDiv = document.createElement("div");

        if (this.flowControl) {
            li.classList.add("flow-control-op");
        }

        if (this.manualBake && this.app.autoBake_) {
            this.manager.controls.setAutoBake(false);
            this.app.alert("Auto-Bake is disabled by default when using this operation.", 5000);
        }

        li.appendChild(icons);
        li.appendChild(clearfixDiv);

        this.appendChild(li);
    }

    /**
     * Build the icons ( disable and breakpoint / pause )
     *
     * @returns {HTMLElement}
     */
    buildIcons() {
        const div = document.createElement("div");
        div.classList.add("recipe-icons");

        const breakPointIcon = document.createElement("i");
        breakPointIcon.classList.add("material-icons");
        breakPointIcon.classList.add("breakpoint-icon");
        breakPointIcon.setAttribute("title", "Set breakpoint");
        breakPointIcon.setAttribute("break", "false");
        breakPointIcon.setAttribute("data-help-title", "Setting breakpoints");
        breakPointIcon.setAttribute("data-help", "Setting a breakpoint on an operation will cause execution of the Recipe to pause when it reaches that operation.");
        breakPointIcon.innerText = "pause";

        const disableIcon = document.createElement("i");
        disableIcon.classList.add("material-icons");
        disableIcon.classList.add("disable-icon");
        disableIcon.setAttribute("title", "Disable operation");
        disableIcon.setAttribute("disabled", "false");
        disableIcon.setAttribute("data-help-title", "Disabling operations");
        disableIcon.setAttribute("data-help", "Disabling an operation will prevent it from being executed when the Recipe is baked. Execution will skip over the disabled operation and continue with subsequent operations.");
        disableIcon.innerText = "not_interested";

        div.appendChild(breakPointIcon);
        div.appendChild(disableIcon);

        return div;
    }

    /**
     * Override native cloneNode method so we can clone c-recipe-li properly
     * with constructor arguments for sortable and cloneable lists. This function
     * is needed for the drag and drop functionality of the Sortable lists
     */
    cloneNode() {
        const { app, name, args } = this;
        return new CRecipeLi(app, name, args);
    }
}

customElements.define("c-recipe-li", CRecipeLi);
