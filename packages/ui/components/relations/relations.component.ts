import {
  Component,
  DOCUMENT,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  output,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgTemplateOutlet } from '@angular/common';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwButton } from '@cadenway/ui/components/button';
import {
  CwMenu,
  CwMenuItem,
  CwMenuSeparator,
  CwMenuTriggerFor,
} from '@cadenway/ui/components/menu';
import { CwPopover, CwPopoverTrigger } from '@cadenway/ui/components/popover';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowSquareOutBold,
  phosphorArrowsLeftRightBold,
  phosphorDotsThreeBold,
  phosphorLinkSimpleBold,
  phosphorPlusBold,
  phosphorXBold,
} from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningFill } from '@ng-icons/phosphor-icons/fill';

import { CwRelationLeading } from './relation-leading/relation-leading.directive';
import { CwRelationPicker } from './relation-picker/relation-picker.component';
import { CW_RELATIONS_LABELS } from './relations.constants';
import type {
  CwRelation,
  CwRelationAddEvent,
  CwRelationChangeTypeEvent,
  CwRelationItem,
  CwRelationType,
  CwRelationsLabels,
  CwRelationLeadingContext,
} from './relations.types';

/* Literal class strings (Relations sheet and preview of the Design System artifact). The whole row
   is clickable through the title's `after:absolute after:inset-0`; the row draws the focus ring of
   its title; the menu stays above the stretched title (`relative z-10`). */
/**
 * Constant ROW
 *
 * @description
 * Classes for a relation row and its stretched title link.
 *
 * @type {string}
 */
const ROW: string =
  'group/rel relative flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-accent has-[[aria-expanded=true]]:bg-selected has-[[data-cw-relation-open]:focus-visible]:ring-2 has-[[data-cw-relation-open]:focus-visible]:ring-inset has-[[data-cw-relation-open]:focus-visible]:ring-ring motion-reduce:transition-none';

/**
 * Constant TITLE
 *
 * @description
 * Classes for the title that makes the row clickable.
 *
 * @type {string}
 */
const TITLE: string =
  "min-w-0 truncate text-left outline-none after:absolute after:inset-0 after:content-['']";

/**
 * Constant REVEAL
 *
 * @description
 * Classes revealing row actions on hover or focus.
 *
 * @type {string}
 */
const REVEAL: string =
  'relative z-10 flex shrink-0 opacity-0 transition-opacity group-hover/rel:opacity-100 group-focus-within/rel:opacity-100 has-[[aria-expanded=true]]:opacity-100 motion-reduce:transition-none';

/**
 * Constant EMPTY_ADD
 *
 * @description
 * Classes for the add control in an empty relation list.
 *
 * @type {string}
 */
const EMPTY_ADD: string =
  'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none';

/**
 * Interface Group
 *
 * @description
 * The relations of one type, as a group renders them.
 */
interface Group {
  // #region Properties
  /**
   * Property type
   *
   * @description
   * Relation type represented by the group.
   *
   * @type {CwRelationType}
   * @readonly
   */
  readonly type: CwRelationType;

  /**
   * Property titleId
   *
   * @description
   * Identifier used to label the group.
   *
   * @type {string}
   * @readonly
   */
  readonly titleId: string;

  /**
   * Property relations
   *
   * @description
   * Relations displayed in the group.
   *
   * @type {readonly CwRelation[]}
   * @readonly
   */
  readonly relations: readonly CwRelation[];
  // #endregion
}

