import type {
  CwTimeEntryFormLabels,
  CwTimeEntryListLabels,
  CwTimeTrackerLabels,
} from './time-tracker.types';

/** Default French texts of `cw-time-tracker` (Time Tracker sheet and preview of the Design System artifact). */
export const CW_TIME_TRACKER_LABELS: CwTimeTrackerLabels = {
  start: 'Démarrer le minuteur',
  stop: 'Arrêter le minuteur et enregistrer',
  resume: 'Reprendre le minuteur',
  pause: 'Mettre en pause',
  stopShort: 'Arrêter',
  elapsed: 'Temps écoulé',
  since: (time) => `depuis ${time}`,
  paused: 'En pause',
  total: 'Total',
  started: 'Minuteur démarré',
  saved: (duration) => `${duration} enregistrées`,
  compactStart: (total) => `Démarrer le minuteur, ${total} suivies`,
  compactStop: (clock) => `Arrêter le minuteur, ${clock}`,
  compactResume: (clock) => `Reprendre le minuteur, en pause à ${clock}`,
  tracked: 'Temps suivi',
  estimate: 'Estimation',
  meterValue: (total, estimate) => `${total} / ${estimate}`,
  remaining: (duration) => `${duration} restantes`,
  over: (duration) => `${duration} de dépassement`,
  billable: 'Facturable',
  of: 'sur',
  addTime: 'Ajouter du temps',
};

/** Default French texts of `cw-time-entry-form` (sheet, preview and mockup `App.dc.html`). */
export const CW_TIME_ENTRY_FORM_LABELS: CwTimeEntryFormLabels = {
  title: 'Ajouter du temps',
  duration: 'Durée',
  durationPlaceholder: '1 h 30, 45 min…',
  interpreted: (duration) => `= ${duration}`,
  hint: 'Durée libre, ou un raccourci.',
  invalid: 'Format non reconnu : essayez « 1 h 30 » ou « 90 min ».',
  quick: (duration) => `+ ${duration}`,
  date: 'Date',
  note: 'Note',
  notePlaceholder: 'Note (facultatif)',
  billable: 'Facturable',
  cancel: 'Annuler',
  submit: 'Ajouter',
};

/** Default French texts of `cw-time-entry-list` (sheet, preview and mockup `App.dc.html`). */
export const CW_TIME_ENTRY_LIST_LABELS: CwTimeEntryListLabels = {
  list: 'Entrées de temps',
  person: 'Personne',
  date: 'Date',
  note: 'Note',
  billable: 'Facturable',
  duration: 'Durée',
  running: 'En cours',
  noNote: 'Sans note',
  empty: 'Aucun temps saisi',
  today: "Aujourd'hui",
  yesterday: 'Hier',
  total: 'Total',
  edit: (person, date, duration) => `Modifier l'entrée de ${person}, ${date}, ${duration}`,
  actions: (person) => `Actions de l'entrée de ${person}`,
  editAction: 'Modifier',
  duplicate: 'Dupliquer',
  remove: 'Supprimer',
};

/** Shortcuts of the entry form, in milliseconds (mockup `App.dc.html`: 15 min, 30 min, 1 h, 2 h). */
export const CW_TIME_QUICK_DURATIONS: readonly number[] = [15, 30, 60, 120].map(
  (minutes) => minutes * 60_000,
);
