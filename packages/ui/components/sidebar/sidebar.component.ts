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
  type InputSignal,
  type ModelSignal,
  type WritableSignal,
} from '@angular/core';

import type { CwSidebarCollapsible, CwSidebarState } from './sidebar.types';

/* Mockup App.dc.html, « Navigation des espaces »: under 768 px the sidebar is a drawer over the
   content, with a backdrop. */
/**
 * Constant MOBILE
 *
 * @description
 * Media query identifying the phone drawer layout.
 *
 * @type {string}
 */
const MOBILE: string = '(max-width: 767.98px)';

/**
 * Type Mode
 *
 * @description
 * Expanded with its labels, reduced to the icon rail, or out of the screen.
 *
 * @type {'expanded' | 'rail' | 'hidden'}
 */
type Mode = 'expanded' | 'rail' | 'hidden';

/* Literal class strings (Sidebar sheet and preview, mockup App.dc.html). The surface is the white
   `sidebar`, parted from the content by a plain `border-r`; folding animates the width, 300 ms
   `ease-snap`, instant under reduced motion. */
/**
 * Constant NAV
 *
 * @description
 * Base classes for the sidebar navigation surface.
 *
 * @type {string}
 */
const NAV: string =
  'relative flex h-full shrink-0 flex-col overflow-hidden border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-snap motion-reduce:transition-none';

/**
 * Constant NAV_MODES
 *
 * @description
 * Navigation width and border classes by layout mode.
 *
 * @type {Record<Mode, string>}
 */
const NAV_MODES: Record<Mode, string> = {
  expanded: 'w-60 border-r',
  rail: 'w-12 border-r',
  hidden: 'w-0',
};

// Only a sidebar that can collapse becomes a drawer on a phone; `none` stays in the flow.
/**
 * Constant DRAWER
 *
 * @description
 * Phone drawer positioning and elevation classes.
 *
 * @type {string}
 */
const DRAWER: string =
  'max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:shadow-xl';

/* The content keeps its 240 px while the width closes over it, and leaves with a slide, a fade and
   a 2 px blur (mockup App.dc.html). */
/**
 * Constant INNER
 *
 * @description
 * Classes for the sidebar content transition.
 *
 * @type {string}
 */
const INNER: string =
  'flex h-full min-h-0 flex-col transition-[opacity,filter,translate] duration-300 ease-snap motion-reduce:transition-none';

/**
 * Constant INNER_MODES
 *
 * @description
 * Content width and visibility classes by layout mode.
 *
 * @type {Record<Mode, string>}
 */
const INNER_MODES: Record<Mode, string> = {
  expanded: 'w-60',
  rail: 'w-12 items-center',
  hidden: 'w-60 -translate-x-3 opacity-0 blur-[2px]',
};

/**
 * Constant BODY_MODES
 *
 * @description
 * Scrollable body classes by layout mode.
 *
 * @type {Record<Mode, string>}
 */
const BODY_MODES: Record<Mode, string> = {
  expanded: 'flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-2 pt-1 pb-3',
  rail: 'flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-x-hidden overflow-y-auto py-1',
  hidden: 'flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-2 pt-1 pb-3',
};

/* Backdrop of the phone drawer, the shade of the modal backdrops (Dialog sheet). */
/**
 * Constant BACKDROP
 *
 * @description
 * Backdrop classes for the phone drawer.
 *
 * @type {string}
 */
const BACKDROP: string =
  'fixed inset-0 z-30 cursor-default bg-black/30 animate-fade-in motion-reduce:animate-none md:hidden dark:bg-black/60';

/**
 * Function watchPhone
 *
 * @description
 * Whether the screen is a phone's, following the media query. False where media queries do not exist (server rendering, test DOMs). `window.matchMedia` rather than the CDK `BreakpointObserver`: one query, and no `@angular/cdk/layout` bundle for it.
 * @returns {Signal<boolean>} Signal indicating whether the viewport uses the phone layout.
 */
