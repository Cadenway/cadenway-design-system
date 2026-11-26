/*
 * The French copy of `cw-timeline` that no input overrides: accessible names, announcements and
 * small marks, word for word from the Timeline sheet of the Design System artifact. One place, so a
 * later `@angular/localize` extraction is mechanical (.claude/rules/language.md). Internal.
 */

import { moveText, rangeText } from './timeline.dates';
import type { CwTimelineLabels, CwTimelineScale } from './timeline.types';

/**
 * Constant SCALES
 *
 * @description
 * French labels for timeline axis scales.
 *
 * @type {Record<CwTimelineScale, string>}
 */
const SCALES: Record<CwTimelineScale, string> = { day: 'jour', week: 'semaine', month: 'mois' };

/**
 * Function days
 *
 * @description
 * Formats a day count with its French singular or plural unit.
 *
 * @param {number} count - Number of days.
 *
 * @returns {string} French day count with the appropriate unit.
 */
function days(count: number): string {
  return `${String(count)} ${count > 1 ? 'jours' : 'jour'}`;
}

/**
 * Constant CW_TIMELINE_LABELS
 *
 * @description
 * French ruler labels and accessible announcements from the Timeline sheet and the Gantt of the
 * mockup (`App.dc.html`); every text is defined, the optional ones included.
 *
 * @type {Required<CwTimelineLabels>}
 */
export const CW_TIMELINE_LABELS: Required<CwTimelineLabels> = {
  range: rangeText,
  move: moveText,
  nameHeader: 'Tâche',
  undatedLabel: 'Sans date',
  scheduleLabel: 'Planifier',
  /** Ruler, day scale: « Semaine 46 ». */
  week: (week: number): string => `Semaine ${String(week)}`,
  /** Ruler, week scale: « S46 ». */
  weekShort: (week: number): string => `S${String(week)}`,
  /** Mark right of a late bar: « En retard de 1 j ». */
  late: (count: number): string => `En retard de ${String(count)} j`,
  /** Accessible name part of a late bar: « en retard de 1 jour ». */
  lateLong: (count: number): string => `en retard de ${days(count)}`,
  /** Accessible name part of a bar in conflict: « commence avant la fin de CAD-479 ». */
  conflict: (predecessor: string): string => `commence avant la fin de ${predecessor}`,
  /** Announcement of a new conflict. */
  conflictAnnounce: (successor: string, predecessor: string): string =>
    `Conflit : ${successor} commence avant la fin de ${predecessor}`,
  /** Accessible name of a milestone: « Jalon Revue de sprint 14, 20 nov. ». */
  milestone: (label: string, date: string): string => `Jalon ${label}, ${date}`,
  /** Announcement after a move: « CAD-485 : du 24 au 26 nov. ». */
  moved: (name: string, range: string): string => `${name} : ${range}`,
  /** Announcement of a scale change: « Échelle : semaine ». */
  scale: (scale: CwTimelineScale): string => `Échelle : ${SCALES[scale]}`,
  /** Announcement of a zoom change within a scale: « Zoom : 150 % ». */
  zoom: (percent: number): string => `Zoom : ${String(percent)} %`,
  /** Percentage of a bar: « 60 % ». */
  percent: (value: number): string => `${String(value)} %`,
  /** Header of the duration column, from the mockup's Gantt: « Durée ». */
  durationHeader: 'Durée',
  /** Duration column, from the mockup's Gantt: « 3 j ». */
  duration: (days: number): string => `${String(days)} j`,
  /** Chip of an item outside the window, from the mockup's Gantt: « Afficher CAD-485 (du 24 au 26 nov.) ». */
  reveal: (name: string, range: string): string => `Afficher ${name} (${range})`,
  /**
   * Announcement after `fit()`, written after the mockup's « Ajuster aux 7 tâches datées »:
   * « Vue ajustée aux 7 tâches datées ».
   */
  fitted: (count: number): string =>
    count > 1 ? `Vue ajustée aux ${String(count)} tâches datées` : 'Vue ajustée à la tâche datée',
  /** The mockup's Gantt skeleton `aria-label`. */
  loading: 'Chargement du diagramme de Gantt',
  /** The mockup's empty Gantt. */
  empty: 'Aucune tâche ne correspond à la recherche ou aux filtres.',
};
