---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/split-button` entry point, the two-part button of the task status in the mockup (`App.dc.html`): `cw-split-button` runs a quick action from its main half (out `triggered`; named by the required `label`, titled by `tooltip`, its content the visual of the current value, a → hint on hover and focus with `arrow`; with `opensMenu` it opens the menu instead) and opens the projected `cw-menu`, placed against the whole button, from its caret half, a menu button named by `menuLabel` (« Plus d’options » by default, `provideCwSplitButtonLabels` over `CW_SPLIT_BUTTON_LABELS`). The main half grows when the button is stretched. `disabled` disables and dims both halves and closes an open menu.
