---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/tabs` entry point: `cw-tabs` (`[(value)]`, `variant` `segmented` or `bar`, `size` `default` or `sm`, `orientation` `horizontal` or `vertical` with `bar`, `activation` `automatic` or `manual`), `cw-tabs-list` (`ariaLabel`), `button[cwTab]` and `a[cwTab]` (`value`, `disabled`, `count`, `active` for router links; `exportAs: 'cwTab'` with `isActive()`), `cw-tab-panel` (`value`) and `provideCwTabs({ variant, size })`. One Tab stop with arrow, Home and End keys that wrap and skip disabled tabs; one indicator slides to the active tab (off under reduced motion). Buttons make a `tablist` with linked `tabpanel`s; links make a `navigation` whose active link is `aria-current="page"`.
