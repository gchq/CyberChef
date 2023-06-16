/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLOperation from "../HTMLOperation.mjs";
import Sortable from "sortablejs";
import {fuzzyMatch, calcMatchRanges} from "../../core/lib/FuzzyMatch.mjs";
import {COperationLi} from "../components/c-operation-li.mjs";
import {CCategoryList} from "../components/c-category-list.mjs";
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
        this.removeIntent = false;
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
                searchResultsEl.dispatchEvent(this.manager.oplistcreate);
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
     * Handler for oplistcreate events.
     *
     * @listens Manager#oplistcreate
     * @param {Event} e
     */
    opListCreate(e) {
        if (this.app.isMobileView()) {
            $(document.querySelectorAll(".op-list .operation")).popover("disable");
        } else {
            $(document.querySelectorAll(".op-list .operation")).popover("enable");
            this.enableOpPopover(e.target);
            this.manager.recipe.createSortableSeedList(e.target);
        }
    }


    /**
     * Enable the target operation popover itself to gain focus which
     * enables scrolling and other interactions.
     *
     * @param {Element} el - The element to start selecting from
     */
    enableOpPopover(el) {
        $(el)
            .find("[data-toggle=popover]")
            .addBack("[data-toggle=popover]")
            .popover({trigger: "manual"})
            .on("mouseenter", function(e) {
                if (e.buttons > 0) return; // Mouse button held down - likely dragging an operation
                const _this = this;
                $(this).popover("show");
                $(".popover").on("mouseleave", function () {
                    $(_this).popover("hide");
                });
            }).on("mouseleave", function () {
                const _this = this;
                setTimeout(function() {
                    // Determine if the popover associated with this element is being hovered over
                    if ($(_this).data("bs.popover") &&
                        ($(_this).data("bs.popover").tip && !$($(_this).data("bs.popover").tip).is(":hover"))) {
                        $(_this).popover("hide");
                    }
                }, 50);
            });
    }


    /**
     * Handler for operation doubleclick events.
     * Adds the operation to the recipe and auto bakes.
     *
     * @param {Event} e
     */
    operationDblclick(e) {
        const li = e.target;
        this.manager.recipe.addOperation(li.getAttribute("data-name"));
    }


    /**
     * Handler for edit favourites click events.
     * Sets up the 'Edit favourites' pane and displays it.
     *
     // * @param {Event} e
     */
    editFavouritesClick() {
        // Get list of Favourite operation names
        const favCatConfig = this.app.categories.find(catConfig => catConfig.name === "Favourites");
        const div = document.getElementById("editable-favourites");

        if(favCatConfig !== undefined) {
            const opList = new COperationList(
                this.app,
                favCatConfig.ops,
                false,
                {
                    class: "remove-icon",
                    innerText: "delete"
                }
            )

            opList.build();

            div.appendChild(opList);
        }

        // this.removeIntent = false;
        //
        // const editableList = Sortable.create(ul, {
        //     filter: ".remove-icon",
        //     onFilter: function (evt) {
        //         const el = editableList.closest(evt.item);
        //         if (el && el.parentNode) {
        //             $(el).popover("dispose");
        //             el.parentNode.removeChild(el);
        //         }
        //     },
        //     onEnd: function(evt) {
        //         if (this.removeIntent) {
        //             $(evt.item).popover("dispose");
        //             evt.item.remove();
        //         }
        //     }.bind(this),
        // });
        //
        // Sortable.utils.on(ul, "dragleave", function() {
        //     this.removeIntent = true;
        // }.bind(this));
        //
        // Sortable.utils.on(ul, "dragover", function() {
        //     this.removeIntent = false;
        // }.bind(this));

        // if (!this.app.isMobileView()) {
        //     $("#editable-favourites [data-toggle=popover]").popover();
        // }
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

        this.app.updateFavourites(favourites);
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
     * e.g: the operations currently listed in the recipe-list and the appropriate
     * list items in operations-dropdown that need to have the 'selected' class added
     * or removed. Another use case is using the current 'Favourite' category op-list
     * as a source and handle the 'favourite' class on operations-dropdown op-lists
     * accordingly
     *
     * @param {string} srcListSelector - the UL element list to compare to
     * @param {string} className - the className to update
     */
    updateListItemsClasses(srcListSelector, className) {
        const listItems = document.querySelectorAll(`${srcListSelector} > li`);
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
     * Generic function to remove a class from target operation list item
     *
     * @param {string} opName - operation name through data-name attribute of the target operation
     * @param {string} className - the class to remove
     */
    removeClassFromOp(opName, className) {
        const ops = document.querySelectorAll(`c-operation-li > li.operation[data-name="${opName}"].${className}`);

        // the same operation may occur twice if it is also in #catFavourites
        ops.forEach((op) => {
            op.classList.remove(`${className}`);
        });
    }


    /**
     * Generic function to add a class to an operation list item
     *
     * @param {string} opName - operation name through data-name attribute of the target operation
     * @param {string} className - the class to add to the operation list item
     */
    addClassToOp(opName, className) {
        const ops = document.querySelectorAll(`c-operation-li > li.operation[data-name="${opName}"]`);

        // the same operation may occur twice if it is also in #catFavourites
        ops.forEach((op => {
            op.classList.add(`${className}`);
        }));
    }
}

export default OperationsWaiter;
