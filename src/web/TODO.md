# TODOS 181
## Temporary file to list todos for keeping oversight for issue [181]

---

### Mobile UI:
#### Operations:
- on mobile UI, there is almost no visual feedback when adding an operation to the recipe list. Since the recipe list is not visible like on desktop, this is very confusing UX

#### Mobile UI on real device:
- test *thoroughly* with keyboard popping up because that messes with view-heights on mobile probably and might make it a very frustrating experience
- test drag and drop etc. Regular mobile events / UX
- view-heights not correct due to variable taskbar on mobile devices
- adding an operation only works with drag and drop, not on double tap or the like. This todo is related to the remaining mobile UI one ( I think maybe add a checkmark on double tap, then remove it again on double tap or when recipe list gets cleared )

### Desktop UI:
### General UI:
- fix up key / tab events so UI can be navigated comfortably with keys ( inc. visual focus feedback ). Probably a lot of work though

### JS:
- `core/Recipe.mjs`, `core/lib/Magic.js` return imports to original

### Misc:
- remove ln 215 in gruntfile ( for mobile testing )
- comb through CSS and improve organisation for better DevX
- write / complete UI tests
- delete this file when done :)

