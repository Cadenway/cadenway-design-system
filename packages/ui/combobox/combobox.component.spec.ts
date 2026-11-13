import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwComboboxEmpty } from './combobox-empty/combobox-empty.component';
import { CwComboboxGroup } from './combobox-group/combobox-group.component';
import { CwComboboxOption } from './combobox-option/combobox-option.component';
import { CwCombobox } from './combobox.component';

function trigger(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(
    host.querySelectorAll<HTMLButtonElement>('button[role="combobox"]'),
  ).find((element) => element.getAttribute('aria-label') === name);
  if (!found) throw new Error(`No combobox named ${name}`);
  return found;
}

function searchField(): HTMLInputElement {
  const found = document.querySelector<HTMLInputElement>('input[role="combobox"]');
  if (!found) throw new Error('No search field');
  return found;
}

function listbox(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="listbox"]');
}

/** The options a user can see: hidden ones are out of the accessibility tree. */
function visibleOptions(): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
    .filter((element) => !element.closest('[hidden]'))
    .map((element) => element.textContent.trim());
}

function option(name: string): HTMLElement {
  const found = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    (element) => element.textContent.trim().startsWith(name),
  );
  if (!found) throw new Error(`No option named ${name}`);
  return found;
}

function key(target: HTMLElement, value: string): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
  );
}

