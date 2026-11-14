import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold, phosphorExclamationMarkBold } from '@ng-icons/phosphor-icons/bold';

import type { CwStepState, CwStepperSize } from '../stepper.types';

/* Literal class strings (Stepper sheet and preview of the Design System artifact): one box of the
   same visible size for every state, never a filled disc. */
/**
 * Constant SIZES
 *
 * @description
 * Indicator dimensions and text size for each stepper size.
 *
 * @type {Record<CwStepperSize, string>}
 */
const SIZES: Record<CwStepperSize, string> = {
  default: 'size-5 text-[11px]',
  sm: 'size-4 text-[10px]',
};

/**
 * Constant STATES
 *
 * @description
 * Indicator colors and border classes for each state.
 *
 * @type {Record<CwStepState, string>}
 */
const STATES: Record<CwStepState, string> = {
  done: 'border-[1.5px] border-line-control text-jade',
  current: 'border-[1.5px] border-foreground font-semibold text-foreground',
  todo: 'font-medium text-muted-foreground',
  error: 'border-[1.5px] border-destructive text-destructive',
};

/**
 * Class CwStepIndicator
 * @class CwStepIndicator
 *
 * @description
 * The round indicator of a step: a check (done), the number in an ink ring (current), the number
 * in a dashed ring like the « À faire » status (to do), an exclamation mark (error). Decorative:
 * the stepper says the state in hidden text. Not exported from the entry point.
 */
@Component({
  selector: 'cw-step-indicator',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCheckBold, phosphorExclamationMarkBold })],
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
  },
  templateUrl: './step-indicator.component.html',
})
export class CwStepIndicator {
  // #region Properties
  /**
   * Property state
   * @readonly
   *
   * @description
   * State drawn.
   *
   * @type {InputSignal<CwStepState>}
   */
  public readonly state: InputSignal<CwStepState> = input.required<CwStepState>();

  /**
   * Property number
   * @readonly
   *
   * @description
   * Position of the step, from 1.
   *
   * @type {InputSignal<number>}
   */
  public readonly number: InputSignal<number> = input.required<number>();

  /**
   * Property size
   * @readonly
   *
   * @description
   * 20 px or 16 px.
   *
   * @type {InputSignal<CwStepperSize>}
   */
  public readonly size: InputSignal<CwStepperSize> = input<CwStepperSize>('default');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Indicator classes for the current size and state.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `relative flex shrink-0 items-center justify-center rounded-full leading-none tabular-nums transition-colors motion-reduce:transition-none ${SIZES[this.size()]} ${STATES[this.state()]}`,
  );

  /**
   * Property glyphSize
   * @readonly
   *
   * @description
   * Icon size for the current indicator size.
   *
   * @type {Signal<string>}
   */
  protected readonly glyphSize: Signal<string> = computed(() =>
    this.size() === 'sm' ? '0.625rem' : '0.75rem',
  );
  // #endregion
}
