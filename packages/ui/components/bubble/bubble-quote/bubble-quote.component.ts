import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowBendUpLeftBold } from '@ng-icons/phosphor-icons/bold';

/**
 * The quoted message a reply answers, at the top of its bubble (Bubble sheet of the Design System
 * artifact, « Citation »).
 *
 * A `blockquote` (with `cite` when given) lighter than the bubble: the `author` first, then the
 * projected excerpt cut after two lines. The author is a button stretched over the whole quote:
 * click, Enter or Space emits `navigate`, to scroll to the quoted message.
 */
@Component({
  selector: 'cw-bubble-quote',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorArrowBendUpLeftBold })],
  host: { class: 'mb-1.5 block' },
  templateUrl: './bubble-quote.component.html',
})
export class CwBubbleQuote {
  /** Author of the quoted message, read first. */
  readonly author = input.required<string>();
  /** Address of the quoted message, set as the `cite` attribute. */
  readonly cite = input('');

  /** The quote was activated: scroll to the quoted message. */
  readonly navigate = output();
}
