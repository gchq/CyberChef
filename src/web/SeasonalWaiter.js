import spiderImages from "./spiderImages.json";


const { spider16, spider32, spider64 } = spiderImages;

/**
 * Waiter to handle seasonal events and easter eggs.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {App} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
const SeasonalWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;
};


/**
 * Loads all relevant items depending on the current date.
 */
SeasonalWaiter.prototype.load = function() {
    //var now = new Date();

    // SpiderChef
    // if (now.getMonth() === 3 && now.getDate() === 1) { // Apr 1
        // this.insertSpiderIcons();
        // this.insertSpiderText();
    // }

    // Konami code
    this.kkeys = [];
    window.addEventListener("keydown", this.konamiCodeListener.bind(this));
};


/**
 * Replaces chef icons with spider icons.
 * #spiderchef
 */
SeasonalWaiter.prototype.insertSpiderIcons = function() {

    // Favicon
    document.querySelector("link[rel=icon]").setAttribute("href", "data:image/png;base64," + spider16);

    // Bake button
    document.querySelector("#bake img").setAttribute("src", "data:image/png;base64," + spider32);

    // About box
    document.querySelector(".about-img-left").setAttribute("src", "data:image/png;base64," + spider64);
};


/**
 * Replaces all instances of the word "cyber" with "spider".
 * #spiderchef
 */
SeasonalWaiter.prototype.insertSpiderText = function() {
    // Title
    document.title = document.title.replace(/Cyber/g, "Spider");

    // Body
    SeasonalWaiter.treeWalk(document.body, function(node) {
        // process only text nodes
        if (node.nodeType === 3) {
            node.nodeValue = node.nodeValue.replace(/Cyber/g, "Spider");
        }
    }, true);

    // Bake button
    SeasonalWaiter.treeWalk(document.getElementById("bake-group"), function(node) {
        // process only text nodes
        if (node.nodeType === 3) {
            node.nodeValue = node.nodeValue.replace(/Bake/g, "Spin");
        }
    }, true);

    // Recipe title
    document.querySelector("#recipe .title").innerHTML = "Web";
};


/**
 * Listen for the Konami code sequence of keys. Turn the page upside down if they are all heard in
 * sequence.
 * #konamicode
 */
SeasonalWaiter.prototype.konamiCodeListener = function(e) {
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
};


/**
 * Walks through the entire DOM starting at the specified element and operates on each node.
 *
 * @static
 * @param {element} parent - The DOM node to start from
 * @param {Function} fn - The callback function to operate on each node
 * @param {booleam} allNodes - Whether to operate on every node or not
 */
SeasonalWaiter.treeWalk = (function() {
    // Create closure for constants
    const skipTags = {
        "SCRIPT": true, "IFRAME": true, "OBJECT": true,
        "EMBED": true, "STYLE": true, "LINK": true, "META": true
    };

    return function(parent, fn, allNodes) {
        let node = parent.firstChild;

        while (node && node !== parent) {
            if (allNodes || node.nodeType === 1) {
                if (fn(node) === false) {
                    return false;
                }
            }
            // If it's an element &&
            //    has children &&
            //    has a tagname && is not in the skipTags list
            // then, we can enumerate children
            if (node.nodeType === 1 &&
                node.firstChild &&
                !(node.tagName && skipTags[node.tagName])) {
                node = node.firstChild;
            } else if (node.nextSibling) {
                node = node.nextSibling;
            } else {
                // No child and no nextsibling
                // Find parent that has a nextSibling
                while ((node = node.parentNode) !== parent) {
                    if (node.nextSibling) {
                        node = node.nextSibling;
                        break;
                    }
                }
            }
        }
    };
})();

export default SeasonalWaiter;
