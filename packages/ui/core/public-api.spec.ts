import * as publicApi from './public-api';

describe('@cadenway/ui/core public API', () => {
  // Removing or renaming an export is a major version, after a deprecation in a minor
  // (.claude/rules/public-api.md): the runtime names are pinned here.
  it('exports exactly the pinned names', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'CwRipple',
      'CwSwap',
      'provideCwLocale',
      'ɵConnectedPanel',
      'ɵFOCUS',
      'ɵFOCUS_FIELD',
      'ɵFOCUS_FIELD_WITHIN',
      'ɵFOCUS_INSET',
      'ɵLOCALE',
      'ɵModalOverlay',
      'ɵPanelStack',
      'ɵaddDays',
      'ɵaddMonths',
      'ɵafterExitAnimation',
      'ɵcreateMarkdownLexer',
      'ɵdayKey',
      'ɵdaysBetween',
      'ɵdaysInMonth',
      'ɵenterDelay',
      'ɵextensionOf',
      'ɵfold',
      'ɵformatFileSize',
      'ɵformatFileSizeIn',
      'ɵisoWeek',
      'ɵmenuFrom',
      'ɵnavigateList',
      'ɵpanelPositions',
      'ɵperLocale',
      'ɵplacementOf',
      'ɵprefersReducedMotion',
      'ɵsameDay',
      'ɵsameMonth',
      'ɵstartOfDay',
      'ɵstartOfMonth',
      'ɵstartOfWeek',
      'ɵwriteMention',
    ]);
  });
});
