import { Dialog, type DialogRef } from '@angular/cdk/dialog';
import {
  type Injector,
  type TemplateRef,
  type ViewContainerRef,
  afterNextRender,
} from '@angular/core';
import { ɵprefersReducedMotion } from '@cadenway/ui/core';

/*
 * The CDK Dialog life cycle behind `cw-alert-dialog`'s panel: open a template as a modal (focus trap,
 * scroll block, backdrop, `aria-hidden` on the rest of the page, focus returned on close), play the
 * exit animation before the overlay is disposed, and tell whether an Escape belongs to a popup
 * opened inside the dialog. Internal to the entry point; `@cadenway/ui/dialog` keeps the same
 * copy because entry points only share public API (move it to `core/overlay` as a `ɵ` helper).
 */

/** Backdrop of every modal (Dialog sheet): it replaces any shadow, fades in and out. */
export const MODAL_BACKDROP =
  'bg-black/30 dark:bg-black/60 animate-fade-in motion-reduce:animate-none data-[state=closed]:animate-fade-out motion-reduce:data-[state=closed]:animate-none';

// A trigger inside the panel whose popup (menu, listbox, combobox, date picker) is open: Escape
// closes that popup first (integration guide: one menu open at a time, Escape closes the innermost).
const OPEN_POPUP =
  '[aria-expanded="true"][aria-haspopup]:not([aria-haspopup="false"]), [role="combobox"][aria-expanded="true"]';

// Longest exit animation of the tokens (`pop-out` 180 ms, `fade-out` 180 ms) plus a margin: the
// overlay is disposed even when `animationend` never comes (tab in the background).
const EXIT_FALLBACK_MS = 300;

/** What a modal needs to open its panel template. */
export interface ModalOverlayConfig {
  readonly role: 'dialog' | 'alertdialog';
  readonly template: TemplateRef<unknown>;
  readonly viewContainerRef: ViewContainerRef;
  readonly labelledBy: string;
  readonly describedBy: string | null;
  /** `first-tabbable`, or a CSS selector of the element focused on open. */
  readonly autoFocus: string;
  /** The element focused on close; the element focused before opening when null. */
  readonly restoreFocus: HTMLElement | null;
  readonly onKeydown: (event: KeyboardEvent) => void;
  readonly onBackdropClick: () => void;
  /** The overlay was closed from outside (navigation, `Dialog.closeAll`). */
  readonly onExternalClose: () => void;
}

/** One modal at a time per owner: attach, detach with the exit animation, dispose at once. */
export class ModalOverlay {
  private ref: DialogRef | null = null;
  private leaving = false;

  constructor(
    private readonly dialog: Dialog,
    private readonly document: Document,
    private readonly injector: Injector,
  ) {}

  get attached(): boolean {
    return this.ref !== null;
  }

  /** The panel element: the first element of the CDK dialog container. */
  get panel(): HTMLElement | null {
    return (
      this.ref?.overlayRef.overlayElement.querySelector<HTMLElement>('.cdk-dialog-container > *') ??
      null
    );
  }

  attach(config: ModalOverlayConfig): void {
    if (this.ref) return;
    const ref = this.dialog.open(config.template, {
      role: config.role,
      ariaModal: true,
      ariaLabelledBy: config.labelledBy,
      ariaDescribedBy: config.describedBy,
      viewContainerRef: config.viewContainerRef,
      // The owner decides on Escape and backdrop clicks (reasons, `pending`, inner popups).
      disableClose: true,
      autoFocus: config.autoFocus,
      restoreFocus: config.restoreFocus ?? true,
      // The CDK adds each class with `classList.add`: one token per entry.
      backdropClass: MODAL_BACKDROP.split(' '),
      // The animations are the tokens' keyframes on the panel and the backdrop.
      disableAnimations: true,
    });
    this.ref = ref;
    this.leaving = false;
    ref.keydownEvents.subscribe(config.onKeydown);
    ref.backdropClick.subscribe(config.onBackdropClick);
    ref.closed.subscribe(() => {
      if (this.ref !== ref) return;
      this.ref = null;
      this.leaving = false;
      config.onExternalClose();
    });
  }

  /**
   * Whether Escape belongs to something else than the modal: a handler already took it, it comes
   * from another overlay (a menu opened from the dialog), or a popup opened inside the panel is
   * still expanded.
   */
  escapeBelongsElsewhere(event: KeyboardEvent): boolean {
    if (event.defaultPrevented || !this.ref) return true;
    const pane = this.ref.overlayRef.overlayElement;
    const target = event.target instanceof Element ? event.target : null;
    const targetPane = target?.closest('.cdk-overlay-pane');
    if (targetPane && targetPane !== pane) return true;
    return pane.querySelector(OPEN_POPUP) !== null;
  }

  /**
   * Plays the exit animation (the owner has already set `data-state="closed"` on its panel), then
   * disposes the overlay and calls `done`. Immediate under reduced motion or without animation.
   */
  detach(done: () => void, focusOrigin?: 'keyboard' | 'mouse'): void {
    const ref = this.ref;
    if (!ref || this.leaving) return;
    this.leaving = true;
    ref.overlayRef.backdropElement?.setAttribute('data-state', 'closed');
    afterNextRender(
      () => {
        this.whenAnimated(this.panel, () => {
          if (this.ref !== ref) return;
          this.ref = null;
          this.leaving = false;
          ref.close(undefined, focusOrigin ? { focusOrigin } : undefined);
          done();
        });
      },
      { injector: this.injector },
    );
  }

  /** Closes at once, without animation (the owner is destroyed). */
  dispose(): void {
    const ref = this.ref;
    this.ref = null;
    this.leaving = false;
    ref?.close();
  }

  private whenAnimated(element: HTMLElement | null, done: () => void): void {
    const view = this.document.defaultView;
    const name = element && view ? view.getComputedStyle(element).animationName : '';
    if (!element || !name || name === 'none' || ɵprefersReducedMotion(this.document)) {
      done();
      return;
    }
    let finished = false;
    const finish = (): void => {
      if (finished) return;
      finished = true;
      element.removeEventListener('animationend', onEnd);
      clearTimeout(timer);
      done();
    };
    const onEnd = (event: AnimationEvent): void => {
      if (event.target === element) finish();
    };
    const timer = setTimeout(finish, EXIT_FALLBACK_MS);
    element.addEventListener('animationend', onEnd);
  }
}
