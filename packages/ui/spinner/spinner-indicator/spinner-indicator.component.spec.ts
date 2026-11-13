import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwSpinnerIndicator } from './spinner-indicator.component';

@Component({
  imports: [CwSpinnerIndicator],
  template: `<cw-spinner [active]="waiting()" label="Analyse des tâches" showLabel />`,
})
class Host {
  readonly waiting = signal(true);
}

describe('CwSpinnerIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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
});
