import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { type ɵStackedPanel, ɵPanelStack } from './panel-stack.service';

/**
 * Interface SpiedPanel
 * @interface SpiedPanel
 *
 * @description
 * Panel fixture exposing its close callback as a mock for assertions.
 */
interface SpiedPanel extends ɵStackedPanel {
  // #region Properties
  /**
   * Property close
   * @readonly
   *
   * @description
   * Mock callback that records requests to close the fixture panel.
   *
   * @type {Mock<() => void>}
   */
  readonly close: Mock<() => void>;
  // #endregion
}

/**
 * Function panel
 *
 * @description
 * Creates a panel fixture whose containment check delegates to the supplied element.
 *
 * @param {HTMLElement} element - Element used to determine whether a trigger belongs to the panel.
 *
 * @returns {SpiedPanel} Panel fixture with a mocked close callback.
 */
function panel(element: HTMLElement): SpiedPanel {
  return { close: vi.fn<() => void>(), contains: (node) => element.contains(node) };
}

describe('ɵPanelStack', () => {
  it('closes the other open panel when the user opens one', () => {
    const stack: ɵPanelStack = TestBed.inject(ɵPanelStack);
    const first: SpiedPanel = panel(document.createElement('div'));
    const second: SpiedPanel = panel(document.createElement('div'));

    stack.open(first, document.createElement('button'));
    stack.open(second, document.createElement('button'));

    expect(first.close).toHaveBeenCalledTimes(1);
    expect(second.close).not.toHaveBeenCalled();
  });

  it('keeps the panels that hold the new trigger, and closes their other children', () => {
    const stack: ɵPanelStack = TestBed.inject(ɵPanelStack);
    const popoverElement: HTMLDivElement = document.createElement('div');
    const selectTrigger: HTMLButtonElement = popoverElement.appendChild(
      document.createElement('button'),
    );
    const menuTrigger: HTMLButtonElement = popoverElement.appendChild(
      document.createElement('button'),
    );
    const popover: SpiedPanel = panel(popoverElement);
    const select: SpiedPanel = panel(document.createElement('div'));
    const menu: SpiedPanel = panel(document.createElement('div'));

    stack.open(popover, document.createElement('button'));
    stack.open(select, selectTrigger);
    stack.open(menu, menuTrigger);

    expect(popover.close).not.toHaveBeenCalled();
    expect(select.close).toHaveBeenCalledTimes(1);
    expect(menu.close).not.toHaveBeenCalled();
  });

  it('forgets a released panel', () => {
    const stack: ɵPanelStack = TestBed.inject(ɵPanelStack);
    const first: SpiedPanel = panel(document.createElement('div'));

    stack.open(first, null);
    stack.release(first);
    stack.open(panel(document.createElement('div')), null);

    expect(first.close).not.toHaveBeenCalled();
  });
});
