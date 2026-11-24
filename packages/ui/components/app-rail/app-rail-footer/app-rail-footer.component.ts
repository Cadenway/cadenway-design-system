import { Component } from '@angular/core';

/**
 * Component CwAppRailFooter
 *
 * @description
 * The bottom of a `nav[cwAppRail]`: its items are pushed to the bottom of the column (mockup
 * `App.dc.html`: search, theme and the account button, 4 px apart). Below 768 px they join the tab
 * bar row after the groups' items; mark an item `desktopOnly` to keep it out of the bar (the theme
 * button of the mockup). In a rail whose `phoneLayout` is `column`, it stays at the bottom of the
 * column.
 */
@Component({
  selector: 'cw-app-rail-footer',
  host: {
    class:
      'mt-auto flex flex-col items-center gap-1 max-md:group-data-[phone-layout=tab-bar]/rail:contents',
  },
  templateUrl: './app-rail-footer.component.html',
})
export class CwAppRailFooter {}
