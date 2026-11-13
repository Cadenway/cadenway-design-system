import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/button';
import {
  CwMenu,
  CwMenuItem,
  CwMenuLabel,
  CwMenuSeparator,
  CwMenuTriggerFor,
} from '@cadenway/ui/menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBookmarkSimpleBold,
  phosphorCaretDownBold,
  phosphorFloppyDiskBold,
  phosphorFunnelSimpleBold,
  phosphorGearBold,
  phosphorPlusBold,
} from '@ng-icons/phosphor-icons/bold';

import { CW_FILTER_BAR_LABELS } from './filter-bar.constants';
import { CW_FILTER_TEMPLATES, type FilterTemplates } from './filter-bar.token';
import type {
  CwFilter,
  CwFilterBarLabels,
  CwFilterField,
  CwFilterValue,
  CwSavedFilter,
} from './filter-bar.types';
import { CwFilterChip } from './filter-chip/filter-chip.component';
import { CwFilterOptionDef } from './filter-option/filter-option.directive';
import { CwFilterValueDef } from './filter-value/filter-value.directive';

function sameValue(a: CwFilterValue, b: CwFilterValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }
  return a === b;
}

function sameFilters(a: readonly CwFilter[], b: readonly CwFilter[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (filter, index) =>
        filter.field === b[index].field &&
        filter.operator === b[index].operator &&
        sameValue(filter.value, b[index].value),
    )
  );
}

/**
 * The active filters of a view, as segmented chips, with adding, clearing and saved filters
 * (Filter Bar sheet of the Design System artifact; mockup `App.dc.html`, « Filtres actifs »).
 *
 * `[(filters)]` is a model (`filtersChange` on every addition, edit, removal and clearing; filters
 * apply at once, there is no « Appliquer »). `fields` describes what can be filtered: the bar knows
 * no field, operator or value of its own. Each filter renders a `cw-filter-chip`; « + Filtre »
 * opens a `cw-menu` of the fields, adds a filter with the field's first operator and opens its
 * value editor. « Tout effacer » removes every filter; « Enregistrer la vue » shows while `dirty`
 * and emits `saveView` with the filters. With `savedFilters`, a menu lists them (the one equal to
 * the current filters checked): choosing one sets the filters and emits `applySaved`; its last two
 * entries emit `saveFilter` (with the filters) and `manageSaved`. Without filters the bar shrinks
 * to « Ajouter un filtre » and « Aucun filtre · 64 résultats » when `total` is given.
 *
 * Renders `role="region"` named « Filtres actifs » (`labels.region`), with `data-empty` and
 * `data-dirty`. Additions and removals are announced (`LiveAnnouncer`); after a removal the focus
 * goes to the next chip, else to « + Filtre ». `ng-template[cwFilterValue]` and
 * `ng-template[cwFilterOption]` in its content customize the chips of a field.
 */
@Component({
  selector: 'cw-filter-bar',
  imports: [
    CwButton,
    CwFilterChip,
    CwMenu,
    CwMenuItem,
    CwMenuLabel,
    CwMenuSeparator,
    CwMenuTriggerFor,
    NgIcon,
  ],
  providers: [
    provideIcons({
      phosphorBookmarkSimpleBold,
      phosphorCaretDownBold,
      phosphorFloppyDiskBold,
      phosphorFunnelSimpleBold,
      phosphorGearBold,
      phosphorPlusBold,
    }),
    { provide: CW_FILTER_TEMPLATES, useExisting: CwFilterBar },
  ],
  host: {
    role: 'region',
    class: 'flex flex-wrap items-center gap-2',
    '[attr.aria-label]': 'text().region',
    '[attr.data-empty]': 'empty() ? "" : null',
    '[attr.data-dirty]': 'dirty() ? "" : null',
  },
  templateUrl: './filter-bar.component.html',
})
export class CwFilterBar implements FilterTemplates {
  /** The active filters, `[(filters)]`; `filtersChange` fires on every change. */
  readonly filters = model<readonly CwFilter[]>([]);
  /** The fields that can be filtered, with their operators and options. */
  readonly fields = input.required<readonly CwFilterField[]>();
  /** The user's saved filters; the saved filters menu shows when there is one. */
  readonly savedFilters = input<readonly CwSavedFilter[]>([]);
  /** The filters differ from the saved view: shows « Enregistrer la vue ». */
  readonly dirty = input(false, { transform: booleanAttribute });
  /** Number of results, shown next to « Aucun filtre » when there is no filter. */
  readonly total = input<number | null>(null);
  /** French texts to override (`CwFilterBarLabels`). */
  readonly labels = input<Partial<CwFilterBarLabels>>({});
  /** Emitted with the filters on « Enregistrer la vue ». */
  readonly saveView = output<readonly CwFilter[]>();
  /** Emitted with the saved filter chosen in the saved filters menu, once the filters are set. */
  readonly applySaved = output<CwSavedFilter>();
  /** Emitted with the filters on « Enregistrer les filtres actuels… ». */
  readonly saveFilter = output<readonly CwFilter[]>();
  /** Emitted on « Gérer les filtres ». */
  readonly manageSaved = output();

