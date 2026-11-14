/**
 * Type CwAvatarSize
 *
 * @description
 * Avatar diameter from 20 px (`xs`) to 40 px (`lg`).
 *
 * @type {'xs' | 'sm' | 'default' | 'lg'}
 */
export type CwAvatarSize = 'xs' | 'sm' | 'default' | 'lg';

/**
 * Type CwAvatarPresence
 *
 * @description
 * Presence shown by the dot: online or away; a null input means offline.
 *
 * @type {'online' | 'away'}
 */
export type CwAvatarPresence = 'online' | 'away';

/**
 * Interface CwAvatarLabels
 *
 * @description
 * Accessible avatar text, supplied in French by default.
 */
export interface CwAvatarLabels {
  // #region Properties
  /**
   * Property unknown
   * @readonly
   *
   * @description
   * Name read when the account name is unknown.
   *
   * @type {string}
   */
  readonly unknown: string;

  /**
   * Property online
   * @readonly
   *
   * @description
   * Suffix read after the name of an online person, without parentheses.
   *
   * @type {string}
   */
  readonly online: string;

  /**
   * Property away
   * @readonly
   *
   * @description
   * Suffix read after the name of an away person, without parentheses.
   *
   * @type {string}
   */
  readonly away: string;

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Suffix read after the name of a deactivated account, without parentheses.
   *
   * @type {string}
   */
  readonly disabled: string;
  // #endregion
}
