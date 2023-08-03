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
        isSortable = false,
        isCloneable = true,
        icon
    ) {
        super();

        this.app = app;
        this.opNames = opNames;
        this.includeStarIcon = includeStarIcon;
        this.isSortable = isSortable;
        this.isCloneable = isCloneable;
        this.icon = icon;
    }

    /**
     * Build c-operation-list
     */
    build() {
        const ul =  document.createElement("ul");
        ul.classList.add("op-list");

        this.opNames.forEach((opName => {
            const cOpLi = new COperationLi(
                this.app,
                opName,
                {
                    class: this.icon ? this.icon.class : "check-icon",
                    innerText: this.icon ? this.icon.innerText : "check"
                },
                this.includeStarIcon
            );

            ul.appendChild(cOpLi);
        }))

        if (this.isSortable) {
            this.createSortableList(ul);
        } else if (!this.app.isMobileView() && this.isCloneable) {
            this.createCloneableList(ul, "recipe", "rec-list"); // target name and id can be component params if needed to make it reusable
        }

        this.append(ul);
    }

    /**
     * Create a sortable ( not cloneable ) list
     *
     * @param { HTMLElement } ul
     * */
    createSortableList(ul) {
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
                if (this.app.manager.recipe.removeIntent) {
                    $(e.item).popover("dispose");
                    e.item.remove();
                }
            }.bind(this),
        });
    }

    /**
     * Create a cloneable ( not sortable ) list
     *
     * @param { HTMLElement } ul
     * @param { string } targetListName
     * @param { string } targetListId
     * */
    createCloneableList(ul, targetListName, targetListId) {
        Sortable.create(ul, {
            group: {
                name: targetListName,
                pull: "clone",
                put: false,
            },
            draggable: "c-operation-li",
            sort: false,
            setData: function(dataTransfer, dragEl) {
                dataTransfer.setData("Text", dragEl.querySelector("li").getAttribute("data-name"));
            },
            onStart: function(e) {
                // Removes popover element and event bindings from the dragged operation but not the
                // event bindings from the one left in the operations list. Without manually removing
                // these bindings, we cannot re-initialise the popover on the stub operation.
                $(e.item)
                    .popover("dispose")
                    .removeData("bs.popover")
                    .off("mouseenter")
                    .off("mouseleave")
                    .attr("data-toggle", "popover-disabled");
                $(e.clone)
                    .off(".popover")
                    .removeData("bs.popover");
            },
            onEnd: ({item}) => {
                if (item.parentNode.id === targetListId) {
                    this.app.manager.recipe.addOperation(item.name);
                    item.remove();
                }
            }
        });
    }
}

customElements.define("c-operation-list", COperationList);
