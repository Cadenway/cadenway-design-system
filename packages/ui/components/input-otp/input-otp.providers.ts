import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';
import { INPUT_OTP_LABELS } from './input-otp-labels.token';
import { CW_INPUT_OTP_LABELS } from './input-otp.constants';
import type { CwInputOtpLabels } from './input-otp.types';

/**
 * Function provideCwInputOtpLabels
 *
 * @description
 * Replaces text defaults below this injector, merged over parent and French defaults. Individual
 * component inputs still override the provided texts. A factory runs once in an injection context.
 *
 * @param {Partial<CwInputOtpLabels> | (() => Partial<CwInputOtpLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwInputOtpLabels(
  labels: Partial<CwInputOtpLabels> | (() => Partial<CwInputOtpLabels>),
): Provider {
  return ɵprovideLabels(INPUT_OTP_LABELS, CW_INPUT_OTP_LABELS, labels);
}
