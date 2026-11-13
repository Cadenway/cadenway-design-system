import { Component } from '@angular/core';

/** A run of welded boxes inside `cw-input-otp` (3 + 3 for six digits, 4 + 4 for a recovery code). */
@Component({
  selector: 'cw-input-otp-group',
  host: { class: 'flex items-center' },
  templateUrl: './input-otp-group.component.html',
})
export class CwInputOtpGroup {}
