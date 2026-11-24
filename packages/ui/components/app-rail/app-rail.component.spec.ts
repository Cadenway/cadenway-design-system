import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorHouseBold,
  phosphorMagnifyingGlassBold,
  phosphorMoonBold,
  phosphorTrayBold,
} from '@ng-icons/phosphor-icons/bold';
import { phosphorHouseFill } from '@ng-icons/phosphor-icons/fill';

import { CwAppRailFooter } from './app-rail-footer/app-rail-footer.component';
import { CwAppRailGroup } from './app-rail-group/app-rail-group.component';
import { CwAppRailItem } from './app-rail-item/app-rail-item.component';
import { CwAppRailSeparator } from './app-rail-separator/app-rail-separator.component';
import { CwAppRail } from './app-rail.component';

/**
 * Component Host
 *
 * @description
 * The rail of the mockup's app shell: the organization switcher, the applications, a desktop-only
 * group of spaces and the footer with search, theme and account.
 */
@Component({
  imports: [CwAppRail, CwAppRailGroup, CwAppRailSeparator, CwAppRailFooter, CwAppRailItem],
  providers: [
    provideIcons({
      phosphorHouseBold,
      phosphorHouseFill,
      phosphorTrayBold,
      phosphorMagnifyingGlassBold,
      phosphorMoonBold,
    }),
  ],
  template: `
    <nav cwAppRail ariaLabel="Applications">
      <cw-app-rail-group desktopOnly>
        <button cwAppRailItem variant="primary">
          <span cwAppRailItemMedia>AN</span>Atelier Nord
        </button>
      </cw-app-rail-group>
      <cw-app-rail-separator />
      <cw-app-rail-group>
        <a cwAppRailItem href="/home" icon="phosphorHouseBold" [current]="home()">Accueil</a>
        <button cwAppRailItem icon="phosphorTrayBold" [badge]="unread()" badgeLabel="3 non lues">
          Boîte de réception
        </button>
      </cw-app-rail-group>
      <cw-app-rail-footer>
        <button
          cwAppRailItem
          icon="phosphorMagnifyingGlassBold"
          tooltip="Rechercher"
          [shortcut]="['Ctrl', 'K']"
        >
          Rechercher (Ctrl K)
        </button>
        <button cwAppRailItem icon="phosphorMoonBold" desktopOnly>Thème sombre</button>
      </cw-app-rail-footer>
    </nav>
  `,
})
class Host {
  // #region Properties
  /**
   * Property home
   *
   * @description
   * Whether the home item is the current page.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly home: WritableSignal<boolean> = signal(true);

  /**
   * Property unread
   *
   * @description
   * Count of the inbox badge; null hides it.
   *
   * @type {WritableSignal<number | null>}
   * @readonly
   */
  public readonly unread: WritableSignal<number | null> = signal<number | null>(3);
  // #endregion
}

/**
 * Function item
 *
 * @description
 * Finds a rail item by its accessible name.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} name - Accessible name of the item.
 *
 * @returns {HTMLElement} Matching link or button.
 */
function item(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('a, button'),
  ).find((element) => element.getAttribute('aria-label') === name);
  if (!found) throw new Error(`No rail item named ${name}`);
  return found;
}

describe('CwAppRail', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('is a navigation landmark named by ariaLabel', () => {
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Applications');
  });

  it('marks the current page and shows its filled icon', async () => {
    const home: HTMLElement = item(host, 'Accueil');
    const icon: () => string | undefined = (): string | undefined =>
      fixture.debugElement
        .queryAll(By.directive(NgIcon))
        .find((element) => home.contains(element.nativeElement as Node))
        ?.injector.get(NgIcon)
        .name();
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(icon()).toBe('phosphorHouseFill');

    fixture.componentInstance.home.set(false);
    await fixture.whenStable();

    expect(home.hasAttribute('aria-current')).toBe(false);
    expect(icon()).toBe('phosphorHouseBold');
  });

  it('writes the badge and reads it after the label', async () => {
    const inbox: HTMLElement = item(host, 'Boîte de réception, 3 non lues');
    expect(inbox.textContent.trim()).toMatch(/^Boîte de réception\s*, 3 non lues3$/);

    fixture.componentInstance.unread.set(null);
    await fixture.whenStable();

    expect(inbox.getAttribute('aria-label')).toBe('Boîte de réception');
    expect(inbox.textContent.trim()).toBe('Boîte de réception');
  });

  it('gives buttons type="button" and leaves links without a type', () => {
    expect(item(host, 'Rechercher (Ctrl K)').getAttribute('type')).toBe('button');
    expect(item(host, 'Accueil').hasAttribute('type')).toBe(false);
  });

  it('shows the media of an item without icon before its hidden label', () => {
    expect(item(host, 'Atelier Nord').textContent.trim()).toBe('ANAtelier Nord');
  });

  it('shows the tooltip text and its shortcut on keyboard focus', async () => {
    const search: HTMLElement = item(host, 'Rechercher (Ctrl K)');
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    search.focus();
    await fixture.whenStable();

    const bubble: Element | null = document.querySelector('[role="tooltip"]');
    expect(bubble?.textContent).toContain('Rechercher');
    expect(bubble?.querySelectorAll('kbd').length).toBeGreaterThan(0);

    search.blur();
    await fixture.whenStable();
  });

  it('flags the groups and items kept out of the phone tab bar', () => {
    expect(item(host, 'Thème sombre').getAttribute('data-desktop-only')).toBe('true');
    expect(item(host, 'Accueil').hasAttribute('data-desktop-only')).toBe(false);
    expect(host.querySelector('cw-app-rail-group')?.getAttribute('data-desktop-only')).toBe('true');
    expect(host.querySelector('cw-app-rail-separator')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('describes the item with what its tooltip adds to the label', () => {
    const search: HTMLElement = item(host, 'Rechercher (Ctrl K)');
    const description: HTMLElement | null = document.getElementById(
      search.getAttribute('aria-describedby') ?? '',
    );

    expect(description?.textContent).toBe('Rechercher, Ctrl K');
    expect(item(host, 'Accueil').hasAttribute('aria-describedby')).toBe(false);
  });
});
