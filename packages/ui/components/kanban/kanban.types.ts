import type { CwStatusKey } from '@cadenway/ui/components/status-icon';

/**
 * Interface CwKanbanColumn
 *
 * @description
 * A column of the board, in the order of the flow. `id` is the value the `groupBy` function returns for the items of this column; `status` draws the status icon next to the label.
 */
export interface CwKanbanColumn {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable identifier of the column or lane.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property label
   *
   * @description
   * Displayed label of the column or lane.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property status
   *
   * @description
   * Optional status icon shown in the column header.
   *
   * @type {CwStatusKey | undefined}
   * @readonly
   */
  readonly status?: CwStatusKey;
  // #endregion
}

/**
 * Interface CwKanbanLane
 *
 * @description
 * A swimlane (a row of cells across the columns). `id` is the value the `swimlaneBy` function returns for the items of this lane; the lane marker template draws its marker (priority bars, an avatar).
 */
export interface CwKanbanLane {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable identifier of the column or lane.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property label
   *
   * @description
   * Displayed label of the column or lane.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;
  // #endregion
}

/**
 * Type CwKanbanKeyFn
 *
 * @description
 * Reads a key of an item: its id (`trackBy`), its column (`groupBy`), its lane (`swimlaneBy`).
 *
 * @type {(item: T) => string}
 */
export type CwKanbanKeyFn<T> = (item: T) => string;

/**
 * Type CwKanbanDensity
 *
 * @description
 * Full card (`detailed`, 100 to 150 px) or one 34 px line (`compact`).
 *
 * @type {'detailed' | 'compact'}
 */
export type CwKanbanDensity = 'detailed' | 'compact';

/**
 * Type CwKanbanDropIndicator
 *
 * @description
 * What marks the drop position: `auto` draws a line between two cards and a ghost in an empty column or cell, `line` and `ghost` always draw that one.
 *
 * @type {'auto' | 'line' | 'ghost'}
 */
export type CwKanbanDropIndicator = 'auto' | 'line' | 'ghost';

/**
 * Interface CwKanbanPosition
 *
 * @description
 * A place on the board: a column, a lane (`null` without swimlanes) and an index in that cell.
 */
export interface CwKanbanPosition {
  // #region Properties
  /**
   * Property column
   *
   * @description
   * Identifier of the column.
   *
   * @type {string}
   * @readonly
   */
  readonly column: string;

  /**
   * Property lane
   *
   * @description
   * Identifier of the swimlane, or null without swimlanes.
   *
   * @type {string | null}
   * @readonly
   */
  readonly lane: string | null;

  /**
   * Property index
   *
   * @description
   * Position within the cell.
   *
   * @type {number}
   * @readonly
   */
  readonly index: number;
  // #endregion
}

/**
 * Interface CwKanbanMove
 *
 * @description
 * A card dropped somewhere else, with the mouse or the keyboard. The board shows it at once; the parent persists it and gives the updated `items`, or gives the old ones back to undo it.
 */
export interface CwKanbanMove<T> {
  // #region Properties
  /**
   * Property item
   *
   * @description
   * Item being moved.
   *
   * @type {T}
   * @readonly
   */
  readonly item: T;

  /**
   * Property from
   *
   * @description
   * Original position of the item.
   *
   * @type {CwKanbanPosition}
   * @readonly
   */
  readonly from: CwKanbanPosition;

  /**
   * Property to
   *
   * @description
   * Destination position of the item.
   *
   * @type {CwKanbanPosition}
   * @readonly
   */
  readonly to: CwKanbanPosition;
  // #endregion
}

/**
 * Interface CwKanbanCreate
 *
 * @description
 * A title typed in the quick add and confirmed with Enter, for the column and lane it sits in.
 */
export interface CwKanbanCreate {
  // #region Properties
  /**
   * Property title
   *
   * @description
   * Title entered for the new card.
   *
   * @type {string}
   * @readonly
   */
  readonly title: string;

  /**
   * Property column
   *
   * @description
   * Identifier of the column.
   *
   * @type {string}
   * @readonly
   */
  readonly column: string;

  /**
   * Property lane
   *
   * @description
   * Identifier of the swimlane, or null without swimlanes.
   *
   * @type {string | null}
   * @readonly
   */
  readonly lane: string | null;
  // #endregion
}

/**
 * Interface CwKanbanColumnCollapse
 *
 * @description
 * A column folded to its 36 px band, or unfolded.
 */
export interface CwKanbanColumnCollapse {
  // #region Properties
  /**
   * Property column
   *
   * @description
   * Identifier of the column.
   *
   * @type {string}
   * @readonly
   */
  readonly column: string;

  /**
   * Property collapsed
   *
   * @description
   * Whether the column is collapsed.
   *
   * @type {boolean}
   * @readonly
   */
  readonly collapsed: boolean;
  // #endregion
}

/**
 * Interface CwKanbanWipExceeded
 *
 * @description
 * A drop that put more cards in a column than its work-in-progress limit.
 */
export interface CwKanbanWipExceeded {
  // #region Properties
  /**
   * Property column
   *
   * @description
   * Identifier of the column.
   *
   * @type {string}
   * @readonly
   */
  readonly column: string;

  /**
   * Property count
   *
   * @description
   * Number of cards in the column.
   *
   * @type {number}
   * @readonly
   */
  readonly count: number;

  /**
   * Property limit
   *
   * @description
   * Work-in-progress limit for the column.
   *
   * @type {number}
   * @readonly
   */
  readonly limit: number;
  // #endregion
}

/**
 * Interface CwKanbanCardContext
 *
 * @description
 * What a card template receives: the item, the density and the card's states.
 */
