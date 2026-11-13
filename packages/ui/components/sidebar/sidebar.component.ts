import { _IdGenerator } from '@angular/cdk/a11y';
import {
  Component,
  DOCUMENT,
  DestroyRef,
  type Signal,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';

import type { CwSidebarCollapsible, CwSidebarState } from './sidebar.types';

/* Mockup App.dc.html, « Navigation des espaces »: under 768 px the sidebar is a drawer over the
   content, with a backdrop. */
const MOBILE = '(max-width: 767.98px)';

/** Expanded with its labels, reduced to the icon rail, or out of the screen. */
type Mode = 'expanded' | 'rail' | 'hidden';

/* Literal class strings (Sidebar sheet and preview, mockup App.dc.html). The surface is the white
   `sidebar`, parted from the content by a plain `border-r`; folding animates the width, 300 ms
   `ease-snap`, instant under reduced motion. */
const NAV =
  'relative flex h-full shrink-0 flex-col overflow-hidden border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-snap motion-reduce:transition-none';

const NAV_MODES: Record<Mode, string> = {
  expanded: 'w-60 border-r',
  rail: 'w-12 border-r',
  hidden: 'w-0',
};

// Only a sidebar that can collapse becomes a drawer on a phone; `none` stays in the flow.
const DRAWER = 'max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:shadow-xl';

/* The content keeps its 240 px while the width closes over it, and leaves with a slide, a fade and
   a 2 px blur (mockup App.dc.html). */
const INNER =
  'flex h-full min-h-0 flex-col transition-[opacity,filter,translate] duration-300 ease-snap motion-reduce:transition-none';

const INNER_MODES: Record<Mode, string> = {
  expanded: 'w-60',
  rail: 'w-12 items-center',
  hidden: 'w-60 -translate-x-3 opacity-0 blur-[2px]',
};

const BODY_MODES: Record<Mode, string> = {
  expanded: 'flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-2 pt-1 pb-3',
  rail: 'flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-x-hidden overflow-y-auto py-1',
  hidden: 'flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-2 pt-1 pb-3',
};

/* Backdrop of the phone drawer, the shade of the modal backdrops (Dialog sheet). */
const BACKDROP =
  'fixed inset-0 z-30 cursor-default bg-black/30 animate-fade-in motion-reduce:animate-none md:hidden dark:bg-black/60';

/**
 * Whether the screen is a phone's, following the media query. False where media queries do not
 * exist (server rendering, test DOMs). `window.matchMedia` rather than the CDK `BreakpointObserver`:
 * one query, and no `@angular/cdk/layout` bundle for it.
 */
function watchPhone(): Signal<boolean> {
  const view = inject(DOCUMENT).defaultView;
  if (typeof view?.matchMedia !== 'function') return signal(false).asReadonly();
  const query = view.matchMedia(MOBILE);
  const matches = signal(query.matches);
  const update = (event: MediaQueryListEvent): void => {
    matches.set(event.matches);
  };
  query.addEventListener('change', update);
  inject(DestroyRef).onDestroy(() => {
    query.removeEventListener('change', update);
  });
  return matches.asReadonly();
}

/** Whether a key press goes to a text field, where Ctrl B belongs to the field. */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * The main navigation of the application, white like the content: instance, search, shortcuts,
 * folding spaces and their lists, sprint progress, account; expanded or reduced to icons (Sidebar
 * sheet of the Design System artifact, mockup `App.dc.html`).
 *
 * Holds an optional `cw-sidebar-header`, `cw-sidebar-group` sections of `a[cwSidebarItem]` and
 * `cw-sidebar-space`, and an optional `cw-sidebar-footer`; the middle scrolls. It renders a `nav`
 * named `ariaLabel`. `[(state)]` expands or collapses it (240 px or, with `collapsible="icon"`,
 * the 48 px rail whose items show their name in a tooltip); `offcanvas` hides it, `none` never
 * folds. Ctrl B (or ⌘ B) toggles it from anywhere outside a text field; a `button[cwSidebarToggle]`
 * does too. Under 768 px a collapsible sidebar is a drawer over the content: it starts collapsed,
 * opens with a backdrop, and closes on the backdrop, on Escape and when an item is followed. A
 * hidden sidebar is `inert`. The consumer remembers the state per user.
 */
@Component({
  selector: 'cw-sidebar',
  exportAs: 'cwSidebar',
  host: {
    // The host leaves the layout to the `nav` and the drawer's backdrop, its two children.
    class: 'contents',
    '[attr.data-state]': 'state()',
    '[attr.data-collapsible]': 'collapsible()',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  templateUrl: './sidebar.component.html',
})
export class CwSidebar {
  /** Expanded or collapsed; `[(state)]`. */
  readonly state = model<CwSidebarState>('expanded');
  /** How the sidebar reduces: the icon rail, out of the screen, or never. */
  readonly collapsible = input<CwSidebarCollapsible>('icon');
  /** Name of the navigation landmark. */
  readonly ariaLabel = input('Navigation principale');
  /** Name of the drawer's backdrop, which closes it on a phone. */
  readonly closeLabel = input('Fermer la barre latérale');

  /** Id of the `nav`, referenced by the toggles' `aria-controls`. */
  readonly id = inject(_IdGenerator).getId('cw-sidebar-');

  private readonly mobile = watchPhone();

  /** Whether the sidebar is collapsed, a `none` sidebar never being. */
  readonly collapsed = computed(
    () => this.collapsible() !== 'none' && this.state() === 'collapsed',
  );
  /** Whether the sidebar is the icon rail: its items show icons and tooltips only. */
  readonly rail = computed(
    () => this.collapsed() && this.collapsible() === 'icon' && !this.mobile(),
  );

  private readonly mode = computed<Mode>(() => {
    if (!this.collapsed()) return 'expanded';
    return this.rail() ? 'rail' : 'hidden';
  });
  private readonly drawer = computed(() => this.collapsible() !== 'none' && this.mobile());

  protected readonly hidden = computed(() => this.mode() === 'hidden');
  protected readonly backdrop = computed(() => this.drawer() && !this.collapsed());
  protected readonly backdropClasses = BACKDROP;
  protected readonly navClasses = computed(
    () => `${NAV} ${NAV_MODES[this.mode()]} ${this.collapsible() === 'none' ? '' : DRAWER}`,
  );
  protected readonly innerClasses = computed(() => `${INNER} ${INNER_MODES[this.mode()]}`);
  protected readonly bodyClasses = computed(() => BODY_MODES[this.mode()]);

  constructor() {
    // Mockup App.dc.html: on a small screen the sidebar starts closed, the content first.
    effect(() => {
      if (this.drawer()) {
        untracked(() => {
          this.collapse();
        });
      }
    });
  }

  /** Expands a collapsed sidebar and collapses an expanded one. */
  toggle(): void {
    if (this.collapsed()) this.expand();
    else this.collapse();
  }

  /** Shows the labels (opens the drawer on a phone). */
  expand(): void {
    this.state.set('expanded');
  }

  /** Reduces the sidebar to its rail, or hides it; nothing for a `none` sidebar. */
  collapse(): void {
    if (this.collapsible() !== 'none') this.state.set('collapsed');
  }

  /** An item was followed: the phone drawer gives the screen back to the content. */
  itemActivated(): void {
    if (this.drawer()) this.collapse();
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.collapsible() === 'none') return;
    if (event.key === 'Escape' && this.backdrop()) {
      this.collapse();
      return;
    }
    const mod = event.ctrlKey || event.metaKey;
    if (mod && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'b') {
      if (isEditable(event.target)) return;
      event.preventDefault();
      this.toggle();
    }
  }
}
