/**
 * Type CwChecklistVariant
 *
 * @description
 * What a checklist ticks: free items with a checkbox, or sub-items with a consumer-given status.
 *
 * @type {'checklist' | 'subtasks'}
 */
export type CwChecklistVariant = 'checklist' | 'subtasks';

/**
 * Interface CwChecklistPerson
 *
 * @description
 * The person an item is assigned to, shown as a 20 px avatar on the right.
 */
export interface CwChecklistPerson {
  // #region Properties
  /**
   * Property name
   * @readonly
   *
   * @description
   * Full name: the avatar's initials, title and accessible name (« Karim Benali »).
   *
   * @type {string}
   */
  readonly name: string;

  /**
   * Property src
   * @readonly
   *
   * @description
   * Picture URL; the initials show without it.
   *
   * @type {string | null | undefined}
   */
  readonly src?: string | null;
  // #endregion
}

/**
 * Interface CwChecklistAddEvent
 *
 * @description
 * Payload of `itemAdd`: the typed label, and the parent's id for a sub-item.
 */
export interface CwChecklistAddEvent {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Label entered for the new item.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property parentId
   * @readonly
   *
   * @description
   * Identifier of the parent item, when applicable.
   *
   * @type {string | undefined}
   */
  readonly parentId?: string;
  // #endregion
}

/**
 * Interface CwChecklistMoveEvent
 *
 * @description
 * Payload of `itemMove`, by mouse or keyboard: the item, its new index among its new siblings, and
 * its new parent (`null` at the first level). The consumer reorders its data; the checklist moves
 * nothing itself.
 */
export interface CwChecklistMoveEvent {
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier of the moved item.
   *
   * @type {string}
   */
  readonly id: string;

  /**
   * Property index
   * @readonly
   *
   * @description
   * New zero-based index among siblings.
   *
   * @type {number}
   */
  readonly index: number;

  /**
   * Property parentId
   * @readonly
   *
   * @description
   * Identifier of the parent item, when applicable.
   *
   * @type {string | null}
   */
  readonly parentId: string | null;
  // #endregion
}

/**
 * Interface CwChecklistLabels
 *
 * @description
 * The French texts of a checklist (Checklist sheet of the Design System artifact).
 */
export interface CwChecklistLabels {
  // #region Properties
  /**
   * Property hideCompleted
   * @readonly
   *
   * @description
   * Toggle of the completed items (« Masquer les éléments terminés »).
   *
   * @type {string}
   */
  readonly hideCompleted: string;

  /**
   * Property showCompleted
   * @readonly
   *
   * @description
   * Footer while completed items are hidden (« Afficher les 3 éléments terminés »).
   *
   * @type {(count: number) => string}
   */
  readonly showCompleted: (count: number) => string;

  /**
   * Property progress
   * @readonly
   *
   * @description
   * Name of the progress bar (« Avancement de « Critères d'acceptation » »).
   *
   * @type {(title: string) => string}
   */
  readonly progress: (title: string) => string;

  /**
   * Property progressValue
   * @readonly
   *
   * @description
   * Spoken value of the progress bar (« 3 sur 9 »).
   *
   * @type {(done: number, total: number) => string}
   */
  readonly progressValue: (done: number, total: number) => string;

  /**
   * Property move
   * @readonly
   *
   * @description
   * Name of an item's drag handle (« Déplacer « Tester sur Safari » »).
   *
   * @type {(label: string) => string}
   */
  readonly move: (label: string) => string;

  /**
   * Property moveHelp
   * @readonly
   *
   * @description
   * Keyboard help of the drag handles.
   *
   * @type {string}
   */
  readonly moveHelp: string;

  /**
   * Property grabbed
   * @readonly
   *
   * @description
   * Announced when an item is grabbed or moved (« saisi, position 2 sur 4 »).
   *
   * @type {(position: number, total: number) => string}
   */
  readonly grabbed: (position: number, total: number) => string;

  /**
   * Property nested
   * @readonly
   *
   * @description
   * Announced when an item is nested (« imbriqué sous Tester 10 000 lignes »).
   *
   * @type {(parent: string) => string}
   */
  readonly nested: (parent: string) => string;

  /**
   * Property unnested
   * @readonly
   *
   * @description
   * Announced when an item goes back to the first level.
   *
   * @type {string}
   */
  readonly unnested: string;

  /**
   * Property dropped
   * @readonly
   *
   * @description
   * Announced when a grabbed item is dropped (« posé »).
   *
   * @type {string}
   */
  readonly dropped: string;

  /**
   * Property cancelled
   * @readonly
   *
   * @description
   * Announced when a keyboard move is cancelled.
   *
   * @type {string}
   */
  readonly cancelled: string;

  /**
   * Property actions
   * @readonly
   *
   * @description
   * Name of an item's menu button (« Actions de « Tester sur Safari » »).
   *
   * @type {(label: string) => string}
   */
  readonly actions: (label: string) => string;

  /**
   * Property edit
   * @readonly
   *
   * @description
   * Default menu: edit the label.
   *
   * @type {string}
   */
  readonly edit: string;

  /**
   * Property addChild
   * @readonly
   *
   * @description
   * Default menu: add a sub-item.
   *
   * @type {string}
   */
  readonly addChild: string;

  /**
   * Property convert
   * @readonly
   *
   * @description
   * Default menu: convert the item (shown when the checklist is `convertible`).
   *
   * @type {string}
   */
  readonly convert: string;

  /**
   * Property remove
   * @readonly
   *
   * @description
   * Default menu: remove the item.
   *
   * @type {string}
   */
  readonly remove: string;

  /**
   * Property editField
   * @readonly
   *
   * @description
   * Name of the field that edits a label.
   *
   * @type {string}
   */
  readonly editField: string;

  /**
   * Property newItem
   * @readonly
   *
   * @description
   * Name of the field that adds an item.
   *
   * @type {string}
   */
  readonly newItem: string;

  /**
   * Property enterKey
   * @readonly
   *
   * @description
   * Keys and their effect under an open field (« Entrée valider · Échap annuler · Tab imbriquer »).
   *
   * @type {string}
   */
  readonly enterKey: string;

  /**
   * Property escapeKey
   * @readonly
   *
   * @description
   * Label for the Escape key.
   *
   * @type {string}
   */
  readonly escapeKey: string;

  /**
   * Property tabKey
   * @readonly
   *
   * @description
   * Label for the Tab key.
   *
   * @type {string}
   */
  readonly tabKey: string;

  /**
   * Property submit
   * @readonly
   *
   * @description
   * Action label for submitting an item.
   *
   * @type {string}
   */
  readonly submit: string;

  /**
   * Property cancel
   * @readonly
   *
   * @description
   * Action label for cancelling editing.
   *
   * @type {string}
   */
  readonly cancel: string;

  /**
   * Property nest
   * @readonly
   *
   * @description
   * Action label for nesting an item.
   *
   * @type {string}
   */
  readonly nest: string;

  /**
   * Property due
   * @readonly
   *
   * @description
   * Title of the due date (« Échéance : 18 nov. »).
   *
   * @type {(date: string) => string}
   */
  readonly due: (date: string) => string;
  // #endregion
}
