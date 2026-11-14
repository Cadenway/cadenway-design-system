import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { CwStatusKey } from '@cadenway/ui/components/status-icon';

import { CwStatusBadge } from './status-badge.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host with a changing status badge and a small badge with a custom label.
 */
@Component({
  imports: [CwStatusBadge],
  template: `
    <cw-status-badge [status]="status()" />
    <cw-status-badge status="waiting" label="En pause" size="sm" />
  `,
})
class Host {
  // #region Properties
  /**
   * Property status
   * @readonly
   *
   * @description
   * Signal used by tests to change the first badge's status.
   *
   * @type {WritableSignal<CwStatusKey>}
   * @default 'progress'
   */
  public readonly status: WritableSignal<CwStatusKey> = signal<CwStatusKey>('progress');
  // #endregion
}

describe('CwStatusBadge', () => {
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
   * Function statusBadges
   *
   * @description
   * Retrieves the rendered status badge elements in their template order.
   *
   * @returns {HTMLElement[]} Status badge hosts in the test fixture.
   */
  function statusBadges(): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('cw-status-badge'));
  }

  it('writes the French word of the status next to its hidden icon', async () => {
    const [badge]: HTMLElement[] = statusBadges();

    expect(badge.textContent.trim()).toBe('En cours');
    expect(badge.querySelector('cw-status-icon')?.getAttribute('data-status')).toBe('progress');
    expect(badge.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');

    component.status.set('done');
    await fixture.whenStable();

    expect(badge.textContent.trim()).toBe('Terminé');
    expect(badge.querySelector('cw-status-icon')?.getAttribute('data-status')).toBe('done');
  });

  it('takes a replacement word and the small size', () => {
    const badge: HTMLElement = statusBadges()[1];

    expect(badge.textContent.trim()).toBe('En pause');
    expect(badge.dataset['size']).toBe('sm');
  });
});
