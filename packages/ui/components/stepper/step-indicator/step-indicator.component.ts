import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold, phosphorExclamationMarkBold } from '@ng-icons/phosphor-icons/bold';

import type { CwStepState, CwStepperSize } from '../stepper.types';

/* Literal class strings (Stepper sheet and preview of the Design System artifact): one box of the
   same visible size for every state, never a filled disc. */
const SIZES: Record<CwStepperSize, string> = {
  default: 'size-5 text-[11px]',
  sm: 'size-4 text-[10px]',
};

const STATES: Record<CwStepState, string> = {
  done: 'border-[1.5px] border-line-control text-jade',
  current: 'border-[1.5px] border-foreground font-semibold text-foreground',
  todo: 'font-medium text-muted-foreground',
  error: 'border-[1.5px] border-destructive text-destructive',
};

/**
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
  /** State drawn. */
  readonly state = input.required<CwStepState>();
  /** Position of the step, from 1. */
  readonly number = input.required<number>();
  /** 20 px or 16 px. */
  readonly size = input<CwStepperSize>('default');

  protected readonly classes = computed(
    () =>
      `relative flex shrink-0 items-center justify-center rounded-full leading-none tabular-nums transition-colors motion-reduce:transition-none ${SIZES[this.size()]} ${STATES[this.state()]}`,
  );
  protected readonly glyphSize = computed(() => (this.size() === 'sm' ? '0.625rem' : '0.75rem'));
}
