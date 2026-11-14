import { FocusMonitor, _IdGenerator } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import {
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
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ɵafterExitAnimation,
  ɵpanelPositions,
  ɵplacementOf,
  ɵprefersReducedMotion,
  type ɵPlacement,
} from '@cadenway/ui/core';
import type { Subscription } from 'rxjs';

import {
  type CoordinatedTooltip,
  CwTooltipCoordinator,
} from './tooltip-coordinator/tooltip-coordinator.service';
import { TOOLTIP_CONFIG } from './tooltip-config.token';
import { CwTooltipPanel, type TooltipState } from './tooltip-panel/tooltip-panel.component';
import type {
  CwTooltipAlign,
  CwTooltipConfig,
  CwTooltipContent,
  CwTooltipSide,
} from './tooltip.types';

/**
 * Constant OFFSET
 *
 * @description
 * Tooltip gap from the trigger with or without an arrow.
 *
 * @type {{ readonly arrow: 8; readonly plain: 6 }}
 */
const OFFSET: { readonly arrow: 8; readonly plain: 6 } = { arrow: 8, plain: 6 } as const;

/* Time the pointer gets to cross the gap from the trigger to the bubble: the bubble stays open while
   the pointer is over it (sheet, "Accessibilité"; WCAG 1.4.13). */
/**
 * Constant HOVER_GRACE
 *
 * @description
 * Time allowed to cross the gap before closing.
 *
 * @type {number}
 */
const HOVER_GRACE: number = 100;

/**
 * Constant VIEWPORT_MARGIN
 *
 * @description
 * Minimum distance from the viewport edges.
 *
 * @type {number}
 */
const VIEWPORT_MARGIN: number = 8;

/**
 * Function optionalNumber
 *
 * @description
 * Converts an optional input into a valid number.
 *
 * @param {unknown} value - Input value to convert, including an empty value.
 *
 * @returns {number | undefined} Converted number, or undefined for an empty or invalid value.
 */
function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const number: number = numberAttribute(value);
  return Number.isNaN(number) ? undefined : number;
}

