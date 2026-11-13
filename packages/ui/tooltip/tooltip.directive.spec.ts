import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { provideCwTooltip } from './tooltip.providers';
import { CwTooltip } from './tooltip.directive';

@Component({
  imports: [CwTooltip],
  template: `
    <button
      type="button"
      aria-label="Créer une tâche"
      cwTooltip="Créer une tâche"
      [cwTooltipShortcut]="['C']"
    >
      +
    </button>
    <button
      type="button"
      aria-label="Rechercher"
      cwTooltip="Rechercher"
      aria-describedby="search-hint"
    >
      R
    </button>
    <span id="search-hint">Ctrl K</span>
    <button type="button" cwTooltip="Copier le lien" [cwTooltipOpenDelay]="200">Copier</button>
    <button type="button" cwTooltip="Masqué" [cwTooltipDisabled]="hidden()">Visible</button>
    <button type="button" [cwTooltip]="due" [cwTooltipArrow]="false">Échéance</button>
    <ng-template #due><strong>Jeudi 12 novembre 2026</strong>, 18:00</ng-template>
  `,
})
class Host {
  readonly hidden = signal(true);
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

function tooltips(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="tooltip"]'));
}

function tooltip(text: string): HTMLElement | undefined {
  return tooltips().find((element) => element.textContent.includes(text));
}

function hover(element: HTMLElement): void {
  element.dispatchEvent(new MouseEvent('pointerenter'));
}

function leave(element: HTMLElement): void {
  element.dispatchEvent(new MouseEvent('pointerleave'));
}

function focusWithKeyboard(element: HTMLElement): void {
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  element.focus();
}

describe('CwTooltip', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  function render(): void {
    TestBed.tick();
  }

  beforeEach(() => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    render();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('opens after 700 ms of hover and describes its trigger without naming it', () => {
    const create = button(host, 'Créer une tâche');
    hover(create);
    vi.advanceTimersByTime(699);
    render();
    expect(tooltips()).toHaveLength(0);

    vi.advanceTimersByTime(1);
    render();
    const bubble = tooltip('Créer une tâche');
    expect(bubble?.dataset['state']).toBe('delayed-open');
    expect(create.getAttribute('aria-describedby')).toBe(bubble?.id);
    expect(create.getAttribute('aria-label')).toBe('Créer une tâche');
  });

  it('shows the shortcut as keys', () => {
    hover(button(host, 'Créer une tâche'));
    vi.advanceTimersByTime(700);
    render();

    const keys = Array.from(tooltip('Créer une tâche')?.querySelectorAll('kbd') ?? []);
    expect(keys.map((key) => key.textContent.trim())).toEqual(['C']);
  });

  it('closes when the pointer leaves and restores the other descriptions', () => {
    const search = button(host, 'Rechercher');
    hover(search);
    vi.advanceTimersByTime(700);
    render();
    const bubble = tooltip('Rechercher');
    expect(search.getAttribute('aria-describedby')).toBe(`search-hint ${bubble?.id ?? ''}`);

    leave(search);
    vi.advanceTimersByTime(100);
    render();
    expect(tooltips()).toHaveLength(0);
    expect(search.getAttribute('aria-describedby')).toBe('search-hint');
  });

  it('stays open while the pointer moves onto the bubble', () => {
    const create = button(host, 'Créer une tâche');
    hover(create);
    vi.advanceTimersByTime(700);
    render();
    const bubble = tooltip('Créer une tâche');
    const pane = bubble?.parentElement;
    if (!pane) throw new Error('No overlay pane');

    leave(create);
    hover(pane);
    vi.advanceTimersByTime(500);
    render();
    expect(tooltip('Créer une tâche')).toBeDefined();

    leave(pane);
    vi.advanceTimersByTime(100);
    render();
    expect(tooltips()).toHaveLength(0);
  });

  it('opens at once on keyboard focus and closes on Escape, the focus staying', () => {
    const create = button(host, 'Créer une tâche');
    focusWithKeyboard(create);
    render();
    expect(tooltip('Créer une tâche')?.dataset['state']).toBe('instant-open');

    create.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    render();
    expect(tooltips()).toHaveLength(0);
    expect(document.activeElement).toBe(create);
  });

  it('does not open on a programmatic focus and closes on blur', () => {
    const create = button(host, 'Créer une tâche');
    create.focus();
    render();
    expect(tooltips()).toHaveLength(0);

    create.blur();
    focusWithKeyboard(create);
    render();
    expect(tooltips()).toHaveLength(1);
    create.blur();
    render();
    expect(tooltips()).toHaveLength(0);
  });

  it('closes on a press of the trigger', () => {
    const create = button(host, 'Créer une tâche');
    hover(create);
    vi.advanceTimersByTime(700);
    render();

    create.dispatchEvent(new MouseEvent('pointerdown'));
    render();
    expect(tooltips()).toHaveLength(0);
  });

  it('keeps one bubble open and skips the delay within 300 ms of the previous one', () => {
    const create = button(host, 'Créer une tâche');
    const search = button(host, 'Rechercher');
    hover(create);
    vi.advanceTimersByTime(700);
    render();

    leave(create);
    hover(search);
    render();
    expect(tooltips().map((element) => element.textContent.trim())).toEqual(['Rechercher']);
    expect(tooltip('Rechercher')?.dataset['state']).toBe('instant-open');

    leave(search);
    vi.advanceTimersByTime(100 + 300);
    render();
    hover(create);
    render();
    expect(tooltips()).toHaveLength(0);
  });

  it('takes the open delay of its trigger', () => {
    hover(button(host, 'Copier'));
    vi.advanceTimersByTime(200);
    render();
    expect(tooltip('Copier le lien')).toBeDefined();
  });

  it('shows nothing while disabled', () => {
    const visible = button(host, 'Visible');
    hover(visible);
    vi.advanceTimersByTime(700);
    render();
    expect(tooltips()).toHaveLength(0);

    fixture.componentInstance.hidden.set(false);
    render();
    leave(visible);
    hover(visible);
    vi.advanceTimersByTime(700);
    render();
    expect(tooltip('Masqué')).toBeDefined();
  });
});

describe('CwTooltip with a template', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the template in the bubble', () => {
    const fixture = TestBed.createComponent(Host);
    TestBed.tick();

    hover(button(fixture.nativeElement as HTMLElement, 'Échéance'));
    vi.advanceTimersByTime(700);
    TestBed.tick();
    expect(tooltip('Jeudi 12 novembre 2026')?.querySelector('strong')?.textContent).toBe(
      'Jeudi 12 novembre 2026',
    );
    fixture.destroy();
  });
});

describe('provideCwTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets the open delay of every tooltip below it', () => {
    TestBed.configureTestingModule({ providers: [provideCwTooltip({ openDelay: 400 })] });
    const fixture = TestBed.createComponent(Host);
    TestBed.tick();

    hover(button(fixture.nativeElement as HTMLElement, 'Créer une tâche'));
    vi.advanceTimersByTime(400);
    TestBed.tick();
    expect(tooltip('Créer une tâche')).toBeDefined();
    fixture.destroy();
  });
});
