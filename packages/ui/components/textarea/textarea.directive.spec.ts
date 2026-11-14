import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwTextarea } from './textarea.directive';

/**
 * Function area
 *
 * @description
 * Finds a textarea in the test host using its accessible label.
 *
 * @param {HTMLElement} host - Container holding the textareas.
 * @param {string} name - Exact `aria-label` to find.
 *
 * @returns {HTMLTextAreaElement} First matching textarea.
 *
 * @throws {Error} When no textarea has the requested label.
 */
function area(host: HTMLElement, name: string): HTMLTextAreaElement {
  const found: HTMLTextAreaElement | undefined = Array.from(host.querySelectorAll('textarea')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No text area named ${name}`);
  return found;
}

describe('CwTextarea', () => {
  it('keeps the native attributes and a static invalid state', () => {
    /**
     * Class Host
     * @class Host
     *
     * @description
     * Test host exposing a readonly textarea and a textarea with static invalid state.
     */
    @Component({
      imports: [CwTextarea],
      template: `
        <textarea cwTextarea aria-label="Description" maxlength="5000" rows="3" readonly></textarea>
        <textarea
          cwTextarea
          aria-label="Motif du blocage"
          aria-invalid="true"
          [autoResize]="false"
        ></textarea>
      `,
    })
    class Host {}

    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const description: HTMLTextAreaElement = area(host, 'Description');

    expect(description.maxLength).toBe(5000);
    expect(description.rows).toBe(3);
    expect(description.readOnly).toBe(true);
    expect(description.hasAttribute('aria-invalid')).toBe(false);
    expect(area(host, 'Motif du blocage').getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps the native value accessor of a reactive form and reports invalid once touched', async () => {
    /**
     * Class ReactiveHost
     * @class ReactiveHost
     *
     * @description
     * Test host binding a required reactive form control to the textarea.
     */
    @Component({
      imports: [CwTextarea, ReactiveFormsModule],
      template: `<textarea
        cwTextarea
        [formControl]="reason"
        aria-label="Motif du blocage"
      ></textarea>`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property reason
       * @readonly
       *
       * @description
       * Required non-nullable text control used to verify the native value accessor.
       *
       * @type {FormControl<string>}
       */
      public readonly reason: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      });
      // #endregion
    }

    const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const reason: HTMLTextAreaElement = area(
      fixture.nativeElement as HTMLElement,
      'Motif du blocage',
    );

    reason.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(reason.getAttribute('aria-invalid')).toBe('true');

    reason.value = 'En attente de la revue de sécurité.';
    reason.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.reason.value).toBe('En attente de la revue de sécurité.');
    expect(reason.hasAttribute('aria-invalid')).toBe(false);
  });

  it('works with Signal Forms on the native element', async () => {
    /**
     * Class SignalHost
     * @class SignalHost
     *
     * @description
     * Test host binding a required Signal Forms description field to the textarea.
     */
    @Component({
      imports: [CwTextarea, FormField],
      template: `<textarea
        cwTextarea
        [formField]="task.description"
        aria-label="Description"
      ></textarea>`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Writable model carrying the description edited by the textarea.
       *
       * @type {WritableSignal<{ description: string }>}
       */
      public readonly model: WritableSignal<{ description: string }> = signal({ description: '' });

      /**
       * Property task
       * @readonly
       *
       * @description
       * Signal Forms tree that marks the model's description as required.
       *
       * @type {FieldTree<{ description: string }>}
       */
      public readonly task: FieldTree<{ description: string }> = form(this.model, (path) => {
        required(path.description);
      });
      // #endregion
    }

    const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const description: HTMLTextAreaElement = area(
      fixture.nativeElement as HTMLElement,
      'Description',
    );

    description.value = 'Forcer UTF-8 avec BOM.';
    description.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().description).toBe('Forcer UTF-8 avec BOM.');
  });
});
