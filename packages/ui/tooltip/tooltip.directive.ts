import { FocusMonitor, _IdGenerator } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import {
  type ConnectedPosition,
  type FlexibleConnectedPositionStrategy,
  type OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  type ComponentRef,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ɵpanelPositions, ɵprefersReducedMotion } from '@cadenway/ui/core';
import type { Subscription } from 'rxjs';

import {
  type CoordinatedTooltip,
  CwTooltipCoordinator,
} from './tooltip-coordinator/tooltip-coordinator.service';
import { TOOLTIP_CONFIG } from './tooltip-config.token';
import { CwTooltipPanel, type TooltipState } from './tooltip-panel/tooltip-panel.component';
import type { CwTooltipAlign, CwTooltipContent, CwTooltipSide } from './tooltip.types';

/** Gap between the trigger and the bubble: 8 px with the arrow, 6 px without (sheet, "Côtés"). */
const OFFSET = { arrow: 8, plain: 6 } as const;

/* Time the pointer gets to cross the gap from the trigger to the bubble: the bubble stays open while
   the pointer is over it (sheet, "Accessibilité"; WCAG 1.4.13). */
const HOVER_GRACE = 100;

/** Keeps the bubble 8 px away from the viewport edges when it is shifted to stay visible. */
const VIEWPORT_MARGIN = 8;

interface Placement {
  readonly side: CwTooltipSide;
  readonly align: CwTooltipAlign;
}

/** The side and alignment of a connected position, as the bubble's arrow and data attributes need. */
function placementOf(position: ConnectedPosition): Placement {
  if (position.originY === 'bottom' && position.overlayY === 'top') {
    return { side: 'bottom', align: position.overlayX };
  }
  if (position.originY === 'top' && position.overlayY === 'bottom') {
    return { side: 'top', align: position.overlayX };
  }
  const along = { top: 'start', center: 'center', bottom: 'end' } as const;
  return {
    side: position.overlayX === 'start' ? 'right' : 'left',
    align: along[position.overlayY],
  };
}

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const number = numberAttribute(value);
  return Number.isNaN(number) ? undefined : number;
}

/**
 * Shows a few words about its host on hover and on keyboard focus: the name of an icon button, a
 * full date, a truncated name, an action's shortcut (Tooltip sheet of the Design System artifact).
 *
 * Put it on a focusable element; wrap a disabled button in a `span tabindex="0"`. The bubble opens
 * after `cwTooltipOpenDelay` (700 ms, `provideCwTooltip`) on hover, at once and without animation
 * when another one closed less than `skipDelay` ago, and at once on keyboard focus. It closes when
 * the pointer leaves the trigger and the bubble, on blur, on a press of the trigger and on Escape
 * (the focus stays). One bubble is open at a time.
 *
 * The bubble is a `role="tooltip"` rendered in a CDK overlay and referenced by the host's
 * `aria-describedby` while it is open: it describes, it never names. An icon-only trigger keeps its
 * own `aria-label`, usually the same words. No links or buttons in the bubble.
 */
@Directive({
  selector: '[cwTooltip]',
  host: {
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'onPointerLeave()',
    '(pointerdown)': 'hide()',
  },
})
export class CwTooltip implements CoordinatedTooltip {
  /** Text of the bubble, or a template; empty text shows nothing. */
  readonly cwTooltip = input.required<CwTooltipContent>();
  /** Keys shown after the text, one `kbd` each (`['Ctrl', 'K']`). */
  readonly cwTooltipShortcut = input<readonly string[] | null | undefined>(undefined);
  /** Side of the trigger; flipped when it lacks room. */
  readonly cwTooltipSide = input<CwTooltipSide>('top');
  /** Alignment along the side. */
  readonly cwTooltipAlign = input<CwTooltipAlign>('center');
  /** Draws the arrow; without it the bubble sits 6 px from the trigger (dense toolbars). */
  readonly cwTooltipArrow = input(true, { transform: booleanAttribute });
  /** Hover delay in ms for this trigger; defaults to the `provideCwTooltip` value (700). */
  readonly cwTooltipOpenDelay = input<number | undefined, unknown>(undefined, {
    transform: optionalNumber,
  });
  /** Shows nothing, for instance when the label is already visible. */
  readonly cwTooltipDisabled = input(false, { transform: booleanAttribute });

