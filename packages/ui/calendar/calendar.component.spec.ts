import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';

import { CwCalendar } from './calendar.component';
import type { CwCalendarMode, CwCalendarSelection, CwDateDisabledFn } from './calendar.types';

function day(host: HTMLElement, name: string): HTMLButtonElement {
  const found = host.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);
  if (!found) throw new Error(`No day named ${name}`);
  return found;
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

function grid(host: HTMLElement): HTMLTableElement {
  const found = host.querySelector<HTMLTableElement>('[role="grid"]');
  if (!found) throw new Error('No grid');
  return found;
}

function press(target: HTMLElement, key: string, shiftKey = false): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
}

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
  readonly mode = signal<CwCalendarMode>('single');
  readonly selected = signal<CwCalendarSelection>(null);
  readonly month = signal<Date | null>(new Date(2026, 10, 1));
  readonly min = signal<Date | undefined>(undefined);
  readonly weekNumbers = signal(false);
  readonly caption = signal<'label' | 'dropdown'>('label');
  // Mockup "Réglages de l'instance": 1 and 11 November are public holidays.
  readonly holidays: CwDateDisabledFn = (date) =>
    date.getMonth() === 10 && [1, 11].includes(date.getDate());
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
    const headers = Array.from(host.querySelectorAll('th')).map((th) => th.textContent.trim());
    expect(headers).toEqual(['lu', 'ma', 'me', 'je', 've', 'sa', 'di']);
    // 1 November 2026 is a Sunday: the grid opens on Monday 26 October.
    expect(host.querySelector('tbody button')?.getAttribute('aria-label')).toBe('26 octobre 2026');
    expect(host.querySelectorAll('tbody tr')).toHaveLength(6);
  });

  it('selects one day in single mode and makes it the tab stop', async () => {
    const target = day(host, '18 novembre 2026');
    target.click();
    await fixture.whenStable();

    const selected = component.selected();
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

    const weeks = Array.from(host.querySelectorAll('tbody tr')).map((row) =>
      row.querySelector('td')?.textContent.trim(),
    );
    expect(weeks).toEqual(['44', '45', '46', '47', '48', '49']);

    const year = host.querySelector<HTMLSelectElement>('select[aria-label="Année"]');
    if (!year) throw new Error('No year list');
    year.value = '2027';
    year.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(grid(host).getAttribute('aria-label')).toBe('novembre 2027');
  });

  it('is the value accessor of a reactive form control', async () => {
    @Component({
      imports: [CwCalendar, ReactiveFormsModule],
      template: `<cw-calendar [formControl]="due" />`,
    })
    class ReactiveHost {
      readonly due = new FormControl<Date | null>(new Date(2026, 10, 18));
    }

    const reactive = TestBed.createComponent(ReactiveHost);
    reactive.autoDetectChanges();
    await reactive.whenStable();
    const element = reactive.nativeElement as HTMLElement;

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
    @Component({
      imports: [CwCalendar, FormField],
      template: `<cw-calendar [formField]="sprint.start" />`,
    })
    class SignalHost {
      readonly model = signal<{ start: CwCalendarSelection }>({ start: new Date(2026, 10, 16) });
      readonly sprint = form(this.model);
    }

    const signalFixture = TestBed.createComponent(SignalHost);
    signalFixture.autoDetectChanges();
    await signalFixture.whenStable();
    const element = signalFixture.nativeElement as HTMLElement;

    expect(day(element, '16 novembre 2026').closest('td')?.getAttribute('aria-selected')).toBe(
      'true',
    );
    day(element, '23 novembre 2026').click();
    await signalFixture.whenStable();
    const start = signalFixture.componentInstance.model().start;
    expect(start instanceof Date && start.getDate()).toBe(23);
  });
});
