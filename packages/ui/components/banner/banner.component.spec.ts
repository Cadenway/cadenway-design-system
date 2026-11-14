import { Component, PLATFORM_ID, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';
import type { MockInstance } from 'vitest';

import { CwBannerActions } from './banner-actions/banner-actions.component';
import { CwBanner } from './banner.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host with a persistent dismissible storage warning, an error and main content.
 */
@Component({
  imports: [CwBanner, CwBannerActions, CwButton],
  template: `
    <cw-banner
      tone="warning"
      title="Stockage presque plein."
      description="46 Go utilisés sur 50 Go."
      dismissKey="storage-90"
      (dismissed)="dismissals.set(dismissals() + 1)"
    >
      <cw-banner-actions>
        <button cwButton variant="outline" size="sm">Gérer le stockage</button>
      </cw-banner-actions>
    </cw-banner>
    @if (showError()) {
      <cw-banner tone="error" title="La sauvegarde de cette nuit a échoué." [dismissible]="false" />
    }
    <main><a href="/taches">Tâches</a></main>
  `,
})
class Host {
  // #region Properties
  /**
   * Property dismissals
   * @readonly
   *
   * @description
   * Counts dismissal events emitted by the warning banner.
   *
   * @type {WritableSignal<number>}
   * @default 0
   */
  public readonly dismissals: WritableSignal<number> = signal(0);

  /**
   * Property showError
   * @readonly
   *
   * @description
   * Controls whether the non-dismissible error banner is rendered.
   *
   * @type {WritableSignal<boolean>}
   * @default true
   */
  public readonly showError: WritableSignal<boolean> = signal(true);
  // #endregion
}

/**
 * Function bannerTitled
 *
 * @description
 * Finds a banner by the text of its title.
 *
 * @param {HTMLElement} host - Container holding the banners.
 * @param {string} title - Exact title text to match after trimming.
 *
 * @returns {HTMLElement} First matching banner.
 *
 * @throws {Error} When no banner has the requested title.
 */
function bannerTitled(host: HTMLElement, title: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('[role="status"], [role="alert"]'),
  ).find((element) => element.querySelector('p span')?.textContent.trim() === title);
  if (!found) throw new Error(`No banner titled ${title}`);
  return found;
}

/**
 * Function buttonNamed
 *
 * @description
 * Finds a button by its aria-label or trimmed visible text.
 *
 * @param {HTMLElement} host - Container holding the buttons.
 * @param {string} name - Exact button name to match.
 *
 * @returns {HTMLButtonElement} First matching button.
 *
 * @throws {Error} When no button has the requested name.
 */
function buttonNamed(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwBanner', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  /**
   * Function create
   *
   * @description
   * Creates and attaches a fresh host, retaining its fixture and instance for the current test.
   */
  function create(): void {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    document.body.appendChild(host);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    host.remove();
    localStorage.clear();
  });

  it('is a status, or an alert for an error, without a native tooltip', () => {
    create();
    const storage: HTMLElement = bannerTitled(host, 'Stockage presque plein.');

    expect(storage.getAttribute('role')).toBe('status');
    expect(storage.hasAttribute('title')).toBe(false);
    expect(storage.textContent).toContain('46 Go utilisés sur 50 Go.');
    expect(bannerTitled(host, 'La sauvegarde de cette nuit a échoué.').getAttribute('role')).toBe(
      'alert',
    );
  });

  it('has no close button when it cannot be dismissed', () => {
    create();
    expect(
      bannerTitled(host, 'La sauvegarde de cette nuit a échoué.').querySelector('button'),
    ).toBeNull();
  });

  it('hides itself, emits dismissed and focuses the main content', async () => {
    create();
    const close: HTMLButtonElement = buttonNamed(host, 'Masquer le bandeau');
    close.focus();
    close.click();
    await fixture.whenStable();

    expect(component.dismissals()).toBe(1);
    expect(bannerTitled(host, 'Stockage presque plein.').hasAttribute('hidden')).toBe(true);
    expect(document.activeElement?.textContent).toBe('Tâches');
  });

  it('remembers the dismissal under its key', async () => {
    create();
    buttonNamed(host, 'Masquer le bandeau').click();
    await fixture.whenStable();
    host.remove();

    create();
    expect(bannerTitled(host, 'Stockage presque plein.').hasAttribute('hidden')).toBe(true);
  });

  it('shows when the storage refuses access', () => {
    const getItem: MockInstance<Storage['getItem']> = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('SecurityError');
      });
    create();

    expect(bannerTitled(host, 'Stockage presque plein.').hasAttribute('hidden')).toBe(false);
    getItem.mockRestore();
  });

  it('does not touch the storage outside the browser', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const setItem: MockInstance<Storage['setItem']> = vi.spyOn(Storage.prototype, 'setItem');
    create();
    buttonNamed(host, 'Masquer le bandeau').click();
    await fixture.whenStable();

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});
