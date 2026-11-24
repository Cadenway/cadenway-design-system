import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_DROPZONE_LABELS } from './dropzone.constants';
import type { CwDropzoneProvidedLabels } from './dropzone.types';

/**
 * Constant DROPZONE_LABELS
 *
 * @description
 * Texts of every dropzone below the injector: the ones given by `provideCwDropzoneLabels`, over the
 * French defaults (`CW_DROPZONE_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwDropzoneProvidedLabels>}
 */
export const DROPZONE_LABELS: InjectionToken<CwDropzoneProvidedLabels> =
  ɵlabelsToken<CwDropzoneProvidedLabels>('DROPZONE_LABELS', CW_DROPZONE_LABELS);
