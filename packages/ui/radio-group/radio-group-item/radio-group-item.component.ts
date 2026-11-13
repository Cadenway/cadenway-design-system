import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { type FocusableOption, _IdGenerator } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';

import { RADIO_GROUP_ITEM } from '../radio-group-item.token';
import { CwRadioGroup } from '../radio-group/radio-group.component';
import type { CwRadioGroupItemVariant } from '../radio-group.types';

/* Literal class strings (Radio Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. The card classes are in the template. */
const RADIO =
  'grid aspect-square size-4 shrink-0 place-content-center rounded-full border border-line-control bg-transparent transition-[color,background-color,box-shadow] data-[state=unchecked]:hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/field:disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-destructive/15 motion-reduce:transition-none';

const RADIOS: Record<CwRadioGroupItemVariant, string> = {
  default: RADIO,
  // In a card the radio sits on the first 20 px line of the title.
  card: `${RADIO} mt-0.5`,
};

const HOSTS: Record<CwRadioGroupItemVariant, string> = {
  default: 'inline-flex',
  card: 'flex',
};

/* An option as the CDK focus key manager sees it: its `disabled` is a plain boolean, where the
   option's own `disabled` is an input signal. */
class RadioOption implements FocusableOption {
  constructor(private readonly item: CwRadioGroupItem) {}

  get disabled(): boolean {
    return this.item.isDisabled();
  }

  focus(): void {
    this.item.focus();
  }
}

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.id]': 'null',
    '[attr.data-variant]': 'variant()',
  },
  templateUrl: './radio-group-item.component.html',
})
export class CwRadioGroupItem {
  /** Value the group takes when this option is selected. */
  readonly value = input.required<string>();
  /** Disables this option; the arrows skip it. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Id of the radio, for `<label for>`; generated when not given. */
  readonly id = input(inject(_IdGenerator).getId('cw-radio-'));
  /** A bare radio, or a choice card wrapping the radio and the projected texts. */
  readonly variant = input<CwRadioGroupItemVariant>('default');

  protected readonly group = inject(CwRadioGroup);
  private readonly control = viewChild<ElementRef<HTMLButtonElement>>('control');

  /** Whether this option cannot be selected, alone or with its group. Read by the group. */
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
  protected readonly checked = computed(() => this.group.value() === this.value());
  protected readonly hostClasses = computed(() => HOSTS[this.variant()]);
  protected readonly radioClasses = computed(() => RADIOS[this.variant()]);

  /** This option seen by the group's focus key manager. */
  readonly option: FocusableOption = new RadioOption(this);

  /** Moves the focus to the radio. */
  focus(options?: FocusOptions): void {
    this.control()?.nativeElement.focus(options);
  }

  /** Whether the radio holds the focus. Read by the group on arrow keys. */
  hasFocus(): boolean {
    const control = this.control()?.nativeElement;
    return !!control && control.ownerDocument.activeElement === control;
  }
}
