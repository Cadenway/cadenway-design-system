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
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import { CdkDropList } from '@angular/cdk/drag-drop';
import type { Subscription } from 'rxjs';
import { CwButton } from '@cadenway/ui/components/button';
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
/**
 * Constant TRIGGER
 *
 * @description
 * Classes for the checklist collapse trigger.
 *
 * @type {string}
 */
const TRIGGER: string =
  'relative isolate overflow-hidden flex h-7 min-w-0 items-center gap-2 rounded-md pr-1.5 text-sm font-medium transition-colors hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

/**
 * Constant FOOTER
 *
 * @description
 * Classes for the completed-item reveal action.
 *
 * @type {string}
 */
const FOOTER: string =
  'relative isolate overflow-hidden flex h-7 w-full items-center gap-2 rounded-md pr-2 pl-0.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none';

/**
 * Interface Place
 *
 * @description
 * Position of an item within its parent and siblings.
 */
interface Place {
  // #region Properties
  /**
   * Property parent
   * @readonly
   *
   * @description
   * Parent item, or null at the first level.
   *
   * @type {ChecklistItemNode | null}
   */
  readonly parent: ChecklistItemNode | null;

  /**
   * Property siblings
   * @readonly
   *
   * @description
   * Items sharing the same parent.
   *
   * @type {readonly ChecklistItemNode[]}
   */
  readonly siblings: readonly ChecklistItemNode[];

  /**
   * Property index
   * @readonly
   *
   * @description
   * Index among the siblings.
   *
   * @type {number}
   */
  readonly index: number;
  // #endregion
}

