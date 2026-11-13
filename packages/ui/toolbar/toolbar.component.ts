import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import {
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterEveryRender,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ɵnavigateList } from '@cadenway/ui/core';

import { CwToolbarGroup } from './toolbar-group/toolbar-group.component';
import { CwToolbarOverflow } from './toolbar-overflow/toolbar-overflow.component';
import { CwToolbarSeparator } from './toolbar-separator/toolbar-separator.component';
import {
  CW_TOOLBAR,
  CW_TOOLBAR_ITEM,
  type ToolbarHandle,
  type ToolbarItemHandle,
} from './toolbar.token';
import type { CwToolbarSize } from './toolbar.types';

/* Literal class strings (Toolbar sheet and preview of the Design System artifact): no background,
   no border, no shadow; 8 px between controls (`sm`: 6 px). `w-full min-w-0`: the bar takes the
   width of its container, never its content's, which is how the overflow measure sees that
   something does not fit. */
const SIZES: Record<CwToolbarSize, string> = {
  default: 'flex w-full min-w-0 items-center gap-2',
  sm: 'flex w-full min-w-0 items-center gap-1.5',
};

function isHidden(element: Element | null): boolean {
  return element instanceof HTMLElement && element.style.display === 'none';
}

function inDocumentOrder(a: ToolbarItemHandle, b: ToolbarItemHandle): number {
  return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/**
 * The row of controls above a view: filters, sort, grouping, view switch, search and the primary
 * action, all of one height (Toolbar sheet of the Design System artifact).
 *
 * Holds `cw-toolbar-group`, `cw-toolbar-separator`, `cw-toolbar-spacer`, controls marked
 * `[cwToolbarItem]`, other controls (a `cw-toggle-group` view switch, a search `input[cwInput]`)
 * and an optional `cw-toolbar-overflow`. Renders `role="toolbar"` named by `ariaLabel`, with
 * `aria-orientation="horizontal"`.
 *
 * Keyboard: the `[cwToolbarItem]` controls share one Tab stop, the last one focused (roving
 * `tabindex`, CDK `FocusKeyManager`); ← → move between them in a loop, Home and End go to the
 * ends, disabled ones are skipped. Other controls keep their own Tab stop and their own keys (the
 * search field keeps its arrows for the caret, the toggle group its own arrows).
 *
 * Overflow: a `ResizeObserver` watches the width; when the controls do not fit, the
 * `[cwToolbarItem]` controls that are not `pinned` move one by one into the « Plus » menu, from the
 * last to the first, with no width animation. A separator before a hidden part and a group left
 * empty hide too. `data-overflowing` is set on the bar meanwhile, and `overflowChange` emits the
 * number of hidden controls each time it changes. `size` sets the gaps, the separators and the
 * « Plus » button; give the same size to the controls (`sm` buttons and input, `sm` toggles).
 */
@Component({
  selector: 'cw-toolbar',
  imports: [CwToolbarOverflow],
  providers: [{ provide: CW_TOOLBAR, useExisting: CwToolbar }],
  host: {
    role: 'toolbar',
    'aria-orientation': 'horizontal',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-size]': 'size()',
    '[attr.data-overflowing]': 'overflowCount() > 0 ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
  },
  templateUrl: './toolbar.component.html',
})
export class CwToolbar implements ToolbarHandle {
  /** Accessible name of the bar (« Vue Liste »). */
  readonly ariaLabel = input.required<string>();
  /** Common height: gaps and separators of the bar, size of the « Plus » button. */
  readonly size = input<CwToolbarSize>('default');
  /** Accessible name of the « Plus » button and of its menu. */
  readonly overflowLabel = input('Plus d’options');
  /** Emitted with the number of controls in the « Plus » menu each time it changes. */
  readonly overflowChange = output<number>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly directionality = inject(Directionality, { optional: true });

  private readonly contentItems = contentChildren(CW_TOOLBAR_ITEM, { descendants: true });
  private readonly groups = contentChildren(CwToolbarGroup, { descendants: true });
  private readonly separators = contentChildren(CwToolbarSeparator, { descendants: true });
  private readonly projectedOverflow = contentChildren(CwToolbarOverflow, { descendants: true });
  private readonly defaultOverflow = viewChild(CwToolbarOverflow);

