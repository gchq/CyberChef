/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLOperation from "../HTMLOperation.mjs";
import {fuzzyMatch, calcMatchRanges} from "../../core/lib/FuzzyMatch.mjs";
import {COperationList} from "../components/c-operation-list.mjs";

/**
 * Waiter to handle events related to the operations.
 */
class OperationsWaiter {

    /**
     * OperationsWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.options = {};
    }


    /**
     * Handler for search events.
     * Finds operations which match the given search term and displays them under the search box.
     *
     * @param {Event} e
     */
    searchOperations(e) {
        let ops, selected;

        if (e.type === "keyup") {
            const searchResults = document.getElementById("search-results");

            this.openOpsDropdown();

            if (e.target.value.length !== 0) {
                this.app.setElementVisibility(searchResults, true);
            }
        }

        if (e.type === "search" || e.keyCode === 13) { // Search or Return
            e.preventDefault();
            ops = document.querySelectorAll("#search-results li");
            if (ops.length) {
                selected = this.getSelectedOp(ops);
                if (selected > -1) {
                    this.manager.recipe.addOperation(ops[selected].getAttribute("data-name"));
                }
            }
        }

        if (e.type === "click" && !e.target.value.length) {
            this.openOpsDropdown();
        } else if (e.keyCode === 27) { // Escape
            this.closeOpsDropdown();
        } else if (e.keyCode === 40) { // Down
            e.preventDefault();
            ops = document.querySelectorAll("#search-results li");
            if (ops.length) {
                selected = this.getSelectedOp(ops);
                if (selected > -1) {
                    ops[selected].classList.remove("selected-op");
                }
                if (selected === ops.length-1) selected = -1;
                ops[selected+1].classList.add("selected-op");
            }
        } else if (e.keyCode === 38) { // Up
            e.preventDefault();
            ops = document.querySelectorAll("#search-results li");
            if (ops.length) {
                selected = this.getSelectedOp(ops);
                if (selected > -1) {
                    ops[selected].classList.remove("selected-op");
                }
                if (selected === 0) selected = ops.length;
                ops[selected-1].classList.add("selected-op");
            }
        } else {
            const searchResultsEl = document.getElementById("search-results");
            const el = e.target;
            const str = el.value;

            while (searchResultsEl.firstChild) {
                try {
                    $(searchResultsEl.firstChild).popover("dispose");
                } catch (err) {}
                searchResultsEl.removeChild(searchResultsEl.firstChild);
            }

            $("#categories .show").collapse("hide");
            if (str) {
                const matchedOps = this.filterOperations(str, true);
                const matchedOpsHtml = matchedOps
                    .map(v => v.toStubHtml())
                    .join("");

                searchResultsEl.innerHTML = matchedOpsHtml;
            }

            this.manager.ops.updateListItemsClasses("#rec-list", "selected");
        }
    }


    /**
     * Filters operations based on the search string and returns the matching ones.
     *
     * @param {string} searchStr
     * @param {boolean} highlight - Whether to highlight the matching string in the operation
     *   name and description
     * @returns {string[]}
     */
    filterOperations(inStr, highlight) {
        const matchedOps = [];
        const matchedDescs = [];

        // Create version with no whitespace for the fuzzy match
        // Helps avoid missing matches e.g. query "TCP " would not find "Parse TCP"
        const inStrNWS = inStr.replace(/\s/g, "");

        for (const opName in this.app.operations) {
            const op = this.app.operations[opName];

            // Match op name using fuzzy match
            const [nameMatch, score, idxs] = fuzzyMatch(inStrNWS, opName);

            // Match description based on exact match
            const descPos = op.description.toLowerCase().indexOf(inStr.toLowerCase());

            if (nameMatch || descPos >= 0) {
                const operation = new HTMLOperation(opName, this.app.operations[opName], this.app, this.manager);

                if (highlight) {
                    operation.highlightSearchStrings(calcMatchRanges(idxs), [[descPos, inStr.length]]);
                }

                if (nameMatch) {
                    matchedOps.push([operation, score]);
                } else {
                    matchedDescs.push(operation);
                }
            }
        }

        // Sort matched operations based on fuzzy score
        matchedOps.sort((a, b) => b[1] - a[1]);

        return matchedOps.map(a => a[0]).concat(matchedDescs);
    }


