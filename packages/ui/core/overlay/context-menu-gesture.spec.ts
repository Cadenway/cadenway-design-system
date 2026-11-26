import { ɵAT_POINT, ɵContextMenuGesture, type ɵContextMenuRequest } from './context-menu-gesture';

describe('ɵContextMenuGesture', () => {
  let gesture: ɵContextMenuGesture;
  let trigger: HTMLElement;

  beforeEach(() => {
    gesture = new ɵContextMenuGesture();
    trigger = document.createElement('button');
    document.body.append(trigger);
  });

  afterEach(() => {
    trigger.remove();
  });

  it('opens at the pointer on a right click and prevents the browser menu', () => {
    const event: MouseEvent = new MouseEvent('contextmenu', {
      cancelable: true,
      clientX: 40,
      clientY: 60,
    });

    const request: ɵContextMenuRequest | null = gesture.request(event, trigger);

    expect(request).toEqual({
      origin: { x: 40, y: 60 },
      trigger,
      focus: 'panel',
      positions: ɵAT_POINT,
    });
    expect(event.defaultPrevented).toBe(true);
  });

  it('opens on the first item with Shift + F10 and the Menu key, then swallows the native menu', () => {
    const shiftF10: KeyboardEvent = new KeyboardEvent('keydown', {
      key: 'F10',
      shiftKey: true,
      cancelable: true,
    });
    trigger.dispatchEvent(shiftF10);
    expect(gesture.request(shiftF10, trigger)?.focus).toBe('first');

    const native: MouseEvent = new MouseEvent('contextmenu', { cancelable: true });
    trigger.dispatchEvent(native);
    expect(gesture.request(native, trigger)).toBeNull();
    expect(native.defaultPrevented).toBe(true);

    const menuKey: KeyboardEvent = new KeyboardEvent('keydown', {
      key: 'ContextMenu',
      cancelable: true,
    });
    expect(gesture.request(menuKey, trigger)?.trigger).toBe(trigger);
  });

  it('swallows only the native menu paired with a keyboard opening, once', () => {
    const other: HTMLElement = document.createElement('button');
    document.body.append(other);
    const shiftF10: KeyboardEvent = new KeyboardEvent('keydown', {
      key: 'F10',
      shiftKey: true,
      cancelable: true,
    });
    trigger.dispatchEvent(shiftF10);
    expect(gesture.request(shiftF10, trigger)).not.toBeNull();

    const elsewhere: MouseEvent = new MouseEvent('contextmenu', { cancelable: true });
    other.dispatchEvent(elsewhere);
    expect(gesture.request(elsewhere, other)?.trigger).toBe(other);

    const again: KeyboardEvent = new KeyboardEvent('keydown', { key: 'ContextMenu' });
    trigger.dispatchEvent(again);
    expect(gesture.request(again, trigger)).not.toBeNull();
    const paired: MouseEvent = new MouseEvent('contextmenu', { cancelable: true });
    trigger.dispatchEvent(paired);
    expect(gesture.request(paired, trigger)).toBeNull();
    const next: MouseEvent = new MouseEvent('contextmenu', { cancelable: true });
    trigger.dispatchEvent(next);
    expect(gesture.request(next, trigger)?.focus).toBe('panel');
    other.remove();
  });

  it('keeps the browser menu in an editable field and for other keys', () => {
    const field: HTMLInputElement = document.createElement('input');
    trigger.append(field);
    const inField: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    field.dispatchEvent(inField);

    expect(gesture.request(inField, trigger)).toBeNull();
    expect(inField.defaultPrevented).toBe(false);
    expect(gesture.request(new KeyboardEvent('keydown', { key: 'F10' }), trigger)).toBeNull();
  });
});
