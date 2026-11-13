import {
  type OverlayRef,
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
} from '@angular/core';

import { ɵafterExitAnimation } from '../motion/exit-animation';
import { ɵmenuFrom, ɵpanelPositions } from './overlay-positions';

/* Longest `menu-out` of `@cadenway/tokens` (240 ms) plus a margin: the panel detaches even when no
   `animationend` comes (a hidden tab, an animation cancelled by the browser). */
const CLOSE_FALLBACK_MS = 300;

/**
 * What `ɵConnectedPanel.open` needs: the trigger, the panel template and who to tell about outside
 * clicks and keys.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export interface ɵConnectedPanelConfig {
  /** The element the panel opens against and whose width it takes at least. */
  readonly origin: HTMLElement;
  /** The panel's template, rendered in the overlay. */
  readonly template: TemplateRef<unknown>;
  /** The view container of the component that declares the template. */
  readonly viewContainerRef: ViewContainerRef;
  /** Called on a pointer press outside the panel (the trigger included: the caller filters it). */
  readonly outsideClick: (event: MouseEvent) => void;
  /**
   * Called on each key pressed while the focus is inside the panel (Escape). Omit it when the focus
   * stays on the trigger: an overlay that listens to keys takes them from the overlays below it.
   */
  readonly keydown?: (event: KeyboardEvent) => void;
  /**
   * Whether the overlay is a native popover inserted right after the trigger (the default): it
   * paints in the top layer but inherits the trigger's theme scope (`data-theme`). False attaches
   * it to the CDK overlay container at the end of the body.
   */
  readonly inline?: boolean;
  /** Whether the panel may shrink to the room left in the viewport (false by default). */
  readonly flexibleDimensions?: boolean;
}

/**
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
  private readonly injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;
  private subscriptions: { unsubscribe(): void }[] = [];
  private stopClosing: (() => void) | null = null;

  /** Whether the panel is in the page, closing animation included. */
  readonly attached = signal(false);
  /** Whether the panel plays its closing animation: bind it to `data-state="closed"`. */
  readonly closing = signal(false);
  /** The width of the trigger when the panel opened, the panel's minimum width. */
  readonly originWidth = signal(0);

  /** The overlay pane holding the panel while it is in the page, else null. */
  get pane(): HTMLElement | null {
    return this.overlayRef?.overlayElement ?? null;
  }

  /** Shows the panel, or keeps it when it was closing. */
  open(config: ɵConnectedPanelConfig): void {
    this.cancelClose();
    if (this.overlayRef?.hasAttached()) return;

    this.originWidth.set(config.origin.getBoundingClientRect().width);
    const strategy = createFlexibleConnectedPositionStrategy(this.injector, config.origin)
      .withPositions(ɵpanelPositions('bottom', 'start'))
      .withFlexibleDimensions(config.flexibleDimensions ?? false)
      .withPush(false)
      .withViewportMargin(8);
    if (config.inline ?? true) strategy.withPopoverLocation('inline');
    const overlayRef = createOverlayRef(this.injector, {
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
    const keydown = config.keydown;
    if (keydown) this.subscriptions.push(overlayRef.keydownEvents().subscribe(keydown));
    overlayRef.attach(new TemplatePortal(config.template, config.viewContainerRef));
    this.attached.set(true);
  }

  /**
   * Plays the closing animation of `panel` (the element bound to `closing()`), then removes the
   * panel; `done` runs once it is gone. Does nothing when the panel is closed or already closing.
   */
  close(panel: HTMLElement | null | undefined, done?: () => void): void {
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

  /** Repositions the panel after its content changed size. */
  reposition(): void {
    this.overlayRef?.updatePosition();
  }

  /** Whether `node` is inside the panel (a nested trigger, a click target). */
  contains(node: Node): boolean {
    return this.overlayRef?.overlayElement.contains(node) ?? false;
  }

  /** Removes the panel at once, without animation. */
  dispose(): void {
    this.cancelClose();
    for (const subscription of this.subscriptions) subscription.unsubscribe();
    this.subscriptions = [];
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.attached.set(false);
  }

  private cancelClose(): void {
    this.stopClosing?.();
    this.stopClosing = null;
    this.closing.set(false);
  }
}
