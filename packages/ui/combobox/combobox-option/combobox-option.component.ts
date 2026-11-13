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

import { OPTION, OPTION_ENTER, enterDelay } from '../combobox.styles';
import { COMBOBOX_HOST } from '../combobox.token';

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'option',
    '[id]': 'id',
    '[class]': 'classes()',
    // Out of the page and of the accessibility tree while the search does not match it.
    '[attr.hidden]': 'visible() ? null : ""',
    '[style.animation-delay.ms]': 'delay()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-highlighted]': 'highlighted() ? "" : null',
    // The focus stays in the search field (aria-activedescendant): a press must not take it.
    '(mousedown)': '$event.preventDefault()',
    '(click)': 'onClick()',
    '(pointermove)': 'onPointerMove()',
  },
  templateUrl: './combobox-option.component.html',
})
export class CwComboboxOption<T = unknown> {
  /** The value the combobox takes, or adds in `multiple`, when this option is chosen. */
  readonly value = input.required<T>();
  /** Makes the option inert; the arrows skip it. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** More words the search matches (an e-mail address, a team). */
  readonly keywords = input<readonly string[]>([]);
  /** The mention written on the right of a disabled option. */
  readonly disabledLabel = input('Désactivé');

  private readonly host = inject(COMBOBOX_HOST);

  /** @internal The id `aria-activedescendant` points at. */
  readonly id = inject(_IdGenerator).getId('cw-combobox-option-');
  /** @internal The option element, for the scroll into view and the copy into the trigger. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** @internal Whether the option matches the search. */
  readonly visible = computed(() => this.host.matches(this as CwComboboxOption));

  protected readonly selected = computed(() => this.host.isSelected(this.value()));
  protected readonly highlighted = computed(() => this.host.highlighted() === this);
  protected readonly classes = computed(() =>
    this.host.entering() ? `${OPTION} ${OPTION_ENTER}` : OPTION,
  );
  protected readonly delay = computed(() =>
    enterDelay(this.host.options().indexOf(this as CwComboboxOption)),
  );

  /** @internal The visible text of the option, which the search matches. */
  label(): string {
    const label = this.element.querySelector('[data-cw-combobox-label]') ?? this.element;
    return label.textContent.trim();
  }

  protected onClick(): void {
    if (!this.disabled()) this.host.choose(this as CwComboboxOption);
  }

  protected onPointerMove(): void {
    if (!this.disabled() && !this.highlighted()) this.host.highlight(this as CwComboboxOption);
  }
}
