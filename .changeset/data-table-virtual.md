---
'@cadenway/ui': minor
---

Add `virtual` to `cw-data-table` for long lists (the List and Sheet views): with `virtual`, only the lines in view plus ten above and below are rendered, between spacer rows that keep the scrollbar to the full list. Row and group heights are fixed by `density` (32, 36 or 44 px rows; 28, 32 or 36 px groups), measured below 768 px where rows become cards. Every rendered row keeps its `aria-rowindex` against `aria-rowcount`; the arrows, Page Up and Page Down, Ctrl+Home and Ctrl+End reach rows that are not rendered yet, Shift+arrows extend the selection across them, and the focused row stays rendered while it is scrolled away. Rows entering on scroll play no entry motion, and double-click auto-fit measures the rendered cells only. Without `virtual`, nothing changes.
