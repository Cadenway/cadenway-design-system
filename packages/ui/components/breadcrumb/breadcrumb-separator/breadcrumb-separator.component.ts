import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import type { CwBreadcrumbSeparatorStyle, CwBreadcrumbSize } from '../breadcrumb.types';

/**
 * Class CwBreadcrumbSeparator
 * @class CwBreadcrumbSeparator
 *
 * @description
 * The mark between two levels of a breadcrumb: a `caret-right` chevron, 14 px (12 px in `sm`), or
 * a slash in `text-line-control` (Breadcrumb sheet of the Design System artifact, anatomy 3).
 *
 * Decorative (`aria-hidden`): the list already says where each level starts. `nav[cwBreadcrumb]`
 * draws it between its levels; it is exported for a trail laid out by hand.
 */
@Component({
  selector: 'cw-breadcrumb-separator',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCaretRightBold })],
  host: {
    class: 'flex items-center',
    'aria-hidden': 'true',
  },
  templateUrl: './breadcrumb-separator.component.html',
})
export class CwBreadcrumbSeparator {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting an application chevron or a slash for settings and paths.
   *
   * @type {InputSignal<CwBreadcrumbSeparatorStyle>}
   * @default 'chevron'
   */
  public readonly variant: InputSignal<CwBreadcrumbSeparatorStyle> =
    input<CwBreadcrumbSeparatorStyle>('chevron');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the size of the trail containing this separator.
   *
   * @type {InputSignal<CwBreadcrumbSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwBreadcrumbSize> = input<CwBreadcrumbSize>('default');

  /**
   * Property iconSize
   * @readonly
   *
   * @description
   * Chevron icon size: 0.75 rem for a small trail and 0.875 rem otherwise.
   *
   * @type {Signal<string>}
   */
  protected readonly iconSize: Signal<string> = computed(() =>
    this.size() === 'sm' ? '0.75rem' : '0.875rem',
  );
  // #endregion
}
