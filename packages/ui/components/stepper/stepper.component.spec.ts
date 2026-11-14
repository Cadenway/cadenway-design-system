import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal, viewChild, type Signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwStep } from './step/step.component';
import { CwStepper } from './stepper.component';

/**
 * Class Host
 *
 * @description
 * Hosts horizontal and vertical installation journeys for interaction tests.
 */
@Component({
  imports: [CwStepper, CwStep],
  template: `
    <cw-stepper #setup ariaLabel="Première installation" [(selected)]="step">
      <cw-step label="Instance" completed>
        <h2>Votre instance</h2>
      </cw-step>
      <cw-step label="Compte administrateur" [completed]="adminValid()">
        <h2>Compte administrateur</h2>
        <input aria-label="Adresse e-mail" />
      </cw-step>
      <cw-step label="Équipe" description="invitez les personnes avec qui vous travaillez.">
        <h2>Équipe</h2>
        <button type="button" (click)="setup.next()">Continuer</button>
      </cw-step>
      <cw-step label="Serveur e-mail" optional [error]="smtpError()" />
      <cw-step label="Premier espace" />
    </cw-stepper>

    <cw-stepper orientation="vertical" ariaLabel="Installation guidée" [(selected)]="verticalStep">
      <cw-step label="Instance" description="cadenway.exemple.fr · version 1.5.0" completed />
      <cw-step
        label="Serveur e-mail"
        optional
        error="Connexion SMTP refusée : vérifiez l'hôte et le port, ou passez cette étape."
      />
      <cw-step label="Équipe" description="Invitez les personnes avec qui vous travaillez.">
        <p>Formulaire d'invitation</p>
      </cw-step>
      <cw-step label="Premier espace" />
    </cw-stepper>
  `,
})
class Host {
  // #region Properties
  /**
   * Property setup
   * @readonly
   *
   * @description
   * Stepper instance controlled by the fixture.
   *
   * @type {Signal<CwStepper>}
   */
  public readonly setup: Signal<CwStepper> = viewChild.required<CwStepper>('setup');

  /**
   * Property step
   * @readonly
   *
   * @description
   * Selected horizontal step.
   *
   * @type {WritableSignal<number>}
   */
  public readonly step: WritableSignal<number> = signal(2);

  /**
   * Property verticalStep
   * @readonly
   *
   * @description
   * Selected vertical step.
   *
   * @type {WritableSignal<number>}
   */
  public readonly verticalStep: WritableSignal<number> = signal(2);

  /**
   * Property adminValid
   * @readonly
   *
   * @description
   * Completion state of the administrator step.
   *
   * @type {WritableSignal<boolean | undefined>}
   */
  public readonly adminValid: WritableSignal<boolean | undefined> = signal<boolean | undefined>(
    true,
  );

  /**
   * Property smtpError
   * @readonly
   *
   * @description
   * Optional SMTP error message.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly smtpError: WritableSignal<string | null> = signal<string | null>(null);
  // #endregion
}

/**
 * Function list
 *
 * @description
 * Finds a step list by its accessible name.
 *
 * @param {HTMLElement} host - Fixture containing the step lists.
 * @param {string} name - Accessible name of the list.
 *
 * @returns {HTMLElement} Matching step list.
 */
function list(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | null = host.querySelector<HTMLElement>(`ol[aria-label="${name}"]`);
  if (!found) throw new Error(`No list named ${name}`);
  return found;
}

/**
 * Function readable
 *
 * @description
 * Reads text while skipping nodes hidden from assistive technology.
 *
 * @param {Node} node - Node whose accessible text is read.
 *
 * @returns {string} Text excluding nodes hidden from assistive technology.
 */
function readable(node: Node): string {
  if (node instanceof Element && node.getAttribute('aria-hidden') === 'true') return '';
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  return Array.from(node.childNodes, readable).join(' ');
}

/**
 * Function steps
 *
 * @description
 * Returns the accessible text of each visible step.
 *
 * @param {HTMLElement} ol - Step list to inspect.
 *
 * @returns {string[]} Accessible text of each visible step.
 */
function steps(ol: HTMLElement): string[] {
  return Array.from(ol.children)
    .filter((li) => li.getAttribute('aria-hidden') !== 'true')
    .map((li) => readable(li).replace(/\s+/g, ' ').replace(/ ,/g, ',').trim());
}

/**
 * Function stepButton
 *
 * @description
 * Finds a reachable step button by its label.
 *
 * @param {HTMLElement} ol - Step list containing the button.
 * @param {string} label - Visible step label.
 *
 * @returns {HTMLButtonElement} Matching step button.
 */
function stepButton(ol: HTMLElement, label: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    ol.querySelectorAll<HTMLButtonElement>('button'),
  ).find((button) => button.textContent.trim().startsWith(label));
  if (!found) throw new Error(`No step button ${label}`);
  return found;
}

/**
 * Function key
 *
 * @description
 * Dispatches a keyboard event to a fixture element.
 *
 * @param {Element} target - Element receiving the event.
 * @param {string} value - Keyboard key to dispatch.
 */
function key(target: Element, value: string): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
  );
}

