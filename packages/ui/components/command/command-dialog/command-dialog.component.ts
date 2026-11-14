import { Dialog, type DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  model,
  signal,
  type TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef,
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type WritableSignal,
  type Signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMagnifyingGlassBold } from '@ng-icons/phosphor-icons/bold';

import { ɵafterExitAnimation } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/components/spinner';

import { cwCommandFuzzyFilter } from '../command.constants';
import type { CwCommandFilter } from '../command.types';
import { type CommandHost, CommandState } from '../command-state/command-state.service';

/* Mockup App.dc.html, the palette: a third from the top, `max-w-xl`, on a veil; it pops in and the
   veil fades in, both reversed on close (cw-motion-tokens). The veil is the ink at 35 % (light) and
   the canvas at 70 % (dark), the mockup's two values. */
/**
 * Constant PANEL
 *
 * @description
 * Classes for the command dialog panel and its animation.
 *
 * @type {string}
 */
const PANEL: string =
  'flex w-full flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-xl animate-pop-in motion-reduce:animate-none data-[state=closed]:animate-pop-out';
/**
 * Constant BACKDROP
 *
 * @description
 * Classes for the modal veil and entrance animation.
 *
 * @type {string[]}
 */
const BACKDROP: string[] = [
  'bg-ink/35',
  'dark:bg-canvas/70',
  'animate-fade-in',
  'motion-reduce:animate-none',
];
/**
 * Constant BACKDROP_OUT
 *
 * @description
 * Exit animation class for the modal veil.
 *
 * @type {string}
 */
const BACKDROP_OUT: string = 'animate-fade-out';

/**
 * Component CwCommandDialog
 *
 * @description
 * The `Ctrl K` command palette: a command in a modal dialog, placed a third from the top (Command sheet of the Design System artifact, "Palette"). Holds the same parts as `cw-command` (`input[cwCommandInput]`, `cw-command-list`, `cw-command-footer`…) and the same `search`, `filter`, `loading` and `loop` inputs. `[(open)]` shows it in a CDK Dialog (`role="dialog"`, `aria-modal`, named by `ariaLabel`, focus trapped in it, the field focused, the focus given back on close). Ctrl K (⌘ K) opens or closes it from anywhere unless `shortcut` is off; Escape clears the search, then closes; a click on the veil closes. The search is emptied at each opening.
 */
@Component({
  selector: 'cw-command-dialog',
  imports: [CwSpinner, NgIcon],
  providers: [CommandState, provideIcons({ phosphorMagnifyingGlassBold })],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  templateUrl: './command-dialog.component.html',
})
export class CwCommandDialog implements CommandHost {
  // #region Properties
  /**
   * Property open
   *
   * @description
   * Whether the palette is open, `[(open)]`.
   *
   * @type {ModelSignal<boolean>}
   * @readonly
   */
  public readonly open: ModelSignal<boolean> = model(false);

  /**
   * Property search
   *
   * @description
   * The typed text, `[(search)]`; emptied at each opening.
   *
   * @type {ModelSignal<string>}
   * @readonly
   */
  public readonly search: ModelSignal<string> = model('');

  /**
   * Property filter
   *
   * @description
   * Scores an item against the search; `null` to filter on the server.
   *
   * @type {InputSignal<CwCommandFilter | null>}
   * @readonly
   */
  public readonly filter: InputSignal<CwCommandFilter | null> = input<CwCommandFilter | null>(
    cwCommandFuzzyFilter,
  );

  /**
   * Property loading
   *
   * @description
   * A server search is running: spinner in the field and in the list, `aria-busy`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property loop
   *
   * @description
   * Whether ↑ on the first item goes to the last one, and ↓ on the last to the first.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly loop: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the dialog.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input('Palette de commandes');

  /**
   * Property shortcut
   *
   * @description
   * Whether Ctrl K (⌘ K on macOS) toggles the palette.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly shortcut: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property dialog
   *
   * @description
   * CDK dialog service used to open the palette.
   *
   * @type {Dialog}
   * @readonly
   */
  private readonly dialog: Dialog = inject(Dialog);

