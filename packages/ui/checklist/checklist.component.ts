import {
  Component,
  DOCUMENT,
  DestroyRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { CwButton } from '@cadenway/ui/button';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretRightBold,
  phosphorEyeBold,
  phosphorEyeSlashBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwChecklistItem } from './checklist-item/checklist-item.component';
import { CW_CHECKLIST_LABELS } from './checklist.constants';
import { CHECKLIST, type ChecklistHost, type ChecklistItemNode } from './checklist.token';
import type {
  CwChecklistAddEvent,
  CwChecklistLabels,
  CwChecklistMoveEvent,
  CwChecklistVariant,
} from './checklist.types';

/* Literal class strings (Checklist sheet and preview of the Design System artifact). */
const TRIGGER =
  'relative isolate overflow-hidden flex h-7 min-w-0 items-center gap-2 rounded-md pr-1.5 text-sm font-medium transition-colors hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

const FOOTER =
  'relative isolate overflow-hidden flex h-7 w-full items-center gap-2 rounded-md pr-2 pl-0.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none';

/** Where an item sits in the tree: its parent (`null` at the first level) and its siblings. */
interface Place {
  readonly parent: ChecklistItemNode | null;
  readonly siblings: readonly ChecklistItemNode[];
  readonly index: number;
}

/**
 * A checklist inside an item: things to tick with a progress count, inline addition, reordering
 * and one level of nesting; or, in `subtasks`, the list of sub-items with the consumer's status
 * control (Checklist sheet of the Design System artifact).
 *
 * The header holds the collapse trigger (`[(expanded)]`, `data-state="open|closed"`), the « 3 / 9 »
 * count (`text-jade-text` once all is done) and a `role="progressbar"` (« 3 sur 9 »), the toggle
 * that hides the ticked items (`[(hideCompleted)]`, `aria-pressed`) and a `[cwChecklistActions]`
 * slot. The body is a list named by `title` of the projected `cw-checklist-item`s, then, while
 * items are hidden, « Afficher les N éléments terminés », then the projected `cw-checklist-add`.
 *
 * The checklist owns no data: `itemAdd`, `itemMove` (pointer drag of the first-level items through
 * the CDK, or keyboard moves of any item from its handle), `itemConvert` and `itemRemove` (the
 * items' default menu) report the change and the consumer updates its items. `sortable` shows the
 * handles; `readonly` removes addition, edition, menus and moves; `convertible` adds « Convertir en
 * tâche » to the menus. Keyboard moves are announced (« saisi, position 2 sur 4 », « posé »). Style
 * hooks on the host: `data-state`, `data-complete`, `data-hide-completed`.
 */
@Component({
  selector: 'cw-checklist',
  imports: [NgIcon, CwButton, CwRipple],
  hostDirectives: [CdkDropList],
  providers: [
    provideIcons({ phosphorCaretRightBold, phosphorEyeBold, phosphorEyeSlashBold }),
    { provide: CHECKLIST, useExisting: forwardRef(() => CwChecklist) },
  ],
  host: {
    class: 'group/col block min-w-0',
    '[attr.data-state]': 'expanded() ? "open" : "closed"',
    '[attr.data-complete]': 'complete() ? "" : null',
    '[attr.data-hide-completed]': 'hideCompleted() ? "" : null',
  },
  templateUrl: './checklist.component.html',
})
export class CwChecklist implements ChecklistHost {
  /** Title of the checklist (« Critères d'acceptation »); it names the list. */
  readonly title = input.required<string>();
  /** Boxes to tick, or sub-items with a status control. */
  readonly variant = input<CwChecklistVariant>('checklist');
  /** Whether the body is unfolded; `[(expanded)]`. */
  readonly expanded = model(true);
  /** Whether the ticked items are hidden; `[(hideCompleted)]`. */
  readonly hideCompleted = model(false);
  /** Shows the handles: drag and keyboard moves. */
  readonly sortable = input(true, { transform: booleanAttribute });
  /** No addition, edition, menu nor move. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Adds « Convertir en tâche » to the items' default menu (`itemConvert`). */
  readonly convertible = input(false, { transform: booleanAttribute });
  /** Text of the add row (« Ajouter une sous-tâche »). */
  readonly addLabel = input('Ajouter un élément');
  /** French texts, any of them overridden (`CW_CHECKLIST_LABELS`). */
  readonly labels = input<Partial<CwChecklistLabels>>({});
  /** Emits a label typed in an add field, with the parent's id for a sub-item. */
  readonly itemAdd = output<CwChecklistAddEvent>();
  /** Emits a move: the item, its new index among its siblings, its new parent. */
  readonly itemMove = output<CwChecklistMoveEvent>();
  /** Emits the id of an item to convert. */
  readonly itemConvert = output<string>();
  /** Emits the id of an item to remove. */
  readonly itemRemove = output<string>();

  private readonly dropList = inject(CdkDropList);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly ids = inject(_IdGenerator);
  private readonly firstLevel = contentChildren(CwChecklistItem);
  private readonly everyItem = contentChildren(CwChecklistItem, { descendants: true });
  private origin: { index: number; parentId: string | null } | null = null;

  /** @internal */
  readonly helpId = this.ids.getId('cw-checklist-help-');
  /** @internal */
  readonly text = computed(() => ({ ...CW_CHECKLIST_LABELS, ...this.labels() }));
  /** @internal */
  readonly topItems = computed<readonly ChecklistItemNode[]>(() => this.firstLevel());
  /** @internal */
  readonly grabbedId = signal<string | null>(null);

