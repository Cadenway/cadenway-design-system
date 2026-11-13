import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwPriorityIcon } from './priority-icon.component';
import { CW_PRIORITY_LABELS } from '../priority-icon.constants';
import type { CwPriorityKey } from '../priority-icon.types';

@Component({
  imports: [CwPriorityIcon],
  template: `
    <span>
      <cw-priority-icon [priority]="priority()" [from]="from()" [size]="size()" />
      {{ labels[priority()] }}
    </span>
  `,
})
class Host {
  readonly labels = CW_PRIORITY_LABELS;
  readonly priority = signal<CwPriorityKey>('haute');
  readonly from = signal<CwPriorityKey | undefined>(undefined);
  readonly size = signal<'3' | '3.5' | '4' | '5' | number>('4');
}

/** Animation frames held back until the test releases them one by one. */
function holdFrames(): { flush: () => void; restore: () => void } {
  const queue: FrameRequestCallback[] = [];
  const request = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => queue.push(callback);
  window.cancelAnimationFrame = () => undefined;
  return {
    flush: () => {
      queue.splice(0).forEach((callback) => {
        callback(0);
      });
    },
    restore: () => {
      window.requestAnimationFrame = request;
      window.cancelAnimationFrame = cancel;
    },
  };
}

describe('CwPriorityIcon', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  function create(): void {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  }

  function icon(): HTMLElement | null {
    return host.querySelector<HTMLElement>('cw-priority-icon');
  }

  it('draws the priority, hidden from assistive technologies, next to its French word', async () => {
    create();
    fixture.autoDetectChanges();
    await fixture.whenStable();

    expect(icon()?.dataset['priority']).toBe('haute');
    expect(icon()?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(icon()?.parentElement?.textContent.trim()).toBe('Haute');

    component.priority.set('urgente');
    await fixture.whenStable();

    expect(icon()?.dataset['priority']).toBe('urgente');
    expect(icon()?.parentElement?.textContent.trim()).toBe('Urgente');
  });

  it('labels the four priorities in French, from the mockup', () => {
    expect(CW_PRIORITY_LABELS).toEqual({
      urgente: 'Urgente',
      haute: 'Haute',
      moyenne: 'Moyenne',
      basse: 'Basse',
    });
  });

  it('falls back to moyenne for an unknown priority', async () => {
    create();
    component.priority.set('none' as CwPriorityKey);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    expect(icon()?.dataset['priority']).toBe('moyenne');
  });

  it('shows the previous priority, then switches two animation frames after the first render', async () => {
    const frames = holdFrames();
    try {
      create();
      component.from.set('basse');
      component.priority.set('urgente');
      fixture.autoDetectChanges();
      await fixture.whenStable();

      expect(icon()?.dataset['priority']).toBe('basse');
      frames.flush();
      await fixture.whenStable();
      expect(icon()?.dataset['priority']).toBe('basse');
      frames.flush();
      await fixture.whenStable();
      expect(icon()?.dataset['priority']).toBe('urgente');
    } finally {
      frames.restore();
    }
  });

  it('ignores an unknown previous priority', async () => {
    const frames = holdFrames();
    try {
      create();
      component.from.set('none' as CwPriorityKey);
      fixture.autoDetectChanges();
      await fixture.whenStable();

      expect(icon()?.dataset['priority']).toBe('haute');
    } finally {
      frames.restore();
    }
  });

  it('maps the size to its data hook and accepts numbers', async () => {
    create();
    component.size.set(5);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    expect(icon()?.dataset['size']).toBe('5');
  });
});
