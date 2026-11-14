import { _IdGenerator } from '@angular/cdk/a11y';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  DestroyRef,
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
import { ɵFOCUS_INSET, ɵModalOverlay } from '@cadenway/ui/core';
import { CwInput } from '@cadenway/ui/components/input';

import { CwAlertDialogDescription } from './alert-dialog-description/alert-dialog-description.directive';
import { CW_ALERT_DIALOG_MAX_ITEMS } from './alert-dialog.constants';
import { CW_ALERT_DIALOG, type CwAlertDialogContext } from './alert-dialog.token';
import type {
  CwAlertDialogCancelReason,
  CwAlertDialogSize,
  CwAlertDialogVariant,
} from './alert-dialog.types';

/* Literal class strings (Alert Dialog sheet and preview of the Design System artifact, mockup
   `App.dc.html` for the item list and the typed confirmation), so Tailwind finds them in the
   compiled package. */
/**
 * Constant PANEL
 *
 * @description
 * Classes for the alert dialog panel.
 *
 * @type {string}
 */
const PANEL: string =
  'relative grid w-[calc(100vw-2rem)] gap-4 rounded-xl border bg-popover p-6 text-popover-foreground shadow-xl outline-none max-sm:p-4 ' +
  'animate-pop-in motion-reduce:animate-none data-[state=closed]:animate-pop-out motion-reduce:data-[state=closed]:animate-none';

/**
 * Constant SIZES
 *
 * @description
 * Panel size classes.
 *
 * @type {Record<CwAlertDialogSize, string>}
 */
const SIZES: Record<CwAlertDialogSize, string> = {
  sm: 'max-w-xs text-center',
  default: 'max-w-md',
};

/**
 * Constant HEADERS
 *
 * @description
 * Header layout classes by dialog size.
 *
 * @type {Record<CwAlertDialogSize, string>}
 */
const HEADERS: Record<CwAlertDialogSize, string> = {
  sm: 'grid gap-1.5',
  default: 'flex flex-col gap-2',
};

/**
 * Constant FOOTERS
 *
 * @description
 * Footer layout classes by dialog size.
 *
 * @type {Record<CwAlertDialogSize, string>}
 */
const FOOTERS: Record<CwAlertDialogSize, string> = {
  sm: 'grid grid-cols-2 gap-2',
  default: 'flex justify-end gap-2',
};

// The list scrolls past nine lines: it is focusable so the keyboard scrolls it too.
/**
 * Constant ITEMS
 *
 * @description
 * Scrollable item list classes.
 *
 * @type {string}
 */
const ITEMS: string = `flex max-h-36 flex-col gap-0.5 overflow-y-auto rounded-lg bg-muted px-3 py-2 text-start text-sm ${ɵFOCUS_INSET}`;

/**
 * Component CwAlertDialog
 *
 * @description
 * A modal confirmation before an irreversible or heavy action: it names the object, counts what
 * will be lost and closes only on an explicit choice (Alert Dialog sheet of the Design System
 * artifact). An action that can be undone runs at once with « Annuler » in a toast instead.
 *
 * Compose it with `h2[cwAlertDialogTitle]` (the question, with the object's name),
 * `p[cwAlertDialogDescription]` (the consequences, counted), an optional `cw-alert-dialog-media`,
 * then `button[cwAlertDialogCancel]` (`outline` « Annuler ») and `button[cwAlertDialogAction]`
 * (`destructive` or `default`, repeating the verb of the title); the parts are laid out in that
 * order. It renders in a CDK Dialog overlay only while `open`, `role="alertdialog"` named by the
 * title and described by the description; focus starts on « Annuler » (on the field when
 * `confirmText` is set), stays trapped inside and returns to the trigger on close. A backdrop click
 * never closes it.
 *
 * `items` lists the objects concerned when there are several: the first eight, then « + n
 * autres » (`moreLabel`). `confirmText` adds the field « Pour confirmer, saisissez … »
 * (`confirmLabel`): the action stays `aria-disabled` until the typed text equals it. The action
 * (click, or Enter in the field) emits `confirm`, then the dialog closes unless `pending` became
 * true meanwhile: the consumer closes it with `[(open)]` or `close()` when the work ends (the
 * action shows its spinner through `[loading]`). « Annuler » and Escape emit `cancel` and close;
 * both are ignored while `pending`. Escape first closes a popup still open inside it.
 */
