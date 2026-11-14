/**
 * Type CwFilterFieldType
 *
 * @description
 * How a field's value is picked and shown: `status`, `person` and `select` tick options from the field's `options` (the value is the list of their `value`s), `date` picks one day in a calendar (an ISO `YYYY-MM-DD` string), `text` is typed.
 *
 * @type {'status' | 'person' | 'date' | 'select' | 'text'}
 */
export type CwFilterFieldType = 'status' | 'person' | 'date' | 'select' | 'text';

/**
 * Interface CwFilterOperator
 *
 * @description
 * One comparison a field offers (« est », « n'est pas », « avant le », « est vide »).
 */
export interface CwFilterOperator {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * Key stored in `CwFilter.operator`.
   *
   * @type {string}
   * @readonly
   */
  readonly value: string;

  /**
   * Property label
   *
   * @description
   * Text of the operator segment and of its menu entry.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property valueless
   *
   * @description
   * The operator needs no value (« est vide »): the value segment disappears.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly valueless?: boolean;
  // #endregion
}

/**
 * Interface CwFilterOption
 *
 * @description
 * One value a `status`, `person` or `select` field can take.
 */
export interface CwFilterOption {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * Key stored in the filter's value.
   *
   * @type {string}
   * @readonly
   */
  readonly value: string;

  /**
   * Property label
   *
   * @description
   * Text of the menu entry and of the value segment.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property icon
   *
   * @description
   * Leading icon (an ng-icons name registered by the app); an `ng-template[cwFilterOption]` for the field replaces it (status icons, avatars).
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly icon?: string;
  // #endregion
}

/**
 * Interface CwFilterField
 *
 * @description
 * A field the user can filter on; the consumer defines them, the bar knows none.
 */
export interface CwFilterField {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Key stored in `CwFilter.field`.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property label
   *
   * @description
   * Name of the field (« Statut »), in the chip and in the « + Filtre » menu.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property icon
   *
   * @description
   * Neutral icon of the field (an ng-icons name registered by the app).
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly icon?: string;

  /**
   * Property type
   *
   * @description
   * How the value is picked and shown.
   *
   * @type {CwFilterFieldType}
   * @readonly
   */
  readonly type: CwFilterFieldType;

  /**
   * Property operators
   *
   * @description
   * The comparisons offered, the first one by default when the filter is added.
   *
   * @type {readonly CwFilterOperator[]}
   * @readonly
   */
  readonly operators: readonly CwFilterOperator[];

  /**
   * Property options
   *
   * @description
   * The values to tick (`status`, `person`, `select`).
   *
   * @type {readonly CwFilterOption[] | undefined}
   * @readonly
   */
  readonly options?: readonly CwFilterOption[];

  /**
   * Property manyLabel
   *
   * @description
   * Summary shown instead of the labels when more than two values are ticked (« 3 personnes »); without it, every label is listed.
   *
   * @type {((count: number) => string) | undefined}
   * @readonly
   */
  readonly manyLabel?: (count: number) => string;
  // #endregion
}

/**
 * Type CwFilterValue
 *
 * @description
 * The value of a filter: the ticked option keys (`status`, `person`, `select`), an ISO day (`date`), a text (`text`), or `null` when not chosen yet or when the operator needs none.
 *
 * @type {string | readonly string[] | null}
 */
export type CwFilterValue = string | readonly string[] | null;

/**
 * Interface CwFilter
 *
 * @description
 * One active filter: « Statut · est · En cours, Bloqué ».
 */
export interface CwFilter {
  // #region Properties
  /**
   * Property field
   *
   * @description
   * `key` of a `CwFilterField`.
   *
   * @type {string}
   * @readonly
   */
  readonly field: string;

  /**
   * Property operator
   *
   * @description
   * `value` of one of the field's operators.
   *
   * @type {string}
   * @readonly
   */
  readonly operator: string;

  /**
   * Property value
   *
   * @description
   * The chosen value.
   *
   * @type {CwFilterValue}
   * @readonly
   */
  readonly value: CwFilterValue;
  // #endregion
}

/**
 * Interface CwSavedFilter
 *
 * @description
 * A set of filters the user saved under a name (« Mes tâches en retard »).
 */
export interface CwSavedFilter {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable key.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property label
   *
   * @description
   * Name in the saved filters menu.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property filters
   *
   * @description
   * The filters it applies.
   *
   * @type {readonly CwFilter[]}
   * @readonly
   */
  readonly filters: readonly CwFilter[];
  // #endregion
}

/**
 * Interface CwFilterBarLabels
 *
 * @description
 * The French texts of the filter bar and its chips (Filter Bar sheet of the Design System artifact and mockup `App.dc.html`); give some of them through `labels` to override them.
 */
export interface CwFilterBarLabels {
  // #region Properties
  /**
   * Property region
   *
   * @description
   * Name of the bar region.
   *
   * @type {string}
   * @readonly
   */
  readonly region: string;

