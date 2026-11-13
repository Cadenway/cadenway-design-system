import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  type Signal,
  viewChild,
} from '@angular/core';
import {
  CDK_DROP_LIST,
  CdkDrag,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragPreview,
} from '@angular/cdk/drag-drop';
import { CwAvatar } from '@cadenway/ui/avatar';
import { CwButton } from '@cadenway/ui/button';
import { CwCheckbox } from '@cadenway/ui/checkbox';
import { CwKbd } from '@cadenway/ui/kbd';
import { CwMenu, CwMenuItem, CwMenuSeparator, CwMenuTriggerFor } from '@cadenway/ui/menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowSquareOutBold,
  phosphorCalendarBlankBold,
  phosphorDotsSixVerticalBold,
  phosphorDotsThreeBold,
  phosphorPencilSimpleBold,
  phosphorPlusBold,
  phosphorTrashBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwChecklistItemMenu } from '../checklist-item-menu/checklist-item-menu.directive';
import { CHECKLIST, CHECKLIST_PARENT, type ChecklistItemNode } from '../checklist.token';
import type { CwChecklistPerson } from '../checklist.types';

/* Literal class strings (Checklist sheet and preview of the Design System artifact). The handle and
   the menu keep their place while hidden (`opacity-0`), revealed on hover and focus; the row takes
   the selected veil while one of its menus or panels is open. */
const ROW =
  'group/item relative flex min-h-8 min-w-0 items-center gap-2 rounded-md pr-1 pl-0.5 text-sm transition-colors hover:bg-accent has-[[aria-expanded=true]]:bg-selected motion-reduce:transition-none';

const HANDLE =
  'flex size-5 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100 data-[grabbed]:cursor-grabbing data-[grabbed]:bg-selected data-[grabbed]:opacity-100 motion-reduce:transition-none';

const FIELD =
  'h-7 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20';

const REVEAL =
  'relative z-10 flex shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100 has-[[aria-expanded=true]]:opacity-100 motion-reduce:transition-none';

const LINK =
  'min-w-0 flex-1 truncate rounded-sm outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const DUE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/**
 * One item of a `cw-checklist`: a box to tick (or, in `subtasks`, the consumer's status control, a
 * reference and a link), its label, its due date and assignee, a drag handle and a menu (Checklist
 * sheet of the Design System artifact).
 *
 * `itemId` identifies it in the checklist's outputs. `[(checked)]` ticks it (the label then reads
 * crossed and muted, the box stays the main sign); `[(editing)]` opens its label in a field: a click
 * on the label or F2 on the box opens it, Enter validates into `[(label)]` (`labelChange`), Escape cancels,
 * Tab nests it under the previous item and Shift + Tab brings it back to the first level.
 * `disabled` locks it (`aria-disabled`, no handle nor menu). Sub-items are `cw-checklist-item`s
 * projected inside it (one level). Projected slots: `[cwChecklistItemStatus]` (the status control
 * of a `subtasks` item), `[cwChecklistItemMeta]` (custom metadata) and `[cwChecklistItemMenu]`
 * (replaces the default menu: Modifier, Ajouter un sous-élément, Convertir, Supprimer). The handle
 * is a button: Space grabs the item, ↑ ↓ move it, → nests it, ← brings it back, Space drops it,
 * Escape cancels; with the pointer it drags (CDK drag-drop) among the first-level items. Style
 * hooks on the host: `data-state="checked|unchecked"`, `aria-disabled`, `data-editing`,
 * `data-dragging`. Only valid inside `cw-checklist` or another `cw-checklist-item`.
 */
