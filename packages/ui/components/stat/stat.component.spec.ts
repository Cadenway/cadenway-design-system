import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwStatGroup } from './stat-group/stat-group.component';
import { CwStatSparkline } from './stat-sparkline/stat-sparkline.component';
import { CwStat } from './stat.component';
import type { CwStatGoal } from './stat.types';

/**
 * Class Host
 *
 * @description
 * Hosts statistics exercising grouping, loading and goal states.
 */
@Component({
  imports: [CwStat, CwStatGroup, CwStatSparkline],
  template: `
    <cw-stat-group ariaLabel="Semaine 46">
      <cw-stat
        label="Terminées cette semaine"
        value="21"
        delta="+7"
        trend="up"
        sentiment="positive"
        comparison="par rapport à S45"
      />
      <cw-stat label="En retard" [value]="3" delta="+1" trend="up" sentiment="negative" />
      <cw-stat label="Membres" [value]="1250" />
    </cw-stat-group>
    <cw-stat label="Tâches créées" value="42" delta="+12 %" trend="up">
      <cw-stat-sparkline [data]="[3, 4, 2, 6, 5, 8, 9]" />
    </cw-stat>
    <cw-stat label="Points livrés" value="34" [goal]="goal()" />
    <cw-stat label="Tâches ouvertes" value="18" [loading]="loading()" [refreshing]="refreshing()" />
  `,
})
class Host {
  // #region Properties
  /**
   * Property goal
   * @readonly
   *
   * @description
   * Goal displayed by the delivered points statistic.
   *
   * @type {WritableSignal<CwStatGoal | null>}
   */
  public readonly goal: WritableSignal<CwStatGoal | null> = signal<CwStatGoal | null>({
    value: 34,
    max: 50,
    unit: 'engagés',
  });

  /**
   * Property loading
   * @readonly
   *
   * @description
   * Controls the first-load state.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property refreshing
   * @readonly
   *
   * @description
   * Controls the refresh state.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly refreshing: WritableSignal<boolean> = signal(false);
  // #endregion
}

/**
 * Function stat
 *
 * @description
 * Finds a statistic by its visible label.
 *
 * @param {HTMLElement} host - Fixture containing statistics.
 * @param {string} label - Visible statistic label.
 *
 * @returns {HTMLElement} Statistic with the requested label.
 */
function stat(host: HTMLElement, label: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('cw-stat'),
  ).find((element) => element.textContent.trim().startsWith(label));
  if (!found) throw new Error(`No stat labelled ${label}`);
  return found;
}

describe('CwStat', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('reads the label, the value, then the change with its direction in words', () => {
    const done: HTMLElement = stat(host, 'Terminées cette semaine');

    // The template drops the whitespace between elements: the parts follow each other.
    expect(done.textContent.trim()).toMatch(
      /^Terminées cette semaine\s*21\s*en hausse : \+7\s*par rapport à S45$/,
    );
    expect(done.dataset['trend']).toBe('up');
    expect(done.dataset['sentiment']).toBe('positive');
  });

  it('keeps the sentiment apart from the sign of the change', () => {
    const late: HTMLElement = stat(host, 'En retard');

    expect(late.dataset['trend']).toBe('up');
    expect(late.dataset['sentiment']).toBe('negative');
  });

  it('formats a numeric value in French and hides the change row without a change', () => {
    const members: HTMLElement = stat(host, 'Membres');

    expect(members.textContent.trim()).toMatch(/^Membres\s*1\s250$/);
  });

  it('names the group and keeps the sparkline away from assistive technologies', () => {
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Semaine 46');
    expect(host.querySelector('cw-stat-sparkline')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the goal as a progress bar named by the label', () => {
    const bar: HTMLElement | null = host.querySelector<HTMLElement>('[role="progressbar"]');

    expect(bar?.getAttribute('aria-label')).toBe('Points livrés');
    expect(bar?.getAttribute('aria-valuenow')).toBe('34');
    expect(bar?.getAttribute('aria-valuemax')).toBe('50');
    expect(bar?.getAttribute('aria-valuetext')).toBe('34 sur 50 engagés · 68 %');
  });

  it('marks the first load busy and keeps the real label', async () => {
    component.loading.set(true);
    await fixture.whenStable();
    const open: HTMLElement = stat(host, 'Tâches ouvertes');

    expect(open.getAttribute('aria-busy')).toBe('true');
    expect(open.textContent.trim()).toBe('Tâches ouvertes');
  });

  it('announces a refresh while showing the old value', async () => {
    component.refreshing.set(true);
    await fixture.whenStable();
    const open: HTMLElement = stat(host, 'Tâches ouvertes');

    expect(open.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('Actualisation');
    expect(open.textContent).toContain('18');
    expect(open.getAttribute('aria-busy')).toBeNull();
  });
});
