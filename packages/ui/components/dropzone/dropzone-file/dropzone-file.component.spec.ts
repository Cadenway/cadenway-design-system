import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import type { Mock } from 'vitest';

import type { CwDropzoneFileState } from '../dropzone.types';
import { CwDropzoneFile } from './dropzone-file.component';

/**
 * Class Host
 *
 * @description
 * Hosts an upload row with controllable state and captured actions.
 */
@Component({
  imports: [CwDropzoneFile],
  template: `
    <ul>
      <cw-dropzone-file
        name="export-taches.csv"
        [size]="488 * 1024"
        [state]="state()"
        [progress]="64"
        [error]="error()"
        [retryable]="retryable()"
        (cancel)="events.set([...events(), 'cancel'])"
        (retry)="events.set([...events(), 'retry'])"
        (remove)="events.set([...events(), 'remove'])"
      />
    </ul>
  `,
})
class Host {
  // #region Properties
  /**
   * Property state
   * @readonly
   *
   * @description
   * Current upload state.
   *
   * @type {WritableSignal<CwDropzoneFileState>}
   */
  public readonly state: WritableSignal<CwDropzoneFileState> =
    signal<CwDropzoneFileState>('uploading');

  /**
   * Property error
   * @readonly
   *
   * @description
   * Current upload error message.
   *
   * @type {WritableSignal<string>}
   */
  public readonly error: WritableSignal<string> = signal('');

  /**
   * Property retryable
   * @readonly
   *
   * @description
   * Whether retry is available.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly retryable: WritableSignal<boolean> = signal(false);

  /**
   * Property events
   * @readonly
   *
   * @description
   * Recorded upload actions.
   *
   * @type {WritableSignal<string[]>}
   */
  public readonly events: WritableSignal<string[]> = signal<string[]>([]);
  // #endregion
}

/**
 * Function button
 *
 * @description
 * Finds a file action by its accessible name.
 *
 * @param {HTMLElement} host - Fixture containing file actions.
 * @param {string} name - Accessible action name.
 *
 * @returns {HTMLButtonElement} Matching action button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwDropzoneFile', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('is a list item with a named progress bar and a cancel button while uploading', () => {
    const bar: Element | null = host.querySelector('[role="progressbar"]');

    expect(host.querySelector('[role="listitem"]')).not.toBeNull();
    expect(bar?.getAttribute('aria-label')).toBe('Envoi de export-taches.csv');
    expect(bar?.getAttribute('aria-valuenow')).toBe('64');
    expect(host.textContent).toContain('64 % · 312 Ko sur 488 Ko');

    button(host, "Annuler l'envoi de export-taches.csv").click();
    expect(component.events()).toEqual(['cancel']);
  });

  it('says « En attente » while queued', async () => {
    component.state.set('queued');
    await fixture.whenStable();

    expect(host.textContent).toContain('En attente');
    expect(host.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('announces the end of the upload and offers to remove the file', async () => {
    const announce: Mock<LiveAnnouncer['announce']> = vi.spyOn(
      TestBed.inject(LiveAnnouncer),
      'announce',
    );
    component.state.set('done');
    await fixture.whenStable();

    expect(announce).toHaveBeenCalledWith('export-taches.csv joint');
    expect(host.textContent).toContain('488 Ko');
    button(host, 'Retirer export-taches.csv').click();
    expect(component.events()).toEqual(['remove']);
  });

  it('shows the error in text and offers retry for network errors only', async () => {
    component.state.set('error');
    component.error.set('Envoi interrompu : connexion perdue.');
    await fixture.whenStable();

    expect(host.textContent).toContain('Envoi interrompu : connexion perdue.');
    expect(() => button(host, "Réessayer l'envoi de export-taches.csv")).toThrow();

    component.retryable.set(true);
    await fixture.whenStable();
    button(host, "Réessayer l'envoi de export-taches.csv").click();
    expect(component.events()).toEqual(['retry']);
  });
});
