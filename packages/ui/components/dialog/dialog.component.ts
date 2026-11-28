import { _IdGenerator } from '@angular/cdk/a11y';
import {
  createGlobalPositionStrategy,
  type GlobalPositionStrategy,
  type PositionStrategy,
} from '@angular/cdk/overlay';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  type TemplateRef,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
  untracked,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { ɵFOCUS_INSET, ɵModalOverlay, type ɵModalOverlayConfig } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';

import { CwDialogDescription } from './dialog-description/dialog-description.directive';
import { DIALOG_LABELS } from './dialog-labels.token';
import { CW_DIALOG, type CwDialogContext } from './dialog.token';
import type {
  CwDialogCloseReason,
  CwDialogPadding,
  CwDialogPlacement,
  CwDialogSize,
} from './dialog.types';

/**
 * Type PaneLayout
 *
 * @description
 * Pane size and backdrop visibility the modal overlay applies for a dialog size.
 *
 * @type {Pick<ɵModalOverlayConfig, 'width' | 'height' | 'maxWidth' | 'hideBackdrop'>}
 */
type PaneLayout = Pick<ɵModalOverlayConfig, 'width' | 'height' | 'maxWidth' | 'hideBackdrop'>;

/**
 * Constant TOP_OFFSET
 *
 * @description
 * Distance of a `placement="top"` window from the top of the viewport (mockup `App.dc.html`, the
 * task creation dialog: `top-[8vh]`).
 *
 * @type {string}
 */
const TOP_OFFSET: string = '8vh';

/**
 * Constant WIDE_SCREEN
 *
 * @description
 * Media query from which a window is a window; below it every size fills the screen.
 *
 * @type {string}
 */
const WIDE_SCREEN: string = '(min-width: 768px)';

/* Literal class strings (Dialog sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Under 768 px every size fills the screen (integration guide,
   mobile): no margin, no radius, no border. */
/**
 * Constant PANEL
 *
 * @description
 * Base classes for the dialog panel.
 *
 * @type {string}
 */
const PANEL: string =
  'relative flex flex-col rounded-xl border bg-popover text-popover-foreground shadow-xl outline-none ' +
  'animate-pop-in motion-reduce:animate-none data-[state=closed]:animate-pop-out motion-reduce:data-[state=closed]:animate-none ' +
  'max-md:h-dvh max-md:max-h-none max-md:w-screen max-md:max-w-none max-md:rounded-none max-md:border-0';

/* Mockup App.dc.html, onboarding assistant: `fixed inset-0 bg-canvas`, no window around the content.
   The panel already covers the page, so it fades instead of popping and draws no shadow. */
/**
 * Constant SCREEN_PANEL
 *
 * @description
 * Base classes for the edge-to-edge panel of size `screen`, which replace the window classes and
 * the layout padding: the consumer lays out the content.
 *
 * @type {string}
 */
const SCREEN_PANEL: string =
  'relative flex flex-col bg-canvas text-foreground outline-none ' +
  'animate-fade-in motion-reduce:animate-none data-[state=closed]:animate-fade-out motion-reduce:data-[state=closed]:animate-none';

/**
 * Constant LAYOUTS
 *
 * @description
 * Panel layout classes.
 *
 * @type {Readonly<Record<'simple' | 'flush' | 'scrollable' | 'scrollableTop', string>>}
 */
const LAYOUTS: Readonly<Record<'simple' | 'flush' | 'scrollable' | 'scrollableTop', string>> = {
  simple: 'gap-4 p-6',
  flush: '',
  scrollable: 'max-h-[calc(100dvh-2rem)]',
  // Pinned 8vh from the top, the window stops 16 px above the bottom edge.
  scrollableTop: 'max-h-[calc(92dvh-1rem)]',
} as const;

// The window always keeps 16 px from the screen edges (`calc(100% - 2rem)` of the viewport).
/**
 * Constant SIZES
 *
 * @description
 * Panel classes by dialog size.
 *
 * @type {Record<CwDialogSize, string>}
 */
