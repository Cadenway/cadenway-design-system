/**
 * Type CwStatusKey
 *
 * @description
 * The ten task statuses of Cadenway, in their workflow order (mockup `StatutTache.dc.html`). The
 * keys are the display contract shared with `cadenway-webapp`; this package knows nothing else
 * about tasks (`AGENTS.md`, "Boundaries").
 *
 * @type {CwStatusKey}
 */
export type CwStatusKey =
  | 'triage'
  | 'backlog'
  | 'todo'
  | 'progress'
  | 'review'
  | 'testing'
  | 'waiting'
  | 'blocked'
  | 'done'
  | 'cancelled';

/**
 * Type CwStatusIconSize
 *
 * @description
 * Side of the status icon, from 12 px (`3`) to 20 px (`5`).
 *
 * @type {'3' | '3.5' | '4' | '5'}
 */
export type CwStatusIconSize = '3' | '3.5' | '4' | '5';
