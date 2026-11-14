import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, type FieldTree } from '@angular/forms/signals';

import type { CwCalendarMode } from '@cadenway/ui/components/calendar';

import { CwDatePicker } from './date-picker.component';
import type { CwDatePickerValue, CwDatePickerVariant, CwDatePreset } from './date-picker.types';

/**
 * Function named
 *
 * @description
 * Finds a fixture element by accessible label or text.
 *
 * @param {ParentNode} root - Root containing candidate elements.
 * @param {string} name - Accessible label or text to match.
 * @param {string} selector - CSS selector used to find candidates.
 * @returns {HTMLElement} Matching fixture element.
 */
function named(root: ParentNode, name: string, selector: string = 'button'): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    root.querySelectorAll<HTMLElement>(selector),
  ).find(
    (element: HTMLElement) =>
      element.getAttribute('aria-label') === name || element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

/* A preset is named by its label and the date it shows (« Demain jeu. 19 nov. »). */
/**
 * Function preset
 *
 * @description
 * Finds a preset by the start of its displayed text.
 *
 * @param {HTMLElement} panel - Dialog containing the preset.
 * @param {string} label - Displayed preset label.
 * @returns {HTMLElement} Matching preset button.
 */
function preset(panel: HTMLElement, label: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    panel.querySelectorAll<HTMLElement>('button[aria-pressed]'),
  ).find((button: HTMLElement) => button.textContent.trim().startsWith(label));
  if (!found) throw new Error(`No preset ${label}`);
  return found;
}

/**
 * Function dialog
 *
 * @description
 * Finds the open date-picker dialog.
 * @returns {HTMLElement | null} Open dialog, or null when absent.
 */
function dialog(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="dialog"]');
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to a fixture element.
 *
 * @param {Element} target - Element receiving the keyboard event.
 * @param {string} key - Keyboard key to dispatch.
 */
