/**
 * Object to handle the creation of operation categories.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {string} name - The name of the category.
 * @param {boolean} selected - Whether this category is pre-selected or not.
 */
const HTMLCategory = function(name, selected) {
    this.name = name;
    this.selected = selected;
    this.opList = [];
};


/**
 * Adds an operation to this category.
 *
 * @param {HTMLOperation} operation - The operation to add.
 */
HTMLCategory.prototype.addOperation = function(operation) {
    this.opList.push(operation);
};


/**
 * Renders the category and all operations within it in HTML.
 *
 * @returns {string}
 */
HTMLCategory.prototype.toHtml = function() {
    const catName = "cat" + this.name.replace(/[\s/-:_]/g, "");
    let html = "<div class='panel category'>\
        <a class='category-title' data-toggle='collapse'\
            data-parent='#categories' href='#" + catName + "'>\
            " + this.name + "\
        </a>\
        <div id='" + catName + "' class='panel-collapse collapse\
        " + (this.selected ? " in" : "") + "'><ul class='op-list'>";

    for (let i = 0; i < this.opList.length; i++) {
        html += this.opList[i].toStubHtml();
    }

    html += "</ul></div></div>";
    return html;
};

export default HTMLCategory;
