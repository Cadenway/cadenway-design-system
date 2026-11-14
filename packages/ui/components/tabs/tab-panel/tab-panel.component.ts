import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { ɵFOCUS } from '@cadenway/ui/core';

import { TAB_PANEL } from '../tab-panel.token';
import { CwTabs } from '../tabs.component';

/**
 * Constant HORIZONTAL
 *
 * @description
 * Panel classes for a horizontal tab list.
 *
 * @type {string}
 */
const HORIZONTAL: string = `block rounded-md data-[state=inactive]:hidden ${ɵFOCUS}`;

/**
 * Constant VERTICAL
 *
 * @description
 * Panel classes taking remaining width beside a vertical list.
 *
 * @type {string}
 */
const VERTICAL: string = `block min-w-0 flex-1 rounded-md data-[state=inactive]:hidden ${ɵFOCUS}`;

/**
 * Class CwTabPanel
 * @class CwTabPanel
 *
 * @description
 * The content shown by the tab of the same `value` in a `cw-tabs` (one panel per tab).
 *
 * A `role="tabpanel"` named by its tab (`aria-labelledby`) and reachable with Tab (`tabindex="0"`).
 * Only the active panel is shown; the others stay in the DOM, `hidden`. Style hook:
 * `data-state="active|inactive"`.
 */
@Component({
  selector: 'cw-tab-panel',
  providers: [{ provide: TAB_PANEL, useExisting: forwardRef(() => CwTabPanel) }],
  host: {
    role: 'tabpanel',
    tabindex: '0',
    '[class]': 'classes()',
    '[attr.id]': 'id',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.hidden]': 'isActive() ? null : ""',
    '[attr.data-state]': 'isActive() ? "active" : "inactive"',
  },
  templateUrl: './tab-panel.component.html',
})
export class CwTabPanel {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Value of the tab that displays this panel.
   *
   * @type {InputSignal<string>}
   */
  public readonly value: InputSignal<string> = input.required<string>();

  /**
   * Property root
   * @readonly
   *
   * @description
   * Tab set containing this panel.
   * @internal
   *
   * @type {CwTabs}
   */
  public readonly root: CwTabs = inject(CwTabs);

  /**
   * Property id
   * @readonly
   *
   * @description
   * Unique identifier referenced by the tab's aria-controls.
   * @internal
   *
   * @type {string}
   */
  public readonly id: string = inject(_IdGenerator).getId('cw-tab-panel-');

  /**
   * Property isActive
   * @readonly
   *
   * @description
   * Whether the panel matches the selected tab.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isActive: Signal<boolean> = computed(
    () => this.root.selected() === this.value(),
  );

  /**
   * Property labelledBy
   * @readonly
   *
   * @description
   * Identifier of the matching tab, when present.
   *
   * @type {Signal<string | null>}
   */
  protected readonly labelledBy: Signal<string | null> = computed(() => {
    const value: string = this.value();
    return this.root.tabs().find((tab) => tab.value() === value)?.id ?? null;
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Panel layout classes for the tab set's orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.root.layout() === 'vertical' ? VERTICAL : HORIZONTAL,
  );
  // #endregion
}
