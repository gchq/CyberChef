# TODOS 181
## Temporary file to list todos for keeping oversight for issue [181]

---

#### Mobile UI ( on real device ):
- on mobile UI, there is almost no visual feedback when adding an operation to the recipe list. Since the recipe list is not visible like on desktop, this is very confusing UX
- adding an operation only works with drag and drop, not on double tap or the like. This todo is related to the remaining mobile UI one.
  Dragging and dropping won't be an option on mobile, because then you can't scroll the operations list. I'm thinking to add
  operations on mobile via double tap, then add a checkmark at the right end of the op list item. Remove an item directly in the list via
  another double tap ( or clearing the recipe list via trash icon as normal ).
- the above causes a problem for adding favourites though, there is some UX difficulty here.

- test *thoroughly* with keyboard popping up because that messes with view-heights on mobile probably and might make it a very frustrating experience
- test drag and drop etc. Regular mobile events / UX
- view-heights not correct due to variable taskbar on mobile devices


### Desktop UI:
### General UI:
- fix up key / tab events so UI can be navigated comfortably with keys ( inc. visual focus feedback ). Probably a lot of work though

### JS:
- `core/Recipe.mjs`, `core/lib/Magic.js` return imports to original

### Misc:
- Gruntfile revert dev config
- comb through CSS and improve organisation for better DevX. Ask repo owners to open another issue perhaps and just redo all of the stylesheets ( preferably with SASS )
- delete this file when done :)

