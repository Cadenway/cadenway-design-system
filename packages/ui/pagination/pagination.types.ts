/** Layout of a pagination: numbered pages (`full`) or « Précédent · Page 3 sur 12 · Suivant ». */
export type CwPaginationVariant = 'full' | 'simple';

/** Height of the buttons: 32 px under a table, 28 px in panels, cards and sheets. */
export type CwPaginationSize = 'default' | 'sm';

/** The texts of a pagination, French by default (Pagination sheet of the Design System artifact). */
export interface CwPaginationLabels {
  /** Name of the button to the first page. */
  readonly first: string;
  /** Name of the icon-only button to the previous page (the table bar). */
  readonly previous: string;
  /** Text, and name, of the labelled previous button. */
  readonly previousText: string;
  /** Name of the icon-only button to the next page (the table bar). */
  readonly next: string;
  /** Text, and name, of the labelled next button. */
  readonly nextText: string;
  /** Name of the button to the last page. */
  readonly last: string;
  /** Word before a page number: « Page 6 », « Page 3 sur 12 ». */
  readonly page: string;
  /** Word between a position and a total: « Page 3 sur 12 », « 51–75 sur 286 ». */
  readonly of: string;
  /** Hidden text of an ellipsis. */
  readonly hiddenPages: string;
  /** Label of the page size select. */
  readonly pageSize: string;
}
