import { Component, input, output, type InputSignal, type OutputEmitterRef } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowBendUpLeftBold } from '@ng-icons/phosphor-icons/bold';

/**
 * Class CwBubbleQuote
 * @class CwBubbleQuote
 *
 * @description
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
  // #region Properties
  /**
   * Property author
   * @readonly
   *
   * @description
   * Author of the quoted message, read first.
   *
   * @type {InputSignal<string>}
   */
  public readonly author: InputSignal<string> = input.required<string>();

  /**
   * Property cite
   * @readonly
   *
   * @description
   * Address of the quoted message, used as the cite attribute.
   *
   * @type {InputSignal<string>}
   */
  public readonly cite: InputSignal<string> = input('');

  /**
   * Property navigate
   * @readonly
   *
   * @description
   * Emits when the quote is activated to request navigation to the message.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly navigate: OutputEmitterRef<void> = output();
  // #endregion
}
