import { InjectionToken, type Signal } from '@angular/core';

import type {
  CwChecklistAddEvent,
  CwChecklistLabels,
  CwChecklistMoveEvent,
  CwChecklistVariant,
} from './checklist.types';

/** What the items and the add row read from, and report to, their `cw-checklist`. Internal. */
export interface ChecklistHost {
  readonly variant: Signal<CwChecklistVariant>;
  readonly readonly: Signal<boolean>;
  readonly sortable: Signal<boolean>;
  readonly convertible: Signal<boolean>;
  readonly hideCompleted: Signal<boolean>;
  readonly addLabel: Signal<string>;
  readonly text: Signal<CwChecklistLabels>;
  /** Id of the handles' keyboard help. */
  readonly helpId: string;
  /** The first-level items, in order. */
  readonly topItems: Signal<readonly ChecklistItemNode[]>;
  /** Id of the item grabbed with the keyboard, if any. */
  readonly grabbedId: Signal<string | null>;
  /** Keyboard of a drag handle: grab, move, nest, drop, cancel. */
  handleKey(item: ChecklistItemNode, event: KeyboardEvent): void;
  /** The handle lost the focus: a grab ends where the item is. */
  releaseGrab(item: ChecklistItemNode): void;
  /** Nests an item under its previous sibling; whether it could. */
  nest(item: ChecklistItemNode): boolean;
  /** Brings a sub-item back to the first level, after its parent; whether it could. */
  unnest(item: ChecklistItemNode): boolean;
  add(event: CwChecklistAddEvent): void;
  move(event: CwChecklistMoveEvent): void;
  convert(id: string): void;
  remove(id: string): void;
}

/** What an item exposes to its checklist, its siblings and its sub-items. Internal. */
export interface ChecklistItemNode {
  readonly itemId: Signal<string>;
  readonly label: Signal<string>;
  readonly checked: Signal<boolean>;
  /** The sub-items, in order (empty for a sub-item). */
  readonly children: Signal<readonly ChecklistItemNode[]>;
  /** Moves the focus to the drag handle (after a keyboard move). */
  focusHandle(): void;
}

/**
 * The enclosing checklist, provided by `cw-checklist` so its items and add row find it without
 * importing its class (it imports them). Not exported from the entry point.
 */
export const CHECKLIST = new InjectionToken<ChecklistHost>('CHECKLIST');

/**
 * The parent item of a sub-item, provided by each `cw-checklist-item` to its projected content.
 * Not exported from the entry point.
 */
export const CHECKLIST_PARENT = new InjectionToken<ChecklistItemNode>('CHECKLIST_PARENT');
