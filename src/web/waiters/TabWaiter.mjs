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
        let numTabs = Math.floor(
            (document.getElementById("IO").offsetWidth - 75) / 120,
        );
        numTabs = numTabs > 1 ? numTabs : 2;

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
     * Gets the li element for the tab of a given input number
     *
     * @param {number} inputNum - The inputNum of the tab we're trying to get
     * @param {string} io - Either "input" or "output"
     * @returns {Element}
     */
    getTabItem(inputNum, io) {
        const tabs = document.getElementById(`${io}-tabs`).children;
        for (let i = 0; i < tabs.length; i++) {
            if (
                parseInt(tabs.item(i).getAttribute("inputNum"), 10) === inputNum
            ) {
                return tabs.item(i);
            }
        }
        return null;
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
        newTabContent.addEventListener(
            "wheel",
            this.manager[io].scrollTab.bind(this.manager[io]),
            { passive: false },
        );
        newTab.appendChild(newTabContent);

        if (io === "input") {
            const newTabButton = document.createElement("button"),
                newTabButtonIcon = document.createElement("i");
            newTabButton.type = "button";
            newTabButton.className =
                "btn btn-primary bmd-btn-icon btn-close-tab";
            newTabButtonIcon.classList.add("material-icons");
            newTabButtonIcon.innerText = "clear";
            newTabButton.appendChild(newTabButtonIcon);
            newTabButton.addEventListener(
                "click",
                this.manager.input.removeTabClick.bind(this.manager.input),
            );
            newTab.appendChild(newTabButton);
        }

        return newTab;
    }

    /**
     * Displays the tab bar for both the input and output
     */
    showTabBar() {
        document.getElementById("input-tabs-wrapper").style.display = "block";
        document.getElementById("output-tabs-wrapper").style.display = "block";
        document.getElementById("input-wrapper").classList.add("show-tabs");
        document.getElementById("output-wrapper").classList.add("show-tabs");
        document.getElementById("save-all-to-file").style.display =
            "inline-block";
    }

    /**
     * Hides the tab bar for both the input and output
     */
    hideTabBar() {
        document.getElementById("input-tabs-wrapper").style.display = "none";
        document.getElementById("output-tabs-wrapper").style.display = "none";
        document.getElementById("input-wrapper").classList.remove("show-tabs");
        document.getElementById("output-wrapper").classList.remove("show-tabs");
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
            const active = nums[i] === activeTab;
            tabsList.appendChild(this.createTabElement(nums[i], active, io));
        }

        // Display shadows if there are tabs left / right of the displayed tabs
        if (tabsLeft) {
            tabsList.classList.add("tabs-left");
        } else {
            tabsList.classList.remove("tabs-left");
        }
        if (tabsRight) {
            tabsList.classList.add("tabs-right");
        } else {
            tabsList.classList.remove("tabs-right");
        }

        // Show or hide the tab bar depending on how many tabs we have
        if (nums.length > 1) {
            this.showTabBar();
        } else {
            this.hideTabBar();
        }
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

        let found = false;
        for (let i = 0; i < tabsList.children.length; i++) {
            const tabNum = parseInt(
                tabsList.children.item(i).getAttribute("inputNum"),
                10,
            );
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
        if (percentComplete >= 100 || progress === false) {
            tabItem.style.background = "";
        } else {
            tabItem.style.background = `linear-gradient(to right, var(--title-background-colour) ${percentComplete}%, var(--primary-background-colour) ${percentComplete}%)`;
        }
    }
}

export default TabWaiter;
