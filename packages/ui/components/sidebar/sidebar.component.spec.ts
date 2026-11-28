import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import {
  phosphorFunnelSimpleBold,
  phosphorHouseBold,
  phosphorTrayBold,
} from '@ng-icons/phosphor-icons/bold';
import { phosphorHouseFill, phosphorTrayFill } from '@ng-icons/phosphor-icons/fill';

import { provideCwSidebarLabels } from './sidebar.providers';
import { CwSidebarFooter } from './sidebar-footer/sidebar-footer.component';
import { CwSidebarGroup } from './sidebar-group/sidebar-group.component';
import { CwSidebarHeader } from './sidebar-header/sidebar-header.component';
import { CwSidebarItem } from './sidebar-item/sidebar-item.component';
import { CwSidebarSpace } from './sidebar-space/sidebar-space.component';
import { CwSidebarToggle } from './sidebar-toggle/sidebar-toggle.directive';
import { CwSidebar } from './sidebar.component';
import type {
  CwSidebarBackdrop,
  CwSidebarCollapsible,
  CwSidebarOverlayBelow,
  CwSidebarState,
} from './sidebar.types';

/**
 * Component Host
 *
 * @description
 * Hosts a sidebar and controls its layout and active space.
 */
@Component({
  imports: [
    CwSidebar,
    CwSidebarHeader,
    CwSidebarGroup,
    CwSidebarItem,
    CwSidebarSpace,
    CwSidebarFooter,
    CwSidebarToggle,
  ],
  providers: [
    provideIcons({ phosphorHouseBold, phosphorHouseFill, phosphorTrayBold, phosphorTrayFill }),
  ],
  template: `
    <cw-sidebar
      #sidebar
      [(state)]="state"
      [collapsible]="collapsible()"
      [overlayBelow]="overlayBelow()"
      [backdrop]="backdrop()"
    >
      <cw-sidebar-header><input aria-label="Rechercher" /></cw-sidebar-header>
      <cw-sidebar-group>
        <a cwSidebarItem href="/accueil" icon="phosphorHouseBold" active>Accueil</a>
        <a cwSidebarItem href="/boite" icon="phosphorTrayBold" [count]="3" countLabel="3 non lus"
          >Boîte de réception</a
        >
      </cw-sidebar-group>
      <cw-sidebar-group label="Espaces">
        <cw-sidebar-space name="Produit" color="amethyste" [count]="89" [(expanded)]="produit">
          <a cwSidebarItem href="/l/sprint-14" [count]="18" [active]="sprintActive()">Sprint 14</a>
          <a cwSidebarItem href="/l/backlog" [count]="64">Backlog</a>
        </cw-sidebar-space>
      </cw-sidebar-group>
      <cw-sidebar-footer>Léa Martin</cw-sidebar-footer>
    </cw-sidebar>
    <button type="button" [cwSidebarToggle]="sidebar">Basculer</button>
  `,
})
class Host {
  // #region Properties
  /**
   * Property state
   *
   * @description
   * Expanded or collapsed state controlled by the fixture.
   *
   * @type {WritableSignal<CwSidebarState>}
   * @readonly
   */
  public readonly state: WritableSignal<CwSidebarState> = signal<CwSidebarState>('expanded');

  /**
   * Property collapsible
   *
   * @description
   * Configured collapse behavior.
   *
   * @type {WritableSignal<CwSidebarCollapsible>}
   * @readonly
   */
  public readonly collapsible: WritableSignal<CwSidebarCollapsible> =
    signal<CwSidebarCollapsible>('icon');

  /**
   * Property produit
   *
   * @description
   * Whether the example space is expanded.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly produit: WritableSignal<boolean> = signal(false);

  /**
   * Property overlayBelow
   *
   * @description
   * Breakpoint under which the sidebar floats over the content.
   *
   * @type {WritableSignal<CwSidebarOverlayBelow>}
   * @readonly
   */
  public readonly overlayBelow: WritableSignal<CwSidebarOverlayBelow> =
    signal<CwSidebarOverlayBelow>('md');

  /**
   * Property backdrop
   *
   * @description
   * Extent of the floating sidebar's backdrop.
   *
   * @type {WritableSignal<CwSidebarBackdrop>}
   * @readonly
   */
  public readonly backdrop: WritableSignal<CwSidebarBackdrop> =
    signal<CwSidebarBackdrop>('viewport');