@Component({
  selector: 'cw-alert-dialog',
  imports: [CwInput],
  providers: [ɵModalOverlay, { provide: CW_ALERT_DIALOG, useExisting: CwAlertDialog }],
  templateUrl: './alert-dialog.component.html',
})
export class CwAlertDialog implements CwAlertDialogContext {
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
   * Property variant
   * @readonly
   *
   * @description
   * Style of the action and media.
   *
   * @type {InputSignal<CwAlertDialogVariant>}
   */
  public readonly variant: InputSignal<CwAlertDialogVariant> =
    input<CwAlertDialogVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Dialog size and layout.
   *
   * @type {InputSignal<CwAlertDialogSize>}
   */
  public readonly size: InputSignal<CwAlertDialogSize> = input<CwAlertDialogSize>('default');

  /**
   * Property confirmText
   * @readonly
   *
   * @description
   * Text that must be typed to confirm.
   *
   * @type {InputSignal<string>}
   */
  public readonly confirmText: InputSignal<string> = input('');

  /**
   * Property confirmLabel
   * @readonly
   *
   * @description
   * Label of the confirmation field.
   *
   * @type {InputSignal<string>}
   */
  public readonly confirmLabel: InputSignal<string> = input('Pour confirmer, saisissez');

  /**
   * Property pending
   * @readonly
   *
   * @description
   * Whether the action is running.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly pending: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property items
   * @readonly
   *
   * @description
   * Objects concerned by the action.
   *
   * @type {InputSignal<readonly string[]>}
   */
  public readonly items: InputSignal<readonly string[]> = input<readonly string[]>([]);

  /**
   * Property moreLabel
   * @readonly
   *
   * @description
   * Label for items beyond the display limit.
   *
   * @type {InputSignal<(count: number) => string>}
   */
  public readonly moreLabel: InputSignal<(count: number) => string> = input<
    (count: number) => string
  >((count) => `+ ${String(count)} autres`);

  /**
   * Property confirm
   * @readonly
   *
   * @description
   * Emits when the action is confirmed.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly confirm: OutputEmitterRef<void> = output();

  /**
   * Property cancel
   * @readonly
   *
   * @description
   * Emits the user cancellation reason.
   *
   * @type {OutputEmitterRef<CwAlertDialogCancelReason>}
   */
  public readonly cancel: OutputEmitterRef<CwAlertDialogCancelReason> =
    output<CwAlertDialogCancelReason>();

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
   * Property inputId
   * @readonly
   *
   * @description
   * Identifier of the confirmation field.
   *
   * @type {string}
   */
  protected readonly inputId: string;

  /**
   * Property typed
   * @readonly
   *
   * @description
   * Text typed into the confirmation field.
   *
   * @type {WritableSignal<string>}
   */
  protected readonly typed: WritableSignal<string> = signal('');

  /**
   * Property confirmed
   * @readonly
   *
   * @description
   * Whether the confirmation text matches.
   *
   * @type {Signal<boolean>}
   */
  public readonly confirmed: Signal<boolean> = computed(() => {
    const expected: string = this.confirmText();
    return !expected || this.typed().trim() === expected;
  });

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
   * Panel classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly panelClasses: Signal<string> = computed(
    () => `${PANEL} ${SIZES[this.size()]}`,
  );

  /**
   * Property headerClasses
   * @readonly
   *
   * @description
   * Header classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly headerClasses: Signal<string> = computed(() => HEADERS[this.size()]);

  /**
   * Property footerClasses
   * @readonly
   *
   * @description
   * Footer classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly footerClasses: Signal<string> = computed(() => FOOTERS[this.size()]);

  /**
   * Property itemsClasses
   * @readonly
   *
   * @description
   * Classes for the scrollable item list.
   *
   * @type {string}
   */
  protected readonly itemsClasses: string = ITEMS;

  /**
   * Property shownItems
   * @readonly
   *
   * @description
   * Items displayed within the limit.
   *
   * @type {Signal<string[]>}
   */
  protected readonly shownItems: Signal<string[]> = computed(() =>
    this.items().slice(0, CW_ALERT_DIALOG_MAX_ITEMS),
  );

