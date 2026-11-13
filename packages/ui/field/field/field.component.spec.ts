import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { CwInput } from '@cadenway/ui/input';

import { CwFieldContent } from '../field-content/field-content.component';
import { CwFieldDescription } from '../field-description/field-description.component';
import { CwFieldError } from '../field-error/field-error.component';
import { CwFieldLabel } from '../field-label/field-label.directive';
import { CwField } from './field.component';

function labelled(host: HTMLElement, name: string): HTMLElement {
  const label = Array.from(host.querySelectorAll('label')).find(
    (element) => element.textContent.trim() === name,
  );
  const control = label?.htmlFor ? host.querySelector<HTMLElement>(`#${label.htmlFor}`) : null;
  if (!control) throw new Error(`No control labelled ${name}`);
  return control;
}

function description(host: HTMLElement, control: HTMLElement): string {
  return (control.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter((id) => id !== '')
    .map((id) => host.querySelector(`#${id}`)?.textContent.trim() ?? '')
    .join(' | ');
}

describe('CwField', () => {
  it('wires the label, the description and, once touched and invalid, the error', async () => {
    @Component({
      imports: [
        CwField,
        CwFieldLabel,
        CwFieldDescription,
        CwFieldError,
        CwInput,
        ReactiveFormsModule,
      ],
      template: `
        <cw-field>
          <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -- cw-field sets its for -->
          <label cwFieldLabel>Préfixe des identifiants</label>
          <input cwInput [formControl]="prefix" />
          <cw-field-description>2 à 6 lettres majuscules.</cw-field-description>
          <cw-field-error [errors]="prefix.errors" [messages]="messages" />
        </cw-field>
      `,
    })
    class Host {
      readonly prefix = new FormControl('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      });
      readonly messages = { required: 'Indiquez un préfixe.' };
    }

    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const prefix = labelled(host, 'Préfixe des identifiants');
    const field = prefix.closest('cw-field');

    expect(description(host, prefix)).toBe('2 à 6 lettres majuscules.');
    expect(field?.hasAttribute('data-invalid')).toBe(false);

    prefix.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(field?.getAttribute('data-invalid')).toBe('true');
    expect(prefix.getAttribute('aria-invalid')).toBe('true');
    expect(description(host, prefix)).toBe('2 à 6 lettres majuscules. | Indiquez un préfixe.');

    fixture.componentInstance.prefix.disable();
    await fixture.whenStable();
    expect(field?.getAttribute('data-disabled')).toBe('true');
  });

  it('keeps the ids and the label of the consumer, and forces the error state', async () => {
    @Component({
      imports: [CwField, CwFieldLabel, CwFieldError, CwInput],
      template: `
        <cw-field [invalid]="taken()">
          <label cwFieldLabel for="space-prefix">Préfixe</label>
          <input cwInput id="space-prefix" aria-describedby="prefix-hint" />
          <p id="prefix-hint">Utilisé dans CAD-482.</p>
          <cw-field-error>Ce préfixe est déjà utilisé par l'espace « Plateforme ».</cw-field-error>
        </cw-field>
      `,
    })
    class Host {
      readonly taken = signal(false);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const prefix = labelled(host, 'Préfixe');

    expect(prefix.id).toBe('space-prefix');
    expect(description(host, prefix)).toBe('Utilisé dans CAD-482.');

    fixture.componentInstance.taken.set(true);
    await fixture.whenStable();

    expect(prefix.getAttribute('aria-invalid')).toBe('true');
    expect(description(host, prefix)).toBe(
      "Utilisé dans CAD-482. | Ce préfixe est déjà utilisé par l'espace « Plateforme ».",
    );

    fixture.componentInstance.taken.set(false);
    await fixture.whenStable();
    expect(prefix.hasAttribute('aria-invalid')).toBe(false);
  });

  it('shows the message of a Signal Forms error', async () => {
    @Component({
      imports: [CwField, CwFieldLabel, CwFieldError, CwInput, FormField],
      template: `
        <cw-field>
          <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -- cw-field sets its for -->
          <label cwFieldLabel>Nom</label>
          <input cwInput [formField]="space.name" />
          <cw-field-error [errors]="space.name().errors()" />
        </cw-field>
      `,
    })
    class Host {
      readonly model = signal({ name: '' });
      readonly space = form(this.model, (path) => {
        required(path.name, { message: "Donnez un nom à l'espace." });
      });
    }

    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const name = labelled(host, 'Nom');

    name.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(name.closest('cw-field')?.getAttribute('data-invalid')).toBe('true');
    expect(description(host, name)).toBe("Donnez un nom à l'espace.");
  });

  it('names a control a label cannot point at through aria-labelledby', async () => {
    @Component({
      imports: [CwField, CwFieldContent, CwFieldLabel, CwFieldDescription],
      template: `
        <cw-field orientation="horizontal">
          <cw-field-content>
            <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -- cw-field sets its for -->
            <label cwFieldLabel>Vue par défaut</label>
            <cw-field-description>Ouverte en premier.</cw-field-description>
          </cw-field-content>
          <div role="radiogroup"></div>
        </cw-field>
      `,
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const group = host.querySelector<HTMLElement>('[role="radiogroup"]');
    const labelId = group?.getAttribute('aria-labelledby') ?? '';

    expect(host.querySelector(`#${labelId}`)?.textContent.trim()).toBe('Vue par défaut');
    expect(group && description(host, group)).toBe('Ouverte en premier.');
    expect(group?.closest('cw-field')?.getAttribute('data-orientation')).toBe('horizontal');
  });
});
