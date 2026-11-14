import { InjectionToken } from '@angular/core';

/**
 * Interface BreadcrumbItemHandle
 * @interface BreadcrumbItemHandle
 *
 * @description
 * A level of the breadcrumb trail: a link, a level with a menu, or the current page.
 */
export interface BreadcrumbItemHandle {
  // #region Properties
  /**
   * Property element
   * @readonly
   *
   * @description
   * Level element moved by the trail into its list item.
   *
   * @type {HTMLElement}
   */
  readonly element: HTMLElement;

  /**
   * Property isPage
   * @readonly
   *
   * @description
   * Whether the level represents the current page rather than a link.
   *
   * @type {boolean}
   */
  readonly isPage: boolean;
  // #endregion

  // #region Methods
  /**
   * Method label
   * @method label
   *
   * @description
   * Reads the level's visible text for the folded-level menu.
   *
   * @returns {string} Text used to name the hidden menu item.
   */
  label(): string;
  // #endregion
}

/**
 * Constant CW_BREADCRUMB_ITEM
 *
 * @description
 * The levels of a breadcrumb, as the trail's content query sees them. Links and the page provide
 * themselves under this token, so the trail finds them in order without importing their classes.
 * Not exported from the entry point.
 *
 * @type {InjectionToken<BreadcrumbItemHandle>}
 */
export const CW_BREADCRUMB_ITEM: InjectionToken<BreadcrumbItemHandle> =
  new InjectionToken<BreadcrumbItemHandle>('CW_BREADCRUMB_ITEM');
