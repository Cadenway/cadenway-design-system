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
 * The picker that adds a relation: the relation type, then a search among the consumer's items
 * (Relations sheet of the Design System artifact). `cw-relations` opens it in a popover under
 * « Ajouter »; it also works alone.
 *
 * The « Type » row is a small `cw-select` of `types` (`defaultType`, else the first one, at the
 * start). The search is a `cw-combobox`: its panel holds the search field (« Nom ou
 * identifiant »), the results (`results`, with the `cwRelationLeading` glyph, the reference, the
 * title and the path), the result count announced, ↑ ↓ and Enter; it emits `search` at each
 * keystroke for the consumer's search, and `loading` shows the spinner. An item of `linkedIds` is
 * disabled with « Déjà liée ». Choosing a result emits `add` with the type and the item, announces
 * « Relation ajoutée : Bloque CAD-482 » and clears the search.
 */
@Component({
  selector: 'cw-relation-picker',
  imports: [NgTemplateOutlet, CwCombobox, CwComboboxOption, CwSelect, CwSelectOption],
  host: { class: 'flex min-w-0 flex-col gap-2' },
  templateUrl: './relation-picker.component.html',
})
export class CwRelationPicker {
  /** The relation types to choose from, in order. */
  readonly types = input.required<readonly CwRelationType[]>();
  /** The type chosen at the start; the first of `types` when not given. */
  readonly defaultType = input<string | null>(null);
  /** The items to choose from: the consumer's results for the current search. */
  readonly results = input<readonly CwRelationItem[]>([]);
  /** Ids of the items already related: listed, disabled, « Déjà liée ». */
  readonly linkedIds = input<readonly string[]>([]);
  /** The consumer's search is running. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Glyph template of the results; a projected `ng-template[cwRelationLeading]` otherwise. */
  readonly leading = input<TemplateRef<CwRelationLeadingContext> | null>(null);
  /** French texts, any of them overridden (`CW_RELATIONS_LABELS`). */
  readonly labels = input<Partial<CwRelationsLabels>>({});
  /** Emits the search at each keystroke. */
  // The sheet's search goes through the picker; no native `search` event reaches this host.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly search = output<string>();
  /** Emits the chosen type and item. */
  readonly add = output<CwRelationAddEvent>();

  private readonly announcer = inject(LiveAnnouncer);
  private readonly injector = inject(Injector);
  private readonly projectedLeading = contentChild(CwRelationLeading);

  protected readonly typeId = inject(_IdGenerator).getId('cw-relation-picker-type-');
  protected readonly text = computed(() => ({ ...CW_RELATIONS_LABELS, ...this.labels() }));
  protected readonly type = linkedSignal<string | null>(
    () => this.defaultType() ?? this.types().at(0)?.id ?? null,
  );
  protected readonly chosen = signal<CwRelationItem | null>(null);
  protected readonly leadingTemplate = computed(
    () => this.leading() ?? this.projectedLeading()?.template ?? null,
  );
  protected readonly keywords = (item: CwRelationItem): readonly string[] =>
    [item.reference, item.path].filter((word): word is string => !!word);

  protected isLinked(item: CwRelationItem): boolean {
    return this.linkedIds().includes(item.id);
  }

  protected onChoose(item: unknown): void {
    const type = this.type();
    if (!item || type === null) return;
    const chosen = item as CwRelationItem;
    this.chosen.set(chosen);
    this.add.emit({ type, item: chosen });
    const label = this.types().find((candidate) => candidate.id === type)?.label ?? type;
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
}
