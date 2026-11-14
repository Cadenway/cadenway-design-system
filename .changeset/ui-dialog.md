---
'@cadenway/ui': minor
---

Add `@cadenway/ui/components/dialog`: `cw-dialog` with `[cwDialogTrigger]`, its header, title, description, footer and `button[cwDialogClose]`; four sizes (sm, default, lg, full, full screen under 768 px), a scrollable body, `pending`, a two-way `open` and a `closed` output carrying the reason (escape, overlay, close, action). Built on CDK Dialog: focus trap, scroll block, focus returned to the trigger; Escape closes a popup open inside it first.
