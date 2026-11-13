import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwDropzone } from './dropzone.component';
import type { CwDropzoneRejection } from './dropzone.types';

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Missing element');
  return value;
}

@Component({
  imports: [CwDropzone],
  template: `
    <cw-dropzone
      accept=".png,.pdf,image/*"
      [maxSize]="1024 * 1024"
      [maxFiles]="maxFiles()"
      [fileCount]="count()"
      [size]="size()"
      (filesAdded)="added.set($event)"
      (filesRejected)="rejected.set($event)"
    />
  `,
})
class Host {
  readonly maxFiles = signal<number | null>(null);
  readonly count = signal(0);
  readonly size = signal<'default' | 'compact'>('default');
  readonly added = signal<File[]>([]);
  readonly rejected = signal<CwDropzoneRejection[]>([]);
}

function file(name: string, bytes: number, type = ''): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

function dragEvent(type: string, files: File[] = [], itemTypes: string[] = []): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types: ['Files'],
      files,
      items: itemTypes.map((itemType) => ({ kind: 'file', type: itemType })),
      dropEffect: 'none',
    },
  });
  return event;
}

describe('CwDropzone', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let zone: HTMLElement;
  let component: Host;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    zone = required(host.querySelector<HTMLElement>('cw-dropzone'));
    component = fixture.componentInstance;
  });

  function browse(): HTMLButtonElement {
    const button = Array.from(host.querySelectorAll('button')).find((element) =>
      element.getAttribute('aria-label')?.startsWith('parcourez les fichiers'),
    );
    if (!button) throw new Error('No browse button');
    return button;
  }

  function pick(files: File[]): void {
    const input = required(host.querySelector<HTMLInputElement>('input[type="file"]'));
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
  }

  it('names the browse button with the limits and opens the native picker', () => {
    const input = required(host.querySelector<HTMLInputElement>('input[type="file"]'));
    const click = vi.spyOn(input, 'click').mockImplementation(() => undefined);

    browse().click();

    expect(browse().getAttribute('aria-label')).toBe('parcourez les fichiers (1 Mo max.)');
    expect(browse().textContent.trim()).toBe('parcourez');
    expect(click).toHaveBeenCalledOnce();
    expect(input.accept).toBe('.png,.pdf,image/*');
  });

  it('accepts by extension or MIME type and rejects by type and size', async () => {
    const shot = file('capture.webp', 10, 'image/webp');
    const spec = file('specs.pdf', 10);
    const exe = file('installateur.exe', 10, 'application/x-msdownload');
    const big = file('maquette.png', 2 * 1024 * 1024, 'image/png');

    pick([shot, spec, exe, big]);
    await fixture.whenStable();

    expect(component.added()).toEqual([shot, spec]);
    expect(component.rejected()).toEqual([
      { file: exe, reason: 'type' },
      { file: big, reason: 'size' },
    ]);
  });

  it('refuses the files beyond the room left by maxFiles', async () => {
    component.maxFiles.set(3);
    component.count.set(2);
    await fixture.whenStable();
    const first = file('a.png', 1, 'image/png');
    const second = file('b.png', 1, 'image/png');

    pick([first, second]);
    await fixture.whenStable();

    expect(component.added()).toEqual([first]);
    expect(component.rejected()).toEqual([{ file: second, reason: 'count' }]);
  });

  it('shows the drop state while files are dragged over it, and takes the drop', async () => {
    zone.dispatchEvent(dragEvent('dragenter', [], ['image/png', 'application/pdf']));
    await fixture.whenStable();

    expect(zone.dataset['state']).toBe('over');
    expect(zone.textContent).toContain('Relâchez pour joindre');
    expect(zone.textContent).toContain('2 fichiers');

    const dropped = file('a.png', 1, 'image/png');
    const drop = dragEvent('drop', [dropped]);
    zone.dispatchEvent(drop);
    await fixture.whenStable();

    expect(drop.defaultPrevented).toBe(true);
    expect(zone.dataset['state']).toBe('idle');
    expect(component.added()).toEqual([dropped]);
  });

  it('shows a refused type while it is dragged, as an alert', async () => {
    zone.dispatchEvent(dragEvent('dragenter', [], ['application/x-msdownload']));
    await fixture.whenStable();

    expect(zone.dataset['state']).toBe('reject');
    expect(zone.getAttribute('role')).toBe('alert');
    expect(zone.textContent).toContain('Type non accepté');

    zone.dispatchEvent(dragEvent('dragleave'));
    await fixture.whenStable();
    expect(zone.dataset['state']).toBe('idle');
  });

  it('takes the files pasted while it holds the focus', async () => {
    const pasted = file('collage.png', 1, 'image/png');
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: { files: [pasted] } });

    browse().dispatchEvent(paste);
    await fixture.whenStable();

    expect(component.added()).toEqual([pasted]);
  });

  it('is disabled once maxFiles is reached and says so', async () => {
    component.maxFiles.set(10);
    component.count.set(10);
    component.size.set('compact');
    await fixture.whenStable();

    expect(zone.getAttribute('aria-disabled')).toBe('true');
    expect(zone.textContent).toContain('Limite atteinte : 10 fichiers');

    zone.dispatchEvent(dragEvent('drop', [file('a.png', 1, 'image/png')]));
    await fixture.whenStable();
    expect(component.added()).toEqual([]);
  });
});
