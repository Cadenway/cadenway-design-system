import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ɵnavigateList } from '@cadenway/ui/core';

import type { CwTab } from '../tab/tab.component';
import { CwTabs } from '../tabs.component';
import type { CwTabsLayout, CwTabsSize } from '../tabs.types';

/* Literal class strings (Tabs sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. `group/tabs` and `data-measured` drive the sliding indicator, as in
   the mockup's view tabs (`App.dc.html`, `placeTabIndicator`): until the list is measured each
   active tab draws its own mark, then the single indicator takes over and slides. */
/**
 * Constant LISTS
 *
 * @description
 * List layout classes for each orientation and size.
 *
 * @type {Record<CwTabsLayout, Record<CwTabsSize, string>>}
 */
const LISTS: Record<CwTabsLayout, Record<CwTabsSize, string>> = {
  segmented: {
    default:
      'group/tabs relative isolate inline-flex h-8 w-fit items-center rounded-lg bg-secondary p-0.5 text-muted-foreground dark:border dark:bg-canvas',
    sm: 'group/tabs relative isolate inline-flex h-7 w-fit items-center rounded-lg bg-secondary p-0.5 text-muted-foreground dark:border dark:bg-canvas',
  },
  bar: {
    default: 'group/tabs relative flex items-stretch gap-4 border-b',
    sm: 'group/tabs relative flex items-stretch gap-4 border-b',
  },
  vertical: {
    default: 'group/tabs relative flex w-50 shrink-0 flex-col items-stretch gap-0.5 border-l',
    sm: 'group/tabs relative flex w-50 shrink-0 flex-col items-stretch gap-0.5 border-l',
  },
};

/* Tabs sheet, "Mouvement": one indicator slides to the active tab (300 ms, `ease-snap`). It moves
   with `translate`, as the mockup's does, and stops under reduced motion. Its geometry comes from
   the `--tab-*` variables the list measures. */
/**
 * Constant INDICATORS
 *
 * @description
 * Sliding indicator classes for each tab layout.
 *
 * @type {Record<CwTabsLayout, string>}
 */
const INDICATORS: Record<CwTabsLayout, string> = {
  segmented:
    'pointer-events-none absolute inset-y-0.5 left-0 -z-10 hidden w-(--tab-w) translate-x-(--tab-x) rounded-md border border-border bg-background transition-[translate,width] duration-300 ease-snap group-data-[measured]/tabs:block motion-reduce:transition-none dark:bg-secondary',
  bar: 'pointer-events-none absolute -bottom-px left-0 hidden h-0.5 w-(--tab-w) translate-x-(--tab-x) rounded-full bg-foreground transition-[translate,width] duration-300 ease-snap group-data-[measured]/tabs:block motion-reduce:transition-none',
  vertical:
    'pointer-events-none absolute top-0 -left-px hidden h-(--tab-h) w-0.5 translate-y-(--tab-y) rounded-full bg-foreground transition-[translate,height] duration-300 ease-snap group-data-[measured]/tabs:block motion-reduce:transition-none',
};

/**
 * Class CwTabsList
 * @class CwTabsList
 *
 * @description
 * The row (or column) of tabs of a `cw-tabs`: project its `button[cwTab]` or `a[cwTab]` elements
 * and name it with `ariaLabel` (« Vues de la liste »).
 *
 * With buttons it is a `role="tablist"` with `aria-orientation`; with links it is a
 * `role="navigation"` landmark (Page Header sheet: « un `nav aria-label="Vues"` »). One Tab stop
 * (roving tabindex through the CDK `FocusKeyManager`): the active tab, else the first enabled one.
 * Left and right (up and down when vertical) move to the previous or next tab and wrap, Home and End
 * reach the ends, disabled tabs are skipped; with `activation="automatic"` the tab reached is
 * activated (a link is followed). The active mark is one indicator that slides between tabs, placed
 * from the tabs' measured boxes and kept in place by a `ResizeObserver`. Style hooks:
 * `data-orientation`, `data-measured` once the indicator is placed.
 */
@Component({
  selector: 'cw-tabs-list',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'isNav() ? "navigation" : "tablist"',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-orientation]': 'isNav() ? null : orientation()',
    '[attr.data-orientation]': 'orientation()',
    '(keydown)': 'onKeydown($event)',
  },
  templateUrl: './tabs-list.component.html',
})
export class CwTabsList {
  // #region Properties
  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the tab list.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property root
   * @readonly
   *
   * @description
   * Tab set supplying shared state and tabs.
   *
   * @type {CwTabs}
   */
  private readonly root: CwTabs = inject(CwTabs);

  /**
   * Property host
   * @readonly
   *
   * @description
   * Native list element used to place the indicator.
   *
   * @type {HTMLElement}
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property dir
   * @readonly
   *
   * @description
   * Optional writing direction used for keyboard navigation.
   *
   * @type {Directionality | null}
   */
  private readonly dir: Directionality | null = inject(Directionality, { optional: true });

