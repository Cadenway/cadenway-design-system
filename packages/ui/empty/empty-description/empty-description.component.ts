import { ChangeDetectionStrategy, Component } from '@angular/core';

/** One sentence under the title: why, and the way out. */
@Component({
  selector: 'cw-empty-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-sm/relaxed text-muted-foreground' },
  templateUrl: './empty-description.component.html',
})
export class CwEmptyDescription {}
