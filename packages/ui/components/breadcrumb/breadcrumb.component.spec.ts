import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwMenu, CwMenuItem } from '@cadenway/ui/components/menu';
import { CwMenuTriggerFor } from '@cadenway/ui/components/menu';

import { CwBreadcrumbLink } from './breadcrumb-link/breadcrumb-link.component';
import { CwBreadcrumbPage } from './breadcrumb-page/breadcrumb-page.component';
import { CwBreadcrumb } from './breadcrumb.component';

@Component({
  imports: [CwBreadcrumb, CwBreadcrumbLink, CwBreadcrumbPage, CwMenu, CwMenuItem, CwMenuTriggerFor],
  template: `
    <nav cwBreadcrumb [separator]="separator()">
      <a cwBreadcrumbLink href="/espaces/produit">Produit</a>
      <a cwBreadcrumbLink href="/l/sprint-14">Sprint 14</a>
      <span cwBreadcrumbPage>CAD-482</span>
    </nav>

    <nav cwBreadcrumb ariaLabel="Fil d'Ariane de la sous-tâche">
      <a cwBreadcrumbLink href="/espaces/produit">Produit</a>
      <a cwBreadcrumbLink href="/l/sprint-14">Sprint 14</a>
      <a cwBreadcrumbLink href="/t/CAD-480" (click)="$event.preventDefault(); opened.set('CAD-480')"
        >Import JSON</a
      >
      @if (deep()) {
        <a cwBreadcrumbLink href="/t/CAD-488">CAD-488</a>
      }
      <span cwBreadcrumbPage>Mapper les champs</span>
    </nav>

    <nav cwBreadcrumb ariaLabel="Fil d'Ariane avec niveau à menu">
      <a cwBreadcrumbLink href="/espaces/produit">Produit</a>
      <button cwBreadcrumbLink [cwMenuTriggerFor]="siblings">Sprint 14</button>
      <span cwBreadcrumbPage>CAD-482</span>
    </nav>
    <cw-menu #siblings>
      <button cwMenuItem selected>Sprint 14</button>
      <button cwMenuItem>Backlog</button>
    </cw-menu>
  `,
})
class Host {
  readonly separator = signal<'chevron' | 'slash'>('chevron');
  readonly deep = signal(true);
  readonly opened = signal<string | null>(null);
}

function trail(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('nav')).find(
    (nav) => nav.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No navigation named ${name}`);
  return found;
}

/** The levels a screen reader lists: the list items not hidden from it. */
function levels(nav: HTMLElement): string[] {
  return Array.from(nav.querySelectorAll<HTMLElement>('ol > li'))
    .filter((li) => !li.hidden && li.getAttribute('aria-hidden') !== 'true')
    .map((li) =>
      (li.querySelector('[aria-label]')?.getAttribute('aria-label') ?? li.textContent).trim(),
    );
}

describe('CwBreadcrumb', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('lays the levels out as an ordered list in a named navigation', () => {
    const nav = trail(host, "Fil d'Ariane");

    expect(levels(nav)).toEqual(['Produit', 'Sprint 14', 'CAD-482']);
    expect(nav.querySelectorAll('ol > li[aria-hidden="true"]')).toHaveLength(2);
    expect(nav.dataset['size']).toBe('default');
  });

  it('marks the last level as the current page, which is not a link', () => {
    const page = Array.from(trail(host, "Fil d'Ariane").querySelectorAll('[aria-current]'));

    expect(page).toHaveLength(1);
    expect(page[0].getAttribute('aria-current')).toBe('page');
    expect(page[0].tagName).toBe('SPAN');
    expect(page[0].textContent.trim()).toBe('CAD-482');
  });

  it('switches to slash separators', async () => {
    const nav = trail(host, "Fil d'Ariane");
    expect(nav.querySelector('ng-icon')).not.toBeNull();

    component.separator.set('slash');
    await fixture.whenStable();

    expect(nav.querySelector('ng-icon')).toBeNull();
    expect(
      Array.from(nav.querySelectorAll('ol > li[aria-hidden="true"]')).map((li) =>
        li.textContent.trim(),
      ),
    ).toEqual(['/', '/']);
  });

  it('folds the middle levels past four into « … »', () => {
    const nav = trail(host, "Fil d'Ariane de la sous-tâche");

    expect(levels(nav)).toEqual(['Produit', 'Niveaux masqués', 'CAD-488', 'Mapper les champs']);
    const ellipsis = nav.querySelector<HTMLButtonElement>('button[aria-label="Niveaux masqués"]');
    expect(ellipsis?.getAttribute('aria-haspopup')).toBe('menu');
    expect(ellipsis?.getAttribute('aria-expanded')).toBe('false');
  });

  it('unfolds when a level goes away', async () => {
    component.deep.set(false);
    await fixture.whenStable();

    expect(levels(trail(host, "Fil d'Ariane de la sous-tâche"))).toEqual([
      'Produit',
      'Sprint 14',
      'Import JSON',
      'Mapper les champs',
    ]);
  });

  it('opens the hidden levels in a menu and follows the chosen one', async () => {
    const nav = trail(host, "Fil d'Ariane de la sous-tâche");
    const ellipsis = nav.querySelector<HTMLButtonElement>('button[aria-label="Niveaux masqués"]');
    ellipsis?.click();
    await fixture.whenStable();

    const menu = document.querySelector<HTMLElement>('[role="menu"]');
    expect(menu?.getAttribute('aria-labelledby')).toBe(ellipsis?.id);
    expect(ellipsis?.getAttribute('aria-expanded')).toBe('true');
    const items = Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    expect(items.map((item) => item.textContent.trim())).toEqual(['Sprint 14', 'Import JSON']);

    items[1].click();
    await fixture.whenStable();

    expect(component.opened()).toBe('CAD-480');
    expect(ellipsis?.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(ellipsis);
  });

  it('turns a button level into a menu trigger with a caret', () => {
    const level = Array.from(
      trail(host, "Fil d'Ariane avec niveau à menu").querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent.trim() === 'Sprint 14');

    expect(level?.getAttribute('type')).toBe('button');
    expect(level?.getAttribute('aria-haspopup')).toBe('menu');
    expect(level?.querySelector('ng-icon')).not.toBeNull();
  });
});
