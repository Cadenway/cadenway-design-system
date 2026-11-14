import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { type FocusableOption, _IdGenerator } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';

import { RADIO_GROUP_ITEM } from '../radio-group-item.token';
import { CwRadioGroup } from '../radio-group.component';
import type { CwRadioGroupItemVariant } from '../radio-group.types';

/* Literal class strings (Radio Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. The card classes are in the template. */
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
 * `foreground/40` border once selected. A disabled option is dimmed and skipped by the arrows.
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
  protected readonly radioClasses: Signal<string> = computed(() => RADIOS[this.variant()]);

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
