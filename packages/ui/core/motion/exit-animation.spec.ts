import { ɵafterExitAnimation } from './exit-animation';
import type { Mock } from 'vitest';

/**
 * Function animated
 *
 * @description
 * Appends an element with an exit animation name so tests can dispatch animation events on it.
 *
 * @returns {HTMLElement} Animated element attached to the test document.
 */
function animated(): HTMLElement {
  const element: HTMLDivElement = document.createElement('div');
  element.style.animationName = 'menu-out';
  document.body.append(element);
  return element;
}

describe('ɵafterExitAnimation', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('runs at once without an element or an animation', () => {
    const done: Mock<() => void> = vi.fn<() => void>();
    ɵafterExitAnimation(null, done);
    ɵafterExitAnimation(document.body.appendChild(document.createElement('div')), done);
    expect(done).toHaveBeenCalledTimes(2);
  });

  it('waits for the animationend of the element itself, once', () => {
    const element: HTMLElement = animated();
    const child: HTMLSpanElement = element.appendChild(document.createElement('span'));
    const done: Mock<() => void> = vi.fn<() => void>();
    ɵafterExitAnimation(element, done);
    child.dispatchEvent(new Event('animationend', { bubbles: true }));
    expect(done).not.toHaveBeenCalled();
    element.dispatchEvent(new Event('animationend'));
    element.dispatchEvent(new Event('animationend'));
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('ends on animationcancel only on request', () => {
    const element: HTMLElement = animated();
    const done: Mock<() => void> = vi.fn<() => void>();
    ɵafterExitAnimation(element, done);
    element.dispatchEvent(new Event('animationcancel'));
    expect(done).not.toHaveBeenCalled();
    ɵafterExitAnimation(element, done, { endOnCancel: true });
    element.dispatchEvent(new Event('animationcancel'));
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('falls back after the given delay, unless stopped', () => {
    vi.useFakeTimers();
    const done: Mock<() => void> = vi.fn<() => void>();
    ɵafterExitAnimation(animated(), done, { fallback: 300 });
    const stop: () => void = ɵafterExitAnimation(animated(), done, { fallback: 300 });
    stop();
    vi.advanceTimersByTime(300);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
