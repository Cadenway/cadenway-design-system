import { ɵafterExitAnimation } from './exit-animation';

function animated(): HTMLElement {
  const element = document.createElement('div');
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
    const done = vi.fn();
    ɵafterExitAnimation(null, done);
    ɵafterExitAnimation(document.body.appendChild(document.createElement('div')), done);
    expect(done).toHaveBeenCalledTimes(2);
  });

  it('waits for the animationend of the element itself, once', () => {
    const element = animated();
    const child = element.appendChild(document.createElement('span'));
    const done = vi.fn();
    ɵafterExitAnimation(element, done);
    child.dispatchEvent(new Event('animationend', { bubbles: true }));
    expect(done).not.toHaveBeenCalled();
    element.dispatchEvent(new Event('animationend'));
    element.dispatchEvent(new Event('animationend'));
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('ends on animationcancel only on request', () => {
    const element = animated();
    const done = vi.fn();
    ɵafterExitAnimation(element, done);
    element.dispatchEvent(new Event('animationcancel'));
    expect(done).not.toHaveBeenCalled();
    ɵafterExitAnimation(element, done, { endOnCancel: true });
    element.dispatchEvent(new Event('animationcancel'));
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('falls back after the given delay, unless stopped', () => {
    vi.useFakeTimers();
    const done = vi.fn();
    ɵafterExitAnimation(animated(), done, { fallback: 300 });
    const stop = ɵafterExitAnimation(animated(), done, { fallback: 300 });
    stop();
    vi.advanceTimersByTime(300);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
