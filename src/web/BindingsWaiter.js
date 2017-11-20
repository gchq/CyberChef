/**
 * Waiter to handle keybindings to CyberChef functions (i.e. Bake, Step, Save, Load etc.)
 *
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {App} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
const BindingsWaiter = function (app, manager) {
    this.app = app;
    this.manager = manager;
};


/**
 * Handler for all keydown events
 * Checks whether valid keyboard shortcut has been instated
 *
 * @fires Manager#statechange
 * @param {event} e
 */
BindingsWaiter.prototype.parseInput = function(e) {
    let modKey = e.altKey;
    if (this.app.options.useMetaKey) modKey = e.metaKey;
    if (e.ctrlKey && modKey) {
        let elem;
        switch (e.code) {
            case "KeyF":
                e.preventDefault();
                document.getElementById("search").focus(); // Focus search
                break;
            case "KeyI":
                e.preventDefault();
                document.getElementById("input-text").focus(); // Focus input
                break;
            case "KeyO":
                e.preventDefault();
                document.getElementById("output-text").focus(); // Focus output
                break;
            case "Period":
                try {
                    elem = document.activeElement.closest(".operation");
                    if (elem.parentNode.lastChild === elem) {
                        elem.parentNode.firstChild.querySelectorAll(".arg")[0].focus(); // if operation is last in recipe, loop around to the top operation's first argument
                    } else {
                        elem.nextSibling.querySelectorAll(".arg")[0].focus(); //focus first argument of next operation
                    }
                } catch (e) {
                    // do nothing, just don't throw an error
                }
                break;
            case "KeyB":
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
            case "KeyD":
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
            case "Space":
                this.app.bake(); // bake the recipe
                break;
            case "Quote":
                this.app.bake(true); // step through the recipe
                break;
            case "KeyC":
                this.manager.recipe.clearRecipe(); // clear recipe
                break;
            case "KeyS":
                this.manager.output.saveClick(); // save output to file
                break;
            case "KeyL":
                this.manager.controls.loadClick(); // load a recipe
                break;
            case "KeyM":
                this.manager.controls.switchClick(); // switch input & output
                break;
            default:
                if (e.code.match(/Digit[0-9]/g)) {
                    e.preventDefault();
                    try {
                        document.querySelector(`li:nth-child(${e.code.substr(-1)}) .arg`).focus(); // select the first argument of the operation corresponding to the number pressed
                    } catch (e) {
                        // do nothing, just don't throw an error
                    }
                }
                break;
        }
    }
};

/**
 * Updates keybinding list when metaKey option is toggled
 *
 */
BindingsWaiter.prototype.updateKeybList = function() {
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
        <td>Place cursor in first argument field<br>of the next operation in the recipe</td>
        <td>Ctrl+${modWinLin}+.</td>
        <td>Ctrl+${modMac}+.</td>
    </tr>
    <tr>
        <td>Place cursor in first argument field<br>of the nth operation in the recipe</td>
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
    `;
};

export default BindingsWaiter;
