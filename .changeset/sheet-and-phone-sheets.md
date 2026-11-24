---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/sheet` entry point: `cw-sheet`, a panel docked to an edge of the screen above a backdrop (Sheet sheet), with `[cwSheetTrigger]`, `cw-sheet-header`, `h2[cwSheetTitle]`, `p[cwSheetDescription]`, `cw-sheet-body`, `cw-sheet-footer` and `button[cwSheetClose]`; `side` right (`animate-sheet-in`), left, top or bottom (`animate-drawer-in`), `size` sm, default, lg or full, `showClose`, `closeOnEscape`, `closeOnOverlayClick`, `closeLabel`, a two-way `open` and a `closed` output carrying the reason. Built on CDK Dialog like `cw-dialog`: focus trap, scroll block, focus returned to the trigger. Its close label is French by default and replaced with `provideCwSheetLabels`, like the other bricks.

Add `provideCwPhoneSheets` to `@cadenway/ui/core`: an application that provides it gets, below 768 px, the panels of `cw-menu`, `cw-popover`, `cw-select` and `cw-combobox` docked above the bottom tab bar, full width between 8 px gutters (mockup `App.dc.html`). Opt-in: without the provider every brick behaves as before.
