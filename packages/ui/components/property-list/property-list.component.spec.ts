import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwInlineEdit } from '@cadenway/ui/components/inline-edit';
import { CwSelect, CwSelectOption } from '@cadenway/ui/components/select';

import { CwProperty } from './property/property.component';
import { CwPropertyGroup } from './property-group/property-group.component';
import { CwPropertyList } from './property-list.component';
import { CwPropertyValue } from './property-value/property-value.directive';

/**
 * Function nameOf
 *
 * @description
 * Reads an element name from its labelledby references, label or text.
 *
 * @param {Element} element - Element whose accessible name references are read.
 *
 * @returns {string} Text from aria-labelledby, aria-label or the element content.
 */
function nameOf(element: Element): string {
  const ids: string | null = element.getAttribute('aria-labelledby');
  if (ids) {
    return ids
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent.replace(/\s+/g, ' ').trim() ?? '')
      .join(' ');
  }
  return element.getAttribute('aria-label') ?? element.textContent.trim();
}

/**
 * Function control
 *
 * @description
 * Finds a property control by accessible name.
 *
 * @param {HTMLElement} host - Container holding candidate controls.
 * @param {string} name - Expected accessible name.
 *
 * @returns {HTMLElement} Matching button or input.
 */
function control(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('button, input'),
  ).find((element) => nameOf(element) === name);
  if (!found) throw new Error(`No control named ${name}`);
  return found;
}

/**
 * Component Host
 *
 * @description
 * Exercises property lists with editable and read-only controls.
 */
@Component({
  imports: [
    CwPropertyList,
    CwPropertyGroup,
    CwProperty,
    CwPropertyValue,
    CwSelect,
    CwSelectOption,
    CwInlineEdit,
  ],
  template: `
    <cw-property-list
      hideEmpty
      canAddField
      [(showEmpty)]="showEmpty"
      (addField)="added.set(added() + 1)"
    >
      <cw-property-group label="Propriétés">
        <cw-property label="Statut">
          <cw-select cwPropertyValue [(value)]="status" [(open)]="statusOpen" placeholder="Vide">
            <cw-select-option value="progress">En cours</cw-select-option>
            <cw-select-option value="done">Terminé</cw-select-option>
          </cw-select>
        </cw-property>
        <cw-property label="Estimation" [error]="estimateError()">
          <cw-inline-edit
            cwPropertyValue
            [(value)]="estimate"
            placeholder="Vide"
            ariaLabel="Estimation"
          />
        </cw-property>
        <cw-property label="Sprint" readonly>
          <cw-select cwPropertyValue value="s14" [(open)]="sprintOpen">
            <cw-select-option value="s14">Sprint 14</cw-select-option>
          </cw-select>
        </cw-property>
      </cw-property-group>
      <cw-property-group label="Champs personnalisés">
        <cw-property label="Version">
          <cw-select cwPropertyValue [(value)]="version" placeholder="Vide">
            <cw-select-option value="2.4">2.4</cw-select-option>
          </cw-select>
        </cw-property>
      </cw-property-group>
    </cw-property-list>
  `,
})
class Host {
  // #region Properties
  /**
   * Property status
   * @readonly
   *
   * @description
   * Selected status.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly status: WritableSignal<string | null> = signal<string | null>('progress');

  /**
   * Property statusOpen
   * @readonly
   *
   * @description
   * Whether the status select is open.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly statusOpen: WritableSignal<boolean> = signal(false);

  /**
   * Property sprintOpen
   * @readonly
   *
   * @description
   * Whether the sprint select is open.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly sprintOpen: WritableSignal<boolean> = signal(false);

  /**
   * Property estimate
   * @readonly
   *
   * @description
   * Current estimate value.
   *
   * @type {WritableSignal<string>}
   */
  public readonly estimate: WritableSignal<string> = signal('3 h');

  /**
   * Property estimateError
   * @readonly
   *
   * @description
   * Validation message for the estimate.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly estimateError: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property version
   * @readonly
   *
   * @description
   * Selected version.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly version: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property showEmpty
   * @readonly
   *
   * @description
   * Whether empty properties are shown.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly showEmpty: WritableSignal<boolean> = signal(false);

  /**
   * Property added
   * @readonly
   *
   * @description
   * Number of add-field requests.
   *
   * @type {WritableSignal<number>}
   */
  public readonly added: WritableSignal<number> = signal(0);
  // #endregion
}

describe('CwPropertyList', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('lays out the labels and values as description terms in named groups', () => {
    const terms: string[] = Array.from(host.querySelectorAll('dt')).map((term) =>
      term.textContent.trim(),
    );
    expect(terms).toEqual(['Statut', 'Estimation', 'Sprint', 'Version']);
    const groups: string[] = Array.from(host.querySelectorAll('[role="group"]')).map(nameOf);
    expect(groups).toEqual(['Propriétés', 'Champs personnalisés']);
  });

  it('names each value « label value » and keeps the control working', async () => {
    const status: HTMLElement = control(host, 'Statut En cours');
    expect(control(host, 'Estimation 3 h').tagName).toBe('BUTTON');

    status.click();
    await fixture.whenStable();

    expect(component.statusOpen()).toBe(true);
  });

  it('folds the empty properties behind « Champs vides » and shows them back', async () => {
    const toggle: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent.includes('Champs vides'),
    );
    expect(toggle?.textContent.replace(/\s+/g, ' ').trim()).toBe('Champs vides1');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('cw-property[data-empty]')?.hasAttribute('hidden')).toBe(true);

    toggle?.click();
    await fixture.whenStable();

    expect(component.showEmpty()).toBe(true);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('cw-property[data-empty]')?.hasAttribute('hidden')).toBe(false);
  });

  it('keeps a read-only value out of the tab order and closed', async () => {
    const sprint: HTMLElement = control(host, 'Sprint Sprint 14');
    expect(sprint.tabIndex).toBe(-1);
    expect(host.textContent).toContain('Lecture seule');

    sprint.click();
    sprint.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    expect(component.sprintOpen()).toBe(false);
  });

  it('marks the value invalid and describes it by the error', async () => {
    component.estimateError.set('Saisissez une durée.');
    await fixture.whenStable();

    const estimate: HTMLElement = control(host, 'Estimation 3 h');
    expect(estimate.getAttribute('aria-invalid')).toBe('true');
    const described: string = (estimate.getAttribute('aria-describedby') ?? '').split(' ')[0] ?? '';
    expect(document.getElementById(described)?.textContent.trim()).toBe('Saisissez une durée.');
  });

  it('emits addField from « Ajouter un champ »', () => {
    Array.from(host.querySelectorAll('button'))
      .find((button) => button.textContent.trim() === 'Ajouter un champ')
      ?.click();

    expect(component.added()).toBe(1);
  });
});
