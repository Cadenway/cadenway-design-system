import type { CwAvatarProvidedLabels } from './avatar.types';

/**
 * Constant CW_AVATAR_LABELS
 *
 * @description
 * Default texts from the Avatar sheet of the Design System artifact; every text is defined, the
 * optional presences included.
 *
 * @type {Required<CwAvatarProvidedLabels>}
 */
export const CW_AVATAR_LABELS: Required<CwAvatarProvidedLabels> = {
  unknown: 'Utilisateur inconnu',
  online: 'en ligne',
  away: 'absent',
  dnd: 'ne pas déranger',
  invisible: 'invisible',
  disabled: 'désactivé',
  group: 'Assignés',
  othersPrefix: 'et',
  add: 'Assigner',
};
