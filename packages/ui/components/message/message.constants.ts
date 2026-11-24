import type { CwMessageLabels, CwMessageThreadLabels, CwMessageToneLabels } from './message.types';

/**
 * Constant CW_MESSAGE_LABELS
 *
 * @description
 * Default French labels for message actions, state and relative time.
 *
 * @type {CwMessageLabels}
 */
export const CW_MESSAGE_LABELS: CwMessageLabels = {
  edited: 'modifié',
  sending: 'Envoi…',
  failed: "Échec de l'envoi",
  retry: 'Réessayer',
  remove: 'Supprimer',
  actions: 'Actions du message',
  react: 'Réagir',
  reply: 'Répondre',
  more: "Plus d'actions",
  justNow: "à l'instant",
};

/**
 * Constant CW_MESSAGE_THREAD_LABELS
 *
 * @description
 * Default French text used in the thread summary.
 *
 * @type {CwMessageThreadLabels}
 */
export const CW_MESSAGE_THREAD_LABELS: CwMessageThreadLabels = {
  reply: 'réponse',
  replies: 'réponses',
  last: 'Dernière',
  at: 'à',
  justNow: "à l'instant",
};

/**
 * Constant CW_MESSAGE_TONE_LABELS
 *
 * @description
 * Default French tone words read before a notice or note.
 *
 * @type {CwMessageToneLabels}
 */
export const CW_MESSAGE_TONE_LABELS: CwMessageToneLabels = {
  info: 'Information',
  success: 'Succès',
  warning: 'Avertissement',
  error: 'Erreur',
};