/**
 * Component CwRelations
 *
 * @description
 * The links of an item with other items, grouped by relation type: parent, blocked by, blocks, related, duplicate of… (Relations sheet of the Design System artifact). The relation types are the consumer's (`types`, in display order); a group without relation is not shown. The header holds the title (« Relations »), the count and « Ajouter », which opens a `cw-relation-picker` in a popover. Each row shows the consumer's `cwRelationLeading` glyph (a named status icon), the reference in mono, the title (a link to `href`, else a button) that makes the whole row clickable and emits `open`, the item's path when it lives elsewhere, the relation's `warning` (« Non terminée ») with a warning icon, the assignee, and a menu revealed on hover and focus: Ouvrir la tâche, Changer le type (a submenu of `types`), Copier le lien (with `href`), Retirer la relation. On a focused title, Delete removes the relation and Shift + F10 or the Menu key opens its menu. Without relation: « Aucune relation. » and « Ajouter une relation ». The consumer owns the data: `add`, `remove`, `changeType` and `open` report the action; `search` forwards the picker's search, answered through `results` and `loading`. `readonly` removes the addition and the menus. Style hooks on the rows: `data-type`, `data-blocking` (a warning), `data-external` (a path).
 */
@Component({
  selector: 'cw-relations',
  imports: [
    NgIcon,
    NgTemplateOutlet,
    CwAvatar,
    CwButton,
    CwMenu,
    CwMenuItem,
    CwMenuSeparator,
    CwMenuTriggerFor,
    CwPopover,
    CwPopoverTrigger,
    CwRelationPicker,
  ],
  providers: [
    provideIcons({
      phosphorArrowSquareOutBold,
      phosphorArrowsLeftRightBold,
      phosphorDotsThreeBold,
      phosphorLinkSimpleBold,
      phosphorPlusBold,
      phosphorWarningFill,
      phosphorXBold,
    }),
  ],
  host: { class: 'block min-w-0' },
  templateUrl: './relations.component.html',
})
export class CwRelations {
  // #region Properties
  /**
   * Property relations
   *
   * @description
   * The relations of the item.
   *
   * @type {InputSignal<readonly CwRelation[]>}
   * @readonly
   */
  public readonly relations: InputSignal<readonly CwRelation[]> = input<readonly CwRelation[]>([]);

  /**
   * Property types
   *
   * @description
   * The relation types, in display order: the groups and the picker's choices.
   *
   * @type {InputSignal<readonly CwRelationType[]>}
   * @readonly
   */
  public readonly types: InputSignal<readonly CwRelationType[]> =
    input.required<readonly CwRelationType[]>();

  /**
   * Property defaultType
   *
   * @description
   * The type the picker proposes at opening; the first of `types` when not given.
   *
   * @type {InputSignal<string | null>}
   * @readonly
   */
  public readonly defaultType: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property results
   *
   * @description
   * The picker's results for the current search.
   *
   * @type {InputSignal<readonly CwRelationItem[]>}
   * @readonly
   */
  public readonly results: InputSignal<readonly CwRelationItem[]> = input<
    readonly CwRelationItem[]
  >([]);

  /**
   * Property loading
   *
   * @description
   * The consumer's search is running.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property readonly
   *
   * @description
   * No addition and no menu.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property labels
   *
   * @description
   * French texts, any of them overridden (`CW_RELATIONS_LABELS`).
   *
   * @type {InputSignal<Partial<CwRelationsLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwRelationsLabels>> = input<
    Partial<CwRelationsLabels>
  >({});

  /**
   * Property add
   *
   * @description
   * Emits the chosen type and item of the picker.
   *
   * @type {OutputEmitterRef<CwRelationAddEvent>}
   * @readonly
   */
  public readonly add: OutputEmitterRef<CwRelationAddEvent> = output<CwRelationAddEvent>();

  /**
   * Property remove
   *
   * @description
   * Emits the relation to remove.
   *
   * @type {OutputEmitterRef<CwRelation>}
   * @readonly
   */
  public readonly remove: OutputEmitterRef<CwRelation> = output<CwRelation>();

  /**
   * Property changeType
   *
   * @description
   * Emits a relation and its new type.
   *
   * @type {OutputEmitterRef<CwRelationChangeTypeEvent>}
   * @readonly
   */
  public readonly changeType: OutputEmitterRef<CwRelationChangeTypeEvent> =
    output<CwRelationChangeTypeEvent>();

