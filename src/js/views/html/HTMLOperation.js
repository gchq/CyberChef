/**
 * Object to handle the creation of operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {string} name - The name of the operation.
 * @param {Object} config - The configuration object for this operation.
 * @param {HTMLApp} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
var HTMLOperation = function(name, config, app, manager) {
    this.app         = app;
    this.manager     = manager;
    
    this.name        = name;
    this.description = config.description;
    this.manual_bake = config.manual_bake || false;
    this.config      = config;
    this.ing_list    = [];
    
    for (var i = 0; i < config.args.length; i++) {
        var ing = new HTMLIngredient(config.args[i], this.app, this.manager);
        this.ing_list.push(ing);
    }
};


/**
 * @constant
 */
HTMLOperation.INFO_ICON = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAByElEQVR4XqVTzWoaYRQ9KZJmoVaS1J1QiYTIuOgqi9lEugguQhYhdGs3hTyAi0CWJTvJIks30ZBNsimUtlqkVLoQCuJsphRriyFjabWtEyf/Rv3iWcwwymTlgQuH851z5hu43wRGkEwmXwCIA4hiGAUAmUQikQbhEHwyGCWVSglVVUW73RYmyKnxjB56ncJ6NpsVxHGrI/ZLuniVb3DIqQmCHnrNkgcggNeSJPlisRgyJR2b737j/TcDsQUPwv6H5NR4BnroZcb6Z16N2PvyX6yna9Z8qp6JQ0Uf0ughmGHWBSAuyzJqrQ7eqKewY/dzE363C71e39LoWQq5wUwul4uzIBoIBHD01RgyrkZ8eDbvwUWnj623v2DHx4qB51IAzLIAXq8XP/7W0bUVVJtXWIk8wvlN364TA+/1IDMLwmWK/Hq3axmhaBdoGLeklm73ElaBYRgIzkyifHIOO4QQJKM3oJcZq6CgaVp0OTyHw9K/kQI4FiyHfdC0n2CWe5ApFosIPZ7C2tNpXpcDOehGyD/FIbd0euhlhllzFxRzC3fydbG4XRYbB9/tQ41n9m1U7l3lyp9LkfygiZeZCoecmtMqj/+Yxn7Od3v0j50qCO3zAAAAAElFTkSuQmCC";
/**
 * @constant
 */
HTMLOperation.REMOVE_ICON = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwklEQVR42qRTPU8CQRB9K2CCMRJ6NTQajOUaqfxIbLCRghhjQixosLAgFNBQ3l8wsabxLxBJbCyVUBiMCVQEQkOEKBbCnefM3p4eohWXzM3uvHlv52b2hG3bmOWZw4yPn1/XQkCQ9wFxcgZZ0QLKpifpN8Z1n1L13griBBjHhYK0nMT4b+wom53ClAAFQacZJ/m8rNfrSOZy0vxJjPP6IJ2WzWYTO6mUwiwtILiJJSHUKVSWkchkZK1WQzQaxU2pVGUglkjIbreLUCiEx0qlStlFCpfPiPstYDtVKJH9ZFI2Gw1FGA6H6LTbCAaDeGu1FJl6UuYjpwTGzucokZW1NfnS66kyfT4fXns9RaZmlgNcuhZQU+jowLzuOK/HgwEW3E5ZlhLXVWKk11P3wNYNWw+HZdA0sUgx1zjGmD05nckx0ilGjBJdUq3fr7K5e8bGf43RdL7fOPSQb4lI8SLbrUfkUIuY32VTI1bJn5BqDnh4Dodt9ryPUDzyD7aquWoKQohl2i9sAbubwPkTcHkP3FHsg+yT+7sN7G0AF3Xg6sHB3onbdgWWKBDQg/BcTuVt51dQA/JrnIcyIu6rmPV3/hJgACPc0BMEYTg+AAAAAElFTkSuQmCC";


/**
 * Renders the operation in HTML as a stub operation with no ingredients.
 *
 * @returns {string}
 */
HTMLOperation.prototype.to_stub_html = function(remove_icon) {
    var html = "<li class='operation'";
    
    if (this.description) {
        html += " data-container='body' data-toggle='popover' data-placement='auto right'\
            data-content=\"" + this.description + "\" data-html='true' data-trigger='hover'";
    }
    
    html += ">" + this.name;
    
    if (remove_icon) {
        html += "<img src='data:image/png;base64," + HTMLOperation.REMOVE_ICON +
            "' class='op-icon remove-icon'>";
    }
    
    if (this.description) {
        html += "<img src='data:image/png;base64," + HTMLOperation.INFO_ICON + "' class='op-icon'>";
    }
    
    html += "</li>";
    
    return html;
};


/**
 * Renders the operation in HTML as a full operation with ingredients.
 *
 * @returns {string}
 */
HTMLOperation.prototype.to_full_html = function() {
    var html = "<div class='arg-title'>" + this.name + "</div>";

    for (var i = 0; i < this.ing_list.length; i++) {
        html += this.ing_list[i].to_html();
    }
    
    html += "<div class='recip-icons'>\
        <div class='breakpoint' title='Set breakpoint' break='false'></div>\
        <div class='disable-icon recip-icon' title='Disable operation'\
            disabled='false'></div>";
    
    html += "</div>\
        <div class='clearfix'>&nbsp;</div>";
        
    return html;
};


/**
 * Highlights the searched string in the name and description of the operation.
 *
 * @param {string} search_str
 * @param {number} name_pos - The position of the search string in the operation name
 * @param {number} desc_pos - The position of the search string in the operation description
 */
HTMLOperation.prototype.highlight_search_string = function(search_str, name_pos, desc_pos) {
    if (name_pos >= 0) {
        this.name = this.name.slice(0, name_pos) + "<b><u>" +
            this.name.slice(name_pos, name_pos + search_str.length) + "</u></b>" +
            this.name.slice(name_pos + search_str.length);
    }
    
    if (this.description && desc_pos >= 0) {
        this.description = this.description.slice(0, desc_pos) + "<b><u>" +
            this.description.slice(desc_pos, desc_pos + search_str.length) + "</u></b>" +
            this.description.slice(desc_pos + search_str.length);
    }
};
