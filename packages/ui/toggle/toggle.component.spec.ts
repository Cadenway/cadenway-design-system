import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwToggle } from './toggle.component';

@Component({
  imports: [CwToggle],
  template: `
    <form (submit)="$event.preventDefault(); submitted.set(true)">
      <button cwToggle variant="outline" [(pressed)]="onlyMine">Moi uniquement</button>
      <button cwToggle size="sm" aria-label="Gras" [(pressed)]="bold"></button>
      <button cwToggle disabled [pressed]="true">Masquer les terminées</button>
    </form>
  `,
})
class Host {
  readonly onlyMine = signal(false);
  readonly bold = signal(true);
  readonly submitted = signal(false);
}

function byName(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No toggle named ${name}`);
  return found;
}

describe('CwToggle', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('flips the pressed model on click without submitting the form', async () => {
    const onlyMine = byName(host, 'Moi uniquement');
    expect(onlyMine.getAttribute('aria-pressed')).toBe('false');
    expect(onlyMine.dataset['state']).toBe('off');

    onlyMine.click();
    await fixture.whenStable();

    expect(component.onlyMine()).toBe(true);
    expect(component.submitted()).toBe(false);
    expect(onlyMine.getAttribute('type')).toBe('button');
    expect(onlyMine.getAttribute('aria-pressed')).toBe('true');
    expect(onlyMine.dataset['state']).toBe('on');
  });

  it('reflects a pressed model given by the consumer and flips it back', async () => {
    const bold = byName(host, 'Gras');
    expect(bold.getAttribute('aria-pressed')).toBe('true');

    bold.click();
    await fixture.whenStable();

    expect(component.bold()).toBe(false);
    expect(bold.getAttribute('aria-pressed')).toBe('false');
  });

  it('stays pressed and inert when disabled', () => {
    const hide = byName(host, 'Masquer les terminées');

    expect(hide.disabled).toBe(true);
    expect(hide.getAttribute('aria-pressed')).toBe('true');
  });
});
