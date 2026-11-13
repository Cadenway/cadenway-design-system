import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import { CwAttachment } from './attachment.component';
import type { CwAttachmentSize, CwAttachmentState } from './attachment.types';

@Component({
  imports: [CwAttachment],
  template: `
    <cw-attachment
      name="specs-export.pdf"
      href="/fichiers/specs-export.pdf"
      [fileSize]="2516582"
      [state]="state()"
      [progress]="64"
      [error]="error()"
      [size]="size()"
      (open)="$event.preventDefault(); events.set([...events(), 'open'])"
      (remove)="events.set([...events(), 'remove'])"
      (retry)="events.set([...events(), 'retry'])"
      (cancel)="events.set([...events(), 'cancel'])"
    />
    <cw-attachment
      name="PR #412 · Forcer l'UTF-8"
      href="https://github.com/cadenway/web/pull/412"
    />
    <cw-attachment name="capture-excel.png" [fileSize]="319488" [removable]="false" />
    <cw-attachment name="export" mimeType="text/csv" [fileSize]="49152" />
  `,
})
class Host {
  readonly state = signal<CwAttachmentState>('done');
  readonly error = signal('');
  readonly size = signal<CwAttachmentSize>('default');
  readonly events = signal<string[]>([]);
}

function named(host: HTMLElement, selector: string, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>(selector)).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

describe('CwAttachment', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('shows the size and type, a named download and a remove action', () => {
    expect(host.textContent).toContain('2,4 Mo · PDF');
    const download = named(host, 'a', 'Télécharger specs-export.pdf');
    expect(download.getAttribute('href')).toBe('/fichiers/specs-export.pdf');
    expect(download.hasAttribute('download')).toBe(true);

    named(host, 'button', 'Retirer specs-export.pdf').click();
    expect(component.events()).toEqual(['remove']);
  });

  it('emits open from the name link, which the consumer can keep on the page', () => {
    named(host, 'a', 'specs-export.pdf').click();

    expect(component.events()).toEqual(['open']);
  });

  it('detects links, images and files, and their second line', () => {
    const link = named(host, 'a', "Ouvrir PR #412 · Forcer l'UTF-8");

    expect(link.getAttribute('target')).toBe('_blank');
    expect(host.textContent).toContain('github.com');
    expect(host.textContent).toContain('312 Ko · Image');
    expect(host.textContent).toContain('48 Ko · Fichier');
    expect(() => named(host, 'button', 'Retirer capture-excel.png')).toThrow();
  });

  it('shows a named progress bar and a cancel action while uploading', async () => {
    component.state.set('uploading');
    await fixture.whenStable();

    const bar = host.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-label')).toBe('Envoi de specs-export.pdf');
    expect(bar?.getAttribute('aria-valuenow')).toBe('64');
    named(host, 'button', "Annuler l'envoi de specs-export.pdf").click();
    expect(component.events()).toEqual(['cancel']);
  });

  it('shows the error in text, offers retry and announces it', async () => {
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce');
    component.error.set('Trop volumineux (max. 50 Mo)');
    component.state.set('error');
    await fixture.whenStable();

    expect(host.querySelector('cw-attachment')?.getAttribute('data-state')).toBe('error');
    expect(host.textContent).toContain('Trop volumineux (max. 50 Mo)');
    expect(announce).toHaveBeenCalledWith('Trop volumineux (max. 50 Mo)');
    named(host, 'button', "Réessayer l'envoi de specs-export.pdf").click();
    expect(component.events()).toEqual(['retry']);
  });

  it('removes a compact chip with Delete', async () => {
    component.size.set('sm');
    await fixture.whenStable();

    named(host, 'a', 'specs-export.pdf').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
    );

    expect(component.events()).toEqual(['remove']);
  });
});
