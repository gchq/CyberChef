/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils, { debounce } from "../core/Utils.mjs";
import {fromBase64} from "../core/lib/Base64.mjs";
import Manager from "./Manager.mjs";
import HTMLCategory from "./HTMLCategory.mjs";
import HTMLOperation from "./HTMLOperation.mjs";
import Split from "split.js";
import moment from "moment-timezone";
import cptable from "codepage";


/**
 * HTML view for CyberChef responsible for building the web page and dealing with all user
 * interactions.
 */
class App {

    /**
     * App constructor.
     *
     * @param {CatConf[]} categories - The list of categories and operations to be populated.
     * @param {Object.<string, OpConf>} operations - The list of operation configuration objects.
     * @param {String[]} defaultFavourites - A list of default favourite operations.
     * @param {Object} options - Default setting for app options.
     */
    constructor(categories, operations, defaultFavourites, defaultOptions) {
        this.categories    = categories;
        this.operations    = operations;
        this.dfavourites   = defaultFavourites;
        this.doptions      = defaultOptions;
        this.options       = Object.assign({}, defaultOptions);

        this.manager       = new Manager(this);

        this.baking        = false;
        this.autoBake_     = false;
        this.progress      = 0;
        this.ingId         = 0;

        this.appLoaded     = false;
        this.workerLoaded  = false;
        this.waitersLoaded = false;

        this.snackbars     = [];
    }


    /**
     * This function sets up the stage and creates listeners for all events.
     *
     * @fires Manager#appstart
     */
    setup() {
        document.dispatchEvent(this.manager.appstart);

        this.initialiseSplitter();
        this.loadLocalStorage();
        this.manager.options.applyPreferredColorScheme();
        this.populateOperationsList();
        this.manager.setup();
        this.manager.output.saveBombe();
        this.adjustComponentSizes();
        // this.setCompileMessage();
        this.uriParams = this.getURIParams();

        log.debug("App loaded");
        this.appLoaded = true;
        this.loaded();
    }


    /**
     * Fires once all setup activities have completed.
     *
     * @fires Manager#apploaded
     */
    loaded() {
        // Check that both the app and the worker have loaded successfully, and that
        // we haven't already loaded before attempting to remove the loading screen.
        if (!this.workerLoaded || !this.appLoaded || !this.waitersLoaded ||
            !document.getElementById("loader-wrapper")) return;

        // Load state from URI
        this.loadURIParams(this.uriParams);

        // Trigger CSS animations to remove preloader
        document.body.classList.add("loaded");

        // Wait for animations to complete then remove the preloader and loaded style
        // so that the animations for existing elements don't play again.
        setTimeout(function() {
            document.getElementById("loader-wrapper").remove();
            document.body.classList.remove("loaded");

            // Bake initial input
            this.manager.input.bakeAll();
        }.bind(this), 1000);

        // Clear the loading message interval
        clearInterval(window.loadingMsgsInt);

        // Remove the loading error handler
        window.removeEventListener("error", window.loadingErrorHandler);

        document.dispatchEvent(this.manager.apploaded);

        this.manager.input.calcMaxTabs();
        this.manager.output.calcMaxTabs();
    }


    /**
     * An error handler for displaying the error to the user.
     *
     * @param {Error} err
     * @param {boolean} [logToConsole=false]
     */
    handleError(err, logToConsole) {
        if (logToConsole) log.error(err);
        const msg = err.displayStr || err.toString();
        this.alert(Utils.escapeHtml(msg), this.options.errorTimeout, !this.options.showErrors);
    }


    /**
     * Asks the ChefWorker to bake the current input using the current recipe.
     *
     * @param {boolean} [step] - Set to true if we should only execute one operation instead of the
     *   whole recipe.
     */
    bake(step=false) {
        if (this.baking) return;

        // Reset attemptHighlight flag
        this.options.attemptHighlight = true;

        // Remove all current indicators
        this.manager.recipe.updateBreakpointIndicator(false);

        this.manager.worker.bake(
            this.getRecipeConfig(), // The configuration of the recipe
            this.options,           // Options set by the user
            this.progress,          // The current position in the recipe
            step                    // Whether or not to take one step or execute the whole recipe
        );
    }


