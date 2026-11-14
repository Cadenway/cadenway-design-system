import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwInput } from './input.directive';

/**
 * Function field
 *
 * @description
 * Finds a test input by its aria-label or the text of its associated label.
 *
 * @param {HTMLElement} host - Container holding the inputs and labels.
 * @param {string} name - Exact label text to match.
 *
 * @returns {HTMLInputElement} First matching input.
 *
 * @throws {Error} When no input has the requested name.
 */
function field(host: HTMLElement, name: string): HTMLInputElement {
  const found: HTMLInputElement | undefined = Array.from(host.querySelectorAll('input')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No field named ${name}`);
  return found;
}

describe('CwInput', () => {
  it('keeps the native attributes and the layout classes of the consumer', () => {
    /**
     * Class Host
     * @class Host
     *
     * @description
     * Test host with a labelled readonly input and an input with static invalid state.
     */
    @Component({
      imports: [CwInput],
      template: `
        <label for="prefix">Préfixe des identifiants</label>
        <input cwInput id="prefix" class="w-52" size="sm" placeholder="CAD" readonly />
        <input cwInput aria-label="Adresse d'expédition" aria-invalid="true" type="email" />
      `,
    })
    class Host {}

    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const prefix: HTMLInputElement = field(host, 'Préfixe des identifiants');

    expect(prefix.readOnly).toBe(true);
    expect(prefix.placeholder).toBe('CAD');
    expect(prefix.dataset['size']).toBe('sm');
    expect(prefix.classList).toContain('w-52');
    expect(prefix.hasAttribute('aria-invalid')).toBe(false);
    expect(field(host, "Adresse d'expédition").getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps the native value accessor of a reactive form and reports invalid once touched', async () => {
    /**
     * Class ReactiveHost
     * @class ReactiveHost
     *
     * @description
     * Test host binding a required reactive form control to a native input.
     */
    @Component({
      imports: [CwInput, ReactiveFormsModule],
      template: `<input cwInput [formControl]="name" aria-label="Nom de la tâche" />`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property name
       * @readonly
       *
       * @description
       * Required non-nullable text control used to test the native value accessor.
       *
       * @type {FormControl<string>}
       */
      public readonly name: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      });
      // #endregion
    }

    const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const name: HTMLInputElement = field(host, 'Nom de la tâche');

    expect(name.hasAttribute('aria-invalid')).toBe(false);
    name.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(name.getAttribute('aria-invalid')).toBe('true');

    name.value = 'Préparer la revue de sprint';
    name.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.name.value).toBe('Préparer la revue de sprint');
    expect(name.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.name.disable();
    await fixture.whenStable();
    expect(name.disabled).toBe(true);
  });

  it('works with ngModel', async () => {
    /**
     * Class TemplateHost
     * @class TemplateHost
     *
     * @description
     * Test host binding a URL signal through template-driven `ngModel`.
     */
    @Component({
      imports: [CwInput, FormsModule],
      template: `<input cwInput [(ngModel)]="url" aria-label="URL de l'instance" />`,
    })
    class TemplateHost {
      // #region Properties
      /**
       * Property url
       * @readonly
       *
       * @description
       * URL model updated by the input's template-driven binding.
       *
       * @type {WritableSignal<string>}
       */
      public readonly url: WritableSignal<string> = signal('https://cadenway.exemple.fr');
      // #endregion
    }

    const fixture: ComponentFixture<TemplateHost> = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const url: HTMLInputElement = field(fixture.nativeElement as HTMLElement, "URL de l'instance");

    expect(url.value).toBe('https://cadenway.exemple.fr');
    url.value = 'https://tâches.exemple.fr';
    url.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.url()).toBe('https://tâches.exemple.fr');
  });

  it('works with Signal Forms on the native element', async () => {
    /**
     * Class SignalHost
     * @class SignalHost
     *
     * @description
     * Test host binding a required Signal Forms prefix field to a native input.
     */
    @Component({
      imports: [CwInput, FormField],
      template: `<input cwInput [formField]="space.prefix" aria-label="Préfixe" />`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Writable model containing the prefix edited by the input.
       *
       * @type {WritableSignal<{ prefix: string }>}
       */
      public readonly model: WritableSignal<{ prefix: string }> = signal({ prefix: '' });

      /**
       * Property space
       * @readonly
       *
       * @description
       * Signal Forms tree that marks the model's prefix as required.
       *
       * @type {FieldTree<{ prefix: string }>}
       */
      public readonly space: FieldTree<{ prefix: string }> = form(this.model, (path) => {
        required(path.prefix);
      });
      // #endregion
    }

    const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const prefix: HTMLInputElement = field(fixture.nativeElement as HTMLElement, 'Préfixe');

    prefix.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(prefix.getAttribute('aria-invalid')).toBe('true');

    prefix.value = 'CAD';
    prefix.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().prefix).toBe('CAD');
    expect(prefix.hasAttribute('aria-invalid')).toBe(false);
  });
});
