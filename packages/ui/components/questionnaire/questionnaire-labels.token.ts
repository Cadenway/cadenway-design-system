import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_QUESTIONNAIRE_LABELS } from './questionnaire.constants';
import type { CwQuestionnaireLabels } from './questionnaire.types';

/**
 * Constant QUESTIONNAIRE_LABELS
 *
 * @description
 * Texts inherited from the provider or the French defaults.
 *
 * @type {InjectionToken<CwQuestionnaireLabels>}
 */
export const QUESTIONNAIRE_LABELS: InjectionToken<CwQuestionnaireLabels> =
  ɵlabelsToken<CwQuestionnaireLabels>('QUESTIONNAIRE_LABELS', CW_QUESTIONNAIRE_LABELS);
