/**
 * Type CwToolbarSize
 *
 * @description
 * Height of a toolbar's controls: `default` 32 px (the header of a view: Liste, Tableau,
 * Calendrier), `sm` 28 px (the task panel, narrow views, dashboard widgets). Every control of a
 * bar shares one size (Toolbar sheet, "Tailles").
 *
 * @type {'default' | 'sm'}
 */
export type CwToolbarSize = 'default' | 'sm';

/**
 * Interface CwToolbarLabels
 *
 * @description
 * Replaceable texts used by the toolbar entry point.
 */
export interface CwToolbarLabels {
  // #region Properties
  /**
   * Property overflow
   *
   * @description
   * Accessible name of the overflow button and menu.
   *
   * @type {string}
   */
  overflow: string;
  // #endregion
}
