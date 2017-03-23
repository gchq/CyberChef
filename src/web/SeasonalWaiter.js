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
var SeasonalWaiter = function(app, manager) {
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
    var spider16 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB3UlEQVQ4y2NgGJaAmYGBgVnf0oKJgYGBobWtXamqqoYTn2I4CI+LTzM2NTulpKbu+vPHz2dV5RWlluZmi3j5+KqFJSSEzpw8uQPdAEYYIzo5Kfjrl28rWFlZzjAzMYuEBQao3Lh+g+HGvbsMzExMDN++fWf4/PXLBzY2tqYNK1f2+4eHM2xcuRLigsT09Igf3384MTExbf767etBI319jU8fPsi+//jx/72HDxh5uLkZ7ty7y/Dz1687Avz8n2UUFR3Z2NjOySoqfmdhYGBg+PbtuwI7O8e5H79+8X379t357PnzYo+ePP7y6cuXc9++f69nYGRsvf/w4XdtLS2R799/bBUWFHr57sP7Jbs3b/ZkzswvUP3165fZ7z9//r988WIVAyPDr8tXr576+u3bpb9//7YwMjKeV1dV41NWVGoVEhDgPH761DJREeHaz1+/lqlpafUx6+jrRfz4+fPy+w8fTu/fsf3uw7t3L39+//4cv7DwGQYGhpdPbt9m4BcRFlNWVJC4fuvWASszs4C379792Ldt2xZBUdEdDP5hYSqQGIjDGa965uYKCalpZQwMDAxhMTG9DAwMDLaurhIkJY7A8IgGBgYGBgd3Dz2yUpeFo6O4rasrA9T24ZRxAAMTwMpgEJwLAAAAAElFTkSuQmCC",
        spider32 = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACYVBMVEUAAAAcJSU2Pz85QkM9RUWEhIWMjI2MkJEcJSU2Pz85QkM9RUWWlpc9RUVXXl4cJSU2Pz85QkM8REU9RUVRWFh6ens9RUVCSkpNVFRdY2McJSU5QkM7REQ9RUVGTk5KUlJQVldcY2Rla2uTk5WampscJSVUWltZX2BrcHF1e3scJSUjLCw9RUVASEhFTU1HTk9bYWJeZGRma2xudHV1eHiZmZocJSUyOjpJUFFQVldSWlpTWVpXXl5YXl5rb3B9fX6RkZIcJSUmLy8tNTU9RUVFTU1IT1BOVldRV1hTWlp0enocJSUfKChJUFBWXV1hZ2hnbGwcJSVETExLUlJLU1NNVVVPVlZYXl9cY2RiaGlobW5rcXFyd3h0eHgcJSUpMTFDS0tQV1dRV1hSWFlWXF1bYWJma2tobW5uc3SsrK0cJSVJUFBMVFROVlZVW1xZX2BdYmNhZ2hjaGhla2tqcHBscHE4Pz9KUlJRWVlSWVlXXF1aYGFbYWFfZWZlampqbW4cJSUgKSkiKysuNjY0PD01PT07QkNES0tHTk5JUFBMUlNMU1NOU1ROVVVPVVZRVlZRV1dSWVlWXFxXXV5aX2BbYWFbYWJcYmJcYmNcY2RdYmNgZmZhZmdkaWpkampkamtlamtla2tma2tma2xnbG1obW5pbG1pb3Bqb3Brb3BtcXJudHVvcHFvcXJvc3NwcXNwdXVxc3RzeXl1eXp2eXl3ent6e3x+gYKAhISBg4SKi4yLi4yWlpeampudnZ6fn6CkpaanqKiur6+vr7C4uLm6urq6u7u8vLy9vb3Av8DR0dL2b74UAAAAgHRSTlMAEBAQEBAQECAgICAgMDBAQEBAQEBAUFBQUGBgYGBgYGBgYGBgcHBwcHCAgICAgICAgICAgICPj4+Pj4+Pj4+Pj5+fn5+fn5+fn5+vr6+vr6+/v7+/v7+/v7+/v7+/z8/Pz8/Pz8/Pz8/P39/f39/f39/f39/f7+/v7+/v7+/v78x6RlYAAAGBSURBVDjLY2AYWUCSgUGAk4GBTdlUhQebvP7yjIgCPQbWzBMnjx5wwJSX37Rwfm1isqj9/iPHTuxYlyeMJi+yunfptBkZOw/uWj9h3vatcycu8eRGlldb3Vsts3ph/cFTh7fN3bCoe2Vf8+TZoQhTvBa6REozVC7cuPvQnmULJm1e2z+308eyJieEBSLPXbKQIUqQIczk+N6eNaumtnZMaWhaHM89m8XVCqJA02Y5w0xmga6yfVsamtrN4xoXNzS0JTHkK3CXy4EVFMumcxUy2LbENTVkZfEzMDAudtJyTmNwS2XQreAFyvOlK9louDNVaXurmjkGgnTMkWDgXswtNouFISEX6Awv+RihQi5OcYY4DtVARpCCFCMGhiJ1hjwFBpagEAaWEpFoC0WQOCOjFMRRwXYMDB4BDLJ+QLYsg7GBGjtasLnEMjCIrWBgyAZ7058FI9x1SoFEnTCDsCyIhynPILYYSFgbYpUDA5bpQBluXzxpI1yYAbd2sCMYRhwAAHB9ZPztbuMUAAAAAElFTkSuQmCC",
        spider64 = "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";

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
    var konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    for (var i = 0; i < this.kkeys.length; i++) {
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
    var skipTags = {
        "SCRIPT": true, "IFRAME": true, "OBJECT": true,
        "EMBED": true, "STYLE": true, "LINK": true, "META": true
    };

    return function(parent, fn, allNodes) {
        var node = parent.firstChild;

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
