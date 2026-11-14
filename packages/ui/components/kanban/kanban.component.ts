import { _IdGenerator, LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDropListGroup, type CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  type TemplateRef,
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
} from '@angular/core';

import { KanbanColumnPart } from './kanban-column/kanban-column.component';
import { CwKanbanCardDef } from './kanban-card-def/kanban-card-def.directive';
import { CW_KANBAN_LABELS } from './kanban.constants';
import { CwKanbanEmptyDef } from './kanban-empty-def/kanban-empty-def.directive';
import { KanbanLanePart } from './kanban-lane/kanban-lane.component';
import { CwKanbanLaneMarkerDef } from './kanban-lane-marker-def/kanban-lane-marker-def.directive';
import { INDICATORS } from './kanban.styles';
import {
  KANBAN_BOARD,
  type KanbanBoard,
  type KanbanCardView,
  type KanbanCellData,
  type KanbanCellView,
  type KanbanColumnView,
  type KanbanLaneView,
} from './kanban.token';
import type {
  CwKanbanCardContext,
  CwKanbanColumn,
  CwKanbanColumnCollapse,
  CwKanbanCreate,
  CwKanbanDensity,
  CwKanbanEmptyContext,
  CwKanbanDropIndicator,
  CwKanbanKeyFn,
  CwKanbanLabels,
  CwKanbanLane,
  CwKanbanLaneMarkerContext,
  CwKanbanMove,
  CwKanbanPosition,
  CwKanbanWipExceeded,
} from './kanban.types';

/**
 * Interface Placement
 *
 * @description
 * Where an item is drawn: its column and lane, in the order of `items` within each cell.
 */
interface Placement<T> {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable item identifier.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property item
   *
   * @description
   * Source item.
   *
   * @type {T}
   * @readonly
   */
  readonly item: T;

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
   * Identifier of the swimlane, or null.
   *
   * @type {string | null}
   * @readonly
   */
  readonly lane: string | null;
  // #endregion
}

/**
 * Interface Grab
 *
 * @description
 * A card grabbed with Space: where it started, and the board to restore on Escape.
 */
interface Grab<T> {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable item identifier.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property from
   *
   * @description
   * Original position before the grab.
   *
   * @type {CwKanbanPosition}
   * @readonly
   */
  readonly from: CwKanbanPosition;

  /**
   * Property snapshot
   *
   * @description
   * Placements before the keyboard move.
   *
   * @type {readonly Placement<T>[]}
   * @readonly
   */
  readonly snapshot: readonly Placement<T>[];
  // #endregion
}

/**
 * Constant COLLAPSED_WIDTH
 *
 * @description
 * Width of a folded column.
 *
 * @type {36}
 */
const COLLAPSED_WIDTH: 36 = 36;

/**
 * Function cellKey
 *
 * @description
 * Builds a stable key for a column and optional lane.
 *
 * @param {string} column - Column identifier or definition.
 * @param {string | null} lane - Swimlane identifier or definition, or null.
 * @returns {string} Stable cell key.
 */
function cellKey(column: string, lane: string | null): string {
  return `${column}\u001f${lane ?? ''}`;
}

/**
 * Function atIndex
 *
 * @description
 * The element at `index`, or `undefined` outside the list (no wrap-around, unlike `at`).
 *
 * @param {readonly V[]} list - List to inspect.
 * @param {number} index - Index within the list or cell.
 * @returns {V | undefined} Element at the index, or undefined.
 */
function atIndex<V>(list: readonly V[], index: number): V | undefined {
  return index >= 0 && index < list.length ? list[index] : undefined;
}

/**
 * Function toWidth
 *
 * @description
 * Normalizes the configured column width.
 *
 * @param {unknown} value - Value to normalize or match.
 * @returns {number} Normalized column width.
 */
function toWidth(value: unknown): number {
  return Math.max(200, numberAttribute(value, 272));
}

/**
 * Component CwKanban
 *
 * @description
 * The board of a list or a sprint: cards in columns, optionally in swimlanes, moved with the mouse or the keyboard, with a work-in-progress limit per column (Kanban sheet of the Design System artifact). Generic: `columns` and `lanes` come from the consumer, `items` are any `T`; `trackBy` gives an item's id, `groupBy` its column id and `swimlaneBy` its lane id (swimlanes show when both `swimlaneBy` and `lanes` are set). Items whose column (or lane) is unknown are not drawn. The board draws each card's frame and states; the content comes from `ng-template[cwKanbanCard]` (`CwKanbanCardDef`), the empty-column text from `ng-template[cwKanbanEmpty]`, the lane marker from `ng-template[cwKanbanLaneMarker]`; a `[cwKanbanToolbar]` element is projected above the board. A drop (CDK drag-drop, or Space, arrows and Space) moves the card at once and emits `moved`; the parent persists it, or gives the previous `items` back to undo it: any new `items` resets the board. A drop that exceeds `wipLimits[column]` also emits `wipExceeded` (the drop stays allowed). Enter or a click emits `open`; Ctrl + click and Ctrl + Space toggle the card in `selection`; the quick add emits `created` on Enter and stays open. `density`, `collapsedColumns`, `collapsedLanes` and `selection` are two-way models. `readonly` turns off dragging and creation. Keyboard: one tab stop on the active card; arrows move between cards (left and right skip folded columns), Shift + arrows extend the selection, N opens the quick add; a grabbed card follows the arrows (Home and End: top and bottom), Space drops it, Escape puts it back. Every step is announced through the CDK `LiveAnnouncer`, assertive. Style hooks: `data-density` and `data-dragging` on the host.
 */
@Component({
  selector: 'cw-kanban',
  imports: [CdkDropListGroup, KanbanColumnPart, KanbanLanePart],
  providers: [{ provide: KANBAN_BOARD, useExisting: CwKanban }],
  host: {
    class: 'flex min-w-0 flex-col gap-3',
    '[attr.data-density]': 'density()',
    '[attr.data-dragging]': 'dragging() ? "" : null',
  },
  templateUrl: './kanban.component.html',
})
export class CwKanban<T> implements KanbanBoard {
  // #region Properties
  /**
   * Property columns
   *
   * @description
   * The columns, in the order of the flow.
   *
   * @type {InputSignal<readonly CwKanbanColumn[]>}
   * @readonly
   */
  public readonly columns: InputSignal<readonly CwKanbanColumn[]> =
    input.required<readonly CwKanbanColumn[]>();

