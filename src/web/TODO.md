# TODOS 181
## Temporary file to list todos for keeping oversight for issue [181]

---

### Mobile UI:
#### Operations:
- `categories` and `search-results` shouldn't really alter one another, rather `search-results` if there are any, should be placed at the top of `categories`
- bootstrap native 'x' in `input[type="search"]` should clear input value and then display `categories` rather than close the entire dropdown
- related: on invalid search input ( and no results ) or no input but focus on `search`, `categories` should be displayed
- on click of `input[type="search]`, `favourites` briefly opens and closes. It should remain open until further action
- on mobile, there is almost no visual feedback when adding an operation to the recipe list. Since the recipe list is not visible like on desktop, this is very confusing UX

#### General mobile UX:
- test *thoroughly* with keyboard popping up because that messes with view-heights on mobile probably and might make it a very frustrating experience
- test drag and drop etc. Regular mobile events / UX

### Desktop UI:
#### Operations:
- dropdown must be open by default and not closable at all. Inherit any other behaviour from mobile Operations fixes

#### Bug
- `calcControlsHeight` and `adjustComponentSizes` cause trouble in `recipe` `rec-list` when resizing from desktop to mobile

### General UI:
- fix up key / tab events so UI can be navigated comfortably with keys ( inc. visual focus feedback ). Probably a lot of work though

### JS:
- `core/Recipe.mjs`, `core/lib/Magic.js` return imports to original

### Misc:
- check for remaining todos
- check for remaining comments to be deleted
- check and add browser vendor prefixes throughout stylesheets where needed
- comb through CSS and improve organisation for better DevX
- special checks for features removed from mobile ( like multiple tabs, minimise, maximise etc. )
- write / complete UI tests
- delete this file when done :)

