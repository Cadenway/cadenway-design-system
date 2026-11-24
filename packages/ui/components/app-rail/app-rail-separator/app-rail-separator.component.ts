import { Component } from '@angular/core';

/**
 * Component CwAppRailSeparator
 *
 * @description
 * The short decorative rule between two parts of a `nav[cwAppRail]` (mockup `App.dc.html`: 24 px
 * wide, 4 px above and below). Hidden from assistive technologies, and from the tab bar below
 * 768 px; kept in a rail whose `phoneLayout` is `column`.
 */
@Component({
  selector: 'cw-app-rail-separator',
  host: {
    class: 'my-1 h-px w-6 shrink-0 bg-border max-md:group-data-[phone-layout=tab-bar]/rail:hidden',
    'aria-hidden': 'true',
  },
  templateUrl: './app-rail-separator.component.html',
})
export class CwAppRailSeparator {}