function type(field: HTMLInputElement, text: string): void {
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

@Component({
  imports: [CwCombobox, CwComboboxGroup, CwComboboxOption, CwComboboxEmpty],
  template: `
    <cw-combobox
      [(value)]="owner"
      ariaLabel="Responsable"
      placeholder="Choisir une personne"
      (search)="searches.push($event)"
    >
      <cw-combobox-group label="Équipe Produit">
        <cw-combobox-option value="lea" [keywords]="['lea@cadenway.fr']"
          >Léa Martin</cw-combobox-option
        >
        <cw-combobox-option value="karim">Karim Benali</cw-combobox-option>
      </cw-combobox-group>
      <cw-combobox-group label="Autres membres">
        <cw-combobox-option value="samuel" disabled>Samuel Roux</cw-combobox-option>
        <cw-combobox-option value="ines">Inès Duval</cw-combobox-option>
      </cw-combobox-group>
    </cw-combobox>
    <cw-combobox
      multiple
      creatable
      [(value)]="labels"
      [createLabel]="createLabel"
      ariaLabel="Étiquettes"
      (create)="created.set($event)"
    >
      <cw-combobox-option value="web">Mobile web</cw-combobox-option>
      <cw-combobox-option value="app">Application mobile</cw-combobox-option>
      <cw-combobox-option value="api">API</cw-combobox-option>
    </cw-combobox>
    <cw-combobox ariaLabel="Assignés" [loading]="true" />
    <cw-combobox ariaLabel="Personnes">
      <cw-combobox-option value="lea">Léa Martin</cw-combobox-option>
      <cw-combobox-empty>Aucune personne trouvée</cw-combobox-empty>
    </cw-combobox>
  `,
})
class ModelHost {
  readonly owner = signal<unknown>(null);
  readonly labels = signal<unknown>([]);
  readonly created = signal<string | null>(null);
  readonly searches: string[] = [];
  readonly createLabel = (query: string): string => `Créer l'étiquette « ${query} »`;
}

describe('CwCombobox', () => {
  let host: HTMLElement;
  let component: ModelHost;
  let fixture: ComponentFixture<ModelHost>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ModelHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('opens on click with the focus in the search, filters without accents and chooses', async () => {
    const owner = trigger(host, 'Responsable');
    expect(owner.textContent.trim()).toBe('Choisir une personne');

    owner.click();
    await fixture.whenStable();
    expect(owner.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(searchField());
    expect(searchField().getAttribute('aria-label')).toBe('Rechercher…');
    expect(listbox()?.getAttribute('aria-label')).toBe('Responsable');

    type(searchField(), 'ines');
    await fixture.whenStable();
    expect(component.searches).toEqual(['ines']);
    expect(visibleOptions()).toEqual(['Inès Duval']);
    expect(searchField().getAttribute('aria-activedescendant')).toBe(option('Inès Duval').id);

    key(searchField(), 'Enter');
    await fixture.whenStable();
    expect(component.owner()).toBe('ines');
    expect(owner.getAttribute('aria-expanded')).toBe('false');
    expect(owner.textContent.trim()).toBe('Inès Duval');
    expect(document.activeElement).toBe(owner);
  });

  it('matches keywords and skips disabled options with the arrows', async () => {
    trigger(host, 'Responsable').click();
    await fixture.whenStable();

    type(searchField(), 'cadenway');
    await fixture.whenStable();
    expect(visibleOptions()).toEqual(['Léa Martin']);

    type(searchField(), '');
    await fixture.whenStable();
    key(searchField(), 'ArrowDown');
    key(searchField(), 'ArrowDown');
    await fixture.whenStable();
    expect(option('Samuel Roux').getAttribute('aria-disabled')).toBe('true');
    expect(searchField().getAttribute('aria-activedescendant')).toBe(option('Inès Duval').id);
  });

  it('says when nothing matches, then clears the search and closes on Escape', async () => {
    const owner = trigger(host, 'Responsable');
    key(owner, 'z');
    await fixture.whenStable();
    expect(searchField().value).toBe('z');
    expect(document.body.textContent).toContain('Aucun résultat');

    key(searchField(), 'Escape');
    await fixture.whenStable();
    expect(searchField().value).toBe('');
    expect(visibleOptions()).toHaveLength(4);

    key(searchField(), 'Escape');
    await fixture.whenStable();
    expect(owner.getAttribute('aria-expanded')).toBe('false');
    expect(listbox()).toBeNull();
  });

  it('ticks several values and stays open in multiple', async () => {
    const labels = trigger(host, 'Étiquettes');
    labels.click();
    await fixture.whenStable();
    expect(listbox()?.getAttribute('aria-multiselectable')).toBe('true');

    option('Mobile web').click();
    option('API').click();
    await fixture.whenStable();
    expect(component.labels()).toEqual(['web', 'api']);
    expect(labels.getAttribute('aria-expanded')).toBe('true');
    expect(option('API').getAttribute('aria-selected')).toBe('true');
    expect(labels.textContent.trim()).toBe('2 sélectionnés');

    option('API').click();
    await fixture.whenStable();
    expect(component.labels()).toEqual(['web']);
  });

  it('offers to create what was typed when no option has that text', async () => {
    trigger(host, 'Étiquettes').click();
    await fixture.whenStable();

    type(searchField(), 'mobile');
    await fixture.whenStable();
    expect(visibleOptions()).toEqual([
      'Mobile web',
      'Application mobile',
      "Créer l'étiquette « mobile »",
    ]);

    type(searchField(), 'Mobile web');
    await fixture.whenStable();
    expect(visibleOptions()).toEqual(['Mobile web']);

    type(searchField(), 'Design');
    await fixture.whenStable();
    key(searchField(), 'Enter');
    await fixture.whenStable();
    expect(component.created()).toBe('Design');
  });

  it('shows the projected empty message when the search matches nothing', async () => {
    trigger(host, 'Personnes').click();
    await fixture.whenStable();
    expect(document.body.textContent).not.toContain('Aucune personne trouvée');

    type(searchField(), 'zoé');
    await fixture.whenStable();
    expect(document.body.textContent).toContain('Aucune personne trouvée');
    expect(document.body.textContent).not.toContain('Aucun résultat');
  });

  it('shows the loading state in place of the list', async () => {
    trigger(host, 'Assignés').click();
    await fixture.whenStable();

    expect(document.body.textContent).toContain('Recherche…');
    expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-busy')).toBe('true');
  });

  it('closes on a click outside', async () => {
    const owner = trigger(host, 'Responsable');
    owner.click();
    await fixture.whenStable();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(owner.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('CwCombobox in forms', () => {
  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    @Component({
      imports: [CwCombobox, CwComboboxOption, ReactiveFormsModule],
      template: `
        <cw-combobox [formControl]="owner" ariaLabel="Responsable">
          <cw-combobox-option value="lea">Léa Martin</cw-combobox-option>
          <cw-combobox-option value="karim">Karim Benali</cw-combobox-option>
        </cw-combobox>
      `,
    })
    class ReactiveHost {
      readonly owner = new FormControl<string | null>(null, {
        validators: [(control) => Validators.required(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const owner = trigger(fixture.nativeElement as HTMLElement, 'Responsable');

    fixture.componentInstance.owner.setValue('karim');
    await fixture.whenStable();
    expect(owner.textContent.trim()).toBe('Karim Benali');

    owner.click();
    await fixture.whenStable();
    option('Léa Martin').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.owner.value).toBe('lea');

    fixture.componentInstance.owner.setValue(null);
    await fixture.whenStable();
    expect(owner.getAttribute('aria-invalid')).toBe('true');

    fixture.componentInstance.owner.disable();
    await fixture.whenStable();
    expect(owner.disabled).toBe(true);
  });

  it('is a Signal Forms value control, multiple included', async () => {
    @Component({
      imports: [CwCombobox, CwComboboxOption, FormField],
      template: `
        <cw-combobox multiple [formField]="task.assignees" ariaLabel="Assignés">
          <cw-combobox-option value="lea">Léa Martin</cw-combobox-option>
          <cw-combobox-option value="karim">Karim Benali</cw-combobox-option>
        </cw-combobox>
      `,
    })
    class SignalHost {
      readonly model = signal<{ assignees: readonly string[] }>({ assignees: [] });
      readonly task = form(this.model, (path) => {
        required(path.assignees);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const assignees = trigger(fixture.nativeElement as HTMLElement, 'Assignés');

    assignees.click();
    await fixture.whenStable();
    option('Karim Benali').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().assignees).toEqual(['karim']);

    fixture.componentInstance.model.set({ assignees: ['lea'] });
    await fixture.whenStable();
    expect(assignees.textContent.trim()).toBe('Léa Martin');
  });
});
