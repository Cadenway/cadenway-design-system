---
'@cadenway/ui': minor
---

Add `phoneLayout` to `nav[cwAppRail]`: `tab-bar` (the default, unchanged) turns the rail into the bottom tab bar below 768 px; `column` keeps the 56 px column at every width, with its separators, groups and `desktopOnly` items, as the settings screens of the mockup do (`Compte.dc.html`, `Organisation.dc.html`); the column scrolls when it is taller than a short or landscape phone screen. The parts follow the layout through the rail's `data-phone-layout` attribute, so they also work when projected through a wrapper component; used outside a `nav[cwAppRail]`, a part no longer changes below 768 px. New type `CwAppRailPhoneLayout`.
