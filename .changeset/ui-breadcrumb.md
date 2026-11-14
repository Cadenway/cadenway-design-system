---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/breadcrumb` entry point: `nav[cwBreadcrumb]` (`size` `default` or `sm`, `separator` `chevron` or `slash`, `maxItems` = 4, `ariaLabel` = Fil d'Ariane, `ellipsisLabel` = Niveaux masqués), `a[cwBreadcrumbLink]` (and `button[cwBreadcrumbLink]` for a level with a menu), `span[cwBreadcrumbPage]` (`aria-current="page"`, truncated past 192 px with a tooltip), `cw-breadcrumb-separator` and `cw-breadcrumb-ellipsis`. The levels are written flat and laid out as an ordered list; past `maxItems` the middle levels fold into « … », which opens a `cw-menu` of the hidden levels.