  /**
   * Property sprintActive
   *
   * @description
   * Whether the sprint link is the active page.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly sprintActive: WritableSignal<boolean> = signal(true);
  // #endregion
}

// The name a link gets from its content: the text without its `aria-hidden` parts.
/**
 * Function nameFromContent
 *
 * @description
 * Reads link text while omitting content hidden from assistive technology.
 *
 * @param {HTMLElement} element - Element whose visible content is read.
 * @returns {string} Text excluding hidden content.
 */
function nameFromContent(element: HTMLElement): string {
  const copy: HTMLElement = element.cloneNode(true) as HTMLElement;
  for (const hidden of Array.from(copy.querySelectorAll('[aria-hidden="true"]'))) hidden.remove();
  return copy.textContent.replace(/\s+/g, ' ').trim();
}

/**
 * Function link
 *
 * @description
 * Finds a sidebar link by its accessible name.
 *
 * @param {HTMLElement} host - Fixture containing the requested control.
 * @param {string} name - Accessible name to match.
 * @returns {HTMLAnchorElement} Matching sidebar link.
 */
function link(host: HTMLElement, name: string): HTMLAnchorElement {
  const found: HTMLAnchorElement | undefined = Array.from(host.querySelectorAll('a')).find(
    (element) => (element.getAttribute('aria-label') ?? nameFromContent(element)) === name,
  );
  if (!found) throw new Error(`No link named ${name}`);
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a sidebar button by its accessible name.
 *
 * @param {HTMLElement} host - Fixture containing the requested control.
 * @param {string} name - Accessible name to match.
 * @returns {HTMLButtonElement} Matching sidebar button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function spaceTrigger
 *
 * @description
 * Finds the space expansion button.
 *
 * @param {HTMLElement} host - Fixture containing the requested control.
 * @returns {HTMLButtonElement} Space expansion button.
 */
function spaceTrigger(host: HTMLElement): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => element.hasAttribute('aria-expanded'),
  );
  if (!found) throw new Error('No space trigger');
  return found;
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to a fixture element.
 *
 * @param {EventTarget} target - Event target receiving the keyboard event.
 * @param {string} key - Keyboard key to dispatch.
 * @param {KeyboardEventInit} init - Additional keyboard event options.
 */
function press(target: EventTarget, key: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  );
}

