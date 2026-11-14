import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwSpinnerIndicator } from './spinner-indicator.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host controlling the wait state of a labelled spinner indicator.
 */
@Component({
  imports: [CwSpinnerIndicator],
  template: `<cw-spinner [active]="waiting()" label="Analyse des tâches" showLabel />`,
})
class Host {
  // #region Properties
  /**
   * Property waiting
   * @readonly
   *
   * @description
   * Signal allowing the test to end the operation observed by the indicator.
   *
   * @type {WritableSignal<boolean>}
   * @default true
   */
  public readonly waiting: WritableSignal<boolean> = signal(true);
  // #endregion
}

describe('CwSpinnerIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('appears after 300 ms and stays at least 500 ms', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const indicator: () => string | null = (): string | null =>
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
});
