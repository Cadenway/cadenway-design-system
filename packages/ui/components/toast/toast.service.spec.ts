import { TestBed } from '@angular/core/testing';

import { CwToastService } from './toast.service';
import type { CwToastAction } from './toast.types';

// Without a toaster on the page the service still counts durations down and removes the toasts
// at once when they close; the toaster's own behavior is in `toaster.component.spec.ts`.
describe('CwToastService', () => {
  let service: CwToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(CwToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Function titles
   *
   * @description
   * Collects the titles of the toast records currently held by the service.
   *
   * @returns {string[]} Titles in their current display order.
   */
  function titles(): string[] {
    return service.toasts().map((toast) => toast.title);
  }

  it('shows a toast with its tone and closes it after 6 s, as in the mockup', () => {
    const id: string = service.success('Tâche archivée', {
      description: "CAD-466 · Doc d'installation Docker",
    });

    expect(service.toasts()).toEqual([
      expect.objectContaining({
        id,
        tone: 'success',
        title: 'Tâche archivée',
        description: "CAD-466 · Doc d'installation Docker",
        state: 'open',
      }),
    ]);
    vi.advanceTimersByTime(5999);
    expect(titles()).toEqual(['Tâche archivée']);
    vi.advanceTimersByTime(1);
    expect(titles()).toEqual([]);
  });

  it('keeps an error and a loading toast until they are closed', () => {
    service.error("Impossible d'enregistrer");
    const id: string = service.loading('Export de 120 tâches…');

    vi.advanceTimersByTime(60_000);
    expect(titles()).toEqual(["Impossible d'enregistrer", 'Export de 120 tâches…']);

    service.dismiss(id);
    expect(titles()).toEqual(["Impossible d'enregistrer"]);
    service.dismiss();
    expect(titles()).toEqual([]);
  });

  it('honors a duration given to one toast', () => {
    service.show('Lien copié', { duration: 1000 });

    vi.advanceTimersByTime(1000);

    expect(titles()).toEqual([]);
  });

  it('turns undo into an « Annuler » action', () => {
    const undo: () => void = vi.fn();
    service.success('Tâche déplacée vers Terminé', { undo });

    const action: CwToastAction | undefined = service.toasts()[0]?.action;
    expect(action?.label).toBe('Annuler');
    action?.run();
    expect(undo).toHaveBeenCalledOnce();
  });

  it('follows a promise in one toast, from loading to success', async () => {
    const id: string = service.promise(Promise.resolve(120), {
      loading: 'Export de 120 tâches…',
      success: (count) => `Export prêt : ${String(count)} tâches`,
      error: 'Export interrompu',
    });
    expect(service.toasts()[0]).toEqual(expect.objectContaining({ id, tone: 'loading' }));

    await vi.advanceTimersByTimeAsync(0);

    expect(service.toasts()).toEqual([
      expect.objectContaining({ id, tone: 'success', title: 'Export prêt : 120 tâches' }),
    ]);
    vi.advanceTimersByTime(6000);
    expect(titles()).toEqual([]);
  });

  it('turns a failed promise into an error that stays', async () => {
    service.promise(Promise.reject(new Error('offline')), {
      loading: 'Import de 48 tâches…',
      success: 'Import terminé',
      error: 'Import interrompu',
    });

    await vi.advanceTimersByTimeAsync(60_000);

    expect(service.toasts()).toEqual([
      expect.objectContaining({ tone: 'error', title: 'Import interrompu' }),
    ]);
  });

  it('updates a toast in place and restarts its duration on a new tone', () => {
    const id: string = service.loading('Synchronisation…');
    vi.advanceTimersByTime(10_000);

    service.update(id, { tone: 'info', title: 'Synchronisation reprise' });

    expect(titles()).toEqual(['Synchronisation reprise']);
    vi.advanceTimersByTime(6000);
    expect(titles()).toEqual([]);
  });
});
