import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwCommand } from './command.component';
import { cwCommandFuzzyFilter } from './command.constants';
import type { CwCommandFilter } from './command.types';
import { CwCommandEmpty } from './command-empty/command-empty.component';
import { CwCommandGroup } from './command-group/command-group.component';
import { CwCommandHighlight } from './command-highlight/command-highlight.component';
import { CwCommandInput } from './command-input/command-input.directive';
import { CwCommandItem } from './command-item/command-item.component';
import { CwCommandList } from './command-list/command-list.component';
import { CwCommandLoading } from './command-loading/command-loading.component';
import { CwCommandSeparator } from './command-separator/command-separator.component';

@Component({
  imports: [
    CwCommand,
    CwCommandInput,
    CwCommandList,
    CwCommandGroup,
    CwCommandItem,
    CwCommandSeparator,
    CwCommandEmpty,
    CwCommandLoading,
    CwCommandHighlight,
  ],
  template: `
    <cw-command [(search)]="search" [loading]="loading()" [loop]="loop()" [filter]="filter()">
      <input cwCommandInput aria-label="Commande" />
      <cw-command-list>
        <cw-command-group heading="Suggestions">
          <cw-command-item (selected)="ran.set($event)">Créer une tâche</cw-command-item>
          <cw-command-item disabled (selected)="ran.set($event)">Assigner à moi</cw-command-item>
          <cw-command-item [keywords]="['effacer']" (selected)="ran.set($event)">
            Supprimer la tâche
          </cw-command-item>
        </cw-command-group>
        <cw-command-separator />
        <cw-command-group heading="Actions">
          <cw-command-item value="export-csv" (selected)="ran.set($event)">
            <cw-command-highlight text="Exporter la liste en CSV" />
          </cw-command-item>
        </cw-command-group>
        <cw-command-loading />
        <cw-command-empty />
      </cw-command-list>
    </cw-command>
  `,
})
class Host {
  readonly search = signal('');
  readonly loading = signal(false);
  readonly loop = signal(true);
  readonly filter = signal<CwCommandFilter | null>(cwCommandFuzzyFilter);
  readonly ran = signal<string | null>(null);
}

function field(host: HTMLElement): HTMLInputElement {
  const found = host.querySelector<HTMLInputElement>('input[role="combobox"]');
  if (!found) throw new Error('No combobox');
  return found;
}

function shownOptions(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll<HTMLElement>('[role="option"]'))
    .filter((option) => !option.hidden)
    .map((option) => option.textContent.trim());
}

function shownGroups(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll<HTMLElement>('[role="group"]'))
    .filter((group) => !group.hidden)
    .map((group) => group.getAttribute('aria-label') ?? '');
}

function highlighted(host: HTMLElement): string | undefined {
  const id = field(host).getAttribute('aria-activedescendant');
  return id ? host.querySelector(`#${id}`)?.textContent.trim() : undefined;
}

describe('CwCommand', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  async function type(text: string): Promise<void> {
    const input = field(host);
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function press(key: string): Promise<KeyboardEvent> {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    field(host).dispatchEvent(event);
    await fixture.whenStable();
    return event;
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('wires the field to the listbox and highlights the first result', () => {
    const input = field(host);
    const list = host.querySelector('[role="listbox"]');
    expect(list?.getAttribute('aria-label')).toBe('Résultats');
    expect(input.getAttribute('aria-controls')).toBe(list?.id);
    expect(highlighted(host)).toBe('Créer une tâche');
    expect(shownGroups(host)).toEqual(['Suggestions', 'Actions']);
  });

  it('filters fuzzily, hides the empty groups and the separators, and bolds the matches', async () => {
    await type('export');

    expect(component.search()).toBe('export');
    expect(shownOptions(host)).toEqual(['Exporter la liste en CSV']);
    expect(shownGroups(host)).toEqual(['Actions']);
    expect(host.querySelector<HTMLElement>('cw-command-separator')?.hidden).toBe(true);
    expect(host.querySelector('mark')?.textContent).toBe('Export');
    expect(highlighted(host)).toBe('Exporter la liste en CSV');
  });

  it('matches the keywords and ignores accents', async () => {
    await type('effacer');
    expect(shownOptions(host)).toEqual(['Supprimer la tâche']);

    await type('creer');
    expect(shownOptions(host)).toEqual(['Créer une tâche']);
  });

  it('moves the highlight with the arrows, skips disabled items and loops', async () => {
    await press('ArrowDown');
    expect(highlighted(host)).toBe('Supprimer la tâche');

    await press('End');
    expect(highlighted(host)).toBe('Exporter la liste en CSV');

    await press('ArrowDown');
    expect(highlighted(host)).toBe('Créer une tâche');

    component.loop.set(false);
    await fixture.whenStable();
    await press('ArrowUp');
    expect(highlighted(host)).toBe('Créer une tâche');
  });

  it('runs the highlighted item on Enter and an item on click', async () => {
    await press('ArrowDown');
    const enter = await press('Enter');
    expect(enter.defaultPrevented).toBe(true);
    expect(component.ran()).toBe('Supprimer la tâche');

    const options = Array.from(host.querySelectorAll<HTMLElement>('[role="option"]'));
    options.at(3)?.click();
    expect(component.ran()).toBe('export-csv');

    // The disabled « Assigner à moi » does nothing.
    options.at(1)?.click();
    expect(component.ran()).toBe('export-csv');
  });

  it('clears the search on Escape before anything else', async () => {
    await type('csv');
    const escape = await press('Escape');

    expect(escape.defaultPrevented).toBe(true);
    expect(component.search()).toBe('');
    expect(field(host).value).toBe('');
  });

  it('shows the empty state with the search', async () => {
    await type('facturation');

    expect(shownOptions(host)).toEqual([]);
    const empty = host.querySelector<HTMLElement>('cw-command-empty');
    expect(empty?.hidden).toBe(false);
    expect(empty?.textContent.trim()).toBe('Aucun résultat pour « facturation »');
  });

  it('keeps every item for a server-side filter and shows the loading row', async () => {
    component.filter.set(null);
    component.loading.set(true);
    await type('sauvegarde');

    expect(shownOptions(host)).toHaveLength(4);
    expect(host.querySelector('cw-command')?.getAttribute('aria-busy')).toBe('true');
    const loading = host.querySelector<HTMLElement>('cw-command-loading');
    expect(loading?.hidden).toBe(false);
    expect(loading?.textContent.trim()).toBe('Recherche…');
    expect(host.querySelector<HTMLElement>('cw-command-empty')?.hidden).toBe(true);
  });
});
