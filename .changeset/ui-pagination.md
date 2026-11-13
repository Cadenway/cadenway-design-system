---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/pagination` entry point: `cw-pagination` (`[(page)]`, `[(pageSize)]`, `total`, `pageSizes` = 10, 25, 50, 100 through `cw-select`, `variant` `full` or `simple`, `size` `default` or `sm`, `siblings`, `showFirstLast`, `showRange`, `ariaLabel`, `labels`), with `a[cwPaginationLink]` / `button[cwPaginationLink]` and `cw-pagination-ellipsis` for a routed pagination built by hand. Page changes are announced (« Page 6 sur 12 ») and a new page size goes back to page 1.
