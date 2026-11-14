import { type FocusTrap, FocusTrapFactory, _IdGenerator } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import {
  type OverlayRef,
  type ConnectedPosition,
  type FlexibleConnectedPositionStrategy,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  Injector,
  input,
  model,
  numberAttribute,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef,
  type EmbeddedViewRef,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {
  ɵafterExitAnimation,
  ɵmenuFrom,
  ɵPanelStack,
  ɵpanelPositions,
  ɵplacementOf,
  ɵprefersReducedMotion,
  type ɵPlacement,
  type ɵStackedPanel,
} from '@cadenway/ui/core';
import type { Subscription } from 'rxjs';

import { CwPopoverArrow } from './popover-arrow/popover-arrow.component';
import type { CwPopoverAlign, CwPopoverSide, CwPopoverSize } from './popover.types';

/* Literal class strings (Popover sheet and preview of the Design System artifact). The panel reveals
   from the trigger corner (`animate-menu-in` through `--menu-from`) and closes with
   `animate-menu-out`. */
/**
 * Constant PANEL
 *
 * @description
 * Base classes for the popover panel.
 *
 * @type {string}
 */
const PANEL: string =
  'relative block rounded-lg border bg-popover text-popover-foreground shadow-md outline-hidden animate-menu-in motion-reduce:animate-none data-[state=closed]:animate-menu-out';

/**
 * Constant WIDTHS
 *
 * @description
 * Panel width classes by size.
 *
 * @type {Record<CwPopoverSize, string>}
 */
const WIDTHS: Record<CwPopoverSize, string> = {
  sm: 'w-56',
  default: 'w-72',
  lg: 'w-80',
};

// The content scrolls inside the panel, so the arrow (outside the panel's box) is never clipped.
// Height limited to 400 px (beyond, the sheet asks for a Dialog), never below 96 px.
/**
 * Constant CONTENT
 *
 * @description
 * Scrollable content classes.
 *
 * @type {string}
 */
const CONTENT: string = 'grid max-h-[max(96px,min(400px,calc(100dvh-32px)))] gap-3 overflow-y-auto';

/**
 * Constant PADDINGS
 *
 * @description
 * Content padding classes by size.
 *
 * @type {Record<CwPopoverSize, string>}
 */
const PADDINGS: Record<CwPopoverSize, string> = {
  sm: 'p-3',
  default: 'p-4',
  lg: 'p-4',
};

/**
 * Constant ARROW_GAP
 *
 * @description
 * Additional spacing for the arrow.
 *
 * @type {number}
 */
const ARROW_GAP: number = 2;

/**
 * Constant VIEWPORT_MARGIN
 *
 * @description
 * Minimum distance from viewport edges.
 *
 * @type {number}
 */
const VIEWPORT_MARGIN: number = 8;

/**
 * Component CwPopover
 *
 * @description
 * A non-modal floating panel anchored to a trigger: a setting, a share, a small form without leaving
 * the view (Popover sheet of the Design System artifact).
 *
 * Open it with a `[cwPopoverTrigger]` pointing to it, or through the `open` model. The projected
 * content renders in a CDK overlay as a `role="dialog"` panel, on `side` with `align`, flipped and
 * shifted to stay on screen; name it with `ariaLabel` or `ariaLabelledby`. On opening, the focus
 * moves to the `[cdkFocusInitial]` element, else to the first focusable one, else to the panel. It
 * closes on Escape, on an outside click (`closeOnOutsideClick`), on a new click of the trigger, on
 * a `button[cwPopoverClose]`, and when the focus tabs out of it; the focus returns to the trigger
 * unless the user moved it elsewhere. `modal` traps the focus and blocks the page behind a
 * transparent backdrop. The `cw-popover` element itself renders nothing in place.
 */
@Component({
  selector: 'cw-popover',
  imports: [CwPopoverArrow],
  host: { class: 'hidden' },
  templateUrl: './popover.component.html',
})
export class CwPopover {
  // #region Properties
  /**
   * Property open
   * @readonly
   *
   * @description
   * Whether the panel is open.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly open: ModelSignal<boolean> = model(false);

  /**
   * Property side
   * @readonly
   *
   * @description
   * Preferred side of the trigger.
   *
   * @type {InputSignal<CwPopoverSide>}
   */
  public readonly side: InputSignal<CwPopoverSide> = input<CwPopoverSide>('bottom');

  /**
   * Property align
   * @readonly
   *
   * @description
   * Preferred alignment along the side.
   *
   * @type {InputSignal<CwPopoverAlign>}
   */
  public readonly align: InputSignal<CwPopoverAlign> = input<CwPopoverAlign>('center');

  /**
   * Property sideOffset
   * @readonly
   *
   * @description
   * Gap between panel and trigger.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly sideOffset: InputSignalWithTransform<number, unknown> = input(8, {
    transform: numberAttribute,
  });

  /**
   * Property arrow
   * @readonly
   *
   * @description
   * Whether to draw the arrow.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly arrow: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property modal
   * @readonly
   *
   * @description
   * Whether focus is trapped and the page is blocked.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly modal: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property closeOnOutsideClick
   * @readonly
   *
   * @description
   * Whether an outside click closes the panel.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly closeOnOutsideClick: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property size
   * @readonly
   *
   * @description
   * Panel width.
   *
   * @type {InputSignal<CwPopoverSize>}
   */
  public readonly size: InputSignal<CwPopoverSize> = input<CwPopoverSize>('default');

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Optional accessible name.
   *
   * @type {InputSignal<string | undefined>}
   */
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /**
   * Property ariaLabelledby
   * @readonly
   *
   * @description
   * Identifier of the visible title.
   *
   * @type {InputSignal<string | undefined>}
   */
  public readonly ariaLabelledby: InputSignal<string | undefined> = input<string | undefined>(
    undefined,
  );

  /**
   * Property panelId
   * @readonly
   *
   * @description
   * Identifier referenced by the trigger.
   *
   * @type {string}
   */
  public readonly panelId: string = inject(_IdGenerator).getId('cw-popover-');

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to create the overlay.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document used for focus and motion preferences.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property viewContainerRef
   * @readonly
   *
   * @description
   * Container used to attach the panel.
   *
   * @type {ViewContainerRef}
   */
  private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  /**
   * Property focusTrapFactory
   * @readonly
   *
   * @description
   * Factory for focus trapping and initial focus.
   *
   * @type {FocusTrapFactory}
   */
  private readonly focusTrapFactory: FocusTrapFactory = inject(FocusTrapFactory);

  /**
   * Property stack
   * @readonly
   *
   * @description
   * Shared stack of floating panels.
   *
   * @type {ɵPanelStack}
   */
  private readonly stack: ɵPanelStack = inject(ɵPanelStack);

  /**
   * Property stacked
   * @readonly
   *
   * @description
   * Panel adapter registered with the stack; nested panels do not close their parent.
   *
   * @type {ɵStackedPanel}
   */
  private readonly stacked: ɵStackedPanel = {
    close: () => {
      this.open.set(false);
    },
    contains: (node) => this.panel?.contains(node) ?? false,
  };

  /**
   * Property template
   * @readonly
   *
   * @description
   * Template attached to the overlay.
   *
   * @type {Signal<TemplateRef<unknown>>}
   */
  private readonly template: Signal<TemplateRef<unknown>> =
    viewChild.required<TemplateRef<unknown>>('panel');

  /**
   * Property origin
   * @readonly
   *
   * @description
   * Current registered trigger.
   *
   * @type {WritableSignal<HTMLElement | null>}
   */
  private readonly origin: WritableSignal<HTMLElement | null> = signal<HTMLElement | null>(null);

  /**
   * Property state
   * @readonly
   *
   * @description
   * Panel animation state.
   *
   * @type {WritableSignal<'open' | 'closed'>}
   */
  protected readonly state: WritableSignal<'open' | 'closed'> = signal<'open' | 'closed'>('closed');

  /**
   * Property placement
   * @readonly
   *
   * @description
   * Actual side and alignment.
   *
   * @type {WritableSignal<ɵPlacement>}
   */
  protected readonly placement: WritableSignal<ɵPlacement> = signal<ɵPlacement>({
    side: 'bottom',
    align: 'center',
  });

  /**
   * Property menuFrom
   * @readonly
   *
   * @description
   * Animation origin for the current placement.
   *
   * @type {WritableSignal<string | null>}
   */
  protected readonly menuFrom: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property panelClasses
   * @readonly
   *
   * @description
   * Panel classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly panelClasses: Signal<string> = computed(
    () => `${PANEL} ${WIDTHS[this.size()]}`,
  );

  /**
   * Property contentClasses
   * @readonly
   *
   * @description
   * Content classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly contentClasses: Signal<string> = computed(
    () => `${CONTENT} ${PADDINGS[this.size()]}`,
  );

  /**
   * Property overlayRef
   *
   * @description
   * Overlay hosting the panel.
   *
   * @type {OverlayRef | null}
   */
  private overlayRef: OverlayRef | null = null;

  /**
   * Property anchor
   *
   * @description
   * Element anchoring the active overlay.
   *
   * @type {HTMLElement | null}
   */
  private anchor: HTMLElement | null = null;

  /**
   * Property panel
   *
   * @description
   * Rendered panel element.
   *
   * @type {HTMLElement | null}
   */
  private panel: HTMLElement | null = null;

  /**
   * Property focusTrap
   *
   * @description
   * Focus trap used in modal mode.
   *
   * @type {FocusTrap | null}
   */
  private focusTrap: FocusTrap | null = null;

  /**
   * Property subscriptions
   *
   * @description
   * Overlay event subscriptions.
   *
   * @type {Subscription[]}
   */
  private subscriptions: Subscription[] = [];

  /**
   * Property stopClosing
   *
   * @description
   * Cancels a pending exit animation.
   *
   * @type {(() => void) | null}
   */
  private stopClosing: (() => void) | null = null;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Synchronizes the overlay with its open state and cleans it up.
   */
  public constructor() {
    effect(() => {
      const open: boolean = this.open();
      const origin: HTMLElement | null = this.origin();
      untracked(() => {
        if (open && origin) this.show(origin);
        else this.hide();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.stack.release(this.stacked);
      this.detach();
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method isOpenFrom
   *
   * @description
   * Reports whether the panel is open from the given trigger.
   *
   * @param {HTMLElement} element - Trigger to compare with the current anchor.
   *
   * @returns {boolean} Whether the panel is open from that trigger.
   */
  public isOpenFrom(element: HTMLElement): boolean {
    return this.open() && this.origin() === element;
  }

  /**
   * Method toggle
   *
   * @description
   * Toggles the panel from the given trigger.
   *
   * @param {HTMLElement} element - Trigger from which to open or close the panel.
   */
  public toggle(element: HTMLElement): void {
    if (this.isOpenFrom(element)) {
      this.open.set(false);
      return;
    }
    this.stack.open(this.stacked, element);
    this.origin.set(element);
    this.open.set(true);
  }

  /**
   * Method close
   *
   * @description
   * Closes the panel and restores focus when appropriate.
   */
  public close(): void {
    this.open.set(false);
  }

  /**
   * Method registerTrigger
   *
   * @description
   * Registers an anchor and returns a cleanup function.
   *
   * @param {HTMLElement} element - Trigger to register as a possible anchor.
   *
   * @returns {() => void} Cleanup function that unregisters the trigger and closes its panel when necessary.
   */
  public registerTrigger(element: HTMLElement): () => void {
    // Untracked: a trigger registers from its own effect, which must not rerun on every anchor
    // change.
    untracked(() => {
      if (this.origin() === null) this.origin.set(element);
    });
    return () => {
      untracked(() => {
        if (this.origin() !== element) return;
        this.origin.set(null);
        this.open.set(false);
      });
    };
  }

  /**
   * Method onFocusOut
   *
   * @description
   * Closes a non-modal panel when focus leaves.
   *
   * @param {FocusEvent} event - Focus event used to determine whether focus left the panel.
   */
  protected onFocusOut(event: FocusEvent): void {
    // Non-modal: tabbing out of the panel closes it. The trigger itself does not count (a click on
    // it toggles), nor a lost focus (an outside click handles it).
    if (this.modal() || this.state() === 'closed') return;
    const next: EventTarget | null = event.relatedTarget;
    if (!(next instanceof Node)) return;
    if (this.panel?.contains(next) || this.anchor?.contains(next)) return;
    this.open.set(false);
  }

  /**
   * Method show
   *
   * @description
   * Creates or reopens the panel overlay.
   *
   * @param {HTMLElement} origin - Trigger element anchoring the panel.
   */
  private show(origin: HTMLElement): void {
    if (this.overlayRef) {
      if (this.anchor === origin) {
        // Reopened while fading out: keep the panel.
        this.stopClosing?.();
        this.stopClosing = null;
        this.state.set('open');
        return;
      }
      this.detach();
    }

    const side: CwPopoverSide = this.side();
    const align: CwPopoverAlign = this.align();
    const positions: ConnectedPosition[] = ɵpanelPositions(
      side,
      align,
      this.sideOffset() + (this.arrow() ? ARROW_GAP : 0),
    );
    // `inline`: the panel's host is inserted next to the trigger (as a native popover in the top
    // layer), so it inherits the trigger's `data-theme` scope and follows it in the tab order.
    const strategy: FlexibleConnectedPositionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      origin,
    )
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(VIEWPORT_MARGIN)
      .withPopoverLocation('inline');
    const overlayRef: OverlayRef = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
      hasBackdrop: this.modal(),
      backdropClass: 'cdk-overlay-transparent-backdrop',
      disposeOnNavigation: true,
    });

    this.subscriptions = [
      strategy.positionChanges.subscribe((change) => {
        this.placement.set(ɵplacementOf(change.connectionPair));
        this.menuFrom.set(ɵmenuFrom(change.connectionPair));
      }),
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key !== 'Escape' || hasModifierKey(event) || this.state() === 'closed') return;
        event.preventDefault();
        this.open.set(false);
      }),
      overlayRef.outsidePointerEvents().subscribe((event) => {
        const target: EventTarget | null = event.target;
        if (target instanceof Node && origin.contains(target)) return;
        if (this.closeOnOutsideClick()) this.open.set(false);
      }),
      overlayRef.backdropClick().subscribe(() => {
        if (this.closeOnOutsideClick()) this.open.set(false);
      }),
    ];

    // The first frame reveals from the preferred corner, before the strategy reports its choice.
    this.placement.set({ side, align });
    this.menuFrom.set(ɵmenuFrom(positions[0]));
    this.state.set('open');
    this.overlayRef = overlayRef;
    this.anchor = origin;

    const view: EmbeddedViewRef<unknown> = overlayRef.attach(
      new TemplatePortal(this.template(), this.viewContainerRef),
    );
    view.detectChanges();
    this.panel =
      view.rootNodes.find((node): node is HTMLElement => node instanceof HTMLElement) ?? null;

    afterNextRender(
      () => {
        this.focusInitial();
      },
      { injector: this.injector },
    );
  }

  /**
   * Method focusInitial
   *
   * @description
   * Focuses the initial element and optionally traps focus.
   */
  private focusInitial(): void {
    const panel: HTMLElement | null = this.panel;
    if (!panel || this.state() === 'closed') return;
    // A non-modal panel only borrows the trap's search for the initial element: no Tab anchors.
    const trap: FocusTrap = this.focusTrapFactory.create(panel, !this.modal());
    if (!trap.focusInitialElement()) panel.focus();
    if (this.modal()) this.focusTrap = trap;
    else trap.destroy();
  }

  /**
   * Method hide
   *
   * @description
   * Closes the panel and restores focus.
   */
  private hide(): void {
    this.stack.release(this.stacked);
    const overlayRef: OverlayRef | null = this.overlayRef;
    if (!overlayRef || this.state() === 'closed') return;
    this.state.set('closed');
    this.restoreFocus();
    this.focusTrap?.destroy();
    this.focusTrap = null;

    if (ɵprefersReducedMotion(this.document)) {
      this.detach();
      return;
    }
    afterNextRender(
      () => {
        if (this.state() === 'closed' && this.overlayRef === overlayRef)
          this.detachAfterAnimation();
      },
      { injector: this.injector },
    );
  }

  /**
   * Method restoreFocus
   *
   * @description
   * Returns focus to the trigger when appropriate.
   */
  private restoreFocus(): void {
    const active: Element | null = this.document.activeElement;
    const lost: boolean = active === null || active === this.document.body;
    if (lost || (this.panel?.contains(active) ?? false)) this.anchor?.focus();
  }

  /**
   * Method detachAfterAnimation
   *
   * @description
   * Detaches the panel after its exit animation.
   */
  private detachAfterAnimation(): void {
    this.stopClosing = ɵafterExitAnimation(
      this.panel,
      () => {
        this.stopClosing = null;
        if (this.state() === 'closed') this.detach();
      },
      { endOnCancel: true },
    );
  }

  /**
   * Method detach
   *
   * @description
   * Disposes the overlay and its subscriptions.
   */
  private detach(): void {
    this.stopClosing?.();
    this.stopClosing = null;
    this.focusTrap?.destroy();
    this.focusTrap = null;
    for (const subscription of this.subscriptions) subscription.unsubscribe();
    this.subscriptions = [];
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.anchor = null;
    this.panel = null;
    this.state.set('closed');
  }
  // #endregion
}
