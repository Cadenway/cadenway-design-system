import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import { ɵenterDelay } from '@cadenway/ui/core';

import { OPTION, OPTION_ENTER } from '../combobox.styles';
import { COMBOBOX_HOST, type ComboboxHost } from '../combobox.token';

/**
 * Component CwComboboxOption
 *
 * @description
 * A choice of a `cw-combobox`: an avatar or a glyph and a name, with the check on the right when it
 * is chosen (Combobox sheet of the Design System artifact).
 *
 * `value` is what the combobox takes (or adds, in `multiple`). The search matches the option's
 * text and its `keywords` (an e-mail address, a team), without accents nor case; options that do
 * not match are hidden. `disabled` dims it, writes `disabledLabel` on the right, sets
 * `aria-disabled`, and the arrows skip it. The content of a chosen option is copied into the
 * trigger. Only valid inside `cw-combobox` or `cw-combobox-group`.
 */
@Component({
  selector: 'cw-combobox-option',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCheckBold })],
  host: {
    role: 'option',
    '[id]': 'id',
    '[class]': 'classes()',
    '[attr.hidden]': 'visible() ? null : ""',
    '[style.animation-delay.ms]': 'delay()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-highlighted]': 'highlighted() ? "" : null',
    '(mousedown)': '$event.preventDefault()',
    '(click)': 'onClick()',
    '(pointermove)': 'onPointerMove()',
  },
  templateUrl: './combobox-option.component.html',
})
export class CwComboboxOption<T = unknown> {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Value selected when this option is chosen.
   *
   * @type {InputSignal<T>}
   */
  public readonly value: InputSignal<T> = input.required<T>();

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the option is disabled.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property keywords
   * @readonly
   *
   * @description
   * Additional words matched by search.
   *
   * @type {InputSignal<readonly string[]>}
   */
  public readonly keywords: InputSignal<readonly string[]> = input<readonly string[]>([]);

  /**
   * Property disabledLabel
   * @readonly
   *
   * @description
   * Text shown for a disabled option.
   *
   * @type {InputSignal<string>}
   */
  public readonly disabledLabel: InputSignal<string> = input('Désactivé');

  /**
   * Property host
   * @readonly
   *
   * @description
   * Parent combobox context.
   *
   * @type {ComboboxHost}
   */
  private readonly host: ComboboxHost = inject(COMBOBOX_HOST);

  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier used by aria-activedescendant.
   *
   * @internal
   *
   * @type {string}
   */
  public readonly id: string = inject(_IdGenerator).getId('cw-combobox-option-');

  /**
   * Property element
   * @readonly
   *
   * @description
   * Option element used for scrolling and display.
   *
   * @internal
   *
   * @type {HTMLElement}
   */
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property visible
   * @readonly
   *
   * @description
   * Whether the option matches the current search.
   *
   * @internal
   *
   * @type {Signal<boolean>}
   */
  public readonly visible: Signal<boolean> = computed(() =>
    this.host.matches(this as CwComboboxOption),
  );

  /**
   * Property selected
   * @readonly
   *
   * @description
   * Whether the option is selected.
   *
   * @type {Signal<boolean>}
   */
  protected readonly selected: Signal<boolean> = computed(() => this.host.isSelected(this.value()));

  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Whether the option is highlighted.
   *
   * @type {Signal<boolean>}
   */
  protected readonly highlighted: Signal<boolean> = computed(
    () => this.host.highlighted() === this,
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Option classes and optional entrance animation.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.host.entering() ? `${OPTION} ${OPTION_ENTER}` : OPTION,
  );

  /**
   * Property delay
   * @readonly
   *
   * @description
   * Entrance animation delay in milliseconds.
   *
   * @type {Signal<number>}
   */
  protected readonly delay: Signal<number> = computed(() =>
    ɵenterDelay(this.host.options().indexOf(this as CwComboboxOption)),
  );
  // #endregion

  // #region Methods
  /**
   * Method label
   *
   * @description
   * Returns the visible text used by search.
   *
   * @internal
   *
   * @returns {string} Visible option text with surrounding whitespace removed.
   */
  public label(): string {
    const label: Element = this.element.querySelector('[data-cw-combobox-label]') ?? this.element;
    return label.textContent.trim();
  }

  /**
   * Method onClick
   *
   * @description
   * Chooses the option when enabled.
   */
  protected onClick(): void {
    if (!this.disabled()) this.host.choose(this as CwComboboxOption);
  }

  /**
   * Method onPointerMove
   *
   * @description
   * Highlights the option when enabled.
   */
  protected onPointerMove(): void {
    if (!this.disabled() && !this.highlighted()) this.host.highlight(this as CwComboboxOption);
  }
  // #endregion
}
