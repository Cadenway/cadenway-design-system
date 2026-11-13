import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwInputOtpGroup } from './input-otp-group/input-otp-group.component';
import { CwInputOtpSeparator } from './input-otp-separator/input-otp-separator.component';
import { CwInputOtpSlot } from './input-otp-slot/input-otp-slot.component';
import { CwInputOtp } from './input-otp.component';

const FORM_IMPORTS = [CwInputOtp, CwInputOtpGroup, CwInputOtpSlot];
const IMPORTS = [...FORM_IMPORTS, CwInputOtpSeparator];

function field(host: HTMLElement, name: string): HTMLInputElement {
  const found = host.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`);
  if (!found) throw new Error(`No field named ${name}`);
  return found;
}

/** The characters the boxes show, read from the rendered field. */
function shown(input: HTMLInputElement): string {
  return (input.parentElement?.textContent ?? '').replace(/\s/g, '');
}

function type(input: HTMLInputElement, text: string): void {
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

function paste(input: HTMLInputElement, text: string): void {
  const event = new Event('paste', { cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
  input.dispatchEvent(event);
}

@Component({
  imports: IMPORTS,
  template: `
    <cw-input-otp
      ariaLabel="Code de vérification"
      [(value)]="code"
      (complete)="completed.set($event)"
    >
      <cw-input-otp-group>
        @for (index of [0, 1, 2]; track index) {
          <cw-input-otp-slot [index]="index" />
        }
      </cw-input-otp-group>
      <cw-input-otp-separator />
      <cw-input-otp-group>
        @for (index of [3, 4, 5]; track index) {
          <cw-input-otp-slot [index]="index" />
        }
      </cw-input-otp-group>
    </cw-input-otp>
    <cw-input-otp
      ariaLabel="Code de récupération"
      length="8"
      charset="alphanumeric"
      [(value)]="recovery"
    >
      <cw-input-otp-group>
        @for (index of [0, 1, 2, 3]; track index) {
          <cw-input-otp-slot [index]="index" />
        }
      </cw-input-otp-group>
      <cw-input-otp-separator />
      <cw-input-otp-group>
        @for (index of [4, 5, 6, 7]; track index) {
          <cw-input-otp-slot [index]="index" />
        }
      </cw-input-otp-group>
    </cw-input-otp>
  `,
})
class ModelHost {
  readonly code = signal('');
  readonly recovery = signal('');
  readonly completed = signal<string | null>(null);
}

describe('CwInputOtp', () => {
  describe('with models', () => {
    let host: HTMLElement;
    let component: ModelHost;
    let fixture: ComponentFixture<ModelHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(ModelHost);
      fixture.autoDetectChanges();
      host = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;
    });

    it('is one native one-time-code input named by its label', () => {
      const code = field(host, 'Code de vérification');

      expect(host.querySelectorAll('input')).toHaveLength(2);
      expect(code.getAttribute('autocomplete')).toBe('one-time-code');
      expect(code.getAttribute('inputmode')).toBe('numeric');
      expect(code.getAttribute('maxlength')).toBe('6');
    });

    it('keeps digits only, shows them in the boxes and emits complete once full', async () => {
      const code = field(host, 'Code de vérification');

      type(code, '4a8');
      await fixture.whenStable();
      expect(component.code()).toBe('48');
      expect(code.value).toBe('48');
      expect(shown(code)).toBe('48');
      expect(component.completed()).toBeNull();

      type(code, '482913');
      await fixture.whenStable();
      expect(component.completed()).toBe('482913');
      expect(shown(code)).toBe('482913');
    });

    it('pastes a whole code, ignoring refused characters', async () => {
      const code = field(host, 'Code de vérification');

      paste(code, '482 913');
      await fixture.whenStable();

      expect(component.code()).toBe('482913');
      expect(component.completed()).toBe('482913');
    });

    it('replaces the character under the caret instead of inserting before it', async () => {
      const code = field(host, 'Code de vérification');
      component.code.set('482913');
      await fixture.whenStable();

      code.setSelectionRange(1, 1);
      code.dispatchEvent(
        new InputEvent('beforeinput', { inputType: 'insertText', data: '7', cancelable: true }),
      );
      await fixture.whenStable();

      expect(component.code()).toBe('472913');
    });

    it('upper-cases an alphanumeric recovery code', async () => {
      const recovery = field(host, 'Code de récupération');

      type(recovery, 'k7q-m2xpa');
      await fixture.whenStable();

      expect(component.recovery()).toBe('K7QM2XPA');
      expect(recovery.getAttribute('inputmode')).toBe('text');
    });
  });

  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    @Component({
      imports: [...FORM_IMPORTS, ReactiveFormsModule],
      template: `
        <cw-input-otp ariaLabel="Code" [formControl]="code">
          <cw-input-otp-group>
            @for (index of [0, 1, 2, 3, 4, 5]; track index) {
              <cw-input-otp-slot [index]="index" />
            }
          </cw-input-otp-group>
        </cw-input-otp>
      `,
    })
    class ReactiveHost {
      readonly code = new FormControl('', {
        nonNullable: true,
        validators: [(control) => Validators.minLength(6)(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const code = field(host, 'Code');

    fixture.componentInstance.code.setValue('123456');
    await fixture.whenStable();
    expect(code.value).toBe('123456');

    type(code, '12');
    code.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.code.value).toBe('12');
    expect(code.getAttribute('aria-invalid')).toBe('true');

    fixture.componentInstance.code.disable();
    await fixture.whenStable();
    expect(code.disabled).toBe(true);
  });

  it('is a Signal Forms value control', async () => {
    @Component({
      imports: [...FORM_IMPORTS, FormField],
      template: `
        <cw-input-otp ariaLabel="Code" [formField]="mfa.code">
          <cw-input-otp-group>
            @for (index of [0, 1, 2, 3, 4, 5]; track index) {
              <cw-input-otp-slot [index]="index" />
            }
          </cw-input-otp-group>
        </cw-input-otp>
      `,
    })
    class SignalHost {
      readonly model = signal({ code: '' });
      readonly mfa = form(this.model, (path) => {
        required(path.code);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const code = field(host, 'Code');

    type(code, '482913');
    await fixture.whenStable();
    expect(fixture.componentInstance.model().code).toBe('482913');

    fixture.componentInstance.model.set({ code: '91' });
    await fixture.whenStable();
    expect(shown(code)).toBe('91');
  });
});