  /**
   * Property open
   *
   * @description
   * Emits the related item to open: a click or Enter on its row, or « Ouvrir la tâche ».
   *
   * @type {OutputEmitterRef<CwRelationItem>}
   * @readonly
   */
  public readonly open: OutputEmitterRef<CwRelationItem> = output<CwRelationItem>();

  /**
   * Property search
   *
   * @description
   * Emits the picker's search at each keystroke.
   *
   * @type {OutputEmitterRef<string>}
   * @readonly
   */
  public readonly search: OutputEmitterRef<string> = output<string>();

  /**
   * Property announcer
   *
   * @description
   * Live announcer for relation changes.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property clipboard
   *
   * @description
   * Clipboard service used to copy related-item links.
   *
   * @type {Clipboard}
   * @readonly
   */
  private readonly clipboard: Clipboard = inject(Clipboard);

  /**
   * Property document
   *
   * @description
   * Document providing the base URL for copied links.
   *
   * @type {Document}
   * @readonly
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property ids
   *
   * @description
   * Identifier generator for group headings.
   *
   * @type {_IdGenerator}
   * @readonly
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property projectedLeading
   *
   * @description
   * Optional consumer-projected leading template.
   *
   * @type {Signal<CwRelationLeading | undefined>}
   * @readonly
   */
  private readonly projectedLeading: Signal<CwRelationLeading | undefined> =
    contentChild(CwRelationLeading);

  /**
   * Property picker
   *
   * @description
   * Popover containing the relation picker.
   *
   * @type {Signal<CwPopover | undefined>}
   * @readonly
   */
  private readonly picker: Signal<CwPopover | undefined> = viewChild<CwPopover>('picker');

  /**
   * Property groupIds
   *
   * @description
   * Stable heading identifiers indexed by relation type.
   *
   * @type {Map<string, string>}
   * @readonly
   */
  private readonly groupIds: Map<string, string> = new Map<string, string>();

  /**
   * Property rowClasses
   *
   * @description
   * Classes applied to each relation row.
   *
   * @type {string}
   * @readonly
   */
  protected readonly rowClasses: string = ROW;

  /**
   * Property titleClasses
   *
   * @description
   * Classes applied to relation titles.
   *
   * @type {string}
   * @readonly
   */
  protected readonly titleClasses: string = TITLE;

  /**
   * Property revealClasses
   *
   * @description
   * Classes applied to hover and focus actions.
   *
   * @type {string}
   * @readonly
   */
  protected readonly revealClasses: string = REVEAL;

  /**
   * Property emptyAddClasses
   *
   * @description
   * Classes for the empty-state add control.
   *
   * @type {string}
   * @readonly
   */
  protected readonly emptyAddClasses: string = EMPTY_ADD;

  /**
   * Property text
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<{ title: string; add: string; addRelation: string; empty: string; actions: (reference: string) => string; open: string; changeType: string; copyLink: string; remove: string; removed: string; added: (type: string, reference: string) => string; picker: string; type: string; search: string; searchPlaceholder: string; alreadyLinked: string; noResult: string; }>}
   * @readonly
   */
  protected readonly text: Signal<{
    title: string;
    add: string;
    addRelation: string;
    empty: string;
    actions: (reference: string) => string;
    open: string;
    changeType: string;
    copyLink: string;
    remove: string;
    removed: string;
    added: (type: string, reference: string) => string;
    picker: string;
    type: string;
    search: string;
    searchPlaceholder: string;
    alreadyLinked: string;
    noResult: string;
  }> = computed(() => ({ ...CW_RELATIONS_LABELS, ...this.labels() }));

  /**
   * Property leading
   *
   * @description
   * Projected template rendered before each related item.
   *
   * @type {Signal<TemplateRef<CwRelationLeadingContext> | null>}
   * @readonly
   */
  protected readonly leading: Signal<TemplateRef<CwRelationLeadingContext> | null> = computed(
    () => this.projectedLeading()?.template ?? null,
  );

