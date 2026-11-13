import { Component, computed, contentChildren, inject, input, model } from '@angular/core';

import { TAB_PANEL } from './tab-panel.token';
import { TAB } from './tab.token';
import { TABS_CONFIG } from './tabs-config.token';
import type {
  CwTabsActivation,
  CwTabsLayout,
  CwTabsOrientation,
  CwTabsSize,
  CwTabsVariant,
} from './tabs.types';

/**
 * Switches between the panels of one context: local views (Liste / Tableau / Calendrier), the
 * sections of a task, the pages of the settings (Tabs sheet of the Design System artifact).
 *
 * Holds the active tab and the shared settings of a `cw-tabs-list` of `button[cwTab]` and of the
 * `cw-tab-panel` elements. `[(value)]` is the active tab's `value`; an empty value activates the
 * first enabled tab. `variant` is `segmented` (pills in a track, the default) or `bar` (underlined
 * tabs); `provideCwTabs` changes the default below an injector. `orientation="vertical"` lays a
 * `bar` list on the left with up and down arrows; it is ignored by `segmented`. `activation`
 * decides whether the arrows activate the tab they reach (`automatic`) or only focus it, Enter or
 * Space activating it (`manual`). With `a[cwTab]` links the list becomes a navigation (see `CwTab`).
 * Style hooks: `data-variant`, `data-size`, `data-orientation`.
 */
@Component({
  selector: 'cw-tabs',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-orientation]': 'layout() === "vertical" ? "vertical" : "horizontal"',
  },
  templateUrl: './tabs.component.html',
})
export class CwTabs {
  private readonly config = inject(TABS_CONFIG, { optional: true });

  /** `value` of the active tab, `[(value)]`; empty activates the first enabled tab. */
  readonly value = model('');
  /** Look of the list and of its tabs. */
  readonly variant = input<CwTabsVariant>(this.config?.variant ?? 'segmented');
  /** Height of the tabs. */
  readonly size = input<CwTabsSize>(this.config?.size ?? 'default');
  /** Direction of the list and of its arrow keys; `vertical` needs `variant="bar"`. */
  readonly orientation = input<CwTabsOrientation>('horizontal');
  /** Whether the arrows activate the tab they reach or only move the focus. */
  readonly activation = input<CwTabsActivation>('automatic');

  // Descendants: the tabs sit in the list. A nested tab set's tabs are filtered out by their root.
  private readonly allTabs = contentChildren(TAB, { descendants: true });
  private readonly allPanels = contentChildren(TAB_PANEL, { descendants: true });

  /** @internal The tabs of this set, in document order. */
  readonly tabs = computed(() => this.allTabs().filter((tab) => tab.root === this));
  /** @internal The panels of this set, in document order. */
  readonly panels = computed(() => this.allPanels().filter((panel) => panel.root === this));

  /** @internal The layout of the list: the sheet allows the vertical orientation with `bar` only. */
  readonly layout = computed<CwTabsLayout>(() => {
    if (this.variant() === 'segmented') return 'segmented';
    return this.orientation() === 'vertical' ? 'vertical' : 'bar';
  });

  /** @internal The active value: the bound one, else the first enabled tab's (sheet: « premier onglet »). */
  readonly selected = computed(
    () =>
      this.value() ||
      (this.tabs()
        .find((tab) => !tab.disabled())
        ?.value() ??
        ''),
  );

  protected readonly classes = computed(() =>
    this.layout() === 'vertical' ? 'flex items-start gap-6' : 'flex flex-col gap-3',
  );

  /** @internal Makes `value` the active tab; emits `valueChange` when it changes. */
  select(value: string): void {
    if (this.value() !== value) this.value.set(value);
  }
}
