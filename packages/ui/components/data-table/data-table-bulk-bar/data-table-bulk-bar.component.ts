import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  type InputSignal,
  type WritableSignal,
  type Signal,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { CwRipple, ɵFOCUS, ɵnavigateList } from '@cadenway/ui/core';
import { CwKbd } from '@cadenway/ui/components/kbd';
import { NgIcon } from '@ng-icons/core';

import { ɵCW_DATA_TABLE, type ɵCwDataTableContext } from '../data-table.token';
import type { CwBulkAction } from '../data-table.types';

/* Literal class strings (DataTableComplete sheet and preview, "Barre d'actions de sélection"). */
/**
 * Constant ACTION
 *
 * @description
 * Classes for bulk action buttons.
 *
 * @type {string}
 */
const ACTION: string =
  'relative isolate inline-flex h-7 shrink-0 items-center gap-1.5 overflow-hidden rounded-md px-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent motion-reduce:transition-none ' +
  `${ɵFOCUS} [&_ng-icon]:[--ng-icon__size:1rem]`;

/**
 * Constant VARIANTS
 *
 * @description
 * Classes for bulk action variants.
 *
 * @type {Record<NonNullable<CwBulkAction['variant']>, string>}
 */
const VARIANTS: Record<NonNullable<CwBulkAction['variant']>, string> = {
  default: '',
  destructive: 'text-destructive',
};

/* French names of the keys the bar shows in its `kbd` (sheet DataTableComplete: « Suppr », « Échap »). */
/**
 * Constant KEY_LABELS
 *
 * @description
 * French names of keyboard shortcuts.
 *
 * @type {Readonly<Record<string, string>>}
 */
const KEY_LABELS: Readonly<Record<string, string>> = {
  Delete: 'Suppr',
  Escape: 'Échap',
  Backspace: 'Retour',
  Enter: 'Entrée',
};

/**
 * Interface FocusableButton
 *
 * @description
 * Toolbar button managed by keyboard navigation.
 */
interface FocusableButton {
  // #region Properties
  /**
   * Property element
   *
   * @description
   * Native toolbar button.
   *
   * @type {HTMLButtonElement}
   * @readonly
   */
  readonly element: HTMLButtonElement;

  /**
   * Property disabled
   *
   * @description
   * Whether the button is disabled.
   *
   * @type {boolean}
   * @readonly
   */
  readonly disabled: boolean;
  // #endregion
  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Moves focus to the button.
   */
  focus(): void;
  // #endregion
}

/**
 * Component CwDataTableBulkBar
 *
 * @description
 * The floating toolbar of a selection: « 3 tâches sélectionnées », the consumer's `bulkActions` with their shortcut, then « Désélectionner » (DataTableComplete sheet, "Actions groupées"). `cw-data-table` renders it when it has `bulkActions`; place one inside `cw-data-table` to add projected buttons after the generated actions. It appears with the first selected row, centred 12 px above the bottom of the grid (`animate-item-in`), never takes the focus by itself and is a single tab stop: ← → Home End move between its buttons. Each action button carries `aria-keyshortcuts` and `data-cw-bulk-action`; pressing it emits the table's `bulkAction` with the button as `trigger`, so the consumer anchors its picker on it.
 */
@Component({
  selector: 'cw-data-table-bulk-bar',
  imports: [CwKbd, CwRipple, NgIcon],
  host: {
    class:
      'pointer-events-none absolute bottom-3 left-1/2 z-30 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 justify-center',
  },
  templateUrl: './data-table-bulk-bar.component.html',
})
export class CwDataTableBulkBar {
  // #region Properties
  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the toolbar; « Actions sur la sélection » by default.
   *
   * @type {InputSignal<string | null>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property table
   *
   * @description
   * Table context shared with the generated part.
   *
   * @type {ɵCwDataTableContext}
   * @readonly
   */
  protected readonly table: ɵCwDataTableContext = inject(ɵCW_DATA_TABLE);

  /**
   * Property host
   *
   * @description
   * Native host element.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property activeIndex
   *
   * @description
   * Index of the active toolbar button.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  private readonly activeIndex: WritableSignal<number> = signal(0);

  /**
   * Property label
   *
   * @description
   * Accessible name of the selection toolbar.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly label: Signal<string> = computed(
    () => this.ariaLabel() ?? this.table.copy().bulkBar,
  );

  /**
   * Property actionClasses
   *
   * @description
   * Classes for bulk action buttons.
   *
   * @type {string}
   * @readonly
   */
  protected readonly actionClasses: string = ACTION;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Maintains a roving tab stop across toolbar buttons.
   *
   * @constructor
   */
  public constructor() {
    // Roving tab stop over the buttons, projected ones included.
    afterRenderEffect({
      write: () => {
        this.table.selectedCount();
        this.table.bulkActions();
        const buttons: FocusableButton[] = this.buttons();
        const active: number = Math.min(this.activeIndex(), Math.max(0, buttons.length - 1));
        buttons.forEach((button, index) => {
          button.element.tabIndex = index === active ? 0 : -1;
        });
      },
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method classesOf
   *
   * @description
   * Builds classes for a bulk action.
   *
   * @param {CwBulkAction} action - Bulk action to run.
   * @returns {string} Classes for the action.
   */
  protected classesOf(action: CwBulkAction): string {
    return `${ACTION} ${VARIANTS[action.variant ?? 'default']}`;
  }

  /**
   * Method keyLabel
   *
   * @description
   * Formats a keyboard shortcut label.
   *
   * @param {string} key - Column or row key.
   * @returns {string} Displayed keyboard shortcut.
   */
  protected keyLabel(key: string): string {
    return KEY_LABELS[key] ?? key.toUpperCase();
  }

  /**
   * Method run
   *
   * @description
   * Runs a bulk action from its button.
   *
   * @param {CwBulkAction} action - Bulk action to run.
   * @param {MouseEvent} event - Browser event from the interaction.
   */
  protected run(action: CwBulkAction, event: MouseEvent): void {
    this.table.runBulkAction(action, event.currentTarget as HTMLElement);
  }

  /**
   * Method onFocusin
   *
   * @description
   * Records the grid cell receiving focus.
   *
   * @param {FocusEvent} event - Browser event from the interaction.
   */
  protected onFocusin(event: FocusEvent): void {
    const index: number = this.buttons().findIndex((button) => button.element === event.target);
    if (index >= 0) this.activeIndex.set(index);
  }

  /**
   * Method onKeydown
   *
   * @description
   * Handles keyboard navigation and shortcuts in the grid.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const buttons: FocusableButton[] = this.buttons();
    const current: number = buttons.findIndex((button) => button.element === event.target);
    if (current < 0) return;
    const manager: FocusKeyManager<FocusableButton> = new FocusKeyManager<FocusableButton>(
      buttons,
    ).withWrap();
    manager.updateActiveItem(current);
    const rtl: boolean = getComputedStyle(this.host).direction === 'rtl';
    if (ɵnavigateList(manager, event, 'horizontal', rtl)) {
      event.preventDefault();
      this.activeIndex.set(manager.activeItemIndex ?? current);
    }
    manager.destroy();
  }

  /**
   * Method buttons
   *
   * @description
   * Collects toolbar buttons for roving focus.
   * @returns {FocusableButton[]} Focusable toolbar buttons.
   */
  private buttons(): FocusableButton[] {
    return Array.from(this.host.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button')).map(
      (element) => ({
        element,
        disabled: element.disabled,
        focus: () => {
          element.focus();
        },
      }),
    );
  }
  // #endregion
}
