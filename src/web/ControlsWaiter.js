import Utils from "../core/Utils.js";


/**
 * Waiter to handle events related to the CyberChef controls (i.e. Bake, Step, Save, Load etc.)
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {App} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
const ControlsWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;
};


/**
 * Adjusts the display properties of the control buttons so that they fit within the current width
 * without wrapping or overflowing.
 */
ControlsWaiter.prototype.adjustWidth = function() {
    const controls     = document.getElementById("controls");
    const step         = document.getElementById("step");
    const clrBreaks    = document.getElementById("clr-breaks");
    const saveImg      = document.querySelector("#save img");
    const loadImg      = document.querySelector("#load img");
    const stepImg      = document.querySelector("#step img");
    const clrRecipImg  = document.querySelector("#clr-recipe img");
    const clrBreaksImg = document.querySelector("#clr-breaks img");

    if (controls.clientWidth < 470) {
        step.childNodes[1].nodeValue = " Step";
    } else {
        step.childNodes[1].nodeValue = " Step through";
    }

    if (controls.clientWidth < 400) {
        saveImg.style.display = "none";
        loadImg.style.display = "none";
        stepImg.style.display = "none";
        clrRecipImg.style.display = "none";
        clrBreaksImg.style.display = "none";
    } else {
        saveImg.style.display = "inline";
        loadImg.style.display = "inline";
        stepImg.style.display = "inline";
        clrRecipImg.style.display = "inline";
        clrBreaksImg.style.display = "inline";
    }

    if (controls.clientWidth < 330) {
        clrBreaks.childNodes[1].nodeValue = " Clear breaks";
    } else {
        clrBreaks.childNodes[1].nodeValue = " Clear breakpoints";
    }
};


/**
 * Checks or unchecks the Auto Bake checkbox based on the given value.
 *
 * @param {boolean} value - The new value for Auto Bake.
 */
ControlsWaiter.prototype.setAutoBake = function(value) {
    const autoBakeCheckbox = document.getElementById("auto-bake");

    if (autoBakeCheckbox.checked !== value) {
        autoBakeCheckbox.click();
    }
};


/**
 * Handler to trigger baking.
 */
ControlsWaiter.prototype.bakeClick = function() {
    this.app.bake();
    const outputText = document.getElementById("output-text");
    outputText.focus();
    outputText.setSelectionRange(0, 0);
};


/**
 * Handler for the 'Step through' command. Executes the next step of the recipe.
 */
ControlsWaiter.prototype.stepClick = function() {
    this.app.bake(true);
    const outputText = document.getElementById("output-text");
    outputText.focus();
    outputText.setSelectionRange(0, 0);
};


/**
 * Handler for changes made to the Auto Bake checkbox.
 */
ControlsWaiter.prototype.autoBakeChange = function() {
    const autoBakeLabel    = document.getElementById("auto-bake-label");
    const autoBakeCheckbox = document.getElementById("auto-bake");

    this.app.autoBake_ = autoBakeCheckbox.checked;

    if (autoBakeCheckbox.checked) {
        autoBakeLabel.classList.add("btn-success");
        autoBakeLabel.classList.remove("btn-default");
    } else {
        autoBakeLabel.classList.add("btn-default");
        autoBakeLabel.classList.remove("btn-success");
    }
};


/**
 * Handler for the 'Clear recipe' command. Removes all operations from the recipe.
 */
ControlsWaiter.prototype.clearRecipeClick = function() {
    this.manager.recipe.clearRecipe();
};


/**
 * Handler for the 'Clear breakpoints' command. Removes all breakpoints from operations in the
 * recipe.
 */
ControlsWaiter.prototype.clearBreaksClick = function() {
    const bps = document.querySelectorAll("#rec-list li.operation .breakpoint");

    for (let i = 0; i < bps.length; i++) {
        bps[i].setAttribute("break", "false");
        bps[i].classList.remove("breakpoint-selected");
    }
};


/**
 * Populates the save disalog box with a URL incorporating the recipe and input.
 *
 * @param {Object[]} [recipeConfig] - The recipe configuration object array.
 */
ControlsWaiter.prototype.initialiseSaveLink = function(recipeConfig) {
    recipeConfig = recipeConfig || this.app.getRecipeConfig();

    const includeRecipe = document.getElementById("save-link-recipe-checkbox").checked;
    const includeInput = document.getElementById("save-link-input-checkbox").checked;
    const saveLinkEl = document.getElementById("save-link");
    const saveLink = this.generateStateUrl(includeRecipe, includeInput, recipeConfig);

    saveLinkEl.innerHTML = Utils.truncate(saveLink, 120);
    saveLinkEl.setAttribute("href", saveLink);
};


/**
 * Generates a URL containing the current recipe and input state.
 *
 * @param {boolean} includeRecipe - Whether to include the recipe in the URL.
 * @param {boolean} includeInput - Whether to include the input in the URL.
 * @param {Object[]} [recipeConfig] - The recipe configuration object array.
 * @param {string} [baseURL] - The CyberChef URL, set to the current URL if not included
 * @returns {string}
 */
