import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { DROPZONE_FILE_LABELS } from './dropzone-file-labels.token';
import { DROPZONE_LABELS } from './dropzone-labels.token';
import { CW_DROPZONE_FILE_LABELS, CW_DROPZONE_LABELS } from './dropzone.constants';
import type { CwDropzoneFileLabels, CwDropzoneProviderLabels } from './dropzone.types';

/**
 * Function provideCwDropzoneLabels
 *
 * @description
 * Sets the texts of every `cw-dropzone` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_DROPZONE_LABELS`); the component's text inputs still override them. A function is
 * called once, in an injection context, when a component first reads its texts.
 *
 * @param {Partial<CwDropzoneProviderLabels> | (() => Partial<CwDropzoneProviderLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged dialog texts.
 */
export function provideCwDropzoneLabels(
  labels: Partial<CwDropzoneProviderLabels> | (() => Partial<CwDropzoneProviderLabels>),
): Provider {
  return ɵprovideLabels(DROPZONE_LABELS, CW_DROPZONE_LABELS, labels);
}

/**
 * Function provideCwDropzoneFileLabels
 *
 * @description
 * Sets the texts of every `cw-dropzone` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_DROPZONE_FILE_LABELS`); the component's text inputs still override them. A function is
 * called once, in an injection context, when a component first reads its texts.
 *
 * @param {Partial<CwDropzoneFileLabels> | (() => Partial<CwDropzoneFileLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged dialog texts.
 */
export function provideCwDropzoneFileLabels(
  labels: Partial<CwDropzoneFileLabels> | (() => Partial<CwDropzoneFileLabels>),
): Provider {
  return ɵprovideLabels(DROPZONE_FILE_LABELS, CW_DROPZONE_FILE_LABELS, labels);
}
