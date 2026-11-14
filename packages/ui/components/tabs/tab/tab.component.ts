import {
  Component,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { type FocusableOption, _IdGenerator } from '@angular/cdk/a11y';
import { ɵFOCUS, ɵFOCUS_INSET } from '@cadenway/ui/core';

import { TAB } from '../tab.token';
import { CwTabsList } from '../tabs-list/tabs-list.component';
import { CwTabs } from '../tabs.component';
import type { CwTabsLayout, CwTabsSize } from '../tabs.types';

/* Literal class strings (Tabs sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. The `group-data-[measured]/tabs` classes hand the active mark over
   to the list's sliding indicator once it is placed (mockup `App.dc.html`, view tabs). The active
   tab's icon turns `primary` (sheet, "Actif"); icons are `ng-icon`, sized through
   `--ng-icon__size` and colored through `--ng-icon__color` (its own layer beats a `text-*` class). Buttons are disabled natively, links through `aria-disabled`. */
/**
 * Constant BASES
 *
 * @description
 * Base tab classes for each layout.
 *
 * @type {Record<CwTabsLayout, string>}
 */
const BASES: Record<CwTabsLayout, string> = {
  segmented: `inline-flex h-full items-center justify-center gap-1.5 rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-colors motion-reduce:transition-none hover:bg-background/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:bg-secondary group-data-[measured]/tabs:data-[state=active]:border-transparent group-data-[measured]/tabs:data-[state=active]:bg-transparent [&_ng-icon]:shrink-0 data-[state=active]:[&_ng-icon]:[--ng-icon__color:var(--primary)] ${ɵFOCUS_INSET}`,
  bar: `relative inline-flex items-center gap-1.5 rounded-md px-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors motion-reduce:transition-none hover:text-foreground data-[state=active]:text-foreground after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full data-[state=active]:after:bg-foreground group-data-[measured]/tabs:data-[state=active]:after:bg-transparent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] data-[state=active]:[&_ng-icon]:[--ng-icon__color:var(--primary)] ${ɵFOCUS}`,
  vertical: `relative flex items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors motion-reduce:transition-none hover:text-foreground data-[state=active]:text-foreground after:pointer-events-none after:absolute after:inset-y-1 after:-left-px after:w-0.5 after:rounded-full data-[state=active]:after:bg-foreground group-data-[measured]/tabs:data-[state=active]:after:bg-transparent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] data-[state=active]:[&_ng-icon]:[--ng-icon__color:var(--primary)] ${ɵFOCUS_INSET}`,
};

/**
 * Constant SIZES
 *
 * @description
 * Tab dimensions for each layout and size.
 *
 * @type {Record<CwTabsLayout, Record<CwTabsSize, string>>}
 */
const SIZES: Record<CwTabsLayout, Record<CwTabsSize, string>> = {
  segmented: {
    default: 'px-2.5 [&_ng-icon]:[--ng-icon__size:1rem]',
    sm: 'px-2 [&_ng-icon]:[--ng-icon__size:0.875rem]',
  },
  bar: { default: 'h-9', sm: 'h-7' },
  vertical: { default: 'h-8', sm: 'h-7' },
};

/* Tabs sheet, "Compteur": a pill in `bar`, the bare number in `segmented` (the track is already
   `bg-secondary`); pushed to the end of a vertical tab, as in the preview. */
/**
 * Constant COUNTS
 *
 * @description
 * Counter classes for each tab layout.
 *
 * @type {Record<CwTabsLayout, string>}
 */
const COUNTS: Record<CwTabsLayout, string> = {
  segmented: 'text-xs tabular-nums text-muted-foreground',
  bar: 'rounded-full bg-secondary px-1.5 text-xs leading-5 font-medium tabular-nums text-muted-foreground',
  vertical:
    'ml-auto rounded-full bg-secondary px-1.5 text-xs leading-5 font-medium tabular-nums text-muted-foreground',
};

/**
 * Function optionalNumber
 *
 * @description
 * Converts a template value to an optional number.
 *
 * @param {unknown} value - Template value to normalize.
 *
 * @returns {number | undefined} Number, or undefined for a missing value.
 */
function optionalNumber(value: unknown): number | undefined {
  return value === undefined || value === null || value === '' ? undefined : numberAttribute(value);
}

/**
 * Function optionalBoolean
 *
 * @description
 * Converts a template value to an optional boolean.
 *
 * @param {unknown} value - Template value to normalize.
 *
 * @returns {boolean | undefined} Boolean, or undefined for a missing value.
 */
function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined || value === null ? undefined : booleanAttribute(value);
}

/**
 * Class CwTab
 * @class CwTab
 *
 * @description
 * One tab of a `cw-tabs-list`: a native `<button>` that shows a `cw-tab-panel`, or a native `<a>`
 * that leads to a page (the view tabs of a page header).
 *
 * `value` identifies it (required); the tab is active when it equals the set's value. A button is
 * `role="tab"` with `aria-selected` and `aria-controls` (the panel of the same value), sets
 * `type="button"` when no type is given, and is disabled natively. A link keeps its native role,
 * carries `aria-current="page"` when active and `aria-disabled` when disabled (its click is then
 * cancelled before any other listener, `routerLink` included). For a routed link, bind `active` from
 * the router (`routerLinkActive #rla="routerLinkActive" [active]="rla.isActive"`): it overrides the
 * value comparison, so the brick needs no router. Clicking a tab makes it the set's value. `count`
 * shows a counter after the label, read with it (« Sous-tâches, 5 »). The sheet wants the active
 * tab's icon filled: the icon turns `text-primary` here, the consumer swaps the Bold glyph for the
 * Fill one with `#tab="cwTab"` and `tab.isActive()`. Style hook: `data-state="active|inactive"`.
 */
