import { _IdGenerator } from '@angular/cdk/a11y';
import { createGlobalPositionStrategy, type GlobalPositionStrategy } from '@angular/cdk/overlay';
import {
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
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type TemplateRef,
  type WritableSignal,
  untracked,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { ɵModalOverlay } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';

import { CwSheetDescription } from './sheet-description/sheet-description.directive';
import { SHEET_LABELS } from './sheet-labels.token';
import { CW_SHEET, type CwSheetContext } from './sheet.token';
import type { CwSheetCloseReason, CwSheetSide, CwSheetSize } from './sheet.types';

/**
 * Constant PANEL
 *
 * @description
 * Sheet sheet of the Design System artifact: a popover surface docked to an edge, one rule on the
 * side of the page and no shadow (the backdrop is enough); it fades out while it closes.
 *
 * @type {string}
 */
const PANEL: string =
  'relative flex flex-col bg-popover text-popover-foreground outline-none ' +
  'data-[state=closed]:animate-fade-out motion-reduce:data-[state=closed]:animate-none';

/**
 * Constant SIDES
 *
 * @description
 * Sheet sheet, "Variantes" and "Mouvement": `right` slides in with `animate-sheet-in` and `bottom`
 * with `animate-drawer-in`; `left` and `top` move 24 px and fade in from `@starting-style`, over the
 * same 360 ms and `ease-snap` as those two tokens. `top` and `bottom` take 80 % of the screen at most.
 *
 * @type {Record<CwSheetSide, string>}
 */
const SIDES: Record<CwSheetSide, string> = {
  right: 'h-dvh border-l animate-sheet-in motion-reduce:animate-none',
  left:
    'h-dvh border-r transition-[translate,opacity] duration-[360ms] ease-snap motion-reduce:transition-none ' +
    'starting:-translate-x-6 starting:opacity-0',
  top:
    'max-h-[80dvh] w-screen border-b transition-[translate,opacity] duration-[360ms] ease-snap motion-reduce:transition-none ' +
    'starting:-translate-y-6 starting:opacity-0',
  bottom: 'max-h-[80dvh] w-screen border-t animate-drawer-in motion-reduce:animate-none',
};

/**
 * Constant WIDTHS
 *
 * @description
 * Sheet sheet, "Tailles": the width of a `left` or `right` sheet, which always leaves 48 px of the
 * page visible except in `full`.
 *
 * @type {Record<CwSheetSize, string>}
 */
const WIDTHS: Record<CwSheetSize, string> = {
  sm: 'w-80 max-w-[calc(100vw-3rem)]',
  default: 'w-[400px] max-w-[calc(100vw-3rem)]',
  lg: 'w-[560px] max-w-[calc(100vw-3rem)]',
  full: 'w-screen',
};

/**
 * Component CwSheet
 *
 * @description
 * A panel that slides in from an edge of the screen above a backdrop (Sheet sheet of the Design
 * System artifact): a task detail on the right, the phone navigation on the left, a search band at
 * the top, a bulk selection at the bottom. `side` picks the edge and `size` the width of a side sheet
 * (`full` covers the screen). Compose it with `cw-sheet-header` (metadata and `h2[cwSheetTitle]`,
 * which names it, and `p[cwSheetDescription]`, which describes it), `cw-sheet-body` (the scrolling
 * part) and `cw-sheet-footer`. Open it with `[(open)]`, `show()` or a `[cwSheetTrigger]`. Built on
 * CDK Dialog: `role="dialog"`, `aria-modal`, focus trap, page scroll blocked, focus on the first
 * tabbable element (the close button at the top right, first in the tab order, or the header's
 * first control without it, Sheet sheet, "États") and back to the trigger at closing. Escape (`closeOnEscape`), a backdrop click
 * (`closeOnOverlayClick`), the close button (`showClose`, named `closeLabel`) and
 * `button[cwSheetClose]` close it; Escape first closes a popup open inside it. `closed` emits the
 * reason once the exit animation ends. Style hooks: `data-state`, `data-side`, `data-size`.
 */
@Component({
  selector: 'cw-sheet',
  imports: [CwButton, NgIcon],
  providers: [
    provideIcons({ phosphorXBold }),
    ɵModalOverlay,
    { provide: CW_SHEET, useExisting: CwSheet },
  ],
  templateUrl: './sheet.component.html',
})
export class CwSheet implements CwSheetContext {
  // #region Properties
  /**
   * Property open
   * @readonly
   *
   * @description
   * Two-way open state of the sheet.
   *
   * @type {ModelSignal<boolean>}
   * @default false
   */
  public readonly open: ModelSignal<boolean> = model(false);

  /**
   * Property side
   * @readonly
   *
   * @description
   * Edge of the screen the sheet is docked to.
   *
   * @type {InputSignal<CwSheetSide>}
   * @default 'right'
   */
  public readonly side: InputSignal<CwSheetSide> = input<CwSheetSide>('right');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Width of a `left` or `right` sheet; `full` covers the screen on every side.
   *
   * @type {InputSignal<CwSheetSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwSheetSize> = input<CwSheetSize>('default');

  /**
   * Property showClose
   * @readonly
   *
   * @description
   * Whether the close button is shown at the top right.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly showClose: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property closeOnEscape
   * @readonly
   *
   * @description
   * Whether Escape closes the sheet.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly closeOnEscape: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property closeOnOverlayClick
   * @readonly
   *
   * @description
   * Whether a click on the backdrop closes the sheet.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly closeOnOverlayClick: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property closeLabel
   * @readonly
   *
   * @description
   * Accessible name of the close button; by default the `close` text of `provideCwSheetLabels`
   * (« Fermer »).
   *
   * @type {InputSignal<string>}
   */
  public readonly closeLabel: InputSignal<string> = input<string>(inject(SHEET_LABELS).close);

  /**
   * Property closed
   * @readonly
   *
   * @description
   * Emits why the sheet closed, once its exit animation ends.
   *
   * @type {OutputEmitterRef<CwSheetCloseReason>}
   */
  public readonly closed: OutputEmitterRef<CwSheetCloseReason> = output<CwSheetCloseReason>();

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Id of the title that names the sheet.
   *
   * @type {string}
   */
  public readonly titleId: string;

  /**
   * Property descriptionId
   * @readonly
   *
   * @description
   * Id of the description that describes the sheet.
   *
   * @type {string}
   */
  public readonly descriptionId: string;

  /**
   * Property state
   * @readonly
   *
   * @description
   * `closed` during the exit animation, which the panel's `data-state` plays.
   *
   * @type {WritableSignal<'open' | 'closed'>}
   */
  protected readonly state: WritableSignal<'open' | 'closed'> = signal<'open' | 'closed'>('open');

  /**
   * Property panelClasses
   * @readonly
   *
   * @description
   * Panel classes for the side and the size.
   *
   * @type {Signal<string>}
   */
  protected readonly panelClasses: Signal<string> = computed(() => {
    const side: CwSheetSide = this.side();
    const size: CwSheetSize = this.size();
    const vertical: boolean = side === 'left' || side === 'right';
    const extent: string = vertical ? WIDTHS[size] : size === 'full' ? 'h-dvh max-h-none' : '';
    return `${PANEL} ${SIDES[side]} ${extent}`;
  });

  /**
   * Property template
   * @readonly
   *
   * @description
   * Template attached to the CDK dialog.
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
   * Projected description, which decides `aria-describedby`.
   *
   * @type {Signal<CwSheetDescription | undefined>}
   */
  private readonly description: Signal<CwSheetDescription | undefined> = contentChild(
    CwSheetDescription,
    { descendants: true },
  );

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector creating the edge position strategy.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property viewContainerRef
   * @readonly
   *
   * @description
   * View container rendering the panel template inside the dialog.
   *
   * @type {ViewContainerRef}
   */
  private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  /**
   * Property overlay
   * @readonly
   *
   * @description
   * Modal overlay shared with `cw-dialog` (focus trap, backdrop, exit animation).
   *
   * @type {ɵModalOverlay}
   */
  private readonly overlay: ɵModalOverlay = inject(ɵModalOverlay);

  /**
   * Property reason
   *
   * @description
   * Reason emitted by `closed` for the closing in progress.
   *
   * @type {CwSheetCloseReason}
   */
  private reason: CwSheetCloseReason = 'action';

  /**
   * Property origin
   *
   * @description
   * Element that receives the focus back at closing, when `show()` was given one.
   *
   * @type {HTMLElement | null}
   */
  private origin: HTMLElement | null = null;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Allocates the title and description ids and follows `open`.
   *
   * @constructor
   */
  public constructor() {
    const ids: _IdGenerator = inject(_IdGenerator);
    this.titleId = ids.getId('cw-sheet-title-');
    this.descriptionId = ids.getId('cw-sheet-description-');
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
   * Opens the sheet; `origin` receives the focus back when it closes (by default the element that
   * had it).
   *
   * @param {HTMLElement} [origin] - Element to focus again at closing.
   */
  public show(origin?: HTMLElement): void {
    this.origin = origin ?? null;
    this.open.set(true);
  }

  /**
   * Method close
   *
   * @description
   * Closes the sheet with the reason `action`.
   */
  public close(): void {
    this.reason = 'action';
    this.open.set(false);
  }

  /**
   * Method requestClose
   *
   * @description
   * Closes the sheet for the given reason, used by the close button, Escape, the backdrop and
   * `button[cwSheetClose]`.
   *
   * @param {CwSheetCloseReason} reason - Why the sheet closes.
   */
  public requestClose(reason: CwSheetCloseReason): void {
    if (!this.overlay.attached) return;
    this.reason = reason;
    this.open.set(false);
  }

  /**
   * Method attach
   *
   * @description
   * Opens the CDK dialog docked to the chosen edge.
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
      positionStrategy: this.positionStrategy(),
      // The CDK caps a dialog at 80vw; the panel classes keep the sheet's own limit.
      maxWidth: '100vw',
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
   * Plays the exit animation, then closes the dialog and emits `closed`; opens it again when
   * `open` turned true meanwhile.
   */
  private detach(): void {
    if (!this.overlay.attached) return;
    const reason: CwSheetCloseReason = this.reason;
    this.state.set('closed');
    this.overlay.detach(
      () => {
        this.origin = null;
        this.closed.emit(reason);
        // Reopened during the exit animation: `open` is true again but the effect already ran
        // while the closing overlay was still attached.
        if (this.open()) this.attach();
      },
      reason === 'escape' ? 'keyboard' : reason === 'overlay' ? 'mouse' : undefined,
    );
  }

  /**
   * Method positionStrategy
   *
   * @description
   * Docks the pane to the chosen edge of the viewport.
   *
   * @returns {GlobalPositionStrategy} Strategy holding the pane against that edge.
   */
  private positionStrategy(): GlobalPositionStrategy {
    const strategy: GlobalPositionStrategy = createGlobalPositionStrategy(this.injector);
    switch (this.side()) {
      case 'right':
        return strategy.top('0').right('0');
      case 'left':
        return strategy.top('0').left('0');
      case 'top':
        return strategy.top('0').left('0');
      case 'bottom':
        return strategy.bottom('0').left('0');
    }
  }

  /**
   * Method onKeydown
   *
   * @description
   * Closes on Escape unless a popup open inside the sheet owns it.
   *
   * @param {KeyboardEvent} event - Key pressed inside the dialog.
   */
  private onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (this.overlay.escapeBelongsElsewhere(event)) return;
    event.preventDefault();
    if (this.closeOnEscape()) this.requestClose('escape');
  }
  // #endregion
}
