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
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ɵnavigateList } from '@cadenway/ui/core';

import type { CwTab } from '../tab/tab.component';
import { CwTabs } from '../tabs.component';
import type { CwTabsLayout, CwTabsSize } from '../tabs.types';

/* Literal class strings (Tabs sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. `group/tabs` and `data-measured` drive the sliding indicator, as in
   the mockup's view tabs (`App.dc.html`, `placeTabIndicator`): until the list is measured each
   active tab draws its own mark, then the single indicator takes over and slides. */
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
const INDICATORS: Record<CwTabsLayout, string> = {
  segmented:
    'pointer-events-none absolute inset-y-0.5 left-0 -z-10 hidden w-(--tab-w) translate-x-(--tab-x) rounded-md border border-border bg-background transition-[translate,width] duration-300 ease-snap group-data-[measured]/tabs:block motion-reduce:transition-none dark:bg-secondary',
  bar: 'pointer-events-none absolute -bottom-px left-0 hidden h-0.5 w-(--tab-w) translate-x-(--tab-x) rounded-full bg-foreground transition-[translate,width] duration-300 ease-snap group-data-[measured]/tabs:block motion-reduce:transition-none',
  vertical:
    'pointer-events-none absolute top-0 -left-px hidden h-(--tab-h) w-0.5 translate-y-(--tab-y) rounded-full bg-foreground transition-[translate,height] duration-300 ease-snap group-data-[measured]/tabs:block motion-reduce:transition-none',
};

/**
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
  /** Accessible name of the list (« Vues de la liste », « Sections de la tâche »). */
  readonly ariaLabel = input('');

  private readonly root = inject(CwTabs);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dir = inject(Directionality, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private measured = false;

  private readonly keyManager = new FocusKeyManager(
    computed(() => this.root.tabs().map((tab) => tab.keyOption)),
    inject(Injector),
  )
    .withWrap()
    .withHomeAndEnd();

  /** @internal Whether the tabs are links: the list is then a navigation, not a tab list. */
  readonly isNav = computed(() => this.root.tabs().some((tab) => tab.isLink));

  /** @internal The single tab that takes the Tab stop. */
  readonly tabStop = computed(() => {
    const enabled = this.root.tabs().filter((tab) => !tab.disabled());
    return enabled.find((tab) => tab.isActive()) ?? enabled.at(0) ?? null;
  });

  private readonly activeTab = computed(
    () => this.root.tabs().find((tab) => tab.isActive()) ?? null,
  );

  protected readonly orientation = computed(() =>
    this.root.layout() === 'vertical' ? 'vertical' : 'horizontal',
  );
  protected readonly classes = computed(() => LISTS[this.root.layout()][this.root.size()]);
  protected readonly indicatorClasses = computed(() => INDICATORS[this.root.layout()]);

  constructor() {
    afterRenderEffect(() => {
      this.place(this.activeTab(), this.root.layout());
    });

    // Boxes change without a new render: fonts loading, a count growing, a hidden panel shown.
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const resizes = new ResizeObserver(() => {
        this.place(this.activeTab(), this.root.layout());
      });
      const observeChildren = (): void => {
        resizes.observe(this.host);
        for (const child of Array.from(this.host.children)) resizes.observe(child);
      };
      observeChildren();
      const additions = new MutationObserver(observeChildren);
      additions.observe(this.host, { childList: true });
      this.destroyRef.onDestroy(() => {
        resizes.disconnect();
        additions.disconnect();
      });
    });
  }

  /** @internal Called by a tab when it receives the focus. */
  focused(tab: CwTab): void {
    this.keyManager.updateActiveItem(tab.keyOption);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const before = this.keyManager.activeItem;
    if (!ɵnavigateList(this.keyManager, event, this.orientation(), this.dir?.value === 'rtl')) {
      return;
    }
    event.preventDefault();
    const after = this.keyManager.activeItem;
    if (this.root.activation() !== 'automatic' || !after || after === before) return;
    this.root
      .tabs()
      .find((tab) => tab.keyOption === after)
      ?.activate();
  }

  /* Mockup `App.dc.html`, `placeTabIndicator`: the indicator takes the active tab's offset and
     size. The vertical one keeps the 4 px insets of the sheet (`after:inset-y-1`). A tab that is not
     laid out (hidden panel, test DOM) measures 0: the tabs keep their own mark until it is. */
  private place(tab: CwTab | null, layout: CwTabsLayout): void {
    if (!tab) return;
    const element = tab.element;
    if (element.offsetWidth === 0 && element.offsetHeight === 0) return;
    const style = this.host.style;
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
}
