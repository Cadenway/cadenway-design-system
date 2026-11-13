import type { CwRelationsLabels } from './relations.types';

/**
 * The default French texts of `cw-relations` and `cw-relation-picker` (Relations sheet and preview
 * of the Design System artifact, mockup `App.dc.html`); the `labels` input overrides any of them.
 * The relation types themselves are the consumer's (`types`).
 */
export const CW_RELATIONS_LABELS: CwRelationsLabels = {
  title: 'Relations',
  add: 'Ajouter',
  addRelation: 'Ajouter une relation',
  empty: 'Aucune relation.',
  actions: (reference) => `Actions de la relation ${reference}`,
  open: 'Ouvrir la tâche',
  changeType: 'Changer le type',
  copyLink: 'Copier le lien',
  remove: 'Retirer la relation',
  removed: 'Relation retirée',
  added: (type, reference) => `Relation ajoutée : ${type} ${reference}`,
  picker: 'Ajouter une relation',
  type: 'Type',
  search: 'Rechercher une tâche',
  searchPlaceholder: 'Nom ou identifiant',
  alreadyLinked: 'Déjà liée',
  noResult: 'Aucune tâche ne correspond',
};
