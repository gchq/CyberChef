/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import clippy from "clippyjs";
import "./static/clippy_assets/agents/Clippy/agent.js";
import clippyMap from "./static/clippy_assets/agents/Clippy/map.png";

/**
 * Waiter to handle seasonal events and easter eggs.
 */
class SeasonalWaiter {

    /**
     * SeasonalWaiter contructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.clippyAgent = null;
    }


    /**
     * Loads all relevant items depending on the current date.
     */
    load() {
        // Konami code
        this.kkeys = [];
        window.addEventListener("keydown", this.konamiCodeListener.bind(this));

        // Clippy
        const now = new Date();
        if (now.getMonth() === 3 && now.getDate() === 1) {
            this.addClippyOption();
            this.manager.addDynamicListener(".option-item #clippy", "change", this.setupClippy, this);
            this.setupClippy();
        }
    }


    /**
     * Listen for the Konami code sequence of keys. Turn the page upside down if they are all heard in
     * sequence.
     * #konamicode
     */
    konamiCodeListener(e) {
        this.kkeys.push(e.keyCode);
        const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
        for (let i = 0; i < this.kkeys.length; i++) {
            if (this.kkeys[i] !== konami[i]) {
                this.kkeys = [];
                break;
            }
            if (i === konami.length - 1) {
                $("body").children().toggleClass("konami");
                this.kkeys = [];
            }
        }
    }

    /**
     * Creates an option in the Options menu for turning Clippy on or off
     */
    addClippyOption() {
        const optionsBody = document.getElementById("options-body"),
            optionItem = document.createElement("span");

        optionItem.className = "bmd-form-group is-filled";
        optionItem.innerHTML = `<div class="checkbox option-item">
            <label for="clippy">
                <input type="checkbox" option="clippy" id="clippy" checked="">
                Use the Clippy helper
            </label>
        </div>`;
        optionsBody.appendChild(optionItem);

        if (!this.app.options.hasOwnProperty("clippy")) {
            this.app.options.clippy = true;
        }

        this.manager.options.load();
    }

