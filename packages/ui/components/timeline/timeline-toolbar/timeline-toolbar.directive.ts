import { Directive } from '@angular/core';

/**
 * Class CwTimelineToolbar
 * @class CwTimelineToolbar
 *
 * @description
 * Marks the toolbar projected above a `cw-timeline` (scale, period, grouping, « Dépendances »,
 * « Créer une tâche »): `<cw-toolbar cwTimelineToolbar …>`.
 *
 * The timeline only places it above the grid; the toolbar keeps its own role, name and keyboard.
 * Bind its controls to the `scale`, `range` and `showDependencies` models of the timeline.
 */
@Directive({ selector: '[cwTimelineToolbar]' })
export class CwTimelineToolbar {}
