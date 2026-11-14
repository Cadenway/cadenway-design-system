import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, type FieldTree } from '@angular/forms/signals';

import { CwCalendar } from './calendar.component';
import type { CwCalendarMode, CwCalendarSelection, CwDateDisabledFn } from './calendar.types';

/**
 * Function day
 *
 * @description
 * Finds a day button by its accessible name.
 *
 * @param {HTMLElement} host - Fixture containing the calendar.
 * @param {string} name - Accessible day label.
 * @returns {HTMLButtonElement} Matching day button.
 */
function day(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | null = host.querySelector<HTMLButtonElement>(
    `button[aria-label="${name}"]`,
  );
  if (!found) throw new Error(`No day named ${name}`);
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a calendar control by its accessible label.
 *
 * @param {HTMLElement} host - Fixture containing the calendar.
 * @param {string} name - Accessible button label.
 * @returns {HTMLButtonElement} Matching button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element: HTMLButtonElement) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function grid
 *
 * @description
 * Finds the calendar grid in the fixture.
 *
 * @param {HTMLElement} host - Fixture containing the calendar.
 * @returns {HTMLTableElement} Calendar grid.
 */
function grid(host: HTMLElement): HTMLTableElement {
  const found: HTMLTableElement | null = host.querySelector<HTMLTableElement>('[role="grid"]');
  if (!found) throw new Error('No grid');
  return found;
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to a calendar element.
 *
 * @param {HTMLElement} target - Element receiving the event.
 * @param {string} key - Keyboard key to dispatch.
 * @param {boolean} shiftKey - Whether Shift is held.
 */
function press(target: HTMLElement, key: string, shiftKey: boolean = false): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
}

/**
 * Component Host
 *
 * @description
 * Hosts a model-driven calendar with configurable selection and display inputs.
 */
@Component({
  imports: [CwCalendar],
  template: `
    <cw-calendar
      [mode]="mode()"
      [(selected)]="selected"
      [(month)]="month"
      [min]="min()"
      [disabledDates]="holidays"
      [showWeekNumbers]="weekNumbers()"
      [captionLayout]="caption()"
    />
  `,
})
class Host {
  // #region Properties
  /**
   * Property mode
   *
   * @description
   * Selection mode used by the fixture.
   *
   * @type {WritableSignal<CwCalendarMode>}
   * @readonly
   */
  public readonly mode: WritableSignal<CwCalendarMode> = signal<CwCalendarMode>('single');

  /**
   * Property selected
   *
   * @description
   * Calendar selection controlled by the fixture.
   *
   * @type {WritableSignal<CwCalendarSelection>}
   * @readonly
   */
  public readonly selected: WritableSignal<CwCalendarSelection> = signal<CwCalendarSelection>(null);

  /**
   * Property month
   *
   * @description
   * Displayed calendar month.
   *
   * @type {WritableSignal<Date | null>}
   * @readonly
   */
  public readonly month: WritableSignal<Date | null> = signal<Date | null>(new Date(2026, 10, 1));

  /**
   * Property min
   *
   * @description
   * Optional earliest selectable day.
   *
   * @type {WritableSignal<Date | undefined>}
   * @readonly
   */
  public readonly min: WritableSignal<Date | undefined> = signal<Date | undefined>(undefined);

  /**
   * Property weekNumbers
   *
   * @description
   * Controls the ISO week-number column.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly weekNumbers: WritableSignal<boolean> = signal(false);

  /**
   * Property caption
   *
   * @description
   * Controls the calendar caption layout.
   *
   * @type {WritableSignal<'label' | 'dropdown'>}
   * @readonly
   */
  public readonly caption: WritableSignal<'label' | 'dropdown'> = signal<'label' | 'dropdown'>(
    'label',
  );
  // Mockup "Réglages de l'instance": 1 and 11 November are public holidays.
  /**
   * Property holidays
   *
   * @description
   * Disables the November holidays used in the fixture.
   *
   * @type {CwDateDisabledFn}
   * @readonly
   */
  public readonly holidays: CwDateDisabledFn = (date: Date) =>
    date.getMonth() === 10 && [1, 11].includes(date.getDate());
  // #endregion
}

