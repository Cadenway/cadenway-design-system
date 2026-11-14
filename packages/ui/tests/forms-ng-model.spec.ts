import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CwCalendar } from '../components/calendar/calendar.component';
import { CwCheckbox } from '../components/checkbox/checkbox.component';
import { CwCombobox } from '../components/combobox/combobox.component';
import { CwComboboxOption } from '../components/combobox/combobox-option/combobox-option.component';
import { CwDatePicker } from '../components/date-picker/date-picker.component';
import { CwInlineEdit } from '../components/inline-edit/inline-edit.component';
import { CwInputOtp } from '../components/input-otp/input-otp.component';
import { CwInput } from '../components/input/input.directive';
import { CwQuestionnaireChoice } from '../components/questionnaire/questionnaire-choice/questionnaire-choice.component';
import { CwQuestionnaireQuestion } from '../components/questionnaire/questionnaire-question/questionnaire-question.component';
import { CwRadioGroup } from '../components/radio-group/radio-group.component';
import { CwRadioGroupItem } from '../components/radio-group/radio-group-item/radio-group-item.component';
import { CwSelect } from '../components/select/select.component';
import { CwSelectOption } from '../components/select/select-option/select-option.component';
import { CwSwitch } from '../components/switch/switch.component';
import { CwTextarea } from '../components/textarea/textarea.directive';
import { CwToggleGroup } from '../components/toggle-group/toggle-group.component';
import { CwToggleGroupItem } from '../components/toggle-group/toggle-group-item/toggle-group-item.component';

/**
 * Interface Values
 *
 * @description
 * Values supplied to the template-driven form controls.
 */
interface Values {
  // #region Properties
  /**
   * Property checkbox
   *
   * @description
   * Checkbox value.
   *
   * @type {boolean}
   */
  checkbox: boolean;

  /**
   * Property switch
   *
   * @description
   * Switch value.
   *
   * @type {boolean}
   */
  switch: boolean;

  /**
   * Property radio
   *
   * @description
   * Radio group value.
   *
   * @type {string | null}
   */
  radio: string | null;

  /**
   * Property toggle
   *
   * @description
   * Toggle group value.
   *
   * @type {string | null}
   */
  toggle: string | null;

  /**
   * Property select
   *
   * @description
   * Select value.
   *
   * @type {string | null}
   */
  select: string | null;

  /**
   * Property combobox
   *
   * @description
   * Combobox value.
   *
   * @type {string | null}
   */
  combobox: string | null;

  /**
   * Property calendar
   *
   * @description
   * Calendar value.
   *
   * @type {Date | null}
   */
  calendar: Date | null;

  /**
   * Property date
   *
   * @description
   * Date picker value.
   *
   * @type {Date | null}
   */
  date: Date | null;

  /**
   * Property otp
   *
   * @description
   * One-time code value.
   *
   * @type {string}
   */
  otp: string;

  /**
   * Property inline
   *
   * @description
   * Inline-edit value.
   *
   * @type {string}
   */
  inline: string;

  /**
   * Property question
   *
   * @description
   * Questionnaire answer.
   *
   * @type {string | null}
   */
  question: string | null;

  /**
   * Property text
   *
   * @description
   * Native text input value.
   *
   * @type {string}
   */
  text: string;

  /**
   * Property description
   *
   * @description
   * Native textarea value.
   *
   * @type {string}
   */
  description: string;
  // #endregion
}

/**
 * Component NgModelHost
 *
 * @description
 * Exercises template-driven bindings on the interactive field components.
 */
