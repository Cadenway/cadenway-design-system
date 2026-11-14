import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwInlineEdit } from './inline-edit.component';

/**
 * Function button
 *
 * @description
 * Finds a reading button by its text.
 *
 * @param {HTMLElement} host - Container holding the reading button.
 * @param {string} name - Expected button text.
 *
 * @returns {HTMLButtonElement} Matching reading button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function field
 *
 * @description
 * Finds an editing field by its accessible name.
 *
 * @param {HTMLElement} host - Container holding the editor.
 * @param {string} name - Expected accessible name.
 *
 * @returns {HTMLInputElement | HTMLTextAreaElement} Matching input or textarea.
 */
function field(host: HTMLElement, name: string): HTMLInputElement | HTMLTextAreaElement {
  const found: HTMLInputElement | null = host.querySelector<HTMLInputElement>(
    `[aria-label="${name}"]`,
  );
  if (!found) throw new Error(`No field named ${name}`);
  return found;
}

/**
 * Function key
 *
 * @description
 * Dispatches a keyboard event to a control.
 *
 * @param {HTMLElement} target - Element receiving the keyboard event.
 * @param {string} name - Keyboard key to dispatch.
 * @param {KeyboardEventInit} [init] - Additional keyboard event options.
 */
function key(target: HTMLElement, name: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
}

/**
 * Function type
 *
 * @description
 * Updates a field and dispatches an input event.
 *
 * @param {HTMLInputElement | HTMLTextAreaElement} target - Input or textarea to update.
 * @param {string} text - Draft text to enter.
 */
function type(target: HTMLInputElement | HTMLTextAreaElement, text: string): void {
  target.value = text;
  target.dispatchEvent(new Event('input'));
}

/**
 * Component Host
 *
 * @description
 * Exercises inline editing and save feedback.
 */
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
  // #region Properties
  /**
   * Property title
   * @readonly
   *
   * @description
   * Current title.
   *
   * @type {WritableSignal<string>}
   */
  public readonly title: WritableSignal<string> = signal("Corriger l'export CSV des tâches");

  /**
   * Property description
   * @readonly
   *
   * @description
   * Current description.
   *
   * @type {WritableSignal<string>}
   */
  public readonly description: WritableSignal<string> = signal('');

  /**
   * Property editing
   * @readonly
   *
   * @description
   * Whether the title is being edited.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly editing: WritableSignal<boolean> = signal(false);

  /**
   * Property saving
   * @readonly
   *
   * @description
   * Whether the title is being saved.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly saving: WritableSignal<boolean> = signal(false);

  /**
   * Property error
   * @readonly
   *
   * @description
   * Current server error.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly error: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property saved
   * @readonly
   *
   * @description
   * Last emitted value.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly saved: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property cancelled
   * @readonly
   *
   * @description
   * Number of cancellations.
   *
   * @type {WritableSignal<number>}
   */
  public readonly cancelled: WritableSignal<number> = signal(0);
  // #endregion
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

    const input: HTMLInputElement | HTMLTextAreaElement = field(host, 'Titre de la tâche');
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
    const read: HTMLButtonElement = button(host, "Corriger l'export CSV des tâches");
    key(read, 'F2');
    await fixture.whenStable();
    const input: HTMLInputElement | HTMLTextAreaElement = field(host, 'Titre de la tâche');

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
    const input: HTMLInputElement | HTMLTextAreaElement = field(host, 'Titre de la tâche');

    type(input, '   ');
    key(input, 'Enter');
    await fixture.whenStable();

    expect(component.editing()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const message: Element | null = host.querySelector(
      `#${input.getAttribute('aria-describedby') ?? ''}`,
    );
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
    const input: HTMLInputElement | HTMLTextAreaElement = field(host, 'Titre de la tâche');
    type(input, 'Titre refusé');
    key(input, 'Enter');
    component.saving.set(true);
    await fixture.whenStable();

    const busy: Element | null = host.querySelector('[aria-busy="true"]');
    expect(busy?.textContent).toContain('Enregistrement…');
    expect(host.querySelector('cw-inline-edit')?.getAttribute('data-state')).toBe('saving');

    component.saving.set(false);
    component.error.set('Le titre ne peut pas être vide.');
    await fixture.whenStable();

    const reopened: HTMLInputElement | HTMLTextAreaElement = field(host, 'Titre de la tâche');
    expect(reopened.value).toBe('Titre refusé');
    expect(reopened.getAttribute('aria-invalid')).toBe('true');
    expect(host.textContent).toContain('Le titre ne peut pas être vide.');
  });

  it('adds a line with Enter and validates with Ctrl + Enter in multiline', async () => {
    button(host, 'Ajouter une description…').click();
    await fixture.whenStable();
    const area: HTMLInputElement | HTMLTextAreaElement = field(host, 'Description');
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
    /**
     * Component ReactiveHost
     *
     * @description
     * Exercises the reactive forms value accessor.
     */
    @Component({
      imports: [CwInlineEdit, ReactiveFormsModule],
      template: `<cw-inline-edit [formControl]="name" ariaLabel="Nom de la liste" />`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property name
       * @readonly
       *
       * @description
       * Reactive form value.
       *
       * @type {FormControl<string>}
       */
      public readonly name: FormControl<string> = new FormControl<string>('Sprint 14', {
        nonNullable: true,
      });
      // #endregion
    }

    const reactive: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    reactive.autoDetectChanges();
    const element: HTMLElement = reactive.nativeElement as HTMLElement;

    reactive.componentInstance.name.setValue('Sprint 15');
    await reactive.whenStable();
    button(element, 'Sprint 15').click();
    await reactive.whenStable();
    const input: HTMLInputElement | HTMLTextAreaElement = field(element, 'Nom de la liste');
    type(input, 'Sprint 16');
    key(input, 'Enter');
    await reactive.whenStable();

    expect(reactive.componentInstance.name.value).toBe('Sprint 16');
    expect(reactive.componentInstance.name.touched).toBe(true);
  });

  it('is a Signal Forms value control', async () => {
    /**
     * Component SignalHost
     *
     * @description
     * Exercises the Signal Forms value control.
     */
    @Component({
      imports: [CwInlineEdit, FormField],
      template: `<cw-inline-edit [formField]="list.name" ariaLabel="Nom de la liste" />`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Model for the Signal Forms example.
       *
       * @type {WritableSignal<{ name: string }>}
       */
      public readonly model: WritableSignal<{ name: string }> = signal({ name: 'En revue' });

      /**
       * Property list
       * @readonly
       *
       * @description
       * Signal Forms tree for the list name.
       *
       * @type {FieldTree<{ name: string }>}
       */
      public readonly list: FieldTree<{ name: string }> = form(this.model, (path) => {
        required(path.name);
      });
      // #endregion
    }

    const signalFixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    signalFixture.autoDetectChanges();
    const element: HTMLElement = signalFixture.nativeElement as HTMLElement;

    button(element, 'En revue').click();
    await signalFixture.whenStable();
    const input: HTMLInputElement | HTMLTextAreaElement = field(element, 'Nom de la liste');
    type(input, 'À valider');
    key(input, 'Enter');
    await signalFixture.whenStable();

    expect(signalFixture.componentInstance.model().name).toBe('À valider');
  });
});
