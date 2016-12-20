/* globals Split */

/**
 * HTML view for CyberChef responsible for building the web page and dealing with all user
 * interactions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {CatConf[]} categories - The list of categories and operations to be populated.
 * @param {Object.<string, OpConf>} operations - The list of operation configuration objects.
 * @param {String[]} default_favourites - A list of default favourite operations.
 * @param {Object} options - Default setting for app options.
 */
var HTMLApp = function(categories, operations, default_favourites, default_options) {
    this.categories  = categories;
    this.operations  = operations;
    this.dfavourites = default_favourites;
    this.doptions    = default_options;
    this.options     = Utils.extend({}, default_options);

    this.chef        = new Chef();
    this.manager     = new Manager(this);

    this.auto_bake_  = false;
    this.progress    = 0;
    this.ing_id      = 0;

    window.chef      = this.chef;
};


/**
 * This function sets up the stage and creates listeners for all events.
 *
 * @fires Manager#appstart
 */
HTMLApp.prototype.setup = function() {
    document.dispatchEvent(this.manager.appstart);
    this.initialise_splitter();
    this.load_local_storage();
    this.populate_operations_list();
    this.manager.setup();
    this.reset_layout();
    this.set_compile_message();
    this.load_URI_params();
};


/**
 * An error handler for displaying the error to the user.
 *
 * @param {Error} err
 */
HTMLApp.prototype.handle_error = function(err) {
    console.error(err);
    var msg = err.display_str || err.toString();
    this.alert(msg, "danger", this.options.error_timeout, !this.options.show_errors);
};


/**
 * Calls the Chef to bake the current input using the current recipe.
 *
 * @param {boolean} [step] - Set to true if we should only execute one operation instead of the
 *   whole recipe.
 */
HTMLApp.prototype.bake = function(step) {
    var response;

    try {
        response = this.chef.bake(
            this.get_input(),         // The user's input
            this.get_recipe_config(), // The configuration of the recipe
            this.options,             // Options set by the user
            this.progress,            // The current position in the recipe
            step                      // Whether or not to take one step or execute the whole recipe
        );
    } catch (err) {
        this.handle_error(err);
    }

    if (!response) return;

    if (response.error) {
        this.handle_error(response.error);
    }

    this.options  = response.options;
    this.dish_str = response.type === "html" ? Utils.strip_html_tags(response.result, true) : response.result;
    this.progress = response.progress;
    this.manager.recipe.update_breakpoint_indicator(response.progress);
    this.manager.output.set(response.result, response.type, response.duration);

    // If baking took too long, disable auto-bake
    if (response.duration > this.options.auto_bake_threshold && this.auto_bake_) {
        this.manager.controls.set_auto_bake(false);
        this.alert("Baking took longer than " + this.options.auto_bake_threshold +
            "ms, Auto Bake has been disabled.", "warning", 5000);
    }
};


/**
 * Runs Auto Bake if it is set.
 */
HTMLApp.prototype.auto_bake = function() {
    if (this.auto_bake_) {
        this.bake();
    }
};


/**
 * Runs a silent bake forcing the browser to load and cache all the relevant JavaScript code needed
 * to do a real bake.
 *
 * The output will not be modified (hence "silent" bake). This will only actually execute the
 * recipe if auto-bake is enabled, otherwise it will just load the recipe, ingredients and dish.
 *
 * @returns {number} - The number of miliseconds it took to run the silent bake.
 */
HTMLApp.prototype.silent_bake = function() {
    var start_time = new Date().getTime(),
        recipe_config = this.get_recipe_config();

    if (this.auto_bake_) {
        this.chef.silent_bake(recipe_config);
    }

    return new Date().getTime() - start_time;
};


/**
 * Gets the user's input data.
 *
 * @returns {string}
 */
HTMLApp.prototype.get_input = function() {
    var input = this.manager.input.get();

    // Save to session storage in case we need to restore it later
    sessionStorage.setItem("input_length", input.length);
    sessionStorage.setItem("input", input);

    return input;
};


/**
 * Sets the user's input data.
 *
 * @param {string} input - The string to set the input to
 */
HTMLApp.prototype.set_input = function(input) {
    sessionStorage.setItem("input_length", input.length);
    sessionStorage.setItem("input", input);
    this.manager.input.set(input);
};


/**
 * Populates the operations accordion list with the categories and operations specified in the
 * view constructor.
 *
 * @fires Manager#oplistcreate
 */
