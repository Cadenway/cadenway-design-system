import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwSkeleton } from './skeleton.directive';
import type { CwSkeletonAnimation } from '../skeleton.types';

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
  readonly animation = signal<CwSkeletonAnimation>('pulse');
}

describe('CwSkeleton', () => {
  it('hides every shape and leaves the busy container as the only thing announced', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const container = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]');
    const shapes = Array.from(container?.children ?? []);

    expect(container?.getAttribute('aria-label')).toBe('Chargement des tâches');
    expect(shapes).toHaveLength(2);
    expect(shapes.every((shape) => shape.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('keeps the shape given by the consumer and exposes the animation as a hook', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [circle, line] = Array.from(
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
