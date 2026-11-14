import {
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  type InputSignalWithTransform,
  type InputSignal,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwButton } from '@cadenway/ui/components/button';
import { ɵsameDay } from '@cadenway/ui/core';
import {
  CwMenu,
  CwMenuItem,
  CwMenuSeparator,
  CwMenuTriggerFor,
} from '@cadenway/ui/components/menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCopyBold,
  phosphorCurrencyEurBold,
  phosphorDotsThreeBold,
  phosphorPencilSimpleBold,
  phosphorTrashBold,
} from '@ng-icons/phosphor-icons/bold';

import { formatDuration } from '../duration';
import { CW_TIME_ENTRY_LIST_LABELS } from '../time-tracker.constants';
import type { CwTimeEntry, CwTimeEntryListLabels } from '../time-tracker.types';

/* Literal class strings (Time Tracker sheet and preview of the Design System artifact): one grid for
   the header and the rows; the rows enter in cascade (60 ms then +30 ms, twelve at most). */
/**
 * Constant HEADER
 *
 * @description
 * Classes for the entry list header.
 *
 * @type {string}
 */
const HEADER: string =
  'grid h-7 grid-cols-[9.5rem_8rem_minmax(0,1fr)_1.25rem_4.5rem_1.5rem] items-center gap-3 border-b px-2 text-xs font-medium text-muted-foreground';
/**
 * Constant LIST
 *
 * @description
 * Classes for the entry list.
 *
 * @type {string}
 */
const LIST: string =
  'mt-1 flex flex-col *:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';
/**
 * Constant ROW
 *
 * @description
 * Classes for an entry row.
 *
 * @type {string}
 */
const ROW: string =
  'group/entry relative grid h-9 grid-cols-[9.5rem_8rem_minmax(0,1fr)_1.25rem_4.5rem_1.5rem] items-center gap-3 rounded-md px-2 text-sm transition-colors hover:bg-accent has-[[aria-expanded=true]]:bg-selected motion-reduce:transition-none';
/**
 * Constant OPEN
 *
 * @description
 * Classes for the entry edit overlay.
 *
 * @type {string}
 */
const OPEN: string =
  'absolute inset-0 rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
/**
 * Constant REVEAL
 *
 * @description
 * Classes for the row action controls.
 *
 * @type {string}
 */
const REVEAL: string =
  'relative z-10 flex justify-end opacity-0 transition-opacity group-hover/entry:opacity-100 group-focus-within/entry:opacity-100 has-[[aria-expanded=true]]:opacity-100 motion-reduce:transition-none';

/**
 * Constant DAY
 *
 * @description
 * French day and month formatter.
 *
 * @type {Intl.DateTimeFormat}
 */
const DAY: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});
/**
 * Constant TIME
 *
 * @description
 * French time formatter.
 *
 * @type {Intl.DateTimeFormat}
 */
const TIME: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Component CwTimeEntryList
 *
 * @description
 * The time entries of an item: who, when, the note, billable or not, how long; a click edits an entry, its menu duplicates or removes it (Time Tracker sheet of the Design System artifact). Renders a header row and a list named « Entrées de temps » of 36 px rows, each with a full-row button « Modifier l'entrée de Léa Martin, Hier, 1 h 30 » (`entryEdit`) and a menu revealed on hover and focus (Modifier, Dupliquer, Supprimer: `entryEdit`, `entryDuplicate`, `entryRemove`). A running entry shows the jade dot, « En cours » and its duration as a clock. The footer sums the total and the billable part. Dates read « Aujourd'hui », « Hier » or « 10 nov. » (`formatDate` replaces the rule); an empty list reads « Aucun temps saisi ». `readonly` removes the buttons and menus. Style hooks on the rows: `data-running`, `data-billable`.
 */
@Component({
  selector: 'cw-time-entry-list',
  imports: [NgIcon, CwAvatar, CwButton, CwMenu, CwMenuItem, CwMenuSeparator, CwMenuTriggerFor],
  providers: [
    provideIcons({
      phosphorCopyBold,
      phosphorCurrencyEurBold,
      phosphorDotsThreeBold,
      phosphorPencilSimpleBold,
      phosphorTrashBold,
    }),
  ],
  host: { class: 'block min-w-0' },
  templateUrl: './time-entry-list.component.html',
})
export class CwTimeEntryList {
  // #region Properties
  /**
   * Property entries
   *
   * @description
   * The entries, newest first.
   *
   * @type {InputSignal<readonly CwTimeEntry[]>}
   * @readonly
   */
  public readonly entries: InputSignal<readonly CwTimeEntry[]> = input<readonly CwTimeEntry[]>([]);

  /**
   * Property formatDate
   *
   * @description
   * Writes an entry's date; « Aujourd'hui », « Hier », else « 10 nov. » by default.
   *
   * @type {InputSignal<((date: Date) => string) | null>}
   * @readonly
   */
  public readonly formatDate: InputSignal<((date: Date) => string) | null> = input<
    ((date: Date) => string) | null
  >(null);

