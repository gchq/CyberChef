/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import WorkerWaiter from "./WorkerWaiter";
import WindowWaiter from "./WindowWaiter";
import ControlsWaiter from "./ControlsWaiter";
import RecipeWaiter from "./RecipeWaiter";
import OperationsWaiter from "./OperationsWaiter";
import InputWaiter from "./InputWaiter";
import OutputWaiter from "./OutputWaiter";
import OptionsWaiter from "./OptionsWaiter";
import HighlighterWaiter from "./HighlighterWaiter";
import SeasonalWaiter from "./SeasonalWaiter";
import BindingsWaiter from "./BindingsWaiter";
import BackgroundWorkerWaiter from "./BackgroundWorkerWaiter";


/**
 * This object controls the Waiters responsible for handling events from all areas of the app.
 */
class Manager {

    /**
     * Manager constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     */
    constructor(app) {
        this.app = app;

        // Define custom events
        /**
         * @event Manager#appstart
         */
        this.appstart = new CustomEvent("appstart", {bubbles: true});
        /**
         * @event Manager#apploaded
         */
        this.apploaded = new CustomEvent("apploaded", {bubbles: true});
        /**
         * @event Manager#operationadd
         */
        this.operationadd = new CustomEvent("operationadd", {bubbles: true});
        /**
         * @event Manager#operationremove
         */
        this.operationremove = new CustomEvent("operationremove", {bubbles: true});
        /**
         * @event Manager#oplistcreate
         */
        this.oplistcreate = new CustomEvent("oplistcreate", {bubbles: true});
        /**
         * @event Manager#statechange
         */
        this.statechange = new CustomEvent("statechange", {bubbles: true});

        // Define Waiter objects to handle various areas
        this.worker      = new WorkerWaiter(this.app, this);
        this.window      = new WindowWaiter(this.app);
        this.controls    = new ControlsWaiter(this.app, this);
        this.recipe      = new RecipeWaiter(this.app, this);
        this.ops         = new OperationsWaiter(this.app, this);
        this.input       = new InputWaiter(this.app, this);
        this.output      = new OutputWaiter(this.app, this);
        this.options     = new OptionsWaiter(this.app, this);
        this.highlighter = new HighlighterWaiter(this.app, this);
        this.seasonal    = new SeasonalWaiter(this.app, this);
        this.bindings    = new BindingsWaiter(this.app, this);
        this.background  = new BackgroundWorkerWaiter(this.app, this);

        // Object to store dynamic handlers to fire on elements that may not exist yet
        this.dynamicHandlers = {};

        this.initialiseEventListeners();
    }


    /**
     * Sets up the various components and listeners.
     */
    setup() {
        this.input.setupInputWorker();
        this.input.addInput(true);
        this.worker.setupChefWorker();
        this.recipe.initialiseOperationDragNDrop();
        this.controls.initComponents();
        this.controls.autoBakeChange();
        this.bindings.updateKeybList();
        this.background.registerChefWorker();
        this.seasonal.load();
    }