const SIZES: Record<CwDialogSize, string> = {
  sm: 'w-[calc(100vw-2rem)] max-w-sm',
  default: 'w-[calc(100vw-2rem)] max-w-md',
  md: 'w-[calc(100vw-2rem)] max-w-lg',
  lg: 'w-[calc(100vw-2rem)] max-w-2xl',
  xl: 'w-[calc(100vw-2rem)] max-w-4xl',
  '2xl': 'w-[calc(100vw-2rem)] max-w-5xl',
  // Mockup App.dc.html, task detail sheet: 6vh above, 88vh high, so 6vh below once centered.
  tall: 'h-[88dvh] w-[calc(100vw-2rem)] max-w-5xl overflow-hidden',
  full: 'h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)]',
  // The pane is `100%` of the overlay container (`PANE_LAYOUTS`): `100vw` would add the width of
  // the scrollbar the CDK scroll block keeps.
  screen: 'size-full',
};

/**
 * Constant PANE_LAYOUTS
 *
 * @description
 * Pane layouts: a window keeps the overlay defaults (its panel classes size it, over a backdrop);
 * `screen` fills the overlay container and hides the backdrop it covers anyway.
 *
 * @type {Readonly<Record<'window' | 'screen', PaneLayout>>}
 */
const PANE_LAYOUTS: Readonly<Record<'window' | 'screen', PaneLayout>> = {
  window: {},
  screen: { width: '100%', height: '100%', maxWidth: '100%', hideBackdrop: true },
} as const;

/**
 * Function optionalBoolean
 *
 * @description
 * Reads a boolean input that may stay unset: `undefined` and `null` keep it unset, so the brick
 * leaves the decision to the CDK and the application's `DEFAULT_DIALOG_CONFIG`; any other value
 * follows `booleanAttribute`, so the bare attribute form means `true`.
 *
 * @param {unknown} value - Bound value or attribute text.
 *
 * @returns {boolean | undefined} The boolean value, or undefined when unset.
 */
function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined || value === null ? undefined : booleanAttribute(value);
}

// The body takes the remaining height when the window is taller than its content (`full`, mobile).
/**
 * Constant BODIES
 *
 * @description
 * Body layout classes.
 *
 * @type {Readonly<Record<'simple' | 'full' | 'screen' | 'scrollable' | 'scrollableFlush', string>>}
 */
const BODIES: Readonly<
  Record<'simple' | 'full' | 'screen' | 'scrollable' | 'scrollableFlush', string>
> = {
  simple: 'min-h-0 min-w-0 flex-1 empty:hidden max-md:overflow-y-auto',
  full: 'min-h-0 min-w-0 flex-1 overflow-y-auto empty:hidden',
  screen: `min-h-0 min-w-0 flex-1 overflow-y-auto empty:hidden ${ɵFOCUS_INSET}`,
  scrollable: `min-h-0 flex-1 overflow-y-auto px-6 py-3 [scrollbar-color:var(--color-track)_transparent] [scrollbar-width:thin] ${ɵFOCUS_INSET}`,
  scrollableFlush: `min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--color-track)_transparent] [scrollbar-width:thin] ${ɵFOCUS_INSET}`,
} as const;

/**
 * Component CwDialog
 *
 * @description
 * A modal window for a short task that interrupts the view: rename a list, create a space, invite
 * members, show the keyboard shortcuts (Dialog sheet of the Design System artifact). For an
 * irreversible action use `cw-alert-dialog`.
 *
 * Its content renders in a CDK Dialog overlay only while `open`: a centered window over a backdrop,
 * focus trapped inside (first field, or the element marked `cdkFocusInitial`), page scroll blocked,
 * the rest of the page hidden from assistive technologies, focus returned to the trigger on close.
 * Compose it with `cw-dialog-header` (`h2[cwDialogTitle]`, required, and `p[cwDialogDescription]`),
 * any body content and `cw-dialog-footer`; the window is `role="dialog"` named by the title and
 * described by the description. Open it with `[cwDialogTrigger]`, `[(open)]` or `show()`.
 *
 * Escape, a backdrop click, the close button (`showClose`, named `closeLabel`) and
 * `button[cwDialogClose]` close it; Escape first closes a popup still open inside it (a menu, a
 * select). While `pending`, none of them closes it and `cwDialogClose` buttons are `aria-disabled`.
 * A browser Back or Forward closes it too, as the CDK does, unless `closeOnNavigation` or the
 * application's `DEFAULT_DIALOG_CONFIG` says otherwise.
 * `closed` emits the reason once the exit animation ends. `scrollable` pins the header and footer
 * and scrolls the body (a focusable region; mark the first field `cdkFocusInitial` in a scrollable
 * form). Under 768 px the window fills the screen.
 *
 * `size="screen"` covers the whole viewport on the canvas surface, without border, radius, shadow,
 * padding or backdrop: the body fills the height, scrolls as a focusable region and stays unpadded
 * (`scrollable` then only pins the header and footer), and the consumer lays out the content.
 * Focus trapping, Escape
 * and the close button behave as at the other sizes. Changing `size` while open resizes the window
 * and shows or hides the backdrop in place, without closing it.
 */
