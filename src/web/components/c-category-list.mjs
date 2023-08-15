import {CCategoryLi} from "./c-category-li.mjs";

/**
 * c(ustom element)-category-list
 */
export class CCategoryList extends HTMLElement {
    /**
     * @param {App} app - The main view object for CyberChef
     * @param {CatConf[]} categories - The list of categories and operations to be populated.
     * @param {OpConfig[]} operations - A list of operation configuration objects.
     * @param {Boolean} includeOpLiStarIcon - Include the left side 'star' icon to each of the c-category-li >
     * c-operation-list > c-operation-li list items in this c-category-list
     */
    constructor(
        app,
        categories,
        operations,
        includeOpLiStarIcon
    ) {
        super();

        this.app = app;
        this.categories = categories;
        this.operations = operations;
        this.includeOpLiStarIcon = includeOpLiStarIcon;

        this.build();
    }

    /**
     * Build c-category-list
     *
     * @returns {HTMLElement}
     */
    build() {
        const ul = document.createElement("ul");

        this.categories.forEach((category, index) => {
            const cat = new CCategoryLi(
                this.app,
                category,
                this.operations,
                index === 0,
                this.includeOpLiStarIcon
            );
            ul.appendChild(cat);
        });

        this.append(ul);
    }
}

customElements.define("c-category-list", CCategoryList);
