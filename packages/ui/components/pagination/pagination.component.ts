import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  viewChild,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { CwSelect, CwSelectOption } from '@cadenway/ui/components/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretDoubleLeftBold,
  phosphorCaretDoubleRightBold,
  phosphorCaretLeftBold,
  phosphorCaretRightBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwPaginationEllipsis } from './pagination-ellipsis/pagination-ellipsis.component';
import { CwPaginationLink } from './pagination-link/pagination-link.component';
import type { CwPaginationLabels, CwPaginationSize, CwPaginationVariant } from './pagination.types';

const LABELS: CwPaginationLabels = {
  first: 'Première page',
  previous: 'Page précédente',
  previousText: 'Précédent',
  next: 'Page suivante',
  nextText: 'Suivant',
  last: 'Dernière page',
  page: 'Page',
  of: 'sur',
  hiddenPages: 'Pages masquées',
  pageSize: 'Lignes par page',
};

/* Literal class strings (Pagination sheet and preview of the Design System artifact) for the
   labelled « Précédent » and « Suivant » buttons: the icon side keeps a tighter padding. */
const STEP_BASE =
  'relative isolate inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-sm font-medium transition-all motion-reduce:transition-none outline-hidden ' +
  'hover:bg-accent hover:text-accent-foreground ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

const STEPS: Record<CwPaginationSize, { readonly previous: string; readonly next: string }> = {
  default: {
    previous: `${STEP_BASE} h-8 rounded-lg pr-3 pl-2`,
    next: `${STEP_BASE} h-8 rounded-lg pr-2 pl-3`,
  },
  sm: {
    previous: `${STEP_BASE} h-7 rounded-md pr-2.5 pl-1.5`,
    next: `${STEP_BASE} h-7 rounded-md pr-1.5 pl-2.5`,
  },
};

const NUMBER = new Intl.NumberFormat('fr-FR');

/** A page number, or the pages left out between two numbers. */
type Entry =
  { readonly key: string; readonly page: number } | { readonly key: string; readonly page: null };

/**
 * Moves through the pages of a long list read page by page: audit log, members, backups, advanced
 * search (Pagination sheet of the Design System artifact). Not for task lists nor the Kanban board,
 * which scroll.
 *
 * `[(page)]` (from 1) and `[(pageSize)]` are models; `total` is the number of rows. `full` shows
 * the first and last page buttons (`showFirstLast`), « Précédent », the numbers around the current
 * page (`siblings` on each side, the first and the last always, « … » for the pages left out) and
 * « Suivant ». `simple` shows « Précédent », « Page 3 sur 12 », « Suivant ». `showRange` adds
 * « 51–75 sur 286 » on the left; `pageSizes` adds « Lignes par page » and a Select (empty: none);
 * choosing a size goes back to page 1. With the range or the select shown, `simple` becomes the
 * table bar of the sheet: « Page 3 sur 12 » then icon buttons (first and last per `showFirstLast`).
 *
 * The buttons sit in a `nav` named `ariaLabel` (« Pagination »), each with an explicit name
 * (« Page 6 », « Page suivante »; « Précédent » and « Suivant » are named by their visible text, so
 * the name holds what is seen); the current page has `aria-current="page"`; out-of-bounds buttons
 * are `disabled`. A page change made here is announced (`LiveAnnouncer`, « Page 6 sur 12 ») and the
 * focus stays on a button when the pressed one gets disabled; moving the focus to the top of the
 * table is the consumer's. Hide the pagination under two pages. Texts are French by default,
 * overridable through `labels`.
 */
@Component({
  selector: 'cw-pagination',
  imports: [CwPaginationLink, CwPaginationEllipsis, CwRipple, CwSelect, CwSelectOption, NgIcon],
  providers: [
    provideIcons({
      phosphorCaretDoubleLeftBold,
      phosphorCaretDoubleRightBold,
      phosphorCaretLeftBold,
      phosphorCaretRightBold,
    }),
  ],
  host: {
    class: 'flex flex-wrap items-center justify-between gap-x-4 gap-y-2',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
  },
  templateUrl: './pagination.component.html',
})
export class CwPagination {
  /** Page shown, from 1; `[(page)]`. */
  readonly page = model(1);
  /** Rows per page; `[(pageSize)]`. */
  readonly pageSize = model(25);
  /** Number of rows in the whole list. */
  readonly total = input.required({ transform: numberAttribute });
  /** Choices of the page size select; empty: no select. */
  readonly pageSizes = input<readonly number[]>([10, 25, 50, 100]);
  /** Numbered pages, or « Page 3 sur 12 » between previous and next. */
  readonly variant = input<CwPaginationVariant>('full');
  /** Height of the buttons. */
  readonly size = input<CwPaginationSize>('default');
  /** Numbers shown on each side of the current page (`full`). */
  readonly siblings = input(1, { transform: numberAttribute });
  /** Shows the first and last page buttons. */
  readonly showFirstLast = input(true, { transform: booleanAttribute });
  /** Shows the range « 51–75 sur 286 » on the left. */
  readonly showRange = input(false, { transform: booleanAttribute });
  /** Accessible name of the navigation; name each pagination of a page on its own. */
  readonly ariaLabel = input('Pagination');
  /** Texts of the buttons, the range and the select, French by default. */
  readonly labels = input<Partial<CwPaginationLabels>>({});

