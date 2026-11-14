import { Dialog, type DialogRef } from '@angular/cdk/dialog';
import {
  type TemplateRef,
  type ViewContainerRef,
  afterNextRender,
  inject,
  Injector,
  Service,
} from '@angular/core';

import { ɵafterExitAnimation } from '../motion/exit-animation';

/**
 * Constant MODAL_BACKDROP
 *
 * @description
 * Backdrop classes for modal overlays, including entrance, exit and reduced-motion states.
 * The Dialog sheet uses this backdrop in place of a shadow.
 *
 * @type {string}
 */
const MODAL_BACKDROP: string =
  'bg-black/30 dark:bg-black/60 animate-fade-in motion-reduce:animate-none data-[state=closed]:animate-fade-out motion-reduce:data-[state=closed]:animate-none';

/**
 * Constant OPEN_POPUP
 *
 * @description
 * Selector for an expanded popup trigger inside the modal. The integration guide gives the
 * innermost open popup precedence when Escape is pressed.
 *
 * @type {string}
 */
const OPEN_POPUP: string =
  '[aria-expanded="true"][aria-haspopup]:not([aria-haspopup="false"]), [role="combobox"][aria-expanded="true"]';

/**
 * Constant EXIT_FALLBACK_MS
 *
 * @description
 * Timeout in milliseconds after the longest token exit animation plus a margin, so a missing
 * animation event cannot keep a modal open indefinitely.
 *
 * @type {number}
 */
const EXIT_FALLBACK_MS: number = 300;

/**
 * Interface ɵModalOverlayConfig
 * @interface ɵModalOverlayConfig
 *
 * @description
 * Configuration required by `ɵModalOverlay.attach` to open a panel template as a modal.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export interface ɵModalOverlayConfig {
  // #region Properties
  /**
   * Property role
   * @readonly
   *
   * @description
   * Accessible role assigned to the modal container.
   *
   * @type {'dialog' | 'alertdialog'}
   */
  readonly role: 'dialog' | 'alertdialog';

  /**
   * Property template
   * @readonly
   *
   * @description
   * Panel template rendered within the modal container.
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
   * Property labelledBy
   * @readonly
   *
   * @description
   * Identifier of the element that provides the modal's accessible name.
   *
   * @type {string}
   */
  readonly labelledBy: string;

  /**
   * Property describedBy
   * @readonly
   *
   * @description
   * Identifier of the modal description, or null when no description is associated.
   *
   * @type {string | null}
   */
  readonly describedBy: string | null;

  /**
   * Property autoFocus
   * @readonly
   *
   * @description
   * `first-tabbable` or a CSS selector identifying the element focused on open.
   *
   * @type {string}
   */
  readonly autoFocus: string;

  /**
   * Property restoreFocus
   * @readonly
   *
   * @description
   * Element focused on close, or null to restore the element focused before opening.
   *
   * @type {HTMLElement | null}
   */
  readonly restoreFocus: HTMLElement | null;

  /**
   * Property onKeydown
   * @readonly
   *
   * @description
   * Receives keyboard events from the modal so its owner can decide how to handle Escape.
   *
   * @type {(event: KeyboardEvent) => void}
   */
  readonly onKeydown: (event: KeyboardEvent) => void;

  /**
   * Property onBackdropClick
   * @readonly
   *
   * @description
   * Notifies the owner of a backdrop click; the owner decides whether to close the modal.
   *
   * @type {() => void}
   */
  readonly onBackdropClick: () => void;

  /**
   * Property onExternalClose
   * @readonly
   *
   * @description
   * Notifies the owner when the overlay closes externally, for example during navigation.
   *
   * @type {() => void}
   */
  readonly onExternalClose: () => void;
  // #endregion
}

