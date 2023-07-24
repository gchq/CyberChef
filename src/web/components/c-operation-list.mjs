import {COperationLi} from "./c-operation-li.mjs";
import Sortable from "sortablejs";

/**
 * c(ustom element)-operation-list
 *
 * @param {App} app - The main view object for CyberChef
 * @param {string[]} opNames - A list of operation names
 * @param {boolean} includeStarIcon - optionally add the 'star' icon to the left of the operation
 * @param {Object} icon ( { class: string, innerText: string } ). check-icon by default
 */
export class COperationList extends HTMLElement {
    constructor(
        app,
        opNames,
        includeStarIcon,
        icon,
        isSortable = false
    ) {
        super();

        this.app = app;
        this.opNames = opNames;
        this.includeStarIcon = includeStarIcon;
        this.icon = icon;
        this.isSortable = isSortable;
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

        if (this.isSortable) {
            const sortableList = Sortable.create(ul, {
                group: "sorting",
                sort: true,
                draggable: "c-operation-li",
                onFilter: function (e) {
                    const el = sortableList.closest(e.item);
                    if (el && el.parentNode) {
                        $(el).popover("dispose");
                        el.parentNode.removeChild(el);
                    }
                },
                onEnd: function(e) {
                    if (this.removeIntent) {
                        $(e.item).popover("dispose");
                        e.item.remove();
                    }
                }.bind(this),
            });
        }

        ul.dispatchEvent(this.app.manager.oplistcreate);

        this.append(ul);
    }
}

customElements.define("c-operation-list", COperationList);
