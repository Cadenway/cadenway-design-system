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
} from '@angular/core';
import { CwRipple, ɵFOCUS, ɵFOCUS_INSET } from '@cadenway/ui/core';
import { CwTooltip } from '@cadenway/ui/tooltip';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import { SIDEBAR_ITEM } from '../sidebar-item.token';
import { SIDEBAR_SPACE } from '../sidebar-space.token';
import { CwSidebar } from '../sidebar.component';
import type { CwSidebarSpaceColor } from '../sidebar.types';

/* The space colors of the mockup palette (App.dc.html, `LOOK_COLORS`), as literal classes so
   Tailwind finds them; the consumer gives the key, never a class. */
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
const TRIGGER =
  'relative isolate flex h-8 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm transition-colors hover:bg-accent [&_ng-icon]:shrink-0 ' +
  ɵFOCUS_INSET;

/* In the rail a space is one 32 px button; it is `bg-selected` when it holds the current page
   (Sidebar sheet, "États": « Courant dans un espace replié »). */
const RAIL =
  'relative isolate flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md transition-colors hover:bg-accent data-[active=true]:bg-selected ' +
  ɵFOCUS;

/* Sidebar sheet, "Mouvement": grid rows from 0fr to 1fr with a fade, 300 ms `ease-snap`. */
const CONTENT =
  'grid transition-[grid-template-rows,opacity] duration-300 ease-snap motion-reduce:transition-none ' +
  'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr]';

/**
 * A folding space of the sidebar and its lists (Sidebar sheet of the Design System artifact, mockup
 * `App.dc.html`).
 *
 * Put it in a `cw-sidebar-group`, its `a[cwSidebarItem]` lists inside. Its trigger shows a chevron,
 * the space's mark (`icon`, an ng-icons name the consumer registers, or else the first letter of
 * `name`) in `color`, the `name` and the optional `count`; actions projected with the
 * `cwSidebarSpaceAction` attribute appear on hover in place of the count. `[(expanded)]` opens it:
 * click, Enter and Space toggle, → opens and ← closes; the lists slide open under a rule (300 ms).
 * Closed, they are `inert`. In the icon rail the space is one button with a tooltip, `bg-selected`
 * when it holds the current page; pressing it expands the sidebar and opens the space.
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
  /** Name of the space (« Produit »). */
  readonly name = input.required<string>();
  /** Name of the space's icon; the first letter of the name without it. */
  readonly icon = input<string>();
  /** Hue of the icon or the letter. */
  readonly color = input<CwSidebarSpaceColor>('neutral');
  /** Total shown on the right of the trigger (open tasks of its lists). */
  readonly count = input<number | null | undefined>(undefined);
  /** Whether the lists show; `[(expanded)]`. */
  readonly expanded = model(false);

  protected readonly sidebar = inject(CwSidebar);
  private readonly injector = inject(Injector);
  private readonly items = contentChildren(SIDEBAR_ITEM, { descendants: true });
  private readonly trigger = viewChild<string, ElementRef<HTMLButtonElement>>('trigger', {
    read: ElementRef,
  });
  private readonly ids = inject(_IdGenerator);
  protected readonly triggerId = this.ids.getId('cw-sidebar-space-');
  protected readonly contentId = this.ids.getId('cw-sidebar-space-content-');

  protected readonly state = computed(() => (this.expanded() ? 'open' : 'closed'));
  protected readonly hasActive = computed(() => this.items().some((item) => item.active()));
  protected readonly hasCount = computed(() => {
    const count = this.count();
    return count !== null && count !== undefined;
  });
  protected readonly initial = computed(() => this.name().trim().charAt(0).toUpperCase());
  protected readonly markClasses = computed(
    () =>
      `flex size-5 shrink-0 items-center justify-center text-xs font-semibold [--ng-icon__size:1rem] ${COLORS[this.color()]}`,
  );
  protected readonly contentClasses = computed(() => (this.sidebar.rail() ? 'hidden' : CONTENT));
  protected readonly triggerClasses = TRIGGER;
  protected readonly railClasses = RAIL;

  /** Opens closed lists and closes open ones. */
  toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    // Sidebar sheet, "Clavier": → opens, ← closes the space.
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.expanded.set(event.key === 'ArrowRight');
    }
  }

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
}
