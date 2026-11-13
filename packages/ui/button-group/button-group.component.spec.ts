import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/button';

import { CwButtonGroup } from './button-group.component';

@Component({
  imports: [CwButton, CwButtonGroup],
  template: `
    <cw-button-group ariaLabel="Créer">
      <button cwButton (click)="created.set(true)">Créer une tâche</button>
      <button cwButton size="icon" aria-label="Modèles de tâche"></button>
    </cw-button-group>
    <cw-button-group ariaLabel="Ordre" orientation="vertical">
      <button cwButton variant="outline" size="icon" aria-label="Monter"></button>
      <button cwButton variant="outline" size="icon" aria-label="Descendre"></button>
    </cw-button-group>
  `,
})
class Host {
  readonly created = signal(false);
}

function group(host: HTMLElement, name: string): HTMLElement {
  const found = host.querySelector<HTMLElement>(`[role="group"][aria-label="${name}"]`);
  if (!found) throw new Error(`No group named ${name}`);
  return found;
}

describe('CwButtonGroup', () => {
  let host: HTMLElement;
  let component: Host;

  beforeEach(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('is a named group whose buttons keep their own click and Tab stop', () => {
    const create = group(host, 'Créer');
    const button = Array.from(create.querySelectorAll('button')).find(
      (element) => element.textContent.trim() === 'Créer une tâche',
    );

    button?.click();

    expect(component.created()).toBe(true);
    expect(create.dataset['orientation']).toBe('horizontal');
    expect(Array.from(create.querySelectorAll('button')).every((b) => b.tabIndex === 0)).toBe(true);
  });

  it('takes its orientation from the input', () => {
    expect(group(host, 'Ordre').dataset['orientation']).toBe('vertical');
  });
});
