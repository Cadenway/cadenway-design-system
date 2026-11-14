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
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type Signal,
  type WritableSignal,
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

/**
 * Constant LABELS
 *
 * @description
 * Default French stepper labels and state words.
 *
 * @type {CwStepperLabels}
 */
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
/**
 * Constant LIST
 *
 * @description
 * List layout classes for each orientation and compact size.
 *
 * @type {Record<CwStepperOrientation | 'sm', string>}
 */
const LIST: Record<CwStepperOrientation | 'sm', string> = {
  horizontal: 'flex w-full flex-wrap items-center gap-x-1 gap-y-2',
  sm: 'flex w-full flex-wrap items-center gap-x-0.5 gap-y-2',
  vertical: 'grid',
};

/**
 * Constant ROW
 *
 * @description
 * Step row classes for each size.
 *
 * @type {Record<CwStepperSize, string>}
 */
const ROW: Record<CwStepperSize, string> = {
  default: 'flex items-center gap-2 rounded-md px-1.5 py-1',
  sm: 'flex items-center gap-1.5 rounded-md px-1.5 py-1',
};

/**
 * Constant FOCUS
 *
 * @description
 * Visible keyboard focus ring classes.
 *
 * @type {string}
 */
const FOCUS: string =
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/* A done step is a button: the hover veil, never a border that appears. */
/**
 * Constant BUTTON
 *
 * @description
 * Interaction classes for a reachable step.
 *
 * @type {string}
 */
const BUTTON: string = `transition-colors motion-reduce:transition-none hover:bg-accent ${FOCUS}`;

/**
 * Constant LABEL
 *
 * @description
 * Text classes for each step state.
 *
 * @type {Record<CwStepState, string>}
 */
const LABEL: Record<CwStepState, string> = {
  done: 'text-foreground',
  current: 'font-medium text-foreground',
  todo: 'text-muted-foreground',
  error: 'font-medium text-destructive',
};

/**
 * Constant TEXT
 *
 * @description
 * Text size classes for each layout.
 *
 * @type {Record<CwStepperSize | 'vertical', string>}
 */
const TEXT: Record<CwStepperSize | 'vertical', string> = {
  default: 'text-sm whitespace-nowrap',
  sm: 'text-xs whitespace-nowrap',
  vertical: 'text-sm leading-5',
};

/**
 * Interface StepView
 *
 * @description
 * Display state and accessible text for a step.
 */
interface StepView {
  // #region Properties
  /**
   * Property step
   * @readonly
   *
   * @description
   * Step represented by the view.
   *
   * @type {CwStep}
   */
  readonly step: CwStep;

  /**
   * Property index
   * @readonly
   *
   * @description
   * Zero-based step position.
   *
   * @type {number}
   */
  readonly index: number;

  /**
   * Property state
   * @readonly
   *
   * @description
   * Current visual state.
   *
   * @type {CwStepState}
   */
  readonly state: CwStepState;

  /**
   * Property reachable
   * @readonly
   *
   * @description
   * Whether the user can navigate to this step.
   *
   * @type {boolean}
   */
  readonly reachable: boolean;

  /**
   * Property crossed
   * @readonly
   *
   * @description
   * Whether the connector after this step is crossed.
   *
   * @type {boolean}
   */
  readonly crossed: boolean;

  /**
   * Property labelId
   * @readonly
   *
   * @description
   * Identifier of the step label.
   *
   * @type {string}
   */
  readonly labelId: string;

  /**
   * Property labelClasses
   * @readonly
   *
   * @description
   * Visual classes for the step label.
   *
   * @type {string}
   */
  readonly labelClasses: string;

  /**
   * Property hiddenState
   * @readonly
   *
   * @description
   * Accessible state text following the label.
   *
   * @type {string}
   */
  readonly hiddenState: string;
  // #endregion
}

