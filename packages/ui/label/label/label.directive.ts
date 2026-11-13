import { Directive } from '@angular/core';

/**
 * The visible, clickable name of a control (Label sheet of the Design System artifact).
 *
 * Put it on a native `<label>` and point its `for` at the control's `id` (`cw-checkbox`,
 * `cw-switch` and `cw-select` hand their `id` to their inner button), or wrap the control. Sentence
 * case, no colon, no lone asterisk: write « (facultatif) » in a `font-normal text-muted-foreground`
 * span for the exception. The label never turns red on an error. It dims when it follows a
 * disabled `peer` control or sits in a disabled `cw-field`.
 */
@Directive({
  selector: 'label[cwLabel]',
  host: {
    class:
      'flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]/field:pointer-events-none group-data-[disabled=true]/field:opacity-50',
  },
})
export class CwLabel {}