@Component({
  selector: 'button[cwTab], a[cwTab]',
  exportAs: 'cwTab',
  providers: [{ provide: TAB, useExisting: forwardRef(() => CwTab) }],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'isLink ? null : type',
    '[attr.role]': 'isLink ? null : "tab"',
    '[attr.id]': 'id',
    '[attr.aria-selected]': 'isLink ? null : isActive()',
    '[attr.aria-controls]': 'controls()',
    '[attr.aria-current]': 'isLink && isActive() ? "page" : null',
    '[attr.aria-disabled]': 'isLink && disabled() ? "true" : null',
    '[attr.disabled]': '!isLink && disabled() ? "" : null',
    '[attr.tabindex]': 'list.tabStop() === this ? 0 : -1',
    '[attr.data-state]': 'isActive() ? "active" : "inactive"',
    '(click)': 'root.select(value())',
    '(focus)': 'list.focused(this)',
  },
  templateUrl: './tab.component.html',
})
export class CwTab {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Identifies the tab and its matching panel.
   *
   * @type {InputSignal<string>}
   */
  public readonly value: InputSignal<string> = input.required<string>();

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Disables the tab and excludes it from arrow navigation.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property count
   * @readonly
   *
   * @description
   * Optional counter shown after the label.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   */
  public readonly count: InputSignalWithTransform<number | undefined, unknown> = input<
    number | undefined,
    unknown
  >(undefined, {
    transform: optionalNumber,
  });

  /**
   * Property active
   * @readonly
   *
   * @description
   * Optional externally controlled active state.
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   */
  public readonly active: InputSignalWithTransform<boolean | undefined, unknown> = input<
    boolean | undefined,
    unknown
  >(undefined, {
    transform: optionalBoolean,
  });

  /**
   * Property root
   * @readonly
   *
   * @description
   * Tab set containing this tab.
   *
   * @type {CwTabs}
   */
  public readonly root: CwTabs = inject(CwTabs);

  /**
   * Property list
   * @readonly
   *
   * @description
   * Tab list managing focus.
   *
   * @type {CwTabsList}
   */
  protected readonly list: CwTabsList = inject(CwTabsList);

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native host measured by the tab list.
   *
   * @type {HTMLElement}
   */
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property isLink
   * @readonly
   *
   * @description
   * Whether the host is an anchor.
   *
   * @type {boolean}
   */
  public readonly isLink: boolean = this.element.tagName === 'A';

  /**
   * Property id
   * @readonly
   *
   * @description
   * Unique identifier referenced by the associated panel.
   *
   * @type {string}
   */
  public readonly id: string = inject(_IdGenerator).getId('cw-tab-');

  /**
   * Property type
   * @readonly
   *
   * @description
   * Declared button type or a safe button default.
   *
   * @type {string}
   */
  protected readonly type: string =
    inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  /**
   * Property isActive
   * @readonly
   *
   * @description
   * Effective active state, including any consumer override.
   *
   * @type {Signal<boolean>}
   */
  public readonly isActive: Signal<boolean> = computed(
    () => this.active() ?? this.root.selected() === this.value(),
  );

  /**
   * Property keyOption
   * @readonly
   *
   * @description
   * Stable focus-manager adapter for this tab.
   *
   * @type {FocusableOption}
   */
  public readonly keyOption: FocusableOption = optionOf(this);

  /**
   * Property controls
   * @readonly
   *
   * @description
   * Identifier of the matching panel for a button tab.
   *
   * @type {Signal<string | null>}
   */
  protected readonly controls: Signal<string | null> = computed(() => {
    if (this.isLink) return null;
    const value: string = this.value();
    return this.root.panels().find((panel) => panel.value() === value)?.id ?? null;
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Tab classes for the effective layout and size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const layout: CwTabsLayout = this.root.layout();
    return `${BASES[layout]} ${SIZES[layout][this.root.size()]}`;
  });

  /**
   * Property countClasses
   * @readonly
   *
   * @description
   * Counter classes for the effective layout.
   *
   * @type {Signal<string>}
   */
  protected readonly countClasses: Signal<string> = computed(() => COUNTS[this.root.layout()]);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Prevents activation of disabled links during the capture phase.
   */
  public constructor() {
    // Capture phase: a disabled link's click is cancelled before the consumer's listeners and
    // `routerLink` run, as `CwButton` does for its links.
    this.element.addEventListener(
      'click',
      (event) => {
        if (this.isLink && this.disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the tab host.
   *
   * @param {FocusOptions} [options] - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.element.focus(options);
  }

  /**
   * Method activate
   * @method activate
   *
   * @description
   * Follows a link or selects a button tab reached by an arrow key.
   * @internal
   */
  public activate(): void {
    if (this.isLink) this.element.click();
    else this.root.select(this.value());
  }
  // #endregion
}

/* The tab's signal input `disabled` cannot be the `disabled: boolean` the CDK key manager reads, so
   the manager moves through one plain option per tab that reads the tab's state when asked. */
/**
 * Function optionOf
 *
 * @description
 * Adapts the tab to the focus manager, exposing its current disabled state.
 *
 * @param {CwTab} tab - Tab represented by the focus option.
 *
 * @returns {FocusableOption} Focus option delegating to the tab.
 */
function optionOf(tab: CwTab): FocusableOption {
  return {
    focus: () => {
      tab.focus();
    },
    get disabled(): boolean {
      return tab.disabled();
    },
  };
}
