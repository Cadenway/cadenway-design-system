import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwCommandFooter } from '../command-footer/command-footer.component';
import { CwCommandGroup } from '../command-group/command-group.component';
import { CwCommandInput } from '../command-input/command-input.directive';
import { CwCommandItem } from '../command-item/command-item.component';
import { CwCommandList } from '../command-list/command-list.component';
import { CwCommandDialog } from './command-dialog.component';

@Component({
  imports: [
    CwCommandDialog,
    CwCommandInput,
    CwCommandList,
    CwCommandGroup,
    CwCommandItem,
    CwCommandFooter,
  ],
  template: `
    <button type="button">Rechercher</button>
    <cw-command-dialog [(open)]="open" [(search)]="search">
      <input cwCommandInput aria-label="Rechercher une commande, une tâche, un espace" />
      <cw-command-list>
        <cw-command-group heading="Suggestions">
          <cw-command-item (selected)="ran.set($event); open.set(false)">
            Créer une tâche
          </cw-command-item>
          <cw-command-item>Afficher le tableau</cw-command-item>
        </cw-command-group>
      </cw-command-list>
      <cw-command-footer />
    </cw-command-dialog>
  `,
})
class Host {
  readonly open = signal(false);
  readonly search = signal('');
  readonly ran = signal<string | null>(null);
}

function palette(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="dialog"]');
}

function field(): HTMLInputElement {
  const found = palette()?.querySelector<HTMLInputElement>('input[role="combobox"]');
  if (!found) throw new Error('No palette field');
  return found;
}

describe('CwCommandDialog', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  async function keydown(target: EventTarget, init: KeyboardEventInit): Promise<void> {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }),
    );
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('opens on Ctrl K as a named modal dialog with the field focused', async () => {
    host.querySelector('button')?.focus();
    await keydown(document.body, { key: 'k', ctrlKey: true });

    expect(component.open()).toBe(true);
    const dialog = palette();
    expect(dialog?.getAttribute('aria-label')).toBe('Palette de commandes');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    await fixture.whenStable();
    expect(document.activeElement).toBe(field());
    expect(dialog?.textContent).toContain('naviguer');
  });

  it('clears the search on the first Escape and closes on the second', async () => {
    component.open.set(true);
    await fixture.whenStable();
    const input = field();
    input.value = 'tableau';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(component.search()).toBe('tableau');

    await keydown(input, { key: 'Escape' });
    expect(component.search()).toBe('');
    expect(palette()).not.toBeNull();

    await keydown(input, { key: 'Escape' });
    expect(component.open()).toBe(false);
    expect(palette()).toBeNull();
  });

  it('runs an item with Enter, empties the search when reopened and toggles with Ctrl K', async () => {
    component.open.set(true);
    await fixture.whenStable();
    const input = field();
    input.value = 'créer';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    await keydown(input, { key: 'Enter' });
    expect(component.ran()).toBe('Créer une tâche');
    expect(palette()).toBeNull();

    await keydown(document.body, { key: 'k', ctrlKey: true });
    expect(component.search()).toBe('');
    expect(field().value).toBe('');

    await keydown(field(), { key: 'k', ctrlKey: true });
    expect(component.open()).toBe(false);
  });

  it('closes on a click on the veil', async () => {
    component.open.set(true);
    await fixture.whenStable();

    // The veil is the CDK backdrop: it has no role or name, only the CDK's own class.
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await fixture.whenStable();
    expect(component.open()).toBe(false);
  });
});
