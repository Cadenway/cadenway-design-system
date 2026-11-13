import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwStatusIcon } from './status-icon.component';
import { CW_STATUS_LABELS } from '../status-icon.constants';
import type { CwStatusKey } from '../status-icon.types';

@Component({
  imports: [CwStatusIcon],
  template: `
    <span>
      <cw-status-icon [status]="status()" [from]="from()" [size]="size()" />
      {{ labels[status()] }}
    </span>
    <span><cw-status-icon status="done" milestone /> Jalon</span>
    <span><cw-status-icon status="blocked" milestone /> Jalon bloqué</span>
  `,
})
class Host {
  readonly labels = CW_STATUS_LABELS;
  readonly status = signal<CwStatusKey>('todo');
  readonly from = signal<CwStatusKey | undefined>(undefined);
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

function icons(host: HTMLElement): HTMLElement[] {
  return Array.from(host.querySelectorAll<HTMLElement>('cw-status-icon'));
}

describe('CwStatusIcon', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  function create(): void {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  }

  it('draws the status, hidden from assistive technologies, next to its French word', async () => {
    create();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const [icon] = icons(host);

    expect(icon.dataset['status']).toBe('todo');
    expect(icon.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(icon.parentElement?.textContent.trim()).toBe('À faire');

    component.status.set('blocked');
    await fixture.whenStable();

    expect(icon.dataset['status']).toBe('blocked');
    expect(icon.parentElement?.textContent.trim()).toBe('Bloqué');
  });

  it('labels the ten statuses in French, from the mockup', () => {
    expect(Object.values(CW_STATUS_LABELS)).toEqual([
      'À trier',
      'À planifier',
      'À faire',
      'En cours',
      'En revue',
      'En validation',
      'En attente',
      'Bloqué',
      'Terminé',
      'Annulé',
    ]);
  });

  it('falls back to todo for an unknown status', async () => {
    create();
    component.status.set('archived' as CwStatusKey);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    expect(icons(host)[0]?.dataset['status']).toBe('todo');
  });

  it('shows the previous status, then switches two animation frames after the first render', async () => {
    const frames = holdFrames();
    try {
      create();
      component.from.set('progress');
      component.status.set('done');
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const [icon] = icons(host);

      expect(icon.dataset['status']).toBe('progress');
      frames.flush();
      await fixture.whenStable();
      expect(icon.dataset['status']).toBe('progress');
      frames.flush();
      await fixture.whenStable();
      expect(icon.dataset['status']).toBe('done');
    } finally {
      frames.restore();
    }
  });

  it('maps the size to its data hook and accepts numbers', async () => {
    create();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const [icon] = icons(host);

    expect(icon.dataset['size']).toBe('4');
    component.size.set(3.5);
    await fixture.whenStable();
    expect(icon.dataset['size']).toBe('3.5');
  });

  it('gives each milestone diamond its own clip path', async () => {
    create();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const ids = icons(host)
      .slice(1)
      .map((icon) => icon.querySelector('clipPath')?.getAttribute('id'));

    expect(ids[0]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
    expect(icons(host)[0]?.querySelector('clipPath')).toBeNull();
  });
});
