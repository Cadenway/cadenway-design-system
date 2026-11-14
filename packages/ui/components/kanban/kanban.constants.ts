import type { CwKanbanLabels } from './kanban.types';

/**
 * Constant CW_KANBAN_LABELS
 *
 * @description
 * The default texts of the board, word for word from the Kanban sheet and the mockup (`App.dc.html`, vue Tableau). A `labels` input overrides any of them.
 *
 * @type {CwKanbanLabels}
 */
export const CW_KANBAN_LABELS: CwKanbanLabels = {
  add: 'Ajouter une tâche',
  addIn: 'Ajouter une tâche dans {column}',
  collapse: 'Replier la colonne {column}',
  expand: 'Déplier la colonne {column}, {count}',
  column: 'Colonne {column}',
  cell: '{column}, {lane}',
  countOne: '{count} tâche',
  countOther: '{count} tâches',
  countLimit: '{count}, limite de {limit}',
  overLimit: 'Limite de {limit} dépassée',
  emptyTitle: 'Aucune tâche',
  emptyDescription: 'Déposez une carte ici ou créez une tâche.',
  quickAdd: 'Nouvelle tâche dans {column}',
  quickAddField: 'Nom de la tâche',
  quickAddKey: 'Entrée',
  quickAddHint: 'créer',
  selected: 'sélectionnée',
  instructions:
    'Espace pour saisir la carte, flèches pour la déplacer, Espace pour la déposer, Échap pour annuler.',
  grabbed:
    '{item} saisie. {position} Flèches pour déplacer, Espace pour déposer, Échap pour annuler.',
  position: 'Colonne {column}, position {position} sur {total}.',
  positionInLane: 'Colonne {column}, couloir {lane}, position {position} sur {total}.',
  dropped: '{item} déposée dans {column}, position {position} sur {total}.',
  cancelled: 'Déplacement annulé.',
};
