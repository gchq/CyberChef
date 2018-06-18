/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLOperation from "./HTMLOperation";
import Sortable from "sortablejs";
import Utils from "../core/Utils";


/**
 * Waiter to handle events related to the recipe.
 */
class RecipeWaiter {

    /**
     * RecipeWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
        this.removeIntent = false;
    }


    /**
     * Sets up the drag and drop capability for operations in the operations and recipe areas.
     */
    initialiseOperationDragNDrop() {
        const recList = document.getElementById("rec-list");

        // Recipe list
        Sortable.create(recList, {
            group: "recipe",
            sort: true,
            animation: 0,
            delay: 0,
            filter: ".arg",
            preventOnFilter: false,
            setData: function(dataTransfer, dragEl) {
                dataTransfer.setData("Text", dragEl.querySelector(".op-title").textContent);
            },
            onEnd: function(evt) {
                if (this.removeIntent) {
                    evt.item.remove();
                    evt.target.dispatchEvent(this.manager.operationremove);
                }
            }.bind(this),
            onSort: function(evt) {
                if (evt.from.id === "rec-list") {
                    document.dispatchEvent(this.manager.statechange);
                }
            }.bind(this)
        });

        Sortable.utils.on(recList, "dragover", function() {
            this.removeIntent = false;
        }.bind(this));

        Sortable.utils.on(recList, "dragleave", function() {
            this.removeIntent = true;
            this.app.progress = 0;
        }.bind(this));

        Sortable.utils.on(recList, "touchend", function(e) {
            const loc = e.changedTouches[0];
            const target = document.elementFromPoint(loc.clientX, loc.clientY);

            this.removeIntent = !recList.contains(target);
        }.bind(this));

        // Favourites category
        document.querySelector("#categories a").addEventListener("dragover", this.favDragover.bind(this));
        document.querySelector("#categories a").addEventListener("dragleave", this.favDragleave.bind(this));
        document.querySelector("#categories a").addEventListener("drop", this.favDrop.bind(this));
    }


    /**
     * Creates a drag-n-droppable seed list of operations.
     *
     * @param {element} listEl - The list to initialise
     */
    createSortableSeedList(listEl) {
        Sortable.create(listEl, {
            group: {
                name: "recipe",
                pull: "clone",
                put: false,
            },
            sort: false,
            setData: function(dataTransfer, dragEl) {
                dataTransfer.setData("Text", dragEl.textContent);
            },
            onStart: function(evt) {
                // Removes popover element and event bindings from the dragged operation but not the
                // event bindings from the one left in the operations list. Without manually removing
                // these bindings, we cannot re-initialise the popover on the stub operation.
                $(evt.item)
                    .popover("dispose")
                    .removeData("bs.popover")
                    .off("mouseenter")
                    .off("mouseleave")
                    .attr("data-toggle", "popover-disabled");
                $(evt.clone)
                    .off(".popover")
                    .removeData("bs.popover");
            },
            onEnd: this.opSortEnd.bind(this)
        });
    }


    /**
     * Handler for operation sort end events.
     * Removes the operation from the list if it has been dropped outside. If not, adds it to the list
     * at the appropriate place and initialises it.
     *
     * @fires Manager#operationadd
     * @param {event} evt
     */
    opSortEnd(evt) {
        if (this.removeIntent) {
            if (evt.item.parentNode.id === "rec-list") {
                evt.item.remove();
            }
            return;
        }

        // Reinitialise the popover on the original element in the ops list because for some reason it
        // gets destroyed and recreated.
        this.manager.ops.enableOpsListPopovers(evt.clone);

        if (evt.item.parentNode.id !== "rec-list") {
            return;
        }

        this.buildRecipeOperation(evt.item);
        evt.item.dispatchEvent(this.manager.operationadd);
    }


    /**
     * Handler for favourite dragover events.
     * If the element being dragged is an operation, displays a visual cue so that the user knows it can
     * be dropped here.
     *
     * @param {event} e
     */
    favDragover(e) {
        if (e.dataTransfer.effectAllowed !== "move")
            return false;

        e.stopPropagation();
        e.preventDefault();
        if (e.target.className && e.target.className.indexOf("category-title") > -1) {
            // Hovering over the a
            e.target.classList.add("favourites-hover");
        } else if (e.target.parentNode.className && e.target.parentNode.className.indexOf("category-title") > -1) {
            // Hovering over the Edit button
            e.target.parentNode.classList.add("favourites-hover");
        } else if (e.target.parentNode.parentNode.className && e.target.parentNode.parentNode.className.indexOf("category-title") > -1) {
            // Hovering over the image on the Edit button
            e.target.parentNode.parentNode.classList.add("favourites-hover");
        }
    }


