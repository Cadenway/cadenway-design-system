import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwTab } from './tab/tab.component';
import { CwTabPanel } from './tab-panel/tab-panel.component';
import { CwTabs } from './tabs.component';
import { CwTabsList } from './tabs-list/tabs-list.component';
import { provideCwTabs } from './tabs.providers';
import type { CwTabsActivation } from './tabs.types';

function byRole(scope: ParentNode, role: string, name: string): HTMLElement {
  const found = Array.from(scope.querySelectorAll<HTMLElement>(`[role="${role}"]`)).find(
    (element) => accessibleName(element) === name,
  );
  if (!found) throw new Error(`No ${role} named ${name}`);
  return found;
}

function link(scope: ParentNode, name: string): HTMLAnchorElement {
  const found = Array.from(scope.querySelectorAll<HTMLAnchorElement>('a')).find(
    (element) => accessibleName(element) === name,
  );
  if (!found) throw new Error(`No link named ${name}`);
  return found;
}

/* Enough of the accessible name computation for these fixtures: `aria-label`, then
   `aria-labelledby`, then the text content. */
function accessibleName(element: HTMLElement): string {
  const label = element.getAttribute('aria-label');
  if (label) return label;
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    return accessibleName(element.ownerDocument.getElementById(labelledBy) ?? element);
  }
  return element.textContent.replace(/\s+/g, ' ').trim();
}

// The CDK key manager types read the legacy `keyCode` too; `ɵnavigateList` reads `key`.
const KEY_CODES: Record<string, number> = {
  End: 35,
  Home: 36,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
};