    /**
     * Sets up Clippy for April Fools Day
     */
    setupClippy() {
        // Destroy any previous agents
        if (this.clippyAgent) {
            this.clippyAgent.closeBalloonImmediately();
            this.clippyAgent.hide();
        }

        if (!this.app.options.clippy) {
            if (this.clippyTimeouts) this.clippyTimeouts.forEach(t => clearTimeout(t));
            return;
        }

        // Set base path to # to prevent external network requests
        const clippyAssets = "#";
        // Shim the library to prevent external network requests
        shimClippy(clippy);

        const self = this;
        clippy.load("Clippy", (agent) => {
            shimClippyAgent(agent);
            self.clippyAgent = agent;
            agent.show();
            agent.speak("Hello, I'm Clippy, your personal cyber assistant!");
        }, undefined, clippyAssets);

        // Watch for the Auto Magic button appearing
        const magic = document.getElementById("magic");
        const observer = new MutationObserver((mutationsList, observer) => {
            // Read in message and recipe
            let msg, recipe;
            for (const mutation of mutationsList) {
                if (mutation.attributeName === "data-original-title") {
                    msg = magic.getAttribute("data-original-title");
                }
                if (mutation.attributeName === "data-recipe") {
                    recipe = magic.getAttribute("data-recipe");
                }
            }

            // Close balloon if it is currently showing a magic hint
            const balloon = self.clippyAgent._balloon._balloon;
            if (balloon.is(":visible") && balloon.text().indexOf("That looks like encoded data") >= 0) {
                self.clippyAgent._balloon.hide(true);
                this.clippyAgent._balloon._hidden = true;
            }

            // If a recipe was found, get Clippy to tell the user
            if (recipe) {
                recipe = this.manager.controls.generateStateUrl(true, true, JSON.parse(recipe));
                msg = `That looks like encoded data!<br><br>${msg}<br><br>Click <a class="clippyMagicRecipe" href="${recipe}">here</a> to load this recipe.`;

                // Stop current balloon activity immediately and trigger speak again
                this.clippyAgent.closeBalloonImmediately();
                self.clippyAgent.speak(msg, true);
                // self.clippyAgent._queue.next();
            }
        });
        observer.observe(document.getElementById("magic"), {attributes: true});

        // Play animations for various things
        this.manager.addListeners("#search", "click", () => {
            this.clippyAgent.play("Searching");
        }, this);
        this.manager.addListeners("#save,#save-to-file", "click", () => {
            this.clippyAgent.play("Save");
        }, this);
        this.manager.addListeners("#clr-recipe,#clr-io", "click", () => {
            this.clippyAgent.play("EmptyTrash");
        }, this);
        this.manager.addListeners("#bake", "click", e => {
            if (e.target.closest("button").textContent.toLowerCase().indexOf("bake") >= 0) {
                this.clippyAgent.play("Thinking");
            } else {
                this.clippyAgent.play("EmptyTrash");
            }
            this.clippyAgent._queue.clear();
        }, this);
        this.manager.addListeners("#input-text", "keydown", () => {
            this.clippyAgent.play("Writing");
            this.clippyAgent._queue.clear();
        }, this);
        this.manager.addDynamicListener("a.clippyMagicRecipe", "click", (e) => {
            this.clippyAgent.play("Congratulate");
        }, this);

        this.clippyTimeouts = [];
        // Show challenge after timeout
        this.clippyTimeouts.push(setTimeout(() => {
            const hex = "1f 8b 08 00 ae a1 9b 5c 00 ff 05 40 a1 12 00 10 0c fd 26 61 5b 76 aa 9d 26 a8 02 02 37 84 f7 fb bb c5 a4 5f 22 c6 09 e5 6e c5 4c 2d 3f e9 30 a6 ea 41 a2 f2 ac 1c 00 00 00";
            self.clippyAgent.speak(`How about a fun challenge?<br><br>Try decoding this (click to load):<br><a href="#recipe=[]&input=${encodeURIComponent(btoa(hex))}">${hex}</a>`, true);
            self.clippyAgent.play("GetAttention");
        }, 1 * 60 * 1000));

        this.clippyTimeouts.push(setTimeout(() => {
            self.clippyAgent.speak("<i>Did you know?</i><br><br>You can load files into CyberChef up to around 500MB using drag and drop or the load file button.", 15000);
            self.clippyAgent.play("Wave");
        }, 2 * 60 * 1000));

        this.clippyTimeouts.push(setTimeout(() => {
            self.clippyAgent.speak("<i>Did you know?</i><br><br>You can use the 'Fork' operation to split up your input and run the recipe over each branch separately.<br><br><a class='clippyMagicRecipe' href=\"#recipe=Fork('%5C%5Cn','%5C%5Cn',false)From_UNIX_Timestamp('Seconds%20(s)')&amp;input=OTc4MzQ2ODAwCjEwMTI2NTEyMDAKMTA0NjY5NjQwMAoxMDgxMDg3MjAwCjExMTUzMDUyMDAKMTE0OTYwOTYwMA\">Here's an example</a>.", 15000);
            self.clippyAgent.play("Print");
        }, 3 * 60 * 1000));

        this.clippyTimeouts.push(setTimeout(() => {
            self.clippyAgent.speak("<i>Did you know?</i><br><br>The 'Magic' operation uses a number of methods to detect encoded data and the operations which can be used to make sense of it. A technical description of these methods can be found <a href=\"https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic\">here</a>.", 15000);
            self.clippyAgent.play("Alert");
        }, 4 * 60 * 1000));

        this.clippyTimeouts.push(setTimeout(() => {
            self.clippyAgent.speak("<i>Did you know?</i><br><br>You can use parts of the input as arguments to operations.<br><br><a class='clippyMagicRecipe' href=\"#recipe=Register('key%3D(%5B%5C%5Cda-f%5D*)',true,false)Find_/_Replace(%7B'option':'Regex','string':'.*data%3D(.*)'%7D,'$1',true,false,true)RC4(%7B'option':'Hex','string':'$R0'%7D,'Hex','Latin1')&amp;input=aHR0cDovL21hbHdhcmV6LmJpei9iZWFjb24ucGhwP2tleT0wZTkzMmE1YyZkYXRhPThkYjdkNWViZTM4NjYzYTU0ZWNiYjMzNGUzZGIxMQ\">Click here for an example</a>.", 15000);
            self.clippyAgent.play("CheckingSomething");
        }, 5 * 60 * 1000));
    }

}


