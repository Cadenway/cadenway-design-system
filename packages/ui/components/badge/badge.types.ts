/**
 * Type CwBadgeVariant
 *
 * @description
 * Badge appearance; the Badge sheet uses outline for statuses and metadata, and default for novelty.
 *
 * @type {'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'}
 */
export type CwBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

/**
 * Type CwBadgeSize
 *
 * @description
 * Badge height: 22 pixels by default or 18 pixels for counters and dense rows.
 *
 * @type {'default' | 'sm'}
 */
export type CwBadgeSize = 'default' | 'sm';

/**
 * Interface CwBadgeLabels
 *
 * @description
 * Accessible names used for icon-only priority badges.
 */
export interface CwBadgeLabels {
  // #region Properties
  /**
   * Property urgente
   *
   * @description
   * Accessible name for urgent priority.
   *
   * @type {string}
   * @readonly
   */
  readonly urgente: string;

  /**
   * Property haute
   *
   * @description
   * Accessible name for high priority.
   *
   * @type {string}
   * @readonly
   */
  readonly haute: string;

  /**
   * Property moyenne
   *
   * @description
   * Accessible name for medium priority.
   *
   * @type {string}
   * @readonly
   */
  readonly moyenne: string;

  /**
   * Property basse
   *
   * @description
   * Accessible name for low priority.
   *
   * @type {string}
   * @readonly
   */
  readonly basse: string;
  // #endregion
}
