/** A kind of relation, given by the consumer in display order (« Bloquée par », « Liée à »). */
export interface CwRelationType {
  /** Key carried by the relations of this type and by the outputs. */
  readonly id: string;
  /** Group title and menu label (« Bloquée par »). */
  readonly label: string;
}

/** The person an item is assigned to, shown as a 20 px avatar. */
export interface CwRelationPerson {
  readonly name: string;
  readonly src?: string | null;
}

/** The other end of a relation, or a search result of the picker. */
export interface CwRelationItem {
  /** Identifies the item in the outputs and in `linkedIds`. */
  readonly id: string;
  /** Reference written before the title, in mono (« CAD-471 »). */
  readonly reference?: string | null;
  /** Title, the name of the row's link. */
  readonly title: string;
  /** Address of the item; without it, the title is a button that emits `open`. */
  readonly href?: string | null;
  /** Where the item lives when it is elsewhere (« Support › Tickets »): muted after the title. */
  readonly path?: string | null;
  readonly assignee?: CwRelationPerson | null;
}

/** One relation: its type, the related item, and an optional written warning. */
export interface CwRelation {
  /** Identifies the relation in `remove` and `changeType`. */
  readonly id: string;
  /** `id` of a `CwRelationType`. */
  readonly type: string;
  readonly item: CwRelationItem;
  /**
   * A warning written next to the title, with a warning icon (« Non terminée » on a blocking item
   * that is not done): the consumer decides when; the word carries the meaning.
   */
  readonly warning?: string | null;
}

/** Payload of `add`: the chosen type and item. */
export interface CwRelationAddEvent {
  readonly type: string;
  readonly item: CwRelationItem;
}

/** Payload of `changeType`: the relation and its new type. */
export interface CwRelationChangeTypeEvent {
  readonly relation: CwRelation;
  readonly type: string;
}

/** The context of a `cwRelationLeading` template: the item of the row or of the result. */
export interface CwRelationLeadingContext {
  readonly $implicit: CwRelationItem;
}

/** The French texts of `cw-relations` and `cw-relation-picker` (Relations sheet). */
export interface CwRelationsLabels {
  readonly title: string;
  readonly add: string;
  readonly addRelation: string;
  readonly empty: string;
  readonly actions: (reference: string) => string;
  readonly open: string;
  readonly changeType: string;
  readonly copyLink: string;
  readonly remove: string;
  readonly removed: string;
  readonly added: (type: string, reference: string) => string;
  readonly picker: string;
  readonly type: string;
  readonly search: string;
  readonly searchPlaceholder: string;
  readonly alreadyLinked: string;
  readonly noResult: string;
}
