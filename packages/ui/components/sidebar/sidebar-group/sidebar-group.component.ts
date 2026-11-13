import { _IdGenerator } from '@angular/cdk/a11y';
import { Component, computed, inject, input } from '@angular/core';

import { CwSidebar } from '../sidebar.component';

/**
 * A section of a `cw-sidebar`: shortcuts, favorites, spaces (Sidebar sheet of the Design System
 * artifact).
 *
 * A `role="group"` named by its `label` (« Espaces »), shown as a 32 px muted heading with an
 * optional action projected with the `cwSidebarGroupAction` attribute (« Créer un espace », a
 * `ghost` `icon-xs` button). In the icon rail the heading is only read, the action is hidden and a
 * short rule parts the sections.
 */
@Component({
  selector: 'cw-sidebar-group',
  host: {
    role: 'group',
    '[class]': 'classes()',
    '[attr.aria-labelledby]': 'label() ? labelId : null',
  },
  templateUrl: './sidebar-group.component.html',
})
export class CwSidebarGroup {
  /** Heading and accessible name of the section. */
  readonly label = input<string>();

  protected readonly sidebar = inject(CwSidebar);
  protected readonly labelId = inject(_IdGenerator).getId('cw-sidebar-group-');

  protected readonly classes = computed(() =>
    this.sidebar.rail() ? 'flex w-full flex-col items-center gap-1' : 'flex flex-col gap-px',
  );
  protected readonly headingClasses = computed(() =>
    this.sidebar.rail()
      ? 'sr-only'
      : 'flex h-8 items-center justify-between px-2 text-xs font-medium text-muted-foreground',
  );
}