  /**
   * Property destroyRef
   * @readonly
   *
   * @description
   * Lifecycle hook for disconnecting observers.
   *
   * @type {DestroyRef}
   */
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  /**
   * Property measured
   *
   * @description
   * Whether the active indicator has been positioned.
   *
   * @type {boolean}
   */
  private measured: boolean = false;

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard focus manager for the tab options.
   *
   * @type {FocusKeyManager<FocusableOption>}
   */
  private readonly keyManager: FocusKeyManager<FocusableOption> =
    new FocusKeyManager<FocusableOption>(
      computed(() => this.root.tabs().map((tab) => tab.keyOption)),
      inject(Injector),
    )
      .withWrap()
      .withHomeAndEnd();

  /**
   * Property isNav
   * @readonly
   *
   * @description
   * Whether links make the list a navigation landmark.
   *
   * @type {Signal<boolean>}
   */
  public readonly isNav: Signal<boolean> = computed(() =>
    this.root.tabs().some((tab) => tab.isLink),
  );

  /**
   * Property tabStop
   * @readonly
   *
   * @description
   * Active or first enabled tab receiving the tab stop.
   *
   * @type {Signal<CwTab | null>}
   */
  public readonly tabStop: Signal<CwTab | null> = computed(() => {
    const enabled: CwTab[] = this.root.tabs().filter((tab) => !tab.disabled());
    return enabled.find((tab) => tab.isActive()) ?? enabled.at(0) ?? null;
  });

  /**
   * Property activeTab
   * @readonly
   *
   * @description
   * Currently active tab, when present.
   *
   * @type {Signal<CwTab | null>}
   */
  private readonly activeTab: Signal<CwTab | null> = computed(
    () => this.root.tabs().find((tab) => tab.isActive()) ?? null,
  );

  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Effective arrow-key and list orientation.
   *
   * @type {Signal<'vertical' | 'horizontal'>}
   */
  protected readonly orientation: Signal<'vertical' | 'horizontal'> = computed(() =>
    this.root.layout() === 'vertical' ? 'vertical' : 'horizontal',
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * List classes for the current layout and size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => LISTS[this.root.layout()][this.root.size()],
  );

  /**
   * Property indicatorClasses
   * @readonly
   *
   * @description
   * Indicator classes for the current layout.
   *
   * @type {Signal<string>}
   */
  protected readonly indicatorClasses: Signal<string> = computed(
    () => INDICATORS[this.root.layout()],
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Places the indicator after rendering and observes subsequent layout changes.
   */
  public constructor() {
    afterRenderEffect(() => {
      this.place(this.activeTab(), this.root.layout());
    });

    // Boxes change without a new render: fonts loading, a count growing, a hidden panel shown.
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const resizes: ResizeObserver = new ResizeObserver(() => {
        this.place(this.activeTab(), this.root.layout());
      });
      const observeChildren: () => void = (): void => {
        resizes.observe(this.host);
        for (const child of Array.from(this.host.children)) resizes.observe(child);
      };
      observeChildren();
      const additions: MutationObserver = new MutationObserver(observeChildren);
      additions.observe(this.host, { childList: true });
      this.destroyRef.onDestroy(() => {
        resizes.disconnect();
        additions.disconnect();
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method focused
   * @method focused
   *
   * @description
   * Synchronizes the focus manager when a tab receives focus.
   * @internal
   *
   * @param {CwTab} tab - Tab that received focus.
   */
  public focused(tab: CwTab): void {
    this.keyManager.updateActiveItem(tab.keyOption);
  }

  /**
   * Method onKeydown
   * @method onKeydown
   *
   * @description
   * Moves focus and optionally activates a tab for keyboard navigation.
   *
   * @param {KeyboardEvent} event - Keyboard event from the tab list.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const before: FocusableOption | null = this.keyManager.activeItem;
    if (!ɵnavigateList(this.keyManager, event, this.orientation(), this.dir?.value === 'rtl')) {
      return;
    }
    event.preventDefault();
    const after: FocusableOption | null = this.keyManager.activeItem;
    if (this.root.activation() !== 'automatic' || !after || after === before) return;
    this.root
      .tabs()
      .find((tab) => tab.keyOption === after)
      ?.activate();
  }

  /**
   * Method place
   * @method place
   *
   * @description
   * Positions the indicator over a measurable active tab; vertical layout retains four-pixel insets.
   *
   * @param {CwTab | null} tab - Active tab, or null when none is active.
   * @param {CwTabsLayout} layout - Layout used to position the indicator.
   */
  private place(tab: CwTab | null, layout: CwTabsLayout): void {
    if (!tab) return;
    const element: HTMLElement = tab.element;
    if (element.offsetWidth === 0 && element.offsetHeight === 0) return;
    const style: CSSStyleDeclaration = this.host.style;
    if (layout === 'vertical') {
      style.setProperty('--tab-y', `${String(element.offsetTop + 4)}px`);
      style.setProperty('--tab-h', `${String(Math.max(0, element.offsetHeight - 8))}px`);
    } else {
      style.setProperty('--tab-x', `${String(element.offsetLeft)}px`);
      style.setProperty('--tab-w', `${String(element.offsetWidth)}px`);
    }
    if (!this.measured) {
      this.measured = true;
      this.host.setAttribute('data-measured', '');
    }
  }
  // #endregion
}