    /**
     * Runs Auto Bake if it is set.
     */
    autoBake() {
        if (this.baking) {
            this.manager.worker.cancelBakeForAutoBake();
            this.baking = false;
        }

        if (this.autoBake_) {
            log.debug("Auto-baking");
            this.manager.worker.bakeInputs({
                nums: [this.manager.tabs.getActiveTab("input")],
                step: false
            });
        } else {
            this.manager.controls.showStaleIndicator();
        }
    }


    /**
     * Executes the next step of the recipe.
     */
    step() {
        if (this.baking) return;

        // Reset status using cancelBake
        this.manager.worker.cancelBake(true, false);

        const activeTab = this.manager.tabs.getActiveTab("input");
        if (activeTab === -1) return;

        let progress = 0;
        if (this.manager.output.outputs[activeTab].progress !== false) {
            log.error(this.manager.output.outputs[activeTab]);
            progress = this.manager.output.outputs[activeTab].progress;
        }

        this.manager.input.inputWorker.postMessage({
            action: "step",
            data: {
                activeTab: activeTab,
                progress: progress + 1
            }
        });
    }


    /**
     * Runs a silent bake, forcing the browser to load and cache all the relevant JavaScript code needed
     * to do a real bake.
     *
     * The output will not be modified (hence "silent" bake). This will only actually execute the recipe
     * if auto-bake is enabled, otherwise it will just wake up the ChefWorker with an empty recipe.
     */
    silentBake() {
        let recipeConfig = [];

        if (this.autoBake_) {
            // If auto-bake is not enabled we don't want to actually run the recipe as it may be disabled
            // for a good reason.
            recipeConfig = this.getRecipeConfig();
        }

        this.manager.worker.silentBake(recipeConfig);
    }


    /**
     * Sets the user's input data.
     *
     * @param {string} input - The string to set the input to
     */
    setInput(input) {
        // Get the currently active tab.
        // If there isn't one, assume there are no inputs so use inputNum of 1
        let inputNum = this.manager.tabs.getActiveTab("input");
        if (inputNum === -1) inputNum = 1;
        this.manager.input.updateInputValue(inputNum, input);

        this.manager.input.inputWorker.postMessage({
            action: "setInput",
            data: {
                inputNum: inputNum,
                silent: true
            }
        });
    }


    /**
     * Populates the operations accordion list with the categories and operations specified in the
     * view constructor.
     *
     * @fires Manager#oplistcreate
     */
    populateOperationsList() {
        // Move edit button away before we overwrite it
        document.body.appendChild(document.getElementById("edit-favourites"));

        let html = "";
        let i;

        for (i = 0; i < this.categories.length; i++) {
            const catConf = this.categories[i],
                selected = i === 0,
                cat = new HTMLCategory(catConf.name, selected);

            for (let j = 0; j < catConf.ops.length; j++) {
                const opName = catConf.ops[j];
                if (!(opName in this.operations)) {
                    log.warn(`${opName} could not be found.`);
                    continue;
                }

                const op = new HTMLOperation(opName, this.operations[opName], this, this.manager);
                cat.addOperation(op);
            }

            html += cat.toHtml();
        }

        document.getElementById("categories").innerHTML = html;

        const opLists = document.querySelectorAll("#categories .op-list");

        for (i = 0; i < opLists.length; i++) {
            opLists[i].dispatchEvent(this.manager.oplistcreate);
        }

        // Add edit button to first category (Favourites)
        const favCat = document.querySelector("#categories a");
        favCat.appendChild(document.getElementById("edit-favourites"));
        favCat.setAttribute("data-help-title", "Favourite operations");
        favCat.setAttribute("data-help", `<p>This category displays your favourite operations.</p>
        <ul>
            <li><b>To add:</b> drag an operation over the Favourites category</li>
            <li><b>To reorder:</b> Click on the 'Edit favourites' button and drag operations up and down in the list provided</li>
            <li><b>To remove:</b> Click on the 'Edit favourites' button and hit the delete button next to the operation you want to remove</li>
        </ul>`);
    }


