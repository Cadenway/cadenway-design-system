import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { InjectionToken, type Signal, type TemplateRef } from '@angular/core';

import type {
  CwKanbanCardContext,
  CwKanbanColumn,
  CwKanbanDensity,
  CwKanbanEmptyContext,
  CwKanbanLabels,
  CwKanbanLane,
  CwKanbanLaneMarkerContext,
} from './kanban.types';

/* The board as its generated parts (column, lane, cell, quick add) see it. The board provides itself
   under this token, so the parts reach its state without importing its class (it imports them).
   Internal to the entry point. */

/**
 * Interface KanbanCardView
 *
 * @description
 * A card as a cell draws it.
 */
export interface KanbanCardView {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable identifier of the card.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property item
   *
   * @description
   * Source item represented by the card.
   *
   * @type {unknown}
   * @readonly
   */
  readonly item: unknown;

  /**
   * Property name
   *
   * @description
   * The item label.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property label
   *
   * @description
   * The item label, with the selected suffix: the card's accessible name.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

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
   * Whether the card is held for keyboard movement.
   *
   * @type {boolean}
   * @readonly
   */
  readonly grabbed: boolean;

  /**
   * Property dimmed
   *
   * @description
   * Whether the card is visually dimmed.
   *
   * @type {boolean}
   * @readonly
   */
  readonly dimmed: boolean;

  /**
   * Property tabStop
   *
   * @description
   * Whether the card is the keyboard tab stop.
   *
   * @type {boolean}
   * @readonly
   */
  readonly tabStop: boolean;

  /**
   * Property delay
   *
   * @description
   * Entry animation delay.
   *
   * @type {number}
   * @readonly
   */
  readonly delay: number;
  // #endregion
}

/**
 * Interface KanbanCellView
 *
 * @description
 * A column (without swimlanes) or a column × lane cell: one drop list.
 */
export interface KanbanCellView {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Stable identifier of the cell.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property column
   *
   * @description
   * Column represented by the view or cell.
   *
   * @type {CwKanbanColumn}
   * @readonly
   */
  readonly column: CwKanbanColumn;

  /**
   * Property lane
   *
   * @description
   * Swimlane represented by the view or cell.
   *
   * @type {CwKanbanLane | null}
   * @readonly
   */
  readonly lane: CwKanbanLane | null;

  /**
   * Property label
   *
   * @description
   * Accessible name of the card or cell.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property cards
   *
   * @description
   * Cards displayed in the cell.
   *
   * @type {readonly KanbanCardView[]}
   * @readonly
   */
  readonly cards: readonly KanbanCardView[];

  /**
   * Property target
   *
   * @description
   * Whether the cell or column is a drop target.
   *
   * @type {boolean}
   * @readonly
   */
  readonly target: boolean;

  /**
   * Property quickAdd
   *
   * @description
   * Whether the quick-add form is open.
   *
   * @type {boolean}
   * @readonly
   */
  readonly quickAdd: boolean;
  // #endregion
}

/**
 * Interface KanbanColumnView
 *
 * @description
 * The header facts of a column.
 */
export interface KanbanColumnView {
  // #region Properties
  /**
   * Property column
   *
   * @description
   * Column represented by the view or cell.
   *
   * @type {CwKanbanColumn}
   * @readonly
   */
  readonly column: CwKanbanColumn;

  /**
   * Property collapsed
   *
   * @description
   * Whether the column or lane is folded.
   *
   * @type {boolean}
   * @readonly
   */
  readonly collapsed: boolean;

  /**
   * Property over
   *
   * @description
   * Whether the column exceeds its work-in-progress limit.
   *
   * @type {boolean}
   * @readonly
   */
  readonly over: boolean;

  /**
   * Property target
   *
   * @description
   * Whether the cell or column is a drop target.
   *
   * @type {boolean}
   * @readonly
   */
  readonly target: boolean;

  /**
   * Property counter
   *
   * @description
   * Visible card count.
   *
   * @type {string}
   * @readonly
   */
  readonly counter: string;

  /**
   * Property countLabel
   *
   * @description
   * Accessible card count.
   *
   * @type {string}
   * @readonly
   */
  readonly countLabel: string;

  /**
   * Property alert
   *
   * @description
   * Limit alert text.
   *
   * @type {string}
   * @readonly
   */
  readonly alert: string;

  /**
   * Property groupLabel
   *
   * @description
   * Accessible column group name.
   *
   * @type {string}
   * @readonly
   */
  readonly groupLabel: string;

  /**
   * Property addLabel
   *
   * @description
   * Accessible name of the add control.
   *
   * @type {string}
   * @readonly
   */
  readonly addLabel: string;

  /**
   * Property collapseLabel
   *
   * @description
   * Accessible name of the collapse control.
   *
   * @type {string}
   * @readonly
   */
  readonly collapseLabel: string;

