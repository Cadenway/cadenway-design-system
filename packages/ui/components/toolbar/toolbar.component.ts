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
  type InputSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
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
/**
 * Constant SIZES
 *
 * @description
 * Layout and gap classes for each toolbar size.
 *
 * @type {Record<CwToolbarSize, string>}
 */
const SIZES: Record<CwToolbarSize, string> = {
  default: 'flex w-full min-w-0 items-center gap-2',
  sm: 'flex w-full min-w-0 items-center gap-1.5',
};

/**
 * Function isHidden
 *
 * @description
 * Checks whether an element is hidden by an inline display style.
 *
 * @param {Element | null} element - Element to inspect, or null.
 *
 * @returns {boolean} Whether an inline style hides the element.
 */
function isHidden(element: Element | null): boolean {
  return element instanceof HTMLElement && element.style.display === 'none';
}

/**
 * Function inDocumentOrder
 *
 * @description
 * Orders toolbar controls by their position in the document.
 *
 * @param {ToolbarItemHandle} a - First toolbar control.
 * @param {ToolbarItemHandle} b - Second toolbar control.
 *
 * @returns {number} Ordering value based on document position.
 */
function inDocumentOrder(a: ToolbarItemHandle, b: ToolbarItemHandle): number {
  return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/**
 * Class CwToolbar
 * @class CwToolbar
 *
 * @description
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
  // #region Properties
  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the bar (« Vue Liste »).
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  /**
   * Property size
   * @readonly
   *
   * @description
   * Common height: gaps and separators of the bar, size of the « Plus » button.
   *
   * @type {InputSignal<CwToolbarSize>}
   */
  public readonly size: InputSignal<CwToolbarSize> = input<CwToolbarSize>('default');

  /**
   * Property overflowLabel
   * @readonly
   *
   * @description
   * Accessible name of the « Plus » button and of its menu.
   *
   * @type {InputSignal<string>}
   */
  public readonly overflowLabel: InputSignal<string> = input('Plus d’options');

  /**
   * Property overflowChange
   * @readonly
   *
   * @description
   * Emitted with the number of controls in the « Plus » menu each time it changes.
   *
   * @type {OutputEmitterRef<number>}
   */
  public readonly overflowChange: OutputEmitterRef<number> = output<number>();

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native toolbar element used for measurement.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to schedule layout after rendering.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document supplying the current browser view.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property directionality
   * @readonly
   *
   * @description
   * Optional writing direction for keyboard navigation.
   *
   * @type {Directionality | null}
   */
  private readonly directionality: Directionality | null = inject(Directionality, {
    optional: true,
  });

  /**
   * Property contentItems
   * @readonly
   *
   * @description
   * Projected toolbar controls.
   *
   * @type {Signal<readonly ToolbarItemHandle[]>}
   */
  private readonly contentItems: Signal<readonly ToolbarItemHandle[]> = contentChildren(
    CW_TOOLBAR_ITEM,
    { descendants: true },
  );

  /**
   * Property groups
   * @readonly
   *
   * @description
   * Projected toolbar groups.
   *
   * @type {Signal<readonly CwToolbarGroup[]>}
   */
  private readonly groups: Signal<readonly CwToolbarGroup[]> = contentChildren(CwToolbarGroup, {
    descendants: true,
  });

  /**
   * Property separators
   * @readonly
   *
   * @description
   * Projected toolbar separators.
   *
   * @type {Signal<readonly CwToolbarSeparator[]>}
   */
  private readonly separators: Signal<readonly CwToolbarSeparator[]> = contentChildren(
    CwToolbarSeparator,
    { descendants: true },
  );

  /**
   * Property projectedOverflow
   * @readonly
   *
   * @description
   * Overflow controls supplied by the consumer.
   *
   * @type {Signal<readonly CwToolbarOverflow[]>}
   */
  private readonly projectedOverflow: Signal<readonly CwToolbarOverflow[]> = contentChildren(
    CwToolbarOverflow,
    { descendants: true },
  );

  /**
   * Property defaultOverflow
   * @readonly
   *
   * @description
   * Default overflow control rendered when none is projected.
   *
   * @type {Signal<CwToolbarOverflow | undefined>}
   */
  private readonly defaultOverflow: Signal<CwToolbarOverflow | undefined> =
    viewChild(CwToolbarOverflow);

  /**
   * Property needsDefaultOverflow
   * @readonly
   *
   * @description
   * Whether a default overflow control is needed.
   *
   * @type {Signal<boolean>}
   */
  protected readonly needsDefaultOverflow: Signal<boolean> = computed(
    () => this.projectedOverflow().length === 0,
  );

  /**
   * Property items
   * @readonly
   *
   * @description
   * Navigable controls in document order.
   *
   * @type {Signal<ToolbarItemHandle[]>}
   */
  private readonly items: Signal<ToolbarItemHandle[]> = computed(() => {
    const own: CwToolbarOverflow | undefined = this.defaultOverflow();
    return [...this.contentItems(), ...(own ? [own] : [])].sort(inDocumentOrder);
  });

  /**
   * Property hiddenItems
   * @readonly
   *
   * @description
   * Controls currently moved into the overflow menu.
   *
   * @type {WritableSignal<readonly ToolbarItemHandle[]>}
   */
  private readonly hiddenItems: WritableSignal<readonly ToolbarItemHandle[]> = signal<
    readonly ToolbarItemHandle[]
  >([]);

  /**
   * Property overflowItems
   * @readonly
   *
   * @description
   * Overflow controls exposed to the menu in toolbar order.
   *
   * @type {Signal<readonly ToolbarItemHandle[]>}
   */
  public readonly overflowItems: Signal<readonly ToolbarItemHandle[]> =
    this.hiddenItems.asReadonly();

  /**
   * Property overflowCount
   * @readonly
   *
   * @description
   * Number of overflowed controls.
   *
   * @type {Signal<number>}
   */
  protected readonly overflowCount: Signal<number> = computed(() => this.hiddenItems().length);

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Toolbar layout classes for the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => SIZES[this.size()]);

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard manager for toolbar controls.
   *
   * @type {FocusKeyManager<ToolbarItemHandle>}
   */
  private readonly keyManager: FocusKeyManager<ToolbarItemHandle> =
    new FocusKeyManager<ToolbarItemHandle>(this.items, this.injector).withWrap();

  /**
   * Property tabStop
   * @readonly
   *
   * @description
   * Last focused control for the roving tab stop.
   *
   * @type {WritableSignal<ToolbarItemHandle | null>}
   */
  private readonly tabStop: WritableSignal<ToolbarItemHandle | null> =
    signal<ToolbarItemHandle | null>(null);

  /**
   * Property observer
   *
   * @description
   * Observer that triggers overflow measurement.
   *
   * @type {ResizeObserver | null}
   */
  private observer: ResizeObserver | null = null;

  /**
   * Property lastCount
   *
   * @description
   * Previously emitted overflow count.
   *
   * @type {number}
   */
  private lastCount: number = 0;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Installs focus synchronization, resize observation and overflow updates.
   */
  public constructor() {
    // Roving tabindex: written after every render, so it wins over a `tabindex` set by the
    // controls' own bindings, and follows the controls that get disabled or hidden.
    afterEveryRender({
      write: () => {
        this.syncTabIndex();
      },
    });

    afterNextRender(() => {
      const view: (Window & typeof globalThis) | null = this.document.defaultView;
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
      const count: number = this.overflowCount();
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
  // #endregion

  // #region Methods
  /**
   * Method onKeydown
   * @method onKeydown
   *
   * @description
   * Handles arrow navigation among toolbar controls.
   *
   * @param {KeyboardEvent} event - Keyboard event from the toolbar.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const item: ToolbarItemHandle | undefined = this.itemOf(event.target);
    if (!item) return;
    this.keyManager.updateActiveItem(item);
    if (ɵnavigateList(this.keyManager, event, 'horizontal', this.directionality?.value === 'rtl')) {
      event.preventDefault();
    }
  }

  /**
   * Method onFocusIn
   * @method onFocusIn
   *
   * @description
   * Updates the roving tab stop when a control receives focus.
   *
   * @param {FocusEvent} event - Focus event from a toolbar control.
   */
  protected onFocusIn(event: FocusEvent): void {
    const item: ToolbarItemHandle | undefined = this.itemOf(event.target);
    if (!item) return;
    this.keyManager.updateActiveItem(item);
    this.tabStop.set(item);
    this.syncTabIndex();
  }

  /**
   * Method itemOf
   * @method itemOf
   *
   * @description
   * Finds the toolbar control associated with an event target.
   *
   * @param {EventTarget | null} target - Event target to match against toolbar controls.
   *
   * @returns {ToolbarItemHandle | undefined} Matching control, or undefined when none matches.
   */
  private itemOf(target: EventTarget | null): ToolbarItemHandle | undefined {
    return this.items().find((item) => item.element === target);
  }

  /**
   * Method syncTabIndex
   * @method syncTabIndex
   *
   * @description
   * Maintains a single enabled tab stop among toolbar controls.
   */
  private syncTabIndex(): void {
    const items: ToolbarItemHandle[] = this.items();
    const current: ToolbarItemHandle | null = this.tabStop();
    const stop: ToolbarItemHandle | null =
      current && items.includes(current) && !current.disabled
        ? current
        : (items.find((item) => !item.disabled) ?? null);
    for (const item of items) item.element.tabIndex = item === stop ? 0 : -1;
  }

  /**
   * Method layout
   * @method layout
   *
   * @description
   * Measures the toolbar and moves excess controls into overflow.
   */
  private layout(): void {
    const items: ToolbarItemHandle[] = this.items();
    const overflow: CwToolbarOverflow | undefined = items.find(
      (item) => item instanceof CwToolbarOverflow,
    );
    for (const item of items) item.setOverflowed(false);
    this.syncContainers();

    const movable: ToolbarItemHandle[] = items.filter((item) => !item.pinned).reverse();
    const hidden: ToolbarItemHandle[] = [];
    while (this.element.scrollWidth > this.element.clientWidth && hidden.length < movable.length) {
      const next: ToolbarItemHandle = movable[hidden.length];
      next.setOverflowed(true);
      hidden.push(next);
      overflow?.setOverflowed(true);
      this.syncContainers();
    }
    this.hiddenItems.set(hidden.reverse());
    this.syncTabIndex();
  }

  /**
   * Method syncContainers
   * @method syncContainers
   *
   * @description
   * Hides empty groups and separators before overflowed controls.
   */
  private syncContainers(): void {
    for (const group of this.groups()) {
      const children: Element[] = Array.from(group.ɵelement.children);
      const empty: boolean = children.length > 0 && children.every((child) => isHidden(child));
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
  // #endregion
}
