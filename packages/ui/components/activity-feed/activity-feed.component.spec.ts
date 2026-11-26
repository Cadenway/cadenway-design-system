import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCwLocale } from '@cadenway/ui/core';

import { CwActivityDetailDef } from './activity-detail/activity-detail.directive';
import { CwActivityFeed } from './activity-feed.component';
import { CwActivityFeedEmpty } from './activity-feed-empty/activity-feed-empty.directive';
import { provideCwActivityFeedLabels } from './activity-feed.providers';
import type { CwActivityEntry } from './activity-feed.types';

/**
 * Interface Task
 *
 * @description
 * The object behind an entry of the fixture.
 */
interface Task {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Task key.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;
  // #endregion
}

/**
 * Constant NOW
 *
 * @description
 * Reference time of the fixture: Thursday 26 November 2026, 15:00 local time.
 *
 * @type {Date}
 */
const NOW: Date = new Date(2026, 10, 26, 15, 0);

/**
 * Constant ENTRIES
 *
 * @description
 * Entries of today, yesterday and an older day, newest first.
 *
 * @type {readonly CwActivityEntry<Task>[]}
 */
const ENTRIES: readonly CwActivityEntry<Task>[] = [
  {
    id: 'a1',
    at: new Date(2026, 10, 26, 14, 5),
    actor: { name: 'Ana Martin' },
    summary: ['changed the status to', { text: 'Done' }],
    data: { key: 'CAD-482' },
  },
  {
    id: 'a2',
    at: new Date(2026, 10, 26, 9, 30).toISOString(),
    actor: { name: 'Public form', icon: 'phosphorPulseBold' },
    summary: ['sent a request'],
    data: { key: 'CAD-490' },
  },
  {
    id: 'a3',
    at: new Date(2026, 10, 25, 17, 45).getTime(),
    actor: { name: 'Ben Roux' },
    summary: ['commented on', { text: 'CAD-471', emphasis: 'code' }],
    quote: 'Looks good to me.',
    data: { key: 'CAD-471' },
  },
  {
    id: 'a4',
    at: new Date(2026, 10, 23, 8, 0),
    actor: { name: 'Ana Martin' },
    summary: ['created the task'],
    data: { key: 'CAD-500' },
  },
];

/**
 * Component Host
 *
 * @description
 * Hosts an activity feed with a detail template and empty-state content.
 */
@Component({
  imports: [CwActivityFeed, CwActivityDetailDef, CwActivityFeedEmpty],
  template: `
    <cw-activity-feed
      [entries]="entries()"
      [groupByDay]="grouped()"
      [now]="now"
      [loading]="loading()"
      ariaLabel="Activity of the list"
    >
      <ng-template cwActivityDetail let-data="data">
        <button type="button">{{ data.key }}</button>
      </ng-template>
      <button cwActivityFeedEmpty type="button">Clear the filters</button>
    </cw-activity-feed>
  `,
})
class Host {
  // #region Properties
  /**
   * Property entries
   *
   * @description
   * Entries given to the feed.
   *
   * @type {WritableSignal<readonly CwActivityEntry<Task>[]>}
   * @readonly
   */
  public readonly entries: WritableSignal<readonly CwActivityEntry<Task>[]> =
    signal<readonly CwActivityEntry<Task>[]>(ENTRIES);

  /**
   * Property grouped
   *
   * @description
   * Whether the feed groups by day.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly grouped: WritableSignal<boolean> = signal(true);

  /**
   * Property loading
   *
   * @description
   * Whether the feed shows its loading state.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property now
   *
   * @description
   * Reference time given to the feed.
   *
   * @type {Date}
   * @readonly
   */
  public readonly now: Date = NOW;
  // #endregion
}

describe('CwActivityFeed', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  /**
   * Function text
   *
   * @description
   * Reads the text of an element with collapsed spaces.
   *
   * @param {Element | null | undefined} element - Element to read.
   * @returns {string} Its text.
   */
  function text(element: Element | null | undefined): string {
    return element?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideCwLocale('en-GB')] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('groups consecutive entries by day under named groups', () => {
    const headings: string[] = Array.from(host.querySelectorAll('[role="heading"]')).map(text);
    expect(headings).toEqual(['Aujourd’hui· 2', 'Hier· 1', 'Monday 23 November· 1']);
    const sections: HTMLElement[] = Array.from(
      host.querySelectorAll<HTMLElement>('[role="group"]'),
    );
    const first: HTMLElement | null = host.querySelector<HTMLElement>('[role="heading"]');
    expect(sections[0]?.getAttribute('aria-labelledby')).toBe(first?.id);
    expect(first?.getAttribute('aria-level')).toBe('3');
    expect(sections.map((section) => section.querySelectorAll('li').length)).toEqual([2, 1, 1]);
  });

  it('writes the actor, the summary with its emphasized parts, the quote, the detail and the time', () => {
    const items: HTMLLIElement[] = Array.from(host.querySelectorAll('li'));
    const paragraphs: string[] = Array.from(items[2]?.querySelectorAll('p') ?? []).map(text);
    expect(text(items[0]?.querySelector('p'))).toBe('Ana Martin changed the status to Done');
    expect(paragraphs).toEqual(['Ben Roux commented on CAD-471', 'Looks good to me.']);
    expect(text(items[2]?.querySelector('button'))).toBe('CAD-471');
    expect(text(items[2]?.querySelector('time'))).toBe('17:45');
    const time: HTMLTimeElement | null = items[0]?.querySelector('time') ?? null;
    expect(time?.dateTime).toBe(new Date(2026, 10, 26, 14, 5).toISOString());
  });

  it('writes a short date and time, in one list, without grouping', async () => {
    component.grouped.set(false);
    await fixture.whenStable();

    expect(host.querySelectorAll('[role="heading"]')).toHaveLength(0);
    const lists: HTMLOListElement[] = Array.from(host.querySelectorAll('ol'));
    expect(lists).toHaveLength(1);
    expect(lists[0]?.getAttribute('aria-label')).toBe('Activity of the list');
    expect(text(host.querySelector('li time'))).toBe('26 Nov, 14:05');
  });

  it('shows the empty state with the projected content', async () => {
    component.entries.set([]);
    await fixture.whenStable();

    expect(text(host.querySelector('[role="status"]'))).toBe('Aucune activité ne correspond');
    expect(text(host.querySelector('button'))).toBe('Clear the filters');
  });

  it('is busy while loading', async () => {
    component.loading.set(true);
    await fixture.whenStable();

    expect(host.querySelector('cw-activity-feed')?.getAttribute('aria-busy')).toBe('true');
    expect(text(host.querySelector('[role="status"]'))).toBe('Chargement de l’activité');
    expect(host.querySelector('li')).toBeNull();
  });
});

describe('provideCwActivityFeedLabels', () => {
  it('replaces the texts of the feed', () => {
    TestBed.configureTestingModule({
      providers: [provideCwActivityFeedLabels({ today: 'Today', yesterday: 'Yesterday' })],
    });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const headings: string[] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[role="heading"]'),
    ).map((heading) => heading.textContent.trim());
    expect(headings.slice(0, 2)).toEqual([
      expect.stringContaining('Today'),
      expect.stringContaining('Yesterday'),
    ]);
  });
});
