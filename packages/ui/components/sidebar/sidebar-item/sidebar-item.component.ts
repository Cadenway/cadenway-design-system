import {
  Component,
  ElementRef,
  afterEveryRender,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
  type InputSignalWithTransform,
  type InputSignal,
  type WritableSignal,
  type Signal,
} from '@angular/core';
import { ɵFOCUS, ɵFOCUS_INSET } from '@cadenway/ui/core';
import { CwTooltip } from '@cadenway/ui/components/tooltip';
import { NgIcon } from '@ng-icons/core';

import { SIDEBAR_ITEM } from '../sidebar-item.token';
import { SIDEBAR_SPACE } from '../sidebar-space.token';
import type { CwSidebarSpace } from '../sidebar-space/sidebar-space.component';
import { CwSidebar } from '../sidebar.component';

/* Literal class strings (Sidebar sheet and preview of the Design System artifact): a row of the
   sidebar with the inset focus ring; current is `bg-selected` and `font-medium`, never a color. */
/**
 * Constant ROW
 *
 * @description
 * Base classes for a sidebar link row.
 *
 * @type {string}
 */
const ROW: string =
  'relative isolate flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm transition-colors hover:bg-accent ' +
  'data-[active=true]:bg-selected data-[active=true]:font-medium [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  ɵFOCUS_INSET;

// Main items are 32 px; the lists of a space, 28 px.
/**
 * Constant ROW_HEIGHTS
 *
 * @description
 * Row heights for primary and nested links.
 *
 * @type {{ readonly item: "h-8"; readonly subitem: "h-7"; }}
 */
const ROW_HEIGHTS: { readonly item: 'h-8'; readonly subitem: 'h-7' } = {
  item: 'h-8',
  subitem: 'h-7',
} as const;

/* The rail's 32 px icon buttons stand alone, so they take the offset focus ring. */
/**
 * Constant RAIL
 *
 * @description
 * Classes for an icon-only sidebar link.
 *
 * @type {string}
 */
const RAIL: string =
  'relative isolate flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md transition-colors hover:bg-accent ' +
  'data-[active=true]:bg-selected [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  ɵFOCUS;

/**
 * Function filled
 *
 * @description
 * Phosphor names its two weights `…Bold` and `…Fill`: the current item shows the filled one.
 *
 * @param {string} icon - Bold icon name to convert when applicable.
 * @returns {string} Fill icon name, or the original name when it has no Bold suffix.
 */
function filled(icon: string): string {
  return icon.endsWith('Bold') ? `${icon.slice(0, -'Bold'.length)}Fill` : icon;
}

/**
 * Component CwSidebarItem
 *
 * @description
 * A link of the sidebar: icon, label, count (Sidebar sheet of the Design System artifact). Put it on an `<a>` inside a `cw-sidebar-group` or a `cw-sidebar-space` (where it is a 28 px sub-item); the label is its content. `icon` is an ng-icons name of the Bold weight; the current item shows the Fill weight in `text-primary`: register both (`provideIcons`). `count` is shown muted on the right (open tasks, unread) and read after the label as `countLabel` (« 3 non lus »), or as the number. `active` marks the current page: `data-active="true"`, `aria-current="page"`, `bg-selected` and `font-medium`; bind it to the router (`routerLinkActive`), which `@cadenway/ui` does not depend on. In the icon rail the item is a 32 px icon button named by its label and count, with a tooltip on the right (`tooltip`, by default the label and the count) on hover and keyboard focus; the count becomes a dot. Following the link closes the phone drawer.
 */
@Component({
  selector: 'a[cwSidebarItem]',
  imports: [NgIcon, CwTooltip],
  providers: [{ provide: SIDEBAR_ITEM, useExisting: forwardRef(() => CwSidebarItem) }],
  host: {
    '[class]': 'classes()',
    '[attr.data-active]': 'active() ? "true" : null',
    '[attr.aria-current]': 'active() ? "page" : null',
    '[attr.aria-label]': 'railName()',
    '(click)': 'sidebar.itemActivated()',
    '(focus)': 'forwardFocus("focus")',
    '(blur)': 'forwardFocus("blur")',
  },
  templateUrl: './sidebar-item.component.html',
})
export class CwSidebarItem {
  // #region Properties
  /**
   * Property icon
   *
   * @description
   * Name of the Bold icon (`phosphorTrayBold`); the Fill weight shows when current.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly icon: InputSignal<string | undefined> = input<string>();

  /**
   * Property count
   *
   * @description
   * Number shown on the right; nothing when absent.
   *
   * @type {InputSignal<number | null | undefined>}
   * @readonly
   */
  public readonly count: InputSignal<number | null | undefined> = input<number | null | undefined>(
    undefined,
  );

