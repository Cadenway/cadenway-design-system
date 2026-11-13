import { InjectionToken } from '@angular/core';

import type { CwAccordionTrigger } from './accordion-trigger/accordion-trigger.component';

/**
 * The triggers of an accordion, as the root's content query sees them for the arrow keys. Each one
 * provides itself under this token, so the root finds them without importing their class (they
 * import the root through their section). Not exported from the entry point.
 */
export const ACCORDION_TRIGGER = new InjectionToken<CwAccordionTrigger>('ACCORDION_TRIGGER');
