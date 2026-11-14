---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/collapsible` entry point: `cw-collapsible` (`[(expanded)]`, `disabled`, exported as `cwCollapsible`), the `[cwCollapsibleTrigger]` directive (`bare` on a `cwButton`, or the 36 px `row` of the List view; `aria-expanded`, `aria-controls`, `aria-disabled`), `cw-collapsible-content` (grid rows 0fr to 1fr with a fade, 300 ms `ease-snap`, `inert` when closed) and `cw-collapsible-chevron` (`down` turning 180°, `right` turning 90°). Every part carries `data-state="open|closed"`.
