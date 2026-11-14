import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { CwDropzone } from './dropzone.component';
import type { CwDropzoneRejection } from './dropzone.types';

/**
 * Function required
 *
 * @description
 * Returns an element or throws when it is absent.
 *
 * @param {T | null | undefined} value - Optional value to require.
 *
 * @returns {T} The value when present.
 */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Missing element');
  return value;
}

/**
 * Class Host
 *
 * @description
 * Hosts a dropzone with controllable limits and captured results.
 */
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
  // #region Properties
  /**
   * Property maxFiles
   * @readonly
   *
   * @description
   * Maximum allowed files.
   *
   * @type {WritableSignal<number | null>}
   */
  public readonly maxFiles: WritableSignal<number | null> = signal<number | null>(null);

  /**
   * Property count
   * @readonly
   *
   * @description
   * Number of already attached files.
   *
   * @type {WritableSignal<number>}
   */
  public readonly count: WritableSignal<number> = signal(0);

  /**
   * Property size
   * @readonly
   *
   * @description
   * Dropzone layout size.
   *
   * @type {WritableSignal<'default' | 'compact'>}
   */
  public readonly size: WritableSignal<'default' | 'compact'> = signal<'default' | 'compact'>(
    'default',
  );

  /**
   * Property added
   * @readonly
   *
   * @description
   * Files accepted by the dropzone.
   *
   * @type {WritableSignal<File[]>}
   */
  public readonly added: WritableSignal<File[]> = signal<File[]>([]);

  /**
   * Property rejected
   * @readonly
   *
   * @description
   * Files rejected by the dropzone.
   *
   * @type {WritableSignal<CwDropzoneRejection[]>}
   */
  public readonly rejected: WritableSignal<CwDropzoneRejection[]> = signal<CwDropzoneRejection[]>(
    [],
  );
  // #endregion
}

/**
 * Function file
 *
 * @description
 * Creates a file with the given name, size and MIME type.
 *
 * @param {string} name - File name.
 * @param {number} bytes - File size in bytes.
 * @param {string} [type] - Optional MIME type.
 *
 * @returns {File} File constructed for the test.
 */
function file(name: string, bytes: number, type: string = ''): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

/**
 * Function dragEvent
 *
 * @description
 * Creates a drag event with simulated files and MIME types.
 *
 * @param {string} type - Drag event type.
 * @param {File[]} [files] - Files exposed by the simulated transfer.
 * @param {string[]} [itemTypes] - MIME types exposed by transfer items.
 *
 * @returns {Event} Simulated drag event.
 */
function dragEvent(type: string, files: File[] = [], itemTypes: string[] = []): Event {
  const event: Event = new Event(type, { bubbles: true, cancelable: true });
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

  /**
   * Function browse
   *
   * @description
   * Finds the browse button in the fixture.
   *
   * @returns {HTMLButtonElement} Browse button in the fixture.
   */
  function browse(): HTMLButtonElement {
    const button: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
      (element) => element.getAttribute('aria-label')?.startsWith('parcourez les fichiers'),
    );
    if (!button) throw new Error('No browse button');
    return button;
  }

  /**
   * Function pick
   *
   * @description
   * Simulates selection of files in the native picker.
   *
   * @param {File[]} files - Files to supply through the picker.
   */
  function pick(files: File[]): void {
    const input: HTMLInputElement = required(
      host.querySelector<HTMLInputElement>('input[type="file"]'),
    );
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
  }

  it('names the browse button with the limits and opens the native picker', () => {
    const input: HTMLInputElement = required(
      host.querySelector<HTMLInputElement>('input[type="file"]'),
    );
    const click: Mock<() => void> = vi.spyOn(input, 'click').mockImplementation(() => undefined);

    browse().click();

    expect(browse().getAttribute('aria-label')).toBe('parcourez les fichiers (1 Mo max.)');
    expect(browse().textContent.trim()).toBe('parcourez');
    expect(click).toHaveBeenCalledOnce();
    expect(input.accept).toBe('.png,.pdf,image/*');
  });

  it('accepts by extension or MIME type and rejects by type and size', async () => {
    const shot: File = file('capture.webp', 10, 'image/webp');
    const spec: File = file('specs.pdf', 10);
    const exe: File = file('installateur.exe', 10, 'application/x-msdownload');
    const big: File = file('maquette.png', 2 * 1024 * 1024, 'image/png');

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
    const first: File = file('a.png', 1, 'image/png');
    const second: File = file('b.png', 1, 'image/png');

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

    const dropped: File = file('a.png', 1, 'image/png');
    const drop: Event = dragEvent('drop', [dropped]);
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
    const pasted: File = file('collage.png', 1, 'image/png');
    const paste: Event = new Event('paste', { bubbles: true, cancelable: true });
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
