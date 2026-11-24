import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { MESSAGE_THREAD_LABELS } from './message-thread-labels.token';
import { MESSAGE_TONE_LABELS } from './message-tone-labels.token';
import { MESSAGE_LABELS } from './message-labels.token';
import {
  CW_MESSAGE_LABELS,
  CW_MESSAGE_THREAD_LABELS,
  CW_MESSAGE_TONE_LABELS,
} from './message.constants';
import type { CwMessageLabels, CwMessageThreadLabels, CwMessageToneLabels } from './message.types';

/**
 * Function provideCwMessageLabels
 *
 * @description
 * Sets the texts of every `cw-message` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_MESSAGE_LABELS`); the component's label inputs still override them. A function is
 * called once, in an injection context, when a component first reads its texts.
 *
 * @param {Partial<CwMessageLabels> | (() => Partial<CwMessageLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged message texts.
 */
export function provideCwMessageLabels(
  labels: Partial<CwMessageLabels> | (() => Partial<CwMessageLabels>),
): Provider {
  return ɵprovideLabels(MESSAGE_LABELS, CW_MESSAGE_LABELS, labels);
}

/**
 * Function provideCwMessageThreadLabels
 *
 * @description
 * Sets the texts of every `cw-message-thread` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_MESSAGE_THREAD_LABELS`); the component's label inputs still override them. A function is
 * called once, in an injection context, when a component first reads its texts.
 *
 * @param {Partial<CwMessageThreadLabels> | (() => Partial<CwMessageThreadLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged message texts.
 */
export function provideCwMessageThreadLabels(
  labels: Partial<CwMessageThreadLabels> | (() => Partial<CwMessageThreadLabels>),
): Provider {
  return ɵprovideLabels(MESSAGE_THREAD_LABELS, CW_MESSAGE_THREAD_LABELS, labels);
}

/**
 * Function provideCwMessageToneLabels
 *
 * @description
 * Sets the texts of every `cw-message-note` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_MESSAGE_TONE_LABELS`); the component's label inputs still override them. A function is
 * called once, in an injection context, when a component first reads its texts.
 *
 * @param {Partial<CwMessageToneLabels> | (() => Partial<CwMessageToneLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged message texts.
 */
export function provideCwMessageToneLabels(
  labels: Partial<CwMessageToneLabels> | (() => Partial<CwMessageToneLabels>),
): Provider {
  return ɵprovideLabels(MESSAGE_TONE_LABELS, CW_MESSAGE_TONE_LABELS, labels);
}
