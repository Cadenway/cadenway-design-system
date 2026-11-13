import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwRipple } from './ripple.directive';

@Component({
  imports: [CwRipple],
  template: `
    <button type="button" cwRipple class="relative isolate overflow-hidden">Créer une tâche</button>
    <button type="button" cwRipple disabled>Enregistrer</button>
  `,
})
class Host {}

function press(button: HTMLElement): void {
  button.dispatchEvent(new PointerEvent('pointerdown', { button: 0, clientX: 4, clientY: 4 }));
}

describe('CwRipple', () => {
  let host: HTMLElement;

  beforeEach(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('draws a hidden pill on press and marks the host', () => {
    const [button] = Array.from(host.querySelectorAll('button'));
    press(button);

    expect(button.hasAttribute('data-ripple')).toBe(true);
    expect(button.querySelector('span[aria-hidden="true"]')).toBeTruthy();
  });

  it('draws nothing on a disabled host', () => {
    const disabled = Array.from(host.querySelectorAll('button'))[1];
    press(disabled);

    expect(disabled.querySelector('span')).toBeNull();
  });
});