@Component({
  selector: 'cw-dialog',
  imports: [CwButton, NgIcon],
  providers: [
    provideIcons({ phosphorXBold }),
    ɵModalOverlay,
    { provide: CW_DIALOG, useExisting: CwDialog },
  ],
  templateUrl: './dialog.component.html',
})
export class CwDialog implements CwDialogContext {
  // #region Properties
  /**
   * Property open
   * @readonly
   *
   * @description
   * Whether the dialog is open.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly open: ModelSignal<boolean> = model(false);

  /**
   * Property size
   * @readonly
   *
   * @description
   * Maximum dialog size: `sm` 384 px, `default` 448 px, `md` 512 px, `lg` 672 px, `xl` 896 px,
   * `2xl` 1024 px, `tall` (1024 px wide, 88 % of the viewport high), `full` (the screen less
   * 16 px, over a backdrop) or `screen` (the whole viewport, no backdrop).
   *
   * @type {InputSignal<CwDialogSize>}
   */
  public readonly size: InputSignal<CwDialogSize> = input<CwDialogSize>('default');

  /**
   * Property placement
   * @readonly
   *
   * @description
   * Where the window sits from 768 px: `center` (default) or `top`, its top edge 8 % below the top
   * of the viewport so it grows downwards. Read when the dialog opens; ignored by `screen`.
   *
   * @type {InputSignal<CwDialogPlacement>}
   */
  public readonly placement: InputSignal<CwDialogPlacement> = input<CwDialogPlacement>('center');

  /**
   * Property padding
   * @readonly
   *
   * @description
   * Inner spacing of the body: `default` pads it; `none` leaves the spacing to the content (a
   * header `variant="bar"`, sections drawing their own edges).
   *
   * @type {InputSignal<CwDialogPadding>}
   */
  public readonly padding: InputSignal<CwDialogPadding> = input<CwDialogPadding>('default');

  /**
   * Property scrollable
   * @readonly
   *
   * @description
   * Whether the body scrolls between fixed header and footer.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly scrollable: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property showClose
   * @readonly
   *
   * @description
   * Whether the close button is visible.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly showClose: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property closeOnEscape
   * @readonly
   *
   * @description
   * Whether Escape closes the dialog.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly closeOnEscape: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property closeOnOverlayClick
   * @readonly
   *
   * @description
   * Whether a backdrop click closes the dialog.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly closeOnOverlayClick: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property closeOnNavigation
   * @readonly
   *
   * @description
   * Whether a browser history navigation (Back or Forward) closes the dialog. Unset by default
   * (`undefined`, or `null`): the CDK decides, that is the application's `DEFAULT_DIALOG_CONFIG`,
   * otherwise `true`, as before this input existed. An explicit `true` or `false` wins over that
   * configuration. Read when the dialog opens. Such a close sets `open` to false and emits `closed`
   * with the reason `action`, at once and even while `pending`. Set it to false for a dialog that
   * must outlive history navigation, such as a full-screen flow whose consumer binds `[open]` one
   * way and would otherwise lose the window. Boolean only, on purpose: `true` is the CDK's
   * `popstate` disposal, and the CDK's other modes (such as closing on any URL change, router
   * navigations included) stay out of the brick's API.
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   */
  public readonly closeOnNavigation: InputSignalWithTransform<boolean | undefined, unknown> = input<
    boolean | undefined,
    unknown
  >(undefined, { transform: optionalBoolean });