  /**
   * Property moreCount
   * @readonly
   *
   * @description
   * Number of items beyond the display limit.
   *
   * @type {Signal<number>}
   */
  protected readonly moreCount: Signal<number> = computed(() =>
    Math.max(0, this.items().length - CW_ALERT_DIALOG_MAX_ITEMS),
  );
  // Mockup App.dc.html: the field turns invalid once something is typed that does not match.
  /**
   * Property mismatch
   * @readonly
   *
   * @description
   * Whether typed confirmation text does not match.
   *
   * @type {Signal<boolean>}
   */
  protected readonly mismatch: Signal<boolean> = computed(
    () => this.typed() !== '' && !this.confirmed(),
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
   * Projected dialog description when present.
   *
   * @type {Signal<CwAlertDialogDescription | undefined>}
   */
  private readonly description: Signal<CwAlertDialogDescription | undefined> = contentChild(
    CwAlertDialogDescription,
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
   * Injector used to schedule confirmation handling.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

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
   * Property origin
   *
   * @description
   * Trigger receiving focus after close.
   *
   * @type {HTMLElement | null}
   */
  private origin: HTMLElement | null = null;

  /**
   * Property keyboardClose
   *
   * @description
   * Whether the dialog closed through Escape.
   *
   * @type {boolean}
   */
  private keyboardClose: boolean = false;
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
    this.titleId = ids.getId('cw-alert-dialog-title-');
    this.descriptionId = ids.getId('cw-alert-dialog-description-');
    this.inputId = ids.getId('cw-alert-dialog-confirm-');
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
   * Closes the dialog after an action.
   */
  public close(): void {
    this.open.set(false);
  }

  /**
   * Method requestCancel
   *
   * @description
   * Cancels the dialog when no action is pending.
   *
   * @param {CwAlertDialogCancelReason} reason - User action requesting cancellation.
   */
  public requestCancel(reason: CwAlertDialogCancelReason): void {
    if (!this.overlay.attached || this.pending()) return;
    this.keyboardClose = reason === 'escape';
    this.cancel.emit(reason);
    this.open.set(false);
  }

  /**
   * Method requestConfirm
   *
   * @description
   * Emits confirmation and closes unless an action is pending.
   */
  public requestConfirm(): void {
    if (!this.overlay.attached || this.pending() || !this.confirmed()) return;
    this.confirm.emit();
    // The consumer's `pending` binding reaches this input on the next render: decide then.
    afterNextRender(
      () => {
        if (!this.pending()) this.open.set(false);
      },
      { injector: this.injector },
    );
  }

  /**
   * Method onType
   *
   * @description
   * Updates the typed confirmation text.
   *
   * @param {Event} event - Input event containing the typed confirmation text.
   */
  protected onType(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.typed.set(event.target.value);
  }

  /**
   * Method onEnter
   *
   * @description
   * Requests confirmation from the confirmation field; Enter on the item list does not confirm.
   *
   * @param {Event} event - Enter event received by the confirmation field.
   */
  protected onEnter(event: Event): void {
    event.preventDefault();
    this.requestConfirm();
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
    this.typed.set('');
    this.keyboardClose = false;
    this.overlay.attach({
      role: 'alertdialog',
      template: this.template(),
      viewContainerRef: this.viewContainerRef,
      labelledBy: this.titleId,
      describedBy: this.description() ? this.descriptionId : null,
      // The least risky choice first, never the action (sheet, Accessibilité); the field when the
      // object's name has to be typed.
      autoFocus: this.confirmText() ? `#${this.inputId}` : '[cwAlertDialogCancel]',
      restoreFocus: this.origin,
      onKeydown: (event) => {
        this.onKeydown(event);
      },
      onBackdropClick: () => undefined,
      onExternalClose: () => {
        this.open.set(false);
      },
    });
  }

  /**
   * Method detach
   *
   * @description
   * Detaches the modal overlay and restores focus.
   */
  private detach(): void {
    if (!this.overlay.attached) return;
    this.state.set('closed');
    this.overlay.detach(
      () => {
        this.origin = null;
      },
      this.keyboardClose ? 'keyboard' : undefined,
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
    this.requestCancel('escape');
  }
  // #endregion
}
