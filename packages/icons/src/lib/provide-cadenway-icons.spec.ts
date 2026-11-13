import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgIcon } from '@ng-icons/core';

import { CADENWAY_ICON_NAMES, provideCadenwayIcons } from './provide-cadenway-icons';

/* A consumer template: the icons are named, so they are exposed as images instead of being hidden. */
@Component({
  imports: [NgIcon],
  template: `
    <ng-icon name="phosphorCheckBold" role="img" aria-label="Check" aria-hidden="false" />
    <ng-icon name="svglGithubLight" role="img" aria-label="GitHub" aria-hidden="false" />
  `,
})
class Host {}

function render(): HTMLElement {
  TestBed.configureTestingModule({ providers: [provideCadenwayIcons()] });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('provideCadenwayIcons', () => {
  it('lets ng-icon render an icon of the registered set', () => {
    const host = render();

    expect(host.querySelector('[aria-label="Check"] svg')).toBeTruthy();
  });

  it('draws the GitHub logo in the text color', () => {
    const host = render();
    const svg = host.querySelector('[aria-label="GitHub"] svg');

    // Integration guide, "Icônes": the GitHub logo follows the text color.
    expect(svg?.getAttribute('fill')).toBe('currentColor');
  });

  // The set is every icon of the mockup (docs/maquette/source): a change to it is made on purpose.
  it('registers the mockup set, sorted', () => {
    const count = (pattern: RegExp): number =>
      CADENWAY_ICON_NAMES.filter((name) => pattern.test(name)).length;

    expect(CADENWAY_ICON_NAMES).toHaveLength(285);
    expect(count(/^phosphor.*Bold$/)).toBe(217);
    expect(count(/^phosphor.*Fill$/)).toBe(57);
    expect(count(/^svgl/)).toBe(7);
    expect(count(/^flag/)).toBe(4);
    expect([...CADENWAY_ICON_NAMES].sort()).toEqual(CADENWAY_ICON_NAMES);
  });
});