  /**
   * Property pending
   * @readonly
   *
   * @description
   * Whether a submission is pending.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly pending: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property closeLabel
   * @readonly
   *
   * @description
   * Accessible name of the close button; by default the `close` text of `provideCwDialogLabels`
   * (« Fermer »).
   *
   * @type {InputSignal<string>}
   */
  public readonly closeLabel: InputSignal<string> = input<string>(inject(DIALOG_LABELS).close);

  /**
   * Property closed
   * @readonly
   *
   * @description
   * Emits the reason after the dialog closes.
   *
   * @type {OutputEmitterRef<CwDialogCloseReason>}
   */
  public readonly closed: OutputEmitterRef<CwDialogCloseReason> = output<CwDialogCloseReason>();

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Identifier of the dialog title.
   *
   * @type {string}
   */
  public readonly titleId: string;

  /**
   * Property descriptionId
   * @readonly
   *
   * @description
   * Identifier of the dialog description.
   *
   * @type {string}
   */
  public readonly descriptionId: string;

  /**
   * Property state
   * @readonly
   *
   * @description
   * Panel animation state.
   *
   * @type {WritableSignal<'open' | 'closed'>}
   */
  protected readonly state: WritableSignal<'open' | 'closed'> = signal<'open' | 'closed'>('open');

  /**
   * Property panelClasses
   * @readonly
   *
   * @description
   * Panel classes for the current layout.
   *
   * @type {Signal<string>}
   */
  protected readonly panelClasses: Signal<string> = computed(() => {
    if (this.size() === 'screen') return `${SCREEN_PANEL} ${SIZES.screen}`;
    const layout: string = this.scrollable()
      ? this.placement() === 'top'
        ? LAYOUTS.scrollableTop
        : LAYOUTS.scrollable
      : this.padding() === 'none'
        ? LAYOUTS.flush
        : LAYOUTS.simple;
    return `${PANEL} ${layout} ${SIZES[this.size()]}`;
  });

  /**
   * Property bodyClasses
   * @readonly
   *
   * @description
   * Body classes for the current layout.
   *
   * @type {Signal<string>}
   */
  protected readonly bodyClasses: Signal<string> = computed(() => {
    if (this.size() === 'screen') return BODIES.screen;
    if (this.scrollable())
      return this.padding() === 'none' ? BODIES.scrollableFlush : BODIES.scrollable;
    return this.size() === 'full' || this.size() === 'tall' ? BODIES.full : BODIES.simple;
  });

  /**
   * Property bodyFocusable
   * @readonly
   *
   * @description
   * Whether the body is a focusable scroll region: a `scrollable` dialog, and always a `screen` one
   * (its body always scrolls), so a keyboard can reach overflowing static content.
   *
   * @type {Signal<boolean>}
   */
  protected readonly bodyFocusable: Signal<boolean> = computed(
    () => this.scrollable() || this.size() === 'screen',
  );

  /**
   * Property paneLayout
   * @readonly
   *
   * @description
   * Pane size and backdrop visibility for the current size.
   *
   * @type {Signal<PaneLayout>}
   */
  private readonly paneLayout: Signal<PaneLayout> = computed(() =>
    this.size() === 'screen' ? PANE_LAYOUTS.screen : PANE_LAYOUTS.window,
  );

  /**
   * Property template
   * @readonly
   *
   * @description
   * Template attached to the modal overlay.
   *
   * @type {Signal<TemplateRef<unknown>>}
   */
  private readonly template: Signal<TemplateRef<unknown>> =
    viewChild.required<TemplateRef<unknown>>('panel');

  /**
   * Property description
   * @readonly
   *
   * @description
   * Projected description when present.
   *
   * @type {Signal<CwDialogDescription | undefined>}
   */
  private readonly description: Signal<CwDialogDescription | undefined> = contentChild(
    CwDialogDescription,
    { descendants: true },
  );

  /**
   * Property viewContainerRef
   * @readonly
   *
   * @description
   * Container used to attach the overlay.
   *
   * @type {ViewContainerRef}
   */
  private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to build the position of a `placement="top"` window.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document whose window tells whether the screen is wide enough for a placed window.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property stopWatching
   *
   * @description
   * Removes the breakpoint listener of an open `placement="top"` window; null otherwise.
   *
   * @type {(() => void) | null}
   */
  private stopWatching: (() => void) | null = null;

