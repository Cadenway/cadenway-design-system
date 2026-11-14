import {
  type OverlayRef,
  type FlexibleConnectedPositionStrategy,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  inject,
  Injector,
  Service,
  signal,
  type TemplateRef,
  type ViewContainerRef,
  type WritableSignal,
} from '@angular/core';

import { ɵafterExitAnimation } from '../motion/exit-animation';
import { ɵmenuFrom, ɵpanelPositions } from './overlay-positions';

/**
 * Constant CLOSE_FALLBACK_MS
 *
 * @description
 * Wait limit in milliseconds: the longest token menu-out animation plus a margin, so a hidden tab
 * or cancelled animation cannot leave the panel attached indefinitely.
 *
 * @type {number}
 */
const CLOSE_FALLBACK_MS: number = 300;

/**
 * Interface ɵConnectedPanelConfig
 * @interface ɵConnectedPanelConfig
 *
 * @description
 * What `ɵConnectedPanel.open` needs: the trigger, the panel template and who to tell about outside
 * clicks and keys.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export interface ɵConnectedPanelConfig {
  // #region Properties
  /**
   * Property origin
   * @readonly
   *
   * @description
   * Trigger element used to position the panel and determine its minimum width.
   *
   * @type {HTMLElement}
   */
  readonly origin: HTMLElement;

  /**
   * Property template
   * @readonly
   *
   * @description
   * Panel template rendered inside the connected overlay.
   *
   * @type {TemplateRef<unknown>}
   */
  readonly template: TemplateRef<unknown>;

  /**
   * Property viewContainerRef
   * @readonly
   *
   * @description
   * View container of the component that declares the panel template.
   *
   * @type {ViewContainerRef}
   */
  readonly viewContainerRef: ViewContainerRef;

  /**
   * Property outsideClick
   * @readonly
   *
   * @description
   * Receives pointer presses outside the panel, including presses on the trigger; the owner filters
   * trigger presses when needed.
   *
   * @type {(event: MouseEvent) => void}
   */
  readonly outsideClick: (event: MouseEvent) => void;

  /**
   * Property keydown
   * @readonly
   *
   * @description
   * Called on each key pressed while the focus is inside the panel (Escape). Omit it when the focus
   * stays on the trigger: an overlay that listens to keys takes them from the overlays below it.
   *
   * @type {((event: KeyboardEvent) => void) | undefined}
   */
  readonly keydown?: (event: KeyboardEvent) => void;

  /**
   * Property inline
   * @readonly
   *
   * @description
   * Whether the overlay is a native popover inserted right after the trigger (the default): it
   * paints in the top layer but inherits the trigger's theme scope (`data-theme`). False attaches
   * it to the CDK overlay container at the end of the body.
   *
   * @type {boolean | undefined}
   */
  readonly inline?: boolean;

  /**
   * Property flexibleDimensions
   * @readonly
   *
   * @description
   * Whether the panel may shrink to the available viewport space; defaults to false.
   *
   * @type {boolean | undefined}
   */
  readonly flexibleDimensions?: boolean;
  // #endregion
}

