---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/accordion` entry point: `cw-accordion` (`type` single or multiple, `collapsible`, `[(value)]`, `variant` default or card), `cw-accordion-item` (`value`, `disabled`; wraps its trigger in an `h3`), `button[cwAccordionTrigger]` (chevron, ripple, `aria-expanded`, `aria-controls`; ↓ ↑ Home End between triggers through the CDK `FocusKeyManager`) and `cw-accordion-content` (a `region` named by its trigger, grid rows animation, `inert` when closed).
