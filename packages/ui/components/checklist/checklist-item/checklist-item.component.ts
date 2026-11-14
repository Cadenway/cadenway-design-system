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
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type WritableSignal,
  viewChild,
} from '@angular/core';
import {
  CDK_DROP_LIST,
  CdkDrag,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragPreview,
} from '@angular/cdk/drag-drop';
import type { Subscription } from 'rxjs';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwButton } from '@cadenway/ui/components/button';
import { CwCheckbox } from '@cadenway/ui/components/checkbox';
import { CwKbd } from '@cadenway/ui/components/kbd';
import {
  CwMenu,
  CwMenuItem,
  CwMenuSeparator,
  CwMenuTriggerFor,
} from '@cadenway/ui/components/menu';
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
import {
  CHECKLIST,
  CHECKLIST_PARENT,
  type ChecklistHost,
  type ChecklistItemNode,
} from '../checklist.token';
import type { CwChecklistLabels, CwChecklistPerson, CwChecklistVariant } from '../checklist.types';

/* Literal class strings (Checklist sheet and preview of the Design System artifact). The handle and
   the menu keep their place while hidden (`opacity-0`), revealed on hover and focus; the row takes
   the selected veil while one of its menus or panels is open. */
/**
 * Constant ROW
 *
 * @description
 * Item row layout and interaction classes.
 *
 * @type {string}
 */
const ROW: string =
  'group/item relative flex min-h-8 min-w-0 items-center gap-2 rounded-md pr-1 pl-0.5 text-sm transition-colors hover:bg-accent has-[[aria-expanded=true]]:bg-selected motion-reduce:transition-none';

/**
 * Constant HANDLE
 *
 * @description
 * Drag handle classes and visibility states.
 *
 * @type {string}
 */
const HANDLE: string =
  'flex size-5 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100 data-[grabbed]:cursor-grabbing data-[grabbed]:bg-selected data-[grabbed]:opacity-100 motion-reduce:transition-none';

/**
 * Constant FIELD
 *
 * @description
 * Inline editing field classes.
 *
 * @type {string}
 */
const FIELD: string =
  'h-7 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20';

/**
 * Constant REVEAL
 *
 * @description
 * Classes revealing controls on hover or focus.
 *
 * @type {string}
 */
const REVEAL: string =
  'relative z-10 flex shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100 has-[[aria-expanded=true]]:opacity-100 motion-reduce:transition-none';

/**
 * Constant LINK
 *
 * @description
 * Subtask link layout and focus classes.
 *
 * @type {string}
 */
const LINK: string =
  'min-w-0 flex-1 truncate rounded-sm outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant DUE
 *
 * @description
 * French day and abbreviated month formatter.
 *
 * @type {Intl.DateTimeFormat}
 */
const DUE: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});

