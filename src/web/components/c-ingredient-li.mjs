import HTMLIngredient from "../HTMLIngredient.mjs";

/**
 * c(ustom element)-ingredient-li ( list item ).
 *
 * Note: This is the #recipe-list list item component, not to be confused with HTMLIngredient which make up the smaller
 * components of this list item. It would be good to eventually fuse that code into this component or alternatively, to
 * turn that into a separate native web component .
 */
export class CIngredientLi extends HTMLElement {
    /**
     * @param {App} app - The main view object for CyberChef
     * @param {string} name - The operation ( or aka ingredient- in this context ) name
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
        this.args = [];

        for (let i = 0; i < args.length; i++) {
            const ing = new HTMLIngredient(args[i], this.app, this.app.manager);
            this.args.push(ing);
        }

        this.build();

        this.addEventListener("dblclick", this.handleDoubleClick.bind(this));
    }

    cloneNode() {
        const { app, name, args } = this;
        return new CIngredientLi( app, name, args );
    }

    /**
     * Remove listeners on disconnectedCallback
     */
    disconnectedCallback() {
        this.removeEventListener("dblclick", this.handleDoubleClick.bind(this));
    }

    /**
     * Handle double click
     * @param {Event} e
     */
    handleDoubleClick(e) {
        // do not remove if icons or form elements are double clicked
        if (e.target === this.querySelector("li") || e.target === this.querySelector("div.op-title")) {
            this.remove();
        }
    }

    /**
     * Build the ingredient list item
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

        for (let i = 0; i < this.args.length; i++) {
            ingredientDiv.innerHTML += (this.args[i].toHtml());
        }

        const icons = this.buildIcons();

        const clearfixDiv = document.createElement("div");

        li.appendChild(icons);
        li.appendChild(clearfixDiv);

        this.appendChild(li);
    }

    /**
     * Build the icons ( disable and breakpoint / pause )
     */
    buildIcons() {
        const div = document.createElement("div");
        div.classList.add("recipe-icons");

        const breakPointIcon = document.createElement("i");
        breakPointIcon.classList.add("material-icons");
        breakPointIcon.classList.add("breakpoint");
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
}

customElements.define("c-ingredient-li", CIngredientLi);