  /**
   * Property items
   *
   * @description
   * The items; each is drawn in the column `groupBy` returns, in this order.
   *
   * @type {InputSignal<readonly T[]>}
   * @readonly
   */
  public readonly items: InputSignal<readonly T[]> = input.required<readonly T[]>();

  /**
   * Property trackBy
   *
   * @description
   * The id of an item, unique on the board (selection, focus, moves).
   *
   * @type {InputSignal<CwKanbanKeyFn<T>>}
   * @readonly
   */
  public readonly trackBy: InputSignal<CwKanbanKeyFn<T>> = input.required<CwKanbanKeyFn<T>>();

  /**
   * Property groupBy
   *
   * @description
   * The id of the column an item belongs to.
   *
   * @type {InputSignal<CwKanbanKeyFn<T>>}
   * @readonly
   */
  public readonly groupBy: InputSignal<CwKanbanKeyFn<T>> = input.required<CwKanbanKeyFn<T>>();

  /**
   * Property itemLabel
   *
   * @description
   * The name of an item, read on its card and in the announcements (« CAD-482 — Corriger… »).
   *
   * @type {InputSignal<CwKanbanKeyFn<T>>}
   * @readonly
   */
  public readonly itemLabel: InputSignal<CwKanbanKeyFn<T>> = input.required<CwKanbanKeyFn<T>>();

  /**
   * Property lanes
   *
   * @description
   * The swimlanes, in order; empty for none.
   *
   * @type {InputSignal<readonly CwKanbanLane[]>}
   * @readonly
   */
  public readonly lanes: InputSignal<readonly CwKanbanLane[]> = input<readonly CwKanbanLane[]>([]);

  /**
   * Property swimlaneBy
   *
   * @description
   * The id of the lane an item belongs to; `null` for no swimlanes.
   *
   * @type {InputSignal<CwKanbanKeyFn<T> | null>}
   * @readonly
   */
  public readonly swimlaneBy: InputSignal<CwKanbanKeyFn<T> | null> = input<CwKanbanKeyFn<T> | null>(
    null,
  );

  /**
   * Property dimmedBy
   *
   * @description
   * Items drawn dimmed (see-through, no opacity), such as settled ones.
   *
   * @type {InputSignal<((item: T) => boolean) | null>}
   * @readonly
   */
  public readonly dimmedBy: InputSignal<((item: T) => boolean) | null> = input<
    ((item: T) => boolean) | null
  >(null);

  /**
   * Property wipLimits
   *
   * @description
   * Work-in-progress limit per column id; `0` or none means no limit.
   *
   * @type {InputSignal<Readonly<Record<string, number>>>}
   * @readonly
   */
  public readonly wipLimits: InputSignal<Readonly<Record<string, number>>> = input<
    Readonly<Record<string, number>>
  >({});

  /**
   * Property density
   *
   * @description
   * Full cards or 34 px lines, `[(density)]`.
   *
   * @type {ModelSignal<CwKanbanDensity>}
   * @readonly
   */
  public readonly density: ModelSignal<CwKanbanDensity> = model<CwKanbanDensity>('detailed');

  /**
   * Property collapsedColumns
   *
   * @description
   * Ids of the folded columns, `[(collapsedColumns)]`.
   *
   * @type {ModelSignal<readonly string[]>}
   * @readonly
   */
  public readonly collapsedColumns: ModelSignal<readonly string[]> = model<readonly string[]>([]);

  /**
   * Property collapsedLanes
   *
   * @description
   * Ids of the folded swimlanes, `[(collapsedLanes)]`.
   *
   * @type {ModelSignal<readonly string[]>}
   * @readonly
   */
  public readonly collapsedLanes: ModelSignal<readonly string[]> = model<readonly string[]>([]);

  /**
   * Property selection
   *
   * @description
   * Ids of the selected cards, `[(selection)]`.
   *
   * @type {ModelSignal<readonly string[]>}
   * @readonly
   */
  public readonly selection: ModelSignal<readonly string[]> = model<readonly string[]>([]);

  /**
   * Property columnWidth
   *
   * @description
   * Width of a column in px, 200 at least.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly columnWidth: InputSignalWithTransform<number, unknown> = input(272, {
    transform: toWidth,
  });

  /**
   * Property dropIndicator
   *
   * @description
   * What marks the drop position.
   *
   * @type {InputSignal<CwKanbanDropIndicator>}
   * @readonly
   */
  public readonly dropIndicator: InputSignal<CwKanbanDropIndicator> =
    input<CwKanbanDropIndicator>('auto');

  /**
   * Property readonly
   *
   * @description
   * No dragging, no quick add (guests, closed sprint).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   *
   * @description
   * Name of the board region: « Tableau de Sprint 14 ».
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  /**
   * Property labels
   *
   * @description
   * Overrides of the French texts.
   *
   * @type {InputSignal<Partial<CwKanbanLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwKanbanLabels>> = input<Partial<CwKanbanLabels>>({});

  /**
   * Property moved
   *
   * @description
   * A card dropped elsewhere, with the mouse or the keyboard.
   *
   * @type {OutputEmitterRef<CwKanbanMove<T>>}
   * @readonly
   */
  public readonly moved: OutputEmitterRef<CwKanbanMove<T>> = output<CwKanbanMove<T>>();

  /**
   * Property created
   *
   * @description
   * A title confirmed in the quick add.
   *
   * @type {OutputEmitterRef<CwKanbanCreate>}
   * @readonly
   */
  public readonly created: OutputEmitterRef<CwKanbanCreate> = output<CwKanbanCreate>();

  /**
   * Property columnCollapse
   *
   * @description
   * A column folded or unfolded.
   *
   * @type {OutputEmitterRef<CwKanbanColumnCollapse>}
   * @readonly
   */
  public readonly columnCollapse: OutputEmitterRef<CwKanbanColumnCollapse> =
    output<CwKanbanColumnCollapse>();

