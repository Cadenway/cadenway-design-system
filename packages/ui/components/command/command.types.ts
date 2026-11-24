/**
 * Type CwCommandFilter
 *
 * @description
 * Scores an item against the search: 0 hides it, a positive number keeps it. `keywords` are the
 * item's synonyms (« supprimer » for « effacer »). Give `null` to `cw-command` to filter on the
 * server: every item then stays shown.
 *
 * @type {CwCommandFilter}
 */
export type CwCommandFilter = (
  value: string,
  search: string,
  keywords: readonly string[],
) => number;

/**
 * Interface CwCommandLabels
 *
 * @description
 * Texts used by the command controls and their accessible descriptions.
 */
export interface CwCommandLabels {
  // #region Properties
  /**
   * Property dialogLabel
   *
   * @description
   * Accessible name of the command dialog.
   *
   * @type {string}
   * @readonly
   */
  readonly dialogLabel: string;

  /**
   * Property emptyText
   *
   * @description
   * Message when no result matches, with {search} replaced by the query.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyText: string;

  /**
   * Property navigateLabel
   *
   * @description
   * Description of the navigation keys.
   *
   * @type {string}
   * @readonly
   */
  readonly navigateLabel: string;

  /**
   * Property runLabel
   *
   * @description
   * Description of the run key.
   *
   * @type {string}
   * @readonly
   */
  readonly runLabel: string;

  /**
   * Property closeLabel
   *
   * @description
   * Description of the close key.
   *
   * @type {string}
   * @readonly
   */
  readonly closeLabel: string;

  /**
   * Property listLabel
   *
   * @description
   * Accessible name of the results list.
   *
   * @type {string}
   * @readonly
   */
  readonly listLabel: string;

  /**
   * Property loadingLabel
   *
   * @description
   * Message shown while searching.
   *
   * @type {string}
   * @readonly
   */
  readonly loadingLabel: string;

  /**
   * Property resultsNone
   *
   * @description
   * Announcement when there are no results.
   *
   * @type {string}
   * @readonly
   */
  readonly resultsNone: string;

  /**
   * Property resultsOne
   *
   * @description
   * Announcement when there is one result.
   *
   * @type {string}
   * @readonly
   */
  readonly resultsOne: string;

  /**
   * Property resultsMany
   *
   * @description
   * Formats the announcement for multiple results.
   *
   * @type {(count: number) => string}
   * @readonly
   */
  readonly resultsMany: (count: number) => string;
  // #endregion
}
