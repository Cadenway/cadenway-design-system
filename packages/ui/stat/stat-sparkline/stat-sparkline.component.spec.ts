import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { CwStatSparklineType } from '../stat.types';
import { CwStatSparkline } from './stat-sparkline.component';

@Component({
  imports: [CwStatSparkline],
  template: `<cw-stat-sparkline [data]="data()" [type]="type()" />`,
})
class Host {
  readonly data = signal<readonly number[]>([2, 5, 3, 9]);
  readonly type = signal<CwStatSparklineType>('line');
}

describe('CwStatSparkline', () => {
  it('stays decorative whatever its form', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    const sparkline = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'cw-stat-sparkline',
    );

    expect(sparkline?.getAttribute('aria-hidden')).toBe('true');
    expect(sparkline?.dataset['type']).toBe('line');

    fixture.componentInstance.type.set('bar');
    await fixture.whenStable();

    expect(sparkline?.dataset['type']).toBe('bar');
    expect(sparkline?.getAttribute('aria-hidden')).toBe('true');
  });
});