  /**
   * Property injector
   *
   * @description
   * Injector used for dialog positioning and render scheduling.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property viewContainer
   *
   * @description
   * Container providing the palette template context.
   *
   * @type {ViewContainerRef}
   * @readonly
   */
  private readonly viewContainer: ViewContainerRef = inject(ViewContainerRef);

  /**
   * Property state
   *
   * @description
   * Shared command state used to register and navigate options.
   *
   * @type {CommandState}
   * @readonly
   */
  private readonly state: CommandState = inject(CommandState);

  /**
   * Property palette
   *
   * @description
   * Template displayed inside the dialog.
   *
   * @type {Signal<TemplateRef<unknown>>}
   * @readonly
   */
  private readonly palette: Signal<TemplateRef<unknown>> =
    viewChild.required<TemplateRef<unknown>>('palette');

  /**
   * Property dialogRef
   *
   * @description
   * Current dialog reference, or null when closed.
   *
   * @type {DialogRef | null}
   */
  private dialogRef: DialogRef | null = null;

  /**
   * Property stopClosing
   *
   * @description
   * Cancels a pending exit animation when present.
   *
   * @type {(() => void) | null}
   */
  private stopClosing: (() => void) | null = null;

  /**
   * Property closing
   *
   * @description
   * Whether the dialog exit animation is running.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  protected readonly closing: WritableSignal<boolean> = signal(false);

  /**
   * Property panelClass
   *
   * @description
   * Classes applied to the palette panel.
   *
   * @type {string}
   * @readonly
   */
  protected readonly panelClass: string = PANEL;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Connects shared state and coordinates the dialog lifecycle.
   *
   * @constructor
   */
  public constructor() {
    this.state.connect(this);

    effect(() => {
      const open: boolean = this.open();
      untracked(() => {
        if (open) this.show();
        else this.hide();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.stopClosing?.();
      this.dialogRef?.close();
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method onDocumentKeydown
   *
   * @description
   * Toggles the palette for the configured Ctrl or Command K shortcut.
   *
   * @param {KeyboardEvent} event - Keyboard event from the document.
   */
  protected onDocumentKeydown(event: KeyboardEvent): void {
    const toggles: boolean =
      this.shortcut() &&
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === 'k';
    if (!toggles) return;
    event.preventDefault();
    this.open.update((open) => !open);
  }

  /**
   * Method show
   *
   * @description
   * Opens the dialog, clears search and focuses the input.
   */
  private show(): void {
    this.stopClosing?.();
    this.stopClosing = null;
    this.closing.set(false);
    if (this.dialogRef) return;
    // Mockup App.dc.html: the palette opens on an empty search.
    this.search.set('');
    this.state.reset();
    const dialogRef: DialogRef = this.dialog.open(this.palette(), {
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

  /**
   * Method hide
   *
   * @description
   * Starts the dialog and backdrop exit animations.
   */
  private hide(): void {
    const dialogRef: DialogRef | null = this.dialogRef;
    if (!dialogRef || this.closing()) return;
    const panel: HTMLElement | null =
      dialogRef.overlayRef.overlayElement.querySelector<HTMLElement>('[data-state]');
    // The panel pops out and the veil fades out. Without an animation (reduced motion, no
    // stylesheet) the palette goes at once: the closing state is never rendered.
    this.closing.set(true);
    this.stopClosing = ɵafterExitAnimation(
      panel,
      () => {
        this.finishClose();
      },
      // Longest exit of the tokens (`pop-out`, `fade-out`: 180 ms) plus a margin.
      { fallback: 300 },
    );
    if (this.dialogRef !== dialogRef) return;
    const backdrop: HTMLElement | null = dialogRef.overlayRef.backdropElement;
    backdrop?.classList.remove('animate-fade-in');
    backdrop?.classList.add(BACKDROP_OUT);
  }

  /**
   * Method finishClose
   *
   * @description
   * Cancels the exit watcher and closes the dialog.
   */
  private finishClose(): void {
    this.stopClosing?.();
    this.stopClosing = null;
    this.dialogRef?.close();
  }
  // #endregion
}
