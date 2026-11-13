import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { CwPriorityKey } from '@cadenway/ui/priority-icon';

import { CwPriorityBadge } from './priority-badge.component';

@Component({
  imports: [CwPriorityBadge],
  template: `
    <cw-priority-badge [priority]="priority()" />
    <cw-priority-badge priority="haute" [showLabel]="false" />
  `,
})
class Host {
  readonly priority = signal<CwPriorityKey>('urgente');
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

  function priorityBadges(): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('cw-priority-badge'));
  }

  it('writes the French word of the priority, the bars hidden', async () => {
    const [badge] = priorityBadges();

    expect(badge.textContent.trim()).toBe('Urgente');
    expect(badge.getAttribute('role')).toBeNull();
    expect(badge.querySelector('cw-priority-icon')?.getAttribute('data-priority')).toBe('urgente');

    component.priority.set('basse');
    await fixture.whenStable();

    expect(badge.textContent.trim()).toBe('Basse');
  });

  it('names a priority badge without its word as an image', () => {
    const badge = priorityBadges()[1];

    expect(badge.textContent.trim()).toBe('');
    expect(badge.getAttribute('role')).toBe('img');
    expect(badge.getAttribute('aria-label')).toBe('Priorité haute');
  });

  it('reads moyenne for an unknown priority', async () => {
    component.priority.set('none' as CwPriorityKey);
    await fixture.whenStable();
    const [badge] = priorityBadges();

    expect(badge.textContent.trim()).toBe('Moyenne');
    expect(badge.dataset['priority']).toBe('moyenne');
  });
});