    /**
     * Main function to handle the creation of the event listeners.
     */
    initialiseEventListeners() {
        // Global
        window.addEventListener("resize", this.window.windowResize.bind(this.window));
        window.addEventListener("blur", this.window.windowBlur.bind(this.window));
        window.addEventListener("focus", this.window.windowFocus.bind(this.window));
        window.addEventListener("statechange", this.app.stateChange.bind(this.app));
        window.addEventListener("popstate", this.app.popState.bind(this.app));

        // Controls
        document.getElementById("bake").addEventListener("click", this.controls.bakeClick.bind(this.controls));
        document.getElementById("auto-bake").addEventListener("change", this.controls.autoBakeChange.bind(this.controls));
        document.getElementById("step").addEventListener("click", this.controls.stepClick.bind(this.controls));
        document.getElementById("clr-recipe").addEventListener("click", this.controls.clearRecipeClick.bind(this.controls));
        document.getElementById("save").addEventListener("click", this.controls.saveClick.bind(this.controls));
        document.getElementById("save-button").addEventListener("click", this.controls.saveButtonClick.bind(this.controls));
        document.getElementById("save-link-recipe-checkbox").addEventListener("change", this.controls.slrCheckChange.bind(this.controls));
        document.getElementById("save-link-input-checkbox").addEventListener("change", this.controls.sliCheckChange.bind(this.controls));
        document.getElementById("load").addEventListener("click", this.controls.loadClick.bind(this.controls));
        document.getElementById("load-delete-button").addEventListener("click", this.controls.loadDeleteClick.bind(this.controls));
        document.getElementById("load-name").addEventListener("change", this.controls.loadNameChange.bind(this.controls));
        document.getElementById("load-button").addEventListener("click", this.controls.loadButtonClick.bind(this.controls));
        document.getElementById("support").addEventListener("click", this.controls.supportButtonClick.bind(this.controls));
        this.addMultiEventListeners("#save-texts textarea", "keyup paste", this.controls.saveTextChange, this.controls);

        // Operations
        this.addMultiEventListener("#search", "keyup paste search", this.ops.searchOperations, this.ops);
        this.addDynamicListener(".op-list li.operation", "dblclick", this.ops.operationDblclick, this.ops);
        document.getElementById("edit-favourites").addEventListener("click", this.ops.editFavouritesClick.bind(this.ops));
        document.getElementById("save-favourites").addEventListener("click", this.ops.saveFavouritesClick.bind(this.ops));
        document.getElementById("reset-favourites").addEventListener("click", this.ops.resetFavouritesClick.bind(this.ops));
        this.addDynamicListener(".op-list", "oplistcreate", this.ops.opListCreate, this.ops);
        this.addDynamicListener("li.operation", "operationadd", this.recipe.opAdd, this.recipe);

        // Recipe
        this.addDynamicListener(".arg:not(select)", "input", this.recipe.ingChange, this.recipe);
        this.addDynamicListener(".arg[type=checkbox], .arg[type=radio], select.arg", "change", this.recipe.ingChange, this.recipe);
        this.addDynamicListener(".disable-icon", "click", this.recipe.disableClick, this.recipe);
        this.addDynamicListener(".breakpoint", "click", this.recipe.breakpointClick, this.recipe);
        this.addDynamicListener("#rec-list li.operation", "dblclick", this.recipe.operationDblclick, this.recipe);
        this.addDynamicListener("#rec-list li.operation > div", "dblclick", this.recipe.operationChildDblclick, this.recipe);
        this.addDynamicListener("#rec-list .dropdown-menu.toggle-dropdown a", "click", this.recipe.dropdownToggleClick, this.recipe);
        this.addDynamicListener("#rec-list", "operationremove", this.recipe.opRemove.bind(this.recipe));
        this.addDynamicListener("textarea.arg", "dragover", this.recipe.textArgDragover, this.recipe);
        this.addDynamicListener("textarea.arg", "dragleave", this.recipe.textArgDragLeave, this.recipe);
        this.addDynamicListener("textarea.arg", "drop", this.recipe.textArgDrop, this.recipe);

        // Input
        this.addMultiEventListener("#input-text", "keyup", this.input.inputChange, this.input);
        this.addMultiEventListener("#input-text", "paste", this.input.inputPaste, this.input);
        document.getElementById("reset-layout").addEventListener("click", this.app.resetLayout.bind(this.app));
        document.getElementById("clr-io").addEventListener("click", this.input.clearAllIoClick.bind(this.input));
        this.addListeners("#open-file,#open-folder", "change", this.input.inputOpen, this.input);
        this.addListeners("#input-text,#input-file", "dragover", this.input.inputDragover, this.input);
        this.addListeners("#input-text,#input-file", "dragleave", this.input.inputDragleave, this.input);
        this.addListeners("#input-text,#input-file", "drop", this.input.inputDrop, this.input);
        document.getElementById("input-text").addEventListener("scroll", this.highlighter.inputScroll.bind(this.highlighter));
        document.getElementById("input-text").addEventListener("mouseup", this.highlighter.inputMouseup.bind(this.highlighter));
        document.getElementById("input-text").addEventListener("mousemove", this.highlighter.inputMousemove.bind(this.highlighter));
        this.addMultiEventListener("#input-text", "mousedown dblclick select",  this.highlighter.inputMousedown, this.highlighter);
        document.querySelector("#input-file .close").addEventListener("click", this.input.clearIoClick.bind(this.input));
        document.getElementById("btn-new-tab").addEventListener("click", this.input.addInputClick.bind(this.input));
        document.getElementById("btn-previous-input-tab").addEventListener("click", this.input.changeTabLeft.bind(this.input));
        document.getElementById("btn-next-input-tab").addEventListener("click", this.input.changeTabRight.bind(this.input));
        document.getElementById("btn-go-to-input-tab").addEventListener("click", this.input.goToTab.bind(this.input));
        document.getElementById("btn-find-input-tab").addEventListener("click", this.input.findTab.bind(this.input));
        this.addDynamicListener("#input-tabs li .input-tab-content", "click", this.input.changeTabClick, this.input);
        document.getElementById("input-show-pending").addEventListener("change", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-show-loading").addEventListener("change", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-show-loaded").addEventListener("change", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-filename-filter").addEventListener("change", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-filename-filter").addEventListener("keyup", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-content-filter").addEventListener("change", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-content-filter").addEventListener("keyup", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-num-results").addEventListener("change", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-num-results").addEventListener("keyup", this.input.filterTabSearch.bind(this.input));
        document.getElementById("input-filter-refresh").addEventListener("click", this.input.filterTabSearch.bind(this.input));
        this.addDynamicListener(".input-filter-result", "click", this.input.filterItemClick, this.input);
        document.getElementById("btn-open-file").addEventListener("click", this.input.inputOpenClick.bind(this.input));
        document.getElementById("btn-open-folder").addEventListener("click", this.input.folderOpenClick.bind(this.input));


        // Output
        document.getElementById("save-to-file").addEventListener("click", this.output.saveClick.bind(this.output));
        document.getElementById("save-all-to-file").addEventListener("click", this.output.saveAllClick.bind(this.output));
        document.getElementById("copy-output").addEventListener("click", this.output.copyClick.bind(this.output));
        document.getElementById("switch").addEventListener("click", this.output.switchClick.bind(this.output));
        document.getElementById("undo-switch").addEventListener("click", this.output.undoSwitchClick.bind(this.output));
        document.getElementById("maximise-output").addEventListener("click", this.output.maximiseOutputClick.bind(this.output));
        document.getElementById("magic").addEventListener("click", this.output.magicClick.bind(this.output));
        document.getElementById("output-text").addEventListener("scroll", this.highlighter.outputScroll.bind(this.highlighter));
        document.getElementById("output-text").addEventListener("mouseup", this.highlighter.outputMouseup.bind(this.highlighter));
        document.getElementById("output-text").addEventListener("mousemove", this.highlighter.outputMousemove.bind(this.highlighter));
        document.getElementById("output-html").addEventListener("mouseup", this.highlighter.outputHtmlMouseup.bind(this.highlighter));
        document.getElementById("output-html").addEventListener("mousemove", this.highlighter.outputHtmlMousemove.bind(this.highlighter));
        this.addMultiEventListener("#output-text", "mousedown dblclick select",  this.highlighter.outputMousedown, this.highlighter);
        this.addMultiEventListener("#output-html", "mousedown dblclick select",  this.highlighter.outputHtmlMousedown, this.highlighter);
        this.addDynamicListener("#output-file-download", "click", this.output.downloadFile, this.output);
        this.addDynamicListener("#output-file-slice i", "click", this.output.displayFileSlice, this.output);
        document.getElementById("show-file-overlay").addEventListener("click", this.output.showFileOverlayClick.bind(this.output));
        // this.addDynamicListener(".extract-file,.extract-file i", "click", this.output.extractFileClick, this.output);
        this.addDynamicListener("#output-tabs-wrapper #output-tabs li .output-tab-content", "click", this.output.changeTabClick, this.output);
        document.getElementById("btn-previous-output-tab").addEventListener("click", this.output.changeTabLeft.bind(this.output));
        document.getElementById("btn-next-output-tab").addEventListener("click", this.output.changeTabRight.bind(this.output));
        document.getElementById("btn-go-to-output-tab").addEventListener("click", this.output.goToTab.bind(this.output));
        document.getElementById("btn-find-output-tab").addEventListener("click", this.output.findTab.bind(this.output));
        document.getElementById("output-show-pending").addEventListener("change", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-show-baking").addEventListener("change", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-show-baked").addEventListener("change", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-show-stale").addEventListener("change", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-show-errored").addEventListener("change", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-content-filter").addEventListener("change", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-content-filter").addEventListener("keyup", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-num-results").addEventListener("change", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-num-results").addEventListener("keyup", this.output.filterTabSearch.bind(this.output));
        document.getElementById("output-filter-refresh").addEventListener("click", this.output.filterTabSearch.bind(this.output));
        this.addDynamicListener(".output-filter-result", "click", this.output.filterItemClick, this.output);


        // Options
        document.getElementById("options").addEventListener("click", this.options.optionsClick.bind(this.options));
        document.getElementById("reset-options").addEventListener("click", this.options.resetOptionsClick.bind(this.options));
        this.addDynamicListener(".option-item input[type=checkbox]", "change", this.options.switchChange, this.options);
        this.addDynamicListener(".option-item input[type=checkbox]", "change", this.options.setWordWrap, this.options);
        this.addDynamicListener(".option-item input[type=checkbox]#useMetaKey", "change", this.bindings.updateKeybList, this.bindings);
        this.addDynamicListener(".option-item input[type=number]", "keyup", this.options.numberChange, this.options);
        this.addDynamicListener(".option-item input[type=number]", "change", this.options.numberChange, this.options);
        this.addDynamicListener(".option-item select", "change", this.options.selectChange, this.options);
        document.getElementById("theme").addEventListener("change", this.options.themeChange.bind(this.options));
        document.getElementById("logLevel").addEventListener("change", this.options.logLevelChange.bind(this.options));

        // Misc
        window.addEventListener("keydown", this.bindings.parseInput.bind(this.bindings));
    }


