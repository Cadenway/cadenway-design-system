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
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type Signal,
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

/**
 * Constant LABELS
 *
 * @description
 * Default French navigation and page-size labels.
 *
 * @type {CwPaginationLabels}
 */
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

/**
 * Constant STEP_BASE
 *
 * @description
 * Shared literal classes for labeled previous and next buttons.
 *
 * @type {string}
 */
const STEP_BASE: string =
  'relative isolate inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-sm font-medium transition-all motion-reduce:transition-none outline-hidden ' +
  'hover:bg-accent hover:text-accent-foreground ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * Constant STEPS
 *
 * @description
 * Previous and next button classes for each size.
 *
 * @type {Record<CwPaginationSize, { readonly previous: string; readonly next: string }>}
 */
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

/**
 * Constant NUMBER
 *
 * @description
 * French number formatter for page and row counts.
 *
 * @type {Intl.NumberFormat}
 */
const NUMBER: Intl.NumberFormat = new Intl.NumberFormat('fr-FR');

/**
 * Type Entry
 *
 * @description
 * A page number or a gap between visible page numbers.
 *
 * @type {{ readonly key: string; readonly page: number } | { readonly key: string; readonly page: null }}
 */
type Entry =
  { readonly key: string; readonly page: number } | { readonly key: string; readonly page: null };

