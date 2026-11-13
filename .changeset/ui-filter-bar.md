---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/filter-bar` entry point: `cw-filter-bar` (`[(filters)]`, `fields` required, `savedFilters`, `dirty`, `total`, `labels`; outputs `saveView`, `applySaved`, `saveFilter`, `manageSaved`) and `cw-filter-chip` (`[(filter)]`, `field`, `labels`; output `removed`), with `ng-template[cwFilterValue]` and `ng-template[cwFilterOption]`, the types `CwFilter`, `CwFilterField`, `CwFilterOperator`, `CwFilterOption`, `CwFilterValue`, `CwSavedFilter`, `CwFilterBarLabels` and the default French texts `CW_FILTER_BAR_LABELS`. Fields, operators and values are given by the consumer; operators and ticked values are edited in `cw-menu` menus, dates in a `cw-calendar` popover, texts in a popover field.
