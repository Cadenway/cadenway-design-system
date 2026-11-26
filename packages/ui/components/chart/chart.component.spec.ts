import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCwLocale } from '@cadenway/ui/core';

import { provideCwChartLabels } from './chart.providers';
import { CwChart } from './chart.component';
import { CW_CHART_OTHERS_KEY } from './chart.constants';
import type {
  CwChartCategorySelect,
  CwChartDatum,
  CwChartMarker,
  CwChartOrientation,
  CwChartSeries,
  CwChartType,
} from './chart.types';

/**
 * Constant WEEKS
 *
 * @description
 * Weekly data supplied to the chart fixture.
 *
 * @type {CwChartDatum[]}
 */
const WEEKS: CwChartDatum[] = [
  { week: 'S44', done: 18, late: 1 },
  { week: 'S45', done: 14, late: 2 },
  { week: 'S46', done: 1200, late: 1 },
];

/**
 * Constant SERIES
 *
 * @description
 * Series displayed by the chart fixture.
 *
 * @type {CwChartSeries[]}
 */
const SERIES: CwChartSeries[] = [
  { key: 'done', label: 'Terminées', color: 'chart-2' },
  { key: 'late', label: 'En retard', color: 'chart-4' },
];

/**
 * Component Host
 *
 * @description
 * Hosts a chart and records selected categories for the fixture.
 */
@Component({
  imports: [CwChart],
  template: `
    <cw-chart
      [type]="type()"
      [orientation]="orientation()"
      [data]="data()"
      x="week"
      [series]="series"
      ariaLabel="Tâches terminées et en retard, S44 à S46"
      [loading]="loading()"
      unit="tâches"
      (categorySelect)="selected.set($event)"
    />
  `,
})
class Host {
  // #region Properties
  /**
   * Property type
   *
   * @description
   * Chart type selected by the fixture.
   *
   * @type {WritableSignal<CwChartType>}
   * @readonly
   */
  public readonly type: WritableSignal<CwChartType> = signal<CwChartType>('bar');

  /**
   * Property orientation
   *
   * @description
   * Bar orientation selected by the fixture.
   *
   * @type {WritableSignal<CwChartOrientation>}
   * @readonly
   */
  public readonly orientation: WritableSignal<CwChartOrientation> =
    signal<CwChartOrientation>('vertical');

  /**
   * Property data
   *
   * @description
   * Data displayed by the chart.
   *
   * @type {WritableSignal<readonly Readonly<Record<string, string | number | null | undefined>>[]>}
   * @readonly
   */
  public readonly data: WritableSignal<
    readonly Readonly<Record<string, string | number | null | undefined>>[]
  > = signal<readonly CwChartDatum[]>(WEEKS);

  /**
   * Property series
   *
   * @description
   * Series displayed by the chart.
   *
   * @type {CwChartSeries[]}
   * @readonly
   */
  public readonly series: CwChartSeries[] = SERIES;

  /**
   * Property loading
   *
   * @description
   * Whether the chart displays a loading state.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property selected
   *
   * @description
   * Last category emitted by the chart.
   *
   * @type {WritableSignal<CwChartCategorySelect | null>}
   * @readonly
   */
  public readonly selected: WritableSignal<CwChartCategorySelect | null> =
    signal<CwChartCategorySelect | null>(null);
  // #endregion
}

/**
 * Function keydown
 *
 * @description
 * Dispatches a keyboard event to the chart.
 *
 * @param {HTMLElement} element - Element receiving the keyboard event.
 * @param {string} key - Keyboard key to dispatch.
 */
