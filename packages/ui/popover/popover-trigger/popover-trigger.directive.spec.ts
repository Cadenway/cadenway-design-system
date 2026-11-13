import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwPopover } from '../popover.component';
import { CwPopoverTrigger } from './popover-trigger.directive';

@Component({
  imports: [CwPopover, CwPopoverTrigger],
  template: `
    <button type="button" [cwPopoverTrigger]="due">Échéance</button>
    @if (second()) {
      <button type="button" [cwPopoverTrigger]="due">Autre échéance</button>
    }
    <cw-popover #due ariaLabel="Échéance" [(open)]="open"><p>Jeudi 12 novembre</p></cw-popover>
  `,
})
class Host {
  readonly second = signal(true);
  readonly open = signal(false);
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
}

describe('CwPopoverTrigger', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('moves a shared panel to the trigger that opened it', async () => {
    const first = button(host, 'Échéance');
    const second = button(host, 'Autre échéance');
    first.click();
    await fixture.whenStable();
    expect(first.getAttribute('aria-expanded')).toBe('true');

    second.click();
    await fixture.whenStable();
    expect(panels()).toHaveLength(1);
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(second.getAttribute('aria-controls')).toBe(panels()[0]?.id);
  });

  it('closes the panel when its anchor goes away', async () => {
    button(host, 'Autre échéance').click();
    await fixture.whenStable();

    fixture.componentInstance.second.set(false);
    await fixture.whenStable();
    expect(panels()).toHaveLength(0);
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
