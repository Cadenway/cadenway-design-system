---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/app-rail` entry point, the applications rail of the app shell (mockup `App.dc.html`): `nav[cwAppRail]` (named by `ariaLabel`), `cw-app-rail-group` (`desktopOnly`), `cw-app-rail-separator`, `cw-app-rail-footer` (pushed to the bottom) and `a` or `button[cwAppRailItem]`. An item is a 36 px icon button whose content is its label (hidden on screen, its accessible name and its tooltip, shown on the right on hover and keyboard focus; `tooltip`, `shortcut`), `current` for `aria-current="page"`, the violet tint and the filled icon (`activeIcon`, by default the Fill weight), a `badge` read after the label (`badgeLabel`), the `primary` variant of the organization switcher, and a `[cwAppRailItemMedia]` element (initials, an avatar) when it has no icon. From 768 px the rail is a 56 px column; below, a 56 px tab bar fixed at the bottom of the screen, without the separators and the `desktopOnly` groups and items.
