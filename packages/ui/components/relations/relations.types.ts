/**
 * Interface CwRelationType
 *
 * @description
 * A kind of relation, given by the consumer in display order (« Bloquée par », « Liée à »).
 */
export interface CwRelationType {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Key carried by the relations of this type and by the outputs.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property label
   *
   * @description
   * Group title and menu label (« Bloquée par »).
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;
  // #endregion
}

/**
 * Interface CwRelationPerson
 *
 * @description
 * The person an item is assigned to, shown as a 20 px avatar.
 */
export interface CwRelationPerson {
  // #region Properties
  /**
   * Property name
   *
   * @description
   * Person name used for avatar initials and accessible text.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property src
   *
   * @description
   * Optional avatar image URL.
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly src?: string | null;
  // #endregion
}

/**
 * Interface CwRelationItem
 *
 * @description
 * The other end of a relation, or a search result of the picker.
 */
export interface CwRelationItem {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Identifies the item in the outputs and in `linkedIds`.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property reference
   *
   * @description
   * Reference written before the title, in mono (« CAD-471 »).
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly reference?: string | null;

  /**
   * Property title
   *
   * @description
   * Title, the name of the row's link.
   *
   * @type {string}
   * @readonly
   */
  readonly title: string;

  /**
   * Property href
   *
   * @description
   * Address of the item; without it, the title is a button that emits `open`.
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly href?: string | null;

  /**
   * Property path
   *
   * @description
   * Where the item lives when it is elsewhere (« Support › Tickets »): muted after the title.
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly path?: string | null;

  /**
   * Property assignee
   *
   * @description
   * Optional person assigned to the item.
   *
   * @type {CwRelationPerson | null | undefined}
   * @readonly
   */
  readonly assignee?: CwRelationPerson | null;
  // #endregion
}

/**
 * Interface CwRelation
 *
 * @description
 * One relation: its type, the related item, and an optional written warning.
 */
export interface CwRelation {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Identifies the relation in `remove` and `changeType`.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property type
   *
   * @description
   * `id` of a `CwRelationType`.
   *
   * @type {string}
   * @readonly
   */
  readonly type: string;

  /**
   * Property item
   *
   * @description
   * Related item displayed by this relation.
   *
   * @type {CwRelationItem}
   * @readonly
   */
  readonly item: CwRelationItem;

  /**
   * Property warning
   *
   * @description
   * A warning written next to the title, with a warning icon (« Non terminée » on a blocking item that is not done): the consumer decides when; the word carries the meaning.
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly warning?: string | null;
  // #endregion
}

/**
 * Interface CwRelationAddEvent
 *
 * @description
 * Payload of `add`: the chosen type and item.
 */
export interface CwRelationAddEvent {
  // #region Properties
  /**
   * Property type
   *
   * @description
   * Identifier of the selected relation type.
   *
   * @type {string}
   * @readonly
   */
  readonly type: string;

  /**
   * Property item
   *
   * @description
   * Item selected for the new relation.
   *
   * @type {CwRelationItem}
   * @readonly
   */
  readonly item: CwRelationItem;
  // #endregion
}

/**
 * Interface CwRelationChangeTypeEvent
 *
 * @description
 * Payload of `changeType`: the relation and its new type.
 */
export interface CwRelationChangeTypeEvent {
  // #region Properties
  /**
   * Property relation
   *
   * @description
   * Relation whose type changed.
   *
   * @type {CwRelation}
   * @readonly
   */
  readonly relation: CwRelation;

  /**
   * Property type
   *
   * @description
   * Identifier of the new relation type.
   *
   * @type {string}
   * @readonly
   */
  readonly type: string;
  // #endregion
}

/**
 * Interface CwRelationLeadingContext
 *
 * @description
 * The context of a `cwRelationLeading` template: the item of the row or of the result.
 */
export interface CwRelationLeadingContext {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * Item supplied to the projected template.
   *
   * @type {CwRelationItem}
   * @readonly
   */
  readonly $implicit: CwRelationItem;
  // #endregion
}

/**
 * Interface CwRelationsLabels
 *
 * @description
 * The French texts of `cw-relations` and `cw-relation-picker` (Relations sheet).
 */
export interface CwRelationsLabels {
  // #region Properties
  /**
   * Property title
   *
   * @description
   * Heading of the relations section.
   *
   * @type {string}
   * @readonly
   */
  readonly title: string;

  /**
   * Property add
   *
   * @description
   * Label for adding a relation.
   *
   * @type {string}
   * @readonly
   */
  readonly add: string;

  /**
   * Property addRelation
   *
   * @description
   * Accessible name of the add-relation control.
   *
   * @type {string}
   * @readonly
   */
  readonly addRelation: string;

  /**
   * Property empty
   *
   * @description
   * Text displayed when no relations exist.
   *
   * @type {string}
   * @readonly
   */
  readonly empty: string;

  /**
   * Property actions
   *
   * @description
   * Builds the action-menu name from an item reference.
   *
   * @type {(reference: string) => string}
   * @readonly
   */
  readonly actions: (reference: string) => string;

  /**
   * Property open
   *
   * @description
   * Label for opening a related item.
   *
   * @type {string}
   * @readonly
   */
  readonly open: string;

  /**
   * Property changeType
   *
   * @description
   * Label for changing a relation type.
   *
   * @type {string}
   * @readonly
   */
  readonly changeType: string;

  /**
   * Property copyLink
   *
   * @description
   * Label for copying an item link.
   *
   * @type {string}
   * @readonly
   */
  readonly copyLink: string;

  /**
   * Property remove
   *
   * @description
   * Label for removing a relation.
   *
   * @type {string}
   * @readonly
   */
  readonly remove: string;

  /**
   * Property removed
   *
   * @description
   * Confirmation text after removing a relation.
   *
   * @type {string}
   * @readonly
   */
  readonly removed: string;

  /**
   * Property added
   *
   * @description
   * Builds confirmation text from the relation type and item reference.
   *
   * @type {(type: string, reference: string) => string}
   * @readonly
   */
  readonly added: (type: string, reference: string) => string;

  /**
   * Property picker
   *
   * @description
   * Title of the relation picker.
   *
   * @type {string}
   * @readonly
   */
  readonly picker: string;

  /**
   * Property type
   *
   * @description
   * Label of the relation type selector.
   *
   * @type {string}
   * @readonly
   */
  readonly type: string;

  /**
   * Property search
   *
   * @description
   * Accessible name of the search field.
   *
   * @type {string}
   * @readonly
   */
  readonly search: string;

  /**
   * Property searchPlaceholder
   *
   * @description
   * Placeholder of the search field.
   *
   * @type {string}
   * @readonly
   */
  readonly searchPlaceholder: string;

  /**
   * Property alreadyLinked
   *
   * @description
   * Text marking a result already linked.
   *
   * @type {string}
   * @readonly
   */
  readonly alreadyLinked: string;

  /**
   * Property noResult
   *
   * @description
   * Text displayed when no search results match.
   *
   * @type {string}
   * @readonly
   */
  readonly noResult: string;
  // #endregion
}
