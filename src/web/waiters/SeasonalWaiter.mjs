/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * Waiter to handle seasonal events and easter eggs.
 */
class SeasonalWaiter {

    /**
     * SeasonalWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
    }


    /**
     * Loads all relevant items depending on the current date.
     */
    load() {
        // Konami code
        this.kkeys = [];
        window.addEventListener("keydown", this.konamiCodeListener.bind(this));
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

}

export default SeasonalWaiter;
