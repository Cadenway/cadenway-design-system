import type { CwDropzoneFileLabels, CwDropzoneProvidedLabels } from './dropzone.types';

/**
 * Constant CW_DROPZONE_LABELS
 *
 * @description
 * Default French labels for dropzone states and limits.
 *
 * @type {CwDropzoneProvidedLabels}
 */
export const CW_DROPZONE_LABELS: CwDropzoneProvidedLabels = {
  title: 'Déposez des fichiers',
  browse: 'parcourez',
  max: 'max',
  or: 'ou',
  browseAria: 'les fichiers',
  drop: 'Relâchez pour joindre',
  reject: 'Type non accepté',
  limit: 'Limite atteinte',
  file: 'fichier',
  files: 'fichiers',
};

/**
 * Constant CW_DROPZONE_FILE_LABELS
 *
 * @description
 * Default French labels for upload file rows.
 *
 * @type {CwDropzoneFileLabels}
 */
export const CW_DROPZONE_FILE_LABELS: CwDropzoneFileLabels = {
  queued: 'En attente',
  of: 'sur',
  progress: 'Envoi de',
  sending: 'Envoi en cours',
  cancel: "Annuler l'envoi de",
  retry: "Réessayer l'envoi de",
  remove: 'Retirer',
  done: 'joint',
};
