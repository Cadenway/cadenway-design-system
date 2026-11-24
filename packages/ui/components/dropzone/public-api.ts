/*
 * Public API of @cadenway/ui/dropzone (Dropzone sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CW_DROPZONE_FILE_LABELS, CW_DROPZONE_LABELS } from './dropzone.constants';
export { provideCwDropzoneFileLabels, provideCwDropzoneLabels } from './dropzone.providers';
export { CwDropzone } from './dropzone.component';
export { CwDropzoneFile } from './dropzone-file/dropzone-file.component';
export type {
  CwDropzoneFileLabels,
  CwDropzoneFileState,
  CwDropzoneLabels,
  CwDropzoneProviderLabels,
  CwDropzoneRejectReason,
  CwDropzoneRejection,
  CwDropzoneSize,
  CwDropzoneState,
} from './dropzone.types';