@Component({
  imports: [
    FormsModule,
    CwCalendar,
    CwCheckbox,
    CwCombobox,
    CwComboboxOption,
    CwDatePicker,
    CwInlineEdit,
    CwInputOtp,
    CwInput,
    CwQuestionnaireQuestion,
    CwQuestionnaireChoice,
    CwRadioGroup,
    CwRadioGroupItem,
    CwSelect,
    CwSelectOption,
    CwSwitch,
    CwTextarea,
    CwToggleGroup,
    CwToggleGroupItem,
  ],
  template: `
    <cw-checkbox data-test="checkbox" [(ngModel)]="values.checkbox" ariaLabel="Checkbox" />
    <cw-switch data-test="switch" [(ngModel)]="values.switch" ariaLabel="Switch" />
    <cw-radio-group data-test="radio" [(ngModel)]="values.radio" ariaLabel="Radio">
      <cw-radio-group-item value="a">A</cw-radio-group-item>
      <cw-radio-group-item value="b">B</cw-radio-group-item>
    </cw-radio-group>
    <cw-toggle-group data-test="toggle" [(ngModel)]="values.toggle" ariaLabel="Toggle">
      <button cwToggleGroupItem value="a">A</button>
      <button cwToggleGroupItem value="b">B</button>
    </cw-toggle-group>
    <cw-select data-test="select" [(ngModel)]="values.select" ariaLabel="Select">
      <cw-select-option value="a">A</cw-select-option>
      <cw-select-option value="b">B</cw-select-option>
    </cw-select>
    <cw-combobox data-test="combobox" [(ngModel)]="values.combobox" ariaLabel="Combobox">
      <cw-combobox-option value="a">A</cw-combobox-option>
      <cw-combobox-option value="b">B</cw-combobox-option>
    </cw-combobox>
    <cw-calendar data-test="calendar" [(ngModel)]="values.calendar" />
    <cw-date-picker data-test="date" [(ngModel)]="values.date" ariaLabel="Date" />
    <cw-input-otp data-test="otp" [(ngModel)]="values.otp" ariaLabel="Code" />
    <cw-inline-edit data-test="inline" [(ngModel)]="values.inline" ariaLabel="Name" />
    <fieldset cwQuestionnaireQuestion data-test="question" [(ngModel)]="values.question">
      <label cwQuestionnaireChoice value="a">A</label>
      <label cwQuestionnaireChoice value="b">B</label>
    </fieldset>
    <input cwInput data-test="text" [(ngModel)]="values.text" aria-label="Text" />
    <textarea
      cwTextarea
      data-test="description"
      [(ngModel)]="values.description"
      aria-label="Description"
    ></textarea>
  `,
})
class NgModelHost {
  // #region Properties
  /**
   * Property values
   *
   * @description
   * Values synchronized with the controls in the fixture.
   *
   * @type {Values}
   */
  public values: Values = {
    checkbox: true,
    switch: true,
    radio: 'a',
    toggle: 'a',
    select: 'a',
    combobox: 'a',
    calendar: new Date(2026, 10, 12),
    date: new Date(2026, 10, 12),
    otp: '123',
    inline: 'Initial',
    question: 'a',
    text: 'Initial',
    description: 'Initial',
  };
  // #endregion
}

/**
 * Function model
 *
 * @description
 * Finds the template-driven control associated with a named field.
 *
 * @param {ComponentFixture<NgModelHost>} fixture - Fixture containing the controls.
 * @param {string} name - Test identifier of the control.
 * @returns {NgModel} Angular form directive for the field.
 */
function model(fixture: ComponentFixture<NgModelHost>, name: string): NgModel {
  return fixture.debugElement.query(By.css(`[data-test="${name}"]`)).injector.get(NgModel);
}

