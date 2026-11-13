---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/tooltip` entry point: the `[cwTooltip]` directive (text or template, `cwTooltipShortcut` keys drawn with the inverse `kbd[cwKbd]`, `cwTooltipSide`, `cwTooltipAlign`, `cwTooltipArrow`, `cwTooltipOpenDelay`, `cwTooltipDisabled`) and `provideCwTooltip({ openDelay, skipDelay })`. The bubble is a `role="tooltip"` in a CDK overlay, referenced by the host's `aria-describedby` while open; it opens after 700 ms of hover, at once on keyboard focus and within the 300 ms skip window, stays open while hovered, closes on leave, blur, press and Escape, one at a time.
