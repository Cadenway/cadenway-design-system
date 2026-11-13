import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwRadioGroupItem } from './radio-group-item.component';
import { CwRadioGroup } from './radio-group.component';

function radio(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="radio"]')).find(
    (element) =>
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim().startsWith(name) ===
      true,
  );
  if (!found) throw new Error(`No radio named ${name}`);
  return found;
}

function group(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('[role="radiogroup"]')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No radio group named ${name}`);
  return found;
}

function press(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function leave(target: HTMLElement): void {
  target.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
}

@Component({
  imports: [CwRadioGroup, CwRadioGroupItem],
  template: `
    <cw-radio-group ariaLabel="Vue par défaut" orientation="horizontal" [(value)]="view">
      <cw-radio-group-item id="v-list" value="list" /><label for="v-list">Liste</label>
      <cw-radio-group-item id="v-board" value="board" /><label for="v-board">Tableau</label>
      <cw-radio-group-item id="v-gantt" value="gantt" disabled /><label for="v-gantt">Gantt</label>
      <cw-radio-group-item id="v-calendar" value="calendar" /><label for="v-calendar"
        >Calendrier</label
      >
    </cw-radio-group>
    <cw-radio-group ariaLabel="Visibilité de l'espace" [(value)]="visibility">
      <cw-radio-group-item variant="card" value="public">Public</cw-radio-group-item>
      <cw-radio-group-item variant="card" value="private">Privé</cw-radio-group-item>
    </cw-radio-group>
  `,
})
class ModelHost {
  readonly view = signal<string | null>('list');
  readonly visibility = signal<string | null>(null);
}

describe('CwRadioGroup', () => {
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

    it('reflects the value model and selects on click', async () => {
      expect(radio(host, 'Liste').getAttribute('aria-checked')).toBe('true');
      expect(group(host, 'Vue par défaut').dataset['orientation']).toBe('horizontal');

      radio(host, 'Tableau').click();
      await fixture.whenStable();

      expect(component.view()).toBe('board');
      expect(radio(host, 'Tableau').getAttribute('aria-checked')).toBe('true');
      expect(radio(host, 'Liste').getAttribute('aria-checked')).toBe('false');
    });

    it('makes the selected option the only tab stop, or the first one without a value', () => {
      expect(radio(host, 'Liste').tabIndex).toBe(0);
      expect(radio(host, 'Tableau').tabIndex).toBe(-1);
      expect(radio(host, 'Public').tabIndex).toBe(0);
      expect(radio(host, 'Privé').tabIndex).toBe(-1);
    });

    it('selects with the arrows, skipping the disabled option and wrapping around', async () => {
      radio(host, 'Liste').focus();

      press(radio(host, 'Liste'), 'ArrowRight');
      await fixture.whenStable();
      expect(component.view()).toBe('board');
      expect(document.activeElement).toBe(radio(host, 'Tableau'));

      press(radio(host, 'Tableau'), 'ArrowDown');
      await fixture.whenStable();
      expect(component.view()).toBe('calendar');
      expect(radio(host, 'Gantt').disabled).toBe(true);

      press(radio(host, 'Calendrier'), 'ArrowRight');
      await fixture.whenStable();
      expect(component.view()).toBe('list');

      press(radio(host, 'Liste'), 'ArrowUp');
      await fixture.whenStable();
      expect(component.view()).toBe('calendar');
      expect(radio(host, 'Calendrier').tabIndex).toBe(0);
    });

    it('names a choice card by its content and selects it from anywhere in the card', async () => {
      const card = host.querySelector<HTMLLabelElement>(`label[for="${radio(host, 'Privé').id}"]`);
      card?.click();
      await fixture.whenStable();

      expect(component.visibility()).toBe('private');
      expect(radio(host, 'Privé').getAttribute('aria-checked')).toBe('true');
    });
  });

  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    @Component({
      imports: [CwRadioGroup, CwRadioGroupItem, ReactiveFormsModule],
      template: `
        <cw-radio-group ariaLabel="Visibilité" [formControl]="visibility">
          <cw-radio-group-item id="r-public" value="public" /><label for="r-public">Public</label>
          <cw-radio-group-item id="r-private" value="private" /><label for="r-private">Privé</label>
        </cw-radio-group>
      `,
    })
    class ReactiveHost {
      readonly visibility = new FormControl<string | null>(null, {
        validators: [(control) => Validators.required(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const visibility = group(host, 'Visibilité');

    leave(radio(host, 'Public'));
    await fixture.whenStable();
    expect(visibility.getAttribute('aria-invalid')).toBe('true');
    expect(radio(host, 'Public').getAttribute('aria-invalid')).toBe('true');

    radio(host, 'Privé').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.visibility.value).toBe('private');
    expect(visibility.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.visibility.setValue('public');
    await fixture.whenStable();
    expect(radio(host, 'Public').getAttribute('aria-checked')).toBe('true');

    fixture.componentInstance.visibility.disable();
    await fixture.whenStable();
    expect(radio(host, 'Public').disabled).toBe(true);
    expect(visibility.getAttribute('aria-disabled')).toBe('true');
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [CwRadioGroup, CwRadioGroupItem, FormsModule],
      template: `
        <cw-radio-group ariaLabel="Fréquence" [(ngModel)]="frequency">
          <cw-radio-group-item id="f-now" value="now" /><label for="f-now">Immédiatement</label>
          <cw-radio-group-item id="f-daily" value="daily" /><label for="f-daily"
            >Résumé quotidien</label
          >
        </cw-radio-group>
      `,
    })
    class TemplateHost {
      readonly frequency = signal('daily');
    }

    const fixture = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    // NgModel writes its value in a microtask after the first check.
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(radio(host, 'Résumé quotidien').getAttribute('aria-checked')).toBe('true');

    radio(host, 'Immédiatement').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.frequency()).toBe('now');
  });

  it('is a Signal Forms value control', async () => {
    @Component({
      imports: [CwRadioGroup, CwRadioGroupItem, FormField],
      template: `
        <cw-radio-group ariaLabel="Visibilité" [formField]="space.visibility">
          <cw-radio-group-item id="s-public" value="public" /><label for="s-public">Public</label>
          <cw-radio-group-item id="s-private" value="private" /><label for="s-private">Privé</label>
        </cw-radio-group>
      `,
    })
    class SignalHost {
      readonly model = signal<{ visibility: string | null }>({ visibility: null });
      readonly space = form(this.model, (path) => {
        required(path.visibility);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const visibility = group(host, 'Visibilité');
    expect(visibility.getAttribute('aria-required')).toBe('true');

    leave(radio(host, 'Public'));
    await fixture.whenStable();
    expect(visibility.getAttribute('aria-invalid')).toBe('true');

    radio(host, 'Privé').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().visibility).toBe('private');

    fixture.componentInstance.model.set({ visibility: 'public' });
    await fixture.whenStable();
    expect(radio(host, 'Public').getAttribute('aria-checked')).toBe('true');
    expect(visibility.hasAttribute('aria-invalid')).toBe(false);
  });
});
