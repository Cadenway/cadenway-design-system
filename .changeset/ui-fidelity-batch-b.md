---
'@cadenway/ui': minor
'@cadenway/tokens': minor
---

Align a second batch of bricks with the mockup (`App.dc.html`, `Compte.dc.html`,
`Organisation.dc.html`).

`@cadenway/tokens`: new `animate-menu-item` and `animate-menu-item-up` animations (the mockup's
menu item entrance: 420 ms on the spring easing, out of a 3 px blur and a 6 px slide).

`@cadenway/ui`, new inputs and variants (existing visuals unchanged unless listed below):

- `cw-popover`: `width` (`'fixed'` default, `'content'`: follows the content from the width of its
  `size`, both bounds kept within the viewport less 16 px). New type `CwPopoverWidth`.
- `cw-menu`: `sideOffset` (px, 4 by default) and `minWidth` (`'32'` default to `'72'`, Tailwind
  spacing steps, kept within the viewport less 16 px, none in a phone sheet). New type
  `CwMenuMinWidth`.
- `cw-toggle-group`: `size="xs"` (28 px chip, 12 px text, 14 px icons, 6 px gap) and
  `variant="swatch"` (32 px color circles ringed in violet when chosen, wrapping 8 px apart).
- `cw-progress`: `variant="primary"` (violet bar). `cw-stepper`: `tone` (`'default'` ink,
  `'primary'` violet segments). New type `CwStepperTone`.
- `cw-dialog`: sizes `2xl` (1024 px) and `tall` (1024 px, 88 % of the viewport high), `placement`
  (`'center'` default, `'top'`: pinned 8vh from the top from 768 px, at most 16 px above the bottom
  edge with the body scrolling between header and footer, following the breakpoint and size or
  placement changes while open; `tall`, `full` and `screen` stay centered), `padding` (`'none'` leaves the
  body unpadded); `cw-dialog-header` `variant="bar"` (a wrapping row over a rule, 16 px title).
  New types `CwDialogPlacement`, `CwDialogPadding`, `CwDialogHeaderVariant`.
- `cw-command-dialog`: `fieldEnd` (an `ng-template` drawn at the end of the field row), and
  `clearOnEscape` (`true` default; `false` closes on the first Escape).
- `cw-calendar-view`: `variant="outlined"` (the mockup's month: days of 96 px, growing 30 px a line beyond two `maxPerDay`, other months on
  `bg-muted`, today's number alone in a filled circle, the first of a month with its short month name beside the
  circle, bordered chips, 24 px « + »), `toolbar="title"` (the month as
  an `h2`, « Aujourd'hui » and 28 px arrows grouped at the end) and `viewToggle` (`true` default).
  New label `navigation`, new types `CwCalendarViewVariant`, `CwCalendarViewToolbar`.
- `cw-meter`: `marker` (an alert mark at a value, decorative).
- `cw-toolbar`: `wrap` (controls, and the controls of a group wider than the bar, wrap onto new
  rows instead of moving into « Plus »).
- `cw-data-table`: `editOn` (`'dblclick'` default, `'click'`). New type `CwDataTableEditTrigger`.
- `cwSidebarItem`: `activeIcon` (`null` keeps `icon`, a name replaces the Fill weight).
- `cwTab`: `countLabel` (spoken form of `count`).

Visible changes for every consumer (mockup rules: selected is violet, check on the right):

- `cw-menu`: a ticked `cwMenuItemCheckbox` shows its check on the right after the label (no more
  16 px slot on the left, `pl-8` removed); `cw-menu-label inset` now aligns with icon-led items.
  Menu items enter with `animate-menu-item` (`-up` in a menu opened upwards), 80 ms then +35 ms.
- `cw-toggle-group variant="outline"`: a selected item is violet (`border-primary/50 bg-primary/5`,
  icon `text-primary`) instead of `bg-selected`.
- `cw-radio-group-item variant="card"`: a checked card is violet (`border-primary/50 bg-primary/5`,
  `bg-primary/10` on hover) instead of grey.
- `button[cwButton] variant="outline"` with `aria-pressed="true"` turns violet
  (`border-primary/50 bg-primary/10 text-primary`).
- `cw-sidebar-space` in the icon rail: the space holding the current page takes the violet tint
  (`bg-primary/5`) instead of `bg-selected`. A current `cwSidebarItem` whose Fill twin is not
  registered, without an icon loader, keeps its Bold icon instead of drawing a blank one; its count is read inside the label
  text (« Boîte de réception, 3 non lus »).
- `cwButton size="lg"`: `gap-1.5 px-3` (`px-2.5` with an icon) instead of `gap-2 px-4`;
  `input[cwInput] size="lg"`: `px-2.5` instead of `px-3`.
- `cw-data-table`: the selection column is 40 px wide (was 36 px).
- `cw-activity-feed`: an entry row hovers in `bg-muted` instead of `bg-accent`.
- `cw-kanban`: given a height, the board and its column tracks fill it (`min-h-0 flex-1`).
- `cw-calendar-view`: a day's « + » is named with its weekday (« Créer une tâche le mardi 3
  novembre »). With `maxPerDay` above 2, the default month days grow 22 px a line beyond their
  76 px (the outlined ones 30 px beyond 96 px), so no item is clipped and « +n autres » stays
  reachable.
- Consumer layout classes now win over brick defaults, which sit behind `[:where(&)]:`: the gap of
  `fieldset[cwFieldSet]`; the margin, size and weight of `legend[cwFieldLegend]`; the gap and padding
  of `cw-card` and `cw-empty`; the `mb-1` of `cw-empty-media`; the full width of `cw-alert`; the gap
  of a spaced `cw-toggle-group`; the side padding of a scrollable `cw-dialog-footer`. A consumer
  class that used to lose against these defaults now applies.