function keydown(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CwChart', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  /**
   * Function plot
   *
   * @description
   * Finds the focusable chart plot.
   * @returns {HTMLElement} Focusable plot element.
   */
  function plot(): HTMLElement {
    const found: HTMLElement | null = host.querySelector<HTMLElement>('[role="img"][tabindex="0"]');
    if (!found) throw new Error('No plot');
    return found;
  }

  /**
   * Function live
   *
   * @description
   * Reads the current live announcement.
   * @returns {string} Live announcement text.
   */
  function live(): string {
    return host.querySelector('[aria-live="polite"]')?.textContent.trim() ?? '';
  }

  /**
   * Function legendItem
   *
   * @description
   * Finds a legend button by its displayed name.
   *
   * @param {string} name - Displayed legend item name.
   * @returns {HTMLButtonElement} Matching legend button.
   */
  function legendItem(name: string): HTMLButtonElement {
    const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent.includes(name),
    );
    if (!found) throw new Error(`No legend item ${name}`);
    return found;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('is one focusable image named by its summary, with every value in a hidden table', () => {
    expect(plot().getAttribute('aria-label')).toBe('Tâches terminées et en retard, S44 à S46');
    expect(plot().tabIndex).toBe(0);

    const table: HTMLTableElement | null = host.querySelector('table');
    expect(table?.querySelector('caption')?.textContent.trim()).toBe(
      'Tâches terminées et en retard, S44 à S46',
    );
    const headers: string[] = Array.from(table?.querySelectorAll('thead th') ?? []).map((th) =>
      th.textContent.trim(),
    );
    expect(headers).toEqual(['Catégorie', 'Terminées', 'En retard']);
    const lastRow: string[] = Array.from(
      table?.querySelectorAll('tbody tr:last-child > *') ?? [],
    ).map((cell) => cell.textContent.trim());
    // French number format: a narrow no-break space groups the thousands.
    expect(lastRow).toEqual(['S46', '1 200', '1']);
  });

  it('moves through the categories with the arrows and announces the active one', async () => {
    keydown(plot(), 'ArrowRight');
    await fixture.whenStable();
    expect(live()).toBe('S44 : Terminées 18, En retard 1');

    keydown(plot(), 'End');
    await fixture.whenStable();
    expect(plot().dataset['active']).toBe('S46');

    keydown(plot(), 'ArrowLeft');
    await fixture.whenStable();
    expect(live()).toBe('S45 : Terminées 14, En retard 2');

    keydown(plot(), 'Escape');
    await fixture.whenStable();
    expect(live()).toBe('');
  });

  it('emits the active category on Enter', async () => {
    keydown(plot(), 'ArrowRight');
    keydown(plot(), 'ArrowRight');
    keydown(plot(), 'Enter');
    await fixture.whenStable();

    expect(component.selected()).toEqual({ x: 'S45', values: { done: 14, late: 2 } });
  });

  it('hides and shows a series from its legend button', async () => {
    const late: HTMLButtonElement = legendItem('En retard');
    expect(late.getAttribute('aria-pressed')).toBe('true');

    late.click();
    await fixture.whenStable();
    keydown(plot(), 'ArrowRight');
    await fixture.whenStable();

    expect(late.getAttribute('aria-pressed')).toBe('false');
    expect(live()).toBe('S44 : Terminées 18');
  });

  it('follows ↑ ↓ on horizontal bars', async () => {
    component.orientation.set('horizontal');
    await fixture.whenStable();

    keydown(plot(), 'ArrowDown');
    keydown(plot(), 'ArrowDown');
    await fixture.whenStable();

    expect(plot().dataset['active']).toBe('S45');
  });

  it('moves through the segments of a ring', async () => {
    component.type.set('donut');
    await fixture.whenStable();

    keydown(plot(), 'ArrowRight');
    await fixture.whenStable();

    expect(live()).toBe('Terminées : Terminées 1 232');
    expect(host.textContent).toContain('tâches');
  });

  it('shows the empty state without any value', async () => {
    component.data.set([]);
    await fixture.whenStable();

    expect(host.querySelector('[role="img"][tabindex="0"]')).toBeNull();
    expect(host.textContent).toContain('Aucune donnée sur la période');
  });

  it('is busy while loading', async () => {
    component.loading.set(true);
    await fixture.whenStable();

    expect(host.querySelector('cw-chart')?.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('[role="img"][tabindex="0"]')).toBeNull();
  });
});

describe('provideCwLocale', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideCwLocale('en-US')] });
  });

  it('formats chart table values in English', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.componentInstance.data.set([{ week: 'S46', done: 1234.5, late: 1 }]);
    fixture.detectChanges();

    const table: HTMLTableElement | null = (fixture.nativeElement as HTMLElement).querySelector(
      'table',
    );
    expect(table?.textContent).toContain('1,234.5');
  });
});

