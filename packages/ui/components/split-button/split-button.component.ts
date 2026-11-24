import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  output,
  untracked,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { CwMenu, type CwMenuFocus } from '@cadenway/ui/components/menu';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRightBold, phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';

import { SPLIT_BUTTON_LABELS } from './split-button-labels.token';

/**
 * Constant MAIN
 *
 * @description
 * Mockup `App.dc.html` (task status): the main half carries the current value in 12 px medium text,
 * lit `bg-muted` on hover, and takes the free width when the split button is stretched (fields
 * panel); the focus ring stays inside the welded block.
 *
 * @type {string}
 */
const MAIN: string = `group/main relative isolate flex min-w-0 flex-1 items-center gap-1.5 rounded-l-[5px] px-2 text-left text-xs font-medium transition-colors hover:bg-muted aria-expanded:bg-selected disabled:pointer-events-none motion-reduce:transition-none ${ɵFOCUS_INSET}`;

/**
 * Constant TOGGLE
 *
 * @description
 * Mockup `App.dc.html`: the caret half is 24 px wide and muted, turns `foreground` on hover, and is
 * lit `bg-selected` while the menu is open (bricks rule: selected is `bg-selected`).
 *
 * @type {string}
 */
const TOGGLE: string = `group/toggle relative isolate inline-flex w-6 shrink-0 items-center justify-center rounded-r-[5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-selected aria-expanded:text-foreground disabled:pointer-events-none motion-reduce:transition-none ${ɵFOCUS_INSET}`;

/**
 * Component CwSplitButton
 *
 * @description
 * A two-part button: the main half runs a quick action, the caret half opens a menu of every
 * choice, as the task status button of the mockup (`App.dc.html`: a click moves the status to the
 * next one, the caret lists them all). The content is the main half's visual (an icon and the
 * current value); `label` is its accessible name, since the content names the value and not the
 * action (« Statut : En cours. Passer à « En revue » »), and `tooltip` its tooltip (`label` by
 * default; « Passer à « En revue » » in the mockup). A click on the main half emits `triggered`;
 * `arrow` shows a → hint on hover and keyboard focus, for an action that moves to a next value.
 * With `opensMenu`, the main half opens the menu instead (the mockup's status without a next one).
 *
 * Project the `cw-menu` the caret opens inside the split button; it is required. The menu is
 * placed against the whole split button (its `align` and `side` apply), and the caret behaves as a
 * menu button: `aria-haspopup`, `aria-expanded`, `aria-controls` while open, a click toggles it,
 * Enter and Space open it on its first item, ↓ on the first, ↑ on the last, Escape closes it and
 * gives the focus back. The caret is named by `menuLabel` (« Plus d’options » by default, or the
 * text of `provideCwSplitButtonLabels`). Both halves are their own Tab stop; `disabled` disables
 * both, dims the whole block and closes an open menu. No business logic: the consumer decides
 * what the quick action does. Style hook: `data-disabled` on the host.
 */
@Component({
  selector: 'cw-split-button',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorArrowRightBold, phosphorCaretDownBold })],
  host: {
    class:
      'inline-flex h-7 max-w-full items-stretch rounded-md border border-input transition-opacity data-disabled:opacity-50 motion-reduce:transition-none',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  templateUrl: './split-button.component.html',
})
export class CwSplitButton {
  // #region Properties
  /**
   * Property label
   *
   * @description
   * Accessible name of the main half: what it does, for example « Statut : En cours. Passer à
   * « En revue » ».
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property tooltip
   *
   * @description
   * Tooltip of the main half, for example « Passer à « En revue » »; `label` when not given.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly tooltip: InputSignal<string | undefined> = input<string | undefined>();

  /**
   * Property menuLabel
   *
   * @description
   * Accessible name and tooltip of the caret half, for example « Choisir un statut ».
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly menuLabel: InputSignal<string> = input<string>(inject(SPLIT_BUTTON_LABELS).menu);

  /**
   * Property arrow
   *
   * @description
   * Shows a → hint on the main half on hover and keyboard focus, for a quick action that moves to a
   * next value.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly arrow: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property opensMenu
   *
   * @description
   * Makes the main half open the menu instead of emitting `triggered`, when there is no quick action
   * to run (the mockup's status without a next one).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly opensMenu: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property disabled
   *
   * @description
   * Disables both halves and closes an open menu.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property triggered
   *
   * @description
   * Emits when the main half runs its quick action (a click, Enter or Space), unless `opensMenu`.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly triggered: OutputEmitterRef<void> = output();

  /**
   * Property menu
   *
   * @description
   * The projected menu; a split button without one fails at creation.
   *
   * @type {Signal<CwMenu>}
   * @readonly
   */
  protected readonly menu: Signal<CwMenu> = contentChild.required(CwMenu);