/**
 * Shims various ClippyJS functions to modify behaviour.
 *
 * @param {Clippy} clippy - The Clippy library
 */
function shimClippy(clippy) {
    // Shim _loadSounds so that it doesn't actually try to load any sounds
    clippy.load._loadSounds = function _loadSounds (name, path) {
        let dfd = clippy.load._sounds[name];
        if (dfd) return dfd;

        // set dfd if not defined
        dfd = clippy.load._sounds[name] = $.Deferred();

        // Resolve immediately without loading
        dfd.resolve({});

        return dfd.promise();
    };

    // Shim _loadMap so that it uses the local copy
    clippy.load._loadMap = function _loadMap (path) {
        let dfd = clippy.load._maps[path];
        if (dfd) return dfd;

        // set dfd if not defined
        dfd = clippy.load._maps[path] = $.Deferred();

        const src = clippyMap;
        const img = new Image();

        img.onload = dfd.resolve;
        img.onerror = dfd.reject;

        // start loading the map;
        img.setAttribute("src", src);

        return dfd.promise();
    };

    // Make sure we don't request the remote map
    clippy.Animator.prototype._setupElement = function _setupElement (el) {
        const frameSize = this._data.framesize;
        el.css("display", "none");
        el.css({ width: frameSize[0], height: frameSize[1] });
        el.css("background", "url('" + clippyMap + "') no-repeat");

        return el;
    };
}

/**
 * Shims various ClippyJS Agent functions to modify behaviour.
 *
 * @param {Agent} agent - The Clippy Agent
 */
function shimClippyAgent(agent) {
    // Turn off all sounds
    agent._animator._playSound = () => {};

    // Improve speak function to support HTML markup
    const self = agent._balloon;
    agent._balloon.speak = (complete, text, hold) => {
        self._hidden = false;
        self.show();
        const c = self._content;
        // set height to auto
        c.height("auto");
        c.width("auto");
        // add the text
        c.html(text);
        // set height
        c.height(c.height());
        c.width(c.width());
        c.text("");
        self.reposition();

        self._complete = complete;
        self._sayWords(text, hold, complete);
        if (hold) agent._queue.next();
    };

    // Improve the _sayWords function to allow HTML and support timeouts
    agent._balloon.WORD_SPEAK_TIME = 60;
    agent._balloon._sayWords = (text, hold, complete) => {
        self._active = true;
        self._hold = hold;
        const words = text.split(/[^\S-]/);
        const time = self.WORD_SPEAK_TIME;
        const el = self._content;
        let idx = 1;
        clearTimeout(self.holdTimeout);

        self._addWord = $.proxy(function () {
            if (!self._active) return;
            if (idx > words.length) {
                delete self._addWord;
                self._active = false;
                if (!self._hold) {
                    complete();
                    self.hide();
                } else if (typeof hold === "number") {
                    self.holdTimeout = setTimeout(() => {
                        self._hold = false;
                        complete();
                        self.hide();
                    }, hold);
                }
            } else {
                el.html(words.slice(0, idx).join(" "));
                idx++;
                self._loop = window.setTimeout($.proxy(self._addWord, self), time);
            }
        }, self);

        self._addWord();
    };

    // Add break-word to balloon CSS
    agent._balloon._balloon.css("word-break", "break-word");

    // Close the balloon on click (unless it was a link)
    agent._balloon._balloon.click(e => {
        if (e.target.nodeName !== "A") {
            agent._balloon.hide(true);
            agent._balloon._hidden = true;
        }
    });

    // Add function to immediately close the balloon even if it is currently doing something
    agent.closeBalloonImmediately = () => {
        agent._queue.clear();
        agent._balloon.hide(true);
        agent._balloon._hidden = true;
        agent._queue.next();
    };
}

export default SeasonalWaiter;
