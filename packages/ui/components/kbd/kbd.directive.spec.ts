import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwKbdGroup } from './kbd-group/kbd-group.directive';
import { CwKbd } from './kbd.directive';

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
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const keys = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('p kbd[cwKbd]'),
    );

    expect(keys.map((key) => key.textContent)).toEqual(['?', 'Ctrl', 'Maj', 'P']);
    expect(keys[0].getAttribute('data-size')).toBe('lg');
    expect(keys[1].getAttribute('data-variant')).toBe('default');
  });
});
