import type { CwStatusKey } from '@cadenway/ui/status-icon';

/**
 * A column of the board, in the order of the flow. `id` is the value the `groupBy` function returns
 * for the items of this column; `status` draws the status icon next to the label.
 */
export interface CwKanbanColumn {
  readonly id: string;
  readonly label: string;
  readonly status?: CwStatusKey;
}

/**
 * A swimlane (a row of cells across the columns). `id` is the value the `swimlaneBy` function
 * returns for the items of this lane; the lane marker template draws its marker (priority bars, an
 * avatar).
 */
export interface CwKanbanLane {
  readonly id: string;
  readonly label: string;
}

/** Reads a key of an item: its id (`trackBy`), its column (`groupBy`), its lane (`swimlaneBy`). */
export type CwKanbanKeyFn<T> = (item: T) => string;

/** Full card (`detailed`, 100 to 150 px) or one 34 px line (`compact`). */
export type CwKanbanDensity = 'detailed' | 'compact';

/**
 * What marks the drop position: `auto` draws a line between two cards and a ghost in an empty
 * column or cell, `line` and `ghost` always draw that one.
 */
export type CwKanbanDropIndicator = 'auto' | 'line' | 'ghost';

/** A place on the board: a column, a lane (`null` without swimlanes) and an index in that cell. */
export interface CwKanbanPosition {
  readonly column: string;
  readonly lane: string | null;
  readonly index: number;
}

/**
 * A card dropped somewhere else, with the mouse or the keyboard. The board shows it at once; the
 * parent persists it and gives the updated `items`, or gives the old ones back to undo it.
 */
export interface CwKanbanMove<T> {
  readonly item: T;
  readonly from: CwKanbanPosition;
  readonly to: CwKanbanPosition;
}

/** A title typed in the quick add and confirmed with Enter, for the column and lane it sits in. */
export interface CwKanbanCreate {
  readonly title: string;
  readonly column: string;
  readonly lane: string | null;
}

/** A column folded to its 36 px band, or unfolded. */
export interface CwKanbanColumnCollapse {
  readonly column: string;
  readonly collapsed: boolean;
}

/** A drop that put more cards in a column than its work-in-progress limit. */
export interface CwKanbanWipExceeded {
  readonly column: string;
  readonly count: number;
  readonly limit: number;
}

/** What a card template receives: the item, the density and the card's states. */
export interface CwKanbanCardContext<T> {
  readonly $implicit: T;
  readonly density: CwKanbanDensity;
  readonly selected: boolean;
  readonly grabbed: boolean;
}

/** What the empty-column template receives: the column. */
export interface CwKanbanEmptyContext {
  readonly $implicit: CwKanbanColumn;
}

/** What the lane marker template receives: the lane. */
export interface CwKanbanLaneMarkerContext {
  readonly $implicit: CwKanbanLane;
}

/**
 * The texts of the board, French by default (Kanban sheet of the Design System artifact). The
 * braces are replaced: `{column}`, `{lane}`, `{item}`, `{count}`, `{limit}`, `{position}`,
 * `{total}`.
 */
export interface CwKanbanLabels {
  /** Footer and empty-state button, which open the quick add. */
  readonly add: string;
  /** Name of the « + » button of a column header. */
  readonly addIn: string;
  /** Name of the button that folds a column. */
  readonly collapse: string;
  /** Name of the folded column's button: « Déplier la colonne En attente, 3 tâches ». */
  readonly expand: string;
  /** Name of a column group: « Colonne En cours ». */
  readonly column: string;
  /** Name of a cell list in swimlanes: « En cours, Urgente ». */
  readonly cell: string;
  /** Count of one card (or none), read after the visible counter. */
  readonly countOne: string;
  /** Count of several cards. */
  readonly countOther: string;
  /** Count with a limit: « 3 tâches, limite de 2 ». */
  readonly countLimit: string;
  /** Alert under a header when the limit is exceeded. */
  readonly overLimit: string;
  /** Title of the empty state, when no empty template is given. */
  readonly emptyTitle: string;
  /** Sentence of the empty state. */
  readonly emptyDescription: string;
  /** Name of the quick-add form. */
  readonly quickAdd: string;
  /** Name of the quick-add field. */
  readonly quickAddField: string;
  /** The key shown in the quick-add hint. */
  readonly quickAddKey: string;
  /** The word after the key in the quick-add hint. */
  readonly quickAddHint: string;
  /** Suffix of a selected card's name. */
  readonly selected: string;
  /** Instructions every card describes itself with. */
  readonly instructions: string;
  /** Announced when a card is grabbed with Space. */
  readonly grabbed: string;
  /** Announced at each keyboard step of a grabbed card. */
  readonly position: string;
  /** Announced at each step in swimlanes. */
  readonly positionInLane: string;
  /** Announced when the card is dropped. */
  readonly dropped: string;
  /** Announced when Escape cancels the move. */
  readonly cancelled: string;
}
