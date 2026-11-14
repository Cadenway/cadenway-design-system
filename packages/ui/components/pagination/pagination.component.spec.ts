import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwPaginationLink } from './pagination-link/pagination-link.component';
import { CwPagination } from './pagination.component';

/**
 * Class Host
 *
 * @description
 * Hosts full, simple, table and routed pagination examples.
 */
@Component({
  imports: [CwPagination, CwPaginationLink],
  template: `
    <cw-pagination
      ariaLabel="Journal d'audit"
      [(page)]="page"
      [(pageSize)]="pageSize"
      [total]="total()"
      [pageSizes]="[]"
    />
    <cw-pagination
      ariaLabel="Membres"
      variant="simple"
      [(page)]="simplePage"
      [total]="60"
      [pageSizes]="[]"
    />
    <cw-pagination
      ariaLabel="Sauvegardes"
      variant="simple"
      showRange
      [(page)]="tablePage"
      [(pageSize)]="tableSize"
      [total]="286"
    />
    <nav aria-label="Pages routées">
      <a cwPaginationLink href="?page=1" disabled (click)="routed.set(routed() + 1)">1</a>
    </nav>
  `,
})
class Host {
  // #region Properties
  /**
   * Property page
   * @readonly
   *
   * @description
   * Current page of the full pagination.
   *
   * @type {WritableSignal<number>}
   */
  public readonly page: WritableSignal<number> = signal(6);

  /**
   * Property pageSize
   * @readonly
   *
   * @description
   * Rows per page in the full pagination.
   *
   * @type {WritableSignal<number>}
   */
  public readonly pageSize: WritableSignal<number> = signal(25);

  /**
   * Property total
   * @readonly
   *
   * @description
   * Total rows in the full pagination.
   *
   * @type {WritableSignal<number>}
   */
  public readonly total: WritableSignal<number> = signal(300);

  /**
   * Property simplePage
   * @readonly
   *
   * @description
   * Current page of the simple pagination.
   *
   * @type {WritableSignal<number>}
   */
  public readonly simplePage: WritableSignal<number> = signal(1);

  /**
   * Property tablePage
   * @readonly
   *
   * @description
   * Current page of the table pagination.
   *
   * @type {WritableSignal<number>}
   */
  public readonly tablePage: WritableSignal<number> = signal(3);

  /**
   * Property tableSize
   * @readonly
   *
   * @description
   * Rows per page in the table pagination.
   *
   * @type {WritableSignal<number>}
   */
  public readonly tableSize: WritableSignal<number> = signal(25);

  /**
   * Property routed
   * @readonly
   *
   * @description
   * Number of routed link activations.
   *
   * @type {WritableSignal<number>}
   */
  public readonly routed: WritableSignal<number> = signal(0);
  // #endregion
}

/**
 * Function navigation
 *
 * @description
 * Finds a navigation element by its accessible name.
 *
 * @param {HTMLElement} host - Fixture containing the navigation.
 * @param {string} name - Accessible name of the navigation.
 * @returns {HTMLElement} Matching navigation element.
 */
