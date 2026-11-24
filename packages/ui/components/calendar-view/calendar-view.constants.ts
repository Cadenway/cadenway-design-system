import type { CwCalendarViewLabels, CwCalendarViewProvidedLabels } from './calendar-view.types';

/**
 * Constant CW_CALENDAR_VIEW_LABELS
 *
 * @description
 * The default texts of the calendar view, word for word from the Calendar View sheet and the mockup (`App.dc.html`, vue Calendrier). A `labels` input overrides any of them.
 *
 * @type {CwCalendarViewLabels}
 */
export const CW_CALENDAR_VIEW_LABELS: CwCalendarViewLabels = {
  today: 'Aujourd’hui',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  previousWeek: 'Semaine précédente',
  nextWeek: 'Semaine suivante',
  views: 'Vue',
  month: 'Mois',
  week: 'Semaine',
  unscheduled: 'Sans date',
  allDay: 'Journée',
  hour: 'Heure',
  moreOne: '+{count} autre',
  moreOther: '+{count} autres',
  countOne: '{count} tâche',
  countOther: '{count} tâches',
  createOn: 'Créer une tâche le {date}',
  addOn: 'Ajouter une tâche le {date}',
  close: 'Fermer',
  weekGrid: 'Semaine du {from} au {to}',
  range: '{item}, du {from} au {to}',
  grabbed: '{item} saisie. Flèches pour choisir le jour, Espace pour déposer, Échap pour annuler.',
  moved: '{item} déplacée au {date}',
  cancelled: 'Déplacement annulé.',
};

/**
 * Constant PROVIDED_LABELS
 *
 * @description
 * Complete French defaults used by the labels provider and token.
 *
 * @type {CwCalendarViewProvidedLabels}
 */
const PROVIDED_LABELS: CwCalendarViewProvidedLabels = {
  ...CW_CALENDAR_VIEW_LABELS,
  ariaLabel: 'Calendrier',
};

/**
 * Function getProvidedLabels
 *
 * @description
 * Returns the complete French defaults for the provider and token.
 *
 * @returns {CwCalendarViewProvidedLabels} Complete default texts.
 */
export function getProvidedLabels(): CwCalendarViewProvidedLabels {
  return PROVIDED_LABELS;
}