describe('CwSidebar', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
    await fixture.whenStable();
  });

  afterEach(() => {
    host.remove();
  });

  it('is a named navigation of named groups, the count read after the label', () => {
    const nav: HTMLElement | null = host.querySelector('nav');
    const spaces: Element = host.querySelectorAll('cw-sidebar-group')[1];

    expect(nav?.getAttribute('aria-label')).toBe('Navigation principale');
    expect(spaces.getAttribute('role')).toBe('group');
    expect(document.getElementById(spaces.getAttribute('aria-labelledby') ?? '')?.textContent).toBe(
      'Espaces',
    );
    expect(link(host, 'Boîte de réception, 3 non lus')).toBeTruthy();
  });

  it('reads the count in the same text as the label', () => {
    const inbox: HTMLAnchorElement = link(host, 'Boîte de réception, 3 non lus');
    const label: Element | undefined = Array.from(inbox.children).find((child) =>
      child.textContent.includes('Boîte de réception'),
    );

    expect(label?.textContent.replace(/\s+/g, ' ').trim()).toBe('Boîte de réception, 3 non lus');
  });

  it('marks the current item for assistive technologies', () => {
    expect(link(host, 'Accueil').getAttribute('aria-current')).toBe('page');
    expect(link(host, 'Boîte de réception, 3 non lus').hasAttribute('aria-current')).toBe(false);
  });

  it('shows the filled icon on the current item and the bold one elsewhere', () => {
    expect(link(host, 'Accueil').querySelector('ng-icon')?.innerHTML).toBe(phosphorHouseFill);
    expect(link(host, 'Boîte de réception, 3 non lus').querySelector('ng-icon')?.innerHTML).toBe(
      phosphorTrayBold,
    );
  });

  it('opens a space on click, → and ←, through its two-way binding', async () => {
    const trigger: HTMLButtonElement = spaceTrigger(host);
    const lists: HTMLElement | null = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(lists?.hasAttribute('inert')).toBe(true);

    press(trigger, 'ArrowRight');
    await fixture.whenStable();
    expect(fixture.componentInstance.produit()).toBe(true);
    expect(lists?.hasAttribute('inert')).toBe(false);

    press(trigger, 'ArrowLeft');
    await fixture.whenStable();
    expect(fixture.componentInstance.produit()).toBe(false);

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('collapses to the icon rail with the toggle, the items named by label and count', async () => {
    const toggle: HTMLButtonElement = button(host, 'Replier la barre latérale');
    expect(toggle.getAttribute('aria-controls')).toBe(host.querySelector('nav')?.id);

    toggle.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.state()).toBe('collapsed');
    expect(toggle.getAttribute('aria-label')).toBe('Déplier la barre latérale');
    expect(link(host, 'Boîte de réception, 3 non lus')).toBeTruthy();
    expect(host.querySelector('nav')?.hasAttribute('inert')).toBe(false);
  });

  it('shows the name and count in a tooltip on keyboard focus in the rail', async () => {
    fixture.componentInstance.state.set('collapsed');
    await fixture.whenStable();

    const inbox: HTMLAnchorElement = link(host, 'Boîte de réception, 3 non lus');
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    inbox.focus();
    await fixture.whenStable();

    const bubble: Element | null = document.querySelector('[role="tooltip"]');
    expect(bubble?.textContent).toContain('Boîte de réception · 3');

    inbox.blur();
    await fixture.whenStable();
  });

  it('expands and opens a space from its rail button, which holds the current page', async () => {
    fixture.componentInstance.state.set('collapsed');
    await fixture.whenStable();

    const rail: HTMLButtonElement = button(host, 'Produit');
    expect(rail.getAttribute('data-active')).toBe('true');

    rail.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('expanded');
    expect(fixture.componentInstance.produit()).toBe(true);
  });

  it('toggles on Ctrl B, except in a text field', async () => {
    press(document.body, 'b', { ctrlKey: true });
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');

    const search: HTMLInputElement | null = host.querySelector('input');
    if (!search) throw new Error('No search field');
    press(search, 'b', { ctrlKey: true });
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');

    press(document.body, 'B', { metaKey: true });
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('expanded');
  });

  it('hides an off-canvas sidebar out of reach when collapsed', async () => {
    fixture.componentInstance.collapsible.set('offcanvas');
    fixture.componentInstance.state.set('collapsed');
    await fixture.whenStable();

    expect(host.querySelector('nav')?.hasAttribute('inert')).toBe(true);
  });

  it('never collapses when not collapsible', async () => {
    fixture.componentInstance.collapsible.set('none');
    await fixture.whenStable();

    press(document.body, 'b', { ctrlKey: true });
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('expanded');
  });
});

