/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../core/Utils";
import {toBase64} from "../core/lib/Base64";


/**
 * Waiter to handle events related to the CyberChef controls (i.e. Bake, Step, Save, Load etc.)
 */
class ControlsWaiter {

    /**
     * ControlsWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
    }


    /**
     * Initialise Bootstrap componenets
     */
    initComponents() {
        $("body").bootstrapMaterialDesign();
        $("[data-toggle=tooltip]").tooltip({
            animation: false,
            container: "body",
            boundary: "viewport",
            trigger: "hover"
        });
    }


    /**
     * Checks or unchecks the Auto Bake checkbox based on the given value.
     *
     * @param {boolean} value - The new value for Auto Bake.
     */
    setAutoBake(value) {
        const autoBakeCheckbox = document.getElementById("auto-bake");

        if (autoBakeCheckbox.checked !== value) {
            autoBakeCheckbox.click();
        }
    }


    /**
     * Handler to trigger baking.
     */
    bakeClick() {
        const btnBake = document.getElementById("bake");
        if (btnBake.textContent.indexOf("Bake") > 0) {
            this.app.manager.input.getAll();
        } else if (btnBake.textContent.indexOf("Cancel") > 0) {
            this.manager.worker.cancelBake();
        }
    }


    /**
     * Handler for the 'Step through' command. Executes the next step of the recipe.
     */
    stepClick() {
        this.app.bake(true);
    }


    /**
     * Handler for changes made to the Auto Bake checkbox.
     */
    autoBakeChange() {
        this.app.autoBake_ = document.getElementById("auto-bake").checked;
    }


    /**
     * Handler for the 'Clear recipe' command. Removes all operations from the recipe.
     */
    clearRecipeClick() {
        this.manager.recipe.clearRecipe();
    }


    /**
     * Populates the save disalog box with a URL incorporating the recipe and input.
     *
     * @param {Object[]} [recipeConfig] - The recipe configuration object array.
     */
    initialiseSaveLink(recipeConfig) {
        recipeConfig = recipeConfig || this.app.getRecipeConfig();

        const includeRecipe = document.getElementById("save-link-recipe-checkbox").checked;
        const includeInput = document.getElementById("save-link-input-checkbox").checked;
        const saveLinkEl = document.getElementById("save-link");
        const saveLink = this.generateStateUrl(includeRecipe, includeInput, recipeConfig);

        saveLinkEl.innerHTML = Utils.truncate(saveLink, 120);
        saveLinkEl.setAttribute("href", saveLink);
    }


    /**
     * Generates a URL containing the current recipe and input state.
     *
     * @param {boolean} includeRecipe - Whether to include the recipe in the URL.
     * @param {boolean} includeInput - Whether to include the input in the URL.
     * @param {Object[]} [recipeConfig] - The recipe configuration object array.
     * @param {string} [baseURL] - The CyberChef URL, set to the current URL if not included
     * @returns {string}
     */
    generateStateUrl(includeRecipe, includeInput, recipeConfig, baseURL) {
        recipeConfig = recipeConfig || this.app.getRecipeConfig();

        const link = baseURL || window.location.protocol + "//" +
            window.location.host +
            window.location.pathname;
        const recipeStr = Utils.generatePrettyRecipe(recipeConfig);
        const inputStr = toBase64(this.app.getInput().input, "A-Za-z0-9+/"); // B64 alphabet with no padding

        includeRecipe = includeRecipe && (recipeConfig.length > 0);
        // Only inlcude input if it is less than 50KB (51200 * 4/3 as it is Base64 encoded)
        includeInput = includeInput && (inputStr.length > 0) && (inputStr.length <= 68267);

        const params = [
            includeRecipe ? ["recipe", recipeStr] : undefined,
            includeInput ? ["input", inputStr] : undefined,
        ];

        const hash = params
            .filter(v => v)
            .map(([key, value]) => `${key}=${Utils.encodeURIFragment(value)}`)
            .join("&");

        if (hash) {
            return `${link}#${hash}`;
        }

        return link;
    }


    /**
     * Handler for changes made to the save dialog text area. Re-initialises the save link.
     */
    saveTextChange(e) {
        try {
            const recipeConfig = Utils.parseRecipeConfig(e.target.value);
            this.initialiseSaveLink(recipeConfig);
        } catch (err) {}
    }


