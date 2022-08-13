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
        this.tabHeaderAliases = []; // Mapping custom tab headers to indexes/numbers.
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

        newTabContent.addEventListener("wheel", this.manager[io].scrollTab.bind(this.manager[io]), {passive: false});

        newTab.appendChild(newTabContent);

        if (io === "input") {
            const newTabButton = document.createElement("button"),
                newTabButtonIcon = document.createElement("i");
            newTabButton.type = "button";
            newTabButton.className = "btn btn-primary bmd-btn-icon btn-close-tab";

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

        document.getElementById("input-wrapper").classList.add("show-tabs");
        document.getElementById("output-wrapper").classList.add("show-tabs");

        document.getElementById("save-all-to-file").style.display = "inline-block";
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
            const active = (nums[i] === activeTab);
            tabsList.appendChild(this.createTabElement(nums[i], active, io));
        }

        // Show or hide the tab bar depending on how many tabs we have
        if (nums.length > 1) {
            this.showTabBar();
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
    async updateTabHeader(inputNum, data, io) {
        const tab = this.getTabItem(inputNum, io);
        if (tab == null) return;

        const customHeaderData = this.getTabHeaderAlias(inputNum);

        // When 'customHeaderData === `Tab ${inputNum}`' is true, it's usually due to
        // a user having opened the rename textbox but then closing it without change.
        const isStandardHeader = customHeaderData === null || customHeaderData === `Tab ${inputNum}`;

        let headerData = isStandardHeader ? `Tab ${inputNum}` : customHeaderData;
        const dataIsFile = data instanceof ArrayBuffer;
        const includeData = data.length > 0 || dataIsFile;

        if (includeData) {
            const inputObj = await this.manager.input.getInputObj(inputNum);

            const dataPreview = dataIsFile ? inputObj.data.name : data.slice(0, 100);

            if (isStandardHeader)
                headerData = inputNum.toString();
            else
                headerData = `'${customHeaderData}'`;

            headerData += `: ${dataPreview}`;
        }
        tab.firstElementChild.innerText = headerData;
        if (!isStandardHeader && !includeData)
            tab.firstElementChild.innerText = `'${headerData}'`;
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
        if (percentComplete >= 100 || progress === false) {
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

    /**
     * Adds an alias between a custom tab header and a tab number so that
     * mapping between the two is possible if DOM element is removed.
     *
     * @param {number} tabNum - The index of the tab being aliased
     * @param {string} tabHeader - The custom tab header
     */
    addTabHeaderAlias(tabNum, tabHeader) {
        // First, we try to overwrite an existing alias.
        for (let i = 0; i < this.tabHeaderAliases.length; i++) {
            if (this.tabHeaderAliases.at(i).tabNumber === tabNum) {
                this.tabHeaderAliases.at(i).customHeader = tabHeader;
                return;
            }
        }
        this.tabHeaderAliases.push({tabNumber: tabNum, customHeader: tabHeader});
    }

    /**
     * Removes a previously-assigned header alias.
     *
     * @param {number} tabNum - The index of the tab that should be removed.
     * @param {boolean} shouldThrow - A boolean representing whether the function should throw an exception or return silently if it cannot locate the tab header.
     */
    removeTabHeaderAlias(tabNum, shouldThrow) {
        for (let i = 0; i < this.tabHeaderAliases.length; i++) {

            if (this.tabHeaderAliases.at(i).tabNumber === tabNum) {
                this.tabHeaderAliases.splice(i, 1);
                return;
            }

        }
        if (shouldThrow)
            throw `Unable to locate header alias at tab index ${tabNum.toString()}.`;
    }

    /**
     * Retrieves the custom header for a given tab.
     *
     * @param {number} tabNum - The index of the tab whose alias should be retrieved.
     * @param {boolean} shouldThrow - Whether the function should throw an exception (instead of returning null) in the event of it being unable to locate the tab.
     * @returns {string} customHeader - The custom header for the requested tab.
     */
    getTabHeaderAlias(tabNum, shouldThrow) {
        for (let i = 0; i < this.tabHeaderAliases.length; i++) {

            if (this.tabHeaderAliases.at(i).tabNumber === tabNum)
                return this.tabHeaderAliases.at(i).customHeader;

        }
        if (shouldThrow)
            throw `Unable to locate header alias at tab index ${tabNum.toString()}.`;
        return null;
    }

}

export default TabWaiter;

