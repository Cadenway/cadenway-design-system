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

import { SELECT_HOST, type SelectHost } from '../select.token';
import { OPTION, OPTION_ENTER } from '../select.styles';

/**
 * Component CwSelectOption
 *
 * @description
 * A choice of a `cw-select`: a glyph and a word (« En cours »), with the check on the right when it
 * is the select's value (Select sheet of the Design System artifact).
 *
 * `value` is what the select takes when the option is chosen; its content (glyph and text) is
 * copied into the trigger once chosen, so keep it short. `disabled` dims it, sets
 * `aria-disabled` and the arrows skip it. Glyphs are decorative (`aria-hidden`): the word carries
 * the meaning. Only valid inside `cw-select` or `cw-select-group`.
 */
@Component({
  selector: 'cw-select-option',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCheckBold })],
  host: {
    role: 'option',
    '[id]': 'id',
    class: `${OPTION} ${OPTION_ENTER}`,
    '[style.animation-delay.ms]': 'delay()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-highlighted]': 'highlighted() ? "" : null',
    '(mousedown)': '$event.preventDefault()',
    '(click)': 'onClick()',
    '(pointermove)': 'onPointerMove()',
  },
  templateUrl: './select-option.component.html',
})
export class CwSelectOption<T = unknown> {
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
   * Property host
   * @readonly
   *
   * @description
   * Parent select context.
   *
   * @type {SelectHost}
   */
  private readonly host: SelectHost = inject(SELECT_HOST);

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
  public readonly id: string = inject(_IdGenerator).getId('cw-select-option-');

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
   * Property delay
   * @readonly
   *
   * @description
   * Entrance animation delay in milliseconds.
   *
   * @type {Signal<number>}
   */
  protected readonly delay: Signal<number> = computed(() =>
    ɵenterDelay(this.host.options().indexOf(this as CwSelectOption)),
  );
  // #endregion

  // #region Methods
  /**
   * Method label
   *
   * @description
   * Returns the text used by typeahead and the trigger.
   *
   * @internal
   *
   * @returns {string} Visible option text with surrounding whitespace removed.
   */
  public label(): string {
    return this.element.textContent.trim();
  }

  /**
   * Method onClick
   *
   * @description
   * Chooses the option when enabled.
   */
  protected onClick(): void {
    if (!this.disabled()) this.host.choose(this as CwSelectOption);
  }

  /**
   * Method onPointerMove
   *
   * @description
   * Highlights the option when enabled.
   */
  protected onPointerMove(): void {
    if (!this.disabled() && !this.highlighted()) this.host.highlight(this as CwSelectOption);
  }
  // #endregion
}