  /**
   * Property overlay
   * @readonly
   *
   * @description
   * Modal overlay hosting the dialog.
   *
   * @type {ɵModalOverlay}
   */
  private readonly overlay: ɵModalOverlay = inject(ɵModalOverlay);

  /**
   * Property reason
   *
   * @description
   * Reason emitted after closing.
   *
   * @type {CwDialogCloseReason}
   */
  private reason: CwDialogCloseReason = 'action';

  /**
   * Property origin
   *
   * @description
   * Trigger receiving focus after close.
   *
   * @type {HTMLElement | null}
   */
  private origin: HTMLElement | null = null;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Initializes identifiers and synchronizes the modal overlay.
   */
  public constructor() {
    const ids: _IdGenerator = inject(_IdGenerator);
    this.titleId = ids.getId('cw-dialog-title-');
    this.descriptionId = ids.getId('cw-dialog-description-');
    effect(() => {
      const open: boolean = this.open();
      untracked(() => {
        if (open) this.attach();
        else this.detach();
      });
    });
    // A size change while open (`screen` and a window) updates the pane and the backdrop in place:
    // they are overlay settings, read otherwise only when the overlay attaches.
    effect(() => {
      const layout: PaneLayout = this.paneLayout();
      untracked(() => {
        this.overlay.resize(layout);
      });
    });
    // So does the position: a size or placement change while open moves the pane and starts or
    // stops following the 768 px breakpoint (a `screen` dialog is never offset).
    effect(() => {
      this.placement();
      this.size();
      untracked(() => {
        this.syncPosition();
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.unwatchBreakpoint();
      this.overlay.dispose();
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method show
   *
   * @description
   * Opens the dialog and remembers the focus origin.
   *
   * @param {HTMLElement} [origin] - Optional trigger receiving focus after the dialog closes.
   */
  public show(origin?: HTMLElement): void {
    this.origin = origin ?? null;
    this.open.set(true);
  }

  /**
   * Method close
   *
   * @description
   * Closes the dialog with the action reason.
   */
  public close(): void {
    this.reason = 'action';
    this.open.set(false);
  }

  /**
   * Method requestClose
   *
   * @description
   * Requests closure unless a submission is pending.
   *
   * @param {CwDialogCloseReason} reason - User action requesting the dialog closure.
   */
  public requestClose(reason: CwDialogCloseReason): void {
    if (!this.overlay.attached || this.pending()) return;
    this.reason = reason;
    this.open.set(false);
  }

  /**
   * Method attach
   *
   * @description
   * Attaches the modal overlay and configures focus.
   */
  private attach(): void {
    if (this.overlay.attached) return;
    this.state.set('open');
    this.reason = 'action';
    this.overlay.attach({
      role: 'dialog',
      template: this.template(),
      viewContainerRef: this.viewContainerRef,
      labelledBy: this.titleId,
      describedBy: this.description() ? this.descriptionId : null,
      autoFocus: 'first-tabbable',
      restoreFocus: this.origin,
      ...this.navigationSetting(),
      ...this.paneLayout(),
      ...this.position(),
      onKeydown: (event) => {
        this.onKeydown(event);
      },
      onBackdropClick: () => {
        if (this.closeOnOverlayClick()) this.requestClose('overlay');
      },
      onExternalClose: () => {
        // The exit path (`detach`) does not run: forget the trigger here, so a later `[(open)]`
        // does not return the focus to it.
        this.unwatchBreakpoint();
        this.origin = null;
        this.open.set(false);
        this.closed.emit('action');
      },
    });
    this.watchBreakpoint();
  }

  /**
   * Method wideQuery
   *
   * @description
   * The 768 px media query of a `placement="top"` window, or null when the placement is not
   * `top`, the size is `screen` or the document has no `matchMedia` (a test DOM, where the screen
   * counts as wide).
   *
   * @returns {MediaQueryList | null} The query to read and watch, if any.
   */
  private wideQuery(): MediaQueryList | null {
    if (this.placement() !== 'top' || this.size() === 'screen') return null;
    const view: (Window & typeof globalThis) | null = this.document.defaultView;
    if (!view || typeof view.matchMedia !== 'function') return null;
    return view.matchMedia(WIDE_SCREEN);
  }

  /**
   * Method strategy
   *
   * @description
   * Position of a `placement="top"` window: pinned 8vh from the top and centered horizontally on
   * a wide screen; centered both ways below 768 px, where the window fills the screen and a top
   * offset would push its footer off it.
   *
   * @param {boolean} wide - Whether the viewport is at least 768 px wide.
   * @returns {PositionStrategy} The strategy for that viewport.
   */
  private strategy(wide: boolean): PositionStrategy {
    const strategy: GlobalPositionStrategy = createGlobalPositionStrategy(
      this.injector,
    ).centerHorizontally();
    return wide ? strategy.top(TOP_OFFSET) : strategy.centerVertically();
  }

  /**
   * Method centered
   *
   * @description
   * The CDK's default dialog position: centered both ways.
   *
   * @returns {PositionStrategy} A centered global position strategy.
   */
  private centered(): PositionStrategy {
    return createGlobalPositionStrategy(this.injector).centerHorizontally().centerVertically();
  }

  /**
   * Method syncPosition
   *
   * @description
   * Applies the position of the current size and placement to the open window and watches the
   * breakpoint only when it is placed at the top; does nothing while closed.
   */
  private syncPosition(): void {
    if (!this.overlay.attached) return;
    this.watchBreakpoint();
    const top: boolean = this.placement() === 'top' && this.size() !== 'screen';
    this.overlay.reposition(
      top ? this.strategy(this.wideQuery()?.matches ?? true) : this.centered(),
    );
  }

  /**
   * Method position
   *
   * @description
   * Initial position of a `placement="top"` window (see `strategy`); nothing for the other
   * placements, which the CDK centers.
   *
   * @returns {Pick<ɵModalOverlayConfig, 'positionStrategy'>} The position strategy to pass, if any.
   */
  private position(): Pick<ɵModalOverlayConfig, 'positionStrategy'> {
    if (this.placement() !== 'top' || this.size() === 'screen') return {};
    return { positionStrategy: this.strategy(this.wideQuery()?.matches ?? true) };
  }

  /**
   * Method watchBreakpoint
   *
   * @description
   * While a `placement="top"` window is open, moves it when the viewport crosses 768 px, so a
   * window resized to a phone fills the screen from its top and the reverse.
   */
  private watchBreakpoint(): void {
    this.unwatchBreakpoint();
    const query: MediaQueryList | null = this.wideQuery();
    if (!query) return;
    const listener: (event: MediaQueryListEvent) => void = (event) => {
      this.overlay.reposition(this.strategy(event.matches));
    };
    query.addEventListener('change', listener);
    this.stopWatching = () => {
      query.removeEventListener('change', listener);
    };
  }

  /**
   * Method unwatchBreakpoint
   *
   * @description
   * Removes the breakpoint listener of the open window, if any.
   */
  private unwatchBreakpoint(): void {
    this.stopWatching?.();
    this.stopWatching = null;
  }

  /**
   * Method navigationSetting
   *
   * @description
   * The overlay's navigation setting, only when `closeOnNavigation` is set, so an unset input
   * leaves the CDK default and the application's `DEFAULT_DIALOG_CONFIG` in force.
   *
   * @returns {Pick<ɵModalOverlayConfig, 'closeOnNavigation'>} The setting to spread, or nothing.
   */
  private navigationSetting(): Pick<ɵModalOverlayConfig, 'closeOnNavigation'> {
    const closeOnNavigation: boolean | undefined = this.closeOnNavigation();
    return closeOnNavigation === undefined ? {} : { closeOnNavigation };
  }

  /**
   * Method detach
   *
   * @description
   * Detaches the modal overlay and emits the close reason.
   */
  private detach(): void {
    this.unwatchBreakpoint();
    if (!this.overlay.attached) return;
    const reason: CwDialogCloseReason = this.reason;
    this.state.set('closed');
    this.overlay.detach(
      () => {
        this.origin = null;
        this.closed.emit(reason);
      },
      reason === 'escape' ? 'keyboard' : reason === 'overlay' ? 'mouse' : undefined,
    );
  }

  /**
   * Method onKeydown
   *
   * @description
   * Handles Escape when it belongs to this dialog.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the modal overlay.
   */
  private onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (this.overlay.escapeBelongsElsewhere(event)) return;
    event.preventDefault();
    if (this.closeOnEscape()) this.requestClose('escape');
  }
  // #endregion
}
