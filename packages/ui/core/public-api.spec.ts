import * as publicApi from './public-api';

describe('@cadenway/ui/core public API', () => {
  // Removing or renaming an export is a major version, after a deprecation in a minor
  // (.claude/rules/public-api.md): the runtime names are pinned here.
  it('exports exactly the pinned names', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'CwRipple',
      'CwSwap',
      'ɵFOCUS',
      'ɵFOCUS_FIELD',
      'ɵFOCUS_FIELD_WITHIN',
      'ɵFOCUS_INSET',
      'ɵmenuFrom',
      'ɵnavigateList',
      'ɵpanelPositions',
      'ɵprefersReducedMotion',
    ]);
  });
});
