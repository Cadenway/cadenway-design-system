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
const PANEL =
  'relative grid w-[calc(100vw-2rem)] gap-4 rounded-xl border bg-popover p-6 text-popover-foreground shadow-xl outline-none max-sm:p-4 ' +
  'animate-pop-in motion-reduce:animate-none data-[state=closed]:animate-pop-out motion-reduce:data-[state=closed]:animate-none';

const SIZES: Record<CwAlertDialogSize, string> = {
  sm: 'max-w-xs text-center',
  default: 'max-w-md',
};

const HEADERS: Record<CwAlertDialogSize, string> = {
  sm: 'grid gap-1.5',
  default: 'flex flex-col gap-2',
};

const FOOTERS: Record<CwAlertDialogSize, string> = {
  sm: 'grid grid-cols-2 gap-2',
  default: 'flex justify-end gap-2',
};

// The list scrolls past nine lines: it is focusable so the keyboard scrolls it too.
const ITEMS = `flex max-h-36 flex-col gap-0.5 overflow-y-auto rounded-lg bg-muted px-3 py-2 text-start text-sm ${ɵFOCUS_INSET}`;

/**
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
  /** Whether the confirmation is open; two-way with `[(open)]`. */
  readonly open = model(false);
  /** Style of the action and the media. */
  readonly variant = input<CwAlertDialogVariant>('default');
  /** Width and layout. */
  readonly size = input<CwAlertDialogSize>('default');
  /** Text to type (the object's name) before the action is enabled; empty for none. */
  readonly confirmText = input('');
  /** Label of the confirmation field, followed by `confirmText` in bold. */
  readonly confirmLabel = input('Pour confirmer, saisissez');
  /** The action is running: nothing closes the dialog but the consumer; `aria-busy` is set. */
  readonly pending = input(false, { transform: booleanAttribute });
  /** The objects concerned, listed when there are more than one. */
  readonly items = input<readonly string[]>([]);
  /** Text of the last line when `items` holds more than eight entries. */
  readonly moreLabel = input<(count: number) => string>((count) => `+ ${String(count)} autres`);
  /** Emits when the action is activated (click, or Enter in the confirmation field). */
  readonly confirm = output();
  /** Emits when « Annuler » or Escape closes the dialog. */
  // The sheet names the output `cancel`; it is emitted by the component, never by a native dialog.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<CwAlertDialogCancelReason>();

  /** Id given to `h2[cwAlertDialogTitle]`, which names the dialog. */
  readonly titleId: string;
  /** Id given to `p[cwAlertDialogDescription]`, which describes the dialog. */
  readonly descriptionId: string;
  protected readonly inputId: string;

  protected readonly typed = signal('');
  /** The typed text matches `confirmText` (always true without one). */
  readonly confirmed = computed(() => {
    const expected = this.confirmText();
    return !expected || this.typed().trim() === expected;
  });

  protected readonly state = signal<'open' | 'closed'>('open');
  protected readonly panelClasses = computed(() => `${PANEL} ${SIZES[this.size()]}`);
  protected readonly headerClasses = computed(() => HEADERS[this.size()]);
  protected readonly footerClasses = computed(() => FOOTERS[this.size()]);
  protected readonly itemsClasses = ITEMS;
  protected readonly shownItems = computed(() => this.items().slice(0, CW_ALERT_DIALOG_MAX_ITEMS));
  protected readonly moreCount = computed(() =>
    Math.max(0, this.items().length - CW_ALERT_DIALOG_MAX_ITEMS),
  );
  // Mockup App.dc.html: the field turns invalid once something is typed that does not match.
  protected readonly mismatch = computed(() => this.typed() !== '' && !this.confirmed());

  private readonly template = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly description = contentChild(CwAlertDialogDescription, { descendants: true });
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly overlay = inject(ɵModalOverlay);
  private origin: HTMLElement | null = null;
  private keyboardClose = false;

  constructor() {
    const ids = inject(_IdGenerator);
    this.titleId = ids.getId('cw-alert-dialog-title-');
    this.descriptionId = ids.getId('cw-alert-dialog-description-');
    this.inputId = ids.getId('cw-alert-dialog-confirm-');
    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open) this.attach();
        else this.detach();
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.overlay.dispose();
    });
  }

  /** Opens the dialog; focus returns to `origin` (the trigger) when it closes. */
  show(origin?: HTMLElement): void {
    this.origin = origin ?? null;
    this.open.set(true);
  }

  /** Closes the dialog, even while `pending` (the action has ended). */
  close(): void {
    this.open.set(false);
  }

  /** Cancels on behalf of the user (« Annuler », Escape); ignored while `pending`. */
  requestCancel(reason: CwAlertDialogCancelReason): void {
    if (!this.overlay.attached || this.pending()) return;
    this.keyboardClose = reason === 'escape';
    this.cancel.emit(reason);
    this.open.set(false);
  }

  /** Runs the action when it is enabled, then closes unless the consumer set `pending`. */
  requestConfirm(): void {
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

  protected onType(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.typed.set(event.target.value);
  }

  // Mockup App.dc.html: Enter in the confirmation field runs the action once the text matches. Only
  // there: Enter on the focusable item list must never run a destructive action.
  protected onEnter(event: Event): void {
    event.preventDefault();
    this.requestConfirm();
  }

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

  private onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (this.overlay.escapeBelongsElsewhere(event)) return;
    event.preventDefault();
    this.requestCancel('escape');
  }
}
