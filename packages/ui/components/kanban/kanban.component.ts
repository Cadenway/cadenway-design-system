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
  CwKanbanDropIndicator,
  CwKanbanKeyFn,
  CwKanbanLabels,
  CwKanbanLane,
  CwKanbanMove,
  CwKanbanPosition,
  CwKanbanWipExceeded,
} from './kanban.types';

/** Where an item is drawn: its column and lane, in the order of `items` within each cell. */
interface Placement<T> {
  readonly id: string;
  readonly item: T;
  readonly column: string;
  readonly lane: string | null;
}

/** A card grabbed with Space: where it started, and the board to restore on Escape. */
interface Grab<T> {
  readonly id: string;
  readonly from: CwKanbanPosition;
  readonly snapshot: readonly Placement<T>[];
}

const COLLAPSED_WIDTH = 36;

function cellKey(column: string, lane: string | null): string {
  return `${column}\u001f${lane ?? ''}`;
}

/** The element at `index`, or `undefined` outside the list (no wrap-around, unlike `at`). */
function atIndex<V>(list: readonly V[], index: number): V | undefined {
  return index >= 0 && index < list.length ? list[index] : undefined;
}

function toWidth(value: unknown): number {
  return Math.max(200, numberAttribute(value, 272));
}

/**
 * The board of a list or a sprint: cards in columns, optionally in swimlanes, moved with the mouse
 * or the keyboard, with a work-in-progress limit per column (Kanban sheet of the Design System
 * artifact).
 *
 * Generic: `columns` and `lanes` come from the consumer, `items` are any `T`; `trackBy` gives an
 * item's id, `groupBy` its column id and `swimlaneBy` its lane id (swimlanes show when both
 * `swimlaneBy` and `lanes` are set). Items whose column (or lane) is unknown are not drawn. The
 * board draws each card's frame and states; the content comes from `ng-template[cwKanbanCard]`
 * (`CwKanbanCardDef`), the empty-column text from `ng-template[cwKanbanEmpty]`, the lane marker from
 * `ng-template[cwKanbanLaneMarker]`; a `[cwKanbanToolbar]` element is projected above the board.
 *
 * A drop (CDK drag-drop, or Space, arrows and Space) moves the card at once and emits `moved`; the
 * parent persists it, or gives the previous `items` back to undo it: any new `items` resets the
 * board. A drop that exceeds `wipLimits[column]` also emits `wipExceeded` (the drop stays allowed).
 * Enter or a click emits `open`; Ctrl + click and Ctrl + Space toggle the card in `selection`; the
 * quick add emits `created` on Enter and stays open. `density`, `collapsedColumns`,
 * `collapsedLanes` and `selection` are two-way models. `readonly` turns off dragging and creation.
 *
 * Keyboard: one tab stop on the active card; arrows move between cards (left and right skip folded
 * columns), Shift + arrows extend the selection, N opens the quick add; a grabbed card follows the
 * arrows (Home and End: top and bottom), Space drops it, Escape puts it back. Every step is
 * announced through the CDK `LiveAnnouncer`, assertive. Style hooks: `data-density` and
 * `data-dragging` on the host.
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
  /** The columns, in the order of the flow. */
  readonly columns = input.required<readonly CwKanbanColumn[]>();
  /** The items; each is drawn in the column `groupBy` returns, in this order. */
  readonly items = input.required<readonly T[]>();
  /** The id of an item, unique on the board (selection, focus, moves). */
  readonly trackBy = input.required<CwKanbanKeyFn<T>>();
  /** The id of the column an item belongs to. */
  readonly groupBy = input.required<CwKanbanKeyFn<T>>();
  /** The name of an item, read on its card and in the announcements (« CAD-482 — Corriger… »). */
  readonly itemLabel = input.required<CwKanbanKeyFn<T>>();
  /** The swimlanes, in order; empty for none. */
  readonly lanes = input<readonly CwKanbanLane[]>([]);
  /** The id of the lane an item belongs to; `null` for no swimlanes. */
  readonly swimlaneBy = input<CwKanbanKeyFn<T> | null>(null);
  /** Items drawn dimmed (see-through, no opacity), such as settled ones. */
  readonly dimmedBy = input<((item: T) => boolean) | null>(null);
  /** Work-in-progress limit per column id; `0` or none means no limit. */
  readonly wipLimits = input<Readonly<Record<string, number>>>({});
  /** Full cards or 34 px lines, `[(density)]`. */
  readonly density = model<CwKanbanDensity>('detailed');
  /** Ids of the folded columns, `[(collapsedColumns)]`. */
  readonly collapsedColumns = model<readonly string[]>([]);
  /** Ids of the folded swimlanes, `[(collapsedLanes)]`. */
  readonly collapsedLanes = model<readonly string[]>([]);
  /** Ids of the selected cards, `[(selection)]`. */
  readonly selection = model<readonly string[]>([]);
  /** Width of a column in px, 200 at least. */
  readonly columnWidth = input(272, { transform: toWidth });
  /** What marks the drop position. */
  readonly dropIndicator = input<CwKanbanDropIndicator>('auto');
  /** No dragging, no quick add (guests, closed sprint). */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Name of the board region: « Tableau de Sprint 14 ». */
  readonly ariaLabel = input.required<string>();
  /** Overrides of the French texts. */
  readonly labels = input<Partial<CwKanbanLabels>>({});

  /** A card dropped elsewhere, with the mouse or the keyboard. */
  readonly moved = output<CwKanbanMove<T>>();
  /** A title confirmed in the quick add. */
  readonly created = output<CwKanbanCreate>();
  /** A column folded or unfolded. */
  readonly columnCollapse = output<CwKanbanColumnCollapse>();
  /** A drop that put a column over its limit. */
  readonly wipExceeded = output<CwKanbanWipExceeded>();
  /** A card opened by a click or Enter. */
  readonly open = output<T>();

  /** Id of the keyboard instructions every card is described by. */
  readonly instructionsId = inject(_IdGenerator).getId('cw-kanban-instructions-');

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);

  private readonly cardDef = contentChild(CwKanbanCardDef);
  private readonly emptyDef = contentChild(CwKanbanEmptyDef);
  private readonly laneMarkerDef = contentChild(CwKanbanLaneMarkerDef);

  /** The card content template (`CwKanbanCardDef`), typed for the parts. */
  readonly cardTemplate = computed(
    () => this.cardDef()?.template as TemplateRef<CwKanbanCardContext<unknown>> | undefined,
  );
  /** The empty-column template (`CwKanbanEmptyDef`). */
  readonly emptyTemplate = computed(() => this.emptyDef()?.template);
  /** The lane marker template (`CwKanbanLaneMarkerDef`). */
  readonly laneMarkerTemplate = computed(() => this.laneMarkerDef()?.template);
  /** The French texts with the `labels` overrides. */
  readonly texts = computed<CwKanbanLabels>(() => ({ ...CW_KANBAN_LABELS, ...this.labels() }));

  /** The id of the card dragged with the pointer. */
  readonly dragging = signal<string | null>(null);
  private readonly dragSource = signal<KanbanCellData | null>(null);
  private readonly dragOver = signal<KanbanCellData | null>(null);
  private readonly grab = signal<Grab<T> | null>(null);
  private readonly active = signal<string | null>(null);
  private readonly quickAddAt = signal<{ column: string; lane: string | null } | null>(null);

  protected readonly swimlanes = computed(
    () => this.swimlaneBy() !== null && this.lanes().length > 0,
  );

  /** The board as drawn: `items` until a move, then the moved board until new `items` arrive. */
  private readonly placements = linkedSignal<readonly Placement<T>[]>(() => {
    const track = this.trackBy();
    const group = this.groupBy();
    const lane = this.swimlanes() ? this.swimlaneBy() : null;
    return this.items().map((item) => ({
      id: track(item),
      item,
      column: group(item),
      lane: lane ? lane(item) : null,
    }));
  });

  private readonly cells = computed(() => {
    const columns = new Set(this.columns().map((column) => column.id));
    const lanes = this.swimlanes() ? new Set(this.lanes().map((lane) => lane.id)) : null;
    const cells = new Map<string, Placement<T>[]>();
    for (const placement of this.placements()) {
      if (!columns.has(placement.column)) continue;
      if (lanes && (placement.lane === null || !lanes.has(placement.lane))) continue;
      const key = cellKey(placement.column, placement.lane);
      const cell = cells.get(key);
      if (cell) cell.push(placement);
      else cells.set(key, [placement]);
    }
    return cells;
  });

  private readonly counts = computed(() => {
    const counts = new Map<string, number>();
    for (const cell of this.cells().values()) {
      for (const placement of cell) {
        counts.set(placement.column, (counts.get(placement.column) ?? 0) + 1);
      }
    }
    return counts;
  });

  /** The lane ids in order, open ones only; `[null]` without swimlanes. */
  private readonly openLanes = computed<readonly (string | null)[]>(() => {
    if (!this.swimlanes()) return [null];
    const collapsed = this.collapsedLanes();
    return this.lanes()
      .map((lane) => lane.id)
      .filter((id) => !collapsed.includes(id));
  });

  private readonly openColumns = computed(() => {
    const collapsed = this.collapsedColumns();
    return this.columns()
      .map((column) => column.id)
      .filter((id) => !collapsed.includes(id));
  });

  /** The one card in the tab order: the active one while visible, else the first visible one. */
  private readonly tabStop = computed(() => {
    const visible: string[] = [];
    for (const lane of this.openLanes()) {
      for (const column of this.openColumns()) visible.push(...this.idsIn(column, lane));
    }
    const active = this.active();
    return active !== null && visible.includes(active) ? active : (visible[0] ?? null);
  });

  /** The drop indicator: a line between cards, a ghost in an empty cell. */
  readonly placeholderClass = computed(() => {
    const mode = this.dropIndicator();
    const target = this.dragOver() ?? this.dragSource();
    let ghost = mode === 'ghost';
    if (mode === 'auto' && target) {
      const dragged = this.dragging();
      ghost = this.idsIn(target.column, target.lane).every((id) => id === dragged);
    }
    if (!ghost) return INDICATORS.line;
    return this.density() === 'compact' ? INDICATORS.ghostCompact : INDICATORS.ghostDetailed;
  });

  protected readonly columnViews = computed<readonly KanbanColumnView[]>(() => {
    const texts = this.texts();
    const collapsed = this.collapsedColumns();
    const width = this.columnWidth();
    const over = this.dragOver();
    return this.columns().map((column) => {
      const count = this.countOf(column.id);
      const limit = this.limitOf(column.id);
      const countWord = this.format(count > 1 ? texts.countOther : texts.countOne, { count });
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

  protected readonly laneViews = computed<readonly KanbanLaneView[]>(() => {
    if (!this.swimlanes()) return [];
    const texts = this.texts();
    const collapsedLanes = this.collapsedLanes();
    const collapsedColumns = this.collapsedColumns();
    const width = this.columnWidth();
    return this.lanes().map((lane) => {
      const cells = this.columns().map((column) => {
        const folded = collapsedColumns.includes(column.id);
        return {
          width: folded ? COLLAPSED_WIDTH : width,
          cell: folded ? null : this.cellView(column, lane),
        };
      });
      const count = this.columns().reduce(
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

  /** Replaces the `{name}` placeholders of a text. */
  format(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  cardContext(card: KanbanCardView): CwKanbanCardContext<unknown> {
    return {
      $implicit: card.item,
      density: this.density(),
      selected: card.selected,
      grabbed: card.grabbed,
    };
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  cellData(cell: KanbanCellView): KanbanCellData {
    return { key: cell.key, column: cell.column.id, lane: cell.lane?.id ?? null };
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  onCardClick(event: MouseEvent, card: KanbanCardView): void {
    this.active.set(card.id);
    if (event.ctrlKey || event.metaKey) {
      this.toggleSelection(card.id);
      return;
    }
    this.open.emit(card.item as T);
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  onCardFocus(card: KanbanCardView): void {
    this.active.set(card.id);
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  onCardKeydown(event: KeyboardEvent, card: KanbanCardView, cell: KanbanCellView): void {
    const handled = this.grab()
      ? this.onGrabbedKey(event, card.id)
      : this.onCardKey(event, card, cell);
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  onDrop(event: CdkDragDrop<KanbanCellData, KanbanCellData, string>): void {
    const from = event.previousContainer.data;
    const to = event.container.data;
    if (from.key === to.key && event.previousIndex === event.currentIndex) return;
    const placement = this.placements().find((candidate) => candidate.id === event.item.data);
    if (!placement) return;
    this.relocate(placement.id, to.column, to.lane, event.currentIndex);
    this.emitMove(
      placement.item,
      { column: from.column, lane: from.lane, index: event.previousIndex },
      { column: to.column, lane: to.lane, index: event.currentIndex },
    );
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  onDragStart(id: string, cell: KanbanCellView): void {
    const data = this.cellData(cell);
    this.dragging.set(id);
    this.dragSource.set(data);
    this.dragOver.set(data);
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  onDragEnd(): void {
    this.dragging.set(null);
    this.dragSource.set(null);
    this.dragOver.set(null);
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  onEnter(cell: KanbanCellView): void {
    this.dragOver.set(this.cellData(cell));
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  onExit(cell: KanbanCellView): void {
    if (this.dragOver()?.key === cell.key) this.dragOver.set(null);
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  openQuickAdd(column: string, lane: string | null): void {
    if (this.readonly()) return;
    this.quickAddAt.set({ column, lane });
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  closeQuickAdd(cell: KanbanCellView): void {
    this.quickAddAt.set(null);
    // The focus returns to the « Ajouter une tâche » button of the column, else to its first card.
    const column = cell.column.id;
    this.afterRender(() => {
      const button = this.find('[data-kanban-add]', 'kanbanAdd', column);
      if (button) button.focus();
      else this.focusCard(this.idsIn(column, cell.lane?.id ?? null)[0] ?? null);
    });
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  create(title: string, cell: KanbanCellView): void {
    const trimmed = title.trim();
    if (trimmed === '') return;
    this.created.emit({ title: trimmed, column: cell.column.id, lane: cell.lane?.id ?? null });
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  toggleColumn(column: string): void {
    const collapsed = !this.collapsedColumns().includes(column);
    this.collapsedColumns.update((ids) =>
      collapsed ? [...ids, column] : ids.filter((id) => id !== column),
    );
    this.columnCollapse.emit({ column, collapsed });
    // The button that replaces the one pressed takes the focus (fold ↔ unfold).
    this.afterRender(() => this.find('[data-kanban-toggle]', 'kanbanToggle', column)?.focus());
  }

  /** Part handler (`KanbanBoard`), not for consumers. */
  toggleLane(lane: string): void {
    this.collapsedLanes.update((ids) =>
      ids.includes(lane) ? ids.filter((id) => id !== lane) : [...ids, lane],
    );
  }

  private cellView(column: CwKanbanColumn, lane: CwKanbanLane | null): KanbanCellView {
    const key = cellKey(column.id, lane?.id ?? null);
    const placements = this.cells().get(key) ?? [];
    const texts = this.texts();
    const selection = this.selection();
    const grabbed = this.grab()?.id ?? null;
    const tabStop = this.tabStop();
    const dimmed = this.dimmedBy();
    const name = this.itemLabel();
    const quickAdd = this.quickAddAt();
    const cards = placements.map((placement, index): KanbanCardView => {
      const selected = selection.includes(placement.id);
      const label = name(placement.item);
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

  private onCardKey(event: KeyboardEvent, card: KanbanCardView, cell: KanbanCellView): boolean {
    const ctrl = event.ctrlKey || event.metaKey;
    const position = this.locate(card.id);
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
        const next = this.verticalNeighbour(position, event.key === 'ArrowDown' ? 1 : -1);
        if (next !== null) {
          if (event.shiftKey) this.addToSelection([card.id, next]);
          this.focusCard(next);
        }
        return true;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        if (ctrl || event.altKey || event.shiftKey) return false;
        const next = this.horizontalNeighbour(position, event.key === 'ArrowRight' ? 1 : -1);
        if (next !== null) this.focusCard(next);
        return true;
      }
      case 'Home':
      case 'End': {
        const ids = this.idsIn(position.column, position.lane);
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

  private onGrabbedKey(event: KeyboardEvent, id: string): boolean {
    const position = this.locate(id);
    if (!position) return false;
    const length = this.idsIn(position.column, position.lane).length;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const index = position.index + step;
        if (index >= 0 && index < length) {
          this.step(id, position.column, position.lane, index);
          return true;
        }
        // At the edge of a cell, the card goes to the neighbouring lane (Kanban sheet, "Clavier").
        const lanes = this.openLanes();
        const lane = atIndex(lanes, lanes.indexOf(position.lane) + step);
        if (lane !== undefined && lane !== null) {
          const target = step > 0 ? 0 : this.idsIn(position.column, lane).length;
          this.step(id, position.column, lane, target);
        }
        return true;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        const columns = this.openColumns();
        const column = atIndex(
          columns,
          columns.indexOf(position.column) + (event.key === 'ArrowRight' ? 1 : -1),
        );
        if (column !== undefined) {
          const index = Math.min(position.index, this.idsIn(column, position.lane).length);
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

  private startGrab(id: string): void {
    const from = this.locate(id);
    const placement = this.placements().find((candidate) => candidate.id === id);
    if (!from || !placement) return;
    this.grab.set({ id, from, snapshot: this.placements() });
    this.announce(
      this.format(this.texts().grabbed, {
        item: this.itemLabel()(placement.item),
        position: this.positionText(from),
      }),
    );
  }

  private step(id: string, column: string, lane: string | null, index: number): void {
    this.relocate(id, column, lane, index);
    this.focusCard(id);
    const position = this.locate(id);
    if (position) this.announce(this.positionText(position));
  }

  private drop(id: string, to: CwKanbanPosition): void {
    const grab = this.grab();
    const placement = this.placements().find((candidate) => candidate.id === id);
    this.grab.set(null);
    if (!grab || !placement) return;
    const from = grab.from;
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

  private cancel(id: string): void {
    const grab = this.grab();
    if (!grab) return;
    this.placements.set(grab.snapshot);
    this.grab.set(null);
    this.focusCard(id);
    this.announce(this.texts().cancelled);
  }

  private emitMove(item: T, from: CwKanbanPosition, to: CwKanbanPosition): void {
    this.moved.emit({ item, from, to });
    if (from.column === to.column) return;
    const limit = this.limitOf(to.column);
    const count = this.counts().get(to.column) ?? 0;
    if (limit > 0 && count > limit) this.wipExceeded.emit({ column: to.column, count, limit });
  }

  /** Moves a card to `index` of a cell, the other cards keeping their order. */
  private relocate(id: string, column: string, lane: string | null, index: number): void {
    const all = this.placements();
    const moving = all.find((placement) => placement.id === id);
    if (!moving) return;
    const rest = all.filter((placement) => placement.id !== id);
    const key = cellKey(column, lane);
    const cell = rest.filter((placement) => cellKey(placement.column, placement.lane) === key);
    const anchor = atIndex(cell, index);
    const last = cell.at(-1);
    let at = rest.length;
    if (anchor) at = rest.indexOf(anchor);
    else if (last) at = rest.indexOf(last) + 1;
    const next = [...rest];
    next.splice(at, 0, { ...moving, column, lane });
    this.placements.set(next);
  }

  private verticalNeighbour(position: CwKanbanPosition, step: number): string | null {
    const ids = this.idsIn(position.column, position.lane);
    const inCell = atIndex(ids, position.index + step);
    if (inCell !== undefined) return inCell;
    // Across swimlanes, the arrows go on to the nearest open lane with cards in that column.
    const lanes = this.openLanes();
    for (
      let index = lanes.indexOf(position.lane) + step;
      index >= 0 && index < lanes.length;
      index += step
    ) {
      const other = this.idsIn(position.column, lanes[index] ?? null);
      const id = step > 0 ? other[0] : other.at(-1);
      if (id !== undefined) return id;
    }
    return null;
  }

  private horizontalNeighbour(position: CwKanbanPosition, step: number): string | null {
    const columns = this.openColumns();
    for (
      let index = columns.indexOf(position.column) + step;
      index >= 0 && index < columns.length;
      index += step
    ) {
      const ids = this.idsIn(columns[index] ?? '', position.lane);
      if (ids.length > 0) return ids[Math.min(position.index, ids.length - 1)] ?? null;
    }
    return null;
  }

  private positionText(position: CwKanbanPosition): string {
    const texts = this.texts();
    const values = {
      column: this.columnLabel(position.column),
      lane: this.lanes().find((lane) => lane.id === position.lane)?.label ?? '',
      position: position.index + 1,
      total: this.idsIn(position.column, position.lane).length,
    };
    let text = this.format(position.lane === null ? texts.position : texts.positionInLane, values);
    const limit = this.limitOf(position.column);
    if (limit > 0 && this.countOf(position.column) > limit) {
      text += ` ${this.format(texts.overLimit, { limit })}.`;
    }
    return text;
  }

  private locate(id: string): CwKanbanPosition | null {
    for (const cell of this.cells().values()) {
      const index = cell.findIndex((placement) => placement.id === id);
      const placement = atIndex(cell, index);
      if (placement) return { column: placement.column, lane: placement.lane, index };
    }
    return null;
  }

  private idsIn(column: string, lane: string | null): string[] {
    return (this.cells().get(cellKey(column, lane)) ?? []).map((placement) => placement.id);
  }

  private countOf(column: string): number {
    const base = this.counts().get(column) ?? 0;
    // While the pointer holds a card over another column, that column counts it already (sheet,
    // "Limite dépassée": « dès le survol d'un dépôt »).
    const over = this.dragOver();
    const source = this.dragSource();
    const hovering =
      this.dragging() !== null && over?.column === column && source?.column !== column;
    return hovering ? base + 1 : base;
  }

  private limitOf(column: string): number {
    return this.wipLimits()[column] ?? 0;
  }

  private columnLabel(column: string): string {
    return this.columns().find((candidate) => candidate.id === column)?.label ?? column;
  }

  private toggleSelection(id: string): void {
    this.selection.update((ids) =>
      ids.includes(id) ? ids.filter((candidate) => candidate !== id) : [...ids, id],
    );
  }

  private addToSelection(ids: readonly string[]): void {
    this.selection.update((current) => [...current, ...ids.filter((id) => !current.includes(id))]);
  }

  private focusCard(id: string | null): void {
    if (id === null) return;
    this.active.set(id);
    this.afterRender(() => this.find('[data-kanban-card]', 'kanbanCard', id)?.focus());
  }

  private find(selector: string, key: string, value: string): HTMLElement | undefined {
    return Array.from(this.element.querySelectorAll<HTMLElement>(selector)).find(
      (element) => element.dataset[key] === value,
    );
  }

  private afterRender(write: () => void): void {
    afterNextRender({ write }, { injector: this.injector });
  }

  private announce(message: string): void {
    void this.announcer.announce(message, 'assertive');
  }
}
