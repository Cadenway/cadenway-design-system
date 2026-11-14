---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/stepper` entry point: `cw-stepper` (`orientation` `horizontal` or `vertical`, `size` `default` or `sm`, `[(selected)]`, `linear` = true, `ariaLabel` = Progression, `labels`; methods `next()`, `previous()`, `reset()`) and `cw-step` (`label`, `description`, `optional`, `completed`, `error`, `editable`; its content is the panel of the current step). Done steps are buttons, steps to come plain text; ← → (↑ ↓ vertical), Home and End move between reachable steps; a change moves the focus to the new panel and is announced (« Étape 3 sur 5 : Équipe »).
