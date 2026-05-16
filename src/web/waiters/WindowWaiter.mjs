/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * Waiter to handle events related to the window object.
 */
class WindowWaiter {

    /**
     * WindowWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
    }


    /**
     * Handler for window resize events.
     */
    windowResize() {
        if (!this.app.isMobileView()) {
            this.onResizeToDesktop();
        } else {
            this.onResizeToMobile();
        }

        // #output can be maximised on all screen sizes, so if it was open while resizing,
        // it can be kept maximised until minimised manually
        if (document.getElementById("output").classList.contains("maximised-pane")) {
            this.manager.controls.setPaneMaximised("output", true);
        }
    }


    /**
     * Set desktop UI and close #recipe / #input maximised panes if there were any.
     * Correct the height of #recipe
     */
    onResizeToDesktop() {
        this.app.setDesktopUI();

        // enable popovers on li.operation elements
        $(document.querySelectorAll("li.operation")).popover("enable");

        // if a window is resized past breakpoint while #recipe or #input is maximised, close these maxed panes
        ["recipe", "input"].forEach(paneId => this.manager.controls.setPaneMaximised(paneId, false));

        // to prevent #recipe from keeping the height set in divideAvailableSpace
        document.getElementById("recipe").style.height = "100%";
    }

    /**
     * Set mobile UI and close any maximised panes if there were any
     */
    onResizeToMobile() {
        this.app.setMobileUI();

        // disable app popovers on li.operation elements
        $(document.querySelectorAll("li.operation")).popover("disable");

        // when mobile devices' keyboards pop up, it triggers a window resize event. Here
        // we keep the maximised panes open until the minimise button is clicked / tapped
        ["recipe", "input", "output"]
            .map(paneId => document.getElementById(paneId))
            .filter(pane => pane.classList.contains("maximised-pane"))
            .forEach(pane => this.manager.controls.setPaneMaximised(pane.id, true));
    }


    /**
     * Handler for window blur events.
     * Saves the current time so that we can calculate how long the window was unfocused for when
     * focus is returned.
     */
    windowBlur() {
        this.windowBlurTime = Date.now();
    }


    /**
     * Handler for window focus events.
     *
     * When a browser tab is unfocused and the browser has to run lots of dynamic content in other
     * tabs, it swaps out the memory for that tab.
     * If the CyberChef tab has been unfocused for more than a minute, we run a silent bake which will
     * force the browser to load and cache all the relevant JavaScript code needed to do a real bake.
     * This will stop baking taking a long time when the CyberChef browser tab has been unfocused for
     * a long time and the browser has swapped out all its memory.
     */
    windowFocus() {
        const unfocusedTime = Date.now() - this.windowBlurTime;
        if (unfocusedTime > 60000) {
            this.app.silentBake();
        }
    }

}

export default WindowWaiter;
