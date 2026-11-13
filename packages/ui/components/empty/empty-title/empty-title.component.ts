import { Component } from '@angular/core';

/** The title of an empty state: it names the absence (« Aucune tâche dans cette liste »). */
@Component({
  selector: 'cw-empty-title',
  host: { class: 'block text-sm font-medium' },
  templateUrl: './empty-title.component.html',
})
export class CwEmptyTitle {}
