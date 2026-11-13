import { InjectionToken, type Signal } from '@angular/core';

import type { CwFilterOptionDef } from './filter-option/filter-option.directive';
import type { CwFilterValueDef } from './filter-value/filter-value.directive';

/**
 * The templates a `cw-filter-bar` collects from its content, read by the chips it renders (a
 * standalone chip reads its own content). Not exported from the entry point.
 */
export interface FilterTemplates {
  readonly values: Signal<readonly CwFilterValueDef[]>;
  readonly options: Signal<readonly CwFilterOptionDef[]>;
}

/** The templates of the bar around a chip. */
export const CW_FILTER_TEMPLATES = new InjectionToken<FilterTemplates>('CW_FILTER_TEMPLATES');
