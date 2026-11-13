import { Component, computed, inject } from '@angular/core';

import { CwSidebar } from '../sidebar.component';

/**
 * The bottom of a `cw-sidebar`, below a rule, which does not scroll: sprint progress and the
 * account button that opens the account menu (Sidebar sheet of the Design System artifact).
 *
 * Lays its rows out in a column; in the icon rail it centers them, and the consumer shows the
 * icon-only form of its controls (it owns the sidebar's `state`).
 */
@Component({
  selector: 'cw-sidebar-footer',
  host: { '[class]': 'classes()' },
  templateUrl: './sidebar-footer.component.html',
})
export class CwSidebarFooter {
  private readonly sidebar = inject(CwSidebar);
  protected readonly classes = computed(() =>
    this.sidebar.rail()
      ? 'flex w-full shrink-0 flex-col items-center gap-1 border-t border-sidebar-border py-2'
      : 'flex w-full shrink-0 flex-col gap-2 border-t border-sidebar-border p-2',
  );
}