  /**
   * Property readonly
   *
   * @description
   * Removes the row buttons and menus.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property labels
   *
   * @description
   * French texts, any of them overridden (`CW_TIME_ENTRY_LIST_LABELS`).
   *
   * @type {InputSignal<Partial<CwTimeEntryListLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwTimeEntryListLabels>> = input<
    Partial<CwTimeEntryListLabels>
  >({});

  /**
   * Property entryEdit
   *
   * @description
   * Emits the entry to edit: a click on its row, or « Modifier ».
   *
   * @type {OutputEmitterRef<CwTimeEntry>}
   * @readonly
   */
  public readonly entryEdit: OutputEmitterRef<CwTimeEntry> = output<CwTimeEntry>();

  /**
   * Property entryDuplicate
   *
   * @description
   * Emits the entry to duplicate.
   *
   * @type {OutputEmitterRef<CwTimeEntry>}
   * @readonly
   */
  public readonly entryDuplicate: OutputEmitterRef<CwTimeEntry> = output<CwTimeEntry>();

  /**
   * Property entryRemove
   *
   * @description
   * Emits the entry to remove.
   *
   * @type {OutputEmitterRef<CwTimeEntry>}
   * @readonly
   */
  public readonly entryRemove: OutputEmitterRef<CwTimeEntry> = output<CwTimeEntry>();

  /**
   * Property header
   *
   * @description
   * Classes for the entry list header.
   *
   * @type {string}
   * @readonly
   */
  protected readonly header: string = HEADER;

  /**
   * Property listClasses
   *
   * @description
   * Classes for the entry list.
   *
   * @type {string}
   * @readonly
   */
  protected readonly listClasses: string = LIST;

  /**
   * Property rowClasses
   *
   * @description
   * Classes for each entry row.
   *
   * @type {string}
   * @readonly
   */
  protected readonly rowClasses: string = ROW;

  /**
   * Property openClasses
   *
   * @description
   * Classes for the entry edit overlay.
   *
   * @type {string}
   * @readonly
   */
  protected readonly openClasses: string = OPEN;

  /**
   * Property revealClasses
   *
   * @description
   * Classes for the row action controls.
   *
   * @type {string}
   * @readonly
   */
  protected readonly revealClasses: string = REVEAL;

  /**
   * Property text
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<{ list: string; person: string; date: string; note: string; billable: string; duration: string; running: string; noNote: string; empty: string; today: string; yesterday: string; total: string; edit: (person: string, date: string, duration: string) => string; actions: (person: string) => string; editAction: string; duplicate: string; remove: string; }>}
   * @readonly
   */
  protected readonly text: Signal<{
    list: string;
    person: string;
    date: string;
    note: string;
    billable: string;
    duration: string;
    running: string;
    noNote: string;
    empty: string;
    today: string;
    yesterday: string;
    total: string;
    edit: (person: string, date: string, duration: string) => string;
    actions: (person: string) => string;
    editAction: string;
    duplicate: string;
    remove: string;
  }> = computed(() => ({ ...CW_TIME_ENTRY_LIST_LABELS, ...this.labels() }));

  /**
   * Property total
   *
   * @description
   * Total duration of the displayed entries.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly total: Signal<number> = computed(() =>
    this.entries().reduce((sum, entry) => sum + entry.duration, 0),
  );

  /**
   * Property billableTotal
   *
   * @description
   * Billable duration of the displayed entries.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly billableTotal: Signal<number> = computed(() =>
    this.entries().reduce((sum, entry) => sum + (entry.billable ? entry.duration : 0), 0),
  );
  // #endregion

  // #region Methods
  /**
   * Method date
   *
   * @description
   * Formats the date of an entry.
   *
   * @param {CwTimeEntry} entry - Time entry to format.
   * @returns {string} Formatted entry date.
   */
  protected date(entry: CwTimeEntry): string {
    const custom: ((date: Date) => string) | null = this.formatDate();
    if (custom) return custom(entry.date);
    const today: Date = new Date();
    const yesterday: Date = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (ɵsameDay(entry.date, today)) {
      // Preview: a running entry also gives its start time (« Aujourd'hui · 14:05 »).
      return entry.running
        ? `${this.text().today} · ${TIME.format(entry.date)}`
        : this.text().today;
    }
    if (ɵsameDay(entry.date, yesterday)) return this.text().yesterday;
    return DAY.format(entry.date);
  }

  /**
   * Method duration
   *
   * @description
   * Formats the duration of an entry.
   *
   * @param {CwTimeEntry} entry - Time entry to format.
   * @returns {string} Formatted entry duration.
   */
  protected duration(entry: CwTimeEntry): string {
    return formatDuration(entry.duration, { clock: entry.running === true });
  }

  /**
   * Method format
   *
   * @description
   * Formats a duration in milliseconds.
   *
   * @param {number} duration - Duration in milliseconds.
   * @returns {string} Formatted duration.
   */
  protected format(duration: number): string {
    return formatDuration(duration);
  }
  // #endregion
}
