import { Component, input } from '@angular/core';

/**
 * A dashboard row of stats in one card: equal columns, one per `cw-stat`, divided by a thin line,
 * without shadow (Stat sheet of the Design System artifact, "Groupe").
 *
 * Project up to four `cw-stat` into it; each stat drops its own card inside a group. It is a
 * `role="group"` named by `ariaLabel` (« Semaine 46 »); put it in a titled section of the page.
 */
@Component({
  selector: 'cw-stat-group',
  host: {
    class:
      'grid auto-cols-fr grid-flow-col divide-x rounded-xl border bg-card text-card-foreground',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  templateUrl: './stat-group.component.html',
})
export class CwStatGroup {
  /** Accessible name of the row (« Semaine 46 »). */
  readonly ariaLabel = input<string>('');
}