  protected readonly titleId = this.ids.getId('cw-checklist-title-');
  protected readonly bodyId = this.ids.getId('cw-checklist-body-');
  protected readonly triggerClasses = TRIGGER;
  protected readonly footerClasses = FOOTER;
  protected readonly total = computed(() => this.everyItem().length);
  protected readonly done = computed(
    () => this.everyItem().filter((item) => item.checked()).length,
  );
  protected readonly complete = computed(() => this.total() > 0 && this.done() === this.total());
  protected readonly percent = computed(() =>
    this.total() === 0 ? 0 : (this.done() / this.total()) * 100,
  );
  protected readonly hiddenCount = computed(() => (this.hideCompleted() ? this.done() : 0));

  constructor() {
    // The CDK drop list is a host directive; its items are in the inner list (sheet, "Glissé").
    this.dropList.lockAxis = 'y';
    this.dropList.elementContainerSelector = '[data-cw-checklist-items]';
    effect(() => {
      this.dropList.disabled = this.readonly() || !this.sortable();
    });
    const dropped = this.dropList.dropped.subscribe((event) => {
      if (event.previousIndex === event.currentIndex) return;
      this.itemMove.emit({
        id: String(event.item.data),
        index: event.currentIndex,
        parentId: null,
      });
      void this.announcer.announce(this.text().dropped, 'polite');
    });
    inject(DestroyRef).onDestroy(() => {
      dropped.unsubscribe();
    });
  }

  /** @internal */
  add(event: CwChecklistAddEvent): void {
    this.itemAdd.emit(event);
  }

  /** @internal */
  move(event: CwChecklistMoveEvent): void {
    this.itemMove.emit(event);
    // A move re-renders the item, possibly as a new one under another parent: the focus follows it.
    afterNextRender(() => this.find(event.id)?.focusHandle(), { injector: this.injector });
  }

  /** @internal */
  convert(id: string): void {
    this.itemConvert.emit(id);
  }

  /** @internal */
  remove(id: string): void {
    this.itemRemove.emit(id);
  }

  /** @internal */
  nest(item: ChecklistItemNode): boolean {
    const place = this.place(item);
    if (!place || place.parent || place.index === 0 || item.children().length > 0) return false;
    const previous = place.siblings.at(place.index - 1);
    if (!previous) return false;
    this.move({
      id: item.itemId(),
      index: previous.children().length,
      parentId: previous.itemId(),
    });
    void this.announcer.announce(this.text().nested(previous.label()), 'polite');
    return true;
  }

  /** @internal */
  unnest(item: ChecklistItemNode): boolean {
    const place = this.place(item);
    if (!place?.parent) return false;
    const index = this.topItems().indexOf(place.parent) + 1;
    this.move({ id: item.itemId(), index, parentId: null });
    void this.announcer.announce(this.text().unnested, 'polite');
    return true;
  }

  /** @internal */
  handleKey(item: ChecklistItemNode, event: KeyboardEvent): void {
    const place = this.place(item);
    if (!place) return;
    const id = item.itemId();
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (this.grabbedId() === id) {
        this.grabbedId.set(null);
        this.origin = null;
        void this.announcer.announce(this.text().dropped, 'polite');
      } else {
        this.origin = { index: place.index, parentId: place.parent?.itemId() ?? null };
        this.grabbedId.set(id);
        void this.announcer.announce(
          this.text().grabbed(place.index + 1, place.siblings.length),
          'polite',
        );
      }
      return;
    }
    if (this.grabbedId() !== id) return;
    const parentId = place.parent?.itemId() ?? null;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (place.index === 0) return;
        this.move({ id, index: place.index - 1, parentId });
        void this.announcer.announce(
          this.text().grabbed(place.index, place.siblings.length),
          'polite',
        );
        return;
      case 'ArrowDown':
        event.preventDefault();
        if (place.index >= place.siblings.length - 1) return;
        this.move({ id, index: place.index + 1, parentId });
        void this.announcer.announce(
          this.text().grabbed(place.index + 2, place.siblings.length),
          'polite',
        );
        return;
      case 'ArrowRight':
        event.preventDefault();
        this.nest(item);
        return;
      case 'ArrowLeft':
        event.preventDefault();
        this.unnest(item);
        return;
      case 'Escape': {
        event.preventDefault();
        const origin = this.origin;
        this.grabbedId.set(null);
        this.origin = null;
        if (origin && (origin.index !== place.index || origin.parentId !== parentId)) {
          this.move({ id, index: origin.index, parentId: origin.parentId });
        }
        void this.announcer.announce(this.text().cancelled, 'polite');
        return;
      }
    }
  }

  /** @internal */
  releaseGrab(item: ChecklistItemNode): void {
    // A keyboard move re-renders the item and its handle may blur on the way: the grab ends only if
    // the focus did not come back to the grabbed handle.
    setTimeout(() => {
      if (this.grabbedId() !== item.itemId()) return;
      const active = this.document.activeElement;
      if (active?.hasAttribute('data-grabbed')) return;
      this.grabbedId.set(null);
      this.origin = null;
    });
  }

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }

  protected toggleHide(): void {
    this.hideCompleted.set(!this.hideCompleted());
  }

  protected showCompleted(): void {
    this.hideCompleted.set(false);
  }

  private place(item: ChecklistItemNode): Place | null {
    const top = this.topItems();
    const index = top.indexOf(item);
    if (index >= 0) return { parent: null, siblings: top, index };
    for (const parent of top) {
      const children = parent.children();
      const child = children.indexOf(item);
      if (child >= 0) return { parent, siblings: children, index: child };
    }
    return null;
  }

  private find(id: string): ChecklistItemNode | null {
    for (const item of this.topItems()) {
      if (item.itemId() === id) return item;
      const child = item.children().find((candidate) => candidate.itemId() === id);
      if (child) return child;
    }
    return null;
  }
}
