---
'@cadenway/ui': minor
---

Add the bricks the onboarding assistant needs. All additions are opt-in; existing defaults are unchanged.

- `cw-dialog`: new `size="screen"`. The panel covers the whole viewport on the canvas surface, edge to edge, with no border, radius, shadow, padding or backdrop. The body fills the height and scrolls, and the consumer lays out the content. Focus trapping, Escape, the close button and `cwDialogClose` behave as at the other sizes. `CwDialogSize` gains `'screen'`.
- `cw-stepper`: new `variant` input, `'default' | 'segments'`, and its `CwStepperVariant` type. `segments` draws the steps as a segmented progress bar: one bar per step, filled up to the current one, with the label below. No step is clickable, and the stepper writes no "Step n of N" line, so the consumer writes it. The current step keeps `aria-current="step"`, every step keeps its hidden state text, and `next()` and `previous()` still announce the change. `segments` ignores `orientation` and `size`.
- `cw-radio-group-item`: new `indicator` input, `true` by default. With `variant="card"`, `[indicator]="false"` hides the radio dot. The card then shows its selection by its fill and border alone and draws the focus ring itself, and the radio stays the focused, announced control.
