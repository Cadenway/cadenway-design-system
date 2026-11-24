import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { QUESTIONNAIRE_LABELS } from './questionnaire-labels.token';
import { CW_QUESTIONNAIRE_LABELS } from './questionnaire.constants';
import type { CwQuestionnaireLabels } from './questionnaire.types';

/**
 * Function provideCwQuestionnaireLabels
 *
 * @description
 * Replaces texts below this injector, merging over parent and French defaults. Individual text
 * inputs still override them. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwQuestionnaireLabels> | (() => Partial<CwQuestionnaireLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwQuestionnaireLabels(
  labels: Partial<CwQuestionnaireLabels> | (() => Partial<CwQuestionnaireLabels>),
): Provider {
  return ɵprovideLabels(QUESTIONNAIRE_LABELS, CW_QUESTIONNAIRE_LABELS, labels);
}
