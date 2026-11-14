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
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import {
  CwMenu,
  CwMenuItem,
  CwMenuLabel,
  CwMenuSeparator,
  CwMenuTriggerFor,
} from '@cadenway/ui/components/menu';
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
  CwFilterOperator,
  CwFilterValue,
  CwSavedFilter,
} from './filter-bar.types';
import { CwFilterChip } from './filter-chip/filter-chip.component';
import { CwFilterOptionDef } from './filter-option/filter-option.directive';
import { CwFilterValueDef } from './filter-value/filter-value.directive';

/**
 * Function sameValue
 *
 * @description
 * Compares filter values, including ordered option arrays.
 *
 * @param {CwFilterValue} a - First value or filter list to compare.
 * @param {CwFilterValue} b - Second value or filter list to compare.
 * @returns {boolean} Whether the values are equal in order.
 */
function sameValue(a: CwFilterValue, b: CwFilterValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }
  return a === b;
}

/**
 * Function sameFilters
 *
 * @description
 * Compares ordered filter lists by field, operator and value.
 *
 * @param {readonly CwFilter[]} a - First value or filter list to compare.
 * @param {readonly CwFilter[]} b - Second value or filter list to compare.
 * @returns {boolean} Whether the filter lists are equal in order.
 */
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
 * Component CwFilterBar
 *
 * @description
 * The active filters of a view, as segmented chips, with adding, clearing and saved filters (Filter Bar sheet of the Design System artifact; mockup `App.dc.html`, « Filtres actifs »). `[(filters)]` is a model (`filtersChange` on every addition, edit, removal and clearing; filters apply at once, there is no « Appliquer »). `fields` describes what can be filtered: the bar knows no field, operator or value of its own. Each filter renders a `cw-filter-chip`; « + Filtre » opens a `cw-menu` of the fields, adds a filter with the field's first operator and opens its value editor. « Tout effacer » removes every filter; « Enregistrer la vue » shows while `dirty` and emits `saveView` with the filters. With `savedFilters`, a menu lists them (the one equal to the current filters checked): choosing one sets the filters and emits `applySaved`; its last two entries emit `saveFilter` (with the filters) and `manageSaved`. Without filters the bar shrinks to « Ajouter un filtre » and « Aucun filtre · 64 résultats » when `total` is given. Renders `role="region"` named « Filtres actifs » (`labels.region`), with `data-empty` and `data-dirty`. Additions and removals are announced (`LiveAnnouncer`); after a removal the focus goes to the next chip, else to « + Filtre ». `ng-template[cwFilterValue]` and `ng-template[cwFilterOption]` in its content customize the chips of a field.
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
  // #region Properties
  /**
   * Property filters
   *
   * @description
   * The active filters, `[(filters)]`; `filtersChange` fires on every change.
   *
   * @type {ModelSignal<readonly CwFilter[]>}
   * @readonly
   */
  public readonly filters: ModelSignal<readonly CwFilter[]> = model<readonly CwFilter[]>([]);

  /**
   * Property fields
   *
   * @description
   * The fields that can be filtered, with their operators and options.
   *
   * @type {InputSignal<readonly CwFilterField[]>}
   * @readonly
   */
  public readonly fields: InputSignal<readonly CwFilterField[]> =
    input.required<readonly CwFilterField[]>();

  /**
   * Property savedFilters
   *
   * @description
   * The user's saved filters; the saved filters menu shows when there is one.
   *
   * @type {InputSignal<readonly CwSavedFilter[]>}
   * @readonly
   */
  public readonly savedFilters: InputSignal<readonly CwSavedFilter[]> = input<
    readonly CwSavedFilter[]
  >([]);

  /**
   * Property dirty
   *
   * @description
   * The filters differ from the saved view: shows « Enregistrer la vue ».
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly dirty: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property total
   *
   * @description
   * Number of results, shown next to « Aucun filtre » when there is no filter.
   *
   * @type {InputSignal<number | null>}
   * @readonly
   */
  public readonly total: InputSignal<number | null> = input<number | null>(null);

  /**
   * Property labels
   *
   * @description
   * French texts to override (`CwFilterBarLabels`).
   *
   * @type {InputSignal<Partial<CwFilterBarLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwFilterBarLabels>> = input<
    Partial<CwFilterBarLabels>
  >({});

  /**
   * Property saveView
   *
   * @description
   * Emitted with the filters on « Enregistrer la vue ».
   *
   * @type {OutputEmitterRef<readonly CwFilter[]>}
   * @readonly
   */
  public readonly saveView: OutputEmitterRef<readonly CwFilter[]> = output<readonly CwFilter[]>();

  /**
   * Property applySaved
   *
   * @description
   * Emitted with the saved filter chosen in the saved filters menu, once the filters are set.
   *
   * @type {OutputEmitterRef<CwSavedFilter>}
   * @readonly
   */
  public readonly applySaved: OutputEmitterRef<CwSavedFilter> = output<CwSavedFilter>();

  /**
   * Property saveFilter
   *
   * @description
   * Emitted with the filters on « Enregistrer les filtres actuels… ».
   *
   * @type {OutputEmitterRef<readonly CwFilter[]>}
   * @readonly
   */
  public readonly saveFilter: OutputEmitterRef<readonly CwFilter[]> = output<readonly CwFilter[]>();

  /**
   * Property manageSaved
   *
   * @description
   * Emitted on « Gérer les filtres ».
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly manageSaved: OutputEmitterRef<void> = output();

  /**
   * Property values
   *
   * @description
   * The `ng-template[cwFilterValue]` of the content. Not public API.
   *
   * @type {Signal<readonly CwFilterValueDef[]>}
   * @readonly
   */
  public readonly values: Signal<readonly CwFilterValueDef[]> = contentChildren(CwFilterValueDef, {
    descendants: true,
  });

  /**
   * Property options
   *
   * @description
   * The `ng-template[cwFilterOption]` of the content. Not public API.
   *
   * @type {Signal<readonly CwFilterOptionDef[]>}
   * @readonly
   */
  public readonly options: Signal<readonly CwFilterOptionDef[]> = contentChildren(
    CwFilterOptionDef,
    { descendants: true },
  );

  /**
   * Property announcer
   *
   * @description
   * Live announcer for filter additions and removals.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property injector
   *
   * @description
   * Injector used for work scheduled after rendering.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property chips
   *
   * @description
   * Rendered filter chips used to restore focus.
   *
   * @type {Signal<readonly CwFilterChip[]>}
   * @readonly
   */
  private readonly chips: Signal<readonly CwFilterChip[]> = viewChildren(CwFilterChip);

  /**
   * Property addButton
   *
   * @description
   * Add-filter button used to restore focus.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly addButton: Signal<ElementRef<HTMLElement>> = viewChild.required<
    string,
    ElementRef<HTMLElement>
  >('addButton', {
    read: ElementRef,
  });

  /**
   * Property text
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<CwFilterBarLabels>}
   * @readonly
   */
  protected readonly text: Signal<CwFilterBarLabels> = computed<CwFilterBarLabels>(() => ({
    ...CW_FILTER_BAR_LABELS,
    ...this.labels(),
  }));

  /**
   * Property fieldMap
   *
   * @description
   * Filter fields indexed by their keys.
   *
   * @type {Signal<Map<string, CwFilterField>>}
   * @readonly
   */
  private readonly fieldMap: Signal<Map<string, CwFilterField>> = computed(
    () => new Map(this.fields().map((field) => [field.key, field] as const)),
  );

  /**
   * Property entries
   *
   * @description
   * The filters whose field is known, with their index in `filters`.
   *
   * @type {Signal<{ filter: CwFilter; field: CwFilterField; index: number; }[]>}
   * @readonly
   */
  protected readonly entries: Signal<{ filter: CwFilter; field: CwFilterField; index: number }[]> =
    computed(() =>
      this.filters().flatMap((filter, index) => {
        const field: CwFilterField | undefined = this.fieldMap().get(filter.field);
        return field ? [{ filter, field, index }] : [];
      }),
    );

  /**
   * Property empty
   *
   * @description
   * Whether no active filters are present.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly empty: Signal<boolean> = computed(() => this.filters().length === 0);

  /**
   * Property summary
   *
   * @description
   * Summary shown for an empty filter bar.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly summary: Signal<string | null> = computed(() => {
    const total: number | null = this.total();
    const text: CwFilterBarLabels = this.text();
    return total === null ? null : `${text.noFilter} · ${text.total(total)}`;
  });

  /**
   * Property applied
   *
   * @description
   * Saved filter matching the current filters, or null.
   *
   * @type {Signal<CwSavedFilter | null>}
   * @readonly
   */
  protected readonly applied: Signal<CwSavedFilter | null> = computed(
    () => this.savedFilters().find((saved) => sameFilters(saved.filters, this.filters())) ?? null,
  );
  // #endregion

  // #region Methods
  /**
   * Method add
   *
   * @description
   * Adds a filter using the field’s first operator.
   *
   * @param {CwFilterField} field - Field associated with the operation.
   */
  protected add(field: CwFilterField): void {
    const operator: CwFilterOperator | undefined = field.operators.at(0);
    const filter: CwFilter = {
      field: field.key,
      operator: operator?.value ?? '',
      value: null,
    };
    const index: number = this.filters().length;
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

  /**
   * Method update
   *
   * @description
   * Replaces a filter at the requested index.
   *
   * @param {number} index - Index of the filter to update or remove.
   * @param {CwFilter} filter - Filter to apply at the index.
   */
  protected update(index: number, filter: CwFilter): void {
    this.filters.set(this.filters().map((current, at) => (at === index ? filter : current)));
  }

  /**
   * Method remove
   *
   * @description
   * Removes a filter and restores focus.
   *
   * @param {number} index - Index of the filter to update or remove.
   * @param {CwFilterField} field - Field associated with the operation.
   */
  protected remove(index: number, field: CwFilterField): void {
    const position: number = this.entries().findIndex((entry) => entry.index === index);
    this.filters.set(this.filters().filter((_filter, at) => at !== index));
    void this.announcer.announce(this.text().removed(field.label));
    // Sheet, "Clavier": the focus goes to the next chip, else to « + Filtre ».
    afterNextRender(
      () => {
        const chips: readonly CwFilterChip[] = this.chips();
        const next: CwFilterChip | null = chips.at(position) ?? null;
        if (next) next.ɵfocus();
        else this.addButton().nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  /**
   * Method clear
   *
   * @description
   * Removes every active filter and announces the change.
   */
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

  /**
   * Method apply
   *
   * @description
   * Applies a saved filter and reports the selection.
   *
   * @param {CwSavedFilter} saved - Saved filter to apply.
   */
  protected apply(saved: CwSavedFilter): void {
    this.filters.set(saved.filters);
    this.applySaved.emit(saved);
  }

  /**
   * Method chipAt
   *
   * @description
   * Finds the rendered chip for a filter index.
   *
   * @param {number} index - Index of the filter to update or remove.
   * @returns {CwFilterChip | null} Rendered chip at the index, or undefined when absent.
   */
  private chipAt(index: number): CwFilterChip | null {
    const position: number = this.entries().findIndex((entry) => entry.index === index);
    return position < 0 ? null : (this.chips().at(position) ?? null);
  }
  // #endregion
}
