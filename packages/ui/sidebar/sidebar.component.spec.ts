import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { phosphorHouseBold, phosphorTrayBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorHouseFill, phosphorTrayFill } from '@ng-icons/phosphor-icons/fill';

import { CwSidebarFooter } from './sidebar-footer/sidebar-footer.component';
import { CwSidebarGroup } from './sidebar-group/sidebar-group.component';
import { CwSidebarHeader } from './sidebar-header/sidebar-header.component';
import { CwSidebarItem } from './sidebar-item/sidebar-item.component';
import { CwSidebarSpace } from './sidebar-space/sidebar-space.component';
import { CwSidebarToggle } from './sidebar-toggle/sidebar-toggle.directive';
import { CwSidebar } from './sidebar.component';
import type { CwSidebarCollapsible, CwSidebarState } from './sidebar.types';

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
    <cw-sidebar #sidebar [(state)]="state" [collapsible]="collapsible()">
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
  readonly state = signal<CwSidebarState>('expanded');
  readonly collapsible = signal<CwSidebarCollapsible>('icon');
  readonly produit = signal(false);
  readonly sprintActive = signal(true);
}

// The name a link gets from its content: the text without its `aria-hidden` parts.
function nameFromContent(element: HTMLElement): string {
  const copy = element.cloneNode(true) as HTMLElement;
  for (const hidden of Array.from(copy.querySelectorAll('[aria-hidden="true"]'))) hidden.remove();
  return copy.textContent.replace(/\s+/g, ' ').trim();
}

function link(host: HTMLElement, name: string): HTMLAnchorElement {
  const found = Array.from(host.querySelectorAll('a')).find(
    (element) => (element.getAttribute('aria-label') ?? nameFromContent(element)) === name,
  );
  if (!found) throw new Error(`No link named ${name}`);
  return found;
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

function spaceTrigger(host: HTMLElement): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find((element) =>
    element.hasAttribute('aria-expanded'),
  );
  if (!found) throw new Error('No space trigger');
  return found;
}

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
    const nav = host.querySelector('nav');
    const spaces = host.querySelectorAll('cw-sidebar-group')[1];

    expect(nav?.getAttribute('aria-label')).toBe('Navigation principale');
    expect(spaces.getAttribute('role')).toBe('group');
    expect(document.getElementById(spaces.getAttribute('aria-labelledby') ?? '')?.textContent).toBe(
      'Espaces',
    );
    expect(link(host, 'Boîte de réception, 3 non lus')).toBeTruthy();
  });

  it('marks the current item for assistive technologies', () => {
    expect(link(host, 'Accueil').getAttribute('aria-current')).toBe('page');
    expect(link(host, 'Boîte de réception, 3 non lus').hasAttribute('aria-current')).toBe(false);
  });

  it('opens a space on click, → and ←, through its two-way binding', async () => {
    const trigger = spaceTrigger(host);
    const lists = document.getElementById(trigger.getAttribute('aria-controls') ?? '');
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
    const toggle = button(host, 'Replier la barre latérale');
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

    const inbox = link(host, 'Boîte de réception, 3 non lus');
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    inbox.focus();
    await fixture.whenStable();

    const bubble = document.querySelector('[role="tooltip"]');
    expect(bubble?.textContent).toContain('Boîte de réception · 3');

    inbox.blur();
    await fixture.whenStable();
  });

  it('expands and opens a space from its rail button, which holds the current page', async () => {
    fixture.componentInstance.state.set('collapsed');
    await fixture.whenStable();

    const rail = button(host, 'Produit');
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

    const search = host.querySelector('input');
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

  it('closes on Escape and when an item is followed', async () => {
    fixture.componentInstance.state.set('expanded');
    await fixture.whenStable();
    press(document.body, 'Escape');
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');

    fixture.componentInstance.state.set('expanded');
    await fixture.whenStable();
    const home = link(host, 'Accueil');
    home.addEventListener('click', (event) => {
      event.preventDefault();
    });
    home.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.state()).toBe('collapsed');
  });
});
