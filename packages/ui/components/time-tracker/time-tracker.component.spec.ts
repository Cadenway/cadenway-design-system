import { Component, signal } from '@angular/core';
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

const MINUTE = 60_000;

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

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
  readonly state = signal<CwTimeTrackerState>('stopped');
  readonly variant = signal<CwTimeTrackerVariant>('full');
  readonly elapsed = signal(0);
  readonly startedAt = new Date(2026, 10, 13, 14, 5);
  readonly total = signal(213 * MINUTE);
  readonly estimate = signal<number | null>(180 * MINUTE);
  readonly events = signal<string[]>([]);
  readonly stopped = signal<CwTimeStopEvent | null>(null);
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
    const meter = host.querySelector('[role="meter"]');
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

    const chip = button(host, 'Démarrer le minuteur, 3 h 33 suivies');
    chip.click();
    await fixture.whenStable();

    expect(component.state()).toBe('running');
    expect(button(host, 'Arrêter le minuteur, 0:00:00').textContent).toContain('0:00:00');
  });
});

describe('CwTimeEntryForm', () => {
  @Component({
    imports: [CwTimeEntryForm],
    template: `<cw-time-entry-form (submit)="added.set($event)" (cancel)="cancelled.set(true)" />`,
  })
  class FormHost {
    readonly added = signal<CwTimeEntryDraft | null>(null);
    readonly cancelled = signal(false);
  }

  let host: HTMLElement;
  let component: FormHost;
  let fixture: ComponentFixture<FormHost>;

  function duration(): HTMLInputElement {
    const label = Array.from(host.querySelectorAll('label')).find(
      (element) => element.textContent.trim() === 'Durée',
    );
    const field = host.querySelector<HTMLInputElement>(`#${label?.htmlFor ?? ''}`);
    if (!field) throw new Error('No duration field');
    return field;
  }

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
    const hint = document.getElementById(duration().getAttribute('aria-describedby') ?? '');
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
  @Component({
    imports: [CwTimeEntryList],
    template: `<cw-time-entry-list [entries]="entries()" (entryEdit)="edited.set($event)" />`,
  })
  class ListHost {
    readonly entries = signal<CwTimeEntry[]>([
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
    readonly edited = signal<CwTimeEntry | null>(null);
  }

  it('lists the entries with their totals and edits one on click', async () => {
    const fixture = TestBed.createComponent(ListHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('ul')?.getAttribute('aria-label')).toBe('Entrées de temps');
    expect(host.textContent).toContain('Sans note');
    expect(host.textContent).toContain('2 h 18');

    button(host, "Modifier l'entrée de Karim Benali, 10 nov., 1 h 30").click();
    expect(fixture.componentInstance.edited()?.id).toBe('1');
  });

  it('reads « Aucun temps saisi » without entries', async () => {
    const fixture = TestBed.createComponent(ListHost);
    fixture.componentInstance.entries.set([]);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aucun temps saisi');
  });
});
