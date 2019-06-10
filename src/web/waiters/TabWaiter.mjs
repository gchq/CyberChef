/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

/**
 * Waiter to handle events related to the input and output tabs
 */
class TabWaiter {

    /**
     * TabWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
    }

    /**
     * Calculates the maximum number of tabs to display
     *
     * @returns {number}
     */
    calcMaxTabs() {
        let numTabs = Math.floor((document.getElementById("IO").offsetWidth - 75)  / 120);
        numTabs = (numTabs > 1) ? numTabs : 2;

        return numTabs;
    }

    /**
     * Gets the currently active input or active tab number
     *
     * @param {string} io - Either "input" or "output"
     * @returns {number} - The currently active tab or -1
     */
    getActiveTab(io) {
        const activeTabs = document.getElementsByClassName(`active-${io}-tab`);
        if (activeTabs.length > 0) {
            if (!activeTabs.item(0).hasAttribute("inputNum")) return -1;
            const tabNum = activeTabs.item(0).getAttribute("inputNum");
            return parseInt(tabNum, 10);
        }
        return -1;
    }

    /**
     * Gets the currently active input tab number
     *
     * @returns {number}
     */
    getActiveInputTab() {
        return this.getActiveTab("input");
    }

    /**
     * Gets the currently active output tab number
     *
     * @returns {number}
     */
    getActiveOutputTab() {
        return this.getActiveTab("output");
    }

    /**
     * Gets the li element for the tab of a given input number
     *
     * @param {number} inputNum - The inputNum of the tab we're trying to get
     * @param {string} io - Either "input" or "output"
     * @returns {Element}
     */
    getTabItem(inputNum, io) {
        const tabs = document.getElementById(`${io}-tabs`).children;
        for (let i = 0; i < tabs.length; i++) {
            if (parseInt(tabs.item(i).getAttribute("inputNum"), 10) === inputNum) {
                return tabs.item(i);
            }
        }
        return null;
    }

    /**
     * Gets the li element for an input tab of the given input number
     *
     * @param {inputNum} - The inputNum of the tab we're trying to get
     * @returns {Element}
     */
    getInputTabItem(inputNum) {
        return this.getTabItem(inputNum, "input");
    }

    /**
     * Gets the li element for an output tab of the given input number
     *
     * @param {number} inputNum
     * @returns {Element}
     */
    getOutputTabItem(inputNum) {
        return this.getTabItem(inputNum, "output");
    }

    /**
     * Gets a list of tab numbers for the currently displayed tabs
     *
     * @param {string} io - Either "input" or "output"
     * @returns {number[]}
     */
    getTabList(io) {
        const nums = [],
            tabs = document.getElementById(`${io}-tabs`).children;

        for (let i = 0; i < tabs.length; i++) {
            nums.push(parseInt(tabs.item(i).getAttribute("inputNum"), 10));
        }

        return nums;
    }

    /**
     * Gets a list of tab numbers for the currently displayed input tabs
     *
     * @returns {number[]}
     */
    getInputTabList() {
        return this.getTabList("input");
    }

    /**
     * Gets a list of tab numbers for the currently displayed output tabs
     *
     * @returns {number[]}
     */
    getOutputTabList() {
        return this.getTabList("output");
    }

    /**
     * Creates a new tab element for the tab bar
     *
     * @param {number} inputNum - The inputNum of the new tab
     * @param {boolean} active - If true, sets the tab to active
     * @param {string} io - Either "input" or "output"
     * @returns {Element}
     */
    createTabElement(inputNum, active, io) {
        const newTab = document.createElement("li");
        newTab.setAttribute("inputNum", inputNum.toString());

        if (active) newTab.classList.add(`active-${io}-tab`);

        const newTabContent = document.createElement("div");
        newTabContent.classList.add(`${io}-tab-content`);

        newTabContent.innerText = `Tab ${inputNum.toString()}`;

        newTab.appendChild(newTabContent);

        if (io === "input") {
            const newTabButton = document.createElement("button");
            newTabButton.type = "button";
            newTabButton.className = "btn btn-primary bmd-btn-icon btn-close-tab";

            const newTabButtonIcon = document.createElement("i");
            newTabButtonIcon.classList.add("material-icons");
            newTabButtonIcon.innerText = "clear";

            newTabButton.appendChild(newTabButtonIcon);

            newTabButton.addEventListener("click", this.manager.input.removeTabClick.bind(this.manager.input));

            newTab.appendChild(newTabButton);
        }

        return newTab;
    }

