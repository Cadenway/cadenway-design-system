import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_DROPZONE_FILE_LABELS } from './dropzone.constants';
import type { CwDropzoneFileLabels } from './dropzone.types';

/**
 * Constant DROPZONE_FILE_LABELS
 *
 * @description
 * Texts of every dropzone below the injector: the ones given by `provideCwDropzoneFileLabels`, over the
 * French defaults (`CW_DROPZONE_FILE_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwDropzoneFileLabels>}
 */
export const DROPZONE_FILE_LABELS: InjectionToken<CwDropzoneFileLabels> =
  ɵlabelsToken<CwDropzoneFileLabels>('DROPZONE_FILE_LABELS', CW_DROPZONE_FILE_LABELS);
