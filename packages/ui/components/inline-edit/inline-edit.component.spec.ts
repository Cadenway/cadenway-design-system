import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwInlineEdit } from './inline-edit.component';

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

function field(host: HTMLElement, name: string): HTMLInputElement | HTMLTextAreaElement {
  const found = host.querySelector<HTMLInputElement>(`[aria-label="${name}"]`);
  if (!found) throw new Error(`No field named ${name}`);
  return found;
}

function key(target: HTMLElement, name: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
}

function type(target: HTMLInputElement | HTMLTextAreaElement, text: string): void {
  target.value = text;
  target.dispatchEvent(new Event('input'));
}

@Component({
  imports: [CwInlineEdit],
  template: `
    <cw-inline-edit
      [(value)]="title"
      [(editing)]="editing"
      required
      ariaLabel="Titre de la tâche"
      [saving]="saving()"
      [error]="error()"
      (save)="saved.set($event)"
      (cancel)="cancelled.set(cancelled() + 1)"
    />
    <cw-inline-edit
      [(value)]="description"
      multiline
      placeholder="Ajouter une description…"
      ariaLabel="Description"
    />
    <cw-inline-edit value="Rédiger la doc d'installation Docker" readonly />
  `,
})
class Host {
  readonly title = signal("Corriger l'export CSV des tâches");
  readonly description = signal('');
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = signal<string | null>(null);
  readonly cancelled = signal(0);
}

describe('CwInlineEdit', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('opens the field on click with the text selected, and saves with Enter', async () => {
    button(host, "Corriger l'export CSV des tâches").click();
    await fixture.whenStable();

    const input = field(host, 'Titre de la tâche');
    expect(component.editing()).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);

    type(input, "  Corriger l'export CSV des tâches (UTF-8) ");
    key(input, 'Enter');
    await fixture.whenStable();

    expect(component.title()).toBe("Corriger l'export CSV des tâches (UTF-8)");
    expect(component.saved()).toBe("Corriger l'export CSV des tâches (UTF-8)");
    expect(component.editing()).toBe(false);
    expect(document.activeElement).toBe(button(host, "Corriger l'export CSV des tâches (UTF-8)"));
  });

  it('cancels with Escape and keeps the value', async () => {
    const read = button(host, "Corriger l'export CSV des tâches");
    key(read, 'F2');
    await fixture.whenStable();
    const input = field(host, 'Titre de la tâche');

    type(input, 'Autre titre');
    key(input, 'Escape');
    await fixture.whenStable();

    expect(component.title()).toBe("Corriger l'export CSV des tâches");
    expect(component.cancelled()).toBe(1);
    expect(component.saved()).toBeNull();
  });

  it('refuses an empty required value and keeps the field open', async () => {
    button(host, "Corriger l'export CSV des tâches").click();
    await fixture.whenStable();
    const input = field(host, 'Titre de la tâche');

    type(input, '   ');
    key(input, 'Enter');
    await fixture.whenStable();

    expect(component.editing()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const message = host.querySelector(`#${input.getAttribute('aria-describedby') ?? ''}`);
    expect(message?.textContent.trim()).toBe('Ce champ ne peut pas être vide.');
  });

  it('validates on blur and treats an unchanged value as a cancel', async () => {
    button(host, "Corriger l'export CSV des tâches").click();
    await fixture.whenStable();
    field(host, 'Titre de la tâche').dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(component.editing()).toBe(false);
    expect(component.cancelled()).toBe(1);
    expect(component.saved()).toBeNull();
  });

  it('shows the saving state, then reopens the field with the typed text on a server error', async () => {
    button(host, "Corriger l'export CSV des tâches").click();
    await fixture.whenStable();
    const input = field(host, 'Titre de la tâche');
    type(input, 'Titre refusé');
    key(input, 'Enter');
    component.saving.set(true);
    await fixture.whenStable();

    const busy = host.querySelector('[aria-busy="true"]');
    expect(busy?.textContent).toContain('Enregistrement…');
    expect(host.querySelector('cw-inline-edit')?.getAttribute('data-state')).toBe('saving');

    component.saving.set(false);
    component.error.set('Le titre ne peut pas être vide.');
    await fixture.whenStable();

    const reopened = field(host, 'Titre de la tâche');
    expect(reopened.value).toBe('Titre refusé');
    expect(reopened.getAttribute('aria-invalid')).toBe('true');
    expect(host.textContent).toContain('Le titre ne peut pas être vide.');
  });

  it('adds a line with Enter and validates with Ctrl + Enter in multiline', async () => {
    button(host, 'Ajouter une description…').click();
    await fixture.whenStable();
    const area = field(host, 'Description');
    expect(area.tagName).toBe('TEXTAREA');

    type(area, "L'export coupe les accents.");
    key(area, 'Enter');
    await fixture.whenStable();
    expect(component.description()).toBe('');

    key(area, 'Enter', { ctrlKey: true });
    await fixture.whenStable();
    expect(component.description()).toBe("L'export coupe les accents.");
  });

  it('renders a read-only text without a button', () => {
    expect(
      Array.from(host.querySelectorAll('button')).some((element) =>
        element.textContent.includes('Docker'),
      ),
    ).toBe(false);
    expect(host.textContent).toContain('Lecture seule');
  });

  it('is the value accessor of a reactive form control', async () => {
    @Component({
      imports: [CwInlineEdit, ReactiveFormsModule],
      template: `<cw-inline-edit [formControl]="name" ariaLabel="Nom de la liste" />`,
    })
    class ReactiveHost {
      readonly name = new FormControl('Sprint 14', { nonNullable: true });
    }

    const reactive = TestBed.createComponent(ReactiveHost);
    reactive.autoDetectChanges();
    const element = reactive.nativeElement as HTMLElement;

    reactive.componentInstance.name.setValue('Sprint 15');
    await reactive.whenStable();
    button(element, 'Sprint 15').click();
    await reactive.whenStable();
    const input = field(element, 'Nom de la liste');
    type(input, 'Sprint 16');
    key(input, 'Enter');
    await reactive.whenStable();

    expect(reactive.componentInstance.name.value).toBe('Sprint 16');
    expect(reactive.componentInstance.name.touched).toBe(true);
  });

  it('is a Signal Forms value control', async () => {
    @Component({
      imports: [CwInlineEdit, FormField],
      template: `<cw-inline-edit [formField]="list.name" ariaLabel="Nom de la liste" />`,
    })
    class SignalHost {
      readonly model = signal({ name: 'En revue' });
      readonly list = form(this.model, (path) => {
        required(path.name);
      });
    }

    const signalFixture = TestBed.createComponent(SignalHost);
    signalFixture.autoDetectChanges();
    const element = signalFixture.nativeElement as HTMLElement;

    button(element, 'En revue').click();
    await signalFixture.whenStable();
    const input = field(element, 'Nom de la liste');
    type(input, 'À valider');
    key(input, 'Enter');
    await signalFixture.whenStable();

    expect(signalFixture.componentInstance.model().name).toBe('À valider');
  });
});
