import { DOCUMENT, Directive, ElementRef, booleanAttribute, inject, input } from '@angular/core';

import { ɵprefersReducedMotion } from './reduced-motion';

/**
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
  /** Turns the ripple off, for a host that must stay still. */
  readonly cwRippleDisabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);

  protected start(event: PointerEvent): void {
    const host = this.host.nativeElement;
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

    const rect = host.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height) * 2;
    const pill = this.document.createElement('span');
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
}
