import {COperationLi} from "./c-operation-li.mjs";

/**
 * c(ustom element)-operation-list
 *
 * @param {App} app - The main view object for CyberChef
 * @param {string[]} opNames - A list of operation names
 * @param {boolean} includeStarIcon - optionally add the 'star' icon to the left of the operation
 * @param {Object} icon ( { class: string, innerText: string } ). check-icon by default
 */
export class COperationList extends HTMLElement {
    constructor(app, opNames, includeStarIcon, icon) {
        super();

        this.app = app;
        this.opNames = opNames;
        this.includeStarIcon = includeStarIcon;
        this.icon = icon;
    }

    /**
     * Build c-operation-list
     */
    build() {
        const ul =  document.createElement("ul");
        ul.classList.add("op-list");

        this.opNames.forEach((opName => {
            const li = new COperationLi(
                this.app,
                opName,
                {
                    class: this.icon ? this.icon.class : "check-icon",
                    innerText: this.icon ? this.icon.innerText : "check"
                },
                this.includeStarIcon
            );

            ul.appendChild(li);
        }))

        ul.dispatchEvent(this.app.manager.oplistcreate);

        this.append(ul);
    }
}

customElements.define("c-operation-list", COperationList);