    /**
     * Creates a new tab element for the input tab bar
     *
     * @param {number} inputNum - The inputNum of the new input tab
     * @param {boolean} [active=false] - If true, sets the tab to active
     * @returns {Element}
     */
    createInputTabElement(inputNum, active=false) {
        return this.createTabElement(inputNum, active, "input");
    }

    /**
     * Creates a new tab element for the output tab bar
     *
     * @param {number} inputNum - The inputNum of the new output tab
     * @param {boolean} [active=false] - If true, sets the tab to active
     * @returns {Element}
     */
    createOutputTabElement(inputNum, active=false) {
        return this.createTabElement(inputNum, active, "output");
    }

    /**
     * Displays the tab bar for both the input and output
     */
    showTabBar() {
        document.getElementById("input-tabs-wrapper").style.display = "block";
        document.getElementById("output-tabs-wrapper").style.display = "block";

        document.getElementById("input-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("input-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("input-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";

        document.getElementById("output-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("output-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("output-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("output-loader").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("show-file-overlay").style.top = "calc(var(--tab-height) + var(--title-height) + 10px)";

        document.getElementById("save-all-to-file").style.display = "inline-block";
    }

    /**
     * Hides the tab bar for both the input and output
     */
    hideTabBar() {
        document.getElementById("input-tabs-wrapper").style.display = "none";
        document.getElementById("output-tabs-wrapper").style.display = "none";

        document.getElementById("input-wrapper").style.height = "calc(100% - var(--title-height))";
        document.getElementById("input-highlighter").style.height = "calc(100% - var(--title-height))";
        document.getElementById("input-file").style.height = "calc(100% - var(--title-height))";

        document.getElementById("output-wrapper").style.height = "calc(100% - var(--title-height))";
        document.getElementById("output-highlighter").style.height = "calc(100% - var(--title-height))";
        document.getElementById("output-file").style.height = "calc(100% - var(--title-height))";
        document.getElementById("output-loader").style.height = "calc(100% - var(--title-height))";
        document.getElementById("show-file-overlay").style.top = "calc(var(--title-height) + 10px)";

        document.getElementById("save-all-to-file").style.display = "none";
    }

    /**
     * Redraws the tab bar with an updated list of tabs, then changes to activeTab
     *
     * @param {number[]} nums - The inputNums of the tab bar to be drawn
     * @param {number} activeTab - The inputNum of the activeTab
     * @param {boolean} tabsLeft - True if there are tabs to the left of the displayed tabs
     * @param {boolean} tabsRight - True if there are tabs to the right of the displayed tabs
     * @param {string} io - Either "input" or "output"
     */
    refreshTabs(nums, activeTab, tabsLeft, tabsRight, io) {
        const tabsList = document.getElementById(`${io}-tabs`);

        // Remove existing tab elements
        for (let i = tabsList.children.length - 1; i >= 0; i--) {
            tabsList.children.item(i).remove();
        }

        // Create and add new tab elements
        for (let i = 0; i < nums.length; i++) {
            const active = (nums[i] === activeTab);
            tabsList.appendChild(this.createTabElement(nums[i], active, io));
        }

        const firstTab = tabsList.firstElementChild,
            lastTab = tabsList.lastElementChild;

        // Display shadows if there are tabs left / right of the displayed tabs
        if (firstTab) {
            if (tabsLeft) {
                firstTab.style.boxShadow = "15px 0px 15px -15px var(--primary-border-colour) inset";
            } else {
                firstTab.style.boxShadow = "";
            }
        }
        if (lastTab) {
            if (tabsRight) {
                lastTab.style.boxShadow = "-15px 0px 15px -15px var(--primary-border-colour) inset";
            } else {
                lastTab.style.boxShadow = "";
            }
        }

        // Show or hide the tab bar depending on how many tabs we have
        if (nums.length > 1) {
            this.showTabBar();
        } else {
            this.hideTabBar();
        }
    }

    /**
     * Refreshes the input tabs, and changes to activeTab
     *
     * @param {number[]} nums - The inputNums to be displayed as tabs
     * @param {number} activeTab - The tab to change to
     * @param {boolean} tabsLeft - True if there are input tabs to the left of the displayed tabs
     * @param {boolean} tabsRight - True if there are input tabs to the right of the displayed tabs
     */
    refreshInputTabs(nums, activeTab, tabsLeft, tabsRight) {
        this.refreshTabs(nums, activeTab, tabsLeft, tabsRight, "input");
    }

    /**
     * Refreshes the output tabs, and changes to activeTab
     *
     * @param {number[]} nums - The inputNums to be displayed as tabs
     * @param {number} activeTab - The tab to change to
     * @param {boolean} tabsLeft - True if there are output tabs to the left of the displayed tabs
     * @param {boolean} tabsRight - True if there are output tabs to the right of the displayed tabs
     */
    refreshOutputTabs(nums, activeTab, tabsLeft, tabsRight) {
        this.refreshTabs(nums, activeTab, tabsLeft, tabsRight, "output");
    }

    /**
     * Changes the active tab to a different tab
     *
     * @param {number} inputNum - The inputNum of the tab to change to
     * @param {string} io - Either "input" or "output"
     * @return {boolean} - False if the tab is not currently being displayed
     */
    changeTab(inputNum, io) {
        const tabsList = document.getElementById(`${io}-tabs`);

        this.manager.highlighter.removeHighlights();
        getSelection().removeAllRanges();

        let found = false;
        for (let i = 0; i < tabsList.children.length; i++) {
            const tabNum = parseInt(tabsList.children.item(i).getAttribute("inputNum"), 10);
            if (tabNum === inputNum) {
                tabsList.children.item(i).classList.add(`active-${io}-tab`);
                found = true;
            } else {
                tabsList.children.item(i).classList.remove(`active-${io}-tab`);
            }
        }

        return found;
    }

    /**
     * Changes the active input tab to a different tab
     *
     * @param {number} inputNum
     * @returns {boolean} - False if the tab is not currently being displayed
     */
    changeInputTab(inputNum) {
        return this.changeTab(inputNum, "input");
    }

    /**
     * Changes the active output tab to a different tab
     *
     * @param {number} inputNum
     * @returns {boolean} - False if the tab is not currently being displayed
     */
    changeOutputTab(inputNum) {
        return this.changeTab(inputNum, "output");
    }

    /**
     * Updates the tab header to display a preview of the tab contents
     *
     * @param {number} inputNum - The inputNum of the tab to update the header of
     * @param {string} data - The data to display in the tab header
     * @param {string} io - Either "input" or "output"
     */
    updateTabHeader(inputNum, data, io) {
        const tab = this.getTabItem(inputNum, io);
        if (tab === null) return;

        let headerData = `Tab ${inputNum}`;
        if (data.length > 0) {
            headerData = data.slice(0, 100);
            headerData = `${inputNum}: ${headerData}`;
        }
        tab.firstElementChild.innerText = headerData;
    }

    /**
     * Updates the input tab header to display a preview of the tab contents
     *
     * @param {number} inputNum - The inputNum of the tab to update the header of
     * @param {string} data - The data to display in the tab header
     */
    updateInputTabHeader(inputNum, data) {
        this.updateTabHeader(inputNum, data, "input");
    }

    /**
     * Updates the output tab header to display a preview of the tab contents
     *
     * @param {number} inputNum - The inputNum of the tab to update the header of
     * @param {string} data - The data to display in the tab header
     */
    updateOutputTabHeader(inputNum, data) {
        this.updateTabHeader(inputNum, data, "output");
    }

    /**
     * Updates the tab background to display the progress of the current tab
     *
     * @param {number} inputNum - The inputNum of the tab
     * @param {number} progress - The current progress
     * @param {number} total - The total which the progress is a percent of
     * @param {string} io - Either "input" or "output"
     */
    updateTabProgress(inputNum, progress, total, io) {
        const tabItem = this.getTabItem(inputNum, io);
        if (tabItem === null) return;

        const percentComplete = (progress / total) * 100;
        if (percentComplete === 100 || progress === false) {
            tabItem.style.background = "";
        } else {
            tabItem.style.background = `linear-gradient(to right, var(--title-background-colour) ${percentComplete}%, var(--primary-background-colour) ${percentComplete}%)`;
        }
    }

    /**
     * Updates the input tab background to display its progress
     *
     * @param {number} inputNum
     * @param {number} progress
     * @param {number} total
     */
    updateInputTabProgress(inputNum, progress, total) {
        this.updateTabProgress(inputNum, progress, total, "input");
    }

    /**
     * Updates the output tab background to display its progress
     *
     * @param {number} inputNum
     * @param {number} progress
     * @param {number} total
     */
    updateOutputTabProgress(inputNum, progress, total) {
        this.updateTabProgress(inputNum, progress, total, "output");
    }

}

export default TabWaiter;