describe('CwCalendar', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('draws a French month grid that starts on Monday', () => {
    expect(grid(host).getAttribute('aria-label')).toBe('novembre 2026');
    const headers: string[] = Array.from(host.querySelectorAll('th')).map(
      (th: HTMLTableCellElement) => th.textContent.trim(),
    );
    expect(headers).toEqual(['lu', 'ma', 'me', 'je', 've', 'sa', 'di']);
    // 1 November 2026 is a Sunday: the grid opens on Monday 26 October.
    expect(host.querySelector('tbody button')?.getAttribute('aria-label')).toBe('26 octobre 2026');
    expect(host.querySelectorAll('tbody tr')).toHaveLength(6);
  });

  it('selects one day in single mode and makes it the tab stop', async () => {
    const target: HTMLButtonElement = day(host, '18 novembre 2026');
    target.click();
    await fixture.whenStable();

    const selected: CwCalendarSelection = component.selected();
    expect(selected instanceof Date && selected.getDate()).toBe(18);
    expect(target.closest('td')?.getAttribute('aria-selected')).toBe('true');
    expect(target.getAttribute('tabindex')).toBe('0');
    expect(day(host, '17 novembre 2026').getAttribute('tabindex')).toBe('-1');
  });

  it('selects a range: start, then end, the days between are selected too', async () => {
    component.mode.set('range');
    await fixture.whenStable();

    day(host, '27 novembre 2026').click();
    await fixture.whenStable();
    expect(component.selected()).toEqual({ start: new Date(2026, 10, 27), end: null });

    // An earlier second pick becomes the start.
    day(host, '16 novembre 2026').click();
    await fixture.whenStable();
    expect(component.selected()).toEqual({
      start: new Date(2026, 10, 16),
      end: new Date(2026, 10, 27),
    });
    expect(day(host, '20 novembre 2026').closest('td')?.getAttribute('aria-selected')).toBe('true');
    expect(day(host, '20 novembre 2026').hasAttribute('data-range-middle')).toBe(true);
    expect(day(host, '28 novembre 2026').closest('td')?.getAttribute('aria-selected')).toBe(
      'false',
    );
  });

  it('disables the holidays and the days before min', async () => {
    component.min.set(new Date(2026, 10, 5));
    await fixture.whenStable();

    expect(day(host, '11 novembre 2026').disabled).toBe(true);
    expect(day(host, '4 novembre 2026').disabled).toBe(true);
    expect(day(host, '5 novembre 2026').disabled).toBe(false);
    expect(button(host, 'Mois précédent').disabled).toBe(true);
  });

  it('moves between months with the header buttons', async () => {
    button(host, 'Mois suivant').click();
    await fixture.whenStable();

    expect(component.month()?.getMonth()).toBe(11);
    expect(grid(host).getAttribute('aria-label')).toBe('décembre 2026');
  });

  it('moves the focus with the arrows, Home, End and the page keys', async () => {
    day(host, '18 novembre 2026').click();
    await fixture.whenStable();
    day(host, '18 novembre 2026').focus();

    press(document.activeElement as HTMLElement, 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('19 novembre 2026');

    press(document.activeElement as HTMLElement, 'ArrowUp');
    await fixture.whenStable();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('12 novembre 2026');

    // The arrows skip the disabled 11 November.
    press(document.activeElement as HTMLElement, 'ArrowLeft');
    await fixture.whenStable();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('10 novembre 2026');

    press(document.activeElement as HTMLElement, 'Home');
    await fixture.whenStable();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('9 novembre 2026');

    press(document.activeElement as HTMLElement, 'End');
    await fixture.whenStable();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('15 novembre 2026');

    press(document.activeElement as HTMLElement, 'PageDown');
    await fixture.whenStable();
    expect(grid(host).getAttribute('aria-label')).toBe('décembre 2026');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('15 décembre 2026');

    press(document.activeElement as HTMLElement, 'PageUp', true);
    await fixture.whenStable();
    expect(grid(host).getAttribute('aria-label')).toBe('décembre 2025');
  });

  it('shows ISO week numbers and the month and year lists', async () => {
    component.weekNumbers.set(true);
    component.caption.set('dropdown');
    await fixture.whenStable();

    const weeks: (string | undefined)[] = Array.from(host.querySelectorAll('tbody tr')).map(
      (row: Element) => row.querySelector('td')?.textContent.trim(),
    );
    expect(weeks).toEqual(['44', '45', '46', '47', '48', '49']);

    const year: HTMLSelectElement | null = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Année"]',
    );
    if (!year) throw new Error('No year list');
    year.value = '2027';
    year.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(grid(host).getAttribute('aria-label')).toBe('novembre 2027');
  });

  it('is the value accessor of a reactive form control', async () => {
    /**
     * Component ReactiveHost
     *
     * @description
     * Hosts a calendar bound to a reactive form control.
     */
    @Component({
      imports: [CwCalendar, ReactiveFormsModule],
      template: `<cw-calendar [formControl]="due" />`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property due
       *
       * @description
       * Form control bound to the selected date.
       *
       * @type {FormControl<Date | null>}
       * @readonly
       */
      public readonly due: FormControl<Date | null> = new FormControl<Date | null>(
        new Date(2026, 10, 18),
      );
      // #endregion
    }

    const reactive: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    reactive.autoDetectChanges();
    await reactive.whenStable();
    const element: HTMLElement = reactive.nativeElement as HTMLElement;

    expect(day(element, '18 novembre 2026').closest('td')?.getAttribute('aria-selected')).toBe(
      'true',
    );
    day(element, '20 novembre 2026').click();
    await reactive.whenStable();
    expect(reactive.componentInstance.due.value?.getDate()).toBe(20);

    reactive.componentInstance.due.disable();
    await reactive.whenStable();
    expect(day(element, '20 novembre 2026').disabled).toBe(true);
  });

  it('is a Signal Forms value control', async () => {
    /**
     * Component SignalHost
     *
     * @description
     * Hosts a calendar bound to a Signal Forms field.
     */
    @Component({
      imports: [CwCalendar, FormField],
      template: `<cw-calendar [formField]="sprint.start" />`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       *
       * @description
       * Model containing the selected start date.
       *
       * @type {WritableSignal<{ start: CwCalendarSelection }>}
       * @readonly
       */
      public readonly model: WritableSignal<{ start: CwCalendarSelection }> = signal<{
        start: CwCalendarSelection;
      }>({
        start: new Date(2026, 10, 16),
      });

      /**
       * Property sprint
       *
       * @description
       * Signal Forms field tree derived from the model.
       *
       * @type {FieldTree<{ start: CwCalendarSelection }>}
       * @readonly
       */
      public readonly sprint: FieldTree<{ start: CwCalendarSelection }> = form(this.model);
      // #endregion
    }

    const signalFixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    signalFixture.autoDetectChanges();
    await signalFixture.whenStable();
    const element: HTMLElement = signalFixture.nativeElement as HTMLElement;

    expect(day(element, '16 novembre 2026').closest('td')?.getAttribute('aria-selected')).toBe(
      'true',
    );
    day(element, '23 novembre 2026').click();
    await signalFixture.whenStable();
    const start: CwCalendarSelection = signalFixture.componentInstance.model().start;
    expect(start instanceof Date && start.getDate()).toBe(23);
  });
});
