import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { KANBAN_LABELS } from './kanban-labels.token';
import { CW_KANBAN_LABELS } from './kanban.constants';
import type { CwKanbanLabels } from './kanban.types';

/**
 * Function provideCwKanbanLabels
 *
 * @description
 * Sets the texts of every `cw-kanban` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_KANBAN_LABELS`); a board's `labels` input still overrides them. A function is called
 * once, in an injection context, when a board first reads its texts.
 *
 * @param {Partial<CwKanbanLabels> | (() => Partial<CwKanbanLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged board texts.
 */
export function provideCwKanbanLabels(
  labels: Partial<CwKanbanLabels> | (() => Partial<CwKanbanLabels>),
): Provider {
  return ɵprovideLabels(KANBAN_LABELS, CW_KANBAN_LABELS, labels);
}
