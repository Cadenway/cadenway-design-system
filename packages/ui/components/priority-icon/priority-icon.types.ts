/**
 * The four task priorities of Cadenway, from the most to the least pressing (mockup
 * `PrioriteTache.dc.html`). The keys are the display contract shared with `cadenway-webapp`; this
 * package knows nothing else about tasks (`AGENTS.md`, "Boundaries").
 */
export type CwPriorityKey = 'urgente' | 'haute' | 'moyenne' | 'basse';

/** Side of the priority icon, from 12 px (`3`) to 20 px (`5`); `4` (16 px) sits next to `text-sm`. */
export type CwPriorityIconSize = '3' | '3.5' | '4' | '5';
