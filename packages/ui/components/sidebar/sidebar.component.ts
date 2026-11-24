import { _IdGenerator } from '@angular/cdk/a11y';
import {
  afterNextRender,
  Component,
  DOCUMENT,
  DestroyRef,
  type Signal,
  computed,
  effect,
  inject,
  Injector,
  input,
  model,
  signal,
  untracked,
  type InputSignal,
  type ModelSignal,
  type WritableSignal,
} from '@angular/core';
import { SIDEBAR_LABELS } from './sidebar-labels.token';

import type {
  CwSidebarBackdrop,
  CwSidebarCollapsible,
  CwSidebarOverlayBelow,
  CwSidebarState,
} from './sidebar.types';

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
const MOBILE: string = '(width < 48rem)';

/**
 * Constant TABLET
 *
 * @description
 * Media query of a tablet, between the phone drawer and the 1024 px desktop layout, in the rem of
 * Tailwind's `md` and `lg` so the script and the `max-md:` and `max-lg:` classes switch together,
 * whatever the default font size; `overlayBelow="lg"` floats the expanded sidebar there.
 *
 * @type {string}
 */
const TABLET: string = '(48rem <= width < 64rem)';

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

/**
 * Constant TABLET_OVERLAY
 *
 * @description
 * Mockup `App.dc.html`: under 1024 px the sidebar floats over the content, below the phone drawer's
 * layer (`max-md:z-40` wins on a phone); its `shadow-md` is set while it is expanded.
 *
 * @type {string}
 */
const TABLET_OVERLAY: string = 'max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-30';

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

/**
 * Constant BACKDROP_SCOPES
 *
 * @description
 * Extent of the backdrop: the viewport, or the nearest positioned container (mockup `App.dc.html`:
 * the phone backdrop covers the panel only, not the bottom tab bar).
 *
 * @type {Record<CwSidebarBackdrop, string>}
 */
const BACKDROP_SCOPES: Record<CwSidebarBackdrop, string> = {
  viewport: 'fixed inset-0 z-30 cursor-default',
  container: 'absolute inset-0 z-30 cursor-default',
};

/**
 * Constant BACKDROP_SHADES
 *
 * @description
 * Look of the backdrop: the shade of the modal backdrops (Dialog sheet) behind the phone drawer;
 * transparent behind the tablet overlay, which the mockup leaves over the visible content, so the
 * backdrop only catches the outside click that closes it.
 *
 * @type {Record<'phone' | 'tablet', string>}
 */
const BACKDROP_SHADES: Record<'phone' | 'tablet', string> = {
  phone: 'bg-black/30 animate-fade-in motion-reduce:animate-none md:hidden dark:bg-black/60',
  tablet: 'bg-transparent max-md:hidden lg:hidden',
};

/**
 * Function watchMedia
 *
 * @description
 * Whether a media query matches, following its changes. False where media queries do not exist (server rendering, test DOMs). `window.matchMedia` rather than the CDK `BreakpointObserver`: one query each, and no `@angular/cdk/layout` bundle for it.
 *
 * @param {string} media - The media query.
 * @returns {Signal<boolean>} Signal indicating whether the media query matches.
 */
