import {
  FocusKeyManager,
  type FocusableOption,
  LiveAnnouncer,
  _IdGenerator,
} from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ɵnavigateList } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircleBold } from '@ng-icons/phosphor-icons/bold';

import { CwStepIndicator } from './step-indicator/step-indicator.component';
import { CwStep } from './step/step.component';
import type {
  CwStepState,
  CwStepperLabels,
  CwStepperOrientation,
  CwStepperSize,
} from './stepper.types';

const LABELS: CwStepperLabels = {
  step: 'étape',
  done: 'terminée',
  current: 'en cours',
  todo: 'à venir',
  error: 'en erreur',
  optional: '(optionnelle)',
  position: 'Étape',
  of: 'sur',
};

/* Literal class strings (Stepper sheet and preview of the Design System artifact). */
const LIST: Record<CwStepperOrientation | 'sm', string> = {
  horizontal: 'flex w-full flex-wrap items-center gap-x-1 gap-y-2',
  sm: 'flex w-full flex-wrap items-center gap-x-0.5 gap-y-2',
  vertical: 'grid',
};

const ROW: Record<CwStepperSize, string> = {
  default: 'flex items-center gap-2 rounded-md px-1.5 py-1',
  sm: 'flex items-center gap-1.5 rounded-md px-1.5 py-1',
};

const FOCUS =
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/* A done step is a button: the hover veil, never a border that appears. */
const BUTTON = `transition-colors motion-reduce:transition-none hover:bg-accent ${FOCUS}`;

const LABEL: Record<CwStepState, string> = {
  done: 'text-foreground',
  current: 'font-medium text-foreground',
  todo: 'text-muted-foreground',
  error: 'font-medium text-destructive',
};

const TEXT: Record<CwStepperSize | 'vertical', string> = {
  default: 'text-sm whitespace-nowrap',
  sm: 'text-xs whitespace-nowrap',
  vertical: 'text-sm leading-5',
};

/** What the template draws for one step. */
interface StepView {
  readonly step: CwStep;
  readonly index: number;
  readonly state: CwStepState;
  /** A button: the user can go to the step from here. */
  readonly reachable: boolean;
  /** The connector after the step is crossed (`bg-track`), else `bg-border`. */
  readonly crossed: boolean;
  readonly labelId: string;
  readonly labelClasses: string;
  readonly hiddenState: string;
}

/**
 * The progress through a journey in steps: where one is, what is done, what is left; first
 * installation, JSON import, a long form (Stepper sheet of the Design System artifact). Three to
 * six steps, written as `cw-step` children.
 *
 * `[(selected)]` is the index of the current step. The list (`ol`, named `ariaLabel`) shows each
 * step's indicator and label; a step that can be reached is a real `button`, a step to come is
 * plain text. `horizontal` draws one row with connectors, then « Étape 3 sur 5 — description », the
 * error messages (`role="alert"`) and the current step's panel; `vertical` draws one column with
 * the descriptions and unfolds the current step's panel under its label (`size` stays `default`).
 *
 * `linear` (true): the user moves forward only from a valid step (not `[completed]="false"`, no
 * error, or optional) and never clicks a step to come; going back to an `editable` step is always
 * allowed. `next()`, `previous()` and `reset()` drive it from the panels. A change made here moves
 * the focus to the new panel's first heading (else the panel) and is announced (`LiveAnnouncer`,
 * « Étape 3 sur 5 : Équipe »).
 *
 * Keyboard: Tab goes from one reachable step to the next, then into the panel; ← → (↑ ↓ when
 * vertical) move between reachable steps, Home and End to the first and last; Enter and Space go
 * to the focused step. `data-orientation` on the host, `data-state="done|current|todo|error"` and
 * `data-optional` on each step, `aria-current="step"` on the current one. Texts are French by
 * default, overridable through `labels`.
 */
@Component({
  selector: 'cw-stepper',
  imports: [NgTemplateOutlet, NgIcon, CwStepIndicator],
  providers: [provideIcons({ phosphorWarningCircleBold })],
  host: {
    class: 'block',
    '(keydown)': 'onKeydown($event)',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-size]': 'effectiveSize()',
  },
  templateUrl: './stepper.component.html',
})
export class CwStepper {
  /** One row or one column. */
  readonly orientation = input<CwStepperOrientation>('horizontal');
  /** Size of the indicators and labels; `sm` applies to a horizontal stepper only. */
  readonly size = input<CwStepperSize>('default');
  /** Index of the current step, from 0; `[(selected)]`. */
  readonly selected = model(0);
  /** Forbids moving forward from an invalid step and clicking a step to come. */
  readonly linear = input(true, { transform: booleanAttribute });
  /** Accessible name of the list of steps. */
  readonly ariaLabel = input('Progression');
  /** Hidden states, « (optionnelle) » and « Étape 3 sur 5 », French by default. */
  readonly labels = input<Partial<CwStepperLabels>>({});

  private readonly steps = contentChildren(CwStep);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly injector = inject(Injector);
  private readonly directionality = inject(Directionality, { optional: true });
  private readonly baseId = inject(_IdGenerator).getId('cw-stepper-');

  /* Steps the user moved past: an unset `completed` counts them as done. */
  private readonly passed = signal<ReadonlySet<CwStep>>(new Set());