    /**
     * Finds the operation which has been selected using keyboard shortcuts. This will have the class
     * 'selected-op' set. Returns the index of the operation within the given list.
     *
     * @param {element[]} ops
     * @returns {number}
     */
    getSelectedOp(ops) {
        for (let i = 0; i < ops.length; i++) {
            if (ops[i].classList.contains("selected-op")) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Handler for edit favourites click events.
     * Sets up the 'Edit favourites' pane and displays it.
     *
     * @param {Event} e
     */
    editFavouritesClick(e) {
        const div = document.getElementById("editable-favourites");

        // Remove c-operation-list if there already was one
        if (div.querySelector("c-operation-list")) {
            div.removeChild(div.querySelector("c-operation-list"));
        }

        // Get list of Favourite operation names
        const favCatConfig = this.app.categories.find(catConfig => catConfig.name === "Favourites");

        if(favCatConfig !== undefined) {
            const opList = new COperationList(
                this.app,
                favCatConfig.ops,
                false,
                true,
                false,
                {
                    class: "remove-icon",
                    innerText: "delete"
                },
            )

            opList.build();
            div.appendChild(opList);
        }

        if (!this.app.isMobileView()) {
            $("#editable-favourites [data-toggle=popover]").popover();
        }

        $("#favourites-modal").modal();
    }


    /**
     * Open operations dropdown
     */
    openOpsDropdown() {
        // the 'close' ( dropdown ) icon in Operations component mobile UI
        const closeOpsDropdownIcon = document.getElementById("close-ops-dropdown-icon");
        const categories = document.getElementById("categories");

        this.app.setElementVisibility(categories, true);
        this.app.setElementVisibility(closeOpsDropdownIcon, true);
    }


    /**
     * Hide any operation lists ( #categories or #search-results ) and the close-operations-dropdown
     * icon itself, clear any search input
     */
    closeOpsDropdown() {
        const search = document.getElementById("search");

        // if any input remains in #search, clear it
        if (search.value.length) {
            search.value = "";
        }

        this.app.setElementVisibility(document.getElementById("categories"), false);
        this.app.setElementVisibility(document.getElementById("search-results"), false);
        this.app.setElementVisibility(document.getElementById("close-ops-dropdown-icon"), false);
    }

    /**
     * Handler for save favourites click events.
     * Saves the selected favourites and reloads them.
     */
    saveFavouritesClick() {
        const listItems = document.querySelectorAll("#editable-favourites c-operation-li > li");
        const favourites = Array.from(listItems, li => li.getAttribute("data-name"));

        this.app.updateFavourites(favourites, true);
    }


    /**
     * Handler for reset favourites click events.
     * Resets favourites to their defaults.
     */
    resetFavouritesClick() {
        this.app.resetFavourites();
    }


    /**
     * Update classes in the #dropdown-operations op-lists based on the
     * list items of a srcListSelector.
     *
     * e.g: update all list items to add or remove the 'selected' class based on the operations
     * in the current recipe-list, or 'favourite' classes on the current list of favourites.
     *
     * @param {string} srcListSelector - the UL element list to compare to
     * @param {string} className - the className to update
     */
    updateListItemsClasses(srcListSelector, className) {
        const listItems = document.querySelectorAll(`${srcListSelector} li`);
        const ops =  document.querySelectorAll("c-operation-li > li.operation");

        this.removeClassFromOps(className);

        if (listItems.length !== 0) {
            listItems.forEach((item => {
                const targetDataName = item.getAttribute("data-name");

                ops.forEach((op) => {
                    if (targetDataName === op.getAttribute("data-name")) {
                        this.addClassToOp(targetDataName, className);
                    }
                });
            }));
        }
    }

    /**
     * Generic function to remove a class from > ALL < operation list items
     *
     * @param {string} className  - the class to remove
     */
    removeClassFromOps(className) {
        const ops = document.querySelectorAll("c-operation-li > li.operation");

        ops.forEach((op => {
            this.removeClassFromOp(op.getAttribute("data-name"), className);
        }));
    }


    /**
     * Generic function to remove a class from target operation list item. This operation li may occur twice ( when the op is in
     * 'favourites' and in the category for instance )
     *
     * @param {string} opName - operation name through data-name attribute of the target operation
     * @param {string} className - the class to remove
     */
    removeClassFromOp(opName, className) {
        const ops = document.querySelectorAll(`c-operation-li > li.operation[data-name="${opName}"].${className}`);

        ops.forEach((op) => {
            op.classList.remove(`${className}`);
        });
    }


    /**
     * Generic function to add a class to a specific operation. This operation li may occur twice ( when the op is in
     * 'favourites' and in the category for instance )
     *
     * @param {string} opName - operation name through data-name attribute of the target operation
     * @param {string} className - the class to add to the operation list item
     */
    addClassToOp(opName, className) {
        const ops = document.querySelectorAll(`c-operation-li > li.operation[data-name="${opName}"]`);

        ops.forEach((op => {
            op.classList.add(`${className}`);
        }));
    }
}

export default OperationsWaiter;
