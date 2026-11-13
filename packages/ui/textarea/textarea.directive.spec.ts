import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwTextarea } from './textarea.directive';

function area(host: HTMLElement, name: string): HTMLTextAreaElement {
  const found = Array.from(host.querySelectorAll('textarea')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No text area named ${name}`);
  return found;
}

describe('CwTextarea', () => {
  it('keeps the native attributes and a static invalid state', () => {
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

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const description = area(host, 'Description');

    expect(description.maxLength).toBe(5000);
    expect(description.rows).toBe(3);
    expect(description.readOnly).toBe(true);
    expect(description.hasAttribute('aria-invalid')).toBe(false);
    expect(area(host, 'Motif du blocage').getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps the native value accessor of a reactive form and reports invalid once touched', async () => {
    @Component({
      imports: [CwTextarea, ReactiveFormsModule],
      template: `<textarea
        cwTextarea
        [formControl]="reason"
        aria-label="Motif du blocage"
      ></textarea>`,
    })
    class ReactiveHost {
      readonly reason = new FormControl('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const reason = area(fixture.nativeElement as HTMLElement, 'Motif du blocage');

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
    @Component({
      imports: [CwTextarea, FormField],
      template: `<textarea
        cwTextarea
        [formField]="task.description"
        aria-label="Description"
      ></textarea>`,
    })
    class SignalHost {
      readonly model = signal({ description: '' });
      readonly task = form(this.model, (path) => {
        required(path.description);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const description = area(fixture.nativeElement as HTMLElement, 'Description');

    description.value = 'Forcer UTF-8 avec BOM.';
    description.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().description).toBe('Forcer UTF-8 avec BOM.');
  });
});
