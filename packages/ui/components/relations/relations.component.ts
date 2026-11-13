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
} from './relations.types';

/* Literal class strings (Relations sheet and preview of the Design System artifact). The whole row
   is clickable through the title's `after:absolute after:inset-0`; the row draws the focus ring of
   its title; the menu stays above the stretched title (`relative z-10`). */
const ROW =
  'group/rel relative flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-accent has-[[aria-expanded=true]]:bg-selected has-[[data-cw-relation-open]:focus-visible]:ring-2 has-[[data-cw-relation-open]:focus-visible]:ring-inset has-[[data-cw-relation-open]:focus-visible]:ring-ring motion-reduce:transition-none';

const TITLE =
  "min-w-0 truncate text-left outline-none after:absolute after:inset-0 after:content-['']";

const REVEAL =
  'relative z-10 flex shrink-0 opacity-0 transition-opacity group-hover/rel:opacity-100 group-focus-within/rel:opacity-100 has-[[aria-expanded=true]]:opacity-100 motion-reduce:transition-none';

const EMPTY_ADD =
  'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none';

/** The relations of one type, as a group renders them. */
interface Group {
  readonly type: CwRelationType;
  readonly titleId: string;
  readonly relations: readonly CwRelation[];
}

/**
 * The links of an item with other items, grouped by relation type: parent, blocked by, blocks,
 * related, duplicate of… (Relations sheet of the Design System artifact). The relation types are
 * the consumer's (`types`, in display order); a group without relation is not shown.
 *
 * The header holds the title (« Relations »), the count and « Ajouter », which opens a
 * `cw-relation-picker` in a popover. Each row shows the consumer's `cwRelationLeading` glyph (a
 * named status icon), the reference in mono, the title (a link to `href`, else a button) that makes
 * the whole row clickable and emits `open`, the item's path when it lives elsewhere, the relation's
 * `warning` (« Non terminée ») with a warning icon, the assignee, and a menu revealed on hover and
 * focus: Ouvrir la tâche, Changer le type (a submenu of `types`), Copier le lien (with `href`),
 * Retirer la relation. On a focused title, Delete removes the relation and Shift + F10 or the Menu
 * key opens its menu. Without relation: « Aucune relation. » and « Ajouter une relation ».
 *
 * The consumer owns the data: `add`, `remove`, `changeType` and `open` report the action; `search`
 * forwards the picker's search, answered through `results` and `loading`. `readonly` removes the
 * addition and the menus. Style hooks on the rows: `data-type`, `data-blocking` (a warning),
 * `data-external` (a path).
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
  /** The relations of the item. */
  readonly relations = input<readonly CwRelation[]>([]);
  /** The relation types, in display order: the groups and the picker's choices. */
  readonly types = input.required<readonly CwRelationType[]>();
  /** The type the picker proposes at opening; the first of `types` when not given. */
  readonly defaultType = input<string | null>(null);
  /** The picker's results for the current search. */
  readonly results = input<readonly CwRelationItem[]>([]);
  /** The consumer's search is running. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** No addition and no menu. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** French texts, any of them overridden (`CW_RELATIONS_LABELS`). */
  readonly labels = input<Partial<CwRelationsLabels>>({});
  /** Emits the chosen type and item of the picker. */
  readonly add = output<CwRelationAddEvent>();
  /** Emits the relation to remove. */
  readonly remove = output<CwRelation>();
  /** Emits a relation and its new type. */
  readonly changeType = output<CwRelationChangeTypeEvent>();
  /** Emits the related item to open: a click or Enter on its row, or « Ouvrir la tâche ». */
  readonly open = output<CwRelationItem>();
  /** Emits the picker's search at each keystroke. */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly search = output<string>();

  private readonly announcer = inject(LiveAnnouncer);
  private readonly clipboard = inject(Clipboard);
  private readonly document = inject(DOCUMENT);
  private readonly ids = inject(_IdGenerator);
  private readonly projectedLeading = contentChild(CwRelationLeading);
  private readonly picker = viewChild<CwPopover>('picker');
  private readonly groupIds = new Map<string, string>();

  protected readonly rowClasses = ROW;
  protected readonly titleClasses = TITLE;
  protected readonly revealClasses = REVEAL;
  protected readonly emptyAddClasses = EMPTY_ADD;
  protected readonly text = computed(() => ({ ...CW_RELATIONS_LABELS, ...this.labels() }));
  protected readonly leading = computed(() => this.projectedLeading()?.template ?? null);
  protected readonly groups = computed<readonly Group[]>(() =>
    this.types()
      .map((type) => ({
        type,
        titleId: this.groupId(type.id),
        relations: this.relations().filter((relation) => relation.type === type.id),
      }))
      .filter((group) => group.relations.length > 0),
  );
  protected readonly count = computed(() =>
    this.groups().reduce((sum, group) => sum + group.relations.length, 0),
  );
  protected readonly linkedIds = computed(() =>
    this.relations().map((relation) => relation.item.id),
  );

  protected onAdd(event: CwRelationAddEvent): void {
    this.add.emit(event);
    this.picker()?.open.set(false);
  }

  protected onOpen(item: CwRelationItem, event?: Event): void {
    // A link keeps its native navigation; a title without address is a button.
    if (!item.href) event?.preventDefault();
    this.open.emit(item);
  }

  protected onTitleKeydown(event: KeyboardEvent, relation: CwRelation): void {
    if (this.readonly()) return;
    if (event.key === 'Delete') {
      event.preventDefault();
      this.removeRelation(relation);
      return;
    }
    if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
      event.preventDefault();
      const row = (event.target as HTMLElement).closest('li');
      row?.querySelector<HTMLButtonElement>('[data-cw-relation-menu]')?.click();
    }
  }

  protected removeRelation(relation: CwRelation): void {
    this.remove.emit(relation);
    void this.announcer.announce(this.text().removed, 'polite');
  }

  protected retype(relation: CwRelation, type: string): void {
    if (type !== relation.type) this.changeType.emit({ relation, type });
  }

  protected copy(item: CwRelationItem): void {
    if (item.href) this.clipboard.copy(new URL(item.href, this.document.baseURI).href);
  }

  private groupId(type: string): string {
    let id = this.groupIds.get(type);
    if (!id) {
      id = this.ids.getId('cw-relations-group-');
      this.groupIds.set(type, id);
    }
    return id;
  }
}
