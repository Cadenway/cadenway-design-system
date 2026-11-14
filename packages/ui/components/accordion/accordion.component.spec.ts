import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwAccordionContent } from './accordion-content/accordion-content.component';
import { CwAccordionItem } from './accordion-item/accordion-item.component';
import { CwAccordionTrigger } from './accordion-trigger/accordion-trigger.component';
import { CwAccordion } from './accordion.component';
import type { CwAccordionValue } from './accordion.types';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Hosts single and multiple accordions for interaction tests.
 */
@Component({
  imports: [CwAccordion, CwAccordionItem, CwAccordionTrigger, CwAccordionContent],
  template: `
    <cw-accordion [(value)]="faq" [collapsible]="collapsible()">
      <cw-accordion-item value="sauvegarde">
        <button cwAccordionTrigger>Comment sauvegarder mon instance ?</button>
        <cw-accordion-content>Une sauvegarde chiffrée est faite chaque nuit.</cw-accordion-content>
      </cw-accordion-item>
      <cw-accordion-item value="import">
        <button cwAccordionTrigger>Puis-je importer depuis un autre outil ?</button>
        <cw-accordion-content>Oui, depuis un export CSV.</cw-accordion-content>
      </cw-accordion-item>
    </cw-accordion>

    <cw-accordion type="multiple" [(value)]="sections">
      <cw-accordion-item value="champs">
        <button cwAccordionTrigger>Champs personnalisés</button>
        <cw-accordion-content>Client : Mairie de Lyon</cw-accordion-content>
      </cw-accordion-item>
      <cw-accordion-item value="auto" disabled>
        <button cwAccordionTrigger>Automatisations</button>
        <cw-accordion-content>Aucune règle</cw-accordion-content>
      </cw-accordion-item>
      <cw-accordion-item value="historique">
        <button cwAccordionTrigger>Historique</button>
        <cw-accordion-content>Créée par Léa Martin le 2 nov.</cw-accordion-content>
      </cw-accordion-item>
    </cw-accordion>
  `,
})
class Host {
  // #region Properties
  /**
   * Property faq
   * @readonly
   *
   * @description
   * Selected FAQ section.
   *
   * @type {WritableSignal<CwAccordionValue>}
   */
  public readonly faq: WritableSignal<CwAccordionValue> = signal<CwAccordionValue>('sauvegarde');

  /**
   * Property sections
   * @readonly
   *
   * @description
   * Selected multiple-mode sections.
   *
   * @type {WritableSignal<CwAccordionValue>}
   */
  public readonly sections: WritableSignal<CwAccordionValue> = signal<CwAccordionValue>([]);

  /**
   * Property collapsible
   * @readonly
   *
   * @description
   * Whether the FAQ permits closing its selected section.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly collapsible: WritableSignal<boolean> = signal(true);
  // #endregion
}

/**
 * Function trigger
 *
 * @description
 * Finds a trigger by its visible text.
 *
 * @param {HTMLElement} host - Fixture containing the triggers.
 * @param {string} name - Visible trigger text.
 *
 * @returns {HTMLButtonElement} Matching trigger button.
 */
function trigger(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No trigger named ${name}`);
  return found;
}

/**
 * Function region
 *
 * @description
 * Finds the region controlled by the named trigger.
 *
 * @param {HTMLElement} host - Fixture containing the controlled regions.
 * @param {string} name - Visible text of the controlling trigger.
 *
 * @returns {HTMLElement} Region controlled by the named trigger.
 */
function region(host: HTMLElement, name: string): HTMLElement {
  const id: string = trigger(host, name).getAttribute('aria-controls') ?? '';
  const found: HTMLElement | null = host.querySelector<HTMLElement>(`#${id}`);
  if (!found) throw new Error(`No region for ${name}`);
  return found;
}

/**
 * Constant KEY_CODES
 *
 * @description
 * Key codes read by the CDK keyboard manager.
 *
 * @type {Record<string, number>}
 */
const KEY_CODES: Record<string, number> = { End: 35, Home: 36, ArrowUp: 38, ArrowDown: 40 };

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event with the key code expected by the CDK.
 *
 * @param {HTMLElement} target - Element receiving the keyboard event.
 * @param {string} key - Keyboard key to dispatch.
 */
function press(target: HTMLElement, key: string): void {
  const event: KeyboardEvent = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(event, 'keyCode', { value: KEY_CODES[key] });
  target.dispatchEvent(event);
}

describe('CwAccordion', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
    await fixture.whenStable();
  });

  afterEach(() => {
    host.remove();
  });

  it('wires each trigger, in a heading, to its named region', () => {
    const backup: HTMLButtonElement = trigger(host, 'Comment sauvegarder mon instance ?');
    const content: HTMLElement = region(host, 'Comment sauvegarder mon instance ?');

    expect(backup.parentElement?.tagName).toBe('H3');
    expect(backup.getAttribute('aria-expanded')).toBe('true');
    expect(content.getAttribute('role')).toBe('region');
    expect(content.getAttribute('aria-labelledby')).toBe(backup.id);
    expect(region(host, 'Puis-je importer depuis un autre outil ?').closest('[inert]')).not.toBe(
      null,
    );
  });

  it('keeps one section open in single mode and closes it when collapsible', async () => {
    trigger(host, 'Puis-je importer depuis un autre outil ?').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.faq()).toBe('import');
    expect(trigger(host, 'Comment sauvegarder mon instance ?').getAttribute('aria-expanded')).toBe(
      'false',
    );

    trigger(host, 'Puis-je importer depuis un autre outil ?').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.faq()).toBe(null);
  });

  it('keeps the open section open in single mode when not collapsible', async () => {
    fixture.componentInstance.collapsible.set(false);
    await fixture.whenStable();

    trigger(host, 'Comment sauvegarder mon instance ?').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.faq()).toBe('sauvegarde');
  });

  it('opens sections independently in multiple mode, never a disabled one', async () => {
    trigger(host, 'Champs personnalisés').click();
    trigger(host, 'Historique').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.sections()).toEqual(['champs', 'historique']);

    const automations: HTMLButtonElement = trigger(host, 'Automatisations');
    expect(automations.disabled).toBe(true);

    trigger(host, 'Champs personnalisés').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.sections()).toEqual(['historique']);
  });

  it('moves between triggers with the arrows, Home and End, skipping disabled ones', async () => {
    const fields: HTMLButtonElement = trigger(host, 'Champs personnalisés');
    const history: HTMLButtonElement = trigger(host, 'Historique');
    fields.focus();

    press(fields, 'ArrowDown');
    await fixture.whenStable();
    expect(document.activeElement).toBe(history);

    press(history, 'Home');
    expect(document.activeElement).toBe(fields);

    press(fields, 'End');
    expect(document.activeElement).toBe(history);

    press(history, 'ArrowUp');
    expect(document.activeElement).toBe(fields);
  });
});
