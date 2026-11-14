import { _IdGenerator } from '@angular/cdk/a11y';
import {
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  type InputSignalWithTransform,
  type ModelSignal,
  type Signal,
} from '@angular/core';

import type { CwCollapsibleState } from './collapsible.types';

/**
 * Class CwCollapsible
 * @class CwCollapsible
 *
 * @description
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
  // #region Properties
  /**
   * Property expanded
   * @readonly
   *
   * @description
   * Two-way model controlling whether the collapsible content is visible.
   *
   * @type {ModelSignal<boolean>}
   * @default false
   */
  public readonly expanded: ModelSignal<boolean> = model(false);

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Input preventing the trigger from toggling the block while keeping its current state.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property contentId
   * @readonly
   *
   * @description
   * Generated content identifier referenced by the trigger's `aria-controls`.
   *
   * @type {string}
   */
  public readonly contentId: string = inject(_IdGenerator).getId('cw-collapsible-content-');

  /**
   * Property state
   * @readonly
   *
   * @description
   * Open or closed state shared by the root and child `data-state` hooks.
   *
   * @type {Signal<CwCollapsibleState>}
   */
  public readonly state: Signal<CwCollapsibleState> = computed<CwCollapsibleState>(() =>
    this.expanded() ? 'open' : 'closed',
  );
  // #endregion

  // #region Methods
  /**
   * Method toggle
   * @method toggle
   *
   * @description
   * Flips the expanded model unless the block is disabled.
   */
  public toggle(): void {
    if (!this.disabled()) this.expanded.update((expanded) => !expanded);
  }
  // #endregion
}