    /**
     * Sets up the adjustable splitter to allow the user to resize areas of the page.
     *
     * @param {boolean} [minimise=false] - Set this flag if attempting to minimise frames to 0 width
     */
    initialiseSplitter(minimise=false) {
        if (this.columnSplitter) this.columnSplitter.destroy();
        if (this.ioSplitter) this.ioSplitter.destroy();

        this.columnSplitter = Split(["#operations", "#recipe", "#IO"], {
            sizes: [20, 30, 50],
            minSize: minimise ? [0, 0, 0] : [240, 310, 450],
            gutterSize: 4,
            expandToMin: true,
            onDrag: debounce(function() {
                this.adjustComponentSizes();
            }, 50, "dragSplitter", this, [])
        });

        this.ioSplitter = Split(["#input", "#output"], {
            direction: "vertical",
            gutterSize: 4,
            minSize: minimise ? [0, 0] : [100, 100]
        });

        this.adjustComponentSizes();
    }


    /**
     * Loads the information previously saved to the HTML5 local storage object so that user options
     * and favourites can be restored.
     */
    loadLocalStorage() {
        // Load options
        let lOptions;
        if (this.isLocalStorageAvailable() && localStorage.options !== undefined) {
            lOptions = JSON.parse(localStorage.options);
        }
        this.manager.options.load(lOptions);

        // Load favourites
        this.loadFavourites();
    }


    /**
     * Loads the user's favourite operations from the HTML5 local storage object and populates the
     * Favourites category with them.
     * If the user currently has no saved favourites, the defaults from the view constructor are used.
     */
    loadFavourites() {
        let favourites;

        if (this.isLocalStorageAvailable()) {
            favourites = localStorage?.favourites?.length > 2 ?
                JSON.parse(localStorage.favourites) :
                this.dfavourites;
            favourites = this.validFavourites(favourites);
            this.saveFavourites(favourites);
        } else {
            favourites = this.dfavourites;
        }

        const favCat = this.categories.filter(function(c) {
            return c.name === "Favourites";
        })[0];

        if (favCat) {
            favCat.ops = favourites;
        } else {
            this.categories.unshift({
                name: "Favourites",
                ops: favourites
            });
        }
    }


    /**
     * Filters the list of favourite operations that the user had stored and removes any that are no
     * longer available. The user is notified if this is the case.

     * @param {string[]} favourites - A list of the user's favourite operations
     * @returns {string[]} A list of the valid favourites
     */
    validFavourites(favourites) {
        const validFavs = [];
        for (let i = 0; i < favourites.length; i++) {
            if (favourites[i] in this.operations) {
                validFavs.push(favourites[i]);
            } else {
                this.alert(`The operation "${Utils.escapeHtml(favourites[i])}" is no longer available. ` +
                    "It has been removed from your favourites.");
            }
        }
        return validFavs;
    }


    /**
     * Saves a list of favourite operations to the HTML5 local storage object.
     *
     * @param {string[]} favourites - A list of the user's favourite operations
     */
    saveFavourites(favourites) {
        if (!this.isLocalStorageAvailable()) {
            this.alert(
                "Your security settings do not allow access to local storage so your favourites cannot be saved.",
                5000
            );
            return false;
        }

        localStorage.setItem("favourites", JSON.stringify(this.validFavourites(favourites)));
    }


    /**
     * Resets favourite operations back to the default as specified in the view constructor and
     * refreshes the operation list.
     */
    resetFavourites() {
        this.saveFavourites(this.dfavourites);
        this.loadFavourites();
        this.populateOperationsList();
        this.manager.recipe.initialiseOperationDragNDrop();
    }


