import { InjectionToken } from '@angular/core';

/** A level of the trail as `nav[cwBreadcrumb]` sees it: a link, a level with a menu, or the page. */
export interface BreadcrumbItemHandle {
  /** The level's own element, moved by the trail into its list item. */
  readonly element: HTMLElement;
  /** Whether the level is the current page (`span[cwBreadcrumbPage]`). */
  readonly isPage: boolean;
  /** The visible text of the level, for the menu of the folded levels. */
  label(): string;
}

/**
 * The levels of a breadcrumb, as the trail's content query sees them. Links and the page provide
 * themselves under this token, so the trail finds them in order without importing their classes.
 * Not exported from the entry point.
 */
export const CW_BREADCRUMB_ITEM = new InjectionToken<BreadcrumbItemHandle>('CW_BREADCRUMB_ITEM');
