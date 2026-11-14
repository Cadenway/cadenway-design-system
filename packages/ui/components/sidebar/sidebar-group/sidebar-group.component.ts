import { _IdGenerator } from '@angular/cdk/a11y';
import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';

import { CwSidebar } from '../sidebar.component';

/**
 * Component CwSidebarGroup
 *
 * @description
 * A section of a `cw-sidebar`: shortcuts, favorites, spaces (Sidebar sheet of the Design System artifact). A `role="group"` named by its `label` (« Espaces »), shown as a 32 px muted heading with an optional action projected with the `cwSidebarGroupAction` attribute (« Créer un espace », a `ghost` `icon-xs` button). In the icon rail the heading is only read, the action is hidden and a short rule parts the sections.
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
  // #region Properties
  /**
   * Property label
   *
   * @description
   * Heading and accessible name of the section.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly label: InputSignal<string | undefined> = input<string>();

  /**
   * Property sidebar
   *
   * @description
   * Containing sidebar that determines the collapsed layout.
   *
   * @type {CwSidebar}
   * @readonly
   */
  protected readonly sidebar: CwSidebar = inject(CwSidebar);

  /**
   * Property labelId
   *
   * @description
   * Unique identifier used to label the group.
   *
   * @type {string}
   * @readonly
   */
  protected readonly labelId: string = inject(_IdGenerator).getId('cw-sidebar-group-');

  /**
   * Property classes
   *
   * @description
   * Layout classes for the current sidebar state.
   *
   * @type {Signal<"flex w-full flex-col items-center gap-1" | "flex flex-col gap-px">}
   * @readonly
   */
  protected readonly classes: Signal<
    'flex w-full flex-col items-center gap-1' | 'flex flex-col gap-px'
  > = computed(() =>
    this.sidebar.rail() ? 'flex w-full flex-col items-center gap-1' : 'flex flex-col gap-px',
  );

  /**
   * Property headingClasses
   *
   * @description
   * Heading classes for expanded and icon-rail layouts.
   *
   * @type {Signal<"sr-only" | "flex h-8 items-center justify-between px-2 text-xs font-medium text-muted-foreground">}
   * @readonly
   */
  protected readonly headingClasses: Signal<
    | 'sr-only'
    | 'flex h-8 items-center justify-between px-2 text-xs font-medium text-muted-foreground'
  > = computed(() =>
    this.sidebar.rail()
      ? 'sr-only'
      : 'flex h-8 items-center justify-between px-2 text-xs font-medium text-muted-foreground',
  );
  // #endregion
}