  /**
   * Property expandLabel
   *
   * @description
   * Accessible name of the expand control.
   *
   * @type {string}
   * @readonly
   */
  readonly expandLabel: string;

  /**
   * Property count
   *
   * @description
   * Number of cards.
   *
   * @type {number}
   * @readonly
   */
  readonly count: number;

  /**
   * Property expandBefore
   *
   * @description
   * Text preceding the folded column name.
   *
   * @type {string}
   * @readonly
   */
  readonly expandBefore: string;

  /**
   * Property expandBetween
   *
   * @description
   * Text between the name and count.
   *
   * @type {string}
   * @readonly
   */
  readonly expandBetween: string;

  /**
   * Property countSuffix
   *
   * @description
   * Text following the count.
   *
   * @type {string}
   * @readonly
   */
  readonly countSuffix: string;

  /**
   * Property width
   *
   * @description
   * Width of the column.
   *
   * @type {number}
   * @readonly
   */
  readonly width: number;

  /**
   * Property cell
   *
   * @description
   * The column's own cell, without swimlanes.
   *
   * @type {KanbanCellView | null}
   * @readonly
   */
  readonly cell: KanbanCellView | null;
  // #endregion
}

/**
 * Interface KanbanLaneView
 *
 * @description
 * A swimlane and its cells, one per column (`null` under a folded column).
 */
export interface KanbanLaneView {
  // #region Properties
  /**
   * Property lane
   *
   * @description
   * Swimlane represented by the view or cell.
   *
   * @type {CwKanbanLane}
   * @readonly
   */
  readonly lane: CwKanbanLane;

  /**
   * Property collapsed
   *
   * @description
   * Whether the column or lane is folded.
   *
   * @type {boolean}
   * @readonly
   */
  readonly collapsed: boolean;

  /**
   * Property countText
   *
   * @description
   * Visible lane count.
   *
   * @type {string}
   * @readonly
   */
  readonly countText: string;

  /**
   * Property countLabel
   *
   * @description
   * Accessible card count.
   *
   * @type {string}
   * @readonly
   */
  readonly countLabel: string;

  /**
   * Property cells
   *
   * @description
   * Column cells belonging to the lane.
   *
   * @type {readonly { readonly width: number; readonly cell: KanbanCellView | null }[]}
   * @readonly
   */
  readonly cells: readonly { readonly width: number; readonly cell: KanbanCellView | null }[];
  // #endregion
}

/**
 * Interface KanbanCellData
 *
 * @description
 * Where a cell list sits, carried by its `cdkDropListData`.
 */
export interface KanbanCellData {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Stable identifier of the cell.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property column
   *
   * @description
   * Column represented by the view or cell.
   *
   * @type {string}
   * @readonly
   */
  readonly column: string;

  /**
   * Property lane
   *
   * @description
   * Swimlane represented by the view or cell.
   *
   * @type {string | null}
   * @readonly
   */
  readonly lane: string | null;
  // #endregion
}

/**
 * Interface KanbanBoard
 *
 * @description
 * The state and handlers the generated parts read from the board.
 */
export interface KanbanBoard {
  // #region Properties
  /**
   * Property density
   *
   * @description
   * Current card density.
   *
   * @type {Signal<CwKanbanDensity>}
   * @readonly
   */
  readonly density: Signal<CwKanbanDensity>;

  /**
   * Property readonly
   *
   * @description
   * Whether changes are disabled.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly readonly: Signal<boolean>;

  /**
   * Property dragging
   *
   * @description
   * Identifier of the currently dragged card.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  readonly dragging: Signal<string | null>;

  /**
   * Property placeholderClass
   *
   * @description
   * Classes for the drop placeholder.
   *
   * @type {Signal<string>}
   * @readonly
   */
  readonly placeholderClass: Signal<string>;

  /**
   * Property texts
   *
   * @description
   * Labels used by the board.
   *
   * @type {Signal<CwKanbanLabels>}
   * @readonly
   */
  readonly texts: Signal<CwKanbanLabels>;

  /**
   * Property cardTemplate
   *
   * @description
   * Projected template used to render cards.
   *
   * @type {Signal<TemplateRef<CwKanbanCardContext<unknown>> | undefined>}
   * @readonly
   */
  readonly cardTemplate: Signal<TemplateRef<CwKanbanCardContext<unknown>> | undefined>;

  /**
   * Property emptyTemplate
   *
   * @description
   * Projected template used for empty columns.
   *
   * @type {Signal<TemplateRef<CwKanbanEmptyContext> | undefined>}
   * @readonly
   */
  readonly emptyTemplate: Signal<TemplateRef<CwKanbanEmptyContext> | undefined>;

  /**
   * Property laneMarkerTemplate
   *
   * @description
   * Projected template used for lane markers.
   *
   * @type {Signal<TemplateRef<CwKanbanLaneMarkerContext> | undefined>}
   * @readonly
   */
  readonly laneMarkerTemplate: Signal<TemplateRef<CwKanbanLaneMarkerContext> | undefined>;