/**
 * Class ɵModalOverlay
 * @class ɵModalOverlay
 *
 * @description
 * The CDK Dialog life cycle behind the panel of `cw-dialog` and `cw-alert-dialog`: opens a template
 * as a modal (focus trap, scroll block, backdrop, `aria-hidden` on the rest of the page, focus
 * returned on close), plays the exit animation before the overlay is disposed, and tells whether an
 * Escape belongs to a popup opened inside the modal.
 *
 * One modal at a time per owner: list it in the owner component's `providers`. The owner decides on
 * Escape and backdrop clicks; `detach` animates out, `dispose` closes at once (owner destroyed).
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
@Service({ autoProvided: false })
export class ɵModalOverlay {
  // #region Properties
  /**
   * Property dialog
   * @readonly
   *
   * @description
   * CDK dialog service used to create modal overlays.
   *
   * @type {Dialog}
   */
  private readonly dialog: Dialog = inject(Dialog);

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to schedule the exit-animation wait after the next render.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property ref
   *
   * @description
   * Current CDK dialog reference, or null when no modal is open.
   *
   * @type {DialogRef | null}
   */
  private ref: DialogRef | null = null;

  /**
   * Property leaving
   *
   * @description
   * Whether an exit animation has already been requested for the current modal.
   *
   * @type {boolean}
   * @default false
   */
  private leaving: boolean = false;

  /**
   * Property attached
   *
   * @description
   * Whether a modal is open, including while its exit animation runs.
   *
   * @type {boolean}
   * @returns {boolean} Whether a modal remains attached.
   */
  public get attached(): boolean {
    return this.ref !== null;
  }

  /**
   * Property panel
   *
   * @description
   * First element of the CDK dialog container, or null when no such panel is present.
   *
   * @type {HTMLElement | null}
   * @returns {HTMLElement | null} Modal panel, or null when it is absent.
   */
  public get panel(): HTMLElement | null {
    return (
      this.ref?.overlayRef.overlayElement.querySelector<HTMLElement>('.cdk-dialog-container > *') ??
      null
    );
  }
  // #endregion

  // #region Methods
  /**
   * Method attach
   * @method attach
   *
   * @description
   * Opens the configured template as a modal; does nothing while another modal is attached.
   *
   * @param {ɵModalOverlayConfig} config - Template, accessibility attributes and owner callbacks.
   */
  public attach(config: ɵModalOverlayConfig): void {
    if (this.ref) return;
    const ref: DialogRef = this.dialog.open(config.template, {
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
   * Method escapeBelongsElsewhere
   * @method escapeBelongsElsewhere
   *
   * @description
   * Whether Escape belongs to something else than the modal: a handler already took it, it comes
   * from another overlay (a menu opened from the dialog), or a popup opened inside the panel is
   * still expanded.
   *
   * @param {KeyboardEvent} event - Escape key event received by the modal owner.
   *
   * @returns {boolean} Whether the modal should leave the event to another handler or popup.
   */
  public escapeBelongsElsewhere(event: KeyboardEvent): boolean {
    if (event.defaultPrevented || !this.ref) return true;
    const pane: HTMLElement = this.ref.overlayRef.overlayElement;
    const target: Element | null = event.target instanceof Element ? event.target : null;
    const targetPane: Element | null | undefined = target?.closest('.cdk-overlay-pane');
    if (targetPane && targetPane !== pane) return true;
    return pane.querySelector(OPEN_POPUP) !== null;
  }

  /**
   * Method detach
   * @method detach
   *
   * @description
   * Plays the exit animation (the owner has already set `data-state="closed"` on its panel), then
   * disposes the overlay and calls `done`. Immediate under reduced motion or without animation.
   *
   * @param {() => void} done - Callback invoked once the overlay is closed.
   * @param {'keyboard' | 'mouse'} [focusOrigin] - Origin passed to CDK focus restoration when set.
   */
  public detach(done: () => void, focusOrigin?: 'keyboard' | 'mouse'): void {
    const ref: DialogRef | null = this.ref;
    if (!ref || this.leaving) return;
    this.leaving = true;
    ref.overlayRef.backdropElement?.setAttribute('data-state', 'closed');
    afterNextRender(
      () => {
        ɵafterExitAnimation(
          this.panel,
          () => {
            if (this.ref !== ref) return;
            this.ref = null;
            this.leaving = false;
            ref.close(undefined, focusOrigin ? { focusOrigin } : undefined);
            done();
          },
          { fallback: EXIT_FALLBACK_MS },
        );
      },
      { injector: this.injector },
    );
  }

  /**
   * Method dispose
   * @method dispose
   *
   * @description
   * Closes the current overlay immediately without an animation, such as when its owner is destroyed.
   */
  public dispose(): void {
    const ref: DialogRef | null = this.ref;
    this.ref = null;
    this.leaving = false;
    ref?.close();
  }
  // #endregion
}
