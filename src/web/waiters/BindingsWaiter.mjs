/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * Waiter to handle keybindings to CyberChef functions (i.e. Bake, Step, Save, Load etc.)
 */
class BindingsWaiter {

    /**
     * BindingsWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
    }


    /**
     * Handler for all keydown events
     * Checks whether valid keyboard shortcut has been instated
     *
     * @fires Manager#statechange
     * @param {event} e
     */
    parseInput(e) {
        const modKey = this.app.options.useMetaKey ? e.metaKey : e.altKey;

        if (e.ctrlKey && modKey) {
            let elem;
            switch (e.code) {
                case "KeyF": // Focus search
                    e.preventDefault();
                    document.getElementById("search").focus();
                    break;
                case "KeyI": // Focus input
                    e.preventDefault();
                    document.getElementById("input-text").focus();
                    break;
                case "KeyO": // Focus output
                    e.preventDefault();
                    document.getElementById("output-text").focus();
                    break;
                case "Period": // Focus next operation
                    e.preventDefault();
                    try {
                        elem = document.activeElement.closest(".operation") || document.querySelector("#rec-list .operation");
                        if (elem.parentNode.lastChild === elem) {
                            // If operation is last in recipe, loop around to the top operation's first argument
                            elem.parentNode.firstChild.querySelectorAll(".arg")[0].focus();
                        } else {
                            // Focus first argument of next operation
                            elem.nextSibling.querySelectorAll(".arg")[0].focus();
                        }
                    } catch (e) {
                        // do nothing, just don't throw an error
                    }
                    break;
                case "KeyB": // Set breakpoint
                    e.preventDefault();
                    try {
                        elem = document.activeElement.closest(".operation").querySelectorAll(".breakpoint")[0];
                        if (elem.getAttribute("break") === "false") {
                            elem.setAttribute("break", "true"); // add break point if not already enabled
                            elem.classList.add("breakpoint-selected");
                        } else {
                            elem.setAttribute("break", "false"); // remove break point if already enabled
                            elem.classList.remove("breakpoint-selected");
                        }
                        window.dispatchEvent(this.manager.statechange);
                    } catch (e) {
                        // do nothing, just don't throw an error
                    }
                    break;
                case "KeyD": // Disable operation
                    e.preventDefault();
                    try {
                        elem = document.activeElement.closest(".operation").querySelectorAll(".disable-icon")[0];
                        if (elem.getAttribute("disabled") === "false") {
                            elem.setAttribute("disabled", "true"); // disable operation if enabled
                            elem.classList.add("disable-elem-selected");
                            elem.parentNode.parentNode.classList.add("disabled");
                        } else {
                            elem.setAttribute("disabled", "false"); // enable operation if disabled
                            elem.classList.remove("disable-elem-selected");
                            elem.parentNode.parentNode.classList.remove("disabled");
                        }
                        this.app.progress = 0;
                        window.dispatchEvent(this.manager.statechange);
                    } catch (e) {
                        // do nothing, just don't throw an error
                    }
                    break;
                case "Space": // Bake
                    e.preventDefault();
                    this.manager.controls.bakeClick();
                    break;
                case "Quote": // Step through
                    e.preventDefault();
                    this.manager.controls.stepClick();
                    break;
                case "KeyC": // Clear recipe
                    e.preventDefault();
                    this.manager.recipe.clearRecipe();
                    break;
                case "KeyS": // Save output to file
                    e.preventDefault();
                    this.manager.output.saveClick();
                    break;
                case "KeyL": // Load recipe
                    e.preventDefault();
                    this.manager.controls.loadClick();
                    break;
                case "KeyM": // Switch input and output
                    e.preventDefault();
                    this.manager.output.switchClick();
                    break;
                case "KeyT": // New tab
                    e.preventDefault();
                    this.manager.input.addInputClick();
                    break;
                case "KeyW": // Close tab
                    e.preventDefault();
                    this.manager.input.removeInput(this.manager.input.getActiveTab());
                    break;
                case "ArrowLeft": // Go to previous tab
                    e.preventDefault();
                    this.manager.input.changeTabLeft();
                    break;
                case "ArrowRight": // Go to next tab
                    e.preventDefault();
                    this.manager.input.changeTabRight();
                    break;
                default:
                    if (e.code.match(/Digit[0-9]/g)) { // Select nth operation
                        e.preventDefault();
                        try {
                            // Select the first argument of the operation corresponding to the number pressed
                            document.querySelector(`li:nth-child(${e.code.substr(-1)}) .arg`).focus();
                        } catch (e) {
                            // do nothing, just don't throw an error
                        }
                    }
                    break;
            }
        }
    }


