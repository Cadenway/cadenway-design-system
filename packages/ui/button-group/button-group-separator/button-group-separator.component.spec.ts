import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/button';

import { CwButtonGroupSeparator } from './button-group-separator.component';
import { CwButtonGroup } from '../button-group.component';

@Component({
  imports: [CwButton, CwButtonGroup, CwButtonGroupSeparator],
  template: `
    <cw-button-group ariaLabel="Créer">
      <button cwButton>Créer une tâche</button>
      <cw-button-group-separator />
      <button cwButton size="icon" aria-label="Modèles de tâche"></button>
    </cw-button-group>
    <cw-button-group ariaLabel="Ordre" orientation="vertical">
      <button cwButton variant="outline" size="icon" aria-label="Monter"></button>
      <cw-button-group-separator />
      <button cwButton variant="outline" size="icon" aria-label="Descendre"></button>
    </cw-button-group>
  `,
})
class Host {}

function group(host: HTMLElement, name: string): HTMLElement {
  const found = host.querySelector<HTMLElement>(`[role="group"][aria-label="${name}"]`);
  if (!found) throw new Error(`No group named ${name}`);
  return found;
}

describe('CwButtonGroupSeparator', () => {
  let host: HTMLElement;

  beforeEach(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('orients the separator across its group', () => {
    const horizontal = group(host, 'Créer').querySelector('[role="separator"]');
    const vertical = group(host, 'Ordre').querySelector('[role="separator"]');

    expect(horizontal?.getAttribute('aria-orientation')).toBe('vertical');
    expect(vertical?.getAttribute('aria-orientation')).toBe('horizontal');
  });
});
