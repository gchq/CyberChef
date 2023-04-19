# TODOS 181
## Temporary file to list todos for keeping oversight for issue [181]

---

### Desktop UI:
- `search-results` should really be at the top once input, with `categories` below it
- `calcControlsHeight` and `adjustComponentSizes` cause trouble in `recipe` `rec-list` when resizing from desktop to mobile

### Mobile UI:
- bootstrap native 'x' in `input[type="search"]` should clear input value and
  then display `categories` rather than close the entire dropdown
- on click of `input[type="search]`, `favourites` briefly opens and closes. Initially, it should be opened
- on invalid search input ( and no results ), categories should be displayed
- test with keyboard popping up because that messes with the viewheights on mobile probably

### General UI:
- fix up key / tab events so UI can be navigated comfortably with keys ( inc. visual focus feedback ). Probably a lot
  of work though
- hover / active states can use a bit of TLC

### JS:
- `core/Recipe.mjs`, `core/lib/Magic.js` return imports to original

### Misc:
- check for remaining todos
- check for remaining comments to be deleted
- check and add browser vendor prefixes throughout stylesheets where needed
- comb through CSS and improve organisation for better DevX
- write / complete UI tests
- delete this file when done :)

