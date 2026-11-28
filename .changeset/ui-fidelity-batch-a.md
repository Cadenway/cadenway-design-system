---
'@cadenway/ui': minor
---

Align several bricks with the mockup (`App.dc.html`).

- `cwButton`: each size now sets its icon size once. `xs` and `icon-xs` draw 14 px icons again; the shared 16 px declaration used to win over theirs. The other sizes keep 16 px.
- Menu: the chosen `cwMenuItemRadio` shows the same check on the right as a `selected` `cwMenuItem`, in place of the dot in a left slot; radio items lose their `pl-8` inset, so a leading icon or dot lines up with the other items, and radio group labels no longer need `inset`. The submenu chevron is 14 px. New `cw-menu-item-value` (`CwMenuItemValue`): the current value at the end of an item (« Thème … Sombre »); on a submenu trigger the chevron follows it at the right edge instead of sharing the free space with it. Triggers without a value keep their chevron at the right.
- `cwSidebarItem`: the current item is violet, `bg-primary/5` with `text-primary` and `font-medium`, and still shows the Fill icon; its count stays muted and regular. The icon rail's current item takes the same tint.
- `cwPopoverTrigger`: the grey veil of an open trigger is now a fallback that yields to any state style of the host, such as the violet `aria-expanded` tint of a `cwAppRailItem`; it still covers a button's plain background.
- `cwKbd` and `cw-shortcut`: new `size="xl"`, 24 px keys with 12 px text for the keyboard shortcuts dialog. `sm` remains the command palette footer key. The default is unchanged.
- `cw-chart`: new `size="lg"` (192 px plot, 12 px axis text, single-series bars up to 36 px wide with 4 px corners), `current` (the `x` of the category still in progress, drawn at 45 % opacity) and `valueLabels` (`none` by default, `all`, or `peak` for the highest bars and the current one, as on the dashboards' weekly completion card). Value labels come one per category: the stack total when stacked, else the category's highest value; a category at 0 is labelled on the baseline, one without any value is not, negative values (not drawn) are never labelled, so a category whose highest value is negative or a stack with a negative part gets no label, and a label that would touch its left neighbour is dropped. New type `CwChartValueLabels`. Other sizes keep their geometry.
- `cw-avatar`: the presence dot overhangs the bottom right corner by 2 px and is larger (12 px on a 32 px avatar). The new `ring` input (`background` by default, `canvas`, `popover`, `card`, `sidebar`) colors its ring after the surface the avatar sits on. New type `CwAvatarRing`.