@Component({
  selector: 'cw-checklist-item',
  imports: [
    NgIcon,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDragPreview,
    CwAvatar,
    CwButton,
    CwCheckbox,
    CwKbd,
    CwMenu,
    CwMenuItem,
    CwMenuSeparator,
    CwMenuTriggerFor,
  ],
  hostDirectives: [CdkDrag],
  providers: [
    provideIcons({
      phosphorArrowSquareOutBold,
      phosphorCalendarBlankBold,
      phosphorDotsSixVerticalBold,
      phosphorDotsThreeBold,
      phosphorPencilSimpleBold,
      phosphorPlusBold,
      phosphorTrashBold,
    }),
    { provide: CHECKLIST_PARENT, useExisting: forwardRef(() => CwChecklistItem) },
    // Sub-items are not part of the first-level drop list: their own drag finds no list here.
    { provide: CDK_DROP_LIST, useValue: null },
  ],
  host: {
    class: 'block',
    role: 'listitem',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-editing]': 'editing() ? "" : null',
    '[attr.data-dragging]': 'dragging() ? "" : null',
    '[attr.hidden]': 'hidden() ? "" : null',
    '(click)': 'onClick($event)',
  },
  templateUrl: './checklist-item.component.html',
})
export class CwChecklistItem implements ChecklistItemNode {
  /** Identifies the item in the checklist's outputs. */
  readonly itemId = input.required<string>();
  /** Text of the item (« Tester sur Safari »); an edition writes it back, `[(label)]`. */
  readonly label = model.required<string>();
  /** Whether the item is ticked; `[(checked)]`. */
  readonly checked = model(false);
  /** Whether the label is open in a field; `[(editing)]`. */
  readonly editing = model(false);
  /** Person shown as an avatar on the right. */
  readonly assignee = input<CwChecklistPerson | null>(null);
  /** Due date shown on the right (« 18 nov. »). */
  readonly due = input<Date | null>(null);
  /** Locks the item: no box, handle, menu nor edition. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** `subtasks`: the reference written before the title (« CAD-483 »). */
  readonly reference = input<string | null>(null);
  /** `subtasks`: the address the title links to. */
  readonly href = input<string | null>(null);

  private readonly checklist = inject(CHECKLIST);
  private readonly parent = inject(CHECKLIST_PARENT, { optional: true, skipSelf: true });
  private readonly drag = inject(CdkDrag);
  private readonly injector = inject(Injector);
  private readonly handle = viewChild<ElementRef<HTMLButtonElement>>('handle');
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly addField = viewChild<ElementRef<HTMLInputElement>>('addField');
  private readonly box = viewChild(CwCheckbox);
  // Annotated: the class queries itself, which TypeScript cannot infer.
  private readonly subItems: Signal<readonly ChecklistItemNode[]> =
    contentChildren(CwChecklistItem);
  private readonly customMenu = contentChild(CwChecklistItemMenu);
  private draft = '';
  // Enter, Escape and Tab close the field themselves: the blur that follows must not act again.
  private closing = false;

  /** @internal */
  readonly children: Signal<readonly ChecklistItemNode[]> = computed(() => this.subItems());

  protected readonly text = this.checklist.text;
  protected readonly helpId = this.checklist.helpId;
  protected readonly rowClasses = ROW;
  protected readonly handleClasses = HANDLE;
  protected readonly fieldClasses = FIELD;
  protected readonly revealClasses = REVEAL;
  protected readonly linkClasses = LINK;
  protected readonly nested = !!this.parent;
  protected readonly dragging = signal(false);
  protected readonly adding = signal(false);
  protected readonly variant = this.checklist.variant;
  protected readonly convertible = this.checklist.convertible;
  protected readonly grabbed = computed(() => this.checklist.grabbedId() === this.itemId());
  protected readonly editable = computed(() => !this.checklist.readonly() && !this.disabled());
  protected readonly canDrag = computed(() => this.editable() && this.checklist.sortable());
  protected readonly hasCustomMenu = computed(() => !!this.customMenu());
  protected readonly dueText = computed(() => {
    const due = this.due();
    return due ? DUE.format(due) : '';
  });
  protected readonly hidden = computed(
    () => this.checklist.hideCompleted() && this.checked() && !this.editing(),
  );
  protected readonly showGroup = computed(() => this.subItems().length > 0 || this.adding());