  private readonly buttons = viewChildren<string, ElementRef<HTMLButtonElement>>('stepButton', {
    read: ElementRef,
  });
  private readonly panel = viewChild<string, ElementRef<HTMLElement>>('panel', {
    read: ElementRef,
  });
  private readonly options = computed<FocusableOption[]>(() =>
    this.buttons().map((button) => ({
      focus: () => {
        button.nativeElement.focus();
      },
    })),
  );
  private readonly keyManager = new FocusKeyManager(this.options, this.injector);

  protected readonly text = computed(() => ({ ...LABELS, ...this.labels() }));
  protected readonly vertical = computed(() => this.orientation() === 'vertical');
  protected readonly effectiveSize = computed<CwStepperSize>(() =>
    this.vertical() ? 'default' : this.size(),
  );
  protected readonly listClasses = computed(() =>
    this.vertical() ? LIST.vertical : this.effectiveSize() === 'sm' ? LIST.sm : LIST.horizontal,
  );
  protected readonly rowClasses = computed(() => ROW[this.effectiveSize()]);
  protected readonly buttonClasses = computed(() => `${ROW[this.effectiveSize()]} ${BUTTON}`);
  protected readonly verticalButtonClasses = `-mx-1.5 flex w-fit items-center gap-1.5 rounded-md px-1.5 ${BUTTON}`;

  /** The current step, kept within the bounds. */
  protected readonly current = computed(() =>
    Math.min(Math.max(0, Math.round(this.selected())), Math.max(0, this.steps().length - 1)),
  );

  protected readonly views = computed<readonly StepView[]>(() => {
    const steps = this.steps();
    const current = this.current();
    const text = this.text();
    const sizeText = this.vertical() ? TEXT.vertical : TEXT[this.effectiveSize()];
    return steps.map((step, index) => {
      const state = this.stateOf(index);
      return {
        step,
        index,
        state,
        reachable: this.canGo(index),
        crossed: state === 'done' || index < current,
        labelId: `${this.baseId}-label-${String(index)}`,
        labelClasses: `${sizeText} ${LABEL[state]}`,
        hiddenState: ` — ${text.step} ${String(index + 1)}, ${text[state]}`,
      };
    });
  });

  protected readonly currentView = computed(() => this.views()[this.current()] ?? null);
  protected readonly errors = computed(() => this.views().filter((view) => view.state === 'error'));

  protected readonly position = computed(
    () =>
      `${this.text().position} ${String(this.current() + 1)} ${this.text().of} ${String(this.steps().length)}`,
  );

  /** Moves to the next step, unless the current one is invalid in a linear stepper. */
  next(): void {
    const current = this.current();
    if (current >= this.steps().length - 1) return;
    if (this.linear() && !this.isValid(current)) return;
    this.move(current + 1);
  }

  /** Moves back to the previous step, if it is `editable`. */
  previous(): void {
    const current = this.current();
    if (current <= 0 || !this.steps()[current - 1].editable()) return;
    this.move(current - 1);
  }

  /** Back to the first step; the steps passed count as not done again. */
  reset(): void {
    this.passed.set(new Set());
    if (this.current() === 0) return;
    this.move(0);
  }

  protected go(index: number): void {
    if (this.canGo(index)) this.move(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const index = this.buttons().findIndex((button) => button.nativeElement === event.target);
    if (index === -1) return;
    this.keyManager.updateActiveItem(index);
    const rtl = this.directionality?.value === 'rtl';
    const orientation = this.vertical() ? 'vertical' : 'horizontal';
    if (ɵnavigateList(this.keyManager, event, orientation, rtl)) event.preventDefault();
  }

  private stateOf(index: number): CwStepState {
    const step = this.steps()[index];
    if (step.error()) return 'error';
    if (index === this.current()) return 'current';
    return this.isCompleted(index) ? 'done' : 'todo';
  }

  private isCompleted(index: number): boolean {
    const step = this.steps()[index];
    return step.completed() ?? this.passed().has(step);
  }

  /* Valid to move on from: optional, or without error and not marked `[completed]="false"`. */
  private isValid(index: number): boolean {
    const step = this.steps()[index];
    return step.optional() || (!step.error() && step.completed() !== false);
  }

  private canGo(index: number): boolean {
    const current = this.current();
    const steps = this.steps();
    if (index === current || index < 0 || index >= steps.length) return false;
    if (index < current) return steps[index].editable();
    if (!this.linear()) return true;
    // Sheet, "À éviter": no step clickable forward unless it was done already.
    if (!this.isValid(current) || !this.isCompleted(index)) return false;
    for (let between = current + 1; between < index; between++) {
      if (!steps[between].optional() && (!this.isCompleted(between) || steps[between].error())) {
        return false;
      }
    }
    return true;
  }

  private move(index: number): void {
    const current = this.current();
    if (index > current) {
      const passed = new Set(this.passed());
      for (const step of this.steps().slice(current, index)) passed.add(step);
      this.passed.set(passed);
    }
    this.selected.set(index);
    const step = this.steps()[index];
    void this.announcer.announce(`${this.position()} : ${step.label()}`, 'polite');
    // Sheet, "Accessibilité": the focus goes to the title of the new step's content.
    afterNextRender(
      () => {
        const panel = this.panel()?.nativeElement;
        if (!panel) return;
        const heading = panel.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6');
        if (heading) {
          // A heading is not focusable: `-1` lets the script focus it without a tab stop.
          if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
          heading.focus();
        } else {
          panel.focus();
        }
      },
      { injector: this.injector },
    );
  }
}