export interface CwKanbanCardContext<T> {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * Item, column or lane supplied to the template.
   *
   * @type {T}
   * @readonly
   */
  readonly $implicit: T;

  /**
   * Property density
   *
   * @description
   * Card density requested by the board.
   *
   * @type {CwKanbanDensity}
   * @readonly
   */
  readonly density: CwKanbanDensity;

  /**
   * Property selected
   *
   * @description
   * Whether the card is selected.
   *
   * @type {boolean}
   * @readonly
   */
  readonly selected: boolean;

  /**
   * Property grabbed
   *
   * @description
   * Whether the card is held for a keyboard move.
   *
   * @type {boolean}
   * @readonly
   */
  readonly grabbed: boolean;
  // #endregion
}

/**
 * Interface CwKanbanEmptyContext
 *
 * @description
 * What the empty-column template receives: the column.
 */
export interface CwKanbanEmptyContext {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * Item, column or lane supplied to the template.
   *
   * @type {CwKanbanColumn}
   * @readonly
   */
  readonly $implicit: CwKanbanColumn;
  // #endregion
}

/**
 * Interface CwKanbanLaneMarkerContext
 *
 * @description
 * What the lane marker template receives: the lane.
 */
export interface CwKanbanLaneMarkerContext {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * Item, column or lane supplied to the template.
   *
   * @type {CwKanbanLane}
   * @readonly
   */
  readonly $implicit: CwKanbanLane;
  // #endregion
}

/**
 * Interface CwKanbanLabels
 *
 * @description
 * The texts of the board, French by default (Kanban sheet of the Design System artifact). The braces are replaced: `{column}`, `{lane}`, `{item}`, `{count}`, `{limit}`, `{position}`, `{total}`.
 */
export interface CwKanbanLabels {
  // #region Properties
  /**
   * Property add
   *
   * @description
   * Footer and empty-state button, which open the quick add.
   *
   * @type {string}
   * @readonly
   */
  readonly add: string;

  /**
   * Property addIn
   *
   * @description
   * Name of the « + » button of a column header.
   *
   * @type {string}
   * @readonly
   */
  readonly addIn: string;

  /**
   * Property collapse
   *
   * @description
   * Name of the button that folds a column.
   *
   * @type {string}
   * @readonly
   */
  readonly collapse: string;

  /**
   * Property expand
   *
   * @description
   * Name of the folded column's button: « Déplier la colonne En attente, 3 tâches ».
   *
   * @type {string}
   * @readonly
   */
  readonly expand: string;

  /**
   * Property column
   *
   * @description
   * Name of a column group: « Colonne En cours ».
   *
   * @type {string}
   * @readonly
   */
  readonly column: string;

  /**
   * Property cell
   *
   * @description
   * Name of a cell list in swimlanes: « En cours, Urgente ».
   *
   * @type {string}
   * @readonly
   */
  readonly cell: string;

  /**
   * Property countOne
   *
   * @description
   * Count of one card (or none), read after the visible counter.
   *
   * @type {string}
   * @readonly
   */
  readonly countOne: string;

  /**
   * Property countOther
   *
   * @description
   * Count of several cards.
   *
   * @type {string}
   * @readonly
   */
  readonly countOther: string;

  /**
   * Property countLimit
   *
   * @description
   * Count with a limit: « 3 tâches, limite de 2 ».
   *
   * @type {string}
   * @readonly
   */
  readonly countLimit: string;

  /**
   * Property overLimit
   *
   * @description
   * Alert under a header when the limit is exceeded.
   *
   * @type {string}
   * @readonly
   */
  readonly overLimit: string;

  /**
   * Property emptyTitle
   *
   * @description
   * Title of the empty state, when no empty template is given.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyTitle: string;

  /**
   * Property emptyDescription
   *
   * @description
   * Sentence of the empty state.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyDescription: string;

  /**
   * Property quickAdd
   *
   * @description
   * Name of the quick-add form.
   *
   * @type {string}
   * @readonly
   */
  readonly quickAdd: string;

  /**
   * Property quickAddField
   *
   * @description
   * Name of the quick-add field.
   *
   * @type {string}
   * @readonly
   */
  readonly quickAddField: string;

  /**
   * Property quickAddKey
   *
   * @description
   * The key shown in the quick-add hint.
   *
   * @type {string}
   * @readonly
   */
  readonly quickAddKey: string;

  /**
   * Property quickAddHint
   *
   * @description
   * The word after the key in the quick-add hint.
   *
   * @type {string}
   * @readonly
   */
  readonly quickAddHint: string;

  /**
   * Property selected
   *
   * @description
   * Suffix of a selected card's name.
   *
   * @type {string}
   * @readonly
   */
  readonly selected: string;

  /**
   * Property instructions
   *
   * @description
   * Instructions every card describes itself with.
   *
   * @type {string}
   * @readonly
   */
  readonly instructions: string;

  /**
   * Property grabbed
   *
   * @description
   * Announced when a card is grabbed with Space.
   *
   * @type {string}
   * @readonly
   */
  readonly grabbed: string;

  /**
   * Property position
   *
   * @description
   * Announced at each keyboard step of a grabbed card.
   *
   * @type {string}
   * @readonly
   */
  readonly position: string;

  /**
   * Property positionInLane
   *
   * @description
   * Announced at each step in swimlanes.
   *
   * @type {string}
   * @readonly
   */
  readonly positionInLane: string;

  /**
   * Property dropped
   *
   * @description
   * Announced when the card is dropped.
   *
   * @type {string}
   * @readonly
   */
  readonly dropped: string;

  /**
   * Property cancelled
   *
   * @description
   * Announced when Escape cancels the move.
   *
   * @type {string}
   * @readonly
   */
  readonly cancelled: string;
  // #endregion
}