describe('provideCwChartLabels', () => {
  it('renders provided text', async () => {
    TestBed.configureTestingModule({ providers: [provideCwChartLabels({ emptyText: 'No data' })] });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    fixture.componentInstance.data.set([]);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No data');
  });
});

/**
 * Constant PEOPLE
 *
 * @description
 * Hours per day for six people, one series each, for the « Others » rule.
 *
 * @type {CwChartDatum[]}
 */
const PEOPLE: CwChartDatum[] = [
  { day: 'Mon', ana: 4, ben: 3, cleo: 2, dan: 1, eve: 1, fay: null },
  { day: 'Tue', ana: 5, ben: 2, cleo: 1, dan: null, eve: null, fay: null },
];

/**
 * Constant PEOPLE_SERIES
 *
 * @description
 * Six series, one past the five data colors.
 *
 * @type {CwChartSeries[]}
 */
const PEOPLE_SERIES: CwChartSeries[] = [
  { key: 'ana', label: 'Ana', color: 'chart-1' },
  { key: 'ben', label: 'Ben', color: 'chart-2' },
  { key: 'cleo', label: 'Cleo', color: 'chart-3' },
  { key: 'dan', label: 'Dan', color: 'chart-4' },
  { key: 'eve', label: 'Eve', color: 'chart-5' },
  { key: 'fay', label: 'Fay', color: 'chart-1' },
];

/**
 * Component ReferenceHost
 *
 * @description
 * Hosts a chart with reference markers and a series limit.
 */
@Component({
  imports: [CwChart],
  template: `
    <cw-chart
      [type]="type()"
      [data]="data()"
      x="day"
      [series]="series"
      [markers]="markers()"
      [maxSeries]="maxSeries()"
      ariaLabel="Hours per day"
      (categorySelect)="selected.set($event)"
    />
  `,
})
class ReferenceHost {
  // #region Properties
  /**
   * Property type
   *
   * @description
   * Chart type selected by the fixture.
   *
   * @type {WritableSignal<CwChartType>}
   * @readonly
   */
  public readonly type: WritableSignal<CwChartType> = signal<CwChartType>('line');

  /**
   * Property data
   *
   * @description
   * Data displayed by the chart.
   *
   * @type {WritableSignal<readonly CwChartDatum[]>}
   * @readonly
   */
  public readonly data: WritableSignal<readonly CwChartDatum[]> =
    signal<readonly CwChartDatum[]>(PEOPLE);

  /**
   * Property series
   *
   * @description
   * Six series given to the chart.
   *
   * @type {CwChartSeries[]}
   * @readonly
   */
  public readonly series: CwChartSeries[] = PEOPLE_SERIES;

  /**
   * Property markers
   *
   * @description
   * Reference markers given to the chart.
   *
   * @type {WritableSignal<readonly CwChartMarker[]>}
   * @readonly
   */
  public readonly markers: WritableSignal<readonly CwChartMarker[]> = signal<
    readonly CwChartMarker[]
  >([{ x: 'Tue', label: 'Today' }]);

  /**
   * Property maxSeries
   *
   * @description
   * Series limit given to the chart.
   *
   * @type {WritableSignal<number | null>}
   * @readonly
   */
  public readonly maxSeries: WritableSignal<number | null> = signal<number | null>(null);

  /**
   * Property selected
   *
   * @description
   * Last category emitted by the chart.
   *
   * @type {WritableSignal<CwChartCategorySelect | null>}
   * @readonly
   */
  public readonly selected: WritableSignal<CwChartCategorySelect | null> =
    signal<CwChartCategorySelect | null>(null);
  // #endregion
}

