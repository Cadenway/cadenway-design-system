import { Component } from '@angular/core';

/**
 * Class CwEmptyDescription
 * @class CwEmptyDescription
 *
 * @description
 * Presents a sentence under the title explaining the absence and a way forward.
 */
@Component({
  selector: 'cw-empty-description',
  host: { class: 'block text-sm/relaxed text-muted-foreground' },
  templateUrl: './empty-description.component.html',
})
export class CwEmptyDescription {}