    /**
     * Adds an operation to the user's favourites.
     *
     * @param {string} name - The name of the operation
     */
    addFavourite(name) {
        const favourites = JSON.parse(localStorage.favourites);

        if (favourites.indexOf(name) >= 0) {
            this.alert(`'${name}' is already in your favourites`, 3000);
            return;
        }

        favourites.push(name);
        this.saveFavourites(favourites);
        this.loadFavourites();
        this.populateOperationsList();
        this.manager.recipe.initialiseOperationDragNDrop();
    }

    /**
     * Gets the URI params from the window and parses them to extract the actual values.
     *
     * @returns {object}
     */
    getURIParams() {
        // Load query string or hash from URI (depending on which is populated)
        // We prefer getting the hash by splitting the href rather than referencing
        // location.hash as some browsers (Firefox) automatically URL decode it,
        // which cause issues.
        const params = window.location.search ||
            window.location.href.split("#")[1] ||
            window.location.hash;
        const parsedParams = Utils.parseURIParams(params);
        return parsedParams;
    }

    /**
     * Searches the URI parameters for recipe and input parameters.
     * If recipe is present, replaces the current recipe with the recipe provided in the URI.
     * If input is present, decodes and sets the input to the one provided in the URI.
     * If character encodings are present, sets them appropriately.
     * If theme is present, uses the theme.
     *
     * @param {Object} params
     * @fires Manager#statechange
     */
    loadURIParams(params=this.getURIParams()) {
        this.uriParams = params;

        // Read in recipe from URI params
        if (this.uriParams.recipe) {
            try {
                const recipeConfig = Utils.parseRecipeConfig(this.uriParams.recipe);
                this.setRecipeConfig(recipeConfig);
            } catch (err) {}
        } else if (this.uriParams.op) {
            // If there's no recipe, look for single operations
            this.manager.recipe.clearRecipe();

            // Search for nearest match and add it
            const matchedOps = this.manager.ops.filterOperations(this.uriParams.op, false);
            if (matchedOps.length) {
                this.manager.recipe.addOperation(matchedOps[0].name);
            }

            // Populate search with the string
            const search = document.getElementById("search");

            search.value = this.uriParams.op;
            search.dispatchEvent(new Event("search"));
        }

        // Input Character Encoding
        // Must be set before the input is loaded
        if (this.uriParams.ienc) {
            this.manager.input.chrEncChange(parseInt(this.uriParams.ienc, 10), true, true);
        }

        // Output Character Encoding
        if (this.uriParams.oenc) {
            this.manager.output.chrEncChange(parseInt(this.uriParams.oenc, 10), true);
        }

        // Input EOL sequence
        if (this.uriParams.ieol) {
            this.manager.input.eolChange(this.uriParams.ieol, true);
        }

        // Output EOL sequence
        if (this.uriParams.oeol) {
            this.manager.output.eolChange(this.uriParams.oeol, true);
        }

        // Read in input data from URI params
        if (this.uriParams.input) {
            try {
                let inputVal;
                const inputChrEnc = this.manager.input.getChrEnc();
                const inputData = fromBase64(this.uriParams.input, null, "byteArray");
                if (inputChrEnc > 0) {
                    inputVal = cptable.utils.decode(inputChrEnc, inputData);
                } else {
                    inputVal = Utils.byteArrayToChars(inputData);
                }
                this.setInput(inputVal);
            } catch (err) {}
        }

        // Read in theme from URI params
        if (this.uriParams.theme) {
            this.manager.options.changeTheme(Utils.escapeHtml(this.uriParams.theme));
        } else {
            this.manager.options.applyPreferredColorScheme();
        }

        window.dispatchEvent(this.manager.statechange);
    }


    /**
     * Returns the next ingredient ID and increments it for next time.
     *
     * @returns {number}
     */
    nextIngId() {
        return this.ingId++;
    }


    /**
     * Gets the current recipe configuration.
     *
     * @returns {Object[]}
     */
    getRecipeConfig() {
        return this.manager.recipe.getConfig();
    }


