import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_KANBAN_LABELS } from './kanban.constants';
import type { CwKanbanLabels } from './kanban.types';

/**
 * Constant KANBAN_LABELS
 *
 * @description
 * Texts of every board below the injector: the ones given by `provideCwKanbanLabels`, over the
 * French defaults (`CW_KANBAN_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwKanbanLabels>}
 */
export const KANBAN_LABELS: InjectionToken<CwKanbanLabels> = ɵlabelsToken<CwKanbanLabels>(
  'KANBAN_LABELS',
  CW_KANBAN_LABELS,
);