    /**
     * Handler for favourite dragleave events.
     * Removes the visual cue.
     *
     * @param {event} e
     */
    favDragleave(e) {
        e.stopPropagation();
        e.preventDefault();
        document.querySelector("#categories a").classList.remove("favourites-hover");
    }


    /**
     * Handler for favourite drop events.
     * Adds the dragged operation to the favourites list.
     *
     * @param {event} e
     */
    favDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        e.target.classList.remove("favourites-hover");

        const opName = e.dataTransfer.getData("Text");
        this.app.addFavourite(opName);
    }


    /**
     * Handler for ingredient change events.
     *
     * @fires Manager#statechange
     */
    ingChange(e) {
        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Handler for disable click events.
     * Updates the icon status.
     *
     * @fires Manager#statechange
     * @param {event} e
     */
    disableClick(e) {
        const icon = e.target;

        if (icon.getAttribute("disabled") === "false") {
            icon.setAttribute("disabled", "true");
            icon.classList.add("disable-icon-selected");
            icon.parentNode.parentNode.classList.add("disabled");
        } else {
            icon.setAttribute("disabled", "false");
            icon.classList.remove("disable-icon-selected");
            icon.parentNode.parentNode.classList.remove("disabled");
        }

        this.app.progress = 0;
        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Handler for breakpoint click events.
     * Updates the icon status.
     *
     * @fires Manager#statechange
     * @param {event} e
     */
    breakpointClick(e) {
        const bp = e.target;

        if (bp.getAttribute("break") === "false") {
            bp.setAttribute("break", "true");
            bp.classList.add("breakpoint-selected");
        } else {
            bp.setAttribute("break", "false");
            bp.classList.remove("breakpoint-selected");
        }

        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Handler for operation doubleclick events.
     * Removes the operation from the recipe and auto bakes.
     *
     * @fires Manager#statechange
     * @param {event} e
     */
    operationDblclick(e) {
        e.target.remove();
        this.opRemove(e);
    }


    /**
     * Handler for operation child doubleclick events.
     * Removes the operation from the recipe.
     *
     * @fires Manager#statechange
     * @param {event} e
     */
    operationChildDblclick(e) {
        e.target.parentNode.remove();
        this.opRemove(e);
    }


    /**
     * Generates a configuration object to represent the current recipe.
     *
     * @returns {recipeConfig}
     */
    getConfig() {
        const config = [];
        let ingredients, ingList, disabled, bp, item;
        const operations = document.querySelectorAll("#rec-list li.operation");

        for (let i = 0; i < operations.length; i++) {
            ingredients = [];
            disabled = operations[i].querySelector(".disable-icon");
            bp = operations[i].querySelector(".breakpoint");
            ingList = operations[i].querySelectorAll(".arg");

            for (let j = 0; j < ingList.length; j++) {
                if (ingList[j].getAttribute("type") === "checkbox") {
                    // checkbox
                    ingredients[j] = ingList[j].checked;
                } else if (ingList[j].classList.contains("toggle-string")) {
                    // toggleString
                    ingredients[j] = {
                        option: ingList[j].parentNode.parentNode.querySelector("button").textContent,
                        string: ingList[j].value
                    };
                } else if (ingList[j].getAttribute("type") === "number") {
                    // number
                    ingredients[j] = parseFloat(ingList[j].value, 10);
                } else {
                    // all others
                    ingredients[j] = ingList[j].value;
                }
            }

            item = {
                op: operations[i].querySelector(".op-title").textContent,
                args: ingredients
            };

            if (disabled && disabled.getAttribute("disabled") === "true") {
                item.disabled = true;
            }

            if (bp && bp.getAttribute("break") === "true") {
                item.breakpoint = true;
            }

            config.push(item);
        }

        return config;
    }


    /**
     * Moves or removes the breakpoint indicator in the recipe based on the position.
     *
     * @param {number} position
     */
    updateBreakpointIndicator(position) {
        const operations = document.querySelectorAll("#rec-list li.operation");
        for (let i = 0; i < operations.length; i++) {
            if (i === position) {
                operations[i].classList.add("break");
            } else {
                operations[i].classList.remove("break");
            }
        }
    }


    /**
     * Given an operation stub element, this function converts it into a full recipe element with
     * arguments.
     *
     * @param {element} el - The operation stub element from the operations pane
     */
    buildRecipeOperation(el) {
        const opName = el.textContent;
        const op = new HTMLOperation(opName, this.app.operations[opName], this.app, this.manager);
        el.innerHTML = op.toFullHtml();

        if (this.app.operations[opName].flowControl) {
            el.classList.add("flow-control-op");
        }

        // Disable auto-bake if this is a manual op
        if (op.manualBake && this.app.autoBake_) {
            this.manager.controls.setAutoBake(false);
            this.app.alert("Auto-Bake is disabled by default when using this operation.", "info", 5000);
        }
    }

    /**
     * Adds the specified operation to the recipe.
     *
     * @fires Manager#operationadd
     * @param {string} name - The name of the operation to add
     * @returns {element}
     */
    addOperation(name) {
        const item = document.createElement("li");

        item.classList.add("operation");
        item.innerHTML = name;
        this.buildRecipeOperation(item);
        document.getElementById("rec-list").appendChild(item);

        item.dispatchEvent(this.manager.operationadd);
        return item;
    }


    /**
     * Removes all operations from the recipe.
     *
     * @fires Manager#operationremove
     */
    clearRecipe() {
        const recList = document.getElementById("rec-list");
        while (recList.firstChild) {
            recList.removeChild(recList.firstChild);
        }
        recList.dispatchEvent(this.manager.operationremove);
    }


    /**
     * Handler for operation dropdown events from toggleString arguments.
     * Sets the selected option as the name of the button.
     *
     * @param {event} e
     */
    dropdownToggleClick(e) {
        e.stopPropagation();
        e.preventDefault();

        const el = e.target;
        const button = el.parentNode.parentNode.querySelector("button");

        button.innerHTML = el.textContent;
        this.ingChange();
    }


    /**
     * Handler for operationadd events.
     *
     * @listens Manager#operationadd
     * @fires Manager#statechange
     * @param {event} e
     */
    opAdd(e) {
        log.debug(`'${e.target.querySelector(".op-title").textContent}' added to recipe`);
        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Handler for operationremove events.
     *
     * @listens Manager#operationremove
     * @fires Manager#statechange
     * @param {event} e
     */
    opRemove(e) {
        log.debug("Operation removed from recipe");
        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Sets register values.
     *
     * @param {number} opIndex
     * @param {number} numPrevRegisters
     * @param {string[]} registers
     */
    setRegisters(opIndex, numPrevRegisters, registers) {
        const op = document.querySelector(`#rec-list .operation:nth-child(${opIndex + 1})`),
            prevRegList = op.querySelector(".register-list");

        // Remove previous div
        if (prevRegList) prevRegList.remove();

        const registerList = [];
        for (let i = 0; i < registers.length; i++) {
            registerList.push(`$R${numPrevRegisters + i} = ${Utils.escapeHtml(Utils.truncate(Utils.printable(registers[i]), 100))}`);
        }
        const registerListEl = `<div class="register-list">
                ${registerList.join("<br>")}
            </div>`;

        op.insertAdjacentHTML("beforeend", registerListEl);
    }

    /**
     * Adjusts the number of ingredient columns as the width of the recipe changes.
     */
    adjustWidth() {
        const recList = document.getElementById("rec-list");

        if (!this.ingredientRuleID) {
            this.ingredientRuleID = null;
            this.ingredientChildRuleID = null;

            // Find relevant rules in the stylesheet
            for (const i in document.styleSheets[0].cssRules) {
                if (document.styleSheets[0].cssRules[i].selectorText === ".ingredients") {
                    this.ingredientRuleID = i;
                }
                if (document.styleSheets[0].cssRules[i].selectorText === ".ingredients > div") {
                    this.ingredientChildRuleID = i;
                }
            }
        }

        if (!this.ingredientRuleID || !this.ingredientChildRuleID) return;

        const ingredientRule = document.styleSheets[0].cssRules[this.ingredientRuleID],
            ingredientChildRule = document.styleSheets[0].cssRules[this.ingredientChildRuleID];

        if (recList.clientWidth < 450) {
            ingredientRule.style.gridTemplateColumns = "auto auto";
            ingredientChildRule.style.gridColumn = "1 / span 2";
        } else if (recList.clientWidth < 620) {
            ingredientRule.style.gridTemplateColumns = "auto auto auto";
            ingredientChildRule.style.gridColumn = "1 / span 3";
        } else {
            ingredientRule.style.gridTemplateColumns = "auto auto auto auto";
            ingredientChildRule.style.gridColumn = "1 / span 4";
        }
    }

}

export default RecipeWaiter;
