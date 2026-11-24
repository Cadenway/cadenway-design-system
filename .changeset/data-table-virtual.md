---
'@cadenway/ui': minor
---

Add `virtual` to `cw-data-table` for long lists (the List and Sheet views): only the lines in view plus ten above and below are rendered, between spacer rows that keep the scrollbar to the full list. Rendered rows and group headers are measured on every layout and observed for later size changes; scrolling stays anchored as estimates change. Unmeasured desktop rows use 32, 36 or 44 px and group headers use 28, 32 or 36 px by density; below 48rem, unmeasured lines use the mean of measured heights of their kind. Keyboard navigation reaches the selection banner and expanded rows, while active, focused and editing rows remain rendered. The table requires a bounded height, such as a fixed height or a flex parent with `min-h-0`. Virtual rows have no entry motion, and column auto-fit measures rendered cells only.