    /**
     * Updates keybinding list when metaKey option is toggled
     */
    updateKeybList() {
        let modWinLin = "Alt";
        let modMac = "Opt";
        if (this.app.options.useMetaKey) {
            modWinLin = "Win";
            modMac = "Cmd";
        }
        document.getElementById("keybList").innerHTML = `
        <tr>
            <td><b>Command</b></td>
            <td><b>Shortcut (Win/Linux)</b></td>
            <td><b>Shortcut (Mac)</b></td>
        </tr>
        <tr>
            <td>Place cursor in search field</td>
            <td>Ctrl+${modWinLin}+f</td>
            <td>Ctrl+${modMac}+f</td>
        <tr>
            <td>Place cursor in input box</td>
            <td>Ctrl+${modWinLin}+i</td>
            <td>Ctrl+${modMac}+i</td>
        </tr>
        <tr>
            <td>Place cursor in output box</td>
            <td>Ctrl+${modWinLin}+o</td>
            <td>Ctrl+${modMac}+o</td>
        </tr>
        <tr>
            <td>Place cursor in first argument field of the next operation in the recipe</td>
            <td>Ctrl+${modWinLin}+.</td>
            <td>Ctrl+${modMac}+.</td>
        </tr>
        <tr>
            <td>Place cursor in first argument field of the nth operation in the recipe</td>
            <td>Ctrl+${modWinLin}+[1-9]</td>
            <td>Ctrl+${modMac}+[1-9]</td>
        </tr>
        <tr>
            <td>Disable current operation</td>
            <td>Ctrl+${modWinLin}+d</td>
            <td>Ctrl+${modMac}+d</td>
        </tr>
        <tr>
            <td>Set/clear breakpoint</td>
            <td>Ctrl+${modWinLin}+b</td>
            <td>Ctrl+${modMac}+b</td>
        </tr>
        <tr>
            <td>Bake</td>
            <td>Ctrl+${modWinLin}+Space</td>
            <td>Ctrl+${modMac}+Space</td>
        </tr>
        <tr>
            <td>Step</td>
            <td>Ctrl+${modWinLin}+'</td>
            <td>Ctrl+${modMac}+'</td>
        </tr>
        <tr>
            <td>Clear recipe</td>
            <td>Ctrl+${modWinLin}+c</td>
            <td>Ctrl+${modMac}+c</td>
        </tr>
        <tr>
            <td>Save to file</td>
            <td>Ctrl+${modWinLin}+s</td>
            <td>Ctrl+${modMac}+s</td>
        </tr>
        <tr>
            <td>Load recipe</td>
            <td>Ctrl+${modWinLin}+l</td>
            <td>Ctrl+${modMac}+l</td>
        </tr>
        <tr>
            <td>Move output to input</td>
            <td>Ctrl+${modWinLin}+m</td>
            <td>Ctrl+${modMac}+m</td>
        </tr>
        <tr>
            <td>Create a new tab</td>
            <td>Ctrl+${modWinLin}+t</td>
            <td>Ctrl+${modMac}+t</td>
        </tr>
        <tr>
            <td>Close the current tab</td>
            <td>Ctrl+${modWinLin}+w</td>
            <td>Ctrl+${modMac}+w</td>
        </tr>
        <tr>
            <td>Go to next tab</td>
            <td>Ctrl+${modWinLin}+RightArrow</td>
            <td>Ctrl+${modMac}+RightArrow</td>
        </tr>
        <tr>
            <td>Go to previous tab</td>
            <td>Ctrl+${modWinLin}+LeftArrow</td>
            <td>Ctrl+${modMac}+LeftArrow</td>
        </tr>
        `;
    }

}

export default BindingsWaiter;
