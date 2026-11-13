import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMinusBold } from '@ng-icons/phosphor-icons/bold';

/** The dash between two groups of boxes of `cw-input-otp` (`role="separator"`). */
@Component({
  selector: 'cw-input-otp-separator',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorMinusBold })],
  host: { role: 'separator', class: 'flex text-muted-foreground' },
  templateUrl: './input-otp-separator.component.html',
})
export class CwInputOtpSeparator {}
