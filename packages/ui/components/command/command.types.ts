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
