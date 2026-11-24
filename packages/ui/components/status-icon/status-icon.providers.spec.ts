import { TestBed } from '@angular/core/testing';

import { injectCwStatusLabels, provideCwStatusLabels } from './status-icon.providers';

describe('provideCwStatusLabels', () => {
  it('keeps the French words when nothing is provided', () => {
    expect(TestBed.runInInjectionContext(injectCwStatusLabels).progress).toBe('En cours');
  });

  it('replaces the words read by injectCwStatusLabels, keeping the others', () => {
    TestBed.configureTestingModule({
      providers: [provideCwStatusLabels({ progress: 'In progress', done: 'Done' })],
    });

    expect(TestBed.runInInjectionContext(injectCwStatusLabels)).toMatchObject({
      progress: 'In progress',
      done: 'Done',
      todo: 'À faire',
    });
  });
});
