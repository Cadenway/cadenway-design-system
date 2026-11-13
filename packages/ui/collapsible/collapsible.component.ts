import { _IdGenerator } from '@angular/cdk/a11y';
import { Component, booleanAttribute, computed, inject, input, model } from '@angular/core';

import type { CwCollapsibleState } from './collapsible.types';

/**
 * A block that folds behind a trigger: the subtasks of a task, a group of the List view, the
 * elements beyond the first ones (Collapsible sheet of the Design System artifact).
 *
 * Holds a `[cwCollapsibleTrigger]` and a `cw-collapsible-content`, plus any always visible part.
 * `[(expanded)]` opens and closes it; the trigger toggles it on click, Enter and Space (it is a
 * native button). `disabled` keeps it as it is (an empty group). The root, the trigger and the
 * content carry `data-state="open|closed"`; the closed content is `inert`. Export it as
 * `#block="cwCollapsible"` to read `expanded()` in the template (« Afficher moins »).
 */
@Component({
  selector: 'cw-collapsible',
  exportAs: 'cwCollapsible',
  host: {
    class: 'flex flex-col',
    '[attr.data-state]': 'state()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  templateUrl: './collapsible.component.html',
})
export class CwCollapsible {
  /** Whether the content shows; `[(expanded)]`. */
  readonly expanded = model(false);
  /** Keeps the block as it is: the trigger is dimmed and does not toggle. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Id of the content, referenced by the trigger's `aria-controls`. */
  readonly contentId = inject(_IdGenerator).getId('cw-collapsible-content-');

  /** `open` or `closed`, for the `data-state` hook of every part. */
  readonly state = computed<CwCollapsibleState>(() => (this.expanded() ? 'open' : 'closed'));

  /** Opens a closed block and closes an open one, unless it is disabled. */
  toggle(): void {
    if (!this.disabled()) this.expanded.update((expanded) => !expanded);
  }
}