  private readonly injector = inject(Injector);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(TOOLTIP_CONFIG);
  private readonly coordinator = inject(CwTooltipCoordinator);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly id = inject(_IdGenerator).getId('cw-tooltip-');

  private overlayRef: OverlayRef | null = null;
  private strategy: FlexibleConnectedPositionStrategy | null = null;
  private readonly subscriptions: Subscription[] = [];
  private readonly panel = signal<ComponentRef<CwTooltipPanel> | null>(null);
  private readonly state = signal<TooltipState>('closed');
  private readonly animated = signal(true);
  private readonly placement = signal<Placement>({ side: 'top', align: 'center' });
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  private stopClosing: (() => void) | null = null;
  private keyboardFocused = false;

  private readonly enabled = computed(() => {
    const content = this.cwTooltip();
    return !this.cwTooltipDisabled() && !(typeof content === 'string' && content.trim() === '');
  });

  constructor() {
    effect(() => {
      const panel = this.panel();
      if (panel) this.sync(panel);
    });

    effect(() => {
      if (!this.enabled()) {
        untracked(() => {
          this.closeImmediately();
        });
      }
    });

    // Keyboard focus opens at once; a click (mouse focus) or a programmatic focus (focus returned
    // by a closing popover) does not.
    this.focusMonitor
      .monitor(this.element)
      .pipe(takeUntilDestroyed())
      .subscribe((origin) => {
        this.keyboardFocused = origin === 'keyboard';
        if (origin === 'keyboard') this.show('instant-open', true);
        else if (origin === null) this.hide();
      });

    inject(DestroyRef).onDestroy(() => {
      this.focusMonitor.stopMonitoring(this.element);
      this.closeImmediately();
      for (const subscription of this.subscriptions) subscription.unsubscribe();
      this.overlayRef?.dispose();
    });
  }

  /** Closes the bubble at once, without its fade; the shared coordinator calls it on replacement. */
  closeImmediately(): void {
    this.clearTimers();
    if (!this.overlayRef?.hasAttached()) return;
    this.release();
    this.detach();
  }

