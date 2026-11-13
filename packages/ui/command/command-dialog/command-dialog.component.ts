import { Dialog, type DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Injector,
  type TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMagnifyingGlassBold } from '@ng-icons/phosphor-icons/bold';

import { ɵprefersReducedMotion } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/spinner';

import { cwCommandFuzzyFilter } from '../command.constants';
import type { CwCommandFilter } from '../command.types';
import { type CommandHost, CommandState } from '../command-state/command-state.service';

/* Mockup App.dc.html, the palette: a third from the top, `max-w-xl`, on a veil; it pops in and the
   veil fades in, both reversed on close (cw-motion-tokens). The veil is the ink at 35 % (light) and
   the canvas at 70 % (dark), the mockup's two values. */
const PANEL =
  'flex w-full flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-xl animate-pop-in motion-reduce:animate-none data-[state=closed]:animate-pop-out';
const BACKDROP = [
  'bg-ink/35',
  'dark:bg-canvas/70',
  'animate-fade-in',
  'motion-reduce:animate-none',
];
const BACKDROP_OUT = 'animate-fade-out';

/**
 * The `Ctrl K` command palette: a command in a modal dialog, placed a third from the top (Command
 * sheet of the Design System artifact, "Palette").
 *
 * Holds the same parts as `cw-command` (`input[cwCommandInput]`, `cw-command-list`,
 * `cw-command-footer`…) and the same `search`, `filter`, `loading` and `loop` inputs. `[(open)]`
 * shows it in a CDK Dialog (`role="dialog"`, `aria-modal`, named by `ariaLabel`, focus trapped in
 * it, the field focused, the focus given back on close). Ctrl K (⌘ K) opens or closes it from
 * anywhere unless `shortcut` is off; Escape clears the search, then closes; a click on the veil
 * closes. The search is emptied at each opening.
 */
@Component({
  selector: 'cw-command-dialog',
  imports: [CwSpinner, NgIcon],
  providers: [CommandState, provideIcons({ phosphorMagnifyingGlassBold })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  templateUrl: './command-dialog.component.html',
})
export class CwCommandDialog implements CommandHost {
  /** Whether the palette is open, `[(open)]`. */
  readonly open = model(false);
  /** The typed text, `[(search)]`; emptied at each opening. */
  readonly search = model('');
  /** Scores an item against the search; `null` to filter on the server. */
  readonly filter = input<CwCommandFilter | null>(cwCommandFuzzyFilter);
  /** A server search is running: spinner in the field and in the list, `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Whether ↑ on the first item goes to the last one, and ↓ on the last to the first. */
  readonly loop = input(true, { transform: booleanAttribute });
  /** Accessible name of the dialog. */
  readonly ariaLabel = input('Palette de commandes');
  /** Whether Ctrl K (⌘ K on macOS) toggles the palette. */
  readonly shortcut = input(true, { transform: booleanAttribute });

  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly state = inject(CommandState);
  private readonly palette = viewChild.required<TemplateRef<unknown>>('palette');
  private dialogRef: DialogRef | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly closing = signal(false);
  protected readonly panelClass = PANEL;

  constructor() {
    this.state.connect(this);

    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open) this.show();
        else this.hide();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.closeTimer) clearTimeout(this.closeTimer);
      this.dialogRef?.close();
    });
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    const toggles =
      this.shortcut() &&
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === 'k';
    if (!toggles) return;
    event.preventDefault();
    this.open.update((open) => !open);
  }

  protected onPanelAnimationEnd(event: AnimationEvent): void {
    if (this.closing() && event.target === event.currentTarget) this.finishClose();
  }

  private show(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closing.set(false);
    if (this.dialogRef) return;
    // Mockup App.dc.html: the palette opens on an empty search.
    this.search.set('');
    this.state.reset();
    const dialogRef = this.dialog.open(this.palette(), {
      viewContainerRef: this.viewContainer,
      injector: this.injector,
      ariaLabel: this.ariaLabel(),
      ariaModal: true,
      hasBackdrop: true,
      backdropClass: BACKDROP,
      width: 'calc(100% - 2rem)',
      maxWidth: '36rem',
      positionStrategy: createGlobalPositionStrategy(this.injector)
        .top('14vh')
        .centerHorizontally(),
      disableClose: true,
      // Focused below: the CDK's tabbable search needs a laid-out page.
      autoFocus: false,
      restoreFocus: true,
    });
    this.dialogRef = dialogRef;
    // Mockup App.dc.html: the field takes the focus at opening.
    afterNextRender(
      {
        write: () => {
          dialogRef.overlayRef.overlayElement
            .querySelector<HTMLInputElement>('input[cwCommandInput]')
            ?.focus();
        },
      },
      { injector: this.injector },
    );
    dialogRef.backdropClick.subscribe(() => {
      this.open.set(false);
    });
    dialogRef.keydownEvents.subscribe((event) => {
      // The field stops Escape while it clears a search; an Escape that gets here closes.
      if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        this.open.set(false);
      }
    });
    dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
      this.closing.set(false);
      this.open.set(false);
    });
  }

  private hide(): void {
    const dialogRef = this.dialogRef;
    if (!dialogRef || this.closing()) return;
    const panel = dialogRef.overlayRef.overlayElement.querySelector<HTMLElement>('[data-state]');
    const animation = panel ? getComputedStyle(panel).animationName : '';
    // Without a running animation (reduced motion, no stylesheet) the palette goes at once.
    if (!panel || !animation || animation === 'none' || ɵprefersReducedMotion(this.document)) {
      this.finishClose();
      return;
    }
    this.closing.set(true);
    const backdrop = dialogRef.overlayRef.backdropElement;
    backdrop?.classList.remove('animate-fade-in');
    backdrop?.classList.add(BACKDROP_OUT);
    // Safety net if `animationend` never comes.
    this.closeTimer = setTimeout(() => {
      this.finishClose();
    }, 300);
  }

  private finishClose(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = null;
    this.dialogRef?.close();
  }
}