describe('template-driven field compatibility', () => {
  it('writes initial and updated values to every custom control', async () => {
    const fixture: ComponentFixture<NgModelHost> = TestBed.createComponent(NgModelHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve));
    await fixture.whenStable();

    for (const name of [
      'checkbox',
      'switch',
      'radio',
      'toggle',
      'select',
      'combobox',
      'calendar',
      'date',
      'otp',
      'inline',
      'question',
    ]) {
      const control: NgModel = model(fixture, name);
      expect(control.valueAccessor).toBeTruthy();
      expect(control.control.value).toEqual(fixture.componentInstance.values[name as keyof Values]);
      const accessor: { value?: () => unknown; checked?: () => boolean } =
        control.valueAccessor as {
          value?: () => unknown;
          checked?: () => boolean;
        };
      expect(
        name === 'checkbox' || name === 'switch' ? accessor.checked?.() : accessor.value?.(),
      ).toEqual(fixture.componentInstance.values[name as keyof Values]);
    }

    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const checkbox: HTMLButtonElement | null = host.querySelector('[data-test="checkbox"] button');
    const switchButton: HTMLButtonElement | null = host.querySelector(
      '[data-test="switch"] button',
    );
    expect(checkbox?.getAttribute('aria-checked')).toBe('true');
    expect(switchButton?.getAttribute('aria-checked')).toBe('true');
    checkbox?.click();
    switchButton?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.values.checkbox).toBe(false);
    expect(fixture.componentInstance.values.switch).toBe(false);

    const radio: HTMLButtonElement | null = host.querySelector(
      '[data-test="radio"] cw-radio-group-item:last-child button',
    );
    const toggle: HTMLButtonElement | null = host.querySelector(
      '[data-test="toggle"] button:last-child',
    );
    expect(radio).toBeTruthy();
    expect(toggle).toBeTruthy();
    radio?.click();
    toggle?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.values.radio).toBe('b');
    expect(fixture.componentInstance.values.toggle).toBe('b');

    const choice: HTMLInputElement | null = host.querySelector(
      '[data-test="question"] input[value="b"]',
    );
    expect(choice).toBeTruthy();
    choice?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.values.question).toBe('b');

    const text: HTMLInputElement | null = host.querySelector('[data-test="text"]');
    const description: HTMLTextAreaElement | null = host.querySelector('[data-test="description"]');
    if (!text || !description) throw new Error('Native fields missing');
    text.value = 'Updated';
    description.value = 'Updated';
    text.dispatchEvent(new Event('input'));
    description.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.values.text).toBe('Updated');
    expect(fixture.componentInstance.values.description).toBe('Updated');

    checkbox?.dispatchEvent(new FocusEvent('blur'));
    expect(model(fixture, 'checkbox').touched).toBe(true);

    const updates: readonly { name: keyof Values; value: unknown }[] = [
      { name: 'checkbox', value: true },
      { name: 'switch', value: true },
      { name: 'radio', value: 'a' },
      { name: 'toggle', value: 'a' },
      { name: 'select', value: 'b' },
      { name: 'combobox', value: 'b' },
      { name: 'calendar', value: new Date(2026, 10, 14) },
      { name: 'date', value: new Date(2026, 10, 14) },
      { name: 'otp', value: '456' },
      { name: 'inline', value: 'Changed' },
      { name: 'question', value: 'a' },
    ];
    for (const update of updates) model(fixture, update.name).control.setValue(update.value);
    await fixture.whenStable();
    for (const update of updates) {
      const accessor: { value?: () => unknown; checked?: () => boolean } = model(
        fixture,
        update.name,
      ).valueAccessor as { value?: () => unknown; checked?: () => boolean };
      expect(
        update.name === 'checkbox' || update.name === 'switch'
          ? accessor.checked?.()
          : accessor.value?.(),
      ).toEqual(update.value);
    }
    expect(host.querySelector<HTMLInputElement>('[data-test="otp"] input')?.value).toBe('456');
    for (const name of [
      'checkbox',
      'switch',
      'radio',
      'toggle',
      'select',
      'combobox',
      'calendar',
      'date',
      'otp',
      'inline',
      'question',
    ]) {
      model(fixture, name).control.disable();
    }
    await fixture.whenStable();
    for (const name of [
      'checkbox',
      'switch',
      'radio',
      'toggle',
      'select',
      'combobox',
      'calendar',
      'date',
      'otp',
      'inline',
      'question',
    ]) {
      const controls: NodeListOf<HTMLInputElement | HTMLButtonElement> = host.querySelectorAll(
        `[data-test="${name}"] button, [data-test="${name}"] input`,
      );
      expect(controls.length).toBeGreaterThan(0);
      expect(Array.from(controls).every((control) => control.disabled)).toBe(true);
    }
    fixture.destroy();
  });
});