function watchPhone(): Signal<boolean> {
  const view: (Window & typeof globalThis) | null = inject(DOCUMENT).defaultView;
  if (typeof view?.matchMedia !== 'function') return signal(false).asReadonly();
  const query: MediaQueryList = view.matchMedia(MOBILE);
  const matches: WritableSignal<boolean> = signal(query.matches);
  const update: (event: MediaQueryListEvent) => void = (event: MediaQueryListEvent): void => {
    matches.set(event.matches);
  };
  query.addEventListener('change', update);
  inject(DestroyRef).onDestroy(() => {
    query.removeEventListener('change', update);
  });
  return matches.asReadonly();
}

/**
 * Function isEditable
 *
 * @description
 * Whether a key press goes to a text field, where Ctrl B belongs to the field.
 *
 * @param {EventTarget | null} target - Keyboard event target to inspect.
 * @returns {boolean} Whether the target is an editable control.
 */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Component CwSidebar
 *
 * @description
 * The main navigation of the application, white like the content: instance, search, shortcuts, folding spaces and their lists, sprint progress, account; expanded or reduced to icons (Sidebar sheet of the Design System artifact, mockup `App.dc.html`). Holds an optional `cw-sidebar-header`, `cw-sidebar-group` sections of `a[cwSidebarItem]` and `cw-sidebar-space`, and an optional `cw-sidebar-footer`; the middle scrolls. It renders a `nav` named `ariaLabel`. `[(state)]` expands or collapses it (240 px or, with `collapsible="icon"`, the 48 px rail whose items show their name in a tooltip); `offcanvas` hides it, `none` never folds. Ctrl B (or ⌘ B) toggles it from anywhere outside a text field; a `button[cwSidebarToggle]` does too. Under 768 px a collapsible sidebar is a drawer over the content: it starts collapsed, opens with a backdrop, and closes on the backdrop, on Escape and when an item is followed. A hidden sidebar is `inert`. The consumer remembers the state per user.
 */