function navigation(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | null = host.querySelector<HTMLElement>(`nav[aria-label="${name}"]`);
  if (!found) throw new Error(`No navigation named ${name}`);
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a button by accessible name or visible text.
 *
 * @param {HTMLElement} container - Element containing the button.
 * @param {string} name - Accessible name or visible text to find.
 * @returns {HTMLButtonElement} Matching button.
 */
function button(container: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function listed
 *
 * @description
 * Returns button names and hidden text in navigation order.
 *
 * @param {HTMLElement} nav - Navigation whose items are inspected.
 * @returns {string[]} Item labels in navigation order.
 */
function listed(nav: HTMLElement): string[] {
  return Array.from(nav.querySelectorAll<HTMLElement>('li')).map((li) => {
    const control: HTMLButtonElement | null = li.querySelector('button');
    return control?.getAttribute('aria-label') ?? li.textContent.trim().replace(/\s+/g, ' ');
  });
}

describe('CwPagination', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;
  let announced: string[];

  beforeEach(async () => {
    announced = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LiveAnnouncer,
          useValue: {
            announce: (message: string) => {
              announced.push(message);
              return Promise.resolve();
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('shows the first, the last and the neighbours of the current page', () => {
    expect(listed(navigation(host, "Journal d'audit"))).toEqual([
      'Première page',
      'Précédent',
      'Page 1',
      'Pages masquées',
      'Page 5',
      'Page 6',
      'Page 7',
      'Pages masquées',
      'Page 12',
      'Suivant',
      'Dernière page',
    ]);
    expect(button(navigation(host, "Journal d'audit"), 'Page 6').getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('goes to a page and announces it', async () => {
    const nav: HTMLElement = navigation(host, "Journal d'audit");
    button(nav, 'Page 7').click();
    await fixture.whenStable();

    expect(component.page()).toBe(7);
    expect(announced).toEqual(['Page 7 sur 12']);
    expect(button(nav, 'Page 7').getAttribute('aria-current')).toBe('page');

    button(nav, 'Précédent').click();
    button(nav, 'Dernière page').click();
    await fixture.whenStable();
    expect(component.page()).toBe(12);
  });

  it('disables the buttons out of bounds and keeps the focus on a button', async () => {
    const nav: HTMLElement = navigation(host, "Journal d'audit");
    component.page.set(11);
    await fixture.whenStable();
    const next: HTMLButtonElement = button(nav, 'Suivant');
    next.focus();

    next.click();
    await fixture.whenStable();

    expect(next.disabled).toBe(true);
    expect(button(nav, 'Dernière page').disabled).toBe(true);
    expect(button(nav, 'Précédent').disabled).toBe(false);
    expect(document.activeElement).toBe(button(nav, 'Page 12'));
  });

  it('fills a one-page gap instead of an ellipsis', async () => {
    component.page.set(2);
    component.total.set(225);
    await fixture.whenStable();

    expect(listed(navigation(host, "Journal d'audit")).slice(2, -2)).toEqual([
      'Page 1',
      'Page 2',
      'Page 3',
      'Pages masquées',
      'Page 9',
    ]);
  });

  it('keeps the page within the bounds when the total shrinks', async () => {
    component.total.set(40);
    await fixture.whenStable();

    const nav: HTMLElement = navigation(host, "Journal d'audit");
    expect(button(nav, 'Page 2').getAttribute('aria-current')).toBe('page');
    expect(button(nav, 'Suivant').disabled).toBe(true);
  });

  it('reads « Page 1 sur 3 » between the labelled buttons of the simple variant', async () => {
    const nav: HTMLElement = navigation(host, 'Membres');

    expect(listed(nav)).toEqual(['Précédent', 'Page 1 sur 3', 'Suivant']);
    expect(button(nav, 'Précédent').disabled).toBe(true);

    button(nav, 'Suivant').click();
    await fixture.whenStable();
    expect(component.simplePage()).toBe(2);
  });

  it('shows the range, the page size and the status around the table bar', () => {
    const bar: HTMLElement = host.querySelectorAll<HTMLElement>('cw-pagination')[2];

    expect(bar.textContent).toContain('51–75 sur 286');
    expect(bar.textContent).toContain('Page 3 sur 12');
    const select: HTMLElement | null = bar.querySelector<HTMLElement>('[role="combobox"]');
    expect(select?.id).toBeTruthy();
    expect(bar.querySelector(`label[for="${select?.id ?? ''}"]`)?.textContent.trim()).toBe(
      'Lignes par page',
    );
    expect(listed(navigation(host, 'Sauvegardes'))).toEqual([
      'Première page',
      'Page précédente',
      'Page suivante',
      'Dernière page',
    ]);
  });

  it('goes back to page 1 when the page size changes', async () => {
    const bar: HTMLElement = host.querySelectorAll<HTMLElement>('cw-pagination')[2];
    bar.querySelector<HTMLElement>('[role="combobox"]')?.click();
    await fixture.whenStable();
    const option: HTMLElement | undefined = Array.from(
      document.querySelectorAll<HTMLElement>('[role="option"]'),
    ).find((element) => element.textContent.trim() === '50');
    option?.click();
    await fixture.whenStable();

    expect(component.tableSize()).toBe(50);
    expect(component.tablePage()).toBe(1);
    expect(bar.textContent).toContain('1–50 sur 286');
    expect(announced).toEqual(['Page 1 sur 6']);
  });

  it('disables a routed link through aria-disabled and the tab order', () => {
    const link: HTMLAnchorElement | null = navigation(
      host,
      'Pages routées',
    ).querySelector<HTMLAnchorElement>('a');
    link?.click();

    expect(link?.getAttribute('aria-disabled')).toBe('true');
    expect(link?.getAttribute('tabindex')).toBe('-1');
    expect(component.routed()).toBe(0);
  });
});