    /**
     * Given a recipe configuration, sets the recipe to that configuration.
     *
     * @fires Manager#statechange
     * @param {Object[]} recipeConfig - The recipe configuration
     */
    setRecipeConfig(recipeConfig) {
        document.getElementById("rec-list").innerHTML = null;

        for (let i = 0; i < recipeConfig.length; i++) {
            const item = this.manager.recipe.addOperation(recipeConfig[i].op);

            // Populate arguments
            log.debug(`Populating arguments for ${recipeConfig[i].op}`);
            const args = item.querySelectorAll(".arg");
            for (let j = 0; j < args.length; j++) {
                if (recipeConfig[i].args[j] === undefined) continue;
                if (args[j].getAttribute("type") === "checkbox") {
                    // checkbox
                    args[j].checked = recipeConfig[i].args[j];
                } else if (args[j].classList.contains("toggle-string")) {
                    // toggleString
                    args[j].value = recipeConfig[i].args[j].string;
                    args[j].parentNode.parentNode.querySelector("button").innerHTML =
                        Utils.escapeHtml(recipeConfig[i].args[j].option);
                } else {
                    // all others
                    args[j].value = recipeConfig[i].args[j];
                }
            }

            // Set disabled and breakpoint
            if (recipeConfig[i].disabled) {
                item.querySelector(".disable-icon").click();
            }
            if (recipeConfig[i].breakpoint) {
                item.querySelector(".breakpoint").click();
            }

            this.manager.recipe.triggerArgEvents(item);

            this.progress = 0;
        }
    }


    /**
     * Resets the splitter positions to default.
     */
    resetLayout() {
        this.columnSplitter.setSizes([20, 30, 50]);
        this.ioSplitter.setSizes([50, 50]);
        this.adjustComponentSizes();
    }

    /**
     * Adjust components to fit their containers.
     */
    adjustComponentSizes() {
        this.manager.recipe.adjustWidth();
        this.manager.input.calcMaxTabs();
        this.manager.output.calcMaxTabs();
        this.manager.controls.calcControlsHeight();
    }


    /**
     * Sets the compile message.
     */
    setCompileMessage() {
        // Display time since last build and compile message
        const now = new Date(),
            msSinceCompile = now.getTime() - window.compileTime,
            timeSinceCompile = moment.duration(msSinceCompile, "milliseconds").humanize();

        // Calculate previous version to compare to
        const prev = PKG_VERSION.split(".").map(n => {
            return parseInt(n, 10);
        });
        if (prev[2] > 0) prev[2]--;
        else if (prev[1] > 0) prev[1]--;
        else prev[0]--;

        // const compareURL = `https://github.com/gchq/CyberChef/compare/v${prev.join(".")}...v${PKG_VERSION}`;

        let compileInfo = `<a href='https://github.com/gchq/CyberChef/blob/master/CHANGELOG.md'>Last build: ${timeSinceCompile.substr(0, 1).toUpperCase() + timeSinceCompile.substr(1)} ago</a>`;

        if (window.compileMessage !== "") {
            compileInfo += " - " + window.compileMessage;
        }

        const notice = document.getElementById("notice");
        notice.innerHTML = compileInfo;
        notice.setAttribute("title", Utils.stripHtmlTags(window.compileMessage));
        notice.setAttribute("data-help-title", "Last build");
        notice.setAttribute("data-help", "This live version of CyberChef is updated whenever new commits are added to the master branch of the CyberChef repository. It represents the latest, most up-to-date build of CyberChef.");
    }


    /**
     * Determines whether the browser supports Local Storage and if it is accessible.
     *
     * @returns {boolean}
     */
    isLocalStorageAvailable() {
        try {
            if (!localStorage) return false;
            return true;
        } catch (err) {
            // Access to LocalStorage is denied
            return false;
        }
    }


