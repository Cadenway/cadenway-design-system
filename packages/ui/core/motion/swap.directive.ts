import { DOCUMENT, Directive, ElementRef, effect, inject, input, untracked } from '@angular/core';

import { ɵprefersReducedMotion } from '../a11y/reduced-motion';

/**
 * Animates a label each time the value it shows changes: the new text slides 6 px up out of a 3 px
 * blur and fades in, in 280 ms on `cubic-bezier(.2, .9, .25, 1)`.
 *
 * Bind the value the label displays: `<span [cwSwap]="selectedLabel()">{{ selectedLabel() }}</span>`.
 * The first meaningful value does not animate: neither the initial one nor the first one that
 * replaces an empty value (a select whose options register after its first render), so a page
 * never loads with labels fading in. Nothing animates under `prefers-reduced-motion` (integration
 * guide, "Mouvement": "Libellé d'un sélecteur qui change").
 */
@Directive({
  selector: '[cwSwap]',
})
export class CwSwap {
  /** The value the label shows; a change replays the entrance. */
  readonly cwSwap = input<unknown>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private previous: unknown = undefined;

  constructor() {
    effect(() => {
      const value = this.cwSwap();
      untracked(() => {
        const previous = this.previous;
        this.previous = value;
        if (!isEmpty(previous) && previous !== value) this.play();
      });
    });
  }

  private play(): void {
    const element = this.host.nativeElement;
    if (ɵprefersReducedMotion(this.document) || typeof element.animate !== 'function') {
      return;
    }
    element.animate(
      [
        { opacity: 0, transform: 'translateY(6px)', filter: 'blur(3px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' },
      ],
      { duration: 280, easing: 'cubic-bezier(.2, .9, .25, 1)' },
    );
  }
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}
