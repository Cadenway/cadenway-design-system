import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_INPUT_OTP_LABELS } from './input-otp.constants';
import type { CwInputOtpLabels } from './input-otp.types';

/**
 * Constant INPUT_OTP_LABELS
 *
 * @description
 * Merged text defaults for the current injector.
 *
 * @type {InjectionToken<CwInputOtpLabels>}
 */
export const INPUT_OTP_LABELS: InjectionToken<CwInputOtpLabels> = ɵlabelsToken<CwInputOtpLabels>(
  'INPUT_OTP_LABELS',
  CW_INPUT_OTP_LABELS,
);