/**
 * Class CwChecklistItem
 * @class CwChecklistItem
 *
 * @description
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
  // #region Properties
  /**
   * Property itemId
   * @readonly
   *
   * @description
   * Identifies the item in the checklist's outputs.
   *
   * @type {InputSignal<string>}
   */
  public readonly itemId: InputSignal<string> = input.required<string>();

  /**
   * Property label
   * @readonly
   *
   * @description
   * Text of the item (« Tester sur Safari »); an edition writes it back, `[(label)]`.
   *
   * @type {ModelSignal<string>}
   */
  public readonly label: ModelSignal<string> = model.required<string>();

  /**
   * Property checked
   * @readonly
   *
   * @description
   * Whether the item is ticked; `[(checked)]`.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly checked: ModelSignal<boolean> = model(false);

  /**
   * Property editing
   * @readonly
   *
   * @description
   * Whether the label is open in a field; `[(editing)]`.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly editing: ModelSignal<boolean> = model(false);

  /**
   * Property assignee
   * @readonly
   *
   * @description
   * Person shown as an avatar on the right.
   *
   * @type {InputSignal<CwChecklistPerson | null>}
   */
  public readonly assignee: InputSignal<CwChecklistPerson | null> = input<CwChecklistPerson | null>(
    null,
  );

  /**
   * Property due
   * @readonly
   *
   * @description
   * Due date shown on the right (« 18 nov. »).
   *
   * @type {InputSignal<Date | null>}
   */
  public readonly due: InputSignal<Date | null> = input<Date | null>(null);

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Locks the item: no box, handle, menu nor edition.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property reference
   * @readonly
   *
   * @description
   * `subtasks`: the reference written before the title (« CAD-483 »).
   *
   * @type {InputSignal<string | null>}
   */
  public readonly reference: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property href
   * @readonly
   *
   * @description
   * `subtasks`: the address the title links to.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly href: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property checklist
   * @readonly
   *
   * @description
   * Containing checklist and its actions.
   *
   * @type {ChecklistHost}
   */
  private readonly checklist: ChecklistHost = inject(CHECKLIST);

  /**
   * Property parent
   * @readonly
   *
   * @description
   * Parent item when this is a nested item.
   *
   * @type {ChecklistItemNode | null}
   */
  private readonly parent: ChecklistItemNode | null = inject(CHECKLIST_PARENT, {
    optional: true,
    skipSelf: true,
  });

  /**
   * Property drag
   * @readonly
   *
   * @description
   * CDK drag instance for pointer sorting.
   *
   * @type {CdkDrag<unknown>}
   */
  private readonly drag: CdkDrag<unknown> = inject(CdkDrag);

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to schedule focus after rendering.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property handle
   * @readonly
   *
   * @description
   * Drag handle when rendered.
   *
   * @type {Signal<ElementRef<HTMLButtonElement> | undefined>}
   */
  private readonly handle: Signal<ElementRef<HTMLButtonElement> | undefined> =
    viewChild<ElementRef<HTMLButtonElement>>('handle');

  /**
   * Property field
   * @readonly
   *
   * @description
   * Label editing field when rendered.
   *
   * @type {Signal<ElementRef<HTMLInputElement> | undefined>}
   */
  private readonly field: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>('field');

  /**
   * Property addField
   * @readonly
   *
   * @description
   * Child-item entry field when rendered.
   *
   * @type {Signal<ElementRef<HTMLInputElement> | undefined>}
   */
  private readonly addField: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>('addField');

  /**
   * Property box
   * @readonly
   *
   * @description
   * Checkbox control when rendered.
   *
   * @type {Signal<CwCheckbox | undefined>}
   */
  private readonly box: Signal<CwCheckbox | undefined> = viewChild(CwCheckbox);

  /**
   * Property subItems
   * @readonly
   *
   * @description
   * Projected child item nodes.
   *
   * @type {Signal<readonly ChecklistItemNode[]>}
   */
  private readonly subItems: Signal<readonly ChecklistItemNode[]> =
    contentChildren(CwChecklistItem);

  /**
   * Property customMenu
   * @readonly
   *
   * @description
   * Projected custom menu, when present.
   *
   * @type {Signal<CwChecklistItemMenu | undefined>}
   */
  private readonly customMenu: Signal<CwChecklistItemMenu | undefined> =
    contentChild(CwChecklistItemMenu);

  /**
   * Property draft
   *
   * @description
   * Current label editing draft.
   *
   * @type {string}
   */
  private draft: string = '';

  /**
   * Property closing
   *
   * @description
   * Whether keyboard handling already closed the editing field.
   *
   * @type {boolean}
   */
  private closing: boolean = false;

  /**
   * Property children
   * @readonly
   *
   * @description
   * Child item nodes exposed to the checklist.
   *
   * @type {Signal<readonly ChecklistItemNode[]>}
   */
  public readonly children: Signal<readonly ChecklistItemNode[]> = computed(() => this.subItems());

  /**
   * Property text
   * @readonly
   *
   * @description
   * Localized checklist labels.
   *
   * @type {Signal<CwChecklistLabels>}
   */
  protected readonly text: Signal<CwChecklistLabels> = this.checklist.text;

  /**
   * Property helpId
   * @readonly
   *
   * @description
   * Identifier of the keyboard movement help.
   *
   * @type {string}
   */
  protected readonly helpId: string = this.checklist.helpId;

  /**
   * Property rowClasses
   * @readonly
   *
   * @description
   * Item row classes.
   *
   * @type {string}
   */
  protected readonly rowClasses: string = ROW;

  /**
   * Property handleClasses
   * @readonly
   *
   * @description
   * Drag handle classes.
   *
   * @type {string}
   */
  protected readonly handleClasses: string = HANDLE;

  /**
   * Property fieldClasses
   * @readonly
   *
   * @description
   * Inline editing field classes.
   *
   * @type {string}
   */
  protected readonly fieldClasses: string = FIELD;

  /**
   * Property revealClasses
   * @readonly
   *
   * @description
   * Action reveal classes.
   *
   * @type {string}
   */
  protected readonly revealClasses: string = REVEAL;

  /**
   * Property linkClasses
   * @readonly
   *
   * @description
   * Subtask link classes.
   *
   * @type {string}
   */
  protected readonly linkClasses: string = LINK;

  /**
   * Property nested
   * @readonly
   *
   * @description
   * Whether this item has a parent.
   *
   * @type {boolean}
   */
  protected readonly nested: boolean = !!this.parent;

  /**
   * Property dragging
   * @readonly
   *
   * @description
   * Whether pointer dragging is active.
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly dragging: WritableSignal<boolean> = signal(false);

  /**
   * Property adding
   * @readonly
   *
   * @description
   * Whether the child entry field is open.
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly adding: WritableSignal<boolean> = signal(false);

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Variant supplied by the checklist.
   *
   * @type {Signal<CwChecklistVariant>}
   */
  protected readonly variant: Signal<CwChecklistVariant> = this.checklist.variant;

  /**
   * Property convertible
   * @readonly
   *
   * @description
   * Whether the checklist allows conversion.
   *
   * @type {Signal<boolean>}
   */
  protected readonly convertible: Signal<boolean> = this.checklist.convertible;

  /**
   * Property grabbed
   * @readonly
   *
   * @description
   * Whether the item is grabbed by keyboard.
   *
   * @type {Signal<boolean>}
   */
  protected readonly grabbed: Signal<boolean> = computed(
    () => this.checklist.grabbedId() === this.itemId(),
  );

  /**
   * Property editable
   * @readonly
   *
   * @description
   * Whether this item can be edited.
   *
   * @type {Signal<boolean>}
   */
  protected readonly editable: Signal<boolean> = computed(
    () => !this.checklist.readonly() && !this.disabled(),
  );

  /**
   * Property canDrag
   * @readonly
   *
   * @description
   * Whether this item may be dragged.
   *
   * @type {Signal<boolean>}
   */
  protected readonly canDrag: Signal<boolean> = computed(
    () => this.editable() && this.checklist.sortable(),
  );

  /**
   * Property hasCustomMenu
   * @readonly
   *
   * @description
   * Whether a custom item menu is projected.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hasCustomMenu: Signal<boolean> = computed(() => !!this.customMenu());

  /**
   * Property dueText
   * @readonly
   *
   * @description
   * Formatted due date or an empty string.
   *
   * @type {Signal<string>}
   */
  protected readonly dueText: Signal<string> = computed(() => {
    const due: Date | null = this.due();
    return due ? DUE.format(due) : '';
  });

  /**
   * Property hidden
   * @readonly
   *
   * @description
   * Whether the completed item is hidden.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hidden: Signal<boolean> = computed(
    () => this.checklist.hideCompleted() && this.checked() && !this.editing(),
  );

  /**
   * Property showGroup
   * @readonly
   *
   * @description
   * Whether child items or child entry are shown.
   *
   * @type {Signal<boolean>}
   */
  protected readonly showGroup: Signal<boolean> = computed(
    () => this.subItems().length > 0 || this.adding(),
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Configures pointer dragging and focuses externally opened editing fields.
   */
  public constructor() {
    // The CDK drag is a host directive: only first-level items sort with the pointer, and only by
    // their handle (sheet, "Glissé"); sub-items move with the keyboard.
    this.drag.lockAxis = 'y';
    effect(() => {
      this.drag.data = this.itemId();
      this.drag.disabled = !this.canDrag() || this.nested;
    });
    const started: Subscription = this.drag.started.subscribe(() => {
      this.dragging.set(true);
    });
    const ended: Subscription = this.drag.ended.subscribe(() => {
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
  // #endregion

  // #region Methods
  /**
   * Method focusHandle
   * @method focusHandle
   *
   * @description
   * Moves focus to the drag handle after rendering.
   */
  public focusHandle(): void {
    this.focusAfterRender(() => this.handle()?.nativeElement, false);
  }

  /**
   * Method setChecked
   * @method setChecked
   *
   * @description
   * Updates the checked model.
   *
   * @param {boolean} checked - New checked state.
   */
  protected setChecked(checked: boolean): void {
    this.checked.set(checked);
  }

  /**
   * Method onClick
   * @method onClick
   *
   * @description
   * Starts editing when the item label is clicked.
   *
   * @param {MouseEvent} event - Click event on the item label.
   */
  protected onClick(event: MouseEvent): void {
    const target: HTMLElement | null = event.target as HTMLElement | null;
    if (target?.closest('[data-cw-checklist-label]')) this.startEdit();
  }

  /**
   * Method onBoxKeydown
   * @method onBoxKeydown
   *
   * @description
   * Starts editing when F2 is pressed on the checkbox.
   *
   * @param {KeyboardEvent} event - Keyboard event from the checkbox.
   */
  protected onBoxKeydown(event: KeyboardEvent): void {
    if (event.key !== 'F2') return;
    event.preventDefault();
    this.startEdit();
  }

  /**
   * Method onHandleKeydown
   * @method onHandleKeydown
   *
   * @description
   * Delegates keyboard movement to the checklist.
   *
   * @param {KeyboardEvent} event - Keyboard event from the movement handle.
   */
  protected onHandleKeydown(event: KeyboardEvent): void {
    this.checklist.handleKey(this, event);
  }

  /**
   * Method onHandleBlur
   * @method onHandleBlur
   *
   * @description
   * Ends a keyboard grab when focus leaves the handle.
   */
  protected onHandleBlur(): void {
    this.checklist.releaseGrab(this);
  }

  /**
   * Method startEdit
   * @method startEdit
   *
   * @description
   * Opens label editing when permitted.
   */
  protected startEdit(): void {
    if (!this.editable()) return;
    this.draft = this.label();
    this.editing.set(true);
  }

  /**
   * Method onFieldInput
   * @method onFieldInput
   *
   * @description
   * Updates the label editing draft.
   *
   * @param {Event} event - Input event from the label field.
   */
  protected onFieldInput(event: Event): void {
    this.draft = (event.target as HTMLInputElement).value;
  }

  /**
   * Method onFieldKeydown
   * @method onFieldKeydown
   *
   * @description
   * Handles validation, cancellation and nesting while editing.
   *
   * @param {KeyboardEvent} event - Keyboard event from the label field.
   */
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
        const moved: boolean = event.shiftKey
          ? this.checklist.unnest(this)
          : this.checklist.nest(this);
        if (!moved) return;
        event.preventDefault();
        this.closing = true;
        this.commit(false);
        return;
      }
    }
  }

  /**
   * Method onFieldBlur
   * @method onFieldBlur
   *
   * @description
   * Commits editing when focus leaves the field.
   */
  protected onFieldBlur(): void {
    if (this.closing) {
      this.closing = false;
      return;
    }
    if (this.editing()) this.commit(false);
  }

  /**
   * Method startAddChild
   * @method startAddChild
   *
   * @description
   * Opens the child-item entry field.
   */
  protected startAddChild(): void {
    this.adding.set(true);
    this.focusAfterRender(() => this.addField()?.nativeElement, false);
  }

  /**
   * Method onAddKeydown
   * @method onAddKeydown
   *
   * @description
   * Adds a child on Enter or closes the field on Escape.
   *
   * @param {KeyboardEvent} event - Keyboard event from the child-entry field.
   */
  protected onAddKeydown(event: KeyboardEvent): void {
    const field: HTMLInputElement = event.target as HTMLInputElement;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.adding.set(false);
      this.focusBox();
      return;
    }
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    const label: string = field.value.trim();
    if (!label) return;
    // The field stays open to chain the next sub-item (sheet, "Règles").
    this.checklist.add({ label, parentId: this.itemId() });
    field.value = '';
  }

  /**
   * Method onAddBlur
   * @method onAddBlur
   *
   * @description
   * Closes an empty child-entry field on blur.
   *
   * @param {FocusEvent} event - Focus event from the child-entry field.
   */
  protected onAddBlur(event: FocusEvent): void {
    if ((event.target as HTMLInputElement).value.trim() === '') this.adding.set(false);
  }

  /**
   * Method convert
   * @method convert
   *
   * @description
   * Requests item conversion.
   */
  protected convert(): void {
    this.checklist.convert(this.itemId());
  }

  /**
   * Method remove
   * @method remove
   *
   * @description
   * Requests item removal.
   */
  protected remove(): void {
    this.checklist.remove(this.itemId());
  }

  /**
   * Method commit
   * @method commit
   *
   * @description
   * Saves a nonempty draft and closes editing.
   *
   * @param {boolean} restoreFocus - Whether to restore focus after editing.
   */
  private commit(restoreFocus: boolean): void {
    const label: string = this.draft.trim();
    this.editing.set(false);
    if (label !== '' && label !== this.label()) this.label.set(label);
    if (restoreFocus) this.focusBox();
  }

  /**
   * Method focusBox
   * @method focusBox
   *
   * @description
   * Focuses the item checkbox.
   */
  private focusBox(): void {
    afterNextRender(() => this.box()?.focus(), { injector: this.injector });
  }

  /**
   * Method focusAfterRender
   * @method focusAfterRender
   *
   * @description
   * Focuses and optionally selects an element after rendering.
   *
   * @param {() => HTMLElement | undefined} element - Function returning the element to focus after rendering.
   * @param {boolean} select - Whether to select the element's text.
   */
  private focusAfterRender(element: () => HTMLElement | undefined, select: boolean): void {
    afterNextRender(
      () => {
        const target: HTMLElement | undefined = element();
        if (!target) return;
        target.focus();
        if (select && target instanceof HTMLInputElement) target.select();
      },
      { injector: this.injector },
    );
  }
  // #endregion
}
