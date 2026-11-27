---
'@cadenway/ui': minor
---

Add an optional `closeOnNavigation` input to `cw-dialog`. The CDK closes a dialog on a browser Back or Forward (`popstate`); set the input to `false` for a dialog that must stay open through history navigation, such as a full-screen flow whose consumer binds `[open]` one way, or to `true` to close on navigation whatever the application configures. Left unset (the default), the CDK default and any application `DEFAULT_DIALOG_CONFIG` apply, exactly as before. The value is read when the dialog opens. A navigation close still sets `open` to false and emits `closed` with the reason `action`. `cw-sheet` and `cw-alert-dialog` keep following the CDK default and `DEFAULT_DIALOG_CONFIG`.

Fix the focus after a navigation close of `cw-dialog` and `cw-sheet`: they no longer keep the trigger that opened them, so reopening one through `[(open)]` returns the focus to the element focused before it opened, not to that old trigger.

Fix NG0950 in `cw-radio-group` when its items come from a `@for` and the checked item is not the first one rendered, or no item is checked. The group placed its Tab stop by reading the required `value` of every item from the template of the first item, before Angular had set the inputs of the next ones. Each item now marks when its `value` is set, through a component effect and an internal `hasValue` signal, the mechanism `CwToggleGroupItem.hasValue` already uses; until then the group leaves the item out of its Tab stop. Selection, roving tabindex and arrow keys are unchanged.
