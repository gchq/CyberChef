/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

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
        let ops, focused;
        if (e.type === "keyup") {
            const searchResults = document.getElementById("search-results");

            this.openOpsDropdown();

            if (e.target.value.length !== 0) {
                this.app.setElementVisibility(searchResults, true);
            }
        }

        if (e.key === "Enter") { // Search or Return ( enter )
            e.preventDefault();
            ops = document.querySelectorAll("#search-results c-operation-list c-operation-li li");
            if (ops.length) {
                focused = this.getFocusedOp(ops);
                if (focused > -1) {
                    this.manager.recipe.addOperation(ops[focused].getAttribute("data-name"));
                }
            }
        }

        if (e.type === "click" && !e.target.value.length) {
            this.openOpsDropdown();
        } else if (e.key === "Escape") { // Escape
            this.closeOpsDropdown();
        } else if (e.key === "ArrowDown") { // Down
            e.preventDefault();
            ops = document.querySelectorAll("#search-results c-operation-list c-operation-li li");
            if (ops.length) {
                focused = this.getFocusedOp(ops);
                if (focused > -1) {
                    ops[focused].classList.remove("focused-op");
                }
                if (focused === ops.length-1) focused = -1;
                ops[focused+1].classList.add("focused-op");
            }
        } else if (e.key === "ArrowUp") { // Up
            e.preventDefault();
            ops = document.querySelectorAll("#search-results c-operation-list c-operation-li li");
            if (ops.length) {
                focused = this.getFocusedOp(ops);
                if (focused > -1) {
                    ops[focused].classList.remove("focused-op");
                }
                if (focused === 0) focused = ops.length;
                ops[focused-1].classList.add("focused-op");
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

                const cOpList = new COperationList(
                    this.app,
                    matchedOps,
                    true,
                    false,
                    true,
                    {
                        class: "check-icon",
                        innerText: "check"
                    }
                );

                searchResultsEl.append(cOpList);
            }
        }
    }


    /**
     * Filters operations based on the search string and returns the matching ones.
     *
     * @param {string} searchStr
     * @param {boolean} highlight - Whether to highlight the matching string in the operation
     *   name and description
     * @returns {[[string, number[]]]}
     */
    filterOperations(searchStr, highlight) {
        const matchedOps = [];
        const matchedDescs = [];

        // Create version with no whitespace for the fuzzy match
        // Helps avoid missing matches e.g. query "TCP " would not find "Parse TCP"
        const inStrNWS = searchStr.replace(/\s/g, "");

        for (const opName in this.app.operations) {
            const op = this.app.operations[opName];

            // Match op name using fuzzy match
            const [nameMatch, score, idxs] = fuzzyMatch(inStrNWS, opName);

            // Match description based on exact match
            const descPos = op.description.toLowerCase().indexOf(searchStr.toLowerCase());

            if (nameMatch || descPos >= 0) {
                if (nameMatch) {
                    matchedOps.push([[opName, calcMatchRanges(idxs)], score]);
                } else {
                    matchedDescs.push([opName]);
                }
            }
        }

        // Sort matched operations based on fuzzy score
        matchedOps.sort((a, b) => b[1] - a[1]);

        return matchedOps.map(a => a[0]).concat(matchedDescs);
    }


    /**
     * Finds the operation which has been focused on using keyboard shortcuts. This will have the class
     * 'focused-op' set. Returns the index of the operation within the given list.
     *
     * @param {element[]} ops
     * @returns {number}
     */
    getFocusedOp(ops) {
        for (let i = 0; i < ops.length; i++) {
            if (ops[i].classList.contains("focused-op")) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Handler for edit favourites click events.
     * Displays the 'Edit favourites' modal and handles the c-operation-list in the modal
     *
     * @param {Event} e
     */
    editFavouritesClick(e) {
        const div = document.getElementById("editable-favourites");

        // First remove the existing c-operation-list if there already was one
        if (div.querySelector("c-operation-list")) {
            div.removeChild(div.querySelector("c-operation-list"));
        }

        // Get list of Favourite operation names
        const favCatConfig = this.app.categories.find(catConfig => catConfig.name === "Favourites");

        if (favCatConfig !== undefined) {
            const opList = new COperationList(
                this.app,
                favCatConfig.ops.map(op => [op]),
                false,
                true,
                false,
                {
                    class: "remove-icon",
                    innerText: "delete"
                },
            );

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
}

export default OperationsWaiter;