function watchMedia(media: string): Signal<boolean> {
  const view: (Window & typeof globalThis) | null = inject(DOCUMENT).defaultView;
  if (typeof view?.matchMedia !== 'function') return signal(false).asReadonly();
  const query: MediaQueryList = view.matchMedia(media);
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
 * The main navigation of the application, white like the content: instance, search, shortcuts, folding spaces and their lists, sprint progress, account; expanded or reduced to icons (Sidebar sheet of the Design System artifact, mockup `App.dc.html`). Holds an optional `cw-sidebar-header`, `cw-sidebar-group` sections of `a[cwSidebarItem]` and `cw-sidebar-space`, and an optional `cw-sidebar-footer`; the middle scrolls. It renders a `nav` named `ariaLabel`. `[(state)]` expands or collapses it (240 px or, with `collapsible="icon"`, the 48 px rail whose items show their name in a tooltip); `offcanvas` hides it, `none` never folds. Ctrl B (or ⌘ B) toggles it from anywhere outside a text field; a `button[cwSidebarToggle]` does too. Under 768 px a collapsible sidebar is a drawer over the content: it starts collapsed, opens with a backdrop, and closes on the backdrop, on Escape and when an item is followed. With `overlayBelow="lg"` it also floats over the content between 768 and 1023 px (`shadow-md`, the mockup's tablet layout): it starts collapsed there, hides instead of showing the icon rail, and closes on Escape and on a click outside it (a transparent backdrop), but stays open when an item is followed, as in the mockup; when the tablet layout closed it, it opens again at a desktop width. `backdrop="container"` keeps the backdrop inside the nearest positioned ancestor (the content panel) instead of the viewport. A hidden sidebar is `inert`. The consumer remembers the state per user.
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
  public readonly ariaLabel: InputSignal<string> = input<string>(inject(SIDEBAR_LABELS).ariaLabel);

  /**
   * Property overlayBelow
   *
   * @description
   * Breakpoint under which the expanded sidebar floats over the content: `md`, the phone drawer
   * only (the default); `lg`, also on a tablet. Without effect on a `none` sidebar. With `lg`, use
   * `backdrop="container"` when other controls sit beside the content panel (the app rail): a
   * viewport backdrop would catch their first click to close the sidebar.
   *
   * @type {InputSignal<CwSidebarOverlayBelow>}
   * @readonly
   */
  public readonly overlayBelow: InputSignal<CwSidebarOverlayBelow> =
    input<CwSidebarOverlayBelow>('md');

  /**
   * Property backdrop
   *
   * @description
   * Extent of the backdrop of a floating sidebar: the `viewport` (the default) or the nearest
   * positioned `container`, which must then hold the sidebar.
   *
   * @type {InputSignal<CwSidebarBackdrop>}
   * @readonly
   */
  public readonly backdrop: InputSignal<CwSidebarBackdrop> = input<CwSidebarBackdrop>('viewport');

  /**
   * Property closeLabel
   *
   * @description
   * Name of the backdrop, which closes the floating sidebar (the phone drawer, the tablet overlay).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly closeLabel: InputSignal<string> = input<string>(
    inject(SIDEBAR_LABELS).closeLabel,
  );

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
  private readonly mobile: Signal<boolean> = watchMedia(MOBILE);

  /**
   * Property document
   *
   * @description
   * The document holding the sidebar, for the focus moves of the floating layouts.
   *
   * @type {Document}
   * @readonly
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property opener
   *
   * @description
   * The element that had the focus when a floating sidebar was expanded, given the focus back when
   * it closes while the focus is inside it; null otherwise.
   *
   * @type {HTMLElement | null}
   */
  private opener: HTMLElement | null = null;

  /**
   * Property injector
   *
   * @description
   * Injector of the sidebar, to give the focus back after the collapsed state has rendered.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property tablet
   *
   * @description
   * Whether the viewport is a tablet's, between 768 and 1023 px.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  private readonly tablet: Signal<boolean> = watchMedia(TABLET);

  /**
   * Property overlay
   *
   * @description
   * Whether the sidebar uses the tablet overlay layout.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  private readonly overlay: Signal<boolean> = computed(
    () => this.collapsible() !== 'none' && this.overlayBelow() === 'lg' && this.tablet(),
  );

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
    () => this.collapsed() && this.collapsible() === 'icon' && !this.mobile() && !this.overlay(),
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
   * Property floating
   *
   * @description
   * Whether the sidebar floats over the content: the phone drawer or the tablet overlay.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  private readonly floating: Signal<boolean> = computed(() => this.drawer() || this.overlay());

  /**
   * Property backdropShown
   *
   * @description
   * Whether the backdrop of an expanded floating sidebar is rendered.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly backdropShown: Signal<boolean> = computed(
    () => this.floating() && !this.collapsed(),
  );

  /**
   * Property backdropClasses
   *
   * @description
   * Classes of the backdrop: its extent, and the phone shade or the transparent tablet catcher.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly backdropClasses: Signal<string> = computed(
    () =>
      `${BACKDROP_SCOPES[this.backdrop()]} ${BACKDROP_SHADES[this.overlay() ? 'tablet' : 'phone']}`,
  );

  /**
   * Property navClasses
   *
   * @description
   * Navigation classes for the current layout.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly navClasses: Signal<string> = computed(() => {
    if (this.collapsible() === 'none') return `${NAV} ${NAV_MODES[this.mode()]}`;
    const tablet: string =
      this.overlayBelow() === 'lg'
        ? `${TABLET_OVERLAY}${this.overlay() && !this.collapsed() ? ' shadow-md' : ''}`
        : '';
    return `${NAV} ${NAV_MODES[this.mode()]} ${DRAWER} ${tablet}`;
  });

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
    // Mockup App.dc.html: under 1024 px the sidebar starts closed, the content first. A sidebar the
    // tablet overlay closed opens again when the window grows back to a desktop width, so
    // snapping a desktop window to half the screen does not leave it closed for good.
    let reopen: boolean = false;
    effect(() => {
      const floating: boolean = this.floating();
      const overlay: boolean = this.overlay();
      untracked(() => {
        if (floating) {
          reopen = overlay && (reopen || !this.collapsed());
          this.collapse();
        } else if (reopen) {
          reopen = false;
          if (this.collapsed()) this.expand();
        }
      });
    });
    // Every way of opening or closing (a method, a toggle, Escape, the backdrop, the `state` model
    // bound by the consumer) goes through this transition.
    let collapsed: boolean = this.collapsed();
    effect(() => {
      const next: boolean = this.collapsed();
      if (next === collapsed) return;
      collapsed = next;
      untracked(() => {
        this.onTransition(next);
      });
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
   * Method onTransition
   *
   * @description
   * Runs when the sidebar expands or collapses, whatever closed it (a method, a toggle, Escape, the
   * backdrop, the bound `state`). A floating sidebar remembers the element that had the focus when
   * it opened; when it closes with the focus inside it, which then becomes `inert`, the focus goes
   * back to that element, or else to a toggle outside it (`aria-controls`), once the collapsed state
   * has rendered, so a toggle shown only while the sidebar is collapsed exists by then.
   *
   * @param {boolean} collapsed - Whether the sidebar has just collapsed.
   */
  private onTransition(collapsed: boolean): void {
    const nav: HTMLElement | null = this.navElement();
    const active: Element | null = this.document.activeElement;
    if (!collapsed) {
      this.opener =
        this.floating() &&
        active instanceof HTMLElement &&
        active !== this.document.body &&
        nav?.contains(active) !== true
          ? active
          : null;
      return;
    }
    const opener: HTMLElement | null = this.opener;
    this.opener = null;
    if (!this.floating() || !nav?.contains(active)) return;
    afterNextRender(
      () => {
        // Leave a focus the consumer moved elsewhere in the meantime.
        const current: Element | null = this.document.activeElement;
        if (current !== null && current !== this.document.body && !nav.contains(current)) return;
        this.restoreFocus(nav, opener);
      },
      { injector: this.injector },
    );
  }

  /**
   * Method navElement
   *
   * @description
   * The rendered `nav` of the sidebar, found by its id.
   *
   * @returns {HTMLElement | null} The navigation element, or null before it is rendered.
   */
  private navElement(): HTMLElement | null {
    return this.document.getElementById(this.id);
  }

  /**
   * Method restoreFocus
   *
   * @description
   * Gives the focus back to the opener when it is still in the document, or else to the first
   * visible toggle of this sidebar outside it (a toggle hidden at this width cannot hold it).
   *
   * @param {HTMLElement} nav - The navigation the focus leaves.
   * @param {HTMLElement | null} opener - The element that had the focus when the sidebar opened.
   */
  private restoreFocus(nav: HTMLElement, opener: HTMLElement | null): void {
    const target: HTMLElement | undefined =
      opener?.isConnected === true
        ? opener
        : Array.from(
            this.document.querySelectorAll<HTMLElement>(`[aria-controls="${this.id}"]`),
          ).find(
            (toggle: HTMLElement) =>
              !nav.contains(toggle) &&
              (typeof toggle.checkVisibility !== 'function' || toggle.checkVisibility()),
          );
    target?.focus();
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
    if (event.key === 'Escape' && this.backdropShown()) {
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
