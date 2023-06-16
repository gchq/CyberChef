import {COperationLi} from "./c-operation-li.mjs";

/**
 * c(ustom element)-category-li ( list item )
 *
 * @param {App} app - The main view object for CyberChef
 * @param {CatConf} category - The category and operations to be populated.
 * @param {Object.<string, OpConf>} operations - The list of operation configuration objects.
 * @param {Boolean} isExpanded - expand the category on init or not
 * */
export class CCategoryLi extends HTMLElement {
    constructor(
        app,
        category,
        operations,
        isExpanded
    ) {
        super();

        this.app = app;
        this.category = category;
        this.operations = operations;
        this.label = category.name;
        this.isExpanded = isExpanded;

        this.build();

        this.addEventListener("click", this.handleClick.bind(this));
    }

    // /**
    //  * Handle click
    //  *
    //  * @param {Event} e
    //  */
    // handleClick(e) {
    //     if (e.target === this.querySelector("button")) {
    //         // todo back to this "hitbox" issue w the icon inside the button
    //         this.app.manager.ops.editFavouritesClick(e);
    //     }
    // }

    /**
     * Build the li element
     */
    buildListItem() {
        const li = document.createElement("li");

        li.classList.add("panel");
        li.classList.add("category");

        return li;
    };

    /**
     * Build the anchor element
     */
    buildAnchor() {
        const a = document.createElement("a");

        a.classList.add("category-title");

        a.setAttribute("data-toggle", "collapse");
        a.setAttribute("data-target", `#${"cat" + this.label.replace(/[\s/\-:_]/g, "")}`);

        a.innerText = this.label;

        if (this.label === "Favourites"){
            const editFavouritesButton = this.buildEditFavourites(a);

            a.setAttribute("data-help-title", "Favourite operations");
            a.setAttribute("data-help", `<p>This category displays your favourite operations.</p>
            <ul>
                <li><b>To add:</b> Click on the star icon of an operation or drag an operation over the Favourites category on desktop devices</li>
                <li><b>To reorder:</b> Click on the 'Edit favourites' button and drag operations up and down in the list provided</li>
                <li><b>To remove:</b> Click on the 'Edit favourites' button and hit the delete button next to the operation you want to remove</li>
            </ul>`);

            a.appendChild(editFavouritesButton);
        }

        return a;
    };

    /**
     * Build the collapsable panel that contains the op-list for this category
     */
    buildCollapsablePanel(){
        const div = document.createElement("div");

        div.setAttribute("id", `${"cat" + this.label.replace(/[\s/\-:_]/g, "")}`);
        div.setAttribute("data-parent", "#categories");

        div.classList.add("panel-collapse");
        div.classList.add("collapse");

        if (this.isExpanded) {
            div.classList.add("show");
        }

        return div;
    };

    /**
     * Build the op-list for this category
     *
     * @param {string[]} opNames
     */
    buildOperationList(opNames) {
        return opNames.map(opName => {
            if (!(opName in this.operations)) {
                log.warn(`${opName} could not be found.`);
                return;
            }

            return new COperationLi(
                this.app,
                opName,
                {
                    class: "check-icon",
                    innerText: "check"
                },
                this.operations[opName]
            );
        });
    }

    /**
     * Build c-category-li and dispatch event oplistcreate
     */
    build() {
        const ul = document.createElement("ul");
        ul.classList.add("op-list");

        const li = this.buildListItem();
        const a = this.buildAnchor();
        const div = this.buildCollapsablePanel();

        li.appendChild(a);
        li.appendChild(div);
        div.appendChild(ul);
        this.appendChild(li);

        this.buildOperationList(this.category.ops).forEach(operationListItem =>
            ul.appendChild(operationListItem)
        );

        ul.dispatchEvent(this.app.manager.oplistcreate);
    }

    /**
     * Append a c-operation-li to this op-list
     *
     * @param {HTMLElement} cOperationLiElement
     */
    appendOperation(cOperationLiElement) {
        this.querySelector('li > div > ul').appendChild(cOperationLiElement);
    }

    /**
     *  If this category is Favourites, build and return the star icon to the category
     */
    buildEditFavourites() {
        const button = document.createElement("button");
        const icon = document.createElement("i");

        button.setAttribute("id", "edit-favourites");
        button.setAttribute("type", "button");
        button.setAttribute("data-toggle", "tooltip");
        button.setAttribute("title", "Edit favourites");
        button.classList.add("btn");
        button.classList.add("btn-warning");
        button.classList.add("bmd-btn-icon");

        icon.classList.add("material-icons");
        icon.innerText = "star";

        button.appendChild(icon);

        return button;
    }
}

customElements.define("c-category-li", CCategoryLi);
