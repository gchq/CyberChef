# TODOS 181
## Temporary file to list todos for keeping oversight for issue [181]

---

### Desktop UI:
- restore desktop UI

### Mobile UI:
- on load, initial `#edit-favourites` in operations should be hidden until the dropdown is opened
- bootstrap native 'x' in `input[type="search"]` should clear input value and
  then display `categories` rather than close the entire dropdown
- on click of `input[type="search]`, `favourites` briefly opens and closes. Would be nice not to have that
  ( no content jumping around! )
- test with keyboard popping up because that messes with the viewheights on mobile probably
- make sure panels in `workspace-wrapper` grow and add up to 100%

### General UI:
- fix up key / tab events so UI can be navigated comfortably with keys ( inc. visual focus feedback ). Probably a lot
  of work though
- hover / active states can use a bit of TLC

### JS:
- `core/Recipe.mjs`, `core/lib/Magic.js` return imports to original
- `waiters/OperationsWaiter.mjs` isVisible is pretty generic so probably move it ( to manager? )
- `App.mjs` add a window resize listener for functions in setup if ( breakpoint )

### Misc:
- check for remaining todos
- check and add browser vendor prefixes throughout stylesheets where needed
- comb through CSS and improve organisation for better DevX
- write / complete UI tests
- delete this file when done :)

