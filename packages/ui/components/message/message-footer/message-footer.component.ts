import { Component } from '@angular/core';

/**
 * The line under the bubbles of a message, styled like its header: time, « modifié », sending
 * state (Message sheet of the Design System artifact, « Pied »).
 *
 * Projected into a `cw-message`, it replaces the footer an outgoing message draws itself.
 */
@Component({
  selector: 'cw-message-footer',
  host: {
    class:
      'flex max-w-full min-w-0 items-center gap-1 px-3 text-xs leading-4 text-muted-foreground',
  },
  templateUrl: './message-footer.component.html',
})
export class CwMessageFooter {}
