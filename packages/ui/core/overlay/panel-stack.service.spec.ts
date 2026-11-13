import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { type ɵStackedPanel, ɵPanelStack } from './panel-stack.service';

interface SpiedPanel extends ɵStackedPanel {
  readonly close: Mock<() => void>;
}

function panel(element: HTMLElement): SpiedPanel {
  return { close: vi.fn<() => void>(), contains: (node) => element.contains(node) };
}

describe('ɵPanelStack', () => {
  it('closes the other open panel when the user opens one', () => {
    const stack = TestBed.inject(ɵPanelStack);
    const first = panel(document.createElement('div'));
    const second = panel(document.createElement('div'));

    stack.open(first, document.createElement('button'));
    stack.open(second, document.createElement('button'));

    expect(first.close).toHaveBeenCalledTimes(1);
    expect(second.close).not.toHaveBeenCalled();
  });

  it('keeps the panels that hold the new trigger, and closes their other children', () => {
    const stack = TestBed.inject(ɵPanelStack);
    const popoverElement = document.createElement('div');
    const selectTrigger = popoverElement.appendChild(document.createElement('button'));
    const menuTrigger = popoverElement.appendChild(document.createElement('button'));
    const popover = panel(popoverElement);
    const select = panel(document.createElement('div'));
    const menu = panel(document.createElement('div'));

    stack.open(popover, document.createElement('button'));
    stack.open(select, selectTrigger);
    stack.open(menu, menuTrigger);

    expect(popover.close).not.toHaveBeenCalled();
    expect(select.close).toHaveBeenCalledTimes(1);
    expect(menu.close).not.toHaveBeenCalled();
  });

  it('forgets a released panel', () => {
    const stack = TestBed.inject(ɵPanelStack);
    const first = panel(document.createElement('div'));

    stack.open(first, null);
    stack.release(first);
    stack.open(panel(document.createElement('div')), null);

    expect(first.close).not.toHaveBeenCalled();
  });
});
