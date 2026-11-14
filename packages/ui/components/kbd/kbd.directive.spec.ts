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
});