  /**
   * Property groups
   *
   * @description
   * Nonempty relation groups in consumer-provided type order.
   *
   * @type {Signal<readonly Group[]>}
   * @readonly
   */
  protected readonly groups: Signal<readonly Group[]> = computed<readonly Group[]>(() =>
    this.types()
      .map((type) => ({
        type,
        titleId: this.groupId(type.id),
        relations: this.relations().filter((relation) => relation.type === type.id),
      }))
      .filter((group) => group.relations.length > 0),
  );

  /**
   * Property count
   *
   * @description
   * Total number of displayed relations.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly count: Signal<number> = computed(() =>
    this.groups().reduce((sum, group) => sum + group.relations.length, 0),
  );

  /**
   * Property linkedIds
   *
   * @description
   * Identifiers of items already linked.
   *
   * @type {Signal<string[]>}
   * @readonly
   */
  protected readonly linkedIds: Signal<string[]> = computed(() =>
    this.relations().map((relation) => relation.item.id),
  );
  // #endregion

  // #region Methods
  /**
   * Method onAdd
   *
   * @description
   * Reports a new relation and closes the picker.
   *
   * @param {CwRelationAddEvent} event - Event associated with the interaction.
   */
  protected onAdd(event: CwRelationAddEvent): void {
    this.add.emit(event);
    this.picker()?.open.set(false);
  }

  /**
   * Method onOpen
   *
   * @description
   * Reports an item opening while preserving native link behavior.
   *
   * @param {CwRelationItem} item - Related item involved in the interaction.
   * @param {Event} event - Event associated with the interaction.
   */
  protected onOpen(item: CwRelationItem, event?: Event): void {
    // A link keeps its native navigation; a title without address is a button.
    if (!item.href) event?.preventDefault();
    this.open.emit(item);
  }

  /**
   * Method onTitleKeydown
   *
   * @description
   * Handles deletion and context-menu shortcuts on a relation title.
   *
   * @param {KeyboardEvent} event - Event associated with the interaction.
   * @param {CwRelation} relation - Relation involved in the interaction.
   */
  protected onTitleKeydown(event: KeyboardEvent, relation: CwRelation): void {
    if (this.readonly()) return;
    if (event.key === 'Delete') {
      event.preventDefault();
      this.removeRelation(relation);
      return;
    }
    if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
      event.preventDefault();
      const row: HTMLLIElement | null = (event.target as HTMLElement).closest('li');
      row?.querySelector<HTMLButtonElement>('[data-cw-relation-menu]')?.click();
    }
  }

  /**
   * Method removeRelation
   *
   * @description
   * Reports removal and announces the change.
   *
   * @param {CwRelation} relation - Relation involved in the interaction.
   */
  protected removeRelation(relation: CwRelation): void {
    this.remove.emit(relation);
    void this.announcer.announce(this.text().removed, 'polite');
  }

  /**
   * Method retype
   *
   * @description
   * Reports a changed relation type when it differs.
   *
   * @param {CwRelation} relation - Relation involved in the interaction.
   * @param {string} type - Identifier of the relation type.
   */
  protected retype(relation: CwRelation, type: string): void {
    if (type !== relation.type) this.changeType.emit({ relation, type });
  }

  /**
   * Method copy
   *
   * @description
   * Copies the absolute item link when an address is available.
   *
   * @param {CwRelationItem} item - Related item involved in the interaction.
   */
  protected copy(item: CwRelationItem): void {
    if (item.href) this.clipboard.copy(new URL(item.href, this.document.baseURI).href);
  }

  /**
   * Method groupId
   *
   * @description
   * Returns a stable heading identifier for a relation type.
   *
   * @param {string} type - Identifier of the relation type.
   * @returns {string} Stable heading identifier for the type.
   */
  private groupId(type: string): string {
    let id: string | undefined = this.groupIds.get(type);
    if (!id) {
      id = this.ids.getId('cw-relations-group-');
      this.groupIds.set(type, id);
    }
    return id;
  }
  // #endregion
}