  /**
   * Property wipExceeded
   *
   * @description
   * A drop that put a column over its limit.
   *
   * @type {OutputEmitterRef<CwKanbanWipExceeded>}
   * @readonly
   */
  public readonly wipExceeded: OutputEmitterRef<CwKanbanWipExceeded> =
    output<CwKanbanWipExceeded>();

  /**
   * Property open
   *
   * @description
   * A card opened by a click or Enter.
   *
   * @type {OutputEmitterRef<T>}
   * @readonly
   */
  public readonly open: OutputEmitterRef<T> = output<T>();

  /**
   * Property instructionsId
   *
   * @description
   * Id of the keyboard instructions every card is described by.
   *
   * @type {string}
   * @readonly
   */
  public readonly instructionsId: string = inject(_IdGenerator).getId('cw-kanban-instructions-');

  /**
   * Property element
   *
   * @description
   * Native board element used for focus.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

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
   * Property announcer
   *
   * @description
   * Announces board interactions to assistive technology.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property cardDef
   *
   * @description
   * Projected card template definition.
   *
   * @type {Signal<CwKanbanCardDef | undefined>}
   * @readonly
   */
  private readonly cardDef: Signal<CwKanbanCardDef | undefined> = contentChild(CwKanbanCardDef);

  /**
   * Property emptyDef
   *
   * @description
   * Projected empty-column template definition.
   *
   * @type {Signal<CwKanbanEmptyDef | undefined>}
   * @readonly
   */
  private readonly emptyDef: Signal<CwKanbanEmptyDef | undefined> = contentChild(CwKanbanEmptyDef);

  /**
   * Property laneMarkerDef
   *
   * @description
   * Projected lane marker template definition.
   *
   * @type {Signal<CwKanbanLaneMarkerDef | undefined>}
   * @readonly
   */
  private readonly laneMarkerDef: Signal<CwKanbanLaneMarkerDef | undefined> =
    contentChild(CwKanbanLaneMarkerDef);

  /**
   * Property cardTemplate
   *
   * @description
   * The card content template (`CwKanbanCardDef`), typed for the parts.
   *
   * @type {Signal<TemplateRef<CwKanbanCardContext<unknown>> | undefined>}
   * @readonly
   */
  public readonly cardTemplate: Signal<TemplateRef<CwKanbanCardContext<unknown>> | undefined> =
    computed(() => this.cardDef()?.template);

  /**
   * Property emptyTemplate
   *
   * @description
   * The empty-column template (`CwKanbanEmptyDef`).
   *
   * @type {Signal<TemplateRef<CwKanbanEmptyContext> | undefined>}
   * @readonly
   */
  public readonly emptyTemplate: Signal<TemplateRef<CwKanbanEmptyContext> | undefined> = computed(
    () => this.emptyDef()?.template,
  );

  /**
   * Property laneMarkerTemplate
   *
   * @description
   * The lane marker template (`CwKanbanLaneMarkerDef`).
   *
   * @type {Signal<TemplateRef<CwKanbanLaneMarkerContext> | undefined>}
   * @readonly
   */
  public readonly laneMarkerTemplate: Signal<TemplateRef<CwKanbanLaneMarkerContext> | undefined> =
    computed(() => this.laneMarkerDef()?.template);

  /**
   * Property texts
   *
   * @description
   * The French texts with the `labels` overrides.
   *
   * @type {Signal<CwKanbanLabels>}
   * @readonly
   */
  public readonly texts: Signal<CwKanbanLabels> = computed<CwKanbanLabels>(() => ({
    ...CW_KANBAN_LABELS,
    ...this.labels(),
  }));

  /**
   * Property dragging
   *
   * @description
   * The id of the card dragged with the pointer.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  public readonly dragging: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property dragSource
   *
   * @description
   * Cell from which the card is dragged.
   *
   * @type {WritableSignal<KanbanCellData | null>}
   * @readonly
   */
  private readonly dragSource: WritableSignal<KanbanCellData | null> =
    signal<KanbanCellData | null>(null);

  /**
   * Property dragOver
   *
   * @description
   * Cell currently targeted by a drag.
   *
   * @type {WritableSignal<KanbanCellData | null>}
   * @readonly
   */
  private readonly dragOver: WritableSignal<KanbanCellData | null> = signal<KanbanCellData | null>(
    null,
  );

  /**
   * Property grab
   *
   * @description
   * Current keyboard grab state.
   *
   * @type {WritableSignal<Grab<T> | null>}
   * @readonly
   */
  private readonly grab: WritableSignal<Grab<T> | null> = signal<Grab<T> | null>(null);

  /**
   * Property active
   *
   * @description
   * Identifier of the focused card.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  private readonly active: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property quickAddAt
   *
   * @description
   * Cell containing the quick-add form.
   *
   * @type {WritableSignal<{ column: string; lane: string | null; } | null>}
   * @readonly
   */
  private readonly quickAddAt: WritableSignal<{ column: string; lane: string | null } | null> =
    signal<{ column: string; lane: string | null } | null>(null);

  /**
   * Property swimlanes
   *
   * @description
   * Whether the board displays swimlanes.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly swimlanes: Signal<boolean> = computed(
    () => this.swimlaneBy() !== null && this.lanes().length > 0,
  );

  /**
   * Property placements
   *
   * @description
   * The board as drawn: `items` until a move, then the moved board until new `items` arrive.
   *
   * @type {WritableSignal<readonly Placement<T>[]>}
   * @readonly
   */
  private readonly placements: WritableSignal<readonly Placement<T>[]> = linkedSignal<
    readonly Placement<T>[]
  >(() => {
    const track: CwKanbanKeyFn<T> = this.trackBy();
    const group: CwKanbanKeyFn<T> = this.groupBy();
    const lane: CwKanbanKeyFn<T> | null = this.swimlanes() ? this.swimlaneBy() : null;
    return this.items().map((item) => ({
      id: track(item),
      item,
      column: group(item),
      lane: lane ? lane(item) : null,
    }));
  });