    /**
     * Adds an event listener to each element in the specified group.
     *
     * @param {string} selector - A selector string for the element group to add the event to, see
     *   this.getAll()
     * @param {string} eventType - The event to listen for
     * @param {function} callback - The function to execute when the event is triggered
     * @param {Object} [scope=this] - The object to bind to the callback function
     *
     * @example
     * // Calls the clickable function whenever any element with the .clickable class is clicked
     * this.addListeners(".clickable", "click", this.clickable, this);
     */
    addListeners(selector, eventType, callback, scope) {
        scope = scope || this;
        [].forEach.call(document.querySelectorAll(selector), function(el) {
            el.addEventListener(eventType, callback.bind(scope));
        });
    }


    /**
     * Adds multiple event listeners to the specified element.
     *
     * @param {string} selector - A selector string for the element to add the events to
     * @param {string} eventTypes - A space-separated string of all the event types to listen for
     * @param {function} callback - The function to execute when the events are triggered
     * @param {Object} [scope=this] - The object to bind to the callback function
     *
     * @example
     * // Calls the search function whenever the the keyup, paste or search events are triggered on the
     * // search element
     * this.addMultiEventListener("search", "keyup paste search", this.search, this);
     */
    addMultiEventListener(selector, eventTypes, callback, scope) {
        const evs = eventTypes.split(" ");
        for (let i = 0; i < evs.length; i++) {
            document.querySelector(selector).addEventListener(evs[i], callback.bind(scope));
        }
    }


