import { NgTemplateOutlet } from '@angular/common';
import { _IdGenerator } from '@angular/cdk/a11y';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  viewChild,
  type InputSignal,
  type ModelSignal,
  type Signal,
} from '@angular/core';
import { CwRipple, ɵFOCUS, ɵFOCUS_INSET } from '@cadenway/ui/core';
import { CwTooltip } from '@cadenway/ui/components/tooltip';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import { SIDEBAR_ITEM } from '../sidebar-item.token';
import { SIDEBAR_SPACE } from '../sidebar-space.token';
import type { CwSidebarItem } from '../sidebar-item/sidebar-item.component';
import { CwSidebar } from '../sidebar.component';
import type { CwSidebarSpaceColor } from '../sidebar.types';

/* The space colors of the mockup palette (App.dc.html, `LOOK_COLORS`), as literal classes so
   Tailwind finds them; the consumer gives the key, never a class. */
/**
 * Constant COLORS
 *
 * @description
 * Literal icon and initial color classes by space color.
 *
 * @type {Record<CwSidebarSpaceColor, string>}
 */
const COLORS: Record<CwSidebarSpaceColor, string> = {
  neutral: 'text-muted-foreground',
  amethyste: 'text-amethyste',
  indigo: 'text-indigo',
  azur: 'text-azur',
  lagon: 'text-lagon',
  jade: 'text-jade',
  olive: 'text-olive',
  balise: 'text-balise',
  cornaline: 'text-cornaline',
  grenat: 'text-grenat',
  rose: 'text-rose',
  fuchsia: 'text-fuchsia',
  ardoise: 'text-ardoise',
};

/* Mockup App.dc.html, « Navigation des espaces »: chevron, colored mark, name, total. */
/**
 * Constant TRIGGER
 *
 * @description
 * Classes for an expanded space trigger.
 *
 * @type {string}
 */
const TRIGGER: string =
  'relative isolate flex h-8 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm transition-colors hover:bg-accent [&_ng-icon]:shrink-0 ' +
  ɵFOCUS_INSET;

/* In the rail a space is one 32 px button; it is `bg-selected` when it holds the current page
   (Sidebar sheet, "États": « Courant dans un espace replié »). */
/**
 * Constant RAIL
 *
 * @description
 * Classes for an icon-only sidebar link.
 *
 * @type {string}
 */
const RAIL: string =
  'relative isolate flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md transition-colors hover:bg-accent data-[active=true]:bg-selected ' +
  ɵFOCUS;

/* Sidebar sheet, "Mouvement": grid rows from 0fr to 1fr with a fade, 300 ms `ease-snap`. */
/**
 * Constant CONTENT
 *
 * @description
 * Classes for the animated list of space items.
 *
 * @type {string}
 */
const CONTENT: string =
  'grid transition-[grid-template-rows,opacity] duration-300 ease-snap motion-reduce:transition-none ' +
  'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr]';

/**
 * Component CwSidebarSpace
 *
 * @description
 * A folding space of the sidebar and its lists (Sidebar sheet of the Design System artifact, mockup `App.dc.html`). Put it in a `cw-sidebar-group`, its `a[cwSidebarItem]` lists inside. Its trigger shows a chevron, the space's mark (`icon`, an ng-icons name the consumer registers, or else the first letter of `name`) in `color`, the `name` and the optional `count`; actions projected with the `cwSidebarSpaceAction` attribute appear on hover in place of the count. `[(expanded)]` opens it: click, Enter and Space toggle, → opens and ← closes; the lists slide open under a rule (300 ms). Closed, they are `inert`. In the icon rail the space is one button with a tooltip, `bg-selected` when it holds the current page; pressing it expands the sidebar and opens the space.
 */
@Component({
  selector: 'cw-sidebar-space',
  imports: [NgIcon, NgTemplateOutlet, CwTooltip, CwRipple],
  providers: [
    provideIcons({ phosphorCaretRightBold }),
    { provide: SIDEBAR_SPACE, useExisting: forwardRef(() => CwSidebarSpace) },
  ],
  host: {
    '[class]': 'sidebar.rail() ? "flex flex-col items-center" : "flex flex-col"',
    '[attr.data-state]': 'state()',
  },
  templateUrl: './sidebar-space.component.html',
})
export class CwSidebarSpace {
  // #region Properties
  /**
   * Property name
   *
   * @description
   * Name of the space (« Produit »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly name: InputSignal<string> = input.required<string>();

  /**
   * Property icon
   *
   * @description
   * Name of the space's icon; the first letter of the name without it.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly icon: InputSignal<string | undefined> = input<string>();

  /**
   * Property color
   *
   * @description
   * Hue of the icon or the letter.
   *
   * @type {InputSignal<CwSidebarSpaceColor>}
   * @readonly
   */
  public readonly color: InputSignal<CwSidebarSpaceColor> = input<CwSidebarSpaceColor>('neutral');