/**
 * Class CwPagination
 * @class CwPagination
 *
 * @description
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
  // #region Properties
  /**
   * Property page
   * @readonly
   *
   * @description
   * Page shown, from 1; `[(page)]`.
   *
   * @type {ModelSignal<number>}
   */
  public readonly page: ModelSignal<number> = model(1);

  /**
   * Property pageSize
   * @readonly
   *
   * @description
   * Rows per page; `[(pageSize)]`.
   *
   * @type {ModelSignal<number>}
   */
  public readonly pageSize: ModelSignal<number> = model(25);

  /**
   * Property total
   * @readonly
   *
   * @description
   * Number of rows in the whole list.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly total: InputSignalWithTransform<number, unknown> = input.required({
    transform: numberAttribute,
  });

  /**
   * Property pageSizes
   * @readonly
   *
   * @description
   * Choices of the page size select; empty: no select.
   *
   * @type {InputSignal<readonly number[]>}
   */
  public readonly pageSizes: InputSignal<readonly number[]> = input<readonly number[]>([
    10, 25, 50, 100,
  ]);

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Numbered pages, or « Page 3 sur 12 » between previous and next.
   *
   * @type {InputSignal<CwPaginationVariant>}
   */
  public readonly variant: InputSignal<CwPaginationVariant> = input<CwPaginationVariant>('full');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Height of the buttons.
   *
   * @type {InputSignal<CwPaginationSize>}
   */
  public readonly size: InputSignal<CwPaginationSize> = input<CwPaginationSize>('default');

  /**
   * Property siblings
   * @readonly
   *
   * @description
   * Numbers shown on each side of the current page (`full`).
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly siblings: InputSignalWithTransform<number, unknown> = input(1, {
    transform: numberAttribute,
  });

  /**
   * Property showFirstLast
   * @readonly
   *
   * @description
   * Shows the first and last page buttons.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly showFirstLast: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property showRange
   * @readonly
   *
   * @description
   * Shows the range « 51–75 sur 286 » on the left.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly showRange: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the navigation; name each pagination of a page on its own.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('Pagination');

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Texts of the buttons, the range and the select, French by default.
   *
   * @type {InputSignal<Partial<CwPaginationLabels>>}
   */
  public readonly labels: InputSignal<Partial<CwPaginationLabels>> = input<
    Partial<CwPaginationLabels>
  >({});

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Announces user-initiated page changes.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to schedule focus restoration.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property nav
   * @readonly
   *
   * @description
   * Navigation element containing the page controls.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   */
  private readonly nav: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('nav');

  /**
   * Property sizeId
   * @readonly
   *
   * @description
   * Unique identifier for the page-size label.
   *
   * @type {string}
   */
  protected readonly sizeId: string = inject(_IdGenerator).getId('cw-pagination-size-');

  /**
   * Property text
   * @readonly
   *
   * @description
   * French labels merged with consumer overrides.
   *
   * @type {Signal<CwPaginationLabels>}
   */
  protected readonly text: Signal<CwPaginationLabels> = computed(() => ({
    ...LABELS,
    ...this.labels(),
  }));

  /**
   * Property steps
   * @readonly
   *
   * @description
   * Classes for the previous and next controls.
   *
   * @type {Signal<{ readonly previous: string; readonly next: string }>}
   */
  protected readonly steps: Signal<{ readonly previous: string; readonly next: string }> = computed(
    () => STEPS[this.size()],
  );

  /**
   * Property selectSize
   * @readonly
   *
   * @description
   * Page-size select size matching the pagination.
   *
   * @type {Signal<'sm' | 'default'>}
   */
  protected readonly selectSize: Signal<'sm' | 'default'> = computed(() =>
    this.size() === 'sm' ? 'sm' : 'default',
  );

  /**
   * Property pageCount
   * @readonly
   *
   * @description
   * Number of pages, with a minimum of one.
   *
   * @type {Signal<number>}
   */
  protected readonly pageCount: Signal<number> = computed(() => {
    const size: number = Math.max(1, Math.floor(this.pageSize()));
    return Math.max(1, Math.ceil(Math.max(0, this.total()) / size));
  });

  /**
   * Property current
   * @readonly
   *
   * @description
   * Current page clamped to the available range.
   *
   * @type {Signal<number>}
   */
  protected readonly current: Signal<number> = computed(() =>
    Math.min(Math.max(1, Math.round(this.page())), this.pageCount()),
  );

  /**
   * Property hasSizes
   * @readonly
   *
   * @description
   * Whether page-size choices are available.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hasSizes: Signal<boolean> = computed(() => this.pageSizes().length > 0);

  /**
   * Property compact
   * @readonly
   *
   * @description
   * Whether simple pagination uses the compact table layout.
   *
   * @type {Signal<boolean>}
   */
  protected readonly compact: Signal<boolean> = computed(
    () => this.variant() === 'simple' && (this.showRange() || this.hasSizes()),
  );

  /**
   * Property status
   * @readonly
   *
   * @description
   * Current page and page count for display and announcement.
   *
   * @type {Signal<string>}
   */
  protected readonly status: Signal<string> = computed(
    () =>
      `${this.text().page} ${NUMBER.format(this.current())} ${this.text().of} ${NUMBER.format(this.pageCount())}`,
  );

  /**
   * Property range
   * @readonly
   *
   * @description
   * Formatted range of rows visible on the current page.
   *
   * @type {Signal<string>}
   */
  protected readonly range: Signal<string> = computed(() => {
    const total: number = Math.max(0, this.total());
    const size: number = Math.max(1, Math.floor(this.pageSize()));
    const start: number = total === 0 ? 0 : (this.current() - 1) * size + 1;
    const end: number = Math.min(this.current() * size, total);
    return `${NUMBER.format(start)}–${NUMBER.format(end)} ${this.text().of} ${NUMBER.format(total)}`;
  });

  /**
   * Property entries
   * @readonly
   *
   * @description
   * Visible page numbers and gaps around the current page.
   *
   * @type {Signal<readonly Entry[]>}
   */
  protected readonly entries: Signal<readonly Entry[]> = computed<readonly Entry[]>(() => {
    const count: number = this.pageCount();
    const current: number = this.current();
    const siblings: number = Math.max(0, Math.floor(this.siblings()));
    const pages: Set<number> = new Set<number>([1, count]);
    for (let page: number = current - siblings; page <= current + siblings; page++) {
      if (page >= 1 && page <= count) pages.add(page);
    }
    const sorted: number[] = [...pages].sort((a, b) => a - b);
    const entries: Entry[] = [];
    let previous: number = 0;
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
  // #endregion

  // #region Methods
  /**
   * Method goTo
   * @method goTo
   *
   * @description
   * Changes pages within bounds and maintains focus on an enabled control.
   *
   * @param {number} target - Page requested by the user.
   * @param {Event} event - Activation event used to identify the pressed control.
   */
  protected goTo(target: number, event: Event): void {
    if (target < 1 || target > this.pageCount() || target === this.current()) return;
    this.page.set(target);
    this.announce();
    this.keepFocus(event.currentTarget);
  }

  /**
   * Method changePageSize
   * @method changePageSize
   *
   * @description
   * Changes page size and returns to the first page.
   *
   * @param {number | null} size - Selected page size, or null when no option is selected.
   */
  protected changePageSize(size: number | null): void {
    if (size === null || size === this.pageSize()) return;
    // Sheet, "Sorties": a new page size goes back to page 1.
    this.pageSize.set(size);
    this.page.set(1);
    this.announce();
  }

  /**
   * Method announce
   * @method announce
   *
   * @description
   * Announces the current pagination status.
   */
  private announce(): void {
    void this.announcer.announce(this.status(), 'polite');
  }

  /**
   * Method keepFocus
   * @method keepFocus
   *
   * @description
   * Restores focus when the pressed page control becomes unavailable.
   *
   * @param {EventTarget | null} pressed - Control that initiated the page change.
   */
  private keepFocus(pressed: EventTarget | null): void {
    afterNextRender(
      () => {
        if (pressed instanceof HTMLButtonElement && pressed.isConnected && !pressed.disabled) {
          return;
        }
        const nav: HTMLElement = this.nav().nativeElement;
        const next: HTMLElement | null =
          nav.querySelector<HTMLElement>('[aria-current="page"]') ??
          nav.querySelector<HTMLElement>('button:not([disabled]), a:not([aria-disabled])');
        next?.focus();
      },
      { injector: this.injector },
    );
  }
  // #endregion
}