@Component({
  selector: 'cw-sidebar',
  exportAs: 'cwSidebar',
  host: {
    class: 'contents',
    '[attr.data-state]': 'state()',
    '[attr.data-collapsible]': 'collapsible()',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  templateUrl: './sidebar.component.html',
})
export class CwSidebar {
  // #region Properties
  /**
   * Property state
   *
   * @description
   * Expanded or collapsed; `[(state)]`.
   *
   * @type {ModelSignal<CwSidebarState>}
   * @readonly
   */
  public readonly state: ModelSignal<CwSidebarState> = model<CwSidebarState>('expanded');

  /**
   * Property collapsible
   *
   * @description
   * How the sidebar reduces: the icon rail, out of the screen, or never.
   *
   * @type {InputSignal<CwSidebarCollapsible>}
   * @readonly
   */
  public readonly collapsible: InputSignal<CwSidebarCollapsible> =
    input<CwSidebarCollapsible>('icon');

  /**
   * Property ariaLabel
   *
   * @description
   * Name of the navigation landmark.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input('Navigation principale');

  /**
   * Property closeLabel
   *
   * @description
   * Name of the drawer's backdrop, which closes it on a phone.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly closeLabel: InputSignal<string> = input('Fermer la barre latérale');

  /**
   * Property id
   *
   * @description
   * Id of the `nav`, referenced by the toggles' `aria-controls`.
   *
   * @type {string}
   * @readonly
   */
  public readonly id: string = inject(_IdGenerator).getId('cw-sidebar-');

  /**
   * Property mobile
   *
   * @description
   * Whether the viewport uses the phone layout.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  private readonly mobile: Signal<boolean> = watchPhone();

  /**
   * Property collapsed
   *
   * @description
   * Whether the sidebar is collapsed, a `none` sidebar never being.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly collapsed: Signal<boolean> = computed(
    () => this.collapsible() !== 'none' && this.state() === 'collapsed',
  );

  /**
   * Property rail
   *
   * @description
   * Whether the sidebar is the icon rail: its items show icons and tooltips only.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly rail: Signal<boolean> = computed(
    () => this.collapsed() && this.collapsible() === 'icon' && !this.mobile(),
  );

  /**
   * Property mode
   *
   * @description
   * Current expanded, icon-rail or hidden layout.
   *
   * @type {Signal<Mode>}
   * @readonly
   */
  private readonly mode: Signal<Mode> = computed<Mode>(() => {
    if (!this.collapsed()) return 'expanded';
    return this.rail() ? 'rail' : 'hidden';
  });

  /**
   * Property drawer
   *
   * @description
   * Whether the sidebar uses the phone drawer layout.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  private readonly drawer: Signal<boolean> = computed(
    () => this.collapsible() !== 'none' && this.mobile(),
  );

  /**
   * Property hidden
   *
   * @description
   * Whether the sidebar is hidden.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hidden: Signal<boolean> = computed(() => this.mode() === 'hidden');

  /**
   * Property backdrop
   *
   * @description
   * Whether the drawer backdrop is visible.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly backdrop: Signal<boolean> = computed(() => this.drawer() && !this.collapsed());

  /**
   * Property backdropClasses
   *
   * @description
   * Classes used by the drawer backdrop.
   *
   * @type {string}
   * @readonly
   */
  protected readonly backdropClasses: string = BACKDROP;

  /**
   * Property navClasses
   *
   * @description
   * Navigation classes for the current layout.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly navClasses: Signal<string> = computed(
    () => `${NAV} ${NAV_MODES[this.mode()]} ${this.collapsible() === 'none' ? '' : DRAWER}`,
  );

  /**
   * Property innerClasses
   *
   * @description
   * Content classes for the current layout.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly innerClasses: Signal<string> = computed(
    () => `${INNER} ${INNER_MODES[this.mode()]}`,
  );

  /**
   * Property bodyClasses
   *
   * @description
   * Scrollable body classes for the current layout.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly bodyClasses: Signal<string> = computed(() => BODY_MODES[this.mode()]);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Coordinates the component lifecycle and responsive behavior.
   *
   * @constructor
   */
  public constructor() {
    // Mockup App.dc.html: on a small screen the sidebar starts closed, the content first.
    effect(() => {
      if (this.drawer()) {
        untracked(() => {
          this.collapse();
        });
      }
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method toggle
   *
   * @description
   * Expands a collapsed sidebar and collapses an expanded one.
   */
  public toggle(): void {
    if (this.collapsed()) this.expand();
    else this.collapse();
  }

  /**
   * Method expand
   *
   * @description
   * Shows the labels (opens the drawer on a phone).
   */
  public expand(): void {
    this.state.set('expanded');
  }

  /**
   * Method collapse
   *
   * @description
   * Reduces the sidebar to its rail, or hides it; nothing for a `none` sidebar.
   */
  public collapse(): void {
    if (this.collapsible() !== 'none') this.state.set('collapsed');
  }

  /**
   * Method itemActivated
   *
   * @description
   * An item was followed: the phone drawer gives the screen back to the content.
   */
  public itemActivated(): void {
    if (this.drawer()) this.collapse();
  }

  /**
   * Method onDocumentKeydown
   *
   * @description
   * Handles Escape and the sidebar toggle shortcut.
   *
   * @param {KeyboardEvent} event - Keyboard event from the sidebar or space.
   */
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.collapsible() === 'none') return;
    if (event.key === 'Escape' && this.backdrop()) {
      this.collapse();
      return;
    }
    const mod: boolean = event.ctrlKey || event.metaKey;
    if (mod && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'b') {
      if (isEditable(event.target)) return;
      event.preventDefault();
      this.toggle();
    }
  }
  // #endregion
}