  protected onPointerEnter(event: PointerEvent): void {
    // Hover does not exist on touch: a tap is a press, which closes.
    if (event.pointerType === 'touch' || !this.enabled()) return;
    clearTimeout(this.closeTimer);
    if (this.state() !== 'closed') return;
    if (this.coordinator.skipsDelay(this.config.skipDelay)) {
      this.show('instant-open', false);
      return;
    }
    clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => {
      this.show('delayed-open', true);
    }, this.cwTooltipOpenDelay() ?? this.config.openDelay);
  }

  protected onPointerLeave(): void {
    clearTimeout(this.openTimer);
    if (!this.keyboardFocused) this.scheduleClose();
  }

  /** Closes the bubble with its fade (pointer leave, blur, press, Escape). */
  protected hide(): void {
    this.clearTimers();
    const overlayRef = this.overlayRef;
    if (!overlayRef?.hasAttached() || this.state() === 'closed') return;
    this.release();
    if (ɵprefersReducedMotion(this.document)) {
      this.detach();
      return;
    }
    afterNextRender(
      () => {
        if (this.state() === 'closed' && overlayRef.hasAttached()) this.detachAfterAnimation();
      },
      { injector: this.injector },
    );
  }

  private show(state: Exclude<TooltipState, 'closed'>, animated: boolean): void {
    if (!this.enabled()) return;
    this.clearTimers();
    this.coordinator.claim(this);
    this.describe(true);

    const overlayRef = this.overlayRef ?? this.createOverlay();
    if (overlayRef.hasAttached()) {
      // Open, or fading out: keep the bubble and cancel the fade.
      this.stopClosing?.();
      this.stopClosing = null;
      if (this.state() === 'closed') this.animated.set(animated);
      this.state.set(state);
      return;
    }

    const arrow = this.cwTooltipArrow();
    const side = this.cwTooltipSide();
    const align = this.cwTooltipAlign();
    this.strategy?.withPositions(ɵpanelPositions(side, align, arrow ? OFFSET.arrow : OFFSET.plain));
    this.placement.set({ side, align });
    this.animated.set(animated);
    this.state.set(state);

    const panel = overlayRef.attach(new ComponentPortal(CwTooltipPanel, null, this.injector));
    // Required inputs before the first check; the effect keeps them in sync afterwards. The bubble
    // is rendered at once: its `role="tooltip"` host exists from the attach, and it must never be
    // found (or described by `aria-describedby`) empty until the next application tick.
    this.sync(panel);
    panel.changeDetectorRef.detectChanges();
    this.panel.set(panel);
  }

  private sync(panel: ComponentRef<CwTooltipPanel>): void {
    panel.setInput('id', this.id);
    panel.setInput('content', this.cwTooltip());
    panel.setInput('shortcut', this.cwTooltipShortcut());
    panel.setInput('arrow', this.cwTooltipArrow());
    panel.setInput('side', this.placement().side);
    panel.setInput('align', this.placement().align);
    panel.setInput('state', this.state());
    panel.setInput('animated', this.animated());
  }

  private createOverlay(): OverlayRef {
    // `inline`: the bubble's host is inserted next to the trigger (as a native popover in the top
    // layer), so it inherits the `data-theme` scope of its trigger.
    const strategy = createFlexibleConnectedPositionStrategy(this.injector, this.element)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(VIEWPORT_MARGIN)
      .withPopoverLocation('inline');
    const overlayRef = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
      disposeOnNavigation: true,
    });

    this.subscriptions.push(
      strategy.positionChanges.subscribe((change) => {
        this.placement.set(placementOf(change.connectionPair));
      }),
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape' && !hasModifierKey(event) && this.state() !== 'closed') {
          event.preventDefault();
          this.hide();
        }
      }),
    );

    const pane = overlayRef.overlayElement;
    pane.addEventListener('pointerenter', () => {
      clearTimeout(this.closeTimer);
    });
    pane.addEventListener('pointerleave', () => {
      if (!this.keyboardFocused) this.scheduleClose();
    });

    this.strategy = strategy;
    this.overlayRef = overlayRef;
    return overlayRef;
  }

  private detachAfterAnimation(): void {
    const bubble = this.panel()?.location.nativeElement as HTMLElement | undefined;
    const view = this.document.defaultView;
    const name = bubble && view ? view.getComputedStyle(bubble).animationName : '';
    if (!bubble || !name || name === 'none') {
      this.detach();
      return;
    }
    const done = (event: Event): void => {
      if (event.target !== bubble) return;
      this.stopClosing?.();
      this.stopClosing = null;
      if (this.state() === 'closed') this.detach();
    };
    bubble.addEventListener('animationend', done);
    bubble.addEventListener('animationcancel', done);
    this.stopClosing = () => {
      bubble.removeEventListener('animationend', done);
      bubble.removeEventListener('animationcancel', done);
    };
  }

  private release(): void {
    this.describe(false);
    this.state.set('closed');
    this.coordinator.release(this);
  }

  private detach(): void {
    this.stopClosing?.();
    this.stopClosing = null;
    this.panel.set(null);
    this.overlayRef?.detach();
  }

  private scheduleClose(): void {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.hide();
    }, HOVER_GRACE);
  }

  private clearTimers(): void {
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
  }

  /** Adds or removes the bubble's id in the host's `aria-describedby`, keeping the other ids. */
  private describe(open: boolean): void {
    const ids = (this.element.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id !== '' && id !== this.id);
    if (open) ids.push(this.id);
    if (ids.length > 0) this.element.setAttribute('aria-describedby', ids.join(' '));
    else this.element.removeAttribute('aria-describedby');
  }
}
