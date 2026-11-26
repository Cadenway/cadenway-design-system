import type { CwCalendarViewLabels, CwCalendarViewProvidedLabels } from './calendar-view.types';

/**
 * Constant CW_CALENDAR_VIEW_LABELS
 *
 * @description
 * The default texts of the calendar view, word for word from the Calendar View sheet and the mockup (`App.dc.html`, vue Calendrier); every text is defined, the optional ones included. A `labels` input overrides any of them.
 *
 * @type {Required<CwCalendarViewLabels>}
 */
export const CW_CALENDAR_VIEW_LABELS: Required<CwCalendarViewLabels> = {
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
  // Mockup App.dc.html: the calendar skeleton's `aria-label`.
  loading: 'Chargement du calendrier',
  // Mockup App.dc.html: the toast after a drop on a day, « <id> replanifiée » / « Échéance : <date>. ».
  scheduled: '{item} replanifiée. Échéance : {date}.',
};

/**
 * Constant PROVIDED_LABELS
 *
 * @description
 * Complete French defaults used by the labels provider and token.
 *
 * @type {Required<CwCalendarViewProvidedLabels>}
 */
const PROVIDED_LABELS: Required<CwCalendarViewProvidedLabels> = {
  ...CW_CALENDAR_VIEW_LABELS,
  ariaLabel: 'Calendrier',
};

/**
 * Function getProvidedLabels
 *
 * @description
 * Returns the complete French defaults for the provider and token.
 *
 * @returns {Required<CwCalendarViewProvidedLabels>} Complete default texts.
 */
export function getProvidedLabels(): Required<CwCalendarViewProvidedLabels> {
  return PROVIDED_LABELS;
}
