import { Component, computed, inject } from '@angular/core';

import { CwSidebar } from '../sidebar.component';

/**
 * The top of a `cw-sidebar`, which does not scroll: the instance picker (`h-11`) and the search
 * field that opens the palette (Sidebar sheet of the Design System artifact).
 *
 * Lays its rows out in a column; in the icon rail it centers them, and the consumer shows the
 * icon-only form of its controls (it owns the sidebar's `state`).
 */
@Component({
  selector: 'cw-sidebar-header',
  host: { '[class]': 'classes()' },
  templateUrl: './sidebar-header.component.html',
})
export class CwSidebarHeader {
  private readonly sidebar = inject(CwSidebar);
  protected readonly classes = computed(() =>
    this.sidebar.rail()
      ? 'flex w-full shrink-0 flex-col items-center gap-1 py-2'
      : 'flex w-full shrink-0 flex-col gap-2 p-2 pb-1',
  );
}