function press(target: Element, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

/**
 * Component Host
 *
 * @description
 * Hosts a model-driven date picker with configurable options.
 */
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
  // #region Properties
  /**
   * Property variant
   *
   * @description
   * Trigger variant controlled by the fixture.
   *
   * @type {WritableSignal<CwDatePickerVariant>}
   * @readonly
   */
  public readonly variant: WritableSignal<CwDatePickerVariant> =
    signal<CwDatePickerVariant>('button');

  /**
   * Property mode
   *
   * @description
   * Calendar selection mode controlled by the fixture.
   *
   * @type {WritableSignal<CwCalendarMode>}
   * @readonly
   */
  public readonly mode: WritableSignal<CwCalendarMode> = signal<CwCalendarMode>('single');

  /**
   * Property withTime
   *
   * @description
   * Whether the fixture displays the time control.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly withTime: WritableSignal<boolean> = signal(false);

  /**
   * Property value
   *
   * @description
   * Selected date or range controlled by the fixture.
   *
   * @type {WritableSignal<CwDatePickerValue>}
   * @readonly
   */
  public readonly value: WritableSignal<CwDatePickerValue> = signal<CwDatePickerValue>(null);

  /**
   * Property open
   *
   * @description
   * Whether the picker panel is open.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly open: WritableSignal<boolean> = signal(false);

  /**
   * Property presets
   *
   * @description
   * Consumer-computed shortcuts from the mockup's QUICK_DATES.
   *
   * @type {CwDatePreset[]}
   * @readonly
   */
  public readonly presets: CwDatePreset[] = [
    { label: 'Demain', date: new Date(2026, 10, 19) },
    { label: 'Fin du sprint', date: new Date(2026, 10, 27) },
    { label: 'Sans échéance', date: null },
  ];
  // #endregion
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
    const trigger: HTMLElement = named(host, 'Échéance, Choisir une date');
    expect(trigger.textContent.trim()).toBe('Choisir une date');
    expect(trigger.hasAttribute('data-placeholder')).toBe(true);
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on the picked day, picks a day, closes and gives the focus back', async () => {
    component.value.set(new Date(2026, 10, 18));
    await fixture.whenStable();
    const trigger: HTMLElement = named(host, 'Échéance, mer. 18 nov. 2026');
    expect(trigger.textContent.trim()).toBe('mer. 18 nov. 2026');

    trigger.click();
    await fixture.whenStable();
    const panel: HTMLElement | null = dialog();
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
    const trigger: HTMLElement = named(host, 'Échéance, Choisir une date');
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
    const panel: HTMLElement | null = dialog();
    if (!panel) throw new Error('No panel');
    expect(preset(panel, 'Sans échéance').getAttribute('aria-pressed')).toBe('true');
    expect(preset(panel, 'Demain').textContent).toContain('jeu. 19 nov.');

    preset(panel, 'Demain').click();
    await fixture.whenStable();
    expect((component.value() as Date).getDate()).toBe(19);

    named(host, 'Échéance, jeu. 19 nov. 2026').click();
    await fixture.whenStable();
    const reopened: HTMLElement | null = dialog();
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
    const panel: HTMLElement | null = dialog();
    if (!panel) throw new Error('No panel');
    // No preset in range mode.
    expect(panel.querySelector('button[aria-pressed]')).toBeNull();

    const month: string | null | undefined = panel
      .querySelector('[role="grid"]')
      ?.getAttribute('aria-label');
    const year: number = Number(month?.split(' ')[1]);
    const name: string = month?.split(' ')[0] ?? '';
    named(panel, `16 ${name} ${String(year)}`).click();
    await fixture.whenStable();
    expect(dialog()).not.toBeNull();
    expect(component.value()).toBeNull();

    named(panel, `27 ${name} ${String(year)}`).click();
    await fixture.whenStable();
    expect(dialog()).toBeNull();
    const value: CwDatePickerValue = component.value();
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
    const panel: HTMLElement | null = dialog();
    if (!panel) throw new Error('No panel');

    named(panel, 'Ajouter une heure').click();
    await fixture.whenStable();
    const time: HTMLInputElement | null = panel.querySelector<HTMLInputElement>(
      'input[aria-label="Heure"]',
    );
    if (!time) throw new Error('No time field');
    time.value = '14:30';
    time.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const value: Date = component.value() as Date;
    expect([value.getDate(), value.getHours(), value.getMinutes()]).toEqual([18, 14, 30]);
  });

  it('parses a typed date and flags an invalid one', async () => {
    component.variant.set('input');
    await fixture.whenStable();
    const field: HTMLInputElement = named(
      host,
      'Échéance (jj/mm/aaaa)',
      'input',
    ) as HTMLInputElement;

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
    /**
     * Component ReactiveHost
     *
     * @description
     * Hosts a date picker bound to a reactive form control.
     */
    @Component({
      imports: [CwDatePicker, ReactiveFormsModule],
      template: `<cw-date-picker ariaLabel="Début" [formControl]="start" />`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property start
       *
       * @description
       * Reactive form control bound to the selected date.
       *
       * @type {FormControl<Date | null>}
       * @readonly
       */
      public readonly start: FormControl<Date | null> = new FormControl<Date | null>(
        new Date(2026, 10, 16),
      );
      // #endregion
    }

    const reactive: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    reactive.autoDetectChanges();
    await reactive.whenStable();
    const element: HTMLElement = reactive.nativeElement as HTMLElement;
    const trigger: HTMLElement = named(element, 'Début, lun. 16 nov. 2026');

    trigger.click();
    await reactive.whenStable();
    const panel: HTMLElement | null = dialog();
    if (!panel) throw new Error('No panel');
    named(panel, '17 novembre 2026').click();
    await reactive.whenStable();
    expect(reactive.componentInstance.start.value?.getDate()).toBe(17);

    reactive.componentInstance.start.disable();
    await reactive.whenStable();
    expect((named(element, 'Début, mar. 17 nov. 2026') as HTMLButtonElement).disabled).toBe(true);
  });

  it('is a Signal Forms value control', async () => {
    /**
     * Component SignalHost
     *
     * @description
     * Hosts a date picker bound to a Signal Forms field.
     */
    @Component({
      imports: [CwDatePicker, FormField],
      template: `<cw-date-picker ariaLabel="Échéance" [formField]="task.due" />`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       *
       * @description
       * Model containing the selected due date.
       *
       * @type {WritableSignal<{ due: CwDatePickerValue; }>}
       * @readonly
       */
      public readonly model: WritableSignal<{ due: CwDatePickerValue }> = signal<{
        due: CwDatePickerValue;
      }>({ due: new Date(2026, 10, 18) });

      /**
       * Property task
       *
       * @description
       * Signal Forms field tree derived from the model.
       *
       * @type {FieldTree<{ due: CwDatePickerValue }>}
       * @readonly
       */
      public readonly task: FieldTree<{ due: CwDatePickerValue }> = form(this.model);
      // #endregion
    }

    const signalFixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    signalFixture.autoDetectChanges();
    await signalFixture.whenStable();
    const element: HTMLElement = signalFixture.nativeElement as HTMLElement;

    named(element, 'Échéance, mer. 18 nov. 2026').click();
    await signalFixture.whenStable();
    const panel: HTMLElement | null = dialog();
    if (!panel) throw new Error('No panel');
    named(panel, 'Effacer').click();
    await signalFixture.whenStable();
    expect(signalFixture.componentInstance.model().due).toBeNull();
  });
});
