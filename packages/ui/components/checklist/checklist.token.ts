import { InjectionToken, type Signal } from '@angular/core';

import type {
  CwChecklistAddEvent,
  CwChecklistLabels,
  CwChecklistMoveEvent,
  CwChecklistVariant,
} from './checklist.types';

/**
 * Interface ChecklistHost
 *
 * @description
 * Internal checklist contract consumed by items and the add row.
 */
export interface ChecklistHost {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Checklist variant.
   *
   * @type {Signal<CwChecklistVariant>}
   */
  readonly variant: Signal<CwChecklistVariant>;

  /**
   * Property readonly
   * @readonly
   *
   * @description
   * Whether editing is disabled.
   *
   * @type {Signal<boolean>}
   */
  readonly readonly: Signal<boolean>;

  /**
   * Property sortable
   * @readonly
   *
   * @description
   * Whether items may be reordered.
   *
   * @type {Signal<boolean>}
   */
  readonly sortable: Signal<boolean>;

  /**
   * Property convertible
   * @readonly
   *
   * @description
   * Whether conversion is available.
   *
   * @type {Signal<boolean>}
   */
  readonly convertible: Signal<boolean>;

  /**
   * Property hideCompleted
   * @readonly
   *
   * @description
   * Whether completed items are hidden.
   *
   * @type {Signal<boolean>}
   */
  readonly hideCompleted: Signal<boolean>;

  /**
   * Property addLabel
   * @readonly
   *
   * @description
   * Label of the add action.
   *
   * @type {Signal<string>}
   */
  readonly addLabel: Signal<string>;

  /**
   * Property text
   * @readonly
   *
   * @description
   * Localized checklist labels.
   *
   * @type {Signal<CwChecklistLabels>}
   */
  readonly text: Signal<CwChecklistLabels>;

  /**
   * Property helpId
   * @readonly
   *
   * @description
   * Identifier of keyboard movement help.
   *
   * @type {string}
   */
  readonly helpId: string;

  /**
   * Property topItems
   * @readonly
   *
   * @description
   * First-level items in order.
   *
   * @type {Signal<readonly ChecklistItemNode[]>}
   */
  readonly topItems: Signal<readonly ChecklistItemNode[]>;

  /**
   * Property grabbedId
   * @readonly
   *
   * @description
   * Identifier of the item grabbed by keyboard, when present.
   *
   * @type {Signal<string | null>}
   */
  readonly grabbedId: Signal<string | null>;
  // #endregion

  // #region Methods
  /**
   * Method handleKey
   *
   * @description
   * Handles keyboard movement for an item.
   *
   * @param {ChecklistItemNode} item - Item whose handle received the event.
   * @param {KeyboardEvent} event - Keyboard event controlling movement.
   */
  handleKey(item: ChecklistItemNode, event: KeyboardEvent): void;

  /**
   * Method releaseGrab
   *
   * @description
   * Ends an item grab when its handle loses focus.
   *
   * @param {ChecklistItemNode} item - Item whose keyboard grab should end.
   */
  releaseGrab(item: ChecklistItemNode): void;

  /**
   * Method nest
   *
   * @description
   * Attempts to nest an item under its previous sibling.
   *
   * @param {ChecklistItemNode} item - Item to move beneath its preceding sibling.
   *
   * @returns {boolean} Whether the nesting request succeeded.
   */
  nest(item: ChecklistItemNode): boolean;

  /**
   * Method unnest
   *
   * @description
   * Attempts to return a sub-item to the first level.
   *
   * @param {ChecklistItemNode} item - Child item to move to the first level.
   *
   * @returns {boolean} Whether the unnesting request succeeded.
   */
  unnest(item: ChecklistItemNode): boolean;

  /**
   * Method add
   *
   * @description
   * Reports an item addition request.
   *
   * @param {CwChecklistAddEvent} event - Addition request containing the new item details.
   */
  add(event: CwChecklistAddEvent): void;

  /**
   * Method move
   *
   * @description
   * Reports an item move request.
   *
   * @param {CwChecklistMoveEvent} event - Move request containing the item and destination.
   */
  move(event: CwChecklistMoveEvent): void;

  /**
   * Method convert
   *
   * @description
   * Reports an item conversion request.
   *
   * @param {string} id - Identifier of the item to convert.
   */
  convert(id: string): void;

  /**
   * Method remove
   *
   * @description
   * Reports an item removal request.
   *
   * @param {string} id - Identifier of the item to remove.
   */
  remove(id: string): void;
  // #endregion
}

/**
 * Interface ChecklistItemNode
 *
 * @description
 * Internal item contract consumed by the checklist and other items.
 */
export interface ChecklistItemNode {
  // #region Properties
  /**
   * Property itemId
   * @readonly
   *
   * @description
   * Item identifier.
   *
   * @type {Signal<string>}
   */
  readonly itemId: Signal<string>;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Item label.
   *
   * @type {Signal<string>}
   */
  readonly label: Signal<string>;

  /**
   * Property checked
   * @readonly
   *
   * @description
   * Completion state.
   *
   * @type {Signal<boolean>}
   */
  readonly checked: Signal<boolean>;

  /**
   * Property children
   * @readonly
   *
   * @description
   * Child items in order.
   *
   * @type {Signal<readonly ChecklistItemNode[]>}
   */
  readonly children: Signal<readonly ChecklistItemNode[]>;
  // #endregion

  // #region Methods
  /**
   * Method focusHandle
   *
   * @description
   * Moves focus to the item drag handle.
   */
  focusHandle(): void;
  // #endregion
}

/**
 * Constant CHECKLIST
 *
 * @description
 * The enclosing checklist, provided by `cw-checklist` so its items and add row find it without
 * importing its class (it imports them). Not exported from the entry point.
 *
 * @type {InjectionToken<ChecklistHost>}
 */
export const CHECKLIST: InjectionToken<ChecklistHost> = new InjectionToken<ChecklistHost>(
  'CHECKLIST',
);

/**
 * Constant CHECKLIST_PARENT
 *
 * @description
 * The parent item of a sub-item, provided by each `cw-checklist-item` to its projected content.
 * Not exported from the entry point.
 *
 * @type {InjectionToken<ChecklistItemNode>}
 */
export const CHECKLIST_PARENT: InjectionToken<ChecklistItemNode> =
  new InjectionToken<ChecklistItemNode>('CHECKLIST_PARENT');
