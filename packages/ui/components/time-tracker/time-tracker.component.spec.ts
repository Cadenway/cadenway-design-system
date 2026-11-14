import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwTimeEntryForm } from './time-entry-form/time-entry-form.component';
import { CwTimeEntryList } from './time-entry-list/time-entry-list.component';
import { CwTimeTracker } from './time-tracker.component';
import type {
  CwTimeEntry,
  CwTimeEntryDraft,
  CwTimeStopEvent,
  CwTimeTrackerState,
  CwTimeTrackerVariant,
} from './time-tracker.types';

/**
 * Constant MINUTE
 *
 * @description
 * Number of milliseconds in one minute.
 *
 * @type {60000}
 */
const MINUTE: 60000 = 60_000;

/**
 * Function button
 *
 * @description
 * Finds a button by its accessible name.
 *
 * @param {HTMLElement} host - Fixture element containing the button.
 * @param {string} name - Accessible button name.
 * @returns {HTMLButtonElement} Matching button element.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Component TrackerHost
 *
 * @description
 * Hosts the tracker and records timer events.
 */
@Component({
  imports: [CwTimeTracker],
  template: `
    <cw-time-tracker
      [(state)]="state"
      [variant]="variant()"
      [elapsed]="elapsed()"
      [startedAt]="startedAt"
      [total]="total()"
      [estimate]="estimate()"
      (start)="events.set([...events(), 'start'])"
      (pause)="events.set([...events(), 'pause'])"
      (resume)="events.set([...events(), 'resume'])"
      (stop)="stopped.set($event)"
    />
  `,
})
class TrackerHost {
  // #region Properties
  /**
   * Property state
   *
   * @description
   * Timer state controlled by the fixture.
   *
   * @type {WritableSignal<CwTimeTrackerState>}
   * @readonly
   */
  public readonly state: WritableSignal<CwTimeTrackerState> = signal<CwTimeTrackerState>('stopped');

  /**
   * Property variant
   *
   * @description
   * Tracker variant displayed by the fixture.
   *
   * @type {WritableSignal<CwTimeTrackerVariant>}
   * @readonly
   */
  public readonly variant: WritableSignal<CwTimeTrackerVariant> =
    signal<CwTimeTrackerVariant>('full');

  /**
   * Property elapsed
   *
   * @description
   * Elapsed session duration in milliseconds.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  public readonly elapsed: WritableSignal<number> = signal(0);

  /**
   * Property startedAt
   *
   * @description
   * Start time supplied to the tracker.
   *
   * @type {Date}
   * @readonly
   */
  public readonly startedAt: Date = new Date(2026, 10, 13, 14, 5);

  /**
   * Property total
   *
   * @description
   * Total tracked duration in milliseconds.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  public readonly total: WritableSignal<number> = signal(213 * MINUTE);

  /**
   * Property estimate
   *
   * @description
   * Estimated duration in milliseconds.
   *
   * @type {WritableSignal<number | null>}
   * @readonly
   */
  public readonly estimate: WritableSignal<number | null> = signal<number | null>(180 * MINUTE);

  /**
   * Property events
   *
   * @description
   * Timer events emitted by the fixture.
   *
   * @type {WritableSignal<string[]>}
   * @readonly
   */
  public readonly events: WritableSignal<string[]> = signal<string[]>([]);

  /**
   * Property stopped
   *
   * @description
   * Last stopped session emitted by the tracker.
   *
   * @type {WritableSignal<CwTimeStopEvent | null>}
   * @readonly
   */
  public readonly stopped: WritableSignal<CwTimeStopEvent | null> = signal<CwTimeStopEvent | null>(
    null,
  );
  // #endregion
}

describe('CwTimeTracker', () => {
  let host: HTMLElement;
  let component: TrackerHost;
  let fixture: ComponentFixture<TrackerHost>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TrackerHost);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('starts, pauses, resumes and stops, reporting each action', async () => {
    expect(host.textContent).toContain('Total');
    expect(host.textContent).toContain('3 h 33');

    button(host, 'Démarrer le minuteur').click();
    await fixture.whenStable();
    expect(component.state()).toBe('running');
    expect(host.querySelector('[role="timer"]')?.getAttribute('aria-label')).toBe('Temps écoulé');
    expect(host.textContent).toContain('depuis 14:05');

    button(host, 'Mettre en pause').click();
    await fixture.whenStable();
    expect(component.state()).toBe('paused');
    expect(host.textContent).toContain('En pause');

    button(host, 'Reprendre le minuteur').click();
    await fixture.whenStable();
    component.elapsed.set(42 * MINUTE + 10_000);
    await fixture.whenStable();
    expect(host.querySelector('[role="timer"]')?.textContent.trim()).toBe('0:42:10');

    button(host, 'Arrêter le minuteur et enregistrer').click();
    await fixture.whenStable();

    expect(component.events()).toEqual(['start', 'pause', 'resume']);
    expect(component.state()).toBe('stopped');
    expect(component.stopped()).toEqual({ duration: 42 * MINUTE, startedAt: component.startedAt });
  });

  it('sets the total against the estimate and writes the excess', () => {
    const meter: Element | null = host.querySelector('[role="meter"]');
    expect(meter?.getAttribute('aria-valuetext')).toContain('3 h 33 / 3 h');
    expect(host.textContent).toContain('33 min de dépassement');
    expect(host.querySelector('cw-time-tracker')?.hasAttribute('data-over')).toBe(true);
  });

  it('writes the time left within the estimate', async () => {
    component.total.set(105 * MINUTE);
    await fixture.whenStable();

    expect(host.textContent).toContain('1 h 15 restantes');
  });

  it('renders a compact chip named with its action and duration', async () => {
    component.variant.set('compact');
    await fixture.whenStable();

    const chip: HTMLButtonElement = button(host, 'Démarrer le minuteur, 3 h 33 suivies');
    chip.click();
    await fixture.whenStable();

    expect(component.state()).toBe('running');
    expect(button(host, 'Arrêter le minuteur, 0:00:00').textContent).toContain('0:00:00');
  });
});

