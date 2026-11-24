import type { CwChecklistLabels, CwChecklistProvidedLabels } from './checklist.types';

/**
 * Constant CW_CHECKLIST_LABELS
 *
 * @description
 * The default French texts of `cw-checklist` and its items (Checklist sheet and preview of the
 * Design System artifact, mockup `App.dc.html`); the `labels` input overrides any of them.
 *
 * @type {CwChecklistLabels}
 */
export const CW_CHECKLIST_LABELS: CwChecklistLabels = {
  hideCompleted: 'Masquer les éléments terminés',
  showCompleted: (count) =>
    count === 1 ? "Afficher l'élément terminé" : `Afficher les ${String(count)} éléments terminés`,
  progress: (title) => `Avancement de « ${title} »`,
  progressValue: (done, total) => `${String(done)} sur ${String(total)}`,
  move: (label) => `Déplacer « ${label} »`,
  moveHelp: 'Espace saisir · ↑ ↓ déplacer · → imbriquer · ← remonter',
  grabbed: (position, total) => `saisi, position ${String(position)} sur ${String(total)}`,
  nested: (parent) => `imbriqué sous ${parent}`,
  unnested: 'remonté au premier niveau',
  dropped: 'posé',
  cancelled: 'déplacement annulé',
  actions: (label) => `Actions de « ${label} »`,
  edit: 'Modifier',
  addChild: 'Ajouter un sous-élément',
  convert: 'Convertir en tâche',
  remove: 'Supprimer',
  editField: "Modifier l'élément",
  newItem: 'Nouvel élément de checklist',
  enterKey: 'Entrée',
  escapeKey: 'Échap',
  tabKey: 'Tab',
  submit: 'valider',
  cancel: 'annuler',
  nest: 'imbriquer',
  due: (date) => `Échéance : ${date}`,
};

/**
 * Constant PROVIDED_LABELS
 *
 * @description
 * Complete French defaults used by the labels provider and token.
 *
 * @type {CwChecklistProvidedLabels}
 */
const PROVIDED_LABELS: CwChecklistProvidedLabels = {
  ...CW_CHECKLIST_LABELS,
  addLabel: 'Ajouter un élément',
  addPlaceholder: 'Élément de checklist (Entrée pour ajouter, Échap pour terminer)',
};

/**
 * Function getProvidedLabels
 *
 * @description
 * Returns the complete French defaults for the provider and token.
 *
 * @returns {CwChecklistProvidedLabels} Complete default texts.
 */
export function getProvidedLabels(): CwChecklistProvidedLabels {
  return PROVIDED_LABELS;
}
