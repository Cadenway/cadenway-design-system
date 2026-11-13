import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import type { CwDropzoneFileState } from '../dropzone.types';
import { CwDropzoneFile } from './dropzone-file.component';

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
  readonly state = signal<CwDropzoneFileState>('uploading');
  readonly error = signal('');
  readonly retryable = signal(false);
  readonly events = signal<string[]>([]);
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
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
    const bar = host.querySelector('[role="progressbar"]');

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
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce');
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
