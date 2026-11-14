import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwButtonGroup } from './button-group.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host containing horizontal and vertical groups of action buttons.
 */
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
  // #region Properties
  /**
   * Property created
   * @readonly
   *
   * @description
   * Records whether the create button received a click.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly created: WritableSignal<boolean> = signal(false);
  // #endregion
}

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

describe('CwButtonGroup', () => {
  let host: HTMLElement;
  let component: Host;

  beforeEach(() => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('is a named group whose buttons keep their own click and Tab stop', () => {
    const create: HTMLElement = group(host, 'Créer');
    const button: HTMLButtonElement | undefined = Array.from(
      create.querySelectorAll('button'),
    ).find((element) => element.textContent.trim() === 'Créer une tâche');

    button?.click();

    expect(component.created()).toBe(true);
    expect(create.dataset['orientation']).toBe('horizontal');
    expect(Array.from(create.querySelectorAll('button')).every((b) => b.tabIndex === 0)).toBe(true);
  });

  it('takes its orientation from the input', () => {
    expect(group(host, 'Ordre').dataset['orientation']).toBe('vertical');
  });
});
