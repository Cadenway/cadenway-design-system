import { Component, PLATFORM_ID, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/button';

import { CwBannerActions } from '../banner-actions/banner-actions.component';
import { CwBanner } from './banner.component';

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
  readonly dismissals = signal(0);
  readonly showError = signal(true);
}

function bannerTitled(host: HTMLElement, title: string): HTMLElement {
  const found = Array.from(
    host.querySelectorAll<HTMLElement>('[role="status"], [role="alert"]'),
  ).find((element) => element.querySelector('p span')?.textContent.trim() === title);
  if (!found) throw new Error(`No banner titled ${title}`);
  return found;
}

function buttonNamed(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwBanner', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

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
    const storage = bannerTitled(host, 'Stockage presque plein.');

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
    const close = buttonNamed(host, 'Masquer le bandeau');
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
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    create();

    expect(bannerTitled(host, 'Stockage presque plein.').hasAttribute('hidden')).toBe(false);
    getItem.mockRestore();
  });

  it('does not touch the storage outside the browser', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    create();
    buttonNamed(host, 'Masquer le bandeau').click();
    await fixture.whenStable();

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});