  /**
   * Property host
   *
   * @description
   * The split button, against which the menu is placed.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property mainButton
   *
   * @description
   * The main half, the menu's trigger when it opens the menu.
   *
   * @type {Signal<ElementRef<HTMLButtonElement>>}
   * @readonly
   */
  private readonly mainButton: Signal<ElementRef<HTMLButtonElement>> =
    viewChild.required<ElementRef<HTMLButtonElement>>('main');

  /**
   * Property caretButton
   *
   * @description
   * The caret half, the menu's trigger.
   *
   * @type {Signal<ElementRef<HTMLButtonElement>>}
   * @readonly
   */
  private readonly caretButton: Signal<ElementRef<HTMLButtonElement>> =
    viewChild.required<ElementRef<HTMLButtonElement>>('caret');

  /**
   * Property openedBy
   *
   * @description
   * Which half opened the menu, or null while it is closed or opened from elsewhere.
   *
   * @type {Signal<'main' | 'caret' | null>}
   * @readonly
   */
  protected readonly openedBy: Signal<'main' | 'caret' | null> = computed(() => {
    const trigger: HTMLElement | null = this.menu().openedBy();
    if (trigger === null) return null;
    if (trigger === this.caretButton().nativeElement) return 'caret';
    return trigger === this.mainButton().nativeElement ? 'main' : null;
  });

  /**
   * Property title
   *
   * @description
   * Tooltip of the main half.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly title: Signal<string> = computed(() => this.tooltip() ?? this.label());

  /**
   * Property mainClasses
   *
   * @description
   * Classes of the main half.
   *
   * @type {string}
   * @readonly
   */
  protected readonly mainClasses: string = MAIN;

  /**
   * Property toggleClasses
   *
   * @description
   * Classes of the caret half.
   *
   * @type {string}
   * @readonly
   */
  protected readonly toggleClasses: string = TOGGLE;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Closes the menu this split button opened when it becomes disabled, so its items cannot run an
   * action the consumer just made unavailable.
   *
   * @constructor
   */
  public constructor() {
    effect(() => {
      if (!this.disabled() || this.openedBy() === null) return;
      untracked(() => {
        this.menu().close();
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method onMainClick
   *
   * @description
   * Runs the quick action, or toggles the menu with `opensMenu`. A click from the keyboard (Enter,
   * Space) has no pointer detail and opens the menu on its first item. The quick action first closes
   * the menu this split button opened: the menu is placed against the whole button, so a click on
   * the main half is not an outside click, and its choices would outlive the value they were for.
   *
   * @param {MouseEvent} event - The click.
   */
  protected onMainClick(event: MouseEvent): void {
    if (!this.opensMenu()) {
      if (this.openedBy() !== null) this.menu().close();
      this.triggered.emit();
      return;
    }
    this.toggle(this.mainButton().nativeElement, event.detail === 0 ? 'first' : 'panel');
  }

  /**
   * Method onCaretClick
   *
   * @description
   * Toggles the menu from the caret; from the keyboard, it opens on the first item.
   *
   * @param {MouseEvent} event - The click.
   */
  protected onCaretClick(event: MouseEvent): void {
    this.toggle(this.caretButton().nativeElement, event.detail === 0 ? 'first' : 'panel');
  }

  /**
   * Method onCaretKeydown
   *
   * @description
   * Opens the menu on its first item with ↓, on its last with ↑, as a menu button does.
   *
   * @param {KeyboardEvent} event - The key pressed on the caret.
   */
  protected onCaretKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    this.menu().open({
      origin: this.host,
      trigger: this.caretButton().nativeElement,
      focus: event.key === 'ArrowDown' ? 'first' : 'last',
    });
  }

  /**
   * Method toggle
   *
   * @description
   * Closes the menu when this split button opened it, or opens it against the whole split button
   * with the given half as its trigger.
   *
   * @param {HTMLElement} trigger - The half that opens the menu and gets the focus back.
   * @param {CwMenuFocus} focus - Where the focus goes once the menu is open.
   */
  private toggle(trigger: HTMLElement, focus: CwMenuFocus): void {
    if (this.openedBy() !== null) {
      this.menu().close();
      return;
    }
    this.menu().open({ origin: this.host, trigger, focus });
  }
  // #endregion
}
