/**
 * Type CwAlertVariant
 *
 * @description
 * Alert tone selecting its icon, background and ARIA role.
 *
 * @type {'info' | 'success' | 'warning' | 'destructive'}
 */
export type CwAlertVariant = 'info' | 'success' | 'warning' | 'destructive';

/**
 * Type CwAlertSize
 *
 * @description
 * Standard title, description and action layout or a compact centered line.
 *
 * @type {'default' | 'compact'}
 */
export type CwAlertSize = 'default' | 'compact';

/**
 * Interface CwAlertLabels
 *
 * @description
 * Texts used by Alert instances.
 */
export interface CwAlertLabels {
  // #region Properties
  /**
   * Property close
   *
   * @description
   * Close button accessible name.
   *
   * @type {string}
   */
  close: string;
  // #endregion
}