  /**
   * Property countLabel
   *
   * @description
   * Spoken form of the count, read after the label (« 3 non lus »); the number by default.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly countLabel: InputSignal<string | undefined> = input<string>();

  /**
   * Property tooltip
   *
   * @description
   * Text of the rail's tooltip; the label and the count by default (« Boîte de réception · 3 »).
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly tooltip: InputSignal<string | undefined> = input<string>();

  /**
   * Property active
   *
   * @description
   * Whether the link leads to the current page.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly active: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property sidebar
   *
   * @description
   * Containing sidebar providing the current layout.
   *
   * @type {CwSidebar}
   * @readonly
   */
  protected readonly sidebar: CwSidebar = inject(CwSidebar);

  /**
   * Property space
   *
   * @description
   * Containing space, or null for a primary link.
   *
   * @type {CwSidebarSpace | null}
   * @readonly
   */
  private readonly space: CwSidebarSpace | null = inject(SIDEBAR_SPACE, { optional: true });

  /**
   * Property tip
   *
   * @description
   * Tooltip layer used to forward focus in the icon rail.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly tip: Signal<ElementRef<HTMLElement>> = viewChild.required<
    string,
    ElementRef<HTMLElement>
  >('tip', {
    read: ElementRef,
  });

  /**
   * Property labelElement
   *
   * @description
   * Projected label element read after rendering.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly labelElement: Signal<ElementRef<HTMLElement>> = viewChild.required<
    string,
    ElementRef<HTMLElement>
  >('label', {
    read: ElementRef,
  });

  /**
   * Property label
   *
   * @description
   * Projected link label used for the icon rail and tooltip.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  private readonly label: WritableSignal<string> = signal('');

  /**
   * Property rail
   *
   * @description
   * Whether the sidebar currently displays its icon rail.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly rail: Signal<boolean> = computed(() => this.sidebar.rail());

  /**
   * Property hasCount
   *
   * @description
   * Whether a count was supplied.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasCount: Signal<boolean> = computed(() => {
    const count: number | null | undefined = this.count();
    return count !== null && count !== undefined;
  });

  /**
   * Property spokenCount
   *
   * @description
   * Accessible count label, falling back to the number.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly spokenCount: Signal<string> = computed(
    () => this.countLabel() ?? String(this.count()),
  );

  /**
   * Property iconName
   *
   * @description
   * Icon name for the active or inactive link.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly iconName: Signal<string | null> = computed(() => {
    const icon: string | undefined = this.icon();
    if (!icon) return null;
    return this.active() ? filled(icon) : icon;
  });

  /**
   * Property iconClasses
   *
   * @description
   * Icon color classes for the current link state.
   *
   * @type {Signal<"text-primary" | "text-muted-foreground">}
   * @readonly
   */
  protected readonly iconClasses: Signal<'text-primary' | 'text-muted-foreground'> = computed(() =>
    this.active() ? 'text-primary' : 'text-muted-foreground',
  );

  /**
   * Property tooltipText
   *
   * @description
   * Tooltip text from the supplied override or link label and count.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly tooltipText: Signal<string> = computed(() => {
    const tooltip: string | undefined = this.tooltip();
    if (tooltip !== undefined) return tooltip;
    return this.hasCount() ? `${this.label()} · ${String(this.count())}` : this.label();
  });

  /**
   * Property railName
   *
   * @description
   * Accessible rail name excluding the tooltip bubble inserted inside the link.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly railName: Signal<string | null> = computed(() => {
    if (!this.rail()) return null;
    return this.hasCount() ? `${this.label()}, ${this.spokenCount()}` : this.label();
  });

  /**
   * Property classes
   *
   * @description
   * Link classes for the current sidebar layout.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly classes: Signal<string> = computed(() => {
    if (this.rail()) return RAIL;
    return `${ROW} ${this.space ? ROW_HEIGHTS.subitem : ROW_HEIGHTS.item}`;
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Reads the projected link label after rendering.
   *
   * @constructor
   */
  public constructor() {
    afterEveryRender({
      read: () => {
        this.label.set(this.labelElement().nativeElement.textContent.trim());
      },
    });
  }
  // #endregion

  /*
   * The tooltip cannot sit on the link itself (a directive on a component's host cannot be bound
   * by that component), so it sits on a layer that covers the link and catches the pointer. Its
   * keyboard focus opening is the CDK FocusMonitor's: the link's focus and blur are replayed on the
   * layer, which the monitor attributes to the keyboard when a key moved the focus.
   */
  // #region Methods
  /**
   * Method forwardFocus
   *
   * @description
   * Forwards focus or blur to the tooltip layer in the icon rail.
   *
   * @param {'focus' | 'blur'} type - Focus event type to forward.
   */
  protected forwardFocus(type: 'focus' | 'blur'): void {
    if (this.rail()) this.tip().nativeElement.dispatchEvent(new FocusEvent(type));
  }
  // #endregion
}
