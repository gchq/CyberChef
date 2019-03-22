/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import clippy from "clippyjs";

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
        //if (now.getMonth() === 3 && now.getDate() === 1) {
        if (now.getMonth() === 2 && now.getDate() === 22) {
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
     * Sets up Clippy on April Fools Day
     */
    setupClippy() {
        //const clippyAssets = "./agents/";
        const clippyAssets = undefined;

        const self = this;
        clippy.load("Clippy", (agent) => {
            window.agent = agent;
            shimClippy(agent);
            self.clippyAgent = agent;

            agent.show();
            //agent.animate();
            agent.speak("Hello, I'm Clippy, your personal cyber assistant!", true);
        }, undefined, clippyAssets);

        // Watch for the Auto Magic button appearing
        const magic = document.getElementById("magic");
        const observer = new MutationObserver((mutationsList, observer) => {
            let msg, recipe;
            for (const mutation of mutationsList) {
                if (mutation.attributeName === "data-original-title") {
                    msg = magic.getAttribute("data-original-title");
                }
                if (mutation.attributeName === "data-recipe") {
                    recipe = magic.getAttribute("data-recipe");
                }
            }

            // Cancel current animation and hide balloon (after it has finished)
            self.clippyAgent._queue.clear();
            self.clippyAgent._queue.next();
            self.clippyAgent.stopCurrent();
            self.clippyAgent._balloon._hold = false;
            self.clippyAgent._balloon.hide();

            if (recipe) {
                recipe = this.manager.controls.generateStateUrl(true, true, JSON.parse(recipe));
                msg = `That looks like encoded data!<br><br>${msg}<br><br>Click <a href="${recipe}">here</a> to load this recipe.`;

                // Stop balloon activity immediately and trigger speak again
                self.clippyAgent._balloon.pause();
                delete self.clippyAgent._balloon._addWord;
                self.clippyAgent._balloon._active = false;
                self.clippyAgent._balloon.hide(true);
                self.clippyAgent.speak(msg, true);
            }
        });
        observer.observe(document.getElementById("magic"), {
            attributes: true
        });
    }

}

/**
 * Shims various ClippyJS functions to modify behaviour.
 *
 * @param {Agent} agent - The Clippy Agent
 */
function shimClippy(agent) {
    // Turn off all sounds
    agent._animator._playSound = () => {};

    // Improve speak function
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
    };

    // Improve the _sayWords function to allow HTML
    agent._balloon.WORD_SPEAK_TIME = 100;
    agent._balloon._sayWords = (text, hold, complete) => {
        self._active = true;
        self._hold = hold;
        const words = text.split(/[^\S-]/);
        const time = self.WORD_SPEAK_TIME;
        const el = self._content;
        let idx = 1;

        self._addWord = $.proxy(function () {
            if (!self._active) return;
            if (idx > words.length) {
                delete self._addWord;
                self._active = false;
                if (!self._hold) {
                    complete();
                    self.hide();
                }
            } else {
                el.html(words.slice(0, idx).join(" "));
                idx++;
                self._loop = window.setTimeout($.proxy(self._addWord, self), time);
            }
        }, self);

        self._addWord();
    };

    // Close the balloon on click
    agent._balloon._balloon.click(e => {
        agent._balloon._finishHideBalloon();
    });
}

export default SeasonalWaiter;
