import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwProgress } from './progress.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host with determinate, mutable and indeterminate progress bars.
 */
@Component({
  imports: [CwProgress],
  template: `
    <cw-progress
      variant="success"
      size="sm"
      [value]="done()"
      [max]="5"
      ariaLabel="Sous-tâches terminées"
      valueText="2 sur 5"
    />
    <cw-progress [value]="sprint()" ariaLabel="Avancement du sprint 14" />
    <cw-progress [value]="null" ariaLabel="Analyse du fichier" />
  `,
})
class Host {
  // #region Properties
  /**
   * Property done
   * @readonly
   *
   * @description
   * Completed subtask count used to test clamping and the complete state.
   *
   * @type {WritableSignal<number>}
   * @default 2
   */
  public readonly done: WritableSignal<number> = signal(2);

  /**
   * Property sprint
   * @readonly
   *
   * @description
   * Sprint progress amount, which can be set to null to indicate an unknown value.
   *
   * @type {WritableSignal<number | null>}
   * @default 68
   */
  public readonly sprint: WritableSignal<number | null> = signal<number | null>(68);
  // #endregion
}

/**
 * Function bar
 *
 * @description
 * Finds a progress bar in the test host by its accessible name.
 *
 * @param {HTMLElement} host - Container holding the progress bars.
 * @param {string} name - Exact aria-label of the desired bar.
 *
 * @returns {HTMLElement} First matching progress bar.
 *
 * @throws {Error} When no bar has the requested name.
 */
function bar(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('[role="progressbar"]'),
  ).find((element) => element.getAttribute('aria-label') === name);
  if (!found) throw new Error(`No progress bar named ${name}`);
  return found;
}

describe('CwProgress', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('exposes the range, the value and the given value text', () => {
    const subtasks: HTMLElement = bar(host, 'Sous-tâches terminées');

    expect(subtasks.getAttribute('aria-valuemin')).toBe('0');
    expect(subtasks.getAttribute('aria-valuemax')).toBe('5');
    expect(subtasks.getAttribute('aria-valuenow')).toBe('2');
    expect(subtasks.getAttribute('aria-valuetext')).toBe('2 sur 5');
    expect(subtasks.dataset['state']).toBe('loading');
    expect(subtasks.dataset['variant']).toBe('success');
    expect(subtasks.dataset['size']).toBe('sm');
  });

  it('reads the rounded percentage by default', () => {
    expect(bar(host, 'Avancement du sprint 14').getAttribute('aria-valuetext')).toBe('68 %');
  });

  it('is complete at the maximum and clamps an overrun', async () => {
    component.done.set(7);
    await fixture.whenStable();
    const subtasks: HTMLElement = bar(host, 'Sous-tâches terminées');

    expect(subtasks.getAttribute('aria-valuenow')).toBe('5');
    expect(subtasks.dataset['state']).toBe('complete');
  });

  it('has no value while indeterminate', async () => {
    const analysis: HTMLElement = bar(host, 'Analyse du fichier');
    expect(analysis.dataset['state']).toBe('indeterminate');
    expect(analysis.hasAttribute('aria-valuenow')).toBe(false);
    expect(analysis.hasAttribute('aria-valuetext')).toBe(false);

    component.sprint.set(null);
    await fixture.whenStable();
    expect(bar(host, 'Avancement du sprint 14').hasAttribute('aria-valuenow')).toBe(false);
  });
});
