import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwStat } from '../stat.component';
import { CwStatGroup } from './stat-group.component';

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
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    const group = (fixture.nativeElement as HTMLElement).querySelector('[role="group"]');

    expect(group?.getAttribute('aria-label')).toBe('Sprint 14');
    expect(group?.querySelectorAll('cw-stat')).toHaveLength(2);
  });
});
