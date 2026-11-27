import {
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { type FocusableOption, _IdGenerator } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';

import { RADIO_GROUP_ITEM } from '../radio-group-item.token';
import { CwRadioGroup } from '../radio-group.component';
import type { CwRadioGroupItemVariant } from '../radio-group.types';

/* Literal class strings (Radio Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. */
/**
 * Constant RADIO
 *
 * @description
 * Base radio button classes and focus states.
 *
 * @type {string}
 */
const RADIO: string =
  'grid aspect-square size-4 shrink-0 place-content-center rounded-full border border-line-control bg-transparent transition-[color,background-color,box-shadow] data-[state=unchecked]:hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/field:disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-destructive/15 motion-reduce:transition-none';

/**
 * Constant RADIOS
 *
 * @description
 * Radio classes for each item variant.
 *
 * @type {Record<CwRadioGroupItemVariant, string>}
 */
const RADIOS: Record<CwRadioGroupItemVariant, string> = {
  default: RADIO,
  // In a card the radio sits on the first 20 px line of the title.
  card: `${RADIO} mt-0.5`,
};

/**
 * Constant CARD
 *
 * @description
 * Choice card classes: `bg-accent` on hover, `bg-selected` with a `foreground/40` border once
 * selected.
 *
 * @type {string}
 */
const CARD: string =
  'flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent has-[[data-state=checked]]:border-foreground/40 has-[[data-state=checked]]:bg-selected has-disabled:cursor-not-allowed motion-reduce:transition-none';

/* Without its dot the radio is visually hidden but stays the focused control, so the card draws
   the cues the radio would have drawn: the focus ring, the dimming and the end of the hover veil
   when disabled, the destructive border when invalid. */
/**
 * Constant CARD_WITHOUT_INDICATOR
 *
 * @description
 * Extra card classes when the radio dot is hidden: the focus ring, the disabled and the invalid
 * cues move to the card.
 *
 * @type {string}
 */
const CARD_WITHOUT_INDICATOR: string =
  'outline-hidden has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background ' +
  'has-disabled:opacity-50 has-disabled:hover:bg-transparent has-[[aria-invalid=true]]:border-destructive';

/**
 * Constant HOSTS
 *
 * @description
 * Host layout classes for each item variant.
 *
 * @type {Record<CwRadioGroupItemVariant, string>}
 */
const HOSTS: Record<CwRadioGroupItemVariant, string> = {
  default: 'inline-flex',
  card: 'flex',
};

/* An option as the CDK focus key manager sees it: its `disabled` is a plain boolean, where the
   option's own `disabled` is an input signal. */
/**
 * Class RadioOption
 * @class RadioOption
 *
 * @description
 * Adapts an item to the CDK focus manager.
 */
class RadioOption implements FocusableOption {
  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Keeps the item whose focus and disabled state are delegated.
   *
   * @param {CwRadioGroupItem} item - Item represented by this focus option.
   */
  public constructor(private readonly item: CwRadioGroupItem) {}
  // #endregion

  // #region Properties
  /**
   * Property disabled
   *
   * @description
   * Whether the associated item is disabled.
   *
   * @returns {boolean} Whether the item is disabled.
   */
  public get disabled(): boolean {
    return this.item.isDisabled();
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the associated item.
   */
  public focus(): void {
    this.item.focus();
  }
  // #endregion
}

/**
 * Class CwRadioGroupItem
 * @class CwRadioGroupItem
 *
 * @description
 * One option of a `cw-radio-group`: a 16 px `button role="radio"` with an 8 px ink dot when
 * selected.
 *
 * `default`: the bare radio; name it with a `<label for>` (its `id`), the description beside it.
 * `card`: a choice card, the whole card the radio's label: the radio and the projected content
 * (title, description) in a bordered card, `bg-accent` on hover, `bg-selected` with a
 * `foreground/40` border once selected. `[indicator]="false"` hides the dot of a card, which then
 * shows its selection by its fill and border alone and draws the focus ring, the disabled dimming
 * and the invalid border itself; the radio stays the focused, announced control. A disabled option
 * is dimmed and skipped by the arrows. Options may come from a `@for`: until Angular has set an
 * option's `value`, the group leaves it out of its Tab stop (`hasValue`).
 */
@Component({
  selector: 'cw-radio-group-item',
  imports: [NgTemplateOutlet],
  providers: [{ provide: RADIO_GROUP_ITEM, useExisting: CwRadioGroupItem }],
  host: {
    '[class]': 'hostClasses()',
    '[attr.id]': 'null',
    '[attr.data-variant]': 'variant()',
  },
  templateUrl: './radio-group-item.component.html',
})
export class CwRadioGroupItem {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Value the group takes when this option is selected.
   *
   * @type {InputSignal<string>}
   */
  public readonly value: InputSignal<string> = input.required<string>();

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Disables this option; the arrows skip it.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property id
   * @readonly
   *
   * @description
   * Id of the radio, for `<label for>`; generated when not given.
   *
   * @type {InputSignal<string>}
   */
  public readonly id: InputSignal<string> = input(inject(_IdGenerator).getId('cw-radio-'));

  /**
   * Property variant
   * @readonly
   *
   * @description
   * A bare radio, or a choice card wrapping the radio and the projected texts.
   *
   * @type {InputSignal<CwRadioGroupItemVariant>}
   */
  public readonly variant: InputSignal<CwRadioGroupItemVariant> =
    input<CwRadioGroupItemVariant>('default');

  /**
   * Property indicator
   * @readonly
   *
   * @description
   * Whether a `card` shows its radio dot; `true` by default. Ignored by the bare `default` radio,
   * which is nothing but its dot.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly indicator: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property group
   * @readonly
   *
   * @description
   * Containing radio group.
   *
   * @type {CwRadioGroup}
   */
  protected readonly group: CwRadioGroup = inject(CwRadioGroup);

  /**
   * Property control
   * @readonly
   *
   * @description
   * Native radio button, when rendered.
   *
   * @type {Signal<ElementRef<HTMLButtonElement> | undefined>}
   */
  private readonly control: Signal<ElementRef<HTMLButtonElement> | undefined> =
    viewChild<ElementRef<HTMLButtonElement>>('control');

  /**
   * Property isDisabled
   * @readonly
   *
   * @description
   * Whether this option or its group is disabled.
   *
   * @type {Signal<boolean>}
   */
  public readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.group.isDisabled(),
  );

  /**
   * Property checked
   * @readonly
   *
   * @description
   * Whether this option matches the group value.
   *
   * @type {Signal<boolean>}
   */
  protected readonly checked: Signal<boolean> = computed(() => this.group.value() === this.value());

  /**
   * Property hostClasses
   * @readonly
   *
   * @description
   * Host classes for the selected variant.
   *
   * @type {Signal<string>}
   */
  protected readonly hostClasses: Signal<string> = computed(() => HOSTS[this.variant()]);

  /**
   * Property radioClasses
   * @readonly
   *
   * @description
   * Radio button classes for the selected variant.
   *
   * @type {Signal<string>}
   */
  protected readonly radioClasses: Signal<string> = computed(() =>
    this.variant() === 'card' && !this.indicator() ? 'sr-only' : RADIOS[this.variant()],
  );

  /**
   * Property cardClasses
   * @readonly
   *
   * @description
   * Card classes, with the focus ring on the card when the dot is hidden.
   *
   * @type {Signal<string>}
   */
  protected readonly cardClasses: Signal<string> = computed(() =>
    this.indicator() ? CARD : `${CARD} ${CARD_WITHOUT_INDICATOR}`,
  );

  /**
   * Property option
   * @readonly
   *
   * @description
   * Focus-manager adapter for this option.
   *
   * @type {FocusableOption}
   */
  public readonly option: FocusableOption = new RadioOption(this);

  /**
   * Property initialized
   * @readonly
   *
   * @description
   * Set when Angular first checks the option, that is once it has set the required `value` input.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly initialized: WritableSignal<boolean> = signal(false);

  /**
   * Property hasValue
   * @readonly
   *
   * @description
   * Whether `value` can be read. The group reads every option's value to place its Tab stop, from
   * the template of each option; in a `@for`, each option is its own view and the first one is
   * checked before the next ones have their inputs, so reading their required `value` would throw
   * NG0950. The group leaves out the options for which this is still false, and places its Tab stop
   * again once they turn true.
   *
   * @type {Signal<boolean>}
   */
  public readonly hasValue: Signal<boolean> = this.initialized.asReadonly();
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Marks the option's inputs as set. An effect created by a component runs when Angular checks that
   * component, after it has set the component's inputs; no lifecycle hook is needed, as in
   * `cw-toggle-group`.
   */
  public constructor() {
    effect(() => {
      this.initialized.set(true);
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the radio button.
   *
   * @param {FocusOptions} [options] - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.control()?.nativeElement.focus(options);
  }

  /**
   * Method hasFocus
   * @method hasFocus
   *
   * @description
   * Checks whether the radio button currently has focus.
   *
   * @returns {boolean} Whether the radio button is the active element.
   */
  public hasFocus(): boolean {
    const control: HTMLButtonElement | undefined = this.control()?.nativeElement;
    return !!control && control.ownerDocument.activeElement === control;
  }
  // #endregion
}
