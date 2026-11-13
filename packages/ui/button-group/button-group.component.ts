import { Component, computed, contentChildren, input } from '@angular/core';

import type { CwButtonGroupOrientation } from './button-group.types';

/* Literal class strings (Button Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. Welded: inner corners cancelled, shared borders merged, the
   focused button above its neighbors so its ring shows whole. A group of groups only spaces them. */
const WELDED: Record<CwButtonGroupOrientation, string> = {
  horizontal:
    'flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
  vertical:
    'flex w-fit flex-col items-stretch [&>*]:focus-visible:z-10 [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
};

const NESTED: Record<CwButtonGroupOrientation, string> = {
  horizontal: 'flex w-fit items-center gap-2',
  vertical: 'flex w-fit flex-col items-start gap-2',
};

/**
 * Welds two to four related buttons into one block: the split « Créer une tâche ▾ » button, Filtrer
 * / Trier / Grouper, the sprint navigation (Button Group sheet of the Design System artifact).
 *
 * Project `button[cwButton]` of one variant and one size (an `input[cwInput]`, a
 * `cw-button-group-text` or a `cw-button-group-separator` may join them). The host is a
 * `role="group"` named by the required `ariaLabel`; every button stays its own Tab stop (this is not
 * a toolbar: no arrow keys). A group of `cw-button-group` children spaces them by 8 px instead of
 * welding them. Style hook: `data-orientation`.
 */
@Component({
  selector: 'cw-button-group',
  host: {
    role: 'group',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-orientation]': 'orientation()',
  },
  templateUrl: './button-group.component.html',
})
export class CwButtonGroup {
  /** Direction of the group; the separator takes the other one. */
  readonly orientation = input<CwButtonGroupOrientation>('horizontal');
  /** Accessible name of the group (« Navigation de sprint »); required. */
  readonly ariaLabel = input.required<string>();

  private readonly nested = contentChildren(CwButtonGroup);

  protected readonly classes = computed(() =>
    this.nested().length > 0 ? NESTED[this.orientation()] : WELDED[this.orientation()],
  );
}
