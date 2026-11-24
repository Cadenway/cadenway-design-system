---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/split-button` entry point, the two-part button of the task status in the mockup (`App.dc.html`): `cw-split-button` runs a quick action from its main half (out `advance`, named and titled by the required `label`, its content the visual of the current value, a → hint on hover and focus while `advanceable`) and opens the projected `cw-menu` from its caret half (named by `menuLabel`, « Plus d’options » by default, with the keyboard and states of `CwMenuTriggerFor`). `disabled` disables both halves. The caret's default name comes from `provideCwSplitButtonLabels` over `CW_SPLIT_BUTTON_LABELS`.