function press(target: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    keyCode: KEY_CODES[key],
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

@Component({
  imports: [CwTabs, CwTabsList, CwTab, CwTabPanel],
  template: `
    <cw-tabs variant="bar" [activation]="activation()" [(value)]="section">
      <cw-tabs-list ariaLabel="Sections de la tâche">
        <button cwTab value="details">Détails</button>
        <button cwTab value="sous-taches" [count]="5">Sous-tâches</button>
        <button cwTab value="temps" disabled>Temps passé</button>
        <button cwTab value="activite">Activité</button>
      </cw-tabs-list>
      <cw-tab-panel value="details">Description de la tâche</cw-tab-panel>
      <cw-tab-panel value="sous-taches">Liste des sous-tâches</cw-tab-panel>
      <cw-tab-panel value="temps">Temps</cw-tab-panel>
      <cw-tab-panel value="activite">Historique</cw-tab-panel>
    </cw-tabs>
  `,
})
class SectionsHost {
  readonly section = signal('details');
  readonly activation = signal<CwTabsActivation>('automatic');
}

@Component({
  imports: [CwTabs, CwTabsList, CwTab],
  template: `
    <cw-tabs [(value)]="period">
      <cw-tabs-list ariaLabel="Période">
        <button cwTab value="jour">Jour</button>
        <button cwTab value="semaine">Semaine</button>
        <button cwTab value="mois">Mois</button>
      </cw-tabs-list>
    </cw-tabs>
    <cw-tabs variant="bar" orientation="vertical">
      <cw-tabs-list ariaLabel="Réglages">
        <button cwTab value="profil" disabled>Profil</button>
        <button cwTab value="notifications">Notifications</button>
        <button cwTab value="securite">Sécurité</button>
      </cw-tabs-list>
    </cw-tabs>
  `,
})
class DefaultsHost {
  readonly period = signal('');
}

@Component({
  imports: [CwTabs, CwTabsList, CwTab],
  template: `
    <cw-tabs variant="bar" [(value)]="view">
      <cw-tabs-list ariaLabel="Vues">
        <a cwTab value="liste" href="#liste" [active]="route() === 'liste'">Liste</a>
        <a cwTab value="tableau" href="#tableau" [active]="route() === 'tableau'">Tableau</a>
        <a cwTab value="gantt" href="#gantt" disabled (click)="followed.set(true)">Gantt</a>
      </cw-tabs-list>
    </cw-tabs>
  `,
})
class LinksHost {
  readonly view = signal('');
  readonly route = signal('tableau');
  readonly followed = signal(false);
}

@Component({
  imports: [CwTabs, CwTabsList, CwTab],
  providers: [provideCwTabs({ variant: 'bar', size: 'sm' })],
  template: `
    <cw-tabs>
      <cw-tabs-list ariaLabel="Vues">
        <button cwTab value="liste">Liste</button>
      </cw-tabs-list>
    </cw-tabs>
    <cw-tabs variant="segmented">
      <cw-tabs-list ariaLabel="Vue">
        <button cwTab value="liste">Liste</button>
      </cw-tabs-list>
    </cw-tabs>
  `,
})
class ProvidedHost {}

describe('CwTabs', () => {
  describe('with buttons and panels', () => {
    let fixture: ComponentFixture<SectionsHost>;
    let host: HTMLElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(SectionsHost);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('wires the tab list, the tabs and the panels', () => {
      const list = byRole(host, 'tablist', 'Sections de la tâche');
      expect(list.getAttribute('aria-orientation')).toBe('horizontal');
      const details = byRole(list, 'tab', 'Détails');
      expect(details.getAttribute('type')).toBe('button');
      expect(details.getAttribute('aria-selected')).toBe('true');
      expect(details.getAttribute('data-state')).toBe('active');
      expect(byRole(list, 'tab', 'Activité').getAttribute('aria-selected')).toBe('false');

      const panel = byRole(host, 'tabpanel', 'Détails');
      expect(details.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('tabindex')).toBe('0');
      expect(panel.hidden).toBe(false);
      expect(byRole(host, 'tabpanel', 'Activité').hidden).toBe(true);
    });

    it('reads the counter with the label', () => {
      expect(byRole(host, 'tab', 'Sous-tâches, 5')).toBeTruthy();
    });

    it('keeps one Tab stop, on the active tab', () => {
      const tabs = Array.from(host.querySelectorAll<HTMLElement>('[role="tab"]'));
      expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    });

    it('activates a tab on click and updates the model', async () => {
      byRole(host, 'tab', 'Activité').click();
      await fixture.whenStable();
      expect(fixture.componentInstance.section()).toBe('activite');
      expect(byRole(host, 'tab', 'Activité').getAttribute('aria-selected')).toBe('true');
      expect(byRole(host, 'tabpanel', 'Activité').hidden).toBe(false);
      expect(byRole(host, 'tabpanel', 'Détails').hidden).toBe(true);
    });

    it('follows the model', async () => {
      fixture.componentInstance.section.set('sous-taches');
      await fixture.whenStable();
      expect(byRole(host, 'tab', 'Sous-tâches, 5').getAttribute('aria-selected')).toBe('true');
    });

    it('disables a tab natively', () => {
      const time = byRole(host, 'tab', 'Temps passé') as HTMLButtonElement;
      expect(time.disabled).toBe(true);
    });

    it('moves and activates with the arrows, skipping disabled tabs and wrapping', async () => {
      const details = byRole(host, 'tab', 'Détails');
      details.focus();

      expect(press(details, 'ArrowRight').defaultPrevented).toBe(true);
      await fixture.whenStable();
      const subtasks = byRole(host, 'tab', 'Sous-tâches, 5');
      expect(document.activeElement).toBe(subtasks);
      expect(fixture.componentInstance.section()).toBe('sous-taches');

      press(subtasks, 'ArrowRight');
      await fixture.whenStable();
      const activity = byRole(host, 'tab', 'Activité');
      expect(document.activeElement).toBe(activity);
      expect(fixture.componentInstance.section()).toBe('activite');

      press(activity, 'ArrowRight');
      await fixture.whenStable();
      expect(document.activeElement).toBe(details);
      expect(fixture.componentInstance.section()).toBe('details');

      press(details, 'ArrowLeft');
      await fixture.whenStable();
      expect(document.activeElement).toBe(activity);
    });

    it('reaches the ends with Home and End', async () => {
      const details = byRole(host, 'tab', 'Détails');
      details.focus();
      press(details, 'End');
      await fixture.whenStable();
      const activity = byRole(host, 'tab', 'Activité');
      expect(document.activeElement).toBe(activity);
      press(activity, 'Home');
      await fixture.whenStable();
      expect(document.activeElement).toBe(details);
    });

    it('ignores the vertical arrows in a horizontal list', () => {
      const details = byRole(host, 'tab', 'Détails');
      details.focus();
      expect(press(details, 'ArrowDown').defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(details);
    });

    it('only moves the focus with manual activation', async () => {
      fixture.componentInstance.activation.set('manual');
      await fixture.whenStable();
      const details = byRole(host, 'tab', 'Détails');
      details.focus();
      press(details, 'ArrowRight');
      await fixture.whenStable();
      const subtasks = byRole(host, 'tab', 'Sous-tâches, 5');
      expect(document.activeElement).toBe(subtasks);
      expect(fixture.componentInstance.section()).toBe('details');

      // Enter and Space click the focused button natively.
      subtasks.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.section()).toBe('sous-taches');
    });
  });

  describe('defaults', () => {
    let fixture: ComponentFixture<DefaultsHost>;
    let host: HTMLElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(DefaultsHost);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('activates the first enabled tab when the value is empty', () => {
      expect(byRole(host, 'tab', 'Jour').getAttribute('aria-selected')).toBe('true');
      expect(byRole(host, 'tab', 'Notifications').getAttribute('aria-selected')).toBe('true');
      expect(byRole(host, 'tab', 'Profil').getAttribute('aria-selected')).toBe('false');
      expect(fixture.componentInstance.period()).toBe('');
    });

    it('is segmented by default', () => {
      const root = byRole(host, 'tablist', 'Période').closest('cw-tabs');
      expect(root?.getAttribute('data-variant')).toBe('segmented');
      expect(root?.getAttribute('data-size')).toBe('default');
    });

    it('moves with up and down in a vertical bar list', async () => {
      const list = byRole(host, 'tablist', 'Réglages');
      expect(list.getAttribute('aria-orientation')).toBe('vertical');
      expect(list.getAttribute('data-orientation')).toBe('vertical');
      const notifications = byRole(list, 'tab', 'Notifications');
      notifications.focus();
      expect(press(notifications, 'ArrowRight').defaultPrevented).toBe(false);
      press(notifications, 'ArrowDown');
      await fixture.whenStable();
      const security = byRole(list, 'tab', 'Sécurité');
      expect(document.activeElement).toBe(security);
      expect(security.getAttribute('aria-selected')).toBe('true');
      press(security, 'ArrowDown');
      await fixture.whenStable();
      expect(document.activeElement).toBe(notifications);
    });
  });

  describe('with links', () => {
    let fixture: ComponentFixture<LinksHost>;
    let host: HTMLElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(LinksHost);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('is a navigation of links, the active one marked as the current page', () => {
      const nav = byRole(host, 'navigation', 'Vues');
      expect(nav.querySelector('[role="tab"]')).toBeNull();
      expect(nav.hasAttribute('aria-orientation')).toBe(false);
      const table = link(nav, 'Tableau');
      expect(table.getAttribute('aria-current')).toBe('page');
      expect(table.getAttribute('data-state')).toBe('active');
      expect(table.getAttribute('tabindex')).toBe('0');
      expect(link(nav, 'Liste').hasAttribute('aria-current')).toBe(false);
      expect(link(nav, 'Liste').getAttribute('tabindex')).toBe('-1');
    });

    it('takes the active state from the consumer', async () => {
      fixture.componentInstance.route.set('liste');
      await fixture.whenStable();
      expect(link(host, 'Liste').getAttribute('aria-current')).toBe('page');
      expect(link(host, 'Tableau').hasAttribute('aria-current')).toBe(false);
    });

    it('follows the link reached by an arrow key', async () => {
      const list = link(host, 'Liste');
      const table = link(host, 'Tableau');
      const followed = vi.fn((event: Event) => {
        event.preventDefault();
      });
      list.addEventListener('click', followed);
      table.focus();
      press(table, 'ArrowLeft');
      await fixture.whenStable();
      expect(document.activeElement).toBe(list);
      expect(followed).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.view()).toBe('liste');
    });

    it('cancels the click of a disabled link', () => {
      const gantt = link(host, 'Gantt');
      expect(gantt.getAttribute('aria-disabled')).toBe('true');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      gantt.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.followed()).toBe(false);
      expect(fixture.componentInstance.view()).toBe('');
    });
  });

  it('takes its default variant and size from provideCwTabs', async () => {
    const fixture = TestBed.createComponent(ProvidedHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const provided = byRole(host, 'tablist', 'Vues').closest('cw-tabs');
    expect(provided?.getAttribute('data-variant')).toBe('bar');
    expect(provided?.getAttribute('data-size')).toBe('sm');
    const bound = byRole(host, 'tablist', 'Vue').closest('cw-tabs');
    expect(bound?.getAttribute('data-variant')).toBe('segmented');
  });
});