    /**
     * Pops up a message to the user and writes it to the console log.
     *
     * @param {string} str - The message to display (HTML supported)
     * @param {number} [timeout=0] - The number of milliseconds before the alert closes automatically
     *     0 for never (until the user closes it)
     * @param {boolean} [silent=false] - Don't show the message in the popup, only print it to the
     *     console
     *
     * @example
     * // Pops up a box with the message "Error: Something has gone wrong!" that will need to be
     * // dismissed by the user.
     * this.alert("Error: Something has gone wrong!", 0);
     *
     * // Pops up a box with the message "Happy Christmas!" that will disappear after 5 seconds.
     * this.alert("Happy Christmas!", 5000);
     */
    alert(str, timeout=0, silent=false) {
        const time = new Date();

        log.info("[" + time.toLocaleString() + "] " + str);
        if (silent) return;

        this.snackbars.push($.snackbar({
            content: str,
            timeout: timeout,
            htmlAllowed: true,
            onClose: () => {
                this.snackbars.shift().remove();
            }
        }));
    }


    /**
     * Pops up a box asking the user a question and sending the answer to a specified callback function.
     *
     * @param {string} title - The title of the box
     * @param {string} body - The question (HTML supported)
     * @param {string} accept - The text of the accept button
     * @param {string} reject - The text of the reject button
     * @param {function} callback - A function accepting one boolean argument which handles the
     *   response e.g. function(answer) {...}
     * @param {Object} [scope=this] - The object to bind to the callback function
     *
     * @example
     * // Pops up a box asking if the user would like a cookie. Prints the answer to the console.
     * this.confirm("Question", "Would you like a cookie?", "Yes", "No", function(answer) {console.log(answer);});
     */
    confirm(title, body, accept, reject, callback, scope) {
        scope = scope || this;
        document.getElementById("confirm-title").innerHTML = title;
        document.getElementById("confirm-body").innerHTML = body;
        document.getElementById("confirm-yes").innerText = accept;
        document.getElementById("confirm-no").innerText = reject;
        document.getElementById("confirm-modal").style.display = "block";

        this.confirmClosed = false;
        $("#confirm-modal").modal()
            .one("show.bs.modal", function(e) {
                this.confirmClosed = false;
            }.bind(this))
            .one("click", "#confirm-yes", function() {
                this.confirmClosed = true;
                callback.bind(scope)(true);
                $("#confirm-modal").modal("hide");
            }.bind(this))
            .one("click", "#confirm-no", function() {
                this.confirmClosed = true;
                callback.bind(scope)(false);
            }.bind(this))
            .one("hide.bs.modal", function(e) {
                if (!this.confirmClosed) {
                    callback.bind(scope)(undefined);
                }
                this.confirmClosed = true;
            }.bind(this));
    }


    /**
     * Handler for CyerChef statechange events.
     * Fires whenever the input or recipe changes in any way.
     *
     * @listens Manager#statechange
     * @param {event} e
     */
    stateChange(e) {
        debounce(function() {
            this.progress = 0;
            this.autoBake();
            this.updateURL(true, null, true);
        }, 20, "stateChange", this, [])();
    }


    /**
     * Update the page title and URL to contain the new recipe
     *
     * @param {boolean} includeInput
     * @param {string} [input=null]
     * @param {boolean} [changeUrl=true]
     */
    updateURL(includeInput, input=null, changeUrl=true) {
        // Set title
        const recipeConfig = this.getRecipeConfig();
        let title = "CyberChef";
        if (recipeConfig.length === 1) {
            title = `${recipeConfig[0].op} - ${title}`;
        } else if (recipeConfig.length > 1) {
            // See how long the full recipe is
            const ops = recipeConfig.map(op => op.op).join(", ");
            if (ops.length < 45) {
                title = `${ops} - ${title}`;
            } else {
                // If it's too long, just use the first one and say how many more there are
                title = `${recipeConfig[0].op}, ${recipeConfig.length - 1} more - ${title}`;
            }
        }
        document.title = title;

        // Update the current history state (not creating a new one)
        if (this.options.updateUrl && changeUrl) {
            this.lastStateUrl = this.manager.controls.generateStateUrl(true, includeInput, input, recipeConfig);
            window.history.replaceState({}, title, this.lastStateUrl);
        }
    }


    /**
     * Handler for the history popstate event.
     * Reloads parameters from the URL.
     *
     * @param {event} e
     */
    popState(e) {
        this.loadURIParams();
    }

}

export default App;
