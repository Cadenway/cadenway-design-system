/**
 * The ten task statuses of Cadenway, in their workflow order (mockup `StatutTache.dc.html`). The
 * keys are the display contract shared with `cadenway-webapp`; this package knows nothing else
 * about tasks (`AGENTS.md`, "Boundaries").
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

/** Side of the status icon, from 12 px (`3`) to 20 px (`5`); `4` (16 px) sits next to `text-sm`. */
export type CwStatusIconSize = '3' | '3.5' | '4' | '5';
