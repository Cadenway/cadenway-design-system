import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';

import type { CwCalendarMode } from '@cadenway/ui/calendar';

import { CwDatePicker } from './date-picker.component';
import type { CwDatePickerValue, CwDatePickerVariant, CwDatePreset } from './date-picker.types';

function named(root: ParentNode, name: string, selector = 'button'): HTMLElement {
  const found = Array.from(root.querySelectorAll<HTMLElement>(selector)).find(
    (element) => element.getAttribute('aria-label') === name || element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

/* A preset is named by its label and the date it shows (« Demain jeu. 19 nov. »). */
function preset(panel: HTMLElement, label: string): HTMLElement {
  const found = Array.from(panel.querySelectorAll<HTMLElement>('button[aria-pressed]')).find(
    (button) => button.textContent.trim().startsWith(label),
  );
  if (!found) throw new Error(`No preset ${label}`);
  return found;
}

function dialog(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="dialog"]');
}

function press(target: Element, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

@Component({
  imports: [CwDatePicker],
  template: `
    <cw-date-picker
      ariaLabel="Échéance"
      [variant]="variant()"
      [mode]="mode()"
      [presets]="presets"
      [withTime]="withTime()"
      [(value)]="value"
      [(open)]="open"
    />
  `,
})
class Host {
  readonly variant = signal<CwDatePickerVariant>('button');
  readonly mode = signal<CwCalendarMode>('single');
  readonly withTime = signal(false);
  readonly value = signal<CwDatePickerValue>(null);
  readonly open = signal(false);
  // Mockup App.dc.html, QUICK_DATES: the consumer computes the dates.
  readonly presets: CwDatePreset[] = [
    { label: 'Demain', date: new Date(2026, 10, 19) },
    { label: 'Fin du sprint', date: new Date(2026, 10, 27) },
    { label: 'Sans échéance', date: null },
  ];
}

describe('CwDatePicker', () => {
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

  it('shows the placeholder and announces a dialog popup', () => {
    const trigger = named(host, 'Échéance, Choisir une date');
    expect(trigger.textContent.trim()).toBe('Choisir une date');
    expect(trigger.hasAttribute('data-placeholder')).toBe(true);
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on the picked day, picks a day, closes and gives the focus back', async () => {
    component.value.set(new Date(2026, 10, 18));
    await fixture.whenStable();
    const trigger = named(host, 'Échéance, mer. 18 nov. 2026');
    expect(trigger.textContent.trim()).toBe('mer. 18 nov. 2026');

    trigger.click();
    await fixture.whenStable();
    const panel = dialog();
    expect(panel?.getAttribute('aria-label')).toBe('Choisir une date');
    expect(component.open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('18 novembre 2026');

    if (!panel) throw new Error('No panel');
    named(panel, '20 novembre 2026').click();
    await fixture.whenStable();

    expect((component.value() as Date).getDate()).toBe(20);
    expect(dialog()).toBeNull();
    expect(component.open()).toBe(false);
    expect(document.activeElement).toBe(named(host, 'Échéance, ven. 20 nov. 2026'));
  });

  it('opens with ArrowDown and closes on Escape without changing the value', async () => {
    const trigger = named(host, 'Échéance, Choisir une date');
    press(trigger, 'ArrowDown');
    await fixture.whenStable();
    expect(dialog()).not.toBeNull();

    press(document.activeElement ?? document.body, 'Escape');
    await fixture.whenStable();
    expect(dialog()).toBeNull();
    expect(component.value()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('picks a preset, checks the current one and clears with « Sans échéance » or « Effacer »', async () => {
    component.open.set(true);
    await fixture.whenStable();
    const panel = dialog();
    if (!panel) throw new Error('No panel');
    expect(preset(panel, 'Sans échéance').getAttribute('aria-pressed')).toBe('true');
    expect(preset(panel, 'Demain').textContent).toContain('jeu. 19 nov.');

    preset(panel, 'Demain').click();
    await fixture.whenStable();
    expect((component.value() as Date).getDate()).toBe(19);

    named(host, 'Échéance, jeu. 19 nov. 2026').click();
    await fixture.whenStable();
    const reopened = dialog();
    if (!reopened) throw new Error('No panel');
    expect(preset(reopened, 'Demain').getAttribute('aria-pressed')).toBe('true');

    named(reopened, 'Effacer').click();
    await fixture.whenStable();
    expect(component.value()).toBeNull();
  });

  it('keeps the panel open until the end of a range', async () => {
    component.mode.set('range');
    component.open.set(true);
    await fixture.whenStable();
    const panel = dialog();
    if (!panel) throw new Error('No panel');
    // No preset in range mode.
    expect(panel.querySelector('button[aria-pressed]')).toBeNull();

    const month = panel.querySelector('[role="grid"]')?.getAttribute('aria-label');
    const year = Number(month?.split(' ')[1]);
    const name = month?.split(' ')[0] ?? '';
    named(panel, `16 ${name} ${String(year)}`).click();
    await fixture.whenStable();
    expect(dialog()).not.toBeNull();
    expect(component.value()).toBeNull();

    named(panel, `27 ${name} ${String(year)}`).click();
    await fixture.whenStable();
    expect(dialog()).toBeNull();
    const value = component.value();
    expect(value && !(value instanceof Date) && value.end.getDate()).toBe(27);
    // Date Picker sheet, "Variantes": « 16 nov. → 27 nov. 2026 ».
    expect(host.querySelector('button[aria-haspopup="dialog"]')?.textContent).toMatch(
      /^\s*16 \S+ → 27 \S+ \d{4}\s*$/,
    );
  });

  it('adds a time to the date', async () => {
    component.withTime.set(true);
    component.value.set(new Date(2026, 10, 18));
    component.open.set(true);
    await fixture.whenStable();
    const panel = dialog();
    if (!panel) throw new Error('No panel');

    named(panel, 'Ajouter une heure').click();
    await fixture.whenStable();
    const time = panel.querySelector<HTMLInputElement>('input[aria-label="Heure"]');
    if (!time) throw new Error('No time field');
    time.value = '14:30';
    time.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const value = component.value() as Date;
    expect([value.getDate(), value.getHours(), value.getMinutes()]).toEqual([18, 14, 30]);
  });

  it('parses a typed date and flags an invalid one', async () => {
    component.variant.set('input');
    await fixture.whenStable();
    const field = named(host, 'Échéance (jj/mm/aaaa)', 'input') as HTMLInputElement;

    field.value = '18/11/2026';
    field.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect((component.value() as Date).getMonth()).toBe(10);
    expect(field.hasAttribute('aria-invalid')).toBe(false);

    field.value = '31/02/2026';
    field.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(field.getAttribute('aria-invalid')).toBe('true');

    named(host, 'Ouvrir le calendrier').click();
    await fixture.whenStable();
    expect(dialog()).not.toBeNull();
  });

  it('is the value accessor of a reactive form control', async () => {
    @Component({
      imports: [CwDatePicker, ReactiveFormsModule],
      template: `<cw-date-picker ariaLabel="Début" [formControl]="start" />`,
    })
    class ReactiveHost {
      readonly start = new FormControl<Date | null>(new Date(2026, 10, 16));
    }

    const reactive = TestBed.createComponent(ReactiveHost);
    reactive.autoDetectChanges();
    await reactive.whenStable();
    const element = reactive.nativeElement as HTMLElement;
    const trigger = named(element, 'Début, lun. 16 nov. 2026');

    trigger.click();
    await reactive.whenStable();
    const panel = dialog();
    if (!panel) throw new Error('No panel');
    named(panel, '17 novembre 2026').click();
    await reactive.whenStable();
    expect(reactive.componentInstance.start.value?.getDate()).toBe(17);

    reactive.componentInstance.start.disable();
    await reactive.whenStable();
    expect((named(element, 'Début, mar. 17 nov. 2026') as HTMLButtonElement).disabled).toBe(true);
  });

  it('is a Signal Forms value control', async () => {
    @Component({
      imports: [CwDatePicker, FormField],
      template: `<cw-date-picker ariaLabel="Échéance" [formField]="task.due" />`,
    })
    class SignalHost {
      readonly model = signal<{ due: CwDatePickerValue }>({ due: new Date(2026, 10, 18) });
      readonly task = form(this.model);
    }

    const signalFixture = TestBed.createComponent(SignalHost);
    signalFixture.autoDetectChanges();
    await signalFixture.whenStable();
    const element = signalFixture.nativeElement as HTMLElement;

    named(element, 'Échéance, mer. 18 nov. 2026').click();
    await signalFixture.whenStable();
    const panel = dialog();
    if (!panel) throw new Error('No panel');
    named(panel, 'Effacer').click();
    await signalFixture.whenStable();
    expect(signalFixture.componentInstance.model().due).toBeNull();
  });
});
