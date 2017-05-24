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
var HTMLCategory = function(name, selected) {
    this.name = name;
    this.selected = selected;
    this.op_list = [];
};


/**
 * Adds an operation to this category.
 *
 * @param {HTMLOperation} operation - The operation to add.
 */
HTMLCategory.prototype.add_operation = function(operation) {
    this.op_list.push(operation);
};


/**
 * Renders the category and all operations within it in HTML.
 *
 * @returns {string}
 */
HTMLCategory.prototype.to_html = function() {
    var cat_name = "cat" + this.name.replace(/[\s/-:_]/g, "");
    var html = "<div class='panel category'>\
        <a class='category-title' data-toggle='collapse'\
            data-parent='#categories' href='#" + cat_name + "'>\
            " + this.name + "\
        </a>\
        <div id='" + cat_name + "' class='panel-collapse collapse\
        " + (this.selected ? " in" : "") + "'><ul class='op_list'>";
    
    for (var i = 0; i < this.op_list.length; i++) {
        html += this.op_list[i].to_stub_html();
    }
    
    html += "</ul></div></div>";
    return html;
};