  /**
   * Property instructionsId
   *
   * @description
   * Identifier of the card keyboard instructions.
   *
   * @type {string}
   * @readonly
   */
  readonly instructionsId: string;
  // #endregion
  // #region Methods
  /**
   * Method format
   *
   * @description
   * Substitutes values into a label template.
   *
   * @param {string} template - Label template containing placeholders.
   * @param {Record<string, string | number>} values - Values substituted into the template.
   * @returns {string} Formatted label.
   */
  format(template: string, values: Record<string, string | number>): string;

  /**
   * Method cardContext
   *
   * @description
   * Builds the projected context for a card.
   *
   * @param {KanbanCardView} card - Card involved in the operation.
   * @returns {CwKanbanCardContext<unknown>} Context supplied to the card template.
   */
  cardContext(card: KanbanCardView): CwKanbanCardContext<unknown>;

  /**
   * Method cellData
   *
   * @description
   * Builds drop-list data for a cell.
   *
   * @param {KanbanCellView} cell - Cell involved in the operation.
   * @returns {KanbanCellData} Drop-list data for the cell.
   */
  cellData(cell: KanbanCellView): KanbanCellData;

  /**
   * Method onCardClick
   *
   * @description
   * Handles a card click.
   *
   * @param {MouseEvent} event - Mouse, keyboard or drag event.
   * @param {KanbanCardView} card - Card involved in the operation.
   */
  onCardClick(event: MouseEvent, card: KanbanCardView): void;

  /**
   * Method onCardKeydown
   *
   * @description
   * Handles card keyboard interaction.
   *
   * @param {KeyboardEvent} event - Mouse, keyboard or drag event.
   * @param {KanbanCardView} card - Card involved in the operation.
   * @param {KanbanCellView} cell - Cell involved in the operation.
   */
  onCardKeydown(event: KeyboardEvent, card: KanbanCardView, cell: KanbanCellView): void;

  /**
   * Method onCardFocus
   *
   * @description
   * Records the focused card.
   *
   * @param {KanbanCardView} card - Card involved in the operation.
   */
  onCardFocus(card: KanbanCardView): void;

  /**
   * Method onDrop
   *
   * @description
   * Handles a card drop.
   *
   * @param {CdkDragDrop<KanbanCellData, KanbanCellData, string>} event - Mouse, keyboard or drag event.
   */
  onDrop(event: CdkDragDrop<KanbanCellData, KanbanCellData, string>): void;

  /**
   * Method onDragStart
   *
   * @description
   * Records the start of a card drag.
   *
   * @param {string} id - Identifier of the dragged card.
   * @param {KanbanCellView} cell - Cell involved in the operation.
   */
  onDragStart(id: string, cell: KanbanCellView): void;

  /**
   * Method onDragEnd
   *
   * @description
   * Clears drag state.
   */
  onDragEnd(): void;

  /**
   * Method onEnter
   *
   * @description
   * Records a cell as a drag target.
   *
   * @param {KanbanCellView} cell - Cell involved in the operation.
   */
  onEnter(cell: KanbanCellView): void;

  /**
   * Method onExit
   *
   * @description
   * Clears a cell drag target.
   *
   * @param {KanbanCellView} cell - Cell involved in the operation.
   */
  onExit(cell: KanbanCellView): void;

  /**
   * Method openQuickAdd
   *
   * @description
   * Opens the quick-add form in a cell.
   *
   * @param {string} column - Identifier of the column.
   * @param {string | null} lane - Identifier of the swimlane, or null.
   */
  openQuickAdd(column: string, lane: string | null): void;

  /**
   * Method closeQuickAdd
   *
   * @description
   * Closes the quick-add form.
   *
   * @param {KanbanCellView} cell - Cell involved in the operation.
   */
  closeQuickAdd(cell: KanbanCellView): void;

  /**
   * Method create
   *
   * @description
   * Requests creation of a card in a cell.
   *
   * @param {string} title - Title entered for the new card.
   * @param {KanbanCellView} cell - Cell involved in the operation.
   */
  create(title: string, cell: KanbanCellView): void;

  /**
   * Method toggleColumn
   *
   * @description
   * Folds or unfolds a column.
   *
   * @param {string} column - Identifier of the column.
   */
  toggleColumn(column: string): void;

  /**
   * Method toggleLane
   *
   * @description
   * Folds or unfolds a lane.
   *
   * @param {string} lane - Identifier of the swimlane, or null.
   */
  toggleLane(lane: string): void;
  // #endregion
}

/**
 * Constant KANBAN_BOARD
 *
 * @description
 * Provided by `cw-kanban` for its generated parts.
 *
 * @type {InjectionToken<KanbanBoard>}
 */
export const KANBAN_BOARD: InjectionToken<KanbanBoard> = new InjectionToken<KanbanBoard>(
  'KANBAN_BOARD',
);