ControlsWaiter.prototype.generateStateUrl = function(includeRecipe, includeInput, recipeConfig, baseURL) {
    recipeConfig = recipeConfig || this.app.getRecipeConfig();

    const link = baseURL || window.location.protocol + "//" +
        window.location.host +
        window.location.pathname;
    const recipeStr = JSON.stringify(recipeConfig);
    const inputStr = Utils.toBase64(this.app.getInput(), "A-Za-z0-9+/"); // B64 alphabet with no padding

    includeRecipe = includeRecipe && (recipeConfig.length > 0);
    // Only inlcude input if it is less than 50KB (51200 * 4/3 as it is Base64 encoded)
    includeInput = includeInput && (inputStr.length > 0) && (inputStr.length <= 68267);

    const params = [
        includeRecipe ? ["recipe", recipeStr] : undefined,
        includeInput ? ["input", inputStr] : undefined,
    ];

    const hash = params
       .filter(v => v)
       .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
       .join("&");

    if (hash) {
        return `${link}#${hash}`;
    }

    return link;
};


/**
 * Handler for changes made to the save dialog text area. Re-initialises the save link.
 */
ControlsWaiter.prototype.saveTextChange = function() {
    try {
        const recipeConfig = JSON.parse(document.getElementById("save-text").value);
        this.initialiseSaveLink(recipeConfig);
    } catch (err) {}
};


/**
 * Handler for the 'Save' command. Pops up the save dialog box.
 */
ControlsWaiter.prototype.saveClick = function() {
    const recipeConfig = this.app.getRecipeConfig();
    const recipeStr = JSON.stringify(recipeConfig).replace(/},{/g, "},\n{");

    document.getElementById("save-text").value = recipeStr;

    this.initialiseSaveLink(recipeConfig);
    $("#save-modal").modal();
};


/**
 * Handler for the save link recipe checkbox change event.
 */
ControlsWaiter.prototype.slrCheckChange = function() {
    this.initialiseSaveLink();
};


/**
 * Handler for the save link input checkbox change event.
 */
ControlsWaiter.prototype.sliCheckChange = function() {
    this.initialiseSaveLink();
};


/**
 * Handler for the 'Load' command. Pops up the load dialog box.
 */
ControlsWaiter.prototype.loadClick = function() {
    this.populateLoadRecipesList();
    $("#load-modal").modal();
};


/**
 * Saves the recipe specified in the save textarea to local storage.
 */
ControlsWaiter.prototype.saveButtonClick = function() {
    const recipeName = Utils.escapeHtml(document.getElementById("save-name").value);
    const recipeStr  = document.getElementById("save-text").value;

    if (!recipeName) {
        this.app.alert("Please enter a recipe name", "danger", 2000);
        return;
    }

    let savedRecipes = localStorage.savedRecipes ?
            JSON.parse(localStorage.savedRecipes) : [],
        recipeId = localStorage.recipeId || 0;

    savedRecipes.push({
        id: ++recipeId,
        name: recipeName,
        recipe: recipeStr
    });

    localStorage.savedRecipes = JSON.stringify(savedRecipes);
    localStorage.recipeId = recipeId;

    this.app.alert("Recipe saved as \"" + recipeName + "\".", "success", 2000);
};


/**
 * Populates the list of saved recipes in the load dialog box from local storage.
 */
ControlsWaiter.prototype.populateLoadRecipesList = function() {
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
    document.getElementById("load-text").value = savedRecipes.length ? savedRecipes[0].recipe : "";
};


/**
 * Removes the currently selected recipe from local storage.
 */
ControlsWaiter.prototype.loadDeleteClick = function() {
    const id = parseInt(document.getElementById("load-name").value, 10);
    const rawSavedRecipes = localStorage.savedRecipes ?
            JSON.parse(localStorage.savedRecipes) : [];

    const savedRecipes = rawSavedRecipes.filter(r => r.id !== id);

    localStorage.savedRecipes = JSON.stringify(savedRecipes);
    this.populateLoadRecipesList();
};


/**
 * Displays the selected recipe in the load text box.
 */
ControlsWaiter.prototype.loadNameChange = function(e) {
    const el = e.target;
    const savedRecipes = localStorage.savedRecipes ?
            JSON.parse(localStorage.savedRecipes) : [];
    const id = parseInt(el.value, 10);

    const recipe = savedRecipes.find(r => r.id === id);

    document.getElementById("load-text").value = recipe.recipe;
};


/**
 * Loads the selected recipe and populates the Recipe with its operations.
 */
ControlsWaiter.prototype.loadButtonClick = function() {
    try {
        const recipeConfig = JSON.parse(document.getElementById("load-text").value);
        this.app.setRecipeConfig(recipeConfig);

        $("#rec-list [data-toggle=popover]").popover();
    } catch (e) {
        this.app.alert("Invalid recipe", "danger", 2000);
    }
};


/**
 * Populates the bug report information box with useful technical info.
 *
 * @param {event} e
 */
ControlsWaiter.prototype.supportButtonClick = function(e) {
    e.preventDefault();

    const reportBugInfo = document.getElementById("report-bug-info");
    const saveLink = this.generateStateUrl(true, true, null, "https://gchq.github.io/CyberChef/");

    if (reportBugInfo) {
        reportBugInfo.innerHTML = "* Version: " + PKG_VERSION + "\n" +
            "* Compile time: " + COMPILE_TIME + "\n" +
            "* User-Agent: \n" + navigator.userAgent + "\n" +
            "* [Link to reproduce](" + saveLink + ")\n\n";
    }
};

export default ControlsWaiter;