    /**
     * Adds multiple event listeners to each element in the specified group.
     *
     * @param {string} selector - A selector string for the element group to add the events to
     * @param {string} eventTypes - A space-separated string of all the event types to listen for
     * @param {function} callback - The function to execute when the events are triggered
     * @param {Object} [scope=this] - The object to bind to the callback function
     *
     * @example
     * // Calls the save function whenever the the keyup or paste events are triggered on any element
     * // with the .saveable class
     * this.addMultiEventListener(".saveable", "keyup paste", this.save, this);
     */
    addMultiEventListeners(selector, eventTypes, callback, scope) {
        const evs = eventTypes.split(" ");
        for (let i = 0; i < evs.length; i++) {
            this.addListeners(selector, evs[i], callback, scope);
        }
    }


    /**
     * Adds an event listener to the global document object which will listen on dynamic elements which
     * may not exist in the DOM yet.
     *
     * @param {string} selector - A selector string for the element(s) to add the event to
     * @param {string} eventType - The event(s) to listen for
     * @param {function} callback - The function to execute when the event(s) is/are triggered
     * @param {Object} [scope=this] - The object to bind to the callback function
     *
     * @example
     * // Pops up an alert whenever any button is clicked, even if it is added to the DOM after this
     * // listener is created
     * this.addDynamicListener("button", "click", alert, this);
     */
    addDynamicListener(selector, eventType, callback, scope) {
        const eventConfig = {
            selector: selector,
            callback: callback.bind(scope || this)
        };

        if (this.dynamicHandlers.hasOwnProperty(eventType)) {
            // Listener already exists, add new handler to the appropriate list
            this.dynamicHandlers[eventType].push(eventConfig);
        } else {
            this.dynamicHandlers[eventType] = [eventConfig];
            // Set up listener for this new type
            document.addEventListener(eventType, this.dynamicListenerHandler.bind(this));
        }
    }


    /**
     * Handler for dynamic events. This function is called for any dynamic event and decides which
     * callback(s) to execute based on the type and selector.
     *
     * @param {Event} e - The event to be handled
     */
    dynamicListenerHandler(e) {
        const { type, target } = e;
        const handlers = this.dynamicHandlers[type];
        const matches = target.matches ||
                target.webkitMatchesSelector ||
                target.mozMatchesSelector ||
                target.msMatchesSelector ||
                target.oMatchesSelector;

        for (let i = 0; i < handlers.length; i++) {
            if (matches && matches.call(target, handlers[i].selector)) {
                handlers[i].callback(e);
            }
        }
    }
}

export default Manager;
