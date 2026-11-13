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

/** A card as a cell draws it. */
export interface KanbanCardView {
  readonly id: string;
  readonly item: unknown;
  /** The item label. */
  readonly name: string;
  /** The item label, with the selected suffix: the card's accessible name. */
  readonly label: string;
  readonly selected: boolean;
  readonly grabbed: boolean;
  readonly dimmed: boolean;
  readonly tabStop: boolean;
  readonly delay: number;
}

/** A column (without swimlanes) or a column × lane cell: one drop list. */
export interface KanbanCellView {
  readonly key: string;
  readonly column: CwKanbanColumn;
  readonly lane: CwKanbanLane | null;
  readonly label: string;
  readonly cards: readonly KanbanCardView[];
  readonly target: boolean;
  readonly quickAdd: boolean;
}

/** The header facts of a column. */
export interface KanbanColumnView {
  readonly column: CwKanbanColumn;
  readonly collapsed: boolean;
  readonly over: boolean;
  readonly target: boolean;
  readonly counter: string;
  readonly countLabel: string;
  readonly alert: string;
  readonly groupLabel: string;
  readonly addLabel: string;
  readonly collapseLabel: string;
  readonly expandLabel: string;
  readonly count: number;
  readonly expandBefore: string;
  readonly expandBetween: string;
  readonly countSuffix: string;
  readonly width: number;
  /** The column's own cell, without swimlanes. */
  readonly cell: KanbanCellView | null;
}

/** A swimlane and its cells, one per column (`null` under a folded column). */
export interface KanbanLaneView {
  readonly lane: CwKanbanLane;
  readonly collapsed: boolean;
  readonly countText: string;
  readonly countLabel: string;
  readonly cells: readonly { readonly width: number; readonly cell: KanbanCellView | null }[];
}

/** Where a cell list sits, carried by its `cdkDropListData`. */
export interface KanbanCellData {
  readonly key: string;
  readonly column: string;
  readonly lane: string | null;
}

/** The state and handlers the generated parts read from the board. */
export interface KanbanBoard {
  readonly density: Signal<CwKanbanDensity>;
  readonly readonly: Signal<boolean>;
  readonly dragging: Signal<string | null>;
  readonly placeholderClass: Signal<string>;
  readonly texts: Signal<CwKanbanLabels>;
  readonly cardTemplate: Signal<TemplateRef<CwKanbanCardContext<unknown>> | undefined>;
  readonly emptyTemplate: Signal<TemplateRef<CwKanbanEmptyContext> | undefined>;
  readonly laneMarkerTemplate: Signal<TemplateRef<CwKanbanLaneMarkerContext> | undefined>;
  readonly instructionsId: string;
  format(template: string, values: Record<string, string | number>): string;
  cardContext(card: KanbanCardView): CwKanbanCardContext<unknown>;
  cellData(cell: KanbanCellView): KanbanCellData;
  onCardClick(event: MouseEvent, card: KanbanCardView): void;
  onCardKeydown(event: KeyboardEvent, card: KanbanCardView, cell: KanbanCellView): void;
  onCardFocus(card: KanbanCardView): void;
  onDrop(event: CdkDragDrop<KanbanCellData, KanbanCellData, string>): void;
  onDragStart(id: string, cell: KanbanCellView): void;
  onDragEnd(): void;
  onEnter(cell: KanbanCellView): void;
  onExit(cell: KanbanCellView): void;
  openQuickAdd(column: string, lane: string | null): void;
  closeQuickAdd(cell: KanbanCellView): void;
  create(title: string, cell: KanbanCellView): void;
  toggleColumn(column: string): void;
  toggleLane(lane: string): void;
}

/** Provided by `cw-kanban` for its generated parts. */
export const KANBAN_BOARD = new InjectionToken<KanbanBoard>('KANBAN_BOARD');
