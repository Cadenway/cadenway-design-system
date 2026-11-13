import { ɵmenuFrom, ɵpanelPositions } from './overlay-positions';

describe('ɵpanelPositions', () => {
  it('tries the requested side and alignment first, then the opposite side', () => {
    const positions = ɵpanelPositions('bottom', 'start');

    expect(positions[0]).toMatchObject({ originY: 'bottom', overlayY: 'top', overlayX: 'start' });
    expect(positions[3]).toMatchObject({ originY: 'top', overlayY: 'bottom', overlayX: 'start' });
    expect(positions).toHaveLength(6);
  });
});

describe('ɵmenuFrom', () => {
  it('reveals a panel opened below and aligned at the start from its top-left corner', () => {
    expect(
      ɵmenuFrom({ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }),
    ).toBe('inset(0 calc(100% - 16px) calc(100% - 16px) 0 round 10px)');
  });

  it('reveals a panel opened above and aligned at the end from its bottom-right corner', () => {
    expect(ɵmenuFrom({ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' })).toBe(
      'inset(calc(100% - 16px) 0 0 calc(100% - 16px) round 10px)',
    );
  });
});
