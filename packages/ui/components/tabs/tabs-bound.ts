import { computed, type InputSignal, type Signal } from '@angular/core';

/**
 * Function requiredInputBound
 *
 * @description
 * Tracks when a dynamically created child receives its required input.
 *
 * @param {InputSignal<string>} value - Required child input.
 * @returns {Signal<boolean>} Whether the input has been bound.
 */
export function requiredInputBound(value: InputSignal<string>): Signal<boolean> {
  return computed(() => {
    try {
      void value();
      return true;
    } catch {
      return false;
    }
  });
}
