import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import type { CwBreadcrumbSeparatorStyle, CwBreadcrumbSize } from '../breadcrumb.types';

/**
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
  /** Chevron (application) or slash (settings, file paths). */
  readonly variant = input<CwBreadcrumbSeparatorStyle>('chevron');
  /** Size of the trail it sits in. */
  readonly size = input<CwBreadcrumbSize>('default');

  protected readonly iconSize = computed(() => (this.size() === 'sm' ? '0.75rem' : '0.875rem'));
}