/**
 * Class CwChecklist
 * @class CwChecklist
 *
 * @description
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
  // #region Properties
  /**
   * Property title
   * @readonly
   *
   * @description
   * Title of the checklist (« Critères d'acceptation »); it names the list.
   *
   * @type {InputSignal<string>}
   */
  public readonly title: InputSignal<string> = input.required<string>();

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Boxes to tick, or sub-items with a status control.
   *
   * @type {InputSignal<CwChecklistVariant>}
   */
  public readonly variant: InputSignal<CwChecklistVariant> = input<CwChecklistVariant>('checklist');

  /**
   * Property expanded
   * @readonly
   *
   * @description
   * Whether the body is unfolded; `[(expanded)]`.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly expanded: ModelSignal<boolean> = model(true);

  /**
   * Property hideCompleted
   * @readonly
   *
   * @description
   * Whether the ticked items are hidden; `[(hideCompleted)]`.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly hideCompleted: ModelSignal<boolean> = model(false);

  /**
   * Property sortable
   * @readonly
   *
   * @description
   * Shows the handles: drag and keyboard moves.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly sortable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property readonly
   * @readonly
   *
   * @description
   * No addition, edition, menu nor move.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property convertible
   * @readonly
   *
   * @description
   * Adds « Convertir en tâche » to the items' default menu (`itemConvert`).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly convertible: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property addLabel
   * @readonly
   *
   * @description
   * Text of the add row (« Ajouter une sous-tâche »).
   *
   * @type {InputSignal<string>}
   */
  public readonly addLabel: InputSignal<string> = input('Ajouter un élément');

  /**
   * Property labels
   * @readonly
   *
   * @description
   * French texts, any of them overridden (`CW_CHECKLIST_LABELS`).
   *
   * @type {InputSignal<Partial<CwChecklistLabels>>}
   */
  public readonly labels: InputSignal<Partial<CwChecklistLabels>> = input<
    Partial<CwChecklistLabels>
  >({});

  /**
   * Property itemAdd
   * @readonly
   *
   * @description
   * Emits a label typed in an add field, with the parent's id for a sub-item.
   *
   * @type {OutputEmitterRef<CwChecklistAddEvent>}
   */
  public readonly itemAdd: OutputEmitterRef<CwChecklistAddEvent> = output<CwChecklistAddEvent>();

  /**
   * Property itemMove
   * @readonly
   *
   * @description
   * Emits a move: the item, its new index among its siblings, its new parent.
   *
   * @type {OutputEmitterRef<CwChecklistMoveEvent>}
   */
  public readonly itemMove: OutputEmitterRef<CwChecklistMoveEvent> = output<CwChecklistMoveEvent>();

  /**
   * Property itemConvert
   * @readonly
   *
   * @description
   * Emits the id of an item to convert.
   *
   * @type {OutputEmitterRef<string>}
   */
  public readonly itemConvert: OutputEmitterRef<string> = output<string>();

  /**
   * Property itemRemove
   * @readonly
   *
   * @description
   * Emits the id of an item to remove.
   *
   * @type {OutputEmitterRef<string>}
   */
  public readonly itemRemove: OutputEmitterRef<string> = output<string>();

  /**
   * Property dropList
   * @readonly
   *
   * @description
   * CDK drop list controlling first-level pointer sorting.
   *
   * @type {CdkDropList<unknown>}
   */
  private readonly dropList: CdkDropList<unknown> = inject(CdkDropList);

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Announces keyboard and pointer movement.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to restore focus after rendering.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document used to find a drag handle.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property ids
   * @readonly
   *
   * @description
   * Generator for accessible identifiers.
   *
   * @type {_IdGenerator}
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property firstLevel
   * @readonly
   *
   * @description
   * Projected first-level checklist items.
   *
   * @type {Signal<readonly CwChecklistItem[]>}
   */
  private readonly firstLevel: Signal<readonly CwChecklistItem[]> =
    contentChildren(CwChecklistItem);

  /**
   * Property everyItem
   * @readonly
   *
   * @description
   * Projected items including nested ones.
   *
   * @type {Signal<readonly CwChecklistItem[]>}
   */
  private readonly everyItem: Signal<readonly CwChecklistItem[]> = contentChildren(
    CwChecklistItem,
    { descendants: true },
  );

  /**
   * Property origin
   *
   * @description
   * Original position of the keyboard-grabbed item.
   *
   * @type {{ index: number; parentId: string | null } | null}
   */
  private origin: { index: number; parentId: string | null } | null = null;

  /**
   * Property helpId
   * @readonly
   *
   * @description
   * Identifier of the keyboard movement help.
   *
   * @type {string}
   */
  public readonly helpId: string = this.ids.getId('cw-checklist-help-');

  /**
   * Property text
   * @readonly
   *
   * @description
   * Default checklist labels merged with overrides.
   *
   * @type {Signal<CwChecklistLabels>}
   */
  public readonly text: Signal<CwChecklistLabels> = computed(() => ({
    ...CW_CHECKLIST_LABELS,
    ...this.labels(),
  }));

  /**
   * Property topItems
   * @readonly
   *
   * @description
   * First-level item nodes in order.
   *
   * @type {Signal<readonly ChecklistItemNode[]>}
   */
  public readonly topItems: Signal<readonly ChecklistItemNode[]> = computed<
    readonly ChecklistItemNode[]
  >(() => this.firstLevel());

  /**
   * Property grabbedId
   * @readonly
   *
   * @description
   * Identifier of the item grabbed by keyboard.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly grabbedId: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Identifier of the checklist title.
   *
   * @type {string}
   */
  protected readonly titleId: string = this.ids.getId('cw-checklist-title-');

  /**
   * Property bodyId
   * @readonly
   *
   * @description
   * Identifier of the checklist body.
   *
   * @type {string}
   */
  protected readonly bodyId: string = this.ids.getId('cw-checklist-body-');

  /**
   * Property triggerClasses
   * @readonly
   *
   * @description
   * Collapse trigger classes.
   *
   * @type {string}
   */
  protected readonly triggerClasses: string = TRIGGER;

  /**
   * Property footerClasses
   * @readonly
   *
   * @description
   * Completed-item reveal action classes.
   *
   * @type {string}
   */
  protected readonly footerClasses: string = FOOTER;

  /**
   * Property total
   * @readonly
   *
   * @description
   * Number of all projected items.
   *
   * @type {Signal<number>}
   */
  protected readonly total: Signal<number> = computed(() => this.everyItem().length);

  /**
   * Property done
   * @readonly
   *
   * @description
   * Number of checked items.
   *
   * @type {Signal<number>}
   */
  protected readonly done: Signal<number> = computed(
    () => this.everyItem().filter((item) => item.checked()).length,
  );

  /**
   * Property complete
   * @readonly
   *
   * @description
   * Whether all items are checked.
   *
   * @type {Signal<boolean>}
   */
  protected readonly complete: Signal<boolean> = computed(
    () => this.total() > 0 && this.done() === this.total(),
  );

  /**
   * Property percent
   * @readonly
   *
   * @description
   * Completed share of the checklist.
   *
   * @type {Signal<number>}
   */
  protected readonly percent: Signal<number> = computed(() =>
    this.total() === 0 ? 0 : (this.done() / this.total()) * 100,
  );

  /**
   * Property hiddenCount
   * @readonly
   *
   * @description
   * Number of completed items currently hidden.
   *
   * @type {Signal<number>}
   */
  protected readonly hiddenCount: Signal<number> = computed(() =>
    this.hideCompleted() ? this.done() : 0,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Configures the drop list and reports pointer reordering.
   */
  public constructor() {
    // The CDK drop list is a host directive; its items are in the inner list (sheet, "Glissé").
    this.dropList.lockAxis = 'y';
    this.dropList.elementContainerSelector = '[data-cw-checklist-items]';
    effect(() => {
      this.dropList.disabled = this.readonly() || !this.sortable();
    });
    const dropped: Subscription = this.dropList.dropped.subscribe((event) => {
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
  // #endregion

  // #region Methods
  /**
   * Method add
   * @method add
   *
   * @description
   * Emits an item addition request.
   *
   * @param {CwChecklistAddEvent} event - Addition request containing the new label and optional parent.
   */
  public add(event: CwChecklistAddEvent): void {
    this.itemAdd.emit(event);
  }

  /**
   * Method move
   * @method move
   *
   * @description
   * Emits an item move and restores focus after rendering.
   *
   * @param {CwChecklistMoveEvent} event - Move request containing the item and destination.
   */
  public move(event: CwChecklistMoveEvent): void {
    this.itemMove.emit(event);
    // A move re-renders the item, possibly as a new one under another parent: the focus follows it.
    afterNextRender(() => this.find(event.id)?.focusHandle(), { injector: this.injector });
  }

  /**
   * Method convert
   * @method convert
   *
   * @description
   * Emits an item conversion request.
   *
   * @param {string} id - Identifier of the item to convert.
   */
  public convert(id: string): void {
    this.itemConvert.emit(id);
  }

  /**
   * Method remove
   * @method remove
   *
   * @description
   * Emits an item removal request.
   *
   * @param {string} id - Identifier of the item to remove.
   */
  public remove(id: string): void {
    this.itemRemove.emit(id);
  }

  /**
   * Method nest
   * @method nest
   *
   * @description
   * Attempts to nest an item under its preceding sibling.
   *
   * @param {ChecklistItemNode} item - Item to move beneath its preceding sibling.
   *
   * @returns {boolean} Whether the nesting request was emitted.
   */
  public nest(item: ChecklistItemNode): boolean {
    const place: Place | null = this.place(item);
    if (!place || place.parent || place.index === 0 || item.children().length > 0) return false;
    const previous: ChecklistItemNode | undefined = place.siblings.at(place.index - 1);
    if (!previous) return false;
    this.move({
      id: item.itemId(),
      index: previous.children().length,
      parentId: previous.itemId(),
    });
    void this.announcer.announce(this.text().nested(previous.label()), 'polite');
    return true;
  }

  /**
   * Method unnest
   * @method unnest
   *
   * @description
   * Attempts to move a child back to the first level.
   *
   * @param {ChecklistItemNode} item - Child item to move to the first level.
   *
   * @returns {boolean} Whether the unnesting request was emitted.
   */
  public unnest(item: ChecklistItemNode): boolean {
    const place: Place | null = this.place(item);
    if (!place?.parent) return false;
    const index: number = this.topItems().indexOf(place.parent) + 1;
    this.move({ id: item.itemId(), index, parentId: null });
    void this.announcer.announce(this.text().unnested, 'polite');
    return true;
  }

  /**
   * Method handleKey
   * @method handleKey
   *
   * @description
   * Handles keyboard grab, movement, nesting and cancellation.
   *
   * @param {ChecklistItemNode} item - Item whose handle received the event.
   * @param {KeyboardEvent} event - Keyboard event controlling movement.
   */
  public handleKey(item: ChecklistItemNode, event: KeyboardEvent): void {
    const place: Place | null = this.place(item);
    if (!place) return;
    const id: string = item.itemId();
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
    const parentId: string | null = place.parent?.itemId() ?? null;
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
        const origin: { index: number; parentId: string | null } | null = this.origin;
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

  /**
   * Method releaseGrab
   * @method releaseGrab
   *
   * @description
   * Finishes a keyboard grab when its handle loses focus.
   *
   * @param {ChecklistItemNode} item - Item whose keyboard grab should end.
   */
  public releaseGrab(item: ChecklistItemNode): void {
    // A keyboard move re-renders the item and its handle may blur on the way: the grab ends only if
    // the focus did not come back to the grabbed handle.
    setTimeout(() => {
      if (this.grabbedId() !== item.itemId()) return;
      const active: Element | null = this.document.activeElement;
      if (active?.hasAttribute('data-grabbed')) return;
      this.grabbedId.set(null);
      this.origin = null;
    });
  }

  /**
   * Method toggle
   * @method toggle
   *
   * @description
   * Toggles checklist expansion.
   */
  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }

  /**
   * Method toggleHide
   * @method toggleHide
   *
   * @description
   * Toggles hiding completed items.
   */
  protected toggleHide(): void {
    this.hideCompleted.set(!this.hideCompleted());
  }

  /**
   * Method showCompleted
   * @method showCompleted
   *
   * @description
   * Shows completed items again.
   */
  protected showCompleted(): void {
    this.hideCompleted.set(false);
  }

  /**
   * Method place
   * @method place
   *
   * @description
   * Finds an item position in the projected tree.
   *
   * @param {ChecklistItemNode} item - Item whose position is sought.
   *
   * @returns {Place | null} Position in the projected tree, or null when absent.
   */
  private place(item: ChecklistItemNode): Place | null {
    const top: readonly ChecklistItemNode[] = this.topItems();
    const index: number = top.indexOf(item);
    if (index >= 0) return { parent: null, siblings: top, index };
    for (const parent of top) {
      const children: readonly ChecklistItemNode[] = parent.children();
      const child: number = children.indexOf(item);
      if (child >= 0) return { parent, siblings: children, index: child };
    }
    return null;
  }

  /**
   * Method find
   * @method find
   *
   * @description
   * Finds an item node by identifier.
   *
   * @param {string} id - Identifier of the item to find.
   *
   * @returns {ChecklistItemNode | null} Matching item, or null when absent.
   */
  private find(id: string): ChecklistItemNode | null {
    for (const item of this.topItems()) {
      if (item.itemId() === id) return item;
      const child: ChecklistItemNode | undefined = item
        .children()
        .find((candidate) => candidate.itemId() === id);
      if (child) return child;
    }
    return null;
  }
  // #endregion
}