  /**
   * Property addFirst
   *
   * @description
   * « + » button of an empty bar.
   *
   * @type {string}
   * @readonly
   */
  readonly addFirst: string;

  /**
   * Property add
   *
   * @description
   * « + » button next to the chips.
   *
   * @type {string}
   * @readonly
   */
  readonly add: string;

  /**
   * Property fields
   *
   * @description
   * Name of the menu of the fields.
   *
   * @type {string}
   * @readonly
   */
  readonly fields: string;

  /**
   * Property clear
   *
   * @description
   * Removes every filter.
   *
   * @type {string}
   * @readonly
   */
  readonly clear: string;

  /**
   * Property saveView
   *
   * @description
   * Shown when the saved view was modified (`dirty`).
   *
   * @type {string}
   * @readonly
   */
  readonly saveView: string;

  /**
   * Property noFilter
   *
   * @description
   * Start of the summary of an empty bar.
   *
   * @type {string}
   * @readonly
   */
  readonly noFilter: string;

  /**
   * Property total
   *
   * @description
   * Results counted by `total`, after « Aucun filtre · ».
   *
   * @type {(total: number) => string}
   * @readonly
   */
  readonly total: (total: number) => string;

  /**
   * Property savedFilters
   *
   * @description
   * Saved filters button when none is applied, and name of its menu.
   *
   * @type {string}
   * @readonly
   */
  readonly savedFilters: string;

  /**
   * Property savedGroup
   *
   * @description
   * Heading of the user's saved filters in that menu.
   *
   * @type {string}
   * @readonly
   */
  readonly savedGroup: string;

  /**
   * Property saveCurrent
   *
   * @description
   * Menu entry that saves the current filters under a name.
   *
   * @type {string}
   * @readonly
   */
  readonly saveCurrent: string;

  /**
   * Property manageSaved
   *
   * @description
   * Menu entry that opens the management of the saved filters.
   *
   * @type {string}
   * @readonly
   */
  readonly manageSaved: string;

  /**
   * Property chip
   *
   * @description
   * Name of a chip.
   *
   * @type {(field: string) => string}
   * @readonly
   */
  readonly chip: (field: string) => string;

  /**
   * Property operator
   *
   * @description
   * Name of the operator segment.
   *
   * @type {(operator: string) => string}
   * @readonly
   */
  readonly operator: (operator: string) => string;

  /**
   * Property values
   *
   * @description
   * Name of the menu or panel of the values.
   *
   * @type {(field: string) => string}
   * @readonly
   */
  readonly values: (field: string) => string;

  /**
   * Property emptyValue
   *
   * @description
   * Value segment while no value is chosen.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyValue: string;

  /**
   * Property remove
   *
   * @description
   * Name of the remove segment.
   *
   * @type {(field: string) => string}
   * @readonly
   */
  readonly remove: (field: string) => string;

  /**
   * Property added
   *
   * @description
   * Announced when a filter is added.
   *
   * @type {(field: string) => string}
   * @readonly
   */
  readonly added: (field: string) => string;

  /**
   * Property removed
   *
   * @description
   * Announced when a filter is removed.
   *
   * @type {(field: string) => string}
   * @readonly
   */
  readonly removed: (field: string) => string;

  /**
   * Property cleared
   *
   * @description
   * Announced when every filter is removed.
   *
   * @type {string}
   * @readonly
   */
  readonly cleared: string;
  // #endregion
}

/**
 * Interface CwFilterValueContext
 *
 * @description
 * What an `ng-template[cwFilterValue]` receives: the filter and its field.
 */
export interface CwFilterValueContext {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * Filter supplied to the value template.
   *
   * @type {CwFilter}
   * @readonly
   */
  readonly $implicit: CwFilter;

  /**
   * Property field
   *
   * @description
   * Field associated with the filter.
   *
   * @type {CwFilterField}
   * @readonly
   */
  readonly field: CwFilterField;
  // #endregion
}

/**
 * Interface CwFilterOptionContext
 *
 * @description
 * What an `ng-template[cwFilterOption]` receives: the option and its field.
 */
export interface CwFilterOptionContext {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * Option supplied to the option template.
   *
   * @type {CwFilterOption}
   * @readonly
   */
  readonly $implicit: CwFilterOption;

  /**
   * Property field
   *
   * @description
   * Field associated with the option.
   *
   * @type {CwFilterField}
   * @readonly
   */
  readonly field: CwFilterField;
  // #endregion
}
