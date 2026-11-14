import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMinusBold } from '@ng-icons/phosphor-icons/bold';

/**
 * Class CwInputOtpSeparator
 * @class CwInputOtpSeparator
 *
 * @description
 * Separator shown between groups of OTP boxes.
 */
@Component({
  selector: 'cw-input-otp-separator',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorMinusBold })],
  host: { role: 'separator', class: 'flex text-muted-foreground' },
  templateUrl: './input-otp-separator.component.html',
})
export class CwInputOtpSeparator {}
