import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';

import { CwPasswordStrength } from '../password-strength.component';
import { strengthTone } from '../password-strength.constants';
import type { CwPasswordStrengthTone } from '../password-strength.types';

/**
 * Constant BASE
 *
 * @description
 * Mockup `Inscription.dc.html`: the level sits on the right of the field label, 16 px high, and
 * rises into view (300 ms `ease-snap`) once something is typed.
 *
 * @type {string}
 */
const BASE: string =
  'block h-4 shrink-0 text-right text-xs leading-4 font-medium whitespace-nowrap transition-[color,opacity,translate] duration-300 ease-snap motion-reduce:transition-none';

/**
 * Constant TONES
 *
 * @description
 * Text color of the level for each tone: weak in the destructive color, fair muted, good jade.
 *
 * @type {Readonly<Record<CwPasswordStrengthTone, string>>}
 */
const TONES: Readonly<Record<CwPasswordStrengthTone, string>> = {
  weak: 'text-destructive',
  fair: 'text-muted-foreground',
  good: 'text-jade-text',
};

/**
 * Component CwPasswordStrengthLevel
 *
 * @description
 * The level of a `cw-password-strength` (« Trop court », « Faible », « Moyen », « Bon »,
 * « Excellent »), written where the consumer places it, next to the field label in the mockup
 * (`Inscription.dc.html`). It is a polite live region, so a screen reader hears the level change
 * while the password is typed; it is hidden while the field is empty.
 */
@Component({
  selector: 'cw-password-strength-level',
  host: {
    'aria-live': 'polite',
    '[attr.aria-hidden]': 'for().empty() ? "true" : null',
    '[class]': 'classes()',
  },
  templateUrl: './password-strength-level.component.html',
})
export class CwPasswordStrengthLevel {
  // #region Properties
  /**
   * Property for
   *
   * @description
   * The meter whose level is written (`#strength` exported as `cwPasswordStrength`).
   *
   * @type {InputSignal<CwPasswordStrength>}
   * @readonly
   */
  public readonly for: InputSignal<CwPasswordStrength> = input.required<CwPasswordStrength>();

  /**
   * Property classes
   *
   * @description
   * Tone and visibility of the level.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly classes: Signal<string> = computed(() => {
    const strength: CwPasswordStrength = this.for();
    const tone: string = TONES[strengthTone(strength.score(), strength.total())];
    const shown: string = strength.empty()
      ? 'translate-y-1 opacity-0'
      : 'translate-y-0 opacity-100';
    return `${BASE} ${tone} ${shown}`;
  });
  // #endregion
}