  constructor() {
    // The CDK drag is a host directive: only first-level items sort with the pointer, and only by
    // their handle (sheet, "Glissé"); sub-items move with the keyboard.
    this.drag.lockAxis = 'y';
    effect(() => {
      this.drag.data = this.itemId();
      this.drag.disabled = !this.canDrag() || this.nested;
    });
    const started = this.drag.started.subscribe(() => {
      this.dragging.set(true);
    });
    const ended = this.drag.ended.subscribe(() => {
      this.dragging.set(false);
    });
    inject(DestroyRef).onDestroy(() => {
      started.unsubscribe();
      ended.unsubscribe();
    });

    // `[(editing)]` set from outside opens the field like a click does.
    effect(() => {
      if (this.editing()) this.focusAfterRender(() => this.field()?.nativeElement, true);
    });
  }

  /** @internal Moves the focus to the drag handle, after a keyboard move re-rendered the item. */
  focusHandle(): void {
    this.focusAfterRender(() => this.handle()?.nativeElement, false);
  }

  protected setChecked(checked: boolean): void {
    this.checked.set(checked);
  }

  protected onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-cw-checklist-label]')) this.startEdit();
  }

  protected onBoxKeydown(event: KeyboardEvent): void {
    if (event.key !== 'F2') return;
    event.preventDefault();
    this.startEdit();
  }

  protected onHandleKeydown(event: KeyboardEvent): void {
    this.checklist.handleKey(this, event);
  }

  protected onHandleBlur(): void {
    this.checklist.releaseGrab(this);
  }

  protected startEdit(): void {
    if (!this.editable()) return;
    this.draft = this.label();
    this.editing.set(true);
  }

  protected onFieldInput(event: Event): void {
    this.draft = (event.target as HTMLInputElement).value;
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        if (event.isComposing) return;
        event.preventDefault();
        this.closing = true;
        this.commit(true);
        return;
      case 'Escape':
        event.preventDefault();
        this.closing = true;
        this.editing.set(false);
        this.focusBox();
        return;
      case 'Tab': {
        // Tab nests under the previous item, Shift + Tab goes back to the first level (sheet,
        // "Clavier"); where neither applies, Tab leaves the field as usual.
        const moved = event.shiftKey ? this.checklist.unnest(this) : this.checklist.nest(this);
        if (!moved) return;
        event.preventDefault();
        this.closing = true;
        this.commit(false);
        return;
      }
    }
  }

  protected onFieldBlur(): void {
    if (this.closing) {
      this.closing = false;
      return;
    }
    if (this.editing()) this.commit(false);
  }

  protected startAddChild(): void {
    this.adding.set(true);
    this.focusAfterRender(() => this.addField()?.nativeElement, false);
  }

  protected onAddKeydown(event: KeyboardEvent): void {
    const field = event.target as HTMLInputElement;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.adding.set(false);
      this.focusBox();
      return;
    }
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    const label = field.value.trim();
    if (!label) return;
    // The field stays open to chain the next sub-item (sheet, "Règles").
    this.checklist.add({ label, parentId: this.itemId() });
    field.value = '';
  }

  protected onAddBlur(event: FocusEvent): void {
    if ((event.target as HTMLInputElement).value.trim() === '') this.adding.set(false);
  }

  protected convert(): void {
    this.checklist.convert(this.itemId());
  }

  protected remove(): void {
    this.checklist.remove(this.itemId());
  }

  private commit(restoreFocus: boolean): void {
    const label = this.draft.trim();
    this.editing.set(false);
    if (label !== '' && label !== this.label()) this.label.set(label);
    if (restoreFocus) this.focusBox();
  }

  private focusBox(): void {
    afterNextRender(() => this.box()?.focus(), { injector: this.injector });
  }

  private focusAfterRender(element: () => HTMLElement | undefined, select: boolean): void {
    afterNextRender(
      () => {
        const target = element();
        if (!target) return;
        target.focus();
        if (select && target instanceof HTMLInputElement) target.select();
      },
      { injector: this.injector },
    );
  }
}