  /**
   * Property cells
   *
   * @description
   * Item placements grouped by cell.
   *
   * @type {Signal<Map<string, Placement<T>[]>>}
   * @readonly
   */
  private readonly cells: Signal<Map<string, Placement<T>[]>> = computed(() => {
    const columns: Set<string> = new Set<string>(this.columns().map((column) => column.id));
    const lanes: Set<string> | null = this.swimlanes()
      ? new Set(this.lanes().map((lane) => lane.id))
      : null;
    const cells: Map<string, Placement<T>[]> = new Map<string, Placement<T>[]>();
    for (const placement of this.placements()) {
      if (!columns.has(placement.column)) continue;
      if (lanes && (placement.lane === null || !lanes.has(placement.lane))) continue;
      const key: string = cellKey(placement.column, placement.lane);
      const cell: Placement<T>[] | undefined = cells.get(key);
      if (cell) cell.push(placement);
      else cells.set(key, [placement]);
    }
    return cells;
  });

  /**
   * Property counts
   *
   * @description
   * Card counts grouped by column.
   *
   * @type {Signal<Map<string, number>>}
   * @readonly
   */
  private readonly counts: Signal<Map<string, number>> = computed(() => {
    const counts: Map<string, number> = new Map<string, number>();
    for (const cell of this.cells().values()) {
      for (const placement of cell) {
        counts.set(placement.column, (counts.get(placement.column) ?? 0) + 1);
      }
    }
    return counts;
  });

  /**
   * Property openLanes
   *
   * @description
   * The lane ids in order, open ones only; `[null]` without swimlanes.
   *
   * @type {Signal<readonly (string | null)[]>}
   * @readonly
   */
  private readonly openLanes: Signal<readonly (string | null)[]> = computed<
    readonly (string | null)[]
  >(() => {
    if (!this.swimlanes()) return [null];
    const collapsed: readonly string[] = this.collapsedLanes();
    return this.lanes()
      .map((lane) => lane.id)
      .filter((id) => !collapsed.includes(id));
  });

  /**
   * Property openColumns
   *
   * @description
   * Column identifiers available for keyboard movement.
   *
   * @type {Signal<string[]>}
   * @readonly
   */
  private readonly openColumns: Signal<string[]> = computed(() => {
    const collapsed: readonly string[] = this.collapsedColumns();
    return this.columns()
      .map((column) => column.id)
      .filter((id) => !collapsed.includes(id));
  });

  /**
   * Property tabStop
   *
   * @description
   * The one card in the tab order: the active one while visible, else the first visible one.
   *
   * @type {Signal<string>}
   * @readonly
   */
  private readonly tabStop: Signal<string> = computed(() => {
    const visible: string[] = [];
    for (const lane of this.openLanes()) {
      for (const column of this.openColumns()) visible.push(...this.idsIn(column, lane));
    }
    const active: string | null = this.active();
    return active !== null && visible.includes(active) ? active : (visible[0] ?? null);
  });

  /**
   * Property placeholderClass
   *
   * @description
   * The drop indicator: a line between cards, a ghost in an empty cell.
   *
   * @type {Signal<"mx-1 h-0.5 shrink-0 rounded-full bg-foreground" | "h-24 shrink-0 rounded-xl border-2 border-dashed border-line-control" | "h-[34px] shrink-0 rounded-lg border-2 border-dashed border-line-control">}
   * @readonly
   */
  public readonly placeholderClass: Signal<
    | 'mx-1 h-0.5 shrink-0 rounded-full bg-foreground'
    | 'h-24 shrink-0 rounded-xl border-2 border-dashed border-line-control'
    | 'h-[34px] shrink-0 rounded-lg border-2 border-dashed border-line-control'
  > = computed(() => {
    const mode: CwKanbanDropIndicator = this.dropIndicator();
    const target: KanbanCellData | null = this.dragOver() ?? this.dragSource();
    let ghost: boolean = mode === 'ghost';
    if (mode === 'auto' && target) {
      const dragged: string | null = this.dragging();
      ghost = this.idsIn(target.column, target.lane).every((id) => id === dragged);
    }
    if (!ghost) return INDICATORS.line;
    return this.density() === 'compact' ? INDICATORS.ghostCompact : INDICATORS.ghostDetailed;
  });

  /**
   * Property columnViews
   *
   * @description
   * Rendered state of each board column.
   *
   * @type {Signal<readonly KanbanColumnView[]>}
   * @readonly
   */
  protected readonly columnViews: Signal<readonly KanbanColumnView[]> = computed<
    readonly KanbanColumnView[]
  >(() => {
    const texts: CwKanbanLabels = this.texts();
    const collapsed: readonly string[] = this.collapsedColumns();
    const width: number = this.columnWidth();
    const over: KanbanCellData | null = this.dragOver();
    return this.columns().map((column) => {
      const count: number = this.countOf(column.id);
      const limit: number = this.limitOf(column.id);
      const countWord: string = this.format(count > 1 ? texts.countOther : texts.countOne, {
        count,
      });
      return {
        column,
        collapsed: collapsed.includes(column.id),
        over: limit > 0 && count > limit,
        target: this.dragging() !== null && over?.column === column.id,
        counter: limit > 0 ? `${String(count)}/${String(limit)}` : String(count),
        countLabel:
          limit > 0 ? this.format(texts.countLimit, { count: countWord, limit }) : countWord,
        alert: this.format(texts.overLimit, { limit }),
        groupLabel: this.format(texts.column, { column: column.label }),
        addLabel: this.format(texts.addIn, { column: column.label }),
        collapseLabel: this.format(texts.collapse, { column: column.label }),
        expandLabel: this.format(texts.expand, { column: column.label, count: countWord }),
        // The folded band is named by its content, so its visible figure and name are part of
        // the name (WCAG 2.5.3): « Déplier la colonne » + name + « , » + figure + « tâches ».
        count,
        expandBefore: texts.expand.split('{column}')[0] ?? '',
        expandBetween: texts.expand.split('{column}')[1]?.split('{count}')[0] ?? '',
        countSuffix: this.format(count > 1 ? texts.countOther : texts.countOne, { count: '' }),
        width,
        cell: this.swimlanes() ? null : this.cellView(column, null),
      };
    });
  });

