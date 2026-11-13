import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';

import { CwInputGroup } from '../input-group/input-group.component';
import type { CwInputGroupAddonAlign, CwInputGroupSize } from '../input-group.types';

/* Literal class strings (Input Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. */
const BASE =
  'flex shrink-0 cursor-text items-center text-muted-foreground select-none [&_ng-icon]:[--ng-icon__size:1rem]';

const ALIGNS: Record<CwInputGroupAddonAlign, string> = {
  'inline-start': 'h-full gap-1.5 text-sm',
  'inline-end': 'h-full gap-1.5 text-sm',
  // The row above a text area: « En réponse à … » and its cancel button.
  'block-start':
    'h-auto w-full justify-between gap-1.5 border-b px-2.5 py-1.5 text-xs [&>button]:-my-1 [&>button]:-me-1.5',
  'block-end': 'h-auto w-full gap-1 px-1.5 pb-1.5 text-sm',
};

/* Inline padding per group size: text and icons sit 10 px from the border (12 px in `lg`), a button
   4 px, a key cap 6 px (4 px in `sm`). */
const PADDINGS: Record<CwInputGroupSize, Record<'inline-start' | 'inline-end', string>> = {
  sm: {
    'inline-start': 'ps-2.5 has-[>button]:ps-1',
    'inline-end': 'pe-2.5 has-[>button]:pe-1 has-[>kbd]:pe-1',
  },
  default: {
    'inline-start': 'ps-2.5 has-[>button]:ps-1',
    'inline-end': 'pe-2.5 has-[>button]:pe-1 has-[>kbd]:pe-1.5',
  },
  lg: {
    'inline-start': 'ps-3 has-[>button]:ps-1.5',
    'inline-end': 'pe-2.5 has-[>button]:pe-1.5 has-[>kbd]:pe-1.5',
  },
};

/**
 * A complement of the field in a `cw-input-group`: an icon, a prefix or suffix, a key cap, a
 * counter, a spinner, buttons (Input Group sheet).
 *
 * `align` places it before (`inline-start`, default) or after (`inline-end`) the field, or as a row
 * above (`block-start`) or below (`block-end`) a text area; write it at that place in the markup.
 * In `muted-foreground`; a click outside its buttons focuses the field. Mark decorative icons
 * `aria-hidden`, announce a counter or a loading text with `aria-live="polite"`.
 */
@Component({
  selector: 'cw-input-group-addon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-align]': 'align()',
    '(click)': 'focusField($event)',
  },
  templateUrl: './input-group-addon.component.html',
})
export class CwInputGroupAddon {
  /** Position of the addon around the field. */
  readonly align = input<CwInputGroupAddonAlign>('inline-start');

  private readonly group = inject(CwInputGroup, { optional: true });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly classes = computed(() => {
    const align = this.align();
    const size = this.group?.size() ?? 'default';
    const padding = align === 'inline-start' || align === 'inline-end' ? PADDINGS[size][align] : '';
    return `${BASE} ${ALIGNS[align]} ${padding}`;
  });

  protected focusField(event: MouseEvent): void {
    const target = event.target;
    if (target instanceof Element && target.closest('button, a, input, textarea')) return;
    this.element
      .closest('cw-input-group')
      ?.querySelector<HTMLElement>('input:not([type=hidden]), textarea')
      ?.focus();
  }
}
