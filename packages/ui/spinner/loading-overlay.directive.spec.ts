import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwLoadingOverlay } from './loading-overlay.directive';

@Component({
  imports: [CwLoadingOverlay],
  template: `
    <section
      class="relative"
      aria-label="Tâches"
      [cwLoadingOverlay]="refreshing()"
      loadingLabel="Actualisation des tâches"
    ></section>
  `,
})
class Host {
  readonly refreshing = signal(false);
}

describe('CwLoadingOverlay', () => {
  it('covers a refreshing area and marks it busy', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.refreshing.set(true);
    fixture.detectChanges();
    const area = (fixture.nativeElement as HTMLElement).querySelector('[aria-label="Tâches"]');

    expect(area?.getAttribute('aria-busy')).toBe('true');
    expect(area?.querySelector('[aria-label="Actualisation des tâches"]')).toBeTruthy();
  });

  it('removes the veil when the refresh ends', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.refreshing.set(true);
    fixture.detectChanges();
    fixture.componentInstance.refreshing.set(false);
    fixture.detectChanges();
    const area = (fixture.nativeElement as HTMLElement).querySelector('[aria-label="Tâches"]');

    expect(area?.hasAttribute('aria-busy')).toBe(false);
    expect(area?.querySelector('[aria-label="Actualisation des tâches"]')).toBeNull();
  });
});
