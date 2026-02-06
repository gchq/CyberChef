/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Sortable from "sortablejs";
import Utils from "../../core/Utils.mjs";
import {escapeControlChars} from "../utils/editorUtils.mjs";
import {CRecipeLi} from "../components/c-recipe-li.mjs";


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
            swapThreshold = 0.30;
            animation = 300;
            delay = 50;
        } else {
            swapThreshold = 1;
            animation = 100;
            delay = 0;
        }

        // Recipe list
        Sortable.create(recList, {
            group: "recipe",
            sort: true,
            draggable: "c-recipe-li",
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
     * Handler for hide-args click events.
     * Updates the icon status.
     *
     * @fires Manager#statechange
     * @param {event} e
     */
    hideArgsClick(e) {
        const icon = e.target;

        if (icon.getAttribute("hide-args") === "false") {
            icon.setAttribute("hide-args", "true");
            icon.innerText = "keyboard_arrow_down";
            icon.classList.add("hide-args-selected");
            icon.parentNode.previousElementSibling.style.display = "none";
        } else {
            icon.setAttribute("hide-args", "false");
            icon.innerText = "keyboard_arrow_up";
            icon.classList.remove("hide-args-selected");
            icon.parentNode.previousElementSibling.style.display = "grid";
        }

        const icons = Array.from(document.getElementsByClassName("hide-args-icon"));
        if (icons.length > 1) {
            // Check if ALL the icons are hidden/shown
            const uniqueIcons = icons.map(function(item) {
                return item.getAttribute("hide-args");
            }).unique();

            const controlsIconStatus = document.getElementById("hide-icon").getAttribute("hide-args");

            // If all icons are in the same state and the global icon isn't, fix it
            if (uniqueIcons.length === 1 && icon.getAttribute("hide-args") !== controlsIconStatus) {
                this.manager.controls.hideRecipeArgsClick();
            }
        }

        window.dispatchEvent(this.manager.statechange);
    }

    /**
     * Generates a configuration object to represent the current recipe.
     *
     * @returns {Object[]} recipeConfig - The recipe configuration
     */
    getConfig() {
        const config = [];
        let ingredients, args, disableIcon, breakPointIcon, item;
        const operations = document.querySelectorAll("#rec-list li.operation");

        for (let i = 0; i < operations.length; i++) {
            ingredients = [];
            disableIcon = operations[i].querySelector(".disable-icon");
            breakPointIcon = operations[i].querySelector(".breakpoint-icon");
            args = operations[i].querySelectorAll(".arg");

            for (let j = 0; j < args.length; j++) {
                if (args[j].getAttribute("type") === "checkbox") {
                    // checkbox
                    ingredients[j] = args[j].checked;
                } else if (args[j].classList.contains("toggle-string")) {
                    // toggleString
                    ingredients[j] = {
                        option: args[j].parentNode.parentNode.querySelector("button").textContent,
                        string: args[j].value
                    };
                } else if (args[j].getAttribute("type") === "number") {
                    // number
                    ingredients[j] = parseFloat(args[j].value);
                } else {
                    // all others
                    ingredients[j] = args[j].value;
                }
            }

            item = {
                op: operations[i].getAttribute("data-name"),
                args: ingredients
            };

            if (disableIcon && disableIcon.getAttribute("disabled") === "true") {
                item.disabled = true;
            }

            if (breakPointIcon && breakPointIcon.getAttribute("break") === "true") {
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
     * Adds the specified operation to the recipe
     *
     * @fires Manager#operationadd
     * @fires Manager#statechange
     * @param {string} name - The name of the operation to add
     * @param {number} index - The index where the operation should be displayed
     */
    addOperation(name, index = undefined) {
        const item = new CRecipeLi(this.app, name, this.app.operations[name].args);

        const recipeList = document.getElementById("rec-list");

        if (index !== undefined) {
            recipeList.insertBefore(item, recipeList.children[index + 1]);
        } else {
            recipeList.appendChild(item);
        }

        $(item).find("[data-toggle='tooltip']").tooltip();

        item.dispatchEvent(this.manager.operationadd);
        document.dispatchEvent(this.app.manager.statechange);
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

        window.dispatchEvent(this.app.manager.statechange);
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
        this.triggerArgEvents(e.target);
        window.dispatchEvent(this.manager.statechange);
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