  /**
   * Property count
   *
   * @description
   * Total shown on the right of the trigger (open tasks of its lists).
   *
   * @type {InputSignal<number | null | undefined>}
   * @readonly
   */
  public readonly count: InputSignal<number | null | undefined> = input<number | null | undefined>(
    undefined,
  );

  /**
   * Property expanded
   *
   * @description
   * Whether the lists show; `[(expanded)]`.
   *
   * @type {ModelSignal<boolean>}
   * @readonly
   */
  public readonly expanded: ModelSignal<boolean> = model(false);

  /**
   * Property sidebar
   *
   * @description
   * Containing sidebar providing the current layout.
   *
   * @type {CwSidebar}
   * @readonly
   */
  protected readonly sidebar: CwSidebar = inject(CwSidebar);

  /**
   * Property injector
   *
   * @description
   * Injector used for work scheduled after rendering.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property items
   *
   * @description
   * Sidebar items projected into this space.
   *
   * @type {Signal<readonly CwSidebarItem[]>}
   * @readonly
   */
  private readonly items: Signal<readonly CwSidebarItem[]> = contentChildren(SIDEBAR_ITEM, {
    descendants: true,
  });

  /**
   * Property trigger
   *
   * @description
   * Expanded-space button used when restoring focus.
   *
   * @type {Signal<ElementRef<HTMLButtonElement> | undefined>}
   * @readonly
   */
  private readonly trigger: Signal<ElementRef<HTMLButtonElement> | undefined> = viewChild<
    string,
    ElementRef<HTMLButtonElement>
  >('trigger', {
    read: ElementRef,
  });

  /**
   * Property ids
   *
   * @description
   * Identifier generator for the space controls.
   *
   * @type {_IdGenerator}
   * @readonly
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property triggerId
   *
   * @description
   * Unique identifier of the space trigger.
   *
   * @type {string}
   * @readonly
   */
  protected readonly triggerId: string = this.ids.getId('cw-sidebar-space-');

  /**
   * Property contentId
   *
   * @description
   * Unique identifier of the space content.
   *
   * @type {string}
   * @readonly
   */
  protected readonly contentId: string = this.ids.getId('cw-sidebar-space-content-');

  /**
   * Property state
   *
   * @description
   * Open or closed state of the space content.
   *
   * @type {Signal<"open" | "closed">}
   * @readonly
   */
  protected readonly state: Signal<'open' | 'closed'> = computed(() =>
    this.expanded() ? 'open' : 'closed',
  );

  /**
   * Property hasActive
   *
   * @description
   * Whether the space contains the current page.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasActive: Signal<boolean> = computed(() =>
    this.items().some((item) => item.active()),
  );

  /**
   * Property hasCount
   *
   * @description
   * Whether a count was supplied.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasCount: Signal<boolean> = computed(() => {
    const count: number | null | undefined = this.count();
    return count !== null && count !== undefined;
  });

  /**
   * Property initial
   *
   * @description
   * First letter of the space name in uppercase.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly initial: Signal<string> = computed(() =>
    this.name().trim().charAt(0).toUpperCase(),
  );

  /**
   * Property markClasses
   *
   * @description
   * Classes for the colored space icon or initial.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly markClasses: Signal<string> = computed(
    () =>
      `flex size-5 shrink-0 items-center justify-center text-xs font-semibold [--ng-icon__size:1rem] ${COLORS[this.color()]}`,
  );

  /**
   * Property contentClasses
   *
   * @description
   * Content classes for the current sidebar layout.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly contentClasses: Signal<string> = computed(() =>
    this.sidebar.rail() ? 'hidden' : CONTENT,
  );

  /**
   * Property triggerClasses
   *
   * @description
   * Classes for the expanded-space trigger.
   *
   * @type {string}
   * @readonly
   */
  protected readonly triggerClasses: string = TRIGGER;

  /**
   * Property railClasses
   *
   * @description
   * Classes for the space button in the icon rail.
   *
   * @type {string}
   * @readonly
   */
  protected readonly railClasses: string = RAIL;
  // #endregion

  // #region Methods
  /**
   * Method toggle
   *
   * @description
   * Opens closed lists and closes open ones.
   */
  public toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }

  /**
   * Method onKeydown
   *
   * @description
   * Opens or closes the space for horizontal arrow keys.
   *
   * @param {KeyboardEvent} event - Keyboard event from the sidebar or space.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    // Sidebar sheet, "Clavier": → opens, ← closes the space.
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.expanded.set(event.key === 'ArrowRight');
    }
  }

  /**
   * Method openFromRail
   *
   * @description
   * Expands the sidebar and space, then focuses the trigger.
   */
  protected openFromRail(): void {
    this.sidebar.expand();
    this.expanded.set(true);
    // The rail's button is gone once the sidebar is expanded: the focus moves to the trigger.
    afterNextRender(
      () => {
        this.trigger()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }
  // #endregion
}
