import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_AUTOCOMPLETE_LABELS } from './autocomplete.constants';
import type { CwAutocompleteLabels } from './autocomplete.types';

/**
 * Constant AUTOCOMPLETE_LABELS
 *
 * @description
 * Injector-scoped texts with French defaults.
 *
 * @type {InjectionToken<CwAutocompleteLabels>}
 */
export const AUTOCOMPLETE_LABELS: InjectionToken<CwAutocompleteLabels> =
  ɵlabelsToken<CwAutocompleteLabels>('AUTOCOMPLETE_LABELS', CW_AUTOCOMPLETE_LABELS);
