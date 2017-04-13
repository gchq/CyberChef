import HTMLOperation from "./HTMLOperation.js";
import Sortable from "sortablejs";


/**
 * Waiter to handle events related to the operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {App} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
const OperationsWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;

    this.options = {};
    this.removeIntent = false;
};


/**
 * Handler for search events.
 * Finds operations which match the given search term and displays them under the search box.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.searchOperations = function(e) {
    let ops, selected;

    if (e.type === "search") { // Search
        e.preventDefault();
        ops = document.querySelectorAll("#search-results li");
        if (ops.length) {
            selected = this.getSelectedOp(ops);
            if (selected > -1) {
                this.manager.recipe.addOperation(ops[selected].innerHTML);
                this.app.autoBake();
            }
        }
    }

    if (e.keyCode === 13) { // Return
        e.preventDefault();
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
        let searchResultsEl = document.getElementById("search-results"),
            el = e.target,
            str = el.value;

        while (searchResultsEl.firstChild) {
            try {
                $(searchResultsEl.firstChild).popover("destroy");
            } catch (err) {}
            searchResultsEl.removeChild(searchResultsEl.firstChild);
        }

        $("#categories .in").collapse("hide");
        if (str) {
            let matchedOps = this.filterOperations(str, true),
                matchedOpsHtml = "";

            for (let i = 0; i < matchedOps.length; i++) {
                matchedOpsHtml += matchedOps[i].toStubHtml();
            }

            searchResultsEl.innerHTML = matchedOpsHtml;
            searchResultsEl.dispatchEvent(this.manager.oplistcreate);
        }
    }
};


/**
 * Filters operations based on the search string and returns the matching ones.
 *
 * @param {string} searchStr
 * @param {boolean} highlight - Whether or not to highlight the matching string in the operation
 *   name and description
 * @returns {string[]}
 */
OperationsWaiter.prototype.filterOperations = function(searchStr, highlight) {
    let matchedOps = [],
        matchedDescs = [];

    searchStr = searchStr.toLowerCase();

    for (const opName in this.app.operations) {
        let op = this.app.operations[opName],
            namePos = opName.toLowerCase().indexOf(searchStr),
            descPos = op.description.toLowerCase().indexOf(searchStr);

        if (namePos >= 0 || descPos >= 0) {
            const operation = new HTMLOperation(opName, this.app.operations[opName], this.app, this.manager);
            if (highlight) {
                operation.highlightSearchString(searchStr, namePos, descPos);
            }

            if (namePos < 0) {
                matchedOps.push(operation);
            } else {
                matchedDescs.push(operation);
            }
        }
    }

    return matchedDescs.concat(matchedOps);
};


/**
 * Finds the operation which has been selected using keyboard shortcuts. This will have the class
 * 'selected-op' set. Returns the index of the operation within the given list.
 *
 * @param {element[]} ops
 * @returns {number}
 */
OperationsWaiter.prototype.getSelectedOp = function(ops) {
    for (let i = 0; i < ops.length; i++) {
        if (ops[i].classList.contains("selected-op")) {
            return i;
        }
    }
    return -1;
};


/**
 * Handler for oplistcreate events.
 *
 * @listens Manager#oplistcreate
 * @param {event} e
 */
OperationsWaiter.prototype.opListCreate = function(e) {
    this.manager.recipe.createSortableSeedList(e.target);
    $("[data-toggle=popover]").popover();
};


/**
 * Handler for operation doubleclick events.
 * Adds the operation to the recipe and auto bakes.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.operationDblclick = function(e) {
    const li = e.target;

    this.manager.recipe.addOperation(li.textContent);
    this.app.autoBake();
};


/**
 * Handler for edit favourites click events.
 * Sets up the 'Edit favourites' pane and displays it.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.editFavouritesClick = function(e) {
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

    var editableList = Sortable.create(editFavouritesList, {
        filter: ".remove-icon",
        onFilter: function (evt) {
            const el = editableList.closest(evt.item);
            if (el) {
                $(el).popover("destroy");
                el.parentNode.removeChild(el);
            }
        },
        onEnd: function(evt) {
            if (this.removeIntent) {
                $(evt.item).popover("destroy");
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
};


/**
 * Handler for save favourites click events.
 * Saves the selected favourites and reloads them.
 */
OperationsWaiter.prototype.saveFavouritesClick = function() {
    let favouritesList = [],
        favs = document.querySelectorAll("#edit-favourites-list li");

    for (let i = 0; i < favs.length; i++) {
        favouritesList.push(favs[i].textContent);
    }

    this.app.saveFavourites(favouritesList);
    this.app.loadFavourites();
    this.app.populateOperationsList();
    this.manager.recipe.initialiseOperationDragNDrop();
};


/**
 * Handler for reset favourites click events.
 * Resets favourites to their defaults.
 */
OperationsWaiter.prototype.resetFavouritesClick = function() {
    this.app.resetFavourites();
};


/**
 * Handler for opIcon mouseover events.
 * Hides any popovers already showing on the operation so that there aren't two at once.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.opIconMouseover = function(e) {
    const opEl = e.target.parentNode;
    if (e.target.getAttribute("data-toggle") === "popover") {
        $(opEl).popover("hide");
    }
};


/**
 * Handler for opIcon mouseleave events.
 * If this icon created a popover and we're moving back to the operation element, display the
 *   operation popover again.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.opIconMouseleave = function(e) {
    let opEl = e.target.parentNode,
        toEl = e.toElement || e.relatedElement;

    if (e.target.getAttribute("data-toggle") === "popover" && toEl === opEl) {
        $(opEl).popover("show");
    }
};

export default OperationsWaiter;