    /**
     * Handler for the 'Save' command. Pops up the save dialog box.
     */
    saveClick() {
        const recipeConfig = this.app.getRecipeConfig();
        const recipeStr = JSON.stringify(recipeConfig);

        document.getElementById("save-text-chef").value = Utils.generatePrettyRecipe(recipeConfig, true);
        document.getElementById("save-text-clean").value = JSON.stringify(recipeConfig, null, 2)
            .replace(/{\n\s+"/g, "{ \"")
            .replace(/\[\n\s{3,}/g, "[")
            .replace(/\n\s{3,}]/g, "]")
            .replace(/\s*\n\s*}/g, " }")
            .replace(/\n\s{6,}/g, " ");
        document.getElementById("save-text-compact").value = recipeStr;

        this.initialiseSaveLink(recipeConfig);
        $("#save-modal").modal();
    }


    /**
     * Handler for the save link recipe checkbox change event.
     */
    slrCheckChange() {
        this.initialiseSaveLink();
    }


    /**
     * Handler for the save link input checkbox change event.
     */
    sliCheckChange() {
        this.initialiseSaveLink();
    }


    /**
     * Handler for the 'Load' command. Pops up the load dialog box.
     */
    loadClick() {
        this.populateLoadRecipesList();
        $("#load-modal").modal();
    }


    /**
     * Saves the recipe specified in the save textarea to local storage.
     */
    saveButtonClick() {
        if (!this.app.isLocalStorageAvailable()) {
            this.app.alert(
                "Your security settings do not allow access to local storage so your recipe cannot be saved.",
                5000
            );
            return false;
        }

        const recipeName = Utils.escapeHtml(document.getElementById("save-name").value);
        const recipeStr  = document.querySelector("#save-texts .tab-pane.active textarea").value;

        if (!recipeName) {
            this.app.alert("Please enter a recipe name", 3000);
            return;
        }

        const savedRecipes = localStorage.savedRecipes ?
            JSON.parse(localStorage.savedRecipes) : [];
        let recipeId = localStorage.recipeId || 0;

        savedRecipes.push({
            id: ++recipeId,
            name: recipeName,
            recipe: recipeStr
        });

        localStorage.savedRecipes = JSON.stringify(savedRecipes);
        localStorage.recipeId = recipeId;

        this.app.alert(`Recipe saved as "${recipeName}".`, 3000);
    }


    /**
     * Populates the list of saved recipes in the load dialog box from local storage.
     */
    populateLoadRecipesList() {
        if (!this.app.isLocalStorageAvailable()) return false;

        const loadNameEl = document.getElementById("load-name");

        // Remove current recipes from select
        let i = loadNameEl.options.length;
        while (i--) {
            loadNameEl.remove(i);
        }

        // Add recipes to select
        const savedRecipes = localStorage.savedRecipes ?
            JSON.parse(localStorage.savedRecipes) : [];

        for (i = 0; i < savedRecipes.length; i++) {
            const opt = document.createElement("option");
            opt.value = savedRecipes[i].id;
            // Unescape then re-escape in case localStorage has been corrupted
            opt.innerHTML = Utils.escapeHtml(Utils.unescapeHtml(savedRecipes[i].name));

            loadNameEl.appendChild(opt);
        }

        // Populate textarea with first recipe
        const loadText = document.getElementById("load-text");
        const evt = new Event("change");
        loadText.value = savedRecipes.length ? savedRecipes[0].recipe : "";
        loadText.dispatchEvent(evt);
    }


    /**
     * Removes the currently selected recipe from local storage.
     */
    loadDeleteClick() {
        if (!this.app.isLocalStorageAvailable()) return false;

        const id = parseInt(document.getElementById("load-name").value, 10);
        const rawSavedRecipes = localStorage.savedRecipes ?
            JSON.parse(localStorage.savedRecipes) : [];

        const savedRecipes = rawSavedRecipes.filter(r => r.id !== id);

        localStorage.savedRecipes = JSON.stringify(savedRecipes);
        this.populateLoadRecipesList();
    }


    /**
     * Displays the selected recipe in the load text box.
     */
    loadNameChange(e) {
        if (!this.app.isLocalStorageAvailable()) return false;

        const el = e.target;
        const savedRecipes = localStorage.savedRecipes ?
            JSON.parse(localStorage.savedRecipes) : [];
        const id = parseInt(el.value, 10);

        const recipe = savedRecipes.find(r => r.id === id);

        document.getElementById("load-text").value = recipe.recipe;
    }


    /**
     * Loads the selected recipe and populates the Recipe with its operations.
     */
    loadButtonClick() {
        try {
            const recipeConfig = Utils.parseRecipeConfig(document.getElementById("load-text").value);
            this.app.setRecipeConfig(recipeConfig);
            this.app.autoBake();

            $("#rec-list [data-toggle=popover]").popover();
        } catch (e) {
            this.app.alert("Invalid recipe", 2000);
        }
    }


    /**
     * Populates the bug report information box with useful technical info.
     *
     * @param {event} e
     */
    supportButtonClick(e) {
        e.preventDefault();

        const reportBugInfo = document.getElementById("report-bug-info");
        const saveLink = this.generateStateUrl(true, true, null, "https://gchq.github.io/CyberChef/");

        if (reportBugInfo) {
            reportBugInfo.innerHTML = `* Version: ${PKG_VERSION}
* Compile time: ${COMPILE_TIME}
* User-Agent:
${navigator.userAgent}
* [Link to reproduce](${saveLink})

`;
        }
    }


    /**
     * Shows the stale indicator to show that the input or recipe has changed
     * since the last bake.
     */
    showStaleIndicator() {
        const staleIndicator = document.getElementById("stale-indicator");
        staleIndicator.classList.remove("hidden");
    }


    /**
     * Hides the stale indicator to show that the input or recipe has not changed
     * since the last bake.
     */
    hideStaleIndicator() {
        const staleIndicator = document.getElementById("stale-indicator");
        staleIndicator.classList.add("hidden");
    }


    /**
     * Switches the Bake button between 'Bake', 'Cancel' and 'Loading' functions.
     *
     * @param {boolean} cancel - Whether to change to cancel or not
     * @param {boolean} loading - Whether to change to loading or not
     */
    toggleBakeButtonFunction(cancel, loading) {
        const bakeButton = document.getElementById("bake"),
            btnText = bakeButton.querySelector("span");

        bakeButton.style.background = "";

        if (cancel) {
            btnText.innerText = "Cancel";
            bakeButton.classList.remove("btn-success");
            bakeButton.classList.remove("btn-warning");
            bakeButton.classList.add("btn-danger");
        } else if (loading) {
            btnText.innerText = "Loading...";
            bakeButton.classList.remove("btn-success");
            bakeButton.classList.remove("btn-danger");
            bakeButton.classList.add("btn-warning");
        } else {
            btnText.innerText = "Bake!";
            bakeButton.classList.remove("btn-danger");
            bakeButton.classList.remove("btn-warning");
            bakeButton.classList.add("btn-success");
        }
    }

}

export default ControlsWaiter;
