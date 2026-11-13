---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/menu` entry point: `cw-menu` (`side`, `align`, `ariaLabel`, `inline`; output `closed`; `data()` of the trigger that opened it), `[cwMenuTriggerFor]` on a button or on a menu item (submenus), `button[cwMenuItem]` (`variant` `default` or `destructive`, `inset`, `selected`, `disabled`; output `triggered`), `button[cwMenuItemCheckbox]` (`[(checked)]`), `cw-menu-radio-group` (`[(value)]`) with `button[cwMenuItemRadio]`, `cw-menu-group`, `cw-menu-label`, `cw-menu-separator` and `cw-menu-shortcut`. The panel opens in a CDK overlay from the trigger's corner, one menu at a time, with arrow, Home, End, typeahead, →/← submenu, Escape and Tab keys, and closes on an outside click.
