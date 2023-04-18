# TODOS 181
## Temporary file to list todos for keeping oversight for issue [181]

---

### Desktop UI:
- restore desktop UI

### Mobile UI:
- initial favourites icon in operations should be hidden until the dropdown is opened
- bootstrap native 'x' in `input[type="search"]` should clear input value and
  then display `categories` rather than close the entire dropdown
- test with keyboard popping up because that messes with the viewheights on mobile probably
- make sure panels in `workspace-wrapper` grow and add up to 100%

### General UI:
- fix up key events so UI can be navigated comfortably with keys ( inc. visual focus feedback )

### JS:
- `core/Recipe.mjs`, `core/lib/Magic.js` return imports to original
- `waiters/OperationsWaiter.mjs` isVisible is pretty generic so probably move it ( to manager? )
- `App.mjs` in setup, add a window resize listener for responsive functions

### Misc:
- write / complete UI tests
- delete this file when done :)