describe('CwChart markers and series limit', () => {
  let host: HTMLElement;
  let component: ReferenceHost;
  let fixture: ComponentFixture<ReferenceHost>;

  /**
   * Function plot
   *
   * @description
   * Finds the focusable chart plot.
   * @returns {HTMLElement} Focusable plot element.
   */
  function plot(): HTMLElement {
    const found: HTMLElement | null = host.querySelector<HTMLElement>('[role="img"][tabindex="0"]');
    if (!found) throw new Error('No plot');
    return found;
  }

  /**
   * Function headers
   *
   * @description
   * Reads the column headers of the hidden data table.
   * @returns {string[]} Header texts.
   */
  function headers(): string[] {
    return Array.from(host.querySelectorAll('table thead th')).map((th) => th.textContent.trim());
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceHost);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('draws a labelled marker on its category and describes it to screen readers', () => {
    const id: string | null = plot().getAttribute('aria-describedby');
    const description: HTMLElement | null = id ? host.querySelector<HTMLElement>(`#${id}`) : null;
    expect(description?.textContent.trim()).toBe('Today : Tue.');
    expect(host.querySelector('svg')?.textContent).toContain('Today');
  });

  it('draws no marker on a category missing from the data, nor on a ring', async () => {
    component.markers.set([{ x: 'Sun', label: 'Today' }]);
    await fixture.whenStable();
    expect(plot().hasAttribute('aria-describedby')).toBe(false);

    component.markers.set([{ x: 'Tue', label: 'Today' }]);
    component.type.set('donut');
    await fixture.whenStable();
    expect(plot().hasAttribute('aria-describedby')).toBe(false);
  });

  it('draws every series without a limit', () => {
    expect(headers()).toEqual(['Catégorie', 'Ana', 'Ben', 'Cleo', 'Dan', 'Eve', 'Fay']);
  });

  it('sums the series past maxSeries into one « Autres » series', async () => {
    component.maxSeries.set(4);
    await fixture.whenStable();

    expect(headers()).toEqual(['Catégorie', 'Ana', 'Ben', 'Cleo', 'Autres']);
    const legend: string[] = Array.from(host.querySelectorAll('button[aria-pressed]')).map(
      (button) => button.textContent.trim(),
    );
    expect(legend).toEqual(['Ana', 'Ben', 'Cleo', 'Autres']);

    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(component.selected()).toEqual({
      x: 'Mon',
      values: { ana: 4, ben: 3, cleo: 2, [CW_CHART_OTHERS_KEY]: 2 },
    });
  });

  it('leaves a gap when no folded series has a value', async () => {
    component.maxSeries.set(4);
    component.data.set([{ day: 'Mon', ana: 1, ben: 1, cleo: 1, dan: null, eve: null, fay: null }]);
    await fixture.whenStable();

    const cells: string[] = Array.from(host.querySelectorAll('table tbody td')).map((cell) =>
      cell.textContent.trim(),
    );
    expect(cells).toEqual(['1', '1', '1', '—']);
  });
});

describe('provideCwChartLabels for markers and Others', () => {
  it('names the Others series and describes the markers with the provided texts', () => {
    TestBed.configureTestingModule({
      providers: [
        provideCwChartLabels({
          othersLabel: 'Others',
          marker: (label: string, category: string) => `${label} (${category})`,
        }),
      ],
    });
    const fixture: ComponentFixture<ReferenceHost> = TestBed.createComponent(ReferenceHost);
    fixture.componentInstance.maxSeries.set(3);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('table thead')?.textContent).toContain('Others');
    expect(element.textContent).toContain('Today (Tue).');
  });
});

/**
 * Component CollisionHost
 *
 * @description
 * Hosts a bar chart whose series or category key may already be the « Others » key.
 */
@Component({
  imports: [CwChart],
  template: `
    <cw-chart
      [data]="data()"
      [x]="x()"
      [series]="series()"
      [maxSeries]="3"
      [legend]="true"
      ariaLabel="Hours per day"
      (categorySelect)="selected.set($event)"
    />
  `,
})
class CollisionHost {
  // #region Properties
  /**
   * Property x
   *
   * @description
   * Category key given to the chart.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  public readonly x: WritableSignal<string> = signal('day');

  /**
   * Property data
   *
   * @description
   * Data given to the chart.
   *
   * @type {WritableSignal<readonly CwChartDatum[]>}
   * @readonly
   */
  public readonly data: WritableSignal<readonly CwChartDatum[]> = signal<readonly CwChartDatum[]>([
    { day: 'Mon', [CW_CHART_OTHERS_KEY]: 4, ben: 3, cleo: 2, dan: 1 },
    { day: 'Tue', [CW_CHART_OTHERS_KEY]: 5, ben: 2, cleo: 1, dan: 1 },
  ]);

