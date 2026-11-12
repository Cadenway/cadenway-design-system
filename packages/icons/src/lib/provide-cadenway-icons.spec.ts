import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgIcon } from '@ng-icons/core';

import { provideCadenwayIcons } from './provide-cadenway-icons';

/* A consumer template: the icon is named, so it is exposed as an image instead of being hidden. */
@Component({
  imports: [NgIcon],
  template: `<ng-icon
    name="phosphorCheckBold"
    role="img"
    aria-label="Check"
    aria-hidden="false"
  />`,
})
class Host {}

describe('provideCadenwayIcons', () => {
  it('lets ng-icon render an icon of the registered set', async () => {
    TestBed.configureTestingModule({ providers: [provideCadenwayIcons()] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const icon = host.querySelector('[role="img"][aria-label="Check"]');

    expect(icon?.querySelector('svg')).toBeTruthy();
  });
});