/**
 * Class CwStepper
 * @class CwStepper
 *
 * @description
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
  // #region Properties
  /**
   * Property orientation
   * @readonly
   *
   * @description
   * One row or one column.
   *
   * @type {InputSignal<CwStepperOrientation>}
   */
  public readonly orientation: InputSignal<CwStepperOrientation> =
    input<CwStepperOrientation>('horizontal');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Size of the indicators and labels; `sm` applies to a horizontal stepper only.
   *
   * @type {InputSignal<CwStepperSize>}
   */
  public readonly size: InputSignal<CwStepperSize> = input<CwStepperSize>('default');

  /**
   * Property selected
   * @readonly
   *
   * @description
   * Index of the current step, from 0; `[(selected)]`.
   *
   * @type {ModelSignal<number>}
   */
  public readonly selected: ModelSignal<number> = model(0);

  /**
   * Property linear
   * @readonly
   *
   * @description
   * Forbids moving forward from an invalid step and clicking a step to come.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly linear: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the list of steps.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('Progression');

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Hidden states, « (optionnelle) » and « Étape 3 sur 5 », French by default.
   *
   * @type {InputSignal<Partial<CwStepperLabels>>}
   */
  public readonly labels: InputSignal<Partial<CwStepperLabels>> = input<Partial<CwStepperLabels>>(
    {},
  );

  /**
   * Property steps
   * @readonly
   *
   * @description
   * Projected steps in content order.
   *
   * @type {Signal<readonly CwStep[]>}
   */
  private readonly steps: Signal<readonly CwStep[]> = contentChildren(CwStep);

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Announcer for step changes.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to schedule focus after rendering.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property directionality
   * @readonly
   *
   * @description
   * Optional writing direction for arrow navigation.
   *
   * @type {Directionality | null}
   */
  private readonly directionality: Directionality | null = inject(Directionality, {
    optional: true,
  });

  /**
   * Property baseId
   * @readonly
   *
   * @description
   * Unique prefix for step label identifiers.
   *
   * @type {string}
   */
  private readonly baseId: string = inject(_IdGenerator).getId('cw-stepper-');

  /**
   * Property passed
   * @readonly
   *
   * @description
   * Steps already passed, used when completion is not explicit.
   *
   * @type {WritableSignal<ReadonlySet<CwStep>>}
   */
  private readonly passed: WritableSignal<ReadonlySet<CwStep>> = signal<ReadonlySet<CwStep>>(
    new Set(),
  );

  /**
   * Property buttons
   * @readonly
   *
   * @description
   * Reachable step buttons in the view.
   *
   * @type {Signal<readonly ElementRef<HTMLButtonElement>[]>}
   */
  private readonly buttons: Signal<readonly ElementRef<HTMLButtonElement>[]> = viewChildren<
    string,
    ElementRef<HTMLButtonElement>
  >('stepButton', {
    read: ElementRef,
  });

  /**
   * Property panel
   * @readonly
   *
   * @description
   * Current content panel, when rendered.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   */
  private readonly panel: Signal<ElementRef<HTMLElement> | undefined> = viewChild<
    string,
    ElementRef<HTMLElement>
  >('panel', {
    read: ElementRef,
  });

  /**
   * Property options
   * @readonly
   *
   * @description
   * Focusable options for the reachable step buttons.
   *
   * @type {Signal<FocusableOption[]>}
   */
  private readonly options: Signal<FocusableOption[]> = computed<FocusableOption[]>(() =>
    this.buttons().map((button) => ({
      focus: () => {
        button.nativeElement.focus();
      },
    })),
  );

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard manager for reachable step buttons.
   *
   * @type {FocusKeyManager<FocusableOption>}
   */
  private readonly keyManager: FocusKeyManager<FocusableOption> =
    new FocusKeyManager<FocusableOption>(this.options, this.injector);

  /**
   * Property text
   * @readonly
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<CwStepperLabels>}
   */
  protected readonly text: Signal<CwStepperLabels> = computed(() => ({
    ...LABELS,
    ...this.labels(),
  }));

  /**
   * Property vertical
   * @readonly
   *
   * @description
   * Whether the stepper uses a vertical layout.
   *
   * @type {Signal<boolean>}
   */
  protected readonly vertical: Signal<boolean> = computed(() => this.orientation() === 'vertical');

  /**
   * Property effectiveSize
   * @readonly
   *
   * @description
   * Size adjusted for the current orientation.
   *
   * @type {Signal<CwStepperSize>}
   */
  protected readonly effectiveSize: Signal<CwStepperSize> = computed<CwStepperSize>(() =>
    this.vertical() ? 'default' : this.size(),
  );

  /**
   * Property listClasses
   * @readonly
   *
   * @description
   * List layout classes for the current orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly listClasses: Signal<string> = computed(() =>
    this.vertical() ? LIST.vertical : this.effectiveSize() === 'sm' ? LIST.sm : LIST.horizontal,
  );

  /**
   * Property rowClasses
   * @readonly
   *
   * @description
   * Step row classes for the effective size.
   *
   * @type {Signal<string>}
   */
  protected readonly rowClasses: Signal<string> = computed(() => ROW[this.effectiveSize()]);

  /**
   * Property buttonClasses
   * @readonly
   *
   * @description
   * Reachable step button classes for the effective size.
   *
   * @type {Signal<string>}
   */
  protected readonly buttonClasses: Signal<string> = computed(
    () => `${ROW[this.effectiveSize()]} ${BUTTON}`,
  );

  /**
   * Property verticalButtonClasses
   * @readonly
   *
   * @description
   * Reachable vertical step button classes.
   *
   * @type {string}
   */
  protected readonly verticalButtonClasses: string = `-mx-1.5 flex w-fit items-center gap-1.5 rounded-md px-1.5 ${BUTTON}`;

  /**
   * Property current
   * @readonly
   *
   * @description
   * Selected index clamped to the step count.
   *
   * @type {Signal<number>}
   */
  protected readonly current: Signal<number> = computed(() =>
    Math.min(Math.max(0, Math.round(this.selected())), Math.max(0, this.steps().length - 1)),
  );

  /**
   * Property views
   * @readonly
   *
   * @description
   * Display state and accessible text for each step.
   *
   * @type {Signal<readonly StepView[]>}
   */
  protected readonly views: Signal<readonly StepView[]> = computed<readonly StepView[]>(() => {
    const steps: readonly CwStep[] = this.steps();
    const current: number = this.current();
    const text: CwStepperLabels = this.text();
    const sizeText: string = this.vertical() ? TEXT.vertical : TEXT[this.effectiveSize()];
    return steps.map((step, index) => {
      const state: CwStepState = this.stateOf(index);
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

  /**
   * Property currentView
   * @readonly
   *
   * @description
   * Display state for the current step, when present.
   *
   * @type {Signal<StepView | null>}
   */
  protected readonly currentView: Signal<StepView | null> = computed(
    () => this.views()[this.current()] ?? null,
  );

  /**
   * Property errors
   * @readonly
   *
   * @description
   * Views of steps currently reporting an error.
   *
   * @type {Signal<StepView[]>}
   */
  protected readonly errors: Signal<StepView[]> = computed(() =>
    this.views().filter((view) => view.state === 'error'),
  );

  /**
   * Property position
   * @readonly
   *
   * @description
   * Formatted position of the current step.
   *
   * @type {Signal<string>}
   */
  protected readonly position: Signal<string> = computed(
    () =>
      `${this.text().position} ${String(this.current() + 1)} ${this.text().of} ${String(this.steps().length)}`,
  );
  // #endregion

  // #region Methods
  /**
   * Method next
   * @method next
   *
   * @description
   * Moves forward unless the current linear step is invalid.
   */
  public next(): void {
    const current: number = this.current();
    if (current >= this.steps().length - 1) return;
    if (this.linear() && !this.isValid(current)) return;
    this.move(current + 1);
  }

  /**
   * Method previous
   * @method previous
   *
   * @description
   * Moves back when the previous step is editable.
   */
  public previous(): void {
    const current: number = this.current();
    if (current <= 0 || !this.steps()[current - 1].editable()) return;
    this.move(current - 1);
  }

  /**
   * Method reset
   * @method reset
   *
   * @description
   * Returns to the first step and clears passed steps.
   */
  public reset(): void {
    this.passed.set(new Set());
    if (this.current() === 0) return;
    this.move(0);
  }

  /**
   * Method go
   * @method go
   *
   * @description
   * Moves to a reachable step.
   *
   * @param {number} index - Index of the requested step.
   */
  protected go(index: number): void {
    if (this.canGo(index)) this.move(index);
  }

  /**
   * Method onKeydown
   * @method onKeydown
   *
   * @description
   * Moves focus between reachable step buttons using the keyboard.
   *
   * @param {KeyboardEvent} event - Keyboard event from a step button.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const index: number = this.buttons().findIndex(
      (button) => button.nativeElement === event.target,
    );
    if (index === -1) return;
    this.keyManager.updateActiveItem(index);
    const rtl: boolean = this.directionality?.value === 'rtl';
    const orientation: 'vertical' | 'horizontal' = this.vertical() ? 'vertical' : 'horizontal';
    if (ɵnavigateList(this.keyManager, event, orientation, rtl)) event.preventDefault();
  }

  /**
   * Method stateOf
   * @method stateOf
   *
   * @description
   * Returns the display state of a step.
   *
   * @param {number} index - Index of the step to inspect.
   *
   * @returns {CwStepState} Display state of the step.
   */
  private stateOf(index: number): CwStepState {
    const step: CwStep = this.steps()[index];
    if (step.error()) return 'error';
    if (index === this.current()) return 'current';
    return this.isCompleted(index) ? 'done' : 'todo';
  }

  /**
   * Method isCompleted
   * @method isCompleted
   *
   * @description
   * Determines whether a step is completed or has been passed.
   *
   * @param {number} index - Index of the step to inspect.
   *
   * @returns {boolean} Whether the step is complete or has been passed.
   */
  private isCompleted(index: number): boolean {
    const step: CwStep = this.steps()[index];
    return step.completed() ?? this.passed().has(step);
  }

  /**
   * Method isValid
   * @method isValid
   *
   * @description
   * Permits forward navigation for an optional step or one without an error or explicit incomplete state.
   *
   * @param {number} index - Index of the step to inspect.
   *
   * @returns {boolean} Whether forward navigation is permitted for the step.
   */
  private isValid(index: number): boolean {
    const step: CwStep = this.steps()[index];
    return step.optional() || (!step.error() && step.completed() !== false);
  }

  /**
   * Method canGo
   * @method canGo
   *
   * @description
   * Checks whether navigation to a step is permitted.
   *
   * @param {number} index - Index of the requested step.
   *
   * @returns {boolean} Whether navigation to the step is allowed.
   */
  private canGo(index: number): boolean {
    const current: number = this.current();
    const steps: readonly CwStep[] = this.steps();
    if (index === current || index < 0 || index >= steps.length) return false;
    if (index < current) return steps[index].editable();
    if (!this.linear()) return true;
    // Sheet, "À éviter": no step clickable forward unless it was done already.
    if (!this.isValid(current) || !this.isCompleted(index)) return false;
    for (let between: number = current + 1; between < index; between++) {
      if (!steps[between].optional() && (!this.isCompleted(between) || steps[between].error())) {
        return false;
      }
    }
    return true;
  }

  /**
   * Method move
   * @method move
   *
   * @description
   * Changes the selected step, announces it and focuses its panel.
   *
   * @param {number} index - Index of the step to select.
   */
  private move(index: number): void {
    const current: number = this.current();
    if (index > current) {
      const passed: Set<CwStep> = new Set<CwStep>(this.passed());
      for (const step of this.steps().slice(current, index)) passed.add(step);
      this.passed.set(passed);
    }
    this.selected.set(index);
    const step: CwStep = this.steps()[index];
    void this.announcer.announce(`${this.position()} : ${step.label()}`, 'polite');
    // Sheet, "Accessibilité": the focus goes to the title of the new step's content.
    afterNextRender(
      () => {
        const panel: HTMLElement | undefined = this.panel()?.nativeElement;
        if (!panel) return;
        const heading: HTMLElement | null =
          panel.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6');
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
  // #endregion
}
