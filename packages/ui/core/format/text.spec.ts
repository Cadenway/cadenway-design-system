import { ɵfold } from './text';

describe('ɵfold', () => {
  it('drops accents and case', () => {
    expect(ɵfold('Élevée')).toBe(ɵfold('elevee'));
    expect(ɵfold('Ça Marche')).toBe('ca marche');
  });
});
