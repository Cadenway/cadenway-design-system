import {
  DOCUMENT,
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  type InputSignalWithTransform,
} from '@angular/core';

import { ɵprefersReducedMotion } from '../a11y/reduced-motion';

/**
 * Class CwRipple
 * @class CwRipple
 *
 * @description
 * Draws the press ripple of a button: on `pointerdown`, a pill of the current text color grows from
 * the contact point and fades out in 550 ms (`animate-ripple`).
 *
 * The host must be `relative isolate overflow-hidden` (the Button sheet adds them). The pill is
 * `absolute -z-10`, its diameter is twice the host's longest side, and it removes itself when its
 * animation ends. Nothing is drawn when `cwRippleDisabled` is set, when the host is disabled or
 * busy, or under `prefers-reduced-motion` (artifact README, "Règles des composants").
 */
@Directive({
  selector: '[cwRipple]',
  host: {
    '(pointerdown)': 'start($event)',
  },
})
export class CwRipple {
  // #region Properties
  /**
   * Property cwRippleDisabled
   * @readonly
   *
   * @description
   * Input that disables the press animation when its transformed boolean value is true.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly cwRippleDisabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property host
   * @readonly
   *
   * @description
   * Host element whose dimensions and pointer position determine the ripple geometry.
   *
   * @type {ElementRef<HTMLElement>}
   */
  private readonly host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document used to check the motion preference and create the temporary ripple element.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);
  // #endregion

  // #region Methods
  /**
   * Method start
   * @method start
   *
   * @description
   * Creates a ripple for a primary pointer press when the host is enabled and motion is allowed.
   * The generated element removes itself after its animation ends.
   *
   * @param {PointerEvent} event - Press whose coordinates locate the ripple origin.
   */
  protected start(event: PointerEvent): void {
    const host: HTMLElement = this.host.nativeElement;
    if (
      this.cwRippleDisabled() ||
      event.button !== 0 ||
      host.hasAttribute('disabled') ||
      host.getAttribute('aria-disabled') === 'true' ||
      host.getAttribute('aria-busy') === 'true' ||
      ɵprefersReducedMotion(this.document)
    ) {
      return;
    }

    const rect: DOMRect = host.getBoundingClientRect();
    const diameter: number = Math.max(rect.width, rect.height) * 2;
    const pill: HTMLSpanElement = this.document.createElement('span');
    pill.setAttribute('aria-hidden', 'true');
    pill.className = 'pointer-events-none absolute -z-10 rounded-full bg-current animate-ripple';
    pill.style.width = `${String(diameter)}px`;
    pill.style.height = `${String(diameter)}px`;
    pill.style.left = `${String(event.clientX - rect.left - diameter / 2)}px`;
    pill.style.top = `${String(event.clientY - rect.top - diameter / 2)}px`;
    pill.addEventListener('animationend', () => {
      pill.remove();
    });
    host.setAttribute('data-ripple', '');
    host.appendChild(pill);
  }
  // #endregion
}
