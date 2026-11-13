import { Component, booleanAttribute, computed, input, output } from '@angular/core';
import { CwAvatar } from '@cadenway/ui/avatar';
import { CwButton } from '@cadenway/ui/button';
import { CwMenu, CwMenuItem, CwMenuSeparator, CwMenuTriggerFor } from '@cadenway/ui/menu';
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
const HEADER =
  'grid h-7 grid-cols-[9.5rem_8rem_minmax(0,1fr)_1.25rem_4.5rem_1.5rem] items-center gap-3 border-b px-2 text-xs font-medium text-muted-foreground';
const LIST =
  'mt-1 flex flex-col *:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';
const ROW =
  'group/entry relative grid h-9 grid-cols-[9.5rem_8rem_minmax(0,1fr)_1.25rem_4.5rem_1.5rem] items-center gap-3 rounded-md px-2 text-sm transition-colors hover:bg-accent has-[[aria-expanded=true]]:bg-selected motion-reduce:transition-none';
const OPEN =
  'absolute inset-0 rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
const REVEAL =
  'relative z-10 flex justify-end opacity-0 transition-opacity group-hover/entry:opacity-100 group-focus-within/entry:opacity-100 has-[[aria-expanded=true]]:opacity-100 motion-reduce:transition-none';

const DAY = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const TIME = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * The time entries of an item: who, when, the note, billable or not, how long; a click edits an
 * entry, its menu duplicates or removes it (Time Tracker sheet of the Design System artifact).
 *
 * Renders a header row and a list named « Entrées de temps » of 36 px rows, each with a full-row
 * button « Modifier l'entrée de Léa Martin, Hier, 1 h 30 » (`entryEdit`) and a menu revealed on
 * hover and focus (Modifier, Dupliquer, Supprimer: `entryEdit`, `entryDuplicate`, `entryRemove`).
 * A running entry shows the jade dot, « En cours » and its duration as a clock. The footer sums the
 * total and the billable part. Dates read « Aujourd'hui », « Hier » or « 10 nov. » (`formatDate`
 * replaces the rule); an empty list reads « Aucun temps saisi ». `readonly` removes the buttons and
 * menus. Style hooks on the rows: `data-running`, `data-billable`.
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
  /** The entries, newest first. */
  readonly entries = input<readonly CwTimeEntry[]>([]);
  /** Writes an entry's date; « Aujourd'hui », « Hier », else « 10 nov. » by default. */
  readonly formatDate = input<((date: Date) => string) | null>(null);
  /** Removes the row buttons and menus. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** French texts, any of them overridden (`CW_TIME_ENTRY_LIST_LABELS`). */
  readonly labels = input<Partial<CwTimeEntryListLabels>>({});
  /** Emits the entry to edit: a click on its row, or « Modifier ». */
  readonly entryEdit = output<CwTimeEntry>();
  /** Emits the entry to duplicate. */
  readonly entryDuplicate = output<CwTimeEntry>();
  /** Emits the entry to remove. */
  readonly entryRemove = output<CwTimeEntry>();

  protected readonly header = HEADER;
  protected readonly listClasses = LIST;
  protected readonly rowClasses = ROW;
  protected readonly openClasses = OPEN;
  protected readonly revealClasses = REVEAL;
  protected readonly text = computed(() => ({ ...CW_TIME_ENTRY_LIST_LABELS, ...this.labels() }));
  protected readonly total = computed(() =>
    this.entries().reduce((sum, entry) => sum + entry.duration, 0),
  );
  protected readonly billableTotal = computed(() =>
    this.entries().reduce((sum, entry) => sum + (entry.billable ? entry.duration : 0), 0),
  );

  protected date(entry: CwTimeEntry): string {
    const custom = this.formatDate();
    if (custom) return custom(entry.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (sameDay(entry.date, today)) {
      // Preview: a running entry also gives its start time (« Aujourd'hui · 14:05 »).
      return entry.running
        ? `${this.text().today} · ${TIME.format(entry.date)}`
        : this.text().today;
    }
    if (sameDay(entry.date, yesterday)) return this.text().yesterday;
    return DAY.format(entry.date);
  }

  protected duration(entry: CwTimeEntry): string {
    return formatDuration(entry.duration, { clock: entry.running === true });
  }

  protected format(duration: number): string {
    return formatDuration(duration);
  }
}
