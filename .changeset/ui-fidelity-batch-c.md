---
'@cadenway/ui': minor
---

Align a third batch of bricks with the mockup (`App.dc.html`, `Compte.dc.html`).

- `cw-combobox`: new `minWidth` input (type `CwComboboxMinWidth`, the `CwMenuMinWidth` scale of
  `cw-menu`: `32` 128 px to `72` 288 px), a floor for the panel beyond the trigger's width,
  never more than the viewport less 16 px and none in a phone sheet. Unset by default: the panel
  stays at least as wide as its trigger.
- `cw-calendar-view`: the month grid sizes each week to the lines its fullest day uses (bar
  lines, pills and « +n autres », up to `maxPerDay`) instead of giving every week the height of
  `maxPerDay` lines. A week with at most two lines keeps the variant's minimum (96 px outlined,
  76 px default); a fuller week grows 30 px (outlined) or 22 px (default) a line, so no item is
  clipped and the bars across days keep their lines. A bar across days is now positioned on its
  line over the days it covers: its `absolute` lost to the pill's `relative`, which left it in
  the flow of its first day, one day wide and clipped.
- `cw-card`: a standard card holding a `cw-card-footer` drops its bottom padding, and the footer
  frames itself with `py-3` (12 px above and below its content, the mockup's `Compte.dc.html`
  blocks) instead of 12 px above and the card's 16 px below. Cards without a footer and `sm`
  cards are unchanged.