  /**
   * Property series
   *
   * @description
   * Series given to the chart; the first one uses the « Others » key.
   *
   * @type {WritableSignal<readonly CwChartSeries[]>}
   * @readonly
   */
  public readonly series: WritableSignal<readonly CwChartSeries[]> = signal<
    readonly CwChartSeries[]
  >([
    { key: CW_CHART_OTHERS_KEY, label: 'Ana', color: 'chart-1' },
    { key: 'ben', label: 'Ben', color: 'chart-2' },
    { key: 'cleo', label: 'Cleo', color: 'chart-3' },
    { key: 'dan', label: 'Dan', color: 'chart-4' },
  ]);

  /**
   * Property selected
   *
   * @description
   * Last category emitted by the chart.
   *
   * @type {WritableSignal<CwChartCategorySelect | null>}
   * @readonly
   */
  public readonly selected: WritableSignal<CwChartCategorySelect | null> =
    signal<CwChartCategorySelect | null>(null);
  // #endregion
}

describe('CwChart « Others » key', () => {
  let fixture: ComponentFixture<CollisionHost>;
  let host: HTMLElement;
  let component: CollisionHost;

  /**
   * Function rows
   *
   * @description
   * Reads the rows of the hidden data table.
   * @returns {string[][]} Cell texts, row by row, the category first.
   */
  function rows(): string[][] {
    return Array.from(host.querySelectorAll('table tbody tr')).map((row) =>
      Array.from(row.children).map((cell) => cell.textContent.trim()),
    );
  }

  /**
   * Function select
   *
   * @description
   * Chooses the first category with the keyboard.
   */
  async function select(): Promise<void> {
    const plot: HTMLElement | null = host.querySelector<HTMLElement>('[role="img"][tabindex="0"]');
    plot?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(CollisionHost);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('keeps a series already named with the « Others » key and sums the rest under another key', async () => {
    const headers: string[] = Array.from(host.querySelectorAll('table thead th')).map((th) =>
      th.textContent.trim(),
    );
    expect(headers).toEqual(['Catégorie', 'Ana', 'Ben', 'Autres']);
    expect(rows()).toEqual([
      ['Mon', '4', '3', '3'],
      ['Tue', '5', '2', '2'],
    ]);
    // Grouped bars: one per drawn series of the first category, each its own shape.
    expect(host.querySelectorAll('svg path')).toHaveLength(6);

    await select();
    expect(component.selected()).toEqual({
      x: 'Mon',
      values: { [CW_CHART_OTHERS_KEY]: 4, ben: 3, [`${CW_CHART_OTHERS_KEY}-2`]: 3 },
    });
  });

  it('keeps a category key named with the « Others » key', async () => {
    component.x.set(CW_CHART_OTHERS_KEY);
    component.series.set([
      { key: 'ana', label: 'Ana', color: 'chart-1' },
      { key: 'ben', label: 'Ben', color: 'chart-2' },
      { key: 'cleo', label: 'Cleo', color: 'chart-3' },
      { key: 'dan', label: 'Dan', color: 'chart-4' },
    ]);
    component.data.set([
      { [CW_CHART_OTHERS_KEY]: 'Mon', ana: 4, ben: 3, cleo: 2, dan: 1 },
      { [CW_CHART_OTHERS_KEY]: 'Tue', ana: 5, ben: 2, cleo: 1, dan: 1 },
    ]);
    await fixture.whenStable();

    expect(rows()).toEqual([
      ['Mon', '4', '3', '3'],
      ['Tue', '5', '2', '2'],
    ]);
    expect(host.querySelector('svg')?.textContent).toContain('Mon');

    await select();
    expect(component.selected()).toEqual({
      x: 'Mon',
      values: { ana: 4, ben: 3, [`${CW_CHART_OTHERS_KEY}-2`]: 3 },
    });
  });
});
