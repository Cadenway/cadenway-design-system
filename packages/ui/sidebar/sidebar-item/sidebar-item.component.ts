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
} from '@angular/core';
import { ɵFOCUS, ɵFOCUS_INSET } from '@cadenway/ui/core';
import { CwTooltip } from '@cadenway/ui/tooltip';
import { NgIcon } from '@ng-icons/core';

import { SIDEBAR_ITEM } from '../sidebar-item.token';
import { SIDEBAR_SPACE } from '../sidebar-space.token';
import { CwSidebar } from '../sidebar.component';

/* Literal class strings (Sidebar sheet and preview of the Design System artifact): a row of the
   sidebar with the inset focus ring; current is `bg-selected` and `font-medium`, never a color. */
const ROW =
  'relative isolate flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm transition-colors hover:bg-accent ' +
  'data-[active=true]:bg-selected data-[active=true]:font-medium [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  ɵFOCUS_INSET;

// Main items are 32 px; the lists of a space, 28 px.
const ROW_HEIGHTS = { item: 'h-8', subitem: 'h-7' } as const;

/* The rail's 32 px icon buttons stand alone, so they take the offset focus ring. */
const RAIL =
  'relative isolate flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md transition-colors hover:bg-accent ' +
  'data-[active=true]:bg-selected [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  ɵFOCUS;

/** Phosphor names its two weights `…Bold` and `…Fill`: the current item shows the filled one. */
function filled(icon: string): string {
  return icon.endsWith('Bold') ? `${icon.slice(0, -'Bold'.length)}Fill` : icon;
}

/**
 * A link of the sidebar: icon, label, count (Sidebar sheet of the Design System artifact).
 *
 * Put it on an `<a>` inside a `cw-sidebar-group` or a `cw-sidebar-space` (where it is a 28 px
 * sub-item); the label is its content. `icon` is an ng-icons name of the Bold weight; the current
 * item shows the Fill weight in `text-primary`: register both (`provideIcons`). `count` is shown
 * muted on the right (open tasks, unread) and read after the label as `countLabel` (« 3 non
 * lus »), or as the number. `active` marks the current page: `data-active="true"`,
 * `aria-current="page"`, `bg-selected` and `font-medium`; bind it to the router
 * (`routerLinkActive`), which `@cadenway/ui` does not depend on. In the icon rail the item is a
 * 32 px icon button named by its label and count, with a tooltip on the right (`tooltip`, by
 * default the label and the count) on hover and keyboard focus; the count becomes a dot. Following
 * the link closes the phone drawer.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the link keeps its
  // native role, focus and navigation. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
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
  /** Name of the Bold icon (`phosphorTrayBold`); the Fill weight shows when current. */
  readonly icon = input<string>();
  /** Number shown on the right; nothing when absent. */
  readonly count = input<number | null | undefined>(undefined);
  /** Spoken form of the count, read after the label (« 3 non lus »); the number by default. */
  readonly countLabel = input<string>();
  /** Text of the rail's tooltip; the label and the count by default (« Boîte de réception · 3 »). */
  readonly tooltip = input<string>();
  /** Whether the link leads to the current page. */
  readonly active = input(false, { transform: booleanAttribute });

  protected readonly sidebar = inject(CwSidebar);
  private readonly space = inject(SIDEBAR_SPACE, { optional: true });
  private readonly tip = viewChild.required<string, ElementRef<HTMLElement>>('tip', {
    read: ElementRef,
  });
  private readonly labelElement = viewChild.required<string, ElementRef<HTMLElement>>('label', {
    read: ElementRef,
  });
  // The projected label, read after each render: the rail names the icon and its tooltip with it.
  private readonly label = signal('');

  protected readonly rail = computed(() => this.sidebar.rail());
  protected readonly hasCount = computed(() => {
    const count = this.count();
    return count !== null && count !== undefined;
  });
  protected readonly spokenCount = computed(() => this.countLabel() ?? String(this.count()));
  protected readonly iconName = computed(() => {
    const icon = this.icon();
    if (!icon) return null;
    return this.active() ? filled(icon) : icon;
  });
  protected readonly iconClasses = computed(() =>
    this.active() ? 'text-primary' : 'text-muted-foreground',
  );
  protected readonly tooltipText = computed(() => {
    const tooltip = this.tooltip();
    if (tooltip !== undefined) return tooltip;
    return this.hasCount() ? `${this.label()} · ${String(this.count())}` : this.label();
  });
  /* The rail's name comes from `aria-label`, not from the content: the tooltip's bubble is inserted
     inside the link and must not join its name. */
  protected readonly railName = computed(() => {
    if (!this.rail()) return null;
    return this.hasCount() ? `${this.label()}, ${this.spokenCount()}` : this.label();
  });
  protected readonly classes = computed(() => {
    if (this.rail()) return RAIL;
    return `${ROW} ${this.space ? ROW_HEIGHTS.subitem : ROW_HEIGHTS.item}`;
  });

  constructor() {
    afterEveryRender({
      read: () => {
        this.label.set(this.labelElement().nativeElement.textContent.trim());
      },
    });
  }

  /*
   * The tooltip cannot sit on the link itself (a directive on a component's host cannot be bound
   * by that component), so it sits on a layer that covers the link and catches the pointer. Its
   * keyboard focus opening is the CDK FocusMonitor's: the link's focus and blur are replayed on the
   * layer, which the monitor attributes to the keyboard when a key moved the focus.
   */
  protected forwardFocus(type: 'focus' | 'blur'): void {
    if (this.rail()) this.tip().nativeElement.dispatchEvent(new FocusEvent(type));
  }
}