/**
 * Class ɵConnectedPanel
 * @class ɵConnectedPanel
 *
 * @description
 * The floating panel of a select, a combobox, an autocomplete or a date picker: a CDK connected
 * overlay below its trigger (above when there is no room, `ɵpanelPositions('bottom', 'start')`),
 * revealed with `animate-menu-in` from the trigger corner (`--menu-from` on the pane, from the
 * position actually taken) and detached once `animate-menu-out` has played (at once under reduced
 * motion or without an animation).
 *
 * One panel per owner: list it in the owner component's `providers`. The owner binds `closing()` to
 * its panel's `data-state="closed"` and filters outside clicks (a press on its own trigger toggles).
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
@Service({ autoProvided: false })
export class ɵConnectedPanel {
  // #region Properties
  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to create the CDK position and overlay strategies for this owner.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property overlayRef
   *
   * @description
   * Current overlay reference, or null when no panel has been created.
   *
   * @type {OverlayRef | null}
   */
  private overlayRef: OverlayRef | null = null;

  /**
   * Property subscriptions
   *
   * @description
   * Overlay event subscriptions released when the panel is disposed.
   *
   * @type {{ unsubscribe(): void }[]}
   */
  private subscriptions: { unsubscribe(): void }[] = [];

  /**
   * Property stopClosing
   *
   * @description
   * Cancels an outstanding exit animation wait, or null when none is pending.
   *
   * @type {(() => void) | null}
   */
  private stopClosing: (() => void) | null = null;

  /**
   * Property attached
   * @readonly
   *
   * @description
   * Signal indicating that the panel is in the page, including during its closing animation.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly attached: WritableSignal<boolean> = signal(false);

  /**
   * Property closing
   * @readonly
   *
   * @description
   * Signal indicating the closing animation; the owner binds it to `data-state="closed"`.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly closing: WritableSignal<boolean> = signal(false);

  /**
   * Property originWidth
   * @readonly
   *
   * @description
   * Signal holding the trigger width in pixels when the panel opened, used as its minimum width.
   *
   * @type {WritableSignal<number>}
   * @default 0
   */
  public readonly originWidth: WritableSignal<number> = signal(0);

  /**
   * Property pane
   *
   * @description
   * Overlay pane containing the panel, or null when no overlay exists.
   *
   * @type {HTMLElement | null}
   * @returns {HTMLElement | null} Overlay pane, or null when no overlay exists.
   */
  public get pane(): HTMLElement | null {
    return this.overlayRef?.overlayElement ?? null;
  }
  // #endregion

  // #region Methods
  /**
   * Method open
   * @method open
   *
   * @description
   * Attaches the configured panel or cancels its pending close when already attached.
   *
   * @param {ɵConnectedPanelConfig} config - Trigger, template and event handlers for the panel.
   */
  public open(config: ɵConnectedPanelConfig): void {
    this.cancelClose();
    if (this.overlayRef?.hasAttached()) return;

    this.originWidth.set(config.origin.getBoundingClientRect().width);
    const strategy: FlexibleConnectedPositionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      config.origin,
    )
      .withPositions(ɵpanelPositions('bottom', 'start'))
      .withFlexibleDimensions(config.flexibleDimensions ?? false)
      .withPush(false)
      .withViewportMargin(8);
    if (config.inline ?? true) strategy.withPopoverLocation('inline');
    const overlayRef: OverlayRef = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    this.overlayRef = overlayRef;
    this.subscriptions = [
      // The panel opens from the corner of the trigger it is attached to (`animate-menu-in`).
      strategy.positionChanges.subscribe((change) => {
        overlayRef.overlayElement.style.setProperty(
          '--menu-from',
          ɵmenuFrom(change.connectionPair),
        );
      }),
      overlayRef.outsidePointerEvents().subscribe((event) => {
        config.outsideClick(event);
      }),
    ];
    const keydown: ((event: KeyboardEvent) => void) | undefined = config.keydown;
    if (keydown) this.subscriptions.push(overlayRef.keydownEvents().subscribe(keydown));
    overlayRef.attach(new TemplatePortal(config.template, config.viewContainerRef));
    this.attached.set(true);
  }

  /**
   * Method close
   * @method close
   *
   * @description
   * Plays the closing animation of `panel` (the element bound to `closing()`), then removes the
   * panel; `done` runs once it is gone. Does nothing when the panel is closed or already closing.
   *
   * @param {HTMLElement | null | undefined} panel - Element whose exit animation is observed.
   * @param {() => void} [done] - Callback invoked after the panel has been disposed.
   */
  public close(panel: HTMLElement | null | undefined, done?: () => void): void {
    if (!this.overlayRef?.hasAttached() || this.closing()) return;
    this.closing.set(true);
    this.stopClosing = ɵafterExitAnimation(
      panel,
      () => {
        this.dispose();
        done?.();
      },
      { fallback: CLOSE_FALLBACK_MS },
    );
  }

  /**
   * Method reposition
   * @method reposition
   *
   * @description
   * Repositions the attached panel after its content changes size; does nothing without an overlay.
   */
  public reposition(): void {
    this.overlayRef?.updatePosition();
  }

  /**
   * Method contains
   * @method contains
   *
   * @description
   * Checks whether a nested trigger or event target belongs to the panel's overlay.
   *
   * @param {Node} node - Node to locate in the overlay.
   *
   * @returns {boolean} Whether the overlay contains the node; false when no overlay exists.
   */
  public contains(node: Node): boolean {
    return this.overlayRef?.overlayElement.contains(node) ?? false;
  }

  /**
   * Method dispose
   * @method dispose
   *
   * @description
   * Cancels closing, unsubscribes from overlay events and removes the panel without animation.
   */
  public dispose(): void {
    this.cancelClose();
    for (const subscription of this.subscriptions) subscription.unsubscribe();
    this.subscriptions = [];
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.attached.set(false);
  }

  /**
   * Method cancelClose
   * @method cancelClose
   *
   * @description
   * Stops any pending exit-animation wait and clears the closing signal without disposing the panel.
   */
  private cancelClose(): void {
    this.stopClosing?.();
    this.stopClosing = null;
    this.closing.set(false);
  }
  // #endregion
}
