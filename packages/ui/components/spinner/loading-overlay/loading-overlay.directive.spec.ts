import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwLoadingOverlay } from './loading-overlay.directive';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test area whose refreshing signal controls the loading overlay.
 */
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
  // #region Properties
  /**
   * Property refreshing
   * @readonly
   *
   * @description
   * Signal used by tests to show and remove the loading veil.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly refreshing: WritableSignal<boolean> = signal(false);
  // #endregion
}

describe('CwLoadingOverlay', () => {
  it('covers a refreshing area and marks it busy', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.componentInstance.refreshing.set(true);
    fixture.detectChanges();
    const area: Element | null = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Tâches"]',
    );

    expect(area?.getAttribute('aria-busy')).toBe('true');
    expect(area?.querySelector('[aria-label="Actualisation des tâches"]')).toBeTruthy();
  });

  it('removes the veil when the refresh ends', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.componentInstance.refreshing.set(true);
    fixture.detectChanges();
    fixture.componentInstance.refreshing.set(false);
    fixture.detectChanges();
    const area: Element | null = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Tâches"]',
    );

    expect(area?.hasAttribute('aria-busy')).toBe(false);
    expect(area?.querySelector('[aria-label="Actualisation des tâches"]')).toBeNull();
  });
});