  /**
   * Property laneViews
   *
   * @description
   * Rendered state of each swimlane.
   *
   * @type {Signal<readonly KanbanLaneView[]>}
   * @readonly
   */
  protected readonly laneViews: Signal<readonly KanbanLaneView[]> = computed<
    readonly KanbanLaneView[]
  >(() => {
    if (!this.swimlanes()) return [];
    const texts: CwKanbanLabels = this.texts();
    const collapsedLanes: readonly string[] = this.collapsedLanes();
    const collapsedColumns: readonly string[] = this.collapsedColumns();
    const width: number = this.columnWidth();
    return this.lanes().map((lane) => {
      const cells: { width: number; cell: KanbanCellView | null }[] = this.columns().map(
        (column) => {
          const folded: boolean = collapsedColumns.includes(column.id);
          return {
            width: folded ? COLLAPSED_WIDTH : width,
            cell: folded ? null : this.cellView(column, lane),
          };
        },
      );
      const count: number = this.columns().reduce(
        (sum, column) => sum + this.idsIn(column.id, lane.id).length,
        0,
      );
      return {
        lane,
        collapsed: collapsedLanes.includes(lane.id),
        countText: String(count),
        countLabel: this.format(count > 1 ? texts.countOther : texts.countOne, { count }),
        cells,
      };
    });
  });
  // #endregion

  // #region Methods
  /**
   * Method format
   *
   * @description
   * Replaces the `{name}` placeholders of a text.
   *
   * @param {string} template - Label template containing placeholders.
   * @param {Record<string, string | number>} values - Values substituted into the template.
   * @returns {string} Label with placeholders replaced.
   */
  public format(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
  }

  /**
   * Method cardContext
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {KanbanCardView} card - Card involved in the interaction.
   * @returns {CwKanbanCardContext<unknown>} Context supplied to the card template.
   */
  public cardContext(card: KanbanCardView): CwKanbanCardContext<unknown> {
    return {
      $implicit: card.item,
      density: this.density(),
      selected: card.selected,
      grabbed: card.grabbed,
    };
  }

  /**
   * Method cellData
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {KanbanCellView} cell - Cell involved in the interaction.
   * @returns {KanbanCellData} Drop-list data for the cell.
   */
  public cellData(cell: KanbanCellView): KanbanCellData {
    return { key: cell.key, column: cell.column.id, lane: cell.lane?.id ?? null };
  }

  /**
   * Method onCardClick
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {MouseEvent} event - Mouse, keyboard, drag or form event.
   * @param {KanbanCardView} card - Card involved in the interaction.
   */
  public onCardClick(event: MouseEvent, card: KanbanCardView): void {
    this.active.set(card.id);
    if (event.ctrlKey || event.metaKey) {
      this.toggleSelection(card.id);
      return;
    }
    this.open.emit(card.item as T);
  }

  /**
   * Method onCardFocus
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {KanbanCardView} card - Card involved in the interaction.
   */
  public onCardFocus(card: KanbanCardView): void {
    this.active.set(card.id);
  }

