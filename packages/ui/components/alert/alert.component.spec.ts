import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwAlertActions } from './alert-actions/alert-actions.component';
import { CwAlertDescription } from './alert-description/alert-description.component';
import { CwAlertTitle } from './alert-title/alert-title.component';
import { CwAlert } from './alert.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host with informational, dismissible destructive and compact warning alerts.
 */
@Component({
  imports: [CwAlert, CwAlertTitle, CwAlertDescription, CwAlertActions, CwButton],
  template: `
    <cw-alert>
      <cw-alert-title>Sauvegarde planifiée</cw-alert-title>
      <cw-alert-description
        >La prochaine sauvegarde a lieu cette nuit à 02:00.</cw-alert-description
      >
    </cw-alert>
    <cw-alert variant="destructive" dismissible (dismissed)="dismissals.set(dismissals() + 1)">
      <cw-alert-title>Envoi des e-mails interrompu</cw-alert-title>
      <cw-alert-description>Le serveur SMTP refuse la connexion.</cw-alert-description>
      <cw-alert-actions>
        <button cwButton variant="outline" size="sm">Ouvrir les réglages</button>
      </cw-alert-actions>
    </cw-alert>
    <cw-alert variant="warning" size="compact" [icon]="null">
      <cw-alert-title>Le certificat TLS expire dans 12 jours.</cw-alert-title>
    </cw-alert>
    <button type="button">Après</button>
  `,
})
class Host {
  // #region Properties
  /**
   * Property dismissals
   * @readonly
   *
   * @description
   * Counts dismissal events emitted by the destructive alert.
   *
   * @type {WritableSignal<number>}
   * @default 0
   */
  public readonly dismissals: WritableSignal<number> = signal(0);
  // #endregion
}

/**
 * Function alertTitled
 *
 * @description
 * Finds a rendered alert or status by the text of its title.
 *
 * @param {HTMLElement} host - Container holding the alerts.
 * @param {string} title - Exact title text to match after trimming.
 *
 * @returns {HTMLElement} First matching alert.
 *
 * @throws {Error} When no alert has the requested title.
 */
function alertTitled(host: HTMLElement, title: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('[role="alert"], [role="status"]'),
  ).find((element) => element.querySelector('cw-alert-title')?.textContent.trim() === title);
  if (!found) throw new Error(`No alert titled ${title}`);
  return found;
}

/**
 * Function buttonNamed
 *
 * @description
 * Finds a button by its aria-label or trimmed visible text.
 *
 * @param {HTMLElement} host - Container holding the buttons.
 * @param {string} name - Exact button name to match.
 *
 * @returns {HTMLButtonElement} First matching button.
 *
 * @throws {Error} When no button has the requested name.
 */
function buttonNamed(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwAlert', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('is a polite status for information and an alert for errors and warnings', () => {
    expect(alertTitled(host, 'Sauvegarde planifiée').getAttribute('role')).toBe('status');
    expect(alertTitled(host, 'Envoi des e-mails interrompu').getAttribute('role')).toBe('alert');
    expect(alertTitled(host, 'Le certificat TLS expire dans 12 jours.').getAttribute('role')).toBe(
      'alert',
    );
  });

  it('shows the tone icon, hidden from assistive technologies, unless removed', () => {
    const info: HTMLElement = alertTitled(host, 'Sauvegarde planifiée');
    expect(info.querySelector('ng-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(
      alertTitled(host, 'Le certificat TLS expire dans 12 jours.').querySelector('ng-icon'),
    ).toBeNull();
  });

  it('offers « Fermer » only when dismissible', () => {
    expect(alertTitled(host, 'Sauvegarde planifiée').querySelector('button')).toBeNull();
    expect(buttonNamed(host, 'Fermer')).toBeTruthy();
  });

  it('hides itself and emits dismissed on « Fermer »', async () => {
    buttonNamed(host, 'Fermer').click();
    await fixture.whenStable();

    expect(component.dismissals()).toBe(1);
    expect(alertTitled(host, 'Envoi des e-mails interrompu').hasAttribute('hidden')).toBe(true);
  });

  it('closes on Escape and moves the focus to the next element', async () => {
    const action: HTMLButtonElement = buttonNamed(host, 'Ouvrir les réglages');
    action.focus();
    action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(component.dismissals()).toBe(1);
    expect(document.activeElement).toBe(buttonNamed(host, 'Après'));
  });

  it('ignores Escape when it cannot be closed', async () => {
    const info: HTMLElement = alertTitled(host, 'Sauvegarde planifiée');
    info.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(info.hasAttribute('hidden')).toBe(false);
  });
});