HTMLApp.prototype.populate_operations_list = function() {
    // Move edit button away before we overwrite it
    document.body.appendChild(document.getElementById("edit-favourites"));

    var html = "";

    for (var i = 0; i < this.categories.length; i++) {
        var cat_conf = this.categories[i],
            selected = i === 0,
            cat = new HTMLCategory(cat_conf.name, selected);

        for (var j = 0; j < cat_conf.ops.length; j++) {
            var op_name = cat_conf.ops[j],
                op = new HTMLOperation(op_name, this.operations[op_name], this, this.manager);
            cat.add_operation(op);
        }

        html += cat.to_html();
    }

    document.getElementById("categories").innerHTML = html;

    var op_lists = document.querySelectorAll("#categories .op_list");

    for (i = 0; i < op_lists.length; i++) {
        op_lists[i].dispatchEvent(this.manager.oplistcreate);
    }

    // Add edit button to first category (Favourites)
    document.querySelector("#categories a").appendChild(document.getElementById("edit-favourites"));
};


/**
 * Sets up the adjustable splitter to allow the user to resize areas of the page.
 */
HTMLApp.prototype.initialise_splitter = function() {
    this.column_splitter = Split(["#operations", "#recipe", "#IO"], {
        sizes: [20, 30, 50],
        minSize: [240, 325, 500],
        gutterSize: 4,
        onDrag: this.manager.controls.adjust_width.bind(this.manager.controls)
    });

    this.io_splitter = Split(["#input", "#output"], {
        direction: "vertical",
        gutterSize: 4,
    });

    this.reset_layout();
};


/**
 * Loads the information previously saved to the HTML5 local storage object so that user options
 * and favourites can be restored.
 */
HTMLApp.prototype.load_local_storage = function() {
    // Load options
    var l_options;
    if (localStorage.options !== undefined) {
        l_options = JSON.parse(localStorage.options);
    }
    this.manager.options.load(l_options);

    // Load favourites
    this.load_favourites();
};


/**
 * Loads the user's favourite operations from the HTML5 local storage object and populates the
 * Favourites category with them.
 * If the user currently has no saved favourites, the defaults from the view constructor are used.
 */
HTMLApp.prototype.load_favourites = function() {
    var favourites = localStorage.favourites &&
        localStorage.favourites.length > 2 ?
        JSON.parse(localStorage.favourites) :
        this.dfavourites;

    favourites = this.valid_favourites(favourites);
    this.save_favourites(favourites);

    var fav_cat = this.categories.filter(function(c) {
        return c.name === "Favourites";
    })[0];

    if (fav_cat) {
        fav_cat.ops = favourites;
    } else {
        this.categories.unshift({
            name: "Favourites",
            ops: favourites
        });
    }
};


/**
 * Filters the list of favourite operations that the user had stored and removes any that are no
 * longer available. The user is notified if this is the case.

 * @param {string[]} favourites - A list of the user's favourite operations
 * @returns {string[]} A list of the valid favourites
 */
HTMLApp.prototype.valid_favourites = function(favourites) {
    var valid_favs = [];
    for (var i = 0; i < favourites.length; i++) {
        if (this.operations.hasOwnProperty(favourites[i])) {
            valid_favs.push(favourites[i]);
        } else {
            this.alert("The operation \"" + Utils.escape_html(favourites[i]) +
                "\" is no longer available. It has been removed from your favourites.", "info");
        }
    }
    return valid_favs;
};


/**
 * Saves a list of favourite operations to the HTML5 local storage object.
 *
 * @param {string[]} favourites - A list of the user's favourite operations
 */
HTMLApp.prototype.save_favourites = function(favourites) {
    localStorage.setItem("favourites", JSON.stringify(this.valid_favourites(favourites)));
};


/**
 * Resets favourite operations back to the default as specified in the view constructor and
 * refreshes the operation list.
 */
HTMLApp.prototype.reset_favourites = function() {
    this.save_favourites(this.dfavourites);
    this.load_favourites();
    this.populate_operations_list();
    this.manager.recipe.initialise_operation_drag_n_drop();
};


/**
 * Adds an operation to the user's favourites.
 *
 * @param {string} name - The name of the operation
 */
HTMLApp.prototype.add_favourite = function(name) {
    var favourites = JSON.parse(localStorage.favourites);

    if (favourites.indexOf(name) >= 0) {
        this.alert("'" + name + "' is already in your favourites", "info", 2000);
        return;
    }

    favourites.push(name);
    this.save_favourites(favourites);
    this.load_favourites();
    this.populate_operations_list();
    this.manager.recipe.initialise_operation_drag_n_drop();
};


/**
 * Checks for input and recipe in the URI parameters and loads them if present.
 */
