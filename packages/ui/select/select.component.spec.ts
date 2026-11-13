import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwSelectEmpty } from './select-empty/select-empty.component';
import { CwSelectGroup } from './select-group/select-group.component';
import { CwSelectOption } from './select-option/select-option.component';
import { CwSelectSeparator } from './select-separator/select-separator.component';
import { CwSelect } from './select.component';

function combobox(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="combobox"]')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No combobox named ${name}`);
  return found;
}

function listbox(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="listbox"]');
}

function option(name: string): HTMLElement {
  const found = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    (element) => element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No option named ${name}`);
  return found;
}

function key(target: HTMLElement, value: string): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
  );
}

@Component({
  imports: [CwSelect, CwSelectGroup, CwSelectOption, CwSelectSeparator, CwSelectEmpty],
  template: `
    <cw-select
      [(value)]="status"
      [(open)]="open"
      placeholder="Choisir un statut"
      ariaLabel="Statut"
    >
      <cw-select-group label="Pas commencé">
        <cw-select-option value="todo">À faire</cw-select-option>
        <cw-select-option value="waiting" disabled>En attente</cw-select-option>
      </cw-select-group>
      <cw-select-separator />
      <cw-select-group label="Actif">
        <cw-select-option value="progress">En cours</cw-select-option>
        <cw-select-option value="blocked">Bloqué</cw-select-option>
      </cw-select-group>
    </cw-select>
    <cw-select ariaLabel="Liste" />
    <cw-select ariaLabel="Sprint">
      <cw-select-empty>Aucun sprint planifié.</cw-select-empty>
    </cw-select>
  `,
})
class ModelHost {
  readonly status = signal<string | null>(null);
  readonly open = signal(false);
}

describe('CwSelect', () => {
  describe('with models', () => {
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

    it('shows the placeholder, opens on click and chooses an option', async () => {
      const trigger = combobox(host, 'Statut');
      expect(trigger.textContent.trim()).toBe('Choisir un statut');
      expect(trigger.hasAttribute('data-placeholder')).toBe(true);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      trigger.click();
      await fixture.whenStable();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(component.open()).toBe(true);
      expect(listbox()?.getAttribute('aria-label')).toBe('Statut');
      expect(trigger.getAttribute('aria-controls')).toBe(listbox()?.id);

      option('En cours').click();
      await fixture.whenStable();
      expect(component.status()).toBe('progress');
      expect(component.open()).toBe(false);
      expect(listbox()).toBeNull();
      expect(trigger.textContent.trim()).toBe('En cours');
      expect(trigger.hasAttribute('data-placeholder')).toBe(false);
    });

    it('marks the chosen option and names its groups', async () => {
      component.status.set('blocked');
      component.open.set(true);
      await fixture.whenStable();

      expect(option('Bloqué').getAttribute('aria-selected')).toBe('true');
      expect(option('En cours').getAttribute('aria-selected')).toBe('false');
      expect(option('En attente').getAttribute('aria-disabled')).toBe('true');
      const groups = Array.from(document.querySelectorAll<HTMLElement>('[role="group"]'));
      const names = groups.map(
        (group) =>
          document.getElementById(group.getAttribute('aria-labelledby') ?? '')?.textContent,
      );
      expect(names).toEqual(['Pas commencé', 'Actif']);
    });

    it('opens with the arrows on the chosen option and moves past disabled ones', async () => {
      component.status.set('todo');
      await fixture.whenStable();
      const trigger = combobox(host, 'Statut');

      key(trigger, 'ArrowDown');
      await fixture.whenStable();
      expect(trigger.getAttribute('aria-activedescendant')).toBe(option('À faire').id);
      expect(option('À faire').hasAttribute('data-highlighted')).toBe(true);

      key(trigger, 'ArrowDown');
      await fixture.whenStable();
      expect(trigger.getAttribute('aria-activedescendant')).toBe(option('En cours').id);

      key(trigger, 'End');
      await fixture.whenStable();
      expect(trigger.getAttribute('aria-activedescendant')).toBe(option('Bloqué').id);

      key(trigger, 'Enter');
      await fixture.whenStable();
      expect(component.status()).toBe('blocked');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('jumps to the enabled option that starts with the typed letters', async () => {
      const trigger = combobox(host, 'Statut');
      key(trigger, 'Enter');
      await fixture.whenStable();

      // « e » skips the disabled « En attente »; « en » keeps « En cours ».
      key(trigger, 'e');
      await fixture.whenStable();
      expect(trigger.getAttribute('aria-activedescendant')).toBe(option('En cours').id);

      key(trigger, 'n');
      await fixture.whenStable();
      expect(trigger.getAttribute('aria-activedescendant')).toBe(option('En cours').id);
    });

    it('closes on Escape without changing the value', async () => {
      component.status.set('todo');
      await fixture.whenStable();
      const trigger = combobox(host, 'Statut');

      key(trigger, ' ');
      await fixture.whenStable();
      key(trigger, 'ArrowDown');
      key(trigger, 'Escape');
      await fixture.whenStable();

      expect(component.status()).toBe('todo');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(listbox()).toBeNull();
    });

    it('closes on a click outside', async () => {
      const trigger = combobox(host, 'Statut');
      trigger.click();
      await fixture.whenStable();
      expect(listbox()).not.toBeNull();

      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await fixture.whenStable();

      expect(component.open()).toBe(false);
    });

    it('says when there is no option, with its text or the projected message', async () => {
      combobox(host, 'Liste').click();
      await fixture.whenStable();
      expect(document.body.textContent).toContain('Aucune option');
      combobox(host, 'Liste').click();
      await fixture.whenStable();

      combobox(host, 'Sprint').click();
      await fixture.whenStable();
      expect(document.body.textContent).toContain('Aucun sprint planifié.');
    });
  });

  it('matches object values with compareWith', async () => {
    interface Sprint {
      readonly id: number;
      readonly name: string;
    }

    @Component({
      imports: [CwSelect, CwSelectOption],
      template: `
        <cw-select [(value)]="sprint" [compareWith]="sameId" ariaLabel="Sprint">
          @for (item of sprints; track item.id) {
            <cw-select-option [value]="item">{{ item.name }}</cw-select-option>
          }
        </cw-select>
      `,
    })
    class ObjectHost {
      readonly sprints: Sprint[] = [
        { id: 14, name: 'Sprint 14' },
        { id: 15, name: 'Sprint 15' },
      ];
      readonly sprint = signal<Sprint | null>({ id: 15, name: 'Sprint 15' });
      readonly sameId = (a: Sprint, b: Sprint): boolean => a.id === b.id;
    }

    const fixture = TestBed.createComponent(ObjectHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    expect(combobox(fixture.nativeElement as HTMLElement, 'Sprint').textContent.trim()).toBe(
      'Sprint 15',
    );
  });

  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    @Component({
      imports: [CwSelect, CwSelectOption, ReactiveFormsModule],
      template: `
        <cw-select [formControl]="priority" ariaLabel="Priorité">
          <cw-select-option value="haute">Haute</cw-select-option>
          <cw-select-option value="basse">Basse</cw-select-option>
        </cw-select>
      `,
    })
    class ReactiveHost {
      readonly priority = new FormControl<string | null>(null, {
        validators: [(control) => Validators.required(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const trigger = combobox(fixture.nativeElement as HTMLElement, 'Priorité');

    fixture.componentInstance.priority.setValue('basse');
    await fixture.whenStable();
    expect(trigger.textContent.trim()).toBe('Basse');

    trigger.click();
    await fixture.whenStable();
    option('Haute').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.priority.value).toBe('haute');

    fixture.componentInstance.priority.setValue(null);
    trigger.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-invalid')).toBe('true');

    fixture.componentInstance.priority.disable();
    await fixture.whenStable();
    expect(trigger.disabled).toBe(true);
  });

  it('is a Signal Forms value control', async () => {
    @Component({
      imports: [CwSelect, CwSelectOption, FormField],
      template: `
        <cw-select [formField]="task.priority" ariaLabel="Priorité">
          <cw-select-option value="haute">Haute</cw-select-option>
          <cw-select-option value="basse">Basse</cw-select-option>
        </cw-select>
      `,
    })
    class SignalHost {
      readonly model = signal<{ priority: string | null }>({ priority: null });
      readonly task = form(this.model, (path) => {
        required(path.priority);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const trigger = combobox(fixture.nativeElement as HTMLElement, 'Priorité');

    trigger.click();
    await fixture.whenStable();
    option('Basse').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().priority).toBe('basse');

    fixture.componentInstance.model.set({ priority: 'haute' });
    await fixture.whenStable();
    expect(trigger.textContent.trim()).toBe('Haute');
  });
});
