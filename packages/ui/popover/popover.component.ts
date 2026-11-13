import { type FocusTrap, FocusTrapFactory, _IdGenerator } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import {
  type OverlayRef,
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
const PANEL =
  'relative block rounded-lg border bg-popover text-popover-foreground shadow-md outline-hidden animate-menu-in motion-reduce:animate-none data-[state=closed]:animate-menu-out';

const WIDTHS: Record<CwPopoverSize, string> = {
  sm: 'w-56',
  default: 'w-72',
  lg: 'w-80',
};

// The content scrolls inside the panel, so the arrow (outside the panel's box) is never clipped.
// Height limited to 400 px (beyond, the sheet asks for a Dialog), never below 96 px.
const CONTENT = 'grid max-h-[max(96px,min(400px,calc(100dvh-32px)))] gap-3 overflow-y-auto';

const PADDINGS: Record<CwPopoverSize, string> = {
  sm: 'p-3',
  default: 'p-4',
  lg: 'p-4',
};

/** The arrow adds 2 px to the gap: 8 px without it, 10 px with it (sheet, "Côtés et alignements"). */
const ARROW_GAP = 2;

/** Keeps the panel 8 px away from the viewport edges when it is shifted to stay visible. */
const VIEWPORT_MARGIN = 8;

/**
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
  /** Whether the panel is open; two-way (`[(open)]`), `openChange` on every change. */
  readonly open = model(false);
  /** Side of the trigger. */
  readonly side = input<CwPopoverSide>('bottom');
  /** Alignment along the side; `start` under a labelled button. */
  readonly align = input<CwPopoverAlign>('center');
  /** Gap to the trigger in px; the arrow adds 2 px. */
  readonly sideOffset = input(8, { transform: numberAttribute });
  /** Draws the diamond pointing to the trigger. */
  readonly arrow = input(false, { transform: booleanAttribute });
  /** Traps the focus in the panel and blocks the rest of the page. */
  readonly modal = input(false, { transform: booleanAttribute });
  /** Whether a click outside the panel and its trigger closes it. */
  readonly closeOnOutsideClick = input(true, { transform: booleanAttribute });
  /** Width of the panel: 224, 288 or 320 px. */
  readonly size = input<CwPopoverSize>('default');
  /** Accessible name of the panel, when it has no visible title. */
  readonly ariaLabel = input<string | undefined>(undefined);
  /** Id of the visible title that names the panel. */
  readonly ariaLabelledby = input<string | undefined>(undefined);

  /** Id of the panel, referenced by the trigger's `aria-controls` while open. */
  readonly panelId = inject(_IdGenerator).getId('cw-popover-');

  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly focusTrapFactory = inject(FocusTrapFactory);
  private readonly stack = inject(ɵPanelStack);
  // This popover as the shared panel stack sees it: another panel opened by the user closes it,
  // unless that panel's trigger sits inside this one (a select in a popover form).
  private readonly stacked: ɵStackedPanel = {
    close: () => {
      this.open.set(false);
    },
    contains: (node) => this.panel?.contains(node) ?? false,
  };
  private readonly template = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly origin = signal<HTMLElement | null>(null);
  protected readonly state = signal<'open' | 'closed'>('closed');
  protected readonly placement = signal<ɵPlacement>({ side: 'bottom', align: 'center' });
  protected readonly menuFrom = signal<string | null>(null);

  protected readonly panelClasses = computed(() => `${PANEL} ${WIDTHS[this.size()]}`);
  protected readonly contentClasses = computed(() => `${CONTENT} ${PADDINGS[this.size()]}`);

  private overlayRef: OverlayRef | null = null;
  private anchor: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private focusTrap: FocusTrap | null = null;
  private subscriptions: Subscription[] = [];
  private stopClosing: (() => void) | null = null;

  constructor() {
    effect(() => {
      const open = this.open();
      const origin = this.origin();
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

  /** Whether the panel is open and anchored to `element`. */
  isOpenFrom(element: HTMLElement): boolean {
    return this.open() && this.origin() === element;
  }

  /**
   * Opens the panel from `element`, or closes it when it is already open from there. Called by
   * `[cwPopoverTrigger]` on click (Enter and Space included). Opening closes the other floating
   * panels the user opened (menus, selects, date pickers…), except those holding `element`.
   */
  toggle(element: HTMLElement): void {
    if (this.isOpenFrom(element)) {
      this.open.set(false);
      return;
    }
    this.stack.open(this.stacked, element);
    this.origin.set(element);
    this.open.set(true);
  }

  /** Closes the panel; the focus returns to the trigger when it was inside the panel. */
  close(): void {
    this.open.set(false);
  }

  /**
   * Makes `element` a possible anchor of the panel (the first one registered is the default one for
   * `[open]="true"`). Returns the function that unregisters it; unregistering the current anchor
   * closes the panel. Called by `[cwPopoverTrigger]`.
   */
  registerTrigger(element: HTMLElement): () => void {
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

  protected onFocusOut(event: FocusEvent): void {
    // Non-modal: tabbing out of the panel closes it. The trigger itself does not count (a click on
    // it toggles), nor a lost focus (an outside click handles it).
    if (this.modal() || this.state() === 'closed') return;
    const next = event.relatedTarget;
    if (!(next instanceof Node)) return;
    if (this.panel?.contains(next) || this.anchor?.contains(next)) return;
    this.open.set(false);
  }

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

    const side = this.side();
    const align = this.align();
    const positions = ɵpanelPositions(
      side,
      align,
      this.sideOffset() + (this.arrow() ? ARROW_GAP : 0),
    );
    // `inline`: the panel's host is inserted next to the trigger (as a native popover in the top
    // layer), so it inherits the trigger's `data-theme` scope and follows it in the tab order.
    const strategy = createFlexibleConnectedPositionStrategy(this.injector, origin)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(VIEWPORT_MARGIN)
      .withPopoverLocation('inline');
    const overlayRef = createOverlayRef(this.injector, {
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
        const target = event.target;
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

    const view = overlayRef.attach(new TemplatePortal(this.template(), this.viewContainerRef));
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

  private focusInitial(): void {
    const panel = this.panel;
    if (!panel || this.state() === 'closed') return;
    // A non-modal panel only borrows the trap's search for the initial element: no Tab anchors.
    const trap = this.focusTrapFactory.create(panel, !this.modal());
    if (!trap.focusInitialElement()) panel.focus();
    if (this.modal()) this.focusTrap = trap;
    else trap.destroy();
  }

  private hide(): void {
    this.stack.release(this.stacked);
    const overlayRef = this.overlayRef;
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

  /** Gives the focus back to the trigger, unless the user already moved it out of the panel. */
  private restoreFocus(): void {
    const active = this.document.activeElement;
    const lost = active === null || active === this.document.body;
    if (lost || (this.panel?.contains(active) ?? false)) this.anchor?.focus();
  }

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
}
