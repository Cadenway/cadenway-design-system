/**
 * How a field's value is picked and shown: `status`, `person` and `select` tick options from the
 * field's `options` (the value is the list of their `value`s), `date` picks one day in a calendar
 * (an ISO `YYYY-MM-DD` string), `text` is typed.
 */
export type CwFilterFieldType = 'status' | 'person' | 'date' | 'select' | 'text';

/** One comparison a field offers (« est », « n'est pas », « avant le », « est vide »). */
export interface CwFilterOperator {
  /** Key stored in `CwFilter.operator`. */
  readonly value: string;
  /** Text of the operator segment and of its menu entry. */
  readonly label: string;
  /** The operator needs no value (« est vide »): the value segment disappears. */
  readonly valueless?: boolean;
}

/** One value a `status`, `person` or `select` field can take. */
export interface CwFilterOption {
  /** Key stored in the filter's value. */
  readonly value: string;
  /** Text of the menu entry and of the value segment. */
  readonly label: string;
  /**
   * Leading icon (an ng-icons name registered by the app); an `ng-template[cwFilterOption]` for
   * the field replaces it (status icons, avatars).
   */
  readonly icon?: string;
}

/** A field the user can filter on; the consumer defines them, the bar knows none. */
export interface CwFilterField {
  /** Key stored in `CwFilter.field`. */
  readonly key: string;
  /** Name of the field (« Statut »), in the chip and in the « + Filtre » menu. */
  readonly label: string;
  /** Neutral icon of the field (an ng-icons name registered by the app). */
  readonly icon?: string;
  /** How the value is picked and shown. */
  readonly type: CwFilterFieldType;
  /** The comparisons offered, the first one by default when the filter is added. */
  readonly operators: readonly CwFilterOperator[];
  /** The values to tick (`status`, `person`, `select`). */
  readonly options?: readonly CwFilterOption[];
  /**
   * Summary shown instead of the labels when more than two values are ticked (« 3 personnes »);
   * without it, every label is listed.
   */
  readonly manyLabel?: (count: number) => string;
}

/**
 * The value of a filter: the ticked option keys (`status`, `person`, `select`), an ISO day
 * (`date`), a text (`text`), or `null` when not chosen yet or when the operator needs none.
 */
export type CwFilterValue = string | readonly string[] | null;

/** One active filter: « Statut · est · En cours, Bloqué ». */
export interface CwFilter {
  /** `key` of a `CwFilterField`. */
  readonly field: string;
  /** `value` of one of the field's operators. */
  readonly operator: string;
  /** The chosen value. */
  readonly value: CwFilterValue;
}

/** A set of filters the user saved under a name (« Mes tâches en retard »). */
export interface CwSavedFilter {
  /** Stable key. */
  readonly id: string;
  /** Name in the saved filters menu. */
  readonly label: string;
  /** The filters it applies. */
  readonly filters: readonly CwFilter[];
}

/**
 * The French texts of the filter bar and its chips (Filter Bar sheet of the Design System artifact
 * and mockup `App.dc.html`); give some of them through `labels` to override them.
 */
export interface CwFilterBarLabels {
  /** Name of the bar region. */
  readonly region: string;
  /** « + » button of an empty bar. */
  readonly addFirst: string;
  /** « + » button next to the chips. */
  readonly add: string;
  /** Name of the menu of the fields. */
  readonly fields: string;
  /** Removes every filter. */
  readonly clear: string;
  /** Shown when the saved view was modified (`dirty`). */
  readonly saveView: string;
  /** Start of the summary of an empty bar. */
  readonly noFilter: string;
  /** Results counted by `total`, after « Aucun filtre · ». */
  readonly total: (total: number) => string;
  /** Saved filters button when none is applied, and name of its menu. */
  readonly savedFilters: string;
  /** Heading of the user's saved filters in that menu. */
  readonly savedGroup: string;
  /** Menu entry that saves the current filters under a name. */
  readonly saveCurrent: string;
  /** Menu entry that opens the management of the saved filters. */
  readonly manageSaved: string;
  /** Name of a chip. */
  readonly chip: (field: string) => string;
  /** Name of the operator segment. */
  readonly operator: (operator: string) => string;
  /** Name of the menu or panel of the values. */
  readonly values: (field: string) => string;
  /** Value segment while no value is chosen. */
  readonly emptyValue: string;
  /** Name of the remove segment. */
  readonly remove: (field: string) => string;
  /** Announced when a filter is added. */
  readonly added: (field: string) => string;
  /** Announced when a filter is removed. */
  readonly removed: (field: string) => string;
  /** Announced when every filter is removed. */
  readonly cleared: string;
}

/** What an `ng-template[cwFilterValue]` receives: the filter and its field. */
export interface CwFilterValueContext {
  readonly $implicit: CwFilter;
  readonly field: CwFilterField;
}

/** What an `ng-template[cwFilterOption]` receives: the option and its field. */
export interface CwFilterOptionContext {
  readonly $implicit: CwFilterOption;
  readonly field: CwFilterField;
}
