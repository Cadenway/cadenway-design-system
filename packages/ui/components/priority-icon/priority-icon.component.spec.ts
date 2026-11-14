import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwPriorityIcon } from './priority-icon.component';
import { CW_PRIORITY_LABELS } from './priority-icon.constants';
import type { CwPriorityIconSize, CwPriorityKey } from './priority-icon.types';

/**
 * Class Host
 *
 * @description
 * Hosts an icon with controllable priority, previous state and size.
 */
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
  // #region Properties
  /**
   * Property labels
   * @readonly
   *
   * @description
   * French labels shown next to the decorative icon.
   *
   * @type {typeof CW_PRIORITY_LABELS}
   */
  public readonly labels: typeof CW_PRIORITY_LABELS = CW_PRIORITY_LABELS;

  /**
   * Property priority
   * @readonly
   *
   * @description
   * Target priority of the icon.
   *
   * @type {WritableSignal<CwPriorityKey>}
   */
  public readonly priority: WritableSignal<CwPriorityKey> = signal<CwPriorityKey>('haute');

  /**
   * Property from
   * @readonly
   *
   * @description
   * Initial priority for the morph.
   *
   * @type {WritableSignal<CwPriorityKey | undefined>}
   */
  public readonly from: WritableSignal<CwPriorityKey | undefined> = signal<
    CwPriorityKey | undefined
  >(undefined);

  /**
   * Property size
   * @readonly
   *
   * @description
   * Icon size supplied as a string or number.
   *
   * @type {WritableSignal<CwPriorityIconSize | number>}
   */
  public readonly size: WritableSignal<CwPriorityIconSize | number> = signal<
    CwPriorityIconSize | number
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

describe('CwPriorityIcon', () => {
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

  /**
   * Function icon
   *
   * @description
   * Finds the priority icon in the fixture.
   *
   * @returns {HTMLElement | null} Priority icon host, or null when absent.
   */
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
    const frames: { flush: () => void; restore: () => void } = holdFrames();
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
    const frames: { flush: () => void; restore: () => void } = holdFrames();
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
