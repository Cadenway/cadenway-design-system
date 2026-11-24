import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwPasswordStrength } from './password-strength.component';
import { CwPasswordStrengthLevel } from './password-strength-level/password-strength-level.component';
import { provideCwPasswordStrengthLabels } from './password-strength.providers';
import type { CwPasswordRule } from './password-strength.types';

/**
 * Class Host
 *
 * @description
 * Hosts a password field with its level next to the label and its meter below, as the sign-up
 * form of the mockup (`Inscription.dc.html`).
 */
@Component({
  imports: [CwPasswordStrength, CwPasswordStrengthLevel],
  template: `
    <label for="password">Mot de passe</label>
    <cw-password-strength-level [for]="strength" />
    <input id="password" type="password" [attr.aria-describedby]="strength.rulesId" />
    <cw-password-strength
      #strength="cwPasswordStrength"
      [value]="password()"
      [minLength]="minLength()"
      [rules]="rules()"
    />
    <cw-password-strength />
  `,
})
class Host {
  // #region Properties
  /**
   * Property password
   *
   * @description
   * Password typed in the field.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  public readonly password: WritableSignal<string> = signal('');

  /**
   * Property minLength
   *
   * @description
   * Minimum length of the default length rule.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  public readonly minLength: WritableSignal<number> = signal(12);

  /**
   * Property rules
   *
   * @description
   * Rules replacing the default ones, or none to keep them.
   *
   * @type {WritableSignal<readonly CwPasswordRule[] | undefined>}
   * @readonly
   */
  public readonly rules: WritableSignal<readonly CwPasswordRule[] | undefined> = signal<
    readonly CwPasswordRule[] | undefined
  >(undefined);
  // #endregion
}

/**
 * Function setup
 *
 * @description
 * Renders the host, optionally with label providers, and returns its fixture.
 *
 * @param {unknown[]} providers - Providers of the testing module.
 *
 * @returns {Promise<ComponentFixture<Host>>} Fixture of the rendered host.
 */
async function setup(providers: unknown[] = []): Promise<ComponentFixture<Host>> {
  TestBed.configureTestingModule({ imports: [Host], providers: providers as never[] });
  const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
  await fixture.whenStable();
  return fixture;
}

/**
 * Function type
 *
 * @description
 * Sets the typed password and waits for the view.
 *
 * @param {ComponentFixture<Host>} fixture - Fixture of the host.
 * @param {string} password - Password to type.
 *
 * @returns {Promise<void>} Resolves once the view is updated.
 */
async function type(fixture: ComponentFixture<Host>, password: string): Promise<void> {
  fixture.componentInstance.password.set(password);
  await fixture.whenStable();
}

/**
 * Function query
 *
 * @description
 * Finds an element of the host, failing the test when it is missing.
 *
 * @param {ComponentFixture<Host>} fixture - Fixture of the host.
 * @param {string} selector - CSS selector of the element.
 *
 * @returns {HTMLElement} The element.
 */
function query(fixture: ComponentFixture<Host>, selector: string): HTMLElement {
  const element: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector(
    selector,
  );
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
}

/**
 * Function rules
 *
 * @description
 * Reads the rule lines of the first meter.
 *
 * @param {ComponentFixture<Host>} fixture - Fixture of the host.
 *
 * @returns {string[]} Text of each rule line, its met state included.
 */
function rules(fixture: ComponentFixture<Host>): string[] {
  return Array.from(
    query(fixture, 'cw-password-strength').querySelectorAll('li'),
    (item: HTMLLIElement) => item.textContent.replace(/\s+/g, ' ').trim(),
  );
}

