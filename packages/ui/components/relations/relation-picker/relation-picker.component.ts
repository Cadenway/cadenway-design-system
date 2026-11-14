import {
  Component,
  Injector,
  type TemplateRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import { CwCombobox, CwComboboxOption } from '@cadenway/ui/components/combobox';
import { CwSelect, CwSelectOption } from '@cadenway/ui/components/select';

import { CwRelationLeading } from '../relation-leading/relation-leading.directive';
import { CW_RELATIONS_LABELS } from '../relations.constants';
import type {
  CwRelationAddEvent,
  CwRelationItem,
  CwRelationLeadingContext,
  CwRelationType,
  CwRelationsLabels,
} from '../relations.types';

/**
 * Component CwRelationPicker
 *
 * @description
 * The picker that adds a relation: the relation type, then a search among the consumer's items (Relations sheet of the Design System artifact). `cw-relations` opens it in a popover under « Ajouter »; it also works alone. The « Type » row is a small `cw-select` of `types` (`defaultType`, else the first one, at the start). The search is a `cw-combobox`: its panel holds the search field (« Nom ou identifiant »), the results (`results`, with the `cwRelationLeading` glyph, the reference, the title and the path), the result count announced, ↑ ↓ and Enter; it emits `search` at each keystroke for the consumer's search, and `loading` shows the spinner. An item of `linkedIds` is disabled with « Déjà liée ». Choosing a result emits `add` with the type and the item, announces « Relation ajoutée : Bloque CAD-482 » and clears the search.
 */
@Component({
  selector: 'cw-relation-picker',
  imports: [NgTemplateOutlet, CwCombobox, CwComboboxOption, CwSelect, CwSelectOption],
  host: { class: 'flex min-w-0 flex-col gap-2' },
  templateUrl: './relation-picker.component.html',
})
export class CwRelationPicker {
  // #region Properties
  /**
   * Property types
   *
   * @description
   * The relation types to choose from, in order.
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
   * The type chosen at the start; the first of `types` when not given.
   *
   * @type {InputSignal<string | null>}
   * @readonly
   */
  public readonly defaultType: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property results
   *
   * @description
   * The items to choose from: the consumer's results for the current search.
   *
   * @type {InputSignal<readonly CwRelationItem[]>}
   * @readonly
   */
  public readonly results: InputSignal<readonly CwRelationItem[]> = input<
    readonly CwRelationItem[]
  >([]);

  /**
   * Property linkedIds
   *
   * @description
   * Ids of the items already related: listed, disabled, « Déjà liée ».
   *
   * @type {InputSignal<readonly string[]>}
   * @readonly
   */
  public readonly linkedIds: InputSignal<readonly string[]> = input<readonly string[]>([]);

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
   * Property leading
   *
   * @description
   * Glyph template of the results; a projected `ng-template[cwRelationLeading]` otherwise.
   *
   * @type {InputSignal<TemplateRef<CwRelationLeadingContext> | null>}
   * @readonly
   */
  public readonly leading: InputSignal<TemplateRef<CwRelationLeadingContext> | null> =
    input<TemplateRef<CwRelationLeadingContext> | null>(null);

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
   * Property search
   *
   * @description
   * Emits the search at each keystroke.
   *
   * @type {OutputEmitterRef<string>}
   * @readonly
   */
  public readonly search: OutputEmitterRef<string> = output<string>();

  /**
   * Property add
   *
   * @description
   * Emits the chosen type and item.
   *
   * @type {OutputEmitterRef<CwRelationAddEvent>}
   * @readonly
   */
  public readonly add: OutputEmitterRef<CwRelationAddEvent> = output<CwRelationAddEvent>();

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
   * Property typeId
   *
   * @description
   * Unique identifier for the relation-type field.
   *
   * @type {string}
   * @readonly
   */
  protected readonly typeId: string = inject(_IdGenerator).getId('cw-relation-picker-type-');

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
   * Property type
   *
   * @description
   * Currently selected relation type identifier.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  protected readonly type: WritableSignal<string | null> = linkedSignal<string | null>(
    () => this.defaultType() ?? this.types().at(0)?.id ?? null,
  );

  /**
   * Property chosen
   *
   * @description
   * Current combobox choice, cleared after selection.
   *
   * @type {WritableSignal<CwRelationItem | null>}
   * @readonly
   */
  protected readonly chosen: WritableSignal<CwRelationItem | null> = signal<CwRelationItem | null>(
    null,
  );

  /**
   * Property leadingTemplate
   *
   * @description
   * Explicit or projected template used before result content.
   *
   * @type {Signal<TemplateRef<CwRelationLeadingContext> | null>}
   * @readonly
   */
  protected readonly leadingTemplate: Signal<TemplateRef<CwRelationLeadingContext> | null> =
    computed(() => this.leading() ?? this.projectedLeading()?.template ?? null);

  /**
   * Property keywords
   *
   * @description
   * Extracts reference and path for result search.
   *
   * @type {(item: CwRelationItem) => readonly string[]}
   * @readonly
   */
  protected readonly keywords: (item: CwRelationItem) => readonly string[] = (
    item: CwRelationItem,
  ): readonly string[] => [item.reference, item.path].filter((word): word is string => !!word);
  // #endregion

  // #region Methods
  /**
   * Method isLinked
   *
   * @description
   * Checks whether an item is already linked.
   *
   * @param {CwRelationItem} item - Related item involved in the interaction.
   * @returns {boolean} Whether the item is already linked.
   */
  protected isLinked(item: CwRelationItem): boolean {
    return this.linkedIds().includes(item.id);
  }

  /**
   * Method onChoose
   *
   * @description
   * Reports the selected relation and clears the picker choice.
   *
   * @param {unknown} item - Related item involved in the interaction.
   */
  protected onChoose(item: unknown): void {
    const type: string | null = this.type();
    if (!item || type === null) return;
    const chosen: CwRelationItem = item as CwRelationItem;
    this.chosen.set(chosen);
    this.add.emit({ type, item: chosen });
    const label: string = this.types().find((candidate) => candidate.id === type)?.label ?? type;
    void this.announcer.announce(
      this.text().added(label, chosen.reference ?? chosen.title),
      'polite',
    );
    // The combobox is a chooser, not a field: it returns to its placeholder for the next search,
    // once it has taken the choice.
    afterNextRender(
      () => {
        this.chosen.set(null);
      },
      { injector: this.injector },
    );
  }
  // #endregion
}