  protected readonly needsDefaultOverflow = computed(() => this.projectedOverflow().length === 0);

  /** Every control of the arrow navigation, in the order of the bar. */
  private readonly items = computed(() => {
    const own = this.defaultOverflow();
    return [...this.contentItems(), ...(own ? [own] : [])].sort(inDocumentOrder);
  });

  private readonly hiddenItems = signal<readonly ToolbarItemHandle[]>([]);
  /** The controls in the « Plus » menu, in the order of the bar. Not public API. */
  readonly overflowItems = this.hiddenItems.asReadonly();
  protected readonly overflowCount = computed(() => this.hiddenItems().length);

  protected readonly classes = computed(() => SIZES[this.size()]);

  private readonly keyManager = new FocusKeyManager(this.items, this.injector).withWrap();
  private readonly tabStop = signal<ToolbarItemHandle | null>(null);
  private observer: ResizeObserver | null = null;
  private lastCount = 0;

  constructor() {
    // Roving tabindex: written after every render, so it wins over a `tabindex` set by the
    // controls' own bindings, and follows the controls that get disabled or hidden.
    afterEveryRender({
      write: () => {
        this.syncTabIndex();
      },
    });

    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view || typeof view.ResizeObserver !== 'function') return;
      this.observer = new view.ResizeObserver(() => {
        this.layout();
      });
      this.observer.observe(this.element);
    });

    // Controls added or removed: measure again once they are rendered.
    effect(() => {
      this.items();
      untracked(() => {
        afterNextRender(
          () => {
            if (this.observer) this.layout();
          },
          { injector: this.injector },
        );
      });
    });

    effect(() => {
      const count = this.overflowCount();
      if (count === this.lastCount) return;
      this.lastCount = count;
      untracked(() => {
        this.overflowChange.emit(count);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.observer?.disconnect();
      this.keyManager.destroy();
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const item = this.itemOf(event.target);
    if (!item) return;
    this.keyManager.updateActiveItem(item);
    if (ɵnavigateList(this.keyManager, event, 'horizontal', this.directionality?.value === 'rtl')) {
      event.preventDefault();
    }
  }

  protected onFocusIn(event: FocusEvent): void {
    const item = this.itemOf(event.target);
    if (!item) return;
    this.keyManager.updateActiveItem(item);
    this.tabStop.set(item);
    this.syncTabIndex();
  }

  private itemOf(target: EventTarget | null): ToolbarItemHandle | undefined {
    return this.items().find((item) => item.element === target);
  }

  private syncTabIndex(): void {
    const items = this.items();
    const current = this.tabStop();
    const stop =
      current && items.includes(current) && !current.disabled
        ? current
        : (items.find((item) => !item.disabled) ?? null);
    for (const item of items) item.element.tabIndex = item === stop ? 0 : -1;
  }

  /**
   * Shows every control, then hides the movable ones from the last while the content is wider
   * than the bar. Runs synchronously in the observer callback, before the browser paints.
   */
  private layout(): void {
    const items = this.items();
    const overflow = items.find((item) => item instanceof CwToolbarOverflow);
    for (const item of items) item.setOverflowed(false);
    this.syncContainers();

    const movable = items.filter((item) => !item.pinned).reverse();
    const hidden: ToolbarItemHandle[] = [];
    while (this.element.scrollWidth > this.element.clientWidth && hidden.length < movable.length) {
      const next = movable[hidden.length];
      next.setOverflowed(true);
      hidden.push(next);
      overflow?.setOverflowed(true);
      this.syncContainers();
    }
    this.hiddenItems.set(hidden.reverse());
    this.syncTabIndex();
  }

  /* Groups left without a visible control hide, then the separators right before a hidden part. */
  private syncContainers(): void {
    for (const group of this.groups()) {
      const children = Array.from(group.ɵelement.children);
      const empty = children.length > 0 && children.every((child) => isHidden(child));
      if (empty) group.ɵelement.style.setProperty('display', 'none');
      else group.ɵelement.style.removeProperty('display');
    }
    for (const separator of this.separators()) {
      if (isHidden(separator.ɵelement.nextElementSibling)) {
        separator.ɵelement.style.setProperty('display', 'none');
      } else {
        separator.ɵelement.style.removeProperty('display');
      }
    }
  }
}