  /** The `ng-template[cwFilterValue]` of the content. Not public API. */
  readonly values = contentChildren(CwFilterValueDef, { descendants: true });
  /** The `ng-template[cwFilterOption]` of the content. Not public API. */
  readonly options = contentChildren(CwFilterOptionDef, { descendants: true });

  private readonly announcer = inject(LiveAnnouncer);
  private readonly injector = inject(Injector);
  private readonly chips = viewChildren(CwFilterChip);
  private readonly addButton = viewChild.required<string, ElementRef<HTMLElement>>('addButton', {
    read: ElementRef,
  });

  protected readonly text = computed<CwFilterBarLabels>(() => ({
    ...CW_FILTER_BAR_LABELS,
    ...this.labels(),
  }));

  private readonly fieldMap = computed(
    () => new Map(this.fields().map((field) => [field.key, field] as const)),
  );
  /** The filters whose field is known, with their index in `filters`. */
  protected readonly entries = computed(() =>
    this.filters().flatMap((filter, index) => {
      const field = this.fieldMap().get(filter.field);
      return field ? [{ filter, field, index }] : [];
    }),
  );
  protected readonly empty = computed(() => this.filters().length === 0);
  protected readonly summary = computed(() => {
    const total = this.total();
    const text = this.text();
    return total === null ? null : `${text.noFilter} · ${text.total(total)}`;
  });
  protected readonly applied = computed(
    () => this.savedFilters().find((saved) => sameFilters(saved.filters, this.filters())) ?? null,
  );

  protected add(field: CwFilterField): void {
    const operator = field.operators.at(0);
    const filter: CwFilter = {
      field: field.key,
      operator: operator?.value ?? '',
      value: null,
    };
    const index = this.filters().length;
    this.filters.set([...this.filters(), filter]);
    void this.announcer.announce(this.text().added(field.label));
    // The menu of the fields closes first and gives the focus back to « + Filtre »; the value
    // editor of the new chip opens once the chip is rendered.
    if (operator?.valueless) return;
    afterNextRender(
      () => {
        this.chipAt(index)?.ɵopenValue();
      },
      { injector: this.injector },
    );
  }

  protected update(index: number, filter: CwFilter): void {
    this.filters.set(this.filters().map((current, at) => (at === index ? filter : current)));
  }

  protected remove(index: number, field: CwFilterField): void {
    const position = this.entries().findIndex((entry) => entry.index === index);
    this.filters.set(this.filters().filter((_filter, at) => at !== index));
    void this.announcer.announce(this.text().removed(field.label));
    // Sheet, "Clavier": the focus goes to the next chip, else to « + Filtre ».
    afterNextRender(
      () => {
        const chips = this.chips();
        const next = chips.at(position) ?? null;
        if (next) next.ɵfocus();
        else this.addButton().nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  protected clear(): void {
    this.filters.set([]);
    void this.announcer.announce(this.text().cleared);
    afterNextRender(
      () => {
        this.addButton().nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  protected apply(saved: CwSavedFilter): void {
    this.filters.set(saved.filters);
    this.applySaved.emit(saved);
  }

  private chipAt(index: number): CwFilterChip | null {
    const position = this.entries().findIndex((entry) => entry.index === index);
    return position < 0 ? null : (this.chips().at(position) ?? null);
  }
}
