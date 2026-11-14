import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwButtonGroupSeparator } from './button-group-separator.component';
import { CwButtonGroup } from '../button-group.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host with separators in horizontal and vertical button groups.
 */
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

/**
 * Function group
 *
 * @description
 * Finds a test button group by its accessible name.
 *
 * @param {HTMLElement} host - Container holding the groups.
 * @param {string} name - Exact aria-label to match.
 *
 * @returns {HTMLElement} Matching group element.
 *
 * @throws {Error} When no group has the requested name.
 */
function group(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | null = host.querySelector<HTMLElement>(
    `[role="group"][aria-label="${name}"]`,
  );
  if (!found) throw new Error(`No group named ${name}`);
  return found;
}

describe('CwButtonGroupSeparator', () => {
  let host: HTMLElement;

  beforeEach(() => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('orients the separator across its group', () => {
    const horizontal: Element | null = group(host, 'Créer').querySelector('[role="separator"]');
    const vertical: Element | null = group(host, 'Ordre').querySelector('[role="separator"]');

    expect(horizontal?.getAttribute('aria-orientation')).toBe('vertical');
    expect(vertical?.getAttribute('aria-orientation')).toBe('horizontal');
  });
});
