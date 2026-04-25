/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLOperation from "../HTMLOperation.mjs";
import Sortable from "sortablejs";
import Utils from "../../core/Utils.mjs";
import {escapeControlChars} from "../utils/editorUtils.mjs";
import DOMPurify from "dompurify";


const ECDH_TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgVPecKErSPjan5fSz
f+jsKPKthv3Ao5N0IxkbatQNw16hRANCAARhg779GdYIpH0QnY66FmGX1nMFyybu
sjExdXFN15BBa1+zh1Cf7Cr484KJ8Mh2ga/Qs8qKk/8VbWSj0SbLb6Os
-----END PRIVATE KEY-----`;

const ECDH_TEST_PEER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEZWOfvFUyA5ITdtEUar7aAz308Llr
pPVK74bCKbeq3gIA5ZN0we6T18GSkTHtCCOG266YyCGTcE2JrnswYk1f8A==
-----END PUBLIC KEY-----`;


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
        if (this.removeIntent && evt.item.parentNode.id === "rec-list") {
            evt.item.remove();
            return;
        }

        // Reinitialise the popover on the original element in the ops list because for some reason it
        // gets destroyed and recreated. If the clone isn't in the ops list, we use the original item instead.
        let enableOpsElement;
        if (evt.clone?.parentNode?.classList?.contains("op-list")) {
            enableOpsElement = evt.clone;
        } else {
            enableOpsElement = evt.item;
            $(evt.item).attr("data-toggle", "popover");
        }
        this.manager.ops.enableOpsListPopovers(enableOpsElement);

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
                    ingredients[j] = parseFloat(ingList[j].value);
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
            this.app.alert("Auto-Bake is disabled by default when using this operation.", 5000);
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
        const clean = DOMPurify.sanitize(name);
        item.innerHTML = clean;

        this.buildRecipeOperation(item);
        document.getElementById("rec-list").appendChild(item);

        $(item).find("[data-toggle='tooltip']").tooltip();

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
     * Populates the operation card and input pane with a built-in test sample.
     *
     * @fires Manager#statechange
     * @param {Event} e
     */
    populateTestDataClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const button = e.target.closest(".populate-test-data");
        const op = e.target.closest("li.operation");
        if (!button || !op) return;

        const opName = op.querySelector(".op-title").textContent;
        const opConfig = this.app.operations[opName];
        const samples = opConfig?.testDataSamples || [];
        if (!samples.length) {
            return;
        }

        const sampleIndex = Number(button.dataset.sampleIndex || 0) % samples.length;
        const sample = this.resolveTestDataSample(samples[sampleIndex]);
        button.dataset.sampleIndex = String((sampleIndex + 1) % samples.length);

        if (sample.recipeConfig) {
            this.app.setRecipeConfig(sample.recipeConfig);
        } else {
            this.populateRecipeOperationArgs(op, sample.args || []);
        }

        if (typeof sample.input === "string") {
            this.app.setInput(sample.input);
        }

        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Populates a recipe operation's arguments from a resolved sample.
     *
     * @param {HTMLElement} op
     * @param {Array} args
     */
    populateRecipeOperationArgs(op, args) {
        const ingEls = op.querySelectorAll(".arg");

        for (let i = 0; i < ingEls.length; i++) {
            if (args[i] === undefined) continue;

            if (ingEls[i].getAttribute("type") === "checkbox") {
                ingEls[i].checked = Boolean(args[i]);
            } else if (ingEls[i].classList.contains("toggle-string")) {
                ingEls[i].value = args[i].string;
                ingEls[i].parentNode.parentNode.querySelector("button").innerHTML =
                    Utils.escapeHtml(args[i].option);
            } else {
                ingEls[i].value = args[i];
            }
        }

        this.triggerArgEvents(op);
    }


    /**
     * Resolves placeholders inside a test-data sample.
     *
     * @param {Object} sample
     * @returns {Object}
     */
    resolveTestDataSample(sample) {
        return {
            input: this.resolveTestDataValue(sample.input),
            args: this.resolveTestDataValue(sample.args || []),
            recipeConfig: this.resolveTestDataValue(sample.recipeConfig)
        };
    }


    /**
     * Recursively resolves test-data placeholders.
     *
     * @param {*} value
     * @returns {*}
     */
    resolveTestDataValue(value) {
        if (typeof value === "string") {
            return this.resolveTestDataPlaceholder(value);
        }

        if (Array.isArray(value)) {
            return value.map(item => this.resolveTestDataValue(item));
        }

        if (value && typeof value === "object") {
            const resolved = {};
            for (const [key, nestedValue] of Object.entries(value)) {
                resolved[key] = this.resolveTestDataValue(nestedValue);
            }
            return resolved;
        }

        return value;
    }


    /**
     * Resolves a single placeholder string into generated or canned test data.
     *
     * @param {string} value
     * @returns {string}
     */
    resolveTestDataPlaceholder(value) {
        switch (value) {
            case "__RANDOM_AES_128_HEX__":
                return this.randomHex(16);
            case "__RANDOM_TDES_16_HEX__":
                return this.randomHex(16);
            case "__RANDOM_PIN_4__":
                return this.randomDigits(4, true);
            case "__RANDOM_PAN_16__":
                return this.randomPan(16);
            case "__RANDOM_KSN__":
                return this.randomKsn();
            case "__ECDH_TEST_PRIVATE_KEY__":
                return ECDH_TEST_PRIVATE_KEY;
            case "__ECDH_TEST_PEER_PUBLIC_KEY__":
                return ECDH_TEST_PEER_PUBLIC_KEY;
            default:
                return value;
        }
    }


    /**
     * Generates uppercase random hex.
     *
     * @param {number} byteLength
     * @returns {string}
     */
    randomHex(byteLength) {
        const bytes = new Uint8Array(byteLength);
        this.getRandomValues(bytes);
        return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    }


    /**
     * Generates a random numeric string.
     *
     * @param {number} length
     * @param {boolean} firstNonZero
     * @returns {string}
     */
    randomDigits(length, firstNonZero=false) {
        const bytes = new Uint8Array(length);
        this.getRandomValues(bytes);
        let out = "";
        for (let i = 0; i < length; i++) {
            let digit = bytes[i] % 10;
            if (i === 0 && firstNonZero && digit === 0) digit = 1;
            out += String(digit);
        }
        return out;
    }


    /**
     * Generates a valid Luhn PAN with a Mastercard-style prefix.
     *
     * @param {number} length
     * @returns {string}
     */
    randomPan(length=16) {
        const prefix = "543210";
        const bodyLength = Math.max(prefix.length + 1, length) - 1;
        let body = prefix;

        if (body.length < bodyLength) {
            body += this.randomDigits(bodyLength - body.length);
        }

        body = body.substring(0, bodyLength);

        let sum = 0;
        const parity = body.length % 2;
        for (let i = 0; i < body.length; i++) {
            let digit = parseInt(body.charAt(i), 10);
            if (i % 2 === parity) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }

        const checkDigit = (10 - (sum % 10)) % 10;
        return body + String(checkDigit);
    }


    /**
     * Generates a DUKPT-style 10-byte KSN hex string with a random 21-bit counter.
     *
     * @returns {string}
     */
    randomKsn() {
        const bytes = new Uint8Array(10);
        this.getRandomValues(bytes);

        bytes[0] = 0xFF;
        bytes[1] = 0xFF;
        bytes[2] = 0x98;
        bytes[3] = 0x76;
        bytes[4] = 0x54;
        bytes[5] = 0x32;
        bytes[6] = 0x10;
        bytes[7] = (bytes[7] & 0x1F) | 0xE0;

        return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    }


    /**
     * Fills a byte array with random data.
     *
     * @param {Uint8Array} bytes
     * @returns {Uint8Array}
     */
    getRandomValues(bytes) {
        if (globalThis.crypto && globalThis.crypto.getRandomValues) {
            return globalThis.crypto.getRandomValues(bytes);
        }

        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }

        return bytes;
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
     * @param {event} e
     */
    opAdd(e) {
        log.debug(`'${e.target.querySelector(".op-title").textContent}' added to recipe`);

        this.triggerArgEvents(e.target);
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
     * Handler for text argument dragover events.
     * Gives the user a visual cue to show that items can be dropped here.
     *
     * @param {event} e
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
     * @param {event} e
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
     * @param {event} e
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


    /**
     * Adjusts the number of ingredient columns as the width of the recipe changes.
     */
    adjustWidth() {
        const recList = document.getElementById("rec-list");

        // Hide Chef icon on Bake button if the page is compressed
        const bakeIcon = document.querySelector("#bake img");

        if (recList.clientWidth < 370) {
            // Hide Chef icon on Bake button
            bakeIcon.style.display = "none";
        } else {
            bakeIcon.style.display = "inline-block";
        }

        // Scale controls to fit pane width
        const controls = document.getElementById("controls");
        const controlsContent = document.getElementById("controls-content");
        const scale = (controls.clientWidth - 1) / controlsContent.scrollWidth;

        controlsContent.style.transform = `scale(${scale})`;
    }

}

export default RecipeWaiter;
