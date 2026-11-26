---
'@cadenway/ui': minor
---

Add the data bricks of the list views (workload, sheet, activity, sprint report):

- `cw-data-table`: a sticky footer row of per-column aggregates, from a `footer` function on a
  column or an `ng-template[cwFooterCell]` (`CwFooterCellDef`, `CwFooterCellContext`), reached with
  the arrows; and a `rowContextMenu` input that opens a `cw-menu` on a data row with a right click, a
  long press, Shift + F10 or the Menu key, the row given as the menu's `data()`.
- `cw-chart`: `markers` (`CwChartMarker`), vertical reference lines with a label such as « today »,
  described to screen readers; `maxSeries`, `othersLabel` and `othersColor`, which sum the series
  past the limit into one « Autres » series (`CW_CHART_OTHERS_KEY`). New `othersLabel` and `marker`
  texts in `CwChartLabels`.
- New `@cadenway/ui/components/heat-grid`: `cw-heat-grid`, a rows × columns load grid (person × day)
  with load levels, item chips (`ng-template[cwHeatGridChip]`), a day popover, row headers with an
  avatar, a total column with a `cw-meter` (`ng-template[cwHeatGridTotal]`), grid keyboard navigation
  and `provideCwHeatGridLabels`.
- New `@cadenway/ui/components/activity-feed`: `cw-activity-feed`, a list of activity entries with an
  actor avatar or icon, a rich-text summary, a quote, a detail template, a time, optional grouping by
  day and `provideCwActivityFeedLabels`.

Existing defaults are unchanged; the new texts have French defaults, from the mockup where it has the wording.
