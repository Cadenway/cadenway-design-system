import { Component, computed, forwardRef, inject, input } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { ɵFOCUS } from '@cadenway/ui/core';

import { TAB_PANEL } from '../tab-panel.token';
import { CwTabs } from '../tabs.component';

/* Literal class strings. The panel is focusable (`tabindex="0"`, Tabs sheet, "Accessibilité") and
   not animated (sheet, "Mouvement"). Next to a vertical list it takes the remaining width. */
const HORIZONTAL = `block rounded-md data-[state=inactive]:hidden ${ɵFOCUS}`;
const VERTICAL = `block min-w-0 flex-1 rounded-md data-[state=inactive]:hidden ${ɵFOCUS}`;

/**
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
  /** `value` of the tab that shows this panel. */
  readonly value = input.required<string>();

  /** @internal The tab set this panel belongs to. */
  readonly root = inject(CwTabs);
  /** @internal The id the tab's `aria-controls` points to. */
  readonly id = inject(_IdGenerator).getId('cw-tab-panel-');

  protected readonly isActive = computed(() => this.root.selected() === this.value());
  protected readonly labelledBy = computed(() => {
    const value = this.value();
    return this.root.tabs().find((tab) => tab.value() === value)?.id ?? null;
  });
  protected readonly classes = computed(() =>
    this.root.layout() === 'vertical' ? VERTICAL : HORIZONTAL,
  );
}
