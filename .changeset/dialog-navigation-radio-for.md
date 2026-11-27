---
'@cadenway/ui': minor
---

Add `closeOnNavigation` to `cw-dialog`, `true` by default. The CDK closes a dialog on a browser Back or Forward (`popstate`); set the input to `false` for a dialog that must stay open through history navigation, such as a full-screen flow whose consumer binds `[open]` one way. The value is read when the dialog opens. With the default, such a close still sets `open` to false and emits `closed` with the reason `action`, as before. `cw-sheet` and `cw-alert-dialog` keep closing on navigation.

Fix NG0950 in `cw-radio-group` when its items come from a `@for` and the checked item is not the first one rendered, or no item is checked. The group placed its Tab stop by reading the required `value` of every item from the template of the first item, before Angular had set the inputs of the next ones. Items now report when their `value` is set (`CwRadioGroupItem.hasValue`), and until then the group leaves them out of its Tab stop, as `cw-toggle-group` does. Selection, roving tabindex and arrow keys are unchanged.
