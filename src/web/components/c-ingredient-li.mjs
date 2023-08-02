import Utils from "../../core/Utils.mjs";
import HTMLIngredient from "../HTMLIngredient.mjs";

export class CIngredientLi extends HTMLElement {
    constructor(app, name, args) {
        super();

        this.app = app;
        this.name = name;
        this.args = [];

        for (let i = 0; i < args.length; i++) {
            const ing = new HTMLIngredient(args[i], this.app, this.app.manager);
            this.args.push(ing);
        }

        this.build();
    }

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
        li.appendChild(ingredientDiv)

        for (let i = 0; i < this.args.length; i++) {
            ingredientDiv.innerHTML += (this.args[i].toHtml());
        }

        const iconsDiv = document.createElement("div");
        iconsDiv.classList.add("recipe-icons");

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

        iconsDiv.appendChild(breakPointIcon);
        iconsDiv.appendChild(disableIcon);

        const clearfixDiv = document.createElement("div");

        li.appendChild(iconsDiv);
        li.appendChild(clearfixDiv);

        this.appendChild(li);
    }
}

customElements.define("c-ingredient-li", CIngredientLi);
