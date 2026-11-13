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
const BASES: Record<CwTabsLayout, string> = {
  segmented: `inline-flex h-full items-center justify-center gap-1.5 rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-colors motion-reduce:transition-none hover:bg-background/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:bg-secondary group-data-[measured]/tabs:data-[state=active]:border-transparent group-data-[measured]/tabs:data-[state=active]:bg-transparent [&_ng-icon]:shrink-0 data-[state=active]:[&_ng-icon]:[--ng-icon__color:var(--primary)] ${ɵFOCUS_INSET}`,
  bar: `relative inline-flex items-center gap-1.5 rounded-md px-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors motion-reduce:transition-none hover:text-foreground data-[state=active]:text-foreground after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full data-[state=active]:after:bg-foreground group-data-[measured]/tabs:data-[state=active]:after:bg-transparent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] data-[state=active]:[&_ng-icon]:[--ng-icon__color:var(--primary)] ${ɵFOCUS}`,
  vertical: `relative flex items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors motion-reduce:transition-none hover:text-foreground data-[state=active]:text-foreground after:pointer-events-none after:absolute after:inset-y-1 after:-left-px after:w-0.5 after:rounded-full data-[state=active]:after:bg-foreground group-data-[measured]/tabs:data-[state=active]:after:bg-transparent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] data-[state=active]:[&_ng-icon]:[--ng-icon__color:var(--primary)] ${ɵFOCUS_INSET}`,
};

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
const COUNTS: Record<CwTabsLayout, string> = {
  segmented: 'text-xs tabular-nums text-muted-foreground',
  bar: 'rounded-full bg-secondary px-1.5 text-xs leading-5 font-medium tabular-nums text-muted-foreground',
  vertical:
    'ml-auto rounded-full bg-secondary px-1.5 text-xs leading-5 font-medium tabular-nums text-muted-foreground',
};

/** `undefined`, `null` and the empty string leave the input unset; anything else is a number. */
function optionalNumber(value: unknown): number | undefined {
  return value === undefined || value === null || value === '' ? undefined : numberAttribute(value);
}

/** `undefined` and `null` leave the input unset; anything else is a boolean attribute. */
function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined || value === null ? undefined : booleanAttribute(value);
}

/**
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
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native focus and link behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
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
  /** Identifies the tab in the set's value and links it to the panel of the same value. */
  readonly value = input.required<string>();
  /** Disables the tab; the arrow keys skip it. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Counter shown after the label (« Sous-tâches 5 »); none when unset. */
  readonly count = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Active state given by the consumer (a router link's), over the value comparison; unset by default. */
  readonly active = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  /** @internal The tab set this tab belongs to. */
  readonly root = inject(CwTabs);
  protected readonly list = inject(CwTabsList);

  /** @internal The host element, measured by the list for its indicator. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** @internal Whether the tab is a link (`a[cwTab]`). */
  readonly isLink = this.element.tagName === 'A';
  /** @internal The id the panel's `aria-labelledby` points to. */
  readonly id = inject(_IdGenerator).getId('cw-tab-');

  // A button without a type would submit its form by accident.
  protected readonly type = inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  /** Whether this tab is the active one; read it to swap the icon for its Fill glyph. */
  readonly isActive = computed(() => this.active() ?? this.root.selected() === this.value());

  /** @internal The option the list's `FocusKeyManager` moves through; one per tab, never replaced. */
  readonly keyOption: FocusableOption = optionOf(this);

  protected readonly controls = computed(() => {
    if (this.isLink) return null;
    const value = this.value();
    return this.root.panels().find((panel) => panel.value() === value)?.id ?? null;
  });

  protected readonly classes = computed(() => {
    const layout = this.root.layout();
    return `${BASES[layout]} ${SIZES[layout][this.root.size()]}`;
  });
  protected readonly countClasses = computed(() => COUNTS[this.root.layout()]);

  constructor() {
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

  /** Moves the focus to this tab. */
  focus(options?: FocusOptions): void {
    this.element.focus(options);
  }

  /** @internal Activates the tab reached by an arrow key: a link is followed, a button selected. */
  activate(): void {
    if (this.isLink) this.element.click();
    else this.root.select(this.value());
  }
}

/* The tab's signal input `disabled` cannot be the `disabled: boolean` the CDK key manager reads, so
   the manager moves through one plain option per tab that reads the tab's state when asked. */
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