  /**
   * Method onCardKeydown
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {KeyboardEvent} event - Mouse, keyboard, drag or form event.
   * @param {KanbanCardView} card - Card involved in the interaction.
   * @param {KanbanCellView} cell - Cell involved in the interaction.
   */
  public onCardKeydown(event: KeyboardEvent, card: KanbanCardView, cell: KanbanCellView): void {
    const handled: boolean = this.grab()
      ? this.onGrabbedKey(event, card.id)
      : this.onCardKey(event, card, cell);
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Method onDrop
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {CdkDragDrop<KanbanCellData, KanbanCellData, string>} event - Mouse, keyboard, drag or form event.
   */
  public onDrop(event: CdkDragDrop<KanbanCellData, KanbanCellData, string>): void {
    const from: KanbanCellData = event.previousContainer.data;
    const to: KanbanCellData = event.container.data;
    if (from.key === to.key && event.previousIndex === event.currentIndex) return;
    const placement: Placement<T> | undefined = this.placements().find(
      (candidate) => candidate.id === event.item.data,
    );
    if (!placement) return;
    this.relocate(placement.id, to.column, to.lane, event.currentIndex);
    this.emitMove(
      placement.item,
      { column: from.column, lane: from.lane, index: event.previousIndex },
      { column: to.column, lane: to.lane, index: event.currentIndex },
    );
  }

  /**
   * Method onDragStart
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {string} id - Identifier of the card.
   * @param {KanbanCellView} cell - Cell involved in the interaction.
   */
  public onDragStart(id: string, cell: KanbanCellView): void {
    const data: KanbanCellData = this.cellData(cell);
    this.dragging.set(id);
    this.dragSource.set(data);
    this.dragOver.set(data);
  }

  /**
   * Method onDragEnd
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   */
  public onDragEnd(): void {
    this.dragging.set(null);
    this.dragSource.set(null);
    this.dragOver.set(null);
  }

  /**
   * Method onEnter
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {KanbanCellView} cell - Cell involved in the interaction.
   */
  public onEnter(cell: KanbanCellView): void {
    this.dragOver.set(this.cellData(cell));
  }

  /**
   * Method onExit
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {KanbanCellView} cell - Cell involved in the interaction.
   */
  public onExit(cell: KanbanCellView): void {
    if (this.dragOver()?.key === cell.key) this.dragOver.set(null);
  }

  /**
   * Method openQuickAdd
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {string} column - Column identifier or definition.
   * @param {string | null} lane - Swimlane identifier or definition, or null.
   */
  public openQuickAdd(column: string, lane: string | null): void {
    if (this.readonly()) return;
    this.quickAddAt.set({ column, lane });
  }

  /**
   * Method closeQuickAdd
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {KanbanCellView} cell - Cell involved in the interaction.
   */
  public closeQuickAdd(cell: KanbanCellView): void {
    this.quickAddAt.set(null);
    // The focus returns to the « Ajouter une tâche » button of the column, else to its first card.
    const column: string = cell.column.id;
    this.afterRender(() => {
      const button: HTMLElement | undefined = this.find('[data-kanban-add]', 'kanbanAdd', column);
      if (button) button.focus();
      else this.focusCard(this.idsIn(column, cell.lane?.id ?? null)[0] ?? null);
    });
  }

  /**
   * Method create
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {string} title - Title entered for the new card.
   * @param {KanbanCellView} cell - Cell involved in the interaction.
   */
  public create(title: string, cell: KanbanCellView): void {
    const trimmed: string = title.trim();
    if (trimmed === '') return;
    this.created.emit({ title: trimmed, column: cell.column.id, lane: cell.lane?.id ?? null });
  }

  /**
   * Method toggleColumn
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {string} column - Column identifier or definition.
   */
  public toggleColumn(column: string): void {
    const collapsed: boolean = !this.collapsedColumns().includes(column);
    this.collapsedColumns.update((ids) =>
      collapsed ? [...ids, column] : ids.filter((id) => id !== column),
    );
    this.columnCollapse.emit({ column, collapsed });
    // The button that replaces the one pressed takes the focus (fold ↔ unfold).
    this.afterRender(() => this.find('[data-kanban-toggle]', 'kanbanToggle', column)?.focus());
  }

  /**
   * Method toggleLane
   *
   * @description
   * Part handler (`KanbanBoard`), not for consumers.
   *
   * @param {string} lane - Swimlane identifier or definition, or null.
   */
  public toggleLane(lane: string): void {
    this.collapsedLanes.update((ids) =>
      ids.includes(lane) ? ids.filter((id) => id !== lane) : [...ids, lane],
    );
  }

  /**
   * Method cellView
   *
   * @description
   * Builds display data for a board cell.
   *
   * @param {CwKanbanColumn} column - Column identifier or definition.
   * @param {CwKanbanLane | null} lane - Swimlane identifier or definition, or null.
   * @returns {KanbanCellView} Display data for the cell.
   */
  private cellView(column: CwKanbanColumn, lane: CwKanbanLane | null): KanbanCellView {
    const key: string = cellKey(column.id, lane?.id ?? null);
    const placements: Placement<T>[] = this.cells().get(key) ?? [];
    const texts: CwKanbanLabels = this.texts();
    const selection: readonly string[] = this.selection();
    const grabbed: string | null = this.grab()?.id ?? null;
    const tabStop: string = this.tabStop();
    const dimmed: ((item: T) => boolean) | null = this.dimmedBy();
    const name: CwKanbanKeyFn<T> = this.itemLabel();
    const quickAdd: { column: string; lane: string | null } | null = this.quickAddAt();
    const cards: KanbanCardView[] = placements.map((placement, index): KanbanCardView => {
      const selected: boolean = selection.includes(placement.id);
      const label: string = name(placement.item);
      return {
        id: placement.id,
        item: placement.item,
        name: label,
        label: selected ? `${label}, ${texts.selected}` : label,
        selected,
        grabbed: placement.id === grabbed,
        dimmed: dimmed?.(placement.item) ?? false,
        tabStop: placement.id === tabStop,
        // Mockup motion: cards enter one by one, 60 ms then +30 ms, twelve at most.
        delay: 60 + 30 * Math.min(index, 11),
      };
    });
    return {
      key,
      column,
      lane,
      label: lane
        ? this.format(texts.cell, { column: column.label, lane: lane.label })
        : column.label,
      cards,
      target: this.dragging() !== null && this.dragOver()?.key === key,
      quickAdd: quickAdd?.column === column.id && quickAdd.lane === (lane?.id ?? null),
    };
  }

  /**
   * Method onCardKey
   *
   * @description
   * Handles keyboard actions on an ungrabbed card.
   *
   * @param {KeyboardEvent} event - Mouse, keyboard, drag or form event.
   * @param {KanbanCardView} card - Card involved in the interaction.
   * @param {KanbanCellView} cell - Cell involved in the interaction.
   * @returns {boolean} Whether the key was handled.
   */
  private onCardKey(event: KeyboardEvent, card: KanbanCardView, cell: KanbanCellView): boolean {
    const ctrl: boolean = event.ctrlKey || event.metaKey;
    const position: CwKanbanPosition | null = this.locate(card.id);
    if (!position) return false;
    switch (event.key) {
      case 'Enter':
        if (ctrl || event.altKey) return false;
        this.open.emit(card.item as T);
        return true;
      case ' ':
        if (ctrl) this.toggleSelection(card.id);
        else if (!this.readonly() && !event.altKey && !event.shiftKey) this.startGrab(card.id);
        else return false;
        return true;
      case 'ArrowUp':
      case 'ArrowDown': {
        if (ctrl || event.altKey) return false;
        const next: string | null = this.verticalNeighbour(
          position,
          event.key === 'ArrowDown' ? 1 : -1,
        );
        if (next !== null) {
          if (event.shiftKey) this.addToSelection([card.id, next]);
          this.focusCard(next);
        }
        return true;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        if (ctrl || event.altKey || event.shiftKey) return false;
        const next: string | null = this.horizontalNeighbour(
          position,
          event.key === 'ArrowRight' ? 1 : -1,
        );
        if (next !== null) this.focusCard(next);
        return true;
      }
      case 'Home':
      case 'End': {
        const ids: string[] = this.idsIn(position.column, position.lane);
        this.focusCard((event.key === 'Home' ? ids[0] : ids.at(-1)) ?? null);
        return true;
      }
      case 'n':
      case 'N':
        if (ctrl || event.altKey || this.readonly()) return false;
        this.openQuickAdd(cell.column.id, cell.lane?.id ?? null);
        return true;
      default:
        return false;
    }
  }

  /**
   * Method onGrabbedKey
   *
   * @description
   * Handles keyboard movement of a grabbed card.
   *
   * @param {KeyboardEvent} event - Mouse, keyboard, drag or form event.
   * @param {string} id - Identifier of the card.
   * @returns {boolean} Whether the key was handled.
   */
  private onGrabbedKey(event: KeyboardEvent, id: string): boolean {
    const position: CwKanbanPosition | null = this.locate(id);
    if (!position) return false;
    const length: number = this.idsIn(position.column, position.lane).length;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        const step: 1 | -1 = event.key === 'ArrowDown' ? 1 : -1;
        const index: number = position.index + step;
        if (index >= 0 && index < length) {
          this.step(id, position.column, position.lane, index);
          return true;
        }
        // At the edge of a cell, the card goes to the neighbouring lane (Kanban sheet, "Clavier").
        const lanes: readonly (string | null)[] = this.openLanes();
        const lane: string | null | undefined = atIndex(lanes, lanes.indexOf(position.lane) + step);
        if (lane !== undefined && lane !== null) {
          const target: number = step > 0 ? 0 : this.idsIn(position.column, lane).length;
          this.step(id, position.column, lane, target);
        }
        return true;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        const columns: string[] = this.openColumns();
        const column: string | undefined = atIndex(
          columns,
          columns.indexOf(position.column) + (event.key === 'ArrowRight' ? 1 : -1),
        );
        if (column !== undefined) {
          const index: number = Math.min(position.index, this.idsIn(column, position.lane).length);
          this.step(id, column, position.lane, index);
        }
        return true;
      }
      case 'Home':
        this.step(id, position.column, position.lane, 0);
        return true;
      case 'End':
        this.step(id, position.column, position.lane, length - 1);
        return true;
      case ' ':
      case 'Enter':
        this.drop(id, position);
        return true;
      case 'Escape':
        this.cancel(id);
        return true;
      default:
        return false;
    }
  }

  /**
   * Method startGrab
   *
   * @description
   * Starts moving a card with the keyboard.
   *
   * @param {string} id - Identifier of the card.
   */
  private startGrab(id: string): void {
    const from: CwKanbanPosition | null = this.locate(id);
    const placement: Placement<T> | undefined = this.placements().find(
      (candidate) => candidate.id === id,
    );
    if (!from || !placement) return;
    this.grab.set({ id, from, snapshot: this.placements() });
    this.announce(
      this.format(this.texts().grabbed, {
        item: this.itemLabel()(placement.item),
        position: this.positionText(from),
      }),
    );
  }

  /**
   * Method step
   *
   * @description
   * Moves the grabbed card to a new position.
   *
   * @param {string} id - Identifier of the card.
   * @param {string} column - Column identifier or definition.
   * @param {string | null} lane - Swimlane identifier or definition, or null.
   * @param {number} index - Index within the list or cell.
   */
  private step(id: string, column: string, lane: string | null, index: number): void {
    this.relocate(id, column, lane, index);
    this.focusCard(id);
    const position: CwKanbanPosition | null = this.locate(id);
    if (position) this.announce(this.positionText(position));
  }

  /**
   * Method drop
   *
   * @description
   * Completes a keyboard move and emits the result.
   *
   * @param {string} id - Identifier of the card.
   * @param {CwKanbanPosition} to - Destination position.
   */
  private drop(id: string, to: CwKanbanPosition): void {
    const grab: Grab<T> | null = this.grab();
    const placement: Placement<T> | undefined = this.placements().find(
      (candidate) => candidate.id === id,
    );
    this.grab.set(null);
    if (!grab || !placement) return;
    const from: CwKanbanPosition = grab.from;
    if (from.column !== to.column || from.lane !== to.lane || from.index !== to.index) {
      this.emitMove(placement.item, from, to);
    }
    this.announce(
      this.format(this.texts().dropped, {
        item: this.itemLabel()(placement.item),
        column: this.columnLabel(to.column),
        position: to.index + 1,
        total: this.idsIn(to.column, to.lane).length,
      }),
    );
  }

  /**
   * Method cancel
   *
   * @description
   * Cancels the current keyboard move.
   *
   * @param {string} id - Identifier of the card.
   */
  private cancel(id: string): void {
    const grab: Grab<T> | null = this.grab();
    if (!grab) return;
    this.placements.set(grab.snapshot);
    this.grab.set(null);
    this.focusCard(id);
    this.announce(this.texts().cancelled);
  }

  /**
   * Method emitMove
   *
   * @description
   * Emits a card move and checks the destination limit.
   *
   * @param {T} item - Item being moved.
   * @param {CwKanbanPosition} from - Original position.
   * @param {CwKanbanPosition} to - Destination position.
   */
  private emitMove(item: T, from: CwKanbanPosition, to: CwKanbanPosition): void {
    this.moved.emit({ item, from, to });
    if (from.column === to.column) return;
    const limit: number = this.limitOf(to.column);
    const count: number = this.counts().get(to.column) ?? 0;
    if (limit > 0 && count > limit) this.wipExceeded.emit({ column: to.column, count, limit });
  }

  /**
   * Method relocate
   *
   * @description
   * Moves a card to `index` of a cell, the other cards keeping their order.
   *
   * @param {string} id - Identifier of the card.
   * @param {string} column - Column identifier or definition.
   * @param {string | null} lane - Swimlane identifier or definition, or null.
   * @param {number} index - Index within the list or cell.
   */
  private relocate(id: string, column: string, lane: string | null, index: number): void {
    const all: readonly Placement<T>[] = this.placements();
    const moving: Placement<T> | undefined = all.find((placement) => placement.id === id);
    if (!moving) return;
    const rest: Placement<T>[] = all.filter((placement) => placement.id !== id);
    const key: string = cellKey(column, lane);
    const cell: Placement<T>[] = rest.filter(
      (placement) => cellKey(placement.column, placement.lane) === key,
    );
    const anchor: Placement<T> | undefined = atIndex(cell, index);
    const last: Placement<T> | undefined = cell.at(-1);
    let at: number = rest.length;
    if (anchor) at = rest.indexOf(anchor);
    else if (last) at = rest.indexOf(last) + 1;
    const next: Placement<T>[] = [...rest];
    next.splice(at, 0, { ...moving, column, lane });
    this.placements.set(next);
  }

  /**
   * Method verticalNeighbour
   *
   * @description
   * Finds a card above or below a position.
   *
   * @param {CwKanbanPosition} position - Current card position.
   * @param {number} step - Direction to move.
   * @returns {string | null} Identifier of the neighboring card, or null.
   */
  private verticalNeighbour(position: CwKanbanPosition, step: number): string | null {
    const ids: string[] = this.idsIn(position.column, position.lane);
    const inCell: string | undefined = atIndex(ids, position.index + step);
    if (inCell !== undefined) return inCell;
    // Across swimlanes, the arrows go on to the nearest open lane with cards in that column.
    const lanes: readonly (string | null)[] = this.openLanes();
    for (
      let index: number = lanes.indexOf(position.lane) + step;
      index >= 0 && index < lanes.length;
      index += step
    ) {
      const other: string[] = this.idsIn(position.column, lanes[index] ?? null);
      const id: string | undefined = step > 0 ? other[0] : other.at(-1);
      if (id !== undefined) return id;
    }
    return null;
  }

  /**
   * Method horizontalNeighbour
   *
   * @description
   * Finds a card in the adjacent column.
   *
   * @param {CwKanbanPosition} position - Current card position.
   * @param {number} step - Direction to move.
   * @returns {string | null} Identifier of the neighboring card, or null.
   */
  private horizontalNeighbour(position: CwKanbanPosition, step: number): string | null {
    const columns: string[] = this.openColumns();
    for (
      let index: number = columns.indexOf(position.column) + step;
      index >= 0 && index < columns.length;
      index += step
    ) {
      const ids: string[] = this.idsIn(columns[index] ?? '', position.lane);
      if (ids.length > 0) return ids[Math.min(position.index, ids.length - 1)] ?? null;
    }
    return null;
  }

  /**
   * Method positionText
   *
   * @description
   * Formats a position for keyboard announcements.
   *
   * @param {CwKanbanPosition} position - Current card position.
   * @returns {string} Formatted position announcement.
   */
  private positionText(position: CwKanbanPosition): string {
    const texts: CwKanbanLabels = this.texts();
    const values: { column: string; lane: string; position: number; total: number } = {
      column: this.columnLabel(position.column),
      lane: this.lanes().find((lane) => lane.id === position.lane)?.label ?? '',
      position: position.index + 1,
      total: this.idsIn(position.column, position.lane).length,
    };
    let text: string = this.format(
      position.lane === null ? texts.position : texts.positionInLane,
      values,
    );
    const limit: number = this.limitOf(position.column);
    if (limit > 0 && this.countOf(position.column) > limit) {
      text += ` ${this.format(texts.overLimit, { limit })}.`;
    }
    return text;
  }

  /**
   * Method locate
   *
   * @description
   * Finds the current position of a card.
   *
   * @param {string} id - Identifier of the card.
   * @returns {CwKanbanPosition | null} Current position of the card, or null.
   */
  private locate(id: string): CwKanbanPosition | null {
    for (const cell of this.cells().values()) {
      const index: number = cell.findIndex((placement) => placement.id === id);
      const placement: Placement<T> | undefined = atIndex(cell, index);
      if (placement) return { column: placement.column, lane: placement.lane, index };
    }
    return null;
  }

  /**
   * Method idsIn
   *
   * @description
   * Returns card identifiers in a cell.
   *
   * @param {string} column - Column identifier or definition.
   * @param {string | null} lane - Swimlane identifier or definition, or null.
   * @returns {string[]} Card identifiers in the cell.
   */
  private idsIn(column: string, lane: string | null): string[] {
    return (this.cells().get(cellKey(column, lane)) ?? []).map((placement) => placement.id);
  }

  /**
   * Method countOf
   *
   * @description
   * Counts cards in a column.
   *
   * @param {string} column - Column identifier or definition.
   * @returns {number} Number of cards in the column.
   */
  private countOf(column: string): number {
    const base: number = this.counts().get(column) ?? 0;
    // While the pointer holds a card over another column, that column counts it already (sheet,
    // "Limite dépassée": « dès le survol d'un dépôt »).
    const over: KanbanCellData | null = this.dragOver();
    const source: KanbanCellData | null = this.dragSource();
    const hovering: boolean =
      this.dragging() !== null && over?.column === column && source?.column !== column;
    return hovering ? base + 1 : base;
  }

  /**
   * Method limitOf
   *
   * @description
   * Reads the work-in-progress limit of a column.
   *
   * @param {string} column - Column identifier or definition.
   * @returns {number} Configured work-in-progress limit.
   */
  private limitOf(column: string): number {
    return this.wipLimits()[column] ?? 0;
  }

  /**
   * Method columnLabel
   *
   * @description
   * Finds the displayed label of a column.
   *
   * @param {string} column - Column identifier or definition.
   * @returns {string} Displayed column label.
   */
  private columnLabel(column: string): string {
    return this.columns().find((candidate) => candidate.id === column)?.label ?? column;
  }

  /**
   * Method toggleSelection
   *
   * @description
   * Adds or removes a card from the selection.
   *
   * @param {string} id - Identifier of the card.
   */
  private toggleSelection(id: string): void {
    this.selection.update((ids) =>
      ids.includes(id) ? ids.filter((candidate) => candidate !== id) : [...ids, id],
    );
  }

  /**
   * Method addToSelection
   *
   * @description
   * Adds card identifiers to the selection.
   *
   * @param {readonly string[]} ids - Card identifiers to add.
   */
  private addToSelection(ids: readonly string[]): void {
    this.selection.update((current) => [...current, ...ids.filter((id) => !current.includes(id))]);
  }

  /**
   * Method focusCard
   *
   * @description
   * Returns focus to a card by identifier.
   *
   * @param {string | null} id - Identifier of the card.
   */
  private focusCard(id: string | null): void {
    if (id === null) return;
    this.active.set(id);
    this.afterRender(() => this.find('[data-kanban-card]', 'kanbanCard', id)?.focus());
  }

  /**
   * Method find
   *
   * @description
   * Finds an element using a selector and data attribute.
   *
   * @param {string} selector - Selector used to find an element.
   * @param {string} key - Data attribute key.
   * @param {string} value - Value to normalize or match.
   * @returns {HTMLElement | undefined} Matching element, or undefined.
   */
  private find(selector: string, key: string, value: string): HTMLElement | undefined {
    return Array.from(this.element.querySelectorAll<HTMLElement>(selector)).find(
      (element) => element.dataset[key] === value,
    );
  }

  /**
   * Method afterRender
   *
   * @description
   * Schedules a DOM update after rendering.
   *
   * @param {() => void} write - DOM update to schedule.
   */
  private afterRender(write: () => void): void {
    afterNextRender({ write }, { injector: this.injector });
  }

  /**
   * Method announce
   *
   * @description
   * Announces a message politely.
   *
   * @param {string} message - Message to announce.
   */
  private announce(message: string): void {
    void this.announcer.announce(message, 'assertive');
  }
  // #endregion
}
