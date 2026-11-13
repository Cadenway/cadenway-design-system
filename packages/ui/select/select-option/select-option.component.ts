import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import { SELECT_HOST } from '../select.token';
import { OPTION, OPTION_ENTER, enterDelay } from '../select.styles';

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'option',
    '[id]': 'id',
    class: `${OPTION} ${OPTION_ENTER}`,
    '[style.animation-delay.ms]': 'delay()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-highlighted]': 'highlighted() ? "" : null',
    // The focus stays on the trigger (aria-activedescendant): a press must not take it.
    '(mousedown)': '$event.preventDefault()',
    '(click)': 'onClick()',
    '(pointermove)': 'onPointerMove()',
  },
  templateUrl: './select-option.component.html',
})
export class CwSelectOption<T = unknown> {
  /** The value the select takes when this option is chosen. */
  readonly value = input.required<T>();
  /** Makes the option inert; the arrows skip it. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject(SELECT_HOST);

  /** @internal The id `aria-activedescendant` points at. */
  readonly id = inject(_IdGenerator).getId('cw-select-option-');
  /** @internal The option element, for the scroll into view and the copy into the trigger. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly selected = computed(() => this.host.isSelected(this.value()));
  protected readonly highlighted = computed(() => this.host.highlighted() === this);
  protected readonly delay = computed(() =>
    enterDelay(this.host.options().indexOf(this as CwSelectOption)),
  );

  /** @internal The text of the option, for the typeahead and the label animation. */
  label(): string {
    return this.element.textContent.trim();
  }

  protected onClick(): void {
    if (!this.disabled()) this.host.choose(this as CwSelectOption);
  }

  protected onPointerMove(): void {
    if (!this.disabled() && !this.highlighted()) this.host.highlight(this as CwSelectOption);
  }
}
