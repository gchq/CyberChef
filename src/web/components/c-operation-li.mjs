import url from "url";

/**
 * c(ustom element)-operation-li ( list item )
 *
 * @param {App} app - The main view object for CyberChef
 * @param {string} name - The name of the operation
 * @param {Object} icon - { class: string, innerText: string } - The optional and customizable icon displayed on the right side of the operation
 * @param {Boolean} includeStarIcon - Include the left side 'star' icon to favourite an operation easily
 */
export class COperationLi extends HTMLElement {
    constructor(
        app,
        name,
        icon,
        includeStarIcon,
    ) {
        super();

        this.app = app;
        this.name = name;
        this.icon = icon;
        this.includeStarIcon = includeStarIcon;

        this.config = this.app.operations[name];
        this.isFavourite = this.app.isLocalStorageAvailable() && localStorage.favourites?.includes(name);

        this.build();

        this.addEventListener("click", this.handleClick.bind(this));
        this.addEventListener("dblclick", this.handleDoubleClick.bind(this));

        if (this.includeStarIcon) {
            this.observer = new MutationObserver(this.updateFavourite.bind(this));
            this.observer.observe(this.querySelector("li"), { attributes: true });
        }
    }

    /**
     * Remove listeners on disconnectedCallback
     */
    disconnectedCallback() {
        this.removeEventListener("click", this.handleClick.bind(this));
        this.removeEventListener("dblclick", this.handleDoubleClick.bind(this));
        if (this.includeStarIcon) {
            this.observer.disconnect();
        }
    }

    /**
     * @fires OperationsWaiter#operationDblclick on double click
     * @param {Event} e
     */
    handleDoubleClick(e) {
        if (e.target === this.querySelector("li")) {
            this.app.manager.recipe.addOperation(this.name);
        }
    }

    /**
     * Handle click
     * @param {Event} e
     */
    handleClick(e) {
        if (e.target === this.querySelector("i.star-icon")) {
            this.querySelector("li").classList.add("favourite");
            this.app.addFavourite(this.name);
        }
        if (e.target === this.querySelector("i.remove-icon")) {
            this.remove();
        }
    }


    /**
     * Disable or enable popover for an element
     *
     * @param {HTMLElement} el
     */
    handlePopover(el){
        if (this.app.isMobileView()){
            $(el).popover("disable");
        } else {
            $(el).popover("enable");
            this.setPopover(el);
        }
    }


    /**
     * Build c-operation-li
     */
    build() {
        const li = this.buildListItem();
        const icon = this.buildIcon();

        if ( this.includeStarIcon ){
            const starIcon = this.buildStarIcon();
            li.appendChild(starIcon);
        }

        li.appendChild(icon);
        this.appendChild(li);
        this.handlePopover(li);
    }


    /**
     * Set the target operation popover itself to gain focus which
     * enables scrolling and other interactions.
     *
     * @param {Element} el - The element to start selecting from
     */
    setPopover(el) {
        $(el)
            .find("[data-toggle=popover]")
            .addBack("[data-toggle=popover]")
            .popover({trigger: "manual"})
            .on("mouseenter", function(e) {
                if (e.buttons > 0) return; // Mouse button held down - likely dragging an operation
                const _this = this;
                $(this).popover("show");
                $(".popover").on("mouseleave", function () {
                    $(_this).popover("hide");
                });
            }).on("mouseleave", function () {
            const _this = this;
            setTimeout(function() {
                // Determine if the popover associated with this element is being hovered over
                if ($(_this).data("bs.popover") &&
                    ($(_this).data("bs.popover").tip && !$($(_this).data("bs.popover").tip).is(":hover"))) {
                    $(_this).popover("hide");
                }
            }, 50);
        });
    }

    /**
     * Given a URL for a Wikipedia (or other wiki) page, this function returns a link to that page.
     *
     * @param {string} urlStr
     * @returns {string}
     */
    titleFromWikiLink(urlStr) {
        const urlObj = url.parse(urlStr);
        let wikiName = "",
            pageTitle = "";

        switch (urlObj.host) {
            case "forensicswiki.xyz":
                wikiName = "Forensics Wiki";
                pageTitle = urlObj.query.substr(6).replace(/_/g, " "); // Chop off 'title='
                break;
            case "wikipedia.org":
                wikiName = "Wikipedia";
                pageTitle = urlObj.pathname.substr(6).replace(/_/g, " "); // Chop off '/wiki/'
                break;
            default:
                // Not a wiki link, return full URL
                return `<a href='${urlStr}' target='_blank'>More Information<i class='material-icons inline-icon'>open_in_new</i></a>`;
        }

        return `<a href='${urlObj.href}' target='_blank'>${pageTitle}<i class='material-icons inline-icon'>open_in_new</i></a> on ${wikiName}`;
    }

    /**
     * Build the li element
     */
    buildListItem() {
        const li = document.createElement("li");

        li.setAttribute("data-name", this.name);
        li.classList.add("operation");

        if (this.isFavourite) {
            li.classList.add("favourite");
        }

        li.textContent = this.name;

        if (this.config.description){
            let dataContent = this.config.description;

            if (this.config.infoURL) {
                dataContent += `<hr>${this.titleFromWikiLink(this.config.infoURL)}`;
            }

            li.setAttribute("data-container", "body");
            li.setAttribute("data-toggle", "popover");
            li.setAttribute("data-placement", "left");
            li.setAttribute("data-html", "true");
            li.setAttribute("data-trigger", "hover");
            li.setAttribute("data-boundary", "viewport");
            li.setAttribute("data-content", dataContent);
        }

        return li;
    }

    /**
     * Build the operation list item right side icon
     */
    buildIcon() {
        const icon = document.createElement("i");

        icon.classList.add("material-icons");
        icon.classList.add("op-icon");
        icon.classList.add(this.icon.class);

        icon.innerText = this.icon.innerText;

        return icon;
    }

    /**
     * Build the ( optional ) star icon
     */
    buildStarIcon() {
        const icon = document.createElement("i");
        icon.setAttribute("title", this.name);

        icon.classList.add("material-icons");
        icon.classList.add("op-icon");
        icon.classList.add("star-icon");

        if (this.isFavourite){
            icon.innerText = "star";
        } else {
            icon.innerText = "star_outline";
        }

        return icon;
    }

    /**
     * Update fav icon and 'fav' class on this li
     */
    updateFavourite() {
        if (this.querySelector("li").classList.contains("favourite")) {
            this.querySelector("i.star-icon").innerText = "star";
        } else {
            this.querySelector("i.star-icon").innerText = "star_outline";
        }
    }
}


customElements.define("c-operation-li", COperationLi);
