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

        // CyberChef Challenge
        log.info(
            "43 6f 6e 67 72 61 74 75 6c 61 74 69 6f 6e 73 2c 20 79 6f 75 20 68 61 76 65 20 63 6f 6d 70 6c 65 74 65 64 20 43 79 62 65 72 43 68 65 66 20 63 68 61 6c 6c 65 6e 67 65 20 23 31 21 0a 0a 54 68 69 73 20 63 68 61 6c 6c 65 6e 67 65 20 65 78 70 6c 6f 72 65 64 20 68 65 78 61 64 65 63 69 6d 61 6c 20 65 6e 63 6f 64 69 6e 67 2e 20 54 6f 20 6c 65 61 72 6e 20 6d 6f 72 65 2c 20 76 69 73 69 74 20 77 69 6b 69 70 65 64 69 61 2e 6f 72 67 2f 77 69 6b 69 2f 48 65 78 61 64 65 63 69 6d 61 6c 2e 0a 0a 54 68 65 20 63 6f 64 65 20 66 6f 72 20 74 68 69 73 20 63 68 61 6c 6c 65 6e 67 65 20 69 73 20 39 64 34 63 62 63 65 66 2d 62 65 35 32 2d 34 37 35 31 2d 61 32 62 32 2d 38 33 33 38 65 36 34 30 39 34 31 36 20 28 6b 65 65 70 20 74 68 69 73 20 70 72 69 76 61 74 65 29 2e 0a 0a 54 68 65 20 6e 65 78 74 20 63 68 61 6c 6c 65 6e 67 65 20 63 61 6e 20 62 65 20 66 6f 75 6e 64 20 61 74 20 68 74 74 70 73 3a 2f 2f 70 61 73 74 65 62 69 6e 2e 63 6f 6d 2f 47 53 6e 54 41 6d 6b 56 2e",
        );
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
