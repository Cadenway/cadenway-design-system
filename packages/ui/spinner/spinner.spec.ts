import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwLoadingOverlay } from './loading-overlay';
import { CwSpinner, CwSpinnerIndicator } from './spinner';

@Component({
  imports: [CwSpinner, CwSpinnerIndicator, CwLoadingOverlay],
  template: `
    <svg cwSpinner label="Envoi du fichier"></svg>
    <svg cwSpinner size="sm"></svg>
    <cw-spinner [active]="waiting()" label="Analyse des tâches" showLabel />
    <section
      class="relative"
      aria-label="Tâches"
      [cwLoadingOverlay]="refreshing()"
      loadingLabel="Actualisation des tâches"
    ></section>
  `,
})
class Host {
  readonly waiting = signal(true);
  readonly refreshing = signal(false);
}

describe('CwSpinner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is a named status when labelled, hidden otherwise', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const [named, silent] = Array.from(host.querySelectorAll('svg'));

    expect(named.getAttribute('role')).toBe('status');
    expect(named.getAttribute('aria-label')).toBe('Envoi du fichier');
    expect(silent.getAttribute('aria-hidden')).toBe('true');
  });

  it('appears after 300 ms and stays at least 500 ms', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const indicator = (): string | null =>
      host.querySelector('cw-spinner span')?.textContent ?? null;

    expect(indicator()).toBeNull();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(indicator()).toBe('Analyse des tâches');

    fixture.componentInstance.waiting.set(false);
    fixture.detectChanges();
    vi.advanceTimersByTime(200);
    fixture.detectChanges();
    expect(indicator()).toBe('Analyse des tâches');
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(indicator()).toBeNull();
  });

  it('covers a refreshing area and marks it busy', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.refreshing.set(true);
    fixture.detectChanges();
    const area = (fixture.nativeElement as HTMLElement).querySelector('[aria-label="Tâches"]');

    expect(area?.getAttribute('aria-busy')).toBe('true');
    expect(area?.querySelector('[aria-label="Actualisation des tâches"]')).toBeTruthy();
  });
});
