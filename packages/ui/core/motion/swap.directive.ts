import {
  DOCUMENT,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  untracked,
  type InputSignal,
} from '@angular/core';

import { ɵprefersReducedMotion } from '../a11y/reduced-motion';

/**
 * Class CwSwap
 * @class CwSwap
 *
 * @description
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
  // #region Properties
  /**
   * Property cwSwap
   * @readonly
   *
   * @description
   * Input carrying the displayed value; a change after a meaningful value replays the entrance.
   *
   * @type {InputSignal<unknown>}
   */
  public readonly cwSwap: InputSignal<unknown> = input<unknown>();

  /**
   * Property host
   * @readonly
   *
   * @description
   * Element whose label is animated after the displayed value changes.
   *
   * @type {ElementRef<HTMLElement>}
   */
  private readonly host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document used to read the user's motion preference.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property previous
   *
   * @description
   * Last observed value, or undefined before the first observation.
   *
   * @type {unknown}
   */
  private previous: unknown = undefined;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Observes input changes and plays the animation only after a meaningful previous value.
   */
  public constructor() {
    effect(() => {
      const value: unknown = this.cwSwap();
      untracked(() => {
        const previous: unknown = this.previous;
        this.previous = value;
        if (!isEmpty(previous) && previous !== value) this.play();
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method play
   * @method play
   *
   * @description
   * Starts the label entrance when motion is allowed and the host supports Web Animations.
   */
  private play(): void {
    const element: HTMLElement = this.host.nativeElement;
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
  // #endregion
}

/**
 * Function isEmpty
 *
 * @description
 * Identifies values that should not trigger a label animation on their first replacement.
 *
 * @param {unknown} value - Previously displayed value to inspect.
 *
 * @returns {boolean} Whether the value is undefined, null, or an empty string.
 */
function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}