describe('CwPasswordStrength', () => {
  it('shows an empty meter, the four rules unmet and hides the level before typing', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const meter: HTMLElement = query(fixture, 'cw-password-strength [role="meter"]');
    const level: HTMLElement = query(fixture, 'cw-password-strength-level');

    expect(meter.getAttribute('aria-label')).toBe('Robustesse du mot de passe');
    expect(meter.getAttribute('aria-valuenow')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('4');
    expect(meter.getAttribute('aria-valuetext')).toBe('Trop court');
    expect(meter.children).toHaveLength(4);
    expect(level.getAttribute('aria-hidden')).toBe('true');
    expect(level.getAttribute('aria-live')).toBe('polite');
    expect(rules(fixture)).toEqual([
      '12 caractères minimum : non respecté',
      'Majuscules et minuscules : non respecté',
      'Au moins un chiffre : non respecté',
      'Au moins un symbole : non respecté',
    ]);
  });

  it('scores the rules met and writes the level in the tone of the score', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const meter: HTMLElement = query(fixture, 'cw-password-strength [role="meter"]');
    const host: HTMLElement = query(fixture, 'cw-password-strength cw-meter');
    const level: HTMLElement = query(fixture, 'cw-password-strength-level');
    const cases: readonly [string, string, string, string][] = [
      ['cadenway', '1', 'Trop court', 'critical'],
      ['Durable', '1', 'Faible', 'critical'],
      ['Durable2', '2', 'Moyen', 'high'],
      ['Durable2026!', '4', 'Excellent', 'optimum'],
    ];

    for (const [password, notches, text, zone] of cases) {
      await type(fixture, password);
      expect(meter.getAttribute('aria-valuenow')).toBe(notches);
      expect(meter.getAttribute('aria-valuetext')).toBe(text);
      expect(host.getAttribute('data-zone')).toBe(zone);
      expect(level.textContent.trim()).toBe(text);
      expect(level.getAttribute('aria-hidden')).toBeNull();
    }
    expect(rules(fixture).every((rule: string) => rule.endsWith(': respecté'))).toBe(true);
  });

  it('applies minLength to the length rule', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    fixture.componentInstance.minLength.set(8);
    await type(fixture, 'Durable2');

    expect(rules(fixture)[0]).toBe('8 caractères minimum : respecté');
    expect(query(fixture, 'cw-password-strength-level').textContent.trim()).toBe('Bon');
  });

  it('replaces the default rules with one notch per rule', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    fixture.componentInstance.rules.set([
      { id: 'length', label: '16 caractères minimum', test: (value) => value.length >= 16 },
      { id: 'space', label: 'Au moins une espace', test: (value) => value.includes(' ') },
    ]);
    await type(fixture, 'cheval correct');
    const meter: HTMLElement = query(fixture, 'cw-password-strength [role="meter"]');

    expect(meter.getAttribute('aria-valuemax')).toBe('2');
    expect(meter.getAttribute('aria-valuenow')).toBe('1');
    expect(meter.children).toHaveLength(2);
    expect(rules(fixture)).toEqual([
      '16 caractères minimum : non respecté',
      'Au moins une espace : respecté',
    ]);
  });

  it('gives each rule list its own id for the field description', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const lists: HTMLElement[] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'cw-password-strength ul',
      ),
    );

    expect(query(fixture, '#password').getAttribute('aria-describedby')).toBe(lists[0]?.id);
    expect(lists[0]?.id).toMatch(/^cw-password-rules-/);
    expect(lists[1]?.id).not.toBe(lists[0]?.id);
  });

  it('takes the texts given by provideCwPasswordStrengthLabels', async () => {
    const fixture: ComponentFixture<Host> = await setup([
      provideCwPasswordStrengthLabels({
        meter: 'Password strength',
        levels: ['Too short', 'Weak', 'Fair', 'Good', 'Excellent'],
        met: ': met',
        unmet: ': not met',
        minLength: (count: number): string => `At least ${String(count)} characters`,
      }),
    ]);
    await type(fixture, 'Durable');

    expect(query(fixture, 'cw-password-strength [role="meter"]').getAttribute('aria-label')).toBe(
      'Password strength',
    );
    expect(query(fixture, 'cw-password-strength-level').textContent.trim()).toBe('Weak');
    expect(rules(fixture)).toEqual([
      'At least 12 characters: not met',
      'Majuscules et minuscules: met',
      'Au moins un chiffre: not met',
      'Au moins un symbole: not met',
    ]);
  });
});
