import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { CwPriorityKey } from '@cadenway/ui/components/priority-icon';

import { CwPriorityBadge } from './priority-badge.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host with a changing priority badge and an icon-only priority badge.
 */
@Component({
  imports: [CwPriorityBadge],
  template: `
    <cw-priority-badge [priority]="priority()" />
    <cw-priority-badge priority="haute" [showLabel]="false" />
  `,
})
class Host {
  // #region Properties
  /**
   * Property priority
   * @readonly
   *
   * @description
   * Signal used by tests to change the first badge's priority.
   *
   * @type {WritableSignal<CwPriorityKey>}
   * @default 'urgente'
   */
  public readonly priority: WritableSignal<CwPriorityKey> = signal<CwPriorityKey>('urgente');
  // #endregion
}

describe('CwPriorityBadge', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  /**
   * Function priorityBadges
   *
   * @description
   * Retrieves the rendered priority badge elements in their template order.
   *
   * @returns {HTMLElement[]} Priority badge hosts in the test fixture.
   */
  function priorityBadges(): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('cw-priority-badge'));
  }

  it('writes the French word of the priority, the bars hidden', async () => {
    const [badge]: HTMLElement[] = priorityBadges();

    expect(badge.textContent.trim()).toBe('Urgente');
    expect(badge.getAttribute('role')).toBeNull();
    expect(badge.querySelector('cw-priority-icon')?.getAttribute('data-priority')).toBe('urgente');

    component.priority.set('basse');
    await fixture.whenStable();

    expect(badge.textContent.trim()).toBe('Basse');
  });

  it('names a priority badge without its word as an image', () => {
    const badge: HTMLElement = priorityBadges()[1];

    expect(badge.textContent.trim()).toBe('');
    expect(badge.getAttribute('role')).toBe('img');
    expect(badge.getAttribute('aria-label')).toBe('Priorité haute');
  });

  it('reads moyenne for an unknown priority', async () => {
    component.priority.set('none' as CwPriorityKey);
    await fixture.whenStable();
    const [badge]: HTMLElement[] = priorityBadges();

    expect(badge.textContent.trim()).toBe('Moyenne');
    expect(badge.dataset['priority']).toBe('moyenne');
  });
});