describe('CwSidebar on a phone', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(async () => {
    // jsdom has no media queries: the phone query is reported matched.
    window.matchMedia = vi.fn((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
    await fixture.whenStable();
  });

  afterEach(() => {
    host.remove();
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('starts as a closed drawer, out of reach', () => {
    expect(fixture.componentInstance.state()).toBe('collapsed');
    expect(host.querySelector('nav')?.hasAttribute('inert')).toBe(true);
  });

  it('opens over a backdrop that closes it', async () => {
    button(host, 'Déplier la barre latérale').click();
    await fixture.whenStable();
    expect(host.querySelector('nav')?.hasAttribute('inert')).toBe(false);

    button(host, 'Fermer la barre latérale').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');
  });

  it('gives the focus back to its toggle when a followed item closes it', async () => {
    const toggle: HTMLButtonElement = button(host, 'Déplier la barre latérale');
    toggle.focus();
    toggle.click();
    await fixture.whenStable();
    const home: HTMLAnchorElement = link(host, 'Accueil');
    home.addEventListener('click', (event) => {
      event.preventDefault();
    });
    home.focus();
    home.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.state()).toBe('collapsed');
    expect(document.activeElement).toBe(toggle);
  });

  it('closes on Escape and when an item is followed', async () => {
    fixture.componentInstance.state.set('expanded');
    await fixture.whenStable();
    press(document.body, 'Escape');
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');

    fixture.componentInstance.state.set('expanded');
    await fixture.whenStable();
    const home: HTMLAnchorElement = link(host, 'Accueil');
    home.addEventListener('click', (event) => {
      event.preventDefault();
    });
    home.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');
  });
});

describe('CwSidebar backdrop extent', () => {
  let host: HTMLElement;

  afterEach(() => {
    host.remove();
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('keeps the phone backdrop inside its container with backdrop="container"', async () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes('width < 48rem'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
    await fixture.whenStable();
    fixture.componentInstance.state.set('expanded');
    await fixture.whenStable();

    expect(button(host, 'Fermer la barre latérale').classList.contains('fixed')).toBe(true);
    fixture.componentInstance.backdrop.set('container');
    await fixture.whenStable();
    const backdrop: HTMLButtonElement = button(host, 'Fermer la barre latérale');
    expect(backdrop.classList.contains('absolute')).toBe(true);
    expect(backdrop.classList.contains('fixed')).toBe(false);
  });
});

describe('CwSidebar on a tablet', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  /**
   * Function render
   *
   * @description
   * Renders the host on a tablet (only the 768 to 1023 px query matches) with the given overlay
   * breakpoint.
   *
   * @param {CwSidebarOverlayBelow} overlayBelow - Breakpoint under which the sidebar floats.
   * @returns {Promise<void>} Resolves once the host is stable.
   */
  async function render(overlayBelow: CwSidebarOverlayBelow): Promise<void> {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes('48rem <= width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    fixture = TestBed.createComponent(Host);
    fixture.componentInstance.overlayBelow.set(overlayBelow);
    host = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
    await fixture.whenStable();
  }

  afterEach(() => {
    host.remove();
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('stays in the flow, expanded and without backdrop by default', async () => {
    await render('md');

    expect(fixture.componentInstance.state()).toBe('expanded');
    expect(host.querySelector('button[aria-label="Fermer la barre latérale"]')).toBeNull();
  });

  it('starts hidden with overlayBelow="lg", not as the icon rail', async () => {
    await render('lg');

    expect(fixture.componentInstance.state()).toBe('collapsed');
    expect(host.querySelector('nav')?.hasAttribute('inert')).toBe(true);
    expect(host.querySelector('nav')?.classList.contains('w-0')).toBe(true);
  });

  it('floats with a shadow over a transparent backdrop that closes it', async () => {
    await render('lg');
    button(host, 'Déplier la barre latérale').click();
    await fixture.whenStable();
    const nav: HTMLElement | null = host.querySelector('nav');

    expect(nav?.hasAttribute('inert')).toBe(false);
    expect(nav?.classList.contains('shadow-md')).toBe(true);
    const backdrop: HTMLButtonElement = button(host, 'Fermer la barre latérale');
    expect(backdrop.classList.contains('bg-transparent')).toBe(true);
    backdrop.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');
  });

  it('gives the focus back to its opener when Escape or the backdrop closes it', async () => {
    await render('lg');
    const toggle: HTMLButtonElement = button(host, 'Déplier la barre latérale');
    toggle.focus();
    toggle.click();
    await fixture.whenStable();
    link(host, 'Accueil').focus();
    press(document.body, 'Escape');
    await fixture.whenStable();
    expect(document.activeElement).toBe(toggle);

    toggle.click();
    await fixture.whenStable();
    link(host, 'Accueil').focus();
    button(host, 'Fermer la barre latérale').click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(toggle);
  });

  it('falls back to a toggle outside it when it was opened without one', async () => {
    await render('lg');
    fixture.componentInstance.state.set('expanded');
    await fixture.whenStable();
    link(host, 'Accueil').focus();
    press(document.body, 'Escape');
    await fixture.whenStable();

    expect(document.activeElement).toBe(button(host, 'Déplier la barre latérale'));
  });

  it('gives the focus back when the bound state closes it', async () => {
    await render('lg');
    const toggle: HTMLButtonElement = button(host, 'Déplier la barre latérale');
    toggle.focus();
    toggle.click();
    await fixture.whenStable();
    link(host, 'Accueil').focus();
    fixture.componentInstance.state.set('collapsed');
    await fixture.whenStable();

    expect(document.activeElement).toBe(toggle);
  });

  it('opens again at a desktop width after the tablet overlay closed it', async () => {
    const tablet: { change: ((event: MediaQueryListEvent) => void) | null } = { change: null };
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes('48rem <= width'),
      media: query,
      addEventListener: (_: string, handler: (event: MediaQueryListEvent) => void): void => {
        if (query.includes('48rem <= width')) tablet.change = handler;
      },
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    fixture = TestBed.createComponent(Host);
    fixture.componentInstance.overlayBelow.set('lg');
    host = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');

    tablet.change?.({ matches: false } as MediaQueryListEvent);
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('expanded');
  });

  it('closes on Escape but stays open when an item is followed', async () => {
    await render('lg');
    fixture.componentInstance.state.set('expanded');
    await fixture.whenStable();
    const home: HTMLAnchorElement = link(host, 'Accueil');
    home.addEventListener('click', (event) => {
      event.preventDefault();
    });
    home.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('expanded');

    press(document.body, 'Escape');
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');
  });
});

/**
 * Component ConditionalToggleHost
 *
 * @description
 * A shell whose toggle exists only while the sidebar is collapsed, as in the stories' frame.
 */
@Component({
  imports: [CwSidebar, CwSidebarGroup, CwSidebarItem, CwSidebarToggle],
  template: `
    <cw-sidebar #sidebar overlayBelow="lg">
      <cw-sidebar-group>
        <a cwSidebarItem href="/accueil">Accueil</a>
      </cw-sidebar-group>
    </cw-sidebar>
    @if (sidebar.collapsed()) {
      <button type="button" [cwSidebarToggle]="sidebar">Basculer</button>
    }
  `,
})
class ConditionalToggleHost {}

describe('CwSidebar with a toggle shown only while collapsed', () => {
  it('focuses the toggle recreated after the sidebar closes', async () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes('48rem <= width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    const fixture: ComponentFixture<ConditionalToggleHost> =
      TestBed.createComponent(ConditionalToggleHost);
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
    try {
      await fixture.whenStable();
      const opener: HTMLButtonElement = button(host, 'Déplier la barre latérale');
      opener.focus();
      opener.click();
      await fixture.whenStable();
      link(host, 'Accueil').focus();
      press(document.body, 'Escape');
      await fixture.whenStable();

      expect(document.activeElement).toBe(button(host, 'Déplier la barre latérale'));
    } finally {
      host.remove();
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });
});

describe('provideCwSidebarLabels', () => {
  it('uses provided texts in the rendered fixture', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideCwSidebarLabels({ ariaLabel: 'Main navigation', collapseLabel: 'Collapse sidebar' }),
      ],
    });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[aria-label="Main navigation"]')).not.toBeNull();
    expect(host.querySelector('[aria-label="Collapse sidebar"]')).not.toBeNull();
  });
});

/**
 * Component IconHost
 *
 * @description
 * Hosts current items whose icon has no registered Fill twin, or keeps its icon on purpose.
 */
@Component({
  imports: [CwSidebar, CwSidebarGroup, CwSidebarItem],
  providers: [provideIcons({ phosphorFunnelSimpleBold, phosphorHouseBold, phosphorHouseFill })],
  template: `
    <cw-sidebar>
      <cw-sidebar-group>
        <a cwSidebarItem href="/v/bugs" icon="phosphorFunnelSimpleBold" active>Bugs ouverts</a>
        <a cwSidebarItem href="/accueil" icon="phosphorHouseBold" [activeIcon]="null" active
          >Accueil</a
        >
        <a
          cwSidebarItem
          href="/boite"
          icon="phosphorHouseBold"
          activeIcon="phosphorFunnelSimpleBold"
          active
          >Boîte de réception</a
        >
      </cw-sidebar-group>
    </cw-sidebar>
  `,
})
class IconHost {}

describe('CwSidebar current icons', () => {
  let host: HTMLElement;

  beforeEach(async () => {
    const fixture: ComponentFixture<IconHost> = TestBed.createComponent(IconHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
  });

  it('keeps the Bold icon of a current item without a registered Fill twin', () => {
    expect(link(host, 'Bugs ouverts').querySelector('ng-icon')?.innerHTML).toBe(
      phosphorFunnelSimpleBold,
    );
  });

  it('keeps the icon with activeIcon null and uses a given activeIcon', () => {
    expect(link(host, 'Accueil').querySelector('ng-icon')?.innerHTML).toBe(phosphorHouseBold);
    expect(link(host, 'Boîte de réception').querySelector('ng-icon')?.innerHTML).toBe(
      phosphorFunnelSimpleBold,
    );
  });
});