/**
 * Directive CwTooltip
 *
 * @description
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
  // #region Properties
  /**
   * Property cwTooltip
   * @readonly
   *
   * @description
   * Text or template displayed in the bubble.
   *
   * @type {InputSignal<CwTooltipContent>}
   */
  public readonly cwTooltip: InputSignal<CwTooltipContent> = input.required<CwTooltipContent>();

  /**
   * Property cwTooltipShortcut
   * @readonly
   *
   * @description
   * Shortcut keys displayed alongside the content.
   *
   * @type {InputSignal<readonly string[] | null | undefined>}
   */
  public readonly cwTooltipShortcut: InputSignal<readonly string[] | null | undefined> = input<
    readonly string[] | null | undefined
  >(undefined);

  /**
   * Property cwTooltipSide
   * @readonly
   *
   * @description
   * Preferred side of the trigger.
   *
   * @type {InputSignal<CwTooltipSide>}
   */
  public readonly cwTooltipSide: InputSignal<CwTooltipSide> = input<CwTooltipSide>('top');

  /**
   * Property cwTooltipAlign
   * @readonly
   *
   * @description
   * Preferred alignment along the side.
   *
   * @type {InputSignal<CwTooltipAlign>}
   */
  public readonly cwTooltipAlign: InputSignal<CwTooltipAlign> = input<CwTooltipAlign>('center');

  /**
   * Property cwTooltipArrow
   * @readonly
   *
   * @description
   * Whether to draw an arrow.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly cwTooltipArrow: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property cwTooltipOpenDelay
   * @readonly
   *
   * @description
   * Optional hover delay override in milliseconds.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   */
  public readonly cwTooltipOpenDelay: InputSignalWithTransform<number | undefined, unknown> = input<
    number | undefined,
    unknown
  >(undefined, {
    transform: optionalNumber,
  });

  /**
   * Property cwTooltipDisabled
   * @readonly
   *
   * @description
   * Whether the tooltip is disabled.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly cwTooltipDisabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to create and render the overlay.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property element
   * @readonly
   *
   * @description
   * Tooltip trigger element.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document used to determine motion preferences.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property config
   * @readonly
   *
   * @description
   * Configured tooltip delays.
   *
   * @type {Required<CwTooltipConfig>}
   */
  private readonly config: Required<CwTooltipConfig> = inject(TOOLTIP_CONFIG);

  /**
   * Property coordinator
   * @readonly
   *
   * @description
   * Coordinator enforcing a single open tooltip.
   *
   * @type {CwTooltipCoordinator}
   */
  private readonly coordinator: CwTooltipCoordinator = inject(CwTooltipCoordinator);

  /**
   * Property focusMonitor
   * @readonly
   *
   * @description
   * Focus origin monitor for the trigger.
   *
   * @type {FocusMonitor}
   */
  private readonly focusMonitor: FocusMonitor = inject(FocusMonitor);

  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier referenced by the trigger.
   *
   * @type {string}
   */
  private readonly id: string = inject(_IdGenerator).getId('cw-tooltip-');

  /**
   * Property overlayRef
   *
   * @description
   * Overlay containing the tooltip panel.
   *
   * @type {OverlayRef | null}
   */
  private overlayRef: OverlayRef | null = null;

  /**
   * Property strategy
   *
   * @description
   * Position strategy for the overlay.
   *
   * @type {FlexibleConnectedPositionStrategy | null}
   */
  private strategy: FlexibleConnectedPositionStrategy | null = null;

  /**
   * Property subscriptions
   * @readonly
   *
   * @description
   * Overlay subscriptions released on destruction.
   *
   * @type {Subscription[]}
   */
  private readonly subscriptions: Subscription[] = [];

  /**
   * Property panel
   * @readonly
   *
   * @description
   * Attached tooltip panel, if present.
   *
   * @type {WritableSignal<ComponentRef<CwTooltipPanel> | null>}
   */
  private readonly panel: WritableSignal<ComponentRef<CwTooltipPanel> | null> =
    signal<ComponentRef<CwTooltipPanel> | null>(null);

  /**
   * Property state
   * @readonly
   *
   * @description
   * Opening or closing state.
   *
   * @type {WritableSignal<TooltipState>}
   */
  private readonly state: WritableSignal<TooltipState> = signal<TooltipState>('closed');

  /**
   * Property animated
   * @readonly
   *
   * @description
   * Whether to animate the current opening.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly animated: WritableSignal<boolean> = signal(true);

  /**
   * Property placement
   * @readonly
   *
   * @description
   * Actual side and alignment of the panel.
   *
   * @type {WritableSignal<ɵPlacement>}
   */
  private readonly placement: WritableSignal<ɵPlacement> = signal<ɵPlacement>({
    side: 'top',
    align: 'center',
  });

  /**
   * Property openTimer
   *
   * @description
   * Pending hover-open timer.
   *
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  private openTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Property closeTimer
   *
   * @description
   * Pending hover-close timer.
   *
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Property stopClosing
   *
   * @description
   * Cancels a pending exit animation.
   *
   * @type {(() => void) | null}
   */
  private stopClosing: (() => void) | null = null;

  /**
   * Property keyboardFocused
   *
   * @description
   * Whether the trigger has keyboard focus.
   *
   * @type {boolean}
   */
  private keyboardFocused: boolean = false;

  /**
   * Property enabled
   * @readonly
   *
   * @description
   * Whether the tooltip has content and is enabled.
   *
   * @type {Signal<boolean>}
   */
  private readonly enabled: Signal<boolean> = computed(() => {
    const content: CwTooltipContent = this.cwTooltip();
    return !this.cwTooltipDisabled() && !(typeof content === 'string' && content.trim() === '');
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Synchronizes the panel and manages focus and destruction.
   */
  public constructor() {
    effect(() => {
      const panel: ComponentRef<CwTooltipPanel> | null = this.panel();
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
  // #endregion

  // #region Methods
  /**
   * Method closeImmediately
   *
   * @description
   * Closes the bubble without an exit animation.
   */
  public closeImmediately(): void {
    this.clearTimers();
    if (!this.overlayRef?.hasAttached()) return;
    this.release();
    this.detach();
  }

  /**
   * Method onPointerEnter
   *
   * @description
   * Schedules or immediately opens the tooltip on hover.
   *
   * @param {PointerEvent} event - Pointer event used to ignore touch input.
   */
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

  /**
   * Method onPointerLeave
   *
   * @description
   * Schedules closure when hover ends.
   */
  protected onPointerLeave(): void {
    clearTimeout(this.openTimer);
    if (!this.keyboardFocused) this.scheduleClose();
  }

  /**
   * Method hide
   *
   * @description
   * Closes the bubble with its exit animation.
   */
  protected hide(): void {
    this.clearTimers();
    const overlayRef: OverlayRef | null = this.overlayRef;
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

  /**
   * Method show
   *
   * @description
   * Opens or updates the tooltip overlay.
   *
   * @param {Exclude<TooltipState, 'closed'>} state - Opening state applied to the panel.
   * @param {boolean} animated - Whether to play the opening animation.
   */
  private show(state: Exclude<TooltipState, 'closed'>, animated: boolean): void {
    if (!this.enabled()) return;
    this.clearTimers();
    this.coordinator.claim(this);
    this.describe(true);

    const overlayRef: OverlayRef = this.overlayRef ?? this.createOverlay();
    if (overlayRef.hasAttached()) {
      // Open, or fading out: keep the bubble and cancel the fade.
      this.stopClosing?.();
      this.stopClosing = null;
      if (this.state() === 'closed') this.animated.set(animated);
      this.state.set(state);
      return;
    }

    const arrow: boolean = this.cwTooltipArrow();
    const side: CwTooltipSide = this.cwTooltipSide();
    const align: CwTooltipAlign = this.cwTooltipAlign();
    this.strategy?.withPositions(ɵpanelPositions(side, align, arrow ? OFFSET.arrow : OFFSET.plain));
    this.placement.set({ side, align });
    this.animated.set(animated);
    this.state.set(state);

    const panel: ComponentRef<CwTooltipPanel> = overlayRef.attach(
      new ComponentPortal(CwTooltipPanel, null, this.injector),
    );
    // Required inputs before the first check; the effect keeps them in sync afterwards. The bubble
    // is rendered at once: its `role="tooltip"` host exists from the attach, and it must never be
    // found (or described by `aria-describedby`) empty until the next application tick.
    this.sync(panel);
    panel.changeDetectorRef.detectChanges();
    this.panel.set(panel);
  }

  /**
   * Method sync
   *
   * @description
   * Synchronizes panel inputs with the trigger state.
   *
   * @param {ComponentRef<CwTooltipPanel>} panel - Attached panel whose inputs are synchronized.
   */
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

  /**
   * Method createOverlay
   *
   * @description
   * Creates and configures the tooltip overlay.
   *
   * @returns {OverlayRef} Configured overlay for the tooltip panel.
   */
  private createOverlay(): OverlayRef {
    // `inline`: the bubble's host is inserted next to the trigger (as a native popover in the top
    // layer), so it inherits the `data-theme` scope of its trigger.
    const strategy: FlexibleConnectedPositionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      this.element,
    )
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(VIEWPORT_MARGIN)
      .withPopoverLocation('inline');
    const overlayRef: OverlayRef = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
      disposeOnNavigation: true,
    });

    this.subscriptions.push(
      strategy.positionChanges.subscribe((change) => {
        this.placement.set(ɵplacementOf(change.connectionPair));
      }),
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape' && !hasModifierKey(event) && this.state() !== 'closed') {
          event.preventDefault();
          this.hide();
        }
      }),
    );

    const pane: HTMLElement = overlayRef.overlayElement;
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

  /**
   * Method detachAfterAnimation
   *
   * @description
   * Detaches the panel after its exit animation.
   */
  private detachAfterAnimation(): void {
    const bubble: HTMLElement | undefined = this.panel()?.location.nativeElement as
      HTMLElement | undefined;
    this.stopClosing = ɵafterExitAnimation(
      bubble,
      () => {
        this.stopClosing = null;
        if (this.state() === 'closed') this.detach();
      },
      { endOnCancel: true },
    );
  }

  /**
   * Method release
   *
   * @description
   * Releases the active tooltip and its accessible description.
   */
  private release(): void {
    this.describe(false);
    this.state.set('closed');
    this.coordinator.release(this);
  }

  /**
   * Method detach
   *
   * @description
   * Detaches the overlay and clears its panel.
   */
  private detach(): void {
    this.stopClosing?.();
    this.stopClosing = null;
    this.panel.set(null);
    this.overlayRef?.detach();
  }

  /**
   * Method scheduleClose
   *
   * @description
   * Schedules closure after the hover grace period.
   */
  private scheduleClose(): void {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.hide();
    }, HOVER_GRACE);
  }

  /**
   * Method clearTimers
   *
   * @description
   * Cancels pending open and close timers.
   */
  private clearTimers(): void {
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
  }

  /**
   * Method describe
   *
   * @description
   * Adds or removes the tooltip identifier from aria-describedby.
   *
   * @param {boolean} open - Whether to add or remove the tooltip identifier.
   */
  private describe(open: boolean): void {
    const ids: string[] = (this.element.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id !== '' && id !== this.id);
    if (open) ids.push(this.id);
    if (ids.length > 0) this.element.setAttribute('aria-describedby', ids.join(' '));
    else this.element.removeAttribute('aria-describedby');
  }
  // #endregion
}
