import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwStat } from '../stat.component';
import { CwStatGroup } from './stat-group.component';

/**
 * Class Host
 *
 * @description
 * Hosts two statistics in a named group.
 */
@Component({
  imports: [CwStat, CwStatGroup],
  template: `
    <cw-stat-group ariaLabel="Sprint 14">
      <cw-stat label="Ouvertes" value="18" />
      <cw-stat label="Terminées" value="12" />
    </cw-stat-group>
  `,
})
class Host {}

describe('CwStatGroup', () => {
  it('is a named group holding its stats', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    const group: Element | null = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="group"]',
    );

    expect(group?.getAttribute('aria-label')).toBe('Sprint 14');
    expect(group?.querySelectorAll('cw-stat')).toHaveLength(2);
  });
});
