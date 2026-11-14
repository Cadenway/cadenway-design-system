import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwStatusIcon } from './status-icon.component';
import { CW_STATUS_LABELS } from './status-icon.constants';
import type { CwStatusIconSize, CwStatusKey } from './status-icon.types';

/**
 * Class Host
 *
 * @description
 * Hosts status and milestone icons with controllable inputs.
 */
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
  // #region Properties
  /**
   * Property labels
   * @readonly
   *
   * @description
   * French labels shown next to decorative icons.
   *
   * @type {typeof CW_STATUS_LABELS}
   */
  public readonly labels: typeof CW_STATUS_LABELS = CW_STATUS_LABELS;

  /**
   * Property status
   * @readonly
   *
   * @description
   * Target status of the first icon.
   *
   * @type {WritableSignal<CwStatusKey>}
   */
  public readonly status: WritableSignal<CwStatusKey> = signal<CwStatusKey>('todo');

  /**
   * Property from
   * @readonly
   *
   * @description
   * Initial status for the morph.
   *
   * @type {WritableSignal<CwStatusKey | undefined>}
   */
  public readonly from: WritableSignal<CwStatusKey | undefined> = signal<CwStatusKey | undefined>(
    undefined,
  );

  /**
   * Property size
   * @readonly
   *
   * @description
   * Icon size supplied as a string or number.
   *
   * @type {WritableSignal<CwStatusIconSize | number>}
   */
  public readonly size: WritableSignal<CwStatusIconSize | number> = signal<
    CwStatusIconSize | number
  >('4');
  // #endregion
}

/**
 * Function holdFrames
 *
 * @description
 * Holds animation frames until the test releases them and restores browser callbacks afterward.
 *
 * @returns {{ flush: () => void; restore: () => void }} Callbacks to flush queued frames and restore browser functions.
 */
function holdFrames(): { flush: () => void; restore: () => void } {
  const queue: FrameRequestCallback[] = [];
  const request: typeof window.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  const cancel: typeof window.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
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

/**
 * Function icons
 *
 * @description
 * Returns the status icon elements in the fixture.
 *
 * @param {HTMLElement} host - Fixture containing status icons.
 *
 * @returns {HTMLElement[]} Status icon hosts in the fixture.
 */
function icons(host: HTMLElement): HTMLElement[] {
  return Array.from(host.querySelectorAll<HTMLElement>('cw-status-icon'));
}

describe('CwStatusIcon', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  /**
   * Function create
   *
   * @description
   * Creates the test host and retains its element and component instance.
   */
  function create(): void {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  }

  it('draws the status, hidden from assistive technologies, next to its French word', async () => {
    create();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const [icon]: HTMLElement[] = icons(host);

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
    const frames: { flush: () => void; restore: () => void } = holdFrames();
    try {
      create();
      component.from.set('progress');
      component.status.set('done');
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const [icon]: HTMLElement[] = icons(host);

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
    const [icon]: HTMLElement[] = icons(host);

    expect(icon.dataset['size']).toBe('4');
    component.size.set(3.5);
    await fixture.whenStable();
    expect(icon.dataset['size']).toBe('3.5');
  });

  it('gives each milestone diamond its own clip path', async () => {
    create();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const ids: (string | null | undefined)[] = icons(host)
      .slice(1)
      .map((icon) => icon.querySelector('clipPath')?.getAttribute('id'));

    expect(ids[0]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
    expect(icons(host)[0]?.querySelector('clipPath')).toBeNull();
  });
});
