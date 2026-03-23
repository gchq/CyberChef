/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLOperation from "../HTMLOperation.mjs";
import Sortable from "sortablejs";
import {fuzzyMatch, calcMatchRanges} from "../../core/lib/FuzzyMatch.mjs";
import * as bootstrap from "bootstrap";


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
        this.removeIntent = false;
    }


    /**
     * Handler for search events.
     * Finds operations which match the given search term and displays them under the search box.
     *
     * @param {event} e
     */
    searchOperations(e) {
        let ops, selected;

        if (e.type === "search" || e.keyCode === 13) { // Search or Return
            e.preventDefault();
            ops = document.querySelectorAll("#search-results li");
            if (ops.length) {
                selected = this.getSelectedOp(ops);
                if (selected > -1) {
                    this.manager.recipe.addOperation(ops[selected].innerHTML);
                }
            }
        }

        if (e.keyCode === 40) { // Down
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
                    const existingPopover = bootstrap.Popover.getInstance(searchResultsEl.firstChild);
                    if (existingPopover) existingPopover.dispose();
                } catch (err) {}
                searchResultsEl.removeChild(searchResultsEl.firstChild);
            }

            document.querySelectorAll("#categories .show").forEach(el => {
                bootstrap.Collapse.getOrCreateInstance(el).hide();
            });
            if (str) {
                const matchedOps = this.filterOperations(str, true);
                const matchedOpsHtml = matchedOps
                    .map(v => v.toStubHtml())
                    .join("");

                searchResultsEl.innerHTML = matchedOpsHtml;
                searchResultsEl.dispatchEvent(this.manager.oplistcreate);
            }
        }
    }


    /**
     * Filters operations based on the search string and returns the matching ones.
     *
     * @param {string} searchStr
     * @param {boolean} highlight - Whether or not to highlight the matching string in the operation
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
     * Handler for oplistcreate events.
     *
     * @listens Manager#oplistcreate
     * @param {event} e
     */
    opListCreate(e) {
        this.manager.recipe.createSortableSeedList(e.target);

        // Populate ops total
        document.querySelector("#operations .title .op-count").innerText = Object.keys(this.app.operations).length;

        this.enableOpsListPopovers(e.target);
    }


    /**
     * Sets up popovers, allowing the popover itself to gain focus which enables scrolling
     * and other interactions.
     *
     * @param {Element} el - The element to start selecting from
     */
    enableOpsListPopovers(el) {
        // Collect elements: those inside el plus el itself if it matches
        const popoverEls = [];
        if (el.matches && el.matches("[data-bs-toggle=popover]")) {
            popoverEls.push(el);
        }
        el.querySelectorAll("[data-bs-toggle=popover]").forEach(e => popoverEls.push(e));

        popoverEls.forEach(popEl => {
            // Dispose any existing popover to avoid duplicates
            const existing = bootstrap.Popover.getInstance(popEl);
            if (existing) existing.dispose();

            const pop = new bootstrap.Popover(popEl, {trigger: "manual"});

            popEl.addEventListener("mouseenter", function(e) {
                if (e.buttons > 0) return; // Mouse button held down - likely dragging an operation
                pop.show();
                // When the popover tip is shown, attach a mouseleave handler to it
                const tip = pop.tip;
                if (tip) {
                    tip.addEventListener("mouseleave", function() {
                        pop.hide();
                    });
                }
            });

            popEl.addEventListener("mouseleave", function() {
                setTimeout(function() {
                    const tip = pop.tip;
                    if (tip && !tip.matches(":hover")) {
                        pop.hide();
                    }
                }, 50);
            });
        });
    }


    /**
     * Handler for operation doubleclick events.
     * Adds the operation to the recipe and auto bakes.
     *
     * @param {event} e
     */
    operationDblclick(e) {
        const li = e.target;

        this.manager.recipe.addOperation(li.textContent);
    }


    /**
     * Handler for edit favourites click events.
     * Sets up the 'Edit favourites' pane and displays it.
     *
     * @param {event} e
     */
    editFavouritesClick(e) {
        e.preventDefault();
        e.stopPropagation();

        // Add favourites to modal
        const favCat = this.app.categories.filter(function(c) {
            return c.name === "Favourites";
        })[0];

        let html = "";
        for (let i = 0; i < favCat.ops.length; i++) {
            const opName = favCat.ops[i];
            const operation = new HTMLOperation(opName, this.app.operations[opName], this.app, this.manager);
            html += operation.toStubHtml(true);
        }

        const editFavouritesList = document.getElementById("edit-favourites-list");
        editFavouritesList.innerHTML = html;
        this.removeIntent = false;

        const editableList = Sortable.create(editFavouritesList, {
            filter: ".remove-icon",
            onFilter: function (evt) {
                const el = editableList.closest(evt.item);
                if (el && el.parentNode) {
                    const pop = bootstrap.Popover.getInstance(el);
                    if (pop) pop.dispose();
                    el.parentNode.removeChild(el);
                }
            },
            onEnd: function(evt) {
                if (this.removeIntent) {
                    const pop = bootstrap.Popover.getInstance(evt.item);
                    if (pop) pop.dispose();
                    evt.item.remove();
                }
            }.bind(this),
        });

        Sortable.utils.on(editFavouritesList, "dragleave", function() {
            this.removeIntent = true;
        }.bind(this));

        Sortable.utils.on(editFavouritesList, "dragover", function() {
            this.removeIntent = false;
        }.bind(this));

        document.querySelectorAll("#edit-favourites-list [data-bs-toggle=popover]").forEach(el => {
            new bootstrap.Popover(el);
        });
        bootstrap.Modal.getOrCreateInstance(document.getElementById("favourites-modal")).show();
    }


    /**
     * Handler for save favourites click events.
     * Saves the selected favourites and reloads them.
     */
    saveFavouritesClick() {
        const favs = document.querySelectorAll("#edit-favourites-list li");
        const favouritesList = Array.from(favs, e => e.childNodes[0].textContent);

        this.app.saveFavourites(favouritesList);
        this.app.loadFavourites();
        this.app.populateOperationsList();
        this.manager.recipe.initialiseOperationDragNDrop();
    }


    /**
     * Handler for reset favourites click events.
     * Resets favourites to their defaults.
     */
    resetFavouritesClick() {
        this.app.resetFavourites();
    }


    /**
     * Sets whether operation counts are displayed next to a category title
     */
    setCatCount() {
        if (this.app.options.showCatCount) {
            document.querySelectorAll(".category-title .op-count").forEach(el => el.classList.remove("hidden"));
        } else {
            document.querySelectorAll(".category-title .op-count").forEach(el => el.classList.add("hidden"));
        }
    }

}

export default OperationsWaiter;
