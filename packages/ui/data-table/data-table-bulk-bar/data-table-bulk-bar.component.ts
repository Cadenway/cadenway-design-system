import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { CwRipple, ɵFOCUS, ɵnavigateList } from '@cadenway/ui/core';
import { CwKbd } from '@cadenway/ui/kbd';
import { NgIcon } from '@ng-icons/core';

import { ɵCW_DATA_TABLE } from '../data-table.token';
import type { CwBulkAction } from '../data-table.types';

/* Literal class strings (DataTableComplete sheet and preview, "Barre d'actions de sélection"). */
const ACTION =
  'relative isolate inline-flex h-7 shrink-0 items-center gap-1.5 overflow-hidden rounded-md px-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent motion-reduce:transition-none ' +
  `${ɵFOCUS} [&_ng-icon]:[--ng-icon__size:1rem]`;

const VARIANTS: Record<NonNullable<CwBulkAction['variant']>, string> = {
  default: '',
  destructive: 'text-destructive',
};

/* French names of the keys the bar shows in its `kbd` (sheet DataTableComplete: « Suppr », « Échap »). */
const KEY_LABELS: Readonly<Record<string, string>> = {
  Delete: 'Suppr',
  Escape: 'Échap',
  Backspace: 'Retour',
  Enter: 'Entrée',
};

interface FocusableButton {
  readonly element: HTMLButtonElement;
  readonly disabled: boolean;
  focus(): void;
}

/**
 * The floating toolbar of a selection: « 3 tâches sélectionnées », the consumer's `bulkActions`
 * with their shortcut, then « Désélectionner » (DataTableComplete sheet, "Actions groupées").
 *
 * `cw-data-table` renders it when it has `bulkActions`; place one inside `cw-data-table` to add
 * projected buttons after the generated actions. It appears with the first selected row, centred
 * 12 px above the bottom of the grid (`animate-item-in`), never takes the focus by itself and is a
 * single tab stop: ← → Home End move between its buttons. Each action button carries
 * `aria-keyshortcuts` and `data-cw-bulk-action`; pressing it emits the table's `bulkAction` with the
 * button as `trigger`, so the consumer anchors its picker on it.
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
  /** Accessible name of the toolbar; « Actions sur la sélection » by default. */
  readonly ariaLabel = input<string | null>(null);

  protected readonly table = inject(ɵCW_DATA_TABLE);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly activeIndex = signal(0);

  protected readonly label = computed(() => this.ariaLabel() ?? this.table.copy().bulkBar);
  protected readonly actionClasses = ACTION;

  constructor() {
    // Roving tab stop over the buttons, projected ones included.
    afterRenderEffect({
      write: () => {
        this.table.selectedCount();
        this.table.bulkActions();
        const buttons = this.buttons();
        const active = Math.min(this.activeIndex(), Math.max(0, buttons.length - 1));
        buttons.forEach((button, index) => {
          button.element.tabIndex = index === active ? 0 : -1;
        });
      },
    });
  }

  protected classesOf(action: CwBulkAction): string {
    return `${ACTION} ${VARIANTS[action.variant ?? 'default']}`;
  }

  protected keyLabel(key: string): string {
    return KEY_LABELS[key] ?? key.toUpperCase();
  }

  protected run(action: CwBulkAction, event: MouseEvent): void {
    this.table.runBulkAction(action, event.currentTarget as HTMLElement);
  }

  protected onFocusin(event: FocusEvent): void {
    const index = this.buttons().findIndex((button) => button.element === event.target);
    if (index >= 0) this.activeIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const buttons = this.buttons();
    const current = buttons.findIndex((button) => button.element === event.target);
    if (current < 0) return;
    const manager = new FocusKeyManager<FocusableButton>(buttons).withWrap();
    manager.updateActiveItem(current);
    const rtl = getComputedStyle(this.host).direction === 'rtl';
    if (ɵnavigateList(manager, event, 'horizontal', rtl)) {
      event.preventDefault();
      this.activeIndex.set(manager.activeItemIndex ?? current);
    }
    manager.destroy();
  }

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
}
