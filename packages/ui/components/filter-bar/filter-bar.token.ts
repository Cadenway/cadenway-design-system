import { InjectionToken, type Signal } from '@angular/core';

import type { CwFilterOptionDef } from './filter-option/filter-option.directive';
import type { CwFilterValueDef } from './filter-value/filter-value.directive';

/**
 * Interface FilterTemplates
 *
 * @description
 * The templates a `cw-filter-bar` collects from its content, read by the chips it renders (a standalone chip reads its own content). Not exported from the entry point.
 */
export interface FilterTemplates {
  // #region Properties
  /**
   * Property values
   *
   * @description
   * Templates used to render selected filter values.
   *
   * @type {Signal<readonly CwFilterValueDef[]>}
   * @readonly
   */
  readonly values: Signal<readonly CwFilterValueDef[]>;

  /**
   * Property options
   *
   * @description
   * Templates used to render filter options.
   *
   * @type {Signal<readonly CwFilterOptionDef[]>}
   * @readonly
   */
  readonly options: Signal<readonly CwFilterOptionDef[]>;
  // #endregion
}

/**
 * Constant CW_FILTER_TEMPLATES
 *
 * @description
 * The templates of the bar around a chip.
 *
 * @type {InjectionToken<FilterTemplates>}
 */
export const CW_FILTER_TEMPLATES: InjectionToken<FilterTemplates> =
  new InjectionToken<FilterTemplates>('CW_FILTER_TEMPLATES');