  private readonly announcer = inject(LiveAnnouncer);
  private readonly injector = inject(Injector);
  private readonly nav = viewChild.required<ElementRef<HTMLElement>>('nav');

  protected readonly sizeId = inject(_IdGenerator).getId('cw-pagination-size-');
  protected readonly text = computed(() => ({ ...LABELS, ...this.labels() }));
  protected readonly steps = computed(() => STEPS[this.size()]);
  protected readonly selectSize = computed(() => (this.size() === 'sm' ? 'sm' : 'default'));

  protected readonly pageCount = computed(() => {
    const size = Math.max(1, Math.floor(this.pageSize()));
    return Math.max(1, Math.ceil(Math.max(0, this.total()) / size));
  });

  /** The page shown, kept within the bounds. */
  protected readonly current = computed(() =>
    Math.min(Math.max(1, Math.round(this.page())), this.pageCount()),
  );

  protected readonly hasSizes = computed(() => this.pageSizes().length > 0);
  /** `simple` next to the range or the select: the table bar of the sheet. */
  protected readonly compact = computed(
    () => this.variant() === 'simple' && (this.showRange() || this.hasSizes()),
  );

  protected readonly status = computed(
    () =>
      `${this.text().page} ${NUMBER.format(this.current())} ${this.text().of} ${NUMBER.format(this.pageCount())}`,
  );

  protected readonly range = computed(() => {
    const total = Math.max(0, this.total());
    const size = Math.max(1, Math.floor(this.pageSize()));
    const start = total === 0 ? 0 : (this.current() - 1) * size + 1;
    const end = Math.min(this.current() * size, total);
    return `${NUMBER.format(start)}–${NUMBER.format(end)} ${this.text().of} ${NUMBER.format(total)}`;
  });

  /**
   * First, last, and `siblings` numbers on each side of the current page; a gap of one page shows
   * that page, a wider gap « … » (preview: 1 … 5 6 7 … 12, 1 2 3 … 9). Seven slots at most with
   * the default `siblings` (sheet, "À éviter").
   */
  protected readonly entries = computed<readonly Entry[]>(() => {
    const count = this.pageCount();
    const current = this.current();
    const siblings = Math.max(0, Math.floor(this.siblings()));
    const pages = new Set<number>([1, count]);
    for (let page = current - siblings; page <= current + siblings; page++) {
      if (page >= 1 && page <= count) pages.add(page);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const entries: Entry[] = [];
    let previous = 0;
    for (const page of sorted) {
      if (previous > 0 && page - previous === 2) {
        entries.push({ key: String(page - 1), page: page - 1 });
      } else if (previous > 0 && page - previous > 2) {
        entries.push({ key: `gap-${String(previous)}`, page: null });
      }
      entries.push({ key: String(page), page });
      previous = page;
    }
    return entries;
  });

  /** Goes to `target` from the button pressed; does nothing out of bounds or on the same page. */
  protected goTo(target: number, event: Event): void {
    if (target < 1 || target > this.pageCount() || target === this.current()) return;
    this.page.set(target);
    this.announce();
    this.keepFocus(event.currentTarget);
  }

  protected changePageSize(size: number | null): void {
    if (size === null || size === this.pageSize()) return;
    // Sheet, "Sorties": a new page size goes back to page 1.
    this.pageSize.set(size);
    this.page.set(1);
    this.announce();
  }

  private announce(): void {
    void this.announcer.announce(this.status(), 'polite');
  }

  /* « Suivant » pressed on the last but one page gets disabled: the focus would fall to the body. */
  private keepFocus(pressed: EventTarget | null): void {
    afterNextRender(
      () => {
        if (pressed instanceof HTMLButtonElement && pressed.isConnected && !pressed.disabled) {
          return;
        }
        const nav = this.nav().nativeElement;
        const next =
          nav.querySelector<HTMLElement>('[aria-current="page"]') ??
          nav.querySelector<HTMLElement>('button:not([disabled]), a:not([aria-disabled])');
        next?.focus();
      },
      { injector: this.injector },
    );
  }
}
