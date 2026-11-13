import { _IdGenerator } from '@angular/cdk/a11y';
import { Dialog } from '@angular/cdk/dialog';
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
  untracked,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/button';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';

import { CwDialogDescription } from './dialog-description/dialog-description.directive';
import { CW_DIALOG, type CwDialogContext } from './dialog.token';
import type { CwDialogCloseReason, CwDialogSize } from './dialog.types';
import { ModalOverlay } from './modal-overlay';

/* Literal class strings (Dialog sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Under 768 px every size fills the screen (integration guide,
   mobile): no margin, no radius, no border. */
const PANEL =
  'relative flex flex-col rounded-xl border bg-popover text-popover-foreground shadow-xl outline-none ' +
  'animate-pop-in motion-reduce:animate-none data-[state=closed]:animate-pop-out motion-reduce:data-[state=closed]:animate-none ' +
  'max-md:h-dvh max-md:max-h-none max-md:w-screen max-md:max-w-none max-md:rounded-none max-md:border-0';

const LAYOUTS = {
  simple: 'gap-4 p-6',
  scrollable: 'max-h-[calc(100dvh-2rem)]',
} as const;

// The window always keeps 16 px from the screen edges (`calc(100% - 2rem)` of the viewport).
const SIZES: Record<CwDialogSize, string> = {
  sm: 'w-[calc(100vw-2rem)] max-w-sm',
  default: 'w-[calc(100vw-2rem)] max-w-md',
  lg: 'w-[calc(100vw-2rem)] max-w-2xl',
  full: 'h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)]',
};

// The body takes the remaining height when the window is taller than its content (`full`, mobile).
const BODIES = {
  simple: 'min-h-0 min-w-0 flex-1 empty:hidden max-md:overflow-y-auto',
  full: 'min-h-0 min-w-0 flex-1 overflow-y-auto empty:hidden',
  scrollable: `min-h-0 flex-1 overflow-y-auto px-6 py-3 [scrollbar-color:var(--color-track)_transparent] [scrollbar-width:thin] ${ɵFOCUS_INSET}`,
} as const;

/**
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
  providers: [provideIcons({ phosphorXBold }), { provide: CW_DIALOG, useExisting: CwDialog }],
  templateUrl: './dialog.component.html',
})
export class CwDialog implements CwDialogContext {
  /** Whether the window is open; two-way with `[(open)]`. */
  readonly open = model(false);
  /** Maximum width. */
  readonly size = input<CwDialogSize>('default');
  /** Header and footer stay in place, the body scrolls between their rules. */
  readonly scrollable = input(false, { transform: booleanAttribute });
  /** The close button at the top right; hide it when the footer already closes. */
  readonly showClose = input(true, { transform: booleanAttribute });
  /** Escape closes the window. */
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  /** A click on the backdrop closes the window; turn it off as soon as an entry would be lost. */
  readonly closeOnOverlayClick = input(true, { transform: booleanAttribute });
  /** A submission is running: nothing closes the window but the consumer; `aria-busy` is set. */
  readonly pending = input(false, { transform: booleanAttribute });
  /** Accessible name of the close button. */
  readonly closeLabel = input('Fermer');
  /** Emits why the window closed, once its exit animation has ended. */
  readonly closed = output<CwDialogCloseReason>();

  /** Id given to `h2[cwDialogTitle]`, which names the window. */
  readonly titleId: string;
  /** Id given to `p[cwDialogDescription]`, which describes the window. */
  readonly descriptionId: string;

  protected readonly state = signal<'open' | 'closed'>('open');
  protected readonly panelClasses = computed(
    () =>
      `${PANEL} ${this.scrollable() ? LAYOUTS.scrollable : LAYOUTS.simple} ${SIZES[this.size()]}`,
  );
  protected readonly bodyClasses = computed(() => {
    if (this.scrollable()) return BODIES.scrollable;
    return this.size() === 'full' ? BODIES.full : BODIES.simple;
  });

  private readonly template = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly description = contentChild(CwDialogDescription, { descendants: true });
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly overlay = new ModalOverlay(inject(Dialog), inject(DOCUMENT), inject(Injector));
  private reason: CwDialogCloseReason = 'action';
  private origin: HTMLElement | null = null;

  constructor() {
    const ids = inject(_IdGenerator);
    this.titleId = ids.getId('cw-dialog-title-');
    this.descriptionId = ids.getId('cw-dialog-description-');
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

  /** Opens the window; focus returns to `origin` (the trigger) when it closes. */
  show(origin?: HTMLElement): void {
    this.origin = origin ?? null;
    this.open.set(true);
  }

  /** Closes the window with the reason `action`, even while `pending`. */
  close(): void {
    this.reason = 'action';
    this.open.set(false);
  }

  /** Closes on behalf of the user (Escape, backdrop, close buttons); ignored while `pending`. */
  requestClose(reason: CwDialogCloseReason): void {
    if (!this.overlay.attached || this.pending()) return;
    this.reason = reason;
    this.open.set(false);
  }

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

  private detach(): void {
    if (!this.overlay.attached) return;
    const reason = this.reason;
    this.state.set('closed');
    this.overlay.detach(
      () => {
        this.origin = null;
        this.closed.emit(reason);
      },
      reason === 'escape' ? 'keyboard' : reason === 'overlay' ? 'mouse' : undefined,
    );
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (this.overlay.escapeBelongsElsewhere(event)) return;
    event.preventDefault();
    if (this.closeOnEscape()) this.requestClose('escape');
  }
}
