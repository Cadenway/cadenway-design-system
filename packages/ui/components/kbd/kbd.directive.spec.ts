import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwKbdGroup } from './kbd-group/kbd-group.directive';
import { CwKbd } from './kbd.directive';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host containing individual keyboard keys and a key combination.
 */
@Component({
  imports: [CwKbd, CwKbdGroup],
  template: `
    <p>
      Appuyez sur <kbd cwKbd size="lg">?</kbd> pour afficher tous les raccourcis.
      <kbd cwKbdGroup><kbd cwKbd>Ctrl</kbd><kbd cwKbd>Maj</kbd><kbd cwKbd>P</kbd></kbd>
    </p>
  `,
})
class Host {}

/**
 * Class DialogKeyHost
 * @class DialogKeyHost
 *
 * @description
 * Test host rendering one key of the keyboard shortcuts dialog.
 */
@Component({
  imports: [CwKbd],
  template: `<kbd cwKbd size="xl">?</kbd>`,
})
class DialogKeyHost {}

describe('CwKbd', () => {
  it('keeps the native kbd element and exposes its size and variant as hooks', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const keys: Element[] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('p kbd[cwKbd]'),
    );

    expect(keys.map((key) => key.textContent)).toEqual(['?', 'Ctrl', 'Maj', 'P']);
    expect(keys[0].getAttribute('data-size')).toBe('lg');
    expect(keys[1].getAttribute('data-variant')).toBe('default');
  });

  it('sizes a shortcuts dialog key at 24 px with extra-small text', () => {
    const fixture: ComponentFixture<DialogKeyHost> = TestBed.createComponent(DialogKeyHost);
    fixture.detectChanges();
    const key: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector('kbd');
    if (!key) throw new Error('Key missing');

    expect(key.getAttribute('data-size')).toBe('xl');
    expect(key.classList).toContain('h-6');
    expect(key.classList).toContain('min-w-6');
    expect(key.classList).toContain('text-xs');
  });
});
