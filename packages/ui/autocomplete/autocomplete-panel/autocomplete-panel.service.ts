import {
  DOCUMENT,
  Injectable,
  Injector,
  type TemplateRef,
  type ViewContainerRef,
  inject,
  signal,
} from '@angular/core';
import {
  type OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ɵmenuFrom, ɵpanelPositions, ɵprefersReducedMotion } from '@cadenway/ui/core';

/* Longest `menu-out` of `@cadenway/tokens` (240 ms) plus a margin: the panel detaches even when no
   `animationend` comes (a hidden tab, an animation cancelled by the browser). */
const CLOSE_FALLBACK_MS = 300;

/** What the panel needs to open: its trigger, its template and who to tell about outside clicks. */
export interface AutocompletePanelConfig {
  /** The element the panel opens against and whose width it takes at least (the field). */
  readonly origin: HTMLElement;
  /** The panel's template, rendered in the overlay. */
  readonly template: TemplateRef<unknown>;
  /** The view container of the component that declares the template. */
  readonly viewContainerRef: ViewContainerRef;
  /** Called on a pointer press outside the panel (the trigger included: the caller filters it). */
  readonly outsideClick: (event: MouseEvent) => void;
}

/**
 * The floating panel of `cw-autocomplete`: a CDK connected overlay below its field (above when
 * there is no room), opened with `animate-menu-in` from the field corner and detached once
 * `animate-menu-out` has played (at once under reduced motion).
 *
 * The overlay is a native popover inserted right after the field: it paints in the top layer but
 * inherits the theme scope (`data-theme`) of the field. Provided by each autocomplete panel; not
 * exported from the entry point. The same controller serves `cw-select` and `cw-combobox`, each in
 * its own entry point, until a shared one lands in `@cadenway/ui/core`.
 */
@Injectable()
export class AutocompletePanel {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private overlayRef: OverlayRef | null = null;
  private subscriptions: { unsubscribe(): void }[] = [];
  private stopClosing: (() => void) | null = null;

  /** Whether the panel is in the page, closing animation included. */
  readonly attached = signal(false);
  /** Whether the panel plays its closing animation: bind it to `data-state="closed"`. */
  readonly closing = signal(false);
  /** The width of the trigger when the panel opened, the panel's minimum width. */
  readonly originWidth = signal(0);

  /** Shows the panel, or keeps it when it was closing. */
  open(config: AutocompletePanelConfig): void {
    this.cancelClose();
    if (this.overlayRef?.hasAttached()) return;

    this.originWidth.set(config.origin.getBoundingClientRect().width);
    const strategy = createFlexibleConnectedPositionStrategy(this.injector, config.origin)
      .withPositions(ɵpanelPositions('bottom', 'start'))
      .withPopoverLocation('inline')
      .withFlexibleDimensions(false)
      .withPush(false)
      .withViewportMargin(8);
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
    overlayRef.attach(new TemplatePortal(config.template, config.viewContainerRef));
    this.attached.set(true);
  }

  /** Plays the closing animation, then removes the panel; `done` runs once it is gone. */
  close(panel: HTMLElement | null | undefined, done?: () => void): void {
    if (!this.overlayRef?.hasAttached() || this.closing()) return;
    const finish = (): void => {
      this.cancelClose();
      this.dispose();
      done?.();
    };
    // No animation to wait for: reduced motion, or a DOM without Web Animations (tests, SSR).
    if (
      !panel ||
      ɵprefersReducedMotion(this.document) ||
      typeof panel.getAnimations !== 'function'
    ) {
      finish();
      return;
    }
    this.closing.set(true);
    const onEnd = (event: AnimationEvent): void => {
      if (event.target === panel) finish();
    };
    panel.addEventListener('animationend', onEnd);
    const timer = setTimeout(finish, CLOSE_FALLBACK_MS);
    this.stopClosing = () => {
      panel.removeEventListener('animationend', onEnd);
      clearTimeout(timer);
    };
  }

  /** Repositions the panel after its content changed size. */
  reposition(): void {
    this.overlayRef?.updatePosition();
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