HTMLApp.prototype.load_URI_params = function() {
    // Load query string from URI
    this.query_string = (function(a) {
        if (a === "") return {};
        var b = {};
        for (var i = 0; i < a.length; i++) {
            var p = a[i].split("=");
            if (p.length !== 2) {
                b[a[i]] = true;
            } else {
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
        }
        return b;
    })(window.location.search.substr(1).split("&"));

    // Turn off auto-bake while loading
    var auto_bake_val = this.auto_bake_;
    this.auto_bake_ = false;

    // Read in recipe from query string
    if (this.query_string.recipe) {
        try {
            var recipe_config = JSON.parse(this.query_string.recipe);
            this.set_recipe_config(recipe_config);
        } catch(err) {}
    } else if (this.query_string.op) {
        // If there's no recipe, look for single operations
        this.manager.recipe.clear_recipe();
        try {
            this.manager.recipe.add_operation(this.query_string.op);
        } catch(err) {
            // If no exact match, search for nearest match and add that
            var matched_ops = this.manager.ops.filter_operations(this.query_string.op, false);
            if (matched_ops.length) {
                this.manager.recipe.add_operation(matched_ops[0].name);
            }

            // Populate search with the string
            var search = document.getElementById("search");

            search.value = this.query_string.op;
            search.dispatchEvent(new Event("search"));
        }
    }

    // Read in input data from query string
    if (this.query_string.input) {
        try {
            var input_data = Utils.from_base64(this.query_string.input);
            this.set_input(input_data);
        } catch(err) {}
    }

    // Restore auto-bake state
    this.auto_bake_ = auto_bake_val;
    this.auto_bake();
};


/**
 * Returns the next ingredient ID and increments it for next time.
 *
 * @returns {number}
 */
HTMLApp.prototype.next_ing_id = function() {
    return this.ing_id++;
};


/**
 * Gets the current recipe configuration.
 *
 * @returns {Object[]}
 */
HTMLApp.prototype.get_recipe_config = function() {
    var recipe_config = this.manager.recipe.get_config();
    sessionStorage.setItem("recipe_config", JSON.stringify(recipe_config));
    return recipe_config;
};


/**
 * Given a recipe configuration, sets the recipe to that configuration.
 *
 * @param {Object[]} recipe_config - The recipe configuration
 */
HTMLApp.prototype.set_recipe_config = function(recipe_config) {
    sessionStorage.setItem("recipe_config", JSON.stringify(recipe_config));
    document.getElementById("rec_list").innerHTML = null;

    for (var i = 0; i < recipe_config.length; i++) {
        var item = this.manager.recipe.add_operation(recipe_config[i].op);

        // Populate arguments
        var args = item.querySelectorAll(".arg");
        for (var j = 0; j < args.length; j++) {
            if (args[j].getAttribute("type") === "checkbox") {
                // checkbox
                args[j].checked = recipe_config[i].args[j];
            } else if (args[j].classList.contains("toggle-string")) {
                // toggle_string
                args[j].value = recipe_config[i].args[j].string;
                args[j].previousSibling.children[0].innerHTML =
                    Utils.escape_html(recipe_config[i].args[j].option) +
                    " <span class='caret'></span>";
            } else {
                // all others
                args[j].value = recipe_config[i].args[j];
            }
        }

        // Set disabled and breakpoint
        if (recipe_config[i].disabled) {
            item.querySelector(".disable-icon").click();
        }
        if (recipe_config[i].breakpoint) {
            item.querySelector(".breakpoint").click();
        }

        this.progress = 0;
    }
};


/**
 * Resets the splitter positions to default.
 */
HTMLApp.prototype.reset_layout = function() {
    this.column_splitter.setSizes([20, 30, 50]);
    this.io_splitter.setSizes([50, 50]);

    this.manager.controls.adjust_width();
};


/**
 * Sets the compile message.
 */
HTMLApp.prototype.set_compile_message = function() {
    // Display time since last build and compile message
    var now = new Date(),
        time_since_compile = Utils.fuzzy_time(now.getTime() - window.compile_time),
        compile_info = "<span style=\"font-weight: normal\">Last build: " +
            time_since_compile.substr(0, 1).toUpperCase() + time_since_compile.substr(1) + " ago";

    if (window.compile_message !== "") {
        compile_info += " - " + window.compile_message;
    }

    compile_info += "</span>";
    document.getElementById("notice").innerHTML = compile_info;
};


/**
 * Pops up a message to the user and writes it to the console log.
 *
 * @param {string} str - The message to display (HTML supported)
 * @param {string} style - The colour of the popup
 *     "danger"  = red
 *     "warning" = amber
 *     "info"    = blue
 *     "success" = green
 * @param {number} timeout - The number of milliseconds before the popup closes automatically
 *     0 for never (until the user closes it)
 * @param {boolean} [silent=false] - Don't show the message in the popup, only print it to the
 *     console
 *
 * @example
 * // Pops up a red box with the message "[current time] Error: Something has gone wrong!"
 * // that will need to be dismissed by the user.
 * this.alert("Error: Something has gone wrong!", "danger", 0);
 *
 * // Pops up a blue information box with the message "[current time] Happy Christmas!"
 * // that will disappear after 5 seconds.
 * this.alert("Happy Christmas!", "info", 5000);
 */
HTMLApp.prototype.alert = function(str, style, timeout, silent) {
    var time = new Date();

    console.log("[" + time.toLocaleString() + "] " + str);
    if (silent) return;

    style = style || "danger";
    timeout = timeout || 0;

    var alert_el = document.getElementById("alert"),
        alert_content = document.getElementById("alert-content");

    alert_el.classList.remove("alert-danger");
    alert_el.classList.remove("alert-warning");
    alert_el.classList.remove("alert-info");
    alert_el.classList.remove("alert-success");
    alert_el.classList.add("alert-" + style);

    // If the box hasn't been closed, append to it rather than replacing
    if (alert_el.style.display === "block") {
        alert_content.innerHTML +=
            "<br><br>[" + time.toLocaleTimeString() + "] " + str;
    } else {
        alert_content.innerHTML =
            "[" + time.toLocaleTimeString() + "] " + str;
    }

    // Stop the animation if it is in progress
    $("#alert").stop();
    alert_el.style.display = "block";
    alert_el.style.opacity = 1;

    if (timeout > 0) {
        clearTimeout(this.alert_timeout);
        this.alert_timeout = setTimeout(function(){
            $("#alert").slideUp(100);
        }, timeout);
    }
};


/**
 * Pops up a box asking the user a question and sending the answer to a specified callback function.
 *
 * @param {string} title - The title of the box
 * @param {string} body - The question (HTML supported)
 * @param {function} callback - A function accepting one boolean argument which handles the
 *   response e.g. function(answer) {...}
 * @param {Object} [scope=this] - The object to bind to the callback function
 *
 * @example
 * // Pops up a box asking if the user would like a cookie. Prints the answer to the console.
 * this.confirm("Question", "Would you like a cookie?", function(answer) {console.log(answer);});
 */
HTMLApp.prototype.confirm = function(title, body, callback, scope) {
    scope = scope || this;
    document.getElementById("confirm-title").innerHTML = title;
    document.getElementById("confirm-body").innerHTML = body;
    document.getElementById("confirm-modal").style.display = "block";

    this.confirm_closed = false;
    $("#confirm-modal").modal()
        .one("show.bs.modal", function(e) {
            this.confirm_closed = false;
        }.bind(this))
        .one("click", "#confirm-yes", function() {
            this.confirm_closed = true;
            callback.bind(scope)(true);
            $("#confirm-modal").modal("hide");
        }.bind(this))
        .one("hide.bs.modal", function(e) {
            if (!this.confirm_closed)
                callback.bind(scope)(false);
            this.confirm_closed = true;
        }.bind(this));
};


/**
 * Handler for the alert close button click event.
 * Closes the alert box.
 */
HTMLApp.prototype.alert_close_click = function() {
    document.getElementById("alert").style.display = "none";
};


/**
 * Handler for CyerChef statechange events.
 * Fires whenever the input or recipe changes in any way.
 *
 * @listens Manager#statechange
 * @param {event} e
 */
HTMLApp.prototype.state_change = function(e) {
    this.auto_bake();

    // Update the current history state (not creating a new one)
    if (this.options.update_url) {
        this.last_state_url = this.manager.controls.generate_state_url(true, true);
        window.history.replaceState({}, "CyberChef", this.last_state_url);
    }
};


/**
 * Handler for the history popstate event.
 * Reloads parameters from the URL.
 *
 * @param {event} e
 */
HTMLApp.prototype.pop_state = function(e) {
    if (window.location.href.split("#")[0] !== this.last_state_url) {
        this.load_URI_params();
    }
};


/**
 * Function to call an external API from this view.
 */
HTMLApp.prototype.call_api = function(url, type, data, data_type, content_type) {
    type = type || "POST";
    data = data || {};
    data_type = data_type || undefined;
    content_type = content_type || "application/json";

    var response = null,
        success = false;

    $.ajax({
        url: url,
        async: false,
        type: type,
        data: data,
        dataType: data_type,
        contentType: content_type,
        success: function(data) {
            success = true;
            response = data;
        },
        error: function(data) {
            success = false;
            response = data;
        },
    });

    return {
        success: success,
        response: response
    };
};
