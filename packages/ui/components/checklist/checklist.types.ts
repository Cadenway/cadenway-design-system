/** What a checklist ticks: free items with a checkbox, or sub-items with a consumer-given status. */
export type CwChecklistVariant = 'checklist' | 'subtasks';

/** The person an item is assigned to, shown as a 20 px avatar on the right. */
export interface CwChecklistPerson {
  /** Full name: the avatar's initials, title and accessible name (« Karim Benali »). */
  readonly name: string;
  /** Picture URL; the initials show without it. */
  readonly src?: string | null;
}

/** Payload of `itemAdd`: the typed label, and the parent's id for a sub-item. */
export interface CwChecklistAddEvent {
  readonly label: string;
  readonly parentId?: string;
}

/**
 * Payload of `itemMove`, by mouse or keyboard: the item, its new index among its new siblings, and
 * its new parent (`null` at the first level). The consumer reorders its data; the checklist moves
 * nothing itself.
 */
export interface CwChecklistMoveEvent {
  readonly id: string;
  readonly index: number;
  readonly parentId: string | null;
}

/** The French texts of a checklist (Checklist sheet of the Design System artifact). */
export interface CwChecklistLabels {
  /** Toggle of the completed items (« Masquer les éléments terminés »). */
  readonly hideCompleted: string;
  /** Footer while completed items are hidden (« Afficher les 3 éléments terminés »). */
  readonly showCompleted: (count: number) => string;
  /** Name of the progress bar (« Avancement de « Critères d'acceptation » »). */
  readonly progress: (title: string) => string;
  /** Spoken value of the progress bar (« 3 sur 9 »). */
  readonly progressValue: (done: number, total: number) => string;
  /** Name of an item's drag handle (« Déplacer « Tester sur Safari » »). */
  readonly move: (label: string) => string;
  /** Keyboard help of the drag handles. */
  readonly moveHelp: string;
  /** Announced when an item is grabbed or moved (« saisi, position 2 sur 4 »). */
  readonly grabbed: (position: number, total: number) => string;
  /** Announced when an item is nested (« imbriqué sous Tester 10 000 lignes »). */
  readonly nested: (parent: string) => string;
  /** Announced when an item goes back to the first level. */
  readonly unnested: string;
  /** Announced when a grabbed item is dropped (« posé »). */
  readonly dropped: string;
  /** Announced when a keyboard move is cancelled. */
  readonly cancelled: string;
  /** Name of an item's menu button (« Actions de « Tester sur Safari » »). */
  readonly actions: (label: string) => string;
  /** Default menu: edit the label. */
  readonly edit: string;
  /** Default menu: add a sub-item. */
  readonly addChild: string;
  /** Default menu: convert the item (shown when the checklist is `convertible`). */
  readonly convert: string;
  /** Default menu: remove the item. */
  readonly remove: string;
  /** Name of the field that edits a label. */
  readonly editField: string;
  /** Name of the field that adds an item. */
  readonly newItem: string;
  /** Keys and their effect under an open field (« Entrée valider · Échap annuler · Tab imbriquer »). */
  readonly enterKey: string;
  readonly escapeKey: string;
  readonly tabKey: string;
  readonly submit: string;
  readonly cancel: string;
  readonly nest: string;
  /** Title of the due date (« Échéance : 18 nov. »). */
  readonly due: (date: string) => string;
}