describe('CwStepper', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;
  let announced: string[];

  beforeEach(async () => {
    announced = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LiveAnnouncer,
          useValue: {
            announce: (message: string) => {
              announced.push(message);
              return Promise.resolve();
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('lists the steps with their state in hidden text', () => {
    const ol: HTMLElement = list(host, 'Première installation');

    expect(steps(ol)).toEqual([
      'Instance — étape 1, terminée',
      'Compte administrateur — étape 2, terminée',
      'Équipe — étape 3, en cours',
      'Serveur e-mail — étape 4, à venir (optionnelle)',
      'Premier espace — étape 5, à venir',
    ]);
    const current: Element | null = ol.querySelector('[aria-current="step"]');
    expect(current?.textContent).toContain('Équipe');
  });

  it('makes the done steps buttons and leaves the steps to come as text', () => {
    const ol: HTMLElement = list(host, 'Première installation');

    expect(Array.from(ol.querySelectorAll('button')).map((b) => b.textContent.trim())).toEqual([
      'Instance — étape 1, terminée',
      'Compte administrateur — étape 2, terminée',
    ]);
  });

  it('shows the position, the description and only the current panel', () => {
    expect(host.textContent).toContain(
      'Étape 3 sur 5 — invitez les personnes avec qui vous travaillez.',
    );
    const panel: HTMLElement | null = host.querySelector<HTMLElement>('[role="group"]');
    expect(panel?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(document.getElementById(panel?.getAttribute('aria-labelledby') ?? '')?.textContent).toBe(
      'Équipe',
    );
    expect(panel?.textContent).toContain('Équipe');
    expect(host.textContent).not.toContain('Votre instance');
  });

  it('goes back to a done step, announces it and focuses its title', async () => {
    stepButton(list(host, 'Première installation'), 'Instance').click();
    await fixture.whenStable();

    expect(component.step()).toBe(0);
    expect(announced).toEqual(['Étape 1 sur 5 : Instance']);
    expect(document.activeElement?.textContent).toBe('Votre instance');
  });

  it('moves on with next() from the panel and counts the step as done', async () => {
    const next: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent.trim() === 'Continuer',
    );
    next?.click();
    await fixture.whenStable();

    expect(component.step()).toBe(3);
    expect(steps(list(host, 'Première installation'))[2]).toBe('Équipe — étape 3, terminée');
    expect(announced).toEqual(['Étape 4 sur 5 : Serveur e-mail']);
  });

  it('does not move forward from an invalid step in a linear stepper', async () => {
    component.step.set(1);
    component.adminValid.set(false);
    await fixture.whenStable();

    component.setup().next();
    await fixture.whenStable();
    expect(component.step()).toBe(1);

    component.adminValid.set(true);
    await fixture.whenStable();
    component.setup().next();
    await fixture.whenStable();
    expect(component.step()).toBe(2);
  });

  it('never makes a step to come clickable in a linear stepper', async () => {
    component.step.set(0);
    await fixture.whenStable();

    // Compte administrateur is completed: reachable; Équipe was never passed: plain text.
    const ol: HTMLElement = list(host, 'Première installation');
    expect(Array.from(ol.querySelectorAll('button')).map((b) => b.textContent.trim())).toEqual([
      'Compte administrateur — étape 2, terminée',
    ]);
  });

  it('goes back with previous() and resets to the first step', async () => {
    component.setup().previous();
    await fixture.whenStable();
    expect(component.step()).toBe(1);

    component.setup().reset();
    await fixture.whenStable();
    expect(component.step()).toBe(0);
  });

  it('moves the focus between reachable steps with the arrows, Home and End', () => {
    const ol: HTMLElement = list(host, 'Première installation');
    const first: HTMLButtonElement = stepButton(ol, 'Instance');
    const second: HTMLButtonElement = stepButton(ol, 'Compte administrateur');
    first.focus();

    key(first, 'ArrowRight');
    expect(document.activeElement).toBe(second);
    key(second, 'Home');
    expect(document.activeElement).toBe(first);
    key(first, 'End');
    expect(document.activeElement).toBe(second);
  });

  it('shows an error as an alert under the row', async () => {
    component.smtpError.set('Connexion SMTP refusée.');
    await fixture.whenStable();

    const alert: Element | null = host.querySelector('cw-stepper [role="alert"]');
    expect(alert?.textContent.trim()).toBe('Connexion SMTP refusée.');
    expect(steps(list(host, 'Première installation'))[3]).toBe(
      'Serveur e-mail — étape 4, en erreur (optionnelle)',
    );
  });

  it('unfolds the current panel under its label in a vertical stepper', () => {
    const ol: HTMLElement = list(host, 'Installation guidée');
    const items: Element[] = Array.from(ol.children);

    expect(ol.parentElement?.getAttribute('data-orientation')).toBe('vertical');
    expect(items[2].getAttribute('aria-current')).toBe('step');
    expect(items[2].textContent).toContain("Formulaire d'invitation");
    expect(items[1].querySelector('[role="alert"]')?.textContent).toContain(
      'Connexion SMTP refusée',
    );
    expect(items[0].textContent).toContain('cadenway.exemple.fr · version 1.5.0');
  });

  it('lets the user go back to a step in error from a vertical stepper', async () => {
    stepButton(list(host, 'Installation guidée'), 'Serveur e-mail').click();
    await fixture.whenStable();

    expect(component.verticalStep()).toBe(1);
  });
});
