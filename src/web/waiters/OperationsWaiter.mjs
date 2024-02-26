/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLOperation from "../HTMLOperation.mjs";
import Sortable from "sortablejs";
import {fuzzyMatch, calcMatchRanges} from "../../core/lib/FuzzyMatch.mjs";


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
        this.enableOpsListPopovers(e.target);
    }


    /**
     * Sets up popovers, allowing the popover itself to gain focus which enables scrolling
     * and other interactions.
     *
     * @param {Element} el - The element to start selecting from
     */
    enableOpsListPopovers(el) {
        $(el).find("[data-toggle=popover]").addBack("[data-toggle=popover]")
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
        const editFavouritesListElements = editFavouritesList.getElementsByTagName("li");
        editFavouritesList.innerHTML = html;
        this.removeIntent = false;

        for (let i = 0; i < editFavouritesListElements.length; i++) {
            editFavouritesListElements[i].setAttribute("tabindex", "0");
            editFavouritesListElements[i].addEventListener("keydown", this.ArrowNavFavourites.bind(this), false);
            editFavouritesListElements[i].firstElementChild.addEventListener("keydown", this.deleteFavourite.bind(this), false);
        }

        const editableList = Sortable.create(editFavouritesList, {
            filter: ".remove-icon",
            onFilter: function (evt) {
                const el = editableList.closest(evt.item);
                if (el && el.parentNode) {
                    $(el).popover("dispose");
                    el.parentNode.removeChild(el);
                }
            },
            onEnd: function(evt) {
                if (this.removeIntent) {
                    $(evt.item).popover("dispose");
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

        $("#edit-favourites-list [data-toggle=popover]").popover();
        $("#favourites-modal").modal();
    }


    /**
     * Handler for navigation key press events.
     * Navigates through the favourites list and corresponding delete buttons.
     * Move favourites elements up and down with Ctrl + Arrow keys to imite drag and drop mouse functionality.
     */
    ArrowNavFavourites(event) {
        const currentElement = event.target;
        const nextElement = currentElement.nextElementSibling;
        const prevElement = currentElement.previousElementSibling;
        const favouritesList = currentElement.parentNode;

        event.preventDefault();
        event.stopPropagation();
        if (event.key === "ArrowDown" && !event.ctrlKey) {
            if (nextElement === null) {
                currentElement.parentElement.firstElementChild.focus();
            } else {
                nextElement.focus();
            }
        } else if (event.key === "ArrowUp" && !event.ctrlKey) {
            if (prevElement === null) {
                currentElement.parentElement.lastElementChild.focus();
            } else {
                prevElement.focus();
            }
        } else if (event.key === "Tab") {
            currentElement.parentElement.closest(".modal-body").nextElementSibling.getElementsByTagName("Button")[0].focus();
        } else if (event.key === "ArrowRight") {
            if (currentElement.firstElementChild !== null) {
                currentElement.firstElementChild.focus();
            }
        } else if (event.key === "ArrowLeft" && (currentElement.classList.contains("remove-icon"))) {
            currentElement.parentElement.focus();
        } else if (event.ctrlKey && event.key === "ArrowDown") {
            if (nextElement === null) {
                favouritesList.insertBefore(currentElement, currentElement.parentElement.firstElementChild);
            } else {
                favouritesList.insertBefore(currentElement, nextElement.nextElementSibling);
            }
            currentElement.focus();
        } else if (event.ctrlKey && event.key === "ArrowUp") {
            favouritesList.insertBefore(currentElement, prevElement);
            currentElement.focus();
        }
    }

    /**
     * Handler for save favourites click events.
     * Saves the selected favourites and reloads them.
     */
    deleteFavourite(event) {
        if (event.key === "Enter") {
            const el = event.target;
            if (el && el.parentNode) {
                el.parentNode.remove();
            }
        }
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

}

export default OperationsWaiter;
