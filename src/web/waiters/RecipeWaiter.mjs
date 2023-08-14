/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Sortable from "sortablejs";
import Utils from "../../core/Utils.mjs";
import {escapeControlChars} from "../utils/editorUtils.mjs";
import {CIngredientLi} from "../components/c-ingredient-li.mjs";


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
     * Sets up the drag and drop capability for recipe-list
     */
    initDragAndDrop() {
        const recList = document.getElementById("rec-list");

        let swapThreshold, animation, delay;

        // tweak these values for better user experiences per device type and UI
        if (this.app.isMobileView()) {
            swapThreshold = 0.60;
            animation = 400;
            delay = 200;
        } else {
            swapThreshold = 0.10;
            animation = 200;
            delay = 0;
        }

        // Recipe list
        Sortable.create(recList, {
            group: "recipe",
            sort: true,
            draggable: "c-ingredient-li",
            swapThreshold: swapThreshold,
            animation: animation,
            delay: delay,
            filter: ".arg",
            preventOnFilter: false,
            setData: function(dataTransfer, dragEl) {
                dataTransfer.setData("Text", dragEl.querySelector("li").getAttribute("data-name"));
            },
            onEnd: function(e) {
                if (this.removeIntent) {
                    e.item.remove();
                    e.target.dispatchEvent(this.manager.operationremove);
                }
            }.bind(this),
            onSort: function(e) {
                if (e.from.id === "rec-list") {
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
     * Handler for favourite dragover events.
     * If the element being dragged is an operation, displays a visual cue so that the user knows it can
     * be dropped here.
     *
     * @param {Event} e
     */
    favDragover(e) {
        if (e.dataTransfer.effectAllowed !== "move")
            return false;

        e.stopPropagation();
        e.preventDefault();
        if (e.target?.className?.indexOf("category-title") > -1) {
            // Hovering over the a
            e.target.classList.add("favourites-hover");
        } else if (e.target?.parentNode?.className?.indexOf("category-title") > -1) {
            // Hovering over the Edit button
            e.target.parentNode.classList.add("favourites-hover");
        } else if (e.target?.parentNode?.parentNode?.className?.indexOf("category-title") > -1) {
            // Hovering over the image on the Edit button
            e.target.parentNode.parentNode.classList.add("favourites-hover");
        }
    }


    /**
     * Handler for favourite dragleave events.
     * Removes the visual cue.
     *
     * @param {Event} e
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
     * @param {Event} e
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
        if (e && e?.target?.classList?.contains("no-state-change")) return;
        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Handler for disable click events.
     * Updates the icon status.
     *
     * @fires Manager#statechange
     * @param {Event} e
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
     * @param {Event} e
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
     * @param {Event} e
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
     * @param {Event} e
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
                    ingredients[j] = parseFloat(ingList[j].value);
                } else {
                    // all others
                    ingredients[j] = ingList[j].value;
                }
            }

            item = {
                op: operations[i].getAttribute("data-name"),
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
     * @param {number|boolean} position - If boolean, turn off all indicators
     */
    updateBreakpointIndicator(position) {
        const operations = document.querySelectorAll("#rec-list li.operation");
        if (typeof position === "boolean") position = operations.length;
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
     * @param {string} name - The operation stub element from the operations pane
     */
    buildRecipeOperation(name) {
        const op = new CIngredientLi(this.app, name, this.app.operations[name].args);

        if (this.app.operations[name].flowControl) {
            op.classList.add("flow-control-op");
        }

        // Disable auto-bake if this is a manual op
        if (op.manualBake && this.app.autoBake_) {
            this.manager.controls.setAutoBake(false);
            this.app.alert("Auto-Bake is disabled by default when using this operation.", 5000);
        }

        return op;
    }


    /**
     * Adds the specified operation to the recipe
     *
     * @fires Manager#operationadd
     * @fires Manager#statechange
     * @param {string} name - The name of the operation to add
     */
    addOperation(name) {
        const item = this.buildRecipeOperation(name);
        document.getElementById("rec-list").appendChild(item);

        $(item).find("[data-toggle='tooltip']").tooltip();

        item.dispatchEvent(this.manager.operationadd);
        document.dispatchEvent(this.app.manager.statechange);

        this.manager.ops.updateListItemsClasses("#rec-list", "selected");
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
     * @param {Event} e
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
     * Triggers various change events for operation arguments that have just been initialised.
     *
     * @param {HTMLElement} op
     */
    triggerArgEvents(op) {
        // Trigger populateOption and argSelector events
        const triggerableOptions = op.querySelectorAll(".populate-option, .arg-selector");
        const evt = new Event("change", {bubbles: true});
        if (triggerableOptions.length) {
            for (const el of triggerableOptions) {
                el.dispatchEvent(evt);
            }
        }
    }


    /**
     * Handler for operationadd events.
     *
     * @listens Manager#operationadd
     * @fires Manager#statechange
     * @param {Event} e
     */
    opAdd(e) {
        console.log(e);
        log.debug(`'${e.target.querySelector("li").getAttribute("data-name")}' added to recipe`);
        console.log(e.target.querySelector("li").getAttribute("data-name"));
        this.triggerArgEvents(e.target);
        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Handler for operationremove events.
     * Updates 'selected' classes in #operations
     *
     * @listens Manager#operationremove
     * @fires Manager#statechange
     * @param {Event} e
     */
    opRemove(e) {
        log.debug("Operation removed from recipe");
        window.dispatchEvent(this.manager.statechange);
        this.manager.ops.updateListItemsClasses("#rec-list", "selected");
    }


    /**
     * Handler for text argument dragover events.
     * Gives the user a visual cue to show that items can be dropped here.
     *
     * @param {Event} e
     */
    textArgDragover (e) {
        // This will be set if we're dragging an operation
        if (e.dataTransfer.effectAllowed === "move")
            return false;

        e.stopPropagation();
        e.preventDefault();
        e.target.closest("textarea.arg").classList.add("dropping-file");
    }


    /**
     * Handler for text argument dragleave events.
     * Removes the visual cue.
     *
     * @param {Event} e
     */
    textArgDragLeave (e) {
        e.stopPropagation();
        e.preventDefault();
        e.target.classList.remove("dropping-file");
    }


    /**
     * Handler for text argument drop events.
     * Loads the dragged data into the argument textarea.
     *
     * @param {Event} e
     */
    textArgDrop(e) {
        // This will be set if we're dragging an operation
        if (e.dataTransfer.effectAllowed === "move")
            return false;

        e.stopPropagation();
        e.preventDefault();
        const targ = e.target;
        const file = e.dataTransfer.files[0];
        const text = e.dataTransfer.getData("Text");

        targ.classList.remove("dropping-file");

        if (text) {
            targ.value = text;
            return;
        }

        if (file) {
            const reader = new FileReader();
            const self = this;
            reader.onload = function (e) {
                targ.value = e.target.result;
                // Trigger floating label move
                const changeEvent = new Event("change");
                targ.dispatchEvent(changeEvent);
                window.dispatchEvent(self.manager.statechange);
            };
            reader.readAsText(file);
        }
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
            registerList.push(`$R${numPrevRegisters + i} = ${escapeControlChars(Utils.escapeHtml(Utils.truncate(registers[i], 100)))}`);
        }
        const registerListEl = `<div class="register-list">
                ${registerList.join("<br>")}
            </div>`;

        op.insertAdjacentHTML("beforeend", registerListEl);
    }
}

export default RecipeWaiter;
