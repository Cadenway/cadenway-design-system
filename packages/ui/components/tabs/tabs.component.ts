import {
  Component,
  computed,
  contentChildren,
  inject,
  input,
  model,
  type InputSignal,
  type ModelSignal,
  type Signal,
} from '@angular/core';

import { TAB_PANEL } from './tab-panel.token';
import type { CwTabPanel } from './tab-panel/tab-panel.component';
import { TAB } from './tab.token';
import type { CwTab } from './tab/tab.component';
import { TABS_CONFIG } from './tabs-config.token';
import type {
  CwTabsActivation,
  CwTabsConfig,
  CwTabsLayout,
  CwTabsOrientation,
  CwTabsSize,
  CwTabsVariant,
} from './tabs.types';

/**
 * Class CwTabs
 * @class CwTabs
 *
 * @description
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
  // #region Properties
  /**
   * Property config
   * @readonly
   *
   * @description
   * Optional defaults supplied by an ancestor injector.
   *
   * @type {CwTabsConfig | null}
   */
  private readonly config: CwTabsConfig | null = inject(TABS_CONFIG, { optional: true });

  /**
   * Property value
   * @readonly
   *
   * @description
   * Active tab value; empty selects the first enabled tab.
   *
   * @type {ModelSignal<string>}
   */
  public readonly value: ModelSignal<string> = model('');

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Appearance of the tab list and its tabs.
   *
   * @type {InputSignal<CwTabsVariant>}
   */
  public readonly variant: InputSignal<CwTabsVariant> = input<CwTabsVariant>(
    this.config?.variant ?? 'segmented',
  );

  /**
   * Property size
   * @readonly
   *
   * @description
   * Height of the tabs.
   *
   * @type {InputSignal<CwTabsSize>}
   */
  public readonly size: InputSignal<CwTabsSize> = input<CwTabsSize>(this.config?.size ?? 'default');

  /**
   * Property orientation
   * @readonly
   *
   * @description
   * List and arrow-key direction; vertical applies to the bar variant.
   *
   * @type {InputSignal<CwTabsOrientation>}
   */
  public readonly orientation: InputSignal<CwTabsOrientation> =
    input<CwTabsOrientation>('horizontal');

  /**
   * Property activation
   * @readonly
   *
   * @description
   * Whether arrow keys activate the focused tab or only move focus.
   *
   * @type {InputSignal<CwTabsActivation>}
   */
  public readonly activation: InputSignal<CwTabsActivation> = input<CwTabsActivation>('automatic');

  /**
   * Property allTabs
   * @readonly
   *
   * @description
   * Descendant tabs, including those belonging to nested tab sets.
   *
   * @type {Signal<readonly CwTab[]>}
   */
  private readonly allTabs: Signal<readonly CwTab[]> = contentChildren(TAB, { descendants: true });

  /**
   * Property allPanels
   * @readonly
   *
   * @description
   * Descendant panels, including those belonging to nested tab sets.
   *
   * @type {Signal<readonly CwTabPanel[]>}
   */
  private readonly allPanels: Signal<readonly CwTabPanel[]> = contentChildren(TAB_PANEL, {
    descendants: true,
  });

  /**
   * Property tabs
   * @readonly
   *
   * @description
   * Tabs belonging to this set in document order.
   * @internal
   *
   * @type {Signal<CwTab[]>}
   */
  public readonly tabs: Signal<CwTab[]> = computed(() =>
    this.allTabs().filter((tab) => tab.root === this),
  );

  /**
   * Property panels
   * @readonly
   *
   * @description
   * Panels belonging to this set in document order.
   * @internal
   *
   * @type {Signal<CwTabPanel[]>}
   */
  public readonly panels: Signal<CwTabPanel[]> = computed(() =>
    this.allPanels().filter((panel) => panel.root === this),
  );

  /**
   * Property layout
   * @readonly
   *
   * @description
   * Effective list layout; vertical is available only for bar tabs.
   * @internal
   *
   * @type {Signal<CwTabsLayout>}
   */
  public readonly layout: Signal<CwTabsLayout> = computed<CwTabsLayout>(() => {
    if (this.variant() === 'segmented') return 'segmented';
    return this.orientation() === 'vertical' ? 'vertical' : 'bar';
  });

  /**
   * Property selected
   * @readonly
   *
   * @description
   * Bound value or the first enabled tab's value.
   * @internal
   *
   * @type {Signal<string>}
   */
  public readonly selected: Signal<string> = computed(
    () =>
      this.value() ||
      (this.tabs()
        .find((tab) => !tab.disabled())
        ?.value() ??
        ''),
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Root layout classes for the effective orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.layout() === 'vertical' ? 'flex items-start gap-6' : 'flex flex-col gap-3',
  );
  // #endregion

  // #region Methods
  /**
   * Method select
   * @method select
   *
   * @description
   * Selects a tab and emits the model change when its value differs.
   * @internal
   *
   * @param {string} value - Value identifying the tab to select.
   */
  public select(value: string): void {
    if (this.value() !== value) this.value.set(value);
  }
  // #endregion
}
