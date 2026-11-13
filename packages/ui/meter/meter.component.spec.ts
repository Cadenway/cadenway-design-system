import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwMeter } from './meter.component';
import type { CwMeterSeries } from './meter.types';

@Component({
  imports: [CwMeter],
  template: `
    <cw-meter
      label="Stockage de l'instance"
      [value]="storage()"
      [max]="10"
      [format]="go"
      note="3,6 Go disponibles"
    />
    <cw-meter label="Charge du sprint 14" [value]="52" [max]="60" [threshold]="45" />
    <cw-meter
      label="Charge du sprint"
      [value]="40"
      [max]="45"
      [low]="30"
      [high]="45"
      [optimum]="40"
      note="Charge idéale"
    />
    <cw-meter label="Sièges" variant="segmented" [segments]="10" [value]="7" [max]="10" />
    <cw-meter
      label="Stockage par type"
      variant="stacked"
      [value]="null"
      [max]="10"
      [series]="series"
    />
    <cw-meter ariaLabel="Charge de Léa Martin" size="sm" [value]="null" [max]="20" />
    <cw-meter label="Appels à l'API" [value]="42" [loading]="loading()" />
  `,
})
class Host {
  readonly storage = signal(6.4);
  readonly loading = signal(false);
  readonly series: CwMeterSeries[] = [
    { label: 'Pièces jointes', value: 4.1 },
    { label: 'Documents', value: 2.3 },
  ];
  readonly go = (value: number, max: number): string =>
    `${String(value).replace('.', ',')} Go sur ${String(max)} Go`;
}

function meterNamed(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('[role="meter"]')).find((element) => {
    const labelledBy = element.getAttribute('aria-labelledby');
    const label = labelledBy
      ? host.querySelector(`[id="${labelledBy}"]`)?.textContent.trim()
      : element.getAttribute('aria-label');
    return label === name;
  });
  if (!found) throw new Error(`No meter named ${name}`);
  return found;
}

function gauge(element: HTMLElement): HTMLElement {
  const root = element.closest<HTMLElement>('cw-meter');
  if (!root) throw new Error('Meter host missing');
  return root;
}

describe('CwMeter', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('exposes the range, the value and the formatted value text', () => {
    const storage = meterNamed(host, "Stockage de l'instance");

    expect(storage.getAttribute('aria-valuenow')).toBe('6.4');
    expect(storage.getAttribute('aria-valuemin')).toBe('0');
    expect(storage.getAttribute('aria-valuemax')).toBe('10');
    expect(storage.getAttribute('aria-valuetext')).toBe('6,4 Go sur 10 Go');
    expect(gauge(storage).dataset['zone']).toBe('normal');
    expect(gauge(storage).textContent).toContain('6,4 Go sur 10 Go');
  });

  it('describes the gauge by its note', () => {
    const storage = meterNamed(host, "Stockage de l'instance");
    const note = host.querySelector(`[id="${storage.getAttribute('aria-describedby') ?? ''}"]`);

    expect(note?.textContent.trim()).toBe('3,6 Go disponibles');
  });

  it('enters the high zone at 80 % and the critical zone at 95 % of the range', async () => {
    const storage = meterNamed(host, "Stockage de l'instance");

    component.storage.set(8);
    await fixture.whenStable();
    expect(gauge(storage).dataset['zone']).toBe('high');

    component.storage.set(9.5);
    await fixture.whenStable();
    expect(gauge(storage).dataset['zone']).toBe('critical');

    component.storage.set(12);
    await fixture.whenStable();
    expect(gauge(storage).dataset['zone']).toBe('critical');
  });

  it('writes the overrun over the threshold', () => {
    const sprint = meterNamed(host, 'Charge du sprint 14');

    expect(gauge(sprint).dataset['zone']).toBe('critical');
    expect(gauge(sprint).hasAttribute('data-over')).toBe(true);
    expect(sprint.getAttribute('aria-valuetext')).toBe('87 %, +7');
    expect(gauge(sprint).textContent).toContain('+7');
    expect(gauge(sprint).textContent).toContain('Capacité 45');
  });

  it('is optimum inside the band around the optimum', () => {
    expect(gauge(meterNamed(host, 'Charge du sprint')).dataset['zone']).toBe('optimum');
  });

  it('stays one meter in segmented and stacked forms', () => {
    const seats = meterNamed(host, 'Sièges');
    expect(seats.getAttribute('aria-valuenow')).toBe('7');

    const byType = meterNamed(host, 'Stockage par type');
    expect(byType.getAttribute('aria-valuenow')).toBe('6.4');
    const legend = gauge(byType).querySelector('ul')?.textContent ?? '';
    expect(legend).toContain('Pièces jointes');
    expect(legend).toContain('4,1');
    expect(legend).toContain('Libre');
    expect(legend).toContain('3,6');
  });

  it('reads « Aucune mesure » without a value and is named by aria-label without a header', () => {
    const load = meterNamed(host, 'Charge de Léa Martin');

    expect(load.getAttribute('aria-valuetext')).toBe('Aucune mesure');
    expect(load.getAttribute('aria-valuenow')).toBe('0');
  });

  it('replaces the track by a skeleton while loading', async () => {
    component.loading.set(true);
    await fixture.whenStable();
    const calls = Array.from(host.querySelectorAll<HTMLElement>('cw-meter')).at(-1);

    expect(calls?.getAttribute('aria-busy')).toBe('true');
    expect(calls?.querySelector('[role="meter"]')).toBeNull();
  });
});
