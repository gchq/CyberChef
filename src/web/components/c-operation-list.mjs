import {COperationLi} from "./c-operation-li.mjs";
import Sortable from "sortablejs";

/**
 * c(ustom element)-operation-list
 */
export class COperationList extends HTMLElement {
    /**
     * @param {App} app - The main view object for CyberChef
     * @param {[string, number[]]} operations - A list of operation names and indexes of characters to highlight
     * @param {Boolean} includeStarIcon - Include the left side 'star' icon to each of the c-category-li >
     * c-operation-list > c-operation-li list items in this c-category-list
     * @param {Boolean} isSortable - List items may be sorted ( reordered ). False by default
     * @param {Boolean} isCloneable - List items are cloneable to a target list. True by default
     * @param {Object} icon ( { class: string, innerText: string } ). 'check-icon' by default
     */
    constructor(
        app,
        operations,
        includeStarIcon,
        isSortable = false,
        isCloneable = true,
        icon
    ) {
        super();

        this.app = app;
        this.operations = operations;
        this.includeStarIcon = includeStarIcon;
        this.isSortable = isSortable;
        this.isCloneable = isCloneable;
        this.icon = icon;

        this.build();

        window.addEventListener("operationadd", this.handleChange.bind(this));
        window.addEventListener("operationremove", this.handleChange.bind(this));
        window.addEventListener("favouritesupdate", this.handleChange.bind(this));
    }

    /**
     * Remove listeners on disconnectedCallback
     */
    disconnectedCallback() {
        this.removeEventListener("operationadd", this.handleChange.bind(this));
        this.removeEventListener("operationremove", this.handleChange.bind(this));
        this.removeEventListener("favouritesupdate", this.handleChange.bind(this));
    }

    /**
     * Handle change
     * Fires on custom operationadd, operationremove, favouritesupdate events
     */
    handleChange() {
        this.updateListItemsClasses("#catFavourites c-operation-list ul", "favourite");
        this.updateListItemsClasses("#rec-list", "selected");
    }

    /**
     * Build c-operation-list
     *
     * @returns {HTMLElement}
     */
    build() {
        const ul =  document.createElement("ul");
        ul.classList.add("op-list");

        this.operations.forEach((([opName, charIndicesToHighlight]) => {
            const cOpLi = new COperationLi(
                this.app,
                opName,
                {
                    class: this.icon ? this.icon.class : "check-icon",
                    innerText: this.icon ? this.icon.innerText : "check"
                },
                this.includeStarIcon,
                charIndicesToHighlight
            );

            ul.appendChild(cOpLi);
        }));

        if (this.isSortable) {
            this.createSortableList(ul);
        } else if (!this.app.isMobileView() && this.isCloneable) {
            this.createCloneableList(ul, "recipe", "rec-list");
        }

        this.append(ul);
    }

    /**
     * Create a sortable ( but not cloneable ) list
     *
     * @param { HTMLElement } ul
     * */
    createSortableList(ul) {
        const sortableList = Sortable.create(ul, {
            group: "sorting",
            sort: true,
            draggable: "c-operation-li",
            filter: "i.material-icons",
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
        let dragOverRecList = false;
        const recList = document.querySelector(`#${targetListId}`);

        Sortable.utils.on(recList, "dragover", function () {
            dragOverRecList = true;
        });

        Sortable.utils.on(recList, "dragleave", function () {
            dragOverRecList = false;
        });

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
                    .find("[data-toggle=popover]")
                    .popover("dispose");
                $(e.clone)
                    .find("[data-toggle=popover]")
                    .off(".popover")
                    .removeData("bs.popover");
            },
            onEnd: ({item, to, newIndex }) => {
                if (item.parentNode.id === targetListId && dragOverRecList) {
                    this.app.manager.recipe.addOperation(item.querySelector("li").getAttribute("data-name"), newIndex);
                    item.remove();
                } else if (!dragOverRecList && !to.classList.contains("op-list")) {
                    item.remove();
                }
            }
        });
    }

    /**
     * Update classes ( className ) on the li.operation elements in this list, based on the current state of a
     * list of choice ( srcListSelector )
     *
     * @param {string} srcListSelector - the selector of the UL that we want to use as source of truth
     * @param {string} className - the className to update
     */
    updateListItemsClasses(srcListSelector, className) {
        const srcListItems= document.querySelectorAll(`${srcListSelector} li`);
        const listItems =  this.querySelectorAll("c-operation-li li.operation");

        listItems.forEach((li => {
            if (li.classList.contains(`${className}`)) {
                li.classList.remove(`${className}`);
            }
        }));

        if (srcListItems.length !== 0) {
            srcListItems.forEach((item => {
                const targetDataName = item.getAttribute("data-name");

                listItems.forEach((listItem) => {
                    if (targetDataName === listItem.getAttribute("data-name")) {
                        listItem.classList.add(`${className}`);
                    }
                });
            }));
        }
    }
}

customElements.define("c-operation-list", COperationList);
