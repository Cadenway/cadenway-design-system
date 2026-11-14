import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwSkeleton } from './skeleton.directive';
import type { CwSkeletonAnimation } from './skeleton.types';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test loading region containing two placeholder shapes with a configurable animation.
 */
@Component({
  imports: [CwSkeleton],
  template: `
    <div role="status" aria-busy="true" aria-label="Chargement des tâches">
      <div cwSkeleton class="size-4 rounded-full"></div>
      <div cwSkeleton class="h-3.5 w-[62%]" [animation]="animation()"></div>
    </div>
  `,
})
class Host {
  // #region Properties
  /**
   * Property animation
   * @readonly
   *
   * @description
   * Signal used by the test to change the second placeholder's animation.
   *
   * @type {WritableSignal<CwSkeletonAnimation>}
   * @default 'pulse'
   */
  public readonly animation: WritableSignal<CwSkeletonAnimation> =
    signal<CwSkeletonAnimation>('pulse');
  // #endregion
}

describe('CwSkeleton', () => {
  it('hides every shape and leaves the busy container as the only thing announced', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const container: Element | null = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="status"]',
    );
    const shapes: Element[] = Array.from(container?.children ?? []);

    expect(container?.getAttribute('aria-label')).toBe('Chargement des tâches');
    expect(shapes).toHaveLength(2);
    expect(shapes.every((shape) => shape.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('keeps the shape given by the consumer and exposes the animation as a hook', async () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [circle, line]: Element[] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[aria-hidden="true"]'),
    );

    expect(circle.classList).toContain('rounded-full');
    expect(line.getAttribute('data-animation')).toBe('pulse');

    fixture.componentInstance.animation.set('shimmer');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(line.getAttribute('data-animation')).toBe('shimmer');
    expect(line.classList).toContain('w-[62%]');
  });
});