describe('CwTimeEntryForm', () => {
  /**
   * Component FormHost
   *
   * @description
   * Hosts the form and records submission and cancellation.
   */
  @Component({
    imports: [CwTimeEntryForm],
    template: `<cw-time-entry-form (submit)="added.set($event)" (cancel)="cancelled.set(true)" />`,
  })
  class FormHost {
    // #region Properties
    /**
     * Property added
     *
     * @description
     * Last time entry submitted by the form.
     *
     * @type {WritableSignal<CwTimeEntryDraft | null>}
     * @readonly
     */
    public readonly added: WritableSignal<CwTimeEntryDraft | null> =
      signal<CwTimeEntryDraft | null>(null);

    /**
     * Property cancelled
     *
     * @description
     * Whether the form emitted cancellation.
     *
     * @type {WritableSignal<boolean>}
     * @readonly
     */
    public readonly cancelled: WritableSignal<boolean> = signal(false);
    // #endregion
  }

  let host: HTMLElement;
  let component: FormHost;
  let fixture: ComponentFixture<FormHost>;

  /**
   * Function duration
   *
   * @description
   * Finds the form duration input.
   * @returns {HTMLInputElement} Duration input element.
   */
  function duration(): HTMLInputElement {
    const label: HTMLLabelElement | undefined = Array.from(host.querySelectorAll('label')).find(
      (element) => element.textContent.trim() === 'Durée',
    );
    const field: HTMLInputElement | null = host.querySelector<HTMLInputElement>(
      `#${label?.htmlFor ?? ''}`,
    );
    if (!field) throw new Error('No duration field');
    return field;
  }

  /**
   * Function type
   *
   * @description
   * Types a duration in the form.
   *
   * @param {string} text - Duration text to enter.
   */
  function type(text: string): void {
    duration().value = text;
    duration().dispatchEvent(new Event('input'));
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(FormHost);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('reads the duration as it is typed and adds it with Enter', async () => {
    type('1h30');
    await fixture.whenStable();
    const hint: HTMLElement | null = document.getElementById(
      duration().getAttribute('aria-describedby') ?? '',
    );
    expect(hint?.textContent.trim()).toBe('= 1 h 30');

    duration().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    expect(component.added()?.duration).toBe(90 * MINUTE);
    expect(component.added()?.billable).toBe(true);
    expect(duration().value).toBe('');
  });

  it('refuses an unreadable duration with the format help', async () => {
    type('1h3O');
    button(host, 'Ajouter').click();
    await fixture.whenStable();

    expect(component.added()).toBeNull();
    expect(duration().getAttribute('aria-invalid')).toBe('true');
    expect(host.textContent).toContain('Format non reconnu : essayez « 1 h 30 » ou « 90 min ».');
  });

  it('adds a shortcut duration at once, and cancels', () => {
    button(host, '+ 30 min').click();
    expect(component.added()?.duration).toBe(30 * MINUTE);

    button(host, 'Annuler').click();
    expect(component.cancelled()).toBe(true);
  });
});

describe('CwTimeEntryList', () => {
  /**
   * Component ListHost
   *
   * @description
   * Hosts the entry list and records the edited entry.
   */
  @Component({
    imports: [CwTimeEntryList],
    template: `<cw-time-entry-list [entries]="entries()" (entryEdit)="edited.set($event)" />`,
  })
  class ListHost {
    // #region Properties
    /**
     * Property entries
     *
     * @description
     * Time entries supplied to the list.
     *
     * @type {WritableSignal<CwTimeEntry[]>}
     * @readonly
     */
    public readonly entries: WritableSignal<CwTimeEntry[]> = signal<CwTimeEntry[]>([
      {
        id: '1',
        person: { name: 'Karim Benali' },
        date: new Date(2026, 10, 10),
        duration: 90 * MINUTE,
        note: 'Revue du correctif',
        billable: true,
      },
      {
        id: '2',
        person: { name: 'Inès Duval' },
        date: new Date(2026, 10, 9),
        duration: 48 * MINUTE,
      },
    ]);

    /**
     * Property edited
     *
     * @description
     * Entry selected for editing.
     *
     * @type {WritableSignal<CwTimeEntry | null>}
     * @readonly
     */
    public readonly edited: WritableSignal<CwTimeEntry | null> = signal<CwTimeEntry | null>(null);
    // #endregion
  }

  it('lists the entries with their totals and edits one on click', async () => {
    const fixture: ComponentFixture<ListHost> = TestBed.createComponent(ListHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('ul')?.getAttribute('aria-label')).toBe('Entrées de temps');
    expect(host.textContent).toContain('Sans note');
    expect(host.textContent).toContain('2 h 18');

    button(host, "Modifier l'entrée de Karim Benali, 10 nov., 1 h 30").click();
    expect(fixture.componentInstance.edited()?.id).toBe('1');
  });

  it('reads « Aucun temps saisi » without entries', async () => {
    const fixture: ComponentFixture<ListHost> = TestBed.createComponent(ListHost);
    fixture.componentInstance.entries.set([]);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aucun temps saisi');
  });
});
