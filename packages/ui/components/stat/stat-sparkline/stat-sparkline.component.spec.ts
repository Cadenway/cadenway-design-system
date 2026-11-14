import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import type { CwStatSparklineType } from '../stat.types';
import { CwStatSparkline } from './stat-sparkline.component';

/**
 * Class Host
 *
 * @description
 * Hosts a sparkline with selectable data and display form.
 */
@Component({
  imports: [CwStatSparkline],
  template: `<cw-stat-sparkline [data]="data()" [type]="type()" />`,
})
class Host {
  // #region Properties
  /**
   * Property data
   * @readonly
   *
   * @description
   * Values displayed in the sparkline.
   *
   * @type {WritableSignal<readonly number[]>}
   */
  public readonly data: WritableSignal<readonly number[]> = signal<readonly number[]>([2, 5, 3, 9]);

  /**
   * Property type
   * @readonly
   *
   * @description
   * Current sparkline form.
   *
   * @type {WritableSignal<CwStatSparklineType>}
   */
  public readonly type: WritableSignal<CwStatSparklineType> = signal<CwStatSparklineType>('line');
  // #endregion
}

describe('CwStatSparkline', () => {
  it('stays decorative whatever its form', async () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    const sparkline: HTMLElement | null = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('cw-stat-sparkline');

    expect(sparkline?.getAttribute('aria-hidden')).toBe('true');
    expect(sparkline?.dataset['type']).toBe('line');

    fixture.componentInstance.type.set('bar');
    await fixture.whenStable();

    expect(sparkline?.dataset['type']).toBe('bar');
    expect(sparkline?.getAttribute('aria-hidden')).toBe('true');
  });
});
