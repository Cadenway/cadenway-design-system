/**
 * Type CwBreadcrumbSize
 *
 * @description
 * Breadcrumb text and separator size: default for task details, small above page headers.
 *
 * @type {'default' | 'sm'}
 */
export type CwBreadcrumbSize = 'default' | 'sm';

/**
 * Type CwBreadcrumbSeparatorStyle
 *
 * @description
 * Mark between levels: a right chevron for the application or a slash for settings and paths.
 *
 * @type {'chevron' | 'slash'}
 */
export type CwBreadcrumbSeparatorStyle = 'chevron' | 'slash';

/**
 * Interface CwBreadcrumbLabels
 *
 * @description
 * Texts used by Breadcrumb instances.
 */
export interface CwBreadcrumbLabels {
  // #region Properties
  /**
   * Property aria
   *
   * @description
   * Navigation accessible name.
   *
   * @type {string}
   */
  aria: string;

  /**
   * Property ellipsis
   *
   * @description
   * Hidden levels button accessible name.
   *
   * @type {string}
   */
  ellipsis: string;
  // #endregion
}
