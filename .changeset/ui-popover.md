---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/popover` entry point: `cw-popover` (`open` model, `side`, `align`, `sideOffset`, `arrow`, `modal`, `closeOnOutsideClick`, `size`: `sm`, `default`, `lg`, `ariaLabel`, `ariaLabelledby`), `[cwPopoverTrigger]`, `cw-popover-arrow` and `button[cwPopoverClose]`. The panel is a non-modal `role="dialog"` in a CDK overlay, flipped and shifted to stay on screen, revealed from the trigger corner; the focus moves into it on opening, and it closes on Escape, outside click, a new click of the trigger, a close button or when the focus tabs out, the focus returning to the trigger.
