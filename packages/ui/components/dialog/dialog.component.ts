import { _IdGenerator } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  inject,
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
import { ɵFOCUS_INSET, ɵModalOverlay } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';

import { CwDialogDescription } from './dialog-description/dialog-description.directive';
import { CW_DIALOG, type CwDialogContext } from './dialog.token';
import type { CwDialogCloseReason, CwDialogSize } from './dialog.types';

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

/**
 * Constant LAYOUTS
 *
 * @description
 * Panel layout classes.
 *
 * @type {Readonly<Record<'simple' | 'scrollable', string>>}
 */
const LAYOUTS: Readonly<Record<'simple' | 'scrollable', string>> = {
  simple: 'gap-4 p-6',
  scrollable: 'max-h-[calc(100dvh-2rem)]',
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
  lg: 'w-[calc(100vw-2rem)] max-w-2xl',
  full: 'h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)]',
};

// The body takes the remaining height when the window is taller than its content (`full`, mobile).
/**
 * Constant BODIES
 *
 * @description
 * Body layout classes.
 *
 * @type {Readonly<Record<'simple' | 'full' | 'scrollable', string>>}
 */
const BODIES: Readonly<Record<'simple' | 'full' | 'scrollable', string>> = {
  simple: 'min-h-0 min-w-0 flex-1 empty:hidden max-md:overflow-y-auto',
  full: 'min-h-0 min-w-0 flex-1 overflow-y-auto empty:hidden',
  scrollable: `min-h-0 flex-1 overflow-y-auto px-6 py-3 [scrollbar-color:var(--color-track)_transparent] [scrollbar-width:thin] ${ɵFOCUS_INSET}`,
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
 * `closed` emits the reason once the exit animation ends. `scrollable` pins the header and footer
 * and scrolls the body (a focusable region; mark the first field `cdkFocusInitial` in a scrollable
 * form). Under 768 px the window fills the screen.
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
   * Maximum dialog size.
   *
   * @type {InputSignal<CwDialogSize>}
   */
  public readonly size: InputSignal<CwDialogSize> = input<CwDialogSize>('default');

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
   * Accessible name of the close button.
   *
   * @type {InputSignal<string>}
   */
  public readonly closeLabel: InputSignal<string> = input('Fermer');

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
  protected readonly panelClasses: Signal<string> = computed(
    () =>
      `${PANEL} ${this.scrollable() ? LAYOUTS.scrollable : LAYOUTS.simple} ${SIZES[this.size()]}`,
  );

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
    if (this.scrollable()) return BODIES.scrollable;
    return this.size() === 'full' ? BODIES.full : BODIES.simple;
  });

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
    inject(DestroyRef).onDestroy(() => {
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
      onKeydown: (event) => {
        this.onKeydown(event);
      },
      onBackdropClick: () => {
        if (this.closeOnOverlayClick()) this.requestClose('overlay');
      },
      onExternalClose: () => {
        this.open.set(false);
        this.closed.emit('action');
      },
    });
  }

  /**
   * Method detach
   *
   * @description
   * Detaches the modal overlay and emits the close reason.
   */
  private detach(): void {
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
